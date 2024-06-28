# Interactive time-series exploration of football player positions

Open `website/index.html` and upload the JSON file.

(Or open the online version at https://louiseppler.github.io/FootballPlayerPositions/index.html)

The webpage accepts the file as a zip as well, but decompressing in the browser is slow and it is recommended to decompress the file before uploading

### Delaunay Playground

Open `delaunay.html` to view the delaunay playground (or online [here](https://louiseppler.github.io/FootballPlayerPositions/website/delaunay.html))

# Preparing the JSON file

The JSON file that is uploaded to the webpage must have the following format:

```
{
    {
        "frameRate": Number,
        "periods": [
            {
                "startFrame": Number
                "endFrame": Number
            }
        ]
    }
    "pitch": {
        "length": Number (in meters),
        "width": Number (in meters)
    },
    "homeTeam": {
        "name": String (optional),
        "colorNumber": Color (optional),
        "ColorShirt": Color (optional)
    players: [
              {
                id: String
                shirtNumber: Number / Short String
                isGoalie: Boolean
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
       (optional)
          {
                type: String
                team: Number (1 or 2)
                frame: Number
         }
    ],
    "tracking": [
        {
                frame: Number
                timestamp: Number (in milliseconds of current period)
                possession: Number (0,1 or 2) (optinal)
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
For the optional fields, the website will provide a default value if they are not defined (except for the events and possessions).

```
Colors are represented with a string in hex including a hashtag. For example (`#F8EBEA`).

The field `teamAway` follows the same format as `teamHome`. The `id` in the `objects` of the tracking data must match either the `ballId` or the `id` of one of the players.


The tracking fields contain a frame `timestamp` and a `frame` number. The timestamp expects the number indicating the time in the current period (in milliseconds). The frame number is used to sync up the events provided in the `events` field.

In the array `tracking` the field `possession` takes either `0` for no team has possession, `1` if the home team has possession and `2` if the away team has possession.

In the `events` field, the team is represented with a number. `1` for the home team and `2` for the away team. The event type accepts the following types:
- `"OFF_TARGET"`
- `"ON_TARGET"`
- `"GOAL"`
- `"YELLOW"`
- `"RED"`
- `"CORNER"`
- `"CORNER_L"`
- `"CORNER_R"`

The `row` field in the `players` array can be used to override the default ordering of the players in the position plot.

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

# Adding a URL Parameter

The data can be hosted on a server and the webpage can automatically load it from there. For this, the URL must be encoded with `encodeURIComponent()` function and then added to the `data` field. For example:
```
https://louiseppler.github.io/FootballPlayerPositions/website/index.html?data=https%3A%2F%2Fwww.linkToData.com 
```

