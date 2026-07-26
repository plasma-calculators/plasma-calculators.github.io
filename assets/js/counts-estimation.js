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

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.add('visible');
}

function hideError() {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.classList.remove('visible');
}

function updateCrystalFields() {
  const crystal = document.getElementById('crystalSelect').value;
  const densityInput = document.getElementById('density');
  const lightYieldInput = document.getElementById('lightYield');
  
  if (crystal === 'Custom') {
    densityInput.disabled = false;
    lightYieldInput.disabled = false;
  } else {
    const data = CRYSTALS[crystal];
    densityInput.value = data.density;
    lightYieldInput.value = data.lightYield;
    densityInput.disabled = true;
    lightYieldInput.disabled = true;
  }
}

function updateCameraFields() {
  const camera = document.getElementById('cameraSelect').value;
  const fwcInput = document.getElementById('fwc');
  const adcBitsInput = document.getElementById('adcBits');
  const qeInput = document.getElementById('qe');
  const dynamicRangeInput = document.getElementById('dynamicRange');
  const readNoiseInput = document.getElementById('readNoise');
  
  if (camera === 'Custom') {
    fwcInput.disabled = false;
    adcBitsInput.disabled = false;
    qeInput.disabled = false;
    dynamicRangeInput.disabled = false;
    readNoiseInput.disabled = false;
  } else {
    const data = CAMERAS[camera];
    fwcInput.value = data.fwc;
    adcBitsInput.value = data.adcBits;
    qeInput.value = data.qe;
    
    if (data.dynamicRange !== null) {
      dynamicRangeInput.value = data.dynamicRange;
    } else {
      dynamicRangeInput.value = '';
    }
    
    if (data.readNoise !== null) {
      readNoiseInput.value = data.readNoise;
    } else {
      readNoiseInput.value = '';
    }
    
    fwcInput.disabled = true;
    adcBitsInput.disabled = true;
    qeInput.disabled = true;
    dynamicRangeInput.disabled = true;
    readNoiseInput.disabled = true;
  }
}

function calculateSignal() {
  hideError();

  // Retrieve inputs
  const dEdxMass = parseFloat(document.getElementById('dEdxMass').value);
  const density = parseFloat(document.getElementById('density').value);
  const thicknessCm = parseFloat(document.getElementById('thicknessCm').value);
  const lightYield = parseFloat(document.getElementById('lightYield').value);

  const fwc = parseFloat(document.getElementById('fwc').value);
  const adcBits = parseInt(document.getElementById('adcBits').value, 10);
  const qePercent = parseFloat(document.getElementById('qe').value);
  const fNumber = parseFloat(document.getElementById('fNumber').value);
  const focalLength = parseFloat(document.getElementById('focalLength').value);

  const objectDist = parseFloat(document.getElementById('objectDist').value);

  // Optional inputs
  const dynamicRangeStr = document.getElementById('dynamicRange').value.trim();
  const readNoiseStr = document.getElementById('readNoise').value.trim();

  const dynamicRangeInput = dynamicRangeStr !== '' ? parseFloat(dynamicRangeStr) : null;
  const readNoiseInput = readNoiseStr !== '' ? parseFloat(readNoiseStr) : null;

  // Validation
  if (isNaN(dEdxMass) || dEdxMass <= 0) return showError('Mass stopping power must be a positive number.');
  if (isNaN(density) || density <= 0) return showError('Density must be a positive number.');
  if (isNaN(thicknessCm) || thicknessCm <= 0) return showError('Thickness must be a positive number.');
  if (isNaN(lightYield) || lightYield < 0) return showError('Light yield must be greater than or equal to 0.');
  if (isNaN(fwc) || fwc <= 0) return showError('Full well capacity must be a positive number.');
  if (isNaN(adcBits) || adcBits < 1 || adcBits > 32) return showError('ADC resolution must be between 1 and 32 bits.');
  if (isNaN(qePercent) || qePercent < 0 || qePercent > 100) return showError('Quantum Efficiency must be between 0% and 100%.');
  if (isNaN(fNumber) || fNumber <= 0) return showError('Lens f-number must be a positive number.');
  if (isNaN(focalLength) || focalLength <= 0) return showError('Focal length must be a positive number.');
  if (isNaN(objectDist) || objectDist <= 0) return showError('Object distance must be a positive number.');
  if (dynamicRangeInput !== null && (isNaN(dynamicRangeInput) || dynamicRangeInput <= 0)) return showError('Dynamic Range must be a positive number.');
  if (readNoiseInput !== null && (isNaN(readNoiseInput) || readNoiseInput < 0)) return showError('Read Noise must be a non-negative number.');

  if (objectDist <= focalLength) {
    return showError('Object distance must be strictly greater than lens focal length (to form a real image).');
  }

  // Convert QE percent to fraction
  const qe = qePercent / 100;

  // 1. Energy deposition in the crystal
  const energyDepositedMev = dEdxMass * density * thicknessCm;
  const energyDepositedKev = energyDepositedMev * 1000;

  // 2. Scintillation Photon Generation
  const photonsGenerated = energyDepositedKev * lightYield;

  // 3. Optical Collection Efficiency
  const magnification = focalLength / (objectDist - focalLength);
  const inverseMagTerm = Math.pow(1 + (1 / magnification), 2);

  const etaIsotropic = 1 / (16 * Math.pow(fNumber, 2) * inverseMagTerm);
  const etaLambertian = 1 / (4 * Math.pow(fNumber, 2) * inverseMagTerm);

  // 4. Sensor Photoelectron Conversion
  const electronsIso = photonsGenerated * etaIsotropic * qe;
  const electronsLamb = photonsGenerated * etaLambertian * qe;

  // 5. ADC Conversion
  const maxAdc = Math.pow(2, adcBits) - 1;
  const electronsPerAdc = fwc / maxAdc;

  // Round down to nearest integer (Counts cannot have decimals)
  const adcIso = Math.floor(electronsIso / electronsPerAdc);
  const adcLamb = Math.floor(electronsLamb / electronsPerAdc);

  // 6. Dynamic Range & SNR (optional)
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

  // Display Results
  document.getElementById('energyDeposited').textContent = formatValue(energyDepositedMev, 1) + ' MeV';
  document.getElementById('photonsGenerated').textContent = formatScientific(photonsGenerated, 3) + ' photons';
  document.getElementById('conversionGain').textContent = formatValue(electronsPerAdc, 2) + ' e⁻/DN';

  // Dynamic Range Cross-Check
  const drHeader = document.getElementById('drCrossCheckHeader');
  const drGrid = document.getElementById('drCrossCheckGrid');
  if (impliedSaturation !== null) {
    drHeader.style.display = '';
    drGrid.style.display = '';
    document.getElementById('impliedSaturation').textContent = formatInteger(impliedSaturation) + ' e⁻';
    document.getElementById('drReadNoise').textContent = formatValue(dynamicRangeInput, 1) + ' dB / ' + formatValue(readNoiseInput, 1) + ' e⁻';
  } else {
    drHeader.style.display = 'none';
    drGrid.style.display = 'none';
  }

  // Isotropic
  document.getElementById('effIsotropic').textContent = formatScientific(etaIsotropic, 1);
  document.getElementById('electronsIsotropic').textContent = formatValue(electronsIso, 1) + ' e⁻';
  document.getElementById('adcIsotropic').textContent = formatInteger(adcIso) + ' counts';

  // Isotropic SNR
  const snrIsoCard = document.getElementById('snrIsoCard');
  if (snrIso !== null) {
    snrIsoCard.style.display = '';
    const snrIsoDb = 20 * Math.log10(snrIso);
    document.getElementById('snrIsotropic').textContent = formatValue(snrIso, 2) + ' (' + formatValue(snrIsoDb, 1) + ' dB)';
  } else {
    snrIsoCard.style.display = 'none';
  }

  // Lambertian
  document.getElementById('effLambertian').textContent = formatScientific(etaLambertian, 1);
  document.getElementById('electronsLambertian').textContent = formatValue(electronsLamb, 1) + ' e⁻';
  document.getElementById('adcLambertian').textContent = formatInteger(adcLamb) + ' counts';

  // Lambertian SNR
  const snrLambCard = document.getElementById('snrLambCard');
  if (snrLamb !== null) {
    snrLambCard.style.display = '';
    const snrLambDb = 20 * Math.log10(snrLamb);
    document.getElementById('snrLambertian').textContent = formatValue(snrLamb, 2) + ' (' + formatValue(snrLambDb, 1) + ' dB)';
  } else {
    snrLambCard.style.display = 'none';
  }
}

document.getElementById('calculateBtn').addEventListener('click', calculateSignal);

document.getElementById('crystalSelect').addEventListener('change', () => {
  updateCrystalFields();
  calculateSignal();
});

document.getElementById('cameraSelect').addEventListener('change', () => {
  updateCameraFields();
  calculateSignal();
});

// Initial run on page load
updateCrystalFields();
updateCameraFields();
calculateSignal();
