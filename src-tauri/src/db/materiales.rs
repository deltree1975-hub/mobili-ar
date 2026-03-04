// ============================================================
// MOBILI-AR -- Queries SQLite: Materiales
// Archivo  : src-tauri/src/db/materiales.rs
// Modulo   : F3-01
// ============================================================

use rusqlite::{Connection, params};
use crate::types::{Material, CrearMaterialInput, ActualizarMaterialInput};
use uuid::Uuid;

pub fn get_todos(conn: &Connection) -> rusqlite::Result<Vec<Material>> {
    let mut stmt = conn.prepare(
        "SELECT id, tipo, color, largo, ancho, espesor, cantidad, activo, creado_en
         FROM materiales
         WHERE activo = 1
         ORDER BY tipo ASC, espesor ASC, color ASC",
    )?;
    let rows = stmt.query_map([], |row| {
        Ok(Material {
            id:        row.get(0)?,
            tipo:      row.get(1)?,
            color:     row.get(2)?,
            largo:     row.get(3)?,
            ancho:     row.get(4)?,
            espesor:   row.get(5)?,
            cantidad:  row.get(6)?,
            activo:    row.get::<_, i64>(7)? != 0,
            creado_en: row.get(8)?,
        })
    })?;
    rows.collect()
}

pub fn crear(conn: &Connection, datos: CrearMaterialInput) -> rusqlite::Result<Material> {
    let id    = Uuid::new_v4().to_string();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO materiales (id, tipo, color, largo, ancho, espesor, cantidad, creado_en)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            id, datos.tipo, datos.color,
            datos.largo, datos.ancho, datos.espesor,
            datos.cantidad.unwrap_or(0),
            ahora
        ],
    )?;

    Ok(Material {
        id,
        tipo:      datos.tipo,
        color:     datos.color,
        largo:     datos.largo,
        ancho:     datos.ancho,
        espesor:   datos.espesor,
        cantidad:  datos.cantidad.unwrap_or(0),
        activo:    true,
        creado_en: ahora,
    })
}

pub fn actualizar(conn: &Connection, id: &str, datos: ActualizarMaterialInput) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE materiales SET
            tipo = ?1, color = ?2, largo = ?3, ancho = ?4,
            espesor = ?5, cantidad = ?6
         WHERE id = ?7",
        params![
            datos.tipo, datos.color, datos.largo, datos.ancho,
            datos.espesor, datos.cantidad,
            id
        ],
    )?;
    Ok(())
}

pub fn ajustar_cantidad(conn: &Connection, id: &str, delta: i64) -> rusqlite::Result<i64> {
    conn.execute(
        "UPDATE materiales SET cantidad = MAX(0, cantidad + ?1) WHERE id = ?2",
        params![delta, id],
    )?;
    let nueva: i64 = conn.query_row(
        "SELECT cantidad FROM materiales WHERE id = ?1",
        params![id],
        |row| row.get(0),
    )?;
    Ok(nueva)
}

pub fn desactivar(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE materiales SET activo = 0 WHERE id = ?1",
        params![id],
    )?;
    Ok(())
}