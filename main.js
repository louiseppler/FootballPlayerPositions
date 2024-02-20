var dots = [];
var selectedIndex = 0;

function mouseDown() {
    getClosestDot();
}

function mouseClick() {
}

function draw() { 

    if(mouseIsPressed) {
        moveDots();
    }

    clearCanvas();
    drawDots();
    getTriangulation();
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


function getTriangulation() {

    var array = []
    for(const dot of dots) {
        array.push(dot.x)
        array.push(dot.y)
    }

    const delaunay = new d3.Delaunay(array);

    const voronoi = delaunay.voronoi([0, 0, width, height]);

    ctx.strokeStyle = "#f00"

    // code snippet from https://d3js.org/d3-delaunay/delaunay#delaunay_halfedges
    // drawing the edges in between
    const {points, halfedges, triangles} = delaunay;
    for (let i = 0, n = halfedges.length; i < n; ++i) {
        const j = halfedges[i];
        if (j < i) continue;
        const ti = triangles[i];
        const tj = triangles[j];

        
        // Determine Instable Edges

        const neighborsA = Array.from(delaunay.neighbors(ti))
        const neighborsB = Array.from(delaunay.neighbors(tj))
        
        const intersection = neighborsA.filter(value => neighborsB.includes(value));

        const angle1 = getAngle(tj, intersection[0], ti, points);
        const angle2 = getAngle(ti, intersection[1], tj, points);

        const alpha = angle1 + angle2;
        
        if(Math.abs(alpha) > 135/180*Math.PI) {
            //instable
            ctx.strokeStyle = "#f88"
        }
        else {
            //stable
            ctx.strokeStyle = "#000"
        }


        ctx.beginPath();
        ctx.moveTo(points[ti * 2], points[ti * 2 + 1]);
        ctx.lineTo(points[tj * 2], points[tj * 2 + 1]);
        ctx.stroke();
    }

    ctx.strokeStyle = "#000"

    // drawing the hull around the edges
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


    ctx.strokeStyle = "#aaa"

    //draws the circles
    for(var i = 0; i < voronoi.circumcenters.length; i += 2) {

        drawDot(voronoi.circumcenters[i],voronoi.circumcenters[i+1],2);
        
        const t0 = triangles[i];
        //const radius = getDist(voronoi.circumcenters[i],voronoi.circumcenters[i+1], points[t0*2], points[t0*2+1])
        const radius = getSmallestRadius(voronoi.circumcenters[i],voronoi.circumcenters[i+1]);
        drawCircle(voronoi.circumcenters[i],voronoi.circumcenters[i+1], radius)

    }
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