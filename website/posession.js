class Possesion {
    constructor(data) {
        console.log("Computing Posessions");
        this.teamA = this.constructArray(data, "Team A");
        this.teamB = this.constructArray(data, "Team B");
        console.log("Done");
    }

    constructArray(data, team) {
        var array = [];

        var j = 0;
        var value = 0;

        for(var i = 0; i < data.length; i++) {

            //1,1,One,Team A,IN_POSSESSION,361,1124
            if(data[i][3] == team && data[i][4] == "IN_POSSESSION") {
                var start = data[i][5];
                var end = data[i][6];
                
                for(; j < start; j++) {
                    array.push(value);
                }
                value += 1;
                for(; j < end; j++) {
                    array.push(value);
                }
                value += 1;
            }
        }

        return array
    }
}