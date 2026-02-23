// ============================================================
// MOBILI-AR — Gestión de Librería
// Archivo  : src/screens/Gestion/sections/GestionLibreria.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

const DISPOSICION_LABELS = {
  bm: 'Bajo Mesada',
  al: 'Aéreo',
  to: 'Torre',
  ca: 'Cajonero',
  es: 'Estante',
  ab: 'Abierto',
  co: 'Columna',
  me: 'Mesa',
};

function GestionLibreria() {
  const [modulos, setModulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const data = await invoke('get_libreria_modulos');
      setModulos(data);
    } catch (e) {
      setError('Error al cargar librería: ' + e);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <p style={{ color: '#888' }}>Cargando...</p>;
  if (error)    return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div className="gestion-seccion-header">
        <h2 className="gestion-seccion-titulo">Librería de módulos</h2>
      </div>

      {modulos.length === 0 ? (
        <div className="gestion-vacio">
          <p>No hay módulos en la librería</p>
        </div>
      ) : (
        <table className="gestion-tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {modulos.map(m => (
              <tr key={m.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{m.codigo}</td>
                <td><strong>{m.nombre}</strong></td>
                <td style={{ color: '#888', fontSize: 13 }}>
                  {DISPOSICION_LABELS[m.disposicion] || m.disposicion}
                </td>
                <td>
                  <span className={`badge-activo badge-activo--${m.activo ? 'si' : 'no'}`}>
                    {m.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default GestionLibreria;
