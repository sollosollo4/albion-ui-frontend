import React, { useState } from 'react';

const electron = window.require('electron');

const PanelCreator = () => {
  const [panels, setPanels] = useState([]);
  const [currentColor, setCurrentColor] = useState('lightblue');

  const handleCreatePanel = () => {
    const newPanel = {
      color: currentColor,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    };

    setPanels((prevPanels) => {
      const updatedPanels = [...prevPanels, newPanel];
      electron.ipcRenderer.send('panels-data', updatedPanels);
      return updatedPanels;
    });
  };

  const handleSetColor = (color) => {
    setCurrentColor(color);
  };

  return (
    <div id='creator'>
      <h2>Создание панели</h2>
      <button onClick={handleCreatePanel}>Создать панель</button>
      <input
        type="color"
        value={currentColor}
        onChange={(e) => handleSetColor(e.target.value)}
      />
    </div>
  );
};

export default PanelCreator;