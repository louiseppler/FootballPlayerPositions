# Implementation
Some bulletpoints on the implementation

### Tools / JS Canvas (230307)

- Using Java Canvas
Keeping track of basic UI variables in the helpers file.
Defined by own functions for
- mouseClick: is called on mouseUp
- mouseX, mouseY, used to determin the mouses position on the canvas (gets updated in the with mousemove event from canvas)
- mouseIsPressed. get set to true on mouseDownEvent and false on mouseup event
- Draw handler: is responsible to call the draw function each frame, with the function `requestAnimationFrame`
- Helper function to draw basic shapes
	- line, circle, dot (dot being a filled circle)
	- clear canvas function
	- helper function to write a text to the top cornter of the canvas (logLive)
###### Update (240329)
- These variables and functions are stored in the `CanvasHelper` to allow for several canvases do be drwan
- When creating the object `mouseClick, mouseDown, draw` functions can be passed along which will get called from the convasHelper class
- Two canvas are used so each canvas can have its main role, each canvas shows a spcific graphic
 
### Drawing & Moving the dots (240307)
- selectedIndex saved the point that is selected while dragging points around the canvases
- getClosesDot determins weather there is a dot near by or if a new one should be created
On mouseDown we determin if we need to add a new dot. Then in the `draw` function (each frame) we update the current selected dot if the mouse is pressed (using `mouseIsPressed` variable)

### Computing Shape Graph (240307)
Used `Algorithm1`from `submission2.pdf`
- getAngle: returns an angle for given three points (always ≤ 180°)
- getNextEdge: a function that computes for a point A, the edge following the edge AB (planar graph, next edge clockwise? oritentation)
- getPrevEdge: function for the other direction (anticlockwise?)
- loop over the half edges, compute the angle to the the corresponding points (`a` and `b`) - no fancy algorithm needed here yet because we only have triangles at the moment
- add these to the prioirtyqueue
- pop elements from the queue according to the maximum angle
- remove edge if its bigger than 135° (this parts differs from the pseudo code TODO?)

Pattern to loop around a surface:
- start with an edge -> (prevNode, node)
- compute `getNextEdge`
- loop this until we node is the same as starting out
- used a lot across the code (prevNode, node) vs. (node, prevNode). would chose the surface on the right resp. left (check which way)

- loop around the new created surface
- for each edge, call `getStabilityAngle`which gets which gets the minimum angle of all points on that plane (we use the pattern to loop around a surface which was described above)
- do it for both sides (by passing the points in the different direction)
- update the angles in the list
- continue down the queue

### Compute Surfaces (240307)
- loop over every edge (because of the adjenceny list both direction will be choosen)
- find the surface points by using the pattern to loop around a surface
- save all the edges along the way to prevent processing a surface several times

### Compute Roles (240307)
- loop over every surface, compute centers and finde the exteme ones
- loop over every node and check if its coordinate is past an extreme line (if so assing role)
- loop over every unassigned node and chekc if it has neighbours with one of the extreem roles (fully left, fully right, attacker, defender ;; roles 1 or 5), update role accordinly
###### Update (230329)
- `isReversed` will flip all 1s and 5s and is used for the team playing into the other direction

### Data Handling (240329)
- using papaparse
	- Easy to use library that can read the data
	- Supports async calling, etc.
- Since webbrowsers have restrictions on loading local files these are hosting on a simple node server
	- uses hodes http requirement to set up a basic server and uses nodes file system (node 'fs') to load the csv file
	- used some basic template and ajusted it to my needs
- currently the game data, such as pitch size, team players, etc is hard coded

### Overview (240329)
- Draws the overview plot
- Uses slider range from jquery UI (https://jqueryui.com/slider/#range)
	- Easy tool to allow displaying only a selection of a game
	- This allows to view moments in more detail
- Position labels get computed before hand and saved in `rolesTeamA`
- We iterate over the each pixel in the horizontal, get the frame number that corresponds the that pixel (by doing some scaling calculations) `(maxFrameLoc-minFrameLoc) / (x1-x0)` 
- Currently only the first frame is used (no averaging)

### JQuery (240329)
- is a widely used java script library that allows easier use to maniupalte ui elements and come with some pre built UI elements
- `uiElements.js` sets up the actions when a button is pressed

### Data Smoothing (240405)
- is done by comparing each player position pair (x&y value together), find the maximum there
- code represents player position as single number (easier to handle)
- while computing the roles, each role contains the sum of all previous occured player position stored in `roleCount`  i.e. `roleCount[i]`= number of times role `i`has occurred
- compute the difference between two timeframes to get count of smoothing range, find the minimum (is done in `getMostFrequentRole`)
- doing with sum allows computations in O(1) instead of O(n) - allows for faster computations when these values change
- is value is also used to match players for the substitutions

### Substitutions (240405)
- done in `computePlayerOrdering` once all roles have been computed
- goal: compute a dictionary mapping each player to a position in the overview graph
- initial ordering is computed by sorting the most frequent position on sorting them (first prio attack to back, second prio left to right (or the other way around)) (is is what roleCount number represents)
- if there are 2+ substitutions compute a score representing how well a player would be swapped out there
	- if seen playerposition as a 2d canvas, done by computing the distance between players
- assign palyers according to the minimum score
- assumptions: player only enters a game once

### Decision on Colors (240416)
Version 0 Both: Too cluttered, can't distinguish teams
Version 1 Both_Small: Can distinguish, fells cluttered
Version 2 Outline: Works in my opinion well - player have the same size
Version 3 Outline wiht lines: Fells a bit more cluttered, lines don't provide extra info
Version 4 Grayscale: Hard to disgingush at glance the roles
- Gayscale: darkets color for 2/-2, middle color for -1/1, ligest color for 0
- In dominant mode uses darkets color for attack/defend, middle color for left/right
Version 5 Grayscale: Still hard, easyer then 4, light players fade into background
Version 6 BothSmallNoLines: Works, teams are not disginishable at first glace?
