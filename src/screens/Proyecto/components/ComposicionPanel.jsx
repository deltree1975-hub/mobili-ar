// ============================================================
// MOBILI-AR — Panel de composición con sus módulos
// Archivo  : src/screens/Proyecto/components/ComposicionPanel.jsx
// Módulo   : F1-07 — Proyecto y Composición
// Creado   : [fecha]
// ============================================================

import './ComposicionPanel.css';

const DISPOSICIONES = {
  bajo:    'Bajo',
  aereo:   'Aéreo',
  torre:   'Torre',
  cajon:   'Cajón',
  especial: 'Especial',
};

/**
 * Panel que muestra una composición y sus módulos.
 */
function ComposicionPanel({
  composicion, modulos,
  onNuevoModulo, onAbrirEditor, onEliminarModulo,
}) {
  return (
    <div className="comp-panel">

      {/* HEADER DE COMPOSICIÓN */}
      <div className="comp-header">
        <div className="comp-info">
          <h2 className="comp-nombre">{composicion.nombre}</h2>
          {composicion.descripcion && (
            <span className="comp-desc">{composicion.descripcion}</span>
          )}
          <span className="comp-count">
            {modulos.length} módulo{modulos.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button className="btn-secundario btn-sm" onClick={onNuevoModulo}>
          + Módulo
        </button>
      </div>

      {/* LISTA DE MÓDULOS */}
      <div className="comp-modulos">
        {modulos.length === 0 && (
          <div className="comp-vacio">
            No hay módulos. Agregá el primero con "+ Módulo".
          </div>
        )}
        {modulos.map(modulo => (
          <div key={modulo.id} className="modulo-item">
            <div className="modulo-item-info" onClick={() => onAbrirEditor(modulo)}>
              <span className="modulo-disposicion">
                {DISPOSICIONES[modulo.disposicion] || modulo.disposicion}
              </span>
              <span className="modulo-nombre">{modulo.nombre}</span>
              <span className="modulo-dims">
                {modulo.ancho} × {modulo.alto} × {modulo.profundidad} mm
              </span>
            </div>
            <div className="modulo-item-acciones">
              <button
                className="btn-accion-mod btn-accion-mod--editar"
                onClick={() => onAbrirEditor(modulo)}
                title="Abrir editor"
              >
                Editar
              </button>
              <button
                className="btn-accion-mod btn-accion-mod--eliminar"
                onClick={() => onEliminarModulo(modulo.id, modulo.nombre)}
                title="Eliminar módulo"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default ComposicionPanel;