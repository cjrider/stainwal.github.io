var mic, fft, g, frameCount, lastSpectra;

function setup() {
   c = createCanvas(710,400);
   pixelDensity(1);
   noFill();

   g = new p5.Gen();

   frameCount = 0;

   oscMultiplier = .6;

   oscFreq = 0.125 * oscMultiplier;

   oscFreqLows = .2 * oscMultiplier;
   oscFreqMids = .4 * oscMultiplier;
   oscFreqHighs = .3 * oscMultiplier;

   bufferMaster = createGraphics(710,400);
   bufferMaster.blendMode(ADD);

   bufferLows = createGraphics(710,400);
   bufferMids = createGraphics(710,400);
   bufferHighs = createGraphics(710,400);


   mic = new p5.AudioIn(); // this will be Alexa's voice, plus some noise for when El is thinking
   mic.start();
   fft = new p5.FFT();
   fft.setInput(mic);
   offset = 128;// how much low freq noise to discard from the beginning of the spectrum;
   binSize = 32; // simplify the spectrum info
}

function tickTock(freq) {
  return wrap(millis()/1000*freq, 0, 1);
}

function sine(freq) {
  return g.waveform(tickTock(freq),"sine");
}

function tickRaw(x,phase)
{
  return g.waveform(wrap(x+phase,0,1),"triangle");
}
function tick(x, phase)
{
  //return (g.waveform(wrap(x+phase,0,1),"triangle") + 1)/2;
  return (tickRaw(x,phase)+1)/2;
}

function oscRaw(phase){
  return tickRaw(tickTock(oscFreq),phase);
}

function osc(phase)
{
  return tick(tickTock(oscFreq),phase);
}

function sampleMic() {

  // if (lastSpectra && frameCount++%3)
  //   return lastSpectra;

  spectrum = fft.analyze();
  spectrum = spectrum.slice(150,spectrum.length);
  lows = spectrum.slice(0,spectrum.length/3);
  mids = spectrum.slice(spectrum.length/3, 2*spectrum.length/3);
  highs = spectrum.slice(2*spectrum.length/3,spectrum.length);

 frameCount ++;

 spectra = [
   {spectrum:lows, buffer:bufferLows, phase:1, phaseOsc:oscFreqLows},
   {spectrum:mids, buffer:bufferMids, phase:0.3333333, phaseOsc:oscFreqMids},
   {spectrum:highs, buffer:bufferHighs, phase:0.6666666, phaseOsc:oscFreqHighs}
 ];

 lastSpectra = spectra;

 return spectra;
}

function draw() {

   background("#0a3266");
   var colors = ["#b42573","#009cdc","#00aea9"];
   bufferMaster.clear();

   spectra = sampleMic();

   for (i in spectra)
   {
    sp = spectra[i].spectrum;
    mag = sp.reduce(function(a,b){return a+b})/100;
    bu = spectra[i].buffer;
    ph = spectra[i].phase;
    co = colors[i];
    po = spectra[i].phaseOsc;

    f = color(co);
    f.setAlpha(100);
    bu.strokeWeight(1.5);

    tr = p5.Vector.fromAngle(sine(po )*6, 3);

    bu.clear();
    bu.resetMatrix();
    bu.fill(f);
    bu.stroke(co);
    bu.translate(width/2,height/2);
    bu.translate(tr);

    var size=20+osc(sine(po)/5)*50+mag/2.5;

    bu.ellipse(0,0,size,size);
    bu.noFill();
    //bu.ellipse(0,0,size/1.3,size/1.3);
    bu.stroke(f);
    bu.strokeWeight(.8)
    bu.ellipse(0,0,size*1.1,size*1.1);

    bufferMaster.image(bu,0,0);

   }


   image(bufferMaster,0,0);
   blend(bufferMaster,0,0,710,400,0,0,710,400,LIGHTEST);



}
