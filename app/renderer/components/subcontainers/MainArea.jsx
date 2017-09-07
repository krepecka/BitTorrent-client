import React from 'react';

import TorrentControl from '../TorrentControl';

const MainArea = (props) => {
    const torrentControls = props.items.map((torrentItem, i) => <TorrentControl {...torrentItem} />);

    return (
        <div className="main-area">
            {torrentControls}
        </div>
    )
}

export default MainArea;