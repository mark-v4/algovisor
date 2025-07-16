import React, { useState } from 'react';
import './Menu.css';

const PlaybackControls = ({ isPaused, onPause, onReset, onSpeedChange, onNextStep, onPrevStep }) => {
  const [speed, setSpeed] = useState(1);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  const toggleSpeedModal = () => {
    setIsSpeedModalOpen(!isSpeedModalOpen);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: '10px',
        backgroundColor: 'var(--color-background)',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: 'var(--xy-node-boxshadow-default)',
      }}
    >
      <button
        className="xy-theme__button"
        onClick={onReset}
        style={{ width: '80px', height: '40px', fontSize: '16px' }}
      >
        Restart
      </button>
      <button
        className="xy-theme__button"
        onClick={onPrevStep}
        style={{
          width: '40px',
          height: '40px',
          fontSize: '16px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--color-primary)',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-primary)',
          boxShadow: 'var(--xy-node-boxshadow-default)',
        }}
      >
        {'<'}
      </button>
      <button
        className={`xy-theme__button ${!isPaused ? 'active' : ''}`}
        onClick={() => onPause(!isPaused)}
        style={{ width: '80px', height: '40px', fontSize: '16px' }}
      >
        {isPaused ? 'Run' : 'Stop'}
      </button>
      <button
        className="xy-theme__button"
        onClick={onNextStep}
        style={{
          width: '40px',
          height: '40px',
          fontSize: '16px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--color-primary)',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-primary)',
          boxShadow: 'var(--xy-node-boxshadow-default)',
        }}
      >
        {'>'}
      </button>
      <div style={{ position: 'relative' }}>
        <button
          className="xy-theme__button"
          onClick={toggleSpeedModal}
          style={{
            width: '80px',
            height: '40px',
            fontSize: '16px',
          }}
        >
          Скорость
        </button>
        {isSpeedModalOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--color-background)',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: 'var(--xy-node-boxshadow-default)',
              zIndex: 30,
              width: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={speed}
              onChange={handleSpeedChange}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: 'var(--color-primary)',
              }}
            />
            <span style={{ fontSize: '14px', color: 'var(--color-primary)' }}>
              Скорость: {speed}x
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaybackControls;