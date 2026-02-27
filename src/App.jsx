// ============================================================
// MOBILI-AR — Componente raíz de la aplicación
// Archivo  : src/App.jsx
// Módulo   : F2-07 — Toggle sesión Taller ↔ Gestión
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import DbSetup   from './screens/DbSetup';
import Login     from './screens/Login';
import Dashboard from './screens/Dashboard';
import Proyecto  from './screens/Proyecto';
import Editor    from './screens/Editor';
import Libreria  from './screens/Libreria';
import Gestion   from './screens/Gestion';
import SeleccionMansion from './components/SeleccionMansion';
import './App.css';

const ESTADO = {
  VERIFICANDO:       'verificando',
  SIN_DB:            'sin_db',
  LOGIN:             'login',
  DASHBOARD:         'dashboard',
  GESTION:           'gestion',
  PROYECTO:          'proyecto',
  EDITOR:            'editor',
  LIBRERIA:          'libreria',
  ELIGIENDO_MANSION: 'eligiendo_mansion', // ← F2-07: toggle Gestión → Taller
};

function App() {
  const [estado, setEstado]               = useState(ESTADO.VERIFICANDO);
  const [sesion, setSesion]               = useState(null);
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
          setEstado(ESTADO.LOGIN);
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

  // ── F2-07: Gestión → Taller ──────────────────────────────────
  // Admin/dueño puede ir al taller eligiendo mansión sin re-login.
  function handleIrAlTaller() {
    setEstado(ESTADO.ELIGIENDO_MANSION);
  }

  async function handleMansionElegida(mansion) {
    try {
      // Abrir nueva sesión en la mansión elegida (sin modoGestion)
      const nuevaSesion = await invoke('login', {
        token:     sesion.usuario.token,
        mansionId: mansion.id,
      });
      setSesion(nuevaSesion); // sin modoGestion → va al taller
      setEstado(ESTADO.DASHBOARD);
    } catch (e) {
      console.error('Error al cambiar de mansión:', e);
    }
  }

  function handleCancelarEleccionMansion() {
    // Volver a gestión si venía de ahí, o a dashboard si venía del taller
    setEstado(sesion?.modoGestion ? ESTADO.GESTION : ESTADO.DASHBOARD);
  }

  // ── F2-07: Taller → Gestión ──────────────────────────────────
  // Solo disponible para admin/dueño. Sin re-login, directo.
  function handleIrAGestion() {
    setSesion(s => ({ ...s, modoGestion: true }));
    setEstado(ESTADO.GESTION);
  }

  // ── Navegación interna ───────────────────────────────────────
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

  // ── Renders ──────────────────────────────────────────────────

  if (estado === ESTADO.VERIFICANDO) {
    return (
      <div className="app-cargando">
        <div className="app-logo">M</div>
        <p>Iniciando...</p>
      </div>
    );
  }

  if (estado === ESTADO.SIN_DB)
    return <DbSetup onConfigurado={handleDbConfigurada} />;

  if (estado === ESTADO.LOGIN)
    return <Login onLoginExitoso={handleLoginExitoso} />;

  if (estado === ESTADO.ELIGIENDO_MANSION)
    return (
      <SeleccionMansion
        sesion={sesion}
        onMansionElegida={handleMansionElegida}
        onCancelar={handleCancelarEleccionMansion}
      />
    );

  if (estado === ESTADO.GESTION)
    return (
      <Gestion
        sesion={sesion}
        onVolver={handleLogout}
        onIrAlTaller={handleIrAlTaller}
      />
    );

  if (estado === ESTADO.DASHBOARD)
    return (
      <Dashboard
        sesion={sesion}
        onAbrirTrabajo={handleAbrirTrabajo}
        onLogout={handleLogout}
        onIrAGestion={
          sesion?.usuario?.rol === 'admin' || sesion?.usuario?.rol === 'dueno'
            ? handleIrAGestion
            : undefined
        }
      />
    );

  if (estado === ESTADO.PROYECTO)
    return (
      <Proyecto
        trabajo={trabajoActivo}
        sesion={sesion}
        onVolver={() => setEstado(ESTADO.DASHBOARD)}
        onAbrirEditor={handleAbrirEditor}
        onAbrirLibreria={handleAbrirLibreria}
      />
    );

  if (estado === ESTADO.EDITOR)
    return (
      <Editor
        modulo={moduloActivo}
        sesion={sesion}
        onVolver={() => setEstado(ESTADO.PROYECTO)}
      />
    );

  if (estado === ESTADO.LIBRERIA)
    return (
      <Libreria
        composicionId={composicionLibreria}
        onVolver={() => setEstado(ESTADO.PROYECTO)}
        onModuloCreado={() => setEstado(ESTADO.PROYECTO)}
      />
    );
}

export default App;