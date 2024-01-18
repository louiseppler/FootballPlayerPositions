var dots = [];

function mouseClick() {
    dots.push({x: mouseX, y: mouseY})
}

function draw() { 
    ctx.fillStyle = "lightgray"
    ctx.fillRect(0,0,width,height);

    ctx.fillStyle = "black"

    for(const dot of dots) {
        drawDot(dot.x,dot.y,3)
    }
}