/**
 * Focal Spot Size & Focus Intensity Calculator Engine
 * Handles image uploading (PNG, JPEG, TIF, TIFF), interactive ROI selection,
 * 2D Rotated Gaussian fitting, colormaps, statistics, and post-processed ROI rendering.
 */

document.addEventListener("DOMContentLoaded", function () {
  // UI Elements
  const imageUploadInput = document.getElementById("image-upload");
  const calibSameCheckbox = document.getElementById("calib-same");
  const calibXInput = document.getElementById("calib-x");
  const calibYInput = document.getElementById("calib-y");
  const calibYGroup = document.getElementById("calib-y-group");

  const enablePulsedCheckbox = document.getElementById("enable-pulsed");
  const pulsedInputsDiv = document.getElementById("pulsed-inputs");
  const pulseEnergyInput = document.getElementById("pulse-energy");
  const pulseDurationInput = document.getElementById("pulse-duration");
  const wavelengthInput = document.getElementById("wavelength");

  const mainCanvas = document.getElementById("main-canvas");
  const mainCtx = mainCanvas ? mainCanvas.getContext("2d") : null;

  const imageSlider = document.getElementById("image-slider");
  const imageSliderLabel = document.getElementById("image-slider-label");
  const imagePrevBtn = document.getElementById("image-prev");
  const imageNextBtn = document.getElementById("image-next");
  const colormapSelect = document.getElementById("colormap-select");

  const contrastMinSlider = document.getElementById("contrast-min");
  const contrastMaxSlider = document.getElementById("contrast-max");
  const contrastMinVal = document.getElementById("contrast-min-val");
  const contrastMaxVal = document.getElementById("contrast-max-val");

  const calculateBtn = document.getElementById("calculate-btn");
  const errorMessageDiv = document.getElementById("error-message");

  // Post-Processed Results UI Elements
  const resultsContainer = document.getElementById("results-container");
  const summaryTableBody = document.getElementById("summary-table-body");
  const pulsedTableGroup = document.getElementById("pulsed-summary-group");
  const pulsedSummaryBody = document.getElementById("pulsed-summary-body");

  const roiCanvas = document.getElementById("roi-canvas");
  const roiCtx = roiCanvas ? roiCanvas.getContext("2d") : null;
  const postImageSlider = document.getElementById("post-image-slider");
  const postImageSliderLabel = document.getElementById("post-image-slider-label");
  const postImagePrevBtn = document.getElementById("post-image-prev");
  const postImageNextBtn = document.getElementById("post-image-next");
  const postContrastMinSlider = document.getElementById("post-contrast-min");
  const postContrastMaxSlider = document.getElementById("post-contrast-max");
  const postContrastMinVal = document.getElementById("post-contrast-min-val");
  const postContrastMaxVal = document.getElementById("post-contrast-max-val");
  const roiStatsDiv = document.getElementById("roi-stats-info");

  // State Variables
  let loadedImages = []; // Array of { name, width, height, data: Float64Array, minVal, maxVal, fitResult: null }
  let currentImageIdx = 0;
  let currentPostIdx = 0;

  // ROI State (in image pixel coordinates)
  let roi = { x: 0, y: 0, w: 100, h: 100 };
  let isDraggingRoi = false;
  let activeHandle = null; // 'tl', 'tr', 'bl', 'br', 'body'
  let dragStartPos = { x: 0, y: 0 };
  let roiStartPos = { x: 0, y: 0, w: 0, h: 0 };

  // Setup Event Listeners
  if (calibSameCheckbox) {
    calibSameCheckbox.addEventListener("change", function () {
      if (calibSameCheckbox.checked) {
        calibYGroup.style.display = "none";
        calibYInput.value = calibXInput.value;
      } else {
        calibYGroup.style.display = "block";
      }
    });
    calibXInput.addEventListener("input", function () {
      if (calibSameCheckbox.checked) {
        calibYInput.value = calibXInput.value;
      }
    });
  }

  if (enablePulsedCheckbox) {
    enablePulsedCheckbox.addEventListener("change", function () {
      pulsedInputsDiv.style.display = enablePulsedCheckbox.checked ? "block" : "none";
      if (pulsedTableGroup) {
        pulsedTableGroup.style.display = enablePulsedCheckbox.checked ? "block" : "none";
      }
    });
  }

  if (imageUploadInput) {
    imageUploadInput.addEventListener("change", handleImageUpload);
  }

  if (imageSlider) {
    imageSlider.addEventListener("input", function () {
      currentImageIdx = parseInt(imageSlider.value, 10);
      if (imageSliderLabel) imageSliderLabel.innerText = `${currentImageIdx + 1} / ${loadedImages.length}`;
      renderMainCanvas();
    });
  }

  if (imagePrevBtn) {
    imagePrevBtn.addEventListener("click", function () {
      if (loadedImages.length > 0) {
        let val = parseInt(imageSlider.value, 10);
        if (val > 0) {
          imageSlider.value = val - 1;
          imageSlider.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  if (imageNextBtn) {
    imageNextBtn.addEventListener("click", function () {
      if (loadedImages.length > 0) {
        let val = parseInt(imageSlider.value, 10);
        if (val < loadedImages.length - 1) {
          imageSlider.value = val + 1;
          imageSlider.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  if (colormapSelect) {
    colormapSelect.addEventListener("change", function () {
      renderMainCanvas();
      renderPostRoiCanvas();
    });
  }

  if (contrastMinSlider && contrastMaxSlider) {
    contrastMinSlider.addEventListener("input", function () {
      let minV = parseFloat(contrastMinSlider.value);
      let maxV = parseFloat(contrastMaxSlider.value);
      if (minV >= maxV) contrastMinSlider.value = maxV - 1;
      if (contrastMinVal) contrastMinVal.innerText = `${contrastMinSlider.value}%`;
      renderMainCanvas();
    });
    contrastMaxSlider.addEventListener("input", function () {
      let minV = parseFloat(contrastMinSlider.value);
      let maxV = parseFloat(contrastMaxSlider.value);
      if (maxV <= minV) contrastMaxSlider.value = minV + 1;
      if (contrastMaxVal) contrastMaxVal.innerText = `${contrastMaxSlider.value}%`;
      renderMainCanvas();
    });
  }

  if (postContrastMinSlider && postContrastMaxSlider) {
    postContrastMinSlider.addEventListener("input", function () {
      let minV = parseFloat(postContrastMinSlider.value);
      let maxV = parseFloat(postContrastMaxSlider.value);
      if (minV >= maxV) postContrastMinSlider.value = maxV - 1;
      if (postContrastMinVal) postContrastMinVal.innerText = `${postContrastMinSlider.value}%`;
      renderPostRoiCanvas();
    });
    postContrastMaxSlider.addEventListener("input", function () {
      let minV = parseFloat(postContrastMinSlider.value);
      let maxV = parseFloat(postContrastMaxSlider.value);
      if (maxV <= minV) postContrastMaxSlider.value = minV + 1;
      if (postContrastMaxVal) postContrastMaxVal.innerText = `${postContrastMaxSlider.value}%`;
      renderPostRoiCanvas();
    });
  }

  if (postImageSlider) {
    postImageSlider.addEventListener("input", function () {
      currentPostIdx = parseInt(postImageSlider.value, 10);
      if (postImageSliderLabel) postImageSliderLabel.innerText = `${currentPostIdx + 1} / ${loadedImages.length}`;
      renderPostRoiCanvas();
    });
  }

  if (postImagePrevBtn) {
    postImagePrevBtn.addEventListener("click", function () {
      if (loadedImages.length > 0) {
        let val = parseInt(postImageSlider.value, 10);
        if (val > 0) {
          postImageSlider.value = val - 1;
          postImageSlider.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  if (postImageNextBtn) {
    postImageNextBtn.addEventListener("click", function () {
      if (loadedImages.length > 0) {
        let val = parseInt(postImageSlider.value, 10);
        if (val < loadedImages.length - 1) {
          postImageSlider.value = val + 1;
          postImageSlider.dispatchEvent(new Event("input"));
        }
      }
    });
  }

  if (calculateBtn) {
    calculateBtn.addEventListener("click", runCalculations);
  }

  setupCanvasInteraction();

  // -------------------------------------------------------------
  // Image Upload Handling
  // -------------------------------------------------------------
  async function handleImageUpload(e) {
    showError("");
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Total file size check (50 MB limit)
    let totalSize = files.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      showError("Selected files exceed the maximum total allowed size of 50 MB.");
      return;
    }

    loadedImages = [];
    currentImageIdx = 0;
    currentPostIdx = 0;

    for (let file of files) {
      try {
        let imgData = await parseImageFile(file);
        if (imgData) loadedImages.push(imgData);
      } catch (err) {
        console.error("Error reading file:", file.name, err);
      }
    }

    if (loadedImages.length === 0) {
      showError("Could not process any of the uploaded images. Please select valid PNG, JPEG, or TIF/TIFF files.");
      return;
    }

    // Initialize UI controls
    imageSlider.min = 0;
    imageSlider.max = loadedImages.length - 1;
    imageSlider.value = 0;
    imageSliderLabel.innerText = `1 / ${loadedImages.length}`;

    if (postImageSlider) {
      postImageSlider.min = 0;
      postImageSlider.max = loadedImages.length - 1;
      postImageSlider.value = 0;
      if (postImageSliderLabel) postImageSliderLabel.innerText = `1 / ${loadedImages.length}`;
    }

    // Default ROI centered around peak of first image
    initDefaultRoi(loadedImages[0]);

    renderMainCanvas();
    updateMemoryDiagnostics();
  }

  function initDefaultRoi(imgObj) {
    let w = imgObj.width;
    let h = imgObj.height;
    let data = imgObj.data;

    // Find peak pixel location
    let maxIdx = 0;
    let maxV = -Infinity;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > maxV) {
        maxV = data[i];
        maxIdx = i;
      }
    }
    let py = Math.floor(maxIdx / w);
    let px = maxIdx % w;

    // Default 200x200 ROI around peak (or 25% of image size if smaller)
    let roiW = Math.min(200, Math.floor(w * 0.4));
    let roiH = Math.min(200, Math.floor(h * 0.4));

    let rx = Math.max(0, Math.min(w - roiW, px - Math.floor(roiW / 2)));
    let ry = Math.max(0, Math.min(h - roiH, py - Math.floor(roiH / 2)));

    roi = { x: rx, y: ry, w: roiW, h: roiH };
  }

  function parseImageFile(file) {
    return new Promise((resolve, reject) => {
      let ext = file.name.split(".").pop().toLowerCase();
      let reader = new FileReader();

      if (ext === "tif" || ext === "tiff") {
        reader.onload = function (e) {
          try {
            let buffer = e.target.result;
            let ifds = UTIF.decode(buffer);
            UTIF.decodeImages(buffer, ifds);
            let ifd = ifds[0];
            let w = ifd.width;
            let h = ifd.height;
            let bps = ifd[258] ? ifd[258][0] : 8;
            let samples = ifd[258] ? ifd[258].length : 1;
            let raw = ifd.data;

            let grayData = new Float64Array(w * h);
            let minV = Infinity, maxV = -Infinity;

            if (bps === 16) {
              let u16 = new Uint16Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 2));
              for (let i = 0; i < w * h; i++) {
                let val = u16[i * samples];
                grayData[i] = val;
                if (val < minV) minV = val;
                if (val > maxV) maxV = val;
              }
            } else {
              for (let i = 0; i < w * h; i++) {
                let val = raw[i * samples];
                grayData[i] = val;
                if (val < minV) minV = val;
                if (val > maxV) maxV = val;
              }
            }
            resolve({ name: file.name, width: w, height: h, data: grayData, minVal: minV, maxVal: maxV, fitResult: null, fileSize: file.size });
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        // PNG or JPEG: read as ArrayBuffer to try 16-bit PNG first
        reader.onload = async function (e) {
          let buffer = e.target.result;
          // Try async 16-bit PNG decoder first
          if (ext === "png") {
            try {
              let result16 = await parsePNG16bitAsync(buffer);
              if (result16) {
                resolve(Object.assign({ name: file.name, fitResult: null, fileSize: file.size }, result16));
                return;
              }
            } catch (err16) {
              // Fall through to 8-bit canvas
            }
          }
          // Fallback to canvas (8-bit) for JPEG and 8-bit PNGs
          let blob = new Blob([buffer], { type: file.type });
          let url = URL.createObjectURL(blob);
          let img = new Image();
          img.onload = function () {
            let w = img.width;
            let h = img.height;
            let tempCanvas = document.createElement("canvas");
            tempCanvas.width = w;
            tempCanvas.height = h;
            let tempCtx = tempCanvas.getContext("2d");
            tempCtx.drawImage(img, 0, 0);

            let imgData = tempCtx.getImageData(0, 0, w, h);
            let pixels = imgData.data;
            let grayData = new Float64Array(w * h);
            let minV = Infinity, maxV = -Infinity;

            for (let i = 0; i < w * h; i++) {
              let r = pixels[i * 4];
              let g = pixels[i * 4 + 1];
              let b = pixels[i * 4 + 2];
              let val = 0.299 * r + 0.587 * g + 0.114 * b;
              grayData[i] = val;
              if (val < minV) minV = val;
              if (val > maxV) maxV = val;
            }
            URL.revokeObjectURL(url);
            resolve({ name: file.name, width: w, height: h, data: grayData, minVal: minV, maxVal: maxV, fitResult: null, fileSize: file.size });
          };
          img.onerror = function () {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load image"));
          };
          img.src = url;
        };
        reader.readAsArrayBuffer(file);
      }
    });
  }

  /**
   * Async 16-bit PNG parser. Returns {width, height, data, minVal, maxVal} or null.
   * Handles non-interlaced 16-bit grayscale PNGs by parsing IHDR+IDAT chunks,
   * decompressing via DecompressionStream, and applying PNG row filters.
   */
  async function parsePNG16bitAsync(buffer) {
    let data = new Uint8Array(buffer);
    if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47) return null;

    let d = 16; // IHDR data starts at offset 16
    let width  = (data[d]<<24) | (data[d+1]<<16) | (data[d+2]<<8) | data[d+3];
    let height = (data[d+4]<<24) | (data[d+5]<<16) | (data[d+6]<<8) | data[d+7];
    let bitDepth = data[d+8];
    let colorType = data[d+9];
    let interlace = data[d+12];

    if (bitDepth !== 16 || interlace !== 0) return null;
    if (colorType !== 0 && colorType !== 4) return null;

    let samplesPerPixel = colorType === 0 ? 1 : 2;
    let bytesPerPixel = samplesPerPixel * 2; // 16-bit = 2 bytes per sample

    // Collect IDAT chunks
    let idatChunks = [];
    let offset = 8;
    while (offset < data.length) {
      let chunkLen = (data[offset]<<24) | (data[offset+1]<<16) | (data[offset+2]<<8) | data[offset+3];
      let chunkType = String.fromCharCode(data[offset+4], data[offset+5], data[offset+6], data[offset+7]);
      if (chunkType === 'IDAT') {
        idatChunks.push(data.subarray(offset + 8, offset + 8 + chunkLen));
      }
      if (chunkType === 'IEND') break;
      offset += 12 + chunkLen;
    }
    if (idatChunks.length === 0) return null;

    let totalLen = idatChunks.reduce((a, c) => a + c.length, 0);
    let compressed = new Uint8Array(totalLen);
    let pos = 0;
    for (let chunk of idatChunks) {
      compressed.set(chunk, pos);
      pos += chunk.length;
    }

    // Inflate: PNG IDAT uses zlib (2-byte header + deflate + 4-byte Adler-32).
    // DecompressionStream('deflate') handles raw deflate.
    // Strip the 2-byte zlib header and 4-byte trailing Adler-32 checksum.
    let rawPixels;
    try {
      // Strip zlib wrapper: 2 bytes header, 4 bytes trailing checksum
      let deflateData = compressed.subarray(2, compressed.length - 4);
      let blob = new Blob([deflateData]);
      let response = new Response(blob.stream().pipeThrough(new DecompressionStream('deflate-raw')));
      let decompressed = await response.arrayBuffer();
      rawPixels = new Uint8Array(decompressed);
    } catch (e1) {
      // Fallback: try feeding full zlib data with 'deflate' mode (handles zlib wrapper)
      try {
        let blob = new Blob([compressed]);
        let response = new Response(blob.stream().pipeThrough(new DecompressionStream('deflate')));
        let decompressed = await response.arrayBuffer();
        rawPixels = new Uint8Array(decompressed);
      } catch (e2) {
        return null; // DecompressionStream not available
      }
    }

    // Expected size: height * (1 + width * bytesPerPixel) — 1 filter byte per row
    let rowBytes = 1 + width * bytesPerPixel;
    if (rawPixels.length < height * rowBytes) return null;

    // Reconstruct pixel data with PNG row filters
    let grayData = new Float64Array(width * height);
    let minV = Infinity, maxV = -Infinity;
    let prevRow = new Uint8Array(width * bytesPerPixel); // initialized to 0
    let currRow = new Uint8Array(width * bytesPerPixel);

    for (let y = 0; y < height; y++) {
      let rowStart = y * rowBytes;
      let filterType = rawPixels[rowStart];
      let rawRow = rawPixels.subarray(rowStart + 1, rowStart + 1 + width * bytesPerPixel);

      // Apply PNG row filter
      for (let i = 0; i < width * bytesPerPixel; i++) {
        let raw = rawRow[i];
        let a = i >= bytesPerPixel ? currRow[i - bytesPerPixel] : 0; // left
        let b = prevRow[i]; // above
        let c = i >= bytesPerPixel ? prevRow[i - bytesPerPixel] : 0; // upper-left

        switch (filterType) {
          case 0: currRow[i] = raw; break; // None
          case 1: currRow[i] = (raw + a) & 0xFF; break; // Sub
          case 2: currRow[i] = (raw + b) & 0xFF; break; // Up
          case 3: currRow[i] = (raw + Math.floor((a + b) / 2)) & 0xFF; break; // Average
          case 4: currRow[i] = (raw + paethPredictor(a, b, c)) & 0xFF; break; // Paeth
          default: currRow[i] = raw; break;
        }
      }

      // Extract 16-bit pixel values (big-endian)
      for (let x = 0; x < width; x++) {
        let byteIdx = x * bytesPerPixel;
        let val = (currRow[byteIdx] << 8) | currRow[byteIdx + 1];
        grayData[y * width + x] = val;
        if (val < minV) minV = val;
        if (val > maxV) maxV = val;
      }

      // Swap rows
      let tmp = prevRow;
      prevRow = new Uint8Array(currRow);
      currRow = tmp;
    }

    return { width: width, height: height, data: grayData, minVal: minV, maxVal: maxV };
  }

  function paethPredictor(a, b, c) {
    let p = a + b - c;
    let pa = Math.abs(p - a);
    let pb = Math.abs(p - b);
    let pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  // -------------------------------------------------------------
  // Colormap Utility Functions
  // -------------------------------------------------------------
  function getColor(valNorm, colormap) {
    // valNorm in [0, 1]
    valNorm = Math.max(0, Math.min(1, valNorm));

    if (colormap === "grayscale") {
      let v = Math.floor(valNorm * 255);
      return [v, v, v];
    }

    if (colormap === "rainbow") {
      // Blue -> Cyan -> Green -> Yellow -> Red
      let h = (1 - valNorm) * 240; // 240 is blue, 0 is red
      return hslToRgb(h / 360, 1.0, 0.5);
    }

    if (colormap === "jet") {
      let r = Math.max(0, Math.min(1, Math.min(4 * valNorm - 1.5, -4 * valNorm + 4.5)));
      let g = Math.max(0, Math.min(1, Math.min(4 * valNorm - 0.5, -4 * valNorm + 3.5)));
      let b = Math.max(0, Math.min(1, Math.min(4 * valNorm + 0.5, -4 * valNorm + 2.5)));
      return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
    }

    if (colormap === "viridis") {
      // Viridis approximation polynomial / keypoints
      let r = 0.2 + 0.8 * valNorm;
      let g = 0.1 + 0.9 * Math.sin(valNorm * Math.PI * 0.9);
      let b = 0.5 + 0.5 * Math.cos(valNorm * Math.PI * 0.8);
      if (valNorm < 0.3) { r = 0.27 * (valNorm/0.3); g = 0.0 + 0.5*(valNorm/0.3); b = 0.33 + 0.3*(valNorm/0.3); }
      else if (valNorm < 0.7) { r = 0.27 + 0.25*((valNorm-0.3)/0.4); g = 0.5 + 0.3*((valNorm-0.3)/0.4); b = 0.63 - 0.3*((valNorm-0.3)/0.4); }
      else { r = 0.52 + 0.45*((valNorm-0.7)/0.3); g = 0.8 + 0.18*((valNorm-0.7)/0.3); b = 0.33 - 0.25*((valNorm-0.7)/0.3); }
      return [Math.floor(Math.max(0, Math.min(255, r * 255))), Math.floor(Math.max(0, Math.min(255, g * 255))), Math.floor(Math.max(0, Math.min(255, b * 255)))];
    }

    if (colormap === "plasma") {
      let r = Math.sin(valNorm * Math.PI * 0.5);
      let g = Math.pow(valNorm, 2);
      let b = Math.cos(valNorm * Math.PI * 0.5);
      return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
    }

    // Default fallback
    let v = Math.floor(valNorm * 255);
    return [v, v, v];
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
  }

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }

  // -------------------------------------------------------------
  // Rendering Main Canvas & ROI Controls
  // -------------------------------------------------------------
  function renderMainCanvas() {
    if (!mainCanvas || loadedImages.length === 0) return;
    let imgObj = loadedImages[currentImageIdx];
    let w = imgObj.width;
    let h = imgObj.height;

    mainCanvas.width = w;
    mainCanvas.height = h;

    let cMinPct = parseFloat(contrastMinSlider.value) / 100;
    let cMaxPct = parseFloat(contrastMaxSlider.value) / 100;
    let minV = imgObj.minVal + cMinPct * (imgObj.maxVal - imgObj.minVal);
    let maxV = imgObj.minVal + cMaxPct * (imgObj.maxVal - imgObj.minVal);
    if (maxV <= minV) maxV = minV + 1e-5;

    let cmap = colormapSelect.value;
    let imgData = mainCtx.createImageData(w, h);
    let pixels = imgData.data;
    let gData = imgObj.data;

    for (let i = 0; i < w * h; i++) {
      let norm = (gData[i] - minV) / (maxV - minV);
      let [r, g, b] = getColor(norm, cmap);
      pixels[i * 4] = r;
      pixels[i * 4 + 1] = g;
      pixels[i * 4 + 2] = b;
      pixels[i * 4 + 3] = 255;
    }

    mainCtx.putImageData(imgData, 0, 0);

    // Draw Yellow ROI Rectangle & Corner Handles
    drawRoiBox(mainCtx, roi);
  }

  function drawRoiBox(ctx, roiBox) {
    ctx.save();
    ctx.strokeStyle = "#facc15"; // Vibrant yellow
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.strokeRect(roiBox.x, roiBox.y, roiBox.w, roiBox.h);

    // Draw 4 corner handles
    const handleSize = 8;
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;

    let corners = [
      { x: roiBox.x, y: roiBox.y }, // TL
      { x: roiBox.x + roiBox.w, y: roiBox.y }, // TR
      { x: roiBox.x, y: roiBox.y + roiBox.h }, // BL
      { x: roiBox.x + roiBox.w, y: roiBox.y + roiBox.h } // BR
    ];

    for (let c of corners) {
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    }
    ctx.restore();
  }

  // -------------------------------------------------------------
  // Canvas Interactive Mouse/Touch Events for Dragging ROI
  // -------------------------------------------------------------
  function setupCanvasInteraction() {
    if (!mainCanvas) return;

    function getCanvasCoords(e) {
      let rect = mainCanvas.getBoundingClientRect();
      let scaleX = mainCanvas.width / rect.width;
      let scaleY = mainCanvas.height / rect.height;
      let clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function detectHit(pos) {
      const handleSize = 16; // Hit area tolerance
      let r = roi;

      // Check Corner Handles
      if (Math.hypot(pos.x - r.x, pos.y - r.y) < handleSize) return 'tl';
      if (Math.hypot(pos.x - (r.x + r.w), pos.y - r.y) < handleSize) return 'tr';
      if (Math.hypot(pos.x - r.x, pos.y - (r.y + r.h)) < handleSize) return 'bl';
      if (Math.hypot(pos.x - (r.x + r.w), pos.y - (r.y + r.h)) < handleSize) return 'br';

      // Check ROI Body
      if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) return 'body';

      return null;
    }

    function onStart(e) {
      if (loadedImages.length === 0) return;
      let pos = getCanvasCoords(e);
      let hit = detectHit(pos);
      if (hit) {
        isDraggingRoi = true;
        activeHandle = hit;
        dragStartPos = pos;
        roiStartPos = { ...roi };
        e.preventDefault();
      }
    }

    function onMove(e) {
      if (!isDraggingRoi || loadedImages.length === 0) {
        // Change cursor icon on hover
        let pos = getCanvasCoords(e);
        let hit = detectHit(pos);
        if (hit === 'tl' || hit === 'br') mainCanvas.style.cursor = 'nwse-resize';
        else if (hit === 'tr' || hit === 'bl') mainCanvas.style.cursor = 'nesw-resize';
        else if (hit === 'body') mainCanvas.style.cursor = 'move';
        else mainCanvas.style.cursor = 'default';
        return;
      }

      let pos = getCanvasCoords(e);
      let dx = pos.x - dragStartPos.x;
      let dy = pos.y - dragStartPos.y;
      let imgW = loadedImages[currentImageIdx].width;
      let imgH = loadedImages[currentImageIdx].height;
      let minSize = 10;

      let r = { ...roiStartPos };

      if (activeHandle === 'body') {
        r.x = Math.max(0, Math.min(imgW - r.w, roiStartPos.x + dx));
        r.y = Math.max(0, Math.min(imgH - r.h, roiStartPos.y + dy));
      } else if (activeHandle === 'tl') {
        let newX = Math.max(0, Math.min(roiStartPos.x + roiStartPos.w - minSize, roiStartPos.x + dx));
        let newY = Math.max(0, Math.min(roiStartPos.y + roiStartPos.h - minSize, roiStartPos.y + dy));
        r.w = roiStartPos.x + roiStartPos.w - newX;
        r.h = roiStartPos.y + roiStartPos.h - newY;
        r.x = newX;
        r.y = newY;
      } else if (activeHandle === 'tr') {
        let newY = Math.max(0, Math.min(roiStartPos.y + roiStartPos.h - minSize, roiStartPos.y + dy));
        r.w = Math.max(minSize, Math.min(imgW - roiStartPos.x, roiStartPos.w + dx));
        r.h = roiStartPos.y + roiStartPos.h - newY;
        r.y = newY;
      } else if (activeHandle === 'bl') {
        let newX = Math.max(0, Math.min(roiStartPos.x + roiStartPos.w - minSize, roiStartPos.x + dx));
        r.w = roiStartPos.x + roiStartPos.w - newX;
        r.h = Math.max(minSize, Math.min(imgH - roiStartPos.y, roiStartPos.h + dy));
        r.x = newX;
      } else if (activeHandle === 'br') {
        r.w = Math.max(minSize, Math.min(imgW - roiStartPos.x, roiStartPos.w + dx));
        r.h = Math.max(minSize, Math.min(imgH - roiStartPos.y, roiStartPos.h + dy));
      }

      roi = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.w), h: Math.round(r.h) };
      renderMainCanvas();
      e.preventDefault();
    }

    function onEnd() {
      isDraggingRoi = false;
      activeHandle = null;
    }

    mainCanvas.addEventListener('mousedown', onStart);
    mainCanvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    mainCanvas.addEventListener('touchstart', onStart);
    mainCanvas.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  }

  // -------------------------------------------------------------
  // 2D Rotated Gaussian Fitting Engine
  // -------------------------------------------------------------
  function runCalculations() {
    showError("");
    if (loadedImages.length === 0) {
      showError("Please upload image files first.");
      return;
    }

    let calibX = parseFloat(calibXInput.value);
    let calibY = calibSameCheckbox.checked ? calibX : parseFloat(calibYInput.value);

    if (isNaN(calibX) || calibX <= 0 || isNaN(calibY) || calibY <= 0) {
      showError("Please enter valid positive values for spatial calibration.");
      return;
    }

    let isPulsed = enablePulsedCheckbox.checked;
    let energyJ = isPulsed ? parseFloat(pulseEnergyInput.value) : 0;
    let durationFs = isPulsed ? parseFloat(pulseDurationInput.value) : 0;
    let wavelengthNm = isPulsed ? parseFloat(wavelengthInput.value) : 800;

    if (isPulsed && (isNaN(energyJ) || energyJ <= 0 || isNaN(durationFs) || durationFs <= 0 || isNaN(wavelengthNm) || wavelengthNm <= 0)) {
      showError("Please enter valid positive values for pulse energy, duration, and wavelength.");
      return;
    }

    // Process fitting for each image
    for (let imgObj of loadedImages) {
      imgObj.fitResult = fit2DGaussianROI(imgObj, roi, calibX, calibY, isPulsed, energyJ, durationFs, wavelengthNm);
    }

    // Show Results Section
    resultsContainer.style.display = "block";

    if (loadedImages.length > 0) {
      currentPostIdx = 0;
      postImageSlider.value = 0;
      postImageSliderLabel.innerText = "1 / " + loadedImages.length;
    }

    // Update Summary Tables & Post-Processed Canvas
    updateSummaryTables(isPulsed);
    renderPostRoiCanvas();
  }

  function fit2DGaussianROI(imgObj, roiBox, calibX, calibY, isPulsed, energyJ, durationFs, wavelengthNm) {
    let imgW = imgObj.width;
    let imgH = imgObj.height;
    let data = imgObj.data;

    let rx = Math.max(0, Math.min(imgW - 1, roiBox.x));
    let ry = Math.max(0, Math.min(imgH - 1, roiBox.y));
    let rw = Math.max(5, Math.min(imgW - rx, roiBox.w));
    let rh = Math.max(5, Math.min(imgH - ry, roiBox.h));

    // Extract sub-array for ROI
    let roiData = new Float64Array(rw * rh);
    let minVal = Infinity, maxVal = -Infinity;
    let maxPx = 0, maxPy = 0;

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        let v = data[(ry + y) * imgW + (rx + x)];
        roiData[y * rw + x] = v;
        if (v < minVal) minVal = v;
        if (v > maxVal) {
          maxVal = v;
          maxPx = x;
          maxPy = y;
        }
      }
    }

    let amp0 = maxVal - minVal;
    let offset0 = minVal;
    let xo0 = maxPx;
    let yo0 = maxPy;
    let sigX0 = rw / 8;
    let sigY0 = rh / 8;
    let theta0 = 0;

    // Parameter vector: [amp, xo, yo, sigX, sigY, theta, offset]
    let p = [amp0, xo0, yo0, sigX0, sigY0, theta0, offset0];

    // Non-Linear Optimization (Nelder-Mead Simplex method)
    let bestP = simplexOptimize(p, roiData, rw, rh);

    let [amp, xo, yo, sigX, sigY, theta, offset] = bestP;
    sigX = Math.abs(sigX);
    sigY = Math.abs(sigY);

    // Validate fit bounds
    if (amp <= 0 || sigX < 0.5 || sigY < 0.5 || xo < -rw || xo > 2 * rw || yo < -rh || yo > 2 * rh) {
      return { success: false };
    }

    // FWHM major and minor axes
    let fwhmX = 2 * Math.sqrt(2 * Math.LN2) * sigX * calibX;
    let fwhmY = 2 * Math.sqrt(2 * Math.LN2) * sigY * calibY;
    let fwhmMajor = Math.max(fwhmX, fwhmY);
    let fwhmMinor = Math.min(fwhmX, fwhmY);

    // RMS Beam Size (mean RMS radius)
    let sigX_um = sigX * calibX;
    let sigY_um = sigY * calibY;
    let rmsMaj_um = Math.max(sigX_um, sigY_um);
    let rmsMin_um = Math.min(sigX_um, sigY_um);
    let rms_um = Math.sqrt((sigX_um * sigX_um + sigY_um * sigY_um) / 2);

    // q-factor: sum of counts within FWHM ellipse / sum of total counts in ROI
    let cosT = Math.cos(theta);
    let sinT = Math.sin(theta);
    let a_coef = (cosT * cosT) / (2 * sigX * sigX) + (sinT * sinT) / (2 * sigY * sigY);
    let b_coef = -Math.sin(2 * theta) / (4 * sigX * sigX) + Math.sin(2 * theta) / (4 * sigY * sigY);
    let c_coef = (sinT * sinT) / (2 * sigX * sigX) + (cosT * cosT) / (2 * sigY * sigY);

    let fwhmSum = 0;
    let totalSum = 0;

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        let v = roiData[y * rw + x];
        totalSum += v;
        let dx = x - xo;
        let dy = y - yo;
        let expVal = a_coef * dx * dx + 2 * b_coef * dx * dy + c_coef * dy * dy;
        if (expVal <= Math.LN2) {
          fwhmSum += v;
        }
      }
    }

    let qFactor = totalSum > 0 ? fwhmSum / totalSum : 0;

    // Pulsed Intensity & a0 calculation
    let intensityGauss = 0, intensityTophat = 0;
    let a0Gauss = 0, a0Tophat = 0;
      if (isPulsed) {
        // w0 = FWHM / sqrt(2*ln(2))
        let w0Major_um = fwhmMajor / Math.sqrt(2 * Math.LN2);
        let w0Minor_um = fwhmMinor / Math.sqrt(2 * Math.LN2);
        let spotArea_um2 = Math.PI * w0Major_um * w0Minor_um; // um^2
        
        // Wavelength and Energy parameters
        let wavelengthNm = parseFloat(document.getElementById('wavelength').value) || 800;
        let energyJ = parseFloat(document.getElementById('pulse-energy').value) || 0.60;
        let durationFs = parseFloat(document.getElementById('pulse-duration').value) || 30;

        // Peak Power P (TW) = (E_J / tau_fs) * 1000 * q * factor
        let P_gauss_TW = (energyJ / durationFs) / Math.sqrt(Math.PI) * 2 * Math.LN2 * 1000 * qFactor;

        // Peak Intensity I0 (10^18 W/cm^2) = 2 * P_TW / (pi * w0x * w0y) * 100
        // We convert spot area from um^2 to cm^2 (1 um^2 = 1e-8 cm^2) implicitly by the formula factors
        intensityGauss = (2 * P_gauss_TW / spotArea_um2) * 100;

        let lambda_um = wavelengthNm / 1000;
        // Normalised vector potential a0 = 0.86 * lambda_um * sqrt(I0)
        a0Gauss = 0.86 * lambda_um * Math.sqrt(Math.max(0, intensityGauss));
      }

      return {
        success: true,
        amplitude: amp,
        xo: rx + xo,
        yo: ry + yo,
        localXo: xo,
        localYo: yo,
        sigmaX: sigX,
        sigmaY: sigY,
        theta: theta,
        offset: offset,
        FWHM_maj: fwhmMajor,
        FWHM_min: fwhmMinor,
        RMS_spot: rms_um,
        RMS_maj: rmsMaj_um,
        RMS_min: rmsMin_um,
        qFactor: qFactor,
        intensityGauss: intensityGauss,
        a0Gauss: a0Gauss
      };
    }

    // Nelder-Mead Simplex Optimizer for 2D Gaussian Fit
    function simplexOptimize(initialP, roiData, rw, rh) {
      let N = initialP.length;
      let simplex = new Array(N + 1);
      simplex[0] = initialP.slice();

      // Generate initial simplex vertices
      let step = [initialP[0] * 0.2, 5, 5, 3, 3, 0.2, initialP[6] * 0.2];
      for (let i = 0; i < N; i++) {
        let vertex = initialP.slice();
        vertex[i] += step[i] !== 0 ? step[i] : 1.0;
        simplex[i + 1] = vertex;
      }

      function cost(pVec) {
        let [amp, xo, yo, sigX, sigY, theta, offset] = pVec;
        if (sigX <= 0.1 || sigY <= 0.1) return 1e18;
        let cosT = Math.cos(theta);
        let sinT = Math.sin(theta);
        let a = (cosT * cosT) / (2 * sigX * sigX) + (sinT * sinT) / (2 * sigY * sigY);
        let b = -Math.sin(2 * theta) / (4 * sigX * sigX) + Math.sin(2 * theta) / (4 * sigY * sigY);
        let c = (sinT * sinT) / (2 * sigX * sigX) + (cosT * cosT) / (2 * sigY * sigY);

        let err = 0;
        for (let y = 0; y < rh; y += 2) { // Downsampled 2x2 for speed
          let dy = y - yo;
          for (let x = 0; x < rw; x += 2) {
            let dx = x - xo;
            let model = offset + amp * Math.exp(-(a * dx * dx + 2 * b * dx * dy + c * dy * dy));
            let diff = roiData[y * rw + x] - model;
            err += diff * diff;
          }
        }
        return err;
      }

      let costs = simplex.map(cost);

      for (let iter = 0; iter < 800; iter++) {
        // Order vertices by cost
        let indices = Array.from({ length: N + 1 }, (_, i) => i).sort((a, b) => costs[a] - costs[b]);
        let bestIdx = indices[0];
        let worstIdx = indices[N];
        let secWorstIdx = indices[N - 1];

        // Check convergence (relative tolerance)
        let costRange = Math.abs(costs[worstIdx] - costs[bestIdx]);
        let costScale = Math.max(1, Math.abs(costs[bestIdx]));
        if (costRange / costScale < 1e-10) break;

        // Centroid of best N vertices
        let centroid = new Float64Array(N);
        for (let i = 0; i < N; i++) {
          let idx = indices[i];
          for (let j = 0; j < N; j++) centroid[j] += simplex[idx][j] / N;
        }

        // Reflection
        let alpha = 1.0;
        let reflected = new Array(N);
        for (let j = 0; j < N; j++) reflected[j] = centroid[j] + alpha * (centroid[j] - simplex[worstIdx][j]);
        let refCost = cost(reflected);

        if (refCost < costs[secWorstIdx] && refCost >= costs[bestIdx]) {
          simplex[worstIdx] = reflected;
          costs[worstIdx] = refCost;
          continue;
        }

        // Expansion
        if (refCost < costs[bestIdx]) {
          let gamma = 2.0;
          let expanded = new Array(N);
          for (let j = 0; j < N; j++) expanded[j] = centroid[j] + gamma * (reflected[j] - centroid[j]);
          let expCost = cost(expanded);
          if (expCost < refCost) {
            simplex[worstIdx] = expanded;
            costs[worstIdx] = expCost;
          } else {
            simplex[worstIdx] = reflected;
            costs[worstIdx] = refCost;
          }
          continue;
        }

        // Contraction
        let rho = 0.5;
        let contracted = new Array(N);
        for (let j = 0; j < N; j++) contracted[j] = centroid[j] + rho * (simplex[worstIdx][j] - centroid[j]);
        let conCost = cost(contracted);

        if (conCost < costs[worstIdx]) {
          simplex[worstIdx] = contracted;
          costs[worstIdx] = conCost;
          continue;
        }

        // Shrink
        let sigma = 0.5;
        for (let i = 1; i <= N; i++) {
          let idx = indices[i];
          for (let j = 0; j < N; j++) {
            simplex[idx][j] = simplex[bestIdx][j] + sigma * (simplex[idx][j] - simplex[bestIdx][j]);
          }
          costs[idx] = cost(simplex[idx]);
        }
      }

      let finalBestIdx = Array.from({ length: N + 1 }, (_, i) => i).sort((a, b) => costs[a] - costs[b])[0];
      return simplex[finalBestIdx];
    }

    // -------------------------------------------------------------
    // Summary Tables Output
    // -------------------------------------------------------------
    function updateSummaryTables() {
      function calcStats(arr) {
        let mean = arr.reduce((a, b) => a + b, 0) / arr.length;
        let std = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length);
        return { mean, std };
      }

      let fwhmMajArr = [], fwhmMinArr = [], rmsArr = [], qFactorArr = [];
      let rmsMajArr = [], rmsMinArr = [];
      let iGaussArr = [], a0GaussArr = [];
      
      let isPulsedEnabled = document.getElementById('enable-pulsed').checked;

      for (let img of loadedImages) {
        if (!img.fitResult || !img.fitResult.success) continue;
        fwhmMajArr.push(img.fitResult.FWHM_maj);
        fwhmMinArr.push(img.fitResult.FWHM_min);
        rmsArr.push(img.fitResult.RMS_spot);
        rmsMajArr.push(img.fitResult.RMS_maj);
        rmsMinArr.push(img.fitResult.RMS_min);
        qFactorArr.push(img.fitResult.qFactor);

        if (isPulsedEnabled && img.fitResult.intensityGauss !== undefined) {
          iGaussArr.push(img.fitResult.intensityGauss);
          a0GaussArr.push(img.fitResult.a0Gauss);
        }
      }

      if (fwhmMajArr.length === 0) {
        summaryTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#ef4444;">Fit could not be converged.</td></tr>`;
        return;
      }

      let fwhmMajStats = calcStats(fwhmMajArr);
      let fwhmMinStats = calcStats(fwhmMinArr);
      let rmsStats = calcStats(rmsArr);
      let rmsMajStats = calcStats(rmsMajArr);
      let rmsMinStats = calcStats(rmsMinArr);
      let qFactorStats = calcStats(qFactorArr);

      summaryTableBody.innerHTML = `
        <tr>
          <td><strong>RMS Major Axis (d<sub>RMS, maj</sub>)</strong></td>
          <td class="font-highlight">${rmsMajStats.mean.toFixed(2)} μm</td>
          <td>${rmsMajStats.std.toFixed(2)} μm</td>
        </tr>
        <tr>
          <td><strong>RMS Minor Axis (d<sub>RMS, min</sub>)</strong></td>
          <td class="font-highlight">${rmsMinStats.mean.toFixed(2)} μm</td>
          <td>${rmsMinStats.std.toFixed(2)} μm</td>
        </tr>
        <tr>
          <td><strong>FWHM Major Axis (d<sub>FWHM, maj</sub>)</strong></td>
          <td class="font-highlight">${fwhmMajStats.mean.toFixed(2)} μm</td>
          <td>${fwhmMajStats.std.toFixed(2)} μm</td>
        </tr>
        <tr>
          <td><strong>FWHM Minor Axis (d<sub>FWHM, min</sub>)</strong></td>
          <td class="font-highlight">${fwhmMinStats.mean.toFixed(2)} μm</td>
          <td>${fwhmMinStats.std.toFixed(2)} μm</td>
        </tr>
        <tr>
          <td><strong>Energy Fraction (<i>q</i>-factor)</strong></td>
          <td class="font-highlight">${qFactorStats.mean.toFixed(3)}</td>
          <td>${qFactorStats.std.toFixed(3)}</td>
        </tr>
      `;

      if (isPulsedEnabled && iGaussArr.length > 0) {
        let iGaussStats = calcStats(iGaussArr);
        let a0GaussStats = calcStats(a0GaussArr);

        pulsedTableGroup.style.display = 'block';
        pulsedSummaryBody.innerHTML = `
          <tr>
            <td><strong>Peak Intensity (I<sub>0</sub>)</strong></td>
            <td class="font-highlight">${iGaussStats.mean.toFixed(2)} ± ${iGaussStats.std.toFixed(2)} × 10<sup>18</sup> W/cm<sup>2</sup></td>
          </tr>
          <tr>
            <td><strong>Normalized Vector Potential (a<sub>0</sub>)</strong></td>
            <td class="font-highlight">${a0GaussStats.mean.toFixed(2)} ± ${a0GaussStats.std.toFixed(2)}</td>
          </tr>
        `;
      } else {
        pulsedTableGroup.style.display = 'none';
      }
    }

    // -------------------------------------------------------------
    // Render Post-Processed ROI Display with White FWHM Contour
    // -------------------------------------------------------------
    function renderPostRoiCanvas() {
      if (!roiCanvas || loadedImages.length === 0) return;
      let imgObj = loadedImages[currentPostIdx];
      let fit = imgObj.fitResult;

      let rx = Math.max(0, Math.min(imgObj.width - 1, roi.x));
      let ry = Math.max(0, Math.min(imgObj.height - 1, roi.y));
      let rw = Math.max(5, Math.min(imgObj.width - rx, roi.w));
      let rh = Math.max(5, Math.min(imgObj.height - ry, roi.h));

      roiCanvas.width = rw;
      roiCanvas.height = rh;

      let cMinPct = parseFloat(postContrastMinSlider.value) / 100;
      let cMaxPct = parseFloat(postContrastMaxSlider.value) / 100;
      let minV = imgObj.minVal + cMinPct * (imgObj.maxVal - imgObj.minVal);
      let maxV = imgObj.minVal + cMaxPct * (imgObj.maxVal - imgObj.minVal);
      if (maxV <= minV) maxV = minV + 1e-5;

      let cmap = colormapSelect.value;
      let roiImgData = roiCtx.createImageData(rw, rh);
      let pixels = roiImgData.data;

      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          let v = imgObj.data[(ry + y) * imgObj.width + (rx + x)];
          let norm = (v - minV) / (maxV - minV);
          let [r, g, b] = getColor(norm, cmap);
          let idx = (y * rw + x) * 4;
          pixels[idx] = r;
          pixels[idx + 1] = g;
          pixels[idx + 2] = b;
          pixels[idx + 3] = 255;
        }
      }

      roiCtx.putImageData(roiImgData, 0, 0);

      // If fit was successful, draw FWHM Contour Line
      if (fit && fit.success) {
        let localXo = fit.localXo;
        let localYo = fit.localYo;
        let sigX = fit.sigmaX;
        let sigY = fit.sigmaY;
        let theta = fit.theta;

        let contourColor = "#ffffff";
        if (cmap === "grayscale") contourColor = "#ff0000";
        else if (cmap === "rainbow" || cmap === "jet") contourColor = "#ffffff";
        else if (cmap === "viridis") contourColor = "#ff0000";
        else if (cmap === "plasma") contourColor = "#00ff00";

        roiCtx.save();
        roiCtx.strokeStyle = contourColor;
        roiCtx.lineWidth = 2;
        roiCtx.beginPath();

        // Parametric FWHM Ellipse
        let numPts = 100;
        let rFwhmX = Math.sqrt(2 * Math.LN2) * sigX;
        let rFwhmY = Math.sqrt(2 * Math.LN2) * sigY;
        let cosT = Math.cos(theta);
        let sinT = Math.sin(theta);

        for (let i = 0; i <= numPts; i++) {
          let phi = (i / numPts) * 2 * Math.PI;
          let ex = rFwhmX * Math.cos(phi);
          let ey = rFwhmY * Math.sin(phi);

          // Corrected rotation inverse for drawing: x = x'*cos(t) + y'*sin(t), y = -x'*sin(t) + y'*cos(t)
          let rotX = localXo + (ex * cosT + ey * sinT);
          let rotY = localYo + (-ex * sinT + ey * cosT);

          if (i === 0) roiCtx.moveTo(rotX, rotY);
          else roiCtx.lineTo(rotX, rotY);
        }

        roiCtx.closePath();
        roiCtx.stroke();
        roiCtx.restore();

        let isPulsed = enablePulsedCheckbox.checked;
        let pulsedHtml = isPulsed ? `
          <p style="margin:0.25rem 0;"><strong>Peak Intensity (I<sub>0</sub>):</strong> ${fit.intensityGauss.toFixed(2)} × 10<sup>18</sup> W/cm<sup>2</sup></p>
          <p style="margin:0.25rem 0;"><strong>Vector Potential (a<sub>0</sub>):</strong> ${fit.a0Gauss.toFixed(2)}</p>
        ` : '';

        roiStatsDiv.innerHTML = `
          <h4 style="margin-top:0; margin-bottom:0.5rem; color:#111827; word-break: break-all;">Image ${currentPostIdx + 1}: ${imgObj.name}</h4>
          <p style="margin:0.25rem 0;"><strong>RMS Major:</strong> <span class="font-highlight">${fit.RMS_maj.toFixed(2)} μm</span></p>
          <p style="margin:0.25rem 0;"><strong>RMS Minor:</strong> <span class="font-highlight">${fit.RMS_min.toFixed(2)} μm</span></p>
          <p style="margin:0.25rem 0;"><strong>FWHM Major:</strong> <span class="font-highlight">${fit.fwhmMajor_um ? fit.fwhmMajor_um.toFixed(2) : fit.FWHM_maj.toFixed(2)} μm</span></p>
          <p style="margin:0.25rem 0;"><strong>FWHM Minor:</strong> <span class="font-highlight">${fit.fwhmMinor_um ? fit.fwhmMinor_um.toFixed(2) : fit.FWHM_min.toFixed(2)} μm</span></p>
          <p style="margin:0.25rem 0;"><strong><i>q</i>-factor:</strong> ${fit.qFactor.toFixed(3)}</p>
          ${pulsedHtml}
        `;
      } else if (fit && !fit.success) {
        roiStatsDiv.innerHTML = `
          <h4 style="margin-top:0; margin-bottom:0.5rem; color:#111827; word-break: break-all;">Image ${currentPostIdx + 1}: ${imgObj.name}</h4>
          <p style="color:#ef4444; font-weight:700;">Fit not possible</p>
        `;
      } else {
        roiStatsDiv.innerHTML = `
          <h4 style="margin-top:0; margin-bottom:0.5rem; color:#111827; word-break: break-all;">Image ${currentPostIdx + 1}: ${imgObj.name}</h4>
          <p style="color:#6b7280;">Click "Calculate" to perform 2D Gaussian fit.</p>
        `;
      }
    }
  function showError(msg) {
    if (errorMessageDiv) {
      if (msg) {
        errorMessageDiv.innerText = msg;
        errorMessageDiv.style.display = "block";
      } else {
        errorMessageDiv.innerText = "";
        errorMessageDiv.style.display = "none";
      }
    }
  }

  // -------------------------------------------------------------
  // Memory Diagnostics
  // -------------------------------------------------------------
  function updateMemoryDiagnostics() {
    let totalAssetsBytes = 0;
    for (let img of loadedImages) {
      if (img.fileSize) totalAssetsBytes += img.fileSize;
      if (img.width && img.height) {
        totalAssetsBytes += img.width * img.height * 12; // 8 bytes for Float64Array + 4 bytes Canvas pixels
      }
    }

    const assetsEl = document.getElementById("memory-assets");
    if (assetsEl) {
      assetsEl.innerText = (totalAssetsBytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    const tabEl = document.getElementById("memory-tab");
    if (tabEl) {
      if (window.performance && window.performance.memory) {
        let heapBytes = window.performance.memory.usedJSHeapSize;
        tabEl.innerText = (heapBytes / (1024 * 1024)).toFixed(2) + " MB";
      } else {
        tabEl.innerText = "N/A";
      }
    }

    const monitorEl = document.getElementById("memory-monitor");
    if (monitorEl) {
      monitorEl.style.display = loadedImages.length > 0 ? "block" : "none";
    }
  }

  // Update memory usage loop
  setInterval(updateMemoryDiagnostics, 2500);
});
