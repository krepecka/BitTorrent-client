'use-strict';

var fs = require('fs');
var http = require('http');
var bencode = require('bencode');
var urlencode = require('urlencode');
var crypto = require('crypto');
var Peer = require('./peer');

var sha1 = function (data) {
    return crypto.createHash('sha1').update(data, 'ascii').digest('hex')
}

var TorrentFile = function (filePath) {
    this.path = filePath;
    this.buffer = [];

    this.tracker_url = '';
    this.traker_min_interval = 0;
    this.tracker_interval = 0;

    this.name = '';

    this.pieces_hash = '';
    this.info_hash_hex = '';
    this.info_hash_url = '';

    this.piece_length = 0;
    this.file_length = 0;
    this.piece_count = 0;

    this.peer_id = '%47%50%30%32%48%59%45%55%4F%58%43%48%4E%4E%50%45%41%45%48%47';
    this.peer_id_string = '47503032485945554F5843484E4E504541454847';
    this.peers = [];

}

TorrentFile.prototype.readData = function () {
    var data = fs.readFileSync(this.path);
    var info_hash = data.slice(data.indexOf('info')+4, data.length - 1);

    this.info_hash_hex = sha1(info_hash);

    this.info_hash_url = urlencode(this.info_hash_hex, 'hex');

    var decoded = bencode.decode(data, 'utf-8');
    this.tracker_url = decoded.announce;
    this.pieces_hash = decoded.info.pieces;

    this.file_length = decoded.info.length;
    this.name = decoded.info.name;
    this.piece_length = decoded.info["piece length"];

    this.piece_count = Math.ceil(this.file_length / this.piece_length)

    return this.getTrackerInfo();
}

TorrentFile.prototype.getTrackerInfo = function () {
    return new Promise((resolve, reject) => {
        var buff = new Buffer(this.pieces_hash, 'ascii');
        var infohash = urlencode(this.pieces_hash, 'utf-8');
        var URL = this.tracker_url + '?info_hash=' + this.info_hash_url +
            '&peer_id=' + this.peer_id +
            '&port=' + '6881' +
            '&uploaded=0' +'&downloaded=0'+
            '&left=' + this.file_length +
            '&event=' + 'started';
        var me = this;
        var respData = [512];

        try {
            http.get(URL, function (response) {
                response.on('data', function (chunk) {
                    respData = chunk;
                    // console.log('woott')
                });

                response.on('end', function () {
                    var buff = new Buffer(respData);
                    var str = buff.toString()
                    var decoded = bencode.decode(respData);

                    if (typeof decoded["failure reason"] !== 'undefined') {
                        reject(decoded["failure reason"]);
                    }

                    me.traker_min_interval = decoded["min interval"];
                    me.tracker_interval = decoded.interval;

                    resolve(me.createPeers(decoded.peers));
                });
            }).on('error', function (err) {
                reject(err);
            });
        } catch (err) {
           reject(err);
        }
    })
}


TorrentFile.prototype.createPeers = function (peerData) {
    var arr = peerData;
    var num = 1;

    for (var i = 0; i < arr.length; i = i + 6) {
        var ip = (arr[i] & 0xff) + '.' + (arr[i + 1] & 0xff) + '.' + (arr[i + 2] & 0xff) + '.' + (arr[i + 3] & 0xff);
        var port = (arr[i + 4] * 256) + arr[i + 5];

        this.peers.push(new Peer(ip, port, num));
        num++;
    }
    return 'peers-ready';
}

module.exports = TorrentFile;