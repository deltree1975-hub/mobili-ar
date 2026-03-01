// ============================================================
// MOBILI-AR — Schema de base de datos
// Archivo  : src-tauri/src/db/schema.rs
// Módulo   : F1-02 / F3-01
// ============================================================

const SCHEMA_SQL: &str = include_str!("../../../mobiliar-schema.sql");

pub fn inicializar(conn: &rusqlite::Connection) -> anyhow::Result<()> {
    conn.execute_batch(SCHEMA_SQL)?;
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

    // ── Migración v4 ──────────────────────────────────────────
    if version < 4 {
        // Nueva tabla disposiciones
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS disposiciones (
                id             TEXT PRIMARY KEY NOT NULL,
                nombre         TEXT NOT NULL,
                tiene_fajas    INTEGER NOT NULL DEFAULT 0,
                posicion_faja  TEXT DEFAULT NULL
                               CHECK (posicion_faja IN ('superior','inferior')),
                alto_faja      REAL NOT NULL DEFAULT 80,
                activo         INTEGER NOT NULL DEFAULT 1,
                creado_en      TEXT NOT NULL DEFAULT (datetime('now'))
            );

            INSERT OR IGNORE INTO disposiciones (id, nombre, tiene_fajas, posicion_faja) VALUES
                ('bm',       'Bajomesa',           1, 'superior'),
                ('al',       'Aéreo',              0, NULL),
                ('to',       'Torre',              0, NULL),
                ('ca',       'Cajón',              0, NULL),
                ('ab',       'Abierto',            0, NULL),
                ('me',       'Mesa',               0, NULL),
                ('es',       'Estante',            0, NULL),
                ('co',       'Columna',            0, NULL),
                ('caj-plac', 'Cajonera de placar', 1, 'inferior');
        ")?;

        // Nuevas columnas en modulos
        // tiene_fondo: si el módulo lleva fondo (bajomesadas pueden no llevar)
        let _ = conn.execute_batch(
            "ALTER TABLE modulos ADD COLUMN tiene_fondo INTEGER NOT NULL DEFAULT 1",
        );
        // alto_faja: alto de las fajas en mm (default 80mm, configurable por módulo)
        let _ = conn.execute_batch(
            "ALTER TABLE modulos ADD COLUMN alto_faja REAL NOT NULL DEFAULT 80",
        );

        conn.execute_batch(
            "INSERT OR IGNORE INTO schema_version (version, descripcion)
             VALUES (4, 'F3-01 - disposiciones, fajas y tiene_fondo en modulos');",
        )?;
    }

    Ok(())
}