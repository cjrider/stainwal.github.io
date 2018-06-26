var mic, fft;

function setup() {
   createCanvas(710,400);
   noFill();

   buffer = createGraphics(710,400);
   buffer.pixelDensity(1);

   mic = new p5.AudioIn(); // this will be Alexa's voice, plus some noise for when El is thinking
   mic.start();
   fft = new p5.FFT();
   fft.setInput(mic);
   offset = 128;// how much low freq noise to discard from the beginning of the spectrum;
   binSize = 32; // simplify the spectrum info
}

function draw() {
   clear();
   background("#0a3266");
   buffer.clear();
   var colors = ["#b42573","#009cdc","#00aea9"];

   var spectrum = fft.analyze();

   spectrum=spectrum.slice(offset, spectrum.length); //discard low frequency noise

   function sparsify(value,index,arr) {
     //keep only every N frequencies
     return index % binSize == 0;
   }

   var lows = spectrum.slice(0,spectrum.length/3).filter(sparsify);
   var mids = spectrum.slice(spectrum.length/3, 2*spectrum.length/3).filter(sparsify);
   var highs = spectrum.slice(2*spectrum.length/3,spectrum.length).filter(sparsify);

   spectra = [lows, mids, highs];

   for (i in spectra)
   {
     s = spectra[i];
     buffer.fill(colors[i]);
     buffer.blendMode(ADD);
     buffer.noStroke();
     buffer.beginShape();
     buffer.curveVertex(0,height/2);
     for (i = 0; i<s.length; i++) {
      buffer.curveVertex(i*binSize*3, map(s[i]-1, 0, 255, height/2, 0) );
     }
     for (i = s.length-1; i>=0; i--) {
      buffer.curveVertex(i*binSize*3, map(-s[i]+1, 0, 255, height/2, 0) );
     }
     buffer.curveVertex(0,height/2);
     buffer.endShape();
   }

   blend(buffer,0,0,710,400,0,0,710,400,LIGHTEST);


}
