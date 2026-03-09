// ============================================================
// MOBILI-AR — Modal: Generar Lista de Corte
// Archivo  : src/screens/Proyecto/components/ModalListaCorte.jsx
// Módulo   : B4-02
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './ModalListaCorte.css';

function ModalListaCorte({ trabajo, onCerrar }) {
  const [modulos,     setModulos]     = useState([]);
  const [seleccion,   setSeleccion]   = useState({});   // modulo_id → bool
  const [nombre,      setNombre]      = useState(`Lista ${new Date().toLocaleDateString('es-AR')}`);
  const [outputDir,   setOutputDir]   = useState('');
  const [cargando,    setCargando]    = useState(true);
  const [generando,   setGenerando]   = useState(false);
  const [resultado,   setResultado]   = useState(null);
  const [error,       setError]       = useState('');

  useEffect(() => {
    cargarModulos();
    cargarOutputDir();
  }, []);

  async function cargarModulos() {
    try {
      const lista = await invoke('get_modulos_para_lista', { trabajoId: trabajo.id });
      setModulos(lista);
      // Seleccionar por defecto todos los disponibles (tienen piezas y no están en otra lista)
      const sel = {};
      lista.forEach(m => {
        sel[m.modulo_id] = m.tiene_piezas && !m.en_lista_id;
      });
      setSeleccion(sel);
    } catch (err) {
      setError(`Error cargando módulos: ${err}`);
    } finally {
      setCargando(false);
    }
  }

  async function cargarOutputDir() {
    try {
      const path = await invoke('get_db_path');
      // Usar la carpeta del DB como base
      const dir = path.replace(/[/\\][^/\\]+$/, '');
      setOutputDir(dir);
    } catch {
      setOutputDir('');
    }
  }

  async function handleSeleccionarCarpeta() {
    try {
      const dir = await invoke('seleccionar_carpeta_db');
      if (dir) setOutputDir(dir);
    } catch {}
  }

  function toggleModulo(moduloId) {
    setSeleccion(prev => ({ ...prev, [moduloId]: !prev[moduloId] }));
  }

  function toggleComposicion(compId) {
    const modComp = modulos.filter(m => m.composicion_id === compId && m.tiene_piezas && !m.en_lista_id);
    const todosOn = modComp.every(m => seleccion[m.modulo_id]);
    const nuevo   = { ...seleccion };
    modComp.forEach(m => { nuevo[m.modulo_id] = !todosOn; });
    setSeleccion(nuevo);
  }

  async function handleGenerar() {
    const modulo_ids = Object.entries(seleccion)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (modulo_ids.length === 0) {
      setError('Seleccioná al menos un módulo.');
      return;
    }
    if (!outputDir.trim()) {
      setError('Indicá una carpeta de salida.');
      return;
    }

    setGenerando(true);
    setError('');
    try {
      const res = await invoke('crear_y_generar_lista_corte', {
        input: {
          trabajo_id: trabajo.id,
          nombre,
          modulo_ids,
          output_dir: outputDir,
        }
      });
      setResultado(res);
    } catch (err) {
      setError(`Error generando lista: ${err}`);
    } finally {
      setGenerando(false);
    }
  }

  // Agrupar módulos por composición
  const composiciones = [...new Map(
    modulos.map(m => [m.composicion_id, m.comp_nombre])
  ).entries()];

  const totalSeleccionados = Object.values(seleccion).filter(Boolean).length;

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-lista-corte" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="mlc-header">
          <div>
            <h2 className="mlc-titulo">📋 Generar Lista de Corte</h2>
            <p className="mlc-subtitulo">{trabajo.nombre}{trabajo.cliente ? ` — ${trabajo.cliente}` : ''}</p>
          </div>
          <button className="modal-pieza-cerrar" onClick={onCerrar}>✕</button>
        </div>

        {resultado ? (
          // ── RESULTADO ────────────────────────────────────────
          <div className="mlc-resultado">
            <div className="mlc-resultado-ok">✓ Lista generada correctamente</div>
            <div className="mlc-resultado-item">
              <span className="mlc-resultado-label">PDF</span>
              <span className="mlc-resultado-valor">{resultado.output_pdf || '—'}</span>
            </div>
            <div className="mlc-resultado-item">
              <span className="mlc-resultado-label">Carpeta CSVs</span>
              <span className="mlc-resultado-valor">{resultado.output_dir || '—'}</span>
            </div>
            <button className="btn-primario mlc-btn-cerrar" onClick={onCerrar}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            {/* NOMBRE */}
            <div className="mlc-campo">
              <label className="mlc-label">Nombre de la lista</label>
              <input
                className="mlc-input"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Lista principal cocina"
              />
            </div>

            {/* CARPETA DE SALIDA */}
            <div className="mlc-campo">
              <label className="mlc-label">Carpeta de salida</label>
              <div className="mlc-carpeta-row">
                <input
                  className="mlc-input mlc-input--carpeta"
                  value={outputDir}
                  onChange={e => setOutputDir(e.target.value)}
                  placeholder="C:\Users\..."
                />
                <button className="btn-secundario btn-sm" onClick={handleSeleccionarCarpeta}>
                  📁 Elegir
                </button>
              </div>
            </div>

            {/* MÓDULOS */}
            <div className="mlc-modulos-header">
              <label className="mlc-label">Módulos a incluir</label>
              <span className="mlc-contador">{totalSeleccionados} seleccionados</span>
            </div>

            {cargando && <div className="mlc-cargando">Cargando módulos...</div>}

            {!cargando && (
              <div className="mlc-modulos-lista">
                {composiciones.map(([compId, compNombre]) => {
                  const modsComp = modulos.filter(m => m.composicion_id === compId);
                  const disponibles = modsComp.filter(m => m.tiene_piezas && !m.en_lista_id);
                  const todosOn = disponibles.length > 0 && disponibles.every(m => seleccion[m.modulo_id]);

                  return (
                    <div key={compId} className="mlc-comp-grupo">
                      {/* Header composición — clickeable para toggle grupo */}
                      <div
                        className={`mlc-comp-header ${disponibles.length === 0 ? 'mlc-comp-header--vacio' : ''}`}
                        onClick={() => disponibles.length > 0 && toggleComposicion(compId)}
                      >
                        {disponibles.length > 0 && (
                          <input
                            type="checkbox"
                            checked={todosOn}
                            onChange={() => toggleComposicion(compId)}
                            onClick={e => e.stopPropagation()}
                            className="mlc-check"
                          />
                        )}
                        <span className="mlc-comp-nombre">{compNombre}</span>
                        <span className="mlc-comp-count">
                          {disponibles.length}/{modsComp.length} disponibles
                        </span>
                      </div>

                      {/* Módulos */}
                      {modsComp.map(m => {
                        const bloqueado = !m.tiene_piezas || !!m.en_lista_id;
                        return (
                          <div
                            key={m.modulo_id}
                            className={`mlc-modulo-item ${bloqueado ? 'mlc-modulo-item--bloqueado' : ''} ${seleccion[m.modulo_id] ? 'mlc-modulo-item--activo' : ''}`}
                            onClick={() => !bloqueado && toggleModulo(m.modulo_id)}
                          >
                            <input
                              type="checkbox"
                              checked={!!seleccion[m.modulo_id]}
                              disabled={bloqueado}
                              onChange={() => !bloqueado && toggleModulo(m.modulo_id)}
                              onClick={e => e.stopPropagation()}
                              className="mlc-check"
                            />
                            <div className="mlc-modulo-info">
                              <span className="mlc-modulo-nombre">{m.modulo_nombre}</span>
                              <span className="mlc-modulo-dims">
                                {m.ancho}×{m.alto}×{m.profundidad}mm
                              </span>
                            </div>
                            <div className="mlc-modulo-estado">
                              {!m.tiene_piezas && (
                                <span className="mlc-badge mlc-badge--sin-piezas">Sin piezas</span>
                              )}
                              {m.en_lista_id && (
                                <span className="mlc-badge mlc-badge--en-lista">En lista</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

            {error && <p className="editor-error-inline">⚠️ {error}</p>}

            {/* FOOTER */}
            <div className="mlc-footer">
              <button className="btn-secundario" onClick={onCerrar}>Cancelar</button>
              <button
                className="btn-primario"
                onClick={handleGenerar}
                disabled={generando || totalSeleccionados === 0}
              >
                {generando ? 'Generando...' : `📋 Generar lista (${totalSeleccionados} módulos)`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ModalListaCorte;