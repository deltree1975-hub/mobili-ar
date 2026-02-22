// ============================================================
// MOBILI-AR — Resumen del módulo (columna derecha del editor)
// Archivo  : src/screens/Editor/components/ResumenModulo.jsx
// Módulo   : F1-08
// ============================================================

import './Secciones.css';

const DISPOSICIONES = {
  bm: 'Bajomesa', al: 'Aéreo', to: 'Torre',
  ca: 'Cajón', ab: 'Abierto', me: 'Mesa',
  es: 'Estante', co: 'Columna',
};

const APERTURAS = {
  derecha:   '→ Derecha',
  izquierda: '← Izquierda',
  dos_hojas: '↔ Dos hojas',
  corredera: '⇄ Corredera',
};

function Fila({ label, valor }) {
  return (
    <div className="resumen-fila">
      <span className="resumen-label">{label}</span>
      <span className="resumen-valor">{valor}</span>
    </div>
  );
}

function ResumenModulo({ datos }) {
  const cantosActivos = [
    datos.canto_sup && 'Sup',
    datos.canto_inf && 'Inf',
    datos.canto_der && 'Frontal',
    datos.canto_izq && 'Trasero',
  ].filter(Boolean).join(', ') || 'Ninguno';

  return (
    <div className="resumen-card">
      <h3 className="resumen-titulo">Resumen</h3>

      <div className="resumen-nombre">{datos.nombre}</div>
      <div className="resumen-tipo">{DISPOSICIONES[datos.disposicion] || datos.disposicion}</div>

      <div className="resumen-separador" />

      <div className="resumen-grupo">
        <div className="resumen-grupo-titulo">Dimensiones</div>
        <Fila label="Ancho"       valor={`${datos.ancho} mm`} />
        <Fila label="Alto"        valor={`${datos.alto} mm`} />
        <Fila label="Profundidad" valor={`${datos.profundidad} mm`} />
        <Fila label="Tablero"     valor={`${datos.espesor_tablero} mm`} />
        <Fila label="Fondo"       valor={`${datos.espesor_fondo} mm`} />
      </div>

      <div className="resumen-separador" />

      <div className="resumen-grupo">
        <div className="resumen-grupo-titulo">Construcción</div>
        <Fila label="Unión"            valor={datos.tipo_union} />
        <Fila label="Costados x fuera" valor={datos.costados_por_fuera ? 'Sí' : 'No'} />
        <Fila label="Fondo embutido"   valor={datos.fondo_embutido   ? 'Sí' : 'No'} />
        <Fila label="Tapa apoyada"     valor={datos.tapa_apoyada     ? 'Sí' : 'No'} />
        <Fila label="Estantes"         valor={datos.cant_estantes} />
        <Fila label="Puertas"          valor={datos.cant_puertas} />
      </div>

      {datos.color_material && (
        <>
          <div className="resumen-separador" />
          <div className="resumen-grupo">
            <div className="resumen-grupo-titulo">Material</div>
            <Fila label="Color" valor={datos.color_material} />
          </div>
        </>
      )}

      <div className="resumen-separador" />

      <div className="resumen-grupo">
        <div className="resumen-grupo-titulo">Cantos</div>
        <Fila label="Tipo"    valor={`${datos.tipo_canto} ${datos.espesor_canto}mm`} />
        <Fila label="Caras"   valor={cantosActivos} />
      </div>

      {datos.cant_puertas > 0 && (
        <>
          <div className="resumen-separador" />
          <div className="resumen-grupo">
            <div className="resumen-grupo-titulo">Puertas</div>
            <Fila label="Apertura"   valor={APERTURAS[datos.apertura_puerta] || datos.apertura_puerta} />
            <Fila label="Overlap"    valor={`${datos.overlap_puertas} mm`} />
            <Fila label="Tirador"    valor={`${datos.offset_tirador} mm`} />
          </div>
        </>
      )}

      <div className="resumen-separador" />
      <div className="resumen-estado">
        Estado: <strong>{datos.estado}</strong>
      </div>
    </div>
  );
}

export default ResumenModulo;
