import './App.css';
import { Route, Routes } from 'react-router-dom';
import PokerGame from './pages/PokerGame/PokerGame';
import HowToPlay from './pages/HowToPlay/HowToPlay';
import Header from './components/Header/Header';
import React, { useState, useEffect } from 'react';

function App() {
  return (
    <div className="app-container">
      <Header/>
      <Routes>
        <Route exact path='/' element={<PokerGame />}></Route>
        <Route exact path='/how-to-play' element={<HowToPlay />}></Route>
      </Routes>
    </div>
  );
}

export default App;

