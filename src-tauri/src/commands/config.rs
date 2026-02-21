// ============================================================
// MOBILI-AR — Comandos Tauri: configuración de base de datos
// Archivo  : src-tauri/src/commands/config.rs
// Módulo   : F1-03 — Selector de carpeta
// Depende  : db::DbState, db::abrir, tauri_plugin_dialog
// Expone   : get_db_path(), seleccionar_carpeta_db()
// Creado   : [fecha]
// ============================================================

use crate::db::{abrir, DbState};
use std::sync::Mutex;
use tauri::{AppHandle, State};
use tauri_plugin_dialog::DialogExt;

/// Ruta de la base de datos guardada en memoria durante la sesión.
/// RAZÓN: Se usa un Mutex global separado de DbState para poder
/// consultar la ruta sin necesitar la conexión abierta.
pub static DB_PATH: Mutex<Option<String>> = Mutex::new(None);

/// Retorna la ruta actual de la base de datos si ya fue configurada.
/// El frontend lo usa al arrancar para saber si mostrar el selector.
///
/// @returns Some(ruta) si ya hay DB configurada, None si es la primera vez
#[tauri::command]
pub fn get_db_path() -> Option<String> {
    DB_PATH.lock().unwrap().clone()
}

/// Abre el diálogo del sistema para elegir una carpeta,
/// crea/abre mobiliar.db en esa carpeta e inicializa el schema.
///
/// # Errores
/// Retorna Err si el usuario cancela el diálogo o si
/// no se puede crear la base de datos en la carpeta elegida.
#[tauri::command]
pub async fn seleccionar_carpeta_db(
    app: AppHandle,
    state: State<'_, DbState>,
) -> Result<String, String> {
    // ── ABRIR DIÁLOGO DE SISTEMA ──────────────────────────────
    let carpeta = app
        .dialog()
        .file()
        .set_title("Elegir carpeta para la base de datos MOBILI-AR")
        .blocking_pick_folder();

    let carpeta = match carpeta {
        Some(c) => c,
        // RAZÓN: None significa que el usuario cerró el diálogo sin elegir.
        // No es un error — simplemente no hacemos nada.
        None => return Err("cancelado".to_string()),
    };

    // ── CONSTRUIR RUTA COMPLETA AL ARCHIVO .DB ────────────────
    let ruta_carpeta = carpeta.to_string();
    let ruta_db = format!("{}\\mobiliar.db", ruta_carpeta);
    let ruta_path = std::path::Path::new(&ruta_db);

    // ── ABRIR / CREAR LA BASE DE DATOS ────────────────────────
    let conn = abrir(ruta_path).map_err(|e| e.to_string())?;

    // ── GUARDAR EN ESTADO GLOBAL ──────────────────────────────
    {
        let mut path_guard = DB_PATH.lock().unwrap();
        *path_guard = Some(ruta_db.clone());
    }
    {
        let mut conn_guard = state.0.lock().unwrap();
        *conn_guard = Some(conn);
    }

    Ok(ruta_db)
}

/// Intenta abrir una base de datos existente en la ruta dada.
/// Se usa al reiniciar la app si el usuario ya eligió carpeta antes.
///
/// # Errores
/// Retorna Err si el archivo no existe o está corrupto.
#[tauri::command]
pub fn abrir_db_existente(
    ruta: String,
    state: State<'_, DbState>,
) -> Result<(), String> {
    let ruta_path = std::path::Path::new(&ruta);

    if !ruta_path.exists() {
        return Err(format!("No se encontró la base de datos en: {}", ruta));
    }

    let conn = abrir(ruta_path).map_err(|e| e.to_string())?;

    {
        let mut path_guard = DB_PATH.lock().unwrap();
        *path_guard = Some(ruta.clone());
    }
    {
        let mut conn_guard = state.0.lock().unwrap();
        *conn_guard = Some(conn);
    }

    Ok(())
}