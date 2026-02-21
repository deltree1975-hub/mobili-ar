-- ================================================================
-- MOBILI-AR — Schema de base de datos SQLite
-- Versión: 1.0
-- ================================================================
-- Ejecutar completo para crear la base de datos desde cero.
-- Compatible con SQLite 3.35+
-- ================================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA encoding = 'UTF-8';

-- ================================================================
-- VERSIONES DE MIGRACIÓN
-- Permite saber qué versión del schema está instalada
-- ================================================================
CREATE TABLE IF NOT EXISTS schema_version (
  version     INTEGER NOT NULL,
  aplicado_en TEXT    NOT NULL DEFAULT (datetime('now')),
  descripcion TEXT
);

INSERT INTO schema_version (version, descripcion)
VALUES (1, 'Schema inicial MOBILI-AR v1.0');

-- ================================================================
-- CONFIGURACIÓN DE TERMINAL
-- Parámetros locales de cada instalación
-- ================================================================
CREATE TABLE IF NOT EXISTS configuracion_terminal (
  clave TEXT PRIMARY KEY NOT NULL,
  valor TEXT
);

INSERT OR IGNORE INTO configuracion_terminal (clave, valor) VALUES
  ('nombre_terminal',       'Terminal Principal'),
  ('kerf_sierra',           '3.2'),
  ('offset_pieza',          '0'),
  ('modo_nesting_default',  'RAPIDO'),
  ('version_schema',        '1');

-- ================================================================
-- USUARIOS
-- ================================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id          TEXT PRIMARY KEY NOT NULL,
  nombre      TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('operario', 'encargado', 'administrador')),
  token       TEXT NOT NULL UNIQUE,
  estado      TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'revocado')),
  creado_en   TEXT NOT NULL DEFAULT (datetime('now')),
  creado_por  TEXT REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_token  ON usuarios(token);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);

-- ================================================================
-- HISTORIAL DE TOKENS
-- Registro de tarjetas revocadas
-- ================================================================
CREATE TABLE IF NOT EXISTS historial_tokens (
  id              TEXT PRIMARY KEY NOT NULL,
  usuario_id      TEXT NOT NULL REFERENCES usuarios(id),
  token_revocado  TEXT NOT NULL,
  motivo          TEXT CHECK (motivo IN ('perdida', 'dano', 'renovacion_rutina', 'otro')),
  revocado_en     TEXT NOT NULL DEFAULT (datetime('now')),
  revocado_por    TEXT REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_historial_tokens_usuario ON historial_tokens(usuario_id);

-- ================================================================
-- SESIONES
-- Log de quién inició sesión, cuándo y desde qué terminal
-- ================================================================
CREATE TABLE IF NOT EXISTS sesiones (
  id              TEXT PRIMARY KEY NOT NULL,
  usuario_id      TEXT NOT NULL REFERENCES usuarios(id),
  terminal        TEXT,
  iniciada_en     TEXT NOT NULL DEFAULT (datetime('now')),
  cerrada_en      TEXT
);

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);

-- ================================================================
-- MATERIALES
-- Catálogo de materiales disponibles
-- ================================================================
CREATE TABLE IF NOT EXISTS materiales (
  id          TEXT PRIMARY KEY NOT NULL,
  nombre      TEXT NOT NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN ('tablero', 'hdf', 'mdf', 'madera', 'otro')),
  espesor     REAL NOT NULL,
  tiene_veta  INTEGER NOT NULL DEFAULT 0 CHECK (tiene_veta IN (0, 1)),
  activo      INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1)),
  creado_en   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_materiales_activo ON materiales(activo);

-- Materiales iniciales más comunes
INSERT OR IGNORE INTO materiales (id, nombre, tipo, espesor, tiene_veta) VALUES
  ('mat-mel-bl-18',  'Melamina Blanca 18mm',    'tablero', 18, 0),
  ('mat-mel-bl-15',  'Melamina Blanca 15mm',    'tablero', 15, 0),
  ('mat-mel-bl-25',  'Melamina Blanca 25mm',    'tablero', 25, 0),
  ('mat-hdf-3',      'HDF 3mm',                 'hdf',      3, 0),
  ('mat-mdf-18',     'MDF 18mm',                'mdf',     18, 0),
  ('mat-mdf-3',      'MDF 3mm',                 'mdf',      3, 0);

-- ================================================================
-- STOCK DE PLACAS
-- Placas disponibles para nesting
-- ================================================================
CREATE TABLE IF NOT EXISTS stock_placas (
  id           TEXT PRIMARY KEY NOT NULL,
  material_id  TEXT NOT NULL REFERENCES materiales(id),
  largo_util   REAL NOT NULL DEFAULT 2750,
  ancho_util   REAL NOT NULL DEFAULT 1830,
  cantidad     INTEGER NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  estado       TEXT NOT NULL DEFAULT 'disponible'
                 CHECK (estado IN ('disponible', 'reservada', 'consumida')),
  ingresado_en TEXT NOT NULL DEFAULT (datetime('now')),
  ingresado_por TEXT REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_stock_placas_material ON stock_placas(material_id);
CREATE INDEX IF NOT EXISTS idx_stock_placas_estado   ON stock_placas(estado);

-- ================================================================
-- TRABAJOS
-- Unidad principal de trabajo por cliente
-- ================================================================
CREATE TABLE IF NOT EXISTS trabajos (
  id            TEXT PRIMARY KEY NOT NULL,
  nombre        TEXT NOT NULL,
  cliente       TEXT,
  notas         TEXT,
  estado        TEXT NOT NULL DEFAULT 'en_diseno'
                  CHECK (estado IN (
                    'en_diseno', 'aprobado', 'en_produccion',
                    'pausado', 'completado', 'entregado', 'archivado'
                  )),
  prioridad     INTEGER NOT NULL DEFAULT 99,
  fecha_entrega TEXT,
  creado_en     TEXT NOT NULL DEFAULT (datetime('now')),
  creado_por    TEXT REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_trabajos_estado    ON trabajos(estado);
CREATE INDEX IF NOT EXISTS idx_trabajos_prioridad ON trabajos(prioridad);

-- ================================================================
-- HISTORIAL DE ESTADOS DE TRABAJO
-- ================================================================
CREATE TABLE IF NOT EXISTS historial_estados_trabajo (
  id               TEXT PRIMARY KEY NOT NULL,
  trabajo_id       TEXT NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  estado_anterior  TEXT,
  estado_nuevo     TEXT NOT NULL,
  usuario_id       TEXT REFERENCES usuarios(id),
  usuario_nombre   TEXT,
  notas            TEXT,
  timestamp        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_historial_trabajo ON historial_estados_trabajo(trabajo_id);

-- ================================================================
-- COMPOSICIONES
-- Agrupación de módulos por ambiente dentro de un trabajo
-- ================================================================
CREATE TABLE IF NOT EXISTS composiciones (
  id          TEXT PRIMARY KEY NOT NULL,
  trabajo_id  TEXT NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  orden       INTEGER NOT NULL DEFAULT 0,
  creado_en   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_composiciones_trabajo ON composiciones(trabajo_id);

-- ================================================================
-- MÓDULOS
-- Mueble individual dentro de una composición
-- ================================================================
CREATE TABLE IF NOT EXISTS modulos (
  id                  TEXT PRIMARY KEY NOT NULL,
  composicion_id      TEXT NOT NULL REFERENCES composiciones(id) ON DELETE CASCADE,
  nombre              TEXT NOT NULL,
  codigo              TEXT,
  disposicion         TEXT NOT NULL
                        CHECK (disposicion IN ('bm','al','to','ca','es','ab','co','me')),

  -- Dimensiones exteriores en mm
  ancho               REAL NOT NULL DEFAULT 600,
  alto                REAL NOT NULL DEFAULT 720,
  profundidad         REAL NOT NULL DEFAULT 550,

  -- Materiales y espesores
  espesor_tablero     REAL NOT NULL DEFAULT 18,
  espesor_fondo       REAL NOT NULL DEFAULT 3,

  -- Tipo de unión
  tipo_union          TEXT NOT NULL DEFAULT 'cam_locks'
                        CHECK (tipo_union IN (
                          'cam_locks', 'dowels', 'screws', 'biscuits', 'pocket'
                        )),

  -- Reglas constructivas
  costados_por_fuera  INTEGER NOT NULL DEFAULT 1 CHECK (costados_por_fuera IN (0,1)),
  fondo_embutido      INTEGER NOT NULL DEFAULT 0 CHECK (fondo_embutido IN (0,1)),
  tapa_apoyada        INTEGER NOT NULL DEFAULT 1 CHECK (tapa_apoyada IN (0,1)),

  -- Elementos
  cant_estantes       INTEGER NOT NULL DEFAULT 1,
  cant_puertas        INTEGER NOT NULL DEFAULT 1,
  overlap_puertas     REAL    NOT NULL DEFAULT 2,
  inset_estantes      REAL    NOT NULL DEFAULT 5,
  offset_tirador      REAL    NOT NULL DEFAULT 35,

  -- Estado productivo
  estado              TEXT NOT NULL DEFAULT 'borrador'
                        CHECK (estado IN (
                          'borrador', 'en_produccion', 'pausado', 'completado'
                        )),
  libreria_ref        TEXT,
  lanzado_en          TEXT,
  lanzado_por         TEXT REFERENCES usuarios(id),
  material_id         TEXT REFERENCES materiales(id),
  color_material      TEXT,
  tipo_canto          TEXT NOT NULL DEFAULT 'pvc',
  espesor_canto       REAL NOT NULL DEFAULT 0.4,
  canto_sup           INTEGER NOT NULL DEFAULT 1 CHECK(canto_sup IN (0,1)),
  canto_inf           INTEGER NOT NULL DEFAULT 1 CHECK(canto_inf IN (0,1)),
  canto_izq           INTEGER NOT NULL DEFAULT 1 CHECK(canto_izq IN (0,1)),
  canto_der           INTEGER NOT NULL DEFAULT 1 CHECK(canto_der IN (0,1)),
  apertura_puerta     TEXT NOT NULL DEFAULT 'derecha' CHECK(apertura_puerta IN ('derecha','izquierda','dos_hojas','corredera')),
  creado_en           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_modulos_composicion ON modulos(composicion_id);
CREATE INDEX IF NOT EXISTS idx_modulos_estado       ON modulos(estado);

-- ================================================================
-- PIEZAS
-- Cada tablero individual que compone un módulo
-- ================================================================
CREATE TABLE IF NOT EXISTS piezas (
  id               TEXT PRIMARY KEY NOT NULL,
  modulo_id        TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,

  -- Identificación
  tipo             TEXT NOT NULL
                     CHECK (tipo IN ('side','horizontal','back','shelf','door')),
  nombre           TEXT NOT NULL,
  codigo_generico  TEXT NOT NULL,   -- cdbm, cibm, fbm, pbm, ebm, etc.
  codigo_instancia TEXT UNIQUE,     -- MA-XXXX-C1-M1-CDBM-001 (se genera al lanzar)

  -- Dimensiones reales calculadas (mm)
  ancho            REAL NOT NULL,
  alto             REAL NOT NULL,
  espesor          REAL NOT NULL,

  -- Material
  material_id      TEXT REFERENCES materiales(id),
  veta             TEXT NOT NULL DEFAULT 'NONE'
                     CHECK (veta IN ('LARGO', 'ANCHO', 'NONE')),

  -- Cantos (1 = lleva canto en ese lado)
  canto_top        INTEGER NOT NULL DEFAULT 0 CHECK (canto_top    IN (0,1)),
  canto_bottom     INTEGER NOT NULL DEFAULT 0 CHECK (canto_bottom IN (0,1)),
  canto_left       INTEGER NOT NULL DEFAULT 0 CHECK (canto_left   IN (0,1)),
  canto_right      INTEGER NOT NULL DEFAULT 0 CHECK (canto_right  IN (0,1)),

  -- Estado de producción
  estado_actual    TEXT NOT NULL DEFAULT 'pendiente_corte'
                     CHECK (estado_actual IN (
                       'pendiente_corte', 'cortada', 'canteada',
                       'mecanizada', 'controlada', 'lista_armado',
                       'dano', 'perdida'
                     )),

  -- Resultado del nesting
  tablero_origen   TEXT REFERENCES stock_placas(id),
  orden_corte      INTEGER,
  x_tablero        REAL,
  y_tablero        REAL,
  rotada           INTEGER DEFAULT 0 CHECK (rotada IN (0,1)),

  creado_en        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_piezas_modulo          ON piezas(modulo_id);
CREATE INDEX IF NOT EXISTS idx_piezas_estado          ON piezas(estado_actual);
CREATE INDEX IF NOT EXISTS idx_piezas_codigo_instancia ON piezas(codigo_instancia);
CREATE INDEX IF NOT EXISTS idx_piezas_tablero          ON piezas(tablero_origen);

-- ================================================================
-- HISTORIAL DE ESTADOS DE PIEZA
-- Registro completo de cada cambio con usuario y timestamp
-- ================================================================
CREATE TABLE IF NOT EXISTS historial_estados_pieza (
  id               TEXT PRIMARY KEY NOT NULL,
  pieza_id         TEXT NOT NULL REFERENCES piezas(id) ON DELETE CASCADE,
  estado_anterior  TEXT,
  estado_nuevo     TEXT NOT NULL,
  tipo             TEXT NOT NULL
                     CHECK (tipo IN (
                       'avance', 'correccion', 'dano', 'perdida', 'rehecho'
                     )),
  detalle          TEXT,   -- obligatorio en corrección, daño y pérdida
  usuario_id       TEXT REFERENCES usuarios(id),
  usuario_nombre   TEXT NOT NULL,
  timestamp        TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_historial_pieza ON historial_estados_pieza(pieza_id);
CREATE INDEX IF NOT EXISTS idx_historial_pieza_ts ON historial_estados_pieza(timestamp);

-- ================================================================
-- PERFORACIONES
-- Mecanizados de cada pieza
-- ================================================================
CREATE TABLE IF NOT EXISTS perforaciones (
  id          TEXT PRIMARY KEY NOT NULL,
  pieza_id    TEXT NOT NULL REFERENCES piezas(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL
                CHECK (tipo IN (
                  'pin', 'union', 'bisagra', 'tirador', 'minifix', 'otro'
                )),
  x           REAL NOT NULL,
  y           REAL NOT NULL,
  diametro    REAL NOT NULL,
  profundidad REAL NOT NULL,
  cara        TEXT NOT NULL
                CHECK (cara IN (
                  'frente','dorso','canto_sup','canto_inf','canto_izq','canto_der'
                )),
  descripcion TEXT
);

CREATE INDEX IF NOT EXISTS idx_perforaciones_pieza ON perforaciones(pieza_id);

-- ================================================================
-- HERRAJES
-- Herrajes calculados automáticamente por módulo
-- ================================================================
CREATE TABLE IF NOT EXISTS herrajes (
  id            TEXT PRIMARY KEY NOT NULL,
  modulo_id     TEXT NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  tipo          TEXT NOT NULL
                  CHECK (tipo IN (
                    'bisagra', 'minifix', 'perno', 'soporte_estante',
                    'tirador', 'tornillo', 'espiga', 'excentrica', 'otro'
                  )),
  descripcion   TEXT NOT NULL,
  cantidad      INTEGER NOT NULL DEFAULT 0,
  generado_por  TEXT    -- elemento que originó este herraje (ej: puerta_0)
);

CREATE INDEX IF NOT EXISTS idx_herrajes_modulo ON herrajes(modulo_id);

-- ================================================================
-- LIBRERÍA DE MÓDULOS
-- Módulos predefinidos que el usuario puede agregar a composiciones
-- ================================================================
CREATE TABLE IF NOT EXISTS libreria_modulos (
  id          TEXT PRIMARY KEY NOT NULL,
  codigo      TEXT NOT NULL UNIQUE,
  disposicion TEXT NOT NULL,
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  -- Configuración por defecto almacenada como JSON
  config_json TEXT NOT NULL,
  activo      INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0,1))
);

-- Módulos estándar de la librería
INSERT OR IGNORE INTO libreria_modulos (id, codigo, disposicion, nombre, descripcion, config_json) VALUES
  ('lib-bm-600', 'BM-600-720', 'bm', 'Bajo Mesada 60cm',
   'Módulo estándar bajo mesada con 1 estante',
   '{"ancho":600,"alto":720,"profundidad":550,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":1,"cant_puertas":1,"overlap_puertas":2,"inset_estantes":5,"offset_tirador":35,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-bm-900', 'BM-900-720', 'bm', 'Bajo Mesada 90cm',
   'Módulo ancho con 2 puertas',
   '{"ancho":900,"alto":720,"profundidad":550,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":1,"cant_puertas":2,"overlap_puertas":2,"inset_estantes":5,"offset_tirador":35,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-bm-400', 'BM-400-720', 'bm', 'Bajo Mesada 40cm',
   'Módulo angosto bajo mesada',
   '{"ancho":400,"alto":720,"profundidad":550,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":1,"cant_puertas":1,"overlap_puertas":2,"inset_estantes":5,"offset_tirador":35,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-al-600', 'AL-600-700', 'al', 'Alto 60cm',
   'Mueble alto con 2 estantes y 2 puertas',
   '{"ancho":600,"alto":700,"profundidad":350,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":2,"cant_puertas":2,"overlap_puertas":2,"inset_estantes":5,"offset_tirador":35,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-al-900', 'AL-900-700', 'al', 'Alto 90cm',
   'Mueble alto ancho',
   '{"ancho":900,"alto":700,"profundidad":350,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":2,"cant_puertas":2,"overlap_puertas":2,"inset_estantes":5,"offset_tirador":35,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-to-600', 'TO-600-2100', 'to', 'Torre Despensero',
   'Torre alta con 4 estantes regulables',
   '{"ancho":600,"alto":2100,"profundidad":550,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":4,"cant_puertas":2,"overlap_puertas":2,"inset_estantes":5,"offset_tirador":35,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-to-400', 'TO-400-2100', 'to', 'Torre Columna',
   'Torre angosta lateral',
   '{"ancho":400,"alto":2100,"profundidad":550,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":4,"cant_puertas":2,"overlap_puertas":2,"inset_estantes":5,"offset_tirador":35,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-ca-600', 'CA-600-720', 'ca', 'Módulo Cajones 60cm',
   'Bajo mesada con cajones corridos',
   '{"ancho":600,"alto":720,"profundidad":550,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":0,"cant_puertas":0,"overlap_puertas":2,"inset_estantes":5,"offset_tirador":35,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-ab-600', 'AB-600-720', 'ab', 'Módulo Abierto 60cm',
   'Bajo mesada sin puertas',
   '{"ancho":600,"alto":720,"profundidad":550,"espesor_tablero":18,"espesor_fondo":3,"cant_estantes":2,"cant_puertas":0,"overlap_puertas":0,"inset_estantes":5,"offset_tirador":0,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}'),

  ('lib-me-1200', 'ME-1200-750', 'me', 'Mesa / Escritorio 120cm',
   'Estructura de mesa con 2 módulos laterales',
   '{"ancho":1200,"alto":750,"profundidad":600,"espesor_tablero":25,"espesor_fondo":3,"cant_estantes":0,"cant_puertas":0,"overlap_puertas":0,"inset_estantes":0,"offset_tirador":0,"tipo_union":"cam_locks","costados_por_fuera":1,"fondo_embutido":0}');

-- ================================================================
-- VISTAS ÚTILES
-- Consultas frecuentes preconstruidas
-- ================================================================

-- Avance de producción por trabajo
CREATE VIEW IF NOT EXISTS v_avance_trabajo AS
SELECT
  t.id                                                      AS trabajo_id,
  t.nombre                                                  AS trabajo,
  t.cliente,
  t.estado                                                  AS estado_trabajo,
  COUNT(p.id)                                               AS total_piezas,
  SUM(CASE WHEN p.estado_actual = 'pendiente_corte' THEN 1 ELSE 0 END) AS pendientes,
  SUM(CASE WHEN p.estado_actual = 'cortada'         THEN 1 ELSE 0 END) AS cortadas,
  SUM(CASE WHEN p.estado_actual = 'canteada'        THEN 1 ELSE 0 END) AS canteadas,
  SUM(CASE WHEN p.estado_actual = 'mecanizada'      THEN 1 ELSE 0 END) AS mecanizadas,
  SUM(CASE WHEN p.estado_actual = 'controlada'      THEN 1 ELSE 0 END) AS controladas,
  SUM(CASE WHEN p.estado_actual = 'lista_armado'    THEN 1 ELSE 0 END) AS listas,
  SUM(CASE WHEN p.estado_actual IN ('dano','perdida') THEN 1 ELSE 0 END) AS incidencias,
  ROUND(
    100.0 * SUM(CASE WHEN p.estado_actual = 'lista_armado' THEN 1 ELSE 0 END)
    / NULLIF(COUNT(p.id), 0), 1
  )                                                         AS pct_completado
FROM trabajos t
LEFT JOIN composiciones c ON c.trabajo_id = t.id
LEFT JOIN modulos m       ON m.composicion_id = c.id
LEFT JOIN piezas p        ON p.modulo_id = m.id
GROUP BY t.id;

-- Piezas con toda la información para escaneo
CREATE VIEW IF NOT EXISTS v_piezas_completas AS
SELECT
  p.id,
  p.codigo_instancia,
  p.codigo_generico,
  p.nombre                AS pieza_nombre,
  p.tipo,
  p.estado_actual,
  p.ancho,
  p.alto,
  p.espesor,
  p.veta,
  p.canto_top,
  p.canto_bottom,
  p.canto_left,
  p.canto_right,
  p.orden_corte,
  p.x_tablero,
  p.y_tablero,
  p.rotada,
  m.id                    AS modulo_id,
  m.nombre                AS modulo_nombre,
  m.codigo                AS modulo_codigo,
  m.disposicion,
  c.id                    AS composicion_id,
  c.nombre                AS composicion_nombre,
  t.id                    AS trabajo_id,
  t.nombre                AS trabajo_nombre,
  t.cliente,
  mat.nombre              AS material_nombre,
  mat.tipo                AS material_tipo,
  sp.id                   AS tablero_id
FROM piezas p
JOIN modulos      m   ON m.id  = p.modulo_id
JOIN composiciones c  ON c.id  = m.composicion_id
JOIN trabajos      t  ON t.id  = c.trabajo_id
LEFT JOIN materiales  mat ON mat.id = p.material_id
LEFT JOIN stock_placas sp  ON sp.id = p.tablero_origen;

-- Stock disponible por material
CREATE VIEW IF NOT EXISTS v_stock_disponible AS
SELECT
  mat.nombre        AS material,
  mat.espesor,
  mat.tiene_veta,
  sp.largo_util,
  sp.ancho_util,
  SUM(sp.cantidad)  AS total_placas,
  MIN(sp.ingresado_en) AS ingreso_mas_antiguo
FROM stock_placas sp
JOIN materiales mat ON mat.id = sp.material_id
WHERE sp.estado = 'disponible' AND sp.cantidad > 0
GROUP BY mat.id, sp.largo_util, sp.ancho_util;

-- Resumen de herrajes por trabajo
CREATE VIEW IF NOT EXISTS v_herrajes_trabajo AS
SELECT
  t.id              AS trabajo_id,
  t.nombre          AS trabajo,
  t.cliente,
  h.tipo,
  h.descripcion,
  SUM(h.cantidad)   AS cantidad_total
FROM herrajes h
JOIN modulos       m ON m.id = h.modulo_id
JOIN composiciones c ON c.id = m.composicion_id
JOIN trabajos      t ON t.id = c.trabajo_id
GROUP BY t.id, h.tipo, h.descripcion
ORDER BY t.nombre, h.tipo;

-- ================================================================
-- FIN DEL SCHEMA
-- ================================================================
