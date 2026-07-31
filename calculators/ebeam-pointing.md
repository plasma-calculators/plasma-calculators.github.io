---
layout: single
title: "Electron Beam Pointing & Divergence Calculator"
permalink: /calculators/ebeam-pointing/
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
<script src="/assets/js/ebeam-pointing.js" defer></script>

<div class="calculator-container compact-mode">
  <div class="calculator-sidebar">
    <h3>Input Parameters</h3>
    <form id="ebeam-form" onsubmit="return false;">
      <h4 class="input-section-title">Image Upload</h4>
      <div class="form-group">
        <label for="example-select">Load Example Image</label>
        <select id="example-select" style="padding: 0.25rem; font-size: 0.8rem; border-radius: 4px; width: 100%; border: 1px solid #d1d5db; background: #fff; margin-bottom: 0.5rem;">
          <option value="">-- Choose Example --</option>
          <option value="/example_files/ebeam_pointing/386_LWFA_Zelle_He5N2_Pointing_ESpeklow_182542_.png">E-Beam 386</option>
          <option value="/example_files/ebeam_pointing/394_LWFA_Zelle_He5N2_Pointing_ESpeklow_182635_.png">E-Beam 394</option>
          <option value="/example_files/ebeam_pointing/400_LWFA_Zelle_He5N2_Pointing_ESpeklow_182703_.png">E-Beam 400</option>
          <option value="/example_files/ebeam_pointing/421_LWFA_Zelle_He5N2_Pointing_ESpeklow_182846_.png">E-Beam 421</option>
          <option value="/example_files/ebeam_pointing/422_LWFA_Zelle_He5N2_Pointing_ESpeklow_182851_.png">E-Beam 422</option>
        </select>
      </div>

      <div class="form-group">
        <label for="image-upload" style="display: block; margin-bottom: 0.25rem;">
          <span style="display: block;">Or Upload Beam Images</span>
          <span style="display: block; font-weight: normal; font-size: 0.85em; color: #4b5563;">(PNG, JPEG, TIF, TIFF)</span>
        </label>
        <input type="file" id="image-upload" accept=".png,.jpg,.jpeg,.tif,.tiff" multiple style="font-size: 0.8rem; padding: 0.2rem; width: 100%;">
        <span class="input-hint" style="display: block; font-size: 0.68rem; white-space: nowrap; margin-top: 0.25rem;">Select up to 50 MB total of image files.</span>
      </div>

      <h4 class="input-section-title">Spatial Calibration</h4>
      <div class="form-group" style="margin-bottom: 0.4rem;">
        <label class="radio-label" style="font-size: 0.78rem; font-weight: 600;">
          <input type="checkbox" id="calib-same" style="width: auto; margin-right: 0.35rem;"> Same X and Y Calibration
        </label>
      </div>

      <div class="form-group">
        <label for="calib-x">Calibration X (μm/pixel)</label>
        <input type="number" id="calib-x" value="92.59" min="0.0001" step="0.01" class="small-input" required>
      </div>

      <div id="calib-y-group" class="form-group">
        <label for="calib-y">Calibration Y (μm/pixel)</label>
        <input type="number" id="calib-y" value="92.59" min="0.0001" step="0.01" class="small-input" required>
      </div>

      <h4 class="input-section-title">Divergence parameters</h4>
      <div class="form-group">
        <label for="dist-source-screen">Distance Source to Screen (mm)</label>
        <input type="number" id="dist-source-screen" value="1870" min="1" step="1" class="small-input" required>
      </div>

      <h4 class="input-section-title">Charge Parameters (Optional)</h4>
      <div class="form-group" style="margin-bottom: 0.4rem;">
        <label class="radio-label" style="font-size: 0.78rem; font-weight: 600;">
          <input type="checkbox" id="enable-charge" style="width: auto; margin-right: 0.35rem;"> Include Charge Calculation
        </label>
      </div>

      <div id="charge-inputs" style="display: none;">
        <div class="form-group">
          <label for="screen-yield">Screen Yield (photons/pC/sr)</label>
          <input type="number" id="screen-yield" value="8.25e9" min="1" step="1e7" class="small-input">
        </div>
        <div class="form-group">
          <label for="dist-cam-screen">Distance Screen to Camera (mm)</label>
          <input type="number" id="dist-cam-screen" value="400" min="1" step="10" class="small-input">
        </div>
        <div class="form-group">
          <label for="camera-calib">Camera Calibration (photons/counts)</label>
          <input type="number" id="camera-calib" value="6.7" min="0.01" step="0.1" class="small-input">
        </div>
        <div class="form-group">
          <label for="lens-focal">Lens Focal Length (mm)</label>
          <input type="number" id="lens-focal" value="25" min="1" step="1" class="small-input">
        </div>
        <div class="form-group">
          <label for="lens-fnumber">Lens F-number</label>
          <input type="number" id="lens-fnumber" value="4.0" min="0.5" step="0.1" class="small-input">
        </div>
        <div class="form-group">
          <label for="transmission-loss">Transmission (dimensionless, 0-1)</label>
          <input type="number" id="transmission-loss" value="1.0" min="0.0001" max="1.0" step="0.01" class="small-input">
        </div>
      </div>
    </form>

    <div id="error-message" style="color: #ef4444; font-size: 0.8rem; margin-top: 1rem; font-weight: 600; display: none;"></div>

    <!-- Memory Usage Monitor -->
    <div id="memory-monitor" style="margin-top: 1rem; padding: 0.75rem; background: #f3f4f6; border-radius: 6px; border: 1px solid #e5e7eb; display: none;">
      <h4 style="margin: 0 0 0.4rem 0; font-size: 0.72rem; text-transform: uppercase; color: #4b5563; letter-spacing: 0.05em; font-weight: 700;">Diagnostics</h4>
      <div style="display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.78rem; color: #374151;">
        <div style="display: flex; justify-content: space-between; align-items: center;" title="Estimated RAM used by the raw uploaded image files and their pixel data buffers.">
          <span>Loaded Image Assets:</span>
          <strong id="memory-assets" style="font-family: monospace; white-space: nowrap;">0.00 MB</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;" title="Total browser tab memory usage. (Note: Only supported in Chromium-based browsers like Chrome/Edge).">
          <span>Tab Memory:</span>
          <strong id="memory-tab" style="font-family: monospace; white-space: nowrap;">N/A</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>Calculation Engine:</span>
          <strong id="calc-engine-label" style="font-family: monospace; color: #2563eb; font-size: 0.75rem; text-align: right; white-space: nowrap;">GPU<br>(WebGL 2D FFT)</strong>
        </div>
        <div style="font-size: 0.65rem; color: #9ca3af; text-align: right; margin-top: 0.15rem; font-style: italic;">
          (Only supported in Chrome/Edge)
        </div>
      </div>
    </div>

    <div class="explanation-link-container">
      <a href="/calculators/ebeam-pointing-explanation/" class="explanation-btn">View Equations & Explanation</a>
    </div>
  </div>

  <div class="calculator-results" style="max-width: 720px;">
    <!-- Interactive Image & ROI Selector Box -->
    <div class="results-group" style="padding: 1rem;">
      <h3>1. Image ROI & Background Selection</h3>
      
      <div id="canvas-wrapper" style="position: relative; width: 100%; background: #111827; border-radius: 6px; overflow: hidden; display: flex; justify-content: center; align-items: center; min-height: 250px;">
        <canvas id="main-canvas" style="max-width: 100%; height: auto; display: block;"></canvas>
      </div>

      <!-- Controls Row 1: Image Slider + Colormap Combobox -->
      <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.85rem; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px; display: flex; align-items: center; gap: 0.25rem;">
          <label for="image-slider" style="font-weight: 600; font-size: 0.8rem; white-space: nowrap; margin: 0; margin-right: 0.25rem;">Image:</label>
          <button type="button" id="image-prev" style="background: transparent; border: none; font-size: 0.75rem; color: #4b5563; cursor: pointer; width: 22px; height: 22px; margin: 0; padding: 0; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; line-height: 1; transition: background 0.15s, color 0.15s;" onmouseover="this.style.color='#111827'; this.style.backgroundColor='#e5e7eb';" onmouseout="this.style.color='#4b5563'; this.style.backgroundColor='transparent';">◀</button>
          <input type="range" id="image-slider" min="0" max="0" value="0" style="flex: 1; margin: 0; align-self: center;">
          <button type="button" id="image-next" style="background: transparent; border: none; font-size: 0.75rem; color: #4b5563; cursor: pointer; width: 22px; height: 22px; margin: 0; padding: 0; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; line-height: 1; transition: background 0.15s, color 0.15s;" onmouseover="this.style.color='#111827'; this.style.backgroundColor='#e5e7eb';" onmouseout="this.style.color='#4b5563'; this.style.backgroundColor='transparent';">▶</button>
          <span id="image-slider-label" style="font-size: 0.8rem; font-family: monospace; font-weight: 600; white-space: nowrap; margin-left: 0.25rem;">0 / 0</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label for="colormap-select" style="font-weight: 600; font-size: 0.8rem; white-space: nowrap; margin: 0;">Colormap:</label>
          <select id="colormap-select" style="padding: 0.25rem 0.5rem; font-size: 0.82rem; border-radius: 4px; border: 1px solid #d1d5db; background: #fff;">
            <option value="rainbow" selected>rainbow</option>
            <option value="jet">jet</option>
            <option value="viridis">viridis</option>
            <option value="plasma">plasma</option>
            <option value="grayscale">grayscale</option>
          </select>
        </div>
      </div>

      <!-- Controls Row 2: Contrast Min & Max Sliders -->
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

      <div style="margin-top: 1rem; display: flex; justify-content: flex-end; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <label style="font-size: 0.82rem; font-weight: 600; color: #374151; cursor: pointer; display: inline-flex; align-items: center; margin: 0;">
            <input type="checkbox" id="gpu-chk" style="width: auto; margin-right: 0.35rem;" checked> Use WebGL / GPU Acceleration
          </label>
          <button id="calculate-btn" class="btn" style="background: #2563eb; color: #ffffff; border: none; padding: 0.55rem 1.25rem; border-radius: 5px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: background 0.15s ease;">
            Calculate 2D Fits & Divergence
          </button>
        </div>
      </div>
    </div>

    <!-- Calculated Results Container -->
    <div id="results-container" style="display: none;">
      <!-- Overall Statistical Results Table -->
      <div class="results-group" style="padding: 1rem; margin-bottom: 1.5rem;">
        <h3>2. Summary Results (Average & RMS across Images)</h3>
        <table class="comparison-table">
          <thead>
            <tr>
              <th style="width: 40%;">Parameter</th>
              <th style="width: 30%;">Average</th>
              <th style="width: 30%;">RMS (Std Dev)</th>
            </tr>
          </thead>
          <tbody id="summary-table-body">
          </tbody>
        </table>

        <!-- Pointing Stability Summary Table -->
        <h4 style="font-size: 0.88rem; margin: 0.75rem 0 0.4rem 0; text-transform: uppercase; color: #4b5563;">Pointing Stability (Jitter / Shot-to-Shot Fluctuation)</h4>
        <table class="comparison-table">
          <thead>
            <tr>
              <th style="width: 40%;">Axis</th>
              <th style="width: 30%;">Std Dev (Jitter) (<span style="text-transform: lowercase;">mm</span>)</th>
              <th style="width: 30%;">Std Dev (Jitter) (<span style="text-transform: lowercase;">mrad</span>)</th>
            </tr>
          </thead>
          <tbody id="pointing-stability-body">
          </tbody>
        </table>

        <div id="charge-summary-group" style="margin-top: 1rem; display: none;">
          <h4 style="font-size: 0.88rem; margin: 0.75rem 0 0.4rem 0; text-transform: uppercase; color: #4b5563;">Electron Beam Charge Summary</h4>
          <table class="comparison-table">
            <thead>
              <tr>
                <th style="width: 40%;">Parameter</th>
                <th style="width: 60%;">Value</th>
              </tr>
            </thead>
            <tbody id="charge-summary-body">
            </tbody>
          </table>
        </div>
      </div>

      <!-- Post-Processed ROI Display -->
      <div class="results-group" style="padding: 1rem;">
        <h3>3. Post-Processed ROI & 2D Fit Contours</h3>
        
        <div style="display: flex; gap: 1.25rem; align-items: flex-start; flex-wrap: wrap; margin-top: 0.5rem;">
          <!-- ROI Canvas -->
          <div style="background: #111827; border-radius: 6px; padding: 0.5rem; display: flex; justify-content: center; align-items: center; min-width: 200px; min-height: 200px;">
            <canvas id="roi-canvas" style="max-width: 260px; max-height: 260px; height: auto; display: block; image-rendering: pixelated;"></canvas>
          </div>

          <!-- Stats text on the right -->
          <div id="roi-stats-info" style="flex: 1; min-width: 220px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.85rem; font-size: 0.82rem;">
            <p style="color: #6b7280;">Select an image below to view post-processed fit.</p>
          </div>
        </div>

        <!-- Post-Processing Sliders -->
        <div style="display: flex; align-items: center; gap: 0.25rem; margin-top: 1rem; flex-wrap: wrap;">
          <label for="post-image-slider" style="font-weight: 600; font-size: 0.8rem; white-space: nowrap; margin: 0; margin-right: 0.25rem;">ROI Image:</label>
          <button type="button" id="post-image-prev" style="background: transparent; border: none; font-size: 0.75rem; color: #4b5563; cursor: pointer; width: 22px; height: 22px; margin: 0; padding: 0; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; line-height: 1; transition: background 0.15s, color 0.15s;" onmouseover="this.style.color='#111827'; this.style.backgroundColor='#e5e7eb';" onmouseout="this.style.color='#4b5563'; this.style.backgroundColor='transparent';">◀</button>
          <input type="range" id="post-image-slider" min="0" max="0" value="0" style="flex: 1; margin: 0; align-self: center;">
          <button type="button" id="post-image-next" style="background: transparent; border: none; font-size: 0.75rem; color: #4b5563; cursor: pointer; width: 22px; height: 22px; margin: 0; padding: 0; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; line-height: 1; transition: background 0.15s, color 0.15s;" onmouseover="this.style.color='#111827'; this.style.backgroundColor='#e5e7eb';" onmouseout="this.style.color='#4b5563'; this.style.backgroundColor='transparent';">▶</button>
          <span id="post-image-slider-label" style="font-size: 0.8rem; font-family: monospace; font-weight: 600; white-space: nowrap; margin-left: 0.25rem;">0 / 0</span>
        </div>

        <div style="display: flex; gap: 1.5rem; margin-top: 0.6rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 180px; display: flex; align-items: center; gap: 0.5rem;">
            <label for="post-contrast-min" style="font-weight: 600; font-size: 0.78rem; white-space: nowrap; margin: 0;">Min Contrast:</label>
            <input type="range" id="post-contrast-min" min="0" max="100" value="0" style="flex: 1;">
            <span id="post-contrast-min-val" style="font-size: 0.78rem; font-family: monospace; width: 35px;">0%</span>
          </div>
          <div style="flex: 1; min-width: 180px; display: flex; align-items: center; gap: 0.5rem;">
            <label for="post-contrast-max" style="font-weight: 600; font-size: 0.78rem; white-space: nowrap; margin: 0;">Max Contrast:</label>
            <input type="range" id="post-contrast-max" min="0" max="100" value="100" style="flex: 1;">
            <span id="post-contrast-max-val" style="font-size: 0.78rem; font-family: monospace; width: 35px;">100%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
