// ============================================================
// MOBILI-AR -- Comandos Tauri: Materiales
// Archivo  : src-tauri/src/commands/materiales.rs
// Modulo   : F3-01
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::types::{Material, CrearMaterialInput, ActualizarMaterialInput};

#[tauri::command]
pub fn get_materiales(state: State<DbState>) -> Result<Vec<Material>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::materiales::get_todos(conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn crear_material(
    state: State<DbState>,
    datos: CrearMaterialInput,
) -> Result<Material, String> {
    if datos.tipo.trim().is_empty() { return Err("El tipo no puede estar vacío".into()); }
    if datos.color.trim().is_empty() { return Err("El color no puede estar vacío".into()); }
    if datos.espesor <= 0.0 { return Err("El espesor debe ser mayor a 0".into()); }
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::materiales::crear(conn, datos).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn actualizar_material(
    state: State<DbState>,
    id: String,
    datos: ActualizarMaterialInput,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::materiales::actualizar(conn, &id, datos).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn ajustar_cantidad_material(
    state: State<DbState>,
    id: String,
    delta: i64,
) -> Result<i64, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::materiales::ajustar_cantidad(conn, &id, delta).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn desactivar_material(
    state: State<DbState>,
    id: String,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::materiales::desactivar(conn, &id).map_err(|e| e.to_string())
}