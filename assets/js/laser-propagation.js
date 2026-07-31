/* ==========================================================================
   * NF/FF Calculator Engine
   * ========================================================================== */
/**
 * Handles near-field intensity/phase uploads, interactive ROI selection,
 * Zernike wavefront aberrations, 2D FFT propagation, 3D caustic characterization,
 * 2D Rotated Gaussian fitting, and interactive focus rendering.
 */

document.addEventListener("DOMContentLoaded", function () {
  // Helper to format values to fixed decimals without producing negative zero (-0.00)
  function formatFixed(val, precision = 2) {
    let s = val.toFixed(precision);
    if (parseFloat(s) === 0) {
      return (0).toFixed(precision);
    }
    return s;
  }

  // --- UI Elements ---
  const exampleSelect = document.getElementById("example-select");
  const imageUploadInput = document.getElementById("image-upload");
  const enablePhaseCheckbox = document.getElementById("enable-phase");
  const phaseUploadGroup = document.getElementById("phase-upload-group");
  const phaseUploadInput = document.getElementById("phase-upload");

  const calibSameCheckbox = document.getElementById("calib-same");
  const calibXInput = document.getElementById("calib-x");
  const calibYInput = document.getElementById("calib-y");
  const calibYGroup = document.getElementById("calib-y-group");

  const wavelengthInput = document.getElementById("wavelength");
  const focalLengthInput = document.getElementById("focal-length");
  const inputBeamDiameter = document.getElementById("input-beam-diameter");

  // Zernike sliders and displays
  const zernikeSection = document.getElementById("zernike-section");
  const zernikeSliders = [
    { id: "zernike-z1",  valId: "val-z1",  index: 1  },
    { id: "zernike-z2",  valId: "val-z2",  index: 2  },
    { id: "zernike-z3",  valId: "val-z3",  index: 3  },
    { id: "zernike-z4",  valId: "val-z4",  index: 4  },
    { id: "zernike-z5",  valId: "val-z5",  index: 5  },
    { id: "zernike-z6",  valId: "val-z6",  index: 6  },
    { id: "zernike-z7",  valId: "val-z7",  index: 7  },
    { id: "zernike-z8",  valId: "val-z8",  index: 8  },
    { id: "zernike-z9",  valId: "val-z9",  index: 9  },
    { id: "zernike-z10", valId: "val-z10", index: 10 },
    { id: "zernike-z11", valId: "val-z11", index: 11 },
    { id: "zernike-z12", valId: "val-z12", index: 12 },
    { id: "zernike-z13", valId: "val-z13", index: 13 },
    { id: "zernike-z14", valId: "val-z14", index: 14 },
    { id: "zernike-z15", valId: "val-z15", index: 15 },
    { id: "zernike-z16", valId: "val-z16", index: 16 },
    { id: "zernike-z17", valId: "val-z17", index: 17 },
    { id: "zernike-z18", valId: "val-z18", index: 18 },
    { id: "zernike-z19", valId: "val-z19", index: 19 },
    { id: "zernike-z20", valId: "val-z20", index: 20 },
    { id: "zernike-z21", valId: "val-z21", index: 21 }
  ];

  const mainCanvas = document.getElementById("main-canvas");
  const mainCtx = mainCanvas ? mainCanvas.getContext("2d") : null;
  const imageDimensionsLabel = document.getElementById("image-dimensions-label");
  const colormapSelect = document.getElementById("colormap-select");

  const contrastMinSlider = document.getElementById("contrast-min");
  const contrastMaxSlider = document.getElementById("contrast-max");
  const contrastMinVal = document.getElementById("contrast-min-val");
  const contrastMaxVal = document.getElementById("contrast-max-val");

  const calculateBtn = document.getElementById("calculate-btn");
  const errorMessageDiv = document.getElementById("error-message");

  // Results UI
  const resultsContainer = document.getElementById("results-container");
  const focalCanvas = document.getElementById("focal-canvas");
  const focalCtx = focalCanvas ? focalCanvas.getContext("2d") : null;
  const focalStatsTableWrapper = document.getElementById("focal-stats-table-wrapper");

  const zSlider = document.getElementById("z-slider");
  const zSliderVal = document.getElementById("z-slider-val");
  const zPrev = document.getElementById("z-prev");
  const zNext = document.getElementById("z-next");
  const fitGaussianChk = document.getElementById("fit-gaussian-chk");

  const focalContrastMinSlider = document.getElementById("focal-contrast-min");
  const focalContrastMaxSlider = document.getElementById("focal-contrast-max");

  const resM2 = document.getElementById("res-m2");
  const resWaistRadius = document.getElementById("res-waist-radius");
  const resWaistFwhm = document.getElementById("res-waist-fwhm");
  const resRayleighRange = document.getElementById("res-rayleigh-range");
  const resFocusShift = document.getElementById("res-focus-shift");
  const resTheoryWaist = document.getElementById("res-theory-waist");
  const resRatioM2 = document.getElementById("res-ratio-m2");
  const rowTheoryWaist = document.getElementById("row-theory-waist");
  const rowRatioM2 = document.getElementById("row-ratio-m2");

  const causticChartCanvas = document.getElementById("caustic-chart-canvas");
  const farfieldOnlyChk = document.getElementById("farfield-only-chk");
  const resetZBtn = document.getElementById("reset-z-btn");
  const causticResultsCard = document.getElementById("caustic-results-card");
  const showHigherZernikeChk = document.getElementById("show-higher-zernike");
  const higherOrderZernikeFields = document.getElementById("higher-order-zernike-fields");

  const gpuChk = document.getElementById("gpu-chk");
  let webglPropagator = null;

  // --- WebGL2 GPU Acceleration Engine ---
  class WebGLPropagator {
    constructor() {
      this.canvas = document.createElement("canvas");
      this.gl = this.canvas.getContext("webgl2");
      if (!this.gl) {
        console.warn("WebGL2 context not available. GPU acceleration disabled.");
        this.available = false;
        return;
      }
      
      const extFloat = this.gl.getExtension("EXT_color_buffer_float");
      if (!extFloat) {
        console.warn("WebGL2 float buffer rendering (EXT_color_buffer_float) not supported. Falling back to CPU.");
        this.available = false;
        return;
      }

      this.available = true;
      this.initShaders();
      this.initBuffers();
      
      this.intensityTex = null;
      this.intensityW = 0;
      this.intensityH = 0;
      
      this.phaseTex = null;
      this.phaseW = 0;
      this.phaseH = 0;
      
      this.textureA = null;
      this.textureB = null;
      this.fboA = null;
      this.fboB = null;
      this.Mx = 0;
      this.My = 0;
    }

    createShader(type, source) {
      const gl = this.gl;
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    createProgram(vsSource, fsSource) {
      const gl = this.gl;
      const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
      const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return null;
      
      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link error:", gl.getProgramInfoLog(program));
        return null;
      }
      return program;
    }

    initShaders() {
      const VS_SOURCE = `#version 300 es
      in vec2 position;
      out vec2 v_texCoord;
      void main() {
          v_texCoord = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
      }
      `;

      const INIT_FIELD_FS = `#version 300 es
      precision highp float;

      uniform sampler2D u_intensityTex;
      uniform sampler2D u_phaseTex;
      uniform bool u_useCustomPhase;
      uniform float u_zernike[22];
      uniform float u_wavelength_mm;
      uniform float u_focal_length_mm;
      uniform float u_zf;
      uniform float u_calibX;
      uniform float u_calibY;
      uniform int u_rx;
      uniform int u_ry;
      uniform int u_rw;
      uniform int u_rh;
      uniform int u_Mx;
      uniform int u_My;
      uniform int u_imgW;
      uniform int u_imgH;
      uniform float u_phaseImageMin;
      uniform float u_phaseImageMax;
      uniform int u_prx;
      uniform int u_pry;
      uniform int u_phaseImageW;
      uniform int u_phaseImageH;

      out vec4 outColor;

      float evalZernike(int nollIndex, float rho, float theta) {
          if (rho > 1.0) return 0.0;
          float r2 = rho * rho;
          float r3 = r2 * rho;
          float r4 = r3 * rho;
          float r5 = r4 * rho;

          if (nollIndex == 1)  return 1.0;
          if (nollIndex == 2)  return 2.0 * rho * cos(theta);
          if (nollIndex == 3)  return 2.0 * rho * sin(theta);
          if (nollIndex == 4)  return sqrt(3.0)  * (2.0 * r2 - 1.0);
          if (nollIndex == 5)  return sqrt(6.0)  * r2 * sin(2.0 * theta);
          if (nollIndex == 6)  return sqrt(6.0)  * r2 * cos(2.0 * theta);
          if (nollIndex == 7)  return sqrt(8.0)  * (3.0 * r3 - 2.0 * rho) * sin(theta);
          if (nollIndex == 8)  return sqrt(8.0)  * (3.0 * r3 - 2.0 * rho) * cos(theta);
          if (nollIndex == 9)  return sqrt(8.0)  * r3 * sin(3.0 * theta);
          if (nollIndex == 10) return sqrt(8.0)  * r3 * cos(3.0 * theta);
          if (nollIndex == 11) return sqrt(5.0)  * (6.0 * r4 - 6.0 * r2 + 1.0);
          if (nollIndex == 12) return sqrt(10.0) * (4.0 * r4 - 3.0 * r2) * sin(2.0 * theta);
          if (nollIndex == 13) return sqrt(10.0) * (4.0 * r4 - 3.0 * r2) * cos(2.0 * theta);
          if (nollIndex == 14) return sqrt(10.0) * r4 * sin(4.0 * theta);
          if (nollIndex == 15) return sqrt(10.0) * r4 * cos(4.0 * theta);
          if (nollIndex == 16) return sqrt(12.0) * (10.0 * r5 - 12.0 * r3 + 3.0 * rho) * sin(theta);
          if (nollIndex == 17) return sqrt(12.0) * (10.0 * r5 - 12.0 * r3 + 3.0 * rho) * cos(theta);
          if (nollIndex == 18) return sqrt(12.0) * (5.0 * r5 - 4.0 * r3) * sin(3.0 * theta);
          if (nollIndex == 19) return sqrt(12.0) * (5.0 * r5 - 4.0 * r3) * cos(3.0 * theta);
          if (nollIndex == 20) return sqrt(12.0) * r5 * sin(5.0 * theta);
          if (nollIndex == 21) return sqrt(12.0) * r5 * cos(5.0 * theta);
          return 0.0;
      }

      void main() {
          ivec2 gridCoord = ivec2(gl_FragCoord.xy);
          int gridX = gridCoord.x;
          int gridY = gridCoord.y;
          
          int cx = u_Mx / 2;
          int cy = u_My / 2;
          int startX = cx - u_rw / 2;
          int startY = cy - u_rh / 2;
          
          if (gridX >= startX && gridX < startX + u_rw && gridY >= startY && gridY < startY + u_rh) {
              int x = gridX - startX;
              int y = gridY - startY;
              
              int srcX = u_rx + x;
              int srcY = u_ry + y;
              
              float I_nf = texelFetch(u_intensityTex, ivec2(srcX, u_imgH - 1 - srcY), 0).r;
              float A = sqrt(max(0.0, I_nf));
              
              float px = (float(x) - float(u_rw) / 2.0) * u_calibX;
              float py = (float(y) - float(u_rh) / 2.0) * u_calibY;
              
              float phi = 0.0;
              if (u_useCustomPhase) {
                  int phaseSrcX = u_prx + x;
                  int phaseSrcY = u_pry + y;
                  float pVal = texelFetch(u_phaseTex, ivec2(phaseSrcX, u_phaseImageH - 1 - phaseSrcY), 0).r;
                  float normP = (pVal - u_phaseImageMin) / (u_phaseImageMax - u_phaseImageMin + 1e-15);
                  phi = -3.141592653589793 + 2.0 * 3.141592653589793 * normP;
              } else {
                  float r = sqrt(px * px + py * py);
                  float theta = atan(py, px);
                  float normR = max(float(u_rw) * u_calibX, float(u_rh) * u_calibY) / 2.0;
                  float rho = r / normR;
                  
                  float zernikeSum = 0.0;
                  for (int i = 1; i <= 21; i++) {
                      zernikeSum += u_zernike[i] * evalZernike(i, rho, theta);
                  }
                  phi = 2.0 * 3.141592653589793 * zernikeSum;
              }
              
              if (abs(u_zf) > 1e-8) {
                  float dist_factor = u_zf / (u_focal_length_mm * (u_focal_length_mm + u_zf));
                  float defoc = -(3.141592653589793 / u_wavelength_mm) * (px * px + py * py) * dist_factor;
                  phi += defoc;
              }
              
              float centerSign = ((gridX + gridY) % 2 == 0) ? 1.0 : -1.0;
              outColor = vec4(A * cos(phi) * centerSign, A * sin(phi) * centerSign, 0.0, 1.0);
          } else {
              outColor = vec4(0.0, 0.0, 0.0, 1.0);
          }
      }
      `;

      const BIT_REVERSAL_FS = `#version 300 es
      precision highp float;

      uniform sampler2D u_src;
      uniform int u_bits;

      out vec4 outColor;

      int reverseBits(int x, int bits) {
          int r = 0;
          for (int i = 0; i < bits; i++) {
              r = (r << 1) | (x & 1);
              x >>= 1;
          }
          return r;
      }

      void main() {
          ivec2 texCoord = ivec2(gl_FragCoord.xy);
          int revX = reverseBits(texCoord.x, u_bits);
          int revY = reverseBits(texCoord.y, u_bits);
          outColor = texelFetch(u_src, ivec2(revX, revY), 0);
      }
      `;

      const FFT_PASS_FS = `#version 300 es
      precision highp float;

      uniform sampler2D u_src;
      uniform int u_stage;
      uniform int u_direction; // 0 = horizontal, 1 = vertical

      out vec4 outColor;

      void main() {
          ivec2 texCoord = ivec2(gl_FragCoord.xy);
          int x = (u_direction == 0) ? texCoord.x : texCoord.y;
          int y = (u_direction == 0) ? texCoord.y : texCoord.x;
          
          int L = 1 << (u_stage - 1);
          int blockSize = 1 << u_stage;
          int elementIdx = x % L;
          
          bool isEven = (x % blockSize) < L;
          int partnerX = isEven ? (x + L) : (x - L);
          
          ivec2 partnerCoord = (u_direction == 0) ? ivec2(partnerX, y) : ivec2(y, partnerX);
          
          vec4 val = texelFetch(u_src, texCoord, 0);
          vec4 valPartner = texelFetch(u_src, partnerCoord, 0);
          
          float angle = -3.141592653589793 * float(elementIdx) / float(L);
          float wr = cos(angle);
          float wi = sin(angle);
          
          if (isEven) {
              float re = val.x + (wr * valPartner.x - wi * valPartner.y);
              float im = val.y + (wr * valPartner.y + wi * valPartner.x);
              outColor = vec4(re, im, 0.0, 1.0);
          } else {
              float re = valPartner.x - (wr * val.x - wi * val.y);
              float im = valPartner.y - (wr * val.y + wi * val.x);
              outColor = vec4(re, im, 0.0, 1.0);
          }
      }
      `;

      const INTENSITY_FS = `#version 300 es
      precision highp float;

      uniform sampler2D u_src;
      out vec4 outColor;

      void main() {
          ivec2 texCoord = ivec2(gl_FragCoord.xy);
          vec4 val = texelFetch(u_src, texCoord, 0);
          float intensity = val.x * val.x + val.y * val.y;
          outColor = vec4(intensity, 0.0, 0.0, 1.0);
      }
      `;

      const DISPLAY_FS = `#version 300 es
      precision highp float;

      uniform sampler2D u_src;
      uniform float u_minV;
      uniform float u_maxV;
      uniform int u_colormap;
      // (startX, startY, cropW, cropH) in texels — startY is in WebGL (bottom-up) coords
      uniform vec4 u_crop;
      uniform ivec2 u_texSize; // size of u_src texture in pixels
      // 1 = source data is top-to-bottom (raw image), needs Y flip; 0 = already OpenGL convention
      uniform int u_flipY;

      in vec2 v_texCoord;
      out vec4 outColor;

      vec3 getColor(float valNorm, int colormap) {
          valNorm = clamp(valNorm, 0.0, 1.0);
          if (colormap == 4) { // grayscale
              return vec3(valNorm);
          }
          if (colormap == 0) { // rainbow
              float h = (1.0 - valNorm) * 240.0;
              float s = 1.0;
              float l = 0.5;
              float c = (1.0 - abs(2.0 * l - 1.0)) * s;
              float x = c * (1.0 - abs(mod(h / 60.0, 2.0) - 1.0));
              float m = l - c / 2.0;
              vec3 rgb = vec3(0.0);
              if (h < 60.0)       rgb = vec3(c, x, 0.0);
              else if (h < 120.0) rgb = vec3(x, c, 0.0);
              else if (h < 180.0) rgb = vec3(0.0, c, x);
              else if (h < 240.0) rgb = vec3(0.0, x, c);
              else if (h < 300.0) rgb = vec3(x, 0.0, c);
              else                rgb = vec3(c, 0.0, x);
              return rgb + m;
          }
          if (colormap == 1) { // jet
              float r = clamp(min(4.0 * valNorm - 1.5, -4.0 * valNorm + 4.5), 0.0, 1.0);
              float g = clamp(min(4.0 * valNorm - 0.5, -4.0 * valNorm + 3.5), 0.0, 1.0);
              float b = clamp(min(4.0 * valNorm + 0.5, -4.0 * valNorm + 2.5), 0.0, 1.0);
              return vec3(r, g, b);
          }
          if (colormap == 2) { // viridis
              vec3 c0 = vec3(0.267004, 0.004874, 0.329415);
              vec3 c1 = vec3(0.229739, 0.322361, 0.545714);
              vec3 c2 = vec3(0.127568, 0.566949, 0.550556);
              vec3 c3 = vec3(0.363843, 0.785836, 0.387143);
              vec3 c4 = vec3(0.993248, 0.906157, 0.143936);
              if (valNorm < 0.25)      return mix(c0, c1, valNorm / 0.25);
              else if (valNorm < 0.5)  return mix(c1, c2, (valNorm - 0.25) / 0.25);
              else if (valNorm < 0.75) return mix(c2, c3, (valNorm - 0.5) / 0.25);
              else                     return mix(c3, c4, (valNorm - 0.75) / 0.25);
          }
          if (colormap == 3) { // plasma
              vec3 c0 = vec3(0.050383, 0.029803, 0.527975);
              vec3 c1 = vec3(0.417331, 0.000596, 0.65839);
              vec3 c2 = vec3(0.716387, 0.214982, 0.47529);
              vec3 c3 = vec3(0.956348, 0.509822, 0.214436);
              vec3 c4 = vec3(0.940015, 0.975158, 0.131326);
              if (valNorm < 0.25)      return mix(c0, c1, valNorm / 0.25);
              else if (valNorm < 0.5)  return mix(c1, c2, (valNorm - 0.25) / 0.25);
              else if (valNorm < 0.75) return mix(c2, c3, (valNorm - 0.5) / 0.25);
              else                     return mix(c3, c4, (valNorm - 0.75) / 0.25);
          }
          return vec3(valNorm);
      }

      void main() {
          // v_texCoord.y goes 0=bottom -> 1=top (NDC/OpenGL convention)
          // For raw image data (uploaded top-to-bottom), flip Y so row-0 maps to top of screen
          float ty = (u_flipY == 1) ? (1.0 - v_texCoord.y) : v_texCoord.y;
          float px = u_crop.x + v_texCoord.x * u_crop.z;
          float py = u_crop.y + ty * u_crop.w;

          vec2 texCoordNorm = vec2(px / float(u_texSize.x), py / float(u_texSize.y));
          float val = texture(u_src, texCoordNorm).r;

          float norm = (val - u_minV) / (u_maxV - u_minV + 1e-15);
          vec3 rgb = getColor(norm, u_colormap);
          outColor = vec4(rgb, 1.0);
      }
      `;

      this.initProgram = this.createProgram(VS_SOURCE, INIT_FIELD_FS);
      this.bitRevProgram = this.createProgram(VS_SOURCE, BIT_REVERSAL_FS);
      this.fftProgram = this.createProgram(VS_SOURCE, FFT_PASS_FS);
      this.intensityProgram = this.createProgram(VS_SOURCE, INTENSITY_FS);
      this.displayProgram = this.createProgram(VS_SOURCE, DISPLAY_FS);
    }

    initBuffers() {
      const gl = this.gl;
      this.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
      ]), gl.STATIC_DRAW);
    }

    initTextures(Mx, My) {
      const gl = this.gl;
      
      if (this.textureA) gl.deleteTexture(this.textureA);
      if (this.textureB) gl.deleteTexture(this.textureB);
      if (this.fboA) gl.deleteFramebuffer(this.fboA);
      if (this.fboB) gl.deleteFramebuffer(this.fboB);
      
      this.textureA = this.createFloatTexture(Mx, My);
      this.textureB = this.createFloatTexture(Mx, My);
      
      this.fboA = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureA, 0);
      
      this.fboB = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboB);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureB, 0);
      
      this.Mx = Mx;
      this.My = My;
    }

    createFloatTexture(w, h) {
      const gl = this.gl;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return tex;
    }

    setIntensityTexture(data, w, h) {
      const gl = this.gl;
      if (this.intensityTex) gl.deleteTexture(this.intensityTex);
      this.intensityTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.intensityTex);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, new Float32Array(data));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      this.intensityW = w;
      this.intensityH = h;
    }

    setPhaseTexture(data, w, h) {
      const gl = this.gl;
      if (this.phaseTex) gl.deleteTexture(this.phaseTex);
      this.phaseTex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.phaseTex);
      
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, new Float32Array(data));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      
      this.phaseW = w;
      this.phaseH = h;
    }

    // Run full GPU propagation pipeline. Does NOT readback to CPU.
    // Returns the WebGLTexture containing |E|^2 (intensity) in OpenGL bottom-up convention.
    propagate(Mx, My, params) {
      const gl = this.gl;

      if (this.Mx !== Mx || this.My !== My) {
        this.initTextures(Mx, My);
      }

      gl.viewport(0, 0, Mx, My);

      // --- Pass 1: Init Field ---
      gl.useProgram(this.initProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      const posLoc = gl.getAttribLocation(this.initProgram, "position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.intensityTex);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_intensityTex"), 0);

      if (params.useCustomPhase && this.phaseTex) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.phaseTex);
        gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_phaseTex"), 1);
      }

      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_useCustomPhase"), params.useCustomPhase ? 1 : 0);
      gl.uniform1fv(gl.getUniformLocation(this.initProgram, "u_zernike"), params.zernike);
      gl.uniform1f(gl.getUniformLocation(this.initProgram, "u_wavelength_mm"), params.wavelength_mm);
      gl.uniform1f(gl.getUniformLocation(this.initProgram, "u_focal_length_mm"), params.focal_length_mm);
      gl.uniform1f(gl.getUniformLocation(this.initProgram, "u_zf"), params.zf);
      gl.uniform1f(gl.getUniformLocation(this.initProgram, "u_calibX"), params.calibX);
      gl.uniform1f(gl.getUniformLocation(this.initProgram, "u_calibY"), params.calibY);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_rx"), params.rx);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_ry"), params.ry);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_rw"), params.rw);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_rh"), params.rh);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_Mx"), Mx);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_My"), My);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_imgW"), this.intensityW);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_imgH"), this.intensityH);
      gl.uniform1f(gl.getUniformLocation(this.initProgram, "u_phaseImageMin"), params.phaseImageMin);
      gl.uniform1f(gl.getUniformLocation(this.initProgram, "u_phaseImageMax"), params.phaseImageMax);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_prx"), params.prx);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_pry"), params.pry);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_phaseImageW"), this.phaseW);
      gl.uniform1i(gl.getUniformLocation(this.initProgram, "u_phaseImageH"), this.phaseH);

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fboA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      let currentTex = this.textureA;
      let currentFbo = this.fboA;
      let nextTex = this.textureB;
      let nextFbo = this.fboB;

      const swap = () => {
        let tmpTex = currentTex; currentTex = nextTex; nextTex = tmpTex;
        let tmpFbo = currentFbo; currentFbo = nextFbo; nextFbo = tmpFbo;
      };

      // --- Pass 2: Bit Reversal ---
      gl.useProgram(this.bitRevProgram);
      const posLoc2 = gl.getAttribLocation(this.bitRevProgram, "position");
      gl.enableVertexAttribArray(posLoc2);
      gl.vertexAttribPointer(posLoc2, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, currentTex);
      gl.uniform1i(gl.getUniformLocation(this.bitRevProgram, "u_src"), 0);

      const bits = Math.log2(Mx);
      gl.uniform1i(gl.getUniformLocation(this.bitRevProgram, "u_bits"), bits);

      gl.bindFramebuffer(gl.FRAMEBUFFER, nextFbo);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      swap();

      // --- Pass 3: Cooley-Tukey 1D FFT Passes ---
      gl.useProgram(this.fftProgram);
      const posLoc3 = gl.getAttribLocation(this.fftProgram, "position");
      gl.enableVertexAttribArray(posLoc3);
      gl.vertexAttribPointer(posLoc3, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1i(gl.getUniformLocation(this.fftProgram, "u_src"), 0);
      const stageLoc = gl.getUniformLocation(this.fftProgram, "u_stage");
      const dirLoc = gl.getUniformLocation(this.fftProgram, "u_direction");

      // 1. Horizontal FFT
      gl.uniform1i(dirLoc, 0);
      for (let s = 1; s <= bits; s++) {
        gl.uniform1i(stageLoc, s);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentTex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, nextFbo);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        swap();
      }

      // 2. Vertical FFT
      gl.uniform1i(dirLoc, 1);
      for (let s = 1; s <= bits; s++) {
        gl.uniform1i(stageLoc, s);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, currentTex);
        gl.bindFramebuffer(gl.FRAMEBUFFER, nextFbo);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        swap();
      }

      // --- Pass 4: Intensity Extraction ---
      gl.useProgram(this.intensityProgram);
      const posLoc4 = gl.getAttribLocation(this.intensityProgram, "position");
      gl.enableVertexAttribArray(posLoc4);
      gl.vertexAttribPointer(posLoc4, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, currentTex);
      gl.uniform1i(gl.getUniformLocation(this.intensityProgram, "u_src"), 0);

      gl.bindFramebuffer(gl.FRAMEBUFFER, nextFbo);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      swap();

      // Track the texture that now holds |E|^2 — used by renderToCanvas and readback()
      this.lastResultTex = currentTex;
      this.lastResultFbo = currentFbo;
      this.lastResultMx  = Mx;
      this.lastResultMy  = My;

      // Return the GPU texture (no CPU stall)
      return currentTex;
    }

    // Read the last propagation result back to CPU (one stall per call — use sparingly).
    // Can optionally read a sub-rectangle to save massive amounts of CPU/GPU transfer time.
    readback(Mx, My, rx = 0, ry = 0, rw = Mx, rh = My) {
      const gl = this.gl;
      if (!this.lastResultTex) return null;
      const outputData = new Float32Array(rw * rh * 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.lastResultFbo);
      gl.readPixels(rx, ry, rw, rh, gl.RGBA, gl.FLOAT, outputData);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return outputData;
    }

    // Render source texture to destCanvas with crop/contrast/colormap.
    // srcTex: WebGLTexture | "intensity" (raw input image)
    // flipY: true when the source was uploaded top-to-bottom (raw images); false for GPU-generated textures
    renderToCanvas(destCanvas, srcTex, crop, minV, maxV, colormapIdx, texW, texH, flipY = false) {
      const gl = this.gl;

      this.canvas.width  = destCanvas.width;
      this.canvas.height = destCanvas.height;

      gl.viewport(0, 0, destCanvas.width, destCanvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      gl.useProgram(this.displayProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      const posLoc = gl.getAttribLocation(this.displayProgram, "position");
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      if (srcTex === "intensity") {
        gl.bindTexture(gl.TEXTURE_2D, this.intensityTex);
      } else {
        // srcTex is an actual WebGLTexture object
        gl.bindTexture(gl.TEXTURE_2D, srcTex);
      }
      gl.uniform1i(gl.getUniformLocation(this.displayProgram, "u_src"), 0);

      gl.uniform1f(gl.getUniformLocation(this.displayProgram, "u_minV"), minV);
      gl.uniform1f(gl.getUniformLocation(this.displayProgram, "u_maxV"), maxV);
      gl.uniform1i(gl.getUniformLocation(this.displayProgram, "u_colormap"), colormapIdx);
      gl.uniform4f(gl.getUniformLocation(this.displayProgram, "u_crop"), crop.x, crop.y, crop.z, crop.w);
      gl.uniform2i(gl.getUniformLocation(this.displayProgram, "u_texSize"), texW, texH);
      gl.uniform1i(gl.getUniformLocation(this.displayProgram, "u_flipY"), flipY ? 1 : 0);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      const destCtx = destCanvas.getContext("2d");
      if (destCtx) {
        destCtx.imageSmoothingEnabled = false;
        destCtx.drawImage(this.canvas, 0, 0);
      }
    }
  }

  // --- State Variables ---
  let intensityImage = null; // { name, width, height, data: Float64Array, minVal, maxVal, fileSize }
  let phaseImage = null;     // { name, width, height, data: Float64Array, minVal, maxVal, fileSize }

  // ROI State (in image pixel coordinates)
  let roi = { x: 0, y: 0, w: 200, h: 200 };
  let isDraggingRoi = false;
  let activeHandle = null; // 'tl', 'tr', 'bl', 'br', 'body'
  let dragStartPos = { x: 0, y: 0 };
  let roiStartPos = { x: 0, y: 0, w: 0, h: 0 };

  // Caustic propagation state
  let causticResults = null; // { zPlanes: [], wPlanes: [], z0, w0, M2, zR, fitA, fitB, fitC }
  let currentZOffset = 0.0;  // mm relative to focus
  let focalZoomFactor = 1.0; // Zoom factor for focal spot canvas (0.2 to 5.0)

  // --- Setup Event Listeners ---
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

  if (enablePhaseCheckbox) {
    enablePhaseCheckbox.addEventListener("change", function () {
      if (enablePhaseCheckbox.checked) {
        phaseUploadGroup.style.display = "block";
        zernikeSection.style.display = "none";
      } else {
        phaseUploadGroup.style.display = "none";
        zernikeSection.style.display = "block";
      }
      if (resultsContainer) resultsContainer.style.display = "none";
    });
  }

  if (imageUploadInput) {
    imageUploadInput.addEventListener("change", (e) => handleImageUpload(e, false));
  }
  if (phaseUploadInput) {
    phaseUploadInput.addEventListener("change", (e) => handleImageUpload(e, true));
  }

  if (exampleSelect) {
    exampleSelect.addEventListener("change", async function () {
      const url = exampleSelect.value;
      if (!url) return;
      showError("");
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const buffer = await response.arrayBuffer();
        const filename = url.split("/").pop();
        const imgData = await parsePNG16bitOr8bit(buffer, filename);
        if (imgData) {
          // Free previous intensity image memory explicitly
          if (intensityImage) {
            intensityImage.data = null;
            intensityImage = null;
          }
          intensityImage = imgData;
          if (webglPropagator && webglPropagator.available) {
            webglPropagator.setIntensityTexture(imgData.data, imgData.width, imgData.height);
          }
          if (imageDimensionsLabel) {
            imageDimensionsLabel.innerText = `Loaded: ${filename} (${imgData.width}x${imgData.height})`;
          }
          initDefaultRoi(imgData);
          renderMainCanvas();
          if (resultsContainer) resultsContainer.style.display = "none";
        }
      } catch (err) {
        console.error("Failed to load example:", err);
        showError(`Failed to load example: ${err.message}`);
      }
    });
  }

  // Hook up Zernike textbox updates
  zernikeSliders.forEach(sliderInfo => {
    const el = document.getElementById(sliderInfo.id);
    if (el) {
      el.addEventListener("input", function () {
        const val = parseFloat(el.value);
        
        // Hide results and clear caustic results to force clicking Calculate again
        if (resultsContainer) {
          resultsContainer.style.display = "none";
        }
        causticResults = null;

        // If it is a number outside [-1.0, 1.0], mark as error
        if (!isNaN(val) && (val < -1.0 || val > 1.0)) {
          el.style.borderColor = "#ef4444";
          el.style.backgroundColor = "#fee2e2";
          showError("Zernike coefficients must be values between -1.0 and 1.0.");
        } else {
          el.style.borderColor = "";
          el.style.backgroundColor = "";
          showError("");
        }
      });

      el.addEventListener("change", function () {
        let val = parseFloat(el.value);
        if (isNaN(val)) {
          el.value = "0";
          el.style.borderColor = "";
          el.style.backgroundColor = "";
        } else if (val < -1.0) {
          el.value = "-1";
          el.style.borderColor = "";
          el.style.backgroundColor = "";
        } else if (val > 1.0) {
          el.value = "1";
          el.style.borderColor = "";
          el.style.backgroundColor = "";
        }
        
        if (resultsContainer) {
          resultsContainer.style.display = "none";
        }
        causticResults = null;
      });
    }
  });

  if (colormapSelect) {
    colormapSelect.addEventListener("change", function () {
      renderMainCanvas();
      drawCurrentFocalSpot();
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

  if (focalContrastMinSlider && focalContrastMaxSlider) {
    focalContrastMinSlider.addEventListener("input", function () {
      let minV = parseFloat(focalContrastMinSlider.value);
      let maxV = parseFloat(focalContrastMaxSlider.value);
      if (minV >= maxV) focalContrastMinSlider.value = maxV - 1;
      drawCurrentFocalSpot();
    });
    focalContrastMaxSlider.addEventListener("input", function () {
      let minV = parseFloat(focalContrastMinSlider.value);
      let maxV = parseFloat(focalContrastMaxSlider.value);
      if (maxV <= minV) focalContrastMaxSlider.value = minV + 1;
      drawCurrentFocalSpot();
    });
  }

  if (zSlider) {
    zSlider.addEventListener("input", function () {
      currentZOffset = parseFloat(zSlider.value);
      if (zSliderVal) zSliderVal.innerText = `${formatFixed(currentZOffset)} mm`;
      drawCurrentFocalSpot();
    });
  }

  if (fitGaussianChk) {
    fitGaussianChk.addEventListener("change", function () {
      drawCurrentFocalSpot();
    });
  }

  if (resetZBtn) {
    resetZBtn.addEventListener("click", function () {
      currentZOffset = 0.0;
      if (zSlider) zSlider.value = 0.0;
      if (zSliderVal) zSliderVal.innerText = "0.00 mm";
      if (intensityImage) {
        computeFocalPlaneSpot();
      }
    });
  }

  // Centralized control to enable/disable the z-slider, reset button, and prev/next buttons
  function setZSliderDisabled(disabled) {
    if (zSlider) zSlider.disabled = disabled;
    if (resetZBtn) resetZBtn.disabled = disabled;
    if (zPrev) zPrev.disabled = disabled;
    if (zNext) zNext.disabled = disabled;
  }

  if (zPrev && zSlider) {
    zPrev.addEventListener("click", function () {
      let val = parseFloat(zSlider.value);
      let step = parseFloat(zSlider.step) || 0.1;
      let minVal = parseFloat(zSlider.min) || -10;
      let newVal = Math.max(minVal, val - step);
      zSlider.value = newVal;
      currentZOffset = newVal;
      if (zSliderVal) zSliderVal.innerText = `${formatFixed(currentZOffset)} mm`;
      drawCurrentFocalSpot();
    });
  }

  if (zNext && zSlider) {
    zNext.addEventListener("click", function () {
      let val = parseFloat(zSlider.value);
      let step = parseFloat(zSlider.step) || 0.1;
      let maxVal = parseFloat(zSlider.max) || 10;
      let newVal = Math.min(maxVal, val + step);
      zSlider.value = newVal;
      currentZOffset = newVal;
      if (zSliderVal) zSliderVal.innerText = `${formatFixed(currentZOffset)} mm`;
      drawCurrentFocalSpot();
    });
  }

  // Clear results on parameter change to force recalculation
  const inputsToInvalidate = [wavelengthInput, focalLengthInput, inputBeamDiameter, calibXInput, calibYInput];
  inputsToInvalidate.forEach(el => {
    if (el) {
      el.addEventListener("input", function () {
        if (resultsContainer) resultsContainer.style.display = "none";
        causticResults = null;
      });
    }
  });

  if (farfieldOnlyChk) {
    farfieldOnlyChk.addEventListener("change", function () {
      if (farfieldOnlyChk.checked) {
        setZSliderDisabled(true);
        if (causticResultsCard) causticResultsCard.style.display = "none";
        
        currentZOffset = 0.0;
        if (zSlider) zSlider.value = 0.0;
        if (zSliderVal) zSliderVal.innerText = "0.00 mm";
        if (intensityImage) {
          computeFocalPlaneSpot();
        }
      } else {
        if (causticResults) {
          setZSliderDisabled(false);
          if (causticResultsCard) causticResultsCard.style.display = "block";
          
          let z0 = causticResults.z0;
          let zR = causticResults.zR;
          currentZOffset = z0;
          if (zSlider) {
            zSlider.min = formatFixed(z0 - 3.0 * zR);
            zSlider.max = formatFixed(z0 + 3.0 * zR);
            zSlider.step = formatFixed(zR / 10);
            zSlider.value = formatFixed(z0);
          }
          if (zSliderVal) zSliderVal.innerText = `${formatFixed(z0)} mm`;
          if (intensityImage) {
            computeFocalPlaneSpot();
          }
        } else {
          setZSliderDisabled(true);
          if (causticResultsCard) causticResultsCard.style.display = "none";
        }
      }
    });
  }

  if (gpuChk) {
    gpuChk.addEventListener("change", function () {
      updateMemoryDiagnostics();
      if (intensityImage) {
        computeFocalPlaneSpot();
      }
    });
  }

  if (showHigherZernikeChk && higherOrderZernikeFields) {
    showHigherZernikeChk.addEventListener("change", function () {
      if (showHigherZernikeChk.checked) {
        higherOrderZernikeFields.style.display = "block";
      } else {
        higherOrderZernikeFields.style.display = "none";
      }
    });
  }

  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const zoomResetBtn = document.getElementById("zoom-reset-btn");

  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      focalZoomFactor = Math.min(5.0, focalZoomFactor * 1.25);
      if (intensityImage) {
        drawCurrentFocalSpot();
      }
    });
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      focalZoomFactor = Math.max(0.2, focalZoomFactor / 1.25);
      if (intensityImage) {
        drawCurrentFocalSpot();
      }
    });
  }
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", function () {
      focalZoomFactor = 1.0;
      if (intensityImage) {
        drawCurrentFocalSpot();
      }
    });
  }

  if (focalCanvas) {
    focalCanvas.addEventListener("wheel", function (e) {
      if (e.shiftKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          focalZoomFactor = Math.min(5.0, focalZoomFactor * 1.1);
        } else {
          focalZoomFactor = Math.max(0.2, focalZoomFactor / 1.1);
        }
        if (intensityImage) {
          drawCurrentFocalSpot();
        }
      }
    }, { passive: false });
  }

  if (calculateBtn) {
    calculateBtn.addEventListener("click", () => runCausticCalculations());
  }

  setupCanvasInteraction();

  // --- Image Upload & Decoding ---
  async function handleImageUpload(e, isPhase = false) {
    showError("");
    const file = e.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async function (evt) {
        try {
          const buffer = evt.target.result;
          const imgData = await parsePNG16bitOr8bit(buffer, file.name);
          if (imgData) {
            imgData.fileSize = file.size;
            if (isPhase) {
              // Free previous phase image data explicitly
              if (phaseImage) {
                phaseImage.data = null;
                phaseImage = null;
              }
              phaseImage = imgData;
              if (webglPropagator && webglPropagator.available) {
                webglPropagator.setPhaseTexture(imgData.data, imgData.width, imgData.height);
              }
              showError(`Phase image loaded successfully: ${file.name}`);
            } else {
              // Free previous intensity image data explicitly
              if (intensityImage) {
                intensityImage.data = null;
                intensityImage = null;
              }
              intensityImage = imgData;
              if (webglPropagator && webglPropagator.available) {
                webglPropagator.setIntensityTexture(imgData.data, imgData.width, imgData.height);
              }
              if (imageDimensionsLabel) {
                imageDimensionsLabel.innerText = `Loaded: ${file.name} (${imgData.width}x${imgData.height})`;
              }
              initDefaultRoi(imgData);
              renderMainCanvas();
            }
            if (resultsContainer) resultsContainer.style.display = "none";
          }
        } catch (err) {
          console.error("Decoding error:", err);
          showError(`Failed to decode image: ${err.message}`);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      showError(`FileReader error: ${err.message}`);
    }
  }

  async function parsePNG16bitOr8bit(buffer, filename) {
    const ext = filename.split(".").pop().toLowerCase();
    if (ext === "tif" || ext === "tiff") {
      // TIFF parser using vendor/utif.js
      let ifds = UTIF.decode(buffer);
      UTIF.decodeImages(buffer, ifds);
      let ifd = ifds[0];
      let w = ifd.width;
      let h = ifd.height;
      let bps = ifd[258] ? ifd[258][0] : 8;
      let samples = ifd[258] ? ifd[258].length : 1;
      let raw = ifd.data;

      let grayData = new Float64Array(w * h);
      let minVal = Infinity, maxVal = -Infinity;

      if (bps === 16) {
        let u16 = new Uint16Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 2));
        for (let i = 0; i < w * h; i++) {
          let val = u16[i * samples];
          grayData[i] = val;
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
      } else {
        for (let i = 0; i < w * h; i++) {
          let val = raw[i * samples];
          grayData[i] = val;
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
      }
      return { width: w, height: h, data: grayData, minVal, maxVal };
    }

    if (ext === "png") {
      try {
        let result16 = await parsePNG16bitAsync(buffer);
        if (result16) return result16;
      } catch (err) {
        console.warn("16-bit PNG decoding failed, falling back to 8-bit Canvas:", err);
      }
    }

    // Canvas fallback for standard PNG/JPEG
    return new Promise((resolve, reject) => {
      let blob = new Blob([buffer]);
      let url = URL.createObjectURL(blob);
      let img = new Image();
      img.onload = function () {
        let w = img.width;
        let h = img.height;
        let canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        let imgData = ctx.getImageData(0, 0, w, h);
        let pixels = imgData.data;
        let grayData = new Float64Array(w * h);
        let minVal = Infinity, maxVal = -Infinity;

        for (let i = 0; i < w * h; i++) {
          let r = pixels[i * 4];
          let g = pixels[i * 4 + 1];
          let b = pixels[i * 4 + 2];
          let val = 0.299 * r + 0.587 * g + 0.114 * b;
          grayData[i] = val;
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
        URL.revokeObjectURL(url);
        resolve({ width: w, height: h, data: grayData, minVal, maxVal });
      };
      img.onerror = () => reject(new Error("Failed to render image on Canvas."));
      img.src = url;
    });
  }

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

    let totalLen = idatChunks.reduce((a, c) => a + c.length, 0);
    let compressed = new Uint8Array(totalLen);
    let pos = 0;
    for (let chunk of idatChunks) {
      compressed.set(chunk, pos);
      pos += chunk.length;
    }

    let rawPixels;
    try {
      let deflateData = compressed.subarray(2, compressed.length - 4);
      let blob = new Blob([deflateData]);
      let response = new Response(blob.stream().pipeThrough(new DecompressionStream('deflate-raw')));
      let decompressed = await response.arrayBuffer();
      rawPixels = new Uint8Array(decompressed);
    } catch (e1) {
      let blob = new Blob([compressed]);
      let response = new Response(blob.stream().pipeThrough(new DecompressionStream('deflate')));
      let decompressed = await response.arrayBuffer();
      rawPixels = new Uint8Array(decompressed);
    }

    let rowBytes = 1 + width * bytesPerPixel;
    if (rawPixels.length < height * rowBytes) return null;

    let grayData = new Float64Array(width * height);
    let minVal = Infinity, maxVal = -Infinity;
    let prevRow = new Uint8Array(width * bytesPerPixel);
    let currRow = new Uint8Array(width * bytesPerPixel);

    for (let y = 0; y < height; y++) {
      let rowStart = y * rowBytes;
      let filterType = rawPixels[rowStart];
      let rawRow = rawPixels.subarray(rowStart + 1, rowStart + 1 + width * bytesPerPixel);

      for (let i = 0; i < width * bytesPerPixel; i++) {
        let raw = rawRow[i];
        let a = i >= bytesPerPixel ? currRow[i - bytesPerPixel] : 0;
        let b = prevRow[i];
        let c = i >= bytesPerPixel ? prevRow[i - bytesPerPixel] : 0;

        switch (filterType) {
          case 0: currRow[i] = raw; break;
          case 1: currRow[i] = (raw + a) & 0xFF; break;
          case 2: currRow[i] = (raw + b) & 0xFF; break;
          case 3: currRow[i] = (raw + Math.floor((a + b) / 2)) & 0xFF; break;
          case 4: currRow[i] = (raw + paethPredictor(a, b, c)) & 0xFF; break;
        }
      }

      for (let x = 0; x < width; x++) {
        let byteIdx = x * bytesPerPixel;
        let val = (currRow[byteIdx] << 8) | currRow[byteIdx + 1];
        grayData[y * width + x] = val;
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      }
      prevRow.set(currRow);
    }

    return { width, height, data: grayData, minVal, maxVal };
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

  function initDefaultRoi(imgObj) {
    let w = imgObj.width;
    let h = imgObj.height;
    let data = imgObj.data;

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

    // Find boundaries of the main beam by walking in 4 directions from the peak until intensity drops below 5% of peak
    const threshold = maxV * 0.05;

    function walkLimit(dx, dy) {
      let x = px;
      let y = py;
      let steps = 0;
      let consecutiveBelow = 0;
      while (x >= 0 && x < w && y >= 0 && y < h) {
        let val = data[y * w + x];
        if (val < threshold) {
          consecutiveBelow++;
          if (consecutiveBelow >= 5) {
            return steps - 4;
          }
        } else {
          consecutiveBelow = 0;
        }
        x += dx;
        y += dy;
        steps++;
      }
      return steps;
    }

    let rightSteps = walkLimit(1, 0);
    let leftSteps = walkLimit(-1, 0);
    let downSteps = walkLimit(0, 1);
    let upSteps = walkLimit(0, -1);

    let minX = px - leftSteps;
    let maxX = px + rightSteps;
    let minY = py - upSteps;
    let maxY = py + downSteps;

    let beamW = maxX - minX;
    let beamH = maxY - minY;

    if (beamW > 5 && beamH > 5) {
      // Add generous padding to make the ROI cover the full beam beautifully
      let padX = Math.max(50, Math.floor(beamW * 0.45));
      let padY = Math.max(30, Math.floor(beamH * 0.05));

      let rx = Math.max(0, minX - padX);
      let ry = Math.max(0, minY - padY);
      let rw = Math.min(w - rx, beamW + 2 * padX);
      let rh = Math.min(h - ry, beamH + 2 * padY);
      roi = { x: rx, y: ry, w: rw, h: rh };
    } else {
      // Fallback if walk fails
      let roiW = Math.min(512, Math.floor(w * 0.6));
      let roiH = Math.min(512, Math.floor(h * 0.6));
      let rx = Math.max(0, Math.min(w - roiW, px - Math.floor(roiW / 2)));
      let ry = Math.max(0, Math.min(h - roiH, py - Math.floor(roiH / 2)));
      roi = { x: rx, y: ry, w: roiW, h: roiH };
    }
  }

  // --- Rendering Functions ---
  function renderMainCanvas() {
    if (!mainCanvas || !intensityImage) return;
    let imgObj = intensityImage;
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
    const colormapIndices = {
      "rainbow": 0,
      "jet": 1,
      "viridis": 2,
      "plasma": 3,
      "grayscale": 4
    };
    let cmapIdx = colormapIndices[cmap] !== undefined ? colormapIndices[cmap] : 1;

    const useGPU = gpuChk && gpuChk.checked && webglPropagator && webglPropagator.available;
    if (useGPU) {
      // Full texture crop bounds
      let crop = { x: 0.0, y: 0.0, z: w, w: h };
      webglPropagator.renderToCanvas(mainCanvas, "intensity", crop, minV, maxV, cmapIdx, w, h, true);
    } else {
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
    }

    let rect = mainCanvas.getBoundingClientRect();
    let displayScale = rect.width > 0 ? (mainCanvas.width / rect.width) : 1;

    drawRoiBox(mainCtx, roi, displayScale);
  }

  function drawRoiBox(ctx, roiBox, displayScale = 1) {
    ctx.save();
    ctx.strokeStyle = "#facc15"; 
    ctx.lineWidth = 2 * displayScale;
    ctx.strokeRect(roiBox.x, roiBox.y, roiBox.w, roiBox.h);

    const handleSize = 8 * displayScale;
    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.5 * displayScale;

    let corners = [
      { x: roiBox.x, y: roiBox.y }, 
      { x: roiBox.x + roiBox.w, y: roiBox.y }, 
      { x: roiBox.x, y: roiBox.y + roiBox.h }, 
      { x: roiBox.x + roiBox.w, y: roiBox.y + roiBox.h } 
    ];

    for (let c of corners) {
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    }
    ctx.restore();
  }

  // --- Colormaps ---
  function getColor(valNorm, colormap) {
    valNorm = Math.max(0, Math.min(1, valNorm));

    if (colormap === "grayscale") {
      let v = Math.floor(valNorm * 255);
      return [v, v, v];
    }

    if (colormap === "rainbow") {
      let h = (1 - valNorm) * 240; 
      return hslToRgb(h / 360, 1.0, 0.5);
    }

    if (colormap === "jet") {
      let r = Math.max(0, Math.min(1, Math.min(4 * valNorm - 1.5, -4 * valNorm + 4.5)));
      let g = Math.max(0, Math.min(1, Math.min(4 * valNorm - 0.5, -4 * valNorm + 3.5)));
      let b = Math.max(0, Math.min(1, Math.min(4 * valNorm + 0.5, -4 * valNorm + 2.5)));
      return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
    }

    if (colormap === "viridis") {
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

  // --- Canvas ROI Drag/Resize Interactions ---
  function setupCanvasInteraction() {
    if (!mainCanvas) return;

    function getCanvasCoords(e) {
      let rect = mainCanvas.getBoundingClientRect();
      let scaleX = mainCanvas.width / rect.width;
      let scaleY = mainCanvas.height / rect.height;
      let clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: Math.round((clientX - rect.left) * scaleX),
        y: Math.round((clientY - rect.top) * scaleY)
      };
    }

    function detectHit(pos) {
      const handleSize = 16;
      let r = roi;

      if (Math.hypot(pos.x - r.x, pos.y - r.y) < handleSize) return 'tl';
      if (Math.hypot(pos.x - (r.x + r.w), pos.y - r.y) < handleSize) return 'tr';
      if (Math.hypot(pos.x - r.x, pos.y - (r.y + r.h)) < handleSize) return 'bl';
      if (Math.hypot(pos.x - (r.x + r.w), pos.y - (r.y + r.h)) < handleSize) return 'br';

      if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) return 'body';

      return null;
    }

    function onStart(e) {
      if (!intensityImage) return;
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
      if (!isDraggingRoi || !intensityImage) {
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
      let imgW = intensityImage.width;
      let imgH = intensityImage.height;
      let minSize = 16;

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

  // --- FFT & Physics Engines ---

  // Complex to Complex Cooley-Tukey Radix-2 FFT
  // Input formatted as [re0, im0, re1, im1, ...]
  function fftComplex(data, inverse = false) {
    const N = data.length / 2;
    if (N <= 1) return;

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

  // Separable 2D FFT on Flat Complex Array [re00, im00, re01, im01...] of size Mx * My
  function fft2d(re, im, Mx, My, inverse = false) {
    // 1. Row FFTs
    let rowBuf = new Float64Array(Mx * 2);
    for (let y = 0; y < My; y++) {
      let offset = y * Mx;
      for (let x = 0; x < Mx; x++) {
        rowBuf[2 * x] = re[offset + x];
        rowBuf[2 * x + 1] = im[offset + x];
      }
      fftComplex(rowBuf, inverse);
      for (let x = 0; x < Mx; x++) {
        re[offset + x] = rowBuf[2 * x];
        im[offset + x] = rowBuf[2 * x + 1];
      }
    }

    // 2. Column FFTs
    let colBuf = new Float64Array(My * 2);
    for (let x = 0; x < Mx; x++) {
      for (let y = 0; y < My; y++) {
        let offset = y * Mx + x;
        colBuf[2 * y] = re[offset];
        colBuf[2 * y + 1] = im[offset];
      }
      fftComplex(colBuf, inverse);
      for (let y = 0; y < My; y++) {
        let offset = y * Mx + x;
        re[offset] = colBuf[2 * y];
        im[offset] = colBuf[2 * y + 1];
      }
    }
  }

  // --- FFT Size Helpers ---
  function nextPow2(n) {
    return Math.pow(2, Math.ceil(Math.log2(Math.max(n, 2))));
  }

  // Compute adaptive FFT size: at least 16× the largest ROI dimension, cap 4096.
  function computeFFTSize(roiMaxDim) {
    const maxCap = 4096;
    const scaleFactor = 16;
    let target = Math.max(roiMaxDim * scaleFactor, 1024);
    return Math.min(maxCap, nextPow2(target));
  }

  // --- Progress Bar Helpers ---
  function showProgress(pct, label, detail) {
    const wrap = document.getElementById('calc-progress-wrapper');
    const bar  = document.getElementById('calc-progress-bar');
    const lbl  = document.getElementById('calc-progress-label');
    const det  = document.getElementById('calc-progress-detail');
    if (wrap) wrap.style.display = 'block';
    if (bar)  bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    if (lbl && label)  lbl.innerText = label;
    if (det && detail !== undefined) det.innerText = detail;
  }

  function hideProgress() {
    const wrap = document.getElementById('calc-progress-wrapper');
    if (wrap) wrap.style.display = 'none';
  }

  // Yield to the browser event loop so the progress bar DOM update is painted
  function yieldToDOM() {
    return new Promise(resolve => setTimeout(resolve, 15));
  }

  // Evaluates a Noll Zernike polynomial Z_j(rho, theta)
  function evalZernike(nollIndex, rho, theta) {
    if (rho > 1.0) return 0.0; // clamp / restrict to unit disk
    const r2 = rho * rho;
    const r3 = r2 * rho;
    const r4 = r3 * rho;
    const r5 = r4 * rho;

    switch (nollIndex) {
      case 1:  return 1.0;                                                                         // Piston
      case 2:  return 2.0 * rho * Math.cos(theta);                                               // Tilt X
      case 3:  return 2.0 * rho * Math.sin(theta);                                               // Tilt Y
      case 4:  return Math.sqrt(3)  * (2.0 * r2 - 1.0);                                          // Defocus
      case 5:  return Math.sqrt(6)  * r2 * Math.sin(2.0 * theta);                                // Astigmatism 45°
      case 6:  return Math.sqrt(6)  * r2 * Math.cos(2.0 * theta);                                // Astigmatism 0°
      case 7:  return Math.sqrt(8)  * (3.0 * r3 - 2.0 * rho) * Math.sin(theta);                 // Coma Y
      case 8:  return Math.sqrt(8)  * (3.0 * r3 - 2.0 * rho) * Math.cos(theta);                 // Coma X
      case 9:  return Math.sqrt(8)  * r3 * Math.sin(3.0 * theta);                                // Trefoil Y
      case 10: return Math.sqrt(8)  * r3 * Math.cos(3.0 * theta);                                // Trefoil X
      case 11: return Math.sqrt(5)  * (6.0 * r4 - 6.0 * r2 + 1.0);                              // Primary Spherical
      case 12: return Math.sqrt(10) * (4.0 * r4 - 3.0 * r2) * Math.sin(2.0 * theta);            // 2nd Astigmatism Y
      case 13: return Math.sqrt(10) * (4.0 * r4 - 3.0 * r2) * Math.cos(2.0 * theta);            // 2nd Astigmatism X
      case 14: return Math.sqrt(10) * r4 * Math.sin(4.0 * theta);                                // Quadrafoil Y
      case 15: return Math.sqrt(10) * r4 * Math.cos(4.0 * theta);                                // Quadrafoil X
      case 16: return Math.sqrt(12) * (10.0 * r5 - 12.0 * r3 + 3.0 * rho) * Math.sin(theta);   // 2nd Coma Y
      case 17: return Math.sqrt(12) * (10.0 * r5 - 12.0 * r3 + 3.0 * rho) * Math.cos(theta);   // 2nd Coma X
      case 18: return Math.sqrt(12) * (5.0 * r5 - 4.0 * r3) * Math.sin(3.0 * theta);            // 2nd Trefoil Y
      case 19: return Math.sqrt(12) * (5.0 * r5 - 4.0 * r3) * Math.cos(3.0 * theta);            // 2nd Trefoil X
      case 20: return Math.sqrt(12) * r5 * Math.sin(5.0 * theta);                                // Pentafoil Y
      case 21: return Math.sqrt(12) * r5 * Math.cos(5.0 * theta);                                // Pentafoil X
      default: return 0.0;
    }
  }

  // Core function to propagate the cropped Near-Field to a distance zf relative to focus.
  // Returns intensity array of size Mx * My.
  function propagateNearField(zf) {
    let calibX = parseFloat(calibXInput.value);
    let calibY = calibSameCheckbox.checked ? calibX : parseFloat(calibYInput.value);

    let lambda_nm = parseFloat(wavelengthInput.value);
    let f_mm = parseFloat(focalLengthInput.value);

    let lambda_mm = lambda_nm * 1e-6; // convert nm to mm

    let imgW = intensityImage.width;
    let imgH = intensityImage.height;
    
    // Crop coordinates
    let rx = Math.floor(Math.max(0, Math.min(imgW - 1, roi.x)));
    let ry = Math.floor(Math.max(0, Math.min(imgH - 1, roi.y)));
    let rw = Math.floor(Math.max(5, Math.min(imgW - rx, roi.w)));
    let rh = Math.floor(Math.max(5, Math.min(imgH - ry, roi.h)));

    const Mx = computeFFTSize(Math.max(rw, rh));
    const My = Mx;

    const useGPU = gpuChk && gpuChk.checked && webglPropagator && webglPropagator.available;
    if (useGPU) {
      let zernikeCoeffs = new Float32Array(22);
      zernikeSliders.forEach(sliderInfo => {
        let el = document.getElementById(sliderInfo.id);
        if (el) {
          let coef = parseFloat(el.value);
          zernikeCoeffs[sliderInfo.index] = isNaN(coef) ? 0.0 : coef;
        }
      });

      let prx = 0, pry = 0;
      if (enablePhaseCheckbox.checked && phaseImage) {
        prx = Math.floor(Math.max(0, Math.min(phaseImage.width - 1, roi.x)));
        pry = Math.floor(Math.max(0, Math.min(phaseImage.height - 1, roi.y)));
      }

      let params = {
        useCustomPhase: enablePhaseCheckbox.checked && phaseImage,
        zernike: zernikeCoeffs,
        wavelength_mm: lambda_mm,
        focal_length_mm: f_mm,
        zf: zf,
        calibX: calibX,
        calibY: calibY,
        rx: rx,
        ry: ry,
        rw: rw,
        rh: rh,
        phaseImageMin: phaseImage ? phaseImage.minVal : 0.0,
        phaseImageMax: phaseImage ? phaseImage.maxVal : 1.0,
        prx: prx,
        pry: pry
      };

      // Run GPU pipeline — no readPixels stall; intensity texture stays on GPU
      const gpuTex = webglPropagator.propagate(Mx, My, params);

      // ONE readback per z-plane: used only for CPU-side statistics (second moments, caustic fit)
      // To save massive amount of time (e.g. 268MB -> 16MB), we only read back the central 1024x1024
      const readW = Math.min(Mx, 1024);
      const readH = Math.min(My, 1024);
      const readX = Math.floor((Mx - readW) / 2);
      const readY = Math.floor((My - readH) / 2);

      const gpuResult = webglPropagator.readback(Mx, My, readX, readY, readW, readH);
      let intensity = new Float64Array(Mx * My); // mostly zeros, only center filled
      
      for (let y = 0; y < readH; y++) {
        // GPU data: row 0 = bottom; CPU convention: row 0 = top  → flip Y
        const globalY = readY + y;
        const cpuY = My - 1 - globalY;
        for (let x = 0; x < readW; x++) {
          const globalX = readX + x;
          const val = gpuResult[4 * (y * readW + x)];
          intensity[cpuY * Mx + globalX] = val;
        }
      }

      // We do NOT scale the intensity for GPU here because we didn't calculate totalPower
      // over the entire field, and it's not strictly needed for the shape statistics.
      // This also ensures min/max match the raw GPU texture values for proper display rendering.

      // Return CPU intensity (for stats) and GPU texture (for display — no re-upload needed)
      return { intensity, Mx, My, gpuTex };
    }

    let re = new Float64Array(Mx * My);
    let im = new Float64Array(Mx * My);

    let normR = Math.max(rw * calibX, rh * calibY) / 2;

    // Load custom phase if enabled
    let customPhaseData = null;
    let prx = 0, pry = 0;
    if (enablePhaseCheckbox.checked && phaseImage) {
      customPhaseData = phaseImage.data;
      prx = Math.floor(Math.max(0, Math.min(phaseImage.width - 1, roi.x)));
      pry = Math.floor(Math.max(0, Math.min(phaseImage.height - 1, roi.y)));
    }

    // Place NF field at the centre of the zero-padded grid
    let cx = Math.floor(Mx / 2);
    let cy = Math.floor(My / 2);
    let startX = cx - Math.floor(rw / 2);
    let startY = cy - Math.floor(rh / 2);

    for (let y = 0; y < rh; y++) {
      let srcY = ry + y;
      let phaseSrcY = pry + y;
      for (let x = 0; x < rw; x++) {
        let srcX = rx + x;
        let phaseSrcX = prx + x;

        // Physical coordinates in near field relative to ROI centre
        let px = (x - rw / 2) * calibX;
        let py = (y - rh / 2) * calibY;

        let I_nf = intensityImage.data[srcY * imgW + srcX];
        let A = Math.sqrt(Math.max(0, I_nf));

        // Wavefront phase (radians)
        let phi = 0.0;
        if (customPhaseData) {
          let pIdx = phaseSrcY * phaseImage.width + phaseSrcX;
          let pVal = customPhaseData[pIdx];
          // Map phase image grey levels to [-π, π]
          let normP = (pVal - phaseImage.minVal) / (phaseImage.maxVal - phaseImage.minVal || 1.0);
          phi = -Math.PI + 2.0 * Math.PI * normP;
        } else {
          // Reconstruct Zernike phase
          let r = Math.sqrt(px * px + py * py);
          let theta = Math.atan2(py, px);
          let rho = r / normR;

          let zernikeSum = 0.0;
          zernikeSliders.forEach(sliderInfo => {
            let el = document.getElementById(sliderInfo.id);
            if (el) {
              let coef = parseFloat(el.value); // in waves
              if (isNaN(coef)) coef = 0.0;
              zernikeSum += coef * evalZernike(sliderInfo.index, rho, theta);
            }
          });
          phi = 2.0 * Math.PI * zernikeSum;
        }

        // Fraunhofer defocus phase: -π/λ · r² · zf / (f·(f+zf))
        if (Math.abs(zf) > 1e-8) {
          let dist_factor = zf / (f_mm * (f_mm + zf));
          let defoc = -(Math.PI / lambda_mm) * (px * px + py * py) * dist_factor;
          phi += defoc;
        }

        let gridX = startX + x;
        let gridY = startY + y;
        // Always fits: Mx >= 8×ROI so |gridX| << Mx
        if (gridX >= 0 && gridX < Mx && gridY >= 0 && gridY < My) {
          let dstIdx = gridY * Mx + gridX;
          // Apply (−1)^(u+v) to shift DC to grid centre after FFT
          let centerSign = ((gridX + gridY) % 2 === 0) ? 1.0 : -1.0;
          re[dstIdx] = A * Math.cos(phi) * centerSign;
          im[dstIdx] = A * Math.sin(phi) * centerSign;
        }
      }
    }

    // Execute 2D FFT (forward, negative-exponent convention)
    fft2d(re, im, Mx, My, false);

    // Compute intensity |E|²
    let intensity = new Float64Array(Mx * My);
    let totalPower = 0.0;
    for (let i = 0; i < Mx * My; i++) {
      let val = re[i] * re[i] + im[i] * im[i];
      intensity[i] = val;
      totalPower += val;
    }

    // Energy conservation: normalise so NF total = focal plane total
    let nfPower = 0.0;
    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        nfPower += intensityImage.data[(ry + y) * imgW + (rx + x)];
      }
    }
    if (totalPower > 0) {
      let scale = nfPower / totalPower;
      for (let i = 0; i < Mx * My; i++) intensity[i] *= scale;
    }

    // Release FFT working arrays to let GC reclaim ~64 MB early
    re = null;
    im = null;

    return { intensity, Mx, My };
  }

  // --- Real-time Instant Zernike / Flatwave propagation ---
  function computeFocalPlaneSpot() {
    let result = propagateNearField(currentZOffset);
    drawFocalSpotImage(result.intensity, result.Mx, result.My, currentZOffset);
    result.intensity = null;
    result = null;
  }

  // --- 3D Caustic and Parameters Characterization ---
  async function runCausticCalculations() {
    showError("");
    
    // Validate Zernike coefficients before running
    let zernikeValid = true;
    zernikeSliders.forEach(sliderInfo => {
      let el = document.getElementById(sliderInfo.id);
      if (el) {
        let val = parseFloat(el.value);
        if (isNaN(val) || val < -1.0 || val > 1.0) {
          zernikeValid = false;
          el.style.borderColor = "#ef4444";
          el.style.backgroundColor = "#fee2e2";
        }
      }
    });

    if (!zernikeValid) {
      showError("Please correct Zernike coefficients. All values must be between -1.0 and 1.0.");
      return;
    }
    if (!intensityImage) {
      showError("Please load or upload a Near-Field intensity image first.");
      return;
    }

    let calibX = parseFloat(calibXInput.value);
    let calibY = calibSameCheckbox.checked ? calibX : parseFloat(calibYInput.value);
    if (isNaN(calibX) || calibX <= 0 || isNaN(calibY) || calibY <= 0) {
      showError("Please enter valid positive calibration values.");
      return;
    }

    let lambda_nm = parseFloat(wavelengthInput.value);
    let f_mm     = parseFloat(focalLengthInput.value);
    let lambda_mm = lambda_nm * 1e-6;

    if (calculateBtn) calculateBtn.disabled = true;

    // Check if Far-Field only mode is active
    let isFarfieldOnly = farfieldOnlyChk ? farfieldOnlyChk.checked : false;

    if (isFarfieldOnly) {
      showProgress(10, "Computing focal plane spot…", "Far-field focus spot only");
      await yieldToDOM();

      // Clear previous caustic results
      causticResults = null;

      currentZOffset = 0.0;
      if (zSlider) {
        zSlider.value = 0.0;
      }
      setZSliderDisabled(true);
      if (zSliderVal) zSliderVal.innerText = "0.00 mm";

      if (resultsContainer) resultsContainer.style.display = "block";
      if (causticResultsCard) causticResultsCard.style.display = "none";

      computeFocalPlaneSpot();

      showProgress(100, "Done!", "Focal plane spot rendered");
      if (calculateBtn) calculateBtn.disabled = false;
      setTimeout(() => hideProgress(), 3500);
      return;
    }

    showProgress(2, "Computing focal plane…", "Step 1 / 3 — reference propagation");
    await yieldToDOM();

    // 1. Focal plane propagation at zf = 0 to estimate spot size / Rayleigh range
    let res0 = propagateNearField(0.0);
    let { intensity: focusIntensity, Mx, My } = res0;

    // Focal plane grid spacing at zf = 0
    let dx_f0 = (lambda_mm * f_mm) / (Mx * calibX);
    let dy_f0 = (lambda_mm * f_mm) / (My * calibY);

    let stats0 = calculateSecondMoments(focusIntensity, Mx, My, dx_f0, dy_f0);
    let w_focus = stats0.w_avg; // mm
    focusIntensity = null;
    res0.intensity = null;
    res0 = null;

    // Estimate nominal Rayleigh range
    let zR0 = (Math.PI * w_focus * w_focus) / lambda_mm;
    if (zR0 < 1.0) zR0 = 10.0;

    showProgress(10, "Computing caustic planes…", `Grid: ${Mx}×${My} px — ${Math.round(Mx * calibX * 1000)}×${Math.round(My * calibY * 1000)} μm`);
    await yieldToDOM();

    // 2. Sweep 21 planes over ±3 zR0
    let numPlanes = 21;
    let spanZ  = 6.0 * zR0;
    let startZ = -3.0 * zR0;
    let zPlanes = [];
    let wPlanes = [];

    for (let k = 0; k < numPlanes; k++) {
      let zf = startZ + (k / (numPlanes - 1)) * spanZ;
      let pct = 10 + (k / numPlanes) * 75;
      showProgress(pct,
        `Caustic plane ${k + 1} / ${numPlanes}`,
        `z = ${formatFixed(zf)} mm`);
      await yieldToDOM();

      let resZf = propagateNearField(zf);
      let dx_f = (lambda_mm * (f_mm + zf)) / (resZf.Mx * calibX);
      let dy_f = (lambda_mm * (f_mm + zf)) / (resZf.My * calibY);

      let stats_zf = calculateSecondMoments(resZf.intensity, resZf.Mx, resZf.My, dx_f, dy_f);
      resZf.intensity = null;
      resZf = null;
      zPlanes.push(zf);
      wPlanes.push(stats_zf.w_avg);
    }

    showProgress(87, "Fitting hyperbolic caustic…", "Least-squares w²(z) = A·z² + B·z + C");
    await yieldToDOM();
    // 3. Fit quadratic caustic w²(z) = A·z² + B·z + C using ISO 11146 second-moment beam radii
    //    All beam radii (w) are ISO second-moment radii: w = 2·sqrt(variance).
    let fit = fitQuadraticCaustic(zPlanes, wPlanes);
    if (!fit) {
      showError("Failed to fit beam caustic parameters.");
      if (calculateBtn) calculateBtn.disabled = false;
      hideProgress();
      return;
    }

    let { A, B, C } = fit;
    let z0 = -B / (2.0 * A);                                               // axial waist position (mm)
    let w0 = Math.sqrt(Math.max(1e-12, C - (B * B) / (4.0 * A)));         // ISO second-moment waist radius (mm)
    let M2 = (Math.PI * w0 * Math.sqrt(Math.max(1e-12, A))) / lambda_mm;  // M² from full caustic fit (ISO 11146)
    if (M2 < 1.0) M2 = 1.0;
    let zR = w0 / Math.sqrt(Math.max(1e-12, A));                           // Rayleigh range (mm)

    causticResults = { zPlanes, wPlanes, z0, w0, M2, zR, fitA: A, fitB: B, fitC: C };

    // Update z-slider to be centred at the real waist
    currentZOffset = z0;
    if (zSlider) {
      zSlider.min   = formatFixed(z0 - 3.0 * zR);
      zSlider.max   = formatFixed(z0 + 3.0 * zR);
      zSlider.step  = formatFixed(zR / 10);
      zSlider.value = formatFixed(z0);
    }
    setZSliderDisabled(false);
    if (zSliderVal) zSliderVal.innerText = `${formatFixed(z0)} mm`;

    showProgress(95, "Rendering results…", "");
    await yieldToDOM();

    if (resultsContainer) resultsContainer.style.display = "block";
    if (causticResultsCard) causticResultsCard.style.display = "block";
    drawCausticProfilePlot();
    computeFocalPlaneSpot();

    // Summary card
    if (resM2)          resM2.innerHTML          = formatFixed(M2);
    if (resWaistRadius) resWaistRadius.innerHTML  = `${(w0 * 1000).toFixed(1)} &mu;m`;
    // FWHM conversion assumes Gaussian profile: d_FWHM = w0 * sqrt(2 ln 2)
    let d0_fwhm = 2.0 * w0 * Math.sqrt(Math.LN2 / 2);
    if (resWaistFwhm)   resWaistFwhm.innerHTML    = `${(d0_fwhm * 1000).toFixed(1)} &mu;m`;
    if (resRayleighRange) resRayleighRange.innerHTML = `${formatFixed(zR)} mm`;
    if (resFocusShift)  resFocusShift.innerHTML   = `${formatFixed(z0)} mm`;

    // If input beam diameter is provided, compute diffraction-limited focus and ratio-based M²
    let D_in = inputBeamDiameter ? parseFloat(inputBeamDiameter.value) : NaN;
    if (!isNaN(D_in) && D_in > 0) {
      let w_DL = (2.0 * lambda_mm * f_mm) / (Math.PI * D_in); // theoretical waist radius (mm)
      let ratioM2 = w0 / w_DL; // ratio-based M²

      if (resTheoryWaist) {
        resTheoryWaist.innerHTML = `${(w_DL * 1000).toFixed(1)} &mu;m`;
      }
      if (resRatioM2) {
        resRatioM2.innerHTML = formatFixed(ratioM2);
      }
      if (rowTheoryWaist) rowTheoryWaist.style.display = "";
      if (rowRatioM2) rowRatioM2.style.display = "";
    } else {
      if (rowTheoryWaist) rowTheoryWaist.style.display = "none";
      if (rowRatioM2) rowRatioM2.style.display = "none";
    }

    showProgress(100, "Done!", `M² = ${formatFixed(M2)},  w₀ = ${(w0 * 1000).toFixed(1)} μm,  zR = ${formatFixed(zR)} mm`);
    if (calculateBtn) calculateBtn.disabled = false;
    setTimeout(() => hideProgress(), 3500);
  }

  // ISO 11146 second-moment beam radius calculated over an adaptive integration window (ISO 11146-2 recommendation).
  // Integrating only over the crop window centered on the peak (about 3 times the beam size) avoids
  // background numerical noise far from the centroid from inflating the second-order moments.
  // Returns w = 2*sqrt(variance) for each axis. For a Gaussian beam this equals the 1/e² radius.
  function calculateSecondMoments(intensityGrid, Mx, My, dx_f, dy_f) {
    const { peakX, peakY, cropSize } = adaptiveCropFocalSpot(intensityGrid, Mx, My);
    const halfCrop = Math.floor(cropSize / 2);

    let xMin = Math.max(0, peakX - halfCrop);
    let xMax = Math.min(Mx, peakX + halfCrop);
    let yMin = Math.max(0, peakY - halfCrop);
    let yMax = Math.min(My, peakY + halfCrop);

    let totalInt = 0.0;
    let cx = 0.0, cy = 0.0;

    for (let y = yMin; y < yMax; y++) {
      let physY = (y - My / 2) * dy_f;
      for (let x = xMin; x < xMax; x++) {
        let physX = (x - Mx / 2) * dx_f;
        let v = intensityGrid[y * Mx + x];
        totalInt += v;
        cx += physX * v;
        cy += physY * v;
      }
    }

    if (totalInt <= 0.0) return { cx: 0, cy: 0, w_x: 0, w_y: 0, w_avg: 0 };

    cx /= totalInt;
    cy /= totalInt;

    // Compute second spatial moments (variance) about the centroid
    let varX = 0.0, varY = 0.0;
    for (let y = yMin; y < yMax; y++) {
      let physY = (y - My / 2) * dy_f;
      let dY2 = (physY - cy) * (physY - cy);
      for (let x = xMin; x < xMax; x++) {
        let physX = (x - Mx / 2) * dx_f;
        let dX2 = (physX - cx) * (physX - cx);
        let v = intensityGrid[y * Mx + x];
        varX += dX2 * v;
        varY += dY2 * v;
      }
    }

    varX /= totalInt;
    varY /= totalInt;

    // ISO 11146 beam radius: w = 2 * sqrt(variance)
    let w_x  = 2.0 * Math.sqrt(Math.max(0, varX));
    let w_y  = 2.0 * Math.sqrt(Math.max(0, varY));
    let w_avg = Math.sqrt((w_x * w_x + w_y * w_y) / 2);

    return { cx, cy, w_x, w_y, w_avg };
  }

  // Solves quadratic caustic fit w^2(z) = A*z^2 + B*z + C using Cramer's Rule
  function fitQuadraticCaustic(zArr, wArr) {
    let N = zArr.length;
    let S0 = N;
    let S1 = 0, S2 = 0, S3 = 0, S4 = 0;
    let U0 = 0, U1 = 0, U2 = 0;

    for (let i = 0; i < N; i++) {
      let z = zArr[i];
      let W = wArr[i] * wArr[i]; // fit w^2

      let z2 = z * z;
      let z3 = z2 * z;
      let z4 = z3 * z;

      S1 += z;
      S2 += z2;
      S3 += z3;
      S4 += z4;

      U0 += W;
      U1 += W * z;
      U2 += W * z2;
    }

    // Solve system:
    // [ S4  S3  S2 ] [ A ]   [ U2 ]
    // [ S3  S2  S1 ] [ B ] = [ U1 ]
    // [ S2  S1  S0 ] [ C ]   [ U0 ]

    let det = S4 * (S2 * S0 - S1 * S1) - S3 * (S3 * S0 - S1 * S2) + S2 * (S3 * S1 - S2 * S2);
    if (Math.abs(det) < 1e-15) return null;

    let detA = U2 * (S2 * S0 - S1 * S1) - S3 * (U1 * S0 - S1 * U0) + S2 * (U1 * S1 - S2 * U0);
    let detB = S4 * (U1 * S0 - S1 * U0) - U2 * (S3 * S0 - S1 * S2) + S2 * (S3 * U0 - U1 * S2);
    let detC = S4 * (S2 * U0 - U1 * S1) - S3 * (S3 * U0 - U1 * S2) + U2 * (S3 * S1 - S2 * S2);

    return {
      A: detA / det,
      B: detB / det,
      C: detC / det
    };
  }

  // --- Display Focal Plane Spot & Gaussian Fitting ---

  // --- Adaptive focal-spot crop ---
  // Finds the intensity peak inside the central 50% of the FFT grid,
  // then measures the spot size by walking along X and Y until intensity drops to 10% of the peak,
  // and returns a crop window size that is ~3x the spot diameter (clamped between 64 and 512).
  // Also returns estimated initial standard deviations (sigX, sigY) for 2D Gaussian fitting.
  function adaptiveCropFocalSpot(intensityGrid, Mx, My) {
    const qx = Math.floor(Mx * 0.25), qy = Math.floor(My * 0.25);

    // 1. Find the peak inside the central 50% region
    let peakVal = -Infinity;
    let peakX = Math.floor(Mx / 2), peakY = Math.floor(My / 2);
    for (let y = qy; y < My - qy; y++) {
      for (let x = qx; x < Mx - qx; x++) {
        const v = intensityGrid[y * Mx + x];
        if (v > peakVal) {
          peakVal = v;
          peakX = x;
          peakY = y;
        }
      }
    }
    if (peakVal <= 0.0) {
      return { peakX, peakY, cropSize: 128, sigX: 16, sigY: 16 };
    }

    // 2. Measure spot width by walking in X and Y from peak until intensity drops to 10% of peakVal
    const threshold = peakVal * 0.10;
    const maxWalk = Math.floor(Math.min(Mx, My) / 3);

    // Walk X right
    let rightDist = 0;
    while (rightDist < maxWalk && (peakX + rightDist) < Mx - 1) {
      if (intensityGrid[peakY * Mx + (peakX + rightDist)] < threshold) break;
      rightDist++;
    }
    // Walk X left
    let leftDist = 0;
    while (leftDist < maxWalk && (peakX - leftDist) > 0) {
      if (intensityGrid[peakY * Mx + (peakX - leftDist)] < threshold) break;
      leftDist++;
    }
    // Walk Y down
    let downDist = 0;
    while (downDist < maxWalk && (peakY + downDist) < My - 1) {
      if (intensityGrid[(peakY + downDist) * Mx + peakX] < threshold) break;
      downDist++;
    }
    // Walk Y up
    let upDist = 0;
    while (upDist < maxWalk && (peakY - upDist) > 0) {
      if (intensityGrid[(peakY - upDist) * Mx + peakX] < threshold) break;
      upDist++;
    }

    let sizeX = rightDist + leftDist;
    let sizeY = downDist + upDist;
    let spotSize = Math.max(sizeX, sizeY);

    if (spotSize <= 2) {
      spotSize = 16;
    }

    let cropSize = Math.max(64, Math.min(512, spotSize * 3));
    if (cropSize % 2 !== 0) cropSize += 1;

    // Estimate initial sigma: intensity drops to 10% at r ≈ 2.15 * sigma
    let sigX = Math.max(1.0, (rightDist + leftDist) / 4.3);
    let sigY = Math.max(1.0, (downDist + upDist) / 4.3);

    return { peakX, peakY, cropSize, sigX, sigY };
  }

  function drawCurrentFocalSpot() {
    if (!intensityImage) return;
    let result = propagateNearField(currentZOffset);
    drawFocalSpotImage(result.intensity, result.Mx, result.My, currentZOffset);
    result.intensity = null;
    result = null;
  }

  function drawFocalSpotImage(intensityGrid, Mx, My, zf) {
    if (!focalCanvas || !focalCtx) return;

    const lambda_mm = parseFloat(wavelengthInput.value) * 1e-6;
    const f_mm     = parseFloat(focalLengthInput.value);
    const calibX   = parseFloat(calibXInput.value);
    const calibY   = calibSameCheckbox.checked ? calibX : parseFloat(calibYInput.value);

    // Focal-plane pixel size (mm)
    const dx_f = (lambda_mm * (f_mm + zf)) / (Mx * calibX);
    const dy_f = (lambda_mm * (f_mm + zf)) / (My * calibY);

    // Adaptive base crop centred on the intensity peak
    const { peakX, peakY, cropSize: baseCropSize, sigX: cropSigX, sigY: cropSigY } = adaptiveCropFocalSpot(intensityGrid, Mx, My);
    const baseHalfCrop = Math.floor(baseCropSize / 2);
    let baseStartX = Math.max(0, Math.min(Mx - baseCropSize, peakX - baseHalfCrop));
    let baseStartY = Math.max(0, Math.min(My - baseCropSize, peakY - baseHalfCrop));

    // Extract baseCroppedData for consistent, zoom-independent fitting
    const baseCroppedData = new Float64Array(baseCropSize * baseCropSize);
    for (let y = 0; y < baseCropSize; y++) {
      const srcY = baseStartY + y;
      for (let x = 0; x < baseCropSize; x++) {
        baseCroppedData[y * baseCropSize + x] = intensityGrid[srcY * Mx + (baseStartX + x)];
      }
    }

    // Now compute the scaled crop size for visual rendering
    let cropSize = Math.round(baseCropSize / focalZoomFactor);
    cropSize = Math.max(32, Math.min(Math.min(Mx, My), cropSize));
    const halfCrop = Math.floor(cropSize / 2);

    let startX = Math.max(0, Math.min(Mx - cropSize, peakX - halfCrop));
    let startY = Math.max(0, Math.min(My - cropSize, peakY - halfCrop));

    focalCanvas.width  = 400;
    focalCanvas.height = 400;

    let minVal = Infinity, maxVal = -Infinity;
    const croppedData = new Float64Array(cropSize * cropSize);
    for (let y = 0; y < cropSize; y++) {
      const srcY = startY + y;
      for (let x = 0; x < cropSize; x++) {
        const v = intensityGrid[srcY * Mx + (startX + x)];
        croppedData[y * cropSize + x] = v;
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    }

    const cMinPct = parseFloat(focalContrastMinSlider.value) / 100;
    const cMaxPct = parseFloat(focalContrastMaxSlider.value) / 100;
    let minV = minVal + cMinPct * (maxVal - minVal);
    let maxV = minVal + cMaxPct * (maxVal - minVal);
    if (maxV <= minV) maxV = minV + 1e-5;

    const cmap    = colormapSelect.value;
    const colormapIndices = {
      "rainbow": 0,
      "jet": 1,
      "viridis": 2,
      "plasma": 3,
      "grayscale": 4
    };
    let cmapIdx = colormapIndices[cmap] !== undefined ? colormapIndices[cmap] : 1;

    const useGPU = gpuChk && gpuChk.checked && webglPropagator && webglPropagator.available && webglPropagator.lastResultTex;
    if (useGPU) {
      // GPU result is in OpenGL bottom-up convention; convert CPU crop coords to GPU coords
      // CPU: startY counted from top; GPU: row 0 = bottom, so gpuStartY = My - startY(cpu) - cropSize
      const gpuStartY = Math.max(0, My - startY - cropSize);
      const crop = { x: startX, y: gpuStartY, z: cropSize, w: cropSize };
      // lastResultTex is set by propagate() — reuse it directly, zero additional GPU stall
      webglPropagator.renderToCanvas(focalCanvas, webglPropagator.lastResultTex, crop, minV, maxV, cmapIdx, Mx, My, false);
    } else {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = cropSize;
      offCanvas.height = cropSize;
      const offCtx = offCanvas.getContext("2d");
      const imgData = offCtx.createImageData(cropSize, cropSize);
      const pixels  = imgData.data;
      for (let i = 0; i < cropSize * cropSize; i++) {
        const norm = Math.max(0, Math.min(1, (croppedData[i] - minV) / (maxV - minV)));
        const [r, g, b] = getColor(norm, cmap);
        pixels[i * 4]     = r;
        pixels[i * 4 + 1] = g;
        pixels[i * 4 + 2] = b;
        pixels[i * 4 + 3] = 255;
      }
      offCtx.putImageData(imgData, 0, 0);

      focalCtx.imageSmoothingEnabled = false;
      focalCtx.drawImage(offCanvas, 0, 0, cropSize, cropSize, 0, 0, 400, 400);
    }

    // Physical window size for the footer
    const windowUm = cropSize * dx_f * 1000;

    // 2D Gaussian Fit if checked (fitted on base optimal crop for parameter stability)
    if (fitGaussianChk.checked) {
      let fit = fit2DGaussianFocal(baseCroppedData, baseCropSize, baseCropSize, dx_f * 1000, dy_f * 1000, cropSigX, cropSigY);
      if (fit && fit.success) {
        // Draw FWHM ellipse mapped onto the currently zoomed view
        let contourColor = "#ffffff";
        if (cmap === "grayscale" || cmap === "viridis") contourColor = "#ff4444";
        else if (cmap === "plasma") contourColor = "#00ff80";

        focalCtx.save();
        focalCtx.strokeStyle = contourColor;
        focalCtx.lineWidth = 1.5;
        focalCtx.beginPath();

        const numPts = 120;
        let scaleCanvas = 400 / cropSize;
        let rFwhmX = Math.sqrt(2 * Math.LN2) * fit.sigmaX * scaleCanvas;
        let rFwhmY = Math.sqrt(2 * Math.LN2) * fit.sigmaY * scaleCanvas;
        let cosT = Math.cos(fit.theta);
        let sinT = Math.sin(fit.theta);

        // Map ellipse center to current zoomed coordinates and scale
        let drawXo = (fit.xo + baseStartX - startX) * scaleCanvas;
        let drawYo = (fit.yo + baseStartY - startY) * scaleCanvas;

        for (let i = 0; i <= numPts; i++) {
          let ang = (i / numPts) * 2.0 * Math.PI;
          let ex  = rFwhmX * Math.cos(ang);
          let ey  = rFwhmY * Math.sin(ang);
          let rotX = drawXo + ex * cosT + ey * sinT;
          let rotY = drawYo - ex * sinT + ey * cosT;
          if (i === 0) focalCtx.moveTo(rotX, rotY);
          else         focalCtx.lineTo(rotX, rotY);
        }
        focalCtx.closePath();
        focalCtx.stroke();
        focalCtx.restore();

        // Stats table — table-layout:fixed prevents value column from being pushed out
        focalStatsTableWrapper.innerHTML = `
          <table style="font-size:0.75rem; margin-top:0.5rem; width:100%; border-collapse:collapse; table-layout:fixed;">
            <colgroup><col style="width:62%"><col style="width:38%"></colgroup>
            <tbody>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:0.25rem 0.3rem; overflow:hidden;"><strong>RMS Major (d<sub>RMS,maj</sub>)</strong></td>
                <td style="padding:0.25rem 0.3rem; font-family:monospace; color:#2563eb; text-align:right;">${fit.RMS_maj.toFixed(1)} μm</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:0.25rem 0.3rem; overflow:hidden;"><strong>RMS Minor (d<sub>RMS,min</sub>)</strong></td>
                <td style="padding:0.25rem 0.3rem; font-family:monospace; color:#2563eb; text-align:right;">${fit.RMS_min.toFixed(1)} μm</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:0.25rem 0.3rem; overflow:hidden;"><strong>FWHM Major (d<sub>FWHM,maj</sub>)</strong></td>
                <td style="padding:0.25rem 0.3rem; font-family:monospace; color:#2563eb; text-align:right;">${fit.FWHM_maj.toFixed(1)} μm</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:0.25rem 0.3rem; overflow:hidden;"><strong>FWHM Minor (d<sub>FWHM,min</sub>)</strong></td>
                <td style="padding:0.25rem 0.3rem; font-family:monospace; color:#2563eb; text-align:right;">${fit.FWHM_min.toFixed(1)} μm</td>
              </tr>
              <tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:0.25rem 0.3rem; overflow:hidden;"><strong>Rotation</strong></td>
                <td style="padding:0.25rem 0.3rem; font-family:monospace; text-align:right;">${(fit.theta * 180 / Math.PI).toFixed(1)}&deg;</td>
              </tr>
              <tr>
                <td style="padding:0.25rem 0.3rem; overflow:hidden;"><strong>q-factor</strong></td>
                <td style="padding:0.25rem 0.3rem; font-family:monospace; text-align:right;">${fit.qFactor.toFixed(3)}</td>
              </tr>
              <tr style="border-top:1px solid #e5e7eb;">
                <td colspan="2" style="padding:0.2rem 0.3rem; font-size:0.68rem; color:#9ca3af;">Display window: ${windowUm.toFixed(0)} μm · pixel: ${(dx_f*1000).toFixed(2)} μm</td>
              </tr>
            </tbody>
          </table>
        `;
      } else {
        focalStatsTableWrapper.innerHTML = `<p style="color:#ef4444; font-weight:700; margin:0.5rem 0;">Fit could not converge. Try a larger ROI or different Zernike coefficients.</p>`;
      }
    } else {
      focalStatsTableWrapper.innerHTML = `<p style="color:#6b7280; font-style:italic; margin:0.5rem 0;">Enable "Fit 2D Gaussian" checkbox to show spot metrics.</p>`;
    }
  }

  // Fits rotated 2D Gaussian to the cropped focal spot grid
  function fit2DGaussianFocal(data, rw, rh, calibX_um, calibY_um, sigX_guess = null, sigY_guess = null) {
    let minVal = Infinity, maxVal = -Infinity;
    let maxPx = 0, maxPy = 0;

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        let v = data[y * rw + x];
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

    // Estimate initial sigma by walking along X and Y axes from peak
    let sigX0 = sigX_guess;
    let sigY0 = sigY_guess;

    if (sigX0 === null || sigY0 === null) {
      const threshold = minVal + amp0 * 0.50;
      const maxWalkX = Math.floor(rw / 2);
      const maxWalkY = Math.floor(rh / 2);

      let rDist = 0;
      while (rDist < maxWalkX && (maxPx + rDist) < rw - 1) {
        if (data[maxPy * rw + (maxPx + rDist)] < threshold) break;
        rDist++;
      }
      let lDist = 0;
      while (lDist < maxWalkX && (maxPx - lDist) > 0) {
        if (data[maxPy * rw + (maxPx - lDist)] < threshold) break;
        lDist++;
      }
      let dDist = 0;
      while (dDist < maxWalkY && (maxPy + dDist) < rh - 1) {
        if (data[(maxPy + dDist) * rw + maxPx] < threshold) break;
        dDist++;
      }
      let uDist = 0;
      while (uDist < maxWalkY && (maxPy - uDist) > 0) {
        if (data[(maxPy - uDist) * rw + maxPx] < threshold) break;
        uDist++;
      }

      let wX = rDist + lDist;
      let wY = dDist + uDist;

      sigX0 = wX > 1 ? Math.max(0.5, wX / 2.355) : rw / 8;
      sigY0 = wY > 1 ? Math.max(0.5, wY / 2.355) : rh / 8;
    }

    let theta0 = 0.0;

    let p = [amp0, xo0, yo0, sigX0, sigY0, theta0, offset0];
    let bestP = simplexOptimize(p, data, rw, rh, sigX0, sigY0);

    let [amp, xo, yo, sigX, sigY, theta, offset] = bestP;
    sigX = Math.abs(sigX);
    sigY = Math.abs(sigY);

    if (amp <= 0 || sigX < 0.5 || sigY < 0.5 || xo < -rw || xo > 2 * rw || yo < -rh || yo > 2 * rh) {
      return { success: false };
    }

    let fwhmX = 2.0 * Math.sqrt(2.0 * Math.LN2) * sigX * calibX_um;
    let fwhmY = 2.0 * Math.sqrt(2.0 * Math.LN2) * sigY * calibY_um;
    let fwhmMajor = Math.max(fwhmX, fwhmY);
    let fwhmMinor = Math.min(fwhmX, fwhmY);

    let rmsMaj = Math.max(sigX * calibX_um, sigY * calibY_um);
    let rmsMin = Math.min(sigX * calibX_um, sigY * calibY_um);

    // Compute q-factor within the FWHM ellipse
    let cosT = Math.cos(theta);
    let sinT = Math.sin(theta);
    let a_coef = (cosT * cosT) / (2 * sigX * sigX) + (sinT * sinT) / (2 * sigY * sigY);
    let b_coef = -Math.sin(2 * theta) / (4 * sigX * sigX) + Math.sin(2 * theta) / (4 * sigY * sigY);
    let c_coef = (sinT * sinT) / (2 * sigX * sigX) + (cosT * cosT) / (2 * sigY * sigY);

    let fwhmSum = 0.0;
    let totalSum = 0.0;

    for (let y = 0; y < rh; y++) {
      for (let x = 0; x < rw; x++) {
        let v = data[y * rw + x];
        totalSum += v;
        let dx = x - xo;
        let dy = y - yo;
        let val = a_coef * dx * dx + 2.0 * b_coef * dx * dy + c_coef * dy * dy;
        if (val <= Math.LN2) {
          fwhmSum += v;
        }
      }
    }

    let qFactor = totalSum > 0.0 ? fwhmSum / totalSum : 0.0;

    return {
      success: true,
      amplitude: amp,
      xo: xo,
      yo: yo,
      sigmaX: sigX,
      sigmaY: sigY,
      theta: theta,
      offset: offset,
      FWHM_maj: fwhmMajor,
      FWHM_min: fwhmMinor,
      RMS_maj: rmsMaj,
      RMS_min: rmsMin,
      qFactor: qFactor
    };
  }

  function simplexOptimize(initialP, gridData, rw, rh, sigX0, sigY0) {
    let N = initialP.length;
    let simplex = new Array(N + 1);
    simplex[0] = initialP.slice();

    let step = [
      initialP[0] * 0.2,
      Math.max(1.0, sigX0 * 0.2),
      Math.max(1.0, sigY0 * 0.2),
      Math.max(0.5, sigX0 * 0.2),
      Math.max(0.5, sigY0 * 0.2),
      0.2,
      initialP[6] * 0.2
    ];
    for (let i = 0; i < N; i++) {
      let vertex = initialP.slice();
      vertex[i] += step[i] !== 0 ? step[i] : 1.0;
      simplex[i + 1] = vertex;
    }

    function cost(pVec) {
      let [amp, xo, yo, sigX, sigY, theta, offset] = pVec;
      if (sigX <= 0.05 || sigY <= 0.05) return 1e18;
      let cosT = Math.cos(theta);
      let sinT = Math.sin(theta);
      let a = (cosT * cosT) / (2 * sigX * sigX) + (sinT * sinT) / (2 * sigY * sigY);
      let b = -Math.sin(2 * theta) / (4 * sigX * sigX) + Math.sin(2 * theta) / (4 * sigY * sigY);
      let c = (sinT * sinT) / (2 * sigX * sigX) + (cosT * cosT) / (2 * sigY * sigY);

      let err = 0;
      for (let y = 0; y < rh; y++) {
        let dy = y - yo;
        for (let x = 0; x < rw; x++) {
          let dx = x - xo;
          let model = offset + amp * Math.exp(-(a * dx * dx + 2 * b * dx * dy + c * dy * dy));
          let diff = gridData[y * rw + x] - model;
          err += diff * diff;
        }
      }
      return err;
    }

    let costs = simplex.map(cost);

    for (let iter = 0; iter < 400; iter++) {
      let indices = Array.from({ length: N + 1 }, (_, i) => i).sort((a, b) => costs[a] - costs[b]);
      let bestIdx = indices[0];
      let worstIdx = indices[N];
      let secWorstIdx = indices[N - 1];

      let costRange = Math.abs(costs[worstIdx] - costs[bestIdx]);
      let costScale = Math.max(1, Math.abs(costs[bestIdx]));
      if (costRange / costScale < 1e-9) break;

      let centroid = new Float64Array(N);
      for (let i = 0; i < N; i++) {
        let idx = indices[i];
        for (let j = 0; j < N; j++) centroid[j] += simplex[idx][j] / N;
      }

      // Reflection
      let reflected = new Array(N);
      for (let j = 0; j < N; j++) reflected[j] = centroid[j] + 1.0 * (centroid[j] - simplex[worstIdx][j]);
      let refCost = cost(reflected);

      if (refCost < costs[secWorstIdx] && refCost >= costs[bestIdx]) {
        simplex[worstIdx] = reflected;
        costs[worstIdx] = refCost;
        continue;
      }

      // Expansion
      if (refCost < costs[bestIdx]) {
        let expanded = new Array(N);
        for (let j = 0; j < N; j++) expanded[j] = centroid[j] + 2.0 * (reflected[j] - centroid[j]);
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
      let contracted = new Array(N);
      for (let j = 0; j < N; j++) contracted[j] = centroid[j] + 0.5 * (simplex[worstIdx][j] - centroid[j]);
      let conCost = cost(contracted);

      if (conCost < costs[worstIdx]) {
        simplex[worstIdx] = contracted;
        costs[worstIdx] = conCost;
        continue;
      }

      // Shrink
      for (let i = 1; i <= N; i++) {
        let idx = indices[i];
        for (let j = 0; j < N; j++) {
          simplex[idx][j] = simplex[bestIdx][j] + 0.5 * (simplex[idx][j] - simplex[bestIdx][j]);
        }
        costs[idx] = cost(simplex[idx]);
      }
    }

    let finalBestIdx = Array.from({ length: N + 1 }, (_, i) => i).sort((a, b) => costs[a] - costs[b])[0];
    return simplex[finalBestIdx];
  }

  // --- Beautiful Canvas Caustic Plotting ---
  function drawCausticProfilePlot() {
    if (!causticChartCanvas || !causticResults) return;
    const ctx = causticChartCanvas.getContext("2d");
    
    // Scale canvas for high-DPI / Retina displays to make text and lines crisp
    const displayWidth = 600;
    const displayHeight = 200;
    const dpr = window.devicePixelRatio || 1;
    
    causticChartCanvas.width = displayWidth * dpr;
    causticChartCanvas.height = displayHeight * dpr;
    causticChartCanvas.style.width = displayWidth + "px";
    causticChartCanvas.style.height = displayHeight + "px";
    
    ctx.scale(dpr, dpr);
    const w_canvas = displayWidth;
    const h_canvas = displayHeight;

    ctx.clearRect(0, 0, w_canvas, h_canvas);

    // Padding
    let padLeft = 60, padRight = 30, padTop = 20, padBottom = 45;
    let graphW = w_canvas - padLeft - padRight;
    let graphH = h_canvas - padTop - padBottom;

    // Draw borders & background
    ctx.save();
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop, graphW, graphH);
    ctx.restore();

    let { zPlanes, wPlanes, z0, w0, fitA, fitB, fitC } = causticResults;

    // Extents
    let minZ = Math.min(...zPlanes);
    let maxZ = Math.max(...zPlanes);
    let minW = 0.0;
    let maxW = Math.max(...wPlanes) * 1.15; // 15% headroom

    function getCanvasX(zVal) {
      return padLeft + ((zVal - minZ) / (maxZ - minZ)) * graphW;
    }
    function getCanvasY(wVal) {
      return padTop + graphH - (wVal / maxW) * graphH;
    }

    // Grid lines & labels
    ctx.save();
    ctx.strokeStyle = "#f3f4f6";
    ctx.fillStyle = "#4b5563";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";

    // Z Grid
    let zTicks = 5;
    for (let i = 0; i < zTicks; i++) {
      let pct = i / (zTicks - 1);
      let zVal = minZ + pct * (maxZ - minZ);
      let x = getCanvasX(zVal);
      
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + graphH);
      ctx.stroke();

      ctx.fillText(`${zVal.toFixed(1)}`, x, padTop + graphH + 15);
    }

    // W Grid
    ctx.textAlign = "right";
    let wTicks = 4;
    for (let i = 0; i < wTicks; i++) {
      let pct = i / (wTicks - 1);
      let wVal = minW + pct * (maxW - minW);
      let y = getCanvasY(wVal);

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + graphW, y);
      ctx.stroke();

      // Convert mm to um for Y labels
      ctx.fillText(`${(wVal * 1000).toFixed(0)}`, padLeft - 8, y + 3);
    }
    ctx.restore();

    // Axis Labels
    ctx.save();
    ctx.fillStyle = "#1f2937";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Propagation Offset z - f (mm)", padLeft + graphW / 2, padTop + graphH + 35);

    ctx.translate(15, padTop + graphH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Average Beam Radius w (μm)", 0, 0);
    ctx.restore();

    // Plot fitted caustic profile
    ctx.save();
    ctx.strokeStyle = "#3b82f6"; // beautiful sapphire blue
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    let fitPts = 150;
    for (let i = 0; i <= fitPts; i++) {
      let pct = i / fitPts;
      let zVal = minZ + pct * (maxZ - minZ);
      // w^2 = A*z^2 + B*z + C
      let w2Val = fitA * zVal * zVal + fitB * zVal + fitC;
      let wVal = Math.sqrt(Math.max(0, w2Val));
      let cx = getCanvasX(zVal);
      let cy = getCanvasY(wVal);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.restore();

    // Plot measured data points
    ctx.save();
    ctx.fillStyle = "#ef4444"; // red accent dots
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < zPlanes.length; i++) {
      let cx = getCanvasX(zPlanes[i]);
      let cy = getCanvasY(wPlanes[i]);
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Draw vertical line at focus waist position z0
    let focusX = getCanvasX(z0);
    if (focusX >= padLeft && focusX <= padLeft + graphW) {
      ctx.save();
      ctx.strokeStyle = "#10b981"; // emerald focus line
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(focusX, padTop);
      ctx.lineTo(focusX, padTop + graphH);
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(` Waist (z0 = ${formatFixed(z0)} mm)`, focusX + 4, padTop + 12);
      ctx.restore();
    }
  }

  // --- Diagnostics / Utility Functions ---
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

  function updateMemoryDiagnostics() {
    let totalAssetsBytes = 0;
    if (intensityImage) {
      if (intensityImage.fileSize) totalAssetsBytes += intensityImage.fileSize;
      totalAssetsBytes += intensityImage.width * intensityImage.height * 12;
    }
    if (phaseImage) {
      if (phaseImage.fileSize) totalAssetsBytes += phaseImage.fileSize;
      totalAssetsBytes += phaseImage.width * phaseImage.height * 12;
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

    const engineEl = document.getElementById("calculation-engine");
    if (engineEl) {
      const useGPU = gpuChk && gpuChk.checked && webglPropagator && webglPropagator.available;
      engineEl.innerText = useGPU ? "GPU (WebGL 2D FFT)" : "CPU (JS 2D FFT)";
    }

    const monitorEl = document.getElementById("memory-monitor");
    if (monitorEl) {
      monitorEl.style.display = (intensityImage || phaseImage) ? "block" : "none";
    }
  }

  // Initialize WebGL propagator
  webglPropagator = new WebGLPropagator();

  setInterval(updateMemoryDiagnostics, 2000);
});
