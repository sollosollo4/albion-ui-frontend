import React, { useState } from 'react';
import './PlayerContent.css';
import PlayerClassDropDown from './PlayerClass/PlayerClassDropDown';

const PlayerContent = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [spellColdowns, setSpellColdowns] = useState({
        q: '',
        w: '',
        e: '',
    });

    const [spellActive, setSpellActive] = useState({
        q: '',
        w: '',
        e: '',
    });

    const handleInputChange = (name, value) => {
        setSpellColdowns({
            ...spellColdowns,
            [name]: value,
        });
    };

    const handleInputDisable = (name, value) => {
        setSpellActive({
            ...spellActive,
            [name]: value,
        });
    };

    const handleSelect = (selectedOption) => {
        setSelectedItem(selectedOption.target.value)
    };
    return (
        <div style={{ display: 'flex' }}>
            {/* Левая часть - Выпадающий список */}
            <div style={{ marginRight: '20px' }}>
                <label>Choose Player</label>
                <select className="selectDropdown" value={selectedItem ? selectedItem.value : ''} onChange={handleSelect}>
                    <option value="">Choose Player</option>
                    <option value="item1">Item 1</option>
                </select>
                {
                    selectedItem && (
                        <div>
                            <label>Q</label>
                            <input type="checkbox" onChange={(e) => handleInputDisable('q', e.target.value)} />
                            <label>W</label>
                            <input type="checkbox" onChange={(e) => handleInputDisable('w', e.target.value)} />
                            <label>E</label>
                            <input type="checkbox" onChange={(e) => handleInputDisable('e', e.target.value)} />
                        </div>
                    )
                }
            </div>

            {/* Правая часть - Информация о выбранном элементе */}
            <div>
                <h2>{selectedItem}</h2>
                {selectedItem && (
                    <div>
                        <form>
                            <div>
                                <label>Q</label>
                                <img src="/path/to/image1.png" alt="Spell Q" style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                <input
                                    type="text" readOnly
                                    value={spellColdowns.input1}
                                    onChange={(e) => handleInputChange('q', e.target.value)}
                                />
                            </div>

                            <div>
                                <label>W</label>
                                <img src="/path/to/image2.png" alt="Spell W" style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                <input
                                    type="text" readOnly
                                    value={spellColdowns.input2}
                                    onChange={(e) => handleInputChange('w', e.target.value)}
                                />
                            </div>

                            <div>
                                <label>E</label>
                                <img src="/path/to/image3.png" alt="Spell E" style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                                <input
                                    type="text" readOnly
                                    value={spellColdowns.input3}
                                    onChange={(e) => handleInputChange('e', e.target.value)}
                                />
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerContent;