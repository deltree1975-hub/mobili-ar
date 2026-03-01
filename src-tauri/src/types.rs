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
    pub material_id:     Option<String>,
    pub color_material:  Option<String>,
    pub tipo_canto:      String,
    pub espesor_canto:   f64,
    pub canto_sup:       bool,
    pub canto_inf:       bool,
    pub canto_izq:       bool,
    pub canto_der:       bool,
    pub apertura_puerta: String,
    pub tiene_fondo:     bool,
    pub alto_faja:       f64,
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
    pub material_id:     Option<String>,
    pub color_material:  Option<String>,
    pub tipo_canto:      Option<String>,
    pub espesor_canto:   Option<f64>,
    pub canto_sup:       Option<bool>,
    pub canto_inf:       Option<bool>,
    pub canto_izq:       Option<bool>,
    pub canto_der:       Option<bool>,
    pub apertura_puerta: Option<String>,
    pub tiene_fondo:     Option<bool>,
    pub alto_faja:       Option<f64>,
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

#[derive(Debug, Deserialize)]
pub struct ActualizarModuloInput {
    pub nombre:             String,
    pub disposicion:        String,
    pub ancho:              f64,
    pub alto:               f64,
    pub profundidad:        f64,
    pub espesor_tablero:    f64,
    pub espesor_fondo:      f64,
    pub tipo_union:         String,
    pub costados_por_fuera: bool,
    pub fondo_embutido:     bool,
    pub tapa_apoyada:       bool,
    pub cant_estantes:      i64,
    pub cant_puertas:       i64,
    pub overlap_puertas:    f64,
    pub inset_estantes:     f64,
    pub offset_tirador:     f64,
    pub material_id:        Option<String>,
    pub color_material:     Option<String>,
    pub tipo_canto:         String,
    pub espesor_canto:      f64,
    pub canto_sup:          bool,
    pub canto_inf:          bool,
    pub canto_izq:          bool,
    pub canto_der:          bool,
    pub apertura_puerta:    String,
    pub tiene_fondo:        bool,
    pub alto_faja:          f64,
}

// ── F2-01: Usuarios y Sesiones ────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Usuario {
    pub id:            String,
    pub nombre:        String,
    pub apellido:      String,
    pub rol:           String,
    pub token:         String,
    pub activo:        bool,
    pub ultimo_acceso: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Mansion {
    pub id:     String,
    pub codigo: String,
    pub nombre: String,
    pub activo: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SesionActiva {
    pub sesion_id:             String,
    pub usuario:               Usuario,
    pub mansion_activa:        Mansion,
    pub mansiones_habilitadas: Vec<Mansion>,
    pub iniciada_en:           String,
}

#[derive(Debug, Deserialize)]
pub struct CrearUsuarioInput {
    pub nombre:    String,
    pub apellido:  String,
    pub rol:       String,
    pub mansiones: Vec<String>,
}

// ── F3-01: Disposiciones ──────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Disposicion {
    pub id:            String,
    pub nombre:        String,
    pub tiene_fajas:   bool,
    pub posicion_faja: Option<String>, // "superior" | "inferior"
    pub alto_faja:     f64,
    pub activo:        bool,
}

#[derive(Debug, Deserialize)]
pub struct CrearDisposicionInput {
    pub id:            String, // el usuario define el código, ej: "bm2"
    pub nombre:        String,
    pub tiene_fajas:   bool,
    pub posicion_faja: Option<String>,
    pub alto_faja:     Option<f64>,
}

// ── F3-01: Motor de Cálculo ───────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum FondoTipo {
    #[serde(rename = "pasante")]
    Pasante,
    #[serde(rename = "interno")]
    Interno,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum TipoPieza {
    #[serde(rename = "side")]
    Lateral,
    #[serde(rename = "horizontal")]
    Horizontal,
    #[serde(rename = "back")]
    Fondo,
    #[serde(rename = "shelf")]
    Estante,
    #[serde(rename = "door")]
    Puerta,
    #[serde(rename = "faja")]
    Faja,
}

// Canto del catálogo de depósito
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Canto {
    pub id:           String,
    pub nombre:       String,
    pub color:        String,
    pub material:     String,
    pub espesor:      f64,
    pub alto_canto:   f64,
    pub stock_metros: f64,
    pub activo:       bool,
    pub creado_en:    String,
}

#[derive(Debug, Deserialize)]
pub struct CrearCantoInput {
    pub nombre:       String,
    pub color:        String,
    pub material:     String,
    pub espesor:      f64,
    pub alto_canto:   f64,
    pub stock_metros: Option<f64>,
}

// Configuración de ensamble de un módulo
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnsambleConfig {
    pub modulo_id:             String,
    pub costado_pasante_techo: bool,
    pub costado_pasante_piso:  bool,
    pub fondo_tipo:            FondoTipo,
    pub fondo_retranqueo:      f64,
}

#[derive(Debug, Deserialize)]
pub struct SetEnsambleInput {
    pub modulo_id:             String,
    pub costado_pasante_techo: bool,
    pub costado_pasante_piso:  bool,
    pub fondo_tipo:            String, // "pasante" | "interno"
    pub fondo_retranqueo:      f64,
}

// Cantos asignados a una pieza individual
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CantosPieza {
    pub frente_id:    Option<String>,
    pub posterior_id: Option<String>,
    pub superior_id:  Option<String>,
    pub inferior_id:  Option<String>,
}

// Resultado del motor: pieza calculada
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PiezaCalculada {
    pub tipo:          String,
    pub nombre:        String,
    pub codigo:        String,
    pub ancho_nominal: f64,
    pub alto_nominal:  f64,
    pub ancho_corte:   f64,
    pub alto_corte:    f64,
    pub espesor:       f64,
    pub regaton_alto:  f64,
}

// Parámetros que el motor necesita para calcular
#[derive(Debug, Clone)]
pub struct MotorParams {
    pub ancho:           f64,
    pub alto:            f64,
    pub profundidad:     f64,
    pub espesor_tablero: f64,
    pub espesor_fondo:   f64,
    pub offset:          f64,
    pub cant_estantes:   i64,
    pub ensamble:        EnsambleConfig,
    // Fajas
    pub tiene_fajas:     bool,
    pub posicion_faja:   String, // "superior" | "inferior"
    pub alto_faja:       f64,
    // Fondo opcional
    pub tiene_fondo:     bool,
}