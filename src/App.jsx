// ============================================================
// MOBILI-AR — Componente raíz de la aplicación
// Archivo  : src/App.jsx
// Módulo   : F2-03 — Pantalla de Login
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import DbSetup   from './screens/DbSetup';
import Login     from './screens/Login';
import Dashboard from './screens/Dashboard';
import Proyecto  from './screens/Proyecto';
import Editor    from './screens/Editor';
import Libreria  from './screens/Libreria';
import './App.css';
import Gestion from './screens/Gestion';

const ESTADO = {
  VERIFICANDO: 'verificando',
  SIN_DB:      'sin_db',
  LOGIN:       'login',
  DASHBOARD:   'dashboard',
  GESTION:     'gestion',    // ← nuevo
  PROYECTO:    'proyecto',
  EDITOR:      'editor',
  LIBRERIA:    'libreria',
};

function App() {
  const [estado, setEstado]               = useState(ESTADO.VERIFICANDO);
  const [sesion, setSesion]               = useState(null); // ← SesionActiva activa
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
          setEstado(ESTADO.LOGIN); // DB ok → ir a login
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

  function handleDbConfigurada() { setEstado(ESTADO.LOGIN); }

  function handleLoginExitoso(sesionActiva) {
    setSesion(sesionActiva);
    if (sesionActiva.modoGestion) {
      setEstado(ESTADO.GESTION);
    } else {
     setEstado(ESTADO.DASHBOARD);
    }
  }

  function handleLogout() {
    setSesion(null);
    setEstado(ESTADO.LOGIN);
  }

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

  function handleIrAlTaller() {
    setSesion(prev => prev ? { ...prev, modoGestion: false } : prev);
    setEstado(ESTADO.DASHBOARD);
  }

  function handleIrAGestion() {
    setSesion(prev => prev ? { ...prev, modoGestion: true } : prev);
    setEstado(ESTADO.GESTION);
  }

  if (estado === ESTADO.VERIFICANDO) {
    return (
      <div className="app-cargando">
        <div className="app-logo">M</div>
        <p>Iniciando...</p>
      </div>
    );
  }

  if (estado === ESTADO.SIN_DB) return <DbSetup onConfigurado={handleDbConfigurada} />;
  if (estado === ESTADO.LOGIN)  return <Login onLoginExitoso={handleLoginExitoso} />;
  if (estado === ESTADO.GESTION) return (
    <Gestion
      sesion={sesion}
      onVolver={() => setEstado(ESTADO.LOGIN)}
      onIrAlTaller={handleIrAlTaller}
    />
  );
  if (estado === ESTADO.DASHBOARD) return (
    <Dashboard
      sesion={sesion}
      onAbrirTrabajo={handleAbrirTrabajo}
      onLogout={handleLogout}
      onIrAGestion={handleIrAGestion}
    />
  );

  if (estado === ESTADO.PROYECTO) return (
    <Proyecto
      trabajo={trabajoActivo}
      sesion={sesion}
      onVolver={() => setEstado(ESTADO.DASHBOARD)}
      onAbrirEditor={handleAbrirEditor}
      onAbrirLibreria={handleAbrirLibreria}
    />
  );

  if (estado === ESTADO.EDITOR) return (
    <Editor
      modulo={moduloActivo}
      sesion={sesion}
      onVolver={() => setEstado(ESTADO.PROYECTO)}
    />
  );

  if (estado === ESTADO.LIBRERIA) return (
    <Libreria
      composicionId={composicionLibreria}
      onVolver={() => setEstado(ESTADO.PROYECTO)}
      onModuloCreado={() => setEstado(ESTADO.PROYECTO)}
    />
  );
}

export default App;