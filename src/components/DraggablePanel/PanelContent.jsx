import React, { Component } from 'react';
import PlayerContent from './PlayerContent';
import './tabs.css';

const electron = window.require('electron');

class PanelContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 1,
            color: '#ff0000',
            textcolor: '#ff0000',
            transparency: 1,
            imageUrls: [],
        };
    }

    componentDidMount() {
        electron.ipcRenderer.on('PressButtonEvent', this.handleButtonsData);
    }

    handleButtonsData = (event, data) => {
        console.log([this.props.panel.player.id , data.pressButtonData.userId])
        if(this.props.panel.player.id != data.pressButtonData.userId)
            return;
        let switches = ['q', 'w', 'e', 'r', 'd', 'f'];
        const urls = data.pressButtonData.buffers.map((buffer, index) => {
            let url = `data:image/png;base64,${buffer}`
            let button = switches[index]
            return { url, button };
        });
        this.setState({ imageUrls: urls });
    }

    handleTabClick = (tabIndex) => {
        this.setState({ activeTab: tabIndex });
    };

    handleColorChange = (event) => {
        const color = event.target.value;
        this.setState({ color });
        this.props.onColor(color);
    };

    handleTextColorChange = (event) => {
        const textcolor = event.target.value;
        this.setState({ textcolor });
        this.props.onTextColor(textcolor);
    };

    handleTransparencyChange = (event) => {
        const transparency = parseFloat(event.target.value);
        this.setState({ transparency });
        this.props.onTransparency(transparency);
    };

    render() {
        const { activeTab, transparency, imageUrls } = this.state;

        return (
            <div className="tabs-container">
                <div className="tab-header">
                    <div
                        className={activeTab === 1 ? 'tab-item active' : 'tab-item'}
                        onClick={() => this.handleTabClick(1)}
                    >
                        Graphic
                    </div>
                    <div
                        className={activeTab === 2 ? 'tab-item active' : 'tab-item'}
                        onClick={() => this.handleTabClick(2)}
                    >
                        Spells
                    </div>
                </div>
                <div className="tab-content">
                    {activeTab === 1 && (
                        <div>
                            <form>
                                <b>Панель игрока: {this.props.panel.player.name}</b>
                                <div>
                                    <label htmlFor="transparencySlider">Прозрачность:</label>
                                    <input
                                        type="range"
                                        id="transparencySlider"
                                        name="transparency"
                                        min="0.1"
                                        max="1"
                                        step="0.05"
                                        value={this.props.panel.transparency}
                                        onChange={this.handleTransparencyChange}
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                    {activeTab === 2 && (
                        <div>
                            <center>{this.props.panel.player.name}</center>
                            <div>
                                {imageUrls.map(({ url, button, index }) => (
                                    this.props.panel.switches[button] && (
                                        <img key={index} src={url} alt={index} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default PanelContent;