/*
 * LWFA scaling engine.
 * The returned energy and length values are matched, guided blowout estimates,
 * not a particle-in-cell or laser-evolution simulation.
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.LWFAEngine = factory();
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const C = Object.freeze({
    c: 299792458,
    e: 1.602176634e-19,
    me: 9.1093837015e-31,
    eps0: 8.8541878128e-12,
    kB: 1.380649e-23,
    a0IntensityDenominator: 1.37,
    criticalPowerGW: 17
  });

  function parseDensity(value) {
    if (typeof value === "number") return value;
    const text = String(value ?? "").trim().toLowerCase().replace(/[×x]/g, "*").replace(/\s+/g, "");
    if (!text) return NaN;
    const match = text.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:e([+-]?\d+)|(?:\*?10\^([+-]?\d+)))?$/);
    if (!match) return NaN;
    const coefficient = Number(match[1]);
    const exponent = Number(match[2] ?? match[3] ?? 0);
    return coefficient * Math.pow(10, exponent);
  }

  function finitePositive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive.`);
  }

  function compute(input) {
    const p = input || {};
    const durationFs = Number(p.durationFs);
    const energyJ = Number(p.energyJ);
    const waistUm = Number(p.waistUm);
    const wavelengthUm = Number(p.wavelengthUm);
    const q = Number(p.q);
    const temperatureEv = Number(p.temperatureEv);
    const gasTemperatureK = Number(p.gasTemperatureK ?? 293.15);

    finitePositive(durationFs, "Pulse duration");
    finitePositive(energyJ, "Pulse energy");
    finitePositive(waistUm, "Waist radius");
    finitePositive(wavelengthUm, "Wavelength");
    finitePositive(temperatureEv, "Plasma temperature");
    finitePositive(gasTemperatureK, "Gas temperature");
    if (!Number.isFinite(q) || q < 0 || q > 1) throw new Error("q-factor must be between 0 and 1.");

    const source = p.densitySource || "direct";
    let ne;
    if (source === "gas") {
      const bgElectrons = Number(p.backgroundElectrons);
      const dopantElectrons = Number(p.dopantElectrons);
      const dopantPercent = Number(p.dopantPercent);
      const pressureMbar = Number(p.pressureMbar);
      finitePositive(bgElectrons, "Background electrons per gas particle");
      finitePositive(dopantElectrons, "Dopant electrons per gas particle");
      finitePositive(pressureMbar, "Total pressure");
      if (!Number.isFinite(dopantPercent) || dopantPercent < 0 || dopantPercent > 100) {
        throw new Error("Dopant fraction must be between 0 and 100%.");
      }
      const particleDensityCm3 = (pressureMbar * 100 / (C.kB * gasTemperatureK)) / 1e6;
      const fraction = dopantPercent / 100;
      ne = particleDensityCm3 * (bgElectrons * (1 - fraction) + dopantElectrons * fraction);
    } else {
      ne = parseDensity(p.directDensity);
      finitePositive(ne, "Plasma density");
    }

    const omegaP = Math.sqrt(ne * 1e6 * C.e * C.e / (C.eps0 * C.me));
    const omegaLaser = 2 * Math.PI * C.c / (wavelengthUm * 1e-6);
    const lambdaPUm = 2 * Math.PI * C.c / omegaP * 1e6;
    const criticalDensityCm3 = C.eps0 * C.me * omegaLaser * omegaLaser / (C.e * C.e) / 1e6;
    const underdenseRatio = ne / criticalDensityCm3;
    const debyeNm = Math.sqrt(C.eps0 * temperatureEv * C.e / (ne * 1e6 * C.e * C.e)) * 1e9;
    const thermalSpeedMps = omegaP * debyeNm * 1e-9;
    const pCritTw = C.criticalPowerGW * 1e9 * Math.pow(omegaLaser / omegaP, 2) / 1e12;
    const areaUm2 = Math.PI * waistUm * waistUm;
    const pulseLengthM = C.c * durationFs * 1e-15;
    const rayleighMm = Math.PI * Math.pow(waistUm * 1e-6, 2) / (wavelengthUm * 1e-6) * 1e3;

    function profile(name, peakPowerTw, peakIntensity18) {
      const a0 = Math.sqrt(peakIntensity18 * wavelengthUm * wavelengthUm / C.a0IntensityDenominator);
      const powerRatio = peakPowerTw / pCritTw;
      const matchedA0 = 2 * Math.pow(Math.max(0, powerRatio), 1 / 3);
      const bubbleRadiusM = 2 * Math.sqrt(Math.max(0, a0)) * C.c / omegaP;
      const dephasingM = (2 / 3) * Math.pow(omegaLaser / omegaP, 2) * bubbleRadiusM;
      const pumpDepletionM = Math.pow(omegaLaser / omegaP, 2) * pulseLengthM;
      const luEnergyMeV = 1700 * Math.pow(Math.max(0, peakPowerTw) / 100, 1 / 3) *
        Math.pow(1e18 / ne, 2 / 3) * Math.pow(0.8 / wavelengthUm, 4 / 3);
      const spotMatchRatio = waistUm / (bubbleRadiusM * 1e6);
      const pulseBubbleRatio = pulseLengthM / bubbleRadiusM;
      const warnings = [];
      if (a0 < 2) warnings.push("a₀ is below the nominal blowout-regime threshold.");
      if (powerRatio < 1) warnings.push("P/Pcrit is below the usual self-guiding threshold.");
      if (spotMatchRatio < 0.8 || spotMatchRatio > 1.25) warnings.push("The input waist is not close to the matched bubble radius.");
      if (dephasingM > pumpDepletionM) warnings.push("Pump depletion occurs before dephasing.");
      if (rayleighMm < Math.min(dephasingM, pumpDepletionM) * 1e3) warnings.push("Vacuum diffraction is shorter than the wake-limited length; guiding is required.");
      return {
        name,
        peakPowerTw,
        peakPowerTW: peakPowerTw,
        peakIntensity18,
        a0,
        powerRatio,
        matchedA0,
        bubbleRadiusUm: bubbleRadiusM * 1e6,
        geometry: { areaUm2 },
        rayleighRangeM: rayleighMm * 1e-3,
        dephasingLengthM: dephasingM,
        pumpDepletionLengthM: pumpDepletionM,
        energyGainMeV: luEnergyMeV,
        spotToMatchedRadius: spotMatchRatio,
        pulseToBubbleRatio: pulseBubbleRatio,
        dephasingMm: dephasingM * 1e3,
        pumpDepletionMm: pumpDepletionM * 1e3,
        limitingLengthMm: Math.min(dephasingM, pumpDepletionM) * 1e3,
        luEnergyMeV,
        spotMatchRatio,
        pulseBubbleRatio,
        warnings
      };
    }

    const gaussianPowerTw = energyJ / durationFs * Math.sqrt(4 * Math.LN2 / Math.PI) * 1000 * q;
    const topHatPowerTw = energyJ / durationFs * 1000 * q;
    const gaussian = profile("Gaussian", gaussianPowerTw, 2 * gaussianPowerTw / areaUm2 * 100);
    const topHat = profile("Top-hat", topHatPowerTw, topHatPowerTw / areaUm2 * 100);

    const warnings = [];
    if (underdenseRatio >= 1) warnings.push("The plasma density is at or above critical density for this wavelength.");
    return {
      constants: C,
      plasma: {
        ne,
        electronDensityCm3: ne,
        omegaP,
        lambdaP: lambdaPUm * 1e-6,
        lambdaPUm,
        criticalDensityCm3,
        densityRatio: underdenseRatio,
        underdenseRatio,
        debyeLengthM: debyeNm * 1e-9,
        debyeNm,
        thermalSpeed: thermalSpeedMps,
        thermalSpeedFractionC: thermalSpeedMps / C.c * 100,
        thermalSpeedMps,
        omegaLaser,
        frequencyHz: omegaLaser / (2 * Math.PI),
        pCritTw,
        criticalPowerTW: pCritTw
      },
      geometry: { areaUm2, rayleighMm, rayleighRangeM: rayleighMm * 1e-3, pulseLengthUm: pulseLengthM * 1e6 },
      profiles: { gaussian, topHat },
      warnings
    };
  }

  return { constants: C, parseDensity, compute };
}));
