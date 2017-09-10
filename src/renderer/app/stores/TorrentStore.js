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
}

export default TorrentStore;