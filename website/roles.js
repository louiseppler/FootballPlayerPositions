class Role {
    constructor() {
        //-1: none, 1,5: extrema, 3: middle

        //-2,-1,0,1,2  --  -3 = null
        this.x_role = -3;
        this.y_role = -3;
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

    static colorsX = ["#B7352D","#D48681","#A9A9A9","#7A9DCF","#215CAF"];

    getColorX() {
        return Role.colorsX[this.x_role+2];
    }

    //static colorsY = ["#000","#8E6713","#BBA471","#A9A9A9","#A1AB71","#627313"];
    static colorsY = ["#627313","#A1AB71","#A9A9A9","#BBA471","#8E6713"];


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
}