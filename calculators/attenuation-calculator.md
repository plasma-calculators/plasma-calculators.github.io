---
layout: single
title: "Photon Attenuation Calculator"
permalink: /calculators/attenuation-calculator/
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
      <h4 class="input-section-title">Material & Geometry</h4>
      <div class="form-group">
        <label for="material">Target Material</label>
        <select id="material" style="width:100%; padding:0.3rem; font-size:0.85rem; border:1px solid #d1d5db; border-radius:4px; margin-bottom:0.5rem;">
          <option value="al">Al (Aluminum)</option>
          <option value="be">Be (Beryllium)</option>
          <option value="c">C (Carbon)</option>
          <option value="csi">CsI</option>
          <option value="cu">Cu (Copper)</option>
          <option value="ga">Ga (Gallium)</option>
          <option value="ge">Ge (Germanium)</option>
          <option value="kapton">Kapton (Polyamid)</option>
          <option value="lanex">Lanex (Gadolinium)</option>
          <option value="mylar">Mylar</option>
          <option value="o">O (Oxygen)</option>
          <option value="pb">Pb (Lead)</option>
          <option value="polyethylene">Polyethylene</option>
          <option value="teflon">Teflon</option>
          <option value="ti">Ti (Titanium)</option>
          <option value="w">W (Tungsten)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="length">Material Length (mm)</label>
        <input type="number" id="length" value="10" min="0.001" step="0.1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="energy">Photon Energy (keV)</label>
        <input type="number" id="energy" value="1000" min="1" step="1" class="small-input" required>
      </div>
    </form>
    <div id="errorMessage" style="color: #ef4444; font-size: 0.8rem; margin-top: 1rem; font-weight: 600; display: none;"></div>
    <div class="explanation-link-container">
      <a href="/calculators/attenuation-explanation/" class="explanation-btn">View Equations & Explanation</a>
    </div>
  </div>

  <div class="calculator-results">
    <div class="results-group">
      <h3>1. Attenuation & Transmission</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 44%;">Quantity</th>
            <th style="width: 56%;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Selected Material</strong></td>
            <td id="res-materialName">-</td>
          </tr>
          <tr>
            <td><strong>Photon Energy</strong></td>
            <td id="res-energyVal">-</td>
          </tr>
          <tr>
            <td><strong>Attenuation</strong></td>
            <td id="res-attenuationValue" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Transmission</strong></td>
            <td id="res-transmissionValue" class="font-highlight">-</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="results-group">
      <h3>2. Interaction Probability</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 44%;">Quantity</th>
            <th style="width: 56%;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Rayleigh (Coherent)</strong></td>
            <td id="res-rayleighProb">-</td>
          </tr>
          <tr>
            <td><strong>Compton (Incoherent)</strong></td>
            <td id="res-comptonProb">-</td>
          </tr>
          <tr>
            <td><strong>Photoelectric Effect</strong></td>
            <td id="res-photoelectricProb">-</td>
          </tr>
          <tr>
            <td><strong>Nuclear Pair Production</strong></td>
            <td id="res-nuclearProb">-</td>
          </tr>
          <tr>
            <td><strong>Electron Pair Production</strong></td>
            <td id="res-electronProb">-</td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<script>
const DENSITIES = {
  'al': 2.699,
  'pb': 11.35,
  'cu': 8.96,
  'c': 2.267,
  'ti': 4.506,
  'w': 19.30,
  'be': 1.85,
  'ge': 5.323,
  'ga': 5.91,
  'o': 0.001429,
  'csi': 4.51,
  'lanex': 7.32,
  'teflon': 2.20,
  'mylar': 1.40,
  'polyethylene': 0.94,
  'kapton': 1.42
};

const DISPLAY_NAMES = {
  'csi': 'CsI',
  'lanex': 'Lanex (Gadolinium)',
  'teflon': 'Teflon',
  'mylar': 'Mylar',
  'polyethylene': 'Polyethylene',
  'kapton': 'Kapton (Polyamid)',
  'pb': 'Pb (Lead)',
  'cu': 'Cu (Copper)',
  'al': 'Al (Aluminum)',
  'w': 'W (Tungsten)',
  'ti': 'Ti (Titanium)',
  'be': 'Be (Beryllium)',
  'ge': 'Ge (Germanium)',
  'ga': 'Ga (Gallium)',
  'o': 'O (Oxygen)',
  'c': 'C (Carbon)'
};

let materialsData = {};

document.addEventListener("DOMContentLoaded", function() {
  const materialSelect = document.getElementById('material');
  const lengthInput = document.getElementById('length');
  const energyInput = document.getElementById('energy');
  const errorDiv = document.getElementById('errorMessage');

  const outputs = {
    materialName: document.getElementById('res-materialName'),
    energyVal: document.getElementById('res-energyVal'),
    attenuation: document.getElementById('res-attenuationValue'),
    transmission: document.getElementById('res-transmissionValue'),
    rayleigh: document.getElementById('res-rayleighProb'),
    compton: document.getElementById('res-comptonProb'),
    photoelectric: document.getElementById('res-photoelectricProb'),
    nuclear: document.getElementById('res-nuclearProb'),
    electron: document.getElementById('res-electronProb')
  };

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }

  function hideError() {
    errorDiv.style.display = 'none';
  }

  function formatPercent(value) {
    if (value === undefined || value === null || isNaN(value)) return '-';
    return (value * 100).toFixed(1) + '%';
  }

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const data = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(/\s+/);
      if (parts.length < 8) continue;
      try {
        const entry = {
          energy: parseFloat(parts[0]),
          coherent: parseFloat(parts[1]),
          incoherent: parseFloat(parts[2]),
          photoelectric: parseFloat(parts[3]),
          nuclear: parseFloat(parts[4]),
          electron: parseFloat(parts[5]),
          total: parseFloat(parts[6]),
          totalNoCoherent: parseFloat(parts[7])
        };
        data.push(entry);
      } catch (e) {
        console.warn('Parse error on line', i, e);
      }
    }
    return data.sort((a, b) => a.energy - b.energy);
  }

  async function loadMaterialData(material) {
    if (materialsData[material]) return;
    try {
      const response = await fetch(`/attenuation/nist-xcom-data/${material}.csv`);
      if (!response.ok) {
        throw new Error(`Failed to load ${material}.csv`);
      }
      const text = await response.text();
      materialsData[material] = parseCSV(text);
    } catch (error) {
      console.error(`Error loading material ${material}:`, error);
      showError(`Error loading dataset for ${material}.`);
    }
  }

  function interpolate(data, targetEnergy) {
    if (targetEnergy <= data[0].energy) {
      return { ...data[0] };
    }
    if (targetEnergy >= data[data.length - 1].energy) {
      return { ...data[data.length - 1] };
    }
    
    const logInterp = (x, x1, x2, y1, y2) => {
      if (y1 <= 0 || y2 <= 0) {
        const ratio = (x - x1) / (x2 - x1);
        return y1 + ratio * (y2 - y1);
      }
      const logX = Math.log(x);
      const logX1 = Math.log(x1);
      const logX2 = Math.log(x2);
      const logY1 = Math.log(y1);
      const logY2 = Math.log(y2);
      const logY = logY1 + (logX - logX1) * (logY2 - logY1) / (logX2 - logX1);
      return Math.exp(logY);
    };
    
    for (let i = 0; i < data.length - 1; i++) {
      if (targetEnergy >= data[i].energy && targetEnergy <= data[i + 1].energy) {
        const x = targetEnergy;
        const x1 = data[i].energy;
        const x2 = data[i + 1].energy;
        return {
          energy: targetEnergy,
          coherent: logInterp(x, x1, x2, data[i].coherent, data[i + 1].coherent),
          incoherent: logInterp(x, x1, x2, data[i].incoherent, data[i + 1].incoherent),
          photoelectric: logInterp(x, x1, x2, data[i].photoelectric, data[i + 1].photoelectric),
          nuclear: logInterp(x, x1, x2, data[i].nuclear, data[i + 1].nuclear),
          electron: logInterp(x, x1, x2, data[i].electron, data[i + 1].electron),
          total: logInterp(x, x1, x2, data[i].total, data[i + 1].total),
          totalNoCoherent: logInterp(x, x1, x2, data[i].totalNoCoherent, data[i + 1].totalNoCoherent)
        };
      }
    }
    return { ...data[Math.floor(data.length / 2)] };
  }

  async function update() {
    hideError();
    const material = materialSelect.value;
    const lengthMm = parseFloat(lengthInput.value);
    const energyKeV = parseFloat(energyInput.value);

    if (isNaN(lengthMm) || lengthMm <= 0 || isNaN(energyKeV) || energyKeV <= 0) {
      return;
    }

    await loadMaterialData(material);
    const data = materialsData[material];
    if (!data) return;

    const density = DENSITIES[material] || 2.7;
    const energyMeV = energyKeV / 1000;
    const lengthCm = lengthMm * 0.1;

    const interpolated = interpolate(data, energyMeV);
    const sigmaTotal = interpolated.total;
    const muTotal = sigmaTotal * density;

    const transmission = Math.exp(-muTotal * lengthCm);
    const attenuation = 1 - transmission;
    const pInteract = attenuation;

    const probRayleigh = (interpolated.coherent / sigmaTotal) * pInteract;
    const probCompton = (interpolated.incoherent / sigmaTotal) * pInteract;
    const probPhotoelectric = (interpolated.photoelectric / sigmaTotal) * pInteract;
    const probNuclear = (interpolated.nuclear / sigmaTotal) * pInteract;
    const probElectron = (interpolated.electron / sigmaTotal) * pInteract;

    outputs.materialName.innerText = DISPLAY_NAMES[material] || material;
    outputs.energyVal.innerText = energyKeV.toFixed(1) + " keV";
    outputs.attenuation.innerText = formatPercent(attenuation);
    outputs.transmission.innerText = formatPercent(transmission);
    outputs.rayleigh.innerText = formatPercent(probRayleigh);
    outputs.compton.innerText = formatPercent(probCompton);
    outputs.photoelectric.innerText = formatPercent(probPhotoelectric);
    outputs.nuclear.innerText = formatPercent(probNuclear);
    outputs.electron.innerText = formatPercent(probElectron);
  }

  materialSelect.addEventListener('change', update);
  lengthInput.addEventListener('input', update);
  energyInput.addEventListener('input', update);

  update();
});
</script>
