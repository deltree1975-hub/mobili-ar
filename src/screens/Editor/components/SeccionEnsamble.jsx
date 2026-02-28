// ============================================================
// MOBILI-AR — Sección: Configuración de ensamble
// Archivo  : src/screens/Editor/components/SeccionEnsamble.jsx
// Módulo   : F3-01
// ============================================================

import './Secciones.css';

function SeccionEnsamble({ ensamble, onChange }) {
  return (
    <div className="editor-seccion">
      <h3 className="editor-seccion-titulo">🔧 Ensamble</h3>

      <div className="editor-grid-3">
        <div className="editor-campo editor-campo--toggle">
          <label>Costado pasante techo</label>
          <button
            className={`toggle-btn ${ensamble.costado_pasante_techo ? 'activo' : ''}`}
            onClick={() => onChange('costado_pasante_techo', !ensamble.costado_pasante_techo)}
          >
            {ensamble.costado_pasante_techo ? 'Pasante' : 'No pasante'}
          </button>
        </div>

        <div className="editor-campo editor-campo--toggle">
          <label>Costado pasante piso</label>
          <button
            className={`toggle-btn ${ensamble.costado_pasante_piso ? 'activo' : ''}`}
            onClick={() => onChange('costado_pasante_piso', !ensamble.costado_pasante_piso)}
          >
            {ensamble.costado_pasante_piso ? 'Pasante' : 'No pasante'}
          </button>
        </div>

        <div className="editor-campo editor-campo--toggle">
          <label>Tipo de fondo</label>
          <button
            className={`toggle-btn ${ensamble.fondo_tipo === 'pasante' ? 'activo' : ''}`}
            onClick={() => onChange('fondo_tipo', ensamble.fondo_tipo === 'pasante' ? 'interno' : 'pasante')}
          >
            {ensamble.fondo_tipo === 'pasante' ? 'Pasante' : 'Interno'}
          </button>
        </div>
      </div>

      {ensamble.fondo_tipo === 'interno' && (
        <div className="editor-grid-2">
          <div className="editor-campo">
            <label>Retranqueo fondo (mm)</label>
            <input
              type="number" min="0" max="50"
              value={ensamble.fondo_retranqueo}
              onChange={e => onChange('fondo_retranqueo', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="editor-campo editor-campo--info">
            <label>Referencia</label>
            <span className="campo-info-texto">
              Fondo a {ensamble.fondo_retranqueo}mm del borde externo
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeccionEnsamble;