// ============================================================
// MOBILI-AR — Librería principal de Tauri
// Archivo  : src-tauri/src/lib.rs
// Módulo   : F1-03 — Selector de carpeta
// Depende  : db::DbState, commands::config
// Creado   : [fecha]
// ============================================================
// F1-04: agregar comandos de trabajos, módulos, etc.

mod db;
mod commands;

use db::DbState;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ── PLUGINS ───────────────────────────────────────────
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        // ── ESTADO GLOBAL ─────────────────────────────────────
        .manage(DbState(Mutex::new(None)))
        // ── COMANDOS ──────────────────────────────────────────
        .invoke_handler(tauri::generate_handler![
            commands::config::get_db_path,
            commands::config::seleccionar_carpeta_db,
            commands::config::abrir_db_existente,
            // F1-04: commands::trabajos::get_trabajos_activos,
            // F1-04: commands::trabajos::crear_trabajo,
            // F2-06: commands::usuarios::validar_token,
        ])
        .run(tauri::generate_context!())
        .expect("Error al iniciar MOBILI-AR");
}