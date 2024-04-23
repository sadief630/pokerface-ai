import React, { useState, useEffect } from 'react';
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

const PlayerConsole = ({ onPlayerMove, enabled, funds, minBet}) => {
  const [sliderValue, setSliderValue] = useState(minBet);
  const [sliderMinimum, setSliderMinimum] = useState(minBet);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue); // Use newValue directly from the Slider
  };
   // Update sliderMinimum and sliderValue when minBet changes
   useEffect(() => {
    setSliderMinimum(minBet);
    setSliderValue(minBet);
  }, [minBet]);

  const handleButtonClick = (action) => {
    if (action === 'raise') {
      console.log(`Player raised by ${sliderValue}`);
    } else if (action === 'check') {
      console.log('Player checked')
    } else if (action === 'fold') {
      console.log('Player folded')
    } else if (action === 'call'){
      console.log('Player called')
    }
    onPlayerMove(action, sliderValue);
  };

  if(!enabled){
    return(
    <div className="poker-console">
       <div className='text-style-title'>
              Player (You!)
            </div>
            <div className='text-style-body'>
                $$$ : {funds}
            </div>
        <div className="action-buttons">
          <button disabled={true}>Waiting...</button>
        </div>
      <PrettoSlider
        value={sliderValue}
        onChange={handleSliderChange}
        min={minBet}
        size="large"
        step={1}
        max={funds}
        valueLabelDisplay="auto"
      />
    </div>);
  }

  return (
    <div className="poker-console">
      <div className='text-style-title'>
              Player (You!)
            </div>
            <div className='text-style-body'>
                $$$ : {funds}
            </div>
      <div className="action-buttons">
        <button onClick={() => handleButtonClick('fold')}>Fold</button>
        {sliderValue > minBet ? (
          <button onClick={() => handleButtonClick('raise')}>Raise</button>
        ) : minBet > 0 ? (
          <button onClick={() => handleButtonClick('call')}>Call</button>
        ) : (
          <button onClick={() => handleButtonClick('check')}>Check</button>
        )}
      </div>

      <PrettoSlider
        value={sliderValue}
        onChange={handleSliderChange}
        min={sliderMinimum}
        size="large"
        step={1}
        max={funds}
        valueLabelDisplay="auto"
      />
    </div>
  );
};

export default PlayerConsole;
