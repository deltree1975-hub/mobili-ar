// ============================================================
// MOBILI-AR — Queries SQLite: Trabajos
// Archivo  : src-tauri/src/db/trabajos.rs
// Módulo   : F1-04 — Capa de comandos Tauri
// Depende  : rusqlite, types::Trabajo
// Expone   : get_activos(), crear(), actualizar(), cambiar_estado()
// Creado   : [fecha]
// ============================================================

use crate::types::{ActualizarTrabajoInput, CrearTrabajoInput, Trabajo};
use rusqlite::{Connection, params};
use uuid::Uuid;

/// Retorna todos los trabajos ordenados por prioridad.
/// Si incluir_archivados es false, filtra estado='archivado'.
pub fn get_activos(
    conn: &Connection,
    incluir_archivados: bool,
) -> anyhow::Result<Vec<Trabajo>> {
    let sql = if incluir_archivados {
        "SELECT id, nombre, cliente, notas, estado, prioridad,
                fecha_entrega, creado_en
         FROM trabajos
         ORDER BY prioridad ASC, creado_en ASC"
    } else {
        "SELECT id, nombre, cliente, notas, estado, prioridad,
                fecha_entrega, creado_en
         FROM trabajos
         WHERE estado != 'archivado'
         ORDER BY prioridad ASC, creado_en ASC"
    };

    let mut stmt = conn.prepare(sql)?;
    let trabajos = stmt.query_map([], |row| {
        Ok(Trabajo {
            id:            row.get(0)?,
            nombre:        row.get(1)?,
            cliente:       row.get(2)?,
            notas:         row.get(3)?,
            estado:        row.get(4)?,
            prioridad:     row.get(5)?,
            fecha_entrega: row.get(6)?,
            creado_en:     row.get(7)?,
        })
    })?
    .collect::<Result<Vec<_>, _>>()?;

    Ok(trabajos)
}

/// Inserta un nuevo trabajo y retorna el objeto creado.
pub fn crear(conn: &Connection, datos: CrearTrabajoInput) -> anyhow::Result<Trabajo> {
    let id = Uuid::new_v4().to_string();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO trabajos (id, nombre, cliente, notas, estado, prioridad, creado_en)
         VALUES (?1, ?2, ?3, ?4, 'en_diseno', 99, ?5)",
        params![id, datos.nombre, datos.cliente, datos.notas, ahora],
    )?;

    Ok(Trabajo {
        id,
        nombre:        datos.nombre,
        cliente:       datos.cliente,
        notas:         datos.notas,
        estado:        "en_diseno".to_string(),
        prioridad:     99,
        fecha_entrega: None,
        creado_en:     ahora,
    })
}

/// Actualiza campos editables de un trabajo existente.
pub fn actualizar(
    conn: &Connection,
    id: &str,
    datos: ActualizarTrabajoInput,
) -> anyhow::Result<Trabajo> {
    // Actualizar solo los campos que vienen en el input
    if let Some(nombre) = &datos.nombre {
        conn.execute("UPDATE trabajos SET nombre = ?1 WHERE id = ?2",
            params![nombre, id])?;
    }
    if let Some(cliente) = &datos.cliente {
        conn.execute("UPDATE trabajos SET cliente = ?1 WHERE id = ?2",
            params![cliente, id])?;
    }
    if let Some(notas) = &datos.notas {
        conn.execute("UPDATE trabajos SET notas = ?1 WHERE id = ?2",
            params![notas, id])?;
    }
    if let Some(prioridad) = datos.prioridad {
        conn.execute("UPDATE trabajos SET prioridad = ?1 WHERE id = ?2",
            params![prioridad, id])?;
    }
    if let Some(fecha) = &datos.fecha_entrega {
        conn.execute("UPDATE trabajos SET fecha_entrega = ?1 WHERE id = ?2",
            params![fecha, id])?;
    }

    // Retornar el trabajo actualizado
    let trabajo = conn.query_row(
        "SELECT id, nombre, cliente, notas, estado, prioridad,
                fecha_entrega, creado_en
         FROM trabajos WHERE id = ?1",
        params![id],
        |row| Ok(Trabajo {
            id:            row.get(0)?,
            nombre:        row.get(1)?,
            cliente:       row.get(2)?,
            notas:         row.get(3)?,
            estado:        row.get(4)?,
            prioridad:     row.get(5)?,
            fecha_entrega: row.get(6)?,
            creado_en:     row.get(7)?,
        }),
    )?;

    Ok(trabajo)
}

/// Cambia el estado de un trabajo y registra el cambio en el historial.
pub fn cambiar_estado(
    conn: &Connection,
    trabajo_id: &str,
    nuevo_estado: &str,
    usuario_nombre: &str,
    notas: Option<&str>,
) -> anyhow::Result<()> {
    // Obtener estado actual
    let estado_anterior: String = conn.query_row(
        "SELECT estado FROM trabajos WHERE id = ?1",
        params![trabajo_id],
        |row| row.get(0),
    )?;

    // Actualizar estado
    conn.execute(
        "UPDATE trabajos SET estado = ?1 WHERE id = ?2",
        params![nuevo_estado, trabajo_id],
    )?;

    // Registrar en historial
    let id_historial = Uuid::new_v4().to_string();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO historial_estados_trabajo
         (id, trabajo_id, estado_anterior, estado_nuevo, usuario_nombre, notas, timestamp)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            id_historial, trabajo_id, estado_anterior,
            nuevo_estado, usuario_nombre, notas, ahora
        ],
    )?;

    Ok(())
}