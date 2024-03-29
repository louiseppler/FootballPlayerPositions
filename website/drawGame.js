var scaling = 5;

function convertX(x) {
    return (+x+game.pitch.width/2)*scaling
}

function convertY(y) {
    return (+y+game.pitch.height/2)*scaling
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

        
        if(showTeamA == false && game.players.teamA.includes(playerId)) continue;
        if(showTeamB == false && game.players.teamB.includes(playerId)) continue;
        
        var x = dataLine[6]
        var y = dataLine[7]

        if(x == "Inf" || y == "Inf") {
            continue;
        }

        gameCanvas.drawDot(convertX(x),convertY(y),3);
        if(showPlayerLabels) gameCanvas.ctx.fillText("" + playerId, convertX(x), convertY(y)-8);        


        //drawDot((game.pitch.width+x)*scaling,(game.pitch.height+y)*scaling,3);
    }
}

function getGamePoints(frame, team) {
    if(tracking_data == null) return null

    var points = [];

    for(var i = 0; i < 23; i++) {
        var dataLine = tracking_data[1+i+frame*23];

        var playerId = dataLine[5];
        var x = dataLine[6]
        var y = dataLine[7]

        if(game.goalKeepers.includes(playerId)) continue;

        if(team == 1 && game.players.teamA.includes(playerId)) {
            points.push(convertX(x),convertY(y));
        }
        if(team == 2 && game.players.teamB.includes(playerId)) {
            points.push(convertX(x),convertY(y));
        }
    }

    return points;
}