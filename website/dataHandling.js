var dataLink2 = "http://127.0.0.1:8125/data/data.json"

var dataLink = null

var possessions = null

var gameData = null;

var playerShirtNumbers = {};

/**
 * Converts frame number into the frame number without dead-frames
 * @param {Number} oldFrame old Frame
 * @returns index
 */
function convertFrame(oldFrame) {
	var low = 0;
	var high = maxFrame;

	while(high-low > 1) {
		var mid = Math.floor((low+high)/2);

		var frame = +gameData.tracking[mid].frame;

		if(frame > oldFrame) {
			high = mid;
		}
		else {
			low = mid;
		}
	}

	return high;
}

function getShirtNumberLabel(playerId) {
	return playerShirtNumbers[playerId] ?? "";

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
		showDataError("Failed to retrieve JSON", "Please make sure you have entered a correct URL")
	});
}

function dataLoaded() {
	console.log("Data loaded");
	dataFinishedReading();

	if(gameData.tracking == null) {
		gameData = null
		showDataError("No tracking data found", "JSON file dose not contain field 'tracking'")
		return;
	}

	if(gameData.tracking[0].possession == null) {
		$("#error_div_possessions").show();
	}
	if(gameData.events == null) {
		$("#error_div_events").show();
	}


	//Filling in default information if empty
	if(gameData.team1 == null) gameData.team1 = {};
	if(gameData.team2 == null) gameData.team2 = {};

	if(gameData.homeTeam.colorShirt == null) {
		gameData.homeTeam.colorShirt = "#3395AB";
	}
	if(gameData.awayTeam.colorShirt == null) {
		gameData.awayTeam.colorShirt = "#B73B92";
	}

	if(gameData.homeTeam.colorNumber == null) {
		gameData.homeTeam.colorNumber = "#fff";
	}

	if(gameData.awayTeam.colorNumber == null) {
		gameData.awayTeam.colorNumber = "#fff";
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

	getPlayers();
	setupTeamLabels();
	computeFinalScore();
	maxFrame = Math.floor(gameData.tracking.length)-2; //-2 because of framedeltas
	convertEvents();
	possessions = new Possession();


	createPositionTable();
 
	setupSlider();
}

function convertEvents() {
	for(var event of gameData.events) {
		event.frame = convertFrame(event.frame);
	}
}

function getPlayers() {
	gameData.players = {};
	gameData.players.team1 = [];
	gameData.players.team2 = [];
	gameData.players.goalKeepers = [];

	gameData.players.goalKeepers

	for(var player of gameData.homeTeam.players) {
		gameData.players.team1.push(player.id)

		playerShirtNumbers[player.id] = player.shirtNumber;

		if(player.isGoalie == true) {
			gameData.players.goalKeepers.push(player.id);
		}
	}

	for(var player of gameData.awayTeam.players) {
		gameData.players.team2.push(player.id)

		playerShirtNumbers[player.id] = player.shirtNumber;


		if(player.isGoalie == true) {
			gameData.players.goalKeepers.push(player.id);
		}
	}
}
// "homeTeam": {
// 	"name": null,
// 	"colorNumber": null,
// 	"colorShirt": null,
// 	"players": [
// 		{
// }

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

function dataReceived(isZipped = false) {
	$("#entry_view").hide();
	$("#website_view").hide();
	$("#data_error_view").hide();

	$("#data_loading_view").show();

	if(isZipped) {
		document.getElementById("dataLoadingTitle").innerHTML = "Unarchiving File..."
		document.getElementById("dataLoadingSubtitle").innerHTML = "This may take a while"
	}
}

function dataFinishedReading() {
	$("#entry_view").hide();
	$("#data_error_view").hide();
	$("#data_loading_view").hide();

	$("#website_view").show();
	setupCanvases();
}

function showDataError(message, secondaryMessage) {
	console.log("Showing error view");
	$("#entry_view").hide();
	$("#website_view").hide();
	$("#data_loading_view").hide();

	$("#data_error_view").show();
	if(message) {
		document.getElementById("dataErrorMessage").innerHTML = message
	}
	if(secondaryMessage) {
		document.getElementById("dataErrorMessageSecondary").innerHTML = secondaryMessage
	}
	
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

			handleFile(file);
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

function handleFile(file) {

	if (file.type === 'application/zip') {
		decompressFile(file);
	}
	else if(file.type === 'application/json' || file.type === 'text/plain') {
		readFile(file);
	}
	else {
		showDataError("Unsupported file type","received " + file.type + ", expected JSON");
	}
}


function decompressFile(file) {
	console.log("Decompressing file");
	const reader = new FileReader();

      reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        const zip = new JSZip();

        zip.loadAsync(arrayBuffer).then(function(zip) {
          // Get the first file name in the zip
          const fileName = Object.keys(zip.files)[0];
          console.log('File in zip:', fileName);

          // Read the file contents as text
          zip.files[fileName].async('text').then(function(content) {

			gameData = JSON.parse(content);

			dataLoaded();

			});
        }).catch(function(err) {
			showDataError("Failed reading zip file", err.message);
          	console.error('Error reading zip file:', err);
        });
      };

	dataReceived(true);
    reader.readAsArrayBuffer(file);
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
		handleFile(file);	
	}
	else {
		showDataError("No file received");
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

/// https://www.linkToWebsite.com/index.html?data=https%3A%2F%2Fwww.linkToData.com

// https://www.linkToData.com

// file:///Users/louiseppler/127/240118_Thesis/Attempt1/website/index.html?data=http%3A%2F%2F127.0.0.1%3A8125%2Fdata%2Fdata.json