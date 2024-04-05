var rolesTeamA = null
var substitutionFrames = [];


//dictionary mapping player id to drawn index
var playerIndices = {};

function computeAllRoles() {
    rolesTeamA = [];
    substitutionFrames = [];

    substitutionFrames.push(0);

    console.log("Starting role computation");

    var prevRoles = []

    for(var i = minFrame; i < maxFrame-2; i++) {

        const [points, isReversed, playerIDs] = getGamePoints(i, 1);
        if(points == null) return;
        shapeGraphMain(points, isReversed, false, playerIDs);

        var hasSubstitution = false;

        for(var j = 0; j < roles.length; j++) {
             if(prevRoles.length < roles.length) continue;

             roles[j].updateRoleCount(prevRoles[j].roleCount);

             if(roles[j].playerID != prevRoles[j].playerID) {   
                hasSubstitution = true;
             }
             if(roles[j].playerID == null) {
                hasSubstitution = true;

             }
        }

        if(i % Math.round(maxFrame/10) == 0) {
            console.log("" + Math.round(i/maxFrame*100) + "%");
        }

        // if(i % 10000 == 0) {
        //     console.log("at frame " + i + " ");
        //     console.log(prevRoles.map((x) => x.playerID));
        //     console.log(roles.map((x) => x.playerID));
        // }

        if(hasSubstitution) {
            substitutionFrames.push(i);
        }

        prevRoles = roles.slice();
        rolesTeamA.push(roles.slice())
    }   

    substitutionFrames.push(maxFrame-2);

    console.log("Computed Roles!");
    console.log("substitutionFrames " + substitutionFrames);
    computePlayerOrdering(substitutionFrames);
}

/**
 * Computes `playerIndices` to determine in which order the players should be displayed
 * @param {*} substitutionFrames Array of all substitutionFrame numbers including 0, and maxFrame
 */
function computePlayerOrdering(substitutionFrames) {
    console.log("computePlayerOrdering");
    var playerPair = [];
    var firstSubIndex = substitutionFrames[1];

    // === Initial Sorting ===

    console.log("#1");

    for(var j = 0; j < rolesTeamA[0].length; j++) {
        var roleNr = Role.getMostFrequentRoleIndex(rolesTeamA[0][j].roleCount, rolesTeamA[firstSubIndex][j].roleCount);
        playerPair.push([rolesTeamA[0][j].playerID, roleNr]);
    }

    console.log("#2");

    playerPair.sort((a, b) => a[1] - b[1]);

    for(var i = 0; i < playerPair.length; i++) {
        playerIndices[playerPair[i][0]] = i;
    }

    console.log("playerIndices");
    console.log(playerIndices);

    // === for each substitution ===

    for(var i = 1; i < substitutionFrames.length-1; i++) {
        var framePrev = substitutionFrames[i-1]+1;
        var frame = substitutionFrames[i];
        var frameNext = substitutionFrames[i+1]-1;

        var newPlayers = rolesTeamA[frame+1].map((x) => x.playerID);

        var oldIndices = [];
        var freeIndices = [];
        // for(var j = 0; j < rolesTeamA[frame+1].length; j++) {indicesUsed.push(false); }


        for(var j = 0; j < rolesTeamA[frame-1].length; j++) {
            var playerID = rolesTeamA[frame-1][j].playerID
            if(newPlayers.includes(playerID) == false) {
                oldIndices.push([j,playerIndices[playerID]]);
            }
        }

        for(var j = 0; j < rolesTeamA[frame+1].length; j++) {
            var playerId = rolesTeamA[frame+1][j].playerID
            var index = playerIndices [playerId];
            if(index == null) {
                freeIndices.push([j, playerId])
            }

        }

        // a matrix representing a score of similarity if
        // player would take player k would take position j (scoreMatrix[j][k])
        var scoreMatrix = [];
    
        //only needs to be computed if several substitutions
        if(oldIndices.length > 1) {
            for(var j = 0; j < oldIndices.length; j++) {
                scoreMatrix.push([]);
                for(var k = 0; k < freeIndices.length; k++) {
                    var a1 = oldIndices[j][0];
                    var a2 = freeIndices[k][0];
                    var rolePrev = Role.getMostFrequentRoleIndex(rolesTeamA[framePrev][a1].roleCount,rolesTeamA[frame+1][a1].roleCount)
                    var roleNext = Role.getMostFrequentRoleIndex(rolesTeamA[frame+1][a2].roleCount, rolesTeamA[frameNext][a2].roleCount)
                    var score = Role.similarity(rolePrev,roleNext);

                    scoreMatrix[j].push(score);
                }
            }
        }
         console.log("score matrix");
         console.log(scoreMatrix);

        while(scoreMatrix.length > 1 && scoreMatrix[0].length > 1) {
            var minVal = 1000;
            var minJ = 0;
            var minK = 0;

            for(var j = 0; j < scoreMatrix.length; j++) {
                for(var k = 0; k < scoreMatrix[j].length; k++) {
                    var val = scoreMatrix[j][k];
                    if(val < minVal) {
                        minVal = val;
                        minJ = j;
                        minK = k;
                    }
                }
            }

            playerIndices[freeIndices[minK][1]] = oldIndices[minJ][1];

            scoreMatrix.splice(minK, 1); //remove minK
            for(var j = 0; j < scoreMatrix.length; j++) {
                scoreMatrix[j].splice(minJ, 1); //remove minJ
            }
            freeIndices.splice(minK,1);
            oldIndices.splice(minJ,1);


            console.log(scoreMatrix);
        }

        //for the last case, not scores need to be compared
        playerIndices[freeIndices[0][1]] = oldIndices[0][1];
    }

    console.log("playerIndices");
    console.log(playerIndices);
}

function draw2() {
    if(overviewCanvas == null) return;

    overviewCanvas.clearCanvas();
    overviewCanvas.logLive("Computing Data")
    
    
    if (rolesTeamA == null) return;

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
        for(var j = 0; j < rolesTeamA[minFrameLoc].length; j++) {

            if(rolesTeamA[maxFrameLoc-10].length <= j) continue;
            var [avgX, avgY] = Role.getMostFrequentRole(rolesTeamA[minFrameLoc][j].roleCount, rolesTeamA[maxFrameLoc-10][j].roleCount);

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

        for(var j = 0; j < rolesTeamA[frame].length; j++) {

            var pos = playerIndices[rolesTeamA[frame][j].playerID];

            if(debugFlagSet) {
            }

            if(frame > frameNr) { 
                if(debugFlagSet) console.log("role: " + rolesTeamA[frame][j].x_role + " " + rolesTeamA[frame][j].y_role);
            }

            overviewCanvas.ctx.strokeStyle = rolesTeamA[frame][j].getColorX();
            overviewCanvas.drawLine(i, y0+pos*ys, i, y0+pos*ys+ys*(0.45-0.225*overviewIsExpanded));
            overviewCanvas.ctx.strokeStyle = rolesTeamA[frame][j].getColorY();
            overviewCanvas.drawLine(i, y0+pos*ys+ys*(0.45+0.225*overviewIsExpanded), i, y0+pos*ys+ys*0.9);

            //avg_diff += Math.abs(averagesX[j]-rolesTeamA[frame][j].x_role);
            //avg_diff += Math.abs(averagesX[j]-rolesTeamA[frame][j].y_role);
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
    for(var j = 0; j < rolesTeamA[minFrameLoc].length; j++) {

        var pos = playerIndices[rolesTeamA[minFrameLoc][j].playerID];

        overviewCanvas.ctx.fillText(rolesTeamA[minFrameLoc][j].playerID, x0-50, y0+ys*pos+10);
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