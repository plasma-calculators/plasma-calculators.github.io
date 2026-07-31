/**
 * Electron Beam Pointing, Divergence & Charge Calculator Engine
 * Handles image uploading, interactive dual-ROI selection (Signal & Background),
 * background subtraction, 2D Gaussian fitting, divergence & pointing stability
 * calculations, absolute charge estimation, and memory diagnostics.
 */

document.addEventListener("DOMContentLoaded", function () {
  // UI Elements
  const imageUploadInput = document.getElementById("image-upload");
  const calibSameCheckbox = document.getElementById("calib-same");
  const calibXInput = document.getElementById("calib-x");
  const calibYInput = document.getElementById("calib-y");
  const calibYGroup = document.getElementById("calib-y-group");

  const distSourceScreenInput = document.getElementById("dist-source-screen");

  const enableChargeCheckbox = document.getElementById("enable-charge");
  const chargeInputsDiv = document.getElementById("charge-inputs");
  const screenYieldInput = document.getElementById("screen-yield");
  const distCamScreenInput = document.getElementById("dist-cam-screen");
  const cameraCalibInput = document.getElementById("camera-calib");
  const lensFocalInput = document.getElementById("lens-focal");
  const lensFnumberInput = document.getElementById("lens-fnumber");
  const transmissionLossInput = document.getElementById("transmission-loss");

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
  const pointingStabilityBody = document.getElementById("pointing-stability-body");
  const chargeTableGroup = document.getElementById("charge-summary-group");
  const chargeSummaryBody = document.getElementById("charge-summary-body");

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
  let loadedImages = []; // Array of { name, width, height, data: Float64Array, minVal, maxVal, fileSize, fitResult: null }
  let currentImageIdx = 0;
  let currentPostIdx = 0;

  // Dual ROI State (in image pixel coordinates)
  // Default values matching ebeam_pointing_jeti.py and pointing.py
  let signalRoi = { x: 670, y: 305, w: 470, h: 385 };
  let bgRoi = { x: 660, y: 790, w: 40, h: 30 };

  let isDraggingRoi = false;
  let activeRoi = null; // Reference to signalRoi or bgRoi
  let activeHandle = null; // 'tl', 'tr', 'bl', 'br', 'body'

  // -------------------------------------------------------------
  // Setup Event Listeners
  // -------------------------------------------------------------
  if (calibSameCheckbox) {
    calibSameCheckbox.addEventListener("change", function () {
      calibYGroup.style.display = calibSameCheckbox.checked ? "none" : "block";
    });
  }

  if (enableChargeCheckbox) {
    enableChargeCheckbox.addEventListener("change", function () {
      chargeInputsDiv.style.display = enableChargeCheckbox.checked ? "block" : "none";
      if (chargeTableGroup) {
        chargeTableGroup.style.display = enableChargeCheckbox.checked ? "block" : "none";
      }
    });
  }

  if (imageUploadInput) {
    imageUploadInput.addEventListener("change", handleImageUpload);
  }

  const exampleSelect = document.getElementById("example-select");
  if (exampleSelect) {
    exampleSelect.addEventListener("change", handleExampleSelect);
  }

  const gpuChk = document.getElementById("gpu-chk");
  const calcEngineLabel = document.getElementById("calc-engine-label");
  if (gpuChk && calcEngineLabel) {
    gpuChk.addEventListener("change", function() {
      if (gpuChk.checked) {
        calcEngineLabel.innerHTML = "GPU<br>(WebGL 2D FFT)";
        calcEngineLabel.style.color = "#2563eb";
      } else {
        calcEngineLabel.innerHTML = "CPU<br>(2D Canvas)";
        calcEngineLabel.style.color = "#4b5563";
      }
      renderMainCanvas();
      renderPostRoiCanvas();
    });
    // Trigger initial state
    gpuChk.dispatchEvent(new Event("change"));
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

  // No radio update needed

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
    if (resultsContainer) resultsContainer.style.display = "none";

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

    // Centering default ROIs if loaded image is smaller than default boundaries
    let img = loadedImages[0];
    if (signalRoi.x + signalRoi.w > img.width || signalRoi.y + signalRoi.h > img.height) {
      // Re-initialize signal ROI centered
      signalRoi.w = Math.min(200, Math.floor(img.width * 0.4));
      signalRoi.h = Math.min(200, Math.floor(img.height * 0.4));
      signalRoi.x = Math.max(0, Math.floor((img.width - signalRoi.w) / 2));
      signalRoi.y = Math.max(0, Math.floor((img.height - signalRoi.h) / 2));
    }
    if (bgRoi.x + bgRoi.w > img.width || bgRoi.y + bgRoi.h > img.height) {
      // Re-initialize background ROI top-left
      bgRoi.x = 10;
      bgRoi.y = 10;
      bgRoi.w = Math.min(50, Math.floor(img.width * 0.1));
      bgRoi.h = Math.min(50, Math.floor(img.height * 0.1));
    }

    renderMainCanvas();
    updateMemoryDiagnostics();
  }

  async function handleExampleSelect(e) {
    const url = e.target.value;
    if (!url) return;

    showError("");
    const selectEl = e.target;
    selectEl.disabled = true;

    try {
      loadedImages = [];
      currentImageIdx = 0;
      currentPostIdx = 0;
      if (resultsContainer) resultsContainer.style.display = "none";

      let response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch " + url);
      let blob = await response.blob();
      let filename = url.split('/').pop();
      let file = new File([blob], filename, { type: blob.type });
      
      let imgData = await parseImageFile(file);
      if (imgData) loadedImages.push(imgData);

      if (loadedImages.length === 0) {
        showError("Could not load example image.");
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

      // Centering default ROIs if loaded image is smaller than default boundaries
      let img = loadedImages[0];
      if (signalRoi.x + signalRoi.w > img.width || signalRoi.y + signalRoi.h > img.height) {
        signalRoi.w = Math.min(200, Math.floor(img.width * 0.4));
        signalRoi.h = Math.min(200, Math.floor(img.height * 0.4));
        signalRoi.x = Math.max(0, Math.floor((img.width - signalRoi.w) / 2));
        signalRoi.y = Math.max(0, Math.floor((img.height - signalRoi.h) / 2));
      }
      if (bgRoi.x + bgRoi.w > img.width || bgRoi.y + bgRoi.h > img.height) {
        bgRoi.x = 10;
        bgRoi.y = 10;
        bgRoi.w = Math.min(50, Math.floor(img.width * 0.1));
        bgRoi.h = Math.min(50, Math.floor(img.height * 0.1));
      }

      renderMainCanvas();
      updateMemoryDiagnostics();
    } catch (err) {
      console.error(err);
      showError("Error loading example: " + err.message);
    } finally {
      selectEl.disabled = false;
    }
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
        // PNG or JPEG
        reader.onload = async function (e) {
          let buffer = e.target.result;
          if (ext === "png") {
            try {
              let result16 = await parsePNG16bitAsync(buffer);
              if (result16) {
                resolve(Object.assign({ name: file.name, fitResult: null, fileSize: file.size }, result16));
                return;
              }
            } catch (err16) {
              // Fallback
            }
          }
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

  // 16-bit PNG parser
  async function parsePNG16bitAsync(buffer) {
    let data = new Uint8Array(buffer);
    if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47) return null;

    let d = 16;
    let width  = (data[d]<<24) | (data[d+1]<<16) | (data[d+2]<<8) | data[d+3];
    let height = (data[d+4]<<24) | (data[d+5]<<16) | (data[d+6]<<8) | data[d+7];
    let bitDepth = data[d+8];
    let colorType = data[d+9];
    let interlace = data[d+12];

    if (bitDepth !== 16 || interlace !== 0) return null;
    if (colorType !== 0 && colorType !== 4) return null;

    let samplesPerPixel = colorType === 0 ? 1 : 2;
    let bytesPerPixel = samplesPerPixel * 2;

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

    let totalIDATLen = idatChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    let idatCombined = new Uint8Array(totalIDATLen);
    let idatOffset = 0;
    for (let chunk of idatChunks) {
      idatCombined.set(chunk, idatOffset);
      idatOffset += chunk.length;
    }

    let decompressed;
    try {
      let ds = new DecompressionStream('deflate');
      let writer = ds.writable.getWriter();
      writer.write(idatCombined);
      writer.close();
      let reader = ds.readable.getReader();
      let chunks = [];
      while (true) {
        let { done, value } = await reader.read();
        if (value) chunks.push(value);
        if (done) break;
      }
      let totalDecompLen = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      decompressed = new Uint8Array(totalDecompLen);
      let decompOffset = 0;
      for (let chunk of chunks) {
        decompressed.set(chunk, decompOffset);
        decompOffset += chunk.length;
      }
    } catch (e) {
      return null;
    }

    let scanlineLen = 1 + width * bytesPerPixel;
    let recon = new Uint8Array(height * width * bytesPerPixel);

    function paethPredictor(a, b, c) {
      let p = a + b - c;
      let pa = Math.abs(p - a);
      let pb = Math.abs(p - b);
      let pc = Math.abs(p - c);
      if (pa <= pb && pa <= pc) return a;
      else if (pb <= pc) return b;
      else return c;
    }

    for (let y = 0; y < height; y++) {
      let scanlineOffset = y * scanlineLen;
      let filterType = decompressed[scanlineOffset];
      let rowOffset = y * width * bytesPerPixel;

      for (let i = 0; i < width * bytesPerPixel; i++) {
        let x = decompressed[scanlineOffset + 1 + i];
        let a = i >= bytesPerPixel ? recon[rowOffset + i - bytesPerPixel] : 0;
        let b = y > 0 ? recon[rowOffset - width * bytesPerPixel + i] : 0;
        let c = (y > 0 && i >= bytesPerPixel) ? recon[rowOffset - width * bytesPerPixel + i - bytesPerPixel] : 0;

        let val;
        if (filterType === 0) val = x;
        else if (filterType === 1) val = (x + a) & 0xFF;
        else if (filterType === 2) val = (x + b) & 0xFF;
        else if (filterType === 3) val = (x + Math.floor((a + b) / 2)) & 0xFF;
        else if (filterType === 4) val = (x + paethPredictor(a, b, c)) & 0xFF;
        else return null;

        recon[rowOffset + i] = val;
      }
    }

    let grayData = new Float64Array(width * height);
    let minV = Infinity, maxV = -Infinity;
    for (let i = 0; i < width * height; i++) {
      let offset = i * bytesPerPixel;
      let val = (recon[offset] << 8) | recon[offset + 1];
      grayData[i] = val;
      if (val < minV) minV = val;
      if (val > maxV) maxV = val;
    }

    return { width, height, data: grayData, minVal: minV, maxVal: maxV };
  }

  // -------------------------------------------------------------
  // Drawing Canvas & Interactive ROIs
  // -------------------------------------------------------------
  function renderMainCanvas() {
    if (!mainCtx || loadedImages.length === 0) return;
    let imgObj = loadedImages[currentImageIdx];

    mainCanvas.width = imgObj.width;
    mainCanvas.height = imgObj.height;

    let cMinPct = parseFloat(contrastMinSlider.value) / 100;
    let cMaxPct = parseFloat(contrastMaxSlider.value) / 100;
    let minV = imgObj.minVal + cMinPct * (imgObj.maxVal - imgObj.minVal);
    let maxV = imgObj.minVal + cMaxPct * (imgObj.maxVal - imgObj.minVal);
    if (maxV <= minV) maxV = minV + 1e-5;

    let cmap = colormapSelect.value;
    let imgData = mainCtx.createImageData(imgObj.width, imgObj.height);
    let pixels = imgData.data;

    for (let i = 0; i < imgObj.data.length; i++) {
      let v = imgObj.data[i];
      let norm = (v - minV) / (maxV - minV);
      let [r, g, b] = getColor(norm, cmap);
      pixels[i * 4] = r;
      pixels[i * 4 + 1] = g;
      pixels[i * 4 + 2] = b;
      pixels[i * 4 + 3] = 255;
    }
    mainCtx.putImageData(imgData, 0, 0);

    let rect = mainCanvas.getBoundingClientRect();
    let displayScale = rect.width > 0 ? (mainCanvas.width / rect.width) : 1;

    // 1. Draw Signal ROI (Vibrant Yellow #facc15, solid, 4px screen thickness)
    mainCtx.lineWidth = 2 * displayScale;
    mainCtx.strokeStyle = "#facc15";
    mainCtx.setLineDash([]);
    mainCtx.strokeRect(signalRoi.x, signalRoi.y, signalRoi.w, signalRoi.h);
    drawSquareHandles(signalRoi, "#facc15", displayScale);

    // 2. Draw Background ROI (Pink #db2777, solid, 4px screen thickness)
    mainCtx.lineWidth = 2 * displayScale;
    mainCtx.strokeStyle = "#db2777";
    mainCtx.strokeRect(bgRoi.x, bgRoi.y, bgRoi.w, bgRoi.h);
    drawSquareHandles(bgRoi, "#db2777", displayScale);
  }

  function drawSquareHandles(roiBox, color, displayScale) {
    const handleSize = 8 * displayScale;
    mainCtx.fillStyle = color;
    mainCtx.strokeStyle = "#000000";
    mainCtx.lineWidth = 1.5 * displayScale;
    let handles = [
      { x: roiBox.x, y: roiBox.y },
      { x: roiBox.x + roiBox.w, y: roiBox.y },
      { x: roiBox.x, y: roiBox.y + roiBox.h },
      { x: roiBox.x + roiBox.w, y: roiBox.y + roiBox.h }
    ];
    for (let h of handles) {
      mainCtx.fillRect(h.x - handleSize/2, h.y - handleSize/2, handleSize, handleSize);
      mainCtx.strokeRect(h.x - handleSize/2, h.y - handleSize/2, handleSize, handleSize);
    }
  }

  // Colormap generator
  function getColor(v, cmap) {
    v = Math.max(0, Math.min(1, v));
    if (cmap === "grayscale") {
      let g = Math.floor(v * 255);
      return [g, g, g];
    } else if (cmap === "viridis") {
      // Compact viridis approximation
      let r = Math.floor((0.267 - 0.5 * v + 1.2 * v * v) * 255);
      let g = Math.floor((0.004 + 1.4 * v - 0.4 * v * v) * 255);
      let b = Math.floor((0.329 + 0.5 * v + 0.1 * v * v) * 255);
      return [r, g, b];
    } else if (cmap === "plasma") {
      let r = Math.floor((0.05 + 1.6 * v - 0.7 * v * v) * 255);
      let g = Math.floor((0.03 + 0.5 * v + 0.4 * v * v) * 255);
      let b = Math.floor((0.53 - 0.8 * v + 1.3 * v * v) * 255);
      return [r, g, b];
    } else if (cmap === "jet") {
      // standard jet
      let r = Math.floor(Math.max(0, Math.min(1, 1.5 - Math.abs(v * 4 - 3))) * 255);
      let g = Math.floor(Math.max(0, Math.min(1, 1.5 - Math.abs(v * 4 - 2))) * 255);
      let b = Math.floor(Math.max(0, Math.min(1, 1.5 - Math.abs(v * 4 - 1))) * 255);
      return [r, g, b];
    } else {
      // rainbow approximation
      let r = Math.floor(Math.max(0, Math.min(255, 255 * (1 - Math.abs(v * 2 - 1.5)))));
      let g = Math.floor(Math.max(0, Math.min(255, 255 * (1 - Math.abs(v * 2 - 1.0)))));
      let b = Math.floor(Math.max(0, Math.min(255, 255 * (1 - Math.abs(v * 2 - 0.5)))));
      return [r, g, b];
    }
  }

  // -------------------------------------------------------------
  // Canvas Mouse Interactions for Dual ROIs
  // -------------------------------------------------------------
  function setupCanvasInteraction() {
    if (!mainCanvas) return;

    function getMousePos(e) {
      let rect = mainCanvas.getBoundingClientRect();
      let scaleX = mainCanvas.width / rect.width;
      let scaleY = mainCanvas.height / rect.height;
      return {
        x: Math.round((e.clientX - rect.left) * scaleX),
        y: Math.round((e.clientY - rect.top) * scaleY)
      };
    }

    mainCanvas.addEventListener("mousedown", function (e) {
      if (loadedImages.length === 0) return;
      let pos = getMousePos(e);
      let rect = mainCanvas.getBoundingClientRect();
      let scale = mainCanvas.width / rect.width;
      let tolerance = 8 * scale;

      // 1. Check Signal ROI (Yellow) handles first
      let sigHandles = [
        { name: 'tl', x: signalRoi.x, y: signalRoi.y },
        { name: 'tr', x: signalRoi.x + signalRoi.w, y: signalRoi.y },
        { name: 'bl', x: signalRoi.x, y: signalRoi.y + signalRoi.h },
        { name: 'br', x: signalRoi.x + signalRoi.w, y: signalRoi.y + signalRoi.h }
      ];
      for (let h of sigHandles) {
        if (Math.hypot(pos.x - h.x, pos.y - h.y) < tolerance) {
          isDraggingRoi = true;
          activeRoi = signalRoi;
          activeHandle = h.name;
          return;
        }
      }

      // 2. Check Background ROI (Pink) handles next
      let bgHandles = [
        { name: 'tl', x: bgRoi.x, y: bgRoi.y },
        { name: 'tr', x: bgRoi.x + bgRoi.w, y: bgRoi.y },
        { name: 'bl', x: bgRoi.x, y: bgRoi.y + bgRoi.h },
        { name: 'br', x: bgRoi.x + bgRoi.w, y: bgRoi.y + bgRoi.h }
      ];
      for (let h of bgHandles) {
        if (Math.hypot(pos.x - h.x, pos.y - h.y) < tolerance) {
          isDraggingRoi = true;
          activeRoi = bgRoi;
          activeHandle = h.name;
          return;
        }
      }

      // 3. Check inside Signal ROI bounds
      if (pos.x >= signalRoi.x && pos.x <= signalRoi.x + signalRoi.w &&
          pos.y >= signalRoi.y && pos.y <= signalRoi.y + signalRoi.h) {
        isDraggingRoi = true;
        activeRoi = signalRoi;
        activeHandle = 'body';
        activeRoi.dragStartX = pos.x - activeRoi.x;
        activeRoi.dragStartY = pos.y - activeRoi.y;
        return;
      }

      // 4. Check inside Background ROI bounds
      if (pos.x >= bgRoi.x && pos.x <= bgRoi.x + bgRoi.w &&
          pos.y >= bgRoi.y && pos.y <= bgRoi.y + bgRoi.h) {
        isDraggingRoi = true;
        activeRoi = bgRoi;
        activeHandle = 'body';
        activeRoi.dragStartX = pos.x - activeRoi.x;
        activeRoi.dragStartY = pos.y - activeRoi.y;
        return;
      }
    });

    mainCanvas.addEventListener("mousemove", function (e) {
      if (!isDraggingRoi || loadedImages.length === 0 || !activeRoi) return;
      let pos = getMousePos(e);
      let imgObj = loadedImages[currentImageIdx];
      if (resultsContainer) resultsContainer.style.display = "none";

      let minSize = 5;

      if (activeHandle === 'body') {
        let newX = pos.x - activeRoi.dragStartX;
        let newY = pos.y - activeRoi.dragStartY;
        activeRoi.x = Math.max(0, Math.min(imgObj.width - activeRoi.w, newX));
        activeRoi.y = Math.max(0, Math.min(imgObj.height - activeRoi.h, newY));
      } else {
        // Resize logic
        let x1 = activeRoi.x;
        let y1 = activeRoi.y;
        let x2 = activeRoi.x + activeRoi.w;
        let y2 = activeRoi.y + activeRoi.h;

        if (activeHandle === 'tl') {
          x1 = Math.max(0, Math.min(x2 - minSize, pos.x));
          y1 = Math.max(0, Math.min(y2 - minSize, pos.y));
        } else if (activeHandle === 'tr') {
          x2 = Math.max(x1 + minSize, Math.min(imgObj.width, pos.x));
          y1 = Math.max(0, Math.min(y2 - minSize, pos.y));
        } else if (activeHandle === 'bl') {
          x1 = Math.max(0, Math.min(x2 - minSize, pos.x));
          y2 = Math.max(y1 + minSize, Math.min(imgObj.height, pos.y));
        } else if (activeHandle === 'br') {
          x2 = Math.max(x1 + minSize, Math.min(imgObj.width, pos.x));
          y2 = Math.max(y1 + minSize, Math.min(imgObj.height, pos.y));
        }

        activeRoi.x = x1;
        activeRoi.y = y1;
        activeRoi.w = x2 - x1;
        activeRoi.h = y2 - y1;
      }
      renderMainCanvas();
    });

    window.addEventListener("mouseup", function () {
      isDraggingRoi = false;
      activeHandle = null;
    });
  }

  // -------------------------------------------------------------
  // Nelder-Mead Simplex Fitting Engine for 2D Rotated Gaussian
  // -------------------------------------------------------------
  function runCalculations() {
    showError("");
    if (loadedImages.length === 0) {
      showError("Please upload image files first.");
      return;
    }

    let calibX = parseFloat(calibXInput.value);
    let calibY = calibSameCheckbox.checked ? calibX : parseFloat(calibYInput.value);
    let distSourceScreen_mm = parseFloat(distSourceScreenInput.value);

    if (isNaN(calibX) || calibX <= 0 || isNaN(calibY) || calibY <= 0 || isNaN(distSourceScreen_mm) || distSourceScreen_mm <= 0) {
      showError("Please enter valid positive values for spatial calibration and source-screen distance.");
      return;
    }

    let isChargeEnabled = enableChargeCheckbox.checked;
    let screenYield = isChargeEnabled ? parseFloat(screenYieldInput.value) : 0;
    let distCamScreen_mm = isChargeEnabled ? parseFloat(distCamScreenInput.value) : 0;
    let cameraCalib = isChargeEnabled ? parseFloat(cameraCalibInput.value) : 0;
    let lensFocal = isChargeEnabled ? parseFloat(lensFocalInput.value) : 0;
    let lensFnumber = isChargeEnabled ? parseFloat(lensFnumberInput.value) : 0;
    let transmissionLoss = isChargeEnabled ? parseFloat(transmissionLossInput.value) : 0;

    if (isChargeEnabled && (isNaN(screenYield) || screenYield <= 0 || isNaN(distCamScreen_mm) || distCamScreen_mm <= 0 || isNaN(cameraCalib) || cameraCalib <= 0 || isNaN(lensFocal) || lensFocal <= 0 || isNaN(lensFnumber) || lensFnumber <= 0 || isNaN(transmissionLoss) || transmissionLoss <= 0)) {
      showError("Please enter valid positive values for all charge parameters.");
      return;
    }

    // Process background subtraction and fitting for each image
    for (let imgObj of loadedImages) {
      imgObj.fitResult = fit2DGaussianEbeam(imgObj, signalRoi, bgRoi, calibX, calibY, distSourceScreen_mm, isChargeEnabled, screenYield, distCamScreen_mm, cameraCalib, lensFocal, lensFnumber, transmissionLoss);
    }

    // Show Results Section
    resultsContainer.style.display = "block";

    if (loadedImages.length > 0) {
      currentPostIdx = 0;
      postImageSlider.value = 0;
      postImageSliderLabel.innerText = "1 / " + loadedImages.length;
    }

    // Update Summary Tables & Post-Processed Canvas
    updateSummaryTables(isChargeEnabled);
    renderPostRoiCanvas();
  }

  function fit2DGaussianEbeam(imgObj, sigBox, backgroundBox, calibX, calibY, distSourceScreen_mm, isChargeEnabled, screenYield, distCamScreen_mm, cameraCalib, lensFocal, lensFnumber, transmissionLoss) {
    let imgW = imgObj.width;
    let imgH = imgObj.height;
    let data = imgObj.data;

    // 1. Calculate background mean from pink ROI
    let bg_rx = Math.floor(Math.max(0, Math.min(imgW - 1, backgroundBox.x)));
    let bg_ry = Math.floor(Math.max(0, Math.min(imgH - 1, backgroundBox.y)));
    let bg_rw = Math.floor(Math.max(5, Math.min(imgW - bg_rx, backgroundBox.w)));
    let bg_rh = Math.floor(Math.max(5, Math.min(imgH - bg_ry, backgroundBox.h)));

    let bgSum = 0;
    for (let y = 0; y < bg_rh; y++) {
      for (let x = 0; x < bg_rw; x++) {
        bgSum += data[(bg_ry + y) * imgW + (bg_rx + x)];
      }
    }
    let meanBkg = bgSum / (bg_rw * bg_rh);

    // 2. Perform background subtraction on Signal ROI data (clip negative to 0)
    let rx = Math.floor(Math.max(0, Math.min(imgW - 1, sigBox.x)));
    let ry = Math.floor(Math.max(0, Math.min(imgH - 1, sigBox.y)));
    let rw = Math.floor(Math.max(5, Math.min(imgW - rx, sigBox.w)));
    let rh = Math.floor(Math.max(5, Math.min(imgH - ry, sigBox.h)));

    let roiData = new Float64Array(rw * rh);
    let minVal = Infinity, maxVal = -Infinity;
    let maxPx = 0, maxPy = 0;
    let sumCountsSubtracted = 0;

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        let v = data[(ry + y) * imgW + (rx + x)];
        let valSub = Math.max(0, v - meanBkg);
        roiData[y * rw + x] = valSub;
        sumCountsSubtracted += valSub;

        if (valSub < minVal) minVal = valSub;
        if (valSub > maxVal) {
          maxVal = valSub;
          maxPx = x;
          maxPy = y;
        }
      }
    }

    if (maxVal <= minVal) {
      return { success: false };
    }

    // Initial guesses for Nelder-Mead simplex
    let amp0 = maxVal - minVal;
    let xo0 = maxPx;
    let yo0 = maxPy;
    let offset0 = minVal;
    // Estimate initial sigma dynamically (limits starting guess to reasonable 0.5-15 px range)
    let sigX0 = Math.max(0.5, Math.min(15, rw / 4));
    let sigY0 = Math.max(0.5, Math.min(15, rh / 4));
    let theta0 = 0;

    let p = [amp0, xo0, yo0, sigX0, sigY0, theta0, offset0];
    let bestP = simplexOptimize(p, roiData, rw, rh);

    let [amp, xo, yo, sigX, sigY, theta, offset] = bestP;
    sigX = Math.abs(sigX);
    sigY = Math.abs(sigY);

    // Validate fit bounds (allowing small standard deviations down to 0.05 px)
    if (amp <= 0 || sigX < 0.05 || sigY < 0.05 || xo < -rw || xo > 2 * rw || yo < -rh || yo > 2 * rh) {
      return { success: false };
    }

    // Convert pixel standard deviations to standard deviations on screen in μm
    let sigX_um = sigX * calibX;
    let sigY_um = sigY * calibY;
    let rmsMaj_um = Math.max(sigX_um, sigY_um);
    let rmsMin_um = Math.min(sigX_um, sigY_um);

    let fwhmMaj_um = 2 * Math.sqrt(2 * Math.LN2) * rmsMaj_um;
    let fwhmMin_um = 2 * Math.sqrt(2 * Math.LN2) * rmsMin_um;

    // Convert spatial sizes on screen to divergences in mrad:
    // theta = arctan(size_um / (dist_source_screen_mm * 1000)) * 1000
    let divRmsMajor_mrad = Math.atan(rmsMaj_um / (distSourceScreen_mm * 1000)) * 1000;
    let divRmsMinor_mrad = Math.atan(rmsMin_um / (distSourceScreen_mm * 1000)) * 1000;

    let divFwhmMajor_mrad = Math.atan(fwhmMaj_um / (distSourceScreen_mm * 1000)) * 1000;
    let divFwhmMinor_mrad = Math.atan(fwhmMin_um / (distSourceScreen_mm * 1000)) * 1000;

    // Pointing instability deviation relative to Signal ROI center
    // Centroid relative coordinates: (x0 - rw/2, yo - rh/2)
    // Convert to actual image coordinates: rx + xo, ry + yo
    // Signal ROI center in image: rx + rw/2, ry + rh/2
    let actualXo = rx + xo;
    let actualYo = ry + yo;
    let signalCenterImgX = rx + rw / 2;
    let signalCenterImgY = ry + rh / 2;

    let devX_um = (actualXo - signalCenterImgX) * calibX;
    let devY_um = (actualYo - signalCenterImgY) * calibY;

    // Absolute charge calculations
    let beamCharge = 0;
    if (isChargeEnabled) {
      // solid_angle = (pi * (focal/fnumber)^2 / 4) / dist_cam_screen^2
      let lensDiam = lensFocal / lensFnumber;
      let lensArea = Math.PI * Math.pow(lensDiam / 2, 2);
      let solidAngle = lensArea / Math.pow(distCamScreen_mm, 2); // mm^2 cancel out

      // charge_calib = camera_calib / (screen_yield * solid_angle * transmission)
      let chargeCalib = cameraCalib / (screenYield * solidAngle * transmissionLoss); // pC / counts

      // Total charge bunch = sum(counts) * chargeCalib
      beamCharge = sumCountsSubtracted * chargeCalib;
    }

    // energy fraction (q-factor): FWHM contour integral / total ROI sum
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

    return {
      success: true,
      amplitude: amp,
      xo: actualXo,
      yo: actualYo,
      localXo: xo,
      localYo: yo,
      sigmaX: sigX,
      sigmaY: sigY,
      theta: theta,
      offset: offset,
      rmsMaj_um: rmsMaj_um,
      rmsMin_um: rmsMin_um,
      fwhmMaj_um: fwhmMaj_um,
      fwhmMin_um: fwhmMin_um,
      divRmsMaj: divRmsMajor_mrad,
      divRmsMin: divRmsMinor_mrad,
      divFwhmMaj: divFwhmMajor_mrad,
      divFwhmMin: divFwhmMinor_mrad,
      devX_um: devX_um,
      devY_um: devY_um,
      meanBkg: meanBkg,
      beamCharge: beamCharge,
      qFactor: qFactor
    };
  }

  function simplexOptimize(initialP, roiData, rw, rh) {
    let N = initialP.length;
    let simplex = new Array(N + 1);
    simplex[0] = initialP.slice();

    let sigX0 = initialP[3];
    let sigY0 = initialP[4];
    let step = [initialP[0] * 0.2, Math.max(0.5, rw * 0.1), Math.max(0.5, rh * 0.1), Math.max(0.2, sigX0 * 0.2), Math.max(0.2, sigY0 * 0.2), 0.2, initialP[6] * 0.2];
    for (let i = 0; i < N; i++) {
      let vertex = initialP.slice();
      vertex[i] += step[i] !== 0 ? step[i] : 1.0;
      simplex[i + 1] = vertex;
    }

    function cost(pVec) {
      let [amp, xo, yo, sigX, sigY, theta, offset] = pVec;
      if (sigX <= 0.05 || sigY <= 0.05 || amp <= 0) return 1e18;
      if (xo < -rw || xo > 2 * rw || yo < -rh || yo > 2 * rh) return 1e18;

      let cosT = Math.cos(theta);
      let sinT = Math.sin(theta);
      let a = (cosT * cosT) / (2 * sigX * sigX) + (sinT * sinT) / (2 * sigY * sigY);
      let b = -Math.sin(2 * theta) / (4 * sigX * sigX) + Math.sin(2 * theta) / (4 * sigY * sigY);
      let c = (sinT * sinT) / (2 * sigX * sigX) + (cosT * cosT) / (2 * sigY * sigY);

      let error = 0;
      for (let y = 0; y < rh; y++) {
        for (let x = 0; x < rw; x++) {
          let dx = x - xo;
          let dy = y - yo;
          let model = offset + amp * Math.exp(-(a * dx * dx + 2 * b * dx * dy + c * dy * dy));
          let diff = roiData[y * rw + x] - model;
          error += diff * diff;
        }
      }
      return error;
    }

    let costs = simplex.map(cost);

    for (let iter = 0; iter < 400; iter++) {
      let indices = Array.from({ length: N + 1 }, (_, i) => i).sort((a, b) => costs[a] - costs[b]);
      simplex = indices.map(i => simplex[i]);
      costs = indices.map(i => costs[i]);

      let centroid = new Array(N).fill(0);
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          centroid[j] += simplex[i][j];
        }
      }
      centroid = centroid.map(v => v / N);

      let worst = simplex[N];
      let reflected = centroid.map((c_j, j) => 2 * c_j - worst[j]);
      let reflectedCost = cost(reflected);

      if (reflectedCost < costs[0]) {
        let expanded = centroid.map((c_j, j) => 3 * c_j - 2 * worst[j]);
        let expandedCost = cost(expanded);
        if (expandedCost < reflectedCost) {
          simplex[N] = expanded;
          costs[N] = expandedCost;
        } else {
          simplex[N] = reflected;
          costs[N] = reflectedCost;
        }
      } else if (reflectedCost < costs[N - 1]) {
        simplex[N] = reflected;
        costs[N] = reflectedCost;
      } else {
        let contracted = centroid.map((c_j, j) => 0.5 * c_j + 0.5 * worst[j]);
        let contractedCost = cost(contracted);
        if (contractedCost < costs[N]) {
          simplex[N] = contracted;
          costs[N] = contractedCost;
        } else {
          for (let i = 1; i <= N; i++) {
            simplex[i] = simplex[0].map((s0_j, j) => 0.5 * s0_j + 0.5 * simplex[i][j]);
            costs[i] = cost(simplex[i]);
          }
        }
      }
    }

    let finalBestIdx = Array.from({ length: N + 1 }, (_, i) => i).sort((a, b) => costs[a] - costs[b])[0];
    return simplex[finalBestIdx];
  }

  // -------------------------------------------------------------
  // Summary Tables Output
  // -------------------------------------------------------------
  function updateSummaryTables(isChargeEnabled) {
    function calcStats(arr) {
      let mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      let std = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length);
      return { mean, std };
    }

    let divRmsMajArr = [], divRmsMinArr = [];
    let divFwhmMajArr = [], divFwhmMinArr = [];
    let devXArr = [], devYArr = [], devRArr = [];
    let chargeArr = [];

    for (let img of loadedImages) {
      if (!img.fitResult || !img.fitResult.success) continue;
      divRmsMajArr.push(img.fitResult.divRmsMaj);
      divRmsMinArr.push(img.fitResult.divRmsMin);
      divFwhmMajArr.push(img.fitResult.divFwhmMaj);
      divFwhmMinArr.push(img.fitResult.divFwhmMin);

      devXArr.push(img.fitResult.devX_um);
      devYArr.push(img.fitResult.devY_um);
      devRArr.push(Math.hypot(img.fitResult.devX_um, img.fitResult.devY_um));

      if (isChargeEnabled && img.fitResult.beamCharge !== undefined) {
        chargeArr.push(img.fitResult.beamCharge);
      }
    }

    if (divRmsMajArr.length === 0) {
      summaryTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#ef4444;">Fit could not be converged on any image.</td></tr>`;
      return;
    }

    let divRmsMajStats = calcStats(divRmsMajArr);
    let divRmsMinStats = calcStats(divRmsMinArr);
    let divFwhmMajStats = calcStats(divFwhmMajArr);
    let divFwhmMinStats = calcStats(divFwhmMinArr);

    summaryTableBody.innerHTML = `
      <tr>
        <td><strong>RMS Major Axis Divergence</strong></td>
        <td class="font-highlight">${divRmsMajStats.mean.toFixed(2)} mrad</td>
        <td>${divRmsMajStats.std.toFixed(2)} mrad</td>
      </tr>
      <tr>
        <td><strong>RMS Minor Axis Divergence</strong></td>
        <td class="font-highlight">${divRmsMinStats.mean.toFixed(2)} mrad</td>
        <td>${divRmsMinStats.std.toFixed(2)} mrad</td>
      </tr>
      <tr>
        <td><strong>FWHM Major Axis Divergence</strong></td>
        <td class="font-highlight">${divFwhmMajStats.mean.toFixed(2)} mrad</td>
        <td>${divFwhmMajStats.std.toFixed(2)} mrad</td>
      </tr>
      <tr>
        <td><strong>FWHM Minor Axis Divergence</strong></td>
        <td class="font-highlight">${divFwhmMinStats.mean.toFixed(2)} mrad</td>
        <td>${divFwhmMinStats.std.toFixed(2)} mrad</td>
      </tr>
    `;

    // Pointing Stability: Calculate true standard deviation (Jitter) across images
    let pointingRmsX = calcStats(devXArr).std;
    let pointingRmsY = calcStats(devYArr).std;
    // Radial jitter (2D RMS)
    let pointingRmsR = Math.sqrt(pointingRmsX * pointingRmsX + pointingRmsY * pointingRmsY);

    let distSourceScreen_mm = parseFloat(distSourceScreenInput.value);
    let pointingRmsX_mrad = Math.atan(pointingRmsX / (distSourceScreen_mm * 1000)) * 1000;
    let pointingRmsY_mrad = Math.atan(pointingRmsY / (distSourceScreen_mm * 1000)) * 1000;
    let pointingRmsR_mrad = Math.atan(pointingRmsR / (distSourceScreen_mm * 1000)) * 1000;

    pointingStabilityBody.innerHTML = `
      <tr>
        <td><strong>X-axis Stability</strong></td>
        <td class="font-highlight">${(pointingRmsX / 1000).toFixed(2)} mm</td>
        <td class="font-highlight">${pointingRmsX_mrad.toFixed(2)} mrad</td>
      </tr>
      <tr>
        <td><strong>Y-axis Stability</strong></td>
        <td class="font-highlight">${(pointingRmsY / 1000).toFixed(2)} mm</td>
        <td class="font-highlight">${pointingRmsY_mrad.toFixed(2)} mrad</td>
      </tr>
      <tr>
        <td><strong>Radial Stability (2D)</strong></td>
        <td class="font-highlight">${(pointingRmsR / 1000).toFixed(2)} mm</td>
        <td class="font-highlight">${pointingRmsR_mrad.toFixed(2)} mrad</td>
      </tr>
    `;

    if (isChargeEnabled && chargeArr.length > 0) {
      let chargeStats = calcStats(chargeArr);
      chargeTableGroup.style.display = 'block';
      chargeSummaryBody.innerHTML = `
        <tr>
          <td><strong>Beam Charge (Mean &pm; Std Dev)</strong></td>
          <td class="font-highlight">${chargeStats.mean.toFixed(2)} &pm; ${chargeStats.std.toFixed(2)} pC</td>
        </tr>
      `;
    } else {
      chargeTableGroup.style.display = 'none';
    }
  }

  // -------------------------------------------------------------
  // Render Post-Processed ROI Display
  // -------------------------------------------------------------
  function renderPostRoiCanvas() {
    if (!roiCanvas || loadedImages.length === 0) return;
    let imgObj = loadedImages[currentPostIdx];
    let fit = imgObj.fitResult;

    // Cropping signal ROI
    let rx = Math.max(0, Math.min(imgObj.width - 1, signalRoi.x));
    let ry = Math.max(0, Math.min(imgObj.height - 1, signalRoi.y));
    let rw = Math.max(5, Math.min(imgObj.width - rx, signalRoi.w));
    let rh = Math.max(5, Math.min(imgObj.height - ry, signalRoi.h));

    roiCanvas.width = rw;
    roiCanvas.height = rh;

    let cMinPct = parseFloat(postContrastMinSlider.value) / 100;
    let cMaxPct = parseFloat(postContrastMaxSlider.value) / 100;

    // Background subtract for post-viewing representation too
    let meanBkg = fit ? fit.meanBkg : 0;

    // Find the max value of background-subtracted data in the Signal ROI
    let maxValSub = 0;
    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        let v = imgObj.data[(ry + y) * imgObj.width + (rx + x)];
        let valSub = Math.max(0, v - meanBkg);
        if (valSub > maxValSub) maxValSub = valSub;
      }
    }

    let minV = cMinPct * maxValSub;
    let maxV = cMaxPct * maxValSub;
    if (maxV <= minV) maxV = minV + 1e-5;

    let cmap = colormapSelect.value;
    let roiImgData = roiCtx.createImageData(rw, rh);
    let pixels = roiImgData.data;

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        let v = imgObj.data[(ry + y) * imgObj.width + (rx + x)];
        let valSub = Math.max(0, v - meanBkg);
        let norm = (valSub - minV) / (maxV - minV);
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

        // Inverse rotation for drawing
        let rotX = localXo + (ex * cosT + ey * sinT);
        let rotY = localYo + (-ex * sinT + ey * cosT);

        if (i === 0) roiCtx.moveTo(rotX, rotY);
        else roiCtx.lineTo(rotX, rotY);
      }

      roiCtx.closePath();
      roiCtx.stroke();
      roiCtx.restore();

      let isChargeEnabled = enableChargeCheckbox.checked;
      let chargeHtml = isChargeEnabled ? `
        <p style="margin:0.25rem 0;"><strong>Beam Charge:</strong> <span class="font-highlight">${fit.beamCharge.toFixed(2)} pC</span></p>
      ` : '';

      roiStatsDiv.innerHTML = `
        <h4 style="margin-top:0; margin-bottom:0.5rem; color:#111827; word-break: break-all;">Image ${currentPostIdx + 1}: ${imgObj.name}</h4>
        <p style="margin:0.25rem 0;"><strong>Divergence RMS Maj:</strong> <span class="font-highlight">${fit.divRmsMaj.toFixed(2)} mrad</span></p>
        <p style="margin:0.25rem 0;"><strong>Divergence RMS Min:</strong> <span class="font-highlight">${fit.divRmsMin.toFixed(2)} mrad</span></p>
        <p style="margin:0.25rem 0;"><strong>Divergence FWHM Maj:</strong> <span class="font-highlight">${fit.divFwhmMaj.toFixed(2)} mrad</span></p>
        <p style="margin:0.25rem 0;"><strong>Divergence FWHM Min:</strong> <span class="font-highlight">${fit.divFwhmMin.toFixed(2)} mrad</span></p>
        <p style="margin:0.25rem 0;"><strong>Mean Background:</strong> ${fit.meanBkg.toFixed(1)} counts</p>
        <p style="margin:0.25rem 0;"><strong>Centroid dev X:</strong> ${fit.devX_um.toFixed(1)} μm</p>
        <p style="margin:0.25rem 0;"><strong>Centroid dev Y:</strong> ${fit.devY_um.toFixed(1)} μm</p>
        ${chargeHtml}
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
        totalAssetsBytes += img.width * img.height * 12; // 8 bytes Float64Array + 4 bytes Canvas pixels
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
