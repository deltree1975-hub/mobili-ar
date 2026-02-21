// ============================================================
// MOBILI-AR — Modal nueva composición
// Archivo  : src/screens/Proyecto/components/ModalNuevaComposicion.jsx
// Módulo   : F1-07 — Proyecto y Composición
// Creado   : [fecha]
// ============================================================

import { useState } from 'react';
import '../../Dashboard/components/ModalNuevoTrabajo.css';

function ModalNuevaComposicion({ onConfirmar, onCancelar }) {
  const [nombre, setNombre]       = useState('');
  const [descripcion, setDesc]    = useState('');
  const [error, setError]         = useState('');
  const [cargando, setCargando]   = useState(false);

  async function handleSubmit() {
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    setError('');
    setCargando(true);
    try {
      await onConfirmar({ nombre: nombre.trim(), descripcion: descripcion.trim() || null });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-titulo">Nueva composición</h2>

        <div className="modal-campo">
          <label>Nombre *</label>
          <input
            autoFocus type="text" value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Ej: Cocina, Dormitorio, Baño"
          />
        </div>

        <div className="modal-campo">
          <label>Descripción</label>
          <input
            type="text" value={descripcion}
            onChange={e => setDesc(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        {error && <div className="modal-error">⚠️ {error}</div>}

        <div className="modal-botones">
          <button className="btn-secundario" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </button>
          <button className="btn-primario" onClick={handleSubmit} disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNuevaComposicion;