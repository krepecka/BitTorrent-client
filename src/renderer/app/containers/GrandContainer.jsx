import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

import MainArea from '../components/subcontainers/MainArea';
import InfoArea from '../components/subcontainers/InfoArea';

export default class GrandContainer extends React.Component {
    render() {
        const { store } = this.props;

        return (
            <div className="row" style={{height: '100%'}}>
                <MainArea store={store}/>
                <InfoArea />
            </div>
        )
    }
}

GrandContainer.propTypes = {
    store: PropTypes.any.isRequired
}

