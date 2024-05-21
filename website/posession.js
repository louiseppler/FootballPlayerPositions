class Possession {
    constructor() {
        console.log("Computing Posessions");
        this.teamA = this.constructArray(gameData.possessions.team1);
        this.teamB = this.constructArray(gameData.possessions.team2);
        console.log("Done");
    }

    constructArray(data) {
        var array = [];

        var j = 0;
        var value = 0;

        for(var i = 0; i < data.length; i += 2) {
            var start = data[i*2];
            var end = data[i*2+1];
            
            for(; j < start; j++) {
                array.push(value);
            }
            value += 1;
            for(; j < end; j++) {
                array.push(value);
            }
            value += 1;
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