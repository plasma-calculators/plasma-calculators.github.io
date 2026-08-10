const assert = require('node:assert/strict');
const { compute, parseDensity } = require('../assets/js/lwfa-engine.js');

const close = (actual, expected, tol) => assert.ok(Math.abs(actual - expected) <= tol, `${actual} != ${expected}`);

close(parseDensity('1.044×10^18'), 1.044e18, 1e8);
const r = compute({ durationFs: 30, energyJ: 3, waistUm: 10.9, wavelengthUm: 0.8, q: 1, directDensity: '1.044e18', temperatureEv: 10 });
close(r.profiles.gaussian.peakPowerTW, 93.9, 0.2);
close(r.profiles.topHat.peakPowerTW, 100, 0.1);
close(r.plasma.electronDensityCm3, 1.044e18, 1e12);
assert.ok(r.profiles.gaussian.warnings.length > 0);
const gas = compute({ durationFs: 30, energyJ: 3, waistUm: 10.9, wavelengthUm: .8, q: 1, densitySource: 'gas', pressureMbar: 18.7798086, gasTemperatureK: 293.15, backgroundElectrons: 2, dopantElectrons: 7, dopantPercent: 5, temperatureEv: 10 });
close(gas.plasma.electronDensityCm3, 1.044e18, 2e15);
assert.throws(() => compute({ durationFs: 30, energyJ: 3, waistUm: 10, wavelengthUm: .8, q: 1.1, directDensity: 1e18 }));
assert.throws(() => compute({ durationFs: 30, energyJ: 3, waistUm: 10, wavelengthUm: .8, q: 1, directDensity: 0 }));
console.log('LWFA tests passed');
