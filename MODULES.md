# MOBILI-AR — Estado del Proyecto

**Actualizado:** 2026-03-09
**Rama activa:** `feature/listas-corte` → mergear a main
**Schema:** v11 activo

---

| Estado | Significado |
|--------|-------------|
| ⬜ PENDIENTE | No empezado |
| 🔵 EN CURSO | Tenés una rama activa |
| 🟡 EN PAUSA | Empezaste, lo retomás después |
| ⛔ SUSPENDIDO | Descartado por ahora |
| ❌ CANCELADO | No se implementará |
| ✅ COMPLETO | Mergeado a main, funciona |

---

## NÚCLEO — Lo que hace funcionar el sistema de punta a punta

> Flujo crítico: Obra → Composición → Módulo → Lista de corte → Etiquetas → Producción → Despacho

---

## Bloque 1 — Fundación (infraestructura y datos base)

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B1-01 | Setup proyecto Tauri | ✅ COMPLETO | |
| B1-02 | Schema SQLite + migraciones | 🟡 EN PAUSA | v11 activo. Pendiente: `mobiliar-schema.sql` fuente de verdad desactualizado — sincronizar con v11. `disposiciones` pendiente campos de paneles + ensamble por defecto (B2-05). |
| B1-03 | Selector de carpeta / DB path | ✅ COMPLETO | |
| B1-04 | Capa de comandos Tauri (invoke) | ✅ COMPLETO | |
| B1-05 | Usuarios y roles | ✅ COMPLETO | |
| B1-06 | Sesiones y tokens | ✅ COMPLETO | |
| B1-07 | Sistema de permisos por rol | ⬜ PENDIENTE | depende de B1-05 |
| B1-08 | Multi-terminal (red local / internet) | ⬜ PENDIENTE | SQLite → evaluar migración a servidor central o sync |
| B1-09 | Build y distribución | ⬜ PENDIENTE | Python embebido al empaquetar (intérprete mínimo junto al ejecutable) |

---

## Bloque 2 — Flujo administrativo

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B2-01 | Dashboard de obras/trabajos | ✅ COMPLETO | |
| B2-02 | Crear / editar obra (trabajo) | ✅ COMPLETO | |
| B2-03 | Composiciones por obra | ✅ COMPLETO | |
| B2-04 | Librería de módulos (global, por categoría) | 🟡 EN PAUSA | Estructura básica completa. Pendiente: categorías, guardar configuración completa incluyendo ensamble y paneles, cargar desde librería. |
| B2-05 | Disposiciones configurables | ⬜ PENDIENTE | CRUD de disposiciones con defaults de paneles + ensamble. `es_sistema=1` para las base. depende de B1-02. |
| B2-06 | Crear módulo desde librería | ⬜ PENDIENTE | depende de B2-04 y B2-05. |

---

## Bloque 3 — Motor paramétrico

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B3-01 | Gestión de materiales | ✅ COMPLETO | |
| B3-02 | Gestión de cantos | ✅ COMPLETO | |
| B3-03 | Editor de módulo — dimensiones y propiedades | ✅ COMPLETO | |
| B3-04 | Ensamble — 4 campos costado independientes | ✅ COMPLETO | Widget + Rust migrado a v8 |
| B3-05 | Ensamble — restricción costado↔horizontal | ⬜ PENDIENTE | Al activar costado pasante el horizontal correspondiente se fuerza al contrario. Lógica en `actualizarEnsamble` de `Editor/index.jsx`. |
| B3-06 | Defaults de paneles por disposición | ✅ COMPLETO | `aplicarDefaultsDisposicion()` async en Editor. |
| B3-07 | Paneles opcionales (sin techo / sin piso / sin costado) | ✅ COMPLETO | Toggles en ResumenModulo. Motor respeta flags. |
| B3-08 | Fajas (superior e inferior) | ✅ COMPLETO | Regla `ef < 18mm` → 2 piezas (frente+trasera). `ef >= 18mm` → 1 pieza. |
| B3-09 | Motor de cálculo — bugs (laterales, fondo, ensamble) | ✅ COMPLETO | |
| B3-10 | Filos por defecto — Bug 4 | ✅ COMPLETO | |
| B3-11 | Divisores verticales | ✅ COMPLETO | |
| B3-12 | Orientación de veta | ⬜ PENDIENTE | depende de B3-01 |
| B3-13 | Motor de cajones | ⬜ PENDIENTE | Cajón = 2 FL + 2 FF + piso. Modal interno del componente cajonera. |
| B3-14 | CSS — widget ensamble costados | ⬜ PENDIENTE | Deuda UX menor, postergado. |
| B3-15 | Preferencias constructivas por usuario | ⬜ PENDIENTE | Cantidad de fajas, etc. |

---

## Bloque 4 — Generación de documentos de producción

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B4-01 | Lista de corte — PDF general + CSVs operativos | ✅ COMPLETO | PDF con membrete + tabla continua. CSVs por material/color/espesor. Codificación de piezas `AAMM-OT-MOD-TIPO`. `numero_ot` secuencial en `trabajos` (migración v10). Comando Rust `generar_lista_corte` invoca ambos scripts Python. Python en PATH (desarrollo); embebido pendiente (B1-09). |
| B4-02 | Listas de corte consolidadas — gestión y estados | ✅ COMPLETO | Pantalla `ListasCorte` accesible desde botón en `Proyecto`. Tablas `listas_corte` + `listas_corte_modulos` (migración v11). Índice único parcial `WHERE motivo IS NULL`. Comandos Rust: `get_modulos_para_lista`, `get_listas_corte`, `get_modulos_lista`, `crear_y_generar_lista_corte`, `reimprimir_lista_corte`, `anular_lista_corte`. Generación transaccional con rollback si falla el script Python. Un solo JSON con todos los módulos → un solo PDF + CSVs. PDF se abre automáticamente con el visor del sistema. Historial con reimprimir / anular / ampliar. |
| B4-03 | Cálculo de cantos por pieza | ⬜ PENDIENTE | depende de B3-10 |
| B4-04 | Lista de filos (pegado de cantos) | ⬜ PENDIENTE | depende de B4-03 |
| B4-05 | Motor de herrajes | ⬜ PENDIENTE | depende de B3-09 |
| B4-06 | Lista de herrajes (pañol) | ⬜ PENDIENTE | Unificada por obra, sin etiquetas individuales. depende de B4-05. |
| B4-07 | Lista de armado por mueble | ⬜ PENDIENTE | depende de B4-01 |
| B4-08 | Lista de control de carga / despacho | ⬜ PENDIENTE | depende de B4-07 |
| B4-09 | Lanzamiento a producción | ⬜ PENDIENTE | Congela módulo, genera códigos de barras. depende de B4-01. |

---

## Bloque 5 — Etiquetas y códigos de barras

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B5-01 | Generación de códigos de barras por pieza | ⬜ PENDIENTE | Código único `AAMM-OT-MOD-TIPO` ya implementado en B4-01. Pendiente: render Code128 en etiqueta. depende de B4-09. |
| B5-02 | Generación de códigos por mueble (armado) | ⬜ PENDIENTE | depende de B4-09 |
| B5-03 | Impresión de etiquetas por planchas | ⬜ PENDIENTE | Layout configurable (A4, rollo, etc). depende de B5-01. |
| B5-04 | Lista pañol con códigos de barras (papel) | ⬜ PENDIENTE | depende de B5-01 y B4-06. |

---

## Bloque 6 — Control de producción

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B6-01 | Pantalla de escaneo (por mansión) | ⬜ PENDIENTE | depende de B5-01. |
| B6-02 | Cortador — lista de corte + escaneo | ⬜ PENDIENTE | |
| B6-03 | Pegado de cantos — escaneo + info filos | ⬜ PENDIENTE | |
| B6-04 | Centro mecanizado — escaneo + programa CNC | ⬜ PENDIENTE | |
| B6-05 | Pañolero — vista simplificada | ⬜ PENDIENTE | |
| B6-06 | Armado — escaneo por mueble completo | ⬜ PENDIENTE | |
| B6-07 | Limpieza / control calidad / embalaje | ⬜ PENDIENTE | |
| B6-08 | Despacho — habilitado por ok de calidad | ⬜ PENDIENTE | depende de B6-07 |
| B6-09 | Dashboard de avance por obra | ⬜ PENDIENTE | |
| B6-10 | Estados especiales (REHECHO, PAUSADO, etc.) | ⬜ PENDIENTE | |
| B6-11 | Historial por pieza | ⬜ PENDIENTE | |

---

## Bloque 7 — Nesting (optimización de placas)

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B7-01 | Gestión de stock de placas | ⬜ PENDIENTE | |
| B7-02 | Consolidación de piezas para nesting | ⬜ PENDIENTE | depende de B4-02 |
| B7-03 | Algoritmo MaxRects | ⬜ PENDIENTE | |
| B7-04 | Selección de placas y secuencia de corte | ⬜ PENDIENTE | |
| B7-05 | Vista visual del tablero | ⬜ PENDIENTE | |
| B7-06 | Lista de corte PDF con layout de placa | ⬜ PENDIENTE | |
| B7-07 | Parámetros kerf y offset por máquina | ⬜ PENDIENTE | |
| B7-08 | Confirmación de stock consumido | ⬜ PENDIENTE | |
| B7-09 | Alertas de material faltante | ⬜ PENDIENTE | |
| B7-10 | Corte manual de retazos | ⬜ PENDIENTE | |

---

## Bloque 8 — Exportación CNC / DXF

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B8-01 | Motor DXF para mecanizados | ⬜ PENDIENTE | |
| B8-02 | DXF por tipo de mecanizado | ⬜ PENDIENTE | |
| B8-03 | Exportación individual y por lote | ⬜ PENDIENTE | |
| B8-04 | Vista previa DXF | ⬜ PENDIENTE | |
| B8-05 | Validación con máquina real | ⬜ PENDIENTE | |

---

## Próximos pasos (por urgencia)

```
1. B3-05  — Restricción costado↔horizontal en actualizarEnsamble
2. B2-05  — CRUD disposiciones configurables
3. B3-13  — Motor de cajones
4. B4-09  — Lanzamiento a producción
5. B5-01  — Etiquetas con código de barras
6. B1-09  — Build y distribución (Python embebido)
```

---

## Contexto técnico

**Stack:** Rust + Tauri 2 / React / SQLite
**DB:** `mobiliar.db` en `C:\Users\roockie\Documents\mobiliar\`
**Multi-terminal:** todas con internet o red local (arquitectura a definir en B1-08)

### Decisiones técnicas vigentes
- `confirm()` nativo no funciona en Tauri → confirmación inline con estado React
- Migraciones usan `columna_existe()` antes de operar — idempotentes
- `mobiliar-schema.sql` es fuente de verdad para DBs nuevas — pendiente sincronizar a v11
- Schema v11: `trabajos.numero_ot` secuencial global. `modulos` tiene 8 campos de paneles opcionales. `modulo_ensamble` tiene 4 campos de costado independientes. Tablas `listas_corte` + `listas_corte_modulos` con índice único parcial `WHERE motivo IS NULL`.
- Motor techo/piso: descuentan si AMBOS costados del lado correspondiente son pasantes (AND lógico)
- Fondo 3mm interno: va en ranura → `ancho/alto - et_ef*2 + 16mm` (8mm por ranura cada lado)
- Fondo >3mm interno: descuento normal sin ranura
- Fajas: `ef < 18mm` → 2 piezas (frente + trasera). `ef >= 18mm` → 1 pieza (fondo rígido hace de contrafrente)
- Filos por defecto: función pura `filosPorDefecto()` — cada lateral usa sus propios campos de ensamble
- Codificación piezas: `AAMM-OT-MOD-TIPO` — persistente, legible, compatible Code128
- Lista de corte: un solo JSON con todos los módulos seleccionados → un solo PDF + CSVs. Python en PATH en desarrollo, embebido en producción (B1-09)
- CSVs operativos: un archivo por combinación material+color+espesor, ordenado por largo DESC, sin fondos delgados (≤6mm)
- Listas de corte: generación transaccional con rollback si falla el script. Un módulo no puede estar en dos listas salvo `motivo IS NOT NULL` ('roto'/'faltante'). Reimprimir regenera sin crear lista nueva. Anular elimina con CASCADE liberando módulos. PDF se abre automáticamente con el visor del sistema al generar o reimprimir.
- `SeccionPiezas` recibe prop `ensamble` desde `Editor/index.jsx`
- Vano = bajomesada/alacena/columna con `cant_puertas=0` y `cant_estantes=0`
- Cajón = sub-componente calculado dentro de módulo cajonera — motor separado (B3-13)
- CSS pendiente: clases del widget `WidgetEnsambleCostados` en `Secciones.css` (B3-14)