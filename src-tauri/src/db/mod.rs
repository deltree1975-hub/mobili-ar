// ============================================================
// MOBILI-AR — Módulo de base de datos
// Archivo  : src-tauri/src/db/mod.rs
// Módulo   : F1-02 — Esquema SQLite en Rust
// Depende  : rusqlite (Cargo.toml)
// Expone   : DbState (estado global), abrir()
// Creado   : [fecha]
// ============================================================

pub mod connection;
pub mod schema;

// Re-exportar lo que usa el resto de la app
pub use connection::abrir;

use rusqlite::Connection;
use std::sync::Mutex;

/// Estado global de la conexión a SQLite.
/// Se registra en Tauri con .manage() y se accede
/// desde cualquier comando con State<DbState>.
///
/// RAZÓN: Mutex porque Tauri puede llamar comandos
/// desde múltiples hilos. Mutex garantiza acceso
/// exclusivo a la conexión en cada operación.
pub struct DbState(pub Mutex<Option<Connection>>);