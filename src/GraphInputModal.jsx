import React, { useState, useEffect } from 'react';
import './Menu.css';

const GraphInputModal = ({ onClose, onSubmit, initialGraph }) => {
  const [graphContent, setGraphContent] = useState(initialGraph || '');

  useEffect(() => {
    setGraphContent(initialGraph || '');
  }, [initialGraph]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setGraphContent(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (event) => {
    setGraphContent(event.target.value);
  };

  const handleSubmit = () => {
    onSubmit(graphContent);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 30,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-background)',
          padding: '20px',
          borderRadius: '10px',
          width: '500px',
          maxWidth: '90%',
          boxShadow: 'var(--xy-node-boxshadow-default)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <input
            type="file"
            accept=".txt"
            className="xy-theme__input"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '0.5rem',
            }}
            onChange={handleFileUpload}
          />
        </div>
        <textarea
          className="xy-theme__input"
          value={graphContent}
          onChange={handleTextChange}
          placeholder="Вставьте список ребер здесь (формат: n m, затем m строк с парами чисел)..."
          style={{
            width: '100%',
            height: '200px',
            resize: 'vertical',
            marginBottom: '15px',
            fontSize: '1rem',
            boxSizing: 'border-box',
            padding: '0.5rem',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            className="xy-theme__button"
            onClick={onClose}
            style={{ width: '48%', height: '40px' }}
          >
            Отмена
          </button>
          <button
            className="xy-theme__button"
            onClick={handleSubmit}
            style={{ width: '48%', height: '40px' }}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

export default GraphInputModal;