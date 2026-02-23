// ============================================================
// MOBILI-AR — Comandos de autenticación
// Archivo  : src-tauri/src/commands/auth.rs
// Módulo   : F2-02 — Login y Sesiones
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::db::{usuarios as db_usuarios, sesiones as db_sesiones};
use crate::types::SesionActiva;

/// Login: valida el token de la tarjeta y abre sesión en la mansión indicada.
/// Es el único punto de entrada al sistema.
#[tauri::command]
pub fn login(
    token: String,
    mansion_id: String,
    state: State<DbState>,
) -> Result<SesionActiva, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let conn = conn.as_ref().ok_or("DB no inicializada")?;

    // Validar token
    let usuario = db_usuarios::buscar_por_token(conn, &token)
        .map_err(|e| e.to_string())?
        .ok_or("Tarjeta no reconocida o usuario inactivo")?;

    // Abrir sesión
    db_sesiones::abrir(conn, &usuario.id, &mansion_id)
        .map_err(|e| e.to_string())?;

    // Retornar sesión completa
    db_sesiones::get_activa(conn, &usuario.id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Error al crear sesión".to_string())
}

/// Logout: cierra la sesión activa del usuario.
#[tauri::command]
pub fn logout(
    usuario_id: String,
    state: State<DbState>,
) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let conn = conn.as_ref().ok_or("DB no inicializada")?;
    db_sesiones::cerrar(conn, &usuario_id).map_err(|e| e.to_string())
}

/// Retorna la sesión activa de un usuario (para restaurar estado al reabrir la app).
#[tauri::command]
pub fn get_sesion_activa(
    usuario_id: String,
    state: State<DbState>,
) -> Result<Option<SesionActiva>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let conn = conn.as_ref().ok_or("DB no inicializada")?;
    db_sesiones::get_activa(conn, &usuario_id).map_err(|e| e.to_string())
}