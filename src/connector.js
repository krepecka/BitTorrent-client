'use-strict';

var net = require('net');
var fs = require('fs');
var randomAccessFile = require('random-access-file');
var pstr = "BitTorrent protocol";
var reserved = [0, 0, 0, 0, 0, 0, 0, 0];

var all_pieces_touched = false;

var BLOCK_LENGTH = Math.pow(2, 14);

var Piece = function () {
    this.piece_data = [];
    this.piece_done = 0;
    this.piece_busy = false;
}

var Connector = function (torrent) {
    this.torrent = torrent;
    this.pstrlen = pstr.length;

    this.pieces = new Array(torrent.piece_count).fill(null);

    this.pieces = this.pieces.map(() => { return new Piece() });

    this.pieces_have = [];

    this.max_peers = 40;

    this.peers = [];

    this.file = randomAccessFile(torrent.name);

    this.handshake = this.gen_handshake(pstr, reserved, this.torrent.info_hash_hex, this.torrent.peer_id_string);

    this.connect();
}

Connector.prototype.gen_handshake = function (pstr, reserved, info_hash, peer_id_string) {
    var pstrLenBuff = new Buffer([19]);
    var pstrBuff = new Buffer(pstr);
    var reservedBuff = new Buffer(reserved);
    var hashBuff = new Buffer(info_hash, 'hex');
    var peer_idBuff = new Buffer(peer_id_string, 'hex');

    var messageBuffer = Buffer.concat([pstrLenBuff, pstrBuff, reservedBuff, hashBuff, peer_idBuff]);

    return messageBuffer;
}

Connector.prototype.connect = function () {
    var peers = this.torrent.peers;

    peers.map((peer) => {
        peer.handshake(this.handshake);
        peer.on('handshook', () => {
            this.peers.push(peer);
            this.peer_master(peer);
        })
    })
    setInterval(this.renewPieces, 40000, this);
}

Connector.prototype.peer_master = function (peer) {
    var self = this;

    peer.startPiece();

    peer.on('unchoke', function() {
        self.peer_unchocked(this);
    });

    peer.on('dropped', function () {
        console.log('DROPPED' + this.curr_index)
        self.pieces[this.curr_index].piece_busy = false;
    });

    peer.on('block', (block) => {
        var piece = self.pieces[block.piece];

        var buff = new Buffer(piece.piece_data);
        var buff1 = new Buffer(block.data);

        self.pieces[block.piece].piece_data = Buffer.concat([buff, buff1]);
        piece.piece_done += block.data.length;

        console.log('TOTAL piece ' + block.piece + ' : ' + piece.piece_done);

        //PIECE FINISHED
        if (piece.piece_done === this.torrent.piece_length) {
            //TODO check piecehashc check
            //TODO Figure how to get not full piece

            fs.appendFileSync('aa.txt', 'PIECE ' + block.piece + ' ' + this.torrent.piece_length + ' is finished\r\n')

            this.file.write(block.piece * this.torrent.piece_length, piece.piece_data);
            piece.piece_data = [];

            //Get new piece and go from there
            var index, begin;
            index = self.pickPiece();

            if (index !== -1) {
                begin = self.pieces[index].piece_done;
                peer.request(index, begin, BLOCK_LENGTH);
            }

        } else {
            peer.request(block.piece, piece.piece_done, BLOCK_LENGTH);
        }
    });

}

//TODO implement some kind of algorithm to pick pieces better. PRIORITY
Connector.prototype.pickPiece = function () {

    //Sent index of a piece that wasnt worked on at all
    for (i = 0; i < this.torrent.piece_count; i++) {
        if (this.pieces[i].piece_busy === false) {
            this.pieces[i].piece_busy = true;
            return i;
        }
    }
    all_pieces_touched = true;
    return -1;
}

Connector.prototype.peer_unchocked = function (peer) {
    var index, begin;
    index = this.pickPiece();

    //value of a piece amount done
    if (index !== -1) {
        begin = this.pieces[index].piece_done;
        peer.request(index, begin, BLOCK_LENGTH);
    }
}

Connector.prototype.renewPieces = function (self) {
    if(!all_pieces_touched){
        return;
    }

    for (var i = 0; i < self.torrent.piece_count; i++) {
        var piece = self.pieces[i];

        if (piece.piece_done !== self.torrent.piece_length) {
            piece.piece_busy = false;
            piece.piece_data = [];
            piece.piece_done = 0;
        }
    }

    for (var i = 0; i < self.peers.length; i++) {
        self.peer_unchocked(self.peers[i]);
    }
}

module.exports = Connector;