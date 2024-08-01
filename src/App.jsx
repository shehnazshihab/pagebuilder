import React, { useState } from 'react';
import Canvas from './Canvas';
import './App.css';

function App() {
  const [mode, setMode] = useState('view'); // 'edit' or 'view'

  const handleToggleMode = () => {
    setMode((prevMode) => (prevMode === 'view' ? 'edit' : 'view'));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Page Builder</h1>
      </header>
      <main>
        <Canvas mode={mode} />
      </main>
    </div>
  );
}

export default App;
