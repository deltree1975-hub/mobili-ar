// ============================================================
// MOBILI-AR — Sección Cantos dentro de Gestión
// Archivo  : src/screens/Gestion/sections/GestionCantos.jsx
// Módulo   : F3-01
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import '../../Materiales/Materiales.css';

const MATERIALES_CANTO = ['pvc', 'abs', 'aluminio', 'madera', 'otro'];
const ESPESORES_COMUNES = [0.4, 0.8, 1, 2, 3];
const ALTOS_COMUNES = [19, 22, 42, 45];

// ── Formulario nuevo/editar canto ─────────────────────────────
function FormCanto({ inicial, onGuardar, onCancelar }) {
  const [form, setForm] = useState(inicial || {
    nombre: '', color: '', material: 'pvc',
    espesor: 1, alto_canto: 22, stock_metros: 0,
  });

  function set(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  function handleGuardar() {
    if (!form.nombre.trim()) return alert('Ingresá el nombre');
    if (!form.color.trim())  return alert('Ingresá el color');
    if (form.espesor <= 0)   return alert('El espesor debe ser mayor a 0');
    if (form.alto_canto <= 0) return alert('El alto debe ser mayor a 0');
    onGuardar(form);
  }

  return (
    <div className="mat-form-overlay">
      <div className="mat-form">
        <h3>{inicial ? 'Editar canto' : 'Nuevo canto'}</h3>

        <div className="mat-form-fila">
          <label>Nombre</label>
          <input type="text" value={form.nombre}
            placeholder="Ej: Blanco Polar PVC"
            onChange={e => set('nombre', e.target.value)} />
        </div>

        <div className="mat-form-fila">
          <label>Color</label>
          <input type="text" value={form.color}
            placeholder="Ej: Blanco Polar"
            onChange={e => set('color', e.target.value)} />
        </div>

        <div className="mat-form-fila">
          <label>Material</label>
          <select value={form.material} onChange={e => set('material', e.target.value)}>
            {MATERIALES_CANTO.map(m => (
              <option key={m} value={m}>{m.toUpperCase()}</option>
            ))}
          </select>
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
            <input type="number" value={form.espesor} min="0.1" max="10" step="0.1"
              className="mat-esp-input"
              onChange={e => set('espesor', parseFloat(e.target.value) || 1)} />
          </div>
        </div>

        <div className="mat-form-fila">
          <label>Alto (mm)</label>
          <div className="mat-espesor-btns">
            {ALTOS_COMUNES.map(a => (
              <button key={a}
                className={`mat-esp-btn ${form.alto_canto === a ? 'activo' : ''}`}
                onClick={() => set('alto_canto', a)}>
                {a}
              </button>
            ))}
            <input type="number" value={form.alto_canto} min="1" max="200"
              className="mat-esp-input"
              onChange={e => set('alto_canto', parseFloat(e.target.value) || 22)} />
          </div>
        </div>

        <div className="mat-form-fila">
          <label>Stock inicial (metros)</label>
          <input type="number" value={form.stock_metros} min="0" step="0.5"
            onChange={e => set('stock_metros', parseFloat(e.target.value) || 0)} />
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

// ── Confirmación inline ───────────────────────────────────────
function ConfirmEliminar({ onConfirmar, onCancelar }) {
  return (
    <div className="mat-confirm">
      <span>¿Eliminar?</span>
      <button className="mat-confirm-si" onClick={onConfirmar}>Sí</button>
      <button className="mat-confirm-no" onClick={onCancelar}>No</button>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
function GestionCantos() {
  const [cantos,      setCantos]      = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState('');
  const [formNuevo,   setFormNuevo]   = useState(false);
  const [editando,    setEditando]    = useState(null);
  const [confirmando, setConfirmando] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const data = await invoke('get_cantos');
      setCantos(data);
    } catch (err) {
      setError(`Error al cargar cantos: ${err}`);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(form) {
    try {
      await invoke('crear_canto', { datos: form });
      setFormNuevo(false);
      await cargar();
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  async function handleActualizar(form) {
    try {
      await invoke('actualizar_canto', { id: editando.id, datos: form });
      setEditando(null);
      await cargar();
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  async function handleEliminar(id) {
    try {
      await invoke('desactivar_canto', { id });
      setConfirmando(null);
      await cargar();
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  return (
    <div className="gestion-seccion">

      <div className="gestion-seccion-header">
        <h2>Cantos en stock</h2>
        <button className="btn-primario" onClick={() => setFormNuevo(true)}>
          + Nuevo canto
        </button>
      </div>

      {cargando && <div className="libreria-cargando">Cargando cantos...</div>}
      {error    && <div className="libreria-vacio">{error}</div>}

      {!cargando && !error && cantos.length === 0 && (
        <div className="libreria-vacio">
          <p>No hay cantos cargados.</p>
          <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>
            Agregá cantos con el botón "Nuevo canto".
          </p>
        </div>
      )}

      {!cargando && !error && cantos.length > 0 && (
        <table className="mat-tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Color</th>
              <th>Material</th>
              <th className="num">Esp.</th>
              <th className="num">Alto</th>
              <th className="num">Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cantos.map(c => (
              <tr key={c.id} className={c.stock_metros === 0 ? 'mat-fila--vacio' : ''}>
                <td>{c.nombre}</td>
                <td>{c.color}</td>
                <td><span className="libreria-card-tipo mat-badge">{c.material.toUpperCase()}</span></td>
                <td className="num">{c.espesor}mm</td>
                <td className="num">{c.alto_canto}mm</td>
                <td className="num">
                  <span className={`mat-stock-num ${c.stock_metros === 0 ? 'mat-stock--agotado' : ''}`}>
                    {c.stock_metros}m
                  </span>
                </td>
                <td>
                  {confirmando === c.id
                    ? <ConfirmEliminar
                        onConfirmar={() => handleEliminar(c.id)}
                        onCancelar={() => setConfirmando(null)} />
                    : <div className="mat-card-acciones mat-acciones--inline">
                        <button className="libreria-card-btn" onClick={() => setEditando(c)}>✎</button>
                        <button className="mat-btn-eliminar" onClick={() => setConfirmando(c.id)}>✕</button>
                      </div>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {formNuevo && (
        <FormCanto
          onGuardar={handleCrear}
          onCancelar={() => setFormNuevo(false)} />
      )}

      {editando && (
        <FormCanto
          inicial={editando}
          onGuardar={handleActualizar}
          onCancelar={() => setEditando(null)} />
      )}

    </div>
  );
}

export default GestionCantos;