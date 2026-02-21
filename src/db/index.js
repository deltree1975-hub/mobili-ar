// ============================================================
// MOBILI-AR — Capa de acceso a datos desde React
// Archivo  : src/db/index.js
// Módulo   : F1-04 — Capa de comandos Tauri
// Depende  : @tauri-apps/api/core → invoke()
// Expone   : trabajos, composiciones, modulos, libreria
// Creado   : [fecha]
// ============================================================

import { invoke } from '@tauri-apps/api/core';

// ── TRABAJOS ──────────────────────────────────────────────────

/**
 * Retorna todos los trabajos activos ordenados por prioridad.
 * @param {boolean} incluirArchivados - default: false
 * @returns {Promise<Array>}
 */
export async function getTrabajosActivos(incluirArchivados = false) {
  return await invoke('get_trabajos_activos', { incluirArchivados });
}

/**
 * Crea un nuevo trabajo.
 * @param {{ nombre: string, cliente?: string, notas?: string }} datos
 * @returns {Promise<Object>} trabajo creado
 */
export async function crearTrabajo(datos) {
  return await invoke('crear_trabajo', { datos });
}

/**
 * Actualiza campos de un trabajo existente.
 * @param {string} id
 * @param {Object} datos - campos a actualizar (todos opcionales)
 * @returns {Promise<Object>} trabajo actualizado
 */
export async function actualizarTrabajo(id, datos) {
  return await invoke('actualizar_trabajo', { id, datos });
}

/**
 * Cambia el estado de un trabajo.
 * @param {string} trabajoId
 * @param {string} nuevoEstado
 * @param {string} usuarioNombre
 * @param {string} [notas]
 * @returns {Promise<void>}
 */
export async function cambiarEstadoTrabajo(trabajoId, nuevoEstado, usuarioNombre, notas) {
  return await invoke('cambiar_estado_trabajo', {
    trabajoId, nuevoEstado, usuarioNombre, notas,
  });
}

// ── COMPOSICIONES ─────────────────────────────────────────────

/**
 * Retorna todas las composiciones de un trabajo.
 * @param {string} trabajoId
 * @returns {Promise<Array>}
 */
export async function getComposiciones(trabajoId) {
  return await invoke('get_composiciones', { trabajoId });
}

/**
 * Crea una nueva composición dentro de un trabajo.
 * @param {{ trabajo_id: string, nombre: string, descripcion?: string }} datos
 * @returns {Promise<Object>}
 */
export async function crearComposicion(datos) {
  return await invoke('crear_composicion', { datos });
}

// ── MÓDULOS ───────────────────────────────────────────────────

/**
 * Retorna todos los módulos de una composición.
 * @param {string} composicionId
 * @returns {Promise<Array>}
 */
export async function getModulos(composicionId) {
  return await invoke('get_modulos', { composicionId });
}

/**
 * Crea un nuevo módulo en una composición.
 * @param {Object} datos - ver CrearModuloInput en types.rs
 * @returns {Promise<Object>}
 */
export async function crearModulo(datos) {
  return await invoke('crear_modulo', { datos });
}

/**
 * Elimina un módulo y todas sus piezas.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function eliminarModulo(id) {
  return await invoke('eliminar_modulo', { id });
}

// ── LIBRERÍA ──────────────────────────────────────────────────

/**
 * Retorna todos los módulos activos de la librería estándar.
 * @returns {Promise<Array>}
 */
export async function getLibreria() {
  return await invoke('get_libreria');
}