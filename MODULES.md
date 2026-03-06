# MOBILI-AR — Estado del Proyecto

**Actualizado:** 2026-03-06
**Rama activa:** `main`

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

## Fase 1 — Fundación Técnica

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F1-01 | Setup proyecto Tauri | ✅ COMPLETO | |
| F1-02 | Esquema SQLite en Rust | ✅ COMPLETO | Schema v7 activo |
| F1-02b | Cifrado SQLCipher | ❌ CANCELADO | Protección: carpeta RAR con clave o permisos Windows |
| F1-03 | Selector de carpeta | ✅ COMPLETO | |
| F1-04 | Capa de comandos Tauri | ✅ COMPLETO | |
| F1-05 | Migración JSON → SQLite | ⛔ SUSPENDIDO | No hay datos legacy |
| F1-06 | Dashboard trabajos | ✅ COMPLETO | |
| F1-07 | Proyecto y Composición | ✅ COMPLETO | |
| F1-08 | Editor de módulo | ✅ COMPLETO | |
| F1-09 | Librería de módulos | ✅ COMPLETO | Gestión de librería → F2-08 |
| F1-10 | Build y distribución | ⬜ PENDIENTE | depende de F1-01 |

## Fase 2 — Usuarios y Sesiones

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F2-01 | Tabla usuarios SQLite | ✅ COMPLETO | |
| F2-02 | Gestión de usuarios | ✅ COMPLETO | Vista y alta de usuarios implementada |
| F2-03 | Generación de token | ✅ COMPLETO | Token generado automáticamente al crear usuario |
| F2-04 | Impresión tarjeta usuario | ✅ COMPLETO | |
| F2-05 | Pantalla de sesión | ✅ COMPLETO | Flujo de login por tarjeta y selección de mansión |
| F2-06 | Validación de token | ✅ COMPLETO | Comando `validar_token` activo en backend |
| F2-07 | Toggle de sesión | ✅ COMPLETO | Cambio Taller/Gestión sin relogueo. Lógica en App.jsx |
| F2-08 | Sistema de permisos | ⬜ PENDIENTE | depende de F2-06 |
| F2-09 | Indicador sesión activa | ⬜ PENDIENTE | depende de F2-06 |
| F2-10 | Cierre al cerrar la app | ⬜ PENDIENTE | depende de F2-06 |
| F2-11 | Log de sesiones | ⬜ PENDIENTE | depende de F2-06 |

## Fase 3 — Modelo Paramétrico

| Código | Módulo | Estado | Notas |
|--------|--------|--------|-------|
| F3-01 | Gestión de materiales | ✅ COMPLETO | Schema v7, CRUD, ingreso por remito, vista grid/lista |
| F3-02 | Divisores de módulo | ✅ COMPLETO | Schema v5/v6, divisores verticales con sectores |
| F3-03 | Configuración por pieza | ✅ COMPLETO | Modal con vista 2D técnica, material y cantos individuales |
| F3-04 | Motor de cálculo | 🟡 EN PAUSA | Backend completo. Bugs pendientes — ver notas |
| F3-04b | Gestión de cantos | ✅ COMPLETO | GestionCantos en sidebar, CRUD completo |
| F3-05 | Orientación de veta | ⬜ PENDIENTE | depende de F3-01 |
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

---

## Contexto técnico actual

**Stack:** Rust + Tauri 2 / React / SQLite
**DB:** `mobiliar.db` en `C:\Users\roockie\Documents\mobiliar\`
**Schema:** v7 estable

### Decisiones técnicas relevantes
- `confirm()` nativo no funciona en Tauri → usar confirmación inline con estado React
- Migraciones deben verificar existencia de columnas antes de operar (`PRAGMA table_info`)
- `mobiliar-schema.sql` es la fuente de verdad para DBs nuevas — debe mantenerse sincronizado con las migraciones
- Stock de materiales se mueve por remito (ingreso manual) — consumo automático en F5-01
- Modal de configuración por pieza (F3-03) reutilizable para mecanizados en F6
- `PiezaCalculada` tiene `Default` derive — los campos de cantos/material se inicializan en `None` en el motor
- `confirmar_piezas_modulo` recibe `configs: Vec<ConfigPieza>` desde React — mismo orden que piezas[]
- Cantos: campo `nombre` es libre, `color` identifica la placa, `material` es el tipo (pvc/abs/etc)

### Bugs pendientes en F3-04
1. **Configs no se restauran al recalcular** — `SeccionPiezas` recibe `PiezaCalculada` con `canto_*_id` y `material_id` pero no los usa para poblar el estado `filos` y `materiales_`. Fix: en `handleCalcular`, después de `setPiezas(resultado)`, poblar `filos` y `materiales_` desde los campos de cada pieza.
2. **4 filos por defecto en fondo** — el `useEffect` de defaults asigna `canto_general_id` a todas las piezas incluyendo `back` (fondo 3mm). Fix: excluir `tipo === 'back'` del default de cantos.
3. **Panel derecho no muestra materiales** — `ResumenModulo` filtra por `m.tipo === 'tablero'` (schema viejo). Fix: eliminar el filtro o usar `m.tipo !== 'HDF'` para separar cuerpo de fondo. Label debe usar `${m.tipo} ${m.color} ${m.espesor}mm` en lugar de `m.nombre` (campo eliminado en v7).

### Próximo paso sugerido
Terminar los bugs de F3-04 antes de avanzar a F3-05. Son tres fixes quirúrgicos en `SeccionPiezas.jsx` y `ResumenModulo.jsx`.