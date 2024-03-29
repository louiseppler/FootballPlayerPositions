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

        
        var isInTeamA = game.players.teamA.includes(playerId);
        var isInTeamB = game.players.teamB.includes(playerId);

        if(showTeamA == false && isInTeamA) continue;
        if(showTeamB == false && isInTeamB) continue;
        
        var x = dataLine[6]
        var y = dataLine[7]

        if(x == "Inf" || y == "Inf") {
            continue;
        }

        if(isInTeamA) gameCanvas.ctx.fillStyle = "blue"
        if(isInTeamB) gameCanvas.ctx.fillStyle = "red"

        gameCanvas.drawDot(convertX(x),convertY(y),3);
        if(showPlayerLabels) gameCanvas.ctx.fillText("" + playerId, convertX(x), convertY(y)-8);        


        //drawDot((game.pitch.width+x)*scaling,(game.pitch.height+y)*scaling,3);
    }
}

function getGamePoints(frame, team) {
    if(tracking_data == null) return [null, null]

    var points = [];

    var isReversed = false;

    if((tracking_data[1+0+frame*23][2] != "One") && team == 1) isReversed = true;
    if((tracking_data[1+0+frame*23][2] == "One") && team == 2) isReversed = true;

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

    return [points, isReversed];
}