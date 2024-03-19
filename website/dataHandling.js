var csvLink = 'http://127.0.0.1:8080/data/playdirection.csv';
var link2 = 'file://./dataplaydirection.csv'
var link3 = "http://127.0.0.1:8125/data/playdirection.csv"

Papa.parse(link3, {
	download: true,
	complete: function(results) {
		console.log(results.data);
	}
});