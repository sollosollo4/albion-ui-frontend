import "./style.css";
import React, { Component } from 'react';
import { Draggable } from '../components/Draggable';
import DraggablePanel from "../components/DraggablePanel/DraggablePanel";
import PanelCreator from "../PanelCreator/PanelCreator";
import Header from "./components/Header/Header";

const electron = window.require('electron');

class Overlay extends Component {
  render() {
    return (
      <div className="Overlay">
        <Header></Header>
        <PanelCreator></PanelCreator>
      </div>
    );
  }
}

export default Overlay;