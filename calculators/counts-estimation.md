---
layout: single
title: "Camera Count Estimator"
permalink: /calculators/counts-estimation/
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
      <h4 class="input-section-title">1. Crystal & Energy Settings</h4>
      <div class="form-group">
        <label for="crystalSelect">Crystal Type</label>
        <select id="crystalSelect" style="width:100%; padding:0.3rem; font-size:0.85rem; border:1px solid #d1d5db; border-radius:4px; margin-bottom:0.5rem;">
          <option value="CsI">CsI</option>
          <option value="CsI(Na)">CsI(Na)</option>
          <option value="CsI(Tl)" selected>CsI(Tl)</option>
          <option value="LYSO(Ce)">LYSO(Ce)</option>
          <option value="NaI(Tl)">NaI(Tl)</option>
          <option value="YAG(Ce)">YAG(Ce)</option>
          <option value="PbF2">PbF2</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      <div class="form-group">
        <label for="density">Density of Crystal ($\text{g/cm}^3$)</label>
        <input type="number" id="density" value="5.4" min="0.0001" step="0.01" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="lightYield">Light Yield ($\text{photons/keV}$)</label>
        <input type="number" id="lightYield" value="54" min="0" step="1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="dEdxMass">Mass Stopping Power $dE/dx$ ($\text{MeV}\cdot\text{cm}^2/\text{g}$)</label>
        <input type="number" id="dEdxMass" value="1.628" min="0.0001" step="0.001" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="thicknessCm">Crystal Thickness ($\text{cm}$)</label>
        <input type="number" id="thicknessCm" value="5" min="0.0001" step="0.1" class="small-input" required>
      </div>

      <h4 class="input-section-title">2. Camera Specifications</h4>
      <div class="form-group">
        <label for="cameraSelect">Camera Model</label>
        <select id="cameraSelect" style="width:100%; padding:0.3rem; font-size:0.85rem; border:1px solid #d1d5db; border-radius:4px; margin-bottom:0.5rem;">
          <option value="Manta-G145B NIR">Manta-G145B NIR</option>
          <option value="Manta-033">Manta-033</option>
          <option value="Andor Ikon-L (936 BV)" selected>Andor Ikon-L (936 BV)</option>
          <option value="Andor Ikon-L (936 BEX2-DD )">Andor Ikon-L (936 BEX2-DD )</option>
          <option value="Andor Ikon-M (934 BV)">Andor Ikon-M (934 BV)</option>
          <option value="Andor Ikon-M (BEX2-DD)">Andor Ikon-M (BEX2-DD)</option>
          <option value="Andor Ikon-M SO (BN/BEN/BR-DD)">Andor Ikon-M SO (BN/BEN/BR-DD)</option>
          <option value="Andor Ikon-L SO (BN/BEN/BR-DD)">Andor Ikon-L SO (BN/BEN/BR-DD)</option>
          <option value="Basler acA2440-20gm">Basler acA2440-20gm</option>
          <option value="Basler acA1920-40gm">Basler acA1920-40gm</option>
          <option value="Custom">Custom</option>
        </select>
      </div>
      <div class="form-group">
        <label for="fwc">Full Well Capacity ($e^-$)</label>
        <input type="number" id="fwc" value="100000" min="1" step="1000" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="adcBits">ADC Resolution ($\text{bits}$)</label>
        <input type="number" id="adcBits" value="16" min="1" max="32" step="1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="qe">Quantum Efficiency ($\%$)</label>
        <input type="number" id="qe" value="95" min="0" max="100" step="1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="dynamicRange">Dynamic Range ($\text{dB}$) <small style="font-weight:normal; color:#6b7280;">(optional)</small></label>
        <input type="number" id="dynamicRange" min="0" step="0.1" class="small-input">
      </div>
      <div class="form-group">
        <label for="readNoise">Read Noise ($e^-$) <small style="font-weight:normal; color:#6b7280;">(optional)</small></label>
        <input type="number" id="readNoise" min="0" step="0.1" class="small-input">
      </div>

      <h4 class="input-section-title">3. Imaging System</h4>
      <div class="form-group">
        <label for="fNumber">Lens f-number ($f/\#$)</label>
        <input type="number" id="fNumber" value="1.6" min="0.1" step="0.1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="focalLength">Lens Focal Length ($\text{mm}$)</label>
        <input type="number" id="focalLength" value="25" min="0.1" step="1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="objectDist">Object Distance ($mm$)</label>
        <input type="number" id="objectDist" value="345" min="0.1" step="1" class="small-input" required>
      </div>
    </form>

    <div id="errorMessage" style="color: #ef4444; font-size: 0.8rem; margin-top: 1rem; font-weight: 600; display: none;"></div>
    <div class="explanation-link-container">
      <a href="/calculators/counts-estimation-explanation/" class="explanation-btn">View Equations & Explanation</a>
    </div>
  </div>

  <div class="calculator-results">
    <div class="results-group">
      <h3>1. General Metrics</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 44%;">Quantity</th>
             <th style="width: 56%; word-break: break-word;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Energy Deposited</strong></td>
            <td id="res-energyDeposited">-</td>
          </tr>
          <tr>
            <td><strong>Photons Generated</strong></td>
            <td id="res-photonsGenerated">-</td>
          </tr>
          <tr>
            <td><strong>Conversion Gain</strong></td>
            <td id="res-conversionGain">-</td>
          </tr>
          <tr id="row-impliedSaturation" style="display:none;">
            <td><strong>Implied Saturation</strong></td>
            <td id="res-impliedSaturation">-</td>
          </tr>
          <tr id="row-drReadNoise" style="display:none;">
            <td><strong>DR / Read Noise</strong></td>
            <td id="res-drReadNoise">-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="results-group">
      <h3>2. Isotropic Emission (unpolished/unwrapped crystal)</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 44%;">Quantity</th>
             <th style="width: 56%; word-break: break-word;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Collection Efficiency</strong></td>
            <td id="res-effIsotropic">-</td>
          </tr>
          <tr>
            <td><strong>Electrons Generated</strong></td>
            <td id="res-electronsIsotropic">-</td>
          </tr>
          <tr>
            <td><strong>ADC Counts</strong></td>
            <td id="res-adcIsotropic" class="font-highlight">-</td>
          </tr>
          <tr id="row-snrIsotropic" style="display:none;">
            <td><strong>Signal-to-Noise Ratio (SNR)</strong></td>
            <td id="res-snrIsotropic">-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="results-group">
      <h3>3. Lambertian Emission (polished/wrapped light-guide)</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 44%;">Quantity</th>
             <th style="width: 56%; word-break: break-word;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Collection Efficiency</strong></td>
            <td id="res-effLambertian">-</td>
          </tr>
          <tr>
            <td><strong>Electrons Generated</strong></td>
            <td id="res-electronsLambertian">-</td>
          </tr>
          <tr>
            <td><strong>ADC Counts</strong></td>
            <td id="res-adcLambertian" class="font-highlight">-</td>
          </tr>
          <tr id="row-snrLambertian" style="display:none;">
            <td><strong>Signal-to-Noise Ratio (SNR)</strong></td>
            <td id="res-snrLambertian">-</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<script>
const CRYSTALS = {
  'CsI': { lightYield: 2, density: 5.41 },
  'CsI(Na)': { lightYield: 41, density: 5.4 },
  'CsI(Tl)': { lightYield: 54, density: 5.4 },
  'LYSO(Ce)': { lightYield: 25, density: 7.1 },
  'NaI(Tl)': { lightYield: 55, density: 3.7 },
  'YAG(Ce)': { lightYield: 35, density: 4.5 },
  'PbF2': { lightYield: 0, density: 7.77 }
};

const CAMERAS = {
  'Manta-G145B NIR': { fwc: 17900, adcBits: 12, qe: 38, dynamicRange: 65.6, readNoise: 8.8 },
  'Manta-033': { fwc: 25949, adcBits: 12, qe: 38, dynamicRange: null, readNoise: null },
  'Andor Ikon-L (936 BV)': { fwc: 100000, adcBits: 16, qe: 95, dynamicRange: null, readNoise: null },
  'Andor Ikon-L (936 BEX2-DD )': { fwc: 150000, adcBits: 16, qe: 90, dynamicRange: null, readNoise: null },
  'Andor Ikon-M (934 BV)': { fwc: 100000, adcBits: 16, qe: 95, dynamicRange: null, readNoise: null },
  'Andor Ikon-M (BEX2-DD)': { fwc: 150000, adcBits: 16, qe: 90, dynamicRange: null, readNoise: null },
  'Andor Ikon-M SO (BN/BEN/BR-DD)': { fwc: 150000, adcBits: 16, qe: 90, dynamicRange: null, readNoise: null },
  'Andor Ikon-L SO (BN/BEN/BR-DD)': { fwc: 100000, adcBits: 16, qe: 90, dynamicRange: null, readNoise: null },
  'Basler acA2440-20gm': { fwc: 10400, adcBits: 12, qe: 68, dynamicRange: 73.3, readNoise: 2.3 },
  'Basler acA1920-40gm': { fwc: 31900, adcBits: 12, qe: 70, dynamicRange: 73.5, readNoise: 6.7 }
};

document.addEventListener("DOMContentLoaded", function() {
  const crystalSelect = document.getElementById('crystalSelect');
  const cameraSelect = document.getElementById('cameraSelect');

  const inputs = {
    crystalSelect: crystalSelect,
    cameraSelect: cameraSelect,
    density: document.getElementById('density'),
    lightYield: document.getElementById('lightYield'),
    dEdxMass: document.getElementById('dEdxMass'),
    thicknessCm: document.getElementById('thicknessCm'),
    fwc: document.getElementById('fwc'),
    adcBits: document.getElementById('adcBits'),
    qe: document.getElementById('qe'),
    dynamicRange: document.getElementById('dynamicRange'),
    readNoise: document.getElementById('readNoise'),
    fNumber: document.getElementById('fNumber'),
    focalLength: document.getElementById('focalLength'),
    objectDist: document.getElementById('objectDist')
  };

  const outputs = {
    energyDeposited: document.getElementById('res-energyDeposited'),
    photonsGenerated: document.getElementById('res-photonsGenerated'),
    conversionGain: document.getElementById('res-conversionGain'),
    impliedSaturation: document.getElementById('res-impliedSaturation'),
    drReadNoise: document.getElementById('res-drReadNoise'),
    effIsotropic: document.getElementById('res-effIsotropic'),
    electronsIsotropic: document.getElementById('res-electronsIsotropic'),
    adcIsotropic: document.getElementById('res-adcIsotropic'),
    snrIsotropic: document.getElementById('res-snrIsotropic'),
    effLambertian: document.getElementById('res-effLambertian'),
    electronsLambertian: document.getElementById('res-electronsLambertian'),
    adcLambertian: document.getElementById('res-adcLambertian'),
    snrLambertian: document.getElementById('res-snrLambertian')
  };

  const errorDiv = document.getElementById('errorMessage');

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }

  function hideError() {
    errorDiv.style.display = 'none';
  }

  function formatValue(value, decimals = 1) {
    if (value === undefined || value === null || isNaN(value)) return '-';
    return value.toFixed(decimals);
  }

  function formatScientific(value, decimals = 1) {
    if (value === undefined || value === null || isNaN(value)) return '-';
    return value.toExponential(decimals);
  }

  function formatInteger(value) {
    if (value === undefined || value === null || isNaN(value)) return '-';
    return Math.round(value).toLocaleString();
  }

  function updateCrystalFields() {
    const crystal = crystalSelect.value;
    if (crystal !== 'Custom') {
      inputs.density.value = CRYSTALS[crystal].density;
      inputs.lightYield.value = CRYSTALS[crystal].lightYield;
      inputs.density.disabled = true;
      inputs.lightYield.disabled = true;
    } else {
      inputs.density.disabled = false;
      inputs.lightYield.disabled = false;
    }
  }

  function updateCameraFields() {
    const camera = cameraSelect.value;
    if (camera !== 'Custom') {
      const data = CAMERAS[camera];
      inputs.fwc.value = data.fwc;
      inputs.adcBits.value = data.adcBits;
      inputs.qe.value = data.qe;
      inputs.dynamicRange.value = data.dynamicRange !== null ? data.dynamicRange : '';
      inputs.readNoise.value = data.readNoise !== null ? data.readNoise : '';
      
      inputs.fwc.disabled = true;
      inputs.adcBits.disabled = true;
      inputs.qe.disabled = true;
      inputs.dynamicRange.disabled = true;
      inputs.readNoise.disabled = true;
    } else {
      inputs.fwc.disabled = false;
      inputs.adcBits.disabled = false;
      inputs.qe.disabled = false;
      inputs.dynamicRange.disabled = false;
      inputs.readNoise.disabled = false;
    }
  }

  function calculate() {
    hideError();

    const dEdxMass = parseFloat(inputs.dEdxMass.value);
    const density = parseFloat(inputs.density.value);
    const thicknessCm = parseFloat(inputs.thicknessCm.value);
    const lightYield = parseFloat(inputs.lightYield.value);
    const fwc = parseFloat(inputs.fwc.value);
    const adcBits = parseInt(inputs.adcBits.value, 10);
    const qePercent = parseFloat(inputs.qe.value);
    const fNumber = parseFloat(inputs.fNumber.value);
    const focalLength = parseFloat(inputs.focalLength.value);
    const objectDist = parseFloat(inputs.objectDist.value);

    const dynamicRangeStr = inputs.dynamicRange.value.trim();
    const readNoiseStr = inputs.readNoise.value.trim();
    const dynamicRangeInput = dynamicRangeStr !== '' ? parseFloat(dynamicRangeStr) : null;
    const readNoiseInput = readNoiseStr !== '' ? parseFloat(readNoiseStr) : null;

    if (isNaN(dEdxMass) || dEdxMass <= 0 || isNaN(density) || density <= 0 || isNaN(thicknessCm) || thicknessCm <= 0 || isNaN(lightYield) || lightYield < 0) {
      return showError('Crystal settings must be positive numbers.');
    }
    if (isNaN(fwc) || fwc <= 0 || isNaN(adcBits) || adcBits < 1 || isNaN(qePercent) || qePercent < 0 || qePercent > 100) {
      return showError('Camera specs must be valid positive numbers.');
    }
    if (isNaN(fNumber) || fNumber <= 0 || isNaN(focalLength) || focalLength <= 0 || isNaN(objectDist) || objectDist <= 0) {
      return showError('Imaging system parameters must be positive numbers.');
    }
    if (objectDist <= focalLength) {
      return showError('Object distance must be strictly greater than focal length.');
    }

    const qe = qePercent / 100;
    const energyDepositedMev = dEdxMass * density * thicknessCm;
    const energyDepositedKev = energyDepositedMev * 1000;
    const photonsGenerated = energyDepositedKev * lightYield;

    const magnification = focalLength / (objectDist - focalLength);
    const inverseMagTerm = Math.pow(1 + (1 / magnification), 2);

    const etaIsotropic = 1 / (16 * Math.pow(fNumber, 2) * inverseMagTerm);
    const etaLambertian = 1 / (4 * Math.pow(fNumber, 2) * inverseMagTerm);

    const electronsIso = photonsGenerated * etaIsotropic * qe;
    const electronsLamb = photonsGenerated * etaLambertian * qe;

    const maxAdc = Math.pow(2, adcBits) - 1;
    const electronsPerAdc = fwc / maxAdc;

    const adcIso = Math.floor(electronsIso / electronsPerAdc);
    const adcLamb = Math.floor(electronsLamb / electronsPerAdc);

    let snrIso = null;
    let snrLamb = null;
    let impliedSaturation = null;

    if (readNoiseInput !== null && readNoiseInput > 0) {
      snrIso = electronsIso / readNoiseInput;
      snrLamb = electronsLamb / readNoiseInput;
    }
    if (dynamicRangeInput !== null && readNoiseInput !== null && readNoiseInput > 0) {
      impliedSaturation = readNoiseInput * Math.pow(10, dynamicRangeInput / 20.0);
    }

    // Output General Metrics
    outputs.energyDeposited.innerText = formatValue(energyDepositedMev, 1) + " MeV";
    outputs.photonsGenerated.innerText = formatScientific(photonsGenerated, 1) + " photons";
    outputs.conversionGain.innerText = formatValue(electronsPerAdc, 1) + " e⁻/DN";

    const rowImpliedSat = document.getElementById('row-impliedSaturation');
    const rowDrNoise = document.getElementById('row-drReadNoise');

    if (impliedSaturation !== null) {
      rowImpliedSat.style.display = '';
      rowDrNoise.style.display = '';
      outputs.impliedSaturation.innerText = formatInteger(impliedSaturation) + " e⁻";
      outputs.drReadNoise.innerText = formatValue(dynamicRangeInput, 1) + " dB / " + formatValue(readNoiseInput, 1) + " e⁻";
    } else {
      rowImpliedSat.style.display = 'none';
      rowDrNoise.style.display = 'none';
    }

    // Isotropic
    outputs.effIsotropic.innerText = formatScientific(etaIsotropic, 1);
    outputs.electronsIsotropic.innerText = formatValue(electronsIso, 1) + " e⁻";
    outputs.adcIsotropic.innerText = formatInteger(adcIso) + " counts";

    const rowSnrIso = document.getElementById('row-snrIsotropic');
    if (snrIso !== null) {
      rowSnrIso.style.display = '';
      const snrIsoDb = 20 * Math.log10(snrIso);
      outputs.snrIsotropic.innerText = formatValue(snrIso, 1) + " (" + formatValue(snrIsoDb, 1) + " dB)";
    } else {
      rowSnrIso.style.display = 'none';
    }

    // Lambertian
    outputs.effLambertian.innerText = formatScientific(etaLambertian, 1);
    outputs.electronsLambertian.innerText = formatValue(electronsLamb, 1) + " e⁻";
    outputs.adcLambertian.innerText = formatInteger(adcLamb) + " counts";

    const rowSnrLamb = document.getElementById('row-snrLambertian');
    if (snrLamb !== null) {
      rowSnrLamb.style.display = '';
      const snrLambDb = 20 * Math.log10(snrLamb);
      outputs.snrLambertian.innerText = formatValue(snrLamb, 1) + " (" + formatValue(snrLambDb, 1) + " dB)";
    } else {
      rowSnrLamb.style.display = 'none';
    }
  }

  // Event Listeners
  crystalSelect.addEventListener('change', () => {
    updateCrystalFields();
    calculate();
  });

  cameraSelect.addEventListener('change', () => {
    updateCameraFields();
    calculate();
  });

  const allFormInputs = [
    inputs.density, inputs.lightYield, inputs.dEdxMass, inputs.thicknessCm,
    inputs.fwc, inputs.adcBits, inputs.qe, inputs.dynamicRange, inputs.readNoise,
    inputs.fNumber, inputs.focalLength, inputs.objectDist
  ];

  allFormInputs.forEach(input => {
    input.addEventListener('input', calculate);
  });

  // Initial runs
  updateCrystalFields();
  updateCameraFields();
  calculate();
});
</script>
