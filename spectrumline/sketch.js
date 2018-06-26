var mic, fft;

function setup() {
   createCanvas(710,400);
   noFill();

   mic = new p5.AudioIn();
   mic.start();
   fft = new p5.FFT();
   fft.setInput(mic);
   offset = 128;// lop low freqs off the beginning;
   jumps = 32;
}

function draw() {
   background("#0a3266");

   var colors = ["#009cdc","#00aea9","#b42573"];

   var spectrum = fft.analyze();

   spectrum=spectrum.slice(offset, spectrum.length);

   function sparsify(value,index,arr) {
     return index % jumps == 0;
   }

   var lows = spectrum.slice(0,spectrum.length/3).filter(sparsify);
   var mids = spectrum.slice(spectrum.length/3, 2*spectrum.length/3).filter(sparsify);
   var highs = spectrum.slice(2*spectrum.length/3,spectrum.length).filter(sparsify);

   spectra = [lows, mids, highs];

   for (i in spectra)
   {
     s = spectra[i];
     stroke(colors[i]);
     strokeWeight(3);
     noFill();
     beginShape();
     curveVertex(0,height/2);
     for (i = 0; i<s.length; i++) {
      curveVertex(i*jumps*3, map(s[i]-1, 0, 255, height/2, 0) );
     }
     for (i = s.length-1; i>=0; i--) {
      curveVertex(i*jumps*3, map(-s[i]+1, 0, 255, height/2, 0) );
     }
      curveVertex(0,height/2);
     endShape();
   }




}
