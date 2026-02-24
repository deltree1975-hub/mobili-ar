// ============================================================
// MOBILI-AR — Gestión de Usuarios
// Archivo  : src/screens/Gestion/sections/GestionUsuarios.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { TarjetaUsuario } from '../../../components/TarjetaUsuario';

function GestionUsuarios({ sesion }) {
  const [usuarios, setUsuarios]   = useState([]);
  const [cargando, setCargando]   = useState(true);
  const [error, setError]         = useState('');
  const [usuarioTarjeta, setUsuarioTarjeta] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    try {
      const data = await invoke('get_usuarios');
      setUsuarios(data);
    } catch (e) {
      setError('Error al cargar usuarios: ' + e);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <p style={{ color: '#888' }}>Cargando...</p>;
  if (error)    return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div className="gestion-seccion-header">
        <h2 className="gestion-seccion-titulo">Usuarios</h2>
        {/* TODO F2-05: botón crear usuario */}
      </div>

      {usuarios.length === 0 ? (
        <div className="gestion-vacio">
          <p>No hay usuarios registrados</p>
        </div>
      ) : (
        <table className="gestion-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Token</th>
              <th>Activo</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td><strong>{u.nombre} {u.apellido}</strong></td>
                <td>
                  <span className={`badge-rol badge-rol--${u.rol}`}>
                    {u.rol}
                  </span>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.token}</td>
                <td>
                  <span className={`badge-activo badge-activo--${u.activo ? 'si' : 'no'}`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={{ color: '#888', fontSize: 13 }}>
                  {u.ultimo_acceso || '—'}
                </td>
                <td>
                  <button
                    className="gestion-btn-accion"
                    onClick={() => setUsuarioTarjeta(u)}
                  >
                    🖨 Imprimir tarjeta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {usuarioTarjeta && (
        <TarjetaUsuario
          usuario={usuarioTarjeta}
          onCerrar={() => setUsuarioTarjeta(null)}
        />
      )}
    </div>
  );
}

export default GestionUsuarios;
