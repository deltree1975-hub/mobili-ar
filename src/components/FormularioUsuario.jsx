// src/components/FormularioUsuario.jsx
// F2-05 — Formulario inline de creación de usuario
// Campos: nombre, apellido, rol, mansiones[]
// PIN queda para F2-07 (no está en el schema actual)

import { useState } from "react";
import { useMansiones } from "../hooks/useMansiones";
import "./FormularioUsuario.css";

const ROLES = [
  { value: "operario",  label: "Operario"  },
  { value: "disenador", label: "Diseñador" },
  { value: "admin",     label: "Admin"     },
  { value: "dueno",     label: "Dueño"     },
];

const FORM_VACIO = {
  nombre:    "",
  apellido:  "",
  rol:       "operario",
  mansiones: [], // IDs seleccionados
};

export function FormularioUsuario({ onCreado, onCancelar }) {
  const [form, setForm]           = useState(FORM_VACIO);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState(null);

  const { mansiones, loading: loadingMansiones } = useMansiones();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const toggleMansion = (id) => {
    setForm((prev) => {
      const yaEsta = prev.mansiones.includes(id);
      return {
        ...prev,
        mansiones: yaEsta
          ? prev.mansiones.filter((m) => m !== id)
          : [...prev.mansiones, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      // Estructura exacta de CrearUsuarioInput en types.rs
      const payload = {
        nombre:    form.nombre.trim(),
        apellido:  form.apellido.trim(),
        rol:       form.rol,
        mansiones: form.mansiones,
      };

      const usuario = await onCreado(payload);
      setForm(FORM_VACIO);
      return usuario;
    } catch (err) {
      setError(typeof err === "string" ? err : "Error al crear el usuario");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setForm(FORM_VACIO);
    setError(null);
    onCancelar?.();
  };

  return (
    <div className="fu-wrapper">
      <div className="fu-header">
        <span className="fu-titulo">Nuevo usuario</span>
        <span className="fu-subtitulo">
          El token se genera automáticamente · formato MOBILI-XXXX-XXXX
        </span>
      </div>

      <form className="fu-form" onSubmit={handleSubmit} noValidate>

        {/* Nombre + Apellido */}
        <div className="fu-row">
          <div className="fu-field fu-field--grow">
            <label className="fu-label" htmlFor="nombre">
              Nombre <span className="fu-required">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="fu-input"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Nombre o sobrenombre"
              autoComplete="off"
              autoFocus
              disabled={guardando}
            />
          </div>

          <div className="fu-field fu-field--grow">
            <label className="fu-label" htmlFor="apellido">
              Apellido <span className="fu-opcional">(opcional)</span>
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              className="fu-input"
              value={form.apellido}
              onChange={handleChange}
              placeholder="Apellido"
              autoComplete="off"
              disabled={guardando}
            />
          </div>
        </div>

        {/* Rol */}
        <div className="fu-field">
          <label className="fu-label">Rol</label>
          <div className="fu-chip-group">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`fu-chip ${form.rol === r.value ? "fu-chip--activo" : ""}`}
              >
                <input
                  type="radio"
                  name="rol"
                  value={r.value}
                  checked={form.rol === r.value}
                  onChange={handleChange}
                  disabled={guardando}
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* Mansiones */}
        <div className="fu-field">
          <label className="fu-label">
            Mansiones habilitadas{" "}
            <span className="fu-opcional">(opcional)</span>
          </label>

          {loadingMansiones ? (
            <span className="fu-hint">Cargando mansiones…</span>
          ) : mansiones.length === 0 ? (
            <span className="fu-hint fu-hint--warn">
              No hay mansiones configuradas todavía
            </span>
          ) : (
            <div className="fu-chip-group">
              {mansiones.map((m) => {
                const seleccionada = form.mansiones.includes(m.id);
                return (
                  <label
                    key={m.id}
                    className={`fu-chip fu-chip--mansion ${seleccionada ? "fu-chip--activo" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={seleccionada}
                      onChange={() => toggleMansion(m.id)}
                      disabled={guardando}
                    />
                    <span className="fu-chip-codigo">{m.codigo}</span>
                    {m.nombre}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="fu-error" role="alert">
            ⚠ {error}
          </div>
        )}

        {/* Acciones */}
        <div className="fu-acciones">
          <button
            type="button"
            className="fu-btn fu-btn--cancelar"
            onClick={handleCancelar}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="fu-btn fu-btn--guardar"
            disabled={guardando || !form.nombre.trim()}
          >
            {guardando ? <span className="fu-spinner" /> : null}
            {guardando ? "Guardando…" : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
