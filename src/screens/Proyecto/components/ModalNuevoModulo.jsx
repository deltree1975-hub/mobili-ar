// ============================================================
// MOBILI-AR — Modal nuevo módulo
// Archivo  : src/screens/Proyecto/components/ModalNuevoModulo.jsx
// Módulo   : F1-07 — Proyecto y Composición
// Creado   : [fecha]
// ============================================================

import { useState } from 'react';
import '../../Dashboard/components/ModalNuevoTrabajo.css';
import './ModalNuevoModulo.css';

const DISPOSICIONES = [
  { value: 'bm', label: 'Bajomesa' },
  { value: 'al', label: 'Aéreo' },
  { value: 'to', label: 'Torre' },
  { value: 'ca', label: 'Cajón' },
  { value: 'ab', label: 'Abierto' },
  { value: 'me', label: 'Mesa' },
  { value: 'es', label: 'Estante' },
  { value: 'co', label: 'Columna' },
];

function ModalNuevoModulo({ onConfirmar, onCancelar }) {
  const [nombre, setNombre]           = useState('');
  const [disposicion, setDisposicion] = useState('bm');
  const [ancho, setAncho]             = useState('600');
  const [alto, setAlto]               = useState('720');
  const [profundidad, setProfundidad] = useState('560');
  const [error, setError]             = useState('');
  const [cargando, setCargando]       = useState(false);

  async function handleSubmit() {
    if (!nombre.trim())      { setError('El nombre es obligatorio.'); return; }
    if (!ancho || !alto || !profundidad) {
      setError('Las dimensiones son obligatorias.'); return;
    }
    const a = parseFloat(ancho);
    const h = parseFloat(alto);
    const p = parseFloat(profundidad);
    if (isNaN(a) || isNaN(h) || isNaN(p) || a <= 0 || h <= 0 || p <= 0) {
      setError('Las dimensiones deben ser números positivos.'); return;
    }

    setError('');
    setCargando(true);
    try {
      await onConfirmar({
        nombre:      nombre.trim(),
        disposicion,
        ancho:       a,
        alto:        h,
        profundidad: p,
      });
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-titulo">Nuevo módulo</h2>

        <div className="modal-campo">
          <label>Nombre *</label>
          <input
            autoFocus type="text" value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Bajo 3 cajones, Torre despensero"
          />
        </div>

        <div className="modal-campo">
          <label>Tipo</label>
          <div className="disposicion-btns">
            {DISPOSICIONES.map(d => (
              <button
                key={d.value}
                className={`disposicion-btn ${disposicion === d.value ? 'activo' : ''}`}
                onClick={() => setDisposicion(d.value)}
                type="button"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-dims">
          <div className="modal-campo">
            <label>Ancho (mm) *</label>
            <input type="number" value={ancho}
              onChange={e => setAncho(e.target.value)} />
          </div>
          <div className="modal-campo">
            <label>Alto (mm) *</label>
            <input type="number" value={alto}
              onChange={e => setAlto(e.target.value)} />
          </div>
          <div className="modal-campo">
            <label>Profundidad (mm) *</label>
            <input type="number" value={profundidad}
              onChange={e => setProfundidad(e.target.value)} />
          </div>
        </div>

        {error && <div className="modal-error">⚠️ {error}</div>}

        <div className="modal-botones">
          <button className="btn-secundario" onClick={onCancelar} disabled={cargando}>
            Cancelar
          </button>
          <button className="btn-primario" onClick={handleSubmit} disabled={cargando}>
            {cargando ? 'Creando...' : 'Crear módulo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNuevoModulo;