/**
 * Dispersion Engine & FFT Pulse Propagation Physics Library
 * Computes Sellmeier refractive index, high-order derivatives, GVD, GDD, TOD, FOD,
 * spectral phase expansion, and FFT time-domain pulse propagation.
 */

const SPEED_OF_LIGHT = 299792458; // m/s in vacuum
const C_NM_FS = 299.792458; // nm/fs or um/fs * 1e3

/**
 * Evaluate refractive index n(lambda) for a material.
 * @param {Object} mat Material entry object
 * @param {number} lambdaNm Wavelength in nanometers
 * @returns {number} Refractive index n
 */
function evaluateRefractiveIndex(mat, lambdaNm) {
  if (!mat) return 1.0;
  if (mat.type === 'constant') return mat.n || 1.0;

  const lambdaUm = lambdaNm / 1000.0;
  const l2 = lambdaUm * lambdaUm;

  if (mat.type === 'sellmeier_1') {
    // n^2 = 1 + B1*l2/(l2-C1) + B2*l2/(l2-C2) + B3*l2/(l2-C3)
    let n2 = 1.0;
    const B = mat.B || [];
    const C = mat.C || [];
    for (let i = 0; i < B.length; i++) {
      n2 += (B[i] * l2) / (l2 - C[i]);
    }
    return Math.sqrt(Math.max(1.0, n2));
  }

  if (mat.type === 'ciddor') {
    // Air dispersion model (Peck & Reeder / Ciddor approximation)
    const sigma2 = 1.0 / (lambdaUm * lambdaUm); // um^-2
    const nMinus1 = mat.params.a0 / (mat.params.b0 - sigma2) + mat.params.a1 / (mat.params.b1 - sigma2);
    return 1.0 + nMinus1;
  }

  if (mat.type === 'sellmeier_custom_bbo') {
    // n_o^2 = 2.7359 + 0.01878 / (l2 - 0.01822) - 0.01354 * l2
    const n2 = mat.B[0] + mat.B[1] / (l2 - mat.B[2]) - mat.B[3] * l2;
    return Math.sqrt(Math.max(1.0, n2));
  }

  if (mat.type === 'sellmeier_custom_bbo_e') {
    // n_e^2 = 2.3753 + 0.01224 / (l2 - 0.01667) - 0.01516 * l2
    const n2 = mat.B[0] + mat.B[1] / (l2 - mat.B[2]) - mat.B[3] * l2;
    return Math.sqrt(Math.max(1.0, n2));
  }

  if (mat.type === 'sellmeier_custom_lbo') {
    // n^2 = 2.45414 + 0.011249 / (l2 - 0.01135) - 0.0145 * l2
    const n2 = mat.B[0] + mat.B[1] / (l2 - mat.C[0]) - mat.B[3] * l2;
    return Math.sqrt(Math.max(1.0, n2));
  }

  return 1.0;
}

/**
 * High-precision numerical differentiation using central finite differences.
 * Computes dn/dlambda, d2n/dlambda2, d3n/dlambda3, d4n/dlambda4 at lambda0 (in um).
 */
function computeDerivatives(mat, lambdaNm) {
  const lambdaUm = lambdaNm / 1000.0;
  // Step size for um wavelength grid
  const h = 0.0002; // 0.2 nm in um

  const f = (xUm) => evaluateRefractiveIndex(mat, xUm * 1000.0);

  const f_m2 = f(lambdaUm - 2 * h);
  const f_m1 = f(lambdaUm - h);
  const f_0  = f(lambdaUm);
  const f_p1 = f(lambdaUm + h);
  const f_p2 = f(lambdaUm + 2 * h);

  // 1st derivative dn/dlambda (um^-1)
  const dn_dlambda = (f_m2 - 8 * f_m1 + 8 * f_p1 - f_p2) / (12 * h);

  // 2nd derivative d2n/dlambda2 (um^-2)
  const d2n_dlambda2 = (-f_m2 + 16 * f_m1 - 30 * f_0 + 16 * f_p1 - f_p2) / (12 * h * h);

  // 3rd derivative d3n/dlambda3 (um^-3)
  const f_m3 = f(lambdaUm - 3 * h);
  const f_p3 = f(lambdaUm + 3 * h);
  const d3n_dlambda3 = (f_m3 - 8 * f_m2 + 13 * f_m1 - 13 * f_p1 + 8 * f_p2 - f_p3) / (8 * h * h * h);

  // 4th derivative d4n/dlambda4 (um^-4)
  const d4n_dlambda4 = (f_m2 - 4 * f_m1 + 6 * f_0 - 4 * f_p1 + f_p2) / (h * h * h * h);

  return {
    n: f_0,
    dn_dlambda,
    d2n_dlambda2,
    d3n_dlambda3,
    d4n_dlambda4
  };
}

/**
 * Computes Group Index, GVD, GDD, TOD, FOD for a material & thickness.
 * Wavelength lambda in nm, thickness L in mm.
 */
function computeDispersionProperties(mat, lambdaNm, thicknessMm) {
  const lambdaUm = lambdaNm / 1000.0;
  const cUmFs = C_NM_FS / 1000.0; // ~0.299792458 um/fs

  const derivs = computeDerivatives(mat, lambdaNm);
  const n = derivs.n;
  const dn_dl = derivs.dn_dlambda;
  const d2n_dl2 = derivs.d2n_dlambda2;
  const d3n_dl3 = derivs.d3n_dlambda3;
  const d4n_dl4 = derivs.d4n_dlambda4;

  // Group Index ng = n - lambda * dn/dlambda
  const ng = n - lambdaUm * dn_dl;

  // GVD [fs^2 / mm]
  // Formula: GVD = (lambda^3 / (2 * pi * c^2)) * d2n/dlambda2
  // lambda in um, c in um/fs -> lambda^3 / (2*pi*c^2) gives fs^2/um. Multiply by 1000 for fs^2/mm.
  const gvd_fs2_um = (Math.pow(lambdaUm, 3) / (2 * Math.PI * Math.pow(cUmFs, 2))) * d2n_dl2;
  const gvd = gvd_fs2_um * 1000.0; // fs^2 / mm

  // GDD [fs^2] = GVD * L_mm
  const gdd = gvd * thicknessMm;

  // TOD [fs^3 / mm]
  // Formula: TOD = - (lambda^4 / (4 * pi^2 * c^3)) * (3 * d2n/dlambda2 + lambda * d3n/dlambda3)
  const tod_fs3_um = - (Math.pow(lambdaUm, 4) / (4 * Math.PI * Math.PI * Math.pow(cUmFs, 3))) * (3.0 * d2n_dl2 + lambdaUm * d3n_dl3);
  const tod = tod_fs3_um * 1000.0; // fs^3 / mm

  // Total TOD [fs^3] = TOD * L_mm
  const tod_total = tod * thicknessMm;

  // FOD [fs^4 / mm]
  // Formula: FOD = (lambda^5 / (8 * pi^3 * c^4)) * (12 * d2n/dlambda2 + 8 * lambda * d3n/dlambda3 + lambda^2 * d4n_dl4)
  const fod_fs4_um = (Math.pow(lambdaUm, 5) / (8 * Math.pow(Math.PI, 3) * Math.pow(cUmFs, 4))) * (12.0 * d2n_dl2 + 8.0 * lambdaUm * d3n_dl3 + Math.pow(lambdaUm, 2) * d4n_dl4);
  const fod = fod_fs4_um * 1000.0; // fs^4 / mm

  // Total FOD [fs^4] = FOD * L_mm
  const fod_total = fod * thicknessMm;

  return {
    n,
    ng,
    dn_dlambda: dn_dl,
    d2n_dlambda2: d2n_dl2,
    d3n_dlambda3: d3n_dl3,
    d4n_dlambda4: d4n_dl4,
    gvd,      // fs^2 / mm
    gdd,      // fs^2
    tod,      // fs^3 / mm
    tod_total,// fs^3
    fod,      // fs^4 / mm
    fod_total // fs^4
  };
}

/**
 * Analytical Gaussian broadening calculation (GDD only).
 */
function computeAnalyticalBroadening(tau0_fs, gdd_fs2) {
  if (tau0_fs <= 0) return 0;
  const factor = (4.0 * Math.LN2 * gdd_fs2) / (tau0_fs * tau0_fs);
  return tau0_fs * Math.sqrt(1.0 + factor * factor);
}

/**
 * 1D Cooley-Tukey Radix-2 FFT (Complex to Complex).
 * Input array x is formatted as [re0, im0, re1, im1, ...].
 */
function fftComplex(data, inverse = false) {
  const N = data.length / 2;
  if (N <= 1) return;

  // Bit reversal permutation
  for (let i = 0, j = 0; i < N; i++) {
    if (i < j) {
      const reTemp = data[2 * i];
      const imTemp = data[2 * i + 1];
      data[2 * i] = data[2 * j];
      data[2 * i + 1] = data[2 * j + 1];
      data[2 * j] = reTemp;
      data[2 * j + 1] = imTemp;
    }
    let m = N >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }

  // Butterfly computation
  for (let len = 2; len <= N; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (inverse ? 2.0 : -2.0) * Math.PI / len;
    const wStepRe = Math.cos(angle);
    const wStepIm = Math.sin(angle);

    for (let i = 0; i < N; i += len) {
      let wRe = 1.0;
      let wIm = 0.0;
      for (let j = 0; j < halfLen; j++) {
        const uRe = data[2 * (i + j)];
        const uIm = data[2 * (i + j) + 1];

        const vIdx = 2 * (i + j + halfLen);
        const vRe = data[vIdx] * wRe - data[vIdx + 1] * wIm;
        const vIm = data[vIdx] * wIm + data[vIdx + 1] * wRe;

        data[2 * (i + j)] = uRe + vRe;
        data[2 * (i + j) + 1] = uIm + vIm;
        data[vIdx] = uRe - vRe;
        data[vIdx + 1] = uIm - vIm;

        const nextWRe = wRe * wStepRe - wIm * wStepIm;
        const nextWIm = wRe * wStepIm + wIm * wStepRe;
        wRe = nextWRe;
        wIm = nextWIm;
      }
    }
  }

  if (inverse) {
    for (let i = 0; i < 2 * N; i++) {
      data[i] /= N;
    }
  }
}

/**
 * Calculates FWHM duration of an intensity profile array.
 */
function calculateFWHM(tArray, intensityArray) {
  let maxI = 0;
  let maxIdx = 0;
  for (let i = 0; i < intensityArray.length; i++) {
    if (intensityArray[i] > maxI) {
      maxI = intensityArray[i];
      maxIdx = i;
    }
  }
  if (maxI <= 0) return 0;

  const halfMax = maxI / 2.0;

  // Find left half-max point
  let tLeft = tArray[0];
  for (let i = maxIdx; i >= 0; i--) {
    if (intensityArray[i] <= halfMax) {
      const t1 = tArray[i];
      const t2 = tArray[i + 1];
      const y1 = intensityArray[i];
      const y2 = intensityArray[i + 1];
      tLeft = y2 === y1 ? t1 : t1 + (halfMax - y1) * (t2 - t1) / (y2 - y1);
      break;
    }
  }

  // Find right half-max point
  let tRight = tArray[tArray.length - 1];
  for (let i = maxIdx; i < intensityArray.length - 1; i++) {
    if (intensityArray[i] <= halfMax) {
      const t1 = tArray[i - 1];
      const t2 = tArray[i];
      const y1 = intensityArray[i - 1];
      const y2 = intensityArray[i];
      tRight = y2 === y1 ? t2 : t1 + (halfMax - y1) * (t2 - t1) / (y2 - y1);
      break;
    }
  }

  return Math.abs(tRight - tLeft);
}

/**
 * Simulates pulse propagation through dispersive medium via FFT + Spectral Phase.
 */
function simulatePulsePropagation(options) {
  const {
    tau0_fs,          // Input pulse duration FWHM (fs)
    lambda0_nm,       // Central wavelength (nm)
    thickness_mm,     // Thickness (mm)
    mat,              // Material object
    gdd_comp = 0,     // Compensation GDD (fs^2)
    tod_comp = 0,     // Compensation TOD (fs^3)
    fod_comp = 0,     // Compensation FOD (fs^4)
    customSpectrum = null // Optional array of { wavelength, intensity }
  } = options;

  const N = 8192; // Number of FFT points (padded to get high spectral/temporal resolution)
  const tMax_fs = Math.max(2000, tau0_fs * 40.0); // Larger time window to prevent aliasing
  const dt = (2.0 * tMax_fs) / N;
  const domega = (2.0 * Math.PI) / (2.0 * tMax_fs); // rad/fs

  const w0 = (2.0 * Math.PI * C_NM_FS) / lambda0_nm; // rad/fs

  const tArray = new Float64Array(N);
  const omegaArray = new Float64Array(N);
  const wavelengthArray = new Float64Array(N);
  const inputT = new Float64Array(2 * N); // [re, im, ...]

  // Build time grid & initial Gaussian pulse (tau0_fs is the intensity FWHM)
  const sigma_t = tau0_fs / (2.0 * Math.sqrt(Math.LN2));
  for (let i = 0; i < N; i++) {
    const t = -tMax_fs + i * dt;
    tArray[i] = t;
    const env = Math.exp(-0.5 * (t / sigma_t) * (t / sigma_t));
    inputT[2 * i] = env;     // Re
    inputT[2 * i + 1] = 0.0; // Im
  }

  // Forward FFT to get Spectrum E(omega)
  const specField = new Float64Array(inputT);
  fftComplex(specField, false);

  // Reorder frequency grid & compute dispersion spectral phase
  const dispProps = computeDispersionProperties(mat, lambda0_nm, thickness_mm);
  const gdd_tot = dispProps.gdd;
  const tod_tot = dispProps.tod_total;

  const specFieldDispersed = new Float64Array(2 * N);
  const specFieldCompensated = new Float64Array(2 * N);

  const spectralPhase = new Float64Array(N);
  const spectralIntensity = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    // Frequency index mapping (-N/2 to N/2)
    const k = i < N / 2 ? i : i - N;
    const dw = k * domega; // w - w0 (rad/fs)
    omegaArray[i] = w0 + dw;

    const wlNm = (2.0 * Math.PI * C_NM_FS) / (w0 + dw);
    wavelengthArray[i] = wlNm;

    // Dispersive phase polynomial expansion (up to 3rd order: GDD and TOD):
    // Phi(dw) = 1/2 * GDD * dw^2 + 1/6 * TOD * dw^3
    const phi_med = 0.5 * gdd_tot * dw * dw + (1.0 / 6.0) * tod_tot * Math.pow(dw, 3);
    const phi_user_comp = 0.5 * gdd_comp * dw * dw + (1.0 / 6.0) * tod_comp * Math.pow(dw, 3);

    const phi_net = phi_med + phi_user_comp;
    spectralPhase[i] = phi_net;

    const reIn = specField[2 * i];
    const imIn = specField[2 * i + 1];
    spectralIntensity[i] = reIn * reIn + imIn * imIn;

    // Apply medium dispersion
    const cosP = Math.cos(phi_med);
    const sinP = Math.sin(phi_med);
    specFieldDispersed[2 * i] = reIn * cosP - imIn * sinP;
    specFieldDispersed[2 * i + 1] = reIn * sinP + imIn * cosP;

    // Apply compensated phase (medium + comp)
    const cosC = Math.cos(phi_net);
    const sinC = Math.sin(phi_net);
    specFieldCompensated[2 * i] = reIn * cosC - imIn * sinC;
    specFieldCompensated[2 * i + 1] = reIn * sinC + imIn * cosC;
  }

  // Inverse FFT to get Time-Domain Input, Dispersed and Compensated pulses
  const specFieldInput = new Float64Array(specField);
  fftComplex(specFieldInput, true);
  fftComplex(specFieldDispersed, true);
  fftComplex(specFieldCompensated, true);

  const inputIntensity = new Float64Array(N);
  const dispersedIntensity = new Float64Array(N);
  const compensatedIntensity = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const rIn = specFieldInput[2 * i];
    const iIn = specFieldInput[2 * i + 1];
    inputIntensity[i] = rIn * rIn + iIn * iIn;

    const rD = specFieldDispersed[2 * i];
    const iD = specFieldDispersed[2 * i + 1];
    dispersedIntensity[i] = rD * rD + iD * iD;

    const rC = specFieldCompensated[2 * i];
    const iC = specFieldCompensated[2 * i + 1];
    compensatedIntensity[i] = rC * rC + iC * iC;
  }

  // Calculate FWHM pulse durations
  const tau_in_fwhm = calculateFWHM(tArray, inputIntensity);
  const tau_disp_fwhm = calculateFWHM(tArray, dispersedIntensity);
  const tau_comp_fwhm = calculateFWHM(tArray, compensatedIntensity);

  const compressionFactor = tau_in_fwhm > 0 ? tau_disp_fwhm / tau_in_fwhm : 1.0;

  const spectralIntensityOut = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const reC = specFieldCompensated[2 * i];
    const imC = specFieldCompensated[2 * i + 1];
    spectralIntensityOut[i] = reC * reC + imC * imC;
  }

  return {
    dispProps,
    tArray,
    wavelengthArray,
    omegaArray,
    spectralIntensity,
    spectralIntensityOut,
    spectralPhase,
    inputIntensity,
    dispersedIntensity,
    compensatedIntensity,
    tau_in_fwhm,
    tau_disp_fwhm,
    tau_comp_fwhm,
    compressionFactor
  };
}

// Export for Node.js unit tests or browser global window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    evaluateRefractiveIndex,
    computeDerivatives,
    computeDispersionProperties,
    computeAnalyticalBroadening,
    simulatePulsePropagation,
    calculateFWHM
  };
} else if (typeof window !== 'undefined') {
  window.DispersionEngine = {
    evaluateRefractiveIndex,
    computeDerivatives,
    computeDispersionProperties,
    computeAnalyticalBroadening,
    simulatePulsePropagation,
    calculateFWHM
  };
}
