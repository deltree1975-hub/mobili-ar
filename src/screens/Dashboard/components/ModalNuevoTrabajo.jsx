// ============================================================
// MOBILI-AR — Modal para crear nuevo trabajo
// Archivo  : src/screens/Dashboard/components/ModalNuevoTrabajo.jsx
// Módulo   : F1-06 — Dashboard trabajos
// Creado   : [fecha]
// ============================================================

import { useState } from 'react';
import './ModalNuevoTrabajo.css';

/**
 * Modal para crear un nuevo trabajo.
 *
 * @param {{
 *   onConfirmar: (datos: Object) => Promise<void>,
 *   onCancelar: () => void,
 *   cargando: boolean
 * }} props
 */
function ModalNuevoTrabajo({ onConfirmar, onCancelar, cargando }) {
  const [nombre, setNombre]   = useState('');
  const [cliente, setCliente] = useState('');
  const [notas, setNotas]     = useState('');
  const [error, setError]     = useState('');

  async function handleSubmit() {
    if (!nombre.trim()) {
      setError('El nombre del trabajo es obligatorio.');
      return;
    }
    setError('');
    try {
      await onConfirmar({
        nombre:  nombre.trim(),
        cliente: cliente.trim() || null,
        notas:   notas.trim()   || null,
      });
    } catch (err) {
      setError(err.message);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) handleSubmit();
    if (e.key === 'Escape') onCancelar();
  }

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <h2 className="modal-titulo">Nuevo trabajo</h2>

        <div className="modal-campo">
          <label>Nombre *</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ej: Cocina García"
            autoFocus
          />
        </div>

        <div className="modal-campo">
          <label>Cliente</label>
          <input
            type="text"
            value={cliente}
            onChange={e => setCliente(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nombre del cliente (opcional)"
          />
        </div>

        <div className="modal-campo">
          <label>Notas</label>
          <textarea
            value={notas}
            onChange={e => setNotas(e.target.value)}
            placeholder="Observaciones (opcional)"
            rows={3}
          />
        </div>

        {error && <div className="modal-error">⚠️ {error}</div>}

        <div className="modal-botones">
          <button className="btn-secundario" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </button>
          <button className="btn-primario" onClick={handleSubmit} disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear trabajo'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ModalNuevoTrabajo;