// ============================================================
// MOBILI-AR — Sección: Material del módulo
// Archivo  : src/screens/Editor/components/SeccionMaterial.jsx
// Módulo   : F1-08
// ============================================================

import './Secciones.css';

// Colores de melamina más comunes en Argentina
const COLORES_COMUNES = [
  'Blanco', 'Crudo', 'Negro', 'Gris claro', 'Gris oscuro',
  'Roble natural', 'Roble oscuro', 'Nogal', 'Wengué',
  'Algarrobo', 'Cedro', 'Pino', 'Fresno', 'Teca',
  'Rojo', 'Azul marino', 'Verde oliva', 'Arena',
];

function SeccionMaterial({ datos, onChange }) {
  return (
    <div className="editor-seccion">
      <h3 className="editor-seccion-titulo">🪵 Material</h3>

      <div className="editor-campo">
        <label>Color / Terminación</label>
        <div className="editor-color-input">
          <input
            type="text"
            value={datos.color_material || ''}
            onChange={e => onChange('color_material', e.target.value)}
            placeholder="Ej: Blanco, Roble natural, Wengué..."
            list="colores-sugeridos"
          />
          <datalist id="colores-sugeridos">
            {COLORES_COMUNES.map(c => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      {/* F3-01: cuando exista la tabla materiales, acá va el selector
          por ahora solo se guarda el color como texto libre */}
      <p className="editor-nota">
        💡 En F3-01 se podrá vincular a un material del stock.
        Por ahora se registra el color como referencia.
      </p>
    </div>
  );
}

export default SeccionMaterial;
