// ============================================================
// MOBILI-AR — Lista de trabajos
// Archivo  : src/screens/Dashboard/components/TrabajosLista.jsx
// Módulo   : F1-06 — Dashboard trabajos
// Depende  : cambiarEstadoTrabajo
// Creado   : [fecha]
// ============================================================

import { cambiarEstadoTrabajo } from '../../../db/index';
import './TrabajosLista.css';

// Etiquetas y colores por estado
const ESTADOS = {
  en_diseno:      { label: 'En diseño',    color: '#6B7280' },
  aprobado:       { label: 'Aprobado',     color: '#2563EB' },
  en_produccion:  { label: 'En producción', color: '#D97706' },
  pausado:        { label: 'Pausado',      color: '#DC2626' },
  completado:     { label: 'Completado',   color: '#059669' },
  entregado:      { label: 'Entregado',    color: '#1A6B3A' },
};

/**
 * Lista de trabajos con acciones rápidas de estado.
 *
 * @param {{
 *   trabajos: Array,
 *   onAbrir: (trabajo: Object) => void,
 *   onRecargar: () => void
 * }} props
 */
function TrabajosLista({ trabajos, onAbrir, onRecargar }) {

  async function handleCambiarEstado(trabajo, nuevoEstado) {
    try {
      await cambiarEstadoTrabajo(trabajo.id, nuevoEstado, 'Sistema', null);
      onRecargar();
    } catch (err) {
      alert(`Error al cambiar estado: ${err}`);
    }
  }

  if (trabajos.length === 0) {
    return (
      <div className="trabajos-vacio">
        <p className="trabajos-vacio-icon">📋</p>
        <p>No hay trabajos activos.</p>
        <p className="trabajos-vacio-sub">Creá el primero con el botón "+ Nuevo trabajo".</p>
      </div>
    );
  }

  return (
    <div className="trabajos-lista">
      {trabajos.map(trabajo => {
        const estadoInfo = ESTADOS[trabajo.estado] || { label: trabajo.estado, color: '#999' };
        return (
          <div key={trabajo.id} className="trabajo-card">

            {/* INFO */}
            <div className="trabajo-info" onClick={() => onAbrir(trabajo)}>
              <div className="trabajo-nombre">{trabajo.nombre}</div>
              {trabajo.cliente && (
                <div className="trabajo-cliente">👤 {trabajo.cliente}</div>
              )}
              {trabajo.fecha_entrega && (
                <div className="trabajo-fecha">📅 {trabajo.fecha_entrega}</div>
              )}
            </div>

            {/* ESTADO */}
            <div className="trabajo-derecha">
              <span
                className="trabajo-estado"
                style={{ background: estadoInfo.color }}
              >
                {estadoInfo.label}
              </span>

              {/* ACCIONES RÁPIDAS */}
              <div className="trabajo-acciones">
                {trabajo.estado === 'en_diseno' && (
                  <button
                    className="btn-accion"
                    onClick={() => handleCambiarEstado(trabajo, 'aprobado')}
                    title="Marcar como aprobado"
                  >
                    Aprobar
                  </button>
                )}
                {trabajo.estado === 'aprobado' && (
                  <button
                    className="btn-accion btn-accion--produccion"
                    onClick={() => handleCambiarEstado(trabajo, 'en_produccion')}
                    title="Enviar a producción"
                  >
                    Producción
                  </button>
                )}
                {trabajo.estado === 'en_produccion' && (
                  <button
                    className="btn-accion"
                    onClick={() => handleCambiarEstado(trabajo, 'completado')}
                    title="Marcar como completado"
                  >
                    Completar
                  </button>
                )}
                <button
                  className="btn-accion btn-accion--abrir"
                  onClick={() => onAbrir(trabajo)}
                  title="Abrir trabajo"
                >
                  Abrir →
                </button>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}

export default TrabajosLista;