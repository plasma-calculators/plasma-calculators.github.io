---
layout: single
title: "Camera Counts Estimation — Equations & Physics"
permalink: /calculators/counts-estimation-explanation/
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
  <a href="/calculators/counts-estimation/" class="back-btn">← Back to Calculator</a>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>Overview</h3>
<p>
This page presents the physics, geometry, and mathematical formulas behind the
<strong>Camera Counts Estimation Calculator</strong>. The tool models the full signal chain from
ionizing-radiation energy deposition in a scintillator crystal through scintillation photon emission,
optical collection, and analog-to-digital conversion on the camera sensor.
</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>1. Energy Deposition in the Crystal</h3>

<p>The energy deposited by a charged particle traversing the scintillator depends on the
<strong>mass stopping power</strong> of the material, its density, and the path length:</p>
<div class="eq-block">
$$E_\text{deposited} = \left(\frac{dE}{dx}\right)_\text{mass} \cdot \rho \cdot t \quad [\text{MeV}]$$
</div>

<p>where $(dE/dx)_\text{mass}$ is in MeV·cm²/g, $\rho$ is the crystal density in g/cm³, and
$t$ is the crystal thickness in cm. The deposited energy is converted to keV for the next step:</p>
<div class="eq-block">
$$E_\text{deposited,\,keV} = E_\text{deposited,\,MeV} \times 1000$$
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>2. Scintillation Photon Generation</h3>

<p>The total number of optical photons generated inside the crystal is determined by the
material's <strong>light yield</strong> $Y_\text{light}$ (photons/keV):</p>
<div class="eq-block">
$$N_\text{photons} = E_\text{deposited,\,keV} \cdot Y_\text{light}$$
</div>

<div class="note-box">
  Light yield values span a wide range: CsI(Tl) ≈ 54 ph/keV, LYSO ≈ 32 ph/keV, BGO ≈ 8 ph/keV.
  Higher yield does not always mean better performance — decay time, emission wavelength, and
  optical coupling efficiency all matter.
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>3. Optical Collection Efficiency</h3>

<p>Only a fraction of the generated scintillation photons reach the camera sensor. This
<strong>collection efficiency</strong> $\eta$ depends on lens aperture, focal length, and magnification.</p>

<h4>Lens Magnification</h4>
<p>The magnification $m$ from focal length $f$ and object distance $d_o$ (crystal to lens):</p>
<div class="eq-block">
$$m = \frac{f}{d_o - f}, \qquad \text{Term}_\text{mag} = \left(1 + \frac{1}{m}\right)^2$$
</div>

<h4>Isotropic Emission (unpolished / unwrapped crystal)</h4>
<p>Light emitted uniformly into $4\pi$ steradians. Collection efficiency:</p>
<div class="eq-block">
$$\eta_\text{isotropic} = \frac{1}{16 \cdot (f/\#)^2 \cdot \text{Term}_\text{mag}}$$
</div>

<h4>Lambertian Emission (polished / wrapped light-guide)</h4>
<p>Directional emission into a $2\pi$ hemisphere facing the lens — increases collection by 4×:</p>
<div class="eq-block">
$$\eta_\text{Lambertian} = \frac{1}{4 \cdot (f/\#)^2 \cdot \text{Term}_\text{mag}}$$
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>4. Sensor Photoelectron Conversion</h3>

<p>Photons collected by the sensor are converted to photoelectrons via the sensor
<strong>Quantum Efficiency</strong> $QE$:</p>
<div class="eq-block">
$$N_{e^-} = N_\text{photons} \cdot \eta \cdot QE$$
</div>

<p>where $QE$ is the fraction of incident photons that generate an electron–hole pair (0–1), evaluated
at the scintillation emission wavelength.</p>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>5. Analog-to-Digital Conversion</h3>

<p>The accumulated charge is digitized using the sensor's full-well capacity (FWC) and ADC bit depth $B$:</p>
<div class="eq-block">
$$\text{Gain}_\text{ADC} = \frac{\text{FWC}}{2^B - 1} \quad [e^-/\text{count}]$$
</div>

<p>The digital ADC output (integer counts) is:</p>
<div class="eq-block">
$$\text{ADC Counts} = \left\lfloor \frac{N_{e^-}}{\text{Gain}_\text{ADC}} \right\rfloor$$
</div>

<div class="warn-box">
  <strong>Important:</strong> Many datasheets report a saturation capacity measured to the EMVA 1288 standard,
  which may differ from the nominal FWC. Use the EMVA 1288 saturation capacity when available. Also use the
  actual ADC bit depth (e.g., 12-bit), not the padded output bit depth (e.g., 16-bit).
</div>
</div>

<!-- ══════════════════════════════════════════════════════════════════ -->
<div class="exp-section">
<h3>6. Dynamic Range and Signal-to-Noise Ratio</h3>

<h4>Dynamic Range</h4>
<p>The dynamic range quantifies the ratio between saturation and noise floor:</p>
<div class="eq-block">
$$\text{DR}_\text{dB} = 20\cdot\log_{10}\!\left(\frac{\text{FWC}}{\sigma_\text{read}}\right)$$
</div>

<p>Given DR and read noise, the implied saturation capacity is:</p>
<div class="eq-block">
$$\text{FWC}_\text{implied} = \sigma_\text{read} \cdot 10^{\text{DR}_\text{dB}/20}$$
</div>

<h4>Signal-to-Noise Ratio (simplified, read-noise limited)</h4>
<p>For low-light scintillator imaging where read noise dominates:</p>
<div class="eq-block">
$$\text{SNR} = \frac{N_{e^-}}{\sigma_\text{read}}$$
</div>

<h4>Full SNR Model</h4>
<p>The complete noise model including photon shot noise:</p>
<div class="eq-block">
$$\text{SNR} = \frac{S}{\sqrt{\sigma_\text{read}^2 + S}}$$
</div>

<p>At sensor saturation ($S = \text{FWC} \gg \sigma_\text{read}^2$), shot noise dominates and the
peak SNR simplifies to:</p>
<div class="eq-block">
$$\text{SNR}_\text{max} \approx \sqrt{\text{FWC}}, \qquad \text{SNR}_\text{max,\,dB} = 10\cdot\log_{10}(\text{FWC})$$
</div>

<div class="note-box">
  Datasheets often list two separate metrics: <strong>Dynamic Range</strong> (dark limit, ratio of FWC to noise floor)
  and <strong>Signal-to-Noise Ratio</strong> (bright limit, maximum SNR at saturation). These are different
  quantities measured at opposite ends of the sensor's operating range.
</div>
</div>

<div class="back-btn-wrap" style="margin-top:0.5rem;">
  <a href="/calculators/counts-estimation/" class="back-btn">← Back to Calculator</a>
</div>

</div>
