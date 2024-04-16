var scaling = 7;

function convertX(x) {
    return 10+(+x+game.pitch.height/2)*scaling
}

function convertY(y) {
    return 10+(+y+game.pitch.width/2)*scaling
}

function convertDist(d) {
    return d*scaling;
}

function drawGame(frame) {

    gameCanvas.ctx.fillStyle = "#000"
    gameCanvas.ctx.strokeStyle = "#000"

    if(tracking_data == null) {
        gameCanvas.logLive("loading tracking data")
        return;
    }

    for(var i = 0; i < 23; i++) {
        var dataLine = tracking_data[1+i+frame*23];

        var playerId = dataLine[5];

        
        var isInTeamA = game.players.teamA.includes(playerId);
        var isInTeamB = game.players.teamB.includes(playerId);

        if(showTeamA == false && isInTeamA) continue;
        if(showTeamB == false && isInTeamB) continue;
        
        var x = dataLine[6]
        var y = dataLine[7]

        if(x == "Inf" || y == "Inf") {
            continue;
        }

        if(isInTeamA) gameCanvas.ctx.fillStyle = "#3395AB"
        if(isInTeamB) gameCanvas.ctx.fillStyle = "#B73B92"

        if((showGraphForTeam == 1 && isInTeamA) || (showGraphForTeam == 2 && isInTeamB)) {}
        else gameCanvas.drawDot(convertX(y),convertY(x),4);

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

        
        var isInTeamA = game.players.teamA.includes(playerId);
        var isInTeamB = game.players.teamB.includes(playerId);

        if(showTeamA == false && isInTeamA) continue;
        if(showTeamB == false && isInTeamB) continue;
        
        var x = dataLine[6]
        var y = dataLine[7]

        if(x == "Inf" || y == "Inf") {
            continue;
        }


        if(showPlayerLabels) {
            if((showGraphForTeam == 1 && isInTeamA) || (showGraphForTeam == 2 && isInTeamB)) {
                gameCanvas.ctx.fillStyle = "#FFF"
                gameCanvas.ctx.fillText("" + game.getShirtNumberLabel(playerId), convertX(y)-5, convertY(x)+3); 
            }
            else {
                gameCanvas.ctx.fillStyle = "#8C8C8C"
                gameCanvas.ctx.fillText("" + game.getShirtNumberLabel(playerId), convertX(y)+4, convertY(x)-4); 
            }    
        }
    }
}

function getGamePoints(frame, team) {
    if(tracking_data == null) return [null, null]

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

        if(game.goalKeepers.includes(playerId)) continue;

        if(team == 1 && game.players.teamA.includes(playerId)) {
            points.push(convertX(y),convertY(x));
            playerIDs.push(playerId)
        }
        if(team == 2 && game.players.teamB.includes(playerId)) {
            points.push(convertX(y),convertY(x));
            playerIDs.push(playerId)
        }
    }

    return [points, isReversed, playerIDs];
}

function drawPitch() {
    //source: https://upload.wikimedia.org/wikipedia/commons/b/b3/Soccer_pitch_dimensions.png

    gameCanvas.ctx.fillStyle = "#000"
    gameCanvas.ctx.strokeStyle = "#000"

    gameCanvas.drawLine(convertX(-game.pitch.height/2),convertY(0),convertX(game.pitch.height/2),convertY(0));

    //Touch line (outside line)
    gameCanvas.drawLine(convertX(-game.pitch.height/2),convertY(-game.pitch.width/2),convertX(game.pitch.height/2),convertY(-game.pitch.width/2));
    gameCanvas.drawLine(convertX(-game.pitch.height/2),convertY(game.pitch.width/2),convertX(game.pitch.height/2),convertY(game.pitch.width/2));
    gameCanvas.drawLine(convertX(-game.pitch.height/2),convertY(-game.pitch.width/2),convertX(-game.pitch.height/2),convertY(game.pitch.width/2));
    gameCanvas.drawLine(convertX(game.pitch.height/2),convertY(-game.pitch.width/2),convertX(game.pitch.height/2),convertY(game.pitch.width/2));


    var h0 = -game.pitch.height/2;
    var h1 = game.pitch.height/2;
    var w0 = -game.pitch.width/2;
    var w1 = game.pitch.width/2;

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