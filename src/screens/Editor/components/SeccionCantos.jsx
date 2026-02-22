// ============================================================
// MOBILI-AR — Sección: Cantos del módulo
// Archivo  : src/screens/Editor/components/SeccionCantos.jsx
// Módulo   : F1-08
// ============================================================

import './Secciones.css';

function SeccionCantos({ datos, onChange }) {
  return (
    <div className="editor-seccion">
      <h3 className="editor-seccion-titulo">📏 Cantos</h3>

      <div className="editor-grid-2">
        <div className="editor-campo">
          <label>Tipo de canto</label>
          <select
            value={datos.tipo_canto}
            onChange={e => onChange('tipo_canto', e.target.value)}
          >
            <option value="pvc">PVC</option>
            <option value="abs">ABS</option>
            <option value="madera">Madera maciza</option>
            <option value="sin_canto">Sin canto</option>
          </select>
        </div>
        <div className="editor-campo">
          <label>Espesor canto (mm)</label>
          <select
            value={datos.espesor_canto}
            onChange={e => onChange('espesor_canto', parseFloat(e.target.value))}
          >
            <option value={0.4}>0.4 mm</option>
            <option value={1}>1 mm</option>
            <option value={2}>2 mm</option>
            <option value={3}>3 mm</option>
          </select>
        </div>
      </div>

      <div className="editor-campo">
        <label>Aplicar canto en</label>
        <div className="cantos-caras">
          {[
            { key: 'canto_sup', label: 'Superior (tapa)' },
            { key: 'canto_inf', label: 'Inferior (piso)' },
            { key: 'canto_der', label: 'Frontal (vista)' },
            { key: 'canto_izq', label: 'Trasero (pared)' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`canto-btn ${datos[key] ? 'activo' : ''}`}
              onClick={() => onChange(key, !datos[key])}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SeccionCantos;
