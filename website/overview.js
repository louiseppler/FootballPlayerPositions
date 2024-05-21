var rolesTeamA = null
var substitutionFrames = [];

class OverviewData {

    constructor(team) {
        this.team = team

        this.roles = []

        //stores the frames number of when a substitution happens
        //including 0 and maxFrame number (helps with edge case calculations)
        this.substitutionFrames = []
        this.substitutionFrames.push(0);
        
        this.substitutionIndices = []
        
        
        //dictionary mapping player id to drawn index
        this.playerIndices = {};

        this.dataComputed = false;

        this.dataComputedUntil = minFrame;
    }

    computeChunk(size) {
        for(var i = this.dataComputedUntil; i < this.dataComputedUntil+size; i++) {
            if(i > maxFrame) {
                this.finishComputation();
                return;
            }

            this.computeFrame(i)
        }
        this.dataComputedUntil += size;
    }

    finishComputation() {
        this.substitutionFrames.push(maxFrame);        
        this.computePlayerOrdering(this.substitutionFrames);
        this.dataComputed = true;
    }

    computeFrame(i) {
        const [points, isReversed, playerIDs] = getGamePoints(i, this.team);
        if(points == null) return;
        const roles = shapeGraphMain(points, isReversed, false, playerIDs);

        var hasSubstitution = false;

        var prevRoles = []
        if(i != 0) {
            prevRoles = this.roles[i-1];
        }

        for(var j = 0; j < roles.length; j++) {
            if(prevRoles.length < roles.length) continue;

            roles[j].updateRoleCount(prevRoles[j].roleCount);

            if(roles[j].playerID != prevRoles[j].playerID) {   
                hasSubstitution = true;
            }
            if(roles[j].playerID == null) {
                hasSubstitution = true;

            }
        }

        if(i % Math.round(maxFrame/10) == 0) {
            console.log("" + Math.round(i/maxFrame*100) + "%");
        }

        if(hasSubstitution) {
            this.substitutionFrames.push(i);
        }

        this.roles.push(roles.slice())
    }

    computeAllRoles() {
        console.log("Starting role computation");

        for(var i = minFrame; i < maxFrame; i++) {
            this.computeFrame(i)
        }   

        this.substitutionFrames.push(maxFrame);

        console.log("Computed Roles!");
        console.log("substitutionFrames " + substitutionFrames);
        
        this.computePlayerOrdering(this.substitutionFrames);

        this.dataComputed = true;

        console.log(this.substitutionFrames);
    }

    /**
     * Computes `playerIndices` to determine in which order the players should be displayed
     * @param {*} substitutionFrames Array of all substitutionFrame numbers including 0, and maxFrame
     */
    computePlayerOrdering(substitutionFrames) {
        var substitutionIndices = [];
        var playerPair = [];
        var firstSubIndex = substitutionFrames[1];

        // === Initial Sorting ===

        for(var j = 0; j < this.roles[0].length; j++) {
            var roleNr = Role.getMostFrequentRoleIndex(this.roles[0][j].roleCount, this.roles[firstSubIndex][j].roleCount);
            playerPair.push([this.roles[0][j].playerID, roleNr]);
        }

        playerPair.sort((a, b) => a[1] - b[1]);

        for(var i = 0; i < playerPair.length; i++) {
            this.playerIndices[playerPair[i][0]] = i;
        }

        // === for each substitution ===

        for(var i = 1; i < substitutionFrames.length-1; i++) {
            var framePrev = substitutionFrames[i-1]+1;
            var frame = substitutionFrames[i];
            var frameNext = substitutionFrames[i+1]-1;

            var newPlayers = this.roles[frame+1].map((x) => x.playerID);

            var oldIndices = [];
            var freeIndices = [];
            // for(var j = 0; j < rolesTeamA[frame+1].length; j++) {indicesUsed.push(false); }


            for(var j = 0; j < this.roles[frame-1].length; j++) {
                var playerID = this.roles[frame-1][j].playerID
                if(newPlayers.includes(playerID) == false) {
                    oldIndices.push([j,this.playerIndices[playerID]]);
                }
            }

            for(var j = 0; j < this.roles[frame+1].length; j++) {
                var playerId = this.roles[frame+1][j].playerID
                var index = this.playerIndices [playerId];
                if(index == null) {
                    freeIndices.push([j, playerId])
                }
            }

            substitutionIndices.push(oldIndices.map((x) => x[1]));

            // a matrix representing a score of similarity if
            // player would take player k would take position j (scoreMatrix[j][k])
            var scoreMatrix = [];
        
            //only needs to be computed if several substitutions
            if(oldIndices.length > 1) {
                for(var j = 0; j < oldIndices.length; j++) {
                    scoreMatrix.push([]);
                    for(var k = 0; k < freeIndices.length; k++) {
                        var a1 = oldIndices[j][0];
                        var a2 = freeIndices[k][0];
                        var rolePrev = Role.getMostFrequentRoleIndex(this.roles[framePrev][a1].roleCount,this.roles[frame+1][a1].roleCount)
                        var roleNext = Role.getMostFrequentRoleIndex(this.roles[frame+1][a2].roleCount, this.roles[frameNext][a2].roleCount)
                        var score = Role.similarity(rolePrev,roleNext);

                        scoreMatrix[j].push(score);
                    }
                }
            }

            while(scoreMatrix.length > 1 && scoreMatrix[0].length > 1) {
                var minVal = 1000;
                var minJ = 0;
                var minK = 0;

                for(var j = 0; j < scoreMatrix.length; j++) {
                    for(var k = 0; k < scoreMatrix[j].length; k++) {
                        var val = scoreMatrix[j][k];
                        if(val < minVal) {
                            minVal = val;
                            minJ = j;
                            minK = k;
                        }
                    }
                }

                this.playerIndices[freeIndices[minK][1]] = oldIndices[minJ][1];

                scoreMatrix.splice(minK, 1); //remove minK
                for(var j = 0; j < scoreMatrix.length; j++) {
                    scoreMatrix[j].splice(minJ, 1); //remove minJ
                }
                freeIndices.splice(minK,1);
                oldIndices.splice(minJ,1);


                console.log(scoreMatrix);
            }

            //for the last case, not scores need to be compared
            this.playerIndices[freeIndices[0][1]] = oldIndices[0][1];

            this.substitutionIndices = substitutionIndices;
        };

    }
}