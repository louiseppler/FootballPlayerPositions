var scaling = 6;
var pitchOffsetX = -1;
var pitchOffsetY = -1;

var flipPitch = false; //filps the whole coordinate system

function convertX(x) {
    return pitchOffsetX+((flipPitch*-2+1)*(+x)+gameData.pitch.height/2)*scaling
}

function convertY(y) {
    return pitchOffsetY+((flipPitch*-2+1)*(+y)+gameData.pitch.width/2)*scaling
}

function convertDist(d) {
    return d*scaling;
}

function drawGameSetup() {
    console.log("draw game setup");
    pitchOffsetX = (gameCanvas.width-convertDist(gameData.pitch.height))/2;
    pitchOffsetY = (gameCanvas.height-convertDist(gameData.pitch.width))/2;
}

function drawPlayerLabels(frame) {
    for(var i = 0; i < 23; i++) {
        var dataLine = gameData.tracking[i+frame*23];
        var dataLine2 = gameData.tracking[i+(frame+1)*23];

        var playerId = dataLine[TRACKING_PID];

        var isInTeamA = gameData.players.team1.includes(playerId);
        var isInTeamB = gameData.players.team2.includes(playerId);
        
        if(playerId == "25") {
            var x = 0;
        }

        if(showOtherTeam == false) {
            if(showGraphForTeam == 1 && isInTeamB) continue;
            if(showGraphForTeam == 2 && isInTeamA) continue;
        }

        var x1 = +dataLine[TRACKING_X]
        var y1 = +dataLine[TRACKING_Y]
        var x2 = +dataLine2[TRACKING_X]
        var y2 = +dataLine2[TRACKING_Y]

        var x = x1+(x2-x1)*frameDelta;
        var y = y1+(y2-y1)*frameDelta;

        if(showGraphForTeam == 0 || (showGraphForTeam == 1 && isInTeamA) || (showGraphForTeam == 2 && isInTeamB)) {
            gameCanvas.ctx.fillStyle = "#FFF"
        }
        else {
            //case outline colors
            gameCanvas.ctx.fillStyle = "#575757"
        }

        if(showGoalKeepers == false && gameData.players.goalKeepers.includes(playerId)) continue;

        if(showGraphForTeam != 0 && gameData.players.goalKeepers.includes(playerId)) {
            gameCanvas.ctx.fillStyle = "#575757"
        }

        gameCanvas.fillTextCenter(getShirtNumberLabel(playerId), convertX(y), convertY(x)+3)
    }
}

function drawBall(frame) {
    for(var i = 0; i < 23; i++) {
        var dataLine = gameData.tracking[i+frame*23];
        var dataLine2 = gameData.tracking[i+(frame+1)*23];

        var playerId = dataLine[TRACKING_PID];

        if(playerId != "-1") continue;
        
        var isInTeamA = gameData.players.team1.includes(playerId);
        var isInTeamB = gameData.players.team2.includes(playerId);

        if(dataLine[TRACKING_X] == "Inf" || dataLine[TRACKING_Y] == "Inf") {
            continue;
        }


        var x = dataLine[TRACKING_X]
        var y = dataLine[TRACKING_Y]
        var z = +(dataLine[TRACKING_Z])

        var x1 = +dataLine[TRACKING_X]
        var y1 = +dataLine[TRACKING_Y]
        var z1 = +dataLine[TRACKING_Z]
        var x2 = +dataLine2[TRACKING_X]
        var y2 = +dataLine2[TRACKING_Y]
        var z2 = +dataLine2[TRACKING_Z]

        var x = x1+(x2-x1)*frameDelta;
        var y = y1+(y2-y1)*frameDelta;
        var z = z1+(z2-z1)*frameDelta;

        gameCanvas.ctx.fillStyle = grayScale(Math.min(z/2,0.5));

        gameCanvas.drawDot(convertX(y),convertY(x),4);

    }
}

function getIsSecondHalf(frame) {
    return (gameData.tracking[0+frame*23][TRACKING_HALF] != "One")
}

function getGoalKeepers(frame) {
    var points = [];

    for(var i = 0; i < 23; i++) {
        var dataLine = gameData.tracking[i+frame*23];
        var dataLine2 = gameData.tracking[i+(frame+1)*23];

        var playerId = dataLine[TRACKING_PID];
        var x1 = +dataLine[TRACKING_X]
        var y1 = +dataLine[TRACKING_Y]
        var x2 = +dataLine2[TRACKING_X]
        var y2 = +dataLine2[TRACKING_Y]

        var x = x1+(x2-x1)*frameDelta;
        var y = y1+(y2-y1)*frameDelta;

        var isInTeamA = gameData.players.team1.includes(playerId);
        var isInTeamB = gameData.players.team2.includes(playerId);

        if(gameData.players.goalKeepers.includes(playerId)) {
            if(isInTeamA) {
                points.push([convertX(y),convertY(x),1])
            }
            else {
                points.push([convertX(y),convertY(x),2])
            }
        }
    }

    return points;
}

function getGamePoints(frame, team) {
    var points = [];

    var isReversed = false;

    var playerIDs = [];

    if((gameData.tracking[0+frame*23][TRACKING_HALF] != "One") && team == 1) isReversed = true;
    if((gameData.tracking[0+frame*23][TRACKING_HALF] == "One") && team == 2) isReversed = true;

    for(var i = 0; i < 23; i++) {
        var dataLine = gameData.tracking[i+frame*23];
        var dataLine2 = gameData.tracking[i+(frame+1)*23];

        if(dataLine2 == null) {
            var x = maxFrame;
        }

        var playerId = dataLine[TRACKING_PID];
        var x1 = +dataLine[TRACKING_X]
        var y1 = +dataLine[TRACKING_Y]
        var x2 = +dataLine2[TRACKING_X]
        var y2 = +dataLine2[TRACKING_Y]

        var x = x1+(x2-x1)*frameDelta;
        var y = y1+(y2-y1)*frameDelta;

        if(gameData.players.goalKeepers.includes(playerId)) continue;

        if(team == 1 && gameData.players.team1.includes(playerId)) {
            points.push(convertX(y),convertY(x));
            playerIDs.push(playerId)
        }
        if(team == 2 && gameData.players.team2.includes(playerId)) {
            points.push(convertX(y),convertY(x));
            playerIDs.push(playerId)
        }
    }

    if(flipPitch) {
        isReversed = !isReversed;
    }

    return [points, isReversed, playerIDs];
}

function drawPitch() {
    //source: https://upload.wikimedia.org/wikipedia/commons/b/b3/Soccer_pitch_dimensions.png

    gameCanvas.ctx.fillStyle = "#8C8C8C"
    gameCanvas.ctx.strokeStyle = "#8C8C8C"

    var height = gameData.pitch.height;
    var width = gameData.pitch.width;

    gameCanvas.drawLine(convertX(-height/2),convertY(0),convertX(height/2),convertY(0));

    //Touch line (outside line)
    gameCanvas.drawLine(convertX(-height/2),convertY(-width/2),convertX(height/2),convertY(-width/2));
    gameCanvas.drawLine(convertX(-height/2),convertY(width/2),convertX(height/2),convertY(width/2));
    gameCanvas.drawLine(convertX(-height/2),convertY(-width/2),convertX(-height/2),convertY(width/2));
    gameCanvas.drawLine(convertX(height/2),convertY(-width/2),convertX(height/2),convertY(width/2));


    var h0 = -height/2;
    var h1 = height/2;
    var w0 = -width/2;
    var w1 = width/2;

    //Goal Posts
    gameCanvas.drawLine(convertX(-3.66),convertY(w0)-3,convertX(-3.66),convertY(w0)+3);
    gameCanvas.drawLine(convertX(+3.66),convertY(w0)-3,convertX(+3.66),convertY(w0)+3);
    gameCanvas.drawLine(convertX(-3.66),convertY(w1)-3,convertX(-3.66),convertY(w1)+3);
    gameCanvas.drawLine(convertX(+3.66),convertY(w1)-3,convertX(+3.66),convertY(w1)+3);

    //Goal Area
    gameCanvas.drawLine(convertX(9.16),convertY(w0+5.5),convertX(-9.16),convertY(w0+5.5));
    gameCanvas.drawLine(convertX(9.16),convertY(w0),convertX(9.16),convertY(w0+5.5));
    gameCanvas.drawLine(convertX(-9.16),convertY(w0),convertX(-9.16),convertY(w0+5.5));

    gameCanvas.drawLine(convertX(9.16),convertY(w1-5.5),convertX(-9.16),convertY(w1-5.5));
    gameCanvas.drawLine(convertX(9.16),convertY(w1),convertX(9.16),convertY(w1-5.5));
    gameCanvas.drawLine(convertX(-9.16),convertY(w1),convertX(-9.16),convertY(w1-5.5));

    //Penalty Area
    gameCanvas.drawLine(convertX(20.16),convertY(w0+16.5),convertX(-20.16),convertY(w0+16.5));
    gameCanvas.drawLine(convertX(20.16),convertY(w0),convertX(20.16),convertY(w0+16.5));
    gameCanvas.drawLine(convertX(-20.16),convertY(w0),convertX(-20.16),convertY(w0+16.5));

    gameCanvas.drawLine(convertX(20.16),convertY(w1-16.5),convertX(-20.16),convertY(w1-16.5));
    gameCanvas.drawLine(convertX(20.16),convertY(w1),convertX(20.16),convertY(w1-16.5));
    gameCanvas.drawLine(convertX(-20.16),convertY(w1),convertX(-20.16),convertY(w1-16.5));

    //center circle
    gameCanvas.drawCircle(convertX(0),convertY(0),convertDist(9.15))

    const radius = convertDist(9.15);

    gameCanvas.ctx.beginPath();
    gameCanvas.ctx.arc(convertX(0),convertY(w0+(flipPitch*-2+1)*11), radius, Math.PI/2-0.92592839678, Math.PI/2+0.92592839678);
    gameCanvas.ctx.stroke();

    gameCanvas.ctx.beginPath();
    gameCanvas.ctx.arc(convertX(0),convertY(w1-(flipPitch*-2+1)*11), radius, -Math.PI/2-0.92592839678, -Math.PI/2+0.92592839678);
    gameCanvas.ctx.stroke();

    gameCanvas.drawDot(convertX(0),convertY(0),2)
    gameCanvas.drawDot(convertX(0),convertY(w0+11),2)
    gameCanvas.drawDot(convertX(0),convertY(w1-11),2)

    //gameCanvas.drawCircle(convertX(0),convertY(w0+11),convertDist(9.15))



    // gameCanvas.drawLine(convertX(),convertY(),convertX(),convertY());
    // gameCanvas.drawLine(convertX(),convertY(),convertX(),convertY());
    // gameCanvas.drawLine(convertX(),convertY(),convertX(),convertY());
    // gameCanvas.drawLine(convertX(),convertY(),convertX(),convertY());
    // gameCanvas.drawLine(convertX(),convertY(),convertX(),convertY());
    // gameCanvas.drawLine(convertX(),convertY(),convertX(),convertY());

}