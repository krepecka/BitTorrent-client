import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

import TorrentControl from '../TorrentControl';
import AddArea from '../AddArea';

const MainArea = observer(({ store }) => {
    const torrentControls = store.torrents.map((torrentItem, i) => <TorrentControl key={i} {...torrentItem} />);

    return (
        <div className="col s9" style={{height: '100%'}}>
            <AddArea store={store}/>
            {torrentControls}
        </div>
    )
})

MainArea.propTypes = {
    store: PropTypes.any.isRequired
}

export default MainArea;