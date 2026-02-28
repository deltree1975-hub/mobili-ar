// ============================================================
// MOBILI-AR — Sección: Piezas calculadas
// Archivo  : src/screens/Editor/components/SeccionPiezas.jsx
// Módulo   : F3-01
// ============================================================

import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './Secciones.css';

const TIPO_LABEL = {
  side:       'Lateral',
  horizontal: 'Horizontal',
  back:       'Fondo',
  shelf:      'Estante',
  door:       'Puerta',
};

function SeccionPiezas({ moduloId }) {
  const [piezas,      setPiezas]      = useState([]);
  const [calculando,  setCalculando]  = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [confirmado,  setConfirmado]  = useState(false);
  const [error,       setError]       = useState('');

  async function handlePrevisualizar() {
    setCalculando(true);
    setError('');
    setConfirmado(false);
    try {
      const resultado = await invoke('calcular_piezas_modulo', { moduloId });
      setPiezas(resultado);
    } catch (err) {
      setError(`Error al calcular: ${err}`);
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
    } catch (err) {
      setError(`Error al confirmar: ${err}`);
    } finally {
      setConfirmando(false);
    }
  }

  return (
    <div className="editor-seccion">
      <h3 className="editor-seccion-titulo">📋 Piezas</h3>

      <div className="piezas-acciones">
        <button
          className="btn-secundario"
          onClick={handlePrevisualizar}
          disabled={calculando}
        >
          {calculando ? 'Calculando...' : '⟳ Previsualizar piezas'}
        </button>

        {piezas.length > 0 && !confirmado && (
          <button
            className="btn-primario"
            onClick={handleConfirmar}
            disabled={confirmando}
          >
            {confirmando ? 'Confirmando...' : '✓ Confirmar y guardar'}
          </button>
        )}

        {confirmado && (
          <span className="editor-guardado">✓ Piezas guardadas</span>
        )}
      </div>

      {error && <p className="editor-error-inline">⚠️ {error}</p>}

      {piezas.length > 0 && (
        <div className="piezas-tabla-wrap">
          <table className="piezas-tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th className="num">Nominal A</th>
                <th className="num">Nominal L</th>
                <th className="num">Corte A</th>
                <th className="num">Corte L</th>
                <th className="num">Esp.</th>
              </tr>
            </thead>
            <tbody>
              {piezas.map((p, i) => (
                <tr key={i} className={`pieza-fila pieza-tipo-${p.tipo}`}>
                  <td className="codigo">{p.codigo}</td>
                  <td>{p.nombre}</td>
                  <td><span className="pieza-badge">{TIPO_LABEL[p.tipo] || p.tipo}</span></td>
                  <td className="num">{p.ancho_nominal.toFixed(1)}</td>
                  <td className="num">{p.alto_nominal.toFixed(1)}</td>
                  <td className="num corte">{p.ancho_corte.toFixed(1)}</td>
                  <td className="num corte">{p.alto_corte.toFixed(1)}</td>
                  <td className="num">{p.espesor.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="piezas-total">{piezas.length} pieza{piezas.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {piezas.length === 0 && !calculando && (
        <p className="piezas-vacio">Presioná "Previsualizar piezas" para calcular.</p>
      )}
    </div>
  );
}

export default SeccionPiezas;
