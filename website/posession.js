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

    /**
     * Returns true if team was in possesion of the ball within the interval
     * @param {*} frameA frame at beginning
     * @param {*} frameB frame at end
     * @param {*} team team as int
     * @returns 
     */
    isInPossesion(frameA, frameB, team) {
        if(team == 1) {
            return (this.teamA[frameA] % 2 == 1 || this.teamA[frameB]-this.teamA[frameA] > 0)
        }
        else {
            return (this.teamB[frameA] % 2 == 1 || this.teamB[frameB]-this.teamB[frameA] > 0)  
        }
    }

    /**
     * Returns true if team never was in possesion of the ball within the interval
     * @param {*} frameA frame at beginning
     * @param {*} frameB frame at end
     * @param {*} team team as int
     * @returns 
     */
    outOfPossesion(frameA, frameB, team) {
        if(team == 1) {
            return (this.teamA[frameB]-this.teamA[frameA] == 0 && this.teamA[frameA] % 2 == 0)
        }
        else {
            return (this.teamB[frameB]-this.teamB[frameA] == 0 && this.teamB[frameA] % 2 == 0)
        }
    } 
}