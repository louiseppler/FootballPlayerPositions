var dots = [];

function mouseClick() {
    dots.push({x: mouseX, y: mouseY})

    clearCanvas();
    getTriangulation();
    drawDots();
}

function draw() { 

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

    console.log(array);

    const delaunay = new d3.Delaunay(array);

    console.log(delaunay)

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