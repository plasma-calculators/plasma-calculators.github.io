---
layout: single
title: "Ultrafast Pulse Propagation & Dispersion Calculator"
permalink: /calculators/dispersion/
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
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<div class="calculator-container compact-mode">
  <div class="calculator-sidebar">
    <h3>Input Parameters</h3>
    <form id="calculator-form">
      <h4 class="input-section-title">Material & Medium</h4>
      <div class="form-group">
        <label for="material-select">Target Material</label>
        <select id="material-select" style="width:100%; padding:0.3rem; font-size:0.85rem; border:1px solid #d1d5db; border-radius:4px;">
          <!-- Populated dynamically -->
        </select>
      </div>
      <div class="form-group">
        <label for="thickness">Material Thickness, $L$ (mm)</label>
        <input type="number" id="thickness" value="10" min="0.001" step="0.1" class="small-input" required>
      </div>

      <h4 class="input-section-title">Laser Pulse Parameters</h4>
      <div class="form-group">
        <label for="wavelength">Central Wavelength, $\lambda_0$ (nm)</label>
        <input type="number" id="wavelength" value="800" min="150" max="25000" step="1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="pulse-duration">Input Pulse Duration FWHM (fs)</label>
        <input type="number" id="pulse-duration" value="30" min="1" step="1" class="small-input" required>
      </div>

      <h4 class="input-section-title">User Phase Compensation</h4>
      <div class="form-group">
        <label for="gdd-comp">Compensation GDD ($\text{fs}^2$)</label>
        <input type="number" id="gdd-comp" value="0" step="10" class="small-input">
      </div>
      <div class="form-group">
        <label for="tod-comp">Compensation TOD ($\text{fs}^3$)</label>
        <input type="number" id="tod-comp" value="0" step="100" class="small-input">
      </div>


    </form>

    <div id="errorMessage" style="color: #ef4444; font-size: 0.8rem; margin-top: 1rem; font-weight: 600; display: none;"></div>

    <div class="explanation-link-container">
      <a href="/calculators/dispersion-explanation/" class="explanation-btn">View Equations & Explanation</a>
    </div>
  </div>

  <div class="calculator-results">
    <!-- Results Table Card 1 -->
    <div class="results-group">
      <h3>Refractive Index & Dispersion Parameters</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 55%;">Parameter</th>
            <th style="width: 45%;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Refractive Index $n$</strong></td>
            <td id="res-n">-</td>
          </tr>
          <tr>
            <td><strong>Group Index $n_g$</strong></td>
            <td id="res-ng">-</td>
          </tr>
          <tr>
            <td><strong>GVD (Group Velocity Dispersion)</strong></td>
            <td id="res-gvd">-</td>
          </tr>
          <tr>
            <td><strong>GDD (Group Delay Dispersion)</strong></td>
            <td id="res-gdd" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>TOD (Third-Order Dispersion)</strong></td>
            <td id="res-tod">-</td>
          </tr>

        </tbody>
      </table>
    </div>

    <!-- Results Table Card 2 -->
    <div class="results-group">
      <h3>Temporal Pulse Metrics</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 55%;">Quantity</th>
            <th style="width: 45%;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Input Pulse Width (FWHM)</strong></td>
            <td id="res-tau-in">-</td>
          </tr>
          <tr>
            <td><strong>Dispersed Output Width (GDD analytic, FWHM)</strong></td>
            <td id="res-tau-analytic">-</td>
          </tr>
          <tr>
            <td><strong>Dispersed Output Width (FFT full, FWHM)</strong></td>
            <td id="res-tau-disp" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Compensated Output Width (FFT full, FWHM)</strong></td>
            <td id="res-tau-comp">-</td>
          </tr>

        </tbody>
      </table>
    </div>

      <div class="figure-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-top: 1rem;">
        <div class="chart-card" style="border: 1px solid #e5e7eb; padding: 0.5rem; border-radius: 6px; aspect-ratio: 1 / 1; display: flex; flex-direction: column;">
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.78rem; color: #374151; text-align: center;">Refractive &amp; Group Index</h4>
          <div style="flex: 1; position: relative; min-height: 0;"><canvas id="chart-index-dual"></canvas></div>
        </div>

        <div class="chart-card" style="border: 1px solid #e5e7eb; padding: 0.5rem; border-radius: 6px; aspect-ratio: 1 / 1; display: flex; flex-direction: column;">
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.78rem; color: #374151; text-align: center;">GVD &amp; TOD</h4>
          <div style="flex: 1; position: relative; min-height: 0;"><canvas id="chart-dispersion-dual"></canvas></div>
        </div>



        <div class="chart-card" style="border: 1px solid #e5e7eb; padding: 0.5rem; border-radius: 6px; aspect-ratio: 1 / 1; display: flex; flex-direction: column;">
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.78rem; color: #374151; text-align: center;">Output vs Input Duration</h4>
          <div style="flex: 1; position: relative; min-height: 0;"><canvas id="chart-tau-out"></canvas></div>
        </div>

        <div class="chart-card" style="border: 1px solid #e5e7eb; padding: 0.5rem; border-radius: 6px; aspect-ratio: 1 / 1; display: flex; flex-direction: column;">
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.78rem; color: #374151; text-align: center;">Pulse Intensity $I(t)$</h4>
          <div style="flex: 1; position: relative; min-height: 0;"><canvas id="chart-time-pulse"></canvas></div>
        </div>

        <div class="chart-card" style="border: 1px solid #e5e7eb; padding: 0.5rem; border-radius: 6px; aspect-ratio: 1 / 1; display: flex; flex-direction: column;">
          <h4 style="margin: 0 0 0.35rem 0; font-size: 0.78rem; color: #374151; text-align: center;">Spectrum &amp; Spectral Phase (Normalized)</h4>
          <div style="flex: 1; position: relative; min-height: 0;"><canvas id="chart-spectral-phase"></canvas></div>
        </div>
      </div>
    </div>
  </div>

<script src="/assets/js/dispersion-engine.js"></script>

<script>
let materialsData = {};
let charts = {};

document.addEventListener("DOMContentLoaded", async function() {
  const matSelect = document.getElementById('material-select');
  const thickInput = document.getElementById('thickness');
  const waveInput = document.getElementById('wavelength');
  const pulseInput = document.getElementById('pulse-duration');

  const gddCompInput = document.getElementById('gdd-comp');
  const todCompInput = document.getElementById('tod-comp');

  const errorDiv = document.getElementById('errorMessage');

  const outputs = {
    n: document.getElementById('res-n'),
    ng: document.getElementById('res-ng'),
    gvd: document.getElementById('res-gvd'),
    gdd: document.getElementById('res-gdd'),
    tod: document.getElementById('res-tod'),
    tauIn: document.getElementById('res-tau-in'),
    tauAnalytic: document.getElementById('res-tau-analytic'),
    tauDisp: document.getElementById('res-tau-disp'),
    tauComp: document.getElementById('res-tau-comp')
  };

  // Load Materials JSON
  try {
    const resp = await fetch('/assets/data/materials.json');
    materialsData = await resp.json();
    
    // Group by category
    const categories = {};
    for (const key in materialsData) {
      const cat = materialsData[key].category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push({ key, name: materialsData[key].name });
    }

    matSelect.innerHTML = '';
    for (const cat in categories) {
      const optGroup = document.createElement('optgroup');
      optGroup.label = cat;
      categories[cat].forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.key;
        opt.textContent = item.name;
        if (item.key === 'Fused_Silica') opt.selected = true;
        optGroup.appendChild(opt);
      });
      matSelect.appendChild(optGroup);
    }
  } catch (err) {
    console.error('Failed to load materials.json', err);
  }

  function createChart(ctxId, label, xLabel, yLabel, color = '#2563eb') {
    const ctx = document.getElementById(ctxId).getContext('2d');
    return new Chart(ctx, {
      type: 'line',
      data: { datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: true, labels: { font: { size: 11 } } },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: xLabel, font: { size: 11 } },
            ticks: { font: { size: 10 } }
          },
          y: {
            title: { display: true, text: yLabel, font: { size: 11 } },
            ticks: { font: { size: 10 } }
          }
        }
      }
    });
  }

  // Initialize Dual Y-Axis Chart for n and ng
  const ctxIndex = document.getElementById('chart-index-dual').getContext('2d');
  charts['index_dual'] = new Chart(ctxIndex, {
    type: 'line',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: true, labels: { font: { size: 11 } } } },
      scales: {
        x: {
          type: 'linear',
          min: 500,
          max: 1100,
          title: { display: true, text: 'Wavelength (nm)', font: { size: 11 } },
          ticks: {
            font: { size: 10 },
            stepSize: 100,
            callback: function(value) { return value.toLocaleString(); }
          }
        },
        y: { type: 'linear', position: 'left', title: { display: true, text: 'n (Refractive Index)', font: { size: 11 } }, ticks: { font: { size: 10 } } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: 'n_g (Group Index)', font: { size: 11 } }, ticks: { font: { size: 10 } }, grid: { drawOnChartArea: false } }
      }
    }
  });

  // Initialize Dual Y-Axis Chart for GVD and TOD
  const ctxDisp = document.getElementById('chart-dispersion-dual').getContext('2d');
  charts['dispersion_dual'] = new Chart(ctxDisp, {
    type: 'line',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: true, labels: { font: { size: 11 } } } },
      scales: {
        x: {
          type: 'linear',
          min: 500,
          max: 1100,
          title: { display: true, text: 'Wavelength (nm)', font: { size: 11 } },
          ticks: {
            font: { size: 10 },
            stepSize: 100,
            callback: function(value) { return value.toLocaleString(); }
          }
        },
        y: { type: 'linear', position: 'left', title: { display: true, text: 'GVD (fs²/mm)', font: { size: 11 } }, ticks: { font: { size: 10 } } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: 'TOD (fs³/mm)', font: { size: 11 } }, ticks: { font: { size: 10 } }, grid: { drawOnChartArea: false } }
      }
    }
  });


  charts['tau_out'] = createChart('chart-tau-out', 'Output Duration', 'Input Tau₀ (fs)', 'Output τ (fs)', '#059669');
  charts['time_pulse'] = createChart('chart-time-pulse', 'Pulse Profiles', 'Time (fs)', 'Norm. Intensity', '#2563eb');

  // Initialize dual-axis Spectrum + Phase chart
  const ctxSpec = document.getElementById('chart-spectral-phase').getContext('2d');
  charts['spectral_phase'] = new Chart(ctxSpec, {
    type: 'line',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { display: true, labels: { font: { size: 11 } } } },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Wavelength (nm)', font: { size: 11 } },
          ticks: { font: { size: 10 } }
        },
        y:  { type: 'linear', position: 'left',  title: { display: true, text: 'Norm. Spectrum', font: { size: 11 } }, min: 0, max: 1.05, ticks: { font: { size: 10 } } },
        y1: { type: 'linear', position: 'right', title: { display: true, text: 'Phase (rad)',    font: { size: 11 } }, ticks: { font: { size: 10 } }, grid: { drawOnChartArea: false } }
      }
    }
  });

  function update() {
    errorDiv.style.display = 'none';
    const matKey = matSelect.value;
    const mat = materialsData[matKey];
    if (!mat) return;

    const L_mm = parseFloat(thickInput.value);
    const lam0_nm = parseFloat(waveInput.value);
    const tau0_fs = parseFloat(pulseInput.value);

    const gdd_comp = parseFloat(gddCompInput.value) || 0;
    const tod_comp = parseFloat(todCompInput.value) || 0;

    if (isNaN(L_mm) || L_mm <= 0 || isNaN(lam0_nm) || lam0_nm <= 0 || isNaN(tau0_fs) || tau0_fs <= 0) {
      errorDiv.textContent = 'Please enter valid positive numbers for thickness, wavelength, and pulse duration.';
      errorDiv.style.display = 'block';
      return;
    }

    // 1. Dispersion Properties at lam0_nm
    const props = DispersionEngine.computeDispersionProperties(mat, lam0_nm, L_mm);
    const analyticTau = DispersionEngine.computeAnalyticalBroadening(tau0_fs, props.gdd);

    outputs.n.innerText = props.n.toFixed(4);
    outputs.ng.innerText = props.ng.toFixed(4);
    outputs.gvd.innerText = props.gvd.toFixed(1) + " fs²/mm";
    outputs.gdd.innerText = props.gdd.toFixed(1) + " fs²";
    outputs.tod.innerText = props.tod.toFixed(1) + " fs³/mm";

    // 2. FFT Simulation
    const sim = DispersionEngine.simulatePulsePropagation({
      tau0_fs,
      lambda0_nm: lam0_nm,
      thickness_mm: L_mm,
      mat,
      gdd_comp,
      tod_comp
    });

    outputs.tauIn.innerText = sim.tau_in_fwhm.toFixed(1) + " fs";
    outputs.tauAnalytic.innerText = analyticTau.toFixed(1) + " fs";
    outputs.tauDisp.innerText = sim.tau_disp_fwhm.toFixed(1) + " fs";
    outputs.tauComp.innerText = sim.tau_comp_fwhm.toFixed(1) + " fs";

    // 3. Update Plots (Locked to 500-1100 nm, 250 points)
    const minWl = 500;
    const maxWl = 1100;
    const steps = 250;
    const dwl = (maxWl - minWl) / steps;

    const dataN = [], dataNg = [], dataGvd = [], dataTod = [];

    for (let i = 0; i <= steps; i++) {
      const wl = minWl + i * dwl;
      const p = DispersionEngine.computeDispersionProperties(mat, wl, L_mm);
      dataN.push({ x: wl, y: p.n });
      dataNg.push({ x: wl, y: p.ng });
      dataGvd.push({ x: wl, y: p.gvd });
      dataTod.push({ x: wl, y: p.tod });
    }

    // Chart 1: Combined n & ng on dual axis
    charts['index_dual'].data.datasets = [
      { label: 'n', data: dataN, borderColor: '#2563eb', borderWidth: 1.5, pointRadius: 0, yAxisID: 'y' },
      { label: 'ng', data: dataNg, borderColor: '#059669', borderWidth: 1.5, pointRadius: 0, yAxisID: 'y1' }
    ];
    charts['index_dual'].update();

    // Chart 2: Combined GVD & TOD on dual axis
    charts['dispersion_dual'].data.datasets = [
      { label: 'GVD', data: dataGvd, borderColor: '#dc2626', borderWidth: 1.5, pointRadius: 0, yAxisID: 'y' },
      { label: 'TOD', data: dataTod, borderColor: '#7c3aed', borderWidth: 1.5, pointRadius: 0, yAxisID: 'y1' }
    ];
    charts['dispersion_dual'].update();



    // Chart 4: Tau out vs Tau in
    const dataTauOut = [];
    for (let t0 = 5; t0 <= 200; t0 += 5) {
      dataTauOut.push({ x: t0, y: DispersionEngine.computeAnalyticalBroadening(t0, props.gdd) });
    }
    charts['tau_out'].data.datasets = [{ label: 'Tau Out', data: dataTauOut, borderColor: '#059669', borderWidth: 1.5, pointRadius: 0 }];
    charts['tau_out'].update();

    // Chart 5: Time domain profiles — normalized to peak, adaptive window
    const dataInputT = [], dataDispT = [], dataCompT = [];
    const maxInput = Math.max(...sim.inputIntensity) || 1;
    const maxDisp  = Math.max(...sim.dispersedIntensity) || 1;
    const maxComp  = Math.max(...sim.compensatedIntensity) || 1;
    const displayWindow = Math.max(tau0_fs * 6, sim.tau_disp_fwhm * 4, 120);
    for (let i = 0; i < sim.tArray.length; i++) {
      if (Math.abs(sim.tArray[i]) <= displayWindow) {
        dataInputT.push({ x: sim.tArray[i], y: sim.inputIntensity[i] / maxInput });
        dataDispT.push({ x: sim.tArray[i],  y: sim.dispersedIntensity[i] / maxDisp });
        dataCompT.push({ x: sim.tArray[i],  y: sim.compensatedIntensity[i] / maxComp });
      }
    }
    charts['time_pulse'].data.datasets = [
      { label: 'Input',       data: dataInputT, borderColor: '#6b7280', borderWidth: 1.5, pointRadius: 0 },
      { label: 'Dispersed',   data: dataDispT,  borderColor: '#dc2626', borderWidth: 1.5, pointRadius: 0 },
      { label: 'Compensated', data: dataCompT,  borderColor: '#2563eb', borderWidth: 1.5, pointRadius: 0 }
    ];
    charts['time_pulse'].options.scales.y = { min: 0, max: 1.05, title: { display: true, text: 'Norm. Intensity I(t)', font: { size: 11 } }, ticks: { font: { size: 10 } } };
    charts['time_pulse'].update();

    // Chart 6: Spectrum (normalized) + Net Spectral Phase (dual y-axis)
    const dataSpecIn = [], dataPhase = [];
    const maxSpecIn = Math.max(...sim.spectralIntensity) || 1;
    for (let i = 0; i < sim.wavelengthArray.length; i += 2) {
      const wl = sim.wavelengthArray[i];
      if (wl >= lam0_nm - 150 && wl <= lam0_nm + 150 && wl > 0) {
        dataSpecIn.push({ x: wl, y: sim.spectralIntensity[i] / maxSpecIn });
        dataPhase.push({ x: wl, y: sim.spectralPhase[i] });
      }
    }
    dataSpecIn.sort((a, b) => a.x - b.x);
    dataPhase.sort((a, b) => a.x - b.x);
    charts['spectral_phase'].data.datasets = [
      { label: 'Spectrum (norm.)', data: dataSpecIn, borderColor: '#2563eb', borderWidth: 1.5, pointRadius: 0, yAxisID: 'y',  fill: true, backgroundColor: 'rgba(37,99,235,0.10)' },
      { label: 'Net Phase (rad)', data: dataPhase,   borderColor: '#dc2626', borderWidth: 1.5, pointRadius: 0, yAxisID: 'y1' }
    ];
    charts['spectral_phase'].update();
  }

  // Event Listeners
  matSelect.addEventListener('change', update);
  thickInput.addEventListener('input', update);
  waveInput.addEventListener('input', update);
  pulseInput.addEventListener('input', update);
  gddCompInput.addEventListener('input', update);
  todCompInput.addEventListener('input', update);

  setTimeout(update, 200);
});
</script>

