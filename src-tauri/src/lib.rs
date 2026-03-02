// ============================================================
// MOBILI-AR — Librería principal de Tauri
// Archivo  : src-tauri/src/lib.rs
// Módulo   : F1-04 — Capa de comandos Tauri
// ============================================================
mod commands;
mod db;
mod types;
pub mod engine;
use db::DbState;
use std::sync::Mutex;
use commands::usuarios;
use commands::auth;
use commands::mansiones;
use commands::cantos;
use commands::piezas;
use commands::materiales;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ── PLUGINS ───────────────────────────────────────────────
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        // ── ESTADO GLOBAL ─────────────────────────────────────────
        .manage(DbState(Mutex::new(None)))
        // ── COMANDOS ──────────────────────────────────────────────
        .invoke_handler(tauri::generate_handler![
            // F1-03: configuración de base de datos
            commands::config::get_db_path,
            commands::config::seleccionar_carpeta_db,
            commands::config::abrir_db_existente,
            // F1-04: trabajos
            commands::trabajos::get_trabajos_activos,
            commands::trabajos::crear_trabajo,
            commands::trabajos::actualizar_trabajo,
            commands::trabajos::cambiar_estado_trabajo,
            // F1-04: composiciones y módulos
            commands::composiciones::get_composiciones,
            commands::composiciones::crear_composicion,
            commands::composiciones::get_modulos,
            commands::composiciones::crear_modulo,
            commands::composiciones::eliminar_modulo,
            commands::composiciones::get_libreria,
            commands::composiciones::actualizar_modulo_completo,
            // F2-01: usuarios y auth
            commands::usuarios::validar_token,
            commands::usuarios::crear_usuario_completo,
            auth::login,
            auth::logout,
            auth::get_sesion_activa,
            usuarios::get_usuarios,
            usuarios::crear_usuario,
            usuarios::get_mansiones_usuario,
            usuarios::asignar_mansiones,
            mansiones::get_mansiones,
            // F3-01: cantos
            cantos::get_cantos,
            cantos::crear_canto,
            cantos::desactivar_canto,
            // F3-01: materiales
            materiales::get_materiales,
            // F3-01: piezas y motor
            piezas::calcular_piezas_modulo,
            piezas::confirmar_piezas_modulo,
            piezas::get_piezas_modulo,
            piezas::get_ensamble_modulo,
            piezas::set_ensamble_modulo,
        ])
        .run(tauri::generate_context!())
        .expect("Error al iniciar MOBILI-AR");
}