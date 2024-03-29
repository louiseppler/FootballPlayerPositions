var rolesTeamA = null

function computeAllRoles() {
    rolesTeamA = [];

    console.log("Starting role computation");

    for(var i = minFrame; i < maxFrame-2; i++) {
        const [points, isReversed] = getGamePoints(i, 1);
        if(points == null) return;
        shapeGraphMain(points, isReversed, false);

        rolesTeamA.push(roles.slice())
    }   

    console.log("Computed Roles!");
}


function draw2() {
    if(overviewCanvas == null) return;

    overviewCanvas.clearCanvas();
    overviewCanvas.logLive("Computing Data")

    if (rolesTeamA == null) return;


    var minFrameLoc = $( "#slider-range" ).slider( "values", 0 );
    var maxFrameLoc = $( "#slider-range" ).slider( "values", 1 );

    overviewCanvas.logLive("We are ready")

    var x0 = 50;
    var x1 = overviewCanvas.width-50;

    var y0 = 30;
    var ys = 40;

    var scaling = (maxFrameLoc-minFrameLoc) / (x1-x0);

    var currentX = 1/scaling*(frameNr-minFrameLoc)+x0;

    overviewCanvas.ctx.strokeStyle = "black";
    overviewCanvas.drawLine(currentX, 0, currentX, overviewCanvas.height)


    for(var i = x0; i < x1; i++) {
        var frame = Math.floor(scaling*(i-x0)+minFrameLoc);

        for(var j = 0; j < rolesTeamA[frame].length; j++) {

            if(debugFlagSet) {
            }

            if(frame > frameNr) { 
                if(debugFlagSet) console.log("role: " + rolesTeamA[frame][j].x_role + " " + rolesTeamA[frame][j].y_role);
            }

            overviewCanvas.ctx.strokeStyle = rolesTeamA[frame][j].getColorX();
            overviewCanvas.drawLine(i, y0+j*ys, i, y0+j*ys+ys*0.45);
            overviewCanvas.ctx.strokeStyle = rolesTeamA[frame][j].getColorY();
            overviewCanvas.drawLine(i, y0+j*ys+ys*0.45, i, y0+j*ys+ys*0.9);
        }

        if(frame > frameNr) { 
            debugFlagSet = false;
        }

 
    }
}

function empty() {}