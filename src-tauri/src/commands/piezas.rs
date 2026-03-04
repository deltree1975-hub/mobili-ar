// ============================================================
// MOBILI-AR — Comandos Tauri: piezas y motor de cálculo
// Archivo  : src-tauri/src/commands/piezas.rs
// Módulo   : F3-01 / F3-02
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
    let mut piezas = crate::engine::calculator::calcular_piezas(&params);

    // Divisores v5
    if params.divisores.as_ref().map_or(false, |d| !d.is_empty()) {
        let extra = crate::engine::calculator::calcular_piezas_divisores(&params, &mut piezas);
        piezas.extend(extra);
    }

    Ok(piezas)
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
    let mut piezas = crate::engine::calculator::calcular_piezas(&params);

    // Divisores v5
    if params.divisores.as_ref().map_or(false, |d| !d.is_empty()) {
        let extra = crate::engine::calculator::calcular_piezas_divisores(&params, &mut piezas);
        piezas.extend(extra);
    }

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
    // Leer módulo con todos los campos incluyendo v5
    let (ancho, alto, prof, et, ef, cant_estantes, tiene_fondo, alto_faja,
         material_fondo_id, faja_acostada) = conn.query_row(
        "SELECT ancho, alto, profundidad, espesor_tablero, espesor_fondo,
                cant_estantes,
                COALESCE(tiene_fondo, 1),
                COALESCE(alto_faja, 80.0),
                material_fondo_id,
                COALESCE(faja_acostada, 0)
         FROM modulos WHERE id = ?1",
        rusqlite::params![modulo_id],
        |row| Ok((
            row.get::<_, f64>(0)?,
            row.get::<_, f64>(1)?,
            row.get::<_, f64>(2)?,
            row.get::<_, f64>(3)?,
            row.get::<_, f64>(4)?,
            row.get::<_, i64>(5)?,
            row.get::<_, i64>(6)? != 0,
            row.get::<_, f64>(7)?,
            row.get::<_, Option<String>>(8)?,
            row.get::<_, i64>(9)? != 0,
        )),
    ).map_err(|e| format!("Módulo no encontrado: {}", e))?;

    // Leer disposición para saber si tiene fajas y posición
    let disposicion: String = conn.query_row(
        "SELECT disposicion FROM modulos WHERE id = ?1",
        rusqlite::params![modulo_id],
        |row| row.get(0),
    ).map_err(|e| format!("Error leyendo disposición: {}", e))?;

    let (tiene_fajas, posicion_faja) = conn.query_row(
        "SELECT tiene_fajas, COALESCE(posicion_faja, 'superior')
         FROM disposiciones WHERE id = ?1",
        rusqlite::params![disposicion],
        |row| Ok((
            row.get::<_, i64>(0)? != 0,
            row.get::<_, String>(1)?,
        )),
    ).unwrap_or((false, "superior".to_string()));

    // Leer offset global
    let offset: f64 = conn.query_row(
        "SELECT CAST(valor AS REAL) FROM configuracion_terminal WHERE clave = 'offset_pieza'",
        [],
        |row| row.get(0),
    ).unwrap_or(0.5);

    // Leer ensamble (o usar defaults)
    let ensamble = crate::db::ensamble::get_o_default(conn, modulo_id);

    // Leer divisores del módulo (v5)
    let divisores = leer_divisores(conn, modulo_id);

    Ok(MotorParams {
        ancho,
        alto,
        profundidad:     prof,
        espesor_tablero: et,
        espesor_fondo:   ef,
        offset,
        cant_estantes,
        ensamble,
        tiene_fajas,
        posicion_faja,
        alto_faja,
        tiene_fondo,
        faja_acostada,
        material_fondo_id,
        divisores,
    })
}

/// Lee los divisores de un módulo y los convierte a DivisorParams para el motor
fn leer_divisores(
    conn:      &rusqlite::Connection,
    modulo_id: &str,
) -> Option<Vec<crate::types::DivisorParams>> {
    let mut stmt = match conn.prepare(
        "SELECT posicion_x, desde, hasta
         FROM divisores_modulo
         WHERE modulo_id = ?1
         ORDER BY posicion_x ASC",
    ) {
        Ok(s)  => s,
        Err(_) => return None,
    };

    let lista: Vec<crate::types::DivisorParams> = stmt
        .query_map(rusqlite::params![modulo_id], |row| {
            Ok(crate::types::DivisorParams {
                posicion_x: row.get(0)?,
                desde:      row.get(1)?,
                hasta:      row.get(2)?,
            })
        })
        .ok()?
        .flatten()
        .collect();

    if lista.is_empty() { None } else { Some(lista) }
}