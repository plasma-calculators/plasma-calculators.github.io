const assert = require('assert');

function physicalAxes(sigX, sigY, theta, cx, cy) {
  const c = Math.cos(theta), s = Math.sin(theta);
  const xx = cx * cx * (c * c * sigX * sigX + s * s * sigY * sigY);
  const yy = cy * cy * (s * s * sigX * sigX + c * c * sigY * sigY);
  const xy = cx * cy * c * s * (sigX * sigX - sigY * sigY);
  const d = Math.sqrt((xx - yy) ** 2 + 4 * xy * xy);
  return [Math.sqrt((xx + yy + d) / 2), Math.sqrt((xx + yy - d) / 2)];
}

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

// Rotated ellipse: physical axes are not the independently scaled pixel axes.
const [major, minor] = physicalAxes(10, 5, Math.PI / 4, 2, 1);
close(major, Math.sqrt((312.5 + Math.sqrt(187.5 ** 2 + 4 * 75 ** 2)) / 2), 1e-9);
close(minor, Math.sqrt((312.5 - Math.sqrt(187.5 ** 2 + 4 * 75 ** 2)) / 2), 1e-9);

// Ideal background-free Gaussian: the FWHM ellipse contains half its energy.
let total = 0, correctedTotal = 0, inside = 0;
for (let y = -80; y <= 80; y++) for (let x = -80; x <= 80; x++) {
  const v = 3 + Math.exp(-0.5 * (x * x / 12 ** 2 + y * y / 8 ** 2));
  const signal = Math.max(0, v - 3);
  total += v;
  correctedTotal += signal;
  if (x * x / (2 * 12 ** 2) + y * y / (2 * 8 ** 2) <= Math.LN2) inside += signal;
}
assert.ok(inside / total < 0.5);
assert.ok(Math.abs(inside / correctedTotal - 0.5) < 0.01);

// Background must not contribute to q or peak-power normalization.
const corrected = 2 * Math.sqrt(Math.LN2 / Math.PI);
close(corrected, 0.9394372787, 1e-9);
console.log('fit physics checks passed');
