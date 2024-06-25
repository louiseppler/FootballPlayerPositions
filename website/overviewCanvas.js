var overviewTeamA;
var overviewTeamB;

//View Settings
var showOverviewForTeam = 0; //0: both; 1: team A, 2: team B
var showSubs = true;
var showSubsMinimal = false;
var showPossesionInOverview = false;

var showEvents = true;
var showPossesionInTimeline = true;

//Settings to check if view needs re-rendering
var frameOld;
var minFrameLocOld;
var maxFrameLocOld;
var viewSettingsHaveChanged = false;
var showOverviewForTeamOld = 0;
var smoothingOld = 0;

/**
 * Gets called 60 times a second, drawing loop for the position plot / overview diagram
 */
function draw2() {
    if(overviewCanvas == null) return;
    if(gameData == null) return;

    // Used for time measurement
    // 
    // var start = Date.now()
    // overviewTeamA.computeAllRoles();
    // var timeA = Date.now()-start;
    // overviewTeamB.computeAllRoles();
    // var timeB = Date.now()-start-timeA;
    // console.log("frames: " + maxFrame + " timeA: " + timeA + " timeB" + timeB);
    // alert("frames: " + maxFrame + ", team 1: " + timeA + "ms, team 2: " + timeB + "ms");
    
    overviewTeamA.isComputing = false;
    overviewTeamB.isComputing = false;
    if(overviewTeamA.dataComputed == false && showOverviewForTeam != 2) {
        overviewTeamA.computeChunk(1000); 
        overviewTeamA.isComputing = true;
    }
    else if(overviewTeamB.dataComputed == false && showOverviewForTeam != 1) {
        overviewTeamB.computeChunk(1000); 
        overviewTeamB.isComputing = true;
    }
    else {
        //limits refreshing
        if(!rerenderOverview()) return;
    }

    overviewCanvas.clearCanvasWhite();

    debugFlagSet = false

    overviewCanvas.ctx.fillStyle = "#000"
    overviewCanvas.ctx.font= "16px sans-serif"

    

    if(showOverviewForTeam == 0) {
        overviewCanvas.fillTextRight(gameData.team2.name, overviewCanvas.width-25, 20);
        overviewCanvas.fillTextRight(gameData.team1.name, overviewCanvas.width-25, overviewCanvas.height-15);

        drawOverviewFor(overviewTeamB, 25, 30, overviewCanvas.width-25, overviewCanvas.height*0.5-25, true);
        drawOverviewFor(overviewTeamA, 25, overviewCanvas.height*0.5+25, overviewCanvas.width-25, overviewCanvas.height-30, false);

        displayEventList(25, overviewCanvas.width-25,  overviewCanvas.height*0.5);
    }
    else if(showOverviewForTeam == 1) {
        overviewCanvas.fillTextRight(gameData.team1.name, overviewCanvas.width-25, 20);
        drawOverviewFor(overviewTeamA, 25, 30, overviewCanvas.width-25, overviewCanvas.height*0.75, false);
        displayEventList(25, overviewCanvas.width-25,  overviewCanvas.height*0.75+30)
    }
    else if(showOverviewForTeam == 2) {
        overviewCanvas.fillTextRight(gameData.team2.name, overviewCanvas.width-25, 20);
        drawOverviewFor(overviewTeamB, 25, 30, overviewCanvas.width-25, overviewCanvas.height*0.75, false);
        displayEventList(25, overviewCanvas.width-25,  overviewCanvas.height*0.75+30)
    }

}

function rerenderOverview() {
    var minFrameLoc = $( "#slider-range" ).slider( "values", 0 );
    var maxFrameLoc = $( "#slider-range" ).slider( "values", 1 );
    var smoothing = +($('#smoothing_slider').val())

    var hasUpdate = false;

    if(minFrameLoc != minFrameLocOld) hasUpdate = true;
    if(maxFrameLoc != maxFrameLocOld) hasUpdate = true;
    if(showOverviewForTeamOld != showOverviewForTeam) hasUpdate = true;
    if(smoothingOld != smoothing) hasUpdate = true;

    var frameDiff = 20;
    if(maxFrameLoc-minFrameLoc < 40_000) frameDiff = 3;
    if(Math.abs(frameOld-frameNr) > frameDiff || frameOld == null) {
        hasUpdate = true;
        frameOld = frameNr;
    }
    if(overviewCanvas.mouseIsPressed) hasUpdate = true;
    if(viewSettingsHaveChanged == true) hasUpdate = true;

    minFrameLocOld = minFrameLoc;
    maxFrameLocOld = maxFrameLoc;
    viewSettingsHaveChanged = false;    
    showOverviewForTeamOld = showOverviewForTeam;
    smoothingOld = smoothing;

    return hasUpdate;
}

function drawOverviewFor(data, x0, y0, x1, y1, flipped) {

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

    if(maxFrameLoc < minFrameLoc+200) {
        maxFrameLoc = minFrameLoc+200;
    }

    var ys = (y1-y0)/10;
    
    var scaling = new Scaling(minFrameLoc, maxFrameLoc, x0, x1, getSubsitutionFrames(data.substitutionFrames));

    var smoothing = +($('#smoothing_slider').val())
    var smoothing_seconds = smoothing*(scaling.scaling)/gameData.frameRate;
    var smoothing_text = ""
    if(smoothing_seconds >= 120) {
        smoothing_text = Math.floor(smoothing_seconds/60) + "min"
    }
    else if(smoothing_seconds >= 5) {
        smoothing_text = Math.floor(smoothing_seconds) + "s"

    }
    else {
        smoothing_text = Math.floor(smoothing_seconds*10)/10 + "s"
    }

    document.getElementById("smoothing_text").innerHTML = "Smoothing " + smoothing_text

    document.getElementById("time_duration_text").innerHTML = frameToTime(minFrameLoc) + " - " + frameToTime(maxFrameLoc);

    var substitutionFramesLoc = getSubsitutionFramesLocal(minFrameLoc, maxFrameLoc, data.substitutionFrames)

    for(var k = 0; k < substitutionFramesLoc.length-1; k++) {
        var k1Frame = substitutionFramesLoc[k]+1;
        var k2Frame = substitutionFramesLoc[k+1];
        var k1Pixel = scaling.frameToPixel(k1Frame);
        var k2Pixel = scaling.frameToPixel(k2Frame);

        for(var i = k1Pixel; i < k2Pixel; i += smoothing) {
            var i2 = i+smoothing;
            var glitchDelta = 1; //add extra pixel to avoid rendering errors
            if(i2 > k2Pixel) {
                i2 = k2Pixel
                glitchDelta = 0;
            }

            var frame = scaling.pixelToFrame(i);
            var frameNext = scaling.pixelToFrame(i2);
            
            for(var j = 0; j < data.roles[frame].length; j++) {

                var pos = data.playerIndices[data.roles[frame][j].playerID];
                if(flipped) {
                    pos = 9-pos;
                }

                const [xRole, yRole] = Role.getMostFrequentRole(data.roles[frame][j].roleCount,data.roles[frameNext][j].roleCount)

                overviewCanvas.ctx.fillStyle = Role.colorsX[xRole+2]
                overviewCanvas.ctx.fillRect(i, y0+pos*ys, (i2-i)+glitchDelta, ys*(0.45));
                overviewCanvas.ctx.fillStyle = Role.colorsY[yRole+2]
                overviewCanvas.ctx.fillRect(i, y0+pos*ys+ys*(0.45+0.225*overviewIsExpanded), (i2-i)+glitchDelta, ys*0.45);
                
                overviewCanvas.ctx.fillStyle = "#000"
            }

            if(showPossesionInOverview && possessions != null) {
                if(possessions.outOfPossesion(frame, frameNext, data.team)) {
                    overviewCanvas.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                    overviewCanvas.ctx.fillRect(i, y0, (i2-i)+glitchDelta, (y1-y0));
                }
            }
        }

    }
    
  
    if(showSubs) {
        //Displaying Substitutions Indices
        for(var i = 0; i < data.substitutionIndices.length; i++) {
            var frame = data.substitutionFrames[i+1];
            if(frame > maxFrameLoc || frame < minFrameLoc) continue;
            var loc = scaling.frameToPixel(frame);

            for(var pos of data.substitutionIndices[i]) {
                if(flipped) {
                    pos = 9-pos;
                }

                overviewCanvas.ctx.fillStyle = "#575757"
                overviewCanvas.drawDot(loc+scaling.dist*0.5, y0+ys*(pos+0.5), scaling.dist*0.3);
            }
        }
    }


    //Displaying Player IDs
    overviewCanvas.ctx.fillStyle = "#000"
    
    overviewCanvas.ctx.font= "12px sans-serif"

    for(var j = 0; j < data.roles[minFrameLoc].length; j++) {

        var pos = data.playerIndices[data.roles[minFrameLoc][j].playerID];
        if(flipped) {
            pos = 9-pos;
        }

        overviewCanvas.fillTextRight(getShirtNumberLabel(data.roles[minFrameLoc][j].playerID), x0-5, y0+ys*(pos+0.5)+6);
    }

    for(var j = 0; j < data.roles[maxFrameLoc-2].length; j++) {

        var pos = data.playerIndices[data.roles[maxFrameLoc-2][j].playerID];
        if(flipped) {
            pos = 9-pos;
        }
        
        overviewCanvas.fillTextLeft(getShirtNumberLabel(data.roles[maxFrameLoc-2][j].playerID), x1+5, y0+ys*(pos+0.5)+4);
    }

    overviewCanvas.ctx.font= "10px sans-serif"  

    
    //Displays the current selected frame
    if(minFrameLoc < frameNr && frameNr < maxFrameLoc) {
        var currentX = scaling.frameToPixel(frameNr);

        overviewCanvas.ctx.strokeStyle = "black";
        overviewCanvas.drawLine(currentX, y0-10, currentX, y1+10);
    }

    if(overviewCanvas.mouseIsPressed && overviewCanvas.mouseY > y0-10 && overviewCanvas.mouseY < y1+10) {
        if(overviewCanvas.mouseX > x0 && overviewCanvas.mouseX < x1) {
            setFrameNr(scaling.pixelToFrame(overviewCanvas.mouseX))
        }
    }
}

/**
 * Converts the frame to a string representing time
 * @param {Int} frame 
 * @returns 
 */
function frameToTime(frame) {

    var p = getPeriod(frame);
    var pTime = 45;
    if(p > 2) pTime = 15;

    var secondsPeriod = (+gameData.tracking[frame].timestamp)/1000;
    var additionalSeconds = 0;
    if(secondsPeriod > pTime*60) {
        additionalSeconds = secondsPeriod - (pTime*60);
        secondsPeriod -= additionalSeconds;
    }

    if(p >= 1) {
        secondsPeriod += 45*60;
    }
    if(p >= 2) {
        secondsPeriod += 45*60;
    }
    if(p >= 3) {
        secondsPeriod += 15*60;
    }
    
    if(secondsPeriod == null) {
        secondsPeriod = frame/gameData.frameRate;
    }

    //var secondsPeriod = frame/gameData.frameRate;

    var secondsText = "";
    if(secondsPeriod % 60 < 10) {
        secondsText = "0" + Math.floor(secondsPeriod % 60);
    }
    else {
        secondsText = "" + Math.floor(secondsPeriod % 60);
    }

    var minText = "";
    if(Math.floor(secondsPeriod/60) < 10) {
        minText = "0" + Math.floor(secondsPeriod/60);
    }
    else {
        minText = "" + Math.floor(secondsPeriod/60)
    }

    if(additionalSeconds > 0) {
        var secondsText2 = "";
        if(additionalSeconds % 60 < 10) {
            secondsText2 = "0" + Math.floor(additionalSeconds % 60);
        }
        else {
            secondsText2 = "" + Math.floor(additionalSeconds % 60);
        }
        return minText + "+" + Math.floor(additionalSeconds/60) + ":" + secondsText2;
    }

    return minText + ":" + secondsText;
}

/**
 * Returns combined substation frames that are within minFrameLoc and maxFrameLoc
 */
function getSubsitutionFramesLocal(minFrameLoc, maxFrameLoc, substitutionFrames) {
    var substitutionFramesLoc = [minFrameLoc];
    var combindedSubstituions = getSubsitutionFrames(substitutionFrames)
    for(var k = 1; k < combindedSubstituions.length-1; k++) {
        if(minFrameLoc <= combindedSubstituions[k] && combindedSubstituions[k] < maxFrameLoc) {
            substitutionFramesLoc.push(combindedSubstituions[k])
        }
    }
    substitutionFramesLoc.push(maxFrameLoc-2);

    return substitutionFramesLoc;
}

function getSubsitutionFrames(singleSubs) {
    if(showSubs == false) {
        return [];
    }
    if(showSubsMinimal) {
        return singleSubs;
    }
    else {
        if(overviewTeamA.dataComputed == false || overviewTeamB.dataComputed == false) {
            if(overviewTeamA.dataComputed) {
                return overviewTeamA.substitutionFrames;
            }
            if(overviewTeamB.dataComputed) {
                return overviewTeamB.substitutionFrames;
            }
            return singleSubs;
        }

        //Merging of substitutionFrames

        var i1 = 1;
        var i2 = 1;
        var subsA = overviewTeamA.substitutionFrames;
        var subsB = overviewTeamB.substitutionFrames;

        if(subsA.length < 2) subsA = [0, maxFrame];
        if(subsB.length < 2) subsB = [0, maxFrame];

        var frames = [0];

        while(i1 < subsA.length-1 || i2 < subsB.length-1) {
            if(subsA[i1] == subsB[i2]) {
                frames.push(subsA[i1]);
                i1 += 1;
                i2 += 1;
            }
            else if(subsA[i1] < subsB[i2]) {
                frames.push(subsA[i1]);
                i1 += 1;
            }
            else {
                frames.push(subsB[i2]);
                i2 += 1;
            }
        }

        frames.push(maxFrame);

        return frames;
    }
}

function drawEventIcon(x,y, type, cornerIsFlipped) {
    const S = 8; //Size of goal icons
    const C = 6; //Radius circles
    switch(type) {
        case "OFF_TARGET":
            overviewCanvas.drawCircle(x,y,C);
            break;
        case "ON_TARGET":
            overviewCanvas.drawCircle(x,y,C);
            overviewCanvas.drawDot(x,y,2);
            break;
        case "YELLOW":
            overviewCanvas.ctx.fillStyle = "#F9DF4B"
            overviewCanvas.ctx.fillRect(x-4,y-6,8,12);
            break;
        case "RED":
            overviewCanvas.ctx.fillStyle = "#BD3531"
            overviewCanvas.ctx.fillRect(x-4,y-6,8,12);
            break;
        case "GOAL":
            overviewCanvas.drawDot(x,y,C);
            break;
        case "CORNER_L":
            if(cornerIsFlipped) {
                overviewCanvas.drawLine(x+S,y-S,x+S,y+S);
                overviewCanvas.drawLine(x-S,y+S,x+S,y+S);
            }
            else {
                overviewCanvas.drawLine(x-S,y-S,x-S,y+S);
                overviewCanvas.drawLine(x-S,y-S,x+S,y-S);
            }
            break;
        case "CORNER_R":
        case "CORNER":
            if(cornerIsFlipped) {
                overviewCanvas.drawLine(x-S,y-S,x-S,y+S);
                overviewCanvas.drawLine(x-S,y+S,x+S,y+S);
            }
            else {
                overviewCanvas.drawLine(x+S,y-S,x+S,y+S);
                overviewCanvas.drawLine(x-S,y-S,x+S,y-S);
            }
            break;
    }
    overviewCanvas.ctx.fillStyle = "#000"
}

function displayEventList(x0, x1, y0) {
    var minFrameLoc = $( "#slider-range" ).slider( "values", 0 );
    var maxFrameLoc = $( "#slider-range" ).slider( "values", 1 );
    var scaling = new Scaling(minFrameLoc, maxFrameLoc, x0, x1, getSubsitutionFrames([])); 
    var substitutionFramesLoc = getSubsitutionFramesLocal(minFrameLoc, maxFrameLoc, [])

    //Display Event List
    var levels = {0: 0, 1: 5_000, 2: 10_000, 3: 40_000, 4: 70_000, 5: 100_000, 9: 1_000_000}
    var frameDiff = maxFrameLoc-minFrameLoc;

    //Draws event timeline
    if(showEvents || showPossesionInTimeline) {
        for(var k = 0; k < substitutionFramesLoc.length-1; k++) {
            var k1Frame = substitutionFramesLoc[k]+1;
            var k2Frame = substitutionFramesLoc[k+1];
            var k1Pixel = scaling.frameToPixel(k1Frame);
            var k2Pixel = scaling.frameToPixel(k2Frame);

            overviewCanvas.drawLine(k1Pixel, y0, k2Pixel, y0);
        }
    }

    if(showPossesionInTimeline && possessions != null) {
        if(possessions != null) {
            var smoothing = +($('#smoothing_slider').val())

            overviewCanvas.ctx.fillStyle = "#575757"

            for(var k = 0; k < substitutionFramesLoc.length-1; k++) {
                var k1Frame = substitutionFramesLoc[k]+1;
                var k2Frame = substitutionFramesLoc[k+1];
                var k1Pixel = scaling.frameToPixel(k1Frame);
                var k2Pixel = scaling.frameToPixel(k2Frame);

                for(var i = k1Pixel; i < k2Pixel; i += smoothing) {
                    var i2 = i+smoothing;
                    if(i2 > k2Pixel) {
                        i2 = k2Pixel
                    }

                    var frame = scaling.pixelToFrame(i);
                    var frameNext = scaling.pixelToFrame(i2);

                    if(possessions.isInPossesion(frame, frameNext, 1)) {
                        overviewCanvas.ctx.fillRect(i, y0-5, (i2-i)+0.5, 5);
                    }
                    if(possessions.isInPossesion(frame, frameNext, 2)) {
                        overviewCanvas.ctx.fillRect(i, y0, (i2-i)+0.5, 5);
                    }
                }
            }
        }
    }

    if(showEvents && gameData.events != null) {
        for(var i = 0; i < gameData.events.length; i++) {
            var event = gameData.events[i];
            var frame = event.frame;

            var level = 9;

            if(frame > minFrameLoc && frame < maxFrameLoc && frameDiff < levels[level]) {

                var pixel = scaling.frameToPixel(frame);
               
                overviewCanvas.drawLine(pixel, y0-3, pixel, y0+3);

                var direction = (showOverviewForTeam != 1)? +1 : -1;
                var cornerIsFlipped = (showOverviewForTeam == 2)

                if(event.team == 1) {
                    drawEventIcon(pixel, y0+(15*direction), event.type, cornerIsFlipped);
                }
                else {
                    drawEventIcon(pixel, y0-(15*direction), event.type, !cornerIsFlipped);
                }
    
            }        
        }
    }

}

/**
 * A class to help convert canvas pixels to frames and vice versa
 * this code deals with the gaps of the substitutions
 */
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

        if(this.holes.length > 8) {
            this.dist = 5;
        }
        else if(this.holes.length > 3) {
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

            if(i > j) {
                if(i < j+this.dist) {
                    i = j;
                }
                else {
                    i -= this.dist
                }
            };
        }

        return Math.floor( (i-this.x0)*this.scaling+this.minFrameLoc );
    }

    /**
     * 
     * @param {Int} i_temp pixel number
     * @returns true if pixel is not in a gap / hole
     */
    pixelIsActive(i_temp) {
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