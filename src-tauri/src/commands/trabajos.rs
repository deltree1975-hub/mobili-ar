// ============================================================
// MOBILI-AR — Comandos Tauri: Trabajos
// Archivo  : src-tauri/src/commands/trabajos.rs
// Módulo   : F1-04 — Capa de comandos Tauri
// Depende  : db::trabajos, db::DbState, types::*
// Expone   : get_trabajos_activos(), crear_trabajo(),
//            actualizar_trabajo(), cambiar_estado_trabajo()
// Creado   : [fecha]
// ============================================================

use crate::db::{trabajos as db, DbState};
use crate::types::{ActualizarTrabajoInput, CrearTrabajoInput, Trabajo};
use tauri::State;

/// Retorna todos los trabajos ordenados por prioridad.
#[tauri::command]
pub fn get_trabajos_activos(
    state: State<'_, DbState>,
    incluir_archivados: bool,
) -> Result<Vec<Trabajo>, String> {
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::get_activos(conn, incluir_archivados).map_err(|e| e.to_string())
}

/// Crea un nuevo trabajo.
#[tauri::command]
pub fn crear_trabajo(
    state: State<'_, DbState>,
    datos: CrearTrabajoInput,
) -> Result<Trabajo, String> {
    if datos.nombre.trim().is_empty() {
        return Err("El nombre del trabajo no puede estar vacío".to_string());
    }
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::crear(conn, datos).map_err(|e| e.to_string())
}

/// Actualiza campos de un trabajo existente.
#[tauri::command]
pub fn actualizar_trabajo(
    state: State<'_, DbState>,
    id: String,
    datos: ActualizarTrabajoInput,
) -> Result<Trabajo, String> {
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::actualizar(conn, &id, datos).map_err(|e| e.to_string())
}

/// Cambia el estado de un trabajo y lo registra en el historial.
#[tauri::command]
pub fn cambiar_estado_trabajo(
    state: State<'_, DbState>,
    trabajo_id: String,
    nuevo_estado: String,
    usuario_nombre: String,
    notas: Option<String>,
) -> Result<(), String> {
    let guard = state.0.lock().unwrap();
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    db::cambiar_estado(conn, &trabajo_id, &nuevo_estado, &usuario_nombre, notas.as_deref())
        .map_err(|e| e.to_string())
}