// ============================================================
// MOBILI-AR — Dashboard principal
// Archivo  : src/screens/Dashboard/index.jsx
// Módulo   : F1-06 — Dashboard trabajos
// Depende  : src/db/index.js → getTrabajosActivos, crearTrabajo
// Expone   : <Dashboard onAbrirTrabajo={fn} />
// Creado   : [fecha]
// ============================================================

import { useState, useEffect } from 'react';
import { getTrabajosActivos, crearTrabajo } from '../../db/index';
import TrabajosLista from './components/TrabajosLista';
import ModalNuevoTrabajo from './components/ModalNuevoTrabajo';
import './Dashboard.css';

/**
 * Pantalla principal de MOBILI-AR.
 * Muestra la lista de trabajos activos y permite crear nuevos.
 *
 * @param {{ onAbrirTrabajo: (trabajo: Object) => void }} props
 */
function Dashboard({ onAbrirTrabajo }) {
  // ── ESTADO ───────────────────────────────────────────────────
  const [trabajos, setTrabajos]         = useState([]);
  const [cargando, setCargando]         = useState(true);
  const [error, setError]               = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [creando, setCreando]           = useState(false);

  // ── EFECTOS ──────────────────────────────────────────────────
  useEffect(() => {
    cargarTrabajos();
  }, []);

  // ── LÓGICA ───────────────────────────────────────────────────
  async function cargarTrabajos() {
    setCargando(true);
    setError('');
    try {
      const data = await getTrabajosActivos(false);
      setTrabajos(data);
    } catch (err) {
      setError(`Error al cargar trabajos: ${err}`);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrearTrabajo(datos) {
    setCreando(true);
    try {
      const nuevo = await crearTrabajo(datos);
      setTrabajos(prev => [...prev, nuevo]);
      setModalAbierto(false);
    } catch (err) {
      throw new Error(`No se pudo crear el trabajo: ${err}`);
    } finally {
      setCreando(false);
    }
  }

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-header-izq">
          <span className="dashboard-logo">M</span>
          <h1>MOBILI-AR</h1>
        </div>
        <button
          className="btn-primario"
          onClick={() => setModalAbierto(true)}
        >
          + Nuevo trabajo
        </button>
      </header>

      {/* CONTENIDO */}
      <main className="dashboard-main">
        {cargando && (
          <div className="dashboard-cargando">Cargando trabajos...</div>
        )}

        {error && (
          <div className="dashboard-error">⚠️ {error}</div>
        )}

        {!cargando && !error && (
          <TrabajosLista
            trabajos={trabajos}
            onAbrir={onAbrirTrabajo}
            onRecargar={cargarTrabajos}
          />
        )}
      </main>

      {/* MODAL NUEVO TRABAJO */}
      {modalAbierto && (
        <ModalNuevoTrabajo
          onConfirmar={handleCrearTrabajo}
          onCancelar={() => setModalAbierto(false)}
          cargando={creando}
        />
      )}

    </div>
  );
}

export default Dashboard;