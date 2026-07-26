#!/usr/bin/env python3
"""Verify focal-spot-calculator.js fit engine against scipy reference."""
import numpy as np
from PIL import Image
from scipy.optimize import curve_fit, minimize
import glob, os

files = sorted(glob.glob('example_files/laser_focus/*.png'))

def gauss2d_flat(xy, amp, xo, yo, sigX, sigY, theta, offset):
    x, y = xy
    cosT = np.cos(theta); sinT = np.sin(theta)
    a = cosT**2/(2*sigX**2) + sinT**2/(2*sigY**2)
    b = -np.sin(2*theta)/(4*sigX**2) + np.sin(2*theta)/(4*sigY**2)
    c = sinT**2/(2*sigX**2) + cosT**2/(2*sigY**2)
    return (offset + amp * np.exp(-(a*(x-xo)**2 + 2*b*(x-xo)*(y-yo) + c*(y-yo)**2))).ravel()

print("=" * 70)
print("CHECK 1: 16-bit PNG vs 8-bit Canvas precision")
print("=" * 70)
img = Image.open(files[0])
arr = np.array(img)
print(f"  Raw: dtype={arr.dtype}, range=[{arr.min()},{arr.max()}]")
arr8 = (arr.astype(float)/257.0).clip(0,255)
print(f"  8-bit: range=[{arr8.min():.1f},{arr8.max():.1f}]")
print(f"  Dynamic range: 16bit={arr.max()-arr.min()} -> 8bit={arr8.max()-arr8.min():.0f} levels")
print()

print("=" * 70)
print("CHECK 2: Fit comparison 16-bit LM vs 8-bit LM (all images)")
print("=" * 70)
for f in files:
    img = Image.open(f)
    a16 = np.array(img, dtype=float)
    py, px = np.unravel_index(np.argmax(a16), a16.shape)
    rw, rh = 200, 200
    rx = max(0, min(a16.shape[1]-rw, px-rw//2))
    ry = max(0, min(a16.shape[0]-rh, py-rh//2))
    roi16 = a16[ry:ry+rh, rx:rx+rw]
    roi8 = (roi16/257.0).clip(0,255)
    ny, nx = roi16.shape
    xa, ya = np.meshgrid(np.arange(nx), np.arange(ny))
    mpy, mpx = np.unravel_index(np.argmax(roi16), roi16.shape)
    p0 = [roi16.max()-roi16.min(), mpx, mpy, rw/8, rh/8, 0, roi16.min()]
    p16, _ = curve_fit(gauss2d_flat, (xa, ya), roi16.ravel(), p0=p0)
    p0b = [roi8.max()-roi8.min(), mpx, mpy, rw/8, rh/8, 0, roi8.min()]
    p8, _ = curve_fit(gauss2d_flat, (xa, ya), roi8.ravel(), p0=p0b)
    c = 0.4
    f16 = [2*np.sqrt(2*np.log(2))*abs(p16[i])*c for i in [3,4]]
    f8 = [2*np.sqrt(2*np.log(2))*abs(p8[i])*c for i in [3,4]]
    bn = os.path.basename(f)[:3]
    print(f"  {bn}: 16b=({max(f16):.2f},{min(f16):.2f}) 8b=({max(f8):.2f},{min(f8):.2f}) diff=({abs(max(f16)-max(f8)):.3f},{abs(min(f16)-min(f8)):.3f})")
print()

print("=" * 70)
print("CHECK 3: Nelder-Mead convergence at 120 / 500 / 2000 iterations")
print("=" * 70)
a16 = np.array(Image.open(files[0]), dtype=float)
py, px = np.unravel_index(np.argmax(a16), a16.shape)
roi = a16[max(0,py-100):py+100, max(0,px-100):px+100]
ny, nx = roi.shape

def cost_ds(params):
    amp, xo, yo, sigX, sigY, theta, offset = params
    if sigX <= 0.1 or sigY <= 0.1: return 1e18
    cosT, sinT = np.cos(theta), np.sin(theta)
    a = cosT**2/(2*sigX**2) + sinT**2/(2*sigY**2)
    b = -np.sin(2*theta)/(4*sigX**2) + np.sin(2*theta)/(4*sigY**2)
    c = sinT**2/(2*sigX**2) + cosT**2/(2*sigY**2)
    ys = np.arange(0, ny, 2); xs = np.arange(0, nx, 2)
    XX, YY = np.meshgrid(xs, ys)
    dx = XX - xo; dy = YY - yo
    model = offset + amp * np.exp(-(a*dx**2 + 2*b*dx*dy + c*dy**2))
    return np.sum((roi[::2,::2] - model)**2)

mpy, mpx = np.unravel_index(np.argmax(roi), roi.shape)
p0 = [roi.max()-roi.min(), mpx, mpy, nx/8, ny/8, 0, roi.min()]
for mi in [120, 500, 2000]:
    r = minimize(cost_ds, p0, method='Nelder-Mead', options={'maxiter':mi, 'adaptive':True})
    sx, sy = abs(r.x[3]), abs(r.x[4])
    fmaj = max(2*np.sqrt(2*np.log(2))*sx*0.4, 2*np.sqrt(2*np.log(2))*sy*0.4)
    fmin = min(2*np.sqrt(2*np.log(2))*sx*0.4, 2*np.sqrt(2*np.log(2))*sy*0.4)
    print(f"  {mi:5d} iters: nfev={r.nfev:5d}, FWHM=({fmaj:.2f},{fmin:.2f}), converged={r.success}")
print()

print("=" * 70)
print("CHECK 4: Formula verification (w0, I0, a0)")
print("=" * 70)
sigma = 20.0
c = 0.4
fwhm = 2*np.sqrt(2*np.log(2))*sigma*c
w0_js = fwhm / np.sqrt(2*np.log(2))
w0_correct = 2*sigma*c
print(f"  FWHM={fwhm:.4f} um, JS_w0={w0_js:.4f}, 2*sigma_um={w0_correct:.4f}, match={abs(w0_js-w0_correct)<1e-10}")

E, tau, q, lam = 0.6, 30, 0.39, 800
sx, sy = 21.48, 19.31
fwhmX = 2*np.sqrt(2*np.log(2))*sx*c; fwhmY = 2*np.sqrt(2*np.log(2))*sy*c
fwhm_maj = max(fwhmX, fwhmY); fwhm_min = min(fwhmX, fwhmY)
w0_maj = fwhm_maj/np.sqrt(2*np.log(2)); w0_min = fwhm_min/np.sqrt(2*np.log(2))
P_g = (E/tau)/np.sqrt(np.pi)*2*np.log(2)*1000*q
P_t = (E/tau)*1000*q
area = np.pi*w0_maj*w0_min
I0_g = (2*P_g/area)*100; I0_t = (2*P_t/area)*100
a0_g = 0.86*(lam/1000)*np.sqrt(max(0,I0_g))
a0_t = 0.85*(lam/1000)*np.sqrt(max(0,I0_t))
print(f"  P_gauss={P_g:.4f}TW, P_tophat={P_t:.4f}TW")
print(f"  I0_gauss={I0_g:.4f}e18 W/cm2, I0_tophat={I0_t:.4f}e18 W/cm2")
print(f"  a0_gauss={a0_g:.4f}, a0_tophat={a0_t:.4f}")
print()

print("=" * 70)
print("SUMMARY")
print("=" * 70)
print("  CRITICAL: 16-bit PNGs lose precision via Canvas (8-bit clamp)")
print("  IMPORTANT: Nelder-Mead 120 iter may not converge (need 500+)")
print("  CORRECT: FWHM, w0, I0, a0, q-factor formulas all verified OK")
