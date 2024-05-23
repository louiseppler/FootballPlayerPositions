const fs = require("fs");
const { parse } = require("csv-parse");

var array = [];
var events = null;


fs.createReadStream("./tracking.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    array.push([row[3],row[2],row[5],row[6],row[7],row[8]])
  })
  .on("end", function () {
    //console.log(JSON.stringify(array))
    console.log("Finished with tracking data");
    readEvents()
  })
  .on("error", function (error) {
    console.log(error.message);
  });

function getType(data) {
    var team = 1;
    if(data.team.id == "FIFATMB") team = 2;

    var time = data.start.frame;

    if(data.subtypes != null && data.subtypes.name == "CORNER KICK") {
        return {type: "CORNER", team: team, frame: time};
    }
    if(data.subtypes != null &&  data.subtypes.name == "GOAL KICK") {
        return {type: "GOAL", team: team, frame: time};
    }
    if(data.subtypes != null && data.subtypes.name == "YELLOW") {
      return {type: "YELLOW", team: team, frame: time};
    }
    if(data.subtypes != null && data.subtypes.name == "RED") {
      return {type: "RED", team: team, frame: time};
    }
    if(data.type.name == "SHOT") {
        if(data.subtypes instanceof Array) {
            for(var subtype of data.subtypes) {
                if(subtype.name == "ON TARGET") {
                    return {type: "ON_TARGET", team: team, frame: time};

                }
                if(subtype.name == "OFF TARGET") {
                    return {type: "OFF_TARGET", team: team, frame: time};
                }
            }
        }
    }

    return null;
}


function readEvents() {
    fs.readFile('events.json', 'utf8', (err, dataRaw) => {
        if (err) {
          console.error(err);
          return;
        }
      
        var data = JSON.parse(dataRaw) 
        
        var output = []
      
        for(var event of data.data) {
          var type = getType(event);
          if(type != null) {
             output.push(type)
          }
        }
      
        events = output;

        readPossession();


        //console.log(JSON.stringify(output));
      });
}

poss1 = [];
poss2 = [];

function readPossession() {
  fs.createReadStream("./phase.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {

    if(row[4] == "IN_POSSESSION") {
      if(row[3] == "Team A") {
        poss1.push(row[5],row[6])
      }
      else {
        poss2.push(row[5],row[6])
      }
    }

  })
  .on("end", function () {
    //console.log(JSON.stringify(array))
    console.log("Finished with phase data");
    readRest()
  })
  .on("error", function (error) {
    console.log(error.message);
  });

}

function readRest() {
    fs.readFile('data_small.json', 'utf8', (err, dataRaw) => {
        if (err) {
          console.error(err);
          return;
        }
      
        var data = JSON.parse(dataRaw) 
        
        data.events = events;
        data.tracking = array;
        data.possessions = {}
        data.possessions.team1 = poss1
        data.possessions.team2 = poss2
        

        fs.writeFile('data.json', JSON.stringify(data), function (err) {
            if (err) throw err;
            console.log('File is created successfully.');
          });
      });
  }