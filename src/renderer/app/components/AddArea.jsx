import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

@observer
export default class AddArea extends React.Component {
    constructor() {
        super();
        this.state = {
            fileOver: false
        }
    }

    render() {
        const areaDragClassName = this.state.fileOver ? "add-area-hover" : "";
        const plusDragClassName = this.state.fileOver ? "add-area-plus-hover" : "";

        return (
            <div className={"card-panel torrent-item add-area " + areaDragClassName}
                onDragEnter={this.toggleDragStatus}
                onDragLeave={this.toggleDragStatus}
                onDrop={this.onFileDrop}
            >
                <input className="add-area-input" type="file"
                    onChange={this.onFileDrop} role="button" />
                <i className={"material-icons add-area-plus " + plusDragClassName}>
                    add_circle_outline
                </i>
            </div >
        )
    }

    toggleDragStatus = (e) => {
        this.setState({ fileOver: e.type == 'dragenter' });
    }

    onFileDrop = (e) => {
        var files = e.dataTransfer ? e.dataTransfer.files : e.target.files;

        this.setState({ fileOver: false });

        if (files[0].type === 'application/x-bittorrent') {
            this.props.store.addTorrent({
                torrentName: files[0].name,
                status: 'NEW',
                path: files[0].path,
                percentageDone: 0
            });
        } else {
            console.log("SELECTED FILE IS NOT A TORRENT");
        }
    }
}

AddArea.propTypes = {
    store: PropTypes.any.isRequired
}
