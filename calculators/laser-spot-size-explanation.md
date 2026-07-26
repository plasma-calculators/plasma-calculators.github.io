---
layout: single
title: "Laser Spot Size & Gaussian Beam Optics — Equations & Physics"
permalink: /calculators/laser-spot-size-explanation/
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
.ref-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin: 0.7rem 0;
}
.ref-table th {
  background: #1e3a5f;
  color: #fff;
  padding: 0.45rem 0.7rem;
  text-align: left;
  font-weight: 600;
}
.ref-table td {
  padding: 0.4rem 0.7rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
}
.ref-table tr:last-child td { border-bottom: none; }
.ref-table tr:nth-child(even) td { background: #f9fafb; }
.ref-table .val { font-family: 'Courier New', monospace; font-size: 0.88rem; color: #1e3a5f; font-weight: 600; }
.eq-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.8rem 1.2rem;
  margin: 0.6rem 0;
  overflow-x: auto;
}
.note-box {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 0 6px 6px 0;
  padding: 0.7rem 1rem;
  margin: 0.8rem 0;
  font-size: 0.87rem;
  color: #1e40af;
}
.back-btn {
  display: inline-block;
  background: #2563eb;
  color: #fff !important;
  padding: 0.55rem 1.2rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none !important;
  margin-bottom: 1.5rem;
  transition: background 0.15s ease;
}
.back-btn:hover { background: #1d4ed8; }
</style>

<div class="exp-page">
  <a href="/calculators/laser-spot-size/" class="back-btn">← Back to Laser Spot Size Calculator</a>

  <div class="exp-section">
    <h3>1. Gaussian Beam Profile Definitions</h3>
    <p>
      In paraxial optics, a fundamental transverse mode ($\text{TEM}_{00}$) laser beam exhibits a Gaussian intensity distribution as a function of radial distance $r$ from the optical axis:
    </p>
    <div class="eq-block">
      $$I(r) = I_0 \exp\left( -2 \frac{r^2}{w^2} \right)$$
    </div>
    <p>
      where $I_0$ is the peak intensity on axis ($r = 0$) and $w$ is the beam radius at which the electric field amplitude drops to $1/e \approx 36.8\%$ and intensity drops to $1/e^2 \approx 13.5\%$ of its peak value.
    </p>

    <h4>Key Spot Size Metrics:</h4>
    <ul>
      <li>
        <strong>$1/e^2$ Spot Diameter ($d_{1/e^2}$):</strong> The full width of the beam where intensity drops to $1/e^2$ ($13.5\%$) of the peak value. It is related to the waist radius $w_0$ by $d_{1/e^2} = 2 w_0$.
      </li>
      <li>
        <strong>Full Width at Half Maximum ($d_{\text{FWHM}}$):</strong> The diameter at which intensity falls to $50\%$ ($1/2$) of the peak intensity. For a Gaussian profile:
        $$d_{\text{FWHM}} = 2 r_{\text{FWHM}} = 2 w_0 \sqrt{\frac{\ln 2}{2}} = d_{1/e^2} \sqrt{\frac{\ln 2}{2}} \approx 0.5887 \, d_{1/e^2}$$
      </li>
      <li>
        <strong>RMS Spot Diameter ($d_{\text{RMS}}$):</strong> Based on the standard deviation ($\sigma$) of the Gaussian intensity distribution. For a 2D Gaussian profile, $\sigma_x = w_0 / 2$. The RMS diameter is defined as $d_{\text{RMS}} = 2 \sigma_x = w_0 = \frac{1}{2} d_{1/e^2}$.
      </li>
    </ul>
  </div>

  <div class="exp-section">
    <h3>2. Focus Spot Size & Lens Focusing Physics</h3>
    <p>
      When an collimated input Gaussian beam of $1/e^2$ diameter $D_{\text{in}}$ ( waist radius $w_{\text{in}} = D_{\text{in}} / 2$ ) is focused by aberration-free optics of focal length $f$, the focused beam waist radius $w_0$ at the focal plane is given by:
    </p>
    <div class="eq-block">
      $$w_0 = \frac{\lambda f M^2}{\pi w_{\text{in}}} = \frac{2 \lambda f M^2}{\pi D_{\text{in}}}$$
    </div>
    <p>
      Multiplying by 2 yields the focused spot diameter at $1/e^2$ intensity ($d_{1/e^2}$):
    </p>
    <div class="eq-block">
      $$d_{1/e^2} = 2 w_0 = \frac{4 \lambda f M^2}{\pi D_{\text{in}}} = \frac{4 \lambda N M^2}{\pi}$$
    </div>
    <p>
      where:
    </p>
    <ul>
      <li>$\lambda$ is the laser wavelength.</li>
      <li>$N = \frac{f}{D_{\text{in}}}$ is the F-number of the focusing optics.</li>
      <li>$M^2$ is the beam propagation factor ($M^2 = 1.0$ for a diffraction-limited fundamental Gaussian beam, and $M^2 > 1$ for real beams).</li>
    </ul>

    <div class="note-box">
      <strong>Note on F-Number ($N$):</strong> In Gaussian optics, the F-number is defined relative to the $1/e^2$ input beam diameter $D_{\text{in}}$ as $N = f / D_{\text{in}}$. Therefore, doubling the input beam size or halving the focal length cuts the focused spot size in half.
    </div>
  </div>

  <div class="exp-section">
    <h3>3. Rayleigh Range & Depth of Focus</h3>
    <p>
      The <strong>Rayleigh range ($z_R$)</strong> is the distance along the propagation direction from the beam waist ($z = 0$) to where the beam cross-sectional area doubles (and the beam radius increases by a factor of $\sqrt{2}$ to $\sqrt{2} w_0$):
    </p>
    <div class="eq-block">
      $$z_R = \frac{\pi w_0^2}{\lambda M^2} = \frac{\pi d_{1/e^2}^2}{4 \lambda M^2} = \frac{4 \lambda N^2 M^2}{\pi} = \frac{4 \lambda f^2 M^2}{\pi D_{\text{in}}^2}$$
    </div>
    <p>
      The <strong>Depth of Focus (DOF)</strong> (also known as the confocal parameter $b$) is the total distance over which the beam remains reasonably well focused around the waist:
    </p>
    <div class="eq-block">
      $$b = 2 z_R = \frac{8 \lambda N^2 M^2}{\pi}$$
    </div>
  </div>

  <div class="exp-section">
    <h3>4. Pulsed Laser Parameters (Peak Power, Intensity & $a_0$)</h3>
    <p>
      For ultra-short laser pulses (such as femtosecond or picosecond pulses used in high-intensity laser-matter interaction and plasma physics), the calculator computes the peak power, peak focus intensity, and normalized vector potential ($a_0$).
    </p>

    <h4>A. Peak Laser Power ($P_{\text{peak}}$) & Energy Fraction ($q$-factor)</h4>
    <p>
      Calculated from pulse energy $E_L$, duration $\tau_{\text{FWHM}}$, and energy fraction $q \le 1.0$:
    </p>
    <div class="eq-block">
      $$P_{\text{Gaussian}} = q \cdot \sqrt{\frac{4 \ln 2}{\pi}} \frac{E_L}{\tau_{\text{FWHM}}} \approx 0.939437 \, q \cdot \frac{E_L}{\tau_{\text{FWHM}}}$$
    </div>
    <div class="eq-block">
      $$P_{\text{Top-Hat}} = q \cdot \frac{E_L}{\tau_{\text{FWHM}}}$$
    </div>

    <h4>B. Peak Focal Intensity ($I_0$)</h4>
    <p>
      For a focused spatial Gaussian beam with $1/e$ field waist radius $w_0$:
    </p>
    <div class="eq-block">
      $$I_0 = \frac{2 P_{\text{peak}}}{\pi w_0^2} = \frac{8 P_{\text{peak}}}{\pi d_{1/e^2}^2}$$
    </div>

    <h4>C. Normalized Vector Potential ($a_0$)</h4>
    <p>
      The dimensionless vector potential parameter $a_0$ measures the relativistic intensity of the focused laser field in plasma physics ($a_0 \ge 1$ signifies relativistic electron motion):
    </p>
    <div class="eq-block">
      $$a_0 = \frac{e E_0}{m_e \omega c} = \sqrt{ \frac{I_0 [\text{W/cm}^2] \cdot (\lambda [\mu\text{m}])^2}{1.37 \times 10^{18}} } \approx 0.855 \, \lambda [\mu\text{m}] \, \sqrt{I_0 [10^{18} \text{ W/cm}^2]}$$
    </div>
  </div>

  <div class="exp-section">
    <h3>5. Formula Quick Reference Summary</h3>
    <table class="ref-table">
      <thead>
        <tr>
          <th>Quantity</th>
          <th>Formula</th>
          <th>Typical Units</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Focus Spot Diameter ($1/e^2$)</td>
          <td class="val">d_{1/e^2} = \frac{4 \lambda N M^2}{\pi} = \frac{4 \lambda f M^2}{\pi D_{\text{in}}}</td>
          <td>$\mu\text{m}$</td>
        </tr>
        <tr>
          <td>FWHM Spot Diameter</td>
          <td class="val">d_{\text{FWHM}} = d_{1/e^2} \sqrt{\frac{\ln 2}{2}} \approx 0.5887 \, d_{1/e^2}</td>
          <td>$\mu\text{m}$</td>
        </tr>
        <tr>
          <td>RMS Spot Diameter</td>
          <td class="val">d_{\text{RMS}} = w_0 = \frac{1}{2} d_{1/e^2}</td>
          <td>$\mu\text{m}$</td>
        </tr>
        <tr>
          <td>Rayleigh Range</td>
          <td class="val">z_R = \frac{4 \lambda N^2 M^2}{\pi}</td>
          <td>$\mu\text{m}$, $\text{mm}$</td>
        </tr>
        <tr>
          <td>Depth of Focus</td>
          <td class="val">\text{DOF} = 2 z_R = \frac{8 \lambda N^2 M^2}{\pi}</td>
          <td>$\mu\text{m}$, $\text{mm}$</td>
        </tr>
        <tr>
          <td>Gaussian Peak Power</td>
          <td class="val">P_{\text{Gaussian}} \approx 0.9394 \, q \cdot \frac{E_L}{\tau_{\text{FWHM}}}</td>
          <td>GW, TW</td>
        </tr>
        <tr>
          <td>Top-Hat Peak Power</td>
          <td class="val">P_{\text{Top-Hat}} = q \cdot \frac{E_L}{\tau_{\text{FWHM}}}</td>
          <td>GW, TW</td>
        </tr>
        <tr>
          <td>Peak Focal Intensity</td>
          <td class="val">I_0 = \frac{2 P_{\text{peak}}}{\pi w_0^2} = \frac{8 P_{\text{peak}}}{\pi d_{1/e^2}^2}</td>
          <td>$\text{W/cm}^2$</td>
        </tr>
        <tr>
          <td>Normalized Vector Potential</td>
          <td class="val">a_0 \approx 0.855 \, \lambda[\mu\text{m}] \sqrt{I_0 [10^{18}\text{W/cm}^2]}</td>
          <td>dimensionless</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="exp-section">
    <h3>6. References & Optics Resources</h3>
    <ul>
      <li><a href="https://www.newport.com/n/gaussian-beam-optics" target="_blank" rel="noopener">Newport Technical Note: Gaussian Beam Optics</a></li>
      <li><a href="https://www.lasercalculator.com/laser-spot-size-calculator/" target="_blank" rel="noopener">LaserCalculator: Laser Spot Size & Focal Geometry</a></li>
      <li>Siegman, A. E. (1986). <em>Lasers</em>. University Science Books.</li>
    </ul>
  </div>

  <a href="/calculators/laser-spot-size/" class="back-btn">← Back to Laser Spot Size Calculator</a>
</div>
