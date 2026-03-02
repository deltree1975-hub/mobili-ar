// ============================================================
// MOBILI-AR — Queries SQLite: Materiales
// Archivo  : src-tauri/src/db/materiales.rs
// Módulo   : F3-01
// ============================================================

use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Material {
    pub id:         String,
    pub nombre:     String,
    pub tipo:       String,
    pub espesor:    f64,
    pub tiene_veta: bool,
}

pub fn get_todos(conn: &Connection) -> rusqlite::Result<Vec<Material>> {
    let mut stmt = conn.prepare(
        "SELECT id, nombre, tipo, espesor, tiene_veta
         FROM materiales WHERE activo = 1
         ORDER BY tipo ASC, espesor ASC, nombre ASC",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Material {
            id:         row.get(0)?,
            nombre:     row.get(1)?,
            tipo:       row.get(2)?,
            espesor:    row.get(3)?,
            tiene_veta: row.get::<_, i64>(4)? != 0,
        })
    })?;
    rows.collect()
}