import "./style.css";
import React, { Component } from 'react';
import DraggablePanel from '../components/DraggablePanel/DraggablePanel';

const electron = window.require('electron');

class Overlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panels: []
    };
  }

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
            panel.active && (
              <DraggablePanel
                key={index}
                panel={panel}
              />
            )
          ))}
        </div>
      </div>
    );
  }
}

export default Overlay;