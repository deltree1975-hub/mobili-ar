// ============================================================
// MOBILI-AR — Conexión a la base de datos SQLite
// Archivo  : src-tauri/src/db/connection.rs
// Módulo   : F1-02 — Esquema SQLite en Rust
// Depende  : rusqlite, anyhow, db::schema
// Expone   : abrir()
// Creado   : [fecha]
// ============================================================

use rusqlite::Connection;
use std::path::Path;

/// Abre (o crea) la base de datos en la ruta indicada
/// y la inicializa con el schema completo.
///
/// Si el archivo ya existe, no lo sobreescribe —
/// CREATE TABLE IF NOT EXISTS protege los datos existentes.
///
/// # Argumentos
/// * `ruta` - Ruta completa al archivo .db (ej: C:\taller\mobiliar.db)
///
/// # Errores
/// Retorna Err si no se puede crear/abrir el archivo
/// o si alguna sentencia del schema falla.
pub fn abrir(ruta: &Path) -> anyhow::Result<Connection> {
    let conn = Connection::open(ruta)?;

    // ── PRAGMAS DE RENDIMIENTO Y SEGURIDAD ───────────────────
    // WAL: permite lecturas simultáneas desde múltiples terminales
    // mientras una escritura está en curso.
    conn.execute_batch("PRAGMA journal_mode = WAL;")?;

    // Activa verificación de claves foráneas (desactivado por defecto en SQLite)
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;

    // ── INICIALIZAR SCHEMA ────────────────────────────────────
    super::schema::inicializar(&conn)?;

    Ok(conn)
}