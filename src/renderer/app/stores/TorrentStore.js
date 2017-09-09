import { observable } from 'mobx';


class TorrentStore {
    @observable torrents = [];

    addTorrent(newItem){
        console.log(newItem)
        this.torrents.push(newItem);
    }

    loadInitialState(items){
        this.torrents = items;
    }

    logTorrents(){
        this.torrents.map(t => console.log(t))
    }
}

export default TorrentStore;