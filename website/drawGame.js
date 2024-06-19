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
    //scaling = Math.min(gameCanvas.height/gameData.pitch.height*0.5, gameCanvas.width/gameData.pitch.width*0.5);

    var scalingA = (gameCanvas.height-30)/gameData.pitch.width
    var scalingB = (gameCanvas.width-30)/gameData.pitch.height
    scaling = Math.min(scalingA,scalingB);

    pitchOffsetX = (gameCanvas.width-convertDist(gameData.pitch.height))/2;
    pitchOffsetY = (gameCanvas.height-convertDist(gameData.pitch.width))/2;

}

function drawPlayerLabels(frame) {
    var dataLine = gameData.tracking[frame];
    var dataLine2 = gameData.tracking[frame+1];

    for(var i = 0; i < 23; i++) {
        var object1 = dataLine.objects[i];
        var object2 = dataLine2.objects[i];

        var playerId = object1.id;

        var isInTeam1 = gameData.players.team1.includes(playerId);
        var isInTeam2 = gameData.players.team2.includes(playerId);
        
        if(playerId == "25") {
            var x = 0;
        }

        if(showOtherTeam == false) {
            if(showGraphForTeam == 1 && isInTeam2) continue;
            if(showGraphForTeam == 2 && isInTeam1) continue;
        }

        var [x,y] = getCoordinates(object1, object2);

        if(showGraphForTeam == 0 || (showGraphForTeam == 1 && isInTeam1) || (showGraphForTeam == 2 && isInTeam2)) {
            gameCanvas.ctx.fillStyle = "#FFF"
            if(showGraphForTeam == 0) {
                if(isInTeam1) {
                    gameCanvas.ctx.fillStyle = gameData.homeTeam.colorNumber;
                }
                else {
                    gameCanvas.ctx.fillStyle = gameData.awayTeam.colorNumber;
                }
            }
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
    var dataLine = gameData.tracking[frame];
    var dataLine2 = gameData.tracking[frame+1];

    for(var i = 0; i < 23; i++) {
        var object1 = dataLine.objects[i];
        var object2 = dataLine2.objects[i];
        
        var playerId = object1.id;

        if(playerId != "-1") continue;

        var [x,y] = getCoordinates(object1, object2);
        var z1 = +(object1.z)
        var z2 = +(object1.z)

        var z = z1+(z2-z1)*frameDelta;

        gameCanvas.ctx.fillStyle = grayScale(Math.min(z/2,0.5));

        gameCanvas.drawDot(convertX(y),convertY(x),4);

    }
}

function getIsSecondHalf(frame) {
    if(gameData.periods.length >= 2) {
        if(gameData.periods[1].start < frame && frame <= gameData.periods[1].end) {
            return true;
        }
    }

    if(gameData.periods.length >= 4) {
        if(gameData.periods[3].start < frame && frame <= gameData.periods[3].end) {
            return true;
        }
    }

    //return false;
    return (frame > 69724); //TODO
    return false;
    return (gameData.tracking[0+frame*23][TRACKING_HALF] != "One")
}

function getGoalKeepers(frame) {
    var points = [];

    var dataLine = gameData.tracking[frame];
    var dataLine2 = gameData.tracking[frame+1];

    for(var i = 0; i < 23; i++) {
        var object1 = dataLine.objects[i];
        var object2 = dataLine2.objects[i];

        var playerId = object1.id;
        var [x,y] = getCoordinates(object1, object2);

        var isInTeam1 = gameData.players.team1.includes(playerId);
        var isInTeam2 = gameData.players.team2.includes(playerId);

        if(gameData.players.goalKeepers.includes(playerId)) {
            if(isInTeam1) {
                points.push([convertX(y),convertY(x),1])
            }
            else {
                points.push([convertX(y),convertY(x),2])
            }
        }
    }

    return points;
}

function getCoordinates(object1, object2) {
    var x1 = +object1.h
    var y1 = +object1.v
    var x2 = +object2.h
    var y2 = +object1.v

    var x = x1+(x2-x1)*frameDelta;
    var y = y1+(y2-y1)*frameDelta;

    return [x,y]
}

function getGamePoints(frame, team) {
    var points = [];

    var isReversed = false;

    var playerIDs = [];

    if(getIsSecondHalf(frame) && team == 1) isReversed = true;
    if(getIsSecondHalf(frame) && team == 2) isReversed = true;

    var dataLine = gameData.tracking[frame];
    var dataLine2 = gameData.tracking[frame+1];

    for(var i = 0; i < 23; i++) {
        var object1 = dataLine.objects[i];
        var object2 = dataLine2.objects[i];

        if(dataLine2 == null) {
            var x = maxFrame;
        }

        var playerId = object1.id;
        var [x,y] = getCoordinates(object1, object2);
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