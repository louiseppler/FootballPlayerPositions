var scaling = 5;

function drawGame(frame) {

    ctx.fillStyle = "#000"
    ctx.strokeStyle = "#000"

    if(tracking_data == null) {
        logLive("loading tracking data")
        return;
    }

    for(var i = 0; i < 23; i++) {
        var dataLine = tracking_data[1+i+frame*23];

        var x = dataLine[6]
        var y = dataLine[7]

        if(x == "Inf" || y == "Inf") {
            continue;
        }

        drawDot((+x+game.pitch.width/2)*scaling,(+y+game.pitch.height/2)*scaling,3);

        //drawDot((game.pitch.width+x)*scaling,(game.pitch.height+y)*scaling,3);
    }

}