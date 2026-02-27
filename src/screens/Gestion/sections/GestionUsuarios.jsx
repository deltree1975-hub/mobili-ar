// ============================================================
// MOBILI-AR — Gestión de Usuarios
// Archivo  : src/screens/Gestion/sections/GestionUsuarios.jsx
// Módulo   : F2-05 — Formulario crear usuario + asignar mansiones
// ============================================================

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { TarjetaUsuario } from '../../../components/TarjetaUsuario';

const ROLES = ['operario', 'disenador', 'admin', 'dueno'];

const ROL_LABEL = {
  operario:  'Operario',
  disenador: 'Diseñador',
  admin:     'Admin',
  dueno:     'Dueño',
};

// Admin y dueño ven todas las mansiones por lógica de backend —
// no tiene sentido forzar una asignación manual.
const ROL_NECESITA_MANSIONES = (rol) => rol === 'operario' || rol === 'disenador';

const FORM_VACIO = {
  nombre:    '',
  apellido:  '',
  rol:       'operario',
  mansiones: [], // array de strings (IDs)
};

function GestionUsuarios({ sesion }) {
  const [usuarios,       setUsuarios]       = useState([]);
  const [mansiones,      setMansiones]      = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [error,          setError]          = useState('');

  // Form
  const [mostrarForm,    setMostrarForm]    = useState(false);
  const [form,           setForm]           = useState(FORM_VACIO);
  const [guardando,      setGuardando]      = useState(false);
  const [errorForm,      setErrorForm]      = useState('');
  const [usuarioCreado,  setUsuarioCreado]  = useState(null); // resultado del último create

  // Tarjeta de impresión
  const [usuarioTarjeta, setUsuarioTarjeta] = useState(null);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [data, mans] = await Promise.all([
        invoke('get_usuarios'),
        invoke('get_mansiones'),
      ]);
      setUsuarios(data);
      setMansiones(mans);
    } catch (e) {
      setError('Error al cargar datos: ' + e);
    } finally {
      setCargando(false);
    }
  }

  // ── Handlers de form ──────────────────────────────────────

  function abrirForm() {
    setForm(FORM_VACIO);
    setErrorForm('');
    setUsuarioCreado(null);
    setMostrarForm(true);
  }

  function cerrarForm() {
    setMostrarForm(false);
    setErrorForm('');
  }

  function setField(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }));
  }

  function toggleMansion(idStr) {
    setForm(f => ({
      ...f,
      mansiones: f.mansiones.includes(idStr)
        ? f.mansiones.filter(m => m !== idStr)
        : [...f.mansiones, idStr],
    }));
  }

  function seleccionarTodas() {
    setForm(f => ({ ...f, mansiones: mansiones.map(m => String(m.id)) }));
  }

  function limpiarTodas() {
    setForm(f => ({ ...f, mansiones: [] }));
  }

  async function handleCrear(e) {
    e.preventDefault();
    setErrorForm('');

    // Validaciones
    if (!form.nombre.trim())   return setErrorForm('El nombre es obligatorio.');
    if (!form.apellido.trim()) return setErrorForm('El apellido es obligatorio.');
    if (ROL_NECESITA_MANSIONES(form.rol) && form.mansiones.length === 0)
      return setErrorForm('Asigná al menos una mansión para este rol.');

    setGuardando(true);
    try {
      const nuevo = await invoke('crear_usuario_completo', {
        input: {
          nombre:    form.nombre.trim(),
          apellido:  form.apellido.trim(),
          rol:       form.rol,
          mansiones: ROL_NECESITA_MANSIONES(form.rol) ? form.mansiones : [],
        },
      });

      setUsuarioCreado(nuevo);
      setMostrarForm(false);
      await cargar();
    } catch (e) {
      setErrorForm('Error al crear usuario: ' + e);
    } finally {
      setGuardando(false);
    }
  }

  // ── Render ────────────────────────────────────────────────

  if (cargando) return <p style={{ color: '#888' }}>Cargando...</p>;
  if (error)    return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="gu-root">

      {/* HEADER */}
      <div className="gestion-seccion-header">
        <h2 className="gestion-seccion-titulo">Usuarios</h2>
        {!mostrarForm && (
          <button className="gu-btn-nuevo" onClick={abrirForm}>
            + Nuevo usuario
          </button>
        )}
      </div>

      {/* BANNER USUARIO CREADO */}
      {usuarioCreado && !mostrarForm && (
        <div className="gu-banner-exito">
          <div className="gu-banner-exito__texto">
            <span className="gu-banner-exito__icono">✓</span>
            <strong>{usuarioCreado.nombre} {usuarioCreado.apellido}</strong>
            &nbsp;creado correctamente.
          </div>
          <div className="gu-banner-exito__token">
            Token:&nbsp;<code>{usuarioCreado.token}</code>
            <button
              className="gu-btn-imprimir-inline"
              title="Imprimir tarjeta"
              onClick={() => setUsuarioTarjeta(usuarioCreado)}
            >
              🖨 Imprimir tarjeta
            </button>
          </div>
          <button
            className="gu-banner-exito__cerrar"
            onClick={() => setUsuarioCreado(null)}
            title="Cerrar"
          >✕</button>
        </div>
      )}

      {/* FORMULARIO CREAR USUARIO */}
      {mostrarForm && (
        <form className="gu-form" onSubmit={handleCrear} noValidate>

          <div className="gu-form__header">
            <h3 className="gu-form__titulo">Nuevo usuario</h3>
            <button
              type="button"
              className="gu-btn-cancelar"
              onClick={cerrarForm}
              disabled={guardando}
            >
              Cancelar
            </button>
          </div>

          {/* Nombre + Apellido */}
          <div className="gu-form__fila-2">
            <div className="gu-form__campo">
              <label className="gu-label" htmlFor="gu-nombre">Nombre</label>
              <input
                id="gu-nombre"
                className="gu-input"
                value={form.nombre}
                onChange={e => setField('nombre', e.target.value)}
                placeholder="Ej: Juan"
                autoFocus
                disabled={guardando}
              />
            </div>
            <div className="gu-form__campo">
              <label className="gu-label" htmlFor="gu-apellido">Apellido</label>
              <input
                id="gu-apellido"
                className="gu-input"
                value={form.apellido}
                onChange={e => setField('apellido', e.target.value)}
                placeholder="Ej: Pérez"
                disabled={guardando}
              />
            </div>
          </div>

          {/* Rol */}
          <div className="gu-form__campo">
            <label className="gu-label">Rol</label>
            <div className="gu-rol-group">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  className={`gu-rol-btn gu-rol-btn--${r} ${form.rol === r ? 'activo' : ''}`}
                  onClick={() => setField('rol', r)}
                  disabled={guardando}
                >
                  {ROL_LABEL[r]}
                </button>
              ))}
            </div>
          </div>

          {/* Mansiones — solo para operario y diseñador */}
          {ROL_NECESITA_MANSIONES(form.rol) && (
            <div className="gu-form__campo">
              <div className="gu-mansiones-header">
                <label className="gu-label">
                  Mansiones asignadas
                  <span className="gu-label-hint">
                    ({form.mansiones.length} de {mansiones.length})
                  </span>
                </label>
                <div className="gu-mansiones-acciones">
                  <button type="button" className="gu-link" onClick={seleccionarTodas} disabled={guardando}>
                    Todas
                  </button>
                  <span className="gu-sep">·</span>
                  <button type="button" className="gu-link" onClick={limpiarTodas} disabled={guardando}>
                    Ninguna
                  </button>
                </div>
              </div>
              <div className="gu-mansiones-grid">
                {mansiones.map(m => {
                  const idStr   = String(m.id);
                  const activa  = form.mansiones.includes(idStr);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`gu-mansion-chip ${activa ? 'activa' : ''}`}
                      onClick={() => toggleMansion(idStr)}
                      disabled={guardando}
                    >
                      <span className="gu-mansion-chip__check">{activa ? '✓' : ''}</span>
                      <span className="gu-mansion-chip__codigo">{m.codigo}</span>
                      <span className="gu-mansion-chip__nombre">{m.nombre}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nota para admin/dueño */}
          {!ROL_NECESITA_MANSIONES(form.rol) && (
            <p className="gu-nota-rol">
              ℹ️ {ROL_LABEL[form.rol]} tiene acceso a todas las mansiones automáticamente.
            </p>
          )}

          {/* Error de validación */}
          {errorForm && (
            <p className="gu-error-form">{errorForm}</p>
          )}

          {/* Acciones */}
          <div className="gu-form__acciones">
            <button
              type="submit"
              className="gu-btn-guardar"
              disabled={guardando}
            >
              {guardando ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>

        </form>
      )}

      {/* TABLA DE USUARIOS */}
      {usuarios.length === 0 && !mostrarForm ? (
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
              <tr key={u.id} className={!u.activo ? 'gu-fila-inactiva' : ''}>
                <td><strong>{u.nombre} {u.apellido}</strong></td>
                <td>
                  <span className={`badge-rol badge-rol--${u.rol}`}>
                    {ROL_LABEL[u.rol] ?? u.rol}
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

      {/* MODAL TARJETA */}
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