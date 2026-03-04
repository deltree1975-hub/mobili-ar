// ============================================================
// MOBILI-AR — Comandos Tauri: divisores
// Archivo  : src-tauri/src/commands/divisores.rs
// Módulo   : F3-02
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::types::{CrearDivisorInput, Divisor};

#[tauri::command]
pub fn get_divisores_modulo(
    state:     State<DbState>,
    modulo_id: String,
) -> Result<Vec<Divisor>, String> {
    let guard = state.0.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::divisores::get_divisores_modulo(conn, &modulo_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn crear_divisor(
    state: State<DbState>,
    input: CrearDivisorInput,
) -> Result<Divisor, String> {
    let guard = state.0.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::divisores::crear_divisor(conn, &input)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn actualizar_divisor(
    state:      State<DbState>,
    id:         String,
    posicion_x: f64,
    desde:      String,
    hasta:      String,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::divisores::actualizar_divisor(conn, &id, posicion_x, &desde, &hasta)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn eliminar_divisor(
    state: State<DbState>,
    id:    String,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e: std::sync::PoisonError<_>| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::divisores::eliminar_divisor(conn, &id)
        .map_err(|e| e.to_string())
}