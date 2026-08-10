---
layout: single
title: "Focal Spot Size & Focus Intensity — Equations & Physics"
permalink: /calculators/focal-spot-explanation/
author_profile: false
share: false
comments: false
classes: wide
---

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    tex2jax: {
      inlineMath: [['$','$'], ['\\(','\\)']],
      processEscapes: true
    }
  });
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML" async></script>

<style>
.exp-page { max-width: 860px; margin: 0 auto; font-family: inherit; }
.exp-section {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.exp-section h3 {
  margin: 0 0 0.9rem 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e3a5f;
  border-left: 4px solid #2563eb;
  padding-left: 0.7rem;
}
.exp-section h4 {
  margin: 1.2rem 0 0.4rem 0;
  font-size: 0.93rem;
  font-weight: 700;
  color: #374151;
}
.exp-section p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.65;
}
.exp-section ul {
  margin: 0.5rem 0 0.5rem 1.2rem;
  padding: 0;
}
.exp-section ul li {
  font-size: 0.9rem;
  color: #374151;
  margin-bottom: 0.3rem;
  line-height: 1.65;
}
.math-box {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.75rem 1.2rem;
  margin: 0.8rem 0;
  font-size: 0.92rem;
  overflow-x: auto;
}
.back-btn {
  display: inline-block;
  background: #2563eb;
  color: #fff !important;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  text-decoration: none !important;
  font-weight: 600;
  font-size: 0.88rem;
  margin-bottom: 1.5rem;
  transition: background 0.15s ease;
}
.back-btn:hover { background: #1d4ed8; }
</style>

<div class="exp-page">
  <a href="/calculators/focal-spot-calculator/" class="back-btn">← Back to Calculator</a>

  <div class="exp-section">
    <h3>1. Overview & Physics Principles</h3>
    <p>
      In high-intensity laser-plasma interactions and ultrafast optics, measuring the spatial beam distribution at focus is critical to determining peak power density, intensity $I_0$, and normalized vector potential $a_0$.
    </p>
    <p>
      This calculator performs automated 2D rotated Gaussian surface fitting on uploaded focal spot images (PNG, JPEG, TIF, TIFF) to determine the spot dimensions, peak intensity, and energy fraction contained within the Full-Width at Half-Maximum (FWHM).
    </p>
  </div>

  <div class="exp-section">
    <h3>2. 2D Rotated Gaussian Surface Fit</h3>
    <p>The intensity distribution $I(x,y)$ inside the user-defined Region of Interest (ROI) is fitted to a 2D rotated Gaussian profile:</p>
    <div class="math-box">
      $$f(x,y) = z_0 + A \exp\left( - \left[ a (x - x_0)^2 + 2b (x - x_0)(y - y_0) + c (y - y_0)^2 \right] \right)$$
    </div>
    <p>where the ellipse coefficients $a, b, c$ are parameterized by the principal standard deviations $\sigma_x, \sigma_y$ and rotation angle $\theta$:</p>
    <div class="math-box">
      $$a = \frac{\cos^2\theta}{2\sigma_x^2} + \frac{\sin^2\theta}{2\sigma_y^2}, \quad b = \frac{-\sin(2\theta)}{4\sigma_x^2} + \frac{\sin(2\theta)}{4\sigma_y^2}, \quad c = \frac{\sin^2\theta}{2\sigma_x^2} + \frac{\cos^2\theta}{2\sigma_y^2}$$
    </div>
    <p>
      From the fitted standard deviations $\sigma_x$ and $\sigma_y$ and spatial pixel calibrations $C_x$ and $C_y$ (expressed in $\text{μm}/\text{pixel}$), we define the RMS major and minor beam envelope sizes. Letting $\sigma_{\text{maj}} = \max(\sigma_x C_x, \sigma_y C_y)$ and $\sigma_{\text{min}} = \min(\sigma_x C_x, \sigma_y C_y)$:
    </p>
    <div class="math-box">
      $$d_{\text{RMS, maj}} = \sigma_{\text{maj}}, \quad d_{\text{RMS, min}} = \sigma_{\text{min}}$$
    </div>
    <p>The Full-Width at Half-Maximum (FWHM) dimensions are computed directly from the principal standard deviations:</p>
    <div class="math-box">
      $$d_{\text{FWHM, maj}} = 2 \sqrt{2 \ln 2} \sigma_{\text{maj}} \approx 2.355 \sigma_{\text{maj}}$$
    </div>
    <div class="math-box">
      $$d_{\text{FWHM, min}} = 2 \sqrt{2 \ln 2} \sigma_{\text{min}} \approx 2.355 \sigma_{\text{min}}$$
    </div>
  </div>

  <div class="exp-section">
    <h3>3. Energy Fraction ($q$-Factor)</h3>
    <p>
      The $q$-factor represents the fraction of background-subtracted beam energy contained inside the FWHM boundary of the beam focus:
    </p>
    <div class="math-box">
      $$q = \frac{\sum_{(x,y) \in \text{FWHM contour}} I(x,y)}{\sum_{(x,y) \in \text{ROI}} I(x,y)}$$
    </div>
    <p>
      where the FWHM contour is defined by the ellipse condition:
      $$a (x - x_0)^2 + 2b (x - x_0)(y - y_0) + c (y - y_0)^2 \le \ln 2$$
    </p>
  </div>

  <div class="exp-section">
    <h3>4. Focused Peak Intensity & Normalized Vector Potential ($a_0$)</h3>
    <p>
      When pulse parameters are included, the peak power, focused peak intensity, and normalized vector potential are calculated. Given pulse energy $E_L$, pulse duration FWHM $\tau$, and laser wavelength $\lambda$:
    </p>
    <h4>Laser Beam Waists ($w_0$)</h4>
    <p>The spatial beam waists ($e^{-2}$ intensity radius) along the major and minor axes are obtained from the FWHM dimensions:</p>
    <div class="math-box">
      $$w_{0, \text{maj}} = \frac{d_{\text{FWHM, maj}}}{\sqrt{2 \ln 2}}, \quad w_{0, \text{min}} = \frac{d_{\text{FWHM, min}}}{\sqrt{2 \ln 2}}$$
    </div>

    <h4>Peak Power & Peak Intensity</h4>
    <p>Assuming a Gaussian temporal pulse shape, the peak power $P_{\text{peak}}$ (corrected by the FWHM energy fraction $q$) is:</p>
    <div class="math-box">
      $$P_{\text{peak}} = \frac{E_L}{\tau} 2\sqrt{\frac{\ln 2}{\pi}} \cdot q$$
    </div>
    <p>The focused peak intensity $I_0$ of the spatial Gaussian profile is then calculated as:</p>
    <div class="math-box">
      $$I_0 = \frac{2 P_{\text{peak}}}{\pi w_{0, \text{maj}} w_{0, \text{min}}}$$
    </div>

    <h4>Normalized Vector Potential ($a_0$)</h4>
    <p>The dimensionless normalized vector potential $a_0$ is given by:</p>
    <div class="math-box">
      $$a_0 \approx 0.86 \cdot \lambda_{[\text{μm}]} \sqrt{I_0 [10^{18}\ \text{W/cm}^2]}$$
    </div>
    <p>The quoted $a_0$ coefficient assumes a linearly polarized laser field.</p>
  </div>
</div>
