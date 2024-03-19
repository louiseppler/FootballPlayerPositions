var link = "http://127.0.0.1:8125/data/tracking_small.csv"
var link2 = "http://127.0.0.1:8125/data/tracking.csv"


var tracking_data = null

var game = {
	pitch: {
		width: 105.0,
		height: 68.0
	},
	players: {
		teamA: ["P3578","P3568","P3569","P3570","P3571","P3572","P3573","P3574","P3575","P3576","P3577","P3579","P3580","P3581","P3582","P3583"],
		teamB: ["P3584","P3595","P3585","P3586","P3587","P3588","P3589","P3590","P3591","P3592","P3593","P3594","P3596","P3597","P3696","P3697","P3698","P3699","P3700"]
	}
}

Papa.parse(link2, {
	download: true,
	complete: function(results) {
		//console.log(results.data);
		tracking_data = results.data
	}
});




