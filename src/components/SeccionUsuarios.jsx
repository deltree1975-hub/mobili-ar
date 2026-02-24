// src/components/SeccionUsuarios.jsx
// F2-05 + F2-06 — Sección de usuarios con formulario y tarjeta imprimible

import { useState } from "react";
import { FormularioUsuario } from "./FormularioUsuario";
import { TarjetaUsuario }    from "./TarjetaUsuario";
import { useUsuarios }       from "../hooks/useUsuarios";
import "./SeccionUsuarios.css";

// ── Badge de rol ─────────────────────────────────────────────

const ESTILOS_ROL = {
  operario:  "#4a7fa5",
  disenador: "#7a5ea5",
  admin:     "#d9541e",
  dueno:     "#c9a227",
};

const LABELS_ROL = {
  operario:  "Operario",
  disenador: "Diseñador",
  admin:     "Admin",
  dueno:     "Dueño",
};

function BadgeRol({ rol }) {
  const color = ESTILOS_ROL[rol] ?? "#555";
  return (
    <span className="su-badge" style={{ "--c": color }}>
      {LABELS_ROL[rol] ?? rol}
    </span>
  );
}

// ── Fila de usuario ──────────────────────────────────────────

function FilaUsuario({ usuario, onImprimirTarjeta }) {
  const inactivo = !usuario.activo;
  const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');

  return (
    <div className={`su-fila ${inactivo ? "su-fila--inactivo" : ""}`}>
      <div className="su-fila-avatar">
        {(usuario.nombre[0] ?? "?").toUpperCase()}
      </div>

      <div className="su-fila-info">
        <span className="su-nombre">{nombreCompleto}</span>
        <span className="su-token" title="Token / código de barras">
          {usuario.token}
        </span>
      </div>

      <div className="su-fila-meta">
        <BadgeRol rol={usuario.rol} />
        {inactivo && <span className="su-tag-inactivo">Inactivo</span>}
      </div>

      <div className="su-fila-acciones">
        <button
          className="su-btn-fila"
          onClick={() => onImprimirTarjeta(usuario)}
          title="Ver e imprimir tarjeta"
        >
          🪪
        </button>
      </div>
    </div>
  );
}

// ── Sección principal ────────────────────────────────────────

export function SeccionUsuarios() {
  const { usuarios, loading, error, crearUsuario } = useUsuarios();
  const [mostrarForm, setMostrarForm]       = useState(false);
  const [ultimoCreado, setUltimoCreado]     = useState(null);
  const [usuarioTarjeta, setUsuarioTarjeta] = useState(null); // F2-06

  const activos   = usuarios.filter((u) => u.activo);
  const inactivos = usuarios.filter((u) => !u.activo);

  const handleCreado = async (payload) => {
    const usuario = await crearUsuario(payload);
    setUltimoCreado(usuario);
    setMostrarForm(false);
    return usuario;
  };

  return (
    <div className="su-wrapper">

      {/* Topbar */}
      <div className="su-topbar">
        <div className="su-topbar-left">
          <span className="su-titulo">Usuarios</span>
          {!loading && (
            <span className="su-conteo">
              {activos.length} activo{activos.length !== 1 ? "s" : ""}
              {inactivos.length > 0 &&
                ` · ${inactivos.length} inactivo${inactivos.length !== 1 ? "s" : ""}`}
            </span>
          )}
        </div>

        <button
          className={`su-btn-nuevo ${mostrarForm ? "su-btn-nuevo--abierto" : ""}`}
          onClick={() => {
            setMostrarForm((v) => !v);
            if (!mostrarForm) setUltimoCreado(null);
          }}
        >
          {mostrarForm ? "✕ Cerrar" : "+ Nuevo usuario"}
        </button>
      </div>

      {/* Formulario inline */}
      {mostrarForm && (
        <div className="su-form-zona">
          <FormularioUsuario
            onCreado={handleCreado}
            onCancelar={() => setMostrarForm(false)}
          />
        </div>
      )}

      {/* Banner último creado */}
      {ultimoCreado && !mostrarForm && (
        <div className="su-banner-ok">
          <div className="su-banner-texto">
            <span className="su-banner-check">✓</span>
            <strong>
              {ultimoCreado.nombre}
              {ultimoCreado.apellido ? ` ${ultimoCreado.apellido}` : ""}
            </strong>
            {" "}creado correctamente
          </div>
          <div className="su-banner-token">
            <span className="su-banner-label">Token</span>
            <code>{ultimoCreado.token}</code>
          </div>
          <button
            className="su-btn-tarjeta"
            onClick={() => setUsuarioTarjeta(ultimoCreado)}
          >
            🪪 Imprimir tarjeta
          </button>
        </div>
      )}

      {/* Estados */}
      {loading && <div className="su-estado">Cargando usuarios…</div>}
      {error   && <div className="su-estado su-estado--error">⚠ {error}</div>}
      {!loading && !error && usuarios.length === 0 && (
        <div className="su-estado su-estado--vacio">
          No hay usuarios todavía. Creá el primero con el botón de arriba.
        </div>
      )}

      {/* Lista */}
      {!loading && !error && usuarios.length > 0 && (
        <div className="su-lista">
          {usuarios.map((u) => (
            <FilaUsuario
              key={u.id}
              usuario={u}
              onImprimirTarjeta={setUsuarioTarjeta}
            />
          ))}
        </div>
      )}

      {/* F2-06: Modal de tarjeta */}
      {usuarioTarjeta && (
        <TarjetaUsuario
          usuario={usuarioTarjeta}
          onCerrar={() => setUsuarioTarjeta(null)}
        />
      )}
    </div>
  );
}
