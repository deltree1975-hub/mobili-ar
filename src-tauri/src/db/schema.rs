// ============================================================
// MOBILI-AR -- Schema de base de datos
// Archivo  : src-tauri/src/db/schema.rs
// Modulo   : F1-02 / F3-01 / F3-02
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

fn columna_existe(conn: &rusqlite::Connection, tabla: &str, columna: &str) -> bool {
    let sql = format!("PRAGMA table_info({})", tabla);
    let mut stmt = match conn.prepare(&sql) {
        Ok(s) => s,
        Err(_) => return false,
    };
    let existe = stmt.query_map([], |row| row.get::<_, String>(1))
        .ok()
        .map(|rows| rows.flatten().any(|col| col == columna))
        .unwrap_or(false);
    existe
}

fn migrar(conn: &rusqlite::Connection) -> anyhow::Result<()> {
    let version = version_actual(conn);

    // -- Migracion v2 ------------------------------------------
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

    // -- Migracion v3 ------------------------------------------
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
    // -- Migracion v4 ------------------------------------------
    if version < 4 {
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
          INSERT OR IGNORE INTO disposiciones (id, nombre) VALUES
            ('bm',       'Bajomesada'),
            ('al',       'Alacena'),
            ('to',       'Torre'),
            ('ca',       'Cajon'),
            ('ab',       'Abierto'),
            ('me',       'Mesa'),
            ('es',       'Estante'),
            ('co',       'Columna'),
            ('caj-plac', 'Cajonera de placar');
        ")?;
    let _ = conn.execute_batch(
        "ALTER TABLE modulos ADD COLUMN tiene_fondo INTEGER NOT NULL DEFAULT 1",
    );
    let _ = conn.execute_batch(
        "ALTER TABLE modulos ADD COLUMN alto_faja REAL NOT NULL DEFAULT 80",
    );
    conn.execute_batch(
        "INSERT OR IGNORE INTO schema_version (version, descripcion)
         VALUES (4, 'F3-01 - disposiciones, fajas y tiene_fondo en modulos');",
    )?;
    }
   
    // -- Migracion v5 ------------------------------------------
    if version < 5 {
        let _ = conn.execute_batch(
            "ALTER TABLE modulos ADD COLUMN material_fondo_id TEXT REFERENCES materiales(id);",
        );
        let _ = conn.execute_batch(
            "ALTER TABLE modulos ADD COLUMN faja_acostada INTEGER NOT NULL DEFAULT 0;",
        );
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS divisores_modulo (
                id          TEXT PRIMARY KEY,
                modulo_id   TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
                posicion_x  REAL NOT NULL,
                desde       TEXT NOT NULL DEFAULT 'techo',
                hasta       TEXT NOT NULL DEFAULT 'piso',
                orden       INTEGER DEFAULT 0,
                creado_en   TEXT DEFAULT (datetime('now'))
            );
        ")?;
        conn.execute_batch(
            "INSERT OR IGNORE INTO schema_version (version, descripcion)
             VALUES (5, 'F3-02 - divisores_modulo, material_fondo_id, faja_acostada');",
        )?;
    }

    // -- Migracion v6 ------------------------------------------
    if version < 6 {
        let _ = conn.execute_batch("DROP TABLE IF EXISTS piezas_old;");
        conn.execute_batch("
            PRAGMA foreign_keys = OFF;

            ALTER TABLE piezas RENAME TO piezas_old;

            CREATE TABLE piezas (
                id                 TEXT PRIMARY KEY NOT NULL,
                modulo_id          TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
                tipo               TEXT NOT NULL
                                   CHECK (tipo IN ('side','horizontal','back','shelf','door','faja','divisor')),
                nombre             TEXT NOT NULL,
                codigo             TEXT NOT NULL DEFAULT '',
                ancho              REAL NOT NULL DEFAULT 0,
                alto               REAL NOT NULL DEFAULT 0,
                espesor            REAL NOT NULL DEFAULT 18,
                material_id        TEXT REFERENCES materiales(id),
                ancho_nominal      REAL NOT NULL DEFAULT 0,
                alto_nominal       REAL NOT NULL DEFAULT 0,
                ancho_corte        REAL NOT NULL DEFAULT 0,
                alto_corte         REAL NOT NULL DEFAULT 0,
                canto_frente_id    TEXT REFERENCES cantos(id),
                canto_posterior_id TEXT REFERENCES cantos(id),
                canto_superior_id  TEXT REFERENCES cantos(id),
                canto_inferior_id  TEXT REFERENCES cantos(id),
                regaton_alto       REAL NOT NULL DEFAULT 0,
                creado_en          TEXT NOT NULL DEFAULT (datetime('now'))
            );

            INSERT INTO piezas (
                id, modulo_id, tipo, nombre, codigo,
                ancho, alto, espesor, material_id,
                ancho_nominal, alto_nominal, ancho_corte, alto_corte,
                canto_frente_id, canto_posterior_id, canto_superior_id, canto_inferior_id,
                regaton_alto, creado_en
            )
            SELECT
                id, modulo_id, tipo, nombre, '',
                COALESCE(ancho, 0), COALESCE(alto, 0), COALESCE(espesor, 18), material_id,
                COALESCE(ancho_nominal, 0), COALESCE(alto_nominal, 0),
                COALESCE(ancho_corte, 0), COALESCE(alto_corte, 0),
                canto_frente_id, canto_posterior_id, canto_superior_id, canto_inferior_id,
                COALESCE(regaton_alto, 0), creado_en
            FROM piezas_old;

            DROP TABLE piezas_old;

            PRAGMA foreign_keys = ON;
        ")?;
        conn.execute_batch(
            "INSERT OR IGNORE INTO schema_version (version, descripcion)
             VALUES (6, 'F3-02 - piezas.tipo acepta faja y divisor, sin estado_actual');",
        )?;
    }

    // -- Migracion v7 ------------------------------------------
    if version < 7 {
        if columna_existe(conn, "materiales", "nombre") {
            let _ = conn.execute_batch("DROP TABLE IF EXISTS materiales_v7_new;");
            conn.execute_batch("
                PRAGMA foreign_keys = OFF;

                CREATE TABLE materiales_v7_new (
                    id        TEXT PRIMARY KEY,
                    tipo      TEXT NOT NULL,
                    color     TEXT NOT NULL DEFAULT '',
                    largo     REAL NOT NULL DEFAULT 2750.0,
                    ancho     REAL NOT NULL DEFAULT 1830.0,
                    espesor   REAL NOT NULL DEFAULT 18.0,
                    cantidad  INTEGER NOT NULL DEFAULT 0,
                    activo    INTEGER NOT NULL DEFAULT 1,
                    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
                );

                INSERT INTO materiales_v7_new (id, tipo, color, espesor, activo, creado_en)
                SELECT
                    id, tipo,
                    COALESCE(nombre, ''),
                    espesor,
                    COALESCE(activo, 1),
                    COALESCE(creado_en, datetime('now'))
                FROM materiales;

                DROP TABLE materiales;

                ALTER TABLE materiales_v7_new RENAME TO materiales;

                PRAGMA foreign_keys = ON;
            ")?;
        }
        conn.execute_batch(
            "INSERT OR IGNORE INTO schema_version (version, descripcion)
             VALUES (7, 'F3-01 - materiales: tipo, color, largo, ancho, cantidad');",
        )?;
    }

    // -- Migracion v8 ------------------------------------------
    // Ensamble: 2 campos globales → 4 campos independientes por esquina
    // costado_pasante_techo/piso → izq/der × techo/piso
    if version < 8 {
        if !columna_existe(conn, "modulo_ensamble", "costado_izq_pasante_techo") {
            // Agregar las 4 columnas nuevas
            let _ = conn.execute_batch(
                "ALTER TABLE modulo_ensamble ADD COLUMN costado_izq_pasante_techo INTEGER NOT NULL DEFAULT 1;"
            );
            let _ = conn.execute_batch(
                "ALTER TABLE modulo_ensamble ADD COLUMN costado_der_pasante_techo INTEGER NOT NULL DEFAULT 1;"
            );
            let _ = conn.execute_batch(
                "ALTER TABLE modulo_ensamble ADD COLUMN costado_izq_pasante_piso  INTEGER NOT NULL DEFAULT 1;"
            );
            let _ = conn.execute_batch(
                "ALTER TABLE modulo_ensamble ADD COLUMN costado_der_pasante_piso  INTEGER NOT NULL DEFAULT 1;"
            );

            // Poblar desde los valores anteriores — ambos lados heredan el valor viejo
            let _ = conn.execute_batch("
                UPDATE modulo_ensamble SET
                    costado_izq_pasante_techo = costado_pasante_techo,
                    costado_der_pasante_techo = costado_pasante_techo,
                    costado_izq_pasante_piso  = costado_pasante_piso,
                    costado_der_pasante_piso  = costado_pasante_piso;
            ");
        }
        conn.execute_batch(
            "INSERT OR IGNORE INTO schema_version (version, descripcion)
             VALUES (8, 'F3-04 - ensamble: 4 campos de costado independientes por esquina');",
        )?;
    }

    // -- Migracion v9 ------------------------------------------
// modulos: campos de paneles opcionales
// disposiciones: campos de paneles + ensamble default + es_sistema
if version < 9 {
    // Campos de paneles en modulos
    let campos_modulos = [
        "ALTER TABLE modulos ADD COLUMN tiene_techo       INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE modulos ADD COLUMN tiene_piso        INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE modulos ADD COLUMN tiene_costado_izq INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE modulos ADD COLUMN tiene_costado_der INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE modulos ADD COLUMN tiene_faja_sup    INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE modulos ADD COLUMN tiene_faja_inf    INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE modulos ADD COLUMN alto_faja_sup     REAL NOT NULL DEFAULT 80",
        "ALTER TABLE modulos ADD COLUMN alto_faja_inf     REAL NOT NULL DEFAULT 80",
    ];
    for sql in &campos_modulos {
        let _ = conn.execute_batch(sql);
    }

    // Campos nuevos en disposiciones
    let campos_disp = [
        "ALTER TABLE disposiciones ADD COLUMN tiene_techo               INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN tiene_piso                INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN tiene_costado_izq         INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN tiene_costado_der         INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN tiene_fondo               INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN tiene_faja_sup            INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE disposiciones ADD COLUMN tiene_faja_inf            INTEGER NOT NULL DEFAULT 0",
        "ALTER TABLE disposiciones ADD COLUMN alto_faja_sup             REAL NOT NULL DEFAULT 80",
        "ALTER TABLE disposiciones ADD COLUMN alto_faja_inf             REAL NOT NULL DEFAULT 80",
        "ALTER TABLE disposiciones ADD COLUMN costado_izq_pasante_techo INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN costado_der_pasante_techo INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN costado_izq_pasante_piso  INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN costado_der_pasante_piso  INTEGER NOT NULL DEFAULT 1",
        "ALTER TABLE disposiciones ADD COLUMN fondo_tipo                TEXT NOT NULL DEFAULT 'interno'",
        "ALTER TABLE disposiciones ADD COLUMN fondo_retranqueo          REAL NOT NULL DEFAULT 12",
        "ALTER TABLE disposiciones ADD COLUMN es_sistema                INTEGER NOT NULL DEFAULT 0",
    ];
    for sql in &campos_disp {
        let _ = conn.execute_batch(sql);
    }

    // Poblar defaults correctos para las disposiciones base
    let _ = conn.execute_batch("
        UPDATE disposiciones SET tiene_techo = 0, tiene_faja_sup = 1, es_sistema = 1
        WHERE id = 'bm';
        UPDATE disposiciones SET es_sistema = 1
        WHERE id IN ('al','to','ab','me','co');
        UPDATE disposiciones SET tiene_techo = 0, tiene_faja_inf = 1, es_sistema = 1
        WHERE id = 'caj-plac';
        UPDATE disposiciones SET tiene_piso = 0, tiene_fondo = 0, es_sistema = 1
        WHERE id = 'me';
        UPDATE disposiciones SET tiene_fondo = 0, es_sistema = 1
        WHERE id = 'ab';
    ");

    conn.execute_batch(
        "INSERT OR IGNORE INTO schema_version (version, descripcion)
         VALUES (9, 'B1-02 - paneles opcionales en modulos y disposiciones configurables');",
    )?;
    }
    // -- Migracion v10 -----------------------------------------
    if version < 10 {
        if !columna_existe(conn, "trabajos", "numero_ot") {
            let _ = conn.execute_batch(
                "ALTER TABLE trabajos ADD COLUMN numero_ot INTEGER;"
            );
            let _ = conn.execute_batch("
                UPDATE trabajos SET numero_ot = (
                    SELECT COUNT(*) FROM trabajos t2
                    WHERE t2.creado_en <= trabajos.creado_en
                );
            ");
        }
        conn.execute_batch(
            "INSERT OR IGNORE INTO schema_version (version, descripcion)
             VALUES (10, 'B4-01 - numero_ot secuencial en trabajos');",
        )?;
    }
    Ok(())
}