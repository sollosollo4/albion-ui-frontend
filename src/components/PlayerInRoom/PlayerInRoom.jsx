import React, { Component } from 'react';
import './player.css';

const electron = window.require('electron');
class PlayerInRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            panel: this.props.panel,
            lightOn: true,
            switches: {
                q: false,
                w: false,
                e: true,
                r: false,
                d: false,
                f: false
            },
            color: '#ff0000',
            textcolor: '#ff0000',
            transparency: 1,
        };


    }

    updateServerPanel(data) {
        electron.ipcRenderer.send('update-concrete-panel', data);
    }

    handleLightToggle = () => {
        this.setState((prevState) => {
            const newLightOnState = !prevState.lightOn;
            const newPanel = prevState.panel;
            newPanel.active = newLightOnState;
            this.updateServerPanel({
                id: newPanel.player.id,
                field: 'active',
                value: newLightOnState
            });
            return {
                lightOn: newLightOnState,
                panel: newPanel
            }
        });
    };

    handleSwitchToggle = (key) => {
        this.setState((prevState) => {
            let updateSwitches = {
                ...prevState.switches,
                [key]: !prevState.switches[key],
            };
            this.updateServerPanel({
                id: this.state.panel.player.id,
                field: 'switches',
                value: updateSwitches
            });

            return {
                switches: updateSwitches
            };
        });
    };

    handleColorChange = (event) => {
        const color = event.target.value;
        this.setState({ color });

        this.updateServerPanel({
            id: this.state.panel.player.id,
            field: 'color',
            value: color
        });
    };

    handleTextColorChange = (event) => {
        const textcolor = event.target.value;
        this.setState({ textcolor });
        //this.props.onTextColor(textcolor);
    };

    handleTransparencyChange = (event) => {
        const transparency = parseFloat(event.target.value);
        this.setState({ transparency });

        this.updateServerPanel({
            id: this.state.panel.player.id,
            field: 'transparency',
            value: transparency
        });
    };

    render() {
        const { panel } = this.props;
        const { color, textcolor, transparency, lightOn, switches } = this.state;

        return (
            <div className="roomBlock">
                <h3>{panel.player.name}</h3>
                <div className={`lightIndicator ${lightOn ? 'on' : 'off'}`} onClick={this.handleLightToggle}></div>
                <div className="switchTable">
                    {Object.entries(switches).map(([key, value]) => (
                        <div key={key}>
                            {key}
                            <div className={`lightIndicator ${value ? 'on' : 'off'}`} onClick={() => this.handleSwitchToggle(key)}></div>
                        </div>
                    ))}
                </div>
                <div>
                    <label htmlFor="colorPicker">Цвет панели:</label>
                    <input
                        type="color"
                        id="colorPicker"
                        name="color"
                        value={color}
                        onChange={this.handleColorChange}
                    />
                </div>
                <div>
                    <label htmlFor="colorPicker">Цвет текста:</label>
                    <input
                        type="color"
                        id="colorTextPicker"
                        name="textcolor"
                        value={textcolor}
                        onChange={this.handleTextColorChange}
                    />
                </div>
                <div>
                    <label htmlFor="transparencySlider">Прозрачность:</label>
                    <input
                        type="range"
                        id="transparencySlider"
                        name="transparency"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={transparency}
                        onChange={this.handleTransparencyChange}
                    />
                </div>
            </div>
        );
    }
}

export default PlayerInRoom;