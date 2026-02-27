// ============================================================
// MOBILI-AR — Selector de mansión (toggle Gestión → Taller)
// Archivo  : src/components/SeleccionMansion.jsx
// Módulo   : F2-07 — Toggle sesión sin re-login
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './SeleccionMansion.css';

const ICONOS = {
  CORTE:    '🪚',
  FILOS:    '📐',
  CNC:      '🤖',
  ARMADO:   '🔧',
  PANOLERO: '📦',
  LIMPIEZA: '🧹',
  CONTROL:  '✅',
};

function SeleccionMansion({ sesion, onMansionElegida, onCancelar }) {
  const [mansiones, setMansiones] = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [eligiendo, setEligiendo] = useState(null); // id de la mansion que se está procesando
  const [error,     setError]     = useState('');

  const usuario = sesion?.usuario;

  useEffect(() => {
    cargarMansiones();
  }, []);

  async function cargarMansiones() {
    try {
      const data = await invoke('get_mansiones_usuario', {
        usuarioId: usuario.id,
        rol:       usuario.rol,
      });
      setMansiones(data);
    } catch (e) {
      setError('Error al cargar mansiones: ' + e);
    } finally {
      setCargando(false);
    }
  }

  async function handleElegir(mansion) {
    setEligiendo(mansion.id);
    setError('');
    try {
      await onMansionElegida(mansion);
    } catch (e) {
      setError('Error al cambiar de mansión');
      setEligiendo(null);
    }
  }

  return (
    <div className="sm-root">
      <div className="sm-card">

        {/* Cabecera */}
        <div className="sm-header">
          <div className="sm-avatar">
            {usuario?.nombre?.charAt(0)}{usuario?.apellido?.charAt(0)}
          </div>
          <div className="sm-header-info">
            <p className="sm-nombre">{usuario?.nombre} {usuario?.apellido}</p>
            <p className="sm-rol">{usuario?.rol}</p>
          </div>
        </div>

        <p className="sm-instruccion">¿En qué mansión vas a trabajar?</p>

        {/* Lista de mansiones */}
        {cargando ? (
          <p className="sm-cargando">Cargando mansiones...</p>
        ) : (
          <div className="sm-mansiones">
            {mansiones.map(m => (
              <button
                key={m.id}
                className={`sm-mansion-btn ${eligiendo === m.id ? 'sm-mansion-btn--cargando' : ''}`}
                onClick={() => handleElegir(m)}
                disabled={eligiendo !== null}
              >
                <span className="sm-mansion-icono">
                  {ICONOS[m.codigo] ?? '🏭'}
                </span>
                <span className="sm-mansion-nombre">{m.nombre}</span>
                {eligiendo === m.id && (
                  <span className="sm-mansion-spinner">⏳</span>
                )}
              </button>
            ))}
          </div>
        )}

        {error && <p className="sm-error">{error}</p>}

        {/* Cancelar */}
        <button className="sm-cancelar" onClick={onCancelar} disabled={eligiendo !== null}>
          ← Volver a Gestión
        </button>

      </div>
    </div>
  );
}

export default SeleccionMansion;
