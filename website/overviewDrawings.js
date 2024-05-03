var overviewTeamA;
var overviewTeamB;

base_image = new Image();
base_image.src = 'imgs/ball.png';

function draw2() {
    if(overviewCanvas == null) return;

    overviewCanvas.clearCanvasWhite();
    overviewCanvas.logLive("Computing Data")
    
    var data = overviewTeamA;

    if(data.dataComputed == false) {
        if(tracking_data != null) {
            overviewTeamA.computeChunk(500); 
        }

        overviewCanvas.ctx.strokeRect(50, overviewCanvas.height/2-5, overviewCanvas.width-100, 10);
        overviewCanvas.ctx.fillRect(50, overviewCanvas.height/2-5, overviewTeamA.dataComputedUntil/maxFrame*(overviewCanvas.width-100), 10);

    }

    if(data.dataComputed == false) return;
    
    var minFrameLoc = $( "#slider-range" ).slider( "values", 0 );
    var maxFrameLoc = $( "#slider-range" ).slider( "values", 1 );


    // minFrameLoc = 100;
    // maxFrameLoc = 10000;

    //overviewCanvas.logLive("We are ready")

    var x0 = 50;
    var x1 = overviewCanvas.width-50;

    var y0 = 30;
    var ys = 40;
    
    if(overviewIsExpanded) ys = 60;

    var scaling = new Scaling(minFrameLoc, maxFrameLoc, x0, x1, data.substitutionFrames);

    //var scaling = (maxFrameLoc-minFrameLoc) / (x1-x0);

    if(overviewCanvas.mouseIsPressed) {
        frameNr = scaling.pixelToFrame(overviewCanvas.mouseX)
        //frameNr = (overviewCanvas.mouseX-x0)*scaling+minFrameLoc;
        $('#duration_slider').val(frameNr);
    }

    var smoothing = +($('#smoothing_slider').val())
    document.getElementById("smoothing_text").innerHTML = "Smoothing " + smoothing

    //var currentX = 1/scaling*(frameNr-minFrameLoc)+x0;
    var currentX = scaling.frameToPixel(frameNr);

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
        var frame = scaling.pixelToFrame(i) //Math.floor(scaling*(i-x0)+minFrameLoc);
        var frameNext = scaling.pixelToFrame(i+smoothing) //Math.floor(scaling*(i+1-x0)+minFrameLoc);



        if(frame > frameNr) {
            
            if(debugFlagSet) console.log("pixel " + i + " frame " + frame);

            debugFlagSet = false;
        }


        if(!scaling.pixelIsActive(i)) continue;
        if(frameNext == 0) continue;

        if(frameNext > maxFrameLoc-1) continue;

        var avg_diff = 0;

        for(var j = 0; j < data.roles[frame].length; j++) {

            var pos = data.playerIndices[data.roles[frame][j].playerID];

            const [xRole, yRole] = Role.getMostFrequentRole(data.roles[frame][j].roleCount,data.roles[frameNext][j].roleCount)

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
                //overviewCanvas.ctx.fillText(type.letter + "*",  1/scaling*(frame-minFrameLoc)-5+x0,y0+10.5*ys);
                overviewCanvas.ctx.fillText(type.letter + "*",  scaling.frameToPixel(frame)-5+x0,y0+10.5*ys);

                if(type.icon != "") { 
                    //overviewCanvas.ctx.drawImage(base_image, 1/scaling*(frame-minFrameLoc)-10+x0,y0+10.5*ys, 20, 20);
                    overviewCanvas.ctx.drawImage(base_image, scaling.frameToPixel(frame)-10+x0,y0+10.5*ys, 20, 20);

                }
            }
        }        
    }

    //Displaying Substituiton Indices
    for(var i = 0; i < data.substitutionIndices.length; i++) {
        var frame = data.substitutionFrames[i+1];
        if(frame > maxFrameLoc || frame < minFrameLoc) continue;
        var loc = scaling.frameToPixel(frame);

        for(var pos of data.substitutionIndices[i]) {
            overviewCanvas.ctx.fillStyle = "#A9A9A9"
            overviewCanvas.ctx.fillRect(loc+scaling.dist*0.25, y0+ys*(pos+0.15), scaling.dist*0.5,ys*0.6);
        }

    }



    //Displaying Player IDs
    overviewCanvas.ctx.fillStyle = "#000"
    
    overviewCanvas.logLive(overviewCanvas.ctx.font)

    overviewCanvas.ctx.font= "12px sans-serif"

    for(var j = 0; j < data.roles[minFrameLoc].length; j++) {

        var pos = data.playerIndices[data.roles[minFrameLoc][j].playerID];

        overviewCanvas.fillTextCenter(game.getShirtNumberLabel(data.roles[minFrameLoc][j].playerID), x0-15, y0+ys*(pos+0.5)+6);
    }
    for(var j = 0; j < data.roles[maxFrameLoc-2].length; j++) {

        var pos = data.playerIndices[data.roles[maxFrameLoc-2][j].playerID];

        overviewCanvas.fillTextCenter(game.getShirtNumberLabel(data.roles[maxFrameLoc-2][j].playerID), x1+10, y0+ys*(pos+0.5)+4);
    }

    overviewCanvas.ctx.font= "10px sans-serif"

    

    debugFlagSet = false

}

class Scaling {

    constructor(minFrameLoc, maxFrameLoc, x0, x1, holeFrames) {
        this.minFrameLoc = minFrameLoc
        this.maxFrameLoc = maxFrameLoc
        this.x0 = x0
        this.x1 = x1

        this.holes = [];

        for(var i = 1; i < holeFrames.length-1; i++) {
            const h = holeFrames[i];
            if(minFrameLoc < h && h < maxFrameLoc) {
                this.holes.push(h);
            }
        }

        if(this.holes.length > 3) {
            this.dist = 10;
        }
        else {
            this.dist = 20;
        }

        this.scaling = (maxFrameLoc-minFrameLoc) / (x1-x0- this.holes.length*this.dist);
    }

    frameToPixel(frame) {
        var i = 1/this.scaling*(frame-this.minFrameLoc)+this.x0;

        for(var k = 0; k < this.holes.length; k++) {
            if(frame > this.holes[k]) i += this.dist;
        }

        return i;
    }

    pixelToFrame(i_temp) {
        var i = i_temp;

        for(var k = this.holes.length-1; k >= 0; k--) {
            var j = this.frameToPixel(this.holes[k]);

            if(i > j) i -= this.dist;
             //if(frame > this.holes[k]) i += this.dist;
        }

        // var j = this.frameToPixel(70_000);
        // if(j < i && i < j+100) return 0;

        // if(i > j)return Math.floor( (i-this.x0-100)*this.scaling+this.minFrameLoc );
        return Math.floor( (i-this.x0)*this.scaling+this.minFrameLoc );
    }

    pixelIsActive(i_temp) {
        // var j = this.frameToPixel(70_000);
        // if(j < i && i < j+100) return false;
        // return true;

        var i = i_temp;

        for(var k = this.holes.length-1; k >= 0; k--) {
            var j = this.frameToPixel(this.holes[k]);

            if(j < i && i < j+this.dist) return false;

        }
        return true;

    }

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