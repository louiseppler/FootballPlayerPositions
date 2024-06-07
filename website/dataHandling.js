var dataLink2 = "http://127.0.0.1:8125/data/data.json"

var dataLink = null

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


function loadDataFromSever() {
	dataReceived();
	console.log("Loading game data...");
	$.getJSON(dataLink, function(data) {
		console.log("Loaded game data");
		gameData = data
		dataLoaded();
	}).fail(function() {
		console.log("Error loading data");
		$("#error_div_tracking_data").show();
	});
}

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
 
	maxFrame = Math.floor(gameData.tracking.length)-2; //-2 because of framedeltas
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
	document.getElementById("team2_name_label_1").innerHTML = gameData.team2.name
	document.getElementById("team1_name_label_2").innerHTML = gameData.team1.name
	document.getElementById("team2_name_label_2").innerHTML = gameData.team2.name
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

function dataReceived() {
	$("#website_view").show();
	$("#entry_view").hide();
	setupCanvases();
}

function dropHandler(ev) {
	console.log("File(s) dropped");
  
	// Prevent default behavior (Prevent file from being opened)
	ev.preventDefault();
  
	if (ev.dataTransfer.items) {
	  // Use DataTransferItemList interface to access the file(s)
	  [...ev.dataTransfer.items].forEach((item, i) => {
		// If dropped items aren't files, reject them
		if (item.kind === "file") {
			const file = item.getAsFile();
		  	console.log(`recived file[${i}] with name ${file.name}`);

			readFile(file);
		}
	  });
	} else {
	  // Use DataTransfer interface to access the file(s)
	  [...ev.dataTransfer.files].forEach((file, i) => {
		console.log(`… file[${i}].name = ${file.name}`);
	  });
	}
  }

function dragOverHandler(ev) {
	ev.preventDefault();
}

function readFile(file) {
	var reader = new FileReader();
	reader.addEventListener("loadend", function(event) {
		console.log("Read content of file");
			if(gameData == null) {
			gameData = JSON.parse(event.target.result);
			dataLoaded();
			}
	});
	dataReceived();
	reader.readAsText(file);
}

function handleFileUpload(event) {
	const file = event.target.files[0];
	if (file) {
		console.log("File uploaded:", file.name);
		readFile(file);	
	}
}

function uploadFileButton() {
	document.getElementById("fileupload").click();
}

function enteredLink() {
	dataLink = document.getElementById("link_input_field").value
	loadDataFromSever();
}

function checkUrlHeader() {
	const url = getQueryVariable("data");
	if(url != null) {
		dataLink = url;
		loadDataFromSever();
	}
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
	  var pair = vars[i].split("=");
	  if (pair[0] == variable) {
		return decodeURIComponent(pair[1]);
	  }
	} 

	return null
	//alert('Query Variable ' + variable + ' not found');
  }

// encodeURIComponent("http://127.0.0.1:8125/data/data.json")
// http%3A%2F%2F127.0.0.1%3A8125%2Fdata%2Fdata.json

// file:///Users/louiseppler/127/240118_Thesis/Attempt1/website/index.html?data=http%3A%2F%2F127.0.0.1%3A8125%2Fdata%2Fdata.json