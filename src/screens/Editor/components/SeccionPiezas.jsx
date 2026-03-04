// ============================================================
// MOBILI-AR — Lista de corte con vista isométrica técnica
// Archivo  : src/screens/Editor/components/SeccionPiezas.jsx
// Módulo   : F3-01 / F3-02 / F3-03
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './Secciones.css';

const TIPO_LABEL = {
  side:       'Lateral',
  horizontal: 'Horizontal',
  back:       'Fondo',
  shelf:      'Estante',
  door:       'Puerta',
  faja:       'Faja',
  divisor:    'Divisor',
};

const CARAS = [
  { key: 'frente',    label: 'Fr' },
  { key: 'posterior', label: 'Po' },
  { key: 'superior',  label: 'Su' },
  { key: 'inferior',  label: 'In' },
];

// ── Proyección isométrica ─────────────────────────────────────
function useIso(W, H, P, ET, espejado) {
  const escala = Math.min(160 / W, 160 / H, 120 / P);
  const w  = W  * escala;
  const h  = H  * escala;
  const p  = P  * escala;
  const et = ET * escala;
  const CX = Math.cos(Math.PI / 6);
  const SX = Math.sin(Math.PI / 6);

  function project(x, z, y) {
    if (espejado) {
      const xr = w - x;
      const zr = p - z;
      return [xr * CX - zr * CX, -(y) - xr * SX - zr * SX];
    }
    return [x * CX - z * CX, -(y) - x * SX - z * SX];
  }

  const corners = [
    [0,0,0],[w,0,0],[0,p,0],[w,p,0],
    [0,0,h],[w,0,h],[0,p,h],[w,p,h],
  ].map(([x,z,y]) => project(x,z,y));

  const xs = corners.map(c => c[0]);
  const ys = corners.map(c => c[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad  = 24;
  const vbW  = maxX - minX + pad * 2;
  const vbH  = maxY - minY + pad * 2;
  const ox   = -minX + pad;
  const oy   = -minY + pad;

  function pt(x, z, y) {
    const [sx, sy] = project(x, z, y);
    return `${ox + sx},${oy + sy}`;
  }
  function ptXY(x, z, y) {
    const [sx, sy] = project(x, z, y);
    return [ox + sx, oy + sy];
  }

  return { w, h, p, et, escala, vbW, vbH, pt, ptXY };
}

// ── Vista isométrica del módulo ───────────────────────────────
function VistaIso({ datos, vista, divisor }) {
  if (!datos) return (
    <div style={{ textAlign: 'center', color: '#aaa', padding: 30, fontSize: 12 }}>
      Calculá las piezas para ver la vista
    </div>
  );

  const W  = datos.ancho           || 600;
  const H  = datos.alto            || 720;
  const P  = datos.profundidad     || 550;
  const ET = datos.espesor_tablero || 18;
  const EF = datos.espesor_fondo   || 3;
  const nEstantes  = datos.cant_estantes   || 0;
  const nPuertas   = datos.cant_puertas    || 0;
  const overlap    = datos.overlap_puertas || 2;
  const tieneFondo = datos.tiene_fondo !== false;

  const espejado = vista === 'izq';
  const { w, h, p, et, escala, vbW, vbH, pt, ptXY } = useIso(W, H, P, ET, espejado);
  const ef = EF * escala;

  const stroke    = '#1a3a5c';
  const strokeInt = '#4a7ab5';
  const fillFace  = 'rgba(220,235,250,0.18)';
  const fillSide  = 'rgba(190,215,240,0.20)';
  const fillTop   = 'rgba(210,230,210,0.22)';
  const fillBack  = 'rgba(200,220,240,0.10)';
  const fillDoor  = 'rgba(230,240,255,0.38)';
  const fillDiv   = 'rgba(180,210,235,0.45)';
  const swExt = 1.4; const swInt = 0.7;
  const dash = '3,2'; const dashSt = '5,3';

  const estantes = Array.from({ length: nEstantes }, (_, i) => {
    const sep = (H - ET * 2) / (nEstantes + 1);
    return (ET + sep * (i + 1)) * escala;
  });

  const divX     = divisor ? (ET + divisor.posicion_x) * escala : null;
  const divDesde = divisor?.desde || 'techo';
  const divHasta = divisor?.hasta || 'piso';

  function referenciaAY(ref) {
    if (ref === 'techo') return h;
    if (ref === 'piso')  return 0;
    const match = ref.match(/^estante_(\d+)$/);
    if (match) { const idx = parseInt(match[1]) - 1; return estantes[idx] ?? 0; }
    return 0;
  }

  const divY0 = divisor ? referenciaAY(divHasta) : 0;
  const divY1 = divisor ? referenciaAY(divDesde) : h;

  if (vista === 'frente') {
    const fox = 20, foy = 20, fw = w, fh = h, fet = et;
    return (
      <svg width="100%" viewBox={`0 0 ${fw + 40} ${fh + 44}`} style={{ maxHeight: 220 }}>
        <rect x={fox} y={foy} width={fw} height={fh} fill="rgba(220,235,250,0.3)" stroke={stroke} strokeWidth={swExt} />
        <rect x={fox} y={foy} width={fet} height={fh} fill="rgba(190,215,240,0.3)" stroke={stroke} strokeWidth={swExt*0.6} />
        <rect x={fox+fw-fet} y={foy} width={fet} height={fh} fill="rgba(190,215,240,0.3)" stroke={stroke} strokeWidth={swExt*0.6} />
        <rect x={fox} y={foy} width={fw} height={fet} fill="rgba(210,230,210,0.3)" stroke={stroke} strokeWidth={swExt*0.6} />
        <rect x={fox} y={foy+fh-fet} width={fw} height={fet} fill="rgba(210,230,210,0.3)" stroke={stroke} strokeWidth={swExt*0.6} />
        {tieneFondo && <line x1={fox+fw-2} y1={foy+fet} x2={fox+fw-2} y2={foy+fh-fet} stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />}
        {estantes.map((sy, i) => (
          <line key={i} x1={fox+fet} y1={foy+fh-sy} x2={fox+fw-fet} y2={foy+fh-sy} stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />
        ))}
        {divisor && divX !== null && (
          <rect x={fox+divX-et/2} y={foy+fh-divY1} width={et} height={divY1-divY0} fill={fillDiv} stroke={strokeInt} strokeWidth={swInt} />
        )}
        {nPuertas > 0 && Array.from({ length: nPuertas }, (_, i) => {
          const pw = fw / nPuertas;
          return <rect key={i} x={fox+pw*i+1} y={foy+1} width={pw-2} height={fh-2} fill={fillDoor} stroke={stroke} strokeWidth={swExt*0.8} />;
        })}
        <text x={fox+fw/2} y={foy+fh+14} textAnchor="middle" fontSize="9" fill="#555">{W}mm</text>
        <text x={fox-10} y={foy+fh/2} textAnchor="middle" fontSize="9" fill="#555" transform={`rotate(-90,${fox-10},${foy+fh/2})`}>{H}mm</text>
      </svg>
    );
  }

  return (
    <svg width="100%" viewBox={`0 0 ${vbW} ${vbH}`} style={{ maxHeight: 240 }}>
      {espejado && <polygon points={`${pt(0,0,0)} ${pt(w,0,0)} ${pt(w,0,h)} ${pt(0,0,h)}`} fill={fillFace} stroke={stroke} strokeWidth={swExt} />}
      <polygon points={`${pt(0,p,0)} ${pt(w,p,0)} ${pt(w,p,h)} ${pt(0,p,h)}`} fill={fillBack} stroke={stroke} strokeWidth={swExt*0.5} opacity="0.6" />
      <polygon points={`${pt(0,0,0)} ${pt(0,p,0)} ${pt(0,p,h)} ${pt(0,0,h)}`} fill={fillSide} stroke={stroke} strokeWidth={swExt} />
      <polygon points={`${pt(w,0,0)} ${pt(w,p,0)} ${pt(w,p,h)} ${pt(w,0,h)}`} fill={fillSide} stroke={stroke} strokeWidth={swExt} />
      <polygon points={`${pt(0,0,0)} ${pt(w,0,0)} ${pt(w,p,0)} ${pt(0,p,0)}`} fill={fillTop} stroke={stroke} strokeWidth={swExt} />
      {tieneFondo && <polygon points={`${pt(et,0,ef)} ${pt(w-et,0,ef)} ${pt(w-et,p-ef,ef)} ${pt(et,p-ef,ef)}`} fill="none" stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />}
      <line x1={ptXY(et,0,0)[0]} y1={ptXY(et,0,0)[1]} x2={ptXY(et,0,h)[0]} y2={ptXY(et,0,h)[1]} stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />
      <line x1={ptXY(w-et,0,0)[0]} y1={ptXY(w-et,0,0)[1]} x2={ptXY(w-et,0,h)[0]} y2={ptXY(w-et,0,h)[1]} stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />
      {estantes.map((sy, i) => (
        <g key={i}>
          <polygon points={`${pt(et,0,sy)} ${pt(w-et,0,sy)} ${pt(w-et,p-et,sy)} ${pt(et,p-et,sy)}`} fill="rgba(200,220,240,0.20)" stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />
          <line x1={ptXY(et,0,sy)[0]} y1={ptXY(et,0,sy)[1]} x2={ptXY(w-et,0,sy)[0]} y2={ptXY(w-et,0,sy)[1]} stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dashSt} />
        </g>
      ))}
      {divisor && divX !== null && (() => {
        const dx = divX, dy0 = divY0, dy1 = divY1;
        return (
          <g>
            <polygon points={`${pt(dx-et/2,0,dy1)} ${pt(dx+et/2,0,dy1)} ${pt(dx+et/2,p-et,dy1)} ${pt(dx-et/2,p-et,dy1)}`} fill="rgba(200,225,240,0.40)" stroke={strokeInt} strokeWidth={swInt} />
            <polygon points={`${pt(dx-et/2,0,dy0)} ${pt(dx+et/2,0,dy0)} ${pt(dx+et/2,0,dy1)} ${pt(dx-et/2,0,dy1)}`} fill={fillDiv} stroke={strokeInt} strokeWidth={swInt} />
            <polygon points={`${pt(dx-et/2,0,dy0)} ${pt(dx-et/2,p-et,dy0)} ${pt(dx-et/2,p-et,dy1)} ${pt(dx-et/2,0,dy1)}`} fill="rgba(160,200,225,0.35)" stroke={strokeInt} strokeWidth={swInt} />
          </g>
        );
      })()}
      <polygon points={`${pt(0,0,h)} ${pt(w,0,h)} ${pt(w,p,h)} ${pt(0,p,h)}`} fill={fillTop} stroke={stroke} strokeWidth={swExt} />
      <line x1={ptXY(et,0,h-et)[0]} y1={ptXY(et,0,h-et)[1]} x2={ptXY(w-et,0,h-et)[0]} y2={ptXY(w-et,0,h-et)[1]} stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />
      {!espejado && <polygon points={`${pt(0,0,0)} ${pt(w,0,0)} ${pt(w,0,h)} ${pt(0,0,h)}`} fill={fillFace} stroke={stroke} strokeWidth={swExt} />}
      {nPuertas > 0 && (() => {
        const pw = w / nPuertas, po = overlap * escala;
        return Array.from({ length: nPuertas }, (_, i) => (
          <polygon key={i} points={`${pt(pw*i-po/2,0,-po/2)} ${pt(pw*(i+1)+po/2,0,-po/2)} ${pt(pw*(i+1)+po/2,0,h+po/2)} ${pt(pw*i-po/2,0,h+po/2)}`} fill={fillDoor} stroke={stroke} strokeWidth={swExt*0.9} />
        ));
      })()}
      {(() => { const [ax,ay]=ptXY(0,0,0); const [bx,by]=ptXY(w,0,0); return <><line x1={ax} y1={ay+8} x2={bx} y2={by+8} stroke="#888" strokeWidth={0.7}/><text x={(ax+bx)/2} y={(ay+by)/2+18} textAnchor="middle" fontSize="9" fill="#555">{W}mm</text></>; })()}
      {(() => { const [ax,ay]=ptXY(espejado?w:0,0,0); const [bx,by]=ptXY(espejado?w:0,0,h); const mx=ax-8; return <><line x1={ax-5} y1={ay} x2={bx-5} y2={by} stroke="#888" strokeWidth={0.7}/><text x={mx} y={(ay+by)/2} textAnchor="middle" fontSize="9" fill="#555" transform={`rotate(-90,${mx},${(ay+by)/2})`}>{H}mm</text></>; })()}
      {(() => { const [ax,ay]=ptXY(espejado?0:w,0,0); const [bx,by]=ptXY(espejado?0:w,p,0); return <><line x1={ax} y1={ay+5} x2={bx} y2={by+5} stroke="#888" strokeWidth={0.7}/><text x={(ax+bx)/2+8} y={(ay+by)/2+14} textAnchor="start" fontSize="9" fill="#555">{P}mm</text></>; })()}
    </svg>
  );
}

// ── Vista 2D técnica de pieza individual (para modal) ─────────
function VistaPieza2D({ pieza, filos, cantos }) {
  const A  = pieza.ancho_corte;
  const L  = pieza.alto_corte;
  const E  = pieza.espesor;

  const escala  = Math.min(200 / A, 160 / L);
  const pw      = A * escala;
  const ph      = L * escala;
  const pad     = 40;
  const totalW  = pw + pad * 2;
  const totalH  = ph + pad * 2;
  const ox      = pad;
  const oy      = pad;

  const stroke   = '#1a3a5c';
  const fillBody = 'rgba(220,235,250,0.35)';
  const GROSOR_CANTO = 5;

  function colorCanto(cantoId) {
    if (!cantoId) return 'rgba(200,200,200,0.3)';
    return 'rgba(26,107,60,0.55)';
  }

  function labelCanto(cantoId) {
    if (!cantoId) return '—';
    const c = cantos?.find(c => c.id === cantoId);
    return c ? `${c.espesor}/${c.alto_canto}` : '?';
  }

  const cantoPieza = filos || {};

  return (
    <svg width="100%" viewBox={`0 0 ${totalW} ${totalH}`} style={{ maxHeight: 220 }}>
      {/* Cuerpo pieza */}
      <rect x={ox} y={oy} width={pw} height={ph}
        fill={fillBody} stroke={stroke} strokeWidth={1.5} />

      {/* Canto superior */}
      <rect x={ox} y={oy} width={pw} height={GROSOR_CANTO}
        fill={colorCanto(cantoPieza.superior)} stroke={stroke} strokeWidth={0.8} />
      {/* Canto inferior */}
      <rect x={ox} y={oy+ph-GROSOR_CANTO} width={pw} height={GROSOR_CANTO}
        fill={colorCanto(cantoPieza.inferior)} stroke={stroke} strokeWidth={0.8} />
      {/* Canto izquierdo (frente) */}
      <rect x={ox} y={oy} width={GROSOR_CANTO} height={ph}
        fill={colorCanto(cantoPieza.frente)} stroke={stroke} strokeWidth={0.8} />
      {/* Canto derecho (posterior) */}
      <rect x={ox+pw-GROSOR_CANTO} y={oy} width={GROSOR_CANTO} height={ph}
        fill={colorCanto(cantoPieza.posterior)} stroke={stroke} strokeWidth={0.8} />

      {/* Labels cantos */}
      <text x={ox+pw/2} y={oy-6} textAnchor="middle" fontSize="8" fill="#444">
        Su: {labelCanto(cantoPieza.superior)}
      </text>
      <text x={ox+pw/2} y={oy+ph+14} textAnchor="middle" fontSize="8" fill="#444">
        In: {labelCanto(cantoPieza.inferior)}
      </text>
      <text x={ox-6} y={oy+ph/2} textAnchor="middle" fontSize="8" fill="#444"
        transform={`rotate(-90,${ox-6},${oy+ph/2})`}>
        Fr: {labelCanto(cantoPieza.frente)}
      </text>
      <text x={ox+pw+6} y={oy+ph/2} textAnchor="middle" fontSize="8" fill="#444"
        transform={`rotate(90,${ox+pw+6},${oy+ph/2})`}>
        Po: {labelCanto(cantoPieza.posterior)}
      </text>

      {/* Cotas */}
      <line x1={ox} y1={oy+ph+22} x2={ox+pw} y2={oy+ph+22} stroke="#888" strokeWidth={0.7} />
      <text x={ox+pw/2} y={oy+ph+32} textAnchor="middle" fontSize="9" fill="#555">{A}mm</text>
      <line x1={ox+pw+22} y1={oy} x2={ox+pw+22} y2={oy+ph} stroke="#888" strokeWidth={0.7} />
      <text x={ox+pw+32} y={oy+ph/2} textAnchor="middle" fontSize="9" fill="#555"
        transform={`rotate(90,${ox+pw+32},${oy+ph/2})`}>{L}mm</text>

      {/* Espesor */}
      <text x={ox+pw/2} y={oy+ph/2} textAnchor="middle" fontSize="10" fill="#888">{E}mm</text>
    </svg>
  );
}

// ── Modal configuración avanzada de pieza ─────────────────────
function ModalPieza({ pieza, idx, filos, cantos, materiales, moduloDatos, onGuardar, onCerrar }) {
  const [filосLocal, setFilosLocal] = useState({ ...filos });
  const [materialId, setMaterialId] = useState(pieza.material_id || moduloDatos?.material_id || '');

  function setFilo(cara, valor) {
    setFilosLocal(prev => ({ ...prev, [cara]: valor }));
  }

  function aplicar4Lados() {
    const cantoId = moduloDatos?.canto_general_id || cantos?.[0]?.id || '';
    setFilosLocal({ frente: cantoId, posterior: cantoId, superior: cantoId, inferior: cantoId });
  }

  function handleGuardar() {
    onGuardar(idx, filосLocal, materialId);
  }

  const cantosOpciones = [
    { value: '', label: '— Sin canto —' },
    ...(cantos || []).map(c => ({
      value: c.id,
      label: `${c.color} ${c.espesor}/${c.alto_canto}mm`,
      sinStock: c.stock_metros === 0,
    }))
  ];

  const materialesOpciones = [
    { value: '', label: '— General del módulo —' },
    ...(materiales || []).map(m => ({
      value: m.id,
      label: `${m.tipo} ${m.color} ${m.espesor}mm`,
    }))
  ];

  return (
    <div className="modal-pieza-overlay">
      <div className="modal-pieza">

        <div className="modal-pieza-header">
          <div>
            <span className="modal-pieza-codigo">{pieza.codigo}</span>
            <span className="modal-pieza-nombre">{pieza.nombre}</span>
            <span className={`pieza-badge pieza-badge--modal`}>{TIPO_LABEL[pieza.tipo] || pieza.tipo}</span>
          </div>
          <button className="modal-pieza-cerrar" onClick={onCerrar}>✕</button>
        </div>

        <div className="modal-pieza-body">

          {/* Vista 2D */}
          <div className="modal-pieza-vista">
            <VistaPieza2D
              pieza={pieza}
              filos={filосLocal}
              cantos={cantos} />
          </div>

          {/* Configuración */}
          <div className="modal-pieza-config">

            {/* Material */}
            <div className="modal-pieza-seccion">
              <h4>Material</h4>
              <select className="modal-pieza-select"
                value={materialId}
                onChange={e => setMaterialId(e.target.value)}>
                {materialesOpciones.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Cantos por cara */}
            <div className="modal-pieza-seccion">
              <div className="modal-pieza-seccion-header">
                <h4>Cantos</h4>
                <button className="btn-4lados-modal" onClick={aplicar4Lados}>⊞ 4 lados</button>
              </div>
              {CARAS.map(cara => (
                <div key={cara.key} className="modal-pieza-fila">
                  <label>{cara.label}</label>
                  <select className="modal-pieza-select"
                    value={filосLocal[cara.key] || ''}
                    onChange={e => setFilo(cara.key, e.target.value)}>
                    {cantosOpciones.map(o => (
                      <option key={o.value} value={o.value}
                        style={o.sinStock ? { color: '#cc0000' } : {}}>
                        {o.sinStock ? `⚠ ${o.label}` : o.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

          </div>
        </div>

        <div className="modal-pieza-footer">
          <button className="btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primario" onClick={handleGuardar}>✓ Aplicar</button>
        </div>

      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
function SeccionPiezas({ moduloId, datos, cantos, materiales, divisor }) {
  const [piezas,      setPiezas]      = useState([]);
  const [filos,       setFilos]       = useState({});
  const [materiales_,  setMateriales_] = useState({});
  const [calculando,  setCalculando]  = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado,  setConfirmado]  = useState(false);
  const [sinGuardar,  setSinGuardar]  = useState(false);
  const [error,       setError]       = useState('');
  const [vista,       setVista]       = useState('der');
  const [modalPieza,  setModalPieza]  = useState(null); // índice de pieza abierta

  useEffect(() => {
    if (!piezas.length) return;
    const cantoGeneralId = datos?.canto_general_id || '';
    const canto2mm = cantos?.find(c => c.espesor === 2)?.id || cantoGeneralId;
    setFilos(prev => {
      const nuevo = {};
      piezas.forEach((p, i) => {
        if (prev[i]) { nuevo[i] = prev[i]; return; }
        const cantoDef = p.tipo === 'door' ? canto2mm : cantoGeneralId;
        nuevo[i] = { frente: cantoDef, posterior: cantoDef, superior: cantoDef, inferior: cantoDef };
      });
      return nuevo;
    });
  }, [piezas, datos?.canto_general_id]);

  function handleGuardarModal(idx, filosNuevos, materialId) {
    setFilos(prev => ({ ...prev, [idx]: filosNuevos }));
    setMateriales_(prev => ({ ...prev, [idx]: materialId }));
    setSinGuardar(true);
    setConfirmado(false);
    setModalPieza(null);
  }

  async function handleCalcular() {
    setCalculando(true);
    setError('');
    setConfirmado(false);
    try {
      const resultado = await invoke('calcular_piezas_modulo', { moduloId });
      setPiezas(resultado);
      setSinGuardar(true);
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setCalculando(false);
    }
  }

  async function handleConfirmar() {
    setConfirmando(true);
    setError('');
    try {
      const resultado = await invoke('confirmar_piezas_modulo', { moduloId });
      setPiezas(resultado);
      setConfirmado(true);
      setSinGuardar(false);
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setConfirmando(false);
    }
  }

  const cantosOpciones = [
    { value: '', label: '—' },
    ...(cantos || []).map(c => ({
      value: c.id,
      label: `${c.color} ${c.espesor}/${c.alto_canto}mm`,
      sinStock: c.stock_metros === 0,
    }))
  ];

  return (
    <div className="editor-seccion">
      <h3 className="editor-seccion-titulo">📋 Lista de Corte</h3>

      <div className="piezas-acciones">
        <button className="btn-secundario" onClick={handleCalcular} disabled={calculando}>
          {calculando ? 'Calculando...' : '⟳ Recalcular'}
        </button>
        {piezas.length > 0 && sinGuardar && (
          <button className="btn-primario" onClick={handleConfirmar} disabled={confirmando}>
            {confirmando ? 'Guardando...' : '✓ Confirmar'}
          </button>
        )}
        {sinGuardar && !confirmado && <span className="piezas-aviso">⚠️ Sin guardar</span>}
        {confirmado && <span className="editor-guardado">✓ Guardado</span>}
      </div>

      {error && <p className="editor-error-inline">⚠️ {error}</p>}

      <div className="piezas-svg-wrap">
        <div className="piezas-vista-btns">
          {[
            { id: 'der',    label: '◱ Der' },
            { id: 'izq',    label: '◲ Izq' },
            { id: 'frente', label: '⬜ Frente' },
          ].map(v => (
            <button key={v.id}
              className={`vista-btn ${vista === v.id ? 'activo' : ''}`}
              onClick={() => setVista(v.id)}>
              {v.label}
            </button>
          ))}
        </div>
        <div className="piezas-svg-container">
          <VistaIso datos={datos} vista={vista} divisor={divisor} />
        </div>
      </div>

      {piezas.length > 0 && (
        <div className="piezas-tabla-wrap">
          <table className="piezas-tabla">
            <thead>
              <tr>
                <th>Cód</th><th>Nombre</th><th>Tipo</th>
                <th className="num">A</th><th className="num">L</th><th className="num">E</th>
                <th className="filo-col">Fr</th><th className="filo-col">Po</th>
                <th className="filo-col">Su</th><th className="filo-col">In</th>
                <th title="Configuración avanzada">⚙</th>
              </tr>
            </thead>
            <tbody>
              {piezas.map((p, i) => (
                <tr key={i} className={`pieza-fila pieza-tipo-${p.tipo} ${materiales_[i] ? 'pieza-mat-custom' : ''}`}>
                  <td className="codigo">{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td><span className="pieza-badge">{TIPO_LABEL[p.tipo] || p.tipo}</span></td>
                  <td className="num corte">{p.ancho_corte.toFixed(1)}</td>
                  <td className="num corte">{p.alto_corte.toFixed(1)}</td>
                  <td className="num">{p.espesor.toFixed(0)}</td>
                  {CARAS.map(cara => (
                    <td key={cara.key} className="filo-td">
                      <select className="filo-select"
                        value={filos[i]?.[cara.key] || ''}
                        onChange={e => {
                          setFilos(prev => ({ ...prev, [i]: { ...prev[i], [cara.key]: e.target.value } }));
                          setSinGuardar(true);
                          setConfirmado(false);
                        }}>
                        {cantosOpciones.map(o => (
                          <option key={o.value} value={o.value}
                            style={o.sinStock ? { color: '#cc0000' } : {}}>
                            {o.sinStock ? `⚠ ${o.label}` : o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  ))}
                  <td>
                    <button
                      className={`btn-config-pieza ${materiales_[i] ? 'btn-config-pieza--custom' : ''}`}
                      onClick={() => setModalPieza(i)}
                      title="Configuración avanzada">
                      ⚙
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="piezas-total">{piezas.length} piezas — A=Ancho L=Largo E=Espesor (mm corte)</p>
        </div>
      )}

      {piezas.length === 0 && !calculando && (
        <p className="piezas-vacio">Presioná "Recalcular" para generar la lista de corte.</p>
      )}

      {modalPieza !== null && (
        <ModalPieza
          pieza={piezas[modalPieza]}
          idx={modalPieza}
          filos={filos[modalPieza] || {}}
          cantos={cantos}
          materiales={materiales}
          moduloDatos={datos}
          onGuardar={handleGuardarModal}
          onCerrar={() => setModalPieza(null)} />
      )}
    </div>
  );
}

export default SeccionPiezas;