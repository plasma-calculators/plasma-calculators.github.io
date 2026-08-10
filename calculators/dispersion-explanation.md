---
layout: single
title: "Ultrafast Pulse Propagation & Dispersion — Equations & Physics"
permalink: /calculators/dispersion-explanation/
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
.badge {
  display: inline-block;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
  padding: 0.1rem 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  margin-left: 0.4rem;
  vertical-align: middle;
}
.badge.green { background: #d1fae5; color: #065f46; }
.badge.red   { background: #fee2e2; color: #991b1b; }
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
  <a href="/calculators/dispersion/" class="back-btn">← Back to Calculator</a>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>Overview</h3>
<p>
This page presents the mathematical foundations of the <strong>Ultrafast Pulse Propagation & Dispersion Calculator</strong>.
All quantities are computed using the <strong>Sellmeier refractive index model</strong>, fourth-order Taylor differentiation,
and an FFT-based spectral propagation algorithm using GDD and TOD. Results for <em>Fused Silica at 800 nm</em> are cross-checked against
published literature values.
</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>1. Sellmeier Refractive Index Equation</h3>

<p>
For isotropic optical glasses and crystals the wavelength-dependent refractive index $n(\lambda)$ is given by
the standard 3-term Sellmeier dispersion formula:
</p>

<div class="eq-block">
$$n^2(\lambda) = 1 + \frac{B_1\,\lambda^2}{\lambda^2 - C_1} + \frac{B_2\,\lambda^2}{\lambda^2 - C_2} + \frac{B_3\,\lambda^2}{\lambda^2 - C_3}$$
</div>

<p>
where $\lambda$ is the vacuum wavelength in <strong>micrometers (µm)</strong>, and $B_i$, $C_i$ are material-specific
resonance constants fitted to experimental data. The $C_i$ values have units of $\text{µm}^2$ and correspond
to squared resonance wavelengths.
</p>

<h4>Fused Silica Sellmeier Coefficients (Malitson 1965)</h4>
<table class="ref-table">
  <thead><tr><th>Term</th><th>$B_i$</th><th>$C_i$ (µm²)</th></tr></thead>
  <tbody>
    <tr><td>$i = 1$</td><td class="val">0.6961663</td><td class="val">0.00467914826</td></tr>
    <tr><td>$i = 2$</td><td class="val">0.4079426</td><td class="val">0.01351206310</td></tr>
    <tr><td>$i = 3$</td><td class="val">0.8974794</td><td class="val">97.934002500</td></tr>
  </tbody>
</table>
<p style="font-size:0.82rem; color:#6b7280;">Valid range: 210 – 3710 nm. Reference: Malitson, I. H. (1965). <em>JOSA</em>, 55(10), 1205–1209.</p>

<h4>Air Refractive Index (Ciddor Model)</h4>
<p>For dry air at standard conditions (1 atm, 15°C), the Peck & Reeder / Ciddor approximation is used:</p>
<div class="eq-block">
$$n(\lambda) - 1 = \frac{a_0}{b_0 - \sigma^2} + \frac{a_1}{b_1 - \sigma^2}$$
</div>
<p>where $\sigma = 1/\lambda_{\text{µm}}$ is the wavenumber in µm⁻¹. Parameters: $a_0 = 0.05792105$, $b_0 = 238.0185\,\text{µm}^{-2}$, $a_1 = 0.00167917$, $b_1 = 57.362\,\text{µm}^{-2}$. This gives $n_\text{air}(800\,\text{nm}) \approx 1.000275$.</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>2. Group Index and Phase/Group Velocities</h3>

<p>The <strong>phase velocity</strong> describes the speed of the wavefront; the <strong>group velocity</strong> describes the speed at which the pulse envelope propagates:</p>

<div class="eq-block">
$$v_p = \frac{c}{n(\lambda)}, \qquad v_g = \frac{c}{n_g(\lambda)}$$
</div>

<p>The <strong>group index</strong> $n_g$ is related to the phase index and its wavelength derivative:</p>

<div class="eq-block">
$$n_g(\lambda) = n(\lambda) - \lambda\,\frac{dn}{d\lambda}$$
</div>

<div class="note-box">
  <strong>Physical meaning:</strong> When $n_g > n$ (which is the case for normal dispersion glasses), longer wavelengths travel faster (lower $n_g$ at longer $\lambda$) — this is the origin of pulse stretching in normal-dispersion materials.
</div>

<h4>Numerical Differentiation</h4>
<p>
All derivatives $\frac{d^k n}{d\lambda^k}$ through fourth order are computed by truncated Taylor arithmetic on the Sellmeier/rational model:
</p>
<div class="eq-block">
$$n(\lambda_0+\delta\lambda)=n_0+n'_0\delta\lambda+\frac{n''_0}{2}\delta\lambda^2+\frac{n'''_0}{6}\delta\lambda^3+\frac{n''''_0}{24}\delta\lambda^4+\cdots$$
</div>
<p>This avoids cancellation error in the fourth derivative near the edges of a material's validity range.</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>3. Chromatic Dispersion Coefficients</h3>

<p>
The propagation constant $\beta(\omega) = \frac{\omega}{c}\,n(\omega)$ is Taylor-expanded about the carrier frequency $\omega_0 = 2\pi c/\lambda_0$:
</p>
<div class="eq-block">
$$\beta(\omega) = \beta_0 + \beta_1(\omega-\omega_0) + \frac{1}{2}\beta_2(\omega-\omega_0)^2 + \frac{1}{6}\beta_3(\omega-\omega_0)^3 + \cdots$$
</div>

<p>Expressing the $\beta_m$ coefficients in terms of wavelength-derivatives of $n$, with $\lambda$ in µm and $c$ in µm/fs:</p>

<h4>Group Velocity Dispersion (GVD)</h4>
<div class="eq-block">
$$\mathrm{GVD} = \beta_2 = \frac{\lambda_0^3}{2\pi c^2}\,\frac{d^2n}{d\lambda^2} \quad [\mathrm{fs}^2/\mathrm{mm}]$$
</div>
<p>Positive GVD = <em>normal dispersion</em> (red wavelengths travel faster). Fused silica is in normal dispersion below ~1.3 µm.</p>

<h4>Group Delay Dispersion (GDD)</h4>
<div class="eq-block">
$$\mathrm{GDD} = \mathrm{GVD} \times L \quad [\mathrm{fs}^2]$$
</div>
<p>Total integrated dispersion for propagation through thickness $L$ (mm).</p>

<h4>Third-Order Dispersion (TOD)</h4>
<div class="eq-block">
$$\mathrm{TOD} = \beta_3 = -\frac{\lambda_0^4}{4\pi^2 c^3}\left(3\,\frac{d^2n}{d\lambda^2} + \lambda_0\,\frac{d^3n}{d\lambda^3}\right) \quad [\mathrm{fs}^3/\mathrm{mm}]$$
</div>
<p>TOD causes asymmetric temporal distortion — pre- or post-pulse ringing that cannot be removed by simple GDD compensation.</p>

</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>4. Analytical Gaussian Pulse Broadening</h3>

<p>
For a transform-limited Gaussian pulse with intensity FWHM $\tau_0$, propagation through a medium with pure GDD yields
an analytic closed-form for the output duration:
</p>

<div class="eq-block">
$$\tau_{\mathrm{out}} = \tau_0\,\sqrt{1 + \left(\frac{4\ln 2 \cdot \mathrm{GDD}}{\tau_0^2}\right)^2}$$
</div>

<p>
This formula assumes a Gaussian temporal shape and ignores TOD contributions. The broadening factor
$\tau_{\mathrm{out}}/\tau_0$ approaches $|4\ln 2 \cdot \mathrm{GDD}|/\tau_0^2$ for strong dispersion.
The FFT simulation (see §5) captures the full non-Gaussian distortion.
</p>

<div class="note-box">
  <strong>Example:</strong> A 30 fs pulse through 10 mm of Fused Silica (GDD ≈ 362 fs²):<br>
  factor = 4ln2 × 362 / 30² = 2.773 × 0.402 = <strong>1.115</strong><br>
  $\tau_\text{out} = 30\,\sqrt{1 + 1.115^2} = 30 \times 1.50 \approx \mathbf{45\,\text{fs}}$
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>5. Numerical FFT Spectral Propagation</h3>

<p>
To capture TOD-induced asymmetric distortion, the calculator performs a numerical simulation in the frequency domain:
</p>

<h4>Algorithm</h4>
<ul>
  <li><strong>Step 1 — Time grid:</strong> Build $N = 8192$ points spanning $\pm\tau_\mathrm{max}$ where $\tau_\mathrm{max} = \max(2000\,\text{fs},\;40\tau_0)$.</li>
  <li><strong>Step 2 — Input pulse:</strong> Construct transform-limited Gaussian: $E_\mathrm{in}(t) = \exp\!\left[-\tfrac{t^2}{2\sigma_t^2}\right]$ with $\sigma_t = \tau_0 / (2\sqrt{\ln 2})$ so the intensity FWHM is $\tau_0$.</li>
  <li><strong>Step 3 — Forward FFT:</strong> Compute $\tilde{E}_\mathrm{in}(\omega)$ using a radix-2 Cooley–Tukey FFT.</li>
  <li><strong>Step 4 — Spectral phase:</strong> Apply medium and compensation phases:
    $$\Phi_\mathrm{med}(\delta\omega) = \tfrac{1}{2}\,\mathrm{GDD}\,\delta\omega^2 + \tfrac{1}{6}\,\mathrm{TOD}_\mathrm{tot}\,\delta\omega^3$$
    $$\Phi_\mathrm{comp}(\delta\omega) = \tfrac{1}{2}\,\mathrm{GDD}_c\,\delta\omega^2 + \tfrac{1}{6}\,\mathrm{TOD}_c\,\delta\omega^3$$
    $$\tilde{E}_\mathrm{out}(\omega) = \tilde{E}_\mathrm{in}(\omega)\,e^{i\left[\Phi_\mathrm{med} + \Phi_\mathrm{comp}\right]}$$
  </li>
  <li><strong>Step 5 — Inverse FFT:</strong> $E_\mathrm{out}(t) = \mathcal{F}^{-1}\{\tilde{E}_\mathrm{out}(\omega)\}$, pulse intensity $I(t) = |E_\mathrm{out}(t)|^2$.</li>
  <li><strong>Step 6 — FWHM:</strong> Linear interpolation to find exact half-maximum crossing points.</li>
</ul>

<div class="warn-box">
  <strong>Note on spectral intensity:</strong> For purely linear dispersion (GVD/TOD with no gain or absorption), the spectral power $|\tilde{E}(\omega)|^2$ is <em>conserved</em> — the medium only modifies the spectral phase, not the amplitude. All temporal changes arise solely from phase distortion.
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>6. Reference Verification — Fused Silica at 800 nm</h3>

<p>
Cross-check of calculator outputs against published and independently computed literature values for
<strong>Fused Silica (SiO₂)</strong> at $\lambda_0 = 800\,\text{nm}$, $L = 10\,\text{mm}$:
</p>

<table class="ref-table">
  <thead>
    <tr>
      <th>Quantity</th>
      <th>This Calculator</th>
      <th>Literature / Reference</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Refractive index $n$</td>
      <td class="val">1.4533</td>
      <td>1.4533 (Malitson 1965)</td>
    </tr>
    <tr>
      <td>Group index $n_g$</td>
      <td class="val">1.4671</td>
      <td>1.4671 (derived from Malitson model)</td>
    </tr>
    <tr>
      <td>GVD ($\beta_2$)</td>
      <td class="val">+36.2 fs²/mm</td>
      <td>+36.16 fs²/mm (refractiveindex.info)</td>
    </tr>
    <tr>
      <td>GDD ($L = 10\,\text{mm}$)</td>
      <td class="val">+362 fs²</td>
      <td>+362 fs² (derived)</td>
    </tr>
    <tr>
      <td>TOD ($\beta_3$)</td>
      <td class="val">+27.5 fs³/mm</td>
      <td>+27.5 fs³/mm (Diels & Rudolph)</td>
    </tr>

    <tr>
      <td>Analytic broadening (30 fs → 10 mm)</td>
      <td class="val">~45 fs</td>
      <td>~44–46 fs (formula, FWHM convention)</td>
    </tr>
  </tbody>
</table>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>7. Material Database</h3>
<p>The calculator includes Sellmeier data for the following optical materials:</p>
<table class="ref-table">
  <thead><tr><th>Category</th><th>Materials</th><th>Wavelength Range</th></tr></thead>
  <tbody>
    <tr><td>Reference</td><td>Vacuum</td><td>100–10000 nm</td></tr>
    <tr><td>Gaseous</td><td>Air (dry, 1 atm, 15°C)</td><td>230–1690 nm</td></tr>
    <tr><td>Glasses</td><td>Fused Silica</td><td>210–3710 nm</td></tr>
    <tr><td>Glasses</td><td>N-BK7</td><td>300–2500 nm</td></tr>
    <tr><td>Glasses</td><td>SF11, N-SF11</td><td>370–2500 nm</td></tr>
    <tr><td>Glasses</td><td>SF10</td><td>380–2500 nm</td></tr>
    <tr><td>Crystals</td><td>Sapphire (o/e)</td><td>200–5000 nm</td></tr>
    <tr><td>Crystals</td><td>CaF₂</td><td>150–9000 nm</td></tr>
    <tr><td>Crystals</td><td>MgF₂ (o)</td><td>150–7000 nm</td></tr>
    <tr><td>Crystals</td><td>Diamond</td><td>230–25000 nm</td></tr>
    <tr><td>Nonlinear Crystals</td><td>BBO (o/e)</td><td>220–1064 nm</td></tr>
    <tr><td>Nonlinear Crystals</td><td>LBO</td><td>160–2600 nm</td></tr>
    <tr><td>Nonlinear Crystals</td><td>KDP</td><td>200–1500 nm</td></tr>
    <tr><td>IR Materials</td><td>ZnSe</td><td>540–18000 nm</td></tr>
  </tbody>
</table>
</div>

<div class="back-btn-wrap" style="margin-top:0.5rem;">
  <a href="/calculators/dispersion/" class="back-btn">← Back to Calculator</a>
</div>

</div>
