'use-strict';

var net = require('net');
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
//var Buffer = require('buffer');

//MESSAGES

var MSG_KEEP_ALIVE = new Buffer([0x00, 0x00, 0x00, 0x00]);
var MSG_CHOKE = new Buffer([0x00, 0x00, 0x00, 0x01, 0x00]);
var MSG_UNCHOKE = new Buffer([0x00, 0x00, 0x00, 0x01, 0x01]);
var MSG_INTERESTED = new Buffer([0x00, 0x00, 0x00, 0x01, 0x02]);
var MSG_UNINTERESTED = new Buffer([0x00, 0x00, 0x00, 0x01, 0x03]);


var Peer = function (ip, port, num) {
    EventEmitter.call(this);
    
    this.ip = ip;
    this.port = port;
    this.number = num;
    this.handshook = false;

    this.am_choking = 1;
    this.am_interested = 0;
    this.peer_choking = 1;
    this.peer_interested = 0;

    this.socket = net.Socket();

    this.conn;
    this.RequestQueue;

    this.curr_block_l = 0;
    this.curr_block = [];
    this.curr_index = 0;
}

util.inherits(Peer, EventEmitter);

Peer.prototype.handshake = function (handshake) {
    var socket = this.socket;
    var self = this;

    var options = {
        port: this.port,
        host: this.ip
    }

    socket.setTimeout(150000);
    socket.connect(options, function (data) {
        socket.write(handshake);
    });
    
    socket.on('data', function (chunk) {
        //shake my hand, mate
        if (!self.handshook) {
            self.handshook = self.checkHandshake(handshake, chunk);
            if (!self.handshook) {
                console.log(self.ip + " : " + self.port + " send incorrect handshake");
                socket.destroy();
                return;
            } else {
                fs.appendFileSync('aa.txt', self.ip + ':' + self.port+ '\r\n');
            }
            self.conn.onhandshake(self);
        } else {
            self.parseMessage(chunk);
        }
    });
    
    socket.on('end', function () {
        console.log('Ended connection with ' + self.ip + ":" + self.port);
        //notify connector that the piece this peer worked on is done
        socket.destroy();
    });
    
    
    socket.on('timeout', function () {
        console.log('timedout');
    });
    
    socket.on('error', function (err) {
        console.log('Error with ' + self.ip + ":" + self.port + '. Type :' + err.code);
        //notify connector that the piece this peer worked on is done
    });      
}

Peer.prototype.startPiece = function (index, begin, length) {
    var self = this;
    var socket = this.socket;

    if (this.peer_choking) {
        this.sendmessage(MSG_INTERESTED);
    }    
}

Peer.prototype.sendmessage = function (buffer) {
    this.socket.write(buffer);    
}

Peer.prototype.parseMessage = function (message) {
    var self = this;

    var buffer = message.slice(4);
    var msgLen = message.readUInt32BE(0);
    var control = 0;


    //TODO fix this to be more readable
    if (msgLen == 1) {
        if (buffer[0] == 0) {
            control = 0
        } else if (buffer[0] == 1) {
            control = 1
        } else if (buffer[0] == 2) {
            control = 2
        } else if (buffer[0] == 3) {
            control = 3
        }
    } else if (msgLen == 5 && buffer[0] == 4) {
        control = 4
    } else if (msgLen == 13 && buffer[0] == 6) {
        control = 6
    } else if (msgLen == 13 && buffer[0] == 8) {
        control = 8
    } else if (buffer[0] == 7 && this.curr_block.length === 0) {
        control = 7
    }else if (self.curr_block.length !== self.curr_block_l) {
        control = 20
    }else {
        control = -1
    }
    

    if (buffer.length == 4)
        return;

    switch(control){
        case -1:
            self._onkeepalive()
        case -10:
            break;
        case 0:
            self._onchoke();
            break;
        case 1:
            self._onunchoke(buffer);
            break;
        case 2:
            self._oninterested();
            break;
        case 3:
            self._onuninterested();
            break;
        case 4:
            self._onhave(buffer.readUInt32BE(1));
            break;
         //Does not matter
        //case 5:
        //    self._onbitfield(buffer.slice(1));
        //    break;
        case 6:
            self._onrequest(buffer.readUInt32BE(1), buffer.readUInt32BE(5), buffer.readUInt32BE(9));
            break;
        case 7:
            //What is the block we are expecting
            self.curr_block_l = message.readUInt32BE(0) - 9;

            self._onpiece(buffer.readUInt32BE(1), buffer.readUInt32BE(5), buffer.slice(9));
            break;
        case 8:
            self._oncancel(buffer.readUInt32BE(1), buffer.readUInt32BE(5), buffer.readUInt32BE(9));
            break;
        default:
            //when it's just a part of the stream - piece(block)
            if (self.curr_block.length !== self.curr_block_l)
                self._onpiece(null, null, message);
                             
    }
    self._unknown(buffer);
    
}


Peer.prototype.checkHandshake = function (handshake, received) { 
    var success = true;
    if (received[0] !== handshake[0]) {
        success = false;
    } else if (received.slice(1, 20).toString() !== 'BitTorrent protocol') {
        success = false;
    } else if (received.slice(28, 48).toString('hex') !== handshake.slice(28, 48).toString('hex')) {
        success = false;
    }
    
    return success;  
}

Peer.prototype.request = function (index, offset, length) {
    if (this.peer_choking) console.error(this.ip + ':' + this.port + " is choking. Cant send request");

    this.curr_block = [];
    this.curr_index = index;

    var buffer = new Buffer(17);

    //<len=0013><id=6><index><begin><length>
    buffer.writeInt32BE(13, 0);
    buffer.writeUInt8(6, 4);
    buffer.writeInt32BE(index, 5);
    buffer.writeInt32BE(offset, 9);
    buffer.writeInt32BE(length, 13);

    this.sendmessage(buffer);
}

//MESSAGE HANDLERS

Peer.prototype._onkeepalive = function () { 
    console.log('keep alive');
}

Peer.prototype._onchoke = function () {
    this.peer_choking = true;
    this.emit('choke');

    console.log('choke');
}

Peer.prototype._onunchoke = function (buffer) {
    this.peer_choking = false;
    console.log(this.ip + ':' + this.port + ' unchoke');
    this.emit('unchoke');
  
}

Peer.prototype._oninterested = function () {
    this.peer_interested = true;
    this.emit('interested');

    console.log('interested');
}

Peer.prototype._onuninterested = function () {
    this.peer_interested = false;
    this.emit('uninterested');

    console.log('uninterested');
}

Peer.prototype._onhave = function (index) {
    console.log('have');
}

Peer.prototype._onbitfield = function () { 
    console.log('bitfield');
}

Peer.prototype._onrequest = function () { 
    console.log('request');
}

Peer.prototype._onpiece = function (index, begin, block) {
    var buff = new Buffer(this.curr_block);
    var buff1 = new Buffer(block);

    this.curr_block = Buffer.concat([buff, buff1]);

    if (this.curr_block.length !== this.curr_block_l) {
        //console.log(this.port + ': lenghts dont mathc :' + this.curr_block.length + ' and ' + this.curr_block_l)
        return;
    }
    this.curr_block_l = 0;

    this.emit('block', { piece: this.curr_index, offset: begin, data: this.curr_block });   
}

Peer.prototype._oncancel = function () { 
    console.log('cancel');
}

Peer.prototype._unknown = function (buffer) {
    //console.log(this.ip + ' : ' + this.port + 'unknown: ' + buffer);
}

module.exports = Peer;