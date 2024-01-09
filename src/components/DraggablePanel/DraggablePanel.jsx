import './style.css';
import React, { useState, useRef  } from 'react';
import PanelContent from './PanelContent'

const DraggablePanel = ({ color, position }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panelPosition, setPanelPosition] = useState(position);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - panelPosition.x,
      y: e.clientY - panelPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      setPanelPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Добавляем и удалем слушатели при монтировании и размонтировании компонента
  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  const resizableRef = useRef(null);

  const handleMouseDownBorder = (e) => {
    e.preventDefault();
    setIsResizing(true);

    setStartX(e.clientX);
    setStartY(e.clientY);
    setStartWidth(resizableRef.current.offsetWidth);
    setStartHeight(resizableRef.current.offsetHeight);
    
    window.addEventListener('mousemove', handleMouseMoveBorder);
    window.addEventListener('mouseup', handleMouseUpBorder);
  };

  const handleMouseUpBorder = () => {
    setIsResizing(false);
    window.removeEventListener('mousemove', handleMouseMoveBorder);
    window.removeEventListener('mouseup', handleMouseUpBorder);
  };

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMoveBorder);
      window.addEventListener('mouseup', handleMouseUpBorder);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveBorder);
      window.removeEventListener('mouseup', handleMouseUpBorder);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveBorder);
      window.removeEventListener('mouseup', handleMouseUpBorder);
    };
  }, [isResizing]);

  const handleMouseMoveBorder = (e) => {
    if (isResizing) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newWidth = startWidth + deltaX;
      const newHeight = startHeight + deltaY;

      resizableRef.current.style.width = `${Math.max(100, newWidth)}px`;
      resizableRef.current.style.height = `${Math.max(100, newHeight)}px`;
    }
  };

  const [transparancy, setTransparency] = useState();

  const onColorChanged = (data) => {
    resizableRef.current.style.backgroundColor = data
  }

  const onTextColorChanged = (data) => {
    resizableRef.current.style.color = data
  }

  const onTransparanceChanged = (transparency) => {
    setTransparency(transparency)
  }

  return (
    <div
      className={`draggable-panel ${isDragging ? 'dragging' : ''} resizable-div ${isResizing ? 'resizing' : ''}`}
      ref={resizableRef}
      style={{ 
        left: panelPosition.x, 
        top: panelPosition.y, 
        backgroundColor: color,
        opacity: transparancy
      }}
    >
      <div className="resizable-handle right" onMouseDown={handleMouseDownBorder} />
      <div className="resizable-handle bottom" onMouseDown={handleMouseDownBorder} />
      <div className="resizable-handle left" onMouseDown={handleMouseDownBorder} />
      <div className="resizable-handle bottom-left" onMouseDown={handleMouseDownBorder} />
      <div className="resizable-handle bottom-right" onMouseDown={handleMouseDownBorder} />

      <div className="panel-header" onMouseDown={handleMouseDown}/>
      
      <PanelContent 
        onColor={onColorChanged} 
        onTransparency={onTransparanceChanged}
        onTextColor={onTextColorChanged}
      />

    </div>
  );
};

export default DraggablePanel;