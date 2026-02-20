// ============================================================
// MOBILI-AR — Schema de base de datos
// Archivo  : src-tauri/src/db/schema.rs
// Módulo   : F1-02 — Esquema SQLite en Rust
// Depende  : mobiliar-schema.sql (raíz del proyecto)
// Expone   : inicializar()
// Creado   : [fecha]
// ============================================================

// RAZÓN: include_str! embebe el contenido del SQL dentro del
// binario compilado. El instalador final no necesita distribuir
// el archivo .sql por separado — va adentro del .exe.
// La ruta es relativa a este archivo .rs.
const SCHEMA_SQL: &str = include_str!("../../../mobiliar-schema.sql");

/// Ejecuta el schema completo sobre la conexión dada.
/// Usa CREATE TABLE IF NOT EXISTS por lo que es seguro
/// llamar múltiples veces — no destruye datos existentes.
///
/// # Errores
/// Retorna Err si alguna sentencia SQL falla.
pub fn inicializar(conn: &rusqlite::Connection) -> anyhow::Result<()> {
    conn.execute_batch(SCHEMA_SQL)?;
    Ok(())
}