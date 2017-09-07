import React from 'react';

import TorrentControl from '../TorrentControl';

const MainArea = (props) => {
    const torrentControls = props.items.map((torrentItem, i) => <TorrentControl key={i} {...torrentItem} />);

    return (
        <div className="col s9" style={{height: '100%'}}>
            {torrentControls}
        </div>
    )
}

export default MainArea;