// ============================================================
// MOBILI-AR — Comandos Tauri: Materiales
// Archivo  : src-tauri/src/commands/materiales.rs
// Módulo   : F3-01
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::db::materiales::Material;

#[tauri::command]
pub fn get_materiales(state: State<DbState>) -> Result<Vec<Material>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::materiales::get_todos(conn).map_err(|e| e.to_string())
}