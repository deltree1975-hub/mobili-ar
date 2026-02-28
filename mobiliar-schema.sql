-- ================================================================
-- MOBILI-AR — Schema de base de datos SQLite
-- Versión: 1.1 (migraciones seguras)
-- ================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA encoding = 'UTF-8';

-- ================================================================
-- VERSIONES DE MIGRACIÓN
-- ================================================================
CREATE TABLE IF NOT EXISTS schema_version (
  version     INTEGER NOT NULL,
  aplicado_en TEXT    NOT NULL DEFAULT (datetime('now')),
  descripcion TEXT
);

INSERT OR IGNORE INTO schema_version (version, descripcion)
VALUES (1, 'Schema inicial MOBILI-AR v1.0');

-- ================================================================
-- CONFIGURACIÓN TERMINAL
-- ================================================================
CREATE TABLE IF NOT EXISTS configuracion_terminal (
  clave TEXT PRIMARY KEY NOT NULL,
  valor TEXT
);

INSERT OR IGNORE INTO configuracion_terminal (clave, valor) VALUES
  ('nombre_terminal',       'Terminal Principal'),
  ('kerf_sierra',           '3.2'),
  ('offset_pieza',          '0.5'),
  ('modo_nesting_default',  'RAPIDO'),
  ('version_schema',        '1');

-- ================================================================
-- USUARIOS
-- ================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id            TEXT PRIMARY KEY,
    nombre        TEXT NOT NULL,
    apellido      TEXT NOT NULL DEFAULT '',
    rol           TEXT NOT NULL DEFAULT 'operario'
                  CHECK(rol IN ('operario','disenador','admin','dueno')),
    token         TEXT NOT NULL UNIQUE,
    pin           TEXT,
    activo        INTEGER NOT NULL DEFAULT 1,
    creado_en     TEXT NOT NULL,
    ultimo_acceso TEXT
);

CREATE INDEX IF NOT EXISTS idx_usuarios_token ON usuarios(token);

-- ================================================================
-- HISTORIAL DE TOKENS
-- ================================================================
CREATE TABLE IF NOT EXISTS historial_tokens (
  id              TEXT PRIMARY KEY NOT NULL,
  usuario_id      TEXT NOT NULL REFERENCES usuarios(id),
  token_revocado  TEXT NOT NULL,
  motivo          TEXT CHECK (motivo IN ('perdida','dano','renovacion_rutina','otro')),
  revocado_en     TEXT NOT NULL DEFAULT (datetime('now')),
  revocado_por    TEXT REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_historial_tokens_usuario ON historial_tokens(usuario_id);

-- ================================================================
-- MATERIALES
-- ================================================================
CREATE TABLE IF NOT EXISTS materiales (
  id          TEXT PRIMARY KEY NOT NULL,
  nombre      TEXT NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('tablero','hdf','mdf','madera','otro')),
  espesor     REAL NOT NULL,
  tiene_veta  INTEGER NOT NULL DEFAULT 0 CHECK (tiene_veta IN (0,1)),
  activo      INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1)),
  creado_en   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_materiales_activo ON materiales(activo);

INSERT OR IGNORE INTO materiales (id, nombre, tipo, espesor, tiene_veta) VALUES
  ('mat-mel-bl-18','Melamina Blanca 18mm','tablero',18,0),
  ('mat-mel-bl-15','Melamina Blanca 15mm','tablero',15,0),
  ('mat-mel-bl-25','Melamina Blanca 25mm','tablero',25,0),
  ('mat-hdf-3','HDF 3mm','hdf',3,0),
  ('mat-mdf-18','MDF 18mm','mdf',18,0),
  ('mat-mdf-3','MDF 3mm','mdf',3,0);

-- ================================================================
-- STOCK PLACAS
-- ================================================================
CREATE TABLE IF NOT EXISTS stock_placas (
  id            TEXT PRIMARY KEY NOT NULL,
  material_id   TEXT NOT NULL REFERENCES materiales(id),
  largo_util    REAL NOT NULL DEFAULT 2750,
  ancho_util    REAL NOT NULL DEFAULT 1830,
  cantidad      INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  estado        TEXT NOT NULL DEFAULT 'disponible'
                  CHECK (estado IN ('disponible','reservada','consumida')),
  ingresado_en  TEXT NOT NULL DEFAULT (datetime('now')),
  ingresado_por TEXT REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_placas_material ON stock_placas(material_id);
CREATE INDEX IF NOT EXISTS idx_stock_placas_estado   ON stock_placas(estado);

-- ================================================================
-- TRABAJOS
-- ================================================================
CREATE TABLE IF NOT EXISTS trabajos (
  id            TEXT PRIMARY KEY NOT NULL,
  nombre        TEXT NOT NULL,
  cliente       TEXT,
  notas         TEXT,
  estado        TEXT NOT NULL DEFAULT 'en_diseno'
                  CHECK (estado IN (
                    'en_diseno','aprobado','en_produccion',
                    'pausado','completado','entregado','archivado'
                  )),
  prioridad     INTEGER NOT NULL DEFAULT 99,
  fecha_entrega TEXT,
  creado_en     TEXT NOT NULL DEFAULT (datetime('now')),
  creado_por    TEXT REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_trabajos_estado ON trabajos(estado);

-- ================================================================
-- COMPOSICIONES
-- ================================================================
CREATE TABLE IF NOT EXISTS composiciones (
  id          TEXT PRIMARY KEY NOT NULL,
  trabajo_id  TEXT NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  orden       INTEGER NOT NULL DEFAULT 0,
  creado_en   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ================================================================
-- MÓDULOS
-- ================================================================
CREATE TABLE IF NOT EXISTS modulos (
  id              TEXT PRIMARY KEY NOT NULL,
  composicion_id  TEXT NOT NULL REFERENCES composiciones(id) ON DELETE CASCADE,
  nombre          TEXT NOT NULL,
  codigo          TEXT,
  disposicion     TEXT NOT NULL CHECK (disposicion IN ('bm','al','to','ca','es','ab','co','me')),
  ancho           REAL NOT NULL DEFAULT 600,
  alto            REAL NOT NULL DEFAULT 720,
  profundidad     REAL NOT NULL DEFAULT 550,
  espesor_tablero REAL NOT NULL DEFAULT 18,
  espesor_fondo   REAL NOT NULL DEFAULT 3,
  tipo_union      TEXT NOT NULL DEFAULT 'cam_locks'
                    CHECK (tipo_union IN ('cam_locks','dowels','screws','biscuits','pocket')),
  estado          TEXT NOT NULL DEFAULT 'borrador'
                    CHECK (estado IN ('borrador','en_produccion','pausado','completado')),
  material_id     TEXT REFERENCES materiales(id),
  creado_en       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ================================================================
-- HERRAJES
-- ================================================================
CREATE TABLE IF NOT EXISTS herrajes (
  id          TEXT PRIMARY KEY NOT NULL,
  modulo_id   TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad    INTEGER NOT NULL DEFAULT 0
);

-- ================================================================
-- CANTOS — catálogo de depósito (F3-01)
-- DEBE ir ANTES de piezas porque piezas tiene FK a cantos
-- ================================================================
CREATE TABLE IF NOT EXISTS cantos (
  id        TEXT PRIMARY KEY NOT NULL,
  nombre    TEXT NOT NULL,
  color     TEXT NOT NULL,
  espesor   REAL NOT NULL,
  material  TEXT NOT NULL CHECK (material IN ('pvc','abs','aluminio','madera','otro')),
  activo    INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1)),
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cantos_activo ON cantos(activo);

-- ================================================================
-- PIEZAS
-- ================================================================
CREATE TABLE IF NOT EXISTS piezas (
  id                 TEXT PRIMARY KEY NOT NULL,
  modulo_id          TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  tipo               TEXT NOT NULL CHECK (tipo IN ('side','horizontal','back','shelf','door')),
  nombre             TEXT NOT NULL,
  codigo_generico    TEXT NOT NULL,
  codigo_instancia   TEXT UNIQUE,
  ancho              REAL NOT NULL,
  alto               REAL NOT NULL,
  espesor            REAL NOT NULL,
  material_id        TEXT REFERENCES materiales(id),
  estado_actual      TEXT NOT NULL DEFAULT 'pendiente_corte'
                       CHECK (estado_actual IN (
                         'pendiente_corte','cortada','canteada',
                         'mecanizada','controlada','lista_armado',
                         'dano','perdida'
                       )),
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

CREATE INDEX IF NOT EXISTS idx_piezas_estado ON piezas(estado_actual);

-- ================================================================
-- ENSAMBLE POR MÓDULO (F3-01)
-- ================================================================
CREATE TABLE IF NOT EXISTS modulo_ensamble (
  modulo_id             TEXT PRIMARY KEY REFERENCES modulos(id) ON DELETE CASCADE,
  costado_pasante_techo INTEGER NOT NULL DEFAULT 1 CHECK (costado_pasante_techo IN (0,1)),
  costado_pasante_piso  INTEGER NOT NULL DEFAULT 1 CHECK (costado_pasante_piso  IN (0,1)),
  fondo_tipo            TEXT NOT NULL DEFAULT 'interno' CHECK (fondo_tipo IN ('pasante','interno')),
  fondo_retranqueo      REAL NOT NULL DEFAULT 12
);

-- ================================================================
-- MANSIONES
-- ================================================================
CREATE TABLE IF NOT EXISTS mansiones (
    id      TEXT PRIMARY KEY,
    codigo  TEXT NOT NULL UNIQUE,
    nombre  TEXT NOT NULL,
    activo  INTEGER NOT NULL DEFAULT 1
);

INSERT OR IGNORE INTO mansiones (id, codigo, nombre) VALUES
  ('man-001','CORTE',   'Corte'),
  ('man-002','FILOS',   'Pegado de filos'),
  ('man-003','CNC',     'CNC'),
  ('man-004','ARMADO',  'Armado'),
  ('man-005','PANOLERO','Pañolero'),
  ('man-006','LIMPIEZA','Limpieza'),
  ('man-007','CONTROL', 'Control de calidad');

CREATE TABLE IF NOT EXISTS usuario_mansiones (
    usuario_id TEXT NOT NULL REFERENCES usuarios(id),
    mansion_id TEXT NOT NULL REFERENCES mansiones(id),
    PRIMARY KEY (usuario_id, mansion_id)
);

-- ================================================================
-- SESIONES
-- ================================================================
CREATE TABLE IF NOT EXISTS sesiones (
    id          TEXT PRIMARY KEY,
    usuario_id  TEXT NOT NULL REFERENCES usuarios(id),
    mansion_id  TEXT NOT NULL REFERENCES mansiones(id),
    iniciada_en TEXT NOT NULL DEFAULT (datetime('now')),
    cerrada_en  TEXT,
    activa      INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_mansion ON sesiones(mansion_id);

-- ================================================================
-- VERSIÓN 2
-- ================================================================
INSERT OR IGNORE INTO schema_version (version, descripcion)
VALUES (2, 'F3-01 - Motor de calculo de piezas, cantos y ensamble');

-- ================================================================
-- FIN DEL SCHEMA
-- ================================================================