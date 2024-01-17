import React, { Component } from 'react';
import './player.css'; // Создайте файл App.css для стилей

class PlayerInRoom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            lightOn: false,
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
            position: {
                x: 100,
                y: 100
            },
            size: {
                width: 100,
                height: 200
            }
        };
    }

    handleLightToggle = () => {
        this.setState((prevState) => ({
            lightOn: !prevState.lightOn,
        }));
    };

    handleSwitchToggle = (key) => {
        this.setState((prevState) => ({
            switches: {
                ...prevState.switches,
                [key]: !prevState.switches[key],
            },
        }));
    };

    handleColorChange = (event) => {
        const color = event.target.value;
        this.setState({ color });
        //this.props.onColor(color);
    };

    handleTextColorChange = (event) => {
        const textcolor = event.target.value;
        this.setState({ textcolor });
        //this.props.onTextColor(textcolor);
    };

    handleTransparencyChange = (event) => {
        const transparency = parseFloat(event.target.value);
        this.setState({ transparency });
        //this.props.onTransparency(transparency);
    };

    render() {
        const { roomName } = this.props;
        const { lightOn, switches } = this.state;
        const { color, textcolor, transparency } = this.state;

        return (
            <div className="roomBlock">
                <h3>{roomName}</h3>
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