// ============================================================
// MOBILI-AR — Sección: Construcción del módulo
// Archivo  : src/screens/Editor/components/SeccionConstructiva.jsx
// Módulo   : F1-08
// ============================================================

import './Secciones.css';

function SeccionConstructiva({ datos, onChange }) {
  return (
    <div className="editor-seccion">
      <h3 className="editor-seccion-titulo">🔩 Construcción</h3>

      <div className="editor-campo">
        <label>Tipo de unión</label>
        <select
          value={datos.tipo_union}
          onChange={e => onChange('tipo_union', e.target.value)}
        >
          <option value="cam_locks">Cam locks</option>
          <option value="tornillos">Tornillos</option>
          <option value="espigos">Espigos</option>
          <option value="mixto">Mixto</option>
        </select>
      </div>

      <div className="editor-grid-3">
        <div className="editor-campo editor-campo--toggle">
          <label>Costados por fuera</label>
          <button
            className={`toggle-btn ${datos.costados_por_fuera ? 'activo' : ''}`}
            onClick={() => onChange('costados_por_fuera', !datos.costados_por_fuera)}
          >
            {datos.costados_por_fuera ? 'Sí' : 'No'}
          </button>
        </div>
        <div className="editor-campo editor-campo--toggle">
          <label>Fondo embutido</label>
          <button
            className={`toggle-btn ${datos.fondo_embutido ? 'activo' : ''}`}
            onClick={() => onChange('fondo_embutido', !datos.fondo_embutido)}
          >
            {datos.fondo_embutido ? 'Sí' : 'No'}
          </button>
        </div>
        <div className="editor-campo editor-campo--toggle">
          <label>Tapa apoyada</label>
          <button
            className={`toggle-btn ${datos.tapa_apoyada ? 'activo' : ''}`}
            onClick={() => onChange('tapa_apoyada', !datos.tapa_apoyada)}
          >
            {datos.tapa_apoyada ? 'Sí' : 'No'}
          </button>
        </div>
      </div>

      <div className="editor-grid-2">
        <div className="editor-campo">
          <label>Cantidad de estantes</label>
          <input
            type="number" min="0" max="20"
            value={datos.cant_estantes}
            onChange={e => onChange('cant_estantes', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="editor-campo">
          <label>Inset estantes (mm)</label>
          <input
            type="number" min="0" max="100"
            value={datos.inset_estantes}
            onChange={e => onChange('inset_estantes', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="editor-grid-2">
        <div className="editor-campo">
          <label>Cantidad de puertas</label>
          <input
            type="number" min="0" max="10"
            value={datos.cant_puertas}
            onChange={e => onChange('cant_puertas', parseInt(e.target.value) || 0)}
          />
        </div>
        <div className="editor-campo">
          <label>Overlap puertas (mm)</label>
          <input
            type="number" min="0" max="50"
            value={datos.overlap_puertas}
            onChange={e => onChange('overlap_puertas', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
}

export default SeccionConstructiva;
