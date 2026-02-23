// ============================================================
// MOBILI-AR — Queries de sesiones
// Archivo  : src-tauri/src/db/sesiones.rs
// Módulo   : F2-01/02 — Usuarios y Sesiones
// ============================================================

use rusqlite::{Connection, params};
use uuid::Uuid;
use crate::types::{SesionActiva, Usuario, Mansion};
use crate::db::mansiones;
use crate::db::usuarios::actualizar_ultimo_acceso;

/// Abre una nueva sesión para el usuario.
/// Cierra cualquier sesión activa previa del mismo usuario.
pub fn abrir(conn: &Connection, usuario_id: &str, mansion_id: &str) -> anyhow::Result<String> {
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    // Cerrar sesiones activas previas
    conn.execute(
        "UPDATE sesiones SET activa = 0, cerrada_en = ?1
         WHERE usuario_id = ?2 AND activa = 1",
        params![ahora, usuario_id],
    )?;

    // Crear nueva sesión
    let sesion_id = Uuid::new_v4().to_string();
    conn.execute(
        "INSERT INTO sesiones (id, usuario_id, mansion_id, iniciada_en, activa)
         VALUES (?1, ?2, ?3, ?4, 1)",
        params![sesion_id, usuario_id, mansion_id, ahora],
    )?;

    actualizar_ultimo_acceso(conn, usuario_id)?;

    Ok(sesion_id)
}

/// Cierra la sesión activa del usuario.
pub fn cerrar(conn: &Connection, usuario_id: &str) -> anyhow::Result<()> {
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    conn.execute(
        "UPDATE sesiones SET activa = 0, cerrada_en = ?1
         WHERE usuario_id = ?2 AND activa = 1",
        params![ahora, usuario_id],
    )?;
    Ok(())
}

/// Construye el estado completo de sesión activa para un usuario.
/// Retorna None si no hay sesión activa.
pub fn get_activa(conn: &Connection, usuario_id: &str) -> anyhow::Result<Option<SesionActiva>> {
    let resultado = conn.query_row(
        "SELECT s.id, s.iniciada_en,
                u.id, u.nombre, u.apellido, u.rol, u.token, u.activo, u.ultimo_acceso,
                m.id, m.codigo, m.nombre, m.activo
         FROM sesiones s
         JOIN usuarios  u ON u.id = s.usuario_id
         JOIN mansiones m ON m.id = s.mansion_id
         WHERE s.usuario_id = ?1 AND s.activa = 1
         ORDER BY s.iniciada_en DESC LIMIT 1",
        params![usuario_id],
        |row| {
            Ok((
                row.get::<_, String>(0)?,   // sesion_id
                row.get::<_, String>(1)?,   // iniciada_en
                row.get::<_, String>(2)?,   // usuario.id
                row.get::<_, String>(3)?,   // nombre
                row.get::<_, String>(4)?,   // apellido
                row.get::<_, String>(5)?,   // rol
                row.get::<_, String>(6)?,   // token
                row.get::<_, i64>(7)?,      // activo
                row.get::<_, Option<String>>(8)?, // ultimo_acceso
                row.get::<_, String>(9)?,   // mansion.id
                row.get::<_, String>(10)?,  // mansion.codigo
                row.get::<_, String>(11)?,  // mansion.nombre
                row.get::<_, i64>(12)?,     // mansion.activo
            ))
        },
    );

    match resultado {
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.into()),
        Ok((sesion_id, iniciada_en,
            uid, nombre, apellido, rol, token, activo, ultimo_acceso,
            mid, codigo, mnombre, mactivo)) => {

            let usuario = Usuario {
                id: uid.clone(), nombre, apellido,
                rol: rol.clone(), token,
                activo: activo != 0,
                ultimo_acceso,
            };

            let mansion_activa = Mansion {
                id: mid, codigo, nombre: mnombre, activo: mactivo != 0,
            };

            // Mansiones habilitadas según rol
            let mansiones_habilitadas = mansiones::get_para_usuario(conn, &uid, &rol)?;

            Ok(Some(SesionActiva {
                sesion_id,
                usuario,
                mansion_activa,
                mansiones_habilitadas,
                iniciada_en,
            }))
        }
    }
}