use crate::db::{abrir, DbState};
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::DialogExt;

pub static DB_PATH: Mutex<Option<String>> = Mutex::new(None);

fn ruta_config(app: &AppHandle) -> std::path::PathBuf {
    app.path().app_data_dir()
        .expect("No se pudo obtener app_data_dir")
        .join("db_path.txt")
}

fn leer_ruta_guardada(app: &AppHandle) -> Option<String> {
    let ruta = ruta_config(app);
    std::fs::read_to_string(ruta).ok()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
}

fn guardar_ruta(app: &AppHandle, ruta: &str) -> anyhow::Result<()> {
    let path = ruta_config(app);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, ruta)?;
    Ok(())
}

#[tauri::command]
pub fn get_db_path(app: AppHandle) -> Option<String> {
    {
        let guard = DB_PATH.lock().unwrap();
        if guard.is_some() {
            return guard.clone();
        }
    }
    leer_ruta_guardada(&app)
}

#[tauri::command]
pub async fn seleccionar_carpeta_db(
    app: AppHandle,
    state: State<'_, DbState>,
) -> Result<String, String> {
    let carpeta = app
        .dialog()
        .file()
        .set_title("Elegir carpeta para la base de datos MOBILI-AR")
        .blocking_pick_folder();

    let carpeta = match carpeta {
        Some(c) => c,
        None => return Err("cancelado".to_string()),
    };

    let ruta_db = format!("{}\\mobiliar.db", carpeta.to_string());
    let ruta_path = std::path::Path::new(&ruta_db);
    let conn = abrir(ruta_path).map_err(|e| e.to_string())?;

    { let mut g = DB_PATH.lock().unwrap(); *g = Some(ruta_db.clone()); }
    guardar_ruta(&app, &ruta_db).map_err(|e| e.to_string())?;
    { let mut g = state.0.lock().unwrap(); *g = Some(conn); }

    Ok(ruta_db)
}

#[tauri::command]
pub fn abrir_db_existente(
    app: AppHandle,
    ruta: String,
    state: State<'_, DbState>,
) -> Result<(), String> {
    let ruta_path = std::path::Path::new(&ruta);
    if !ruta_path.exists() {
        let _ = std::fs::remove_file(ruta_config(&app));
        return Err(format!("No se encontro la base de datos en: {}", ruta));
    }
    let conn = abrir(ruta_path).map_err(|e| e.to_string())?;
    { let mut g = DB_PATH.lock().unwrap(); *g = Some(ruta.clone()); }
    { let mut g = state.0.lock().unwrap(); *g = Some(conn); }
    Ok(())
}
