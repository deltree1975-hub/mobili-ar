// ============================================================
// MOBILI-AR — Librería principal de Tauri
// Archivo  : src-tauri/src/lib.rs
// Módulo   : F1-02 — Esquema SQLite en Rust
// Depende  : db::DbState, db::abrir
// Creado   : [fecha]
// ============================================================
// F1-04: agregar mod commands y registrar invoke_handler

mod db;

use db::DbState;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ── PLUGINS ───────────────────────────────────────────
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        // ── ESTADO GLOBAL ─────────────────────────────────────
        // La conexión a SQLite empieza como None.
        // F1-03 (selector de carpeta) la inicializa con la ruta
        // que el usuario elige la primera vez que abre la app.
        .manage(DbState(Mutex::new(None)))
        // ── COMANDOS ──────────────────────────────────────────
        // F1-04: .invoke_handler(tauri::generate_handler![...])
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("Error al iniciar MOBILI-AR");
}