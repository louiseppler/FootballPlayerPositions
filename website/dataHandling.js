var link = "http://127.0.0.1:8125/data/tracking_small.csv"
var link2 = "http://127.0.0.1:8125/data/tracking.csv"
var linkPosession = "http://127.0.0.1:8125/data/phase.csv"
var eventsLink = "http://127.0.0.1:8125/data/events.json"
var dataLink = "http://127.0.0.1:8125/data/data.json"

const TRACKING_HALF = 1;
const TRACKING_PID = 2;
const TRACKING_X = 3;
const TRACKING_Y = 4;
const TRACKING_Z = 5;

var possesions = null

var eventList = null

var gameData = null;

function getShirtNumberLabel(playerId) {
	for(var elm of gameData.shirtNumbers) {
		if(elm[0] == playerId) {
			return ""+elm[1];
		}
	}
	return "";
}

Papa.parse(linkPosession, {
	download: true,
	//worker: true,
	complete: function(results) {
		possesions = new Possesion(results.data);
	}
});

console.log("Loading game data...");
$.getJSON(dataLink, function(data) {
	console.log("Loaded game data");
	maxFrame = Math.floor(data.tracking.length/23)-1;
	setupSlider();
	gameData = data
});
