import React, { useState } from 'react';
import './PlayerConsole.css';
import Slider from '@mui/material-next/Slider';
import styled from '@emotion/styled';

const PrettoSlider = styled(Slider)({
  color: '#52af77',
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&::before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 3,
    background: 'unset',
    padding: 10,
    width: 40,
    height: 40,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#52af77',
    fontSize: 20,
    fontFamily : 'monospace',
  },
});

const PlayerConsole = ({ maxRaiseValue, onPlayerMove, enabled }) => {
  const [sliderValue, setSliderValue] = useState(0);

  const handleSliderChange = (event) => {
    setSliderValue(parseInt(event.target.value, 10));
  };

  const handleButtonClick = (action) => {
    if (action === 'raise') {
      console.log(`Player raised by ${sliderValue}`);
    } else if (action === 'check') {
      console.log('Player checked');
    } else if (action === 'fold') {
      console.log('Player folded');
    }
    // Call the onPlayerMove function with the action
    onPlayerMove(action, sliderValue);
  };

  if(!enabled){
    return(
    <div className="poker-console">
      <div className="action-buttons">
        <button disabled = {true}>Fold</button>
        {sliderValue > 0 ? (
          <button disabled = {true}>Raise</button>
        ) : (
          <button disabled = {true}>Check</button>
        )}
      </div>
      <PrettoSlider
        value={sliderValue}
        onChange={handleSliderChange}
        min={0}
        size="large"
        step={1}
        max={maxRaiseValue}
        valueLabelDisplay="auto"
      />
    </div>);
  }

  return (
    <div className="poker-console">
      <div className="action-buttons">
        <button onClick={() => handleButtonClick('fold')}>Fold</button>
        {sliderValue > 0 ? (
          <button onClick={() => handleButtonClick('raise')}>Raise</button>
        ) : (
          <button onClick={() => handleButtonClick('check')}>Check</button>
        )}
      </div>
      <PrettoSlider
        value={sliderValue}
        onChange={handleSliderChange}
        min={0}
        size="large"
        step={1}
        max={maxRaiseValue}
        valueLabelDisplay="auto"
      />
    </div>
  );
};

export default PlayerConsole;
