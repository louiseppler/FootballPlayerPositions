var gameCanvas;
var overviewCanvas;

/**
 * A class with extra functions to draw shapes + handles user input
 */
class CanvasHelper {
    constructor(id, width, height, mouseClick, mouseDown, draw, limitedRefresh = false) {
        this.limitedRefresh = limitedRefresh;
        this.count = 0;
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
        if(!this.limitedRefresh) {   
            this.draw();
        }
        else {
            this.count += 1;
            if(this.mouseIsPressed || this.count % 20 == 0) {
                this.draw();
            }
        }

        window.requestAnimationFrame(() => {this.drawHandler()});
    }

    drawDot(x, y, r, start = 0, end = 2 * Math.PI) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, start, end);
        this.ctx.fill();
    }

    drawCircle(x, y, r, start = 0, end = 2 * Math.PI) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, start, end);
        this.ctx.stroke();
    }

    drawLine(x1, y1, x2, y2) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    drawTriangle(x1, y1, x2, y2, x3, y3) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.fill();
    }

    fillTextCenter(str, x, y) {
        var textWidth = this.ctx.measureText(str).width;
        this.ctx.fillText("" + str, x-textWidth/2, y); 
    }

    fillTextRight(str, x, y) {
        var textWidth = this.ctx.measureText(str).width;
        this.ctx.fillText("" + str, x-textWidth, y); 
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

function setupCanvases() {

    var windowSize = Math.min($(window).width(),$(window).height()*1.8);

    if(windowSize == null) {
        windowSize = 1200;
    }
    if(windowSize > 2000) {
        windowSize = 2000;
    }
    if(windowSize < 600) {
        windowSize = 600;
    }
    
    console.log(windowSize);


    var w1 = windowSize/3*1;
    var h1 = w1*1.35;
    var w2 = windowSize/2*1;
    var h2 = w2*0.8;

    w2 = w2*1.15

    h1 = Math.floor(h1);
    h2 = Math.floor(h2);
    w1 = Math.floor(w1);
    w2= Math.floor(w2);

    gameCanvas = new CanvasHelper("container", w1, h1, () => {mouseClick();}, () => {mouseDown();}, () => {draw();});

    gameCanvas.clearCanvas()

    overviewCanvas = new CanvasHelper("container2", w2, h2, () => {empty();}, () => {empty();}, () => {draw2();}, false);

    overviewCanvas.clearCanvas()

    console.log("overviewcanvas " + overviewCanvas);

    overviewTeamA = new OverviewData(1);
    overviewTeamB = new OverviewData(2);
}