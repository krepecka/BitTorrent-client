const Torrent = require('./torrent-file');
const Connector = require('./connector');
const { EventEmitter } = require('events');

const { BLOCK_LENGTH } = require('./contants/constants');

class SingleTorrentDownloader extends EventEmitter {
    constructor(filePath) {
        super();

        this.torrent = new Torrent(filePath);

        this.torrent.readData()
            .then(() => {
                this.emit('torrent-data-read', {
                    fileName: this.torrent.name,
                    path: this.torrent.path,
                    pieceCount: this.torrent.piece_count,
                    fileSize: this.torrent.file_length,
                    blocksPerPiece: this.torrent.piece_length / BLOCK_LENGTH
                });

                const connector = new Connector(this.torrent);

                connector.on('block', () => {
                    this.emit('block', this.torrent.path)
                })

                connector.on('piece', () => {
                    this.emit('piece')
                })

                connector.on('drop-connection', () => {

                })
            })
            .catch(err => {
                console.log(err)
                if (err.code === 'ETIMEDOUT') {
                    this.emit('error', { message: 'Timeout connecting to tracker' })
                } else {
                    this.emit('error', err);
                }
            });
    }
}

module.exports = SingleTorrentDownloader;