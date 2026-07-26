---
layout: single
title: "Photon Attenuation — Equations & Physics"
permalink: /calculators/attenuation-explanation/
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
  <a href="/calculators/attenuation-calculator/" class="back-btn">← Back to Calculator</a>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>Overview</h3>
<p>
This page presents the mathematical foundations of the <strong>Photon Attenuation Calculator</strong>.
Mass interaction coefficients are obtained from the <strong>XCOM NIST database</strong> and used to compute
per-process and total photon interaction probabilities for a given material slab.
</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>1. Definitions</h3>

<p>Let $\sigma_i$ (cm²/g) be the mass interaction coefficient from XCOM for process $i$,
$\rho$ (g/cm³) the material density, and $t$ (cm) the slab thickness.</p>

<p>The calculator resolves five fundamental photon interaction processes:</p>
<ul>
  <li><strong>Rayleigh Scattering</strong> — coherent elastic scattering off bound electrons (no energy loss)</li>
  <li><strong>Compton Scattering</strong> — incoherent scattering off quasi-free electrons (partial energy transfer)</li>
  <li><strong>Photoelectric Absorption</strong> — complete absorption with photoelectron ejection</li>
  <li><strong>Nuclear Field Pair Production</strong> — electron–positron pair creation in the nuclear Coulomb field ($E > 1.022$ MeV)</li>
  <li><strong>Electron Field Pair Production</strong> — pair creation in the electron Coulomb field ($E > 2.044$ MeV)</li>
</ul>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>2. From Mass Cross Section to Linear Attenuation</h3>

<p>Each mass cross section is converted to a linear attenuation coefficient:</p>
<div class="eq-block">
$$\mu_i = \sigma_i \cdot \rho \quad [\text{cm}^{-1}]$$
</div>

<h4>Total Linear Attenuation</h4>
<p>The total linear attenuation coefficient is the sum over all processes:</p>
<div class="eq-block">
$$\mu_\text{tot} = \sigma_\text{tot} \cdot \rho = \left(\sum_i \sigma_i\right) \cdot \rho$$
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>3. Transmission and Attenuation Probabilities</h3>

<p>A mono-energetic photon beam follows the Beer–Lambert exponential decay law. The probability that a photon
traverses the full slab <em>without</em> any interaction (transmission) is:</p>
<div class="eq-block">
$$P_\text{transmission} = e^{-\mu_\text{tot}\,t}$$
</div>

<p>The probability that the photon interacts at least once (attenuation) is the complement:</p>
<div class="eq-block">
$$P_\text{attenuation} = 1 - e^{-\mu_\text{tot}\,t}$$
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>4. Process-Specific Absolute Probabilities</h3>

<p>Since each process contributes independently and proportionally to $\mu_\text{tot}$, the absolute probability
that an entering photon undergoes a specific process $i$ across the full slab thickness is:</p>
<div class="eq-block">
$$P_i = \frac{\sigma_i}{\sigma_\text{tot}} \cdot \left(1 - e^{-\mu_\text{tot}\,t}\right)$$
</div>

<p>Because these are absolute macroscopic probabilities, the sum over all processes exactly equals the
total attenuation probability:</p>
<div class="eq-block">
$$\sum_i P_i = P_\text{attenuation}$$
</div>

<div class="note-box">
  <strong>Example:</strong> The absolute probability of photoelectric absorption is
  $P_\text{PE} = \dfrac{\sigma_\text{PE}}{\sigma_\text{tot}}\cdot(1-e^{-\mu_\text{tot}t})$.
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>5. Data Interpolation and Absorption Edges</h3>

<p>The NIST XCOM database contains discrete energy points. To evaluate coefficients at arbitrary photon energies,
a <strong>log-log linear interpolation</strong> is applied. For any target energy, the two nearest database
points are located and interpolation is performed in log-log space:</p>
<div class="eq-block">
$$\log\sigma(E) = \log\sigma_1 + \frac{\log(E/E_1)}{\log(E_2/E_1)}\,(\log\sigma_2 - \log\sigma_1)$$
</div>

<p>This matches the power-law scaling of photon cross sections across energy ranges and prevents the severe
physical errors of linear interpolation. Absorption edges (K-edges, L-edges) are handled natively: the XCOM
database places closely spaced point pairs at each discontinuity, and log-log interpolation correctly captures
the sharp jump in cross section immediately below and above each binding energy threshold.</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>6. Compounds and Bragg's Additivity Rule</h3>

<p>For molecular compounds and complex materials (e.g., Kapton, Water, Lanex), the total mass attenuation
coefficient is derived from the elemental components using <strong>Bragg's Additivity Rule</strong>:</p>
<div class="eq-block">
$$\left(\frac{\mu}{\rho}\right)_\text{compound} = \sum_j w_j \left(\frac{\mu}{\rho}\right)_j$$
</div>

<p>The mass fraction $w_j$ of element $j$ is determined by its stoichiometric count $n_j$, atomic mass $A_j$,
and the total molecular mass $M_\text{total}$:</p>
<div class="eq-block">
$$w_j = \frac{n_j \cdot A_j}{M_\text{total}}$$
</div>

<div class="note-box">
  Bragg's rule assumes the interaction cross sections of atoms in a molecule are identical to those of
  isolated atoms. This is an excellent approximation above ~1 keV, with small deviations near absorption edges.
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>7. Summary of Key Equations</h3>

<table class="ref-table">
  <thead><tr><th>Quantity</th><th>Formula</th></tr></thead>
  <tbody>
    <tr><td>Linear attenuation</td><td class="val">μᵢ = σᵢ · ρ</td></tr>
    <tr><td>Total attenuation</td><td class="val">μ_tot = Σ μᵢ</td></tr>
    <tr><td>Transmission</td><td class="val">exp(−μ_tot · t)</td></tr>
    <tr><td>Attenuation probability</td><td class="val">1 − exp(−μ_tot · t)</td></tr>
    <tr><td>Process probability</td><td class="val">(σᵢ/σ_tot) · (1 − exp(−μ_tot · t))</td></tr>
    <tr><td>Compound mixing</td><td class="val">(μ/ρ)_compound = Σ wⱼ (μ/ρ)ⱼ</td></tr>
  </tbody>
</table>
</div>

<div class="back-btn-wrap" style="margin-top:0.5rem;">
  <a href="/calculators/attenuation-calculator/" class="back-btn">← Back to Calculator</a>
</div>

</div>
