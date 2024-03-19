class Role {
    constructor() {
        //-1: none, 1,5: extrema, 3: middle
        this.x_role = -1;
        this.y_role = -1;
    }

    getRoleLabel() {
        //TODO: return "LF","LCM", etc

        if(this.x_role == -1 || this.y_role == -1) {
            return ""
        }

        var names = [
            [],
            ["","LF","LCF","CF","RCF","RF"],
            ["","LF","LAM","CAM","RAM","RF"],
            ["","LM","LCM","CM","RCM","RM"],
            ["","LB","LDM","CDM","RDM","RB"],
            ["","LB","LCB","CB","RCB","RB"]
        ];

        return names[this.x_role][this.y_role];
    }

    getColorX() {
        if(this.x_role == -1) {
            return "#000"
        }
        
        const colors = ["#000","#8E6713","#BBA471","#A9A9A9","#A1AB71","#627313"];
        return colors[this.x_role];
    }

    getColorY() {
        if(this.y_role == -1) {
            return "#000"
        }
        
        const colors = ["#000","#B7352D","#D48681","#A9A9A9","#7A9DCF","#215CAF"];
        return colors[this.y_role];
    }
}