import './style.css';
import React, { Component, useRef } from 'react';
import PanelContent from './PanelContent';

const electron = window.require('electron');

class DraggablePanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isDragging: false,
      offset: { x: 0, y: 0 },
      panelPosition: this.props.panel.position,
      isResizing: false,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      transparancy: 1,
    };

    this.resizableRef = React.createRef();

    // Binding event handlers
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDownBorder = this.handleMouseDownBorder.bind(this);
    this.handleMouseMoveBorder = this.handleMouseMoveBorder.bind(this);
    this.handleMouseUpBorder = this.handleMouseUpBorder.bind(this);
    this.onColorChanged = this.onColorChanged.bind(this);
    this.onTextColorChanged = this.onTextColorChanged.bind(this);
    this.onTransparanceChanged = this.onTransparanceChanged.bind(this);
  }

  componentDidMount() {
    // Adding event listeners when the component mounts
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    // Removing event listeners when the component unmounts
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseDown(e) {
    this.setState({
      isDragging: true,
      offset: {
        x: e.clientX - this.state.panelPosition.x,
        y: e.clientY - this.state.panelPosition.y,
      },
    });
  }

  handleMouseMove(e) {
    if (this.state.isDragging) {
      const newX = e.clientX - this.state.offset.x;
      const newY = e.clientY - this.state.offset.y;
      this.setState({ panelPosition: { x: newX, y: newY } });
    }
  }

  handleMouseUp() {
    this.setState({ isDragging: false });
    this.props.panel.position = this.state.panelPosition;
    electron.ipcRenderer.send('update-concrete-panel', this.props.panel);
  }

  handleMouseDownBorder(e) {
    e.preventDefault();
    this.setState({
      isResizing: true,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: this.resizableRef.current.offsetWidth,
      startHeight: this.resizableRef.current.offsetHeight,
    });

    window.addEventListener('mousemove', this.handleMouseMoveBorder);
    window.addEventListener('mouseup', this.handleMouseUpBorder);
  }

  handleMouseUpBorder() {
    this.setState({ isResizing: false });
    window.removeEventListener('mousemove', this.handleMouseMoveBorder);
    window.removeEventListener('mouseup', this.handleMouseUpBorder);
  }

  handleMouseMoveBorder(e) {
    if (this.state.isResizing) {
      const deltaX = e.clientX - this.state.startX;
      const deltaY = e.clientY - this.state.startY;
      const newWidth = this.state.startWidth + deltaX;
      const newHeight = this.state.startHeight + deltaY;

      this.resizableRef.current.style.width = `${Math.max(30, newWidth)}px`;
      this.resizableRef.current.style.height = `${Math.max(30, newHeight)}px`;
    }
  }

  onColorChanged(data) {
    this.resizableRef.current.style.backgroundColor = data;
  }

  onTextColorChanged(data) {
    this.resizableRef.current.style.color = data;
  }

  onTransparanceChanged(transparency) {
    this.setState({ transparancy: transparency });
  }

  render() {
    const { panelPosition, isDragging, isResizing, transparancy } = this.state;
    const { panel } = this.props;

    return (
      <div
        className={`draggable-panel ${isDragging ? 'dragging' : ''} resizable-div ${
          isResizing ? 'resizing' : ''
        }`}
        ref={this.resizableRef}
        style={{
          left: panelPosition.x,
          top: panelPosition.y,
          backgroundColor: panel.color,
          opacity: transparancy,
        }}
      >
        <div className="resizable-handle right" onMouseDown={this.handleMouseDownBorder} />
        <div className="resizable-handle bottom" onMouseDown={this.handleMouseDownBorder} />
        <div className="resizable-handle left" onMouseDown={this.handleMouseDownBorder} />
        <div className="resizable-handle bottom-left" onMouseDown={this.handleMouseDownBorder} />
        <div className="resizable-handle bottom-right" onMouseDown={this.handleMouseDownBorder} />

        <div className="panel-header" onMouseDown={this.handleMouseDown} />
        <PanelContent
          onColor={this.onColorChanged}
          onTransparency={this.onTransparanceChanged}
          onTextColor={this.onTextColorChanged}
        />
      </div>
    );
  }
}

export default DraggablePanel;