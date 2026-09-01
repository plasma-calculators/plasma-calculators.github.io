const assert = require('node:assert/strict');
const { compute, computeLaserProfiles, parseDensity } = require('../assets/js/lwfa-engine.js');

const close = (actual, expected, tol) => assert.ok(Math.abs(actual - expected) <= tol, `${actual} != ${expected}`);

close(parseDensity('1.044×10^18'), 1.044e18, 1e8);
const referenceProfiles = computeLaserProfiles({ durationFs: 25, energyJ: 1.75, waistUm: 12.73, wavelengthUm: 0.8, q: 0.35 });
close(referenceProfiles.gaussian.peakPowerTW, 23.0162133281, 1e-9);
close(referenceProfiles.gaussian.peakIntensity18, 9.0418477483, 1e-9);
close(referenceProfiles.gaussian.a0, 2.0552199092, 1e-9);
close(referenceProfiles.topHat.peakPowerTW, 24.5, 1e-12);
close(referenceProfiles.topHat.peakIntensity18, 4.8123743614, 1e-9);
close(referenceProfiles.topHat.a0, 1.4993720319, 1e-9);
const r = compute({ durationFs: 30, energyJ: 3, waistUm: 10.9, wavelengthUm: 0.8, q: 1, directDensity: '1.044e18', temperatureEv: 10 });
close(r.profiles.gaussian.peakPowerTW, 93.9, 0.2);
close(r.profiles.topHat.peakPowerTW, 100, 0.1);
const engineProfiles = computeLaserProfiles({ durationFs: 30, energyJ: 3, waistUm: 10.9, wavelengthUm: 0.8, q: 1 });
for (const name of ['gaussian', 'topHat']) {
  close(r.profiles[name].peakPowerTW, engineProfiles[name].peakPowerTW, 1e-12);
  close(r.profiles[name].peakIntensity18, engineProfiles[name].peakIntensity18, 1e-12);
  close(r.profiles[name].a0, engineProfiles[name].a0, 1e-12);
}
close(r.plasma.electronDensityCm3, 1.044e18, 1e12);
assert.ok(Number.isFinite(r.plasma.omegaLaser));
assert.ok(Number.isFinite(r.plasma.frequencyHz));
assert.ok(Number.isFinite(r.profiles.gaussian.rayleighRangeM));
assert.ok(Number.isFinite(r.profiles.gaussian.spotToMatchedRadius));
assert.ok(Number.isFinite(r.profiles.gaussian.pulseToBubbleRatio));
assert.ok(Number.isFinite(r.profiles.gaussian.limitingLengthMm));
assert.ok(Number.isFinite(r.profiles.topHat.spotToMatchedRadius));
assert.ok(Number.isFinite(r.profiles.topHat.pulseToBubbleRatio));
assert.ok(Number.isFinite(r.profiles.topHat.limitingLengthMm));
close(r.profiles.gaussian.rayleighRangeM * 1000, 0.4666, 0.001);
close(r.profiles.gaussian.spotToMatchedRadius, 0.4759, 0.001);
close(r.profiles.topHat.spotToMatchedRadius, 0.5571, 0.001);
close(r.profiles.gaussian.pulseToBubbleRatio, 0.3926, 0.001);
close(r.profiles.topHat.pulseToBubbleRatio, 0.4597, 0.001);
close(r.profiles.gaussian.limitingLengthMm, 15.0065, 0.001);
close(r.profiles.topHat.limitingLengthMm, 15.0065, 0.001);
assert.ok(r.profiles.gaussian.warnings.length > 0);
const gas = compute({ durationFs: 30, energyJ: 3, waistUm: 10.9, wavelengthUm: .8, q: 1, densitySource: 'gas', pressureMbar: 18.7798086, gasTemperatureK: 293.15, backgroundElectrons: 2, dopantElectrons: 7, dopantPercent: 5, temperatureEv: 10 });
close(gas.plasma.electronDensityCm3, 1.044e18, 2e15);
assert.throws(() => compute({ durationFs: 30, energyJ: 3, waistUm: 10, wavelengthUm: .8, q: 1.1, directDensity: 1e18 }));
assert.throws(() => compute({ durationFs: 30, energyJ: 3, waistUm: 10, wavelengthUm: .8, q: 1, directDensity: 0 }));
console.log('LWFA tests passed');
