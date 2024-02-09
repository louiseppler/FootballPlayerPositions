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

    //code snippet from https://d3js.org/d3-delaunay/delaunay#delaunay_halfedges
    const {points, halfedges, triangles} = delaunay;
    for (let i = 0, n = halfedges.length; i < n; ++i) {
        const j = halfedges[i];
        if (j < i) continue;
        const ti = triangles[i];
        const tj = triangles[j];

        ctx.moveTo(points[ti * 2], points[ti * 2 + 1]);
        ctx.lineTo(points[tj * 2], points[tj * 2 + 1]);
        ctx.stroke();
    }

    for (let i = 0; i < delaunay.hull.length; i++ ) {
        let index = delaunay.hull[i];
        if(i != 0) {
            ctx.lineTo(points[index * 2], points[index * 2 + 1]);
            ctx.stroke()
        }
        ctx.moveTo(points[index * 2], points[index * 2 + 1]);   
    }
    { //last edge
        let index = delaunay.hull[0];
        ctx.lineTo(points[index * 2], points[index * 2 + 1]);
        ctx.stroke()
    }
}

function getSquaredDist(x1, y1, x2, y2) {
    return (x1-x2)*(x1-x2)+(y1-y2)*(y1-y2);
}