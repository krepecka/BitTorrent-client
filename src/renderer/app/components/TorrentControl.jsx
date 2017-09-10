import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

import PercentageIndicator from './PercentageIndicator';

import torrentStatus from '../constants/torrentStatus';

@observer
class TorrentControl extends React.Component {
    render() {
        const { torrentName, percentageDone, status } = this.props;
        return (
            <div className="card-panel grey darken-2 torrent-item" role="button">
                <div className="card-content white-text">
                    <span className="card-title"><b>{torrentName}</b></span>
                    {/* <p>done: {percentageDone}, status: {status}</p> */}
                    <PercentageIndicator value={percentageDone} />
                </div>
                <div className="card-action">
                    <a className="waves-effect waves-light btn">remove</a>
                </div>
            </div >
        )
    }
}

TorrentControl.propTypes = {
    torrentName: PropTypes.string.isRequired,
    percentageDone: PropTypes.number.isRequired,
    status: PropTypes.oneOf(torrentStatus).isRequired
}

export default TorrentControl;