// ============================================================
// MOBILI-AR — Panel derecho editable
// Archivo  : src/screens/Editor/components/ResumenModulo.jsx
// Módulo   : F1-08 / F3-01
// ============================================================

import './Secciones.css';

const TIPOS_UNION = [
  { value: 'cam_locks', label: 'Minifix'      },
  { value: 'dowels',    label: 'Tarugo'       },
  { value: 'screws',    label: 'Tornillos'    },
  { value: 'biscuits',  label: 'Galletas'     },
  { value: 'pocket',    label: 'Pocket screw' },
];

const APERTURAS = [
  { value: 'derecha',   label: '→ Derecha'   },
  { value: 'izquierda', label: '← Izquierda' },
  { value: 'dos_hojas', label: '↔ Dos hojas' },
  { value: 'corredera', label: '⇄ Corredera' },
];

const DISPOSICIONES = [
  { value: 'bm',       label: 'Bajomesa'           },
  { value: 'al',       label: 'Aéreo'              },
  { value: 'to',       label: 'Torre'              },
  { value: 'ca',       label: 'Cajón'              },
  { value: 'ab',       label: 'Abierto'            },
  { value: 'me',       label: 'Mesa'               },
  { value: 'es',       label: 'Estante'            },
  { value: 'co',       label: 'Columna'            },
  { value: 'caj-plac', label: 'Cajonera de placar' },
];

// ── Campos reutilizables ──────────────────────────────────────

function CampoNum({ label, campo, valor, onChange, min = 0, max = 9999, step = 1 }) {
  return (
    <div className="resumen-fila resumen-fila--edit">
      <span className="resumen-label">{label}</span>
      <input
        className="resumen-input-num"
        type="number" min={min} max={max} step={step}
        value={valor}
        onChange={e => onChange(campo, parseFloat(e.target.value) || 0)}
      />
      <span className="resumen-unidad">mm</span>
    </div>
  );
}

function CampoInt({ label, campo, valor, onChange, min = 0, max = 99 }) {
  return (
    <div className="resumen-fila resumen-fila--edit">
      <span className="resumen-label">{label}</span>
      <input
        className="resumen-input-num"
        type="number" min={min} max={max} step={1}
        value={valor}
        onChange={e => onChange(campo, parseInt(e.target.value) || 0)}
      />
    </div>
  );
}

function CampoSelect({ label, campo, valor, opciones, onChange }) {
  return (
    <div className="resumen-fila resumen-fila--edit">
      <span className="resumen-label">{label}</span>
      <select
        className="resumen-select"
        value={valor || ''}
        onChange={e => onChange(campo, e.target.value)}
      >
        {opciones.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function CampoToggle({ label, labelOn, labelOff, valor, onClick }) {
  return (
    <div className="resumen-fila resumen-fila--edit">
      <span className="resumen-label">{label}</span>
      <button
        className={`resumen-toggle ${valor ? 'activo' : ''}`}
        onClick={onClick}
      >
        {valor ? labelOn : labelOff}
      </button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────

function ResumenModulo({ datos, ensamble, cantos, materiales, onChange, onEnsambleChange }) {

  // ── Opciones de material del stock ───────────────────────
  // Agrupa: tableros para cuerpo, hdf/mdf para fondo
  const materialesTablero = [
    { value: '', label: '— Sin asignar —' },
    ...(materiales || [])
      .filter(m => m.tipo === 'tablero' || m.tipo === 'mdf')
      .map(m => ({ value: m.id, label: `${m.nombre}` }))
  ];

  const materialesFondo = [
    { value: '', label: '— Sin asignar —' },
    ...(materiales || [])
      .filter(m => m.tipo === 'hdf' || m.tipo === 'mdf' || m.tipo === 'tablero')
      .map(m => ({ value: m.id, label: `${m.nombre}` }))
  ];

  // ── Opciones de cantos del stock ─────────────────────────
  const cantosOpciones = [
    { value: '', label: '— Sin canto —' },
    ...(cantos || []).map(c => ({
      value: c.id,
      label: `${c.color} ${c.espesor}mm / ${c.alto_canto}mm${c.stock_metros === 0 ? ' ⚠' : ''}`,
    }))
  ];

  return (
    <div className="resumen-card">
      <h3 className="resumen-titulo">Propiedades</h3>

      {/* Nombre */}
      <input
        className="resumen-input-nombre"
        value={datos.nombre}
        onChange={e => onChange('nombre', e.target.value)}
        placeholder="Nombre del módulo"
      />

      {/* Disposición */}
      <select
        className="resumen-select resumen-select--tipo"
        value={datos.disposicion}
        onChange={e => onChange('disposicion', e.target.value)}
      >
        {DISPOSICIONES.map(d => (
          <option key={d.value} value={d.value}>{d.label}</option>
        ))}
      </select>

      <div className="resumen-separador" />

      {/* ── DIMENSIONES ── */}
      <div className="resumen-grupo-titulo">Dimensiones</div>
      <CampoNum label="Ancho"       campo="ancho"           valor={datos.ancho}           onChange={onChange} min={100} max={3000} />
      <CampoNum label="Alto"        campo="alto"            valor={datos.alto}            onChange={onChange} min={100} max={3000} />
      <CampoNum label="Profundidad" campo="profundidad"     valor={datos.profundidad}     onChange={onChange} min={100} max={1200} />
      <CampoNum label="Tablero"     campo="espesor_tablero" valor={datos.espesor_tablero} onChange={onChange} min={9}   max={38}   />
      <CampoNum label="Fondo"       campo="espesor_fondo"   valor={datos.espesor_fondo}   onChange={onChange} min={3}   max={18}   />

      <div className="resumen-separador" />

      {/* ── MATERIAL DEL STOCK ── */}
      <div className="resumen-grupo-titulo">Material</div>

      {/* Material del cuerpo — tablero principal */}
      <div className="resumen-fila resumen-fila--edit">
        <span className="resumen-label">Cuerpo</span>
        <select
          className="resumen-select"
          value={datos.material_id || ''}
          onChange={e => {
            const mat = (materiales || []).find(m => m.id === e.target.value);
            onChange('material_id', e.target.value);
            // Sincroniza el espesor del tablero automáticamente
            if (mat) onChange('espesor_tablero', mat.espesor);
          }}
        >
          {materialesTablero.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Material del fondo */}
      <div className="resumen-fila resumen-fila--edit">
        <span className="resumen-label">Fondo</span>
        <select
          className="resumen-select"
          value={datos.material_fondo_id || ''}
          onChange={e => {
            const mat = (materiales || []).find(m => m.id === e.target.value);
            onChange('material_fondo_id', e.target.value);
            if (mat) onChange('espesor_fondo', mat.espesor);
          }}
        >
          {materialesFondo.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Color del módulo (referencia visual) */}
      <div className="resumen-fila resumen-fila--edit">
        <span className="resumen-label">Color</span>
        <input
          className="resumen-input-texto"
          value={datos.color_material || ''}
          onChange={e => onChange('color_material', e.target.value)}
          placeholder="Ej: Blanco Polar"
        />
      </div>

      {/* Color puerta — solo si tiene puertas */}
      {datos.cant_puertas > 0 && (
        <div className="resumen-fila resumen-fila--edit">
          <span className="resumen-label">Color puerta</span>
          <input
            className="resumen-input-texto"
            value={datos.color_puerta || ''}
            onChange={e => onChange('color_puerta', e.target.value)}
            placeholder="Ej: Grafito"
          />
        </div>
      )}

      <div className="resumen-separador" />

      {/* ── CANTO GENERAL ── */}
      <div className="resumen-grupo-titulo">Canto general</div>
      <div className="resumen-fila resumen-fila--edit">
        <span className="resumen-label">Stock</span>
        <select
          className="resumen-select"
          value={datos.canto_general_id || ''}
          onChange={e => onChange('canto_general_id', e.target.value)}
        >
          {cantosOpciones.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <p className="resumen-nota">Se hereda en todas las piezas. Sobreescribible por pieza en lista de corte.</p>

      <div className="resumen-separador" />

      {/* ── CONSTRUCCIÓN ── */}
      <div className="resumen-grupo-titulo">Construcción</div>
      <CampoSelect label="Unión"    campo="tipo_union"    valor={datos.tipo_union}    opciones={TIPOS_UNION} onChange={onChange} />
      <CampoInt    label="Estantes" campo="cant_estantes" valor={datos.cant_estantes} onChange={onChange} max={20} />
      <CampoInt    label="Puertas"  campo="cant_puertas"  valor={datos.cant_puertas}  onChange={onChange} max={10} />

      {/* Fajas — solo bajomesa y cajonera placar */}
      {(datos.disposicion === 'bm' || datos.disposicion === 'caj-plac') && (
        <>
          <CampoToggle
            label="Fondo"
            labelOn="Con fondo" labelOff="Sin fondo"
            valor={datos.tiene_fondo}
            onClick={() => onChange('tiene_fondo', !datos.tiene_fondo)}
          />
          <CampoNum
            label="Alto faja"
            campo="alto_faja"
            valor={datos.alto_faja || 80}
            onChange={onChange}
            min={40} max={200}
          />
          <CampoToggle
            label="Faja"
            labelOn="Acostada (plano)" labelOff="Parada (canto)"
            valor={datos.faja_acostada || false}
            onClick={() => onChange('faja_acostada', !datos.faja_acostada)}
          />
        </>
      )}

      <div className="resumen-separador" />

      {/* ── ENSAMBLE ── */}
      <div className="resumen-grupo-titulo">Ensamble</div>
      <CampoToggle
        label="Techo"
        labelOn="Pasante" labelOff="No pasante"
        valor={ensamble?.costado_pasante_techo}
        onClick={() => onEnsambleChange('costado_pasante_techo', !ensamble?.costado_pasante_techo)}
      />
      <CampoToggle
        label="Piso"
        labelOn="Pasante" labelOff="No pasante"
        valor={ensamble?.costado_pasante_piso}
        onClick={() => onEnsambleChange('costado_pasante_piso', !ensamble?.costado_pasante_piso)}
      />
      <CampoToggle
        label="Fondo"
        labelOn="Pasante" labelOff="Interno"
        valor={ensamble?.fondo_tipo === 'pasante'}
        onClick={() => onEnsambleChange('fondo_tipo', ensamble?.fondo_tipo === 'pasante' ? 'interno' : 'pasante')}
      />
      {ensamble?.fondo_tipo !== 'pasante' && (
        <CampoNum
          label="Retranqueo"
          campo="fondo_retranqueo"
          valor={ensamble?.fondo_retranqueo || 12}
          onChange={(_, v) => onEnsambleChange('fondo_retranqueo', v)}
          min={0} max={50}
        />
      )}

      {/* ── PUERTAS ── */}
      {datos.cant_puertas > 0 && (
        <>
          <div className="resumen-separador" />
          <div className="resumen-grupo-titulo">Puertas</div>
          <CampoSelect label="Apertura" campo="apertura_puerta" valor={datos.apertura_puerta} opciones={APERTURAS} onChange={onChange} />
          <CampoNum    label="Overlap"  campo="overlap_puertas" valor={datos.overlap_puertas} onChange={onChange} min={0} max={50} />
          <CampoNum    label="Tirador"  campo="offset_tirador"  valor={datos.offset_tirador}  onChange={onChange} min={0} max={300} />
        </>
      )}

      <div className="resumen-separador" />

      {/* ── ESTADO ── */}
      <CampoSelect
        label="Estado"
        campo="estado"
        valor={datos.estado}
        opciones={[
          { value: 'borrador',      label: 'Borrador'      },
          { value: 'en_produccion', label: 'En producción' },
          { value: 'pausado',       label: 'Pausado'       },
          { value: 'completado',    label: 'Completado'    },
        ]}
        onChange={onChange}
      />
    </div>
  );
}

export default ResumenModulo;