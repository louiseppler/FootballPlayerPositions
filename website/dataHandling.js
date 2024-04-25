var link = "http://127.0.0.1:8125/data/tracking_small.csv"
var link2 = "http://127.0.0.1:8125/data/tracking.csv"
var eventsLink = "http://127.0.0.1:8125/data/events.json"

var tracking_data = null

var eventList = null

var game = {
	pitch: {
		width: 105.0,
		height: 68.0
	},
	players: {
		teamA: ['P3578', 'P3568', 'P3569', 'P3570', 'P3571', 'P3572', 'P3573', 'P3574', 'P3575', 'P3576', 'P3577', 'P3579', 'P3580', 'P3581', 'P3582', 'P3583', 'P3584'],
		teamB: ['P3595', 'P3585', 'P3586', 'P3587', 'P3588', 'P3589', 'P3590', 'P3591', 'P3592', 'P3593', 'P3594', 'P3596', 'P3597', 'P3696', 'P3697', 'P3698', 'P3699', 'P3700']
	},
	goalKeepers: ["P3595","P3578"],
	shirtNumbers: {
		"P3578":11, "P3568":1, "P3569":2, "P3570":3, "P3571":4, "P3572":5, "P3573":6, "P3574":7, "P3575":8, "P3576":9, "P3577":10, "P3579":12, "P3580":13, "P3581":14, "P3582":15, "P3583":16, "P3584":17, "P3595":28, "P3585":18, "P3586":19, "P3587":20, "P3588":21, "P3589":22, "P3590":23, "P3591":24, "P3592":25, "P3593":26, "P3594":27, "P3596":29, "P3597":30, "P3696":31, "P3697":32, "P3698":33, "P3699":34, "P3700":35
	},

	getShirtNumberLabel(playerId) {
		var nr = this.shirtNumbers[playerId];
		if(nr == null) return ""
		return ""+nr;
	}
}



Papa.parse(link2, {
	download: true,
	//worker: true,
	complete: function(results) {
		//console.log(results.data);
		tracking_data = results.data
		//overviewTeamA.computeAllRoles();
	}
});

$.getJSON(eventsLink, function(data) {
	eventList = data.data
});




const gameEvents = {
	"ADVANTAGE"	: {res: 0, icon: "", letter: ""},
	"AERIAL"	: {res: 0, icon: "", letter: ""},
	"BALL LOST"	: {res: 2, icon: "", letter: "L"},
	"BALL OUT"	: {res: 1, icon: "", letter: "X"},
	"BLOCKED"	: {res: 0, icon: "", letter: ""},
	"BLOCKED"	: {res: 0, icon: "", letter: ""},
	"CARD"		: {res: 3, icon: "", letter: "C"},
	"CARRY"		: {res: 1, icon: "", letter: "-"},
	"CHALLENGE"	: {res: 0, icon: "", letter: ""},
	"CLEARANCE"	: {res: 0, icon: "", letter: ""},
	"CORNER KICK": {res: 5, icon: "", letter: "C"},
	"CROSS"		: {res: 0, icon: "", letter: ""},
	"DEEP BALL"	: {res: 0, icon: "", letter: ""},
	"DIRECT"	: {res: 0, icon: "", letter: ""},
	"DRIBBLE"	: {res: 0, icon: "", letter: ""},
	"END HALF"	: {res: 0, icon: "", letter: ""},
	"FAULT"		: {res: 0, icon: "", letter: ""},
	"FAULT RECEIVED": {res: 0, icon: "", letter: ""},
	"FORCED"	: {res: 0, icon: "", letter: ""},
	"FREE KICK"	: {res: 3, icon: "", letter: "FK"},
	"GOAL"		: {res: 9, icon: "ball.jpg", letter: "G"},
	"GOAL KICK"	: {res: 9, icon: "", letter: "GK"},
	"GROUND"	: {res: 0, icon: "", letter: ""},
	"HAND BALL"	: {res: 0, icon: "", letter: ""},
	"HEAD"		: {res: 0, icon: "", letter: ""},
	"INDIRECT"	: {res: 0, icon: "", letter: ""},
	"INTERCEPTION"	: {res: 0, icon: "", letter: ""},
	"KICK OFF"	: {res: 0, icon: "", letter: ""},
	"LOST"		: {res: 0, icon: "", letter: ""},
	"OFF TARGET": {res: 0, icon: "", letter: ""},
	"OFFSIDE"	: {res: 0, icon: "", letter: ""},
	"ON TARGET"	: {res: 0, icon: "", letter: ""},
	"OUT"		: {res: 3, icon: "", letter: "X"},
	"PASS"		: {res: 1, icon: "", letter: "*"},
	"PENALTY"	: {res: 9, icon: "", letter: "PK"},
	"RECOVERY"	: {res: 0, icon: "", letter: ""},
	"RED"		: {res: 9, icon: "", letter: "R"},
	"REFEREE HIT": {res: 0, icon: "", letter: ""},
	"RETAKEN"	: {res: 0, icon: "", letter: ""},
	"SAVED"		: {res: 0, icon: "", letter: ""},
	"SET PIECE"	: {res: 0, icon: "", letter: ""},
	"SHOT"		: {res: 4, icon: "", letter: "S"},
	"TACKLE"	: {res: 0, icon: "", letter: ""},
	"THEFT"		: {res: 0, icon: "", letter: ""},
	"THROUGH BALL": {res: 0, icon: "", letter: ""},
	"THROW IN"	: {res: 0, icon: "", letter: ""},
	"VOLUNTARY"	: {res: 0, icon: "", letter: ""},
	"WON"		: {res: 0, icon: "", letter: ""},
	"WOODWORK"	: {res: 0, icon: "", letter: ""},
	"YELLOW"	: {res: 9, icon: "", letter: "Y"},
}