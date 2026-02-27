// ============================================================
// MOBILI-AR — Persistencia de configuración de ensamble
// Archivo  : src-tauri/src/db/ensamble.rs
// Módulo   : F3-01
// ============================================================

use rusqlite::{params, Connection};
use crate::types::{EnsambleConfig, FondoTipo};

pub fn get(conn: &Connection, modulo_id: &str) -> rusqlite::Result<EnsambleConfig> {
    conn.query_row(
        "SELECT modulo_id, costado_pasante_techo, costado_pasante_piso,
                fondo_tipo, fondo_retranqueo
         FROM modulo_ensamble WHERE modulo_id = ?1",
        params![modulo_id],
        |row| {
            let fondo_tipo_str: String = row.get(3)?;
            let fondo_tipo = if fondo_tipo_str == "pasante" {
                FondoTipo::Pasante
            } else {
                FondoTipo::Interno
            };
            Ok(EnsambleConfig {
                modulo_id:             row.get(0)?,
                costado_pasante_techo: row.get::<_, i64>(1)? == 1,
                costado_pasante_piso:  row.get::<_, i64>(2)? == 1,
                fondo_tipo,
                fondo_retranqueo:      row.get(4)?,
            })
        },
    )
}

pub fn set(conn: &Connection, config: &EnsambleConfig) -> rusqlite::Result<()> {
    let fondo_tipo_str = match config.fondo_tipo {
        FondoTipo::Pasante => "pasante",
        FondoTipo::Interno => "interno",
    };
    conn.execute(
        "INSERT INTO modulo_ensamble
            (modulo_id, costado_pasante_techo, costado_pasante_piso, fondo_tipo, fondo_retranqueo)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(modulo_id) DO UPDATE SET
            costado_pasante_techo = excluded.costado_pasante_techo,
            costado_pasante_piso  = excluded.costado_pasante_piso,
            fondo_tipo            = excluded.fondo_tipo,
            fondo_retranqueo      = excluded.fondo_retranqueo",
        params![
            config.modulo_id,
            config.costado_pasante_techo as i64,
            config.costado_pasante_piso  as i64,
            fondo_tipo_str,
            config.fondo_retranqueo,
        ],
    )?;
    Ok(())
}

/// Si el módulo no tiene ensamble configurado, devuelve uno con defaults.
pub fn get_o_default(conn: &Connection, modulo_id: &str) -> EnsambleConfig {
    get(conn, modulo_id).unwrap_or_else(|_| EnsambleConfig {
        modulo_id:             modulo_id.to_string(),
        costado_pasante_techo: true,
        costado_pasante_piso:  true,
        fondo_tipo:            FondoTipo::Interno,
        fondo_retranqueo:      12.0,
    })
}