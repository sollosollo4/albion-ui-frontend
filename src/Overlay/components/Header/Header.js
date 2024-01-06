// Header.js
import './Header.css';
import React, { useState } from 'react';
import HeaderContent from './HeaderContent';

const Header = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className={`header ${!isHovered ? 'hidden' : 'top'}`} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}>
        <HeaderContent/>
    </div>
  );
};

export default Header;