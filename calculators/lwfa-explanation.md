---
layout: single
title: "LWFA Parameter Calculator — Equations & Physics"
permalink: /calculators/lwfa-explanation/
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
.warn-box {
  background: #fff7ed;
  border-left: 4px solid #f97316;
  border-radius: 0 6px 6px 0;
  padding: 0.7rem 1rem;
  margin: 0.8rem 0;
  font-size: 0.87rem;
  color: #9a3412;
}
.back-btn-wrap { margin-bottom: 1rem; }
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #2563eb;
  color: #fff !important;
  text-decoration: none;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background 0.15s;
}
.back-btn:hover { background: #1d4ed8; }
</style>

<div class="exp-page">

<div class="back-btn-wrap">
  <a href="/calculators/lwfa/" class="back-btn">← Back to Calculator</a>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>Overview</h3>
<p>
This page presents the mathematical definitions and scaling laws used in the
<strong>Laser-Wakefield Acceleration (LWFA) Parameter Calculator</strong>, following the
formulations of Lu et al. (PRSTAB 2007). Quantities are computed for a laser-driven plasma bubble
in the blowout (cavitated) regime.
</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>1. Laser Pulse Intensity Parameters</h3>

<h4>Focal Spot Area</h4>
<p>Cross-sectional area of the laser focal spot using the $1/e$ field waist radius $w_0$:</p>
<div class="eq-block">
$$A_\text{spot} = \pi w_0^2 \quad [\text{µm}^2]$$
</div>

<h4>Peak Power</h4>
<p>Calculated from pulse energy $W_L$ (J), duration $\tau_\text{FWHM}$ (fs), and beam quality factor $q$:</p>
<div class="eq-block">
$$P_{0,\,\text{Gaussian}} = \sqrt{\frac{4\ln 2}{\pi}}\,\frac{W_L}{\tau_\text{FWHM}} \times 10^{3}\,q \approx 0.939\,\frac{W_L}{\tau_\text{FWHM}} \times 10^{3}\,q \quad [\text{TW}]$$
</div>
<div class="eq-block">
$$P_{0,\,\text{Top-Hat}} = \frac{W_L}{\tau_\text{FWHM}} \times 10^{3}\,q \quad [\text{TW}]$$
</div>

<h4>Peak Intensity</h4>
<div class="eq-block">
$$I_0 = \frac{2 P_0}{\pi w_0^2} \times 100 \quad [10^{18}\,\text{W/cm}^2]$$
</div>

<h4>Normalized Vector Potential $a_0$</h4>
<p>The dimensionless relativistic laser amplitude — the key parameter governing nonlinear plasma dynamics:</p>
<div class="eq-block">
$$a_0 = \sqrt{\frac{I_0\,\lambda_L^2}{1.37}} \approx 0.855\,\lambda_L\,\sqrt{I_0}$$
</div>
<p>where $\lambda_L$ is the laser wavelength in µm. The blowout regime requires $a_0 \gtrsim 1$.</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>2. Plasma Parameters</h3>

<h4>Electron Density</h4>
<p>If not set directly, $n_e$ is computed from the total gas pressure $P_\text{Torr}$, background gas
valence $\text{bg\_el}$, dopant valence $\text{dop\_el}$, and dopant fraction $d\%$:</p>
<div class="eq-block">
$$n_e = 3.57\times10^{16}\cdot P_\text{Torr}\cdot\!\left[\text{bg\_el}\!\left(1-\frac{d\%}{100}\right) + \text{dop\_el}\cdot\frac{d\%}{100}\right] \quad [\text{cm}^{-3}]$$
</div>

<h4>Plasma Frequency and Wavelength</h4>
<div class="eq-block">
$$\omega_p = \sqrt{\frac{n_e \times 10^6 \cdot e^2}{\varepsilon_0 m_e}} \quad [\text{rad/s}], \qquad \lambda_p = \frac{2\pi c}{\omega_p}\times10^6 \quad [\text{µm}]$$
</div>

<h4>Debye Length</h4>
<p>The electrostatic screening length at electron temperature $T_e$ (eV):</p>
<div class="eq-block">
$$\lambda_D = \sqrt{\frac{\varepsilon_0 T_e}{n_e \times 10^6 \cdot e}} \times 10^6 \quad [\text{µm}]$$
</div>

<h4>Thermal Speed</h4>
<div class="eq-block">
$$v_\text{th} = \omega_p \lambda_D$$
</div>

<h4>Critical Power for Relativistic Self-Focusing</h4>
<p>The laser power threshold above which relativistic self-focusing overcomes diffraction:</p>
<div class="eq-block">
$$P_\text{crit} = 17\left(\frac{\omega_\text{laser}}{\omega_p}\right)^2\,\text{GW} = 0.017\left(\frac{\omega_\text{laser}}{\omega_p}\right)^2\,\text{TW}$$
</div>

<div class="note-box">
  Efficient LWFA operation typically requires $P_0/P_\text{crit} \gtrsim 1$ for self-guiding.
  The matched $a_0$ condition below ensures the pulse fits optimally into the plasma bubble.
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>3. LWFA Scaling Laws (Lu et al. 2007)</h3>

<h4>Matched Normalized Vector Potential</h4>
<p>The $a_0$ value that matches the laser spot size to the plasma bubble radius:</p>
<div class="eq-block">
$$a_{0,\,\text{matched}} = 2\left(\frac{P_0}{P_\text{crit}}\right)^{1/3}$$
</div>

<h4>Bubble Radius</h4>
<p>The physical radius of the blowout (cavitated) plasma bubble:</p>
<div class="eq-block">
$$R = \frac{2\sqrt{a_0}}{k_p} = 2\sqrt{a_0}\,\frac{c}{\omega_p}\times10^6 \quad [\text{µm}]$$
</div>

<h4>Dephasing Length</h4>
<p>The propagation distance over which accelerated electrons outrun the accelerating phase of the wake:</p>
<div class="eq-block">
$$L_d = \frac{2}{3}\left(\frac{\omega_\text{laser}}{\omega_p}\right)^2 R \times 10^3 \quad [\text{mm}]$$
</div>
<div class="eq-block">
$$L_{d,\,\text{alt}} = L_d \cdot \frac{4}{3}\,a_{0,\,\text{matched}}^{1/2}$$
</div>

<h4>Pump Depletion Length</h4>
<p>The distance over which the laser pulse transfers its energy to the plasma wake:</p>
<div class="eq-block">
$$L_\text{dep} = \left(\frac{\omega_\text{laser}}{\omega_p}\right)^2 c\,\tau_\text{FWHM} \times 10^3 \quad [\text{mm}]$$
</div>

<h4>Peak Electron Energy</h4>
<p>Maximum energy gain scaling law (Lu et al., PRSTAB 10, 061301, 2007):</p>
<div class="eq-block">
$$W_{el} = 1700\left(\frac{P_0}{100\,\text{TW}}\right)^{1/3}\!\left(\frac{10^{18}\,\text{cm}^{-3}}{n_e}\right)^{2/3}\!\left(\frac{0.8\,\text{µm}}{\lambda_L}\right)^{4/3}\,\text{MeV}$$
</div>

<div class="note-box">
  <strong>Validity:</strong> These scaling laws assume the blowout regime ($a_0 \gtrsim 2$),
  matched laser spotsize ($w_0 \approx R$), and that the dephasing length is shorter than the
  pump depletion length. For $P_0 \ll P_\text{crit}$, the bubble is not fully formed and
  results should be treated as order-of-magnitude estimates.
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>4. Quick Reference Table</h3>

<table class="ref-table">
  <thead><tr><th>Quantity</th><th>Symbol</th><th>Units</th></tr></thead>
  <tbody>
    <tr><td>Peak power (Gaussian)</td><td class="val">P₀ ≈ 0.939 W_L / τ_FWHM × 10³ q</td><td>TW</td></tr>
    <tr><td>Normalized vector potential</td><td class="val">a₀ = 0.86 √(I₀ λ²)</td><td>dimensionless</td></tr>
    <tr><td>Critical self-focusing power</td><td class="val">P_crit = 0.017 (ω_L/ω_p)²</td><td>TW</td></tr>
    <tr><td>Bubble radius</td><td class="val">R = 2√a₀ · c/ω_p × 10⁶</td><td>µm</td></tr>
    <tr><td>Dephasing length</td><td class="val">L_d = (2/3)(ω_L/ω_p)² R × 10³</td><td>mm</td></tr>
    <tr><td>Pump depletion length</td><td class="val">L_dep = (ω_L/ω_p)² c τ × 10³</td><td>mm</td></tr>
    <tr><td>Peak electron energy</td><td class="val">W_el ∝ P₀^(1/3) n_e^(-2/3)</td><td>MeV</td></tr>
  </tbody>
</table>

<p style="font-size:0.82rem; color:#6b7280; margin-top:0.5rem;">
  Reference: Lu, W. et al. (2007). <em>Phys. Rev. ST Accel. Beams</em>, 10, 061301.
</p>
</div>

<div class="back-btn-wrap" style="margin-top:0.5rem;">
  <a href="/calculators/lwfa/" class="back-btn">← Back to Calculator</a>
</div>

</div>
