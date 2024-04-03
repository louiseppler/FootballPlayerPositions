var graph = []
var surfaces = []
var extremaLines = {}
var roles = [];

//used for debugging, an array of strings
var logString = [];

// ---------------- Compute Roles ----------------

/**
 * 
 * @param {*} points the points that have to be computed
 * @param {*} extremaLines passed with min_x, min_y, max_x, max_y values
 * @param {*} isReversed Will reverse X coordinate if team plays into the other direction
 */
function computeRoles(points, extremaLines, isReversed, playerIDs) {
    roles = []
    const N = points.length/2
    for(var i = 0; i < N; i++) {
        roles.push(new Role())
    }

    if(playerIDs != null) {
        for(var i = 0; i < N; i++) {
            roles[i].playerID = playerIDs[i];
        }
    }

    for(var i = 0; i < N; i++) {
        if(points[i*2] < extremaLines.min_x) {
            roles[i].x_role = isReversed ? 2 : -2;
        }
        if(points[i*2] > extremaLines.max_x) {
            roles[i].x_role = isReversed ? -2 : 2;
        }
        if(points[i*2+1] < extremaLines.min_y) {
            roles[i].y_role = isReversed ? 2 : -2;
        }
        if(points[i*2+1] > extremaLines.max_y) {
            roles[i].y_role = isReversed ? -2 : 2;
        }
    }

    for(var i = 0; i < N; i++) {
        if(roles[i].x_role != -3) continue;

        var has_1_neighbor = false;
        var has_5_neighbor = false;

        for(const j of graph[i]) {
            if(roles[j].x_role == -2) has_1_neighbor = true
            if(roles[j].x_role == 2) has_5_neighbor = true
        }

        if (has_1_neighbor && has_5_neighbor) {
            roles[i].x_role = 0;
        }
        else if(has_1_neighbor) {
            roles[i].x_role = -1;
        }
        else if(has_5_neighbor) {
            roles[i].x_role = 1;
        }
        else {
            roles[i].x_role = 0;
        }
    }

    for(var i = 0; i < N; i++) {
        if(roles[i].y_role != -3) continue;

        var has_1_neighbor = false;
        var has_5_neighbor = false;

        for(const j of graph[i]) {
            if(roles[j].y_role == -2) has_1_neighbor = true
            if(roles[j].y_role == 2) has_5_neighbor = true
        }

        if (has_1_neighbor && has_5_neighbor) {
            roles[i].y_role = 0;
        }
        else if(has_1_neighbor) {
            roles[i].y_role = -1;
        }
        else if(has_5_neighbor) {
            roles[i].y_role = 1;
        }
        else {
            roles[i].y_role = 0;
        }
    }
}

// ---------------- Surface Centers + ExtremaLines ----------------


function computeExtremaLines(surfaces, points, extremaLines, showDrawings) {
    var centers = [];

    var min_x = gameCanvas.width+5;
    var max_x = -5;
    var min_y = gameCanvas.height+5;
    var max_y = -5;

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


        centers.push(x, y)
       
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
    }

    extremaLines.min_x = min_x;
    extremaLines.max_x = max_x;
    extremaLines.min_y = min_y;
    extremaLines.max_y = max_y;

    if(showExtremaLines && showDrawings) {
        gameCanvas.ctx.setLineDash([5, 15]);

        if(showAxisType == 0) {
            gameCanvas.drawLine(min_x, 0, min_x, gameCanvas.height);
            gameCanvas.drawLine(max_x, 0, max_x, gameCanvas.height);
        }
        else {
            gameCanvas.drawLine(0, min_y, gameCanvas.width, min_y);
            gameCanvas.drawLine(0, max_y, gameCanvas.width, max_y);
        }
        gameCanvas.ctx.setLineDash([]);
    }

    return centers;
}


// ---------------- Compute Surfaces ----------------

function computeSurfaces(delaunay) {
    const {points, hull} = delaunay;
    if(points.length < 5) {
        return;
    }

    var processedEdges = [];

    for(var i = 0; i < graph.length; i++) {
        for(var j = 0; j < graph[i].length; j++) {
            var k = graph[i][j];
            if(!processedEdges.includes(compressEdge(i, k)) && !isHullEdge(i,k,hull)) {
                findSurface(i,k, processedEdges);
            }
        }
    }
}

function findSurface(a, b, processedEdges) {
    var cnt = 0;
    var nodes = [a];

    var prevNode = a
    var node = getNextEdge(graph[a], b)

    var s = "";

    while (node != a && cnt < 100) {
        processedEdges.push(compressEdge(node, prevNode));
        s += node + " "
        nodes.push(node)
        cnt ++;
            
        const nextNode = getNextEdge(graph[node], prevNode)

        prevNode = node
        node = nextNode
    }

    surfaces.push(nodes)
}

function compressEdge(a, b) {
    return a*100+b;
}

// ---------------- Compute Shape Graph ----------------

function computeBaseGraph(delaunay) {
    for (var i = 0; i < delaunay.points.length/2; i++) {
        const neighbors = Array.from(delaunay.neighbors(i));
        graph.push(neighbors)
    }
}

function computeShapeGraph(delaunay) {

    let queue = new PriorityQueue();

    const {points, halfedges, triangles, hull} = delaunay;

  

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

// ---------------- Helpers ----------------

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
