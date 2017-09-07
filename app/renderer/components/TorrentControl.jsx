import React from 'react';
import PropTypes from 'prop-types';

import torrentStatus from '../constants/torrentStatus';

export default class TorrentControl extends React.Component{
    render(){
        const { torrentName, percentageDone, status } = this.props;
        return(<div>name: {torrentName}, done: {percentageDone}, status: {status}</div>)
    }
}

TorrentControl.propTypes = {
    torrentName: PropTypes.string.isRequired,
    percentageDone: PropTypes.number.isRequired,
    status: PropTypes.oneOf(torrentStatus).isRequired
}