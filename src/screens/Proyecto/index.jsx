// ============================================================
// MOBILI-AR — Pantalla de Proyecto
// Archivo  : src/screens/Proyecto/index.jsx
// Módulo   : F1-07 — Proyecto y Composición
// Depende  : src/db/index.js → getComposiciones, crearComposicion,
//            getModulos, crearModulo, eliminarModulo
// Expone   : <Proyecto trabajo={} onVolver={fn} onAbrirEditor={fn} />
// Creado   : [fecha]
// ============================================================

import { useState, useEffect } from 'react';
import {
  getComposiciones, crearComposicion,
  getModulos, crearModulo, eliminarModulo,
} from '../../db/index';
import ComposicionPanel from './components/ComposicionPanel';
import ModalNuevaComposicion from './components/ModalNuevaComposicion';
import ModalNuevoModulo from './components/ModalNuevoModulo';
import './Proyecto.css';

/**
 * Pantalla principal de un trabajo.
 * Muestra todas las composiciones y sus módulos.
 *
 * @param {{
 *   trabajo: Object,
 *   onVolver: () => void,
 *   onAbrirEditor: (modulo: Object) => void
 * }} props
 */
function Proyecto({ trabajo, onVolver, onAbrirEditor }) {
  // ── ESTADO ───────────────────────────────────────────────────
  const [composiciones, setComposiciones] = useState([]);
  const [modulos, setModulos]             = useState({}); // { [composicionId]: Modulo[] }
  const [cargando, setCargando]           = useState(true);
  const [modalComp, setModalComp]         = useState(false);
  const [modalMod, setModalMod]           = useState(null); // composicionId o null
  const [confirmarEliminar, setConfirmarEliminar] = useState(null); // { composicionId, moduloId, nombre }

  // ── EFECTOS ──────────────────────────────────────────────────
  useEffect(() => {
    cargarTodo();
  }, [trabajo.id]);

  // ── LÓGICA ───────────────────────────────────────────────────
  async function cargarTodo() {
    setCargando(true);
    try {
      const comps = await getComposiciones(trabajo.id);
      setComposiciones(comps);

      // Cargar módulos de cada composición en paralelo
      const modulosMap = {};
      await Promise.all(comps.map(async comp => {
        modulosMap[comp.id] = await getModulos(comp.id);
      }));
      setModulos(modulosMap);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrearComposicion(datos) {
    const nueva = await crearComposicion({
      trabajo_id:  trabajo.id,
      nombre:      datos.nombre,
      descripcion: datos.descripcion,
    });
    setComposiciones(prev => [...prev, nueva]);
    setModulos(prev => ({ ...prev, [nueva.id]: [] }));
    setModalComp(false);
  }

  async function handleCrearModulo(composicionId, datos) {
    const nuevo = await crearModulo({ composicion_id: composicionId, ...datos });
    setModulos(prev => ({
      ...prev,
      [composicionId]: [...(prev[composicionId] || []), nuevo],
    }));
    setModalMod(null);
  }

  function handleEliminarModulo(composicionId, moduloId, nombreModulo) {
  setConfirmarEliminar({ composicionId, moduloId, nombre: nombreModulo });
}

async function confirmarEliminarModulo() {
  const { composicionId, moduloId } = confirmarEliminar;
  await eliminarModulo(moduloId);
  setModulos(prev => ({
    ...prev,
    [composicionId]: prev[composicionId].filter(m => m.id !== moduloId),
  }));
  setConfirmarEliminar(null);
}

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="proyecto">

      {/* HEADER */}
      <header className="proyecto-header">
        <button className="btn-volver" onClick={onVolver}>← Trabajos</button>
        <div className="proyecto-titulo">
          <h1>{trabajo.nombre}</h1>
          {trabajo.cliente && <span className="proyecto-cliente">👤 {trabajo.cliente}</span>}
        </div>
        <button className="btn-primario" onClick={() => setModalComp(true)}>
          + Composición
        </button>
      </header>

      {/* CONTENIDO */}
      <main className="proyecto-main">
        {cargando && <div className="proyecto-cargando">Cargando...</div>}

        {!cargando && composiciones.length === 0 && (
          <div className="proyecto-vacio">
            <p className="proyecto-vacio-icon">🏠</p>
            <p>Este trabajo no tiene composiciones todavía.</p>
            <p className="proyecto-vacio-sub">
              Creá la primera con el botón "+ Composición".
            </p>
            <p className="proyecto-vacio-sub">
              Ejemplo: "Cocina", "Dormitorio principal", "Baño".
            </p>
          </div>
        )}

        {!cargando && composiciones.map(comp => (
          <ComposicionPanel
            key={comp.id}
            composicion={comp}
            modulos={modulos[comp.id] || []}
            onNuevoModulo={() => setModalMod(comp.id)}
            onAbrirEditor={onAbrirEditor}
            onEliminarModulo={(id, nombre) => handleEliminarModulo(comp.id, id, nombre)}
          />
        ))}
      </main>

      {/* MODALES */}
      {modalComp && (
        <ModalNuevaComposicion
          onConfirmar={handleCrearComposicion}
          onCancelar={() => setModalComp(false)}
        />
      )}
      {modalMod && (
        <ModalNuevoModulo
          onConfirmar={datos => handleCrearModulo(modalMod, datos)}
          onCancelar={() => setModalMod(null)}
        />
      )}
      {confirmarEliminar && (
        <div className="modal-overlay" onClick={() => setConfirmarEliminar(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-titulo">Eliminar módulo</h2>
            <p style={{ color: 'var(--color-mid)', marginBottom: 24 }}>
              ¿Eliminar <strong>{confirmarEliminar.nombre}</strong> y todas sus piezas?
            </p>Esta acción no se puede deshacer.
            <div className="modal-botones">
              <button className="btn-secundario" onClick={() => setConfirmarEliminar(null)}>
                Cancelar
              </button>
              <button
                className="btn-primario"
                style={{ background: '#cc0000' }}
                onClick={confirmarEliminarModulo}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Proyecto;