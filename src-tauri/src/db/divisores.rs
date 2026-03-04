// ============================================================
// MOBILI-AR — DB Divisores
// Archivo: src-tauri/src/db/divisores.rs
// ============================================================

use crate::types::{Divisor, CrearDivisorInput};
use anyhow::Result;
use rusqlite::Connection;
use uuid::Uuid;

/// Obtiene todos los divisores de un módulo, ordenados por posicion_x
pub fn get_divisores_modulo(conn: &Connection, modulo_id: &str) -> Result<Vec<Divisor>> {
    let mut stmt = conn.prepare(
        "SELECT id, modulo_id, posicion_x, desde, hasta, orden, creado_en
         FROM divisores_modulo
         WHERE modulo_id = ?1
         ORDER BY posicion_x ASC"
    )?;

    let divisores = stmt.query_map([modulo_id], |row| {
        Ok(Divisor {
            id:         row.get(0)?,
            modulo_id:  row.get(1)?,
            posicion_x: row.get(2)?,
            desde:      row.get(3)?,
            hasta:      row.get(4)?,
            orden:      row.get(5)?,
            creado_en:  row.get(6)?,
        })
    })?
    .collect::<rusqlite::Result<Vec<_>>>()?;

    Ok(divisores)
}

/// Crea un divisor nuevo y retorna el struct completo
pub fn crear_divisor(conn: &Connection, input: &CrearDivisorInput) -> Result<Divisor> {
    let id = Uuid::new_v4().to_string();
    let orden = input.orden.unwrap_or(0);

    conn.execute(
        "INSERT INTO divisores_modulo (id, modulo_id, posicion_x, desde, hasta, orden)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            id,
            input.modulo_id,
            input.posicion_x,
            input.desde,
            input.hasta,
            orden,
        ],
    )?;

    let divisor = conn.query_row(
        "SELECT id, modulo_id, posicion_x, desde, hasta, orden, creado_en
         FROM divisores_modulo WHERE id = ?1",
        [&id],
        |row| Ok(Divisor {
            id:         row.get(0)?,
            modulo_id:  row.get(1)?,
            posicion_x: row.get(2)?,
            desde:      row.get(3)?,
            hasta:      row.get(4)?,
            orden:      row.get(5)?,
            creado_en:  row.get(6)?,
        }),
    )?;

    Ok(divisor)
}

/// Actualiza posicion_x, desde y hasta de un divisor existente
pub fn actualizar_divisor(
    conn: &Connection,
    id: &str,
    posicion_x: f64,
    desde: &str,
    hasta: &str,
) -> Result<()> {
    conn.execute(
        "UPDATE divisores_modulo
         SET posicion_x = ?1, desde = ?2, hasta = ?3
         WHERE id = ?4",
        rusqlite::params![posicion_x, desde, hasta, id],
    )?;
    Ok(())
}

/// Elimina un divisor por id
pub fn eliminar_divisor(conn: &Connection, id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM divisores_modulo WHERE id = ?1",
        [id],
    )?;
    Ok(())
}

/// Elimina todos los divisores de un módulo (útil al recalcular)
pub fn eliminar_divisores_modulo(conn: &Connection, modulo_id: &str) -> Result<()> {
    conn.execute(
        "DELETE FROM divisores_modulo WHERE modulo_id = ?1",
        [modulo_id],
    )?;
    Ok(())
}