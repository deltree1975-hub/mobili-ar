// ============================================================
// MOBILI-AR — Persistencia de piezas calculadas
// Archivo  : src-tauri/src/db/piezas.rs
// Módulo   : F3-01 / F3-04
// ============================================================

use rusqlite::{params, Connection};
use uuid::Uuid;
use crate::types::{ConfigPieza, PiezaCalculada};

pub fn get_piezas_modulo(
    conn:      &Connection,
    modulo_id: &str,
) -> rusqlite::Result<Vec<PiezaCalculada>> {
    let mut stmt = conn.prepare(
        "SELECT tipo, nombre, codigo,
                ancho_nominal, alto_nominal, ancho_corte, alto_corte,
                espesor, regaton_alto,
                material_id,
                canto_frente_id, canto_posterior_id,
                canto_superior_id, canto_inferior_id
         FROM piezas WHERE modulo_id = ?1 ORDER BY rowid",
    )?;

    let rows = stmt.query_map(params![modulo_id], |row| {
        Ok(PiezaCalculada {
            tipo:               row.get(0)?,
            nombre:             row.get(1)?,
            codigo:             row.get(2)?,
            ancho_nominal:      row.get(3)?,
            alto_nominal:       row.get(4)?,
            ancho_corte:        row.get(5)?,
            alto_corte:         row.get(6)?,
            espesor:            row.get(7)?,
            regaton_alto:       row.get(8)?,
            material_id:        row.get(9)?,
            canto_frente_id:    row.get(10)?,
            canto_posterior_id: row.get(11)?,
            canto_superior_id:  row.get(12)?,
            canto_inferior_id:  row.get(13)?,
        })
    })?;

    rows.collect()
}
// ── Función generadora de código ──────────────────────────────
fn generar_codigo_pieza(
    numero_ot:     i64,
    numero_modulo: i64,
    codigo_motor:  &str,   // ej: "LAT-IZQ", "TECHO", "EST-1"
) -> String {
    let ahora = chrono::Local::now();
    let anio_mes = ahora.format("%y%m").to_string(); // ej: "2603"
    // Normalizar codigo_motor: LAT-IZQ → LAT-I, FAJA-SUP-F → FAJ-SF
    let cod = codigo_motor
        .replace("FAJA-SUP-F", "FAJ-SF")
        .replace("FAJA-SUP-T", "FAJ-ST")
        .replace("FAJA-INF-F", "FAJ-IF")
        .replace("FAJA-INF-T", "FAJ-IT")
        .replace("LAT-IZQ",    "LAT-I")
        .replace("LAT-DER",    "LAT-D")
        .replace("DIV-",       "DIV");
    format!("{}-{:04}-{:03}-{}", anio_mes, numero_ot, numero_modulo, cod)
}

pub fn guardar_piezas_modulo(
    conn:          &Connection,
    modulo_id:     &str,
    piezas:        &[PiezaCalculada],
    configs:       &[ConfigPieza],
) -> rusqlite::Result<()> {
    // Obtener numero_ot y posición del módulo dentro de la OT
    let (numero_ot, numero_modulo): (i64, i64) = conn.query_row(
        "SELECT
            COALESCE(t.numero_ot, 0),
            (SELECT COUNT(*) FROM modulos m2
             JOIN composiciones c2 ON m2.composicion_id = c2.id
             WHERE c2.trabajo_id = t.id
               AND m2.creado_en <= m.creado_en)
         FROM modulos m
         JOIN composiciones c ON m.composicion_id = c.id
         JOIN trabajos t ON c.trabajo_id = t.id
         WHERE m.id = ?1",
        params![modulo_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    ).unwrap_or((0, 1));

    conn.execute("DELETE FROM piezas WHERE modulo_id = ?1", params![modulo_id])?;

    for (i, pieza) in piezas.iter().enumerate() {
        let id     = Uuid::new_v4().to_string();
        let config = configs.get(i).cloned().unwrap_or_default();
        let codigo = generar_codigo_pieza(numero_ot, numero_modulo, &pieza.codigo);

        conn.execute(
            "INSERT INTO piezas (
                id, modulo_id, tipo, nombre, codigo,
                ancho, alto, espesor,
                ancho_nominal, alto_nominal, ancho_corte, alto_corte,
                regaton_alto,
                material_id,
                canto_frente_id, canto_posterior_id,
                canto_superior_id, canto_inferior_id
             ) VALUES (
                ?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,
                ?14,?15,?16,?17,?18
             )",
            params![
                id,
                modulo_id,
                pieza.tipo,
                pieza.nombre,
                codigo,                  // ← código generado
                pieza.ancho_nominal,
                pieza.alto_nominal,
                pieza.espesor,
                pieza.ancho_nominal,
                pieza.alto_nominal,
                pieza.ancho_corte,
                pieza.alto_corte,
                pieza.regaton_alto,
                config.material_id,
                config.canto_frente_id,
                config.canto_posterior_id,
                config.canto_superior_id,
                config.canto_inferior_id,
            ],
        )?;
    }
    Ok(())
}