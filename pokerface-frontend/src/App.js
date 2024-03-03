import './App.css';
import TestComponent from './components/TestComponent';
import { useState } from 'react';
import Hand from './components/Hand';

function App() {

  const myhand = [
    { value: 8, suit: "diamonds" },
    { value: 11, suit: "hearts" },
    { value: 1, suit: "clubs" },
    { value: 10, suit: "spades" },
    { value: 4, suit: "hearts" },
  ];

  return (
    <div>
      <TestComponent></TestComponent>
      <Hand hand={myhand}></Hand>
    </div>
  );
}


export default App;
