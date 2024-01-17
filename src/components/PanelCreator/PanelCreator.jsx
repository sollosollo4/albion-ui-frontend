import React, { Component } from 'react';
const electron = window.require('electron');

class PanelCreator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      panels: [],
      currentColor: 'lightblue',
    };
  }

  handleCreatePanel = () => {
    const { currentColor } = this.state;

    const newPanel = {
      color: currentColor,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    };

    this.setState((prevState) => {
      const updatedPanels = [...prevState.panels, newPanel];
      electron.ipcRenderer.send('panels-data', updatedPanels);
      return { panels: updatedPanels };
    });
  };

  render() {
    const { currentColor } = this.state;

    return (
      <div id='creator'>
        <h2>Создание панели</h2>
        <button onClick={this.handleCreatePanel}>Создать панель</button>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => this.handleSetColor(e.target.value)}
        />эот 
      </div>
    );
  }
}

export default PanelCreator;