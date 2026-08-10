/**
 * Unit Test Suite for Ultrafast Dispersion Calculator
 * Verifies refractive indices and GVD/TOD/FOD against published SCHOTT / RefractiveIndex.INFO literature benchmarks.
 */

const fs = require('fs');
const path = require('path');
const { evaluateRefractiveIndex, computeDispersionProperties, computeAnalyticalBroadening, simulatePulsePropagation } = require('../assets/js/dispersion-engine.js');

const materialsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/data/materials.json'), 'utf8'));

let testsPassed = 0;
let testsFailed = 0;

function assertCloseTo(name, actual, expected, tolerancePercent = 0.5) {
  const diff = Math.abs(actual - expected);
  const relErr = (diff / Math.abs(expected)) * 100;
  if (relErr <= tolerancePercent) {
    console.log(`✅ [PASS] ${name}: Got ${actual.toFixed(5)}, Expected ${expected.toFixed(5)} (Error: ${relErr.toFixed(3)}%)`);
    testsPassed++;
  } else {
    console.error(`❌ [FAIL] ${name}: Got ${actual.toFixed(5)}, Expected ${expected.toFixed(5)} (Error: ${relErr.toFixed(3)}% > Tol ${tolerancePercent}%)`);
    testsFailed++;
  }
}

console.log('====================================================');
console.log('RUNNING DISPERSION ENGINE & SELLMEIER UNIT TESTS');
console.log('====================================================\n');

// 1. Fused Silica Benchmark @ 800 nm (Malitson 1965)
// Target n = 1.45332, GVD = 36.16 fs^2/mm
const fusedSilica = materialsData['Fused_Silica'];
const fs_props = computeDispersionProperties(fusedSilica, 800, 10);
assertCloseTo('Fused Silica n @ 800nm', fs_props.n, 1.45332, 0.05);
assertCloseTo('Fused Silica GVD @ 800nm', fs_props.gvd, 36.16, 1.5);

// 2. N-BK7 Benchmark @ 800 nm (SCHOTT catalog)
// Target n = 1.51078, GVD = 44.69 fs^2/mm
const nbk7 = materialsData['N-BK7'];
const nbk7_props = computeDispersionProperties(nbk7, 800, 10);
assertCloseTo('N-BK7 n @ 800nm', nbk7_props.n, 1.51078, 0.05);
assertCloseTo('N-BK7 GVD @ 800nm', nbk7_props.gvd, 44.69, 1.5);

// 3. Calcium Fluoride (CaF2) @ 800 nm (Malitson 1963)
// Target n = 1.43051, GVD = 27.87 fs^2/mm from the coefficients above.
const caf2 = materialsData['CaF2'];
const caf2_props = computeDispersionProperties(caf2, 800, 10);
assertCloseTo('CaF2 n @ 800nm', caf2_props.n, 1.43051, 0.05);
assertCloseTo('CaF2 GVD @ 800nm', caf2_props.gvd, 27.8734, 0.05);

// 4. Fused Silica @ 1030 nm (Ytterbium wavelength)
// Target n = 1.44978, GVD = 18.9 fs^2/mm
const fs_1030 = computeDispersionProperties(fusedSilica, 1030, 10);
assertCloseTo('Fused Silica n @ 1030nm', fs_1030.n, 1.44978, 0.05);
assertCloseTo('Fused Silica GVD @ 1030nm', fs_1030.gvd, 18.9, 2.0);

// 5. Fused Silica @ 1550 nm (Telecom zero-dispersion area)
// Target n = 1.44427, GVD = -27.9 fs^2/mm (Anomalous dispersion)
const fs_1550 = computeDispersionProperties(fusedSilica, 1550, 10);
assertCloseTo('Fused Silica n @ 1550nm', fs_1550.n, 1.44427, 0.05);
assertCloseTo('Fused Silica GVD @ 1550nm', fs_1550.gvd, -27.9, 2.0);

// 6. Stable fourth-order derivative and validity-range rejection
assertCloseTo('Fused Silica FOD @ 800nm', fs_props.fod, -11.4346, 0.1);
let rangeRejected = false;
try { computeDispersionProperties(fusedSilica, 200, 1); } catch (err) { rangeRejected = err instanceof RangeError; }
if (rangeRejected) { console.log('✅ [PASS] Material wavelength range is enforced'); testsPassed++; }
else { console.error('❌ [FAIL] Material wavelength range is enforced'); testsFailed++; }

const fs_sim = simulatePulsePropagation({ tau0_fs: 30, lambda0_nm: 800, thickness_mm: 10, mat: fusedSilica });
assertCloseTo('Pure GDD FFT broadening', fs_sim.tau_disp_fwhm, computeAnalyticalBroadening(30, fs_props.gdd), 0.2);

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED.`);
console.log('====================================================');

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
