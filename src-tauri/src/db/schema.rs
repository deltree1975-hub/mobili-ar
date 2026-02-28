// ============================================================
// MOBILI-AR — Schema de base de datos
// Archivo  : src-tauri/src/db/schema.rs
// Módulo   : F1-02 / F3-01
// ============================================================

const SCHEMA_SQL: &str = include_str!("../../../mobiliar-schema.sql");

pub fn inicializar(conn: &rusqlite::Connection) -> anyhow::Result<()> {
    // Ejecuta el schema base — solo CREATE TABLE IF NOT EXISTS
    conn.execute_batch(SCHEMA_SQL)?;

    // Ejecuta migraciones pendientes
    migrar(conn)?;

    Ok(())
}

fn version_actual(conn: &rusqlite::Connection) -> i64 {
    conn.query_row(
        "SELECT MAX(version) FROM schema_version",
        [],
        |row| row.get::<_, Option<i64>>(0),
    )
    .unwrap_or(None)
    .unwrap_or(0)
}

fn migrar(conn: &rusqlite::Connection) -> anyhow::Result<()> {
    let version = version_actual(conn);

    // ── Migración v2 ──────────────────────────────────────────
    if version < 2 {
        let columnas_piezas = [
            "ALTER TABLE piezas ADD COLUMN ancho_nominal      REAL NOT NULL DEFAULT 0",
            "ALTER TABLE piezas ADD COLUMN alto_nominal        REAL NOT NULL DEFAULT 0",
            "ALTER TABLE piezas ADD COLUMN ancho_corte         REAL NOT NULL DEFAULT 0",
            "ALTER TABLE piezas ADD COLUMN alto_corte          REAL NOT NULL DEFAULT 0",
            "ALTER TABLE piezas ADD COLUMN canto_frente_id     TEXT REFERENCES cantos(id)",
            "ALTER TABLE piezas ADD COLUMN canto_posterior_id  TEXT REFERENCES cantos(id)",
            "ALTER TABLE piezas ADD COLUMN canto_superior_id   TEXT REFERENCES cantos(id)",
            "ALTER TABLE piezas ADD COLUMN canto_inferior_id   TEXT REFERENCES cantos(id)",
            "ALTER TABLE piezas ADD COLUMN regaton_alto        REAL NOT NULL DEFAULT 0",
        ];

        for sql in &columnas_piezas {
            let _ = conn.execute_batch(sql);
        }

        conn.execute_batch(
            "UPDATE configuracion_terminal SET valor = '0.5' WHERE clave = 'offset_pieza';
             INSERT OR IGNORE INTO schema_version (version, descripcion)
             VALUES (2, 'F3-01 - Motor de calculo de piezas, cantos y ensamble');",
        )?;
    }

    // ── Migración v3 ──────────────────────────────────────────
    if version < 3 {
        let _ = conn.execute_batch(
            "ALTER TABLE cantos ADD COLUMN alto_canto   REAL NOT NULL DEFAULT 22",
        );
        let _ = conn.execute_batch(
            "ALTER TABLE cantos ADD COLUMN stock_metros REAL NOT NULL DEFAULT 0",
        );

        conn.execute_batch(
            "INSERT OR IGNORE INTO schema_version (version, descripcion)
             VALUES (3, 'F3-01 - alto_canto y stock_metros en tabla cantos');",
        )?;
    }

    Ok(())
}