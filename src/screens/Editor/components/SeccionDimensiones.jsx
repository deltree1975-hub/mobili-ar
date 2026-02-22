// ============================================================
// MOBILI-AR — Sección: Dimensiones del módulo
// Archivo  : src/screens/Editor/components/SeccionDimensiones.jsx
// Módulo   : F1-08
// ============================================================

import './Secciones.css';

function SeccionDimensiones({ datos, onChange }) {
  return (
    <div className="editor-seccion">
      <h3 className="editor-seccion-titulo">📐 Dimensiones</h3>
      <div className="editor-grid-3">
        <div className="editor-campo">
          <label>Ancho (mm)</label>
          <input
            type="number" min="100" max="3000"
            value={datos.ancho}
            onChange={e => onChange('ancho', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="editor-campo">
          <label>Alto (mm)</label>
          <input
            type="number" min="100" max="3000"
            value={datos.alto}
            onChange={e => onChange('alto', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="editor-campo">
          <label>Profundidad (mm)</label>
          <input
            type="number" min="100" max="1200"
            value={datos.profundidad}
            onChange={e => onChange('profundidad', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="editor-grid-2">
        <div className="editor-campo">
          <label>Espesor tablero (mm)</label>
          <select
            value={datos.espesor_tablero}
            onChange={e => onChange('espesor_tablero', parseFloat(e.target.value))}
          >
            <option value={15}>15 mm</option>
            <option value={18}>18 mm</option>
            <option value={25}>25 mm</option>
            <option value={30}>30 mm</option>
          </select>
        </div>
        <div className="editor-campo">
          <label>Espesor fondo (mm)</label>
          <select
            value={datos.espesor_fondo}
            onChange={e => onChange('espesor_fondo', parseFloat(e.target.value))}
          >
            <option value={3}>3 mm</option>
            <option value={5}>5 mm</option>
            <option value={9}>9 mm</option>
            <option value={15}>15 mm</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default SeccionDimensiones;
