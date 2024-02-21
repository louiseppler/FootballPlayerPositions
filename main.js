// UI parameters

var showCircles = false;
var showDotNumbers = false;
var showCenters = true;

// Function Variables

var dots = [];
var selectedIndex = 0;

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
    drawDots();
    main();

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


function drawDots() {

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
    
    if(drawPointNumbers) {
        drawPointNumbers(delaunay.points)
    }


    ctx.strokeStyle = "#f00"

    surfaces = []

    triangulationComputation(delaunay, surfaces);

    if(showCenters) {
        ctx.strokeStyle = "#000"
        drawSurfaceCenters(surfaces, delaunay.points);
    }

    var s = ""
    for(const surface of surfaces) {
        for(var i = 0; i < surface.length; i++) {
            if(surface[i]) {
                s += "" + i + ",";
            }
        }

        s += "  "
    }
    logLive(s)


    //console.log("===================");
    ctx.strokeStyle = "#000"
    drawHull(delaunay);

    if(showCircles) {
        ctx.strokeStyle = "#aaa"
        drawCircles(voronoi, delaunay.triangles)
    }
}

function drawSurfaceCenters(surfaces, points) {
    for(const surface of surfaces) {
        var sum_x = 0;
        var sum_y = 0;
        var count = 0;

        for(var i = 0; i < surface.length; i++) {
            if(surface[i]) {
                count += 1;
                sum_x += points[i*2];
                sum_y += points[i*2+1];
            }
        }

        var x = sum_x/count;
        var y = sum_y/count;
        drawCircle(x, y, 3);

        if(doPrint) console.log("drawing circle at " + x + " " + y);
    }
}

function triangulationComputation(delaunay, surfaces) {
    const {points, halfedges, triangles} = delaunay;

    // code snippet from https://d3js.org/d3-delaunay/delaunay#delaunay_halfedges
    // drawing the edges in between
    for (let i = 0, n = halfedges.length; i < n; ++i) {
        const j = halfedges[i];
        if (j < i) continue;
        const ti = triangles[i];
        const tj = triangles[j];

        
        // Determine Instable Edges

        const neighborsA = Array.from(delaunay.neighbors(ti))
        const neighborsB = Array.from(delaunay.neighbors(tj))
        
        const intersection = neighborsA.filter(value => neighborsB.includes(value));

        //minimum angle on either side of the line
        var maxPositiveAngle = 0;
        var maxNegativeAngle = 0;

        for(var k = 0; k < intersection.length; k++) {
            const angle = getAngle(tj, intersection[k], ti, points);
            if(angle < 0) {
                if(angle < maxNegativeAngle) {
                    maxNegativeAngle = angle;
                }
            }
            else {
                if(angle > maxPositiveAngle) {
                    maxPositiveAngle = angle;
                }
            }
        }

        const alpha = maxPositiveAngle + (-maxNegativeAngle);
        
        if(Math.abs(alpha) > 135/180*Math.PI) {
            //instable
            ctx.strokeStyle = "#f88"

            addSurfaceFromPoints([tj, intersection[0], ti, intersection[1]], surfaces)
            //surfaces.push([tj, intersection[0], ti, intersection[1]])
        }
        else {
            //stable
            ctx.strokeStyle = "#000"

            //adjacencyList[ti].push
            //surfaces.push([tj, intersection[0], ti])
            //surfaces.push([tj, intersection[1], ti])

            addSurfaceFromPoints([tj, intersection[0], ti], surfaces)
            addSurfaceFromPoints([tj, intersection[1], ti], surfaces)

        }

        ctx.beginPath();
        ctx.moveTo(points[ti * 2], points[ti * 2 + 1]);
        ctx.lineTo(points[tj * 2], points[tj * 2 + 1]);
        ctx.stroke();
    }

}

function drawPointNumbers(points) {
    for (var i = 0; i < points.length/2; i += 1) {
        ctx.fillStyle = "#000"
        ctx.fillText("" + i, points[i*2]+5, points[i*2+1]+5);        
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

function addSurfaceFromPoints(points, surfaces) {
    var newSurface = [] //surface[i] == true iff dot i is included in surface
    for(var i = 0; i < dots.length; i++) {
        newSurface.push(false);
    }
    for(const d of points) {
        newSurface[d] = true
    }

    addSurface(newSurface, surfaces);

}

function addSurface(newSurface, surfaces) {


    //if(doPrint) console.log("adding surface " + boolArrayToString(newSurface));


    for(var i = 0; i < surfaces.length; i++) {
        var didMerge = false;

        var surface = surfaces[i];
        //if(doPrint) console.log("  checking merge of " + boolArrayToString(surface) + " with " + boolArrayToString(newSurface));


        //check if at least 3 points of a surface are in common
        //if so, merge the two surfaces
        var inCommon = surface.map(function(elm, i) {
            return (elm && newSurface[i]);
        });

        var sum = inCommon.reduce((accumulator, currentValue) => {
            if(currentValue) {
                return accumulator + 1;
            }
            else {
                return accumulator;
            }
        },0);

        if(doPrint) console.log("  sum of " + sum);

        if (sum >= 3) {
            var union = surface.map(function(elm, i) {
                return (elm || newSurface[i]);
            });

            //if(doPrint) console.log("  union of " + boolArrayToString(union));

            surfaces[i] = union;

            //since surface was merged, we have to check if it needs merging again
            surfaces.splice(i, 1);
            addSurface(union, surfaces);

            return;
        }
    }   

    surfaces.push(newSurface)
    //console.log("added surface:");
    //console.log(surfaces);
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

    const a1 = Math.atan2(delta_x1, delta_y1);
    const a2 = Math.atan2(delta_x2, delta_y2);

    return a1 - a2;
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