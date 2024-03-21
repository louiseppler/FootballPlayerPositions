var mouseX;
var mouseY;
var mouseIsPressed = false;

var width = 750, height = 400; 


var canvas;
var ctx;

function setup() {

    setupUIElements()

    var canvas = d3.select('#container') 
    .append('canvas') 
    .attr('width', width) 
    .attr('height', height); 
    
    ctx = canvas.node().getContext('2d')
    
    window.requestAnimationFrame(drawHandler);
    
    canvas.on("mousemove", function(event) {
        mouseX = event.offsetX;
        mouseY = event.offsetY;
    });
    
    canvas.on("mouseup", function(event) {
        mouseIsPressed = false;
        mouseClick();
    });
    
    canvas.on("mousedown", function(event) {
        mouseIsPressed = true;
        mouseDown();
    })

    clearCanvas()
}


function drawHandler() {
    
    draw();

    window.requestAnimationFrame(drawHandler);
}

function drawDot(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawCircle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function clearCanvas() {
    ctx.fillStyle = "lightgray"
    ctx.fillRect(0,0,width,height);
}

function logLive(text) {
    ctx.fillStyle = "#fff"
    ctx.fillRect(0,0,200,20);
    ctx.fillStyle = "#000"
    ctx.fillText(text, 15, 15);
}