import React, { useState } from 'react';
import DraggablePanel from '../components/DraggablePanel/DraggablePanel';

const PanelCreator = () => {
  const [panels, setPanels] = useState([]);
  const [currentColor, setCurrentColor] = useState('lightblue');

  const handleCreatePanel = () => {
    const newPanel = {
      color: currentColor,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    };

    setPanels((prevPanels) => [...prevPanels, newPanel]);
  };

  const handleSetColor = (color) => {
    setCurrentColor(color);
  };
  const handleCreatorPanelVisible = () => {
    if (document.getElementById('creator').style.display) 
      document.getElementById('creator').style.display = null
    else
      document.getElementById('creator').style.display = 'none';
  }

  return (
    <div id='creator'>
      <h2>Создание панели</h2>
      <button onClick={handleCreatorPanelVisible}>Скрыть</button>
      <button onClick={handleCreatePanel}>Создать панель</button>
      <input
        type="color"
        value={currentColor}
        onChange={(e) => handleSetColor(e.target.value)}
      />
      <div className='all_panels'>
        {panels.map((panel, index) => (
          <DraggablePanel key={index} color={panel.color} position={panel.position} />
        ))}
      </div>
    </div>
  );
};

export default PanelCreator;