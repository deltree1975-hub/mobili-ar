// ============================================================
// MOBILI-AR — Dashboard principal
// Archivo  : src/screens/Dashboard/index.jsx
// Módulo   : F1-06 — Dashboard trabajos | F2-07 — Toggle sesión
// ============================================================

import { useState, useEffect } from 'react';
import { getTrabajosActivos, crearTrabajo } from '../../db/index';
import TrabajosLista     from './components/TrabajosLista';
import ModalNuevoTrabajo from './components/ModalNuevoTrabajo';
import './Dashboard.css';

const LABEL_MANSION = {
  CORTE:    '🪚 Corte',
  FILOS:    '📐 Filos',
  CNC:      '🤖 CNC',
  ARMADO:   '🔧 Armado',
  PANOLERO: '📦 Pañolero',
  LIMPIEZA: '🧹 Limpieza',
  CONTROL:  '✅ Control',
};

/**
 * @param {{
 *   sesion:       object,
 *   onAbrirTrabajo: (trabajo: object) => void,
 *   onLogout:     () => void,
 *   onIrAGestion: (() => void) | undefined,  // solo admin/dueño
 * }} props
 */
function Dashboard({ sesion, onAbrirTrabajo, onLogout, onIrAGestion }) {
  const [trabajos,     setTrabajos]     = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [creando,      setCreando]      = useState(false);

  const usuario = sesion?.usuario;
  const mansion = sesion?.mansion;

  useEffect(() => { cargarTrabajos(); }, []);

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

  return (
    <div className="dashboard">

      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dashboard-header-izq">
          <span className="dashboard-logo">M</span>
          <h1>MOBILI-AR</h1>
        </div>

        <div className="dashboard-header-der">
          {/* Mansión activa */}
          {mansion && (
            <span className="dashboard-mansion">
              {LABEL_MANSION[mansion.codigo] ?? mansion.nombre}
            </span>
          )}

          {/* Info de usuario */}
          {usuario && (
            <span className="dashboard-usuario">
              {usuario.nombre} {usuario.apellido}
            </span>
          )}

          {/* Toggle → Gestión (solo admin/dueño) */}
          {onIrAGestion && (
            <button
              className="dashboard-btn-gestion"
              onClick={onIrAGestion}
              title="Ir al panel de gestión"
            >
              ⚙️ Gestión
            </button>
          )}

          {/* Nuevo trabajo */}
          <button
            className="btn-primario"
            onClick={() => setModalAbierto(true)}
          >
            + Nuevo trabajo
          </button>

          {/* Cerrar sesión */}
          {onLogout && (
            <button
              className="dashboard-btn-logout"
              onClick={onLogout}
              title="Cerrar sesión"
            >
              ←
            </button>
          )}
        </div>
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