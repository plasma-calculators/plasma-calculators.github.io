---
layout: single
title: "Laser Spot Size & Gaussian Beam Optics Calculator"
permalink: /calculators/laser-spot-size/
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

<div class="calculator-container compact-mode">
  <div class="calculator-sidebar">
    <h3>Input Parameters</h3>
    <form id="calculator-form">
      <h4 class="input-section-title">Focusing Optics Mode</h4>
      <div class="form-group radio-group" style="gap: 0.35rem; flex-direction: column;">
        <label class="radio-label" style="white-space: nowrap;">
          <input type="radio" name="optics-mode" value="fnumber" checked> F-number (<i>N</i>)
        </label>
        <label class="radio-label" style="white-space: nowrap;">
          <input type="radio" name="optics-mode" value="focal"> Focal Length (<i>f</i>)
        </label>
      </div>

      <div id="fnumber-group" class="form-group">
        <label for="f-number">Optics F-number ($N = f/D_{\text{in}}$)</label>
        <input type="number" id="f-number" value="20" min="0.1" step="0.1" class="small-input" required>
      </div>

      <div id="focal-group" class="form-group" style="display: none;">
        <label for="focal-length">Focal Length, $f$ (mm)</label>
        <input type="number" id="focal-length" value="2400" min="0.1" step="1" class="small-input" required>
      </div>

      <h4 class="input-section-title">Laser & Beam Profile</h4>
      <div class="form-group">
        <label for="beam-diameter">Input $1/e^2$ Diameter, $D_{\text{in}}$ (mm)</label>
        <input type="number" id="beam-diameter" value="120" min="0.001" step="0.1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="wavelength">Wavelength, $\lambda$ (nm)</label>
        <input type="number" id="wavelength" value="800" min="1" step="1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="m2-factor">Beam Quality, $M^2$</label>
        <input type="number" id="m2-factor" value="1.0" min="1.0" step="0.05" class="small-input" required>
      </div>

      <h4 class="input-section-title">Pulse Parameters (Optional)</h4>
      <div class="form-group" style="margin-bottom: 0.5rem;">
        <label class="radio-label" style="font-size: 0.78rem; font-weight: 600;">
          <input type="checkbox" id="enable-pulsed" checked style="width: auto; margin-right: 0.35rem;"> Include Energy & Peak Power
        </label>
      </div>

      <div id="pulsed-inputs" style="display: block;">
        <div class="form-group">
          <label for="pulse-energy">Pulse Energy, $E_L$ (J)</label>
          <input type="number" id="pulse-energy" value="2.5" min="0" step="0.01" class="small-input">
        </div>
        <div class="form-group">
          <label for="pulse-duration">Pulse Duration FWHM, $\tau$ (fs)</label>
          <input type="number" id="pulse-duration" value="25" min="0.1" step="1" class="small-input">
        </div>
        <div class="form-group">
          <label for="q-factor">Energy Fraction in Spot, q-factor</label>
          <input type="number" id="q-factor" value="0.35" min="0.01" max="1.0" step="0.05" class="small-input">
        </div>
      </div>
    </form>

    <div id="errorMessage" style="color: #ef4444; font-size: 0.8rem; margin-top: 1rem; font-weight: 600; display: none;"></div>

    <div class="explanation-link-container">
      <a href="/calculators/laser-spot-size-explanation/" class="explanation-btn">View Equations & Explanation</a>
    </div>
  </div>

  <div class="calculator-results">
    <!-- Results Table 1: Focused Spot Geometry -->
    <div class="results-group">
      <h3>1. Focused Spot Geometry & Rayleigh Range</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 55%;">Parameter</th>
            <th style="width: 45%;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Focus Spot Diameter ($1/e^2$, $d_{1/e^2}$)</strong></td>
            <td id="res-d1e2" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Focus Spot Radius ($1/e^2$, $w_0$)</strong></td>
            <td id="res-w0">-</td>
          </tr>
          <tr>
            <td><strong>FWHM Spot Diameter ($d_{\text{FWHM}}$)</strong></td>
            <td id="res-dfwhm" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>RMS Spot Diameter ($d_{\text{RMS}}$)</strong></td>
            <td id="res-drms">-</td>
          </tr>
          <tr>
            <td><strong>Rayleigh Range ($z_R$)</strong></td>
            <td id="res-zr" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Confocal Parameter / Depth of Focus ($2 z_R$)</strong></td>
            <td id="res-dof">-</td>
          </tr>
          <tr>
            <td><strong>Optics F-number ($N$)</strong></td>
            <td id="res-fnumber">-</td>
          </tr>
          <tr>
            <td><strong>Focal Length ($f$)</strong></td>
            <td id="res-focal">-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Results Table 2: Pulsed Peak Power & Intensity (Conditional) -->
    <div id="pulsed-results-group" class="results-group" style="display: block;">
      <h3>2. Peak Power, Intensity & $a_0$ at Focus</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 40%;">Parameter</th>
            <th style="width: 30%;">Gaussian Pulse</th>
            <th style="width: 30%;">Top-Hat Pulse</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Energy Fraction ($q$-factor)</strong></td>
            <td id="res-qfactor-gauss">-</td>
            <td id="res-qfactor-tophat">-</td>
          </tr>
          <tr>
            <td><strong>Peak Power ($P_{\text{peak}}$)</strong></td>
            <td id="res-power-gauss" class="font-highlight">-</td>
            <td id="res-power-tophat" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Peak Intensity ($I_0$)</strong></td>
            <td id="res-intensity-gauss" class="font-highlight">-</td>
            <td id="res-intensity-tophat" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Normalized Vector Potential ($a_0$)</strong></td>
            <td id="res-a0-gauss" class="font-highlight">-</td>
            <td id="res-a0-tophat" class="font-highlight">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("calculator-form");
  const errorMessage = document.getElementById("errorMessage");

  const radioFnumber = document.querySelector('input[name="optics-mode"][value="fnumber"]');
  const radioFocal = document.querySelector('input[name="optics-mode"][value="focal"]');
  const fnumberGroup = document.getElementById("fnumber-group");
  const focalGroup = document.getElementById("focal-group");

  const inputFnumber = document.getElementById("f-number");
  const inputFocal = document.getElementById("focal-length");
  const inputDin = document.getElementById("beam-diameter");
  const inputWavelength = document.getElementById("wavelength");
  const inputM2 = document.getElementById("m2-factor");

  const enablePulsed = document.getElementById("enable-pulsed");
  const pulsedInputs = document.getElementById("pulsed-inputs");
  const pulsedResultsGroup = document.getElementById("pulsed-results-group");
  const inputEnergy = document.getElementById("pulse-energy");
  const inputDuration = document.getElementById("pulse-duration");
  const inputQFactor = document.getElementById("q-factor");

  const resD1e2 = document.getElementById("res-d1e2");
  const resW0 = document.getElementById("res-w0");
  const resDfwhm = document.getElementById("res-dfwhm");
  const resDrms = document.getElementById("res-drms");
  const resZr = document.getElementById("res-zr");
  const resDof = document.getElementById("res-dof");
  const resFnumber = document.getElementById("res-fnumber");
  const resFocal = document.getElementById("res-focal");

  const resQfactorGauss = document.getElementById("res-qfactor-gauss");
  const resQfactorTophat = document.getElementById("res-qfactor-tophat");
  const resPowerGauss = document.getElementById("res-power-gauss");
  const resPowerTophat = document.getElementById("res-power-tophat");
  const resIntensityGauss = document.getElementById("res-intensity-gauss");
  const resIntensityTophat = document.getElementById("res-intensity-tophat");
  const resA0Gauss = document.getElementById("res-a0-gauss");
  const resA0Tophat = document.getElementById("res-a0-tophat");

  function toggleOpticsMode() {
    if (radioFnumber.checked) {
      fnumberGroup.style.display = "block";
      focalGroup.style.display = "none";
    } else {
      fnumberGroup.style.display = "none";
      focalGroup.style.display = "block";
    }
    calculate();
  }

  function togglePulsedMode() {
    if (enablePulsed.checked) {
      pulsedInputs.style.display = "block";
      pulsedResultsGroup.style.display = "block";
    } else {
      pulsedInputs.style.display = "none";
      pulsedResultsGroup.style.display = "none";
    }
    calculate();
  }

  radioFnumber.addEventListener("change", toggleOpticsMode);
  radioFocal.addEventListener("change", toggleOpticsMode);
  enablePulsed.addEventListener("change", togglePulsedMode);

  form.addEventListener("input", calculate);

  function calculate() {
    errorMessage.style.display = "none";
    errorMessage.innerText = "";

    const Din_mm = parseFloat(inputDin.value);
    const lambda_nm = parseFloat(inputWavelength.value);
    const M2 = parseFloat(inputM2.value);

    if (isNaN(Din_mm) || Din_mm <= 0 || isNaN(lambda_nm) || lambda_nm <= 0 || isNaN(M2) || M2 < 1.0) {
      showError("Please enter valid positive values for Din, wavelength, and M² (≥ 1.0).");
      return;
    }

    let N = 0;
    let f_mm = 0;

    if (radioFnumber.checked) {
      N = parseFloat(inputFnumber.value);
      if (isNaN(N) || N <= 0) {
        showError("Please enter a valid F-number (> 0).");
        return;
      }
      f_mm = N * Din_mm;
    } else {
      f_mm = parseFloat(inputFocal.value);
      if (isNaN(f_mm) || f_mm <= 0) {
        showError("Please enter a valid Focal Length (> 0).");
        return;
      }
      N = f_mm / Din_mm;
    }

    const lambda_m = lambda_nm * 1e-9;
    const Din_m = Din_mm * 1e-3;
    const f_m = f_mm * 1e-3;

    // Focused spot diameter at 1/e^2 intensity: d_1e2 = 4 * lambda * f * M^2 / (pi * Din) = 4 * lambda * N * M^2 / pi
    const d1e2_m = (4 * lambda_m * N * M2) / Math.PI;
    const d1e2_um = d1e2_m * 1e6;
    const w0_um = d1e2_um / 2;

    // FWHM diameter for Gaussian profile: d_FWHM = d_1e2 * sqrt(ln(2)/2)
    const dfwhm_um = d1e2_um * Math.sqrt(Math.LN2 / 2);

    // RMS diameter for Gaussian profile: d_RMS = w0 = d_1e2 / 2
    const drms_um = w0_um;

    // Rayleigh Range: zR = pi * w0^2 / (lambda * M^2) = 4 * lambda * N^2 * M^2 / pi
    const zR_m = (4 * lambda_m * N * N * M2) / Math.PI;
    const zR_um = zR_m * 1e6;

    // Update Results
    resD1e2.innerText = `${d1e2_um.toFixed(2)} μm`;
    resW0.innerText = `${w0_um.toFixed(2)} μm`;
    resDfwhm.innerText = `${dfwhm_um.toFixed(2)} μm`;
    resDrms.innerText = `${drms_um.toFixed(2)} μm`;
    resZr.innerText = `${zR_um.toFixed(1)} μm`;
    resDof.innerText = `${(2 * zR_um).toFixed(1)} μm`;

    resFnumber.innerText = N.toFixed(2);
    resFocal.innerText = `${f_mm.toFixed(1)} mm`;

    // Pulsed Laser Parameters
    if (enablePulsed.checked) {
      const energy_J = parseFloat(inputEnergy.value);
      const duration_fs = parseFloat(inputDuration.value);
      const q = parseFloat(inputQFactor.value);

      if (isNaN(energy_J) || energy_J <= 0 || isNaN(duration_fs) || duration_fs <= 0 || isNaN(q) || q <= 0) {
        showError("Please enter valid positive values for pulse energy, duration, and q-factor (> 0).");
        return;
      }

      resQfactorGauss.innerText = q.toFixed(2);
      resQfactorTophat.innerText = q.toFixed(2);

      // Peak Power P_gauss = (energy_J / duration_fs) / sqrt(pi) * 2 * ln(2) * 1000 * q
      const P_gauss_TW = (energy_J / duration_fs) / Math.sqrt(Math.PI) * 2 * Math.LN2 * 1000 * q;
      const P_tophat_TW = (energy_J / duration_fs) * 1000 * q;

      resPowerGauss.innerText = `${P_gauss_TW.toFixed(2)} TW`;
      resPowerTophat.innerText = `${P_tophat_TW.toFixed(2)} TW`;

      // Peak Intensity I_0 (10^18 W/cm^2) = 2 * P_TW / (pi * w0_um^2) * 100
      const spotsize = Math.PI * w0_um * w0_um; // um^2
      const I0_gauss_1e18 = (2 * P_gauss_TW / spotsize) * 100;
      const I0_tophat_1e18 = (2 * P_tophat_TW / spotsize) * 100;

      if (I0_gauss_1e18 >= 0.01) {
        resIntensityGauss.innerText = `${I0_gauss_1e18.toFixed(2)} × 10¹⁸ W/cm²`;
      } else {
        resIntensityGauss.innerText = `${(I0_gauss_1e18 * 1e18).toExponential(2)} W/cm²`;
      }

      if (I0_tophat_1e18 >= 0.01) {
        resIntensityTophat.innerText = `${I0_tophat_1e18.toFixed(2)} × 10¹⁸ W/cm²`;
      } else {
        resIntensityTophat.innerText = `${(I0_tophat_1e18 * 1e18).toExponential(2)} W/cm²`;
      }

      // Normalized vector potential: a0_gauss = 0.86 * lambda_um * sqrt(I0_gauss), a0_tophat = 0.85 * lambda_um * sqrt(I0_tophat)
      const lambda_um = lambda_nm / 1000;
      const a0_gauss = 0.86 * lambda_um * Math.sqrt(I0_gauss_1e18);
      const a0_tophat = 0.85 * lambda_um * Math.sqrt(I0_tophat_1e18);

      resA0Gauss.innerText = a0_gauss.toFixed(2);
      resA0Tophat.innerText = a0_tophat.toFixed(2);
    }
  }

  function showError(msg) {
    errorMessage.innerText = msg;
    errorMessage.style.display = "block";
  }

  // Initial calculation
  calculate();
});
</script>
