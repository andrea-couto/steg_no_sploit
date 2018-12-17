/*
Image Decoder Javascript function.
This is the same decoder used in the HTML+Image polyglot
to trigger the exploit code upon document load.

by Saumil Shah @therealsaumil
Refactor by Andy Couto
*/

var imageFile, bitLayer, encodingChannel, grid;

// decodeImageData requires three parameters
// bitLayer          - 0-7 the LSB chosen for performing the encoding
// encodingChannel   - 0 = R, 1 = G, 2 = B, 3 = All channels
// grid              - pixel grid. 1 = 1x1, 2 = 2x2 and so on
function decodeImageData() {
   var canvas = document.createElement("canvas");

   imgsrc.parentNode.insertBefore(canvas, imgsrc);

   canvas.width = imgsrc.width;
   canvas.height = imgsrc.height;
   var ctx = canvas.getContext("2d");
   ctx.drawImage(imgsrc, 0, 0);

   imgsrc.parentNode.removeChild(imgsrc);

   // what we now see is the canvas in place of the image
   var pix = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

   var a = [], x = 0, y = 0;

   var getBit = function(pix, x, y) {
      n = (y * canvas.width + x) * 4;
      var r = (pix[n] & (1 << bitLayer)) >> bitLayer;
      var g = (pix[n + 1] & (1 << bitLayer)) >> bitLayer;
      var b = (pix[n + 2] & (1 << bitLayer)) >> bitLayer;

      var bit;

      switch(encodingChannel) {
         case 0: 
            bit = r;
            break;
         case 1: 
            bit = g;
            break;
         case 2: 
            bit = b;
            break;
         default:
            var mean = (r + g + b) / 3;
            bit = Math.round(mean);
      }
      return(String.fromCharCode(bit + 0x30));
   };

   var readBitstream = function(len) {
      for(var p = 0, j = 0; j < len * 8; j++) {
         a[p++] = getBit(pix, x, y);
         x += grid;
         if(x >= canvas.width) {
            x = 0;
            y += grid;
         }
      }
   };

   readBitstream(6);
   var len = parseInt(binaryToString(a.join("")));
   readBitstream(len);

   var strData = binaryToString(a.join(""));

   output.value = strData;
   md5sum.value = md5(strData);
}

function binaryToString(binary) {
   var str = "";
   for(i = 0; i < binary.length; i += 8) {
      var bit = binary.substr(i, 8);
      str += String.fromCharCode(parseInt(bit, 2));
   }
   return(str);
}

function getInfo() {
   
   imageFile = document.getElementById("imageFile").value;
   encodingChannel = parseInt(document.getElementById("encodingChannel").value);
   grid = parseInt(document.getElementById("grid").value);
   bitLayer = parseInt(document.getElementById("bitlayer").value);

   if(bitLayer < 0) {
      bitLayer = 0;
   }
   if(bitLayer > 7) {
      bitLayer = 7;
   }
   if(isNaN(grid)) {
      grid = 1;
   }
   
   imgsrc.src = imageFile + "?" + Math.random().toString();

}
