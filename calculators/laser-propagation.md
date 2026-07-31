---
layout: single
title: "NF/FF Calculator"
permalink: /calculators/laser-propagation/
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
<script src="/assets/js/vendor/utif.js"></script>
<script src="/assets/js/laser-propagation.js" defer></script>

<div class="calculator-container compact-mode">
  <div class="calculator-sidebar">
    <h3>Input Parameters</h3>
    <form id="propagation-form" onsubmit="return false;">
      <h4 class="input-section-title">Near-Field Intensity</h4>
      <div class="form-group">
        <label for="example-select">Load Example Image</label>
        <select id="example-select" style="padding: 0.25rem; font-size: 0.8rem; border-radius: 4px; width: 100%; border: 1px solid #d1d5db; background: #fff; margin-bottom: 0.5rem;">
          <option value="">-- Choose Example --</option>
          <option value="/example_files/jeti_nf/1425_AmpliON_MultipassON_CamND20ND10_HighPower+Att_170203_.png">Jeti NF 1425</option>
          <option value="/example_files/jeti_nf/1429_AmpliON_MultipassON_CamND20ND10_HighPower+Att_170207_.png">Jeti NF 1429</option>
          <option value="/example_files/jeti_nf/1434_AmpliON_MultipassON_CamND20ND10_HighPower+Att_170212_.png">Jeti NF 1434</option>
          <option value="/example_files/jeti_nf/1440_AmpliON_MultipassON_CamND20ND10_HighPower+Att_170217_.png">Jeti NF 1440</option>
          <option value="/example_files/jeti_nf/1441_AmpliON_MultipassON_CamND20ND10_HighPower+Att_170218_.png">Jeti NF 1441</option>
        </select>
      </div>

      <div class="form-group">
        <label for="image-upload" style="display: block; margin-bottom: 0.25rem;">
          <span style="display: block;">Or Upload Custom Profile</span>
          <span style="display: block; font-weight: normal; font-size: 0.85em; color: #4b5563;">(PNG, JPEG, TIF, TIFF)</span>
        </label>
        <input type="file" id="image-upload" accept=".png,.jpg,.jpeg,.tif,.tiff" style="font-size: 0.8rem; padding: 0.2rem; width: 100%;">
      </div>

      <div class="form-group" style="margin-bottom: 0.4rem;">
        <label class="radio-label" style="font-size: 0.78rem; font-weight: 600;">
          <input type="checkbox" id="enable-phase" style="width: auto; margin-right: 0.35rem;"> Upload Wavefront / Phase
        </label>
      </div>

      <div id="phase-upload-group" class="form-group" style="display: none;">
        <label for="phase-upload" style="display: block; margin-bottom: 0.25rem;">
          <span style="display: block;">Upload Phase Profile</span>
          <span style="display: block; font-weight: normal; font-size: 0.85em; color: #4b5563;">(PNG, JPEG, TIF, TIFF)</span>
        </label>
        <input type="file" id="phase-upload" accept=".png,.jpg,.jpeg,.tif,.tiff" style="font-size: 0.8rem; padding: 0.2rem; width: 100%;">
        <span class="input-hint" style="display: block; font-size: 0.68rem; color: #4b5563; margin-top: 0.25rem;">Note: Both intensity and phase images should cover the exact same field-of-view (ROI).</span>
      </div>

      <h4 class="input-section-title">Spatial Calibration</h4>
      <div class="form-group" style="margin-bottom: 0.4rem;">
        <label class="radio-label" style="font-size: 0.78rem; font-weight: 600;">
          <input type="checkbox" id="calib-same" style="width: auto; margin-right: 0.35rem;"> Same X and Y Calibration
        </label>
      </div>

      <div class="form-group">
        <label for="calib-x">Calibration X (mm/pixel)</label>
        <input type="number" id="calib-x" value="0.1925" min="0.0001" step="0.0001" class="small-input" required>
      </div>

      <div id="calib-y-group" class="form-group">
        <label for="calib-y">Calibration Y (mm/pixel)</label>
        <input type="number" id="calib-y" value="0.2240" min="0.0001" step="0.0001" class="small-input" required>
      </div>

      <h4 class="input-section-title">Optical Parameters</h4>
      <div class="form-group">
        <label for="wavelength">Wavelength, $\lambda$ (nm)</label>
        <input type="number" id="wavelength" value="800" min="100" max="2000" step="1" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="focal-length">OAP Focal Length, $f$ (mm)</label>
        <input type="number" id="focal-length" value="2500" min="10" max="20000" step="10" class="small-input" required>
      </div>
      <div class="form-group">
        <label for="input-beam-diameter">Input Beam Diameter, $D_{\text{in}}$ (mm)</label>
        <input type="number" id="input-beam-diameter" placeholder="Optional (e.g. 50)" min="0.1" max="1000" step="0.1" class="small-input">
      </div>

      <div id="zernike-section" style="display: block;">
        <h4 class="input-section-title">Wavefront Aberrations (Zernike)</h4>
        <p style="font-size: 0.72rem; color: #4b5563; margin-top: -0.25rem; margin-bottom: 0.5rem; line-height: 1.25;">
          Specify Zernike coefficients in units of waves ($\lambda$). Noll ordering Z1–Z21. Values restricted to range [-1.0, 1.0].
        </p>

        <!-- 0th Order -->
        <div style="margin: 0 0 0.35rem 0;">
          <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; font-weight: 700;">0th Order — Piston</span>
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
          <label for="zernike-z1" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_1$ Piston</label>
          <input type="number" id="zernike-z1" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>
        <span style="font-size:0.62rem; color:#9ca3af; display:block; margin-bottom:0.6rem; margin-top:-0.15rem;">Piston shifts global phase only; intensity is unchanged.</span>

        <!-- 1st Order -->
        <div style="margin: 0.5rem 0 0.35rem 0; padding-top: 0.4rem; border-top: 1px solid #e5e7eb;">
          <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; font-weight: 700;">1st Order — Tilt</span>
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z2" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_2$ Tilt X</label>
          <input type="number" id="zernike-z2" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z3" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_3$ Tilt Y</label>
          <input type="number" id="zernike-z3" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>

        <!-- 2nd Order -->
        <div style="margin: 0.5rem 0 0.35rem 0; padding-top: 0.4rem; border-top: 1px solid #e5e7eb;">
          <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; font-weight: 700;">2nd Order — Astigmatism / Defocus</span>
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z4" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_4$ Defocus</label>
          <input type="number" id="zernike-z4" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z5" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_5$ Astigmatism $45^\circ$</label>
          <input type="number" id="zernike-z5" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z6" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_6$ Astigmatism $0^\circ$</label>
          <input type="number" id="zernike-z6" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>

        <!-- 3rd Order -->
        <div style="margin: 0.5rem 0 0.35rem 0; padding-top: 0.4rem; border-top: 1px solid #e5e7eb;">
          <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; font-weight: 700;">3rd Order — Coma / Trefoil</span>
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z7" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_7$ Coma Y</label>
          <input type="number" id="zernike-z7" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z8" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_8$ Coma X</label>
          <input type="number" id="zernike-z8" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z9" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_9$ Trefoil Y</label>
          <input type="number" id="zernike-z9" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>
        <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <label for="zernike-z10" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{10}$ Trefoil X</label>
          <input type="number" id="zernike-z10" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
        </div>

        <!-- Toggle Checkbox for Higher Order -->
        <div style="margin: 0.75rem 0 0.5rem 0; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;">
          <label style="font-size: 0.78rem; font-weight: 600; color: #374151; cursor: pointer; display: inline-flex; align-items: center; margin: 0;">
            <input type="checkbox" id="show-higher-zernike" style="width: auto; margin-right: 0.35rem;"> Show higher-order (4th &amp; 5th orders)
          </label>
        </div>

        <div id="higher-order-zernike-fields" style="display: none;">
          <!-- 4th Order -->
          <div style="margin: 0.5rem 0 0.35rem 0; padding-top: 0.4rem; border-top: 1px solid #e5e7eb;">
            <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; font-weight: 700;">4th Order — Spherical / Quadrafoil</span>
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z11" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{11}$ Primary Spherical</label>
            <input type="number" id="zernike-z11" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z12" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{12}$ 2nd Astig. Y</label>
            <input type="number" id="zernike-z12" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z13" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{13}$ 2nd Astig. X</label>
            <input type="number" id="zernike-z13" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z14" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{14}$ Quadrafoil Y</label>
            <input type="number" id="zernike-z14" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z15" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{15}$ Quadrafoil X</label>
            <input type="number" id="zernike-z15" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>

          <!-- 5th Order -->
          <div style="margin: 0.5rem 0 0.35rem 0; padding-top: 0.4rem; border-top: 1px solid #e5e7eb;">
            <span style="font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.07em; color: #9ca3af; font-weight: 700;">5th Order — Secondary Coma / Pentafoil</span>
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z16" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{16}$ 2nd Coma Y</label>
            <input type="number" id="zernike-z16" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z17" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{17}$ 2nd Coma X</label>
            <input type="number" id="zernike-z17" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z18" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{18}$ 2nd Trefoil Y</label>
            <input type="number" id="zernike-z18" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z19" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{19}$ 2nd Trefoil X</label>
            <input type="number" id="zernike-z19" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z20" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{20}$ Pentafoil Y</label>
            <input type="number" id="zernike-z20" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
          <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label for="zernike-z21" style="margin: 0; font-size: 0.75rem; font-weight: 600;">$Z_{21}$ Pentafoil X</label>
            <input type="number" id="zernike-z21" min="-1" max="1" step="0.05" value="0" style="width: 70px; padding: 0.15rem 0.35rem; font-size: 0.75rem; text-align: right; border: 1px solid #d1d5db; border-radius: 4px;">
          </div>
        </div> <!-- end of higher-order-zernike-fields -->
      </div>
    </form>

    <div id="error-message" style="color: #ef4444; font-size: 0.8rem; margin-top: 1rem; font-weight: 600; display: none;"></div>

    <!-- Diagnostics / Memory usage tracker -->
    <div id="memory-monitor" style="margin-top: 1rem; padding: 0.75rem; background: #f3f4f6; border-radius: 6px; border: 1px solid #e5e7eb; display: none;">
      <h4 style="margin: 0 0 0.4rem 0; font-size: 0.72rem; text-transform: uppercase; color: #4b5563; letter-spacing: 0.05em; font-weight: 700;">Diagnostics</h4>
      <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.78rem; color: #374151;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>Loaded Image Assets:</span>
          <strong id="memory-assets" style="font-family: monospace; white-space: nowrap;">0.00 MB</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>Tab Memory:</span>
          <strong id="memory-tab" style="font-family: monospace; white-space: nowrap;">N/A</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>Calculation Engine:</span>
          <strong id="calculation-engine" style="font-family: monospace; color: #2563eb; font-size: 0.75rem; text-align: right; white-space: nowrap;">GPU<br>(WebGL 2D FFT)</strong>
        </div>
      </div>
    </div>

    <div class="explanation-link-container">
      <a href="/calculators/laser-spot-size-explanation/" class="explanation-btn">View Equations & Explanation</a>
    </div>
  </div>

  <div class="calculator-results" style="max-width: 720px;">
    <!-- Near-Field ROI Selection Canvas -->
    <div class="results-group" style="padding: 1rem;">
      <h3 style="margin-bottom: 0.75rem;">1. Near-Field Intensity ROI Selection</h3>
      
      <div id="canvas-wrapper" style="position: relative; width: 100%; background: #111827; border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; min-height: 250px;">
        <canvas id="main-canvas" style="max-width: 100%; height: auto; display: block;"></canvas>
      </div>

      <!-- Controls: Colormap + Contrast Sliders -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 0.85rem; flex-wrap: wrap;">
        <div style="font-size: 0.8rem; color: #4b5563;" id="image-dimensions-label">No image loaded.</div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label for="colormap-select" style="font-weight: 600; font-size: 0.8rem; margin: 0;">Colormap:</label>
          <select id="colormap-select" style="padding: 0.25rem 0.5rem; font-size: 0.82rem; border-radius: 4px; border: 1px solid #d1d5db; background: #fff;">
            <option value="rainbow">rainbow</option>
            <option value="jet" selected>jet</option>
            <option value="viridis">viridis</option>
            <option value="plasma">plasma</option>
            <option value="grayscale">grayscale</option>
          </select>
        </div>
      </div>

      <div style="display: flex; gap: 1.5rem; margin-top: 0.6rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 180px; display: flex; align-items: center; gap: 0.5rem;">
          <label for="contrast-min" style="font-weight: 600; font-size: 0.78rem; white-space: nowrap; margin: 0;">Min Contrast:</label>
          <input type="range" id="contrast-min" min="0" max="100" value="0" style="flex: 1;">
          <span id="contrast-min-val" style="font-size: 0.78rem; font-family: monospace; width: 35px;">0%</span>
        </div>
        <div style="flex: 1; min-width: 180px; display: flex; align-items: center; gap: 0.5rem;">
          <label for="contrast-max" style="font-weight: 600; font-size: 0.78rem; white-space: nowrap; margin: 0;">Max Contrast:</label>
          <input type="range" id="contrast-max" min="0" max="100" value="100" style="flex: 1;">
          <span id="contrast-max-val" style="font-size: 0.78rem; font-family: monospace; width: 35px;">100%</span>
        </div>
      </div>

      <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; gap: 1.25rem; align-items: center; flex-wrap: wrap;">
          <label style="font-size: 0.82rem; font-weight: 600; color: #374151; cursor: pointer; display: inline-flex; align-items: center; margin: 0;">
            <input type="checkbox" id="farfield-only-chk" style="width: auto; margin-right: 0.35rem;" checked> Focus spot only (Far-Field)
          </label>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <label style="font-size: 0.82rem; font-weight: 600; color: #374151; cursor: pointer; display: inline-flex; align-items: center; margin: 0;">
            <input type="checkbox" id="gpu-chk" style="width: auto; margin-right: 0.35rem;" checked> Use WebGL / GPU Acceleration
          </label>
          <button id="calculate-btn" class="btn" style="background: #2563eb; color: #ffffff; border: none; padding: 0.55rem 1.25rem; border-radius: 5px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: background 0.15s ease;">
            Calculate
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div id="calc-progress-wrapper" style="display: none; margin-top: 0.85rem; padding: 0.75rem 0.85rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px;">
        <div id="calc-progress-label" style="font-size: 0.78rem; font-weight: 600; color: #0369a1; margin-bottom: 0.4rem;">Initializing…</div>
        <div style="background: #e0f2fe; border-radius: 9999px; height: 10px; overflow: hidden;">
          <div id="calc-progress-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #2563eb, #6366f1); border-radius: 9999px; transition: width 0.2s ease;"></div>
        </div>
        <div id="calc-progress-detail" style="font-size: 0.7rem; color: #64748b; margin-top: 0.3rem;"></div>
      </div>
    </div>

    <!-- Propagation Results and Interactive Focal Spot Viewer -->
    <div id="results-container" style="display: none; margin-top: 1.5rem;">
      <div class="results-group" style="padding: 1rem; margin-bottom: 1.5rem;">
        <h3>2. Focused Beam Spot Visualization & Z-Scans</h3>
        
        <div style="display: flex; gap: 1.25rem; align-items: flex-start; margin-top: 0.5rem;">
          <!-- Left Column: Canvas + Contrast sliders directly under it -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 400px; flex-shrink: 0;">
            <div style="position: relative; background: #111827; border-radius: 6px; padding: 0.5rem; display: flex; justify-content: center; align-items: center; width: 400px; height: 400px; box-sizing: border-box; overflow: hidden; user-select: none;">
              <canvas id="focal-canvas" style="width: 100%; height: 100%; object-fit: contain; display: block; image-rendering: pixelated; cursor: zoom-in;"></canvas>
              
              <!-- Floating zoom buttons -->
              <div style="position: absolute; bottom: 0.75rem; right: 0.75rem; display: flex; gap: 0.35rem; background: rgba(255,255,255,0.85); backdrop-filter: blur(4px); border: 1px solid #d1d5db; border-radius: 6px; padding: 0.25rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 10;">
                <button id="zoom-in-btn" title="Zoom In (Shift+Scroll Up)" style="background: transparent; border: none; width: 28px; height: 28px; font-size: 0.85rem; font-weight: bold; cursor: pointer; color: #374151; display: flex; align-items: center; justify-content: center; padding: 0; outline: none; transition: background 0.2s; border-radius: 4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">🔍+</button>
                <button id="zoom-out-btn" title="Zoom Out (Shift+Scroll Down)" style="background: transparent; border: none; width: 28px; height: 28px; font-size: 0.85rem; font-weight: bold; cursor: pointer; color: #374151; display: flex; align-items: center; justify-content: center; padding: 0; outline: none; transition: background 0.2s; border-radius: 4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">🔍-</button>
                <button id="zoom-reset-btn" title="Reset Zoom" style="background: transparent; border: none; width: 28px; height: 28px; font-size: 0.85rem; font-weight: bold; cursor: pointer; color: #374151; display: flex; align-items: center; justify-content: center; padding: 0; outline: none; transition: background 0.2s; border-radius: 4px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">🔄</button>
              </div>
            </div>

            <!-- Contrast Min/Max sliders moved under the image without card background/border -->
            <div style="font-size: 0.82rem; display: flex; flex-direction: column; gap: 0.4rem; padding: 0.2rem 0;">
              <div style="font-size: 0.75rem; font-weight: 700; color: #374151;">Display Contrast</div>
              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.25rem; flex: 1;">
                  <label for="focal-contrast-min" style="font-size: 0.7rem; white-space: nowrap; margin: 0; font-weight: 600;">Min:</label>
                  <input type="range" id="focal-contrast-min" min="0" max="100" value="0" style="width: 100%;">
                </div>
                <div style="display: flex; align-items: center; gap: 0.25rem; flex: 1;">
                  <label for="focal-contrast-max" style="font-size: 0.7rem; white-space: nowrap; margin: 0; font-weight: 600;">Max:</label>
                  <input type="range" id="focal-contrast-max" min="0" max="100" value="100" style="width: 100%;">
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Statistics side panel -->
          <div id="focal-stats-info" style="flex: 1; min-width: 240px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.85rem; font-size: 0.82rem; display: flex; flex-direction: column; gap: 0.75rem; align-self: stretch;">
            <h4 style="margin-top: 0; margin-bottom: 0.1rem; color: #111827;">Focal Spot Parameters</h4>
            
            <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.15rem;">
              <label class="radio-label" style="font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; margin: 0; white-space: nowrap;">
                <input type="checkbox" id="fit-gaussian-chk" style="width: auto; margin-right: 0.35rem;" checked> Fit 2D Gaussian
              </label>
            </div>

            <div id="focal-stats-table-wrapper" style="flex: 1;">
              <p style="color: #6b7280; font-style: italic;">Fit statistics will appear here.</p>
            </div>
          </div>
        </div>

        <!-- Z-Scan Slider -->
        <div style="margin-top: 1rem; padding: 0.5rem 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.35rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <label for="z-slider">Longitudinal Position Offset ($z - f$)</label>
              <button id="reset-z-btn" style="padding: 0.15rem 0.45rem; font-size: 0.7rem; font-weight: 600; background: #e5e7eb; color: #374151; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer;" disabled>Reset to Focus</button>
            </div>
            <span id="z-slider-val" style="font-family: monospace; color: #2563eb;">0.00 mm</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 0.72rem; color: #6b7280;">-3 z_R</span>
            <button type="button" id="z-prev" style="background: transparent; border: none; font-size: 0.75rem; color: #4b5563; cursor: pointer; width: 22px; height: 22px; margin: 0; padding: 0; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; line-height: 1; transition: background 0.15s, color 0.15s;" onmouseover="this.style.color='#111827'; this.style.backgroundColor='#e5e7eb';" onmouseout="this.style.color='#4b5563'; this.style.backgroundColor='transparent';" disabled>◀</button>
            <input type="range" id="z-slider" min="-10" max="10" step="0.1" value="0" style="flex: 1; margin: 0;" disabled>
            <button type="button" id="z-next" style="background: transparent; border: none; font-size: 0.75rem; color: #4b5563; cursor: pointer; width: 22px; height: 22px; margin: 0; padding: 0; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; line-height: 1; transition: background 0.15s, color 0.15s;" onmouseover="this.style.color='#111827'; this.style.backgroundColor='#e5e7eb';" onmouseout="this.style.color='#4b5563'; this.style.backgroundColor='transparent';" disabled>▶</button>
            <span style="font-size: 0.72rem; color: #6b7280;">+3 z_R</span>
          </div>
        </div>


      </div>

      <!-- 3D Caustic and Fitting Summary Card -->
      <div id="caustic-results-card" class="results-group" style="padding: 1rem; margin-bottom: 1.5rem;">
        <h3>3. 3D Beam Caustic Analysis (ISO 11146 Second-Moment Fit)</h3>
        
        <table class="comparison-table" style="margin-bottom: 1rem;">
          <thead>
            <tr>
              <th style="width: 60%;">Caustic Quantity</th>
              <th style="width: 40%;">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Beam Quality Factor ($M^2$)</strong><br><small style="color: #6b7280;">From full caustic fit (ISO 11146)</small></td>
              <td id="res-m2" class="font-highlight">-</td>
            </tr>
            <tr>
              <td><strong>Waist Radius ($w_0$)</strong><br><small style="color: #6b7280;">ISO second-moment radius</small></td>
              <td id="res-waist-radius" class="font-highlight">-</td>
            </tr>
            <tr>
              <td><strong>Waist FWHM Spot Diameter ($d_0$)</strong><br><small style="color: #6b7280;">Assumes Gaussian profile</small></td>
              <td id="res-waist-fwhm">-</td>
            </tr>
            <tr>
              <td><strong>Rayleigh Range ($z_R$)</strong></td>
              <td id="res-rayleigh-range" class="font-highlight">-</td>
            </tr>
            <tr>
              <td><strong>Focus Shift / Axial Waist Offset ($z_0 - f$)</strong></td>
              <td id="res-focus-shift">-</td>
            </tr>
            <tr id="row-theory-waist" style="display: none;">
              <td><strong>Theoretical Waist Radius ($w_{\text{DL}}$)</strong><br><small style="color: #6b7280;">Diffraction-limited focus</small></td>
              <td id="res-theory-waist">-</td>
            </tr>
            <tr id="row-ratio-m2" style="display: none;">
              <td><strong>Ratio-based Beam Quality ($M^2_{\text{ratio}}$)</strong><br><small style="color: #6b7280;">Waist ratio: $w_0 / w_{\text{DL}}$</small></td>
              <td id="res-ratio-m2" class="font-highlight">-</td>
            </tr>
          </tbody>
        </table>

        <!-- Visual representation of the caustic profile -->
        <h4 style="margin: 0.75rem 0 0.5rem 0; font-size: 0.85rem; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em;">Caustic Profile $w(z)$ along Propagation Axis</h4>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.5rem; display: flex; justify-content: center; align-items: center;">
          <canvas id="caustic-chart-canvas" width="600" height="200" style="max-width: 100%; height: auto; display: block;"></canvas>
        </div>
      </div>
    </div>
  </div>
</div>
