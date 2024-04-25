# Football Player Positions

This project is still in it's initial development. Therefor things will change and the project contains various known bugs.

## Setup

### Installing Node.js
To be able to use the website a local server needs to run. This is implemented using Node.js. $
This can be installed via with [Homebrew](https://nodejs.org/en/download) (for macos) or form [nodejs.org]([url](https://nodejs.org/en/download))
Once node is installed following node packages are used: [Filesystem](https://www.npmjs.com/package/file-system), [Path](https://www.npmjs.com/package/path) and [Http-Server](https://www.npmjs.com/package/http-server).
These packages can be installed with `npm install <package-name>`

### Adding the data
As github doesn't support big files the tracking data has to be added manually at `server/data/tracking.csv`
This is a file with following header `id,match_id,half,frame_id,timestamp,object_id,x,y,z,is_alive`
(Currently the frames 0-143761 are considered. If the files has fewer frames the website will crash)

## Running

To start the server run `node server/server.js` or `./server/start_server.command` (on macos).
Then open `website/index.html` or `website/delauny.html` to view the project
