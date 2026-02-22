// ============================================================
// MOBILI-AR — Componente raíz de la aplicación
// Archivo  : src/App.jsx
// Módulo   : F1-09 — Librería de módulos
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import DbSetup from './screens/DbSetup';
import Dashboard from './screens/Dashboard';
import Proyecto from './screens/Proyecto';
import Editor from './screens/Editor';
import Libreria from './screens/Libreria';
import './App.css';

const ESTADO = {
  VERIFICANDO: 'verificando',
  SIN_DB:      'sin_db',
  DASHBOARD:   'dashboard',
  PROYECTO:    'proyecto',
  EDITOR:      'editor',
  LIBRERIA:    'libreria',
};

function App() {
  const [estado, setEstado]               = useState(ESTADO.VERIFICANDO);
  const [trabajoActivo, setTrabajoActivo] = useState(null);
  const [moduloActivo, setModuloActivo]   = useState(null);
  const [composicionLibreria, setComposicionLibreria] = useState(null);

  useEffect(() => { verificarDb(); }, []);

  async function verificarDb() {
    try {
      const ruta = await invoke('get_db_path');
      if (ruta && ruta.trim() !== '') {
        try {
          await invoke('abrir_db_existente', { ruta });
          setEstado(ESTADO.DASHBOARD);
        } catch {
          setEstado(ESTADO.SIN_DB);
        }
      } else {
        setEstado(ESTADO.SIN_DB);
      }
    } catch {
      setEstado(ESTADO.SIN_DB);
    }
  }

  function handleDbConfigurada() { setEstado(ESTADO.DASHBOARD); }

  function handleAbrirTrabajo(trabajo) {
    setTrabajoActivo(trabajo);
    setEstado(ESTADO.PROYECTO);
  }

  function handleAbrirEditor(modulo) {
    setModuloActivo(modulo);
    setEstado(ESTADO.EDITOR);
  }

  function handleAbrirLibreria(composicionId) {
    setComposicionLibreria(composicionId);
    setEstado(ESTADO.LIBRERIA);
  }

  if (estado === ESTADO.VERIFICANDO) {
    return (
      <div className="app-cargando">
        <div className="app-logo">M</div>
        <p>Iniciando...</p>
      </div>
    );
  }

  if (estado === ESTADO.SIN_DB)    return <DbSetup onConfigurado={handleDbConfigurada} />;
  if (estado === ESTADO.DASHBOARD) return <Dashboard onAbrirTrabajo={handleAbrirTrabajo} />;

  if (estado === ESTADO.PROYECTO) return (
    <Proyecto
      trabajo={trabajoActivo}
      onVolver={() => setEstado(ESTADO.DASHBOARD)}
      onAbrirEditor={handleAbrirEditor}
      onAbrirLibreria={handleAbrirLibreria}
    />
  );

  if (estado === ESTADO.EDITOR) return (
    <Editor
      modulo={moduloActivo}
      onVolver={() => setEstado(ESTADO.PROYECTO)}
    />
  );

  if (estado === ESTADO.LIBRERIA) return (
    <Libreria
      composicionId={composicionLibreria}
      onVolver={() => setEstado(ESTADO.PROYECTO)}
      onModuloCreado={(modulo) => {
        // Volver al proyecto — el módulo ya fue creado en la DB
        setEstado(ESTADO.PROYECTO);
      }}
    />
  );
}

export default App;