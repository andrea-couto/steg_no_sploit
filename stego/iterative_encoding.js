   var logData = new Array;
   var img;
   var canvasSource;
   var canvasTarget;
   var canvasDelta;
   var contextSource;
   var contextTarget;
   var contextDelta;
   var quality;
   var sourcePix;
   var targetPix;
   var iteration = 0;
   var timer;
   var embedText;
   var grid = 1;
   var sourceBinString;
   var bitPosition;
   var encodingChannel = 3;   // R = 0, G = 1, B = 2, All = 3
   var timeoutInterval = 500;
   var histogram;
   var exploits;
   var listenerAdded = false;
   var fileType; // "JPG" or "PNG"
   var number_exploits=1; //change this if you add exploits


   function clog(x) {
      logData.splice(0, 0, x);
      writeLog();
   }

   function init() {
      img = document.getElementById("original");
      canvasSource = document.getElementById("source");
      canvasTarget = document.getElementById("target");
      canvasDelta = document.getElementById("delta");
      histogram = document.getElementById("histogram");
      exploits = document.getElementById("exploits");

      var exploitArray = new Array;

      for(var i = 0; i < number_exploits+1; i++) {
         exploitArray[i] = document.createElement("option");
      }

      exploitArray[0].value = "";
      exploitArray[0].innerHTML = "--- choose an exploit ---";
      exploitArray[1].value = ie_cinput_canvas;  //this is from the exploits.js file
      exploitArray[1].innerHTML = "IE CInput Use-After-Free calc";

      for(var i = 0; i < exploitArray.length; i++) {
         exploits.appendChild(exploitArray[i]);
      }

      exploits.addEventListener("change", selectExploit);

      img.onload = imageLoaded; 
      canvasSource.height = canvasTarget.height = canvasDelta.height = img.height;
      canvasSource.width = canvasTarget.width = canvasDelta.width = img.width;
   }

   function selectExploit() {
      var code = exploits.options[exploits.selectedIndex].value;
      document.getElementById("embedtext").value = code;
   }

   function loadImage() {
      var imageFile = document.getElementById("imageFile").value; 
      var extension = imageFile.toUpperCase().match(/\.([^\.]*)$/);
      if(extension && extension.length == 2) {
         fileType = extension[1];
      }
      if(fileType == "JPG" || fileType == "PNG") {
         clog("Image type: " + fileType);
      }
      else {
         clog("Unknown image type");
      }
      img.src = imageFile + "?" + Math.random().toString();
   }

   function imageLoaded() {
      var resolution = document.getElementById("resolution")
      resolution.value = img.width + "x" + img.height;
      encodingChannel = readEncodingChannel();

      document.getElementById("process").disabled = false;
      grid = parseInt(document.getElementById("grid").value);
      quality = parseFloat(document.getElementById("quality").value);
   }

   function getTextData() {
      embedText = document.getElementById("embedtext").value;
      writeMD5(embedText, "md5input");
      return(embedText);
   }

   function readEncodingChannel() {
      var v;
      var channels = document.getElementsByName("channels");
      for(var i = 0; i < channels.length; i++) {
         if(channels[i].checked) {
            v = channels[i].value;
            break;
         }
      }
      switch(v) {
         case "R":
            return(0);
         case "G":
            return(1);
         case "B":
            return(2);
         default:
            return(3);
      }
   }

   function writeMD5(str, element) {
      document.getElementById(element).value = md5(str);
   }

   function stringToBinary(stringValue) {
      var l = stringValue.length.toString();
      var returnString = '000000'.substring(0, 6 - l.length) +
                         l.toString() + stringValue;
      return returnString.replace(/[^]{1}/g, function(matchedString) {
         var bin = matchedString.charCodeAt(0).toString(2);
         var retString = '00000000'.substring(0, 8 - bin.length) + bin;
         return(retString);
      });
   }

   function getBit(pix, n) {
      var redbit = (pix[n] & (1 << bitPosition)) >> bitPosition;
      var greenbit = (pix[n + 1] & (1 << bitPosition)) >> bitPosition;
      var bluebit = (pix[n + 2] & (1 << bitPosition)) >> bitPosition;

      var bit;

      switch(encodingChannel) {
         case 0: 
            bit = redbit;
            break;
         case 1: 
            bit = greenbit;
            break;
         case 2: 
            bit = bluebit;
            break;
         default:
            var mean = (redbit + greenbit + bluebit) / 3;
            bit = Math.round(mean);
            if(mean > 0 && mean < 1) {
               clog((n / 4) + "* " + bit + "|" + pix[n] + " " + pix[n + 1] + " " + pix[n + 2] + "|" + redbit + " " + greenbit + " " + bluebit);
            }
      }
      return(String.fromCharCode(bit + 0x30));
   };

   function decodePixels(pixelArray, bitPosition) {
      var a = [];
      var p = 0;
      var i = 0;

      var x = 0;
      var y = 0;

      // first 6 bytes are the length
      for(var j = 0; j < 6 * 8; j++) {
         i = getCoords(x, y);
         a[p++] = getBit(pixelArray, i);

         x += grid;
         if(x >= img.width) {
            x = 0;
            y += grid;
         }
      }
      var strLength = parseInt(binaryToString(a.join("")));

      // check if the length is valid, otherwise don't even bother to
      // decode the rest of the pixels.

      if(isNaN(strLength) || (strLength * 8) > sourceBinString.length) {
         clog("Decoding Error");
         return("Decoding Error");
      }
      else {
         clog("Length = " + strLength + " x,y = " + x + "," + y);

         p = 0;
         for(var j = 0; j < strLength * 8; j++) {
            i = getCoords(x, y);
            a[p++] = getBit(pixelArray, i);

            x += grid;
            if(x >= img.width) {
               x = 0;
               y += grid;
            }
         }
         return(binaryToString(a.join("")));
      }
   }

   function binaryToString(binValue) {
      var returnString = "";
      for(i = 0; i < binValue.length; i += 8) {
         var x = binValue.substr(i, 8);
         var byte = String.fromCharCode(parseInt(x, 2));
         returnString += byte;
      }
      return(returnString);
   }

   function loadCanvas() {
      grid = parseInt(document.getElementById("grid").value);
      quality = parseFloat(document.getElementById("quality").value);

      clog("Grid = " + grid + ", quality = " + quality + ", channel = " + encodingChannel);
      sourceBinString = stringToBinary(getTextData());

      bitPosition = parseInt(document.getElementById("position").value);
      if(bitPosition < 0) {
         bitPosition = 0;
      }
      if(bitPosition > 7) {
         bitPosition = 7;
      }

      canvasSource.width = img.width;
      canvasSource.height = img.height;
      contextSource = canvasSource.getContext('2d');
      
      contextSource.drawImage(img, 0, 0);

      var sourceImage = contextSource.getImageData(0, 0, canvasSource.width, canvasSource.height);

      sourcePix = sourceImage.data;
      var encodedPix = encodeData(sourcePix, sourceBinString, bitPosition);
      sourceImage.data = encodedPix;

      contextSource.putImageData(sourceImage, 0, 0);
      document.getElementById("iterate").disabled = false;
      document.getElementById("stop").disabled = false;

      drawHistogram(canvasSource, histogram);
   }

   function encodeData(pix, bitstream, bitPosition) {
      // pix[i] : R, pix[i+1] : G, pix[i+2] : B, pix[i+3] : Alpha channel
      var i, r, g, b;
      var newR, newG, newB;

      var x = 0, y = 0;

      for(var j = 0; j < bitstream.length; j++) {
         i = getCoords(x, y);

         r = pix[i];
         g = pix[i + 1];
         b = pix[i + 2];

         // override the least significant bit of RGB pixels
         // with our data bit depending upon which encoding
         // channel is chosen.

         if(j < bitstream.length) {
            var bit = bitstream.charCodeAt(j) - 0x30; // "0"
            bit = bit << bitPosition;
            mask = 0xFF - (1 << bitPosition);

            newR = r;
            newG = g;
            newB = b;

            switch(encodingChannel) {
               case 0: 
                  newR = (r & mask) | bit;
                  break;
               case 1: 
                  newG = (g & mask) | bit;
                  break;
               case 2: 
                  newB = (b & mask) | bit;
                  break;
               default: 
                  newR = (r & mask) | bit;
                  newG = (g & mask) | bit;
                  newB = (b & mask) | bit;
            }

            pix[i] = newR;
            pix[i + 1] = newG;
            pix[i + 2] = newB;
         }

         x += grid;
         if(x >= img.width) {
            x = 0;
            y += grid;
         }
         if(y >= img.height) {
            alert("Not enough space in image");
            break;
         }
      }

      return(pix);
   }

   function getCoords(x, y) {
      return(((y * img.width) + x) * 4);
   }

   function iterate() {
      canvasTarget.width = img.width;
      canvasTarget.height = img.height;
      contextTarget = canvasTarget.getContext('2d');

      if(!listenerAdded) {
         img.addEventListener("load", afterSourceReplaced);
         listenerAdded = true;
         clog("iterate eventlistener added");
      }
      if(fileType == "JPG") {
         img.src = canvasSource.toDataURL("image/jpeg", quality);
      }
      if(fileType == "PNG") {
         img.src = canvasSource.toDataURL("image/png");
      }
      iteration++;
   }

   function stopIterating() {
      clearTimeout(timer);
   }

   function toggleSlowMotion() {
      if(document.getElementById("slowmotion").checked) {
         timeoutInterval = 1000;
      }
      else {
         timeoutInterval = 500;
      }
   }

   function afterSourceReplaced() {
      stopIterating();

      contextTarget.drawImage(img, 0, 0);

      var targetImage = contextTarget.getImageData(0, 0, canvasTarget.width, canvasTarget.height);
      targetPix = targetImage.data;

      contextTarget.putImageData(targetImage, 0, 0);

      // create the delta canvas
      // loop through the source and target pixel data
      // and plot the differences on the delta canvas

      canvasDelta.width = img.width;
      canvasDelta.height = img.height;
      contextDelta = canvasDelta.getContext('2d');

      var deltaImage = contextDelta.getImageData(0, 0, canvasDelta.width, canvasDelta.height);
      var deltaPix = deltaImage.data;

      var differingPixels = 0;

      for(var i = 0; i < sourcePix.length; i += 4) {
         var sr = sourcePix[i];
         var sg = sourcePix[i + 1];
         var sb = sourcePix[i + 2];
         var sa = sourcePix[i + 3];

         var tr = targetPix[i];
         var tg = targetPix[i + 1];
         var tb = targetPix[i + 2];
         var ta = targetPix[i + 3];

         var mean = Math.floor((sr + sg + sb) / 3);
         if(sr == tr && sb == tb && sg == tg && sa == ta) {
            // plot a B&W translucent pixel
            deltaPix[i] = mean;
            deltaPix[i + 1] = mean;
            deltaPix[i + 2] = mean;
            deltaPix[i + 3] = 64; // high transparency
         }
         else {
            // plot a red pixel
            deltaPix[i] = 255;
            deltaPix[i + 1] = 0;
            deltaPix[i + 2] = 0;
            deltaPix[i + 3] = 255;
            differingPixels++;
         }
      }
      contextDelta.putImageData(deltaImage, 0, 0);
      writeDifference(differingPixels, sourcePix.length / 4);
      document.getElementById("iterate").disabled = false;

      var decodedText = decodePixels(targetPix, bitPosition);
      document.getElementById("decodedText").value = decodedText;
      writeMD5(decodedText, "md5output");

      if(decodedText != embedText) {
         loadCanvas();
         timer = setTimeout(iterate, timeoutInterval);
      }
      else {
         canvasTarget.style.border = "3px solid red";
         populateDownloadLink();
      }
   }

   function populateDownloadLink() {
      var downloadImage, rawBase64;
      if(fileType == "JPG") {
         downloadImage = canvasSource.toDataURL("image/jpeg", quality);
         rawBase64 = downloadImage.replace("data:image/jpeg;base64,", "");
      }
      if(fileType == "PNG") {
         downloadImage = canvasSource.toDataURL("image/png");
         rawBase64 = downloadImage.replace("data:image/png;base64,", "");
      }
      var base64data = rawBase64.match(/.{1,72}/g).join("\n");
      document.getElementById("base64").value = base64data;
      var rawText = Base64.decode(rawBase64);
      var endComment = rawText.indexOf("*/");
      if(endComment > 0) {
         clog("End Comment */ occurs at position " + endComment);
      }
      else {
         clog(fileType + " is clean. No end comment */ characters found");
      }
      download("encoded_image", fileType, downloadImage);
   }

   function download(filename, extension, data) {
      var dl = document.createElement('a');
      dl.setAttribute('href', data);
      dl.setAttribute('target', '_blank');
      dl.setAttribute('download', filename + "." + extension);
      dl.style.display = "none";
      document.body.appendChild(dl);
      dl.click();
      document.body.removeChild(dl);
   }

   function saveImage() {
      loadCanvas();
      img.style.border = "3px solid red";
      canvasTarget.style.border = "0px";
   }

   function writeLog() {
      var log = document.getElementById("log");
      log.value = logData.join("\n");
   }

   function writeDifference(count, total) {
      var difference = document.getElementById("difference");
      difference.value = count + "/" + total + " (" + ((count / total) * 100) + "%)";
      var iterationCount = document.getElementById("iteration");
      iterationCount.value = iteration;
      clog("Iteration " + iteration + " - delta " + difference.value);
   }