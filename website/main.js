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
var frameNr = 0;

var showTeamA = true;
var showTeamB = true;

var showGraphForTeam = 0; //0 nothing, 1: team a, 2: team b
var showGraphColorMode = 0; //0: dominant, 1: x, 2: y

var debugFlagSet = false;

var overviewIsExpanded = false;

var axisIsFlipped = true; //varies for role computations, use if game plays from bottom to top

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

    if(gameCanvas == null) return;

    gameCanvas.clearCanvas();
    gameCanvas.logLive("frame: " + frameNr);

    handleFrameNr();
    drawGame(frameNr);


    if(gameCanvas.mouseIsPressed) {
        console.log("mouse is pressed from gameCanvas");
        t++;
    }

    const [points, isReversed] = getGamePoints(frameNr, showGraphForTeam);
    if(points != null) {
        shapeGraphMain(points, isReversed, true)
    }

    // if(mouseIsPressed) {
    //     moveDots();
    // }

    // clearCanvas();
    // drawDotsSimple();
    // main();

    // if(doPrint) console.log("========================");
    // doPrint = false;
}

function handleFrameNr() {
    frameNr = $('#duration_slider').val()

    if(isPlaying && frameNr < maxFrame) {
        frameNr++;

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
function shapeGraphMain(array, isReversed, showDrawings = true, playerIDs = null) {

    // var array = []
    // for(const dot of dots) {
    //     array.push(dot.x)
    //     array.push(dot.y)
    // }

    const delaunay = new d3.Delaunay(array);

    const voronoi = delaunay.voronoi([0, 0, gameCanvas.width, gameCanvas.height]);

    resetVariables();

    computeBaseGraph(delaunay);

    if(showBaseGraph && showDrawings) {
        gameCanvas.ctx.strokeStyle = "#d3c3c3"
        drawGraph(delaunay.points)
        gameCanvas.ctx.strokeStyle = "#000"
    }


    computeShapeGraph(delaunay);
    computeSurfaces(delaunay);
    const centers = computeExtremaLines(surfaces, delaunay.points, extremaLines, showDrawings);
    computeRoles(delaunay.points, extremaLines, isReversed, playerIDs)

    if(!showDrawings) return;

    drawGraph(delaunay.points)

    if(drawPointNumbers) {
        drawPointNumbers(delaunay.points)
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

    drawDotsRoles(delaunay.points);
}

function resetVariables() {
    surfaces = []
    graph = []
    logString = [];
}

// ============= drawing functions  =============

function drawGraph(points) {
    for(var i = 0; i < graph.length; i++) {
        for(var j = 0; j < graph[i].length; j++) {
            const k = graph[i][j];

            if(i < k) {
                gameCanvas.drawLine(points[i*2],points[i*2+1],points[k*2],points[k*2+1])
            }
        }
    }
}

function drawDotsRoles(points) {
    for(var i = 0; i < roles.length; i++) {
        switch (showGraphColorMode) {
            case 0:
                gameCanvas.ctx.fillStyle = roles[i].getDominantColor()
                break;
            case 1:
                gameCanvas.ctx.fillStyle = roles[i].getColorX()
                break;
            case 2:
                gameCanvas.ctx.fillStyle = roles[i].getColorY()
                break;
            default:
                break;
        }

        gameCanvas.drawDot(points[i*2],points[i*2+1], 6);
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