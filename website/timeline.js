class TimeEvent { 
    /**
     * 
     * @param {Int}} time frame number of event
     * @param {String} type type of frame
     * @param {Int} team team number, either 0 or 1
     */
    constructor(time, type, team) {
        this.time = time;
        this.type = type;
        this.team = team;
    }
}


/*
cases of the match

case advantage = "ADVANTAGE"
    case aerial = "AERIAL"
    case ballLost = "BALL LOST"
    case ballOut = "BALL OUT"
    case blocked = "BLOCKED"
    case card = "CARD"
    case carry = "CARRY"
    case challenge = "CHALLENGE"
    case clearance = "CLEARANCE"
    case cornerKick = "CORNER KICK"
    case cross = "CROSS"
    case deepBall = "DEEP BALL"
    case direct = "DIRECT"
    case dribble = "DRIBBLE"
    case endHalf = "END HALF"
    case fault = "FAULT"
    case faultReceived = "FAULT RECEIVED"
    case forced = "FORCED"
    case freeKick = "FREE KICK"
    case goal = "GOAL"
    case goalKick = "GOAL KICK"
    case ground = "GROUND"
    case handBall = "HAND BALL"
    case head = "HEAD"
    case interception = "INTERCEPTION"
    case kickOff = "KICK OFF"
    case lost = "LOST"
    case nameINDIRECT = "INDIRECT"
    case offTarget = "OFF TARGET"
    case offside = "OFFSIDE"
    case onTarget = "ON TARGET"
    case out = "OUT"
    case pass = "PASS"
    case penalty = "PENALTY"
    case recovery = "RECOVERY"
    case red = "RED"
    case refereeHit = "REFEREE HIT"
    case retaken = "RETAKEN"
    case saved = "SAVED"
    case setPiece = "SET PIECE"
    case shot = "SHOT"
    case tackle = "TACKLE"
    case theft = "THEFT"
    case throughBall = "THROUGH BALL"
    case throwIn = "THROW IN"
    case voluntary = "VOLUNTARY"
    case won = "WON"
    case woodwork = "WOODWORK"
    case yellow = "YELLOW"
*/