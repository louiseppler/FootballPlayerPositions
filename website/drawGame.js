var scaling = 6;
var pitchOffsetX = -1;
var pitchOffsetY = -1;

function convertX(x) {
    return pitchOffsetX+(+x+gameData.pitch.height/2)*scaling
}

function convertY(y) {
    return pitchOffsetY+(+y+gameData.pitch.width/2)*scaling
}

function convertDist(d) {
    return d*scaling;
}

function drawGameSetup() {
    console.log("draw game setup");
    pitchOffsetX = (gameCanvas.width-convertDist(gameData.pitch.height))/2;
    pitchOffsetY = (gameCanvas.height-convertDist(gameData.pitch.width))/2;
}

function drawGame(frame) {

    gameCanvas.ctx.fillStyle = "#000"
    gameCanvas.ctx.strokeStyle = "#000"

    if(gameData == null) return;
    if(tracking_data == null) {
        return;
    }

    for(var i = 0; i < 23; i++) {
        var dataLine = tracking_data[1+i+frame*23];

        var playerId = dataLine[5];

        
        var isInTeamA = gameData.players.team1.includes(playerId);
        var isInTeamB = gameData.players.team2.includes(playerId);

        if(showTeamA == false && isInTeamA) continue;
        if(showTeamB == false && isInTeamB) continue;
        
        var x = dataLine[6]
        var y = dataLine[7]

        if(x == "Inf" || y == "Inf") {
            continue;
        }

        if(isInTeamA) gameCanvas.ctx.fillStyle = "#3395AB"
        if(isInTeamB) gameCanvas.ctx.fillStyle = "#B73B92"

        if(showGraphForTeam == 0) {
            if((showGraphForTeam == 1 && isInTeamA) || (showGraphForTeam == 2 && isInTeamB)) {}
            else gameCanvas.drawDot(convertX(y),convertY(x),4);
        }

        //drawDot((game.pitch.width+x)*scaling,(game.pitch.height+y)*scaling,3);
    }
}

function drawPlayerLabels(frame) {
    if(tracking_data == null) {
        return
    }
    for(var i = 0; i < 23; i++) {
        var dataLine = tracking_data[1+i+frame*23];

        var playerId = dataLine[5];

        var isInTeamA = gameData.players.team1.includes(playerId);
        var isInTeamB = gameData.players.team2.includes(playerId);
        
        if(playerId == "25") {
            var x = 0;
        }

        if(showOtherTeam == false) {
            if(showGraphForTeam == 1 && isInTeamB) return;
            if(showGraphForTeam == 2 && isInTeamA) return;
        }

        var x = dataLine[6]
        var y = dataLine[7]

        if(x == "Inf" || y == "Inf") {
            continue;
        }

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
    if(tracking_data == null) {
        return
    }
    for(var i = 0; i < 23; i++) {
        var dataLine = tracking_data[1+i+frame*23];

        var playerId = dataLine[5];

        if(playerId != "-1") continue;
        
        var isInTeamA = gameData.players.team1.includes(playerId);
        var isInTeamB = gameData.players.team2.includes(playerId);

        var x = dataLine[6]
        var y = dataLine[7]
        var z = +(dataLine[8])

        if(x == "Inf" || y == "Inf") {
            continue;
        }

        gameCanvas.ctx.fillStyle = grayScale(Math.min(z/2,0.5));

        gameCanvas.drawDot(convertX(y),convertY(x),4);

    }
}

function getIsSecondHalf(frame) {
    if(tracking_data == null) return false;

    return (tracking_data[1+0+frame*23][2] != "One")
}

function getGoalKeepers(frame) {
    if(tracking_data == null) return null

    var points = [];

    for(var i = 0; i < 23; i++) {
        var dataLine = tracking_data[1+i+frame*23];

        var playerId = dataLine[5];
        var x = dataLine[6]
        var y = dataLine[7]

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
    if(tracking_data == null) return [null, null, null]

    var points = [];

    var isReversed = false;

    var playerIDs = [];

    if((tracking_data[1+0+frame*23][2] != "One") && team == 1) isReversed = true;
    if((tracking_data[1+0+frame*23][2] == "One") && team == 2) isReversed = true;

    for(var i = 0; i < 23; i++) {
        var dataLine = tracking_data[1+i+frame*23];

        var playerId = dataLine[5];
        var x = dataLine[6]
        var y = dataLine[7]

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
    gameCanvas.ctx.arc(convertX(0),convertY(w0+11), radius, Math.PI/2-0.92592839678, Math.PI/2+0.92592839678);
    gameCanvas.ctx.stroke();

    gameCanvas.ctx.beginPath();
    gameCanvas.ctx.arc(convertX(0),convertY(w1-11), radius, -Math.PI/2-0.92592839678, -Math.PI/2+0.92592839678);
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