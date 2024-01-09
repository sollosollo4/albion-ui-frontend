import "./style.css";
import React, { Component } from 'react';
import PanelCreator from "../PanelCreator/PanelCreator";
import Header from "./components/Header/Header";

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