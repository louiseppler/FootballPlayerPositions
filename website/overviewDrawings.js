var overviewTeamA;
var overviewTeamB;

base_image = new Image();
base_image.src = 'imgs/ball.png';

function draw2() {
    if(overviewCanvas == null) return;

    overviewCanvas.clearCanvasWhite();
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

    var smoothing = +($('#smoothing_slider').val())
    document.getElementById("smoothing_text").innerHTML = "Smoothing " + smoothing

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
    for(var i = x0; i < x1-smoothing-1; i += smoothing) {
        var frame = Math.floor(scaling*(i-x0)+minFrameLoc);
        var frameNext = Math.floor(scaling*(i+1-x0)+minFrameLoc);

        //if(frameNext > maxFrameLoc-1) continue;

        var avg_diff = 0;

        for(var j = 0; j < data.roles[frame].length; j++) {

            var pos = data.playerIndices[data.roles[frame][j].playerID];

            if(debugFlagSet) {
            }

            if(frame > frameNr) { 
                if(debugFlagSet) console.log("role: " + data.roles[frame][j].x_role + " " + data.roles[frame][j].y_role);
            }

            const [xRole, yRole] = Role.getMostFrequentRole(data.roles[frame][j].roleCount,data.roles[frame+1][j].roleCount)

            if(smoothing == 1) {
                overviewCanvas.ctx.strokeStyle = Role.colorsX[xRole+2]
                overviewCanvas.drawLine(i, y0+pos*ys, i, y0+pos*ys+ys*(0.45-0.225*overviewIsExpanded));
                overviewCanvas.ctx.strokeStyle = Role.colorsY[yRole+2]
                overviewCanvas.drawLine(i, y0+pos*ys+ys*(0.45+0.225*overviewIsExpanded), i, y0+pos*ys+ys*0.9);
            }
            else {
                overviewCanvas.ctx.fillStyle = Role.colorsX[xRole+2]
                overviewCanvas.ctx.fillRect(i, y0+pos*ys, smoothing, ys*(0.45));
                overviewCanvas.ctx.fillStyle = Role.colorsY[yRole+2]
                overviewCanvas.ctx.fillRect(i, y0+pos*ys+ys*(0.45+0.225*overviewIsExpanded), smoothing, ys*0.45);
            }
            overviewCanvas.ctx.fillStyle = "#000"


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

    //Display Event List
    var levels = {0: 0, 1: 5_000, 2: 10_000, 3: 40_000, 4: 70_000, 5: 100_000, 9: 1_000_000}
    var frameDiff = maxFrameLoc-minFrameLoc;

    for(var i = 0; i < eventList.length; i++) {
        var frame = eventList[i].start.frame;

        var type = gameEvents[ getType(eventList[i]) ];

        if(type != null) {
            level = type.res

            if(frame > minFrameLoc && frame < maxFrameLoc && frameDiff < levels[level]) {
                overviewCanvas.ctx.fillText(type.letter + "*",  1/scaling*(frame-minFrameLoc)-5+x0,y0+10.5*ys);

                if(type.icon != "") { 
                    overviewCanvas.ctx.drawImage(base_image, 1/scaling*(frame-minFrameLoc)-10+x0,y0+10.5*ys, 20, 20);
                }
            }
        }

        
        
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

/**
 * Finds the type/subtype with biggest resolution 
 * @param {*} data Data with a type variable and a list of subtype variables
 */
function getType(data) {
    var name = data.type.name
    var maxRes = gameEvents[name].res;

    if(name == "SHOT") {
        var x = 1;
    }


    if(data.subtypes == null) return name;

    if(data.subtypes instanceof Array) {
        for(var subtype of data.subtypes) {
            var newName = subtype.name;
            if(gameEvents[subtype.name] != null) {
                var newRes = gameEvents[subtype.name].res

                if(newRes > maxRes) {
                    name = newName;
                    maxRes = newRes;
                }
            }
        }
    }
   
    return name
}