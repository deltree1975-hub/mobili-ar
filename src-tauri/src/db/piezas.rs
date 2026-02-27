// ============================================================
// MOBILI-AR — Persistencia de piezas calculadas
// Archivo  : src-tauri/src/db/piezas.rs
// Módulo   : F3-01
// ============================================================

use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::types::PiezaCalculada;

pub fn guardar_piezas_modulo(
    conn: &Connection,
    modulo_id: &str,
    piezas: &[PiezaCalculada],
) -> rusqlite::Result<()> {
    // Eliminar piezas anteriores del módulo antes de insertar
    conn.execute("DELETE FROM piezas WHERE modulo_id = ?1", params![modulo_id])?;

    for pieza in piezas {
        let id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO piezas (
                id, modulo_id, tipo, nombre, codigo_generico,
                ancho, alto, espesor,
                ancho_nominal, alto_nominal, ancho_corte, alto_corte,
                regaton_alto, estado_actual
             ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,'pendiente_corte')",
            params![
                id,
                modulo_id,
                pieza.tipo,
                pieza.nombre,
                pieza.codigo,
                pieza.ancho_nominal, // ancho legacy
                pieza.alto_nominal,  // alto legacy
                pieza.espesor,
                pieza.ancho_nominal,
                pieza.alto_nominal,
                pieza.ancho_corte,
                pieza.alto_corte,
                pieza.regaton_alto,
            ],
        )?;
    }
    Ok(())
}

pub fn get_piezas_modulo(
    conn: &Connection,
    modulo_id: &str,
) -> rusqlite::Result<Vec<PiezaCalculada>> {
    let mut stmt = conn.prepare(
        "SELECT tipo, nombre, codigo_generico,
                ancho_nominal, alto_nominal, ancho_corte, alto_corte,
                espesor, regaton_alto
         FROM piezas WHERE modulo_id = ?1 ORDER BY rowid"
    )?;
    let rows = stmt.query_map(params![modulo_id], |row| {
        Ok(PiezaCalculada {
            tipo:          row.get(0)?,
            nombre:        row.get(1)?,
            codigo:        row.get(2)?,
            ancho_nominal: row.get(3)?,
            alto_nominal:  row.get(4)?,
            ancho_corte:   row.get(5)?,
            alto_corte:    row.get(6)?,
            espesor:       row.get(7)?,
            regaton_alto:  row.get(8)?,
        })
    })?;
    rows.collect()
}