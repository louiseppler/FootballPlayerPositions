// ============= UI parameters =============

var showBaseGraph = false;
var showCircles = false;
var showDotNumbers = false;
var showCenters = false;
var showExtremaLines = false;
var showAxisType = 0; //0: x, 1: y

var showPlayerLabels = true;

// ============= Animations Parameters =============

var isPlaying = false;
var playBackSpeed = 2;
var frameNr = 0;
var frameDelta = 0;
var nextFrameAt = 0; //timestamp for when the frame should increase

var timestampOffset = 0;

var showOtherTeam = true;
var showGoalKeepers = true;
var showShapeGraph = true;

var showGraphForTeam = 0; //0 nothing, 1: team a, 2: team b
var showGraphColorMode = 0; //0: dominant, 1: x, 2: y, 3: semicircles

var debugFlagSet = false;

var overviewIsExpanded = false;

// ============= Function Variables =============

//only used before calculation of triangles, use delaunay.points
var dots = []; 
var selectedIndex = 0;

var doPrint = false;

function mouseDown() {
    console.log("mouse down");
    console.log("mousIsPressed of: " + gameCanvas.mouseIsPressed);
    getClosestDot();
}

function mouseClick() {
    console.log("mouse cliked");
    console.log("mousIsPressed of: " + gameCanvas.mouseIsPressed);
   // doPrint = true;
}

var t = 0;

/**
 * This function gets called once every frame and
 * handles drawing of the game
 */
function draw() { 

    if(timestampOffset == 0) {
        timestampOffset = Date.now() 
    }

    if(gameCanvas == null) return;
    if(gameData == null) return;

    gameCanvas.clearCanvasWhite();

    if(pitchOffsetX == -1) {
        drawGameSetup();
    }

    handleFrameNr();

    document.getElementById("time_label_text").innerHTML = frameToTime(frameNr);
    document.getElementById("time_label_text").setAttribute('title','frame: ' + gameData.tracking[frameNr].frame);

    var x = getIsSecondHalf(frameNr) ; 

    if((showOverviewForTeam == 2)? !getIsSecondHalf(frameNr) : getIsSecondHalf(frameNr)) {
        flipPitch = true;
    }
    else {
        flipPitch = false;
    }

    drawPitch();

    if(gameCanvas.mouseIsPressed) {
        console.log("mouse is pressed from gameCanvas");
        t++;
    }

    if(showGraphForTeam == 0) {
        drawTeam(1);
        drawTeam(2);
    }
    else {
        drawTeam(showGraphForTeam);
        if(showOtherTeam) drawTeam(1-(showGraphForTeam-1)+1);
    }

    drawArrows(getIsSecondHalf(frameNr));

    if(showGoalKeepers) drawGoalKeepers(getGoalKeepers(frameNr));

    if(showPlayerLabels) drawPlayerLabels(frameNr);
    drawBall(frameNr);
}

function drawTeam(team) {
    const [points, isReversed, playerIds] = getGamePoints(frameNr, team);
    if(points != null) {
        shapeGraphMain(points, isReversed, true, null, team);
    }
}

function setFrameNr(frameNrLoc) {
    if(frameNrLoc != null) frameNr = frameNrLoc
    $('#duration_slider').val(frameNr);

    timestampOffset = Date.now()-frameNr*1000/(gameData.frameRate*playBackSpeed);
}

function handleFrameNr() {
    
    var newFrameNr = +$('#duration_slider').val()
    if(Math.abs(newFrameNr-frameNr) > 2) {
        setFrameNr(newFrameNr);
    }


    if(isPlaying && frameNr < maxFrame) {

        var frameDouble = (Date.now()-timestampOffset)/1000*(gameData.frameRate*playBackSpeed)

        frameDelta = frameDouble % 1;
        frameNr = Math.floor(frameDouble);

        if(frameNr < 0) frameNr = 0;
        if(frameNr > maxFrame) frameNr = maxFrame-2;

        // if(Date.now() > nextFrameAt) {
        //     frameNr++;
        //     nextFrameAt = Date.now() + 1000/(gameData.frameRate*playBackSpeed)


        // }

        $('#duration_slider').val(frameNr);
    }
}


function moveDots() {
    dots[selectedIndex].x = gameCanvas.mouseX;
    dots[selectedIndex].y = gameCanvas.mouseY;
}

/**
 * Gets the closest dot from the current mouse coordinates
 */
function getClosestDot() {
    var minIndex = 0;
    var minDist = 1_000_000_000;

    for(var i = 0; i < dots.length; i++) {
        const dist = getSquaredDist(gameCanvas.mouseX, gameCanvas.mouseY, dots[i].x, dots[i].y);
        console.log(dist);
        if(dist < minDist) {
            minDist = dist;
            minIndex = i;
        }
    }   

    console.log("minDist = ",minDist)

    if(minDist > 40*40) {
        console.log("adding new point")
        console.log("at:",gameCanvas.mouseX,gameCanvas.mouseY)

        dots.push({x: gameCanvas.mouseX, y: gameCanvas.mouseY});
        selectedIndex = dots.length-1;
    }
    else {
        selectedIndex = minIndex;
    }

}


function drawDotsSimple() {

    gameCanvas.ctx.fillStyle = "black"

    for(const dot of dots) {
        gameCanvas.drawDot(dot.x,dot.y,3)
    }
}


/**
 * This function computes the positions labels for the players
 * by computing a delaunay graph, then reduces it to a shape graph
 * to then determine the labels
 * @param {*} array the array of points [x1, y1, x2, y2, ...]
 * @param {*} isReversed pass true if team plays the other direction
 * @param {*} showDrawings pass true if elements should be drawn, default false
 * @returns 
 */
function shapeGraphMain(array, isReversed, showDrawings = true, playerIDs = null, team = 0) {

    // var array = []
    // for(const dot of dots) {
    //     array.push(dot.x)
    //     array.push(dot.y)
    // }

    const delaunay = new d3.Delaunay(array);

    const voronoi = delaunay.voronoi([0, 0, gameCanvas.width, gameCanvas.height]);

    var graph = computeBaseGraph(delaunay);

    if(showBaseGraph && showDrawings) {
        gameCanvas.ctx.strokeStyle = "#f3d3d3"
        drawGraph(delaunay.points, graph)
        gameCanvas.ctx.strokeStyle = "#000"
    }

    computeShapeGraph(delaunay, graph);
    const surfaces = computeSurfaces(delaunay, graph);
    const [centers, extremaLines] = computeExtremaLines(surfaces, delaunay.points, showDrawings);
    const roles = computeRoles(delaunay.points, extremaLines, graph, isReversed, playerIDs)

    if(!showDrawings) return roles;

    if(team == showGraphForTeam && showShapeGraph) {
        gameCanvas.ctx.strokeStyle = "#A9A9A9"
        gameCanvas.ctx.lineWidth = 3;
        drawGraph(delaunay.points, graph)
        gameCanvas.ctx.lineWidth = 1;
    }

    if(showCenters) {
        drawCenters(centers);
        if(doPrint) console.log(centers);
    }

    if(showCircles) {
        gameCanvas.ctx.strokeStyle = "#aaa"
        drawCircles(voronoi, delaunay.triangles)
    }

    gameCanvas.ctx.strokeStyle = "#000"

    drawDotsRoles(delaunay.points, roles, team);

    return roles
}

// ============= drawing functions  =============

function drawGraph(points, graph) {
    for(var i = 0; i < graph.length; i++) {
        for(var j = 0; j < graph[i].length; j++) {
            const k = graph[i][j];

            if(i < k) {
                gameCanvas.drawLine(points[i*2],points[i*2+1],points[k*2],points[k*2+1])
            }
        }
    }
}

function drawGoalKeepers(points) {
    if(points == null) return

    for(const point of points) {
        if(showOtherTeam == false && point[2] == 1+(1-(showGraphForTeam-1))) continue;

        gameCanvas.ctx.fillStyle = "#575757";
        gameCanvas.ctx.strokeStyle = "#575757";

        if(showGraphForTeam == 0) gameCanvas.drawDot(point[0],point[1], 8);
        else gameCanvas.drawCircle(point[0],point[1], 8);

    }
}

function drawDotsRoles(points, roles, team) {
    if(showGraphForTeam == 0) {
        for(var i = 0; i < roles.length; i++) {
            if(team == 1) {
                gameCanvas.ctx.fillStyle = gameData.homeTeam.colorShirt;   
                gameCanvas.ctx.strokeStyle = gameData.homeTeam.colorNumber;   

            }
            else {
                gameCanvas.ctx.fillStyle = gameData.awayTeam.colorShirt;   
                gameCanvas.ctx.strokeStyle = gameData.awayTeam.colorNumber;   

            }
            gameCanvas.drawDot(points[i*2],points[i*2+1], 8);
        }       
        return
    }

    for(var i = 0; i < roles.length; i++) {

        if(showGraphColorMode == 3) {

            gameCanvas.ctx.fillStyle = roles[i].getColorX()
            gameCanvas.ctx.strokeStyle = roles[i].getColorX()
            
            if(team == showGraphForTeam) gameCanvas.drawDot(points[i*2],points[i*2+1], 8, 0, Math.PI);
            else gameCanvas.drawCircle(points[i*2],points[i*2+1], 8, 0, Math.PI);

            gameCanvas.ctx.fillStyle = roles[i].getColorY()
            gameCanvas.ctx.strokeStyle = roles[i].getColorY()

            if(team == showGraphForTeam) gameCanvas.drawDot(points[i*2],points[i*2+1], 8, Math.PI, 2*Math.PI);
            else gameCanvas.drawCircle(points[i*2],points[i*2+1], 8, Math.PI, 2*Math.PI);

            continue;
        }

        switch (showGraphColorMode) {
            case 0:
                gameCanvas.ctx.fillStyle = roles[i].getDominantColor()
                gameCanvas.ctx.strokeStyle = roles[i].getDominantColor()
                break;
            case 1:
                gameCanvas.ctx.fillStyle = roles[i].getColorX()
                gameCanvas.ctx.strokeStyle = roles[i].getColorX()
                break;
            case 2:
                gameCanvas.ctx.fillStyle = roles[i].getColorY()
                gameCanvas.ctx.strokeStyle = roles[i].getColorY()

                break;
            default:
                break;
        }

        if(team == showGraphForTeam) gameCanvas.drawDot(points[i*2],points[i*2+1], 8);
        else gameCanvas.drawCircle(points[i*2],points[i*2+1], 8);
    }
}

function drawCenters(centers) {
    for(var i = 0; i < centers.length; i += 2) {
        gameCanvas.drawCircle(centers[i],centers[i+1],3);
    }
}

function drawPointNumbers(points) {
    for (var i = 0; i < points.length/2; i += 1) {
        gameCanvas.ctx.fillStyle = "#000"
        gameCanvas.ctx.fillText("" + i, points[i*2]+8, points[i*2+1]+8);        
    }
}

function drawArrows(isSecondHalf) {
    var arrowDirection = flipPitch? !isSecondHalf : isSecondHalf

    gameCanvas.ctx.strokeStyle = gameData.homeTeam.shirtColor;
    var outlined = false;
    
    //Arrow Team 1
    gameCanvas.ctx.fillStyle = gameData.awayTeam.shirtColor;
    if(showGraphForTeam == 2) {
        outlined = true;
    }
    if(showGraphForTeam == 1) gameCanvas.ctx.fillStyle = "#575757";
    
    if(!arrowDirection) drawArrowUp(outlined);
    else drawArrowDown(outlined);

    outlined = false;

    //Arrow Team 2
    gameCanvas.ctx.fillStyle = gameData.team2.color;
    if(showGraphForTeam == 1) {
        outlined = true;
    }
    if(showGraphForTeam == 2) gameCanvas.ctx.fillStyle = "#575757";
    
    if(!arrowDirection) drawArrowDown(outlined);
    else drawArrowUp(outlined);
}

function drawArrowDown(outlined) {
    const h0A = gameCanvas.height/2+25;
    const h0B = gameCanvas.height/2-25;
    const h = 12; const h1 = 8;
    const w = 3; const w0 = 10;
    //gameCanvas.ctx.fillRect(w, h0B-h, w, h*2);
    //gameCanvas.drawTriangle(0, h0B+h, w*3, h0B+h, w*1.5, h0B+h+h1);

    gameCanvas.ctx.beginPath();
    gameCanvas.ctx.moveTo(w0+w*1.5, h0B+h+h1); 
    gameCanvas.ctx.lineTo(w0+w*3, h0B+h);
    gameCanvas.ctx.lineTo(w0+w*2, h0B+h);
    gameCanvas.ctx.lineTo(w0+w*2, h0B-h);
    gameCanvas.ctx.lineTo(w0+w, h0B-h);
    gameCanvas.ctx.lineTo(w0+w, h0B+h);
    gameCanvas.ctx.lineTo(w0, h0B+h);

    gameCanvas.ctx.closePath();
    if(outlined) {
        gameCanvas.ctx.stroke();
    }
    else {
        gameCanvas.ctx.fill();
    }
}

function drawArrowUp(outlined) {
    const h0A = gameCanvas.height/2+25;
    const h0B = gameCanvas.height/2-25;
    const h = 12; const h1 = 8;
    const w = 3; const w0 = 10;

    //gameCanvas.ctx.fillRect(w, h0A-h, w, h*2);
    //gameCanvas.drawTriangle(0, h0A-h, w*3, h0A-h, w*1.5, h0A-h-h1);

    gameCanvas.ctx.beginPath();
    gameCanvas.ctx.moveTo(w0+w*1.5, h0A-h-h1); 
    gameCanvas.ctx.lineTo(w0+w*3, h0A-h);
    gameCanvas.ctx.lineTo(w0+w*2, h0A-h);
    gameCanvas.ctx.lineTo(w0+w*2, h0A+h);
    gameCanvas.ctx.lineTo(w0+w, h0A+h);
    gameCanvas.ctx.lineTo(w0+w, h0A-h);
    gameCanvas.ctx.lineTo(w0, h0A-h);

    gameCanvas.ctx.closePath();
    if(outlined) {
        gameCanvas.ctx.stroke();
    }
    else {
        gameCanvas.ctx.fill();
    }

}

function drawHull(delaunay) {
    const points = delaunay.points;

    for (let i = 0; i < delaunay.hull.length; i++ ) {
        let index = delaunay.hull[i];
        if(i != 0) {
            gameCanvas.ctx.lineTo(points[index * 2], points[index * 2 + 1]);
            gameCanvas.ctx.stroke()
        }
        gameCanvas.ctx.beginPath();
        gameCanvas.ctx.moveTo(points[index * 2], points[index * 2 + 1]);   
    }
    { //last edge
        let index = delaunay.hull[0];
        gameCanvas.ctx.lineTo(points[index * 2], points[index * 2 + 1]);
        gameCanvas.ctx.stroke()
    }
}

function drawCircles(voronoi, triangles) {
   for(var i = 0; i < voronoi.circumcenters.length; i += 2) {

    gameCanvas.drawDot(voronoi.circumcenters[i],voronoi.circumcenters[i+1],2);
    
    const t0 = triangles[i];
    //const radius = getDist(voronoi.circumcenters[i],voronoi.circumcenters[i+1], points[t0*2], points[t0*2+1])
    const radius = getSmallestRadius(voronoi.circumcenters[i],voronoi.circumcenters[i+1]);
    gameCanvas.drawCircle(voronoi.circumcenters[i],voronoi.circumcenters[i+1], radius)
   }
}

// ============= Helper Functions =============

function boolArrayToString(arr) {
    var s = ""
    for(var i = 0; i < arr.length; i++) {
        if(arr[i]) {
            s += "" + i + ",";
        }
    }
    return s
}   

function getAngle(i1, i2, i3, points) {
    const delta_x1 = points[i1 * 2]-points[i2 * 2];
    const delta_y1 = points[i1 * 2 + 1]-points[i2 * 2 + 1];
    const delta_x2 = points[i3 * 2]-points[i2 * 2];
    const delta_y2 = points[i3 * 2 + 1]-points[i2 * 2 + 1];

    const a1 = Math.atan2(delta_x1, delta_y1)+Math.PI;
    const a2 = Math.atan2(delta_x2, delta_y2)+Math.PI;

    var a = a2-a1;

    const TWO_PI = Math.PI*2

    a += TWO_PI

    a = ((a % TWO_PI) + TWO_PI ) % TWO_PI;

    if(a > Math.PI) return 2*Math.PI-a;

    return a;
}

function getSmallestRadius(x1, y1) {
    var r = 1000000;
    for(const dot of dots) {
        var r_new = getDist(dot.x, dot.y, x1, y1);
        if(r_new < r) {
            r = r_new
        }
    }
    return r;
}

function getDist(x1, y1, x2, y2) {
    return Math.sqrt(getSquaredDist(x1, y1, x2, y2))
}

function getSquaredDist(x1, y1, x2, y2) {
    return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}