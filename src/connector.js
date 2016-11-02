'use-strict';

var net = require('net');
var fs = require('fs');
var pstr = "BitTorrent protocol";
var reserved = [0, 0, 0, 0, 0, 0, 0, 0];

var BLOCK_LENGTH = Math.pow(2, 14);


var Connector = function (torrent) {
    this.torrent = torrent;
    this.pstrlen = pstr.length; 

    this.piece_index = 0;
    this.piecesWorkedOn = []

    this.pieces_have = [];
    
    this.max_peers = 50;

    this.connect();
}

Connector.prototype.connect = function () {
    var peers = this.torrent.peers;

    var a = new Buffer(reserved);
    var b = new Buffer(pstr);
    var pstrLenBuff = new Buffer([19]);
    var pstrBuff = new Buffer(pstr);
    var reservedBuff = new Buffer(reserved);
    var hashBuff = new Buffer(this.torrent.info_hash_hex, 'hex');
    var peer_idBuff = new Buffer(this.torrent.peer_id_string, 'hex');

    var messageBuffer = Buffer.concat([pstrLenBuff, pstrBuff, reservedBuff, hashBuff, peer_idBuff]);

    for (var i = 0; i < this.max_peers; i++){
        peers[i].conn = this;
        peers[i].handshake(messageBuffer);    
    }
}

Connector.prototype.onhandshake = function (peer) {
    var self = this;

    peer.startPiece();

    peer.on('unchoke', () => {
        var index, begin;
        index = self.pickPiece();
        //value of a piece amount done
        begin = self.piecesWorkedOn[index];

        peer.request(index, begin, BLOCK_LENGTH);
    });

    peer.on('block', (block) => {
        console.log('got block. Piece ' + block.piece + ' length ' + block.data.length);


        if (typeof self.pieces_have[block.piece] === 'undefined') {
            self.pieces_have[block.piece] = [];
        }

        var buff = new Buffer(self.pieces_have[block.piece]);
        var buff1 = new Buffer(block.data);

        self.pieces_have[block.piece] = Buffer.concat([buff, buff1]);

        self.piecesWorkedOn[block.piece] += block.data.length;
        console.log('TOTAL piece ' + block.piece + ' : ' + self.piecesWorkedOn[block.piece]);
        if (self.piecesWorkedOn[block.piece] === this.torrent.piece_length) {
            //TODO check piecehashc check
            //TODO Figure how to get not full piece
            
            fs.appendFileSync('aa.txt', 'PIECE ' + block.piece + ' is finished\r\n')

            //self.pieces_have[block.piece] += block.data;

            if (block.piece === 1) {
                console.log('');
            }

            for (var i = 0; i <= self.torrent.piece_count; i++) {
                if (self.piecesWorkedOn[i] !== self.torrent.piece_length)
                    break;
                else if (/*self.piecesWorkedOn[i] === -1 &&*/ self.pieces_have[i] !== -1) {
                    fs.appendFileSync(self.torrent.name, self.pieces_have[i]);
                    self.pieces_have[i] = -1;
                }
            }
            //self.piecesWorkedOn[block.piece] = -1;


            //Get new piece and go from there
            var index, begin;
            index = self.pickPiece();
            begin = self.piecesWorkedOn[index];

            peer.request(index, begin, BLOCK_LENGTH);
            
        } else {
            peer.request(block.piece, self.piecesWorkedOn[block.piece], BLOCK_LENGTH);
        }
    });

}

//TODO implement some kind of algorithm to pick pieces better. PRIORITY
Connector.prototype.pickPiece = function () {
    //Sent index of a piece that wasnt worked on at all
    for (var i = 0; i < this.torrent.piece_count; i++) {
        if (typeof this.piecesWorkedOn[i] === 'undefined') {
            this.piecesWorkedOn[i] = 0;
            return i;
        }
        //else if (this.piecesWorkedOn[i] !== -1) {
        //    return i;
        //}
    }

    //Else sent an unfinished piece index
    for (var i = 0; i < this.torrent.piece_count; i++) {
        if (this.piecesWorkedOn[i] !== -1)
            return i;
    }
}

//NOT NEEDED
function createFile(torrent) {
    var fileName = torrent.name;
    var file_left = torrent.file_length;

    for (var i = 0; i < torrent.piece_count; i++) {
        var arr;
        if (file_left < torrent.piece_length) {
            arr = new Array(file_left);
        } else {
            arr = new Array(torrent.piece_length);
            file_left -= torrent.piece_length
        }
        var arr = arr.fill(255);

        var buff = new Buffer(arr);

        fs.appendFileSync(fileName, buff);
    }
}

module.exports = Connector;