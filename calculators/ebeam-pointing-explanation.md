---
layout: single
title: "Electron Beam Pointing & Divergence — Equations & Physics"
permalink: /calculators/ebeam-pointing-explanation/
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
  line-height: 1.2;
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
  <a href="/calculators/ebeam-pointing/" class="back-btn">← Back to Calculator</a>

  <div class="exp-section">
    <h3>1. Overview & Physics Principles</h3>
    <p>
      In laser-wakefield accelerators (LWFA) and conventional particle accelerators, electron beams impinge on scintillating screens (such as Lanex) to produce visible light. Measuring the transverse spatial profile of this light is critical to retrieving beam parameters including pointing stability, geometric divergence, and total bunch charge.
    </p>
  </div>

  <div class="exp-section">
    <h3>2. Background Subtraction</h3>
    <p>
      Before fitting, the background noise is removed on each image using the mean pixel value within the user-defined background ROI (pink rectangle):
    </p>
    <div class="math-box">
      $$I_{\text{bg}} = \frac{1}{N_{\text{bg}}} \sum_{(x,y) \in \text{Bg ROI}} I_{\text{raw}}(x, y)$$
    </div>
    <div class="math-box">
      $$I'(x, y) = \max(0, I_{\text{raw}}(x, y) - I_{\text{bg}})$$
    </div>
    <p>This process is applied to all pixel coordinates across the image to filter out uniform ambient light and dark current noise.</p>
  </div>

  <div class="exp-section">
    <h3>3. 2D Rotated Gaussian Fit & Geometric Divergence</h3>
    <p>
      A 2D rotated Gaussian profile is fitted to the intensity distribution inside the signal ROI:
    </p>
    <div class="math-box">
      $$f(x,y) = z_0 + A \exp\left( - \left[ a (x - x_0)^2 + 2b (x - x_0)(y - y_0) + c (y - y_0)^2 \right] \right)$$
    </div>
    <p>where the ellipse coefficients $a, b, c$ are parameterized by standard deviations $\sigma_x, \sigma_y$ and rotation angle $\theta$. The spatial major/minor standard deviations (beam envelope sizes) are defined as:</p>
    <div class="math-box">
      $$\sigma_{\text{maj}} = \max(\sigma_x C_x, \sigma_y C_y), \quad \sigma_{\text{min}} = \min(\sigma_x C_x, \sigma_y C_y)$$
    </div>
    <p>
      where $C_x$ and $C_y$ represent the spatial calibrations (in $\text{μm}/\text{pixel}$). The RMS major/minor and FWHM major/minor divergences of the beam profile (in $\text{mrad}$) are then computed geometrically relative to the source-to-screen distance $L$ (in $\text{mm}$):
    </p>
    <div class="math-box">
      $$\theta_{\text{RMS, maj}} = \arctan\left( \frac{\sigma_{\text{maj}}}{L \times 1000} \right) \times 1000 \approx \frac{\sigma_{\text{maj}}}{L}$$
    </div>
    <div class="math-box">
      $$\theta_{\text{RMS, min}} = \arctan\left( \frac{\sigma_{\text{min}}}{L \times 1000} \right) \times 1000 \approx \frac{\sigma_{\text{min}}}{L}$$
    </div>
    <div class="math-box">
      $$\theta_{\text{FWHM, maj}} = 2\sqrt{2\ln 2} \cdot \theta_{\text{RMS, maj}} \approx 2.355 \cdot \theta_{\text{RMS, maj}}$$
    </div>
    <div class="math-box">
      $$\theta_{\text{FWHM, min}} = 2\sqrt{2\ln 2} \cdot \theta_{\text{RMS, min}} \approx 2.355 \cdot \theta_{\text{RMS, min}}$$
    </div>
  </div>

  <div class="exp-section">
    <h3>4. Pointing Stability</h3>
    <p>
      The pointing stability measures how much the center of the beam spot $(x_0, y_0)$ fluctuates relative to the center of the signal ROI $(X_{\text{ROI}}, Y_{\text{ROI}})$ across $N$ images. The spatial pointing deviations for shot $i$ are:
    </p>
    <div class="math-box">
      $$\Delta x_i = (x_{0, i} - X_{\text{ROI}}) \cdot C_x, \quad \Delta y_i = (y_{0, i} - Y_{\text{ROI}}) \cdot C_y, \quad \Delta r_i = \sqrt{(\Delta x_i)^2 + (\Delta y_i)^2}$$
    </div>
    <p>The RMS spatial pointing stability values (in $\text{μm}$) are defined as:</p>
    <div class="math-box">
      $$\text{RMS}_x = \sqrt{\frac{1}{N}\sum_{i=1}^N (\Delta x_i)^2}, \quad \text{RMS}_y = \sqrt{\frac{1}{N}\sum_{i=1}^N (\Delta y_i)^2}, \quad \text{RMS}_r = \sqrt{\frac{1}{N}\sum_{i=1}^N (\Delta r_i)^2}$$
    </div>
    <p>These spatial fluctuations are converted to angular pointing fluctuations (in $\text{mrad}$) by dividing by the source-screen distance $L$:</p>
    <div class="math-box">
      $$\delta\theta_x = \arctan\left( \frac{\text{RMS}_x}{L \times 1000} \right) \times 1000, \quad \delta\theta_y = \arctan\left( \frac{\text{RMS}_y}{L \times 1000} \right) \times 1000, \quad \delta\theta_r = \arctan\left( \frac{\text{RMS}_r}{L \times 1000} \right) \times 1000$$
    </div>
  </div>

  <div class="exp-section">
    <h3>5. Electron Beam Charge Calculation</h3>
    <p>
      The total bunch charge is determined from the sum of background-subtracted camera counts $S_{\text{tot}}$ inside the signal ROI:
    </p>
    <div class="math-box">
      $$S_{\text{tot}} = \sum_{(x,y) \in \text{Signal ROI}} I'(x, y)$$
    </div>
    <p>
      The solid angle $\Omega$ (in $\text{sr}$) subtended by the imaging lens at distance $d_{\text{cam-screen}}$ (in $\text{mm}$) is calculated using the lens aperture diameter $D = f / f_{\#}$:
    </p>
    <div class="math-box">
      $$\Omega = \frac{\pi (D/2)^2}{d_{\text{cam-screen}}^2} = \frac{\pi (f / 2f_{\#})^2}{d_{\text{cam-screen}}^2}$$
    </div>
    <p>
      Using the camera calibration $C_{\text{cam}}$ (in $\text{photons/counts}$), the screen light yield $Y_{\text{screen}}$ (in $\text{photons/pC/sr}$), and optical transmission $T_{\text{loss}}$, the charge calibration factor (in $\text{pC/count}$) is:
    </p>
    <div class="math-box">
      $$C_{\text{charge}} = \frac{C_{\text{cam}}}{Y_{\text{screen}} \cdot \Omega \cdot T_{\text{loss}}}$$
    </div>
    <p>The total electron beam charge $Q$ (in $\text{pC}$) is then computed as:</p>
    <div class="math-box">
      $$Q_{\text{pC}} = S_{\text{tot}} \cdot C_{\text{charge}}$$
    </div>
  </div>
</div>
