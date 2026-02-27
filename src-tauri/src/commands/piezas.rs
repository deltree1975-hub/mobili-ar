// ============================================================
// MOBILI-AR — Comandos Tauri: piezas y motor de cálculo
// Archivo  : src-tauri/src/commands/piezas.rs
// Módulo   : F3-01
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::types::{EnsambleConfig, FondoTipo, MotorParams, PiezaCalculada, SetEnsambleInput};

/// Calcula piezas sin guardar — para previsualización en el Editor
#[tauri::command]
pub fn calcular_piezas_modulo(
    state:     State<DbState>,
    modulo_id: String,
) -> Result<Vec<PiezaCalculada>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;

    let params = construir_params(conn, &modulo_id)?;
    Ok(crate::engine::calculator::calcular_piezas(&params))
}

/// Calcula y persiste piezas en la DB
#[tauri::command]
pub fn confirmar_piezas_modulo(
    state:     State<DbState>,
    modulo_id: String,
) -> Result<Vec<PiezaCalculada>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;

    let params = construir_params(conn, &modulo_id)?;
    let piezas = crate::engine::calculator::calcular_piezas(&params);
    crate::db::piezas::guardar_piezas_modulo(conn, &modulo_id, &piezas)
        .map_err(|e| e.to_string())?;
    Ok(piezas)
}

/// Lee piezas ya calculadas y guardadas de un módulo
#[tauri::command]
pub fn get_piezas_modulo(
    state:     State<DbState>,
    modulo_id: String,
) -> Result<Vec<PiezaCalculada>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::piezas::get_piezas_modulo(conn, &modulo_id)
        .map_err(|e| e.to_string())
}

/// Lee configuración de ensamble de un módulo (o devuelve defaults)
#[tauri::command]
pub fn get_ensamble_modulo(
    state:     State<DbState>,
    modulo_id: String,
) -> Result<EnsambleConfig, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;
    Ok(crate::db::ensamble::get_o_default(conn, &modulo_id))
}

/// Guarda configuración de ensamble de un módulo
#[tauri::command]
pub fn set_ensamble_modulo(
    state: State<DbState>,
    input: SetEnsambleInput,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn = guard.as_ref().ok_or("Base de datos no conectada")?;

    let fondo_tipo = if input.fondo_tipo == "pasante" {
        FondoTipo::Pasante
    } else {
        FondoTipo::Interno
    };

    let config = EnsambleConfig {
        modulo_id:             input.modulo_id,
        costado_pasante_techo: input.costado_pasante_techo,
        costado_pasante_piso:  input.costado_pasante_piso,
        fondo_tipo,
        fondo_retranqueo:      input.fondo_retranqueo,
    };

    crate::db::ensamble::set(conn, &config).map_err(|e| e.to_string())
}

// ── Helper interno ────────────────────────────────────────────
fn construir_params(
    conn:      &rusqlite::Connection,
    modulo_id: &str,
) -> Result<MotorParams, String> {
    // Leer módulo
    let (ancho, alto, prof, et, ef, cant_estantes) = conn.query_row(
        "SELECT ancho, alto, profundidad, espesor_tablero, espesor_fondo, cant_estantes
         FROM modulos WHERE id = ?1",
        rusqlite::params![modulo_id],
        |row| Ok((
            row.get::<_, f64>(0)?,
            row.get::<_, f64>(1)?,
            row.get::<_, f64>(2)?,
            row.get::<_, f64>(3)?,
            row.get::<_, f64>(4)?,
            row.get::<_, i64>(5)?,
        )),
    ).map_err(|e| format!("Módulo no encontrado: {}", e))?;

    // Leer offset global
    let offset: f64 = conn.query_row(
        "SELECT CAST(valor AS REAL) FROM configuracion_terminal WHERE clave = 'offset_pieza'",
        [],
        |row| row.get(0),
    ).unwrap_or(0.5);

    // Leer ensamble (o usar defaults)
    let ensamble = crate::db::ensamble::get_o_default(conn, modulo_id);

    Ok(MotorParams {
        ancho: ancho,
        alto: alto,
        profundidad: prof,
        espesor_tablero: et,
        espesor_fondo: ef,
        offset,
        cant_estantes,
        ensamble,
    })
}