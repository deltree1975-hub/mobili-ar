// ============================================================
// MOBILI-AR — Tipos compartidos Rust ↔ React
// Archivo  : src-tauri/src/types.rs
// Módulo   : F1-04 — Capa de comandos Tauri
// Depende  : serde
// Expone   : Trabajo, Composicion, Modulo y sus inputs
// Creado   : [fecha]
// ============================================================

use serde::{Deserialize, Serialize};

// ── TRABAJO ───────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Trabajo {
    pub id: String,
    pub nombre: String,
    pub cliente: Option<String>,
    pub notas: Option<String>,
    pub estado: String,
    pub prioridad: i64,
    pub fecha_entrega: Option<String>,
    pub creado_en: String,
}

#[derive(Debug, Deserialize)]
pub struct CrearTrabajoInput {
    pub nombre: String,
    pub cliente: Option<String>,
    pub notas: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ActualizarTrabajoInput {
    pub nombre: Option<String>,
    pub cliente: Option<String>,
    pub notas: Option<String>,
    pub prioridad: Option<i64>,
    pub fecha_entrega: Option<String>,
}

// ── COMPOSICION ───────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Composicion {
    pub id: String,
    pub trabajo_id: String,
    pub nombre: String,
    pub descripcion: Option<String>,
    pub orden: i64,
    pub creado_en: String,
}

#[derive(Debug, Deserialize)]
pub struct CrearComposicionInput {
    pub trabajo_id: String,
    pub nombre: String,
    pub descripcion: Option<String>,
}

// ── MODULO ────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Modulo {
    pub id: String,
    pub composicion_id: String,
    pub nombre: String,
    pub codigo: Option<String>,
    pub disposicion: String,
    pub ancho: f64,
    pub alto: f64,
    pub profundidad: f64,
    pub espesor_tablero: f64,
    pub espesor_fondo: f64,
    pub tipo_union: String,
    pub costados_por_fuera: bool,
    pub fondo_embutido: bool,
    pub tapa_apoyada: bool,
    pub cant_estantes: i64,
    pub cant_puertas: i64,
    pub overlap_puertas: f64,
    pub inset_estantes: f64,
    pub offset_tirador: f64,
    pub estado: String,
    pub creado_en: String,
}

#[derive(Debug, Deserialize)]
pub struct CrearModuloInput {
    pub composicion_id: String,
    pub nombre: String,
    pub disposicion: String,
    pub ancho: f64,
    pub alto: f64,
    pub profundidad: f64,
    pub espesor_tablero: Option<f64>,
    pub espesor_fondo: Option<f64>,
    pub tipo_union: Option<String>,
    pub costados_por_fuera: Option<bool>,
    pub fondo_embutido: Option<bool>,
    pub tapa_apoyada: Option<bool>,
    pub cant_estantes: Option<i64>,
    pub cant_puertas: Option<i64>,
    pub overlap_puertas: Option<f64>,
    pub inset_estantes: Option<f64>,
    pub offset_tirador: Option<f64>,
}

// ── LIBRERÍA ──────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LibreriaModulo {
    pub id: String,
    pub codigo: String,
    pub disposicion: String,
    pub nombre: String,
    pub descripcion: Option<String>,
    pub config_json: String,
}