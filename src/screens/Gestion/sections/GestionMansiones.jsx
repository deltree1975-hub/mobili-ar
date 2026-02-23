// ============================================================
// MOBILI-AR — Gestión de Mansiones
// Archivo  : src/screens/Gestion/sections/GestionMansiones.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const ICONOS = {
  CORTE:    '🪚',
  FILOS:    '📐',
  CNC:      '🤖',
  ARMADO:   '🔧',
  PANOLERO: '📦',
  LIMPIEZA: '🧹',
  CONTROL:  '✅',
};

function GestionMansiones() {
  const [mansiones, setMansiones] = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const data = await invoke('get_mansiones');
      setMansiones(data);
    } catch (e) {
      setError('Error al cargar mansiones: ' + e);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <p style={{ color: '#888' }}>Cargando...</p>;
  if (error)    return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div className="gestion-seccion-header">
        <h2 className="gestion-seccion-titulo">Mansiones</h2>
      </div>

      <table className="gestion-tabla">
        <thead>
          <tr>
            <th>Estación</th>
            <th>Código</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {mansiones.map(m => (
            <tr key={m.id}>
              <td>
                <span style={{ marginRight: 10 }}>{ICONOS[m.codigo] || '🏭'}</span>
                <strong>{m.nombre}</strong>
              </td>
              <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#888' }}>
                {m.codigo}
              </td>
              <td>
                <span className={`badge-activo badge-activo--${m.activo ? 'si' : 'no'}`}>
                  {m.activo ? 'Activa' : 'Inactiva'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionMansiones;
