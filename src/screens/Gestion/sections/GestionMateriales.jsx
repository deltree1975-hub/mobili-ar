// ============================================================
// MOBILI-AR — Sección Materiales dentro de Gestión
// Archivo  : src/screens/Gestion/sections/GestionMateriales.jsx
// Módulo   : F3-01
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import '../../Materiales/Materiales.css';

const TIPOS = ['Melamina', 'MDF', 'Multilaminado', 'HDF', 'Madera', 'Otro'];
const FILTROS = ['Todos', ...TIPOS];
const ESPESORES_COMUNES = [3, 9, 15, 18, 25, 30];

// ── Formulario nuevo/editar material ─────────────────────────
function FormMaterial({ inicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState(inicial || {
    tipo: 'Melamina', color: '', largo: 2750, ancho: 1830, espesor: 18, cantidad: 0,
  });

  function set(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  function handleGuardar() {
    if (!form.tipo.trim()) return alert('Ingresá el tipo');
    if (!form.color.trim()) return alert('Ingresá el color');
    if (form.espesor <= 0) return alert('El espesor debe ser mayor a 0');
    onGuardar(form);
  }

  return (
    <div className="mat-form-overlay">
      <div className="mat-form">
        <h3>{inicial ? 'Editar material' : 'Nuevo material'}</h3>

        <div className="mat-form-fila">
          <label>Tipo</label>
          <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="mat-form-fila">
          <label>Color</label>
          <input type="text" value={form.color}
            placeholder="Ej: Blanco Polar"
            onChange={e => set('color', e.target.value)} />
        </div>

        <div className="mat-form-fila">
          <label>Espesor (mm)</label>
          <div className="mat-espesor-btns">
            {ESPESORES_COMUNES.map(e => (
              <button key={e}
                className={`mat-esp-btn ${form.espesor === e ? 'activo' : ''}`}
                onClick={() => set('espesor', e)}>
                {e}
              </button>
            ))}
            <input type="number" value={form.espesor} min="1" max="100"
              className="mat-esp-input"
              onChange={e => set('espesor', parseFloat(e.target.value) || 18)} />
          </div>
        </div>

        <div className="mat-form-fila">
          <label>Largo (mm)</label>
          <input type="number" value={form.largo} min="100"
            onChange={e => set('largo', parseFloat(e.target.value) || 2750)} />
        </div>

        <div className="mat-form-fila">
          <label>Ancho (mm)</label>
          <input type="number" value={form.ancho} min="100"
            onChange={e => set('ancho', parseFloat(e.target.value) || 1830)} />
        </div>

        <div className="mat-form-fila">
          <label>Cantidad inicial (placas)</label>
          <input type="number" value={form.cantidad} min="0"
            onChange={e => set('cantidad', parseInt(e.target.value) || 0)} />
        </div>

        <div className="mat-form-acciones">
          <button className="btn-secundario" onClick={onCancelar}>Cancelar</button>
          <button className="btn-primario" onClick={handleGuardar}>
            {inicial ? 'Guardar cambios' : '+ Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Formulario ingreso por remito ─────────────────────────────
function FormIngreso({ material, onGuardar, onCancelar }) {
  const [cantidad,   setCantidad]   = useState(1);
  const [nroRemito,  setNroRemito]  = useState('');

  function handleGuardar() {
    if (cantidad <= 0) return alert('La cantidad debe ser mayor a 0');
    onGuardar(cantidad, nroRemito);
  }

  return (
    <div className="mat-form-overlay">
      <div className="mat-form">
        <h3>Ingreso de stock</h3>
        <p className="mat-ingreso-desc">
          {material.tipo} — {material.color} — {material.espesor}mm
        </p>
        <p className="mat-ingreso-actual">
          Stock actual: <strong>{material.cantidad} placas</strong>
        </p>

        <div className="mat-form-fila">
          <label>Cantidad a ingresar</label>
          <input type="number" value={cantidad} min="1" autoFocus
            onChange={e => setCantidad(parseInt(e.target.value) || 1)} />
        </div>

        <div className="mat-form-fila">
          <label>Nº Remito <span style={{fontWeight:400, color:'#aaa'}}>(opcional)</span></label>
          <input type="text" value={nroRemito}
            placeholder="Ej: R-0001"
            onChange={e => setNroRemito(e.target.value)} />
        </div>

        <div className="mat-form-acciones">
          <button className="btn-secundario" onClick={onCancelar}>Cancelar</button>
          <button className="btn-primario" onClick={handleGuardar}>
            Confirmar ingreso
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirmación inline de eliminación ───────────────────────
function ConfirmEliminar({ onConfirmar, onCancelar }) {
  return (
    <div className="mat-confirm">
      <span>¿Eliminar?</span>
      <button className="mat-confirm-si" onClick={onConfirmar}>Sí</button>
      <button className="mat-confirm-no" onClick={onCancelar}>No</button>
    </div>
  );
}

// ── Vista lista ───────────────────────────────────────────────
function VistaLista({ filtrados, confirmando, onIngreso, onEditar, onPedirConfirm, onConfirmar, onCancelarConfirm }) {
  return (
    <table className="mat-tabla">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Color</th>
          <th className="num">Largo</th>
          <th className="num">Ancho</th>
          <th className="num">Esp.</th>
          <th className="num">Stock</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {filtrados.map(m => (
          <tr key={m.id} className={m.cantidad === 0 ? 'mat-fila--vacio' : ''}>
            <td><span className="libreria-card-tipo mat-badge">{m.tipo}</span></td>
            <td>{m.color}</td>
            <td className="num">{m.largo}</td>
            <td className="num">{m.ancho}</td>
            <td className="num">{m.espesor}mm</td>
            <td className="num">
              <span className={`mat-stock-num ${m.cantidad === 0 ? 'mat-stock--agotado' : ''}`}>
                {m.cantidad} {m.cantidad === 1 ? 'placa' : 'placas'}
              </span>
            </td>
            <td>
              {confirmando === m.id
                ? <ConfirmEliminar
                    onConfirmar={() => onConfirmar(m.id)}
                    onCancelar={onCancelarConfirm} />
                : <div className="mat-card-acciones mat-acciones--inline">
                    <button className="mat-btn-ingreso" onClick={() => onIngreso(m)}>+ Ingreso</button>
                    <button className="libreria-card-btn" onClick={() => onEditar(m)}>✎</button>
                    <button className="mat-btn-eliminar" onClick={() => onPedirConfirm(m.id)}>✕</button>
                  </div>
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Vista grid ────────────────────────────────────────────────
function VistaGrid({ filtrados, confirmando, onIngreso, onEditar, onPedirConfirm, onConfirmar, onCancelarConfirm }) {
  return (
    <div className="libreria-grid">
      {filtrados.map(m => (
        <div key={m.id} className={`libreria-card mat-card ${m.cantidad === 0 ? 'mat-card--vacio' : ''}`}>
          <div className="libreria-card-tipo">{m.tipo}</div>
          <div className="libreria-card-nombre">{m.color}</div>
          <div className="libreria-card-dims">
            {m.largo} × {m.ancho} × {m.espesor}mm
          </div>

          <div className="mat-stock-display">
            <span className={`mat-stock-num ${m.cantidad === 0 ? 'mat-stock--agotado' : ''}`}>
              {m.cantidad} {m.cantidad === 1 ? 'placa' : 'placas'}
            </span>
            <button className="mat-btn-ingreso" onClick={() => onIngreso(m)}>+ Ingreso</button>
          </div>

          <div className="mat-card-acciones">
            {confirmando === m.id
              ? <ConfirmEliminar
                  onConfirmar={() => onConfirmar(m.id)}
                  onCancelar={onCancelarConfirm} />
              : <>
                  <button className="libreria-card-btn" onClick={() => onEditar(m)}>✎ Editar</button>
                  <button className="mat-btn-eliminar" onClick={() => onPedirConfirm(m.id)}>✕</button>
                </>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
function GestionMateriales() {
  const [materiales,  setMateriales]  = useState([]);
  const [filtro,      setFiltro]      = useState('Todos');
  const [vistaGrid,   setVistaGrid]   = useState(true);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState('');
  const [formNuevo,   setFormNuevo]   = useState(false);
  const [editando,    setEditando]    = useState(null);
  const [ingresando,  setIngresando]  = useState(null); // material activo para ingreso
  const [confirmando, setConfirmando] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const data = await invoke('get_materiales');
      setMateriales(data);
    } catch (err) {
      setError(`Error al cargar materiales: ${err}`);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(form) {
    try {
      await invoke('crear_material', { datos: form });
      setFormNuevo(false);
      await cargar();
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  async function handleActualizar(form) {
    try {
      await invoke('actualizar_material', { id: editando.id, datos: form });
      setEditando(null);
      await cargar();
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  async function handleIngreso(cantidad) {
    try {
      await invoke('ajustar_cantidad_material', { id: ingresando.id, delta: cantidad });
      setIngresando(null);
      await cargar();
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  async function handleConfirmarEliminar(id) {
    try {
      await invoke('desactivar_material', { id });
      setConfirmando(null);
      await cargar();
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  const filtrados = filtro === 'Todos'
    ? materiales
    : materiales.filter(m => m.tipo === filtro);

  const vistaProps = {
    filtrados,
    confirmando,
    onIngreso:         setIngresando,
    onEditar:          setEditando,
    onPedirConfirm:    setConfirmando,
    onConfirmar:       handleConfirmarEliminar,
    onCancelarConfirm: () => setConfirmando(null),
  };

  return (
    <div className="gestion-seccion">

      <div className="gestion-seccion-header">
        <h2>Materiales en stock</h2>
        <div className="mat-header-acciones">
          <div className="mat-vista-toggle">
            <button className={`mat-vista-btn ${vistaGrid ? 'activo' : ''}`}
              onClick={() => setVistaGrid(true)} title="Vista grid">⊞</button>
            <button className={`mat-vista-btn ${!vistaGrid ? 'activo' : ''}`}
              onClick={() => setVistaGrid(false)} title="Vista lista">≡</button>
          </div>
          <button className="btn-primario" onClick={() => setFormNuevo(true)}>
            + Nuevo material
          </button>
        </div>
      </div>

      <div className="libreria-filtros">
        {FILTROS.map(f => (
          <button key={f}
            className={`filtro-btn ${filtro === f ? 'activo' : ''}`}
            onClick={() => setFiltro(f)}>
            {f}
          </button>
        ))}
      </div>

      {cargando && <div className="libreria-cargando">Cargando materiales...</div>}
      {error    && <div className="libreria-vacio">{error}</div>}

      {!cargando && !error && filtrados.length === 0 && (
        <div className="libreria-vacio">
          <p>No hay materiales en esta categoría.</p>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
            Agregá placas con el botón "Nuevo material".
          </p>
        </div>
      )}

      {!cargando && !error && filtrados.length > 0 && (
        vistaGrid
          ? <VistaGrid {...vistaProps} />
          : <VistaLista {...vistaProps} />
      )}

      {formNuevo && (
        <FormMaterial
          onGuardar={handleCrear}
          onCancelar={() => setFormNuevo(false)} />
      )}

      {editando && (
        <FormMaterial
          inicial={editando}
          onGuardar={handleActualizar}
          onCancelar={() => setEditando(null)} />
      )}

      {ingresando && (
        <FormIngreso
          material={ingresando}
          onGuardar={handleIngreso}
          onCancelar={() => setIngresando(null)} />
      )}
    </div>
  );
}

export default GestionMateriales;