// ============================================================
// MOBILI-AR — Componente raíz de la aplicación
// Archivo  : src/App.jsx
// Módulo   : F1-06 — Dashboard trabajos
// Depende  : screens/DbSetup, screens/Dashboard
// Creado   : [fecha]
// ============================================================
// F1-07: agregar pantalla de Proyecto/Composición
// F2-05: agregar lógica de sesión antes del Dashboard
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import DbSetup from './screens/DbSetup';
import Dashboard from './screens/Dashboard';
import './App.css';

const ESTADO = {
  VERIFICANDO:  'verificando',
  SIN_DB:       'sin_db',
  DASHBOARD:    'dashboard',
  TRABAJO:      'trabajo',   // F1-07: pantalla de trabajo individual
};

function App() {
  // ── ESTADO ───────────────────────────────────────────────────
  const [estado, setEstado]           = useState(ESTADO.VERIFICANDO);
  const [trabajoActivo, setTrabajoActivo] = useState(null);

  // ── EFECTO: verificar DB al arrancar ─────────────────────────
  useEffect(() => {
    verificarDb();
  }, []);

  async function verificarDb() {
    try {
      const ruta = await invoke('get_db_path');
      if (ruta) {
        await invoke('abrir_db_existente', { ruta });
        setEstado(ESTADO.DASHBOARD);
      } else {
        setEstado(ESTADO.SIN_DB);
      }
    } catch {
      setEstado(ESTADO.SIN_DB);
    }
  }

  function handleDbConfigurada() {
    setEstado(ESTADO.DASHBOARD);
  }

  function handleAbrirTrabajo(trabajo) {
    setTrabajoActivo(trabajo);
    setEstado(ESTADO.TRABAJO);
    // F1-07: navegar a la pantalla de trabajo
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

  // F1-07: reemplazar por <PantallaTrabajo trabajo={trabajoActivo} />
  if (estado === ESTADO.TRABAJO) {
    return (
      <div className="app-root">
        <div className="app-bienvenida">
          <h2>Trabajo: {trabajoActivo?.nombre}</h2>
          <p style={{ marginTop: 8, color: '#999', fontSize: 13 }}>
            Pantalla de trabajo — F1-07
          </p>
          <button
            style={{ marginTop: 20, padding: '8px 16px', cursor: 'pointer' }}
            onClick={() => setEstado(ESTADO.DASHBOARD)}
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }
}

export default App;