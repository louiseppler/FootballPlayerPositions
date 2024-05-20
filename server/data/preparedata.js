const fs = require('node:fs');


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

  console.log(JSON.stringify(output));

});