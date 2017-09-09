import React from 'react';

import GrandContainer from './containers/GrandContainer';

import TorrentStore from './stores/TorrentStore';

const torrentStore = new TorrentStore();

const mockItems = [
    { torrentName: 'Debian 9', percentageDone: 55, status: 'DOWNLOADING' },
    { torrentName: 'Ubuntu 17.10', percentageDone: 1, status: 'PAUSED' },
    { torrentName: 'Not a movie', percentageDone: 12, status: 'WAITING' },
    { torrentName: 'Batman: end illegal torrenting', percentageDone: 72, status: 'IN_QUEUE' },
    { torrentName: 'Kids, use steam', percentageDone: 100, status: 'DONE' },
]

torrentStore.loadInitialState(mockItems);

const App = () => {
    return (
        <GrandContainer store={torrentStore}/>
    )
}

export default App;