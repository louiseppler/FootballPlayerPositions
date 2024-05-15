var link = "http://127.0.0.1:8125/data/tracking_small.csv"
var link2 = "http://127.0.0.1:8125/data/tracking.csv"
var linkPosession = "http://127.0.0.1:8125/data/phase.csv"
var eventsLink = "http://127.0.0.1:8125/data/events.json"
var dataLink = "http://127.0.0.1:8125/data/data.json"


var tracking_data = null

var possesions = null

var eventList = null

var gameData = null;

function getShirtNumberLabel(playerId) {
	for(var elm of gameData.shirtNumbers) {
		if(elm[0] == playerId) {
			return elm[1];
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


Papa.parse(link2, {
	download: true,
	//worker: true,
	complete: function(results) {
		//console.log(results.data);
		tracking_data = results.data
		//overviewTeamA.computeAllRoles();
	}
});

$.getJSON(dataLink, function(data) {
	console.log("loaded game data");
	console.log(data);
	gameData = data
});