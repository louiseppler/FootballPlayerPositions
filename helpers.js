var mouseX;
var mouseY;
var mouseIsDown = false;

var width = 750, height = 400; 

var canvas = d3.select('#container') 
.append('canvas') 
.attr('width', width) 
.attr('height', height); 
var ctx = canvas.node().getContext('2d')

window.requestAnimationFrame(drawHandler);


canvas.on("mousemove", function(event) {
    mouseX = event.offsetX;
    mouseY = event.offsetY;
});

canvas.on("mouseup", function(event) {
    mouseClick();
});

var x = 0;

function drawHandler() {
    
    draw();

    window.requestAnimationFrame(drawHandler);
}

function drawDot(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}
