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


    // minFrameLoc = 100;
    // maxFrameLoc = 10000;

    overviewCanvas.logLive("We are ready")

    var x0 = 50;
    var x1 = overviewCanvas.width-50;

    var y0 = 30;
    var ys = 40;
    
    if(overviewIsExpanded) ys = 60;

    var scaling = (maxFrameLoc-minFrameLoc) / (x1-x0);

    if(overviewCanvas.mouseIsPressed) {
        console.log("mouseIsPressed");
        frameNr = (overviewCanvas.mouseX-x0)*scaling+minFrameLoc;
        $('#duration_slider').val(frameNr);
    }


    var currentX = 1/scaling*(frameNr-minFrameLoc)+x0;

    //Displays the current selected frame
    overviewCanvas.ctx.strokeStyle = "black";
    overviewCanvas.drawLine(currentX, 0, currentX, overviewCanvas.height)


    var averagesX = [];
    var averagesY = [];

    //TODO: compute averages/sums more efficiently (with sum for each index and then a difference)

    if(overviewIsExpanded) {
        //Calculates + Displaying the average
        for(var j = 0; j < rolesTeamA[minFrameLoc].length; j++) {
            var sumX = 0;
            var sumY = 0;
            var cnt = 0;
            for(var i = minFrameLoc; i < maxFrameLoc; i++) {
                if(rolesTeamA.length > i && rolesTeamA[i].length > j) {
                    sumX += rolesTeamA[i][j].x_role;
                    sumY += rolesTeamA[i][j].y_role;
                    cnt++;
                }
                else {
                var tt = rolesTeamA
                    var t = 0;
                }
            }

            var avgX = sumX/cnt;
            var avgY = sumY/cnt;

            averagesX.push(avgX);
            averagesY.push(avgY);

            overviewCanvas.ctx.fillStyle = "#000";

            overviewCanvas.ctx.fillStyle = Role.colorsX[Math.round(avgX)];
            overviewCanvas.ctx.beginPath();
            overviewCanvas.ctx.rect(x0,y0+j*ys+ys*0.225, x1-x0, ys*0.225); 
            overviewCanvas.ctx.fill();
    
            overviewCanvas.ctx.fillStyle = Role.colorsY[Math.round(avgY)];
            overviewCanvas.ctx.beginPath();
            overviewCanvas.ctx.rect(x0,y0+j*ys+ys*0.45, x1-x0, ys*0.225);  
            overviewCanvas.ctx.fill();  

        }
    }
    
    //Displaying the color for each pixel
    for(var i = x0; i < x1; i++) {
        var frame = Math.floor(scaling*(i-x0)+minFrameLoc);

        var avg_diff = 0;

        for(var j = 0; j < rolesTeamA[frame].length; j++) {

            if(debugFlagSet) {
            }

            if(frame > frameNr) { 
                if(debugFlagSet) console.log("role: " + rolesTeamA[frame][j].x_role + " " + rolesTeamA[frame][j].y_role);
            }

            overviewCanvas.ctx.strokeStyle = rolesTeamA[frame][j].getColorX();
            overviewCanvas.drawLine(i, y0+j*ys, i, y0+j*ys+ys*(0.45-0.225*overviewIsExpanded));
            overviewCanvas.ctx.strokeStyle = rolesTeamA[frame][j].getColorY();
            overviewCanvas.drawLine(i, y0+j*ys+ys*(0.45+0.225*overviewIsExpanded), i, y0+j*ys+ys*0.9);

            avg_diff += Math.abs(averagesX[j]-rolesTeamA[frame][j].x_role);
            avg_diff += Math.abs(averagesX[j]-rolesTeamA[frame][j].y_role);
        }

        if(frame > frameNr) { 
            debugFlagSet = false;
        }

        if(overviewIsExpanded) {
            overviewCanvas.ctx.strokeStyle = grayScale(avg_diff/40);
            overviewCanvas.drawLine(i, y0+10.5*ys, i, y0+10.5*ys+ys*0.225);

            if(avg_diff > 30) {
                overviewCanvas.ctx.strokeStyle = "#000"
                overviewCanvas.drawLine(i, y0+10*ys, i, y0+10*ys+ys*0.225);
            }
        }
    }


}

/**
 * Gives color code for a value
 * @param {*} value from 0 to 1
 */
function grayScale(value) {
    if(value < 0) return "#000";
    if(value > 1) return "#fff"
    var codes = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"]
    var c = codes[Math.round(value*16)];
    return "#"+c+c+c;
}

function empty() {}