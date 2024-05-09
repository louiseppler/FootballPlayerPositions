class Role {
    constructor() {
        //-1: none, 1,5: extrema, 3: middle

        //-2,-1,0,1,2  --  -3 = null
        this.x_role = -3;
        this.y_role = -3;

        this.roleCount = [];
        for(var i = 0; i < 25; i++) {
            this.roleCount.push(0);
        }
    }

    /**
     * 
     * @returns a single number combining the values of x_role and y_role
     */
    getRoleCountIndex() {
        return (this.x_role+2)*5+this.y_role+2;
    }

    /**
     * Role count counts the occurrences of the roles since the start of the game
     * Use the difference between to frames to get the delta count
     * @param {*} oldRoles pass the roles from the previous frame
     */
    updateRoleCount(oldRoles) {
        if(oldRoles == null) return
        this.roleCount = oldRoles.slice();

        this.roleCount[this.getRoleCountIndex()] += 1;
    }

    getRoleLabel() {
        var names = [
            ["LF","LCF","CF","RCF","RF"],
            ["LF","LAM","CAM","RAM","RF"],
            ["LM","LCM","CM","RCM","RM"],
            ["LB","LDM","CDM","RDM","RB"],
            ["LB","LCB","CB","RCB","RB"]
        ];

        return names[this.x_role+2][this.y_role+2];
    }

    static colorsX = ["#B7352D","#D48681","#E2E2E2","#7A9DCF","#215CAF"];

    getColorX() {
        return Role.colorsX[this.x_role+2];
    }

    static colorsY = ["#8E6713","#D2C2A1","#E2E2E2","#C0C7A1","#627313"];
    //static colorsY = ["#627313","#A1AB71","#A9A9A9","#BBA471","#8E6713"];


    getColorY() {
        return Role.colorsY[this.y_role+2];
    }

    getDominantColor() {
        if(this.x_role == -2 || this.x_role == 2) {
            return this.getColorX();
        }
        if(this.y_role == -2 || this.y_role == 2) {
            return this.getColorY()
        }

        return "#A9A9A9"
    }

    getGrayScaleColorIndex(mode) {
        switch (mode) {
            case 0:
                if(this.x_role == -2 || this.x_role == 2) {
                    return 2;
                }
                if(this.y_role == -2 || this.y_role == 2) {
                    return 1;
                }
                return 0;

            case 1:
                if(this.x_role == -2 || this.x_role == 2) {
                    return 2;
                }
                if(this.x_role == -1 || this.x_role == 1) {
                    return 1;
                }
                return 0;
            case 2:
                if(this.y_role == -2 || this.y_role == 2) {
                    return 2;
                }
                if(this.y_role == -1 || this.y_role == 1) {
                    return 1;
                }
                return 0;
            default:
                return 0
        }
    }



    static getMostFrequentRoleIndex(startCount, endCount) {
        if(startCount == null || endCount == null) return null
    
        var max = 0;
        var maxIndex;
        for(var i = 0; i < startCount.length; i++) {
            var diff = endCount[i]-startCount[i];
            if(diff > max) {
                max = diff;
                maxIndex = i;
            }
        }
    
        return maxIndex;
    }
    
    /**
     * Computes add differences between start and end end return x,y roles of the most occurring role
     * @param {*} startCount Array representing the count at the beginning
     * @param {*} endCount Array representing the count at the end
     * @returns 
     */
    static getMostFrequentRole(startCount, endCount) {
        var maxIndex = Role.getMostFrequentRoleIndex(startCount, endCount);
        if(maxIndex == null) return [0,0];
        return [Math.floor(maxIndex/5)-2, (maxIndex%5)-2];
    }

    /**
     * Returns a number representing how similar roles are, smaller = similar
     * @param {*} indexA roles A represented as a single number
     * @param {*} indexB roles B represented as a single number
     * @returns 
     */
    static similarity(indexA, indexB) {
        var x1 = Math.floor(indexA/5);
        var y1 = (indexA%5)
        var x2 = Math.floor(indexB/5);
        var y2 = (indexB%5)

        return (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    }
}