// ============================================================
// MOBILI-AR — Módulo de base de datos
// Archivo  : src-tauri/src/db/mod.rs
// ============================================================
pub mod composiciones;
pub mod connection;
pub mod schema;
pub mod trabajos;
pub use connection::abrir;
use rusqlite::Connection;
use std::sync::Mutex;

/// Estado global de la conexión SQLite.
pub struct DbState(pub Mutex<Option<Connection>>);

pub mod usuarios;
pub mod mansiones;
pub mod sesiones;
pub mod cantos;
pub mod ensamble;
pub mod piezas;
pub mod materiales;