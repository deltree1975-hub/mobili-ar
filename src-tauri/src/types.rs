// ============================================================
// MOBILI-AR -- Tipos compartidos Rust <-> React
// Archivo  : src-tauri/src/types.rs
// Modulo   : F1-04 / F3-01 / F3-02
// ============================================================

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Trabajo {
    pub id:            String,
    pub nombre:        String,
    pub cliente:       Option<String>,
    pub notas:         Option<String>,
    pub estado:        String,
    pub prioridad:     i64,
    pub fecha_entrega: Option<String>,
    pub creado_en:     String,
    pub numero_ot:     Option<i64>,   // ← nuevo
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

// -- COMPOSICION ----------------------------------------------

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

// -- MODULO ---------------------------------------------------

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Modulo {
    pub id:               String,
    pub composicion_id:   String,
    pub nombre:           String,
    pub codigo:           Option<String>,
    pub disposicion:      String,
    pub ancho:            f64,
    pub alto:             f64,
    pub profundidad:      f64,
    pub espesor_tablero:  f64,
    pub espesor_fondo:    f64,
    pub tipo_union:       String,
    pub cant_estantes:    i64,
    pub cant_puertas:     i64,
    pub overlap_puertas:  f64,
    pub offset_tirador:   f64,
    pub apertura_puerta:  Option<String>,
    pub estado:           String,
    pub creado_en:        String,
    pub material_id:      Option<String>,
    pub color_material:   Option<String>,
    pub color_puerta:     Option<String>,
    pub canto_general_id: Option<String>,
    pub tiene_fondo:      bool,
    pub alto_faja:        f64,
    pub material_fondo_id: Option<String>,
    pub faja_acostada:    bool,
    pub tiene_techo:       bool,
    pub tiene_piso:        bool,
    pub tiene_costado_izq: bool,
    pub tiene_costado_der: bool,
    pub tiene_faja_sup:    bool,
    pub tiene_faja_inf:    bool,
    pub alto_faja_sup:     f64,
    pub alto_faja_inf:     f64,
}

#[derive(Debug, Deserialize)]
pub struct CrearModuloInput {
    pub composicion_id:   String,
    pub nombre:           String,
    pub disposicion:      String,
    pub ancho:            f64,
    pub alto:             f64,
    pub profundidad:      f64,
    pub espesor_tablero:  Option<f64>,
    pub espesor_fondo:    Option<f64>,
    pub tipo_union:       Option<String>,
    pub cant_estantes:    Option<i64>,
    pub cant_puertas:     Option<i64>,
    pub overlap_puertas:  Option<f64>,
    pub offset_tirador:   Option<f64>,
    pub apertura_puerta:  Option<String>,
    pub material_id:      Option<String>,
    pub color_material:   Option<String>,
    pub color_puerta:     Option<String>,
    pub canto_general_id: Option<String>,
    pub tiene_fondo:      Option<bool>,
    pub alto_faja:        Option<f64>,
    pub material_fondo_id: Option<String>,
    pub faja_acostada:    Option<bool>,
    pub tiene_techo:       Option<bool>,
    pub tiene_piso:        Option<bool>,
    pub tiene_costado_izq: Option<bool>,
    pub tiene_costado_der: Option<bool>,
    pub tiene_faja_sup:    Option<bool>,
    pub tiene_faja_inf:    Option<bool>,
    pub alto_faja_sup:     Option<f64>,
    pub alto_faja_inf:     Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct ActualizarModuloInput {
    pub nombre:           String,
    pub disposicion:      String,
    pub ancho:            f64,
    pub alto:             f64,
    pub profundidad:      f64,
    pub espesor_tablero:  f64,
    pub espesor_fondo:    f64,
    pub tipo_union:       String,
    pub cant_estantes:    i64,
    pub cant_puertas:     i64,
    pub overlap_puertas:  f64,
    pub offset_tirador:   f64,
    pub apertura_puerta:  Option<String>,
    pub material_id:      Option<String>,
    pub color_material:   Option<String>,
    pub color_puerta:     Option<String>,
    pub canto_general_id: Option<String>,
    pub tiene_fondo:      bool,
    pub alto_faja:        f64,
    pub material_fondo_id: Option<String>,
    pub faja_acostada:    bool,
    pub tiene_techo:       bool,
    pub tiene_piso:        bool,
    pub tiene_costado_izq: bool,
    pub tiene_costado_der: bool,
    pub tiene_faja_sup:    bool,
    pub tiene_faja_inf:    bool,
    pub alto_faja_sup:     f64,
    pub alto_faja_inf:     f64,
}

// -- LIBRERIA -------------------------------------------------

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LibreriaModulo {
    pub id:          String,
    pub codigo:      String,
    pub disposicion: String,
    pub nombre:      String,
    pub descripcion: Option<String>,
    pub config_json: String,
}

// -- F2-01: Usuarios y Sesiones -------------------------------

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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Disposicion {
    pub id:                        String,
    pub nombre:                    String,
    pub tiene_techo:               bool,
    pub tiene_piso:                bool,
    pub tiene_costado_izq:         bool,
    pub tiene_costado_der:         bool,
    pub tiene_fondo:               bool,
    pub tiene_faja_sup:            bool,
    pub tiene_faja_inf:            bool,
    pub alto_faja_sup:             f64,
    pub alto_faja_inf:             f64,
    pub costado_izq_pasante_techo: bool,
    pub costado_der_pasante_techo: bool,
    pub costado_izq_pasante_piso:  bool,
    pub costado_der_pasante_piso:  bool,
    pub fondo_tipo:                String,
    pub fondo_retranqueo:          f64,
    pub es_sistema:                bool,
    pub activo:                    bool,
}

#[derive(Debug, Deserialize)]
pub struct CrearDisposicionInput {
    pub id:            String,
    pub nombre:        String,
    pub tiene_fajas:   bool,
    pub posicion_faja: Option<String>,
    pub alto_faja:     Option<f64>,
}

// -- F3-01: Motor de Calculo ----------------------------------

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum FondoTipo {
    #[serde(rename = "pasante")] Pasante,
    #[serde(rename = "interno")]  Interno,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum TipoPieza {
    #[serde(rename = "side")]       Lateral,
    #[serde(rename = "horizontal")] Horizontal,
    #[serde(rename = "back")]       Fondo,
    #[serde(rename = "shelf")]      Estante,
    #[serde(rename = "door")]       Puerta,
    #[serde(rename = "faja")]       Faja,
    #[serde(rename = "divisor")]    Divisor,
}

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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EnsambleConfig {
    pub modulo_id:                  String,
    pub costado_izq_pasante_techo:  bool,
    pub costado_der_pasante_techo:  bool,
    pub costado_izq_pasante_piso:   bool,
    pub costado_der_pasante_piso:   bool,
    pub fondo_tipo:                 FondoTipo,
    pub fondo_retranqueo:           f64,
}

#[derive(Debug, Deserialize)]
pub struct SetEnsambleInput {
    pub modulo_id:                  String,
    pub costado_izq_pasante_techo:  bool,
    pub costado_der_pasante_techo:  bool,
    pub costado_izq_pasante_piso:   bool,
    pub costado_der_pasante_piso:   bool,
    pub fondo_tipo:                 String,
    pub fondo_retranqueo:           f64,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct CantosPieza {
    pub frente_id:    Option<String>,
    pub posterior_id: Option<String>,
    pub superior_id:  Option<String>,
    pub inferior_id:  Option<String>,
}
#[derive(Debug, Clone)]
pub struct MotorParams {
    pub ancho:            f64,
    pub alto:             f64,
    pub profundidad:      f64,
    pub espesor_tablero:  f64,
    pub espesor_fondo:    f64,
    pub offset:           f64,
    pub cant_estantes:    i64,
    pub ensamble:         EnsambleConfig,
    // paneles opcionales
    pub tiene_techo:      bool,
    pub tiene_piso:       bool,
    pub tiene_costado_izq: bool,
    pub tiene_costado_der: bool,
    pub tiene_fondo:      bool,
    pub tiene_faja_sup:   bool,
    pub tiene_faja_inf:   bool,
    pub alto_faja_sup:    f64,
    pub alto_faja_inf:    f64,
    // legacy (se mantienen por compatibilidad)
    pub tiene_fajas:      bool,
    pub posicion_faja:    String,
    pub alto_faja:        f64,
    pub faja_acostada:    bool,
    pub material_fondo_id: Option<String>,
    pub divisores:        Option<Vec<DivisorParams>>,
}

// -- F3-02: Divisores -----------------------------------------

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Divisor {
    pub id:         String,
    pub modulo_id:  String,
    pub posicion_x: f64,
    pub desde:      String,
    pub hasta:      String,
    pub orden:      i64,
    pub creado_en:  String,
}

#[derive(Debug, Deserialize)]
pub struct CrearDivisorInput {
    pub modulo_id:  String,
    pub posicion_x: f64,
    pub desde:      String,
    pub hasta:      String,
    pub orden:      Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DivisorParams {
    pub posicion_x: f64,
    pub desde:      String,
    pub hasta:      String,
}
// -- F3-01: Materiales ----------------------------------------
// Agregar en src-tauri/src/types.rs

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Material {
    pub id:        String,
    pub tipo:      String,   // Melamina, MDF, Multilaminado
    pub color:     String,   // Blanco Polar, Grafito
    pub largo:     f64,      // mm
    pub ancho:     f64,      // mm
    pub espesor:   f64,      // mm — sincroniza con espesor_tablero/fondo
    pub cantidad:  i64,      // placas en stock
    pub activo:    bool,
    pub creado_en: String,
}

#[derive(Debug, Deserialize)]
pub struct CrearMaterialInput {
    pub tipo:     String,
    pub color:    String,
    pub largo:    f64,
    pub ancho:    f64,
    pub espesor:  f64,
    pub cantidad: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct ActualizarMaterialInput {
    pub tipo:     String,
    pub color:    String,
    pub largo:    f64,
    pub ancho:    f64,
    pub espesor:  f64,
    pub cantidad: i64,
}
// -- F3-04: Config por pieza (frontend → backend) 
#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ConfigPieza {
    pub material_id:      Option<String>,
    pub canto_frente_id:  Option<String>,
    pub canto_posterior_id: Option<String>,
    pub canto_superior_id:  Option<String>,
    pub canto_inferior_id:  Option<String>,
}
#[derive(Debug, Serialize, Deserialize, Clone, Default)]  // ← agregar Default
pub struct PiezaCalculada {
    pub tipo:               String,
    pub nombre:             String,
    pub codigo:             String,
    pub ancho_nominal:      f64,
    pub alto_nominal:       f64,
    pub ancho_corte:        f64,
    pub alto_corte:         f64,
    pub espesor:            f64,
    pub regaton_alto:       f64,
    pub material_id:        Option<String>,
    pub canto_frente_id:    Option<String>,
    pub canto_posterior_id: Option<String>,
    pub canto_superior_id:  Option<String>,
    pub canto_inferior_id:  Option<String>,
}