// ============= UI parameters =============

var showCircles = false;
var showDotNumbers = false;
var showCenters = true;
var showExtremaLines = true;
var showAxisType = 0; //0: x, 1: y

// ============= Function Variables =============

//only used before calculation of triangles, use delaunay.points
var dots = []; 
var selectedIndex = 0;

var extremaLines = {}

var roles = [];

var doPrint = false;

var surfaces = []

function mouseDown() {
    getClosestDot();
}

function mouseClick() {
    doPrint = true;
}

function draw() { 

    if(mouseIsPressed) {
        moveDots();
    }

    clearCanvas();
    drawDotsSimple();
    main();

    if(doPrint) console.log("========================");
    doPrint = false;
}

function moveDots() {
    dots[selectedIndex].x = mouseX;
    dots[selectedIndex].y = mouseY;
}

function getClosestDot() {
    var minIndex = 0;
    var minDist = 1_000_000_000;

    for(var i = 0; i < dots.length; i++) {
        const dist = getSquaredDist(mouseX, mouseY, dots[i].x, dots[i].y);
        console.log(dist);
        if(dist < minDist) {
            minDist = dist;
            minIndex = i;
        }
    }   

    console.log("minDist = ",minDist)

    if(minDist > 40*40) {
        console.log("adding new point")
        console.log("at:",mouseX,mouseY)

        dots.push({x: mouseX, y: mouseY});
        selectedIndex = dots.length-1;
    }
    else {
        selectedIndex = minIndex;
    }

}


function drawDotsSimple() {

    ctx.fillStyle = "black"

    for(const dot of dots) {
        drawDot(dot.x,dot.y,3)
    }
}


function main() {

    var array = []
    for(const dot of dots) {
        array.push(dot.x)
        array.push(dot.y)
    }

    const delaunay = new d3.Delaunay(array);

    const voronoi = delaunay.voronoi([0, 0, width, height]);

    resetVariables();

    computeShapeGraph(delaunay);
    computeSurfaces(delaunay);
    drawGraph(delaunay.points)

    if(drawPointNumbers) {
        drawPointNumbers(delaunay.points)
    }

    ctx.strokeStyle = "#f00"


    if(showCircles) {
        ctx.strokeStyle = "#aaa"
        drawCircles(voronoi, delaunay.triangles)
    }

    ctx.strokeStyle = "#000"
    drawSurfaceCenters(surfaces, delaunay.points, extremaLines);

    if(doPrint) console.log("setting xmin " + extremaLines.min_x);

    var s = ""
    for(const surface of surfaces) {
        for(var i = 0; i < surface.length; i++) {
            if(surface[i]) {
                s += "" + i + ",";
            }
        }

        s += "  "
    }

    computeRoles(delaunay.points, extremaLines)
    drawDotsRoles(delaunay.points);
}

function resetVariables() {
    surfaces = []
    graph = []
    logString = [];
}

function drawDotsRoles(points) {
    for(var i = 0; i < roles.length; i++) {
        if(showAxisType == 0) {
            ctx.fillStyle = roles[i].getColorX()
        }
        else {
            ctx.fillStyle = roles[i].getColorY()
        }
        drawDot(points[i*2],points[i*2+1], 6);
    }
}

function computeRoles(points, extremaLines) {
    roles = []
    const N = points.length/2
    for(var i = 0; i < N; i++) {
        roles.push(new Role())
    }

    for(var i = 0; i < N; i++) {
        if(points[i*2] < extremaLines.min_x) {
            roles[i].x_role = 1;
        }
        if(points[i*2] > extremaLines.max_x) {
            roles[i].x_role = 5;
        }
        if(points[i*2+1] < extremaLines.min_y) {
            roles[i].y_role = 1;
        }
        if(points[i*2+1] > extremaLines.max_y) {
            roles[i].y_role = 5;
        }
    }

    for(var i = 0; i < N; i++) {
        if(roles[i].x_role != -1) continue;

        var has_1_neighbor = false;
        var has_5_neighbor = false;

        for(const j of graph[i]) {
            if(roles[j].x_role == 1) has_1_neighbor = true
            if(roles[j].x_role == 5) has_5_neighbor = true
        }

        if (has_1_neighbor && has_5_neighbor) {
            roles[i].x_role = 3;
        }
        else if(has_1_neighbor) {
            roles[i].x_role = 2;
        }
        else if(has_5_neighbor) {
            roles[i].x_role = 4;
        }
        else {
            roles[i].x_role = 3;
        }
    }

    for(var i = 0; i < N; i++) {
        if(roles[i].y_role != -1) continue;

        var has_1_neighbor = false;
        var has_5_neighbor = false;

        for(const j of graph[i]) {
            if(roles[j].y_role == 1) has_1_neighbor = true
            if(roles[j].y_role == 5) has_5_neighbor = true
        }

        if (has_1_neighbor && has_5_neighbor) {
            roles[i].y_role = 3;
        }
        else if(has_1_neighbor) {
            roles[i].y_role = 2;
        }
        else if(has_5_neighbor) {
            roles[i].y_role = 4;
        }
        else {
            roles[i].y_role = 3;
        }
    }
}

function drawSurfaceCenters(surfaces, points, extremaLines) {
    var min_x = width;
    var max_x = 0;
    var min_y = height;
    var max_y = 0;

    for(const surface of surfaces) {
        var sum_x = 0;
        var sum_y = 0;
        var count = 0;

        for(var i of surface) {
            count += 1;
            sum_x += points[i*2];
            sum_y += points[i*2+1];
        }

        var x = sum_x/count;
        var y = sum_y/count;
        if(showCenters) drawCircle(x, y, 3);

        if(x < min_x) {
            min_x = x;
        }
        if(x > max_x) {
            max_x = x;
        }

        if(y < min_y) {
            min_y = y;
        }
        if(y > max_y) {
            max_y = y;
        }

        // if(doPrint) console.log("drawing circle at " + x + " " + y);
    }

    extremaLines.min_x = min_x;
    extremaLines.max_x = max_x;
    extremaLines.min_y = min_y;
    extremaLines.max_y = max_y;

    if(showExtremaLines) {
        ctx.setLineDash([5, 15]);

        if(showAxisType == 0) {
            drawLine(min_x, 0, min_x, height);
            drawLine(max_x, 0, max_x, height);
        }
        else {
            drawLine(0, min_y, width, min_y);
            drawLine(0, max_y, width, max_y);
        }
        ctx.setLineDash([]);
    }
}

function drawPointNumbers(points) {
    for (var i = 0; i < points.length/2; i += 1) {
        ctx.fillStyle = "#000"
        ctx.fillText("" + i, points[i*2]+8, points[i*2+1]+8);        
    }
}

function drawHull(delaunay) {
    const points = delaunay.points;

    for (let i = 0; i < delaunay.hull.length; i++ ) {
        let index = delaunay.hull[i];
        if(i != 0) {
            ctx.lineTo(points[index * 2], points[index * 2 + 1]);
            ctx.stroke()
        }
        ctx.beginPath();
        ctx.moveTo(points[index * 2], points[index * 2 + 1]);   
    }
    { //last edge
        let index = delaunay.hull[0];
        ctx.lineTo(points[index * 2], points[index * 2 + 1]);
        ctx.stroke()
    }
}

function drawCircles(voronoi, triangles) {
   for(var i = 0; i < voronoi.circumcenters.length; i += 2) {

    drawDot(voronoi.circumcenters[i],voronoi.circumcenters[i+1],2);
    
    const t0 = triangles[i];
    //const radius = getDist(voronoi.circumcenters[i],voronoi.circumcenters[i+1], points[t0*2], points[t0*2+1])
    const radius = getSmallestRadius(voronoi.circumcenters[i],voronoi.circumcenters[i+1]);
    drawCircle(voronoi.circumcenters[i],voronoi.circumcenters[i+1], radius)
   }
}

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