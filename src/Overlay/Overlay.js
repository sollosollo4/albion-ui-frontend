import "./style.css";
import React, { Component } from 'react';
import Header from "./components/Header/Header";
import DraggablePanel from '../components/DraggablePanel/DraggablePanel';
import MouseTracker from "./MouseTracker";
import Scanner from "./components/Scanner/Scanner";

const electron = window.require('electron');

class Overlay extends Component {
  state = {
    panels: [],
    circlesData: []
  };

  componentDidMount() {
    electron.ipcRenderer.on('panels-data', this.handlePanelsData);
  }

  handlePanelsData = (event, receivedPanels) => {
    this.setState(() => ({
      panels: receivedPanels,
    }));
  }; 

  render() {
    const { panels } = this.state;
    return (
      <div className="Overlay">
        <div className='all_panels'>
          {panels.map((panel, index) => (
            <DraggablePanel key={index} color={panel.color} position={panel.position} />
          ))}
        </div>
      </div>
    );
  }
}

export default Overlay;