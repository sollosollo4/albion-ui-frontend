import React, { Component } from 'react';

class MouseTracker extends Component {
    constructor(props) {
        super(props);
        this.state = { x: 0, y: 0 };
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.handleMouseMove);
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.handleMouseMove);
    }

    handleMouseMove = (e) => {
        this.setState({ x: e.pageX, y: e.pageY });
    };

    render() {
        return (
            <div style={{ position: 'absolute', top: this.state.y, left: this.state.x, background: 'white', padding: '10px', border: '1px solid black' }}>
                Coordinates: {this.state.x}, {this.state.y}
            </div>
        );
    }
}

export default MouseTracker;