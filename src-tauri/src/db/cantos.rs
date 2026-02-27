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
        "SELECT id, nombre, color, espesor, material, activo, creado_en
         FROM cantos WHERE activo = 1 ORDER BY material, espesor"
    )?;
    let rows = stmt.query_map([], |row| Ok(Canto {
        id:        row.get(0)?,
        nombre:    row.get(1)?,
        color:     row.get(2)?,
        espesor:   row.get(3)?,
        material:  row.get(4)?,
        activo:    row.get::<_, i64>(5)? == 1,
        creado_en: row.get(6)?,
    }))?;
    rows.collect()
}

pub fn crear(conn: &Connection, input: &CrearCantoInput) -> rusqlite::Result<Canto> {
    let id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO cantos (id, nombre, color, espesor, material)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![id, input.nombre, input.color, input.espesor, input.material],
    )?;
    let canto = conn.query_row(
        "SELECT id, nombre, color, espesor, material, activo, creado_en
         FROM cantos WHERE id = ?1",
        params![id],
        |row| Ok(Canto {
            id:        row.get(0)?,
            nombre:    row.get(1)?,
            color:     row.get(2)?,
            espesor:   row.get(3)?,
            material:  row.get(4)?,
            activo:    row.get::<_, i64>(5)? == 1,
            creado_en: row.get(6)?,
        }),
    )?;
    Ok(canto)
}

pub fn desactivar(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("UPDATE cantos SET activo = 0 WHERE id = ?1", params![id])?;
    Ok(())
}