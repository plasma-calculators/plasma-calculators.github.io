#!/usr/bin/env python3
"""
Verification script for NF/FF Calculator.
Loads the example near-field PNG images, crops the ROI, performs zero-padded 2D FFT,
propagates across focus using the defocus phase, calculates second moments,
fits the quadratic caustic, and extracts physical parameters (M^2, Rayleigh Range, waist).
"""

import os
import numpy as np
from PIL import Image

def load_image(filepath):
    # Load 16-bit PNG
    img = Image.open(filepath)
    data = np.array(img, dtype=np.float64)
    return data

def run_verification(filepath, calib_x=0.1925, calib_y=0.2240, lambda_nm=800.0, f_mm=2500.0):
    # 1. Load image
    data = load_image(filepath)
    H, W = data.shape
    
    # 2. Find peak to define default ROI
    peak_y, peak_x = np.unravel_index(np.argmax(data), data.shape)
    
    # Crop ROI: 200x200 around peak
    roi_w, roi_h = 200, 200
    x_start = max(0, min(W - roi_w, peak_x - roi_w // 2))
    y_start = max(0, min(H - roi_h, peak_y - roi_h // 2))
    
    roi_data = data[y_start:y_start+roi_h, x_start:x_start+roi_w]
    
    # 3. Physics parameters
    lambda_mm = lambda_nm * 1e-6
    Mx, My = 512, 512
    
    # Coordinates in cropped ROI
    x_indices = np.arange(roi_w) - roi_w / 2
    y_indices = np.arange(roi_h) - roi_h / 2
    xx, yy = np.meshgrid(x_indices * calib_x, y_indices * calib_y)
    r2 = xx**2 + yy**2
    
    # Amplitude
    A = np.sqrt(np.clip(roi_data, 0, None))
    
    # Function to propagate near field to z_offset
    def propagate(z_offset):
        # Defocus phase
        if abs(z_offset) > 1e-10:
            dist_factor = z_offset / (f_mm * (f_mm + z_offset))
            phase_defoc = -(np.pi / lambda_mm) * r2 * dist_factor
        else:
            phase_defoc = np.zeros_like(r2)
            
        E_nf = A * np.exp(1j * phase_defoc)
        
        # Pad to Mx x My
        E_pad = np.zeros((My, Mx), dtype=np.complex128)
        start_y = My // 2 - roi_h // 2
        start_x = Mx // 2 - roi_w // 2
        E_pad[start_y:start_y+roi_h, start_x:start_x+roi_w] = E_nf
        
        # Centering shift using (-1)^(u+v) is equivalent to fftshift after FFT
        # We can just use numpy's built-in fftshift
        E_f = np.fft.fftshift(np.fft.fft2(E_pad))
        
        # Scale intensity
        I_f = np.abs(E_f)**2
        
        # Conserve energy
        I_f *= np.sum(roi_data) / (np.sum(I_f) + 1e-15)
        
        # Spatial calibrations in focal plane
        dx_f = (lambda_mm * (f_mm + z_offset)) / (Mx * calib_x)
        dy_f = (lambda_mm * (f_mm + z_offset)) / (My * calib_y)
        
        return I_f, dx_f, dy_f

    # 4. First pass: propagate to geometric focus (z=0) to estimate nominal Rayleigh range
    I_f0, dx_f0, dy_f0 = propagate(0.0)
    
    # Calculate second-moment size at focus
    def get_second_moments(I, dx, dy):
        total_int = np.sum(I)
        if total_int <= 0:
            return 0.0, 0.0, 0.0
            
        y_coords = (np.arange(My) - My / 2) * dy
        x_coords = (np.arange(Mx) - Mx / 2) * dx
        xx_f, yy_f = np.meshgrid(x_coords, y_coords)
        
        cx = np.sum(xx_f * I) / total_int
        cy = np.sum(yy_f * I) / total_int
        
        var_x = np.sum((xx_f - cx)**2 * I) / total_int
        var_y = np.sum((yy_f - cy)**2 * I) / total_int
        
        wx = 2.0 * np.sqrt(max(0.0, var_x))
        wy = 2.0 * np.sqrt(max(0.0, var_y))
        w_avg = np.sqrt((wx**2 + wy**2) / 2.0)
        
        return wx, wy, w_avg

    _, _, w_focus = get_second_moments(I_f0, dx_f0, dy_f0)
    zR0 = (np.pi * w_focus**2) / lambda_mm # estimated Rayleigh range
    
    # 5. Caustic calculation (21 planes)
    z_planes = np.linspace(-5.0 * zR0, 5.0 * zR0, 21)
    w_planes = []
    
    for z in z_planes:
        I_z, dx_z, dy_z = propagate(z)
        _, _, w_z = get_second_moments(I_z, dx_z, dy_z)
        w_planes.append(w_z)
        
    w_planes = np.array(w_planes)
    
    # 6. Fit quadratic: w^2(z) = A*z^2 + B*z + C
    # We solve the normal equations for linear regression
    # W = w^2, features: [z^2, z, 1]
    X_mat = np.vstack([z_planes**2, z_planes, np.ones_like(z_planes)]).T
    W_vals = w_planes**2
    A, B, C = np.linalg.lstsq(X_mat, W_vals, rcond=None)[0]
    
    # Calculate physical parameters
    z0 = -B / (2.0 * A)
    w0 = np.sqrt(max(1e-12, C - B**2 / (4.0 * A)))
    M2 = (np.pi * w0 * np.sqrt(max(1e-12, A))) / lambda_mm
    zR = w0 / np.sqrt(max(1e-12, A))
    
    return {
        'waist_radius_um': w0 * 1000.0,
        'focus_shift_mm': z0,
        'M2': M2,
        'Rayleigh_range_mm': zR
    }

if __name__ == '__main__':
    image_dir = 'example_files/jeti_nf'
    files = sorted([f for f in os.listdir(image_dir) if f.endswith('.png')])
    
    print("====================================================")
    print("      NF/FF CALCULATOR VERIFICATION TESTS     ")
    print("====================================================")
    
    for f in files:
        path = os.path.join(image_dir, f)
        res = run_verification(path)
        print(f"\nFile: {f}")
        print(f"  - Beam Waist Radius (w0): {res['waist_radius_um']:.2f} um")
        print(f"  - Focus Shift (z0):       {res['focus_shift_mm']:.2f} mm")
        print(f"  - Beam Quality (M^2):     {res['M2']:.2f}")
        print(f"  - Rayleigh Range (zR):    {res['Rayleigh_range_mm']:.2f} mm")
    print("\n====================================================")
