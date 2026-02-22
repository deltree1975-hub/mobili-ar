// ============================================================
// MOBILI-AR — Sección: Puertas del módulo
// Archivo  : src/screens/Editor/components/SeccionPuertas.jsx
// Módulo   : F1-08
// ============================================================

import './Secciones.css';

function SeccionPuertas({ datos, onChange }) {
  return (
    <div className="editor-seccion">
      <h3 className="editor-seccion-titulo">🚪 Puertas</h3>

      <div className="editor-campo">
        <label>Apertura</label>
        <div className="apertura-btns">
          {[
            { value: 'derecha',    label: '→ Derecha' },
            { value: 'izquierda',  label: '← Izquierda' },
            { value: 'dos_hojas',  label: '↔ Dos hojas' },
            { value: 'corredera',  label: '⇄ Corredera' },
          ].map(op => (
            <button
              key={op.value}
              className={`apertura-btn ${datos.apertura_puerta === op.value ? 'activo' : ''}`}
              onClick={() => onChange('apertura_puerta', op.value)}
              type="button"
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className="editor-campo">
        <label>Offset tirador (mm desde borde)</label>
        <input
          type="number" min="0" max="200"
          value={datos.offset_tirador}
          onChange={e => onChange('offset_tirador', parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

export default SeccionPuertas;
