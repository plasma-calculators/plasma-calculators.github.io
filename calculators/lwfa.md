---
layout: single
title: "Laser Wakefield Acceleration (LWFA) Calculator"
permalink: /calculators/lwfa/
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
<script>
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const ids = ["pulse-duration","laser-energy","waist-radius","laser-wavelength","q-factor","electrons-bg","electrons-dopant","dopant-percent","pressure-mbar","gas-temperature","direct-ne","plasma-temp"];
  const inputs = Object.fromEntries(ids.map(id => [id, $(id)]));
  const gasFields = $("gas-input-fields"), directFields = $("direct-input-fields");
  const error = $("errorMessage") || (() => { const e=document.createElement("div"); e.id="errorMessage"; e.className="notice--danger"; $("calculator-form").after(e); return e; })();
  const text = (id, value) => { const el=$(id); if (el) el.textContent=value; };
  const renderProfile = (p, prefix) => { text(`res-spotsize-${prefix}`, `${p.geometry.areaUm2.toFixed(1)} μm²`); text(`res-power-${prefix}`, `${p.peakPowerTW.toFixed(1)} TW`); text(`res-intensity-${prefix}`, `${p.peakIntensity18.toFixed(1)} × 10¹⁸ W/cm²`); text(`res-a0-${prefix}`, p.a0.toFixed(2)); text(`res-matcheda0-${prefix}`, p.matchedA0.toFixed(2)); text(`res-bubble-${prefix}`, `${p.bubbleRadiusUm.toFixed(1)} μm`); text(`res-dephasing-${prefix}`, `${(p.dephasingLengthM*1000).toFixed(1)} mm`); text(`res-pumpdep-${prefix}`, `${(p.pumpDepletionLengthM*1000).toFixed(1)} mm`); text(`res-energy-${prefix}`, `${p.energyGainMeV.toFixed(1)} MeV (${(p.energyGainMeV/1000).toFixed(2)} GeV)`); };
  function update() {
    try {
      const source = document.querySelector('input[name="density-source"]:checked').value;
      const r = LWFAEngine.compute({durationFs:+inputs["pulse-duration"].value, energyJ:+inputs["laser-energy"].value, waistUm:+inputs["waist-radius"].value, wavelengthUm:+inputs["laser-wavelength"].value, q:+inputs["q-factor"].value, densitySource:source, directDensity:inputs["direct-ne"].value, backgroundElectrons:+inputs["electrons-bg"].value, dopantElectrons:+inputs["electrons-dopant"].value, dopantPercent:+inputs["dopant-percent"].value, pressureMbar:+inputs["pressure-mbar"].value, gasTemperatureK:+inputs["gas-temperature"].value, temperatureEv:+inputs["plasma-temp"].value});
      error.textContent=""; renderProfile(r.profiles.gaussian,"gauss"); renderProfile(r.profiles.topHat,"tophat");
      text("res-ne", `${r.plasma.electronDensityCm3.toExponential(1)} cm⁻³`); text("res-omegap", `${r.plasma.omegaP.toExponential(1)} rad/s`); text("res-lambdap", `${(r.plasma.lambdaP*1e6).toFixed(1)} μm`); text("res-crit-density", `${r.plasma.criticalDensityCm3.toExponential(1)} cm⁻³`); text("res-density-ratio", r.plasma.densityRatio.toExponential(2)); text("res-debye-nm", `${(r.plasma.debyeLengthM*1e9).toFixed(1)} nm`); text("res-vth", `${r.plasma.thermalSpeed.toExponential(1)} m/s (${r.plasma.thermalSpeedFractionC.toFixed(1)}% c)`); text("res-pcrit", `${r.plasma.criticalPowerTW.toFixed(1)} TW`); text("res-omegalaser", `${r.laser.omega.toExponential(1)} rad/s`); text("res-freq-laser", `${r.laser.frequency.toExponential(1)} Hz`);
      text("res-rayleigh", `${(r.profiles.gaussian.rayleighRangeM*1000).toFixed(1)} mm`); text("res-spot-match", `G ${r.profiles.gaussian.spotToMatchedRadius.toFixed(2)}; TH ${r.profiles.topHat.spotToMatchedRadius.toFixed(2)}`); text("res-pulse-bubble", `G ${r.profiles.gaussian.pulseToBubbleRatio.toFixed(2)}; TH ${r.profiles.topHat.pulseToBubbleRatio.toFixed(2)}`); text("res-limit", `G ${(r.profiles.gaussian.limitingLengthM*1000).toFixed(1)} mm; TH ${(r.profiles.topHat.limitingLengthM*1000).toFixed(1)} mm`);
      const warnings=[...r.warnings, ...r.profiles.gaussian.warnings.map(w=>`Gaussian: ${w}`), ...r.profiles.topHat.warnings.map(w=>`Top-hat: ${w}`)]; text("lwfa-warnings", warnings.length ? warnings.join(" • ") : "No validity warnings for these inputs.");
    } catch (e) { error.textContent = e.message; }
  }
  document.querySelectorAll('input[name="density-source"]').forEach(radio => radio.addEventListener("change", () => { const gas=radio.value==="gas" && radio.checked; gasFields.style.display=gas?"block":"none"; directFields.style.display=gas?"none":"block"; update(); })); ids.forEach(id => inputs[id].addEventListener("input", update)); update();
});
</script>
<!-- LWFA engine UI script is loaded after the calculator markup. -->
<!--
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const ids = ["pulse-duration","laser-energy","waist-radius","laser-wavelength","q-factor","electrons-bg","electrons-dopant","dopant-percent","pressure-mbar","gas-temperature","direct-ne","plasma-temp"];
  const inputs = Object.fromEntries(ids.map(id => [id, $(id)]));
  const gasFields = $("gas-input-fields"), directFields = $("direct-input-fields"), error = $("errorMessage") || (() => { const e=document.createElement("div"); e.id="errorMessage"; e.className="notice--danger"; $("calculator-form").after(e); return e; })();
  const text = (id, value) => { const el=$(id); if (el) el.textContent=value; };
  const profile = (p, prefix) => {
    text(`res-spotsize-${prefix}`, `${p.geometry.areaUm2.toFixed(1)} μm²`);
    text(`res-power-${prefix}`, `${p.peakPowerTW.toFixed(1)} TW`);
    text(`res-intensity-${prefix}`, `${p.peakIntensity18.toFixed(1)} × 10¹⁸ W/cm²`);
    text(`res-a0-${prefix}`, p.a0.toFixed(2)); text(`res-matcheda0-${prefix}`, p.matchedA0.toFixed(2));
    text(`res-bubble-${prefix}`, `${p.bubbleRadiusUm.toFixed(1)} μm`); text(`res-dephasing-${prefix}`, `${(p.dephasingLengthM*1000).toFixed(1)} mm`);
    text(`res-pumpdep-${prefix}`, `${(p.pumpDepletionLengthM*1000).toFixed(1)} mm`);
    text(`res-energy-${prefix}`, `${p.energyGainMeV.toFixed(1)} MeV (${(p.energyGainMeV/1000).toFixed(2)} GeV)`);
  };
  function update() {
    try {
      const source = document.querySelector('input[name="density-source"]:checked').value;
      const r = LWFAEngine.compute({durationFs:+inputs["pulse-duration"].value, energyJ:+inputs["laser-energy"].value, waistUm:+inputs["waist-radius"].value, wavelengthUm:+inputs["laser-wavelength"].value, q:+inputs["q-factor"].value, densitySource:source, directDensity:inputs["direct-ne"].value, backgroundElectrons:+inputs["electrons-bg"].value, dopantElectrons:+inputs["electrons-dopant"].value, dopantPercent:+inputs["dopant-percent"].value, pressureMbar:+inputs["pressure-mbar"].value, gasTemperatureK:+inputs["gas-temperature"].value, temperatureEv:+inputs["plasma-temp"].value});
      error.textContent=""; profile(r.profiles.gaussian,"gauss"); profile(r.profiles.topHat,"tophat");
      text("res-ne", `${r.plasma.electronDensityCm3.toExponential(1)} cm⁻³`); text("res-omegap", `${r.plasma.omegaP.toExponential(1)} rad/s`); text("res-lambdap", `${(r.plasma.lambdaP*1e6).toFixed(1)} μm`); text("res-crit-density", `${r.plasma.criticalDensityCm3.toExponential(1)} cm⁻³`); text("res-density-ratio", r.plasma.densityRatio.toExponential(2)); text("res-debye-nm", `${(r.plasma.debyeLengthM*1e9).toFixed(1)} nm`); text("res-vth", `${r.plasma.thermalSpeed.toExponential(1)} m/s (${r.plasma.thermalSpeedFractionC.toFixed(1)}% c)`); text("res-pcrit", `${r.plasma.criticalPowerTW.toFixed(1)} TW`); text("res-omegalaser", `${r.laser.omega.toExponential(1)} rad/s`); text("res-freq-laser", `${r.laser.frequency.toExponential(1)} Hz`);
      text("res-rayleigh", `${(r.profiles.gaussian.rayleighRangeM*1000).toFixed(1)} mm`); text("res-spot-match", `G ${r.profiles.gaussian.spotToMatchedRadius.toFixed(2)}; TH ${r.profiles.topHat.spotToMatchedRadius.toFixed(2)}`); text("res-pulse-bubble", `G ${r.profiles.gaussian.pulseToBubbleRatio.toFixed(2)}; TH ${r.profiles.topHat.pulseToBubbleRatio.toFixed(2)}`); text("res-limit", `G ${(r.profiles.gaussian.limitingLengthM*1000).toFixed(1)} mm; TH ${(r.profiles.topHat.limitingLengthM*1000).toFixed(1)} mm`);
      const warnings=[...r.warnings, ...r.profiles.gaussian.warnings.map(w=>`Gaussian: ${w}`), ...r.profiles.topHat.warnings.map(w=>`Top-hat: ${w}`)]; text("lwfa-warnings", warnings.length ? warnings.join(" • ") : "No validity warnings for these inputs.");
    } catch (e) { error.textContent = e.message; }
  }
  document.querySelectorAll('input[name="density-source"]').forEach(radio => radio.addEventListener("change", () => { const gas=radio.value==="gas" && radio.checked; gasFields.style.display=gas?"block":"none"; directFields.style.display=gas?"none":"block"; update(); }));
  ids.forEach(id => inputs[id].addEventListener("input", update)); update();
});
</script>-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.7/MathJax.js?config=TeX-MML-AM_CHTML" async></script>
<script src="/assets/js/lwfa-engine.js"></script>

<div class="calculator-container compact-mode">
  <div class="calculator-sidebar">
    <h3>Input Parameters</h3>
    <form id="calculator-form">
      <h4 class="input-section-title">Laser Pulse Settings</h4>
      <div class="form-group">
        <label for="pulse-duration">Intensity FWHM, $t_{\text{FWHM}}$ (fs)</label>
        <input type="number" id="pulse-duration" value="30" step="any" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="laser-energy">Pulse Energy, $W_L$ (J)</label>
        <input type="number" id="laser-energy" value="3" step="any" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="waist-radius">Waist radius, $w_0$ (Gaussian field 1/e; top-hat disk radius, µm)</label>
        <input type="number" id="waist-radius" value="10.9" step="any" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="laser-wavelength">Wavelength, $\lambda$ (µm)</label>
        <input type="number" id="laser-wavelength" value="0.8" step="any" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="q-factor">Focused-energy fraction $q$ (0–1)</label>
        <input type="number" id="q-factor" value="1" step="any" class="small-input" required>
      </div>

      <h4 class="input-section-title">Plasma Density Source</h4>
      <div class="form-group radio-group" style="gap: 0.4rem;">
        <label class="radio-label" style="font-size: 0.75rem;">
          <input type="radio" name="density-source" value="direct" checked> Plasma density
        </label>
        <label class="radio-label" style="font-size: 0.75rem;">
          <input type="radio" name="density-source" value="gas"> Gas Settings
        </label>
      </div>

      <div id="gas-input-fields" style="display: none;">
        <h4 class="input-section-title">Gas & Pressure Settings</h4>
        <div class="form-group">
          <label for="electrons-bg">e⁻ per background gas particle</label>
          <input type="number" id="electrons-bg" value="2" step="any" class="small-input" required>
        </div>
        <div class="form-group">
          <label for="electrons-dopant">e⁻ per dopant gas particle</label>
          <input type="number" id="electrons-dopant" value="7" step="any" class="small-input" required>
        </div>
        <div class="form-group">
          <label for="dopant-percent">% Dopant</label>
          <input type="number" id="dopant-percent" value="5" step="any" class="small-input" required>
        </div>
        <div class="form-group">
          <label for="pressure-mbar">Total Pressure (mbar)</label>
          <input type="number" id="pressure-mbar" value="18.78" step="any" class="small-input" required>
        </div>
        <div class="form-group">
          <label for="gas-temperature">Gas temperature (K)</label>
          <input type="number" id="gas-temperature" value="293.15" step="any" class="small-input" required>
        </div>
        <small>Charge-state inputs are electrons per gas particle (include molecular stoichiometry).</small>
      </div>

      <div id="direct-input-fields">
        <h4 class="input-section-title">Direct Density Settings</h4>
        <div class="form-group">
          <label for="direct-ne">Plasma density, $n_e$ ($\text{cm}^{-3}$)</label>
          <input type="text" id="direct-ne" value="1.044e18" class="small-input" required>
        </div>
      </div>

      <h4 class="input-section-title">Thermal Settings</h4>
      <div class="form-group">
        <label for="plasma-temp">Plasma Temp (eV)</label>
        <input type="number" id="plasma-temp" value="10" step="any" class="small-input" required>
      </div>
    </form>
    <div class="explanation-link-container">
      <a href="/calculators/lwfa-explanation/" class="explanation-btn">View Equations & Explanation</a>
    </div>
  </div>

  <div class="calculator-results">
    <div class="results-group">
      <h3>1. Laser Parameters</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 44%;">Quantity</th>
            <th style="width: 28%;">Gaussian Profile</th>
            <th style="width: 28%;">Top-Hat Profile</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Spot Size</strong></td>
            <td id="res-spotsize-gauss">-</td>
            <td id="res-spotsize-tophat">-</td>
          </tr>
          <tr>
            <td><strong>Peak Power</strong></td>
            <td id="res-power-gauss" class="font-highlight">-</td>
            <td id="res-power-tophat" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Peak Intensity</strong></td>
            <td id="res-intensity-gauss">-</td>
            <td id="res-intensity-tophat">-</td>
          </tr>
          <tr>
            <td><strong>Normalized Vector Potential ($a_0$)</strong></td>
            <td id="res-a0-gauss" class="font-highlight">-</td>
            <td id="res-a0-tophat" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Laser $\omega_{\text{laser}}$</strong></td>
            <td colspan="2" style="text-align: center;" id="res-omegalaser">-</td>
          </tr>
          <tr>
            <td><strong>Laser Frequency</strong></td>
            <td colspan="2" style="text-align: center;" id="res-freq-laser">-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="results-group">
      <h3>2. LWFA Parameters (Bubble Regime)</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 44%;">Quantity</th>
            <th style="width: 28%;">Gaussian Profile</th>
            <th style="width: 28%;">Top-Hat Profile</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Matched $a_0$</strong></td>
            <td id="res-matcheda0-gauss">-</td>
            <td id="res-matcheda0-tophat">-</td>
          </tr>
          <tr>
            <td><strong>Bubble Radius $R$</strong></td>
            <td id="res-bubble-gauss">-</td>
            <td id="res-bubble-tophat">-</td>
          </tr>
          <tr>
            <td><strong>Dephasing Length $L_d$</strong></td>
            <td id="res-dephasing-gauss">-</td>
            <td id="res-dephasing-tophat">-</td>
          </tr>
          <tr>
            <td><strong>Pump Depletion Length</strong></td>
            <td id="res-pumpdep-gauss">-</td>
            <td id="res-pumpdep-tophat">-</td>
          </tr>
          <tr>
            <td><strong>Energy Gain $W_{el}$ <small style="display:block; font-weight:normal;">(only if $R = w_0$)</small></strong></td>
            <td id="res-energy-gauss" class="font-highlight">-</td>
            <td id="res-energy-tophat" class="font-highlight">-</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="results-group">
      <h3>3. Plasma Parameters</h3>
      <table class="comparison-table">
        <thead>
          <tr>
            <th style="width: 44%;">Quantity</th>
            <th style="width: 56%;">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Electron Density $n_e$</strong></td>
            <td id="res-ne" class="font-highlight">-</td>
          </tr>
          <tr>
            <td><strong>Plasma Frequency $\omega_p$</strong></td>
            <td id="res-omegap">-</td>
          </tr>
          <tr>
            <td><strong>Plasma Wavelength $\lambda_p$</strong></td>
            <td id="res-lambdap">-</td>
          </tr>
          <tr>
            <td><strong>Critical Density $n_c$</strong></td>
            <td id="res-crit-density">-</td>
          </tr>
          <tr>
            <td><strong>Density ratio $n_e/n_c$</strong></td>
            <td id="res-density-ratio">-</td>
          </tr>
          <tr>
            <td><strong>Debye Length $\lambda_D$</strong></td>
            <td id="res-debye-nm">-</td>
          </tr>
          <tr>
            <td><strong>Thermal Speed $v_{\text{th}}$</strong></td>
            <td id="res-vth">-</td>
          </tr>
          <tr>
            <td><strong>Critical Power for Self-Focusing $P_{\text{crit}}$</strong></td>
            <td id="res-pcrit" class="font-highlight">-</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="results-group">
      <h3>4. Validity Diagnostics</h3>
      <table class="comparison-table"><tbody>
        <tr><td><strong>Rayleigh range</strong></td><td id="res-rayleigh">-</td></tr>
        <tr><td><strong>Spot / matched radius</strong></td><td id="res-spot-match">-</td></tr>
        <tr><td><strong>Pulse length / bubble diameter</strong></td><td id="res-pulse-bubble">-</td></tr>
        <tr><td><strong>Limiting propagation length</strong></td><td id="res-limit">-</td></tr>
      </tbody></table>
      <div id="lwfa-warnings" class="notice--warning" style="margin-top:0.5rem;">-</div>
      <small>a₀ uses the standard linear-polarization convention.</small>
    </div>
  </div>
</div>

<script>
if (false) {
document.addEventListener("DOMContentLoaded", function() {
  const densitySourceRadios = document.getElementsByName("density-source");
  const gasFields = document.getElementById("gas-input-fields");
  const directFields = document.getElementById("direct-input-fields");

  densitySourceRadios.forEach(radio => {
    radio.addEventListener("change", function() {
      if (this.value === "gas") {
        gasFields.style.display = "block";
        directFields.style.display = "none";
      } else {
        gasFields.style.display = "none";
        directFields.style.display = "block";
      }
      update();
    });
  });

  const inputs = {
    duration: document.getElementById("pulse-duration"),
    energy: document.getElementById("laser-energy"),
    waist: document.getElementById("waist-radius"),
    wavelength: document.getElementById("laser-wavelength"),
    qfactor: document.getElementById("q-factor"),
    bgEl: document.getElementById("electrons-bg"),
    dopEl: document.getElementById("electrons-dopant"),
    dopPct: document.getElementById("dopant-percent"),
    pressMbar: document.getElementById("pressure-mbar"),
    directNe: document.getElementById("direct-ne"),
    temp: document.getElementById("plasma-temp")
  };

  const outputs = {
    spotGauss: document.getElementById("res-spotsize-gauss"),
    spotTophat: document.getElementById("res-spotsize-tophat"),
    powerGauss: document.getElementById("res-power-gauss"),
    powerTophat: document.getElementById("res-power-tophat"),
    intensityGauss: document.getElementById("res-intensity-gauss"),
    intensityTophat: document.getElementById("res-intensity-tophat"),
    a0Gauss: document.getElementById("res-a0-gauss"),
    a0Tophat: document.getElementById("res-a0-tophat"),
    matcheda0Gauss: document.getElementById("res-matcheda0-gauss"),
    matcheda0Tophat: document.getElementById("res-matcheda0-tophat"),
    bubbleGauss: document.getElementById("res-bubble-gauss"),
    bubbleTophat: document.getElementById("res-bubble-tophat"),
    dephasingGauss: document.getElementById("res-dephasing-gauss"),
    dephasingTophat: document.getElementById("res-dephasing-tophat"),
    pumpdepGauss: document.getElementById("res-pumpdep-gauss"),
    pumpdepTophat: document.getElementById("res-pumpdep-tophat"),
    energyGauss: document.getElementById("res-energy-gauss"),
    ne: document.getElementById("res-ne"),
    omegap: document.getElementById("res-omegap"),
    lambdap: document.getElementById("res-lambdap"),
    critLambda: document.getElementById("res-crit-lambda"),
    debyeUm: document.getElementById("res-debye-um"),
    vth: document.getElementById("res-vth"),
    pcrit: document.getElementById("res-pcrit"),
    omegalaser: document.getElementById("res-omegalaser"),
    freqLaser: document.getElementById("res-freq-laser")
  };

  const me = 9.1e-31;
  const eps0 = 8.85e-12;
  const qe = 1.6e-19;
  const c = 3.0e8;

  function parseInputDensity(value) {
    let clean = value.trim().toLowerCase().replace(/\s+/g, '');
    if (clean.includes('10^')) {
      const exponent = parseFloat(clean.split('^')[1]);
      return Math.pow(10, exponent);
    }
    if (clean.includes('e')) {
      return parseFloat(clean);
    }
    const val = parseFloat(clean);
    return isNaN(val) ? 0 : val;
  }

  function update() {
    const tFWHM = parseFloat(inputs.duration.value);
    const WL = parseFloat(inputs.energy.value);
    const w0 = parseFloat(inputs.waist.value);
    const lamL = parseFloat(inputs.wavelength.value);
    const q = parseFloat(inputs.qfactor.value);

    const bg_el = parseFloat(inputs.bgEl.value);
    const dop_el = parseFloat(inputs.dopEl.value);
    const dop_pct = parseFloat(inputs.dopPct.value);
    const press_mbar = parseFloat(inputs.pressMbar.value);
    const temp_ev = parseFloat(inputs.temp.value);

    const activeSource = document.querySelector('input[name="density-source"]:checked').value;

    if (isNaN(tFWHM) || isNaN(WL) || isNaN(w0) || isNaN(lamL) || isNaN(q) || isNaN(temp_ev)) {
      return;
    }

    let ne = 0;
    let press_torr = 0;

    if (activeSource === "gas") {
      if (isNaN(bg_el) || isNaN(dop_el) || isNaN(dop_pct) || isNaN(press_mbar)) return;
      press_torr = press_mbar / 1.33322;
      ne = 3.57e16 * press_torr * (bg_el * (1 - dop_pct/100) + dop_el * dop_pct/100);
    } else {
      ne = parseInputDensity(inputs.directNe.value);
      if (isNaN(ne) || ne <= 0) return;
    }

    const omegap = Math.sqrt(ne * 1e6 * qe * qe / (eps0 * me));
    const lambdap = (c / omegap) * 2 * Math.PI * 1e6;
    const crit_lambda = (c / omegap) * 2 * Math.PI * 1e6;
    const debye_m = Math.sqrt(eps0 * temp_ev * qe / (ne * 1e6 * qe * qe));
    const debye_nm = debye_m * 1e9;
    const vth_m = omegap * debye_m;
    const vth_pct_c = vth_m / c * 100;

    const omegalaser = 2 * Math.PI * c / lamL * 1e6;
    const freq_laser = omegalaser / (2 * Math.PI);
    const pcrit = 1.7e10 * omegalaser * omegalaser / (omegap * omegap) / 1e12;

    const spotsize = w0 * w0 * 3.14159265;

    const power_gauss = (WL / tFWHM) * Math.sqrt((4 * Math.LN2) / Math.PI) * 1000 * q;
    const power_tophat = (WL / tFWHM) * 1000 * q;

    const intensity_gauss = 2 * power_gauss / spotsize * 100;
    const intensity_tophat = 2 * power_tophat / spotsize * 100;

    const a0_gauss = Math.sqrt((intensity_gauss * lamL * lamL) / 1.37);
    const a0_tophat = Math.sqrt((intensity_tophat * lamL * lamL) / 1.37);

    const matcheda0_gauss = 2 * Math.pow(power_gauss / pcrit, 1/3);
    const matcheda0_tophat = 2 * Math.pow(power_tophat / pcrit, 1/3);

    const bubble_gauss_m = 2 * Math.sqrt(a0_gauss) / omegap * c;
    const bubble_tophat_m = 2 * Math.sqrt(a0_tophat) / omegap * c;

    const bubble_gauss_um = bubble_gauss_m * 1e6;
    const bubble_tophat_um = bubble_tophat_m * 1e6;

    const dephasing_gauss_m = (2/3) * (omegalaser * omegalaser) / (omegap * omegap) * bubble_gauss_m;
    const dephasing_tophat_m = (2/3) * (omegalaser * omegalaser) / (omegap * omegap) * bubble_tophat_m;

    const dephasing_gauss_mm = dephasing_gauss_m * 1000;
    const dephasing_tophat_mm = dephasing_tophat_m * 1000;

    const pumpdep_gauss_m = (omegalaser * omegalaser) / (omegap * omegap) * c * tFWHM * 1e-15;
    const pumpdep_tophat_m = (omegalaser * omegalaser) / (omegap * omegap) * c * tFWHM * 1e-15;

    const pumpdep_gauss_mm = pumpdep_gauss_m * 1000;
    const pumpdep_tophat_mm = pumpdep_tophat_m * 1000;

    const energy_gauss = 1000 * 1.7 * Math.pow(power_gauss/100, 1/3) * Math.pow(1e18/ne, 2/3) * Math.pow(0.8/lamL, 4/3);

    outputs.ne.innerText = ne.toExponential(1) + " cm⁻³";
    outputs.omegap.innerText = omegap.toExponential(1) + " rad/s";
    outputs.lambdap.innerText = lambdap.toFixed(1) + " μm";
    outputs.critLambda.innerText = crit_lambda.toFixed(1) + " μm";
    outputs.debyeUm.innerText = debye_nm.toFixed(1) + " nm";
    outputs.vth.innerText = vth_m.toExponential(1) + " m/s (" + vth_pct_c.toFixed(1) + "% c)";
    outputs.pcrit.innerText = pcrit.toFixed(1) + " TW";
    outputs.omegalaser.innerText = omegalaser.toExponential(1) + " rad/s";
    outputs.freqLaser.innerText = freq_laser.toExponential(1) + " Hz";

    outputs.spotGauss.innerText = spotsize.toFixed(1) + " μm²";
    outputs.spotTophat.innerText = spotsize.toFixed(1) + " μm²";
    outputs.powerGauss.innerText = power_gauss.toFixed(1) + " TW";
    outputs.powerTophat.innerText = power_tophat.toFixed(1) + " TW";
    outputs.intensityGauss.innerText = intensity_gauss.toFixed(1) + " × 10¹⁸ W/cm²";
    outputs.intensityTophat.innerText = intensity_tophat.toFixed(1) + " × 10¹⁸ W/cm²";
    outputs.a0Gauss.innerText = a0_gauss.toFixed(1);
    outputs.a0Tophat.innerText = a0_tophat.toFixed(1);
    outputs.matcheda0Gauss.innerText = matcheda0_gauss.toFixed(1);
    outputs.matcheda0Tophat.innerText = matcheda0_tophat.toFixed(1);
    outputs.bubbleGauss.innerText = bubble_gauss_um.toFixed(1) + " μm";
    outputs.bubbleTophat.innerText = bubble_tophat_um.toFixed(1) + " μm";
    outputs.dephasingGauss.innerText = dephasing_gauss_mm.toFixed(1) + " mm";
    outputs.dephasingTophat.innerText = dephasing_tophat_mm.toFixed(1) + " mm";
    outputs.pumpdepGauss.innerText = pumpdep_gauss_mm.toFixed(1) + " mm";
    outputs.pumpdepTophat.innerText = pumpdep_tophat_mm.toFixed(1) + " mm";
  outputs.energyGauss.innerText = energy_gauss.toFixed(1) + " MeV (" + (energy_gauss/1000).toFixed(1) + " GeV)";
  }

  for (const key in inputs) {
    inputs[key].addEventListener("input", update);
  }
  update();
});
}
</script>
