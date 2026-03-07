# MOBILI-AR — Estado del Proyecto

**Actualizado:** 2026-03-07
**Rama activa:** `feature/paneles-y-ensamble`
**Schema:** v8 estable

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
| B1-02 | Schema SQLite + migraciones | 🟡 EN PAUSA | v8 activo. Pendiente: agregar `tiene_techo/piso/costado_izq/der/faja_sup/faja_inf` a `modulos`. Actualizar `disposiciones` con campos de paneles y ensamble por defecto. `modulo_ensamble` en schema SQL fuente aún tiene columnas viejas — actualizar a v8. Ver nota B1-02. |
| B1-03 | Selector de carpeta / DB path | ✅ COMPLETO | |
| B1-04 | Capa de comandos Tauri (invoke) | ✅ COMPLETO | |
| B1-05 | Usuarios y roles | ✅ COMPLETO | |
| B1-06 | Sesiones y tokens | ✅ COMPLETO | |
| B1-07 | Sistema de permisos por rol | ⬜ PENDIENTE | depende de B1-05 |
| B1-08 | Multi-terminal (red local / internet) | ⬜ PENDIENTE | SQLite → evaluar migración a servidor central o sync |
| B1-09 | Build y distribución | ⬜ PENDIENTE | |

**Nota B1-02 — campos pendientes en `modulos`:**
```sql
tiene_techo       INTEGER NOT NULL DEFAULT 1,
tiene_piso        INTEGER NOT NULL DEFAULT 1,
tiene_costado_izq INTEGER NOT NULL DEFAULT 1,
tiene_costado_der INTEGER NOT NULL DEFAULT 1,
-- tiene_fondo ya existe
tiene_faja_sup    INTEGER NOT NULL DEFAULT 0,
tiene_faja_inf    INTEGER NOT NULL DEFAULT 0,
alto_faja_sup     REAL NOT NULL DEFAULT 80,
alto_faja_inf     REAL NOT NULL DEFAULT 80,
```
`disposiciones` debe tener todos esos campos como defaults configurables + ensamble default.
`modulo_ensamble` en schema SQL fuente aún tiene columnas viejas — actualizar a v8 (4 campos costado).

---

## Bloque 2 — Flujo administrativo

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B2-01 | Dashboard de obras/trabajos | ✅ COMPLETO | |
| B2-02 | Crear / editar obra (trabajo) | ✅ COMPLETO | |
| B2-03 | Composiciones por obra | ✅ COMPLETO | |
| B2-04 | Librería de módulos (global, por categoría) | 🟡 EN PAUSA | Estructura básica completa. Pendiente: categorías (cocina/living/dormitorio/etc), guardar configuración completa incluyendo ensamble y paneles, cargar desde librería al armar composición. |
| B2-05 | Disposiciones configurables | ⬜ PENDIENTE | Reemplaza enum hardcodeado. CRUD de disposiciones con defaults de paneles + ensamble. `es_sistema=1` para las base (no borrables). depende de B1-02. |
| B2-06 | Crear módulo desde librería | ⬜ PENDIENTE | Copia configuración completa al módulo de la composición. depende de B2-04 y B2-05. |

---

## Bloque 3 — Motor paramétrico

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B3-01 | Gestión de materiales | ✅ COMPLETO | |
| B3-02 | Gestión de cantos | ✅ COMPLETO | |
| B3-03 | Editor de módulo — dimensiones y propiedades | ✅ COMPLETO | |
| B3-04 | Ensamble — 4 campos costado independientes | ✅ COMPLETO | Widget + Rust migrado a v8 |
| B3-05 | Ensamble — restricción costado↔horizontal | ⬜ PENDIENTE | Al activar costado pasante el horizontal correspondiente se fuerza al contrario. Lógica en `actualizarEnsamble` de `Editor/index.jsx`. **Próximo a implementar.** |
| B3-06 | Defaults de paneles por disposición | ⬜ PENDIENTE | Al cambiar disposición, copiar defaults desde tabla `disposiciones`. depende de B1-02 y B2-05. |
| B3-07 | Paneles opcionales (sin techo / sin piso / sin costado) | ⬜ PENDIENTE | Toggle por panel en Editor. Motor `calculator.rs` respeta flags. depende de B1-02. |
| B3-08 | Fajas (superior e inferior) | ⬜ PENDIENTE | Mutuamente excluyente con techo/piso según posición. Motor genera pieza FAJA en lugar de TECHO/PISO. depende de B3-07. |
| B3-09 | Motor de cálculo — bugs (laterales, fondo, ensamble) | ✅ COMPLETO | Bug 1: íconos SVG orden render. Bug 2: laterales izq/der calculados independientemente. Bug 3: fondo 3mm suma ranura×2 (16mm), fondo >3mm descuento normal. |
| B3-10 | Filos por defecto — Bug 4 | ✅ COMPLETO | `useEffect` verifica valor real antes de preservar. `case 'side'` usa campos propios de cada lateral (LAT-IZQ → costado_izq_*, LAT-DER → costado_der_*). |
| B3-11 | Divisores verticales | ✅ COMPLETO | |
| B3-12 | Orientación de veta | ⬜ PENDIENTE | depende de B3-01 |
| B3-13 | Motor de cajones | ⬜ PENDIENTE | Cajón = 2 FL + 2 FF + piso (interno 18mm / pasante 3mm / ranura 3mm+16mm). Espacio interno del módulo cajonera menos corredera (25mm aprox). Modal interno del componente cajonera. |
| B3-14 | CSS — widget ensamble costados | ⬜ PENDIENTE | Clases `.ensamble-costado-btn`, `.ensamble-costado-sublabel`, `.ensamble-costado-estado` en `Secciones.css`. |

---

## Bloque 4 — Generación de documentos de producción

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B4-01 | Lista de corte por módulo | ⬜ PENDIENTE | depende de B3-09 y B3-10 |
| B4-02 | Lista de corte consolidada por composición | ⬜ PENDIENTE | depende de B4-01 |
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
| B5-01 | Generación de códigos de barras por pieza | ⬜ PENDIENTE | Código único: obra+módulo+pieza. depende de B4-09. |
| B5-02 | Generación de códigos por mueble (armado) | ⬜ PENDIENTE | depende de B4-09 |
| B5-03 | Impresión de etiquetas por planchas | ⬜ PENDIENTE | Layout configurable (A4, rollo, etc). depende de B5-01. |
| B5-04 | Lista pañol con códigos de barras (papel) | ⬜ PENDIENTE | Sin etiquetas individuales. depende de B5-01 y B4-06. |

---

## Bloque 6 — Control de producción

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| B6-01 | Pantalla de escaneo (por mansión) | ⬜ PENDIENTE | Vista simplificada según rol/mansión activa. depende de B5-01. |
| B6-02 | Cortador — lista de corte + escaneo | ⬜ PENDIENTE | Escanea etiqueta → pieza pasa a CORTADO. Doble escaneo = menú de estado. |
| B6-03 | Pegado de cantos — escaneo + info filos | ⬜ PENDIENTE | Info resumida de filos en etiqueta. |
| B6-04 | Centro mecanizado — escaneo + programa CNC | ⬜ PENDIENTE | La etiqueta indica qué programa usar. |
| B6-05 | Pañolero — vista simplificada | ⬜ PENDIENTE | Lista con códigos, cambia estado. Puede ingresar materiales y cambiar ubicaciones. No modifica existencias. |
| B6-06 | Armado — escaneo por mueble completo | ⬜ PENDIENTE | Escanea código de mueble. Muestra piezas faltantes si las hay. |
| B6-07 | Limpieza / control calidad / embalaje | ⬜ PENDIENTE | Estados: ok / errado / roto / deficiente. |
| B6-08 | Despacho — habilitado por ok de calidad | ⬜ PENDIENTE | depende de B6-07 |
| B6-09 | Dashboard de avance por obra | ⬜ PENDIENTE | Estado de cada pieza y mueble en tiempo real. |
| B6-10 | Estados especiales (REHECHO, PAUSADO, etc.) | ⬜ PENDIENTE | |
| B6-11 | Historial por pieza | ⬜ PENDIENTE | Quién escaneó, cuándo, qué estado. |

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
| B8-01 | Motor DXF para mecanizados | ⬜ PENDIENTE | Solo mecanizados, corte lo hace programa externo. |
| B8-02 | DXF por tipo de mecanizado | ⬜ PENDIENTE | |
| B8-03 | Exportación individual y por lote | ⬜ PENDIENTE | |
| B8-04 | Vista previa DXF | ⬜ PENDIENTE | |
| B8-05 | Validación con máquina real | ⬜ PENDIENTE | |

---

## Próximos pasos (por urgencia)

```
1. B3-05  — Restricción costado↔horizontal en actualizarEnsamble   ← SIGUIENTE
2. B1-02  — Migración schema: campos de paneles en modulos + disposiciones configurables
3. B3-07  — Paneles opcionales: toggles en Editor + calculator.rs respeta flags
4. B3-08  — Fajas en motor de cálculo
5. B3-06  — Defaults por disposición desde tabla
6. B2-05  — CRUD disposiciones configurables
7. B3-14  — CSS widget ensamble costados
8. B4-01  — Lista de corte (primer documento útil real)
9. B4-09  — Lanzamiento a producción
10. B5-01 — Códigos de barras
```

---

## Contexto técnico

**Stack:** Rust + Tauri 2 / React / SQLite
**DB:** `mobiliar.db` en `C:\Users\roockie\Documents\mobiliar\`
**Multi-terminal:** todas con internet o red local (arquitectura a definir en B1-08)

### Decisiones técnicas vigentes
- `confirm()` nativo no funciona en Tauri → confirmación inline con estado React
- Migraciones usan `columna_existe()` antes de operar — idempotentes
- `mobiliar-schema.sql` es fuente de verdad para DBs nuevas
- Schema v8: `modulo_ensamble` tiene 4 campos de costado independientes. Columnas viejas siguen presentes como backup.
- Motor techo/piso: descuentan si AMBOS costados del lado correspondiente son pasantes (AND lógico)
- Fondo 3mm interno: va en ranura → `ancho/alto - et_ef*2 + 16mm` (8mm por ranura cada lado)
- Fondo >3mm interno: descuento normal sin ranura
- Filos por defecto: función pura `filosPorDefecto()` — cada lateral usa sus propios campos de ensamble (LAT-IZQ → costado_izq_*, LAT-DER → costado_der_*)
- `SeccionPiezas` recibe prop `ensamble` desde `Editor/index.jsx`
- Vano = bajomesada/alacena/columa con `cant_puertas=0` y `cant_estantes=0` — no es disposición propia
- Cajón = sub-componente calculado dentro de módulo cajonera — motor separado (B3-13)
- Librería de módulos: global, organizada por categoría (cocina/living/dormitorio/oficina/baño)
- Disposiciones: entidades configurables en DB, no enum hardcodeado — `es_sistema=1` para las base
- CSS pendiente: clases del widget `WidgetEnsambleCostados` en `Secciones.css` (B3-14)