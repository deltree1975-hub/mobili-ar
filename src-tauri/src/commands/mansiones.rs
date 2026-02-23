// ============================================================
// MOBILI-AR — Comandos admin de mansiones
// Archivo  : src-tauri/src/commands/mansiones.rs
// Módulo   : F2-02 — Gestión de mansiones
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::db::mansiones as db_mansiones;
use crate::types::Mansion;

/// Retorna todas las mansiones activas.
#[tauri::command]
pub fn get_mansiones(state: State<DbState>) -> Result<Vec<Mansion>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let conn = conn.as_ref().ok_or("DB no inicializada")?;
    db_mansiones::get_todas(conn).map_err(|e| e.to_string())
}