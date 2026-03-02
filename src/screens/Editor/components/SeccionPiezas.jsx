// ============================================================
// MOBILI-AR — Lista de corte con vista isométrica técnica
// Archivo  : src/screens/Editor/components/SeccionPiezas.jsx
// Módulo   : F3-01
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
    const xi = espejado ? (w - x) : x;
    return [xi * CX - z * CX, -(y) - xi * SX - z * SX];
  }

  // Calcula el bounding box de todos los vértices del mueble
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

  const pad = 24; // padding para cotas
  const vbW = maxX - minX + pad * 2;
  const vbH = maxY - minY + pad * 2;

  // Origen: trasladar para que minX,minY queden en (pad,pad)
  const ox = -minX + pad;
  const oy = -minY + pad;

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

// ── Vista isométrica técnica ──────────────────────────────────
function VistaIso({ datos, vista }) {
  if (!datos) return (
    <div style={{ textAlign: 'center', color: '#aaa', padding: 30, fontSize: 12 }}>
      Calculá las piezas para ver la vista
    </div>
  );

  const W  = datos.ancho        || 600;
  const H  = datos.alto         || 720;
  const P  = datos.profundidad  || 550;
  const ET = datos.espesor_tablero || 18;
  const EF = datos.espesor_fondo   || 3;
  const nEstantes  = datos.cant_estantes || 0;
  const nPuertas   = datos.cant_puertas  || 0;
  const overlap    = datos.overlap_puertas || 2;
  const tieneFondo = datos.tiene_fondo !== false;

  const espejado = vista === 'izq';
  const { w, h, p, et, escala, vbW, vbH, pt, ptXY } = useIso(W, H, P, ET, espejado);
  const ef = EF * escala;

  // Colores
  const stroke    = '#1a3a5c';
  const strokeInt = '#4a7ab5';
  const fillFace  = 'rgba(220,235,250,0.18)';
  const fillSide  = 'rgba(190,215,240,0.20)';
  const fillTop   = 'rgba(210,230,210,0.22)';
  const fillBack  = 'rgba(200,220,240,0.10)';
  const fillDoor  = 'rgba(230,240,255,0.38)';
  const swExt  = 1.4;
  const swInt  = 0.7;
  const dash   = '3,2';
  const dashSt = '5,3';

  // Estantes: posición Y en píxeles desde abajo
  const estantes = Array.from({ length: nEstantes }, (_, i) => {
    const sep = (H - ET * 2) / (nEstantes + 1);
    return (ET + sep * (i + 1)) * escala;
  });

  // ── Vista frontal ─────────────────────────────────────────
  if (vista === 'frente') {
    const fox = 20;
    const foy = 20;
    const fw = w;
    const fh = h;
    const fet = et;
    const totalW = fw + 40;
    const totalH = fh + 44;
    return (
      <svg width="100%" viewBox={`0 0 ${totalW} ${totalH}`} style={{ maxHeight: 220 }}>
        <rect x={fox} y={foy} width={fw} height={fh} fill="rgba(220,235,250,0.3)" stroke={stroke} strokeWidth={swExt} />
        <rect x={fox} y={foy} width={fet} height={fh} fill="rgba(190,215,240,0.3)" stroke={stroke} strokeWidth={swExt * 0.6} />
        <rect x={fox + fw - fet} y={foy} width={fet} height={fh} fill="rgba(190,215,240,0.3)" stroke={stroke} strokeWidth={swExt * 0.6} />
        <rect x={fox} y={foy} width={fw} height={fet} fill="rgba(210,230,210,0.3)" stroke={stroke} strokeWidth={swExt * 0.6} />
        <rect x={fox} y={foy + fh - fet} width={fw} height={fet} fill="rgba(210,230,210,0.3)" stroke={stroke} strokeWidth={swExt * 0.6} />
        {tieneFondo && <line x1={fox + fw - 2} y1={foy + fet} x2={fox + fw - 2} y2={foy + fh - fet} stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />}
        {estantes.map((sy, i) => (
          <line key={i}
            x1={fox + fet} y1={foy + fh - sy}
            x2={fox + fw - fet} y2={foy + fh - sy}
            stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash}
          />
        ))}
        {nPuertas > 0 && Array.from({ length: nPuertas }, (_, i) => {
          const pw = fw / nPuertas;
          return <rect key={i} x={fox + pw * i + 1} y={foy + 1} width={pw - 2} height={fh - 2} fill={fillDoor} stroke={stroke} strokeWidth={swExt * 0.8} />;
        })}
        <text x={fox + fw / 2} y={foy + fh + 14} textAnchor="middle" fontSize="9" fill="#555">{W}mm</text>
        <text x={fox - 10} y={foy + fh / 2} textAnchor="middle" fontSize="9" fill="#555" transform={`rotate(-90,${fox - 10},${foy + fh / 2})`}>{H}mm</text>
      </svg>
    );
  }

  // ── Vista isométrica der / izq ────────────────────────────
  return (
    <svg width="100%" viewBox={`0 0 ${vbW} ${vbH}`} style={{ maxHeight: 240 }}>

      {/* Cara posterior */}
      <polygon points={`${pt(0,p,0)} ${pt(w,p,0)} ${pt(w,p,h)} ${pt(0,p,h)}`}
        fill={fillBack} stroke={stroke} strokeWidth={swExt * 0.5} opacity="0.6" />

      {/* Laterales */}
      <polygon points={`${pt(0,0,0)} ${pt(0,p,0)} ${pt(0,p,h)} ${pt(0,0,h)}`}
        fill={fillSide} stroke={stroke} strokeWidth={swExt} />
      <polygon points={`${pt(w,0,0)} ${pt(w,p,0)} ${pt(w,p,h)} ${pt(w,0,h)}`}
        fill={fillSide} stroke={stroke} strokeWidth={swExt} />

      {/* Piso */}
      <polygon points={`${pt(0,0,0)} ${pt(w,0,0)} ${pt(w,p,0)} ${pt(0,p,0)}`}
        fill={fillTop} stroke={stroke} strokeWidth={swExt} />

      {/* Fondo interno */}
      {tieneFondo && (
        <polygon points={`${pt(et,0,ef)} ${pt(w-et,0,ef)} ${pt(w-et,p-ef,ef)} ${pt(et,p-ef,ef)}`}
          fill="none" stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />
      )}

      {/* Aristas internas laterales */}
      <line x1={ptXY(et,0,0)[0]} y1={ptXY(et,0,0)[1]} x2={ptXY(et,0,h)[0]} y2={ptXY(et,0,h)[1]}
        stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />
      <line x1={ptXY(w-et,0,0)[0]} y1={ptXY(w-et,0,0)[1]} x2={ptXY(w-et,0,h)[0]} y2={ptXY(w-et,0,h)[1]}
        stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />

      {/* Estantes */}
      {estantes.map((sy, i) => (
        <g key={i}>
          <polygon points={`${pt(et,0,sy)} ${pt(w-et,0,sy)} ${pt(w-et,p-et,sy)} ${pt(et,p-et,sy)}`}
            fill="rgba(200,220,240,0.20)" stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />
          <line x1={ptXY(et,0,sy)[0]} y1={ptXY(et,0,sy)[1]}
                x2={ptXY(w-et,0,sy)[0]} y2={ptXY(w-et,0,sy)[1]}
            stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dashSt} />
        </g>
      ))}

      {/* Techo */}
      <polygon points={`${pt(0,0,h)} ${pt(w,0,h)} ${pt(w,p,h)} ${pt(0,p,h)}`}
        fill={fillTop} stroke={stroke} strokeWidth={swExt} />
      <line x1={ptXY(et,0,h-et)[0]} y1={ptXY(et,0,h-et)[1]}
            x2={ptXY(w-et,0,h-et)[0]} y2={ptXY(w-et,0,h-et)[1]}
        stroke={strokeInt} strokeWidth={swInt} strokeDasharray={dash} />

      {/* Cara frontal */}
      <polygon points={`${pt(0,0,0)} ${pt(w,0,0)} ${pt(w,0,h)} ${pt(0,0,h)}`}
        fill={fillFace} stroke={stroke} strokeWidth={swExt} />

      {/* Puertas */}
      {nPuertas > 0 && (() => {
        const pw = w / nPuertas;
        const po = overlap * escala;
        return Array.from({ length: nPuertas }, (_, i) => {
          const px0 = pw * i - po / 2;
          const px1 = pw * (i + 1) + po / 2;
          return (
            <polygon key={i}
              points={`${pt(px0,0,-po/2)} ${pt(px1,0,-po/2)} ${pt(px1,0,h+po/2)} ${pt(px0,0,h+po/2)}`}
              fill={fillDoor} stroke={stroke} strokeWidth={swExt * 0.9} />
          );
        });
      })()}

      {/* Cotas */}
      {(() => {
        const [ax,ay] = ptXY(0,0,0);
        const [bx,by] = ptXY(w,0,0);
        return <><line x1={ax} y1={ay+8} x2={bx} y2={by+8} stroke="#888" strokeWidth={0.7}/>
          <text x={(ax+bx)/2} y={(ay+by)/2+18} textAnchor="middle" fontSize="9" fill="#555">{W}mm</text></>;
      })()}
      {(() => {
        const [ax,ay] = ptXY(espejado?w:0,0,0);
        const [bx,by] = ptXY(espejado?w:0,0,h);
        const mx = ax - 8;
        return <><line x1={ax-5} y1={ay} x2={bx-5} y2={by} stroke="#888" strokeWidth={0.7}/>
          <text x={mx} y={(ay+by)/2} textAnchor="middle" fontSize="9" fill="#555"
            transform={`rotate(-90,${mx},${(ay+by)/2})`}>{H}mm</text></>;
      })()}
      {(() => {
        const [ax,ay] = ptXY(espejado?0:w,0,0);
        const [bx,by] = ptXY(espejado?0:w,p,0);
        return <><line x1={ax} y1={ay+5} x2={bx} y2={by+5} stroke="#888" strokeWidth={0.7}/>
          <text x={(ax+bx)/2+8} y={(ay+by)/2+14} textAnchor="start" fontSize="9" fill="#555">{P}mm</text></>;
      })()}
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────
function SeccionPiezas({ moduloId, datos, cantos }) {
  const [piezas,      setPiezas]      = useState([]);
  const [filos,       setFilos]       = useState({});
  const [calculando,  setCalculando]  = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado,  setConfirmado]  = useState(false);
  const [sinGuardar,  setSinGuardar]  = useState(false);
  const [error,       setError]       = useState('');
  const [vista,       setVista]       = useState('der');

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

  function actualizarFilo(idx, cara, cantoId) {
    setFilos(prev => ({ ...prev, [idx]: { ...prev[idx], [cara]: cantoId } }));
    setSinGuardar(true);
    setConfirmado(false);
  }

  function aplicar4Lados(idx) {
    const cantoId = datos?.canto_general_id || cantos?.[0]?.id || '';
    setFilos(prev => ({
      ...prev,
      [idx]: { frente: cantoId, posterior: cantoId, superior: cantoId, inferior: cantoId }
    }));
    setSinGuardar(true);
    setConfirmado(false);
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
          <VistaIso datos={datos} vista={vista} />
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
                <th>4L</th>
              </tr>
            </thead>
            <tbody>
              {piezas.map((p, i) => (
                <tr key={i} className={`pieza-fila pieza-tipo-${p.tipo}`}>
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
                        onChange={e => actualizarFilo(i, cara.key, e.target.value)}>
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
                    <button className="btn-4lados" onClick={() => aplicar4Lados(i)}>⊞</button>
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
    </div>
  );
}

export default SeccionPiezas;