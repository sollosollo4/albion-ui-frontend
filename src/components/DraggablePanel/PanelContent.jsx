import React, { useState } from 'react';
import PlayerContent from './PlayerContent';
import './tabs.css'; // Создайте файл стилей Tabs.css

const PanelContent = ({ onColor, onTransparency, onTextColor }) => {
    const [activeTab, setActiveTab] = useState(1);

    const handleTabClick = (tabIndex) => {
        setActiveTab(tabIndex);
    };

    const [color, setColor] = useState('#ff0000');
    const [textcolor, setTextColor] = useState('#ff0000');
    const [transparency, setTransparency] = useState(1);

    const handleColorChange = (event) => {
        setColor(event.target.value);
        onColor(event.target.value);
    };

    const handleTextColorChange = (event) => {
        setTextColor(event.target.value);
        onTextColor(event.target.value);
    };

    const handleTransparencyChange = (event) => {
        setTransparency(parseFloat(event.target.value));
        onTransparency(parseFloat(event.target.value));
    };

    return (
        <div className="tabs-container">
            <div className="tab-header">
                <div
                    className={activeTab === 1 ? 'tab-item active' : 'tab-item'}
                    onClick={() => handleTabClick(1)}
                >
                    Graphic
                </div>
                <div
                    className={activeTab === 2 ? 'tab-item active' : 'tab-item'}
                    onClick={() => handleTabClick(2)}
                >
                    Spells
                </div>
            </div>
            <div className="tab-content">
                {activeTab === 1 && <div>
                    <form>
                        <div>
                            <label htmlFor="colorPicker">Choose a Color:</label>
                            <input
                                type="color"
                                id="colorPicker"
                                name="color"
                                value={color}
                                onChange={handleColorChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="colorPicker">Choose a Text Color:</label>
                            <input
                                type="color"
                                id="colorTextPicker"
                                name="textcolor"
                                value={textcolor}
                                onChange={handleTextColorChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="transparencySlider">Adjust Transparency:</label>
                            <input
                                type="range"
                                id="transparencySlider"
                                name="transparency"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={transparency}
                                onChange={handleTransparencyChange}
                            />
                        </div>
                    </form>
                </div>}
                {activeTab === 2 && <div>
                    <PlayerContent/>
                    </div>}
            </div>
        </div>
    );
};

export default PanelContent;