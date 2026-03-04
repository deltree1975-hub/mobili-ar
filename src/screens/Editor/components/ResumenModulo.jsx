// ============================================================
// MOBILI-AR — Panel derecho editable
// Archivo  : src/screens/Editor/components/ResumenModulo.jsx
// Módulo   : F1-08 / F3-01 / F3-02
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
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

function ResumenModulo({ datos, ensamble, cantos, materiales, onChange, onEnsambleChange, onDivisorChange }) {

  // ── State divisor ─────────────────────────────────────────
  const [divisor,          setDivisor]          = useState(null);
  const [tieneDivisor,     setTieneDivisor]     = useState(false);
  const [posicionX,        setPosicionX]        = useState('');
  const [divisorDesde,     setDivisorDesde]     = useState('techo');
  const [divisorHasta,     setDivisorHasta]     = useState('piso');
  const [guardandoDivisor, setGuardandoDivisor] = useState(false);

  // ── Cargar divisor al cambiar módulo ─────────────────────
  useEffect(() => {
    if (!datos?.id) return;
    setDivisor(null);
    setTieneDivisor(false);
    setPosicionX('');
    setDivisorDesde('techo');
    setDivisorHasta('piso');

    invoke('get_divisores_modulo', { moduloId: datos.id })
      .then(lista => {
        if (lista.length > 0) {
          const d = lista[0];
          setDivisor(d);
          setTieneDivisor(true);
          setPosicionX(String(d.posicion_x));
          setDivisorDesde(d.desde);
          setDivisorHasta(d.hasta);
          if (onDivisorChange) onDivisorChange(d);
        }
      })
      .catch(console.error);
  }, [datos?.id]);

  // ── Toggle divisor ────────────────────────────────────────
  async function handleToggleDivisor(activo) {
    setTieneDivisor(activo);
    if (!activo && divisor) {
      try {
        await invoke('eliminar_divisor', { id: divisor.id });
      } catch (e) {
        console.error('Error eliminando divisor:', e);
      }
      setDivisor(null);
      setPosicionX('');
      if (onDivisorChange) onDivisorChange(null);
    }
    if (activo && !divisor) {
      // Posición inicial = centro del ancho interno
      const centro = Math.round((datos.ancho - datos.espesor_tablero * 2) / 2);
      setPosicionX(String(centro));
    }
  }

  // ── Guardar divisor ───────────────────────────────────────
  async function handleGuardarDivisor() {
    const px = parseFloat(posicionX);
    if (isNaN(px) || px <= 0) return;
    setGuardandoDivisor(true);
    try {
      if (divisor) {
        await invoke('actualizar_divisor', {
          id:        divisor.id,
          posicionX: px,
          desde:     divisorDesde,
          hasta:     divisorHasta,
        });
        const actualizado = { ...divisor, posicion_x: px, desde: divisorDesde, hasta: divisorHasta };
        setDivisor(actualizado);
        if (onDivisorChange) onDivisorChange(actualizado);
      } else {
        const nuevo = await invoke('crear_divisor', {
          input: {
            modulo_id:  datos.id,
            posicion_x: px,
            desde:      divisorDesde,
            hasta:      divisorHasta,
            orden:      0,
          }
        });
        setDivisor(nuevo);
        if (onDivisorChange) onDivisorChange(nuevo);
      }
    } catch (e) {
      console.error('Error guardando divisor:', e);
    } finally {
      setGuardandoDivisor(false);
    }
  }

  // ── Opciones de posición (techo, estantes, piso) ─────────
  const opcionesPosicion = [
    { value: 'techo', label: 'Techo' },
    ...Array.from({ length: datos?.cant_estantes || 0 }, (_, i) => ({
      value: `estante_${i + 1}`,
      label: `Estante ${i + 1}`,
    })),
    { value: 'piso', label: 'Piso' },
  ];

  // ── Cálculo informativo de sectores ──────────────────────
  const px = parseFloat(posicionX);
  const anchoInterno = (datos?.ancho || 0) - (datos?.espesor_tablero || 18) * 2;
  const sectorIzq = !isNaN(px) ? Math.round(px - datos?.espesor_tablero / 2) : null;
  const sectorDer = !isNaN(px) ? Math.round(anchoInterno - px - datos?.espesor_tablero / 2) : null;

  // ── Opciones de material del stock ───────────────────────
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

      <div className="resumen-fila resumen-fila--edit">
        <span className="resumen-label">Cuerpo</span>
        <select
          className="resumen-select"
          value={datos.material_id || ''}
          onChange={e => {
            const mat = (materiales || []).find(m => m.id === e.target.value);
            onChange('material_id', e.target.value);
            if (mat) onChange('espesor_tablero', mat.espesor);
          }}
        >
          {materialesTablero.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

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

      <div className="resumen-fila resumen-fila--edit">
        <span className="resumen-label">Color</span>
        <input
          className="resumen-input-texto"
          value={datos.color_material || ''}
          onChange={e => onChange('color_material', e.target.value)}
          placeholder="Ej: Blanco Polar"
        />
      </div>

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

      <div className="resumen-separador" />

      {/* ── DIVISOR VERTICAL ── */}
      <div className="resumen-grupo-titulo">Divisor vertical</div>

      <CampoToggle
        label="Divisor"
        labelOn="Con divisor" labelOff="Sin divisor"
        valor={tieneDivisor}
        onClick={() => handleToggleDivisor(!tieneDivisor)}
      />

      {tieneDivisor && (
        <>
          <div className="resumen-fila resumen-fila--edit">
            <span className="resumen-label">Posición X</span>
            <input
              className="resumen-input-num"
              type="number"
              min={datos.espesor_tablero + 10}
              max={anchoInterno - datos.espesor_tablero - 10}
              value={posicionX}
              onChange={e => setPosicionX(e.target.value)}
            />
            <span className="resumen-unidad">mm</span>
          </div>

          <div className="resumen-fila resumen-fila--edit">
            <span className="resumen-label">Desde</span>
            <select
              className="resumen-select"
              value={divisorDesde}
              onChange={e => setDivisorDesde(e.target.value)}
            >
              {opcionesPosicion.filter(o => o.value !== 'piso').map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="resumen-fila resumen-fila--edit">
            <span className="resumen-label">Hasta</span>
            <select
              className="resumen-select"
              value={divisorHasta}
              onChange={e => setDivisorHasta(e.target.value)}
            >
              {opcionesPosicion.filter(o => o.value !== 'techo').map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {sectorIzq !== null && sectorDer !== null && (
            <p className="resumen-nota">
              Izq: {sectorIzq} mm &nbsp;|&nbsp; Der: {sectorDer} mm
            </p>
          )}

          <div className="resumen-fila">
            <button
              className="resumen-btn-guardar"
              onClick={handleGuardarDivisor}
              disabled={guardandoDivisor || !posicionX}
            >
              {guardandoDivisor ? 'Guardando…' : divisor ? 'Actualizar divisor' : 'Guardar divisor'}
            </button>
          </div>
        </>
      )}

      <div className="resumen-separador" />

      {/* ── PUERTAS ── */}
      {datos.cant_puertas > 0 && (
        <>
          <div className="resumen-grupo-titulo">Puertas</div>
          <CampoSelect label="Apertura" campo="apertura_puerta" valor={datos.apertura_puerta} opciones={APERTURAS} onChange={onChange} />
          <CampoNum    label="Overlap"  campo="overlap_puertas" valor={datos.overlap_puertas} onChange={onChange} min={0} max={50} />
          <CampoNum    label="Tirador"  campo="offset_tirador"  valor={datos.offset_tirador}  onChange={onChange} min={0} max={300} />
          <div className="resumen-separador" />
        </>
      )}

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