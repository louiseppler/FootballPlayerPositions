var dataLink = "http://127.0.0.1:8125/data/data.json"

const TRACKING_HALF = 1;
const TRACKING_PID = 2;
const TRACKING_X = 3;
const TRACKING_Y = 4;
const TRACKING_Z = 5;

var possessions = null

var gameData = null;

function getShirtNumberLabel(playerId) {
	for(var elm of gameData.shirtNumbers) {
		if(elm[0] == playerId) {
			return ""+elm[1];
		}
	}
	return "";
}

console.log("Loading game data...");
$.getJSON(dataLink, function(data) {
	console.log("Loaded game data");
	gameData = data
	dataLoaded();

});

function dataLoaded() {
	if(gameData.possessions != null) {
		possessions = new Possession();
	}

	//Filling in default information if empty
	if(gameData.team1 == null) gameData.team1 = {};
	if(gameData.team2 == null) gameData.team2 = {};

	if(gameData.team1.color == null) {
		gameData.team1.color = "#3395AB";
	}
	if(gameData.team2.color == null) {
		gameData.team2.color = "#B73B92";
	}

	if(gameData.team1.name == null) {
		gameData.team1.name = "Home";
	}
	if(gameData.team2.name == null) {
		gameData.team2.name = "Away";
	}

	if(gameData.positionColors != null) {
		if(gameData.positionColors.colorsX != null) {
			Role.colorsX = gameData.positionColors.colorsX;
		}
		if(gameData.positionColors.colorsY != null) {
			Role.colorsY = gameData.positionColors.colorsY;
		}

	}

	setupTeamLabels();
	computeFinalScore();
 

	maxFrame = Math.floor(gameData.tracking.length/23)-1;
	setupSlider();
}

function computeFinalScore() {
	var score1 = 0;
	var score2 = 0;
	for(const event of gameData.events) {
		if(event.type == "GOAL") {
			if(event.team == 1) {
				score1 += 1;
			}
			else {
				score2 += 1;
			}
		}
	}

	var text =  gameData.team1.name + " " + score1 + " : " + score2 + " " + gameData.team2.name;
	document.getElementById("title_text").innerHTML = text

}

function setupTeamLabels() {
	document.getElementById("team1_name_label_1").innerHTML = gameData.team1.name
	document.getElementById("team2_name_label_1").innerHTML = gameData.team1.name
	document.getElementById("team1_name_label_2").innerHTML = gameData.team1.name
	document.getElementById("team2_name_label_2").innerHTML = gameData.team1.name
}