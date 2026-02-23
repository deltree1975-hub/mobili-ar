// ============================================================
// MOBILI-AR — Queries de mansiones
// Archivo  : src-tauri/src/db/mansiones.rs
// Módulo   : F2-01/02 — Usuarios y Sesiones
// ============================================================

use rusqlite::{Connection, params};
use crate::types::Mansion;

/// Retorna todas las mansiones activas.
pub fn get_todas(conn: &Connection) -> anyhow::Result<Vec<Mansion>> {
    let mut stmt = conn.prepare(
        "SELECT id, codigo, nombre, activo
         FROM mansiones WHERE activo = 1 ORDER BY nombre ASC"
    )?;

    let items = stmt.query_map([], |row| {
        Ok(Mansion {
            id:     row.get(0)?,
            codigo: row.get(1)?,
            nombre: row.get(2)?,
            activo: row.get::<_, i64>(3)? != 0,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}

/// Retorna las mansiones habilitadas para un usuario.
/// Admin y dueño reciben todas las mansiones activas.
pub fn get_para_usuario(conn: &Connection, usuario_id: &str, rol: &str) -> anyhow::Result<Vec<Mansion>> {
    // Admin y dueño ven todas las mansiones sin excepción
    if rol == "admin" || rol == "dueno" {
        return get_todas(conn);
    }

    // Operario y diseñador: solo las asignadas
    let mut stmt = conn.prepare(
        "SELECT m.id, m.codigo, m.nombre, m.activo
         FROM mansiones m
         JOIN usuario_mansiones um ON um.mansion_id = m.id
         WHERE um.usuario_id = ?1 AND m.activo = 1
         ORDER BY m.nombre ASC"
    )?;

    let items = stmt.query_map(params![usuario_id], |row| {
        Ok(Mansion {
            id:     row.get(0)?,
            codigo: row.get(1)?,
            nombre: row.get(2)?,
            activo: row.get::<_, i64>(3)? != 0,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}

/// Asigna mansiones a un usuario (reemplaza las existentes).
pub fn asignar_a_usuario(conn: &Connection, usuario_id: &str, mansion_ids: &[String]) -> anyhow::Result<()> {
    conn.execute(
        "DELETE FROM usuario_mansiones WHERE usuario_id = ?1",
        params![usuario_id],
    )?;

    for mansion_id in mansion_ids {
        conn.execute(
            "INSERT OR IGNORE INTO usuario_mansiones (usuario_id, mansion_id)
             VALUES (?1, ?2)",
            params![usuario_id, mansion_id],
        )?;
    }

    Ok(())
}