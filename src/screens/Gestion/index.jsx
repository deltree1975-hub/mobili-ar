// ============================================================
// MOBILI-AR — Panel de Gestión
// Archivo  : src/screens/Gestion/index.jsx
// Módulo   : F2-04 — Panel de administración
// Acceso   : admin y dueño únicamente
// ============================================================

import { useState } from 'react';
import GestionUsuarios from './sections/GestionUsuarios';
import GestionMansiones from './sections/GestionMansiones';
import GestionLibreria  from './sections/GestionLibreria';
import './Gestion.css';

const SECCIONES = [
  { id: 'usuarios',  label: 'Usuarios',  icono: '👤' },
  { id: 'mansiones', label: 'Mansiones', icono: '🏭' },
  { id: 'libreria',  label: 'Librería',  icono: '📚' },
];

function Gestion({ sesion, onVolver, onIrAlTaller }) {
  const [seccion, setSeccion] = useState('usuarios');

  return (
    <div className="gestion">

      {/* SIDEBAR */}
      <aside className="gestion-sidebar">
        <div className="gestion-sidebar-header">
          <div className="gestion-logo">M</div>
          <div>
            <p className="gestion-titulo">Gestión</p>
            <p className="gestion-usuario">
              {sesion?.usuario?.nombre} {sesion?.usuario?.apellido}
            </p>
          </div>
        </div>

        <nav className="gestion-nav">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              className={`gestion-nav-btn ${seccion === s.id ? 'activo' : ''}`}
              onClick={() => setSeccion(s.id)}
            >
              <span>{s.icono}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="gestion-sidebar-footer">
          <button className="gestion-footer-btn" onClick={onIrAlTaller}>
            🏭 Ir al taller
          </button>
          <button className="gestion-footer-btn gestion-footer-btn--salir" onClick={onVolver}>
            ← Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="gestion-main">
        {seccion === 'usuarios'  && <GestionUsuarios sesion={sesion} />}
        {seccion === 'mansiones' && <GestionMansiones />}
        {seccion === 'libreria'  && <GestionLibreria />}
      </main>

    </div>
  );
}

export default Gestion;
