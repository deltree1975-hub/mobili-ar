// ============================================================
// MOBILI-AR — Editor paramétrico de módulo
// Archivo  : src/screens/Editor/index.jsx
// Módulo   : F1-08 / F3-01 / F3-02 / F3-03
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import SeccionDimensiones from './components/SeccionDimensiones';
import SeccionPiezas from './components/SeccionPiezas';
import ResumenModulo from './components/ResumenModulo';
import './Editor.css';

function Editor({ modulo, onVolver }) {
  const [datos, setDatos]                 = useState({ ...modulo });
  const [guardando, setGuardando]         = useState(false);
  const [guardado, setGuardado]           = useState(false);
  const [error, setError]                 = useState('');
  const [cantos, setCantos]               = useState([]);
  const [materiales, setMateriales]       = useState([]);
  const [divisor, setDivisor]             = useState(null);
  const [disposiciones, setDisposiciones] = useState([]);

  // ── Estado ensamble ────────────────────────────────────────
  const [ensamble, setEnsamble] = useState({
    costado_izq_pasante_techo: true,
    costado_der_pasante_techo: true,
    costado_izq_pasante_piso:  true,
    costado_der_pasante_piso:  true,
    fondo_tipo:                'interno',
    fondo_retranqueo:          12,
  });

  useEffect(() => {
    // Garantizar campos nuevos si el módulo viene sin ellos (DB anterior a v9)
    setDatos(prev => ({
      ...prev,
      tiene_techo:       prev.tiene_techo       ?? true,
      tiene_piso:        prev.tiene_piso        ?? true,
      tiene_costado_izq: prev.tiene_costado_izq ?? true,
      tiene_costado_der: prev.tiene_costado_der ?? true,
      tiene_fondo:       prev.tiene_fondo       ?? true,
      tiene_faja_sup:    prev.tiene_faja_sup    ?? false,
      tiene_faja_inf:    prev.tiene_faja_inf    ?? false,
      alto_faja_sup:     prev.alto_faja_sup     ?? 80,
      alto_faja_inf:     prev.alto_faja_inf     ?? 80,
      alto_faja:         prev.alto_faja         ?? 80,
      faja_acostada:     prev.faja_acostada     ?? false,
    }));

    invoke('get_ensamble_modulo', { moduloId: modulo.id })
      .then(e => setEnsamble(e))
      .catch(() => {});
    invoke('get_cantos')
      .then(setCantos)
      .catch(err => console.error('ERROR cantos:', err));
    invoke('get_materiales')
      .then(setMateriales)
      .catch(err => console.error('ERROR materiales:', err));
    invoke('get_disposiciones')
      .then(setDisposiciones)
      .catch(err => console.error('ERROR disposiciones:', err));
  }, [modulo.id]);

  // ── Actualizar campo de datos ──────────────────────────────
  function actualizar(campo, valor) {
    setDatos(prev => {
      const next = { ...prev, [campo]: valor };
      if (campo === 'disposicion') {
        aplicarDefaultsDisposicion(valor);
      }
      return next;
    });
    setGuardado(false);
  }

  // ── Aplicar defaults desde DB al cambiar disposición ──────
  async function aplicarDefaultsDisposicion(dispId) {
    try {
      const disp = await invoke('get_disposicion', { disposicionId: dispId });

      setDatos(prev => ({
        ...prev,
        tiene_techo:       disp.tiene_techo,
        tiene_piso:        disp.tiene_piso,
        tiene_costado_izq: disp.tiene_costado_izq,
        tiene_costado_der: disp.tiene_costado_der,
        tiene_fondo:       disp.tiene_fondo,
        tiene_faja_sup:    disp.tiene_faja_sup,
        tiene_faja_inf:    disp.tiene_faja_inf,
        alto_faja_sup:     disp.alto_faja_sup,
        alto_faja_inf:     disp.alto_faja_inf,
      }));

      setEnsamble(prev => ({
        ...prev,
        costado_izq_pasante_techo: disp.costado_izq_pasante_techo,
        costado_der_pasante_techo: disp.costado_der_pasante_techo,
        costado_izq_pasante_piso:  disp.costado_izq_pasante_piso,
        costado_der_pasante_piso:  disp.costado_der_pasante_piso,
        fondo_tipo:                disp.fondo_tipo,
        fondo_retranqueo:          disp.fondo_retranqueo,
      }));
    } catch (err) {
      console.error('Error cargando disposición:', err);
    }
  }

  // ── Actualizar ensamble con restricción costado↔horizontal ─
  function actualizarEnsamble(campo, valor) {
    setEnsamble(prev => {
      const next = { ...prev, [campo]: valor };

      if (campo === 'costado_izq_pasante_techo' && !valor)
        next.costado_der_pasante_techo = true;
      if (campo === 'costado_der_pasante_techo' && !valor)
        next.costado_izq_pasante_techo = true;
      if (campo === 'costado_izq_pasante_piso' && !valor)
        next.costado_der_pasante_piso = true;
      if (campo === 'costado_der_pasante_piso' && !valor)
        next.costado_izq_pasante_piso = true;

      return next;
    });
    setGuardado(false);
  }

  // ── Toggle de panel individual ─────────────────────────────
  function actualizarPanel(campo, valor) {
    setDatos(prev => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  function handleDivisorChange(nuevoDivisor) {
    setDivisor(nuevoDivisor);
  }

  async function handleGuardar() {
    setGuardando(true);
    setError('');
    try {
      const datosCompletos = {
        ...datos,
        tiene_techo:       datos.tiene_techo       ?? true,
        tiene_piso:        datos.tiene_piso        ?? true,
        tiene_costado_izq: datos.tiene_costado_izq ?? true,
        tiene_costado_der: datos.tiene_costado_der ?? true,
        tiene_fondo:       datos.tiene_fondo       ?? true,
        tiene_faja_sup:    datos.tiene_faja_sup    ?? false,
        tiene_faja_inf:    datos.tiene_faja_inf    ?? false,
        alto_faja_sup:     datos.alto_faja_sup     ?? 80,
        alto_faja_inf:     datos.alto_faja_inf     ?? 80,
        alto_faja:         datos.alto_faja         ?? 80,
        faja_acostada:     datos.faja_acostada     ?? false,
      };

      await invoke('actualizar_modulo_completo', { id: modulo.id, datos: datosCompletos });
      await invoke('set_ensamble_modulo', {
        input: {
          modulo_id:                 modulo.id,
          costado_izq_pasante_techo: ensamble.costado_izq_pasante_techo ?? true,
          costado_der_pasante_techo: ensamble.costado_der_pasante_techo ?? true,
          costado_izq_pasante_piso:  ensamble.costado_izq_pasante_piso  ?? true,
          costado_der_pasante_piso:  ensamble.costado_der_pasante_piso  ?? true,
          fondo_tipo:                ensamble.fondo_tipo       || 'interno',
          fondo_retranqueo:          ensamble.fondo_retranqueo ?? 12,
        }
      });
      setGuardado(true);
    } catch (err) {
      setError(`Error al guardar: ${err}`);
    } finally {
      setGuardando(false);
    }
  }

  const labelDisposicion = disposiciones.find(d => d.id === datos.disposicion)?.nombre
  || datos.disposicion;

  return (
    <div className="editor">
      <header className="editor-header">
        <button className="btn-volver" onClick={onVolver}>← Proyecto</button>
        <div className="editor-titulo">
          <h1>{datos.nombre}</h1>
          <span className="editor-tipo">{labelDisposicion}</span>
        </div>
        <div className="editor-acciones">
          {guardado && <span className="editor-guardado">✓ Guardado</span>}
          {error    && <span className="editor-error-inline">⚠️ {error}</span>}
          <button className="btn-primario" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>

      <div className="editor-body">
        <div className="editor-form">
          <SeccionDimensiones datos={datos} onChange={actualizar} />
          <SeccionPiezas
            moduloId={modulo.id}
            datos={datos}
            ensamble={ensamble}
            cantos={cantos}
            materiales={materiales}
            divisor={divisor}
          />
        </div>
        <div className="editor-resumen">
          <ResumenModulo
            datos={datos}
            ensamble={ensamble}
            cantos={cantos}
            materiales={materiales}
            disposiciones={disposiciones}
            onChange={actualizar}
            onEnsambleChange={actualizarEnsamble}
            onPanelChange={actualizarPanel}
            onDivisorChange={handleDivisorChange}
          />
        </div>
      </div>
    </div>
  );
}

export default Editor;