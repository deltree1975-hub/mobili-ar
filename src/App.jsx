// ============================================================
// MOBILI-AR — Componente raíz de la aplicación
// Archivo  : src/App.jsx
// Módulo   : F1-01 — Setup proyecto Tauri
// Depende  : (ninguno todavía)
// Expone   : <App /> — montado en src/main.jsx
// Creado   : [fecha]
// ============================================================
// F1-06: agregar Router y rutas principales
// F2-05: agregar lógica de sesión
// F2-09: agregar header global con usuario activo
// ============================================================

import './App.css';

function App() {
  return (
    <div className="app-root">
      <div className="app-bienvenida">
        <div className="app-logo">M</div>
        <h1>MOBILI-AR</h1>
        <p className="app-version">v0.1.0 — Entorno funcionando correctamente</p>
        <p className="app-modulo">Módulo activo: F1-01 — Setup inicial</p>
        <div className="app-checklist">
          <p>✅ Tauri inicializado</p>
          <p>✅ React montado</p>
          <p>✅ Vite conectado</p>
          <p>⬜ Base de datos — F1-02</p>
          <p>⬜ Selector de carpeta — F1-03</p>
          <p>⬜ Comandos Tauri — F1-04</p>
        </div>
      </div>
    </div>
  );
}

export default App;