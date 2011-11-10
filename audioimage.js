(function() {
$(document).ready(function() {
    setupCanvas();
    setupAudio();
    setupControls();
    setupDrawing();
});


var canvas = null;
var context = null; 
var cursor = null;

var row = 0;
var index = 0;

var started = false;

var readFromCanvas = function(n) {
    var output = new Float32Array(n);

    // we really only need as many as n pixels from index
	var pixels = context.getImageData(0, 0, canvas.width, canvas.height);

    var pixdata = pixels.data;
    var length = pixdata.length;
    var i = 0;
    while(i < n) {
        output[i++] = 1 - (pixdata[index++]/255);
        output[i++] = 1 - (pixdata[index++]/255);
        output[i++] = 1 - (pixdata[index++]/255);

        // skip alpha 
        index++;

        index = (index % length);
        row = index / (4 * canvas.width);
        cursor.style.top = row + "px";
    }

    return output;
}

var processAudio = function(e) {
    var left = e.outputBuffer.getChannelData(0);
    var right = e.outputBuffer.getChannelData(1);
    var n = e.outputBuffer.length;
    var data = readFromCanvas(n);
    left.set(data);
    right.set(data);
}

var setupCanvas = function() {
    cursor = document.getElementById('cursor');
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
}

var setupAudio = function() {
    var audioContext = new webkitAudioContext();
    var src = audioContext.createJavaScriptNode(4096, 0, 1);
    src.onaudioprocess = processAudio; 

    // It seems the audio context needs to warm up a bit longer - 
    // without the timeout the audio only plays a few loops
    setTimeout(function() { src.connect(audioContext.destination); }, 1000);
}

var setupControls = function() {
    $('input[type="range"]').change(changeColor);
    $('#clear').click(function() {
        context.fillStyle = 'white';
        context.fillRect(0,0,canvas.width,canvas.height);
    });
    changeColor();
}

var setupDrawing = function() {
    $('#canvas').mousemove(mouseMove);
    $(document).mouseup(mouseUp);
    $('#canvas').mousedown(mouseDown);
}

var changeColor = function() {
    var h = $('#h').val();
    var s = $('#s').val();
    var l = $('#l').val();
    var style = 'hsl('+h+','+s+'%,'+l+'%)';
    var colorblock = document.getElementById('colorblock')
    var colorCtx = colorblock.getContext('2d');
    context.lineWidth = 10;
    context.strokeStyle = style;
    colorCtx.fillStyle = style;
    colorCtx.fillRect(0,0,colorblock.width,colorblock.height);
}

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

})();
