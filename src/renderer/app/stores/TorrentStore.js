import { observable } from 'mobx';
import { ipcRenderer } from 'electron';


class TorrentStore {
    @observable torrents = [];

    addTorrent(newItem){
        console.log(newItem)
        this.torrents.push(newItem);

        ipcRenderer.send('new-torrent-added', newItem);
    }

    loadInitialState(items){
        this.torrents = items;
    }

    logTorrents(){
        this.torrents.map(t => console.log(t))
    }

    bindEvents(){
        ipcRenderer.on('torrent-data-read', (e, torrentData) => {
            let torrent = this.torrents.filter(t => t.path == torrentData.path)[0];
            torrent.blocksDone = 0;
            torrent.pieceCount = torrentData.pieceCount;
            torrent.blocksPerPiece = torrentData.blocksPerPiece;
            // torrent = {...torrent, ...torrentData, ...{blocksDone:0}};
        })

        ipcRenderer.on('error', (e, data) => {
            console.log('got error');
            console.log(data)
        })

        ipcRenderer.on('block', (e, torrentPath) => {
            const torrent = this.torrents.filter(t => t.path == torrentPath)[0];
            torrent.blocksDone++;
            const numericPercentage = (torrent.blocksDone / (torrent.blocksPerPiece * torrent.pieceCount)) * 100;
            console.log('got ' + numericPercentage)
            torrent.percentageDone = Math.round(numericPercentage);
        })
    }
}

export default TorrentStore;