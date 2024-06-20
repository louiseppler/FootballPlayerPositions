# Football Player Positions

Open `index.html` and upload the JSON file.

The webpage accepts the file as a zip as well, but decompressing in the browser is slow and it is recommended to decompress the file before uploading

# Preparing the JSON file

The JSON file that is uploaded to the webpage must have the following format:

```
{
 {
 "frameRate": Number,
 "periods": [
 {
 firstFrame: Number
 lastFrame: Number
 }
 ]
 }
 "pitch":{
 "length": Number (in meters),
 "width": Number (in meters)
 },
 "homeTeam": {
 "name": String (optional),
 "colorNumber": Color (optional),
 "ColorShirt": Color (optional)
 players: [
 {
 id: "P1234"
 shirtNumber: 12
 isGoalie: false
 row: Number (optional)
 },
 ]
 },
 "awayTeam": {
 ...
 },
 "ballId": String
 "colorPalette: {
 (optional)
 ...
 }
 "events" : [
 {
 type: String
 team: Number (1 or 2)
 frame: Number
 }
 ]
 "tracking" : [  
 {
 frame:xv
 possession: Number (0,1 or 2)
 objects: [
 {
 id: String
 h: Number
 v: Number
 z: Number
 }
 ]
 }
 ]
}
Colors are represented with a string in hex including a hashtag. For example (`#F8EBEA`).

```
The field `teamAway` follows the same format as `teamHome`. 

In the `events` field, the team is represented with a number. `1` for the home team and `2` for the away team. The event type accepts the following types:
- `"OFF_TARGET"`
- `"ON_TARGET"`
- `"GOAL"`
- `"YELLOW"`
- `"RED"`
- `"CORNER"`
- `"CORNER_L"`
- `CORNER_R"`

In the array `tracking` the field `possession` takes either `0` for no team has possession, `1` if the home team has possession and `2` if the away team has possession.

The field `colorPalette` is optional and takes the following fields:

```
"colorPalette": {
 L: Color
 LC:: Color
 C: Color
 RC: Color
 R: Color
 F: Color
 AM: Color
 M: Color
 DM: Color
 B: Color
}
```