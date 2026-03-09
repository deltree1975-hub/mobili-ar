// ============================================================
// MOBILI-AR — Queries SQLite: Listas de Corte
// Archivo  : src-tauri/src/db/listas_corte.rs
// Módulo   : B4-02
// ============================================================

use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::types::{ListaCorte, ListaCorteModulo, ModuloParaLista};

/// Retorna todos los módulos de un trabajo enriquecidos con estado de lista.
/// Usado por el modal de selección.
pub fn get_modulos_para_lista(
    conn:      &Connection,
    trabajo_id: &str,
) -> rusqlite::Result<Vec<ModuloParaLista>> {
    let mut stmt = conn.prepare(
        "SELECT
            m.id,
            m.nombre,
            c.id,
            c.nombre,
            m.ancho,
            m.alto,
            m.profundidad,
            -- tiene_piezas: al menos una pieza confirmada
            (SELECT COUNT(*) FROM piezas p WHERE p.modulo_id = m.id) > 0,
            -- en_lista_id: lista activa donde está este módulo sin motivo
            (SELECT lm.lista_id FROM listas_corte_modulos lm
             WHERE lm.modulo_id = m.id AND lm.motivo IS NULL
             LIMIT 1),
            -- motivo si está en lista
            (SELECT lm.motivo FROM listas_corte_modulos lm
             WHERE lm.modulo_id = m.id AND lm.motivo IS NULL
             LIMIT 1)
         FROM modulos m
         JOIN composiciones c ON m.composicion_id = c.id
         WHERE c.trabajo_id = ?1
         ORDER BY c.orden ASC, m.creado_en ASC",
    )?;

    let rows = stmt.query_map(params![trabajo_id], |row| {
        Ok(ModuloParaLista {
            modulo_id:      row.get(0)?,
            modulo_nombre:  row.get(1)?,
            composicion_id: row.get(2)?,
            comp_nombre:    row.get(3)?,
            ancho:          row.get(4)?,
            alto:           row.get(5)?,
            profundidad:    row.get(6)?,
            tiene_piezas:   row.get::<_, i64>(7)? != 0,
            en_lista_id:    row.get(8)?,
            motivo:         row.get(9)?,
        })
    })?;

    rows.collect()
}

pub fn crear_lista(
    conn:       &Connection,
    trabajo_id: &str,
    nombre:     &str,
    modulo_ids: &[String],
) -> rusqlite::Result<ListaCorte> {
    let id    = Uuid::new_v4().to_string();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let numero_ot: i64 = conn.query_row(
        "SELECT COALESCE(numero_ot, 0) FROM trabajos WHERE id = ?1",
        params![trabajo_id],
        |row| row.get(0),
    ).unwrap_or(0);

    conn.execute_batch("BEGIN;")?;

    let resultado = (|| -> rusqlite::Result<()> {
        conn.execute(
            "INSERT INTO listas_corte (id, trabajo_id, numero_ot, nombre, creado_en)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![id, trabajo_id, numero_ot, nombre, ahora],
        )?;

        for modulo_id in modulo_ids {
            let item_id = Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO listas_corte_modulos (id, lista_id, modulo_id, incluido, creado_en)
                 VALUES (?1, ?2, ?3, 1, ?4)",
                params![item_id, id, modulo_id, ahora],
            )?;
        }
        Ok(())
    })();

    match resultado {
        Ok(_) => {
            conn.execute_batch("COMMIT;")?;
            Ok(ListaCorte {
                id,
                trabajo_id: trabajo_id.to_string(),
                numero_ot,
                nombre: nombre.to_string(),
                output_pdf: None,
                output_dir: None,
                creado_en: ahora,
            })
        }
        Err(e) => {
            let _ = conn.execute_batch("ROLLBACK;");
            Err(e)
        }
    }
}
/// Actualiza las rutas de salida tras generar los archivos.
pub fn actualizar_output(
    conn:      &Connection,
    lista_id:  &str,
    pdf:       &str,
    dir:       &str,
) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE listas_corte SET output_pdf = ?1, output_dir = ?2 WHERE id = ?3",
        params![pdf, dir, lista_id],
    )?;
    Ok(())
}

/// Retorna todas las listas de un trabajo.
pub fn get_listas_trabajo(
    conn:      &Connection,
    trabajo_id: &str,
) -> rusqlite::Result<Vec<ListaCorte>> {
    let mut stmt = conn.prepare(
        "SELECT id, trabajo_id, numero_ot, nombre, output_pdf, output_dir, creado_en
         FROM listas_corte
         WHERE trabajo_id = ?1
         ORDER BY creado_en DESC",
    )?;

    let rows = stmt.query_map(params![trabajo_id], |row| {
        Ok(ListaCorte {
            id:         row.get(0)?,
            trabajo_id: row.get(1)?,
            numero_ot:  row.get(2)?,
            nombre:     row.get(3)?,
            output_pdf: row.get(4)?,
            output_dir: row.get(5)?,
            creado_en:  row.get(6)?,
        })
    })?;

    rows.collect()
}

/// Retorna los módulos de una lista.
pub fn get_modulos_lista(
    conn:     &Connection,
    lista_id: &str,
) -> rusqlite::Result<Vec<ListaCorteModulo>> {
    let mut stmt = conn.prepare(
        "SELECT id, lista_id, modulo_id, incluido, motivo, creado_en
         FROM listas_corte_modulos
         WHERE lista_id = ?1",
    )?;

    let rows = stmt.query_map(params![lista_id], |row| {
        Ok(ListaCorteModulo {
            id:        row.get(0)?,
            lista_id:  row.get(1)?,
            modulo_id: row.get(2)?,
            incluido:  row.get::<_, i64>(3)? != 0,
            motivo:    row.get(4)?,
            creado_en: row.get(5)?,
        })
    })?;

    rows.collect()
}
/// Elimina una lista y sus módulos, liberándolos para nuevas listas.
pub fn anular_lista(
    conn:     &Connection,
    lista_id: &str,
) -> rusqlite::Result<()> {
    conn.execute(
        "DELETE FROM listas_corte WHERE id = ?1",
        rusqlite::params![lista_id],
    )?;
    Ok(())
}