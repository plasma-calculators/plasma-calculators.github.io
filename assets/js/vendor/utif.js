/* UTIF.js - Lightweight TIFF Decoder (MIT License) */
(function(){
var UTIF = {};

if (typeof module !== 'undefined' && module.exports) module.exports = UTIF;
else window['UTIF'] = UTIF;

UTIF.decode = function(buff) {
  var data = new Uint8Array(buff);
  var id = String.fromCharCode(data[0], data[1]);
  var isLE = (id === "II");
  if (id !== "II" && id !== "MM") throw "Invalid TIFF byte order: " + id;
  
  function rUI16(o) { return isLE ? (data[o] | (data[o+1]<<8)) : ((data[o]<<8) | data[o+1]); }
  function rUI32(o) { return isLE ? ((data[o] | (data[o+1]<<8) | (data[o+2]<<16) | (data[o+3]<<24))>>>0) : (((data[o]<<24) | (data[o+1]<<16) | (data[o+2]<<8) | data[o+3])>>>0); }

  var tagOffsets = [];
  var firstIFD = rUI32(4);
  var ifd = firstIFD;
  var ifds = [];

  while (ifd !== 0 && ifd < data.length) {
    var numEntries = rUI16(ifd);
    var obj = {};
    var p = ifd + 2;
    for (var i = 0; i < numEntries; i++) {
      var tag = rUI16(p);
      var type = rUI16(p+2);
      var count = rUI32(p+4);
      var valOff = p + 8;
      var vals = [];
      var unitSize = [0,1,1,2,4,8,1,1,2,4,8,4,8][type] || 1;
      var totalBytes = count * unitSize;
      var readOffset = totalBytes <= 4 ? valOff : rUI32(valOff);

      for (var j = 0; j < count; j++) {
        var off = readOffset + j * unitSize;
        if (off >= data.length) break;
        if (type === 1 || type === 7) vals.push(data[off]);
        else if (type === 3) vals.push(rUI16(off));
        else if (type === 4) vals.push(rUI32(off));
      }
      obj[tag] = vals;
      p += 12;
    }
    ifds.push(obj);
    ifd = rUI32(p);
  }
  return ifds;
};

UTIF.decodeImages = function(buff, ifds) {
  var data = new Uint8Array(buff);
  for (var i = 0; i < ifds.length; i++) {
    var ifd = ifds[i];
    var w = ifd[256] ? ifd[256][0] : 0;
    var h = ifd[257] ? ifd[257][0] : 0;
    var bps = ifd[258] ? ifd[258] : [8];
    var phot = ifd[262] ? ifd[262][0] : 1;
    var stripOffs = ifd[273] || [];
    var stripByteCounts = ifd[279] || [];
    
    var totalLen = 0;
    for (var k = 0; k < stripByteCounts.length; k++) totalLen += stripByteCounts[k];
    var raw = new Uint8Array(totalLen);
    var curr = 0;
    for (var k = 0; k < stripOffs.length; k++) {
      var soff = stripOffs[k];
      var slen = stripByteCounts[k];
      raw.set(data.subarray(soff, soff + slen), curr);
      curr += slen;
    }
    ifd.width = w;
    ifd.height = h;
    ifd.data = raw;
  }
};

UTIF.toRGBA8 = function(ifd) {
  var w = ifd.width, h = ifd.height;
  var raw = ifd.data;
  var rgba = new Uint8Array(w * h * 4);
  var bps = ifd[258] ? ifd[258][0] : 8;
  var samples = ifd[258] ? ifd[258].length : 1;
  var phot = ifd[262] ? ifd[262][0] : 1; // 0: WhiteIsZero, 1: BlackIsZero, 2: RGB

  var numPixels = w * h;
  if (bps === 16) {
    var u16 = new Uint16Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength/2));
    var maxVal = 1;
    for (var i = 0; i < u16.length; i++) if (u16[i] > maxVal) maxVal = u16[i];
    var scale = 255 / maxVal;
    for (var i = 0; i < numPixels; i++) {
      var val = Math.floor(u16[i * samples] * scale);
      rgba[i*4] = val;
      rgba[i*4+1] = val;
      rgba[i*4+2] = val;
      rgba[i*4+3] = 255;
    }
  } else {
    for (var i = 0; i < numPixels; i++) {
      var val = raw[i * samples];
      if (phot === 0) val = 255 - val;
      rgba[i*4] = val;
      rgba[i*4+1] = val;
      rgba[i*4+2] = val;
      rgba[i*4+3] = 255;
    }
  }
  return rgba;
};
})();
