// ============================================================
// MOBILI-AR — Editor paramétrico de módulo
// Archivo  : src/screens/Editor/index.jsx
// Módulo   : F1-08 / F3-01
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import SeccionDimensiones from './components/SeccionDimensiones';
import SeccionPiezas from './components/SeccionPiezas';
import ResumenModulo from './components/ResumenModulo';
import './Editor.css';

const DISPOSICIONES = {
  bm: 'Bajomesa', al: 'Aéreo', to: 'Torre',
  ca: 'Cajón', ab: 'Abierto', me: 'Mesa',
  es: 'Estante', co: 'Columna', 'caj-plac': 'Cajonera placar',
};

function Editor({ modulo, onVolver }) {
  const [datos, setDatos]         = useState({ ...modulo });
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);
  const [error, setError]         = useState('');
  const [cantos, setCantos]       = useState([]);
  const [materiales, setMateriales] = useState([]);

  const [ensamble, setEnsamble] = useState({
    costado_pasante_techo: true,
    costado_pasante_piso:  true,
    fondo_tipo:            'interno',
    fondo_retranqueo:      12,
  });

  useEffect(() => {
    invoke('get_ensamble_modulo', { moduloId: modulo.id })
      .then(e => setEnsamble(e))
      .catch(() => {});
    invoke('get_cantos')
      .then(c => setCantos(c))
      .catch(() => {});
    invoke('get_materiales')
      .then(m => setMateriales(m))
      .catch(() => {});
  }, [modulo.id]);

  function actualizar(campo, valor) {
    setDatos(prev => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  function actualizarEnsamble(campo, valor) {
    setEnsamble(prev => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  async function handleGuardar() {
    setGuardando(true);
    setError('');
    try {
      await invoke('actualizar_modulo_completo', { id: modulo.id, datos });
      await invoke('set_ensamble_modulo', {
        input: {
          modulo_id:             modulo.id,
          costado_pasante_techo: ensamble.costado_pasante_techo,
          costado_pasante_piso:  ensamble.costado_pasante_piso,
          fondo_tipo:            ensamble.fondo_tipo,
          fondo_retranqueo:      ensamble.fondo_retranqueo,
        }
      });
      setGuardado(true);
    } catch (err) {
      setError(`Error al guardar: ${err}`);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="editor">
      <header className="editor-header">
        <button className="btn-volver" onClick={onVolver}>← Proyecto</button>
        <div className="editor-titulo">
          <h1>{datos.nombre}</h1>
          <span className="editor-tipo">{DISPOSICIONES[datos.disposicion] || datos.disposicion}</span>
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
            cantos={cantos}
          />
        </div>
        <div className="editor-resumen">
          <ResumenModulo
            datos={datos}
            ensamble={ensamble}
            cantos={cantos}
            materiales={materiales}
            onChange={actualizar}
            onEnsambleChange={actualizarEnsamble}
          />
        </div>
      </div>
    </div>
  );
}

export default Editor;