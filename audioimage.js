var audioContext = new webkitAudioContext();

var canvas = null;
var context = null; 
var cursor = null;

var row = 0;
var index = 0;
var readFromCanvas = function(n) {
    var output = new Float32Array(n);
    // we really only need as many as n pixels from index
	var pixels = context.getImageData(0, 0, canvas.width, canvas.height);

    var pixdata = pixels.data;
    var length = pixdata.length;
    var i = 0;
    while(i < n) {
        var avg = pixdata[index] + pixdata[index+1] + pixdata[index+2];
        avg = avg / 3;
        output[i] = avg / 255;
        index += 4;
        index = (index % length);
        row = index / (4 * canvas.width);
        cursor.style.top = row + "px";

        i++;
    }

    return output;
}

$(document).ready(function() {
    cursor = document.getElementById('cursor');

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    var src = audioContext.createJavaScriptNode(4096, 0, 1);
    var phase = 0.0
    var phaseInc = 440.0/audioContext.sampleRate
    // It seems the audio context needs to warm up a bit longer - 
    // without the timeout the audio only plays a few loops
    setTimeout(function() { 
        src.onaudioprocess = function(e) {
            var left = e.outputBuffer.getChannelData(0);
            var right = e.outputBuffer.getChannelData(1);
            var n = e.outputBuffer.length;
            var data = readFromCanvas(n);
            left.set(data);
            right.set(data);
        }
        src.connect(audioContext.destination);       
    }, 1000);

    context.strokeStyle = 'rgb(220,220,220)';
    $('#canvas').mousemove(mouseMove);
    $('#canvas').mouseup(mouseUp);
    $('#canvas').mousedown(mouseDown);
});

var started = false;
var mouseDown = function(evt) {
    var x = evt.offsetX;
    var y = evt.offsetY;
    context.beginPath();
    context.moveTo(x, y);
    started = true;
};

var mouseMove = function(evt) {
    if (started) {
        var x = evt.offsetX;
        var y = evt.offsetY;

        context.lineTo(x,y);
        context.stroke();
    }
}

var mouseUp = function(evt) {
    started = false; 
}

