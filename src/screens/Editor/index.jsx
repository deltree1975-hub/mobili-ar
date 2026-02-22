// ============================================================
// MOBILI-AR — Editor paramétrico de módulo
// Archivo  : src/screens/Editor/index.jsx
// Módulo   : F1-08 — Editor de módulo
// Creado   : [fecha]
// ============================================================

import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import SeccionDimensiones from './components/SeccionDimensiones';
import SeccionConstructiva from './components/SeccionConstructiva';
import SeccionMaterial from './components/SeccionMaterial';
import SeccionCantos from './components/SeccionCantos';
import SeccionPuertas from './components/SeccionPuertas';
import ResumenModulo from './components/ResumenModulo';
import './Editor.css';

const DISPOSICIONES = {
  bm: 'Bajomesa', al: 'Aéreo', to: 'Torre',
  ca: 'Cajón', ab: 'Abierto', me: 'Mesa',
  es: 'Estante', co: 'Columna',
};

function Editor({ modulo, onVolver }) {
  const [datos, setDatos]         = useState({ ...modulo });
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado]   = useState(false);
  const [error, setError]         = useState('');

  function actualizar(campo, valor) {
    setDatos(prev => ({ ...prev, [campo]: valor }));
    setGuardado(false);
  }

  async function handleGuardar() {
    setGuardando(true);
    setError('');
    try {
      await invoke('actualizar_modulo_completo', { id: modulo.id, datos });
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
          <SeccionConstructiva datos={datos} onChange={actualizar} />
          <SeccionMaterial datos={datos} onChange={actualizar} />
          <SeccionCantos datos={datos} onChange={actualizar} />
          {datos.cant_puertas > 0 && (
            <SeccionPuertas datos={datos} onChange={actualizar} />
          )}
        </div>
        <div className="editor-resumen">
          <ResumenModulo datos={datos} />
        </div>
      </div>
    </div>
  );
}

export default Editor;
