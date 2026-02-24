// ============================================================
// MOBILI-AR — Pantalla de Login
// Archivo  : src/screens/Login/index.jsx
// Módulo   : F2-03 — Login por tarjeta
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './Login.css';

// ── MODO DESARROLLO ──────────────────────────────────────────
// Cuando lleguen los scanners:
//   1. Cambiar DEV_MODE a false
//   2. El input visible desaparece y el campo invisible toma el control
const DEV_MODE = true;
// ─────────────────────────────────────────────────────────────

function Login({ onLoginExitoso }) {
  const [tokenBuffer, setTokenBuffer]   = useState('');
  const [fase, setFase]                 = useState('esperando');
  const [usuario, setUsuario]           = useState(null);
  const [mansiones, setMansiones]       = useState([]);
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando]         = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const mantenerFoco = () => {
      if (inputRef.current && fase === 'esperando') {
        inputRef.current.focus();
      }
    };
    mantenerFoco();
    if (!DEV_MODE) {
      document.addEventListener('click', mantenerFoco);
      return () => document.removeEventListener('click', mantenerFoco);
    }
  }, [fase]);

  async function handleTokenSubmit(e) {
    e.preventDefault();
    const token = tokenBuffer.trim();
    if (!token) return;

    setCargando(true);
    setMensajeError('');

    try {
      const usuarioEncontrado = await invoke('validar_token', { token });

      if (!usuarioEncontrado) {
        setMensajeError('Tarjeta no reconocida');
        setTokenBuffer('');
        setCargando(false);
        setTimeout(() => setMensajeError(''), 3000);
        return;
      }

      const mansionesHabilitadas = await invoke('get_mansiones_usuario', {
        usuarioId: usuarioEncontrado.id,
        rol: usuarioEncontrado.rol,
      });

      setUsuario(usuarioEncontrado);
      setMansiones(mansionesHabilitadas);
      if (usuarioEncontrado.rol === 'admin' || usuarioEncontrado.rol === 'dueno') {
        setFase('elegir_modo');
      } else {
        setFase('eligiendo');
      }
    } catch (err) {
      setMensajeError('Error al validar tarjeta');
      setTokenBuffer('');
      setTimeout(() => setMensajeError(''), 3000);
    } finally {
      setCargando(false);
    }
  }

  async function handleElegirMansion(mansion) {
    setCargando(true);
    try {
      const sesion = await invoke('login', {
        token: usuario.token,
        mansionId: mansion.id,
      });
      onLoginExitoso(sesion);
    } catch (err) {
      setMensajeError('Error al iniciar sesión');
      setFase('esperando');
      setTokenBuffer('');
      setTimeout(() => setMensajeError(''), 3000);
    } finally {
      setCargando(false);
    }
  }

  // ✅ FIX: movida adentro del componente para acceder al estado
  async function handleEntrarGestion() {
    setCargando(true);
    try {
      const mansionId = mansiones[0]?.id;
      if (!mansionId) {
        setMensajeError('No hay mansiones configuradas');
        setTimeout(() => setMensajeError(''), 3000);
        return;
      }
      const sesion = await invoke('login', {
        token: usuario.token,
        mansionId,
      });
      onLoginExitoso({ ...sesion, modoGestion: true });
    } catch (err) {
      setMensajeError('Error al iniciar sesión de gestión');
      setTimeout(() => setMensajeError(''), 3000);
    } finally {
      setCargando(false);
    }
  }

  function handleCancelarEleccion() {
    setFase('esperando');
    setUsuario(null);
    setMansiones([]);
    setTokenBuffer('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ── RENDER: elegir modo (admin/dueño) ────────────────────────
  if (fase === 'elegir_modo' && usuario) {
    return (
      <div className="login">
        <div className="login-card login-card--mansiones">
          <div className="login-bienvenida">
            <div className="login-avatar">
              {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
            </div>
            <div>
              <p className="login-nombre">{usuario.nombre} {usuario.apellido}</p>
              <p className="login-rol">{usuario.rol}</p>
            </div>
          </div>

          <p className="login-instruccion">¿Qué vas a hacer?</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <button
              className="login-mansion-btn"
              style={{ padding: '18px 20px', fontSize: 15 }}
              onClick={() => setFase('eligiendo')}
              disabled={cargando}
            >
              <span className="login-mansion-icono">🏭</span>
              <span>Ir al taller</span>
            </button>
            <button
              className="login-mansion-btn"
              style={{ padding: '18px 20px', fontSize: 15 }}
              onClick={handleEntrarGestion}
              disabled={cargando}
            >
              <span className="login-mansion-icono">⚙️</span>
              <span>{cargando ? 'Entrando…' : 'Gestión'}</span>
            </button>
          </div>

          {mensajeError && <p className="login-error">{mensajeError}</p>}

          <button className="login-cancelar" onClick={handleCancelarEleccion}>
            ← No soy yo
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: elegir mansión ───────────────────────────────────
  if (fase === 'eligiendo' && usuario) {
    return (
      <div className="login">
        <div className="login-card login-card--mansiones">
          <div className="login-bienvenida">
            <div className="login-avatar">
              {usuario.nombre.charAt(0)}{usuario.apellido.charAt(0)}
            </div>
            <div>
              <p className="login-nombre">{usuario.nombre} {usuario.apellido}</p>
              <p className="login-rol">{usuario.rol}</p>
            </div>
          </div>

          <p className="login-instruccion">¿Dónde vas a trabajar?</p>

          <div className="login-mansiones">
            {mansiones.map(mansion => (
              <button
                key={mansion.id}
                className="login-mansion-btn"
                onClick={() => handleElegirMansion(mansion)}
                disabled={cargando}
              >
                <span className="login-mansion-icono">{iconoMansion(mansion.codigo)}</span>
                <span>{mansion.nombre}</span>
              </button>
            ))}
          </div>

          {mensajeError && <p className="login-error">{mensajeError}</p>}

          <button className="login-cancelar" onClick={handleCancelarEleccion}>
            ← No soy yo
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER: pantalla principal de espera ─────────────────────
  return (
    <div className="login" onClick={() => !DEV_MODE && inputRef.current?.focus()}>
      <div className="login-card">

        <div className="login-logo">M</div>
        <h1 className="login-titulo">MOBILI-AR</h1>
        <p className="login-subtitulo">Pasá tu tarjeta para ingresar</p>

        <div className={`login-scanner ${cargando ? 'login-scanner--leyendo' : ''} ${mensajeError ? 'login-scanner--error' : ''}`}>
          {cargando
            ? <span>Verificando...</span>
            : mensajeError
              ? <span className="login-error-text">{mensajeError}</span>
              : <span>🪪 Esperando tarjeta...</span>
          }
        </div>

        <form onSubmit={handleTokenSubmit} style={{ marginBottom: 12 }}>
          {DEV_MODE && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                type="text"
                value={tokenBuffer}
                onChange={e => setTokenBuffer(e.target.value)}
                placeholder="Token de tarjeta..."
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: '1px solid #ddd', fontSize: 14,
                  fontFamily: 'monospace',
                }}
                autoComplete="off"
              />
              <button
                type="submit"
                style={{
                  padding: '10px 18px', background: 'var(--color-accent)',
                  color: 'white', border: 'none', borderRadius: 8,
                  fontSize: 16, fontWeight: 700, cursor: 'pointer',
                }}
              >
                →
              </button>
            </div>
          )}

          {!DEV_MODE && (
            <input
              ref={inputRef}
              type="text"
              value={tokenBuffer}
              onChange={e => setTokenBuffer(e.target.value)}
              className="login-input-oculto"
              autoComplete="off"
              autoFocus
            />
          )}
        </form>

        {DEV_MODE ? (
          <p className="login-hint">
            💡 Dev — token admin: <strong>MOBILI-ADMIN-0001</strong>
          </p>
        ) : (
          <p className="login-hint">
            El lector de tarjetas tipea el código automáticamente
          </p>
        )}

      </div>
    </div>
  );
}

function iconoMansion(codigo) {
  const iconos = {
    CORTE:    '🪚',
    FILOS:    '📐',
    CNC:      '🤖',
    ARMADO:   '🔧',
    PANOLERO: '📦',
    LIMPIEZA: '🧹',
    CONTROL:  '✅',
  };
  return iconos[codigo] || '🏭';
}

export default Login;