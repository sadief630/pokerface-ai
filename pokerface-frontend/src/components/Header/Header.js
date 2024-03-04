import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      <div className="header-title">
        <h1>Texas Hold'em AI Poker</h1>
      </div>
      <nav className="header-nav">
        <Link to="/" className="header-tab">
          Home
        </Link>
        <Link to="/how-to-play" className="header-tab">
          How to Play
        </Link>
      </nav>
    </header>
  );
};

export default Header;
