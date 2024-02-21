class Role {
    constructor() {
        //-1: none, 1,5: extrema, 3: middle
        this.x_role = -1;
        this.y_role = -1;
    }

    getRoleLabel() {
        //TODO: return "LF","LCM", etc

        return "--";
    }

    getColor() {
        if(this.x_role == -1) {
            return "#000"
        }
        
        const colors = ["#000","#8E6713","#BBA471","#A9A9A9","#A1AB71","#627313"]
        return colors[this.x_role]
    }
}