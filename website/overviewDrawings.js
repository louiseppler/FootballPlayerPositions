var overviewTeamA;
var overviewTeamB;

var showOverviewForTeam = 0; //0: both; 1: team A, 2: team B

// Images
img_corner = new Image();
img_corner.src = 'imgs/corner.jpg';
img_freekick = new Image();
img_freekick.src = 'imgs/freekick.png';
img_goal = new Image();
img_goal.src = 'imgs/goal.png';
img_redcard = new Image();
img_redcard.src = 'imgs/redcard.png';
img_yellowcard = new Image();
img_yellowcard.src = 'imgs/yellowcard.png';

function draw2() {
    if(overviewCanvas == null) return;

    overviewCanvas.clearCanvasWhite();
    overviewCanvas.logLive("Computing Data")
    

    overviewTeamA.isComputing = false;
    overviewTeamB.isComputing = false;
    if(overviewTeamA.dataComputed == false && showOverviewForTeam != 2) {
        if(tracking_data != null) {
            overviewTeamA.computeChunk(500); 
            overviewTeamA.isComputing = true;
        }
    }
    else if(overviewTeamB.dataComputed == false && showOverviewForTeam != 1) {
    
        if(tracking_data != null) {
            overviewTeamB.computeChunk(500); 
            overviewTeamB.isComputing = true;
        }
    }

    debugFlagSet = false

    if(showOverviewForTeam == 0) {
        drawOverviewFor(overviewTeamA, 25, 30, overviewCanvas.width-25, overviewCanvas.height*0.5-25);
        drawOverviewFor(overviewTeamB, 25, overviewCanvas.height*0.5+25, overviewCanvas.width-25, overviewCanvas.height-30);
        displayEventList(25, overviewCanvas.width-25,  overviewCanvas.height*0.5);
    }
    else if(showOverviewForTeam == 1) {
        drawOverviewFor(overviewTeamA, 25, 30, overviewCanvas.width-25, overviewCanvas.height*0.75);
        displayEventList(25, overviewCanvas.width-25,  overviewCanvas.height*0.75+30)
    }
    else if(showOverviewForTeam == 2) {
        drawOverviewFor(overviewTeamB, 25, 30, overviewCanvas.width-25, overviewCanvas.height*0.75);
        displayEventList(25, overviewCanvas.width-25,  overviewCanvas.height*0.75+30)
    }

}

function drawOverviewFor(data, x0, y0, x1, y1) {

    if(data.dataComputed == false) {

        var ys = (y1-y0)/10;

        for(var j = 0; j < 10; j++) {
            overviewCanvas.ctx.fillStyle = "#F9F9F9"
            overviewCanvas.ctx.fillRect(x0, y0+j*ys, (x1-x0), ys*(0.45));
            overviewCanvas.ctx.fillStyle = "#F1F1F1"
            overviewCanvas.ctx.fillRect(x0, y0+j*ys+ys*(0.45), (x1-x0), ys*0.45);
        }


        overviewCanvas.ctx.fillStyle = "#FFF"
        overviewCanvas.ctx.fillRect(x0+10, y0+(y1-y0)/2-7.5, (x1-x0-20), 15);
        overviewCanvas.ctx.fillStyle = "#000"
        overviewCanvas.ctx.strokeRect(x0+10, y0+(y1-y0)/2-7.5, (x1-x0-20), 15);
        overviewCanvas.ctx.fillRect(x0+10, y0+(y1-y0)/2-7.5, (x1-x0-20)*data.dataComputedUntil/maxFrame, 15);

        overviewCanvas.ctx.font= "12px sans-serif"
        if(data.isComputing == true) {
            overviewCanvas.fillTextRight("computing player positions " + Math.floor(data.dataComputedUntil*100/maxFrame) + "%", x1-10, y0+(y1-y0)/2+15+8);
        }
        else {
            overviewCanvas.fillTextRight("Waiting...", x1-10, y0+(y1-y0)/2+15+8);
        }
        overviewCanvas.ctx.font= "10px sans-serif"  

        return;
    }
  
    var minFrameLoc = $( "#slider-range" ).slider( "values", 0 );
    var maxFrameLoc = $( "#slider-range" ).slider( "values", 1 );

    var ys = (y1-y0)/10;
    
    var scaling = new Scaling(minFrameLoc, maxFrameLoc, x0, x1, data.substitutionFrames);

    if(overviewCanvas.mouseIsPressed && overviewCanvas.mouseY > y0-10 && overviewCanvas.mouseY < y1+10) {
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
    overviewCanvas.drawLine(currentX, y0-10, currentX, y1+10);

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

            if(smoothing == 0) {
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
}

function displayEventList(x0, x1, y0) {
    var minFrameLoc = $( "#slider-range" ).slider( "values", 0 );
    var maxFrameLoc = $( "#slider-range" ).slider( "values", 1 );
    var scaling = new Scaling(minFrameLoc, maxFrameLoc, x0, x1, []);

    //Display Event List
    var levels = {0: 0, 1: 5_000, 2: 10_000, 3: 40_000, 4: 70_000, 5: 100_000, 9: 1_000_000}
    var frameDiff = maxFrameLoc-minFrameLoc;

    for(var i = 0; i < eventList.length; i++) {
        var frame = eventList[i].start.frame;

        const [typeName, team] = getType(eventList[i]);
        const type = gameEvents[typeName]

        overviewCanvas.drawLine(x0, y0, x1, y0);

        if(type != null) {
            level = type.res

            if(frame > minFrameLoc && frame < maxFrameLoc && frameDiff < levels[level]) {
                //overviewCanvas.ctx.fillText(type.letter + "*",  1/scaling*(frame-minFrameLoc)-5+x0,y0+10.5*ys);
                //overviewCanvas.ctx.fillText(type.letter + "*",  scaling.frameToPixel(frame)-5+x0,y0+10.5*ys);

                var img = null
                switch(type.icon) {
                    case "goal":
                        img = img_goal; break;
                    case "corner":
                        img = img_corner; break;
                    case "red":
                        img = img_redcard; break;
                    case "yellow":
                        img = img_yellowcard; break;
                    case "freekick":
                        img = img_freekick; break;
                }

                if(img != null) { 
                    overviewCanvas.drawLine(scaling.frameToPixel(frame), y0-2, scaling.frameToPixel(frame), y0+2);
                    if(team == 1) {
                        overviewCanvas.ctx.drawImage(img, scaling.frameToPixel(frame)-7.5,y0-20, 15, 15);
                    }
                    else {
                        overviewCanvas.ctx.drawImage(img, scaling.frameToPixel(frame)-7.5,y0+5, 15, 15);
                    }
                }
                else {
                    //overviewCanvas.ctx.fillText(type.letter + "*",  scaling.frameToPixel(frame)-5+x0,y0+5);
                }
            }
        }        
    }
}

function drawIconExplanation(x0, y0) {
    var imgs = [img_goal,img_corner,img_redcard,img_yellowcard,img_freekick];
    var labels = ["Goal","Corner","Red Card","Yellow Card","Goal Kick"]


    var x1 = labels.reduce( (total, label) => total + overviewCanvas.ctx.measureText(label).width + 15 + 10, 0);

    overviewCanvas.ctx.fillStyle = "#E2E2E2"
    overviewCanvas.ctx.fillRect(x0,y0-12,(x1-x0)+25+5,24);

    overviewCanvas.ctx.fillStyle = "#000"

    x1 = x0+5;
    for(var i = 0; i < imgs.length; i++) {
        overviewCanvas.ctx.drawImage(imgs[i], x1, y0-7.5, 15, 15);
        overviewCanvas.ctx.fillText(labels[i], x1+15+2, y0+4);
        x1 += overviewCanvas.ctx.measureText(labels[i]).width + 15 + 10;
    }
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

    var team = 1;
    if(data.team.id == "FIFATMB") team = 2;

    if(data.subtypes == null) return [name, team];

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
    if(data.subtypes.name != null) {
        var newName = data.subtypes.name;
        if(gameEvents[newName] != null) {
            var newRes = gameEvents[newName].res

            if(newRes > maxRes) {
                name = newName;
                maxRes = newRes;
            }
        }
    }
    
    return [name, team]
}