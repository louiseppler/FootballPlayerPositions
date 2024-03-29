var rolesTeamA = null

function computeAllRoles() {
    rolesTeamA = [];

    console.log("Starting role computation");

    for(var i = minFrame; i < maxFrame-2; i++) {
        const points = getGamePoints(i, 1);
        if(points == null) return;
        shapeGraphMain(points, false);

        rolesTeamA.push(roles.slice())
    }   

    console.log("Computed Roles!");
}


function draw2() {
    if(overviewCanvas == null) return;

    overviewCanvas.clearCanvas();
    overviewCanvas.logLive("Hello World")

    if (rolesTeamA == null) return;


    overviewCanvas.logLive("We are ready")

    var x0 = 50;
    var x1 = overviewCanvas.width-50;

    var y0 = 30;
    var ys = 40;

    var scaling = (maxFrame-minFrame) / (x1-x0);

    for(var i = x0; i < x1; i++) {
        var frame = Math.floor(scaling*(i-x0)+minFrame);

        for(var j = 0; j < rolesTeamA[frame].length; j++) {

            if(debugFlagSet) {
            }

            var xtemp = 0;
            if(frame > frameNr) { 
                if(debugFlagSet) console.log("role: " + rolesTeamA[frame][j].x_role + " " + rolesTeamA[frame][j].y_role);
                xtemp = 10;
            }

            overviewCanvas.ctx.strokeStyle = rolesTeamA[frame][j].getColorY();
            overviewCanvas.drawLine(xtemp+i, y0+j*ys, xtemp+i, y0+j*ys+ys*0.45);
            overviewCanvas.ctx.strokeStyle = rolesTeamA[frame][j].getColorX();
            overviewCanvas.drawLine(xtemp+i, y0+j*ys+ys*0.45, xtemp+i, y0+j*ys+ys*0.9);
        }

        if(frame > frameNr) { 
            debugFlagSet = false;
        }

 
    }
}

function empty() {}