var graph = []

//used for debugging, an array of strings
var logString = [];

function computeShapeGraph(delaunay) {
    //resetting the parameters
    graph = []
    logString = [];

    let queue = new PriorityQueue();

    const {points, halfedges, triangles, hull} = delaunay;

    if(points.length == 6) {
        const alpha = getAngle(0, 1, 2, points);
        logLive("" + alpha/Math.PI*180);
    }

    for (var i = 0; i < points.length/2; i++) {
        const neighbors = Array.from(delaunay.neighbors(i));
        graph.push(neighbors)
    }

    if(doPrint) console.log(graph);

    ctx.strokeStyle = "#d3c3c3"
    drawGraph(points)
    ctx.strokeStyle = "#000"


    for (let i = 0, n = halfedges.length; i < n; ++i) {
        const j = halfedges[i];
        if (j < i) continue;
        const ti = triangles[i];
        const tj = triangles[j];

        const neighborsA = Array.from(delaunay.neighbors(ti));
        const neighborsB = Array.from(delaunay.neighbors(tj));

        var a = getNextEdge(neighborsA, tj);
        var b = getNextEdge(neighborsB, ti);

        const angleA = getAngle(ti, a, tj, points);
        const angleB = getAngle(tj, b, ti, points);

        logString.push("init edge " + ti + " " + tj + " with angles " + angleA/Math.PI*180 + " " + angleB/Math.PI*180);
        logString.push("  with subangles " + a + " " + b);

        const angle = Math.abs(angleA+angleB)

        queue.enqueueFunction({a: ti, b: tj}, -(angle));
        if(doPrint) console.log("adding edge " + ti + " " + tj);

    }

    while(!queue.isPriorityQueueEmpty()) {
        var queueElement = queue.dequeueFunction()
        var edge = queueElement.element;
        var angle = -queueElement.priority

        if(isHullEdge(edge.a, edge.b, hull)) {
            continue;
        }

        logString.push( "at edge " + edge.a + " " + edge.b + " with angle " + angle/Math.PI*180)


        if(angle > 135/180*Math.PI) {
            if(doPrint) console.log("removing edge " + edge.a + " " + edge.b);
            logString.push( "removing edge " + edge.a + " " + edge.b)


            var prevNode = edge.a
            var node = getNextEdge(graph[edge.a], edge.b)

            removeEdge(edge.a, edge.b);
        
            var s = "" + prevNode + " "
            var cnt = 0;

            while (node != edge.a && cnt < 100) {
                //update angle
            
                var angle = 0

                if(!isHullEdge(prevNode,node,hull)) {
                    logString.push( "  updating " + prevNode + " " + node)

                    const angleA = getStabilityAngle(prevNode, node, points)
                    const angleB = getStabilityAngle(node, prevNode, points)

                    angle = angleA + angleB;




                    if(doPrint) console.log("new angle at " + prevNode + " " + node + " of " + angleA + " and " + angleB);
                
                


                    if(doPrint) console.log("new angle at " + prevNode + " " + node + " of " + angleA + " and " + angleB);
                
                    logString.push( "  updating " + prevNode + " " + node + " with angle " + angle/Math.PI*180)

                    queue.updateElement({a: prevNode, b: node}, -angle);
                
                }

                s += node + " "
                cnt ++;
                const nextNode = getNextEdge(graph[node], prevNode)
                prevNode = node
                node = nextNode
            }
        }
    }

    if(doPrint) console.log(graph);

    var logStringLoc = logString
}

function getStabilityAngle(a, b, points) {
    var minAngle = Math.PI
    var prevNode = a
    var node = getNextEdge(graph[a], b)

    var s = "" + prevNode + " "
    var cnt = 0;

    while (node != a && cnt < 100) {
        s += node + " "
        cnt ++;

        if(graph[node] == undefined) {
            var graphLoc = graph
            var logStringLoc = logString
            adsf = 1;
        }

        const nextNode = getNextEdge(graph[node], prevNode)


        const alpha = getAngle(a, node, b, points);
        logString.push("    angle for " + prevNode + " " + node + " " + nextNode + " with angle" + alpha/Math.PI*180)

        if(alpha < minAngle) {
            minAngle = alpha
        }

        prevNode = node
        node = nextNode
    }

    if(doPrint) console.log("  " + s + " " + cnt);

    return Math.abs(minAngle)
}

function removeEdge(a, b) {
    graph[a] = graph[a].filter(item => item != b);
    graph[b] = graph[b].filter(item => item != a);
}

function getPrevEdge(neighbors, k) {
    for(var i = 0; i < neighbors.length; i++) {
        if(neighbors[i] == k) {
            if(i == 0) {
                return neighbors[neighbors.length-1];
            }
            else {
                return neighbors[i-1];
            }
        }
    }
}

function getNextEdge(neighbors, k) {
    for(var i = 0; i < neighbors.length; i++) {
        if(neighbors[i] == k) {
            if(i < neighbors.length-1) {
                return neighbors[i+1];
            }
            else {
                return neighbors[0];
            }
        }
    }
}

function isHullEdge(a, b, hull) {
    return (isHullEdgeOneWay(a,b,hull) || isHullEdgeOneWay(b,a,hull));
}

function isHullEdgeOneWay(a, b, hull) {
    for(var i = 0; i < hull.length; i++) {
        if(hull[i] == a) {
            if(i == hull.length-1) {
                return (hull[0] == b);
            }
            else {
                return (hull[i+1] == b);
            }
        }
    }
}


// MARK: - drawing

function drawGraph(points) {
    for(var i = 0; i < graph.length; i++) {
        for(var j = 0; j < graph[i].length; j++) {
            const k = graph[i][j];

            if(i < k) {
                drawLine(points[i*2],points[i*2+1],points[k*2],points[k*2+1])
            }
        }
    }
}
