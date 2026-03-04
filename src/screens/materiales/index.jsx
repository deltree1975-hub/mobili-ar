// ============================================================
// MOBILI-AR — Gestión de materiales (placas en stock)
// Archivo  : src/screens/Materiales/index.jsx
// Módulo   : F3-01
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './Materiales.css';

const TIPOS = ['Melamina', 'MDF', 'Multilaminado', 'HDF', 'Madera', 'Otro'];
const FILTROS = ['Todos', ...TIPOS];

const ESPESORES_COMUNES = [3, 9, 15, 18, 25, 30];

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
          <label>Cantidad (placas)</label>
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

function Materiales({ onVolver }) {
  const [materiales, setMateriales] = useState([]);
  const [filtro,     setFiltro]     = useState('Todos');
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState('');
  const [formNuevo,  setFormNuevo]  = useState(false);
  const [editando,   setEditando]   = useState(null);

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

  async function handleAjustar(id, delta) {
    try {
      const nueva = await invoke('ajustar_cantidad_material', { id, delta });
      setMateriales(prev => prev.map(m => m.id === id ? { ...m, cantidad: nueva } : m));
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  async function handleDesactivar(id) {
    if (!confirm('¿Eliminar este material del stock?')) return;
    try {
      await invoke('desactivar_material', { id });
      await cargar();
    } catch (err) {
      alert(`Error: ${err}`);
    }
  }

  const filtrados = filtro === 'Todos'
    ? materiales
    : materiales.filter(m => m.tipo === filtro);

  return (
    <div className="libreria">

      <header className="libreria-header">
        <button className="btn-volver" onClick={onVolver}>← Volver</button>
        <h1>Materiales</h1>
        <button className="btn-primario" onClick={() => setFormNuevo(true)}>
          + Nuevo material
        </button>
      </header>

      <div className="libreria-filtros">
        {FILTROS.map(f => (
          <button key={f}
            className={`filtro-btn ${filtro === f ? 'activo' : ''}`}
            onClick={() => setFiltro(f)}>
            {f}
          </button>
        ))}
      </div>

      <main className="libreria-main">
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

        <div className="libreria-grid">
          {filtrados.map(m => (
            <div key={m.id} className={`libreria-card mat-card ${m.cantidad === 0 ? 'mat-card--vacio' : ''}`}>
              <div className="libreria-card-tipo">{m.tipo}</div>
              <div className="libreria-card-nombre">{m.color}</div>
              <div className="libreria-card-dims">
                {m.largo} × {m.ancho} × {m.espesor}mm
              </div>

              <div className="mat-stock">
                <button className="mat-stock-btn" onClick={() => handleAjustar(m.id, -1)}
                  disabled={m.cantidad === 0}>−</button>
                <span className={`mat-stock-num ${m.cantidad === 0 ? 'mat-stock--agotado' : ''}`}>
                  {m.cantidad} {m.cantidad === 1 ? 'placa' : 'placas'}
                </span>
                <button className="mat-stock-btn" onClick={() => handleAjustar(m.id, 1)}>+</button>
              </div>

              <div className="mat-card-acciones">
                <button className="libreria-card-btn"
                  onClick={() => setEditando(m)}>
                  ✎ Editar
                </button>
                <button className="mat-btn-eliminar"
                  onClick={() => handleDesactivar(m.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

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
    </div>
  );
}

export default Materiales;