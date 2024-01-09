import React, { useState } from 'react';
import './Dropdown.css'; // Подключение стилей (если есть)

const Dropdown = ({ options, onSelect }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    setSelectedItem(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="dropdown-container">
      <div className="selected-item" onClick={() => setIsOpen(!isOpen)}>
        {selectedItem ? (
          <>
            <img src={selectedItem.image} className="selected-image" />
            {selectedItem.label}
          </>
        ) : (
          'Select an item'
        )}
      </div>
      {isOpen && (
        <ul className="options-list">
          {options.map((option) => (
            <li key={option.value} onClick={() => handleSelect(option)}>
              <img src={option.image} className="option-image" />
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;