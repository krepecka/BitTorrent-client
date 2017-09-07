import React from 'react';

import MainArea from '../components/subcontainers/MainArea';
import InfoArea from '../components/subcontainers/InfoArea';

const mockItems = [
    { torrentName: 'Debian 9', percentageDone: 55, status: 'DOWNLOADING' },
    { torrentName: 'Ubuntu 17.10', percentageDone: 1, status: 'PAUSED' },
    { torrentName: 'Not a movie', percentageDone: 12, status: 'WAITING' },
    { torrentName: 'Batman: end illegal torrenting', percentageDone: 72, status: 'IN_QUEUE' },
    { torrentName: 'Kids, use steam', percentageDone: 100, status: 'DONE' },
]

export default class GrandContainer extends React.Component {
    render() {
        return (
            <div className="row" style={{height: '100%'}}>
                <MainArea items={mockItems}/>
                <InfoArea />
            </div>
        )
    }
}