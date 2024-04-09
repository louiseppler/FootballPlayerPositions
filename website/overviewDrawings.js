var overviewTeamA;
var overviewTeamB;

function draw2() {
    if(overviewCanvas == null) return;

    overviewCanvas.clearCanvas();
    overviewCanvas.logLive("Computing Data")
    
    var data = overviewTeamA;

    if(data.dataComputed == false) return;
    
    var minFrameLoc = $( "#slider-range" ).slider( "values", 0 );
    var maxFrameLoc = $( "#slider-range" ).slider( "values", 1 );


    // minFrameLoc = 100;
    // maxFrameLoc = 10000;

    overviewCanvas.logLive("We are ready")

    var x0 = 50;
    var x1 = overviewCanvas.width-50;

    var y0 = 30;
    var ys = 40;
    
    if(overviewIsExpanded) ys = 60;

    var scaling = (maxFrameLoc-minFrameLoc) / (x1-x0);

    if(overviewCanvas.mouseIsPressed) {
        frameNr = (overviewCanvas.mouseX-x0)*scaling+minFrameLoc;
        $('#duration_slider').val(frameNr);
    }


    var currentX = 1/scaling*(frameNr-minFrameLoc)+x0;

    //Displays the current selected frame
    overviewCanvas.ctx.strokeStyle = "black";
    overviewCanvas.drawLine(currentX, 0, currentX, overviewCanvas.height)


    // var averagesX = [];
    // var averagesY = [];

    if(overviewIsExpanded) {
        //Calculates + Displaying the average
        for(var j = 0; j < data.roles[minFrameLoc].length; j++) {

            if(data.roles[maxFrameLoc-10].length <= j) continue;
            var [avgX, avgY] = Role.getMostFrequentRole(data.roles[minFrameLoc][j].roleCount, data.roles[maxFrameLoc-10][j].roleCount);

            if(debugFlagSet) console.log(j + " -> " + avgX + " " + avgY);

            overviewCanvas.ctx.fillStyle = "#000";

            overviewCanvas.ctx.fillStyle = Role.colorsX[avgX+2];
            overviewCanvas.ctx.beginPath();
            overviewCanvas.ctx.rect(x0,y0+j*ys+ys*0.225, x1-x0, ys*0.225); 
            overviewCanvas.ctx.fill();
    
            overviewCanvas.ctx.fillStyle = Role.colorsY[avgY+2];
            overviewCanvas.ctx.beginPath();
            overviewCanvas.ctx.rect(x0,y0+j*ys+ys*0.45, x1-x0, ys*0.225);  
            overviewCanvas.ctx.fill();  

        }
    }
    
    //Displaying the color for each pixel
    for(var i = x0; i < x1; i++) {
        var frame = Math.floor(scaling*(i-x0)+minFrameLoc);

        var avg_diff = 0;

        for(var j = 0; j < data.roles[frame].length; j++) {

            var pos = data.playerIndices[data.roles[frame][j].playerID];

            if(debugFlagSet) {
            }

            if(frame > frameNr) { 
                if(debugFlagSet) console.log("role: " + data.roles[frame][j].x_role + " " + data.roles[frame][j].y_role);
            }

            overviewCanvas.ctx.strokeStyle = data.roles[frame][j].getColorX();
            overviewCanvas.drawLine(i, y0+pos*ys, i, y0+pos*ys+ys*(0.45-0.225*overviewIsExpanded));
            overviewCanvas.ctx.strokeStyle = data.roles[frame][j].getColorY();
            overviewCanvas.drawLine(i, y0+pos*ys+ys*(0.45+0.225*overviewIsExpanded), i, y0+pos*ys+ys*0.9);

            //avg_diff += Math.abs(averagesX[j]-data.roles[frame][j].x_role);
            //avg_diff += Math.abs(averagesX[j]-data.roles[frame][j].y_role);
        }

        if(frame > frameNr) { 
            debugFlagSet = false;
        }

        // if(overviewIsExpanded) {
        //     overviewCanvas.ctx.strokeStyle = grayScale(avg_diff/40);
        //     overviewCanvas.drawLine(i, y0+10.5*ys, i, y0+10.5*ys+ys*0.225);

        //     if(avg_diff > 30) {
        //         overviewCanvas.ctx.strokeStyle = "#000"
        //         overviewCanvas.drawLine(i, y0+10*ys, i, y0+10*ys+ys*0.225);
        //     }
        // }
    }

    //Displaying Player IDs
    overviewCanvas.ctx.fillStyle = "#000"
    for(var j = 0; j < data.roles[minFrameLoc].length; j++) {

        var pos = data.playerIndices[data.roles[minFrameLoc][j].playerID];

        overviewCanvas.ctx.fillText(data.roles[minFrameLoc][j].playerID, x0-50, y0+ys*pos+10);
    }

    //Displays Substituions as a simple line
    for(const frame of substitutionFrames) {
        if(minFrameLoc < frame && frame < maxFrameLoc) {
            var currentX = 1/scaling*(frame-minFrameLoc)+x0;

            //Displays the current selected frame
            overviewCanvas.ctx.strokeStyle = "gray";
            overviewCanvas.drawLine(currentX, y0-10, currentX, y0+ys*10+10);
        
        }
    }


    debugFlagSet = false

}

/**
 * Gives color code for a value
 * @param {*} value from 0 to 1
 */
function grayScale(value) {
    if(value < 0) return "#000";
    if(value > 1) return "#fff"
    var codes = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"]
    var c = codes[Math.round(value*16)];
    return "#"+c+c+c;
}

function empty() {}