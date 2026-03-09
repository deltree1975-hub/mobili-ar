// ============================================================
// MOBILI-AR — Pantalla: Listas de Corte
// Archivo  : src/screens/ListasCorte/index.jsx
// Módulo   : B4-02
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './ListasCorte.css';

// ── FormNuevaLista ────────────────────────────────────────────
function FormNuevaLista({ trabajo, onGenerada, onCancelar }) {
  const [modulos,   setModulos]   = useState([]);
  const [seleccion, setSeleccion] = useState({});
  const [nombre,    setNombre]    = useState(`Lista ${new Date().toLocaleDateString('es-AR')}`);
  const [outputDir, setOutputDir] = useState('');
  const [cargando,  setCargando]  = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error,     setError]     = useState('');

  useEffect(() => { cargarModulos(); cargarDir(); }, []);

  async function cargarModulos() {
    try {
      const lista = await invoke('get_modulos_para_lista', { trabajoId: trabajo.id });
      setModulos(lista);
      const sel = {};
      lista.forEach(m => { sel[m.modulo_id] = m.tiene_piezas && !m.en_lista_id; });
      setSeleccion(sel);
    } catch (err) {
      setError(`Error cargando módulos: ${err}`);
    } finally {
      setCargando(false);
    }
  }

  async function cargarDir() {
    try {
      const path = await invoke('get_db_path');
      setOutputDir(path.replace(/[/\\][^/\\]+$/, ''));
    } catch {}
  }

  async function handleElegirCarpeta() {
    try {
      const dir = await invoke('seleccionar_carpeta_db');
      if (dir) setOutputDir(dir);
    } catch {}
  }

  function toggleModulo(id) {
    setSeleccion(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleComposicion(compId) {
    const disponibles = modulos.filter(m => m.composicion_id === compId && m.tiene_piezas && !m.en_lista_id);
    const todosOn = disponibles.every(m => seleccion[m.modulo_id]);
    const nuevo = { ...seleccion };
    disponibles.forEach(m => { nuevo[m.modulo_id] = !todosOn; });
    setSeleccion(nuevo);
  }

  async function handleGenerar() {
    const modulo_ids = Object.entries(seleccion).filter(([, v]) => v).map(([k]) => k);
    if (!modulo_ids.length) { setError('Seleccioná al menos un módulo.'); return; }
    if (!outputDir.trim())  { setError('Indicá una carpeta de salida.');  return; }
    setGenerando(true); setError('');
    try {
      const res = await invoke('crear_y_generar_lista_corte', {
        input: { trabajo_id: trabajo.id, nombre, modulo_ids, output_dir: outputDir }
      });
      onGenerada(res);
    } catch (err) {
      setError(`${err}`);
    } finally {
      setGenerando(false);
    }
  }

  const composiciones = [...new Map(modulos.map(m => [m.composicion_id, m.comp_nombre])).entries()];
  const totalSel = Object.values(seleccion).filter(Boolean).length;

  return (
    <div className="lc-form">
      <div className="lc-form-campos">
        <div className="lc-campo">
          <label className="lc-label">Nombre de la lista</label>
          <input className="lc-input" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>
        <div className="lc-campo">
          <label className="lc-label">Carpeta de salida</label>
          <div className="lc-carpeta-row">
            <input className="lc-input lc-input--path" value={outputDir}
              onChange={e => setOutputDir(e.target.value)} placeholder="C:\Users\..." />
            <button className="lc-btn-sec lc-btn-sm" onClick={handleElegirCarpeta}>📁</button>
          </div>
        </div>
      </div>

      <div className="lc-modulos-header">
        <span className="lc-label">Módulos a incluir</span>
        <span className="lc-sel-count">{totalSel} seleccionados</span>
      </div>

      {cargando ? (
        <div className="lc-cargando">Cargando módulos...</div>
      ) : (
        <div className="lc-modulos-scroll">
          {composiciones.map(([compId, compNombre]) => {
            const modsComp    = modulos.filter(m => m.composicion_id === compId);
            const disponibles = modsComp.filter(m => m.tiene_piezas && !m.en_lista_id);
            const todosOn     = disponibles.length > 0 && disponibles.every(m => seleccion[m.modulo_id]);
            return (
              <div key={compId} className="lc-comp-grupo">
                <div className={`lc-comp-header ${!disponibles.length ? 'lc-comp-header--vacio' : ''}`}
                  onClick={() => disponibles.length && toggleComposicion(compId)}>
                  {disponibles.length > 0 && (
                    <input type="checkbox" className="lc-check" checked={todosOn}
                      onChange={() => toggleComposicion(compId)} onClick={e => e.stopPropagation()} />
                  )}
                  <span className="lc-comp-nombre">{compNombre}</span>
                  <span className="lc-comp-sub">{disponibles.length}/{modsComp.length} disponibles</span>
                </div>
                {modsComp.map(m => {
                  const bloq = !m.tiene_piezas || !!m.en_lista_id;
                  return (
                    <div key={m.modulo_id}
                      className={`lc-mod-item ${bloq ? 'lc-mod-item--bloq' : ''} ${seleccion[m.modulo_id] ? 'lc-mod-item--on' : ''}`}
                      onClick={() => !bloq && toggleModulo(m.modulo_id)}>
                      <input type="checkbox" className="lc-check" checked={!!seleccion[m.modulo_id]}
                        disabled={bloq} onChange={() => !bloq && toggleModulo(m.modulo_id)}
                        onClick={e => e.stopPropagation()} />
                      <div className="lc-mod-info">
                        <span className="lc-mod-nombre">{m.modulo_nombre}</span>
                        <span className="lc-mod-dims">{m.ancho}×{m.alto}×{m.profundidad}mm</span>
                      </div>
                      {!m.tiene_piezas && <span className="lc-badge lc-badge--rojo">Sin piezas</span>}
                      {m.en_lista_id   && <span className="lc-badge lc-badge--naranja">En lista</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {error && <p className="lc-error">⚠ {error}</p>}

      <div className="lc-form-footer">
        <button className="lc-btn-sec" onClick={onCancelar}>Cancelar</button>
        <button className="lc-btn-pri" onClick={handleGenerar} disabled={generando || !totalSel}>
          {generando ? 'Generando...' : `📋 Generar (${totalSel} módulos)`}
        </button>
      </div>
    </div>
  );
}

// ── FilaLista ─────────────────────────────────────────────────
function FilaLista({ lista, onReimprimir, onAnular, onAmpliar }) {
  const [expandida, setExpandida] = useState(false);
  const fecha = lista.creado_en?.slice(0, 10) || '—';

  return (
    <div className={`lc-fila ${expandida ? 'lc-fila--expandida' : ''}`}>
      <div className="lc-fila-main" onClick={() => setExpandida(v => !v)}>
        <div className="lc-fila-info">
          <span className="lc-fila-nombre">{lista.nombre}</span>
          <span className="lc-fila-meta">OT {lista.numero_ot} · {fecha}</span>
        </div>
        <div className="lc-fila-acciones" onClick={e => e.stopPropagation()}>
          <button className="lc-btn-accion" title="Reimprimir" onClick={() => onReimprimir(lista)}>🖨</button>
          <button className="lc-btn-accion" title="Ampliar"    onClick={() => onAmpliar(lista)}>＋</button>
          <button className="lc-btn-accion lc-btn-accion--danger" title="Anular" onClick={() => onAnular(lista)}>✕</button>
        </div>
        <span className="lc-chevron">{expandida ? '▲' : '▼'}</span>
      </div>

      {expandida && (
        <div className="lc-fila-detalle">
          {lista.output_pdf && (
            <div className="lc-detalle-item">
              <span className="lc-detalle-label">PDF</span>
              <span className="lc-detalle-val">{lista.output_pdf}</span>
            </div>
          )}
          {lista.output_dir && (
            <div className="lc-detalle-item">
              <span className="lc-detalle-label">CSVs</span>
              <span className="lc-detalle-val">{lista.output_dir}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pantalla principal ────────────────────────────────────────
function ListasCorte({ trabajo, onVolver }) {
  const [listas,          setListas]          = useState([]);
  const [vista,           setVista]           = useState('historial');
  const [listaAmpliar,    setListaAmpliar]    = useState(null);
  const [cargando,        setCargando]        = useState(true);
  const [confirmarAnular, setConfirmarAnular] = useState(null);
  const [banner,          setBanner]          = useState('');
  const [error,           setError]           = useState('');

  useEffect(() => { cargarListas(); }, []);

  async function cargarListas() {
    setCargando(true);
    try {
      const res = await invoke('get_listas_corte', { trabajoId: trabajo.id });
      setListas(res);
    } catch (err) {
      setError(`Error cargando listas: ${err}`);
    } finally {
      setCargando(false);
    }
  }
async function handleReimprimir(lista) {
  setError('');
  try {
    const modulos    = await invoke('get_modulos_lista', { listaId: lista.id });
    const modulo_ids = modulos.map(m => m.modulo_id);
    await invoke('reimprimir_lista_corte', {
       listaId:   lista.id,
       moduloIds: modulo_ids,
       outputDir: lista.output_dir || '',
    });   
    setBanner('Lista reimpresa correctamente.');
  } catch (err) {
    setError(`Error reimprimiendo: ${err}`);
  }
}

  async function confirmarAnularLista() {
    try {
      await invoke('anular_lista_corte', { listaId: confirmarAnular.id });
      setConfirmarAnular(null);
      setBanner('Lista anulada. Los módulos quedaron disponibles.');
      cargarListas();
    } catch (err) {
      setError(`Error anulando: ${err}`);
      setConfirmarAnular(null);
    }
  }

  function handleListaGenerada() {
    setBanner('Lista generada correctamente.');
    setVista('historial');
    setListaAmpliar(null);
    cargarListas();
  }

  function volverAlHistorial() {
    setVista('historial');
    setListaAmpliar(null);
  }

  return (
    <div className="lc-pantalla">

      <header className="lc-header">
        <button className="lc-btn-volver" onClick={onVolver}>← Proyecto</button>
        <div className="lc-header-info">
          <h1 className="lc-titulo">Listas de Corte</h1>
          <span className="lc-subtitulo">
            {trabajo.nombre}{trabajo.cliente ? ` · ${trabajo.cliente}` : ''}
          </span>
        </div>
        <div className="lc-header-acciones">
          {vista === 'historial' ? (
            <button className="lc-btn-pri" onClick={() => setVista('nueva')}>+ Nueva lista</button>
          ) : (
            <button className="lc-btn-sec" onClick={volverAlHistorial}>← Historial</button>
          )}
        </div>
      </header>

      <main className="lc-main">
        {banner && (
          <div className="lc-banner-ok">
            <span>✓ {banner}</span>
            <button className="lc-banner-cerrar" onClick={() => setBanner('')}>✕</button>
          </div>
        )}
        {error && <p className="lc-error lc-error--top">⚠ {error}</p>}

        {/* HISTORIAL */}
        {vista === 'historial' && (
          <>
            {cargando && <div className="lc-cargando">Cargando...</div>}
            {!cargando && listas.length === 0 && (
              <div className="lc-vacio">
                <p className="lc-vacio-icon">📋</p>
                <p>No hay listas generadas para este trabajo.</p>
                <button className="lc-btn-pri" style={{ marginTop: 16 }}
                  onClick={() => setVista('nueva')}>+ Crear primera lista</button>
              </div>
            )}
            {!cargando && listas.length > 0 && (
              <div className="lc-lista-container">
                {listas.map(lista => (
                  <FilaLista key={lista.id} lista={lista}
                    onReimprimir={handleReimprimir}
                    onAnular={l => setConfirmarAnular(l)}
                    onAmpliar={l => { setListaAmpliar(l); setVista('ampliar'); }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* NUEVA LISTA */}
        {vista === 'nueva' && (
          <FormNuevaLista trabajo={trabajo}
            onGenerada={handleListaGenerada}
            onCancelar={volverAlHistorial} />
        )}

        {/* AMPLIAR */}
        {vista === 'ampliar' && listaAmpliar && (
          <>
            <div className="lc-ampliar-banner">
              Ampliando: <strong>{listaAmpliar.nombre}</strong> — se creará una lista complementaria con los módulos faltantes.
            </div>
            <FormNuevaLista trabajo={trabajo}
              onGenerada={handleListaGenerada}
              onCancelar={volverAlHistorial} />
          </>
        )}
      </main>

      {/* MODAL ANULAR */}
      {confirmarAnular && (
        <div className="lc-overlay" onClick={() => setConfirmarAnular(null)}>
          <div className="lc-modal-confirm" onClick={e => e.stopPropagation()}>
            <h2 className="lc-modal-titulo">Anular lista</h2>
            <p className="lc-modal-cuerpo">
              ¿Anular <strong>{confirmarAnular.nombre}</strong>?
              Los módulos quedarán disponibles para nuevas listas.
            </p>
            <div className="lc-modal-btns">
              <button className="lc-btn-sec" onClick={() => setConfirmarAnular(null)}>Cancelar</button>
              <button className="lc-btn-danger" onClick={confirmarAnularLista}>Anular</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListasCorte;