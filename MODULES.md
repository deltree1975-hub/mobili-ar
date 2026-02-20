# MOBILI-AR — Estado del Proyecto

**Actualizado:** [fecha de hoy]
**En curso:** F1-02 — Esquema SQLite en Rust
**Rama activa:** `feat/F1-02-sqlite`

---

| Estado | Significado |
|--------|-------------|
| ⬜ PENDIENTE | No empezado |
| 🔵 EN CURSO | Tenés una rama activa |
| 🟡 EN PAUSA | Empezaste, lo retomás después |
| 🔴 BLOQUEADO | Esperando otro módulo |
| ✅ COMPLETO | Mergeado a main, funciona |

---

## Fase 1 — Fundación Técnica

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F1-01 | Setup proyecto Tauri | ✅ COMPLETO | |
| F1-02 | Esquema SQLite en Rust | ✅ COMPLETO | |
| F1-03 | Selector de carpeta    | 🔵 EN CURSO | rama: feat/F1-03-selector |
| F1-04 | Capa de comandos Tauri | ⬜ PENDIENTE | depende de F1-02 |
| F1-05 | Migración JSON → SQLite | ⬜ PENDIENTE | depende de F1-04 |
| F1-06 | Dashboard trabajos | ⬜ PENDIENTE | depende de F1-04 |
| F1-07 | Proyecto y Composición | ⬜ PENDIENTE | depende de F1-06 |
| F1-08 | Editor de módulo | ⬜ PENDIENTE | depende de F1-06 |
| F1-09 | Librería de módulos | ⬜ PENDIENTE | depende de F1-06 |
| F1-10 | Build y distribución | ⬜ PENDIENTE | depende de F1-01 |

## Fase 2 — Usuarios y Sesiones

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F2-01 | Tabla usuarios SQLite | ⬜ PENDIENTE | depende de F1-02 |
| F2-02 | Gestión de usuarios | ⬜ PENDIENTE | depende de F2-01 |
| F2-03 | Generación de token | ⬜ PENDIENTE | depende de F2-01 |
| F2-04 | Impresión tarjeta usuario | ⬜ PENDIENTE | depende de F2-03 |
| F2-05 | Pantalla de sesión | ⬜ PENDIENTE | depende de F2-01 |
| F2-06 | Validación de token | ⬜ PENDIENTE | depende de F2-05 |
| F2-07 | Toggle de sesión | ⬜ PENDIENTE | depende de F2-06 |
| F2-08 | Sistema de permisos | ⬜ PENDIENTE | depende de F2-06 |
| F2-09 | Indicador sesión activa | ⬜ PENDIENTE | depende de F2-06 |
| F2-10 | Cierre al cerrar la app | ⬜ PENDIENTE | depende de F2-06 |
| F2-11 | Log de sesiones | ⬜ PENDIENTE | depende de F2-06 |

## Fase 3 — Modelo Paramétrico

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F3-01 | Gestión de materiales | ⬜ PENDIENTE | depende de F1-04 |
| F3-02 | Material por pieza | ⬜ PENDIENTE | depende de F3-01 |
| F3-03 | Reglas constructivas | ⬜ PENDIENTE | depende de F1-08 |
| F3-04 | Motor de cálculo | ⬜ PENDIENTE | depende de F3-03 |
| F3-05 | Orientación de veta | ⬜ PENDIENTE | depende de F3-02 |
| F3-06 | Cálculo de cantos | ⬜ PENDIENTE | depende de F3-04 |
| F3-07 | Motor de herrajes | ⬜ PENDIENTE | depende de F3-04 |
| F3-08 | Vista de herrajes | ⬜ PENDIENTE | depende de F3-07 |
| F3-09 | Informe de materiales | ⬜ PENDIENTE | depende de F3-06 |
| F3-10 | Lanzamiento a producción | ⬜ PENDIENTE | depende de F3-04 |
| F3-11 | Vista 2D mejorada | ⬜ PENDIENTE | depende de F3-05 |

## Fase 4 — Control de Producción

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F4-01 | Pantalla de escaneo | ⬜ PENDIENTE | depende de F3-10 |
| F4-02 | Validación de código | ⬜ PENDIENTE | depende de F4-01 |
| F4-03 | Avance de estado | ⬜ PENDIENTE | depende de F4-02 |
| F4-04 | Estados especiales | ⬜ PENDIENTE | depende de F4-03 |
| F4-05 | Estado REHECHO | ⬜ PENDIENTE | depende de F4-04 |
| F4-06 | Historial de pieza | ⬜ PENDIENTE | depende de F4-03 |
| F4-07 | Generación de etiquetas | ⬜ PENDIENTE | depende de F3-10 |
| F4-08 | Modos de impresión | ⬜ PENDIENTE | depende de F4-07 |
| F4-09 | Dashboard de avance | ⬜ PENDIENTE | depende de F4-03 |
| F4-10 | Estados del trabajo | ⬜ PENDIENTE | depende de F4-03 |
| F4-11 | Pausar y reactivar | ⬜ PENDIENTE | depende de F4-10 |
| F4-12 | Documento de despacho | ⬜ PENDIENTE | depende de F4-10 |
| F4-13 | Archivado automático | ⬜ PENDIENTE | depende de F4-10 |
| F4-14 | Filtros pantalla principal | ⬜ PENDIENTE | depende de F4-13 |
| F4-15 | Prioridad y urgencia | ⬜ PENDIENTE | depende de F1-06 |

## Fase 5 — Nesting Industrial

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F5-01 | Gestión de stock | ⬜ PENDIENTE | depende de F3-01 |
| F5-02 | Pantalla de stock | ⬜ PENDIENTE | depende de F5-01 |
| F5-03 | Consolidación de piezas | ⬜ PENDIENTE | depende de F3-10 |
| F5-04 | Algoritmo MaxRects | ⬜ PENDIENTE | depende de F5-03 |
| F5-05 | Selección de placas | ⬜ PENDIENTE | depende de F5-04 |
| F5-06 | Secuencia de corte | ⬜ PENDIENTE | depende de F5-04 |
| F5-07 | Vista visual del tablero | ⬜ PENDIENTE | depende de F5-04 |
| F5-08 | Lista de corte PDF | ⬜ PENDIENTE | depende de F5-06 |
| F5-09 | Parámetros kerf y offset | ⬜ PENDIENTE | depende de F5-04 |
| F5-10 | Confirmación de stock | ⬜ PENDIENTE | depende de F5-06 |
| F5-11 | Alertas material faltante | ⬜ PENDIENTE | depende de F5-04 |
| F5-12 | Corte manual retazos | ⬜ PENDIENTE | depende de F5-01 |

## Fase 6 — Exportación CNC

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F6-01 | Investigación CNC | ⬜ PENDIENTE | |
| F6-02 | Motor DXF | ⬜ PENDIENTE | depende de F6-01 |
| F6-03 | DXF por mecanizado | ⬜ PENDIENTE | depende de F6-02 |
| F6-04 | Exportación individual/lote | ⬜ PENDIENTE | depende de F6-03 |
| F6-05 | Vista previa DXF | ⬜ PENDIENTE | depende de F6-04 |
| F6-06 | Validación con CNC real | ⬜ PENDIENTE | depende de F6-05 |
