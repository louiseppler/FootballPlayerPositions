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
}).fail(function() {
    console.log("Error loading data");
	$("#error_div_tracking_data").show();
});

function dataLoaded() {
	if(gameData.tracking == null) {
		gameData = null
		$("#error_div_tracking_data").show();
		return;
	}

	if(gameData.possessions != null) {
		possessions = new Possession();
	}

	if(gameData.possessions == null) {
		$("#error_div_possessions").show();
	}
	if(gameData.events == null) {
		$("#error_div_events").show();
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
	createPositionTable();
 
	maxFrame = Math.floor(gameData.tracking.length/23)-2; //-2 because of framedeltas
	setupSlider();
}

function computeFinalScore() {
	if(gameData.events == null) {
		var text =  gameData.team1.name + " vs. " + gameData.team2.name;
		document.getElementById("title_text").innerHTML = text
		return;
	}

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

function createPositionTable() {
	var x = gameData

	$("#y-color-0").css('background-color', Role.colorsY[0]);
	$("#y-color-1").css('background-color', Role.colorsY[1]);
	$("#y-color-2").css('background-color', Role.colorsY[2]);
	$("#y-color-3").css('background-color', Role.colorsY[3]);
	$("#y-color-4").css('background-color', Role.colorsY[4]);

	$("#x-color-0").css('background-color', Role.colorsX[0]);
	$("#x-color-1").css('background-color', Role.colorsX[1]);
	$("#x-color-2").css('background-color', Role.colorsX[2]);
	$("#x-color-3").css('background-color', Role.colorsX[3]);
	$("#x-color-4").css('background-color', Role.colorsX[4]);
}