// ============================================================
// MOBILI-AR — Componente raíz de la aplicación
// Archivo  : src/App.jsx
// Módulo   : F1-03 — Selector de carpeta
// Depende  : screens/DbSetup, @tauri-apps/api/core
// Expone   : <App />
// Creado   : [fecha]
// ============================================================
// F1-06: agregar Router y rutas al Dashboard
// F2-05: agregar lógica de sesión (login después de DB)
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import DbSetup from './screens/DbSetup';
import './App.css';

// ── ESTADOS POSIBLES DE LA APP ────────────────────────────────
// 'verificando' → arrancando, consultando si hay DB configurada
// 'sin_db'      → primera vez, mostrar selector de carpeta
// 'lista'       → DB abierta, mostrar la app completa
const ESTADO = {
  VERIFICANDO: 'verificando',
  SIN_DB: 'sin_db',
  LISTA: 'lista',
};

/**
 * Componente raíz. Decide qué pantalla mostrar según
 * si la base de datos ya está configurada o no.
 */
function App() {
  // ── ESTADO ───────────────────────────────────────────────────
  const [estado, setEstado] = useState(ESTADO.VERIFICANDO);
  const [rutaDb, setRutaDb] = useState('');

  // ── EFECTO: verificar DB al arrancar ─────────────────────────
  useEffect(() => {
    verificarDb();
  }, []);

  async function verificarDb() {
    try {
      const ruta = await invoke('get_db_path');
      if (ruta) {
        // Ya hay una ruta — intentar abrir la DB existente
        await invoke('abrir_db_existente', { ruta });
        setRutaDb(ruta);
        setEstado(ESTADO.LISTA);
      } else {
        // Primera vez — mostrar selector
        setEstado(ESTADO.SIN_DB);
      }
    } catch {
      // Si falla abrir la DB existente, volver al selector
      setEstado(ESTADO.SIN_DB);
    }
  }

  function handleDbConfigurada(ruta) {
    setRutaDb(ruta);
    setEstado(ESTADO.LISTA);
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

  // estado === LISTA
  // F1-06: reemplazar este bloque por el Dashboard real
  return (
    <div className="app-root">
      <div className="app-bienvenida">
        <div className="app-logo">M</div>
        <h1>MOBILI-AR</h1>
        <p className="app-version">Base de datos conectada</p>
        <div className="app-checklist">
          <p>✅ Tauri inicializado</p>
          <p>✅ React montado</p>
          <p>✅ Base de datos abierta</p>
          <p className="app-ruta">{rutaDb}</p>
          <p>⬜ Dashboard — F1-06</p>
        </div>
      </div>
    </div>
  );
}

export default App;