// ============================================================
// MOBILI-AR — Librería de módulos estándar
// Archivo  : src/screens/Libreria/index.jsx
// Módulo   : F1-09 — Librería de módulos
// Depende  : src/db/index.js → getLibreria, crearModulo
// Expone   : <Libreria composicionId={} onVolver={fn} onModuloCreado={fn} />
// Creado   : [fecha]
// ============================================================

import { useState, useEffect } from 'react';
import { getLibreria, crearModulo } from '../../db/index';
import './Libreria.css';

const DISPOSICIONES = {
  bm: 'Bajomesa', al: 'Aéreo', to: 'Torre',
  ca: 'Cajón', ab: 'Abierto', me: 'Mesa',
  es: 'Estante', co: 'Columna',
};

const FILTROS = ['Todos', 'bm', 'al', 'to', 'ca', 'ab', 'me', 'es', 'co'];

/**
 * Librería de módulos estándar predefinidos.
 * Permite elegir un template y crear un módulo en la composición activa.
 *
 * @param {{
 *   composicionId: string,
 *   onVolver: () => void,
 *   onModuloCreado: (modulo: Object) => void
 * }} props
 */
function Libreria({ composicionId, onVolver, onModuloCreado }) {
  const [modulos, setModulos]   = useState([]);
  const [filtro, setFiltro]     = useState('Todos');
  const [cargando, setCargando] = useState(true);
  const [creando, setCreando]   = useState(null); // id del módulo que se está creando

  useEffect(() => {
    cargarLibreria();
  }, []);

  async function cargarLibreria() {
    setCargando(true);
    try {
      const data = await getLibreria();
      setModulos(data);
    } finally {
      setCargando(false);
    }
  }

  async function handleUsarTemplate(template) {
    
    setCreando(template.id);
    try {
      const config = JSON.parse(template.config_json);
      const nuevo = await crearModulo({
        composicion_id:      composicionId,
        nombre:              template.nombre,
        disposicion:         template.disposicion,
        ancho:               config.ancho              ?? 600,
        alto:                config.alto               ?? 720,
        profundidad:         config.profundidad        ?? 560,
        espesor_tablero:     config.espesor_tablero    ?? 18,
        espesor_fondo:       config.espesor_fondo      ?? 3,
        tipo_union:          config.tipo_union         ?? 'cam_locks',
        costados_por_fuera: config.costados_por_fuera === 1 || config.costados_por_fuera === true,
        fondo_embutido:     config.fondo_embutido     === 1 || config.fondo_embutido     === true,
        tapa_apoyada:       config.tapa_apoyada       === 1 || config.tapa_apoyada       === true,
        cant_estantes:       config.cant_estantes      ?? 0,
        cant_puertas:        config.cant_puertas       ?? 0,
        overlap_puertas:     config.overlap_puertas    ?? 2,
        inset_estantes:      config.inset_estantes     ?? 5,
        offset_tirador:      config.offset_tirador     ?? 35,
        tipo_canto:          config.tipo_canto         ?? 'pvc',
        espesor_canto:       config.espesor_canto      ?? 0.4,
        canto_sup:           config.canto_sup          ?? true,
        canto_inf:           config.canto_inf          ?? true,
        canto_izq:           config.canto_izq          ?? true,
        canto_der:           config.canto_der          ?? true,
        apertura_puerta:     config.apertura_puerta    ?? 'derecha',
      });
      onModuloCreado(nuevo);
    } catch (err) {
      alert(`Error al crear módulo: ${err}`);
    } finally {
      setCreando(null);
    }
  }

  const modulosFiltrados = filtro === 'Todos'
    ? modulos
    : modulos.filter(m => m.disposicion === filtro);

 if (!composicionId) {
  return (
    <div className="libreria">
      <header className="libreria-header">
        <button className="btn-volver" onClick={onVolver}>← Volver</button>
        <h1>Librería de módulos</h1>
      </header>
      <div className="libreria-vacio" style={{ marginTop: 60 }}>
        <p>⚠️ Para usar un módulo de la librería</p>
        <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
          Hacé clic en "Librería" desde el panel de una composición específica.
        </p>
        <button className="btn-secundario" style={{ marginTop: 20 }} onClick={onVolver}>
          Volver al proyecto
        </button>
      </div>
    </div>
  );
}   

  return (
    <div className="libreria">

      <header className="libreria-header">
        <button className="btn-volver" onClick={onVolver}>← Volver</button>
        <h1>Librería de módulos</h1>
      </header>

      {/* FILTROS */}
      <div className="libreria-filtros">
        {FILTROS.map(f => (
          <button
            key={f}
            className={`filtro-btn ${filtro === f ? 'activo' : ''}`}
            onClick={() => setFiltro(f)}
          >
            {f === 'Todos' ? 'Todos' : DISPOSICIONES[f] || f}
          </button>
        ))}
      </div>

      {/* GRID */}
      <main className="libreria-main">
        {cargando && <div className="libreria-cargando">Cargando librería...</div>}

        {!cargando && modulosFiltrados.length === 0 && (
          <div className="libreria-vacio">
            <p>No hay módulos en esta categoría.</p>
            <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
              Los módulos de la librería se cargan desde el schema inicial.
            </p>
          </div>
        )}

        <div className="libreria-grid">
          {modulosFiltrados.map(m => {
            const config = (() => {
              try { return JSON.parse(m.config_json); } catch { return {}; }
            })();

            return (
              <div key={m.id} className="libreria-card">
                <div className="libreria-card-tipo">
                  {DISPOSICIONES[m.disposicion] || m.disposicion}
                </div>
                <div className="libreria-card-codigo">{m.codigo}</div>
                <div className="libreria-card-nombre">{m.nombre}</div>
                {m.descripcion && (
                  <div className="libreria-card-desc">{m.descripcion}</div>
                )}
                {config.ancho && (
                  <div className="libreria-card-dims">
                    {config.ancho} × {config.alto} × {config.profundidad} mm
                  </div>
                )}
                <button
                  className="libreria-card-btn"
                  onClick={() => handleUsarTemplate(m)}
                  disabled={creando === m.id}
                >
                  {creando === m.id ? 'Creando...' : '+ Usar este módulo'}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Libreria;
