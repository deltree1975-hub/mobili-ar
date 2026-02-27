// ============================================================
// MOBILI-AR — Módulo de base de datos
// Archivo  : src-tauri/src/db/mod.rs
// Módulo   : F1-04 — Capa de comandos Tauri
// Creado   : [fecha]
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