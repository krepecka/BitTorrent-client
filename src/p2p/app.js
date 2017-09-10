'use-strict';

var TorrentFile = require('./torrent-file');
var readline = require('readline');
var fs = require('fs');
var Connector = require('./connector');

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

var torrent = new TorrentFile();

console.log('Enter a .torrent full file path:');

//rl.on('line', function (line) {
	line = "/home//krepecka/Downloads/Ted 2 2015 NEW UNCENSORED 720p HC HDRIP x264 AC3 TiTAN.mkv.torrent";
	// line = "/home//krepecka/Downloads/Rick.and.Morty.S03E06.Rest.and.Ricklaxation.720p.Amazon.WEB-DL.DD+5.1.H.264-QOQ.torrent"
	if (checkFile(line)) {
        torrent.path = line;
		torrent.readData();
	}
// });

torrent.on('ready', function () {
	console.log('readdddy')
    var connector = new Connector(torrent);   
});

function checkFile(filePath) {
	var parts = filePath.split('.');
	if (parts[0].length < 1 || parts[parts.length - 1] !== 'torrent') {
		console.log("Enter a valid .torrent format file!");
		return false;
	}	

	fs.stat(filePath, function (err, stats) {
		if (err) {
			console.log(err);
			return false;
		}
		if (!stats.isFile()){
			console.log("The file specified isn't an actual file!");
			return false;
		}
		if (stats.size === 0) {
			console.log("The file is empty");
			return false;
		}
	});

	return true;
} 
