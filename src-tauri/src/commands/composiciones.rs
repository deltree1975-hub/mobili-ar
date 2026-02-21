// ============================================================
// MOBILI-AR — Comandos Tauri: Composiciones y Módulos
// Archivo  : src-tauri/src/commands/composiciones.rs
// Módulo   : F1-04 — Capa de comandos Tauri
// Depende  : db::composiciones, db::DbState, types::*
// Expone   : get_composiciones(), crear_composicion(),
//            get_modulos(), crear_modulo(), eliminar_modulo(),
//            get_libreria()
// Creado   : [fecha]
// ============================================================

use crate::db::{composiciones as db, DbState};
use crate::types::{
    Composicion, CrearComposicionInput, CrearModuloInput, LibreriaModulo, Modulo,
};
use tauri::State;

/// Retorna todas las composiciones de un trabajo.
#[tauri::command]
pub fn get_composiciones(
    state: State<'_, DbState>,
    trabajo_id: String,
) -> Result<Vec<Composicion>, String> {
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::get_composiciones(conn, &trabajo_id).map_err(|e| e.to_string())
}

/// Crea una nueva composición dentro de un trabajo.
#[tauri::command]
pub fn crear_composicion(
    state: State<'_, DbState>,
    datos: CrearComposicionInput,
) -> Result<Composicion, String> {
    if datos.nombre.trim().is_empty() {
        return Err("El nombre de la composición no puede estar vacío".to_string());
    }
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::crear_composicion(conn, datos).map_err(|e| e.to_string())
}

/// Retorna todos los módulos de una composición.
#[tauri::command]
pub fn get_modulos(
    state: State<'_, DbState>,
    composicion_id: String,
) -> Result<Vec<Modulo>, String> {
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::get_modulos(conn, &composicion_id).map_err(|e| e.to_string())
}

/// Crea un nuevo módulo en una composición.
#[tauri::command]
pub fn crear_modulo(
    state: State<'_, DbState>,
    datos: CrearModuloInput,
) -> Result<Modulo, String> {
    if datos.nombre.trim().is_empty() {
        return Err("El nombre del módulo no puede estar vacío".to_string());
    }
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::crear_modulo(conn, datos).map_err(|e| e.to_string())
}

/// Elimina un módulo y todas sus piezas.
#[tauri::command]
pub fn eliminar_modulo(
    state: State<'_, DbState>,
    id: String,
) -> Result<(), String> {
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::eliminar_modulo(conn, &id).map_err(|e| e.to_string())
}

/// Retorna todos los módulos activos de la librería estándar.
#[tauri::command]
pub fn get_libreria(
    state: State<'_, DbState>,
) -> Result<Vec<LibreriaModulo>, String> {
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::get_libreria(conn).map_err(|e| e.to_string())
}