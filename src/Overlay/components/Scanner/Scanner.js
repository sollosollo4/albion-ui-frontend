
import React, { Component } from 'react';
const electron = window.require('electron');
const cv = window.require('@u4/opencv4nodejs');

class Scanner extends Component {
    constructor(props) {
        super(props);
        this.state = {
            x: 100,
            y: 100,
            radius: 22,
            scanning: false,
        };
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseup', this.handleMouseUp);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleMouseMove = (e) => {
        if (this.state.scanning) return;
        this.setState({ x: e.pageX, y: e.pageY });
    };

    handleMouseDown = (e) => {
        e.preventDefault();
        this.setState({ scanning: true });
    };

    handleMouseUp = () => {
        if (this.state.scanning) {
            this.scanScreen();
            this.setState({ scanning: false });
        }
    };

    scanScreen = () => {
        const { x, y, radius } = this.state;
        electron.ipcRenderer.send('scan', {x: x, y: y});
    };

    render() {
        const { x, y, radius, scanning } = this.state;

        return (
            <div>
                <div
                    style={{
                        position: 'absolute',
                        top: y - radius,
                        left: x - radius,
                        width: radius * 2,
                        height: radius * 2,
                        borderRadius: '50%',
                        background: 'rgba(90, 155, 0, 0.4)',
                        cursor: 'move',
                    }}
                    onMouseDown={this.handleMouseDown}
                />
                <button
                    style={{
                        position: 'absolute',
                        top: y + radius + 10,
                        left: x - 50,
                        padding: '10px',
                        cursor: 'pointer',
                        backgroundColor: scanning ? 'gray' : 'blue',
                        color: 'white',
                    }}
                    onClick={this.scanScreen}
                >
                    {scanning ? 'Scanning...' : 'Scan Screen'}
                </button>
            </div>
        );
    }
}

export default Scanner;