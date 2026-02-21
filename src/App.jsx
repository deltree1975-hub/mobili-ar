// ============================================================
// MOBILI-AR — Componente raíz de la aplicación
// Archivo  : src/App.jsx
// Módulo   : F1-07 — Proyecto y Composición
// Depende  : screens/DbSetup, screens/Dashboard, screens/Proyecto
// Creado   : [fecha]
// ============================================================
// F1-08: agregar pantalla de Editor de módulo
// F2-05: agregar lógica de sesión antes del Dashboard
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import DbSetup from './screens/DbSetup';
import Dashboard from './screens/Dashboard';
import Proyecto from './screens/Proyecto';
import './App.css';

const ESTADO = {
  VERIFICANDO: 'verificando',
  SIN_DB:      'sin_db',
  DASHBOARD:   'dashboard',
  PROYECTO:    'proyecto',
  EDITOR:      'editor',   // F1-08
};

function App() {
  const [estado, setEstado]             = useState(ESTADO.VERIFICANDO);
  const [trabajoActivo, setTrabajoActivo] = useState(null);
  const [moduloActivo, setModuloActivo]   = useState(null);

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
    // F1-08: navegar al editor paramétrico
  }

  // ── RENDER ───────────────────────────────────────────────────
  if (estado === ESTADO.VERIFICANDO) {
    return (
      <div className="app-cargando">
        <div className="app-logo">M</div>
        <p>Iniciando...</p>
      </div>
    );
  }

  if (estado === ESTADO.SIN_DB) {
    return <DbSetup onConfigurado={handleDbConfigurada} />;
  }

  if (estado === ESTADO.DASHBOARD) {
    return <Dashboard onAbrirTrabajo={handleAbrirTrabajo} />;
  }

  if (estado === ESTADO.PROYECTO) {
    return (
      <Proyecto
        trabajo={trabajoActivo}
        onVolver={() => setEstado(ESTADO.DASHBOARD)}
        onAbrirEditor={handleAbrirEditor}
      />
    );
  }

  // F1-08: reemplazar por <Editor modulo={moduloActivo} />
  if (estado === ESTADO.EDITOR) {
    return (
      <div className="app-root">
        <div className="app-bienvenida">
          <h2>Editor: {moduloActivo?.nombre}</h2>
          <p style={{ marginTop: 8, color: '#999', fontSize: 13 }}>
            Editor paramétrico — F1-08
          </p>
          <button
            style={{ marginTop: 20, padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => setEstado(ESTADO.PROYECTO)}
          >
            ← Volver al proyecto
          </button>
        </div>
      </div>
    );
  }
}

export default App;