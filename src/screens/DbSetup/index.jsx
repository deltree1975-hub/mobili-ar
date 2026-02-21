// ============================================================
// MOBILI-AR — Pantalla de configuración inicial
// Archivo  : src/screens/DbSetup/index.jsx
// Módulo   : F1-03 — Selector de carpeta
// Depende  : @tauri-apps/api/core → invoke()
// Expone   : <DbSetup onConfigurado={fn} /> 
// Creado   : [fecha]
// ============================================================
// Se muestra SOLO la primera vez que se abre la app,
// cuando todavía no hay base de datos configurada.
// Una vez que el usuario elige la carpeta, nunca vuelve a aparecer.
// ============================================================

import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './DbSetup.css';

/**
 * Pantalla de bienvenida y configuración inicial.
 * Permite al usuario elegir la carpeta donde se guardará
 * mobiliar.db mediante el diálogo nativo del sistema.
 *
 * @param {{ onConfigurado: (ruta: string) => void }} props
 * onConfigurado se llama con la ruta del .db cuando está listo.
 */
function DbSetup({ onConfigurado }) {
  // ── ESTADO ─────────────────────────────────────────────────
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // ── HANDLERS ───────────────────────────────────────────────
  async function handleElegirCarpeta() {
    setCargando(true);
    setError('');

    try {
      const ruta = await invoke('seleccionar_carpeta_db');
      // Rust devuelve la ruta completa al .db creado
      onConfigurado(ruta);
    } catch (err) {
      // 'cancelado' es el usuario cerrando el diálogo — no es error
      if (err !== 'cancelado') {
        setError(`No se pudo crear la base de datos: ${err}`);
      }
    } finally {
      setCargando(false);
    }
  }

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="dbsetup-root">
      <div className="dbsetup-card">

        <div className="dbsetup-logo">M</div>
        <h1 className="dbsetup-titulo">MOBILI-AR</h1>
        <p className="dbsetup-subtitulo">Sistema de gestión y producción de mobiliario</p>

        <div className="dbsetup-separador" />

        <div className="dbsetup-info">
          <h2>Primera configuración</h2>
          <p>
            Elegí la carpeta donde se va a guardar la base de datos.
            Si trabajás en red, elegí una carpeta compartida accesible
            desde todas las computadoras del taller.
          </p>
        </div>

        <div className="dbsetup-ejemplo">
          <span className="dbsetup-ejemplo-label">Ejemplos de ruta:</span>
          <code>C:\Taller\MOBILI-AR\</code>
          <code>\\servidor\compartido\mobili-ar\</code>
        </div>

        {error && (
          <div className="dbsetup-error">
            ⚠️ {error}
          </div>
        )}

        <button
          className="dbsetup-btn"
          onClick={handleElegirCarpeta}
          disabled={cargando}
        >
          {cargando ? 'Configurando...' : '📁 Elegir carpeta'}
        </button>

        <p className="dbsetup-nota">
          Esta configuración solo se hace una vez.
        </p>

      </div>
    </div>
  );
}

export default DbSetup;