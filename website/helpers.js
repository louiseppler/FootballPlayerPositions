
// var canvas;
// var ctx;

var gameCanvas;
var overviewCanvas;

class CanvasHelper {
    constructor(id, width, height, mouseClick, mouseDown, draw) {
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseIsPressed = false;

        this.width = width;
        this.height = height; 

        console.log("setting up");

        this.draw = draw

        var canvas = d3.select('#' + id) 
        .append('canvas') 
        .attr('width', width) 
        .attr('height', height); 
        
        this.ctx = canvas.node().getContext('2d')
        
        window.requestAnimationFrame(() => {this.drawHandler()});

        var helper = this
        
        canvas.on("mousemove", function(event) {
            helper.mouseX = event.offsetX;
            helper.mouseY = event.offsetY;
        });
        
        canvas.on("mouseup", function(event) {
            mouseClick();
            helper.mouseIsPressed = false;
        });
        
        canvas.on("mousedown", function(event) {
            helper.mouseIsPressed = true;
            mouseDown();
        })
    
        this.clearCanvas()
    }

    drawHandler() {    
        this.draw();

        window.requestAnimationFrame(() => {this.drawHandler()});
    }

    drawDot(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawCircle(x, y, r) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    clearCanvas() {
        this.ctx.fillStyle = "lightgray"
        this.ctx.fillRect(0,0,this.width,this.height);
    }

    clearCanvasWhite() {
        this.ctx.fillStyle = "white"
        this.ctx.fillRect(0,0,this.width,this.height);
    }

    logLive(text) {
        this.ctx.fillStyle = "#fff"
        this.ctx.fillRect(0,0,200,20);
        this.ctx.fillStyle = "#000"
        this.ctx.fillText(text, 15, 15);
    }
}

function setup() {

    console.log("in setup function");

    gameCanvas = new CanvasHelper("container", 500, 760, () => {mouseClick();}, () => {mouseDown();}, () => {draw();});

    gameCanvas.clearCanvas()

    overviewCanvas = new CanvasHelper("container2", 750, 500, () => {empty();}, () => {empty();}, () => {draw2();});


    overviewCanvas.clearCanvas()

    console.log("overviewcanvas " + overviewCanvas);

    overviewTeamA = new OverviewData(1);

    setupUIElements()

}