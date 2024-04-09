var scaling = 7;

function convertX(x) {
    return 10+(+x+game.pitch.height/2)*scaling
}

function convertY(y) {
    return 10+(+y+game.pitch.width/2)*scaling
}

function drawGame(frame) {

    drawPitch();

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

        gameCanvas.drawDot(convertX(y),convertY(x),3);
        if(showPlayerLabels) gameCanvas.ctx.fillText("" + game.getShirtNumberLabel(playerId), convertX(y), convertY(x)-8);        

        //drawDot((game.pitch.width+x)*scaling,(game.pitch.height+y)*scaling,3);
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
    gameCanvas.ctx.fillStyle = "#000"
    gameCanvas.ctx.strokeStyle = "#000"

    gameCanvas.drawLine(convertX(-game.pitch.height/2),convertY(0),convertX(game.pitch.height/2),convertY(0));

    gameCanvas.drawLine(convertX(-game.pitch.height/2),convertY(-game.pitch.width/2),convertX(game.pitch.height/2),convertY(-game.pitch.width/2));
    gameCanvas.drawLine(convertX(-game.pitch.height/2),convertY(game.pitch.width/2),convertX(game.pitch.height/2),convertY(game.pitch.width/2));
    gameCanvas.drawLine(convertX(-game.pitch.height/2),convertY(-game.pitch.width/2),convertX(-game.pitch.height/2),convertY(game.pitch.width/2));
    gameCanvas.drawLine(convertX(game.pitch.height/2),convertY(-game.pitch.width/2),convertX(game.pitch.height/2),convertY(game.pitch.width/2));

}