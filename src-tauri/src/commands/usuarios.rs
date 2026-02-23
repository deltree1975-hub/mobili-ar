// ============================================================
// MOBILI-AR — Comandos admin de usuarios
// Archivo  : src-tauri/src/commands/usuarios.rs
// Módulo   : F2-02 — Gestión de usuarios
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::db::{usuarios as db_usuarios, mansiones as db_mansiones};
use crate::types::{Usuario, Mansion, CrearUsuarioInput};

/// Retorna todos los usuarios del sistema.
#[tauri::command]
pub fn get_usuarios(state: State<DbState>) -> Result<Vec<Usuario>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let conn = conn.as_ref().ok_or("DB no inicializada")?;
    db_usuarios::get_todos(conn).map_err(|e| e.to_string())
}

/// Crea un nuevo usuario con sus mansiones asignadas.
#[tauri::command]
pub fn crear_usuario(
    datos: CrearUsuarioInput,
    state: State<DbState>,
) -> Result<Usuario, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let conn = conn.as_ref().ok_or("DB no inicializada")?;
    db_usuarios::crear(conn, datos).map_err(|e| e.to_string())
}

/// Retorna las mansiones habilitadas para un usuario.
#[tauri::command]
pub fn get_mansiones_usuario(
    usuario_id: String,
    rol: String,
    state: State<DbState>,
) -> Result<Vec<Mansion>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let conn = conn.as_ref().ok_or("DB no inicializada")?;
    db_mansiones::get_para_usuario(conn, &usuario_id, &rol).map_err(|e| e.to_string())
}

/// Actualiza las mansiones asignadas a un usuario.
#[tauri::command]
pub fn asignar_mansiones(
    usuario_id: String,
    mansion_ids: Vec<String>,
    state: State<DbState>,
) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let conn = conn.as_ref().ok_or("DB no inicializada")?;
    db_mansiones::asignar_a_usuario(conn, &usuario_id, &mansion_ids)
        .map_err(|e| e.to_string())
}