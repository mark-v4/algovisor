import React, { useState } from 'react';
import './Menu.css';

const Menu = ({ onCreateModeChange, onDeleteModeChange, onClearAll, onDirectedChange, onWeightedChange, onLogModalOpen, onGraphModalOpen }) => {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(false);
  const [isGraphMenuOpen, setIsGraphMenuOpen] = useState(false);

  const handleCreateClick = () => {
    const newMode = !isCreateMode;
    setIsCreateMode(newMode);
    setIsDeleteMode(false);
    onCreateModeChange(newMode);
    onDeleteModeChange(false);
  };

  const handleDeleteClick = () => {
    const newMode = !isDeleteMode;
    setIsDeleteMode(newMode);
    setIsCreateMode(false);
    onDeleteModeChange(newMode);
    onCreateModeChange(false);
  };

  const handleClearAllClick = () => {
    setIsCreateMode(false);
    setIsDeleteMode(false);
    setIsDirected(false);
    setIsWeighted(false);
    onCreateModeChange(false);
    onDeleteModeChange(false);
    onClearAll();
    onDirectedChange(false);
    onWeightedChange(false);
  };

  const handleDirectedChange = () => {
    const newDirected = !isDirected;
    setIsDirected(newDirected);
    onDirectedChange(newDirected);
  };

  const handleWeightedChange = () => {
    const newWeighted = !isWeighted;
    setIsWeighted(newWeighted);
    onWeightedChange(newWeighted);
  };

  const handleGraphMenuToggle = () => {
    setIsGraphMenuOpen(!isGraphMenuOpen);
  };

  const handleGraphOptionSelect = (option) => {
    if (option === 'edges') {
      onGraphModalOpen();
    }
    setIsGraphMenuOpen(false);
  };

  return (
    <div className="menu">
      <button
        className={`xy-theme__button ${isCreateMode ? 'active' : ''}`}
        onClick={handleCreateClick}
      >
        Создать вершину
      </button>
      <button
        className={`xy-theme__button ${isDeleteMode ? 'active' : ''}`}
        onClick={handleDeleteClick}
      >
        Удалить вершину
      </button>
      <button
        className="xy-theme__button"
        onClick={handleClearAllClick}
      >
        Удалить все
      </button>
      <div style={{ position: 'relative' }}>
        <button
          className="xy-theme__button"
          onClick={handleGraphMenuToggle}
        >
          Вставить граф
        </button>
        {isGraphMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '100%',
              backgroundColor: 'var(--color-background)',
              boxShadow: 'var(--xy-node-boxshadow-default)',
              borderRadius: '5px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <button
              className="xy-theme__button"
              onClick={() => handleGraphOptionSelect('edges')}
              style={{ width: '160%', textAlign: 'center' }}
            >
              Список ребер
            </button>
          </div>
        )}
      </div>
      <button
        className="xy-theme__button"
        onClick={onLogModalOpen}
      >
        Вставить лог
      </button>
      <label className="xy-theme__label">
        Ориентированное
        <input
          type="checkbox"
          className="xy-theme__checkbox"
          checked={isDirected}
          onChange={handleDirectedChange}
        />
      </label>
      <label className="xy-theme__label">
        Взвешенный
        <input
          type="checkbox"
          className="xy-theme__checkbox"
          checked={isWeighted}
          onChange={handleWeightedChange}
        />
      </label>
    </div>
  );
};

export default Menu;