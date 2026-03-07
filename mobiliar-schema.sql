PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_version (
  version     INTEGER NOT NULL,
  aplicado_en TEXT    NOT NULL DEFAULT (datetime('now')),
  descripcion TEXT
);
INSERT OR IGNORE INTO schema_version (version, descripcion)
VALUES (1, 'Schema inicial MOBILI-AR v1.0');

CREATE TABLE IF NOT EXISTS configuracion_terminal (clave TEXT PRIMARY KEY NOT NULL, valor TEXT);
INSERT OR IGNORE INTO configuracion_terminal (clave, valor) VALUES
  ('nombre_terminal','Terminal Principal'),('kerf_sierra','3.2'),
  ('offset_pieza','0.5'),('modo_nesting_default','RAPIDO'),('version_schema','1');

CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY, nombre TEXT NOT NULL, apellido TEXT NOT NULL DEFAULT '',
    rol TEXT NOT NULL DEFAULT 'operario' CHECK(rol IN ('operario','disenador','admin','dueno')),
    token TEXT NOT NULL UNIQUE, pin TEXT, activo INTEGER NOT NULL DEFAULT 1,
    creado_en TEXT NOT NULL, ultimo_acceso TEXT);
CREATE INDEX IF NOT EXISTS idx_usuarios_token ON usuarios(token);

CREATE TABLE IF NOT EXISTS historial_tokens (
  id TEXT PRIMARY KEY NOT NULL, usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  token_revocado TEXT NOT NULL,
  motivo TEXT CHECK (motivo IN ('perdida','dano','renovacion_rutina','otro')),
  revocado_en TEXT NOT NULL DEFAULT (datetime('now')), revocado_por TEXT REFERENCES usuarios(id));

CREATE TABLE IF NOT EXISTS materiales (
  id        TEXT PRIMARY KEY NOT NULL,
  tipo      TEXT NOT NULL,
  color     TEXT NOT NULL DEFAULT '',
  largo     REAL NOT NULL DEFAULT 2750.0,
  ancho     REAL NOT NULL DEFAULT 1830.0,
  espesor   REAL NOT NULL DEFAULT 18.0,
  cantidad  INTEGER NOT NULL DEFAULT 0,
  activo    INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_materiales_activo ON materiales(activo);

CREATE TABLE IF NOT EXISTS trabajos (
  id TEXT PRIMARY KEY NOT NULL, nombre TEXT NOT NULL, cliente TEXT, notas TEXT,
  estado TEXT NOT NULL DEFAULT 'en_diseno'
    CHECK (estado IN ('en_diseno','aprobado','en_produccion','pausado','completado','entregado','archivado')),
  prioridad INTEGER NOT NULL DEFAULT 99, fecha_entrega TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')), creado_por TEXT REFERENCES usuarios(id));
CREATE INDEX IF NOT EXISTS idx_trabajos_estado ON trabajos(estado);

CREATE TABLE IF NOT EXISTS composiciones (
  id TEXT PRIMARY KEY NOT NULL, trabajo_id TEXT NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL, descripcion TEXT, orden INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')));

CREATE TABLE IF NOT EXISTS cantos (
  id TEXT PRIMARY KEY NOT NULL, nombre TEXT NOT NULL, color TEXT NOT NULL,
  material TEXT NOT NULL CHECK (material IN ('pvc','abs','aluminio','madera','otro')),
  espesor REAL NOT NULL, alto_canto REAL NOT NULL DEFAULT 22,
  stock_metros REAL NOT NULL DEFAULT 0, activo INTEGER NOT NULL DEFAULT 1,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_cantos_activo ON cantos(activo);

CREATE TABLE IF NOT EXISTS modulos (
  id TEXT PRIMARY KEY NOT NULL,
  composicion_id TEXT NOT NULL REFERENCES composiciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL, codigo TEXT, disposicion TEXT NOT NULL DEFAULT 'ab',
  ancho REAL NOT NULL DEFAULT 600, alto REAL NOT NULL DEFAULT 720,
  profundidad REAL NOT NULL DEFAULT 550, espesor_tablero REAL NOT NULL DEFAULT 18,
  espesor_fondo REAL NOT NULL DEFAULT 3,
  tipo_union TEXT NOT NULL DEFAULT 'cam_locks'
    CHECK (tipo_union IN ('cam_locks','dowels','screws','biscuits','pocket')),
  estado TEXT NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador','en_produccion','pausado','completado')),
  material_id TEXT REFERENCES materiales(id),
  cant_estantes INTEGER NOT NULL DEFAULT 0, cant_puertas INTEGER NOT NULL DEFAULT 0,
  apertura_puerta TEXT DEFAULT 'derecha', overlap_puertas REAL NOT NULL DEFAULT 2,
  offset_tirador REAL NOT NULL DEFAULT 0, color_material TEXT, color_puerta TEXT,
  canto_general_id TEXT REFERENCES cantos(id),
  tiene_fondo INTEGER NOT NULL DEFAULT 1, alto_faja REAL NOT NULL DEFAULT 80,
  material_fondo_id TEXT REFERENCES materiales(id), faja_acostada INTEGER NOT NULL DEFAULT 0,tiene_techo INTEGER NOT NULL DEFAULT 1,
  tiene_piso INTEGER NOT NULL DEFAULT 1,
  tiene_costado_izq INTEGER NOT NULL DEFAULT 1,
  tiene_costado_der INTEGER NOT NULL DEFAULT 1,
  tiene_faja_sup INTEGER NOT NULL DEFAULT 0,
  tiene_faja_inf INTEGER NOT NULL DEFAULT 0,
  alto_faja_sup REAL NOT NULL DEFAULT 80,
  alto_faja_inf REAL NOT NULL DEFAULT 80,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')));

CREATE TABLE IF NOT EXISTS herrajes (
  id TEXT PRIMARY KEY NOT NULL, modulo_id TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, descripcion TEXT NOT NULL, cantidad INTEGER NOT NULL DEFAULT 0);

CREATE TABLE IF NOT EXISTS piezas (
  id TEXT PRIMARY KEY NOT NULL,
  modulo_id TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('side','horizontal','back','shelf','door','faja','divisor')),
  nombre TEXT NOT NULL, codigo TEXT NOT NULL DEFAULT '',
  ancho REAL NOT NULL DEFAULT 0, alto REAL NOT NULL DEFAULT 0, espesor REAL NOT NULL DEFAULT 18,
  material_id TEXT REFERENCES materiales(id),
  ancho_nominal REAL NOT NULL DEFAULT 0, alto_nominal REAL NOT NULL DEFAULT 0,
  ancho_corte REAL NOT NULL DEFAULT 0, alto_corte REAL NOT NULL DEFAULT 0,
  canto_frente_id TEXT REFERENCES cantos(id), canto_posterior_id TEXT REFERENCES cantos(id),
  canto_superior_id TEXT REFERENCES cantos(id), canto_inferior_id TEXT REFERENCES cantos(id),
  regaton_alto REAL NOT NULL DEFAULT 0, creado_en TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_piezas_modulo ON piezas(modulo_id);

CREATE TABLE IF NOT EXISTS modulo_ensamble (
  modulo_id                 TEXT PRIMARY KEY REFERENCES modulos(id) ON DELETE CASCADE,
  costado_izq_pasante_techo INTEGER NOT NULL DEFAULT 1,
  costado_der_pasante_techo INTEGER NOT NULL DEFAULT 1,
  costado_izq_pasante_piso  INTEGER NOT NULL DEFAULT 1,
  costado_der_pasante_piso  INTEGER NOT NULL DEFAULT 1,
  fondo_tipo                TEXT NOT NULL DEFAULT 'interno'
                            CHECK (fondo_tipo IN ('pasante','interno')),
  fondo_retranqueo          REAL NOT NULL DEFAULT 12);

CREATE TABLE IF NOT EXISTS divisores_modulo (
  id TEXT PRIMARY KEY NOT NULL,
  modulo_id TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  posicion_x REAL NOT NULL, desde TEXT NOT NULL DEFAULT 'techo',
  hasta TEXT NOT NULL DEFAULT 'piso', orden INTEGER NOT NULL DEFAULT 0,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS idx_divisores_modulo ON divisores_modulo(modulo_id);

CREATE TABLE IF NOT EXISTS mansiones (
  id TEXT PRIMARY KEY, codigo TEXT NOT NULL UNIQUE, nombre TEXT NOT NULL,
  activo INTEGER NOT NULL DEFAULT 1);
INSERT OR IGNORE INTO mansiones (id, codigo, nombre) VALUES
  ('man-001','CORTE','Corte'),('man-002','FILOS','Pegado de filos'),
  ('man-003','CNC','CNC'),('man-004','ARMADO','Armado'),
  ('man-005','PANOLERO','Panolero'),('man-006','LIMPIEZA','Limpieza'),
  ('man-007','CONTROL','Control de calidad');

CREATE TABLE IF NOT EXISTS usuario_mansiones (
  usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  mansion_id TEXT NOT NULL REFERENCES mansiones(id),
  PRIMARY KEY (usuario_id, mansion_id));

CREATE TABLE IF NOT EXISTS sesiones (
  id TEXT PRIMARY KEY, usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  mansion_id TEXT NOT NULL REFERENCES mansiones(id),
  iniciada_en TEXT NOT NULL DEFAULT (datetime('now')), cerrada_en TEXT,
  activa INTEGER NOT NULL DEFAULT 1);
CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_mansion ON sesiones(mansion_id);

CREATE TABLE IF NOT EXISTS disposiciones (
  id                        TEXT PRIMARY KEY NOT NULL,
  nombre                    TEXT NOT NULL,
  tiene_techo               INTEGER NOT NULL DEFAULT 1,
  tiene_piso                INTEGER NOT NULL DEFAULT 1,
  tiene_costado_izq         INTEGER NOT NULL DEFAULT 1,
  tiene_costado_der         INTEGER NOT NULL DEFAULT 1,
  tiene_fondo               INTEGER NOT NULL DEFAULT 1,
  tiene_faja_sup            INTEGER NOT NULL DEFAULT 0,
  tiene_faja_inf            INTEGER NOT NULL DEFAULT 0,
  alto_faja_sup             REAL NOT NULL DEFAULT 80,
  alto_faja_inf             REAL NOT NULL DEFAULT 80,
  costado_izq_pasante_techo INTEGER NOT NULL DEFAULT 1,
  costado_der_pasante_techo INTEGER NOT NULL DEFAULT 1,
  costado_izq_pasante_piso  INTEGER NOT NULL DEFAULT 1,
  costado_der_pasante_piso  INTEGER NOT NULL DEFAULT 1,
  fondo_tipo                TEXT NOT NULL DEFAULT 'interno',
  fondo_retranqueo          REAL NOT NULL DEFAULT 12,
  es_sistema                INTEGER NOT NULL DEFAULT 0,
  activo                    INTEGER NOT NULL DEFAULT 1,
  creado_en                 TEXT NOT NULL DEFAULT (datetime('now')));

-- Solo campos base en el INSERT — la migración v9 puebla los valores correctos
INSERT OR IGNORE INTO disposiciones (id, nombre, es_sistema) VALUES
  ('bm',       'Bajomesada',         1),
  ('al',       'Alacena',            1),
  ('to',       'Torre',              1),
  ('ab',       'Abierto',            1),
  ('me',       'Mesa/Escritorio',    1),
  ('co',       'Columna',            1),
  ('caj-plac', 'Cajonera de placar', 1);

  INSERT OR IGNORE INTO usuarios (id, nombre, apellido, rol, token, activo, creado_en) VALUES
  ('usr-admin-001', 'Admin', 'MOBILI-AR', 'dueno', 'MOBILI-ADMIN-0001', 1, datetime('now'));