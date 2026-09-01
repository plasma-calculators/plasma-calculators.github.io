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
  const error = $("errorMessage") || (() => { const e=document.createElement("div"); e.id="errorMessage"; e.className="notice--danger"; e.hidden=true; $("calculator-form").after(e); return e; })();
  const text = (id, value) => { const el=$(id); if (el) el.textContent=value; };
  const renderProfile = (p, prefix) => { text(`res-spotsize-${prefix}`, `${p.geometry.areaUm2.toFixed(1)} μm²`); text(`res-power-${prefix}`, `${p.peakPowerTW.toFixed(1)} TW`); text(`res-intensity-${prefix}`, `${p.peakIntensity18.toFixed(1)} × 10¹⁸ W/cm²`); text(`res-a0-${prefix}`, p.a0.toFixed(2)); text(`res-matcheda0-${prefix}`, p.matchedA0.toFixed(2)); text(`res-bubble-${prefix}`, `${p.bubbleRadiusUm.toFixed(1)} μm`); text(`res-dephasing-${prefix}`, `${(p.dephasingLengthM*1000).toFixed(1)} mm`); text(`res-pumpdep-${prefix}`, `${(p.pumpDepletionLengthM*1000).toFixed(1)} mm`); text(`res-energy-${prefix}`, `${p.energyGainMeV.toFixed(1)} MeV\n(${(p.energyGainMeV/1000).toFixed(2)}) GeV`); };
  const renderWarnings = r => { const groups = new Map(); r.warnings.forEach(w => groups.set(w, ["Plasma"])); [["Gaussian", r.profiles.gaussian.warnings], ["Top-hat", r.profiles.topHat.warnings]].forEach(([profile, warnings]) => warnings.forEach(w => groups.set(w, [...(groups.get(w) || []), profile]))); return [...groups].map(([warning, profiles]) => `${profiles.join(" & ")}: ${warning}`).join(" • "); };
  function update() {
    try {
      const source = document.querySelector('input[name="density-source"]:checked').value;
      const r = LWFAEngine.compute({durationFs:+inputs["pulse-duration"].value, energyJ:+inputs["laser-energy"].value, waistUm:+inputs["waist-radius"].value, wavelengthUm:+inputs["laser-wavelength"].value, q:+inputs["q-factor"].value, densitySource:source, directDensity:inputs["direct-ne"].value, backgroundElectrons:+inputs["electrons-bg"].value, dopantElectrons:+inputs["electrons-dopant"].value, dopantPercent:+inputs["dopant-percent"].value, pressureMbar:+inputs["pressure-mbar"].value, gasTemperatureK:+inputs["gas-temperature"].value, temperatureEv:+inputs["plasma-temp"].value});
      error.textContent=""; error.hidden=true; renderProfile(r.profiles.gaussian,"gauss"); renderProfile(r.profiles.topHat,"tophat");
      text("res-ne", `${r.plasma.electronDensityCm3.toExponential(1)} cm⁻³`); text("res-omegap", `${r.plasma.omegaP.toExponential(1)} rad/s`); text("res-lambdap", `${(r.plasma.lambdaP*1e6).toFixed(1)} μm`); text("res-crit-density", `${r.plasma.criticalDensityCm3.toExponential(1)} cm⁻³`); text("res-density-ratio", r.plasma.densityRatio.toExponential(2)); text("res-debye-nm", `${(r.plasma.debyeLengthM*1e9).toFixed(1)} nm`); text("res-vth", `${r.plasma.thermalSpeed.toExponential(1)} m/s (${r.plasma.thermalSpeedFractionC.toFixed(1)}% c)`); text("res-pcrit", `${r.plasma.criticalPowerTW.toFixed(1)} TW`); text("res-omegalaser", `${r.plasma.omegaLaser.toExponential(1)} rad/s`); text("res-freq-laser", `${r.plasma.frequencyHz.toExponential(1)} Hz`);
      text("res-rayleigh-gauss", `${(r.profiles.gaussian.rayleighRangeM*1000).toFixed(1)} mm`); text("res-rayleigh-tophat", `${(r.profiles.topHat.rayleighRangeM*1000).toFixed(1)} mm`); text("res-spot-match-gauss", r.profiles.gaussian.spotToMatchedRadius.toFixed(2)); text("res-spot-match-tophat", r.profiles.topHat.spotToMatchedRadius.toFixed(2)); text("res-pulse-bubble-gauss", r.profiles.gaussian.pulseToBubbleRatio.toFixed(2)); text("res-pulse-bubble-tophat", r.profiles.topHat.pulseToBubbleRatio.toFixed(2)); text("res-limit-gauss", `${r.profiles.gaussian.limitingLengthMm.toFixed(1)} mm`); text("res-limit-tophat", `${r.profiles.topHat.limitingLengthMm.toFixed(1)} mm`);
      const warnings=renderWarnings(r); text("lwfa-warnings", warnings || "No validity warnings for these inputs.");
    } catch (e) { error.textContent = e.message; error.hidden=false; }
  }
  document.querySelectorAll('input[name="density-source"]').forEach(radio => radio.addEventListener("change", () => { const gas=radio.value==="gas" && radio.checked; gasFields.style.display=gas?"block":"none"; directFields.style.display=gas?"none":"block"; update(); })); ids.forEach(id => inputs[id].addEventListener("input", update)); update();
});
</script>
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
        <label for="q-factor" class="q-factor-label">Focused-energy fraction $q$-factor</label>
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
            <td id="res-energy-gauss" class="font-highlight energy-gain-result">-</td>
            <td id="res-energy-tophat" class="font-highlight energy-gain-result">-</td>
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
      <table class="comparison-table validity-diagnostics-table">
        <thead><tr><th>Diagnostic</th><th>Gaussian</th><th>Top-hat</th><th>Reference / interpretation</th></tr></thead>
        <tbody>
        <tr><td><strong>Rayleigh range</strong></td><td id="res-rayleigh-gauss">-</td><td id="res-rayleigh-tophat">-</td><td>Compare with the limiting propagation length; a shorter range means guiding is required.</td></tr>
        <tr><td><strong>Spot / matched radius</strong></td><td id="res-spot-match-gauss">-</td><td id="res-spot-match-tophat">-</td><td>Target ≈ 1; the current validity range is 0.8–1.25.</td></tr>
        <tr><td><strong>Pulse length / bubble radius</strong></td><td id="res-pulse-bubble-gauss">-</td><td id="res-pulse-bubble-tophat">-</td><td>Dimensionless scale comparison; no hard pass/fail threshold is applied.</td></tr>
        <tr><td><strong>Limiting propagation length</strong></td><td id="res-limit-gauss">-</td><td id="res-limit-tophat">-</td><td>Compare with the intended plasma-stage length; this is the smaller wake-limited distance.</td></tr>
        </tbody>
      </table>
      <div id="lwfa-warnings" class="notice--warning" style="margin-top:0.5rem;">-</div>
      <small>a₀ uses the standard linear-polarization convention.</small>
    </div>
  </div>
</div>
