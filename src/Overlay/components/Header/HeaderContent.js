// HeaderContent.js
import './Header.css';
import React,  { useState } from 'react';
const HeaderContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuFalse = () => {
    setIsMenuOpen(false);
  };

  const handleMenuTrue = () => {
    setIsMenuOpen(true);
  };

  const activePanel = () => {
    document.getElementById('creator').style.display = null
  };
  return (
    <div className="header-content">
      <div className="menu-button" onMouseEnter={handleMenuTrue} onMouseLeave={handleMenuFalse}>
        Menu
      </div>
        <div className={`menu ${isMenuOpen ? "active" : ""}`}>
          <ul>
            <li>
              <button onClick={activePanel}>Create user panel</button>
            </li>
          </ul>
        </div>
    </div>
  );
};

export default HeaderContent;