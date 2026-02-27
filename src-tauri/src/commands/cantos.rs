// ============================================================
// MOBILI-AR — Comandos Tauri: cantos
// Archivo  : src-tauri/src/commands/cantos.rs
// Módulo   : F3-01
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::types::{Canto, CrearCantoInput};

#[tauri::command]
pub fn get_cantos(state: State<DbState>) -> Result<Vec<Canto>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::cantos::get_todos(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn crear_canto(state: State<DbState>, input: CrearCantoInput) -> Result<Canto, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::cantos::crear(conn, &input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn desactivar_canto(state: State<DbState>, id: String) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::cantos::desactivar(conn, &id).map_err(|e| e.to_string())
}