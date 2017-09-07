import React from 'react';

import MainArea from '../components/subcontainers/MainArea';
import InfoArea from '../components/subcontainers/InfoArea';

const mockItems = [
    {torrentName: 'Debian 9', percentageDone: 55, status: 'DOWNLOADING'},
    {torrentName: 'Ubuntu 17.10', percentageDone: 1, status: 'PAUSED'},
    {torrentName: 'Not a movie', percentageDone: 12, status: 'WAITING'},
    {torrentName: 'Batman: end illegal torrenting', percentageDone: 72, status: 'IN_QUEUE'},
]

export default class GrandContainer extends React.Component {
    constructor(){
        super();
        this.state = { something: 7};

        // this.handleClick = this.handleClick.bind(this);
    }

    handleClick = () => {
        console.log(this.state);
    }

    render(){
        return <button onClick={this.handleClick}>click</button>
        // return (
        //     <div id="grand-container">
        //         <MainArea items={mockItems}/>
        //         <InfoArea />
        //     </div>
        // )
    }
}