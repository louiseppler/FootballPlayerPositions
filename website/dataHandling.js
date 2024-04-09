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
	complete: function(results) {
		//console.log(results.data);
		tracking_data = results.data

		
		overviewTeamA.computeAllRoles();
	}
});

$.getJSON(eventsLink, function(data) {
	for(object in data.data) {
		
	}
});



