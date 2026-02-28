// ============================================================
// MOBILI-AR — CRUD catálogo de cantos
// Archivo  : src-tauri/src/db/cantos.rs
// Módulo   : F3-01
// ============================================================

use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::types::{Canto, CrearCantoInput};

pub fn get_todos(conn: &Connection) -> rusqlite::Result<Vec<Canto>> {
    let mut stmt = conn.prepare(
        "SELECT id, nombre, color, material, espesor, alto_canto, stock_metros, activo, creado_en
         FROM cantos WHERE activo = 1 ORDER BY material, alto_canto, espesor",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Canto {
            id:           row.get(0)?,
            nombre:       row.get(1)?,
            color:        row.get(2)?,
            material:     row.get(3)?,
            espesor:      row.get(4)?,
            alto_canto:   row.get(5)?,
            stock_metros: row.get(6)?,
            activo:       row.get::<_, i64>(7)? == 1,
            creado_en:    row.get(8)?,
        })
    })?;
    rows.collect()
}

pub fn crear(conn: &Connection, input: &CrearCantoInput) -> rusqlite::Result<Canto> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO cantos (id, nombre, color, material, espesor, alto_canto, stock_metros)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            id,
            input.nombre,
            input.color,
            input.material,
            input.espesor,
            input.alto_canto,
            input.stock_metros.unwrap_or(0.0)
        ],
    )?;
    let canto = conn.query_row(
        "SELECT id, nombre, color, material, espesor, alto_canto, stock_metros, activo, creado_en
         FROM cantos WHERE id = ?1",
        params![id],
        |row| {
            Ok(Canto {
                id:           row.get(0)?,
                nombre:       row.get(1)?,
                color:        row.get(2)?,
                material:     row.get(3)?,
                espesor:      row.get(4)?,
                alto_canto:   row.get(5)?,
                stock_metros: row.get(6)?,
                activo:       row.get::<_, i64>(7)? == 1,
                creado_en:    row.get(8)?,
            })
        },
    )?;
    Ok(canto)
}

pub fn desactivar(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("UPDATE cantos SET activo = 0 WHERE id = ?1", params![id])?;
    Ok(())
}