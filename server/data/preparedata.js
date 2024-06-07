const fs = require("fs");
const { parse } = require("csv-parse");

var array = [];
var events = null;

var frameObject = null;

var TEMP_MAX = 50;

var count = 0;
var ownFrameCount = 0;

var firstFrame = null;
var changingFrame = null;
var lastFrame = null;

fs.createReadStream("./tracking.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {

    //if(array.length > TEMP_MAX) return;

    var frame = row[4];

    count++;

    if(count*23 % 100000 == 0) {
      console.log("Frame " + frame);
    }

    if(firstFrame == null) {
      firstFrame = ownFrameCount;
    }
    if(changingFrame == null && row[2] != "One") {
      changingFrame = ownFrameCount;
    }
    lastFrame = ownFrameCount;

    if(frameObject == null) {
      frameObject = {};
      frameObject.frame = frame;
      frameObject.possession = 0;
      frameObject.objects = [];
    }
    else if(frameObject.frame != frame) {
      array.push(frameObject);
      ownFrameCount += 1;
      frameObject = {};
      frameObject.frame = frame;
      frameObject.possession = 0;
      frameObject.objects = [];
    }
    

    var line = {
      id: row[5],
      h: row[6],
      v: row[7],
      z: row[8]
    }
    //var lines = [row[3],row[2],row[5],row[6],row[7],row[8]]
    frameObject.objects.push(line);
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
    if(data.subtypes != null && data.subtypes.name == "YELLOW") {
      return {type: "YELLOW", team: team, frame: time};
    }
    if(data.subtypes != null && data.subtypes.name == "RED") {
      return {type: "RED", team: team, frame: time};
    }
    if(data.type.name == "SHOT") {
        if(data.subtypes instanceof Array) {
            for(var subtype of data.subtypes) {
              if(subtype.name == "GOAL") {
                return {type: "GOAL", team: team, frame: time};
              }
            }
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


    var i = 0;
    var j = 0;
    var frame = 0;
    var maxFrame = array.length;

    poss1.push(maxFrame+10,maxFrame+10,);
    poss2.push(maxFrame+10,maxFrame+10,);

    for(var frame = 0; frame < maxFrame; frame++) {

      if(frame > poss1[i+1]) {
        i += 2;
      }
      if(frame > poss1[j+1]) {
        j += 2;
      }

      var p = 0;
      if(poss1[i] <= frame && frame < poss1[i+1]) {
        p = 1;
      }
      else if(poss2[j] <= frame && frame < poss2[j+1]) {
        p = 2;
      }

      array[frame].possession = p;
    }


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
        data.periods = [];
        data.periods.push({start: firstFrame, end: changingFrame-1});
        data.periods.push({start: changingFrame, end: lastFrame-1});

        //data.possessions = {}
        //data.possessions.team1 = poss1
        //data.possessions.team2 = poss2

        console.log("Frames " + firstFrame + " " + changingFrame + " " + lastFrame);
        

        fs.writeFile('data.json', JSON.stringify(data), function (err) {
            if (err) throw err;
            console.log('File is created successfully.');
          });
      });
  }