// ============================================================
// MOBILI-AR — Queries de usuarios
// Archivo  : src-tauri/src/db/usuarios.rs
// Módulo   : F2-01/02 — Usuarios y Sesiones
// ============================================================

use rusqlite::{Connection, params};
use uuid::Uuid;
use crate::types::{Usuario, CrearUsuarioInput};

/// Busca un usuario por token (lectura de tarjeta).
pub fn buscar_por_token(conn: &Connection, token: &str) -> anyhow::Result<Option<Usuario>> {
    let mut stmt = conn.prepare(
        "SELECT id, nombre, apellido, rol, token, activo, ultimo_acceso
         FROM usuarios WHERE token = ?1 AND activo = 1"
    )?;

    let mut rows = stmt.query_map(params![token], |row| {
        Ok(Usuario {
            id:            row.get(0)?,
            nombre:        row.get(1)?,
            apellido:      row.get(2)?,
            rol:            row.get(3)?,
            token:         row.get(4)?,
            activo:        row.get::<_, i64>(5)? != 0,
            ultimo_acceso: row.get(6)?,
        })
    })?;

    Ok(rows.next().transpose()?)
}

/// Retorna todos los usuarios.
pub fn get_todos(conn: &Connection) -> anyhow::Result<Vec<Usuario>> {
    let mut stmt = conn.prepare(
        "SELECT id, nombre, apellido, rol, token, activo, ultimo_acceso
         FROM usuarios ORDER BY nombre ASC"
    )?;

    let items = stmt.query_map([], |row| {
        Ok(Usuario {
            id:            row.get(0)?,
            nombre:        row.get(1)?,
            apellido:      row.get(2)?,
            rol:            row.get(3)?,
            token:         row.get(4)?,
            activo:        row.get::<_, i64>(5)? != 0,
            ultimo_acceso: row.get(6)?,
        })
    })?.collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}

/// Crea un nuevo usuario y le asigna mansiones habilitadas.
pub fn crear(conn: &Connection, datos: CrearUsuarioInput) -> anyhow::Result<Usuario> {
    let id    = Uuid::new_v4().to_string();
    let token = generar_token();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO usuarios (id, nombre, apellido, rol, token, activo, creado_en)
         VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6)",
        params![id, datos.nombre, datos.apellido, datos.rol, token, ahora],
    )?;

    for mansion_id in &datos.mansiones {
        conn.execute(
            "INSERT OR IGNORE INTO usuario_mansiones (usuario_id, mansion_id)
             VALUES (?1, ?2)",
            params![id, mansion_id],
        )?;
    }

    Ok(Usuario {
        id,
        nombre:        datos.nombre,
        apellido:      datos.apellido,
        rol:            datos.rol,
        token,
        activo:        true,
        ultimo_acceso: None,
    })
}

/// Actualiza el timestamp de último acceso.
pub fn actualizar_ultimo_acceso(conn: &Connection, usuario_id: &str) -> anyhow::Result<()> {
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    conn.execute(
        "UPDATE usuarios SET ultimo_acceso = ?1 WHERE id = ?2",
        params![ahora, usuario_id],
    )?;
    Ok(())
}

/// Genera token único para la tarjeta. Formato: MOBILI-XXXX-XXXX
pub fn generar_token() -> String {
    let id = Uuid::new_v4().to_string();
    let partes: Vec<&str> = id.split('-').collect();
    format!("MOBILI-{}-{}", partes[0].to_uppercase(), partes[1].to_uppercase())
}