// ============================================================
// MOBILI-AR — Lógica de cálculo paramétrico
// Archivo  : src-tauri/src/engine/calculator.rs
// Módulo   : F3-01
// Sin efectos secundarios — función pura
// ============================================================

//use crate::types::{EnsambleConfig, FondoTipo, MotorParams, PiezaCalculada};
use crate::types::{FondoTipo, MotorParams, PiezaCalculada};

pub fn calcular_piezas(params: &MotorParams) -> Vec<PiezaCalculada> {
    let mut piezas: Vec<PiezaCalculada> = Vec::new();

    let a   = params.ancho;
    let al  = params.alto;
    let p   = params.profundidad;
    let et  = params.espesor_tablero;
    let ef  = params.espesor_fondo;
    let off = params.offset;
    let e   = &params.ensamble;

    let et_ef = et + off; // espesor efectivo con offset

    let fondo_pasante = e.fondo_tipo == FondoTipo::Pasante;
    let fr            = e.fondo_retranqueo;

    // ── LATERALES ─────────────────────────────────────────────
    // El lateral es siempre el referente. Alto = alto total del módulo.
    let lat_ancho = if fondo_pasante { p - ef } else { p };
    let lat_alto  = al;

    for (nombre, codigo) in [("Lateral Izquierdo", "LAT-IZQ"), ("Lateral Derecho", "LAT-DER")] {
        piezas.push(PiezaCalculada {
            tipo:          "side".to_string(),
            nombre:        nombre.to_string(),
            codigo:        codigo.to_string(),
            ancho_nominal: lat_ancho,
            alto_nominal:  lat_alto,
            ancho_corte:   lat_ancho, // se ajusta al asignar cantos
            alto_corte:    lat_alto,
            espesor:       et,
            regaton_alto:  0.0,
        });
    }

    // ── TECHO ─────────────────────────────────────────────────
    let techo_ancho = if e.costado_pasante_techo { a - et_ef * 2.0 } else { a };
    let techo_alto  = if fondo_pasante { p - ef } else { p };

    piezas.push(PiezaCalculada {
        tipo:          "horizontal".to_string(),
        nombre:        "Techo".to_string(),
        codigo:        "TECHO".to_string(),
        ancho_nominal: techo_ancho,
        alto_nominal:  techo_alto,
        ancho_corte:   techo_ancho,
        alto_corte:    techo_alto,
        espesor:       et,
        regaton_alto:  0.0,
    });

    // ── PISO ──────────────────────────────────────────────────
    let piso_ancho = if e.costado_pasante_piso { a - et_ef * 2.0 } else { a };
    let piso_alto  = if fondo_pasante { p - ef } else { p };

    piezas.push(PiezaCalculada {
        tipo:          "horizontal".to_string(),
        nombre:        "Piso".to_string(),
        codigo:        "PISO".to_string(),
        ancho_nominal: piso_ancho,
        alto_nominal:  piso_alto,
        ancho_corte:   piso_ancho,
        alto_corte:    piso_alto,
        espesor:       et,
        regaton_alto:  0.0,
    });

    // ── FONDO ─────────────────────────────────────────────────
    // Siempre entra entre laterales y entre techo y piso
    let fondo_ancho = a - et_ef * 2.0;
    let fondo_alto  = al - et_ef * 2.0;

    piezas.push(PiezaCalculada {
        tipo:          "back".to_string(),
        nombre:        "Fondo".to_string(),
        codigo:        "FONDO".to_string(),
        ancho_nominal: fondo_ancho,
        alto_nominal:  fondo_alto,
        ancho_corte:   fondo_ancho,
        alto_corte:    fondo_alto,
        espesor:       ef,
        regaton_alto:  0.0,
    });

    // ── ESTANTES ──────────────────────────────────────────────
    let est_ancho = a - et_ef * 2.0;
    let est_alto  = if fondo_pasante { p - ef } else { p - ef - fr };

    for i in 1..=params.cant_estantes {
        piezas.push(PiezaCalculada {
            tipo:          "shelf".to_string(),
            nombre:        format!("Estante {}", i),
            codigo:        format!("EST-{}", i),
            ancho_nominal: est_ancho,
            alto_nominal:  est_alto,
            ancho_corte:   est_ancho,
            alto_corte:    est_alto,
            espesor:       et,
            regaton_alto:  0.0,
        });
    }

    piezas
}

// ── AJUSTE DE CORTE POR CANTOS ────────────────────────────────
// Recibe una pieza ya calculada y los espesores de sus 4 cantos.
// Devuelve las dimensiones de corte reales.
pub fn aplicar_cantos(
    pieza:            &PiezaCalculada,
    frente_esp:       f64,
    posterior_esp:    f64,
    superior_esp:     f64,
    inferior_esp:     f64,
    regaton_alto:     f64,
) -> (f64, f64) {
    let ancho_corte = pieza.ancho_nominal - frente_esp - posterior_esp;
    let alto_corte  = pieza.alto_nominal  - superior_esp - inferior_esp - regaton_alto;
    (ancho_corte, alto_corte)
}

// ── TESTS ─────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{EnsambleConfig, FondoTipo, MotorParams};

    fn ensamble_default() -> EnsambleConfig {
        EnsambleConfig {
            modulo_id:             "test".to_string(),
            costado_pasante_techo: true,
            costado_pasante_piso:  true,
            fondo_tipo:            FondoTipo::Interno,
            fondo_retranqueo:      12.0,
        }
    }

    fn params_default() -> MotorParams {
        MotorParams {
            ancho:           600.0,
            alto:            720.0,
            profundidad:     550.0,
            espesor_tablero: 18.0,
            espesor_fondo:   3.0,
            offset:          0.5,
            cant_estantes:   1,
            ensamble:        ensamble_default(),
        }
    }

    #[test]
    fn test_cantidad_piezas() {
        let piezas = calcular_piezas(&params_default());
        // 2 laterales + techo + piso + fondo + 1 estante = 6
        assert_eq!(piezas.len(), 6);
    }

    #[test]
    fn test_lateral_fondo_interno() {
        let piezas = calcular_piezas(&params_default());
        let lat = piezas.iter().find(|p| p.codigo == "LAT-IZQ").unwrap();
        // fondo interno → lateral va a profundidad completa
        assert_eq!(lat.ancho_nominal, 550.0);
        assert_eq!(lat.alto_nominal,  720.0);
    }

    #[test]
    fn test_techo_pasante() {
        let piezas = calcular_piezas(&params_default());
        let techo = piezas.iter().find(|p| p.codigo == "TECHO").unwrap();
        // costado pasante → techo descuenta ET+offset × 2
        let esperado = 600.0 - (18.0 + 0.5) * 2.0;
        assert_eq!(techo.ancho_nominal, esperado); // 563.0
    }

    #[test]
    fn test_estante_fondo_interno() {
        let piezas = calcular_piezas(&params_default());
        let est = piezas.iter().find(|p| p.codigo == "EST-1").unwrap();
        // fondo interno → estante = P - EF - retranqueo
        let esperado = 550.0 - 3.0 - 12.0;
        assert_eq!(est.alto_nominal, esperado); // 535.0
    }

    #[test]
    fn test_aplicar_cantos() {
        let pieza = PiezaCalculada {
            tipo: "side".to_string(), nombre: "test".to_string(),
            codigo: "T".to_string(),
            ancho_nominal: 450.0, alto_nominal: 720.0,
            ancho_corte: 450.0,   alto_corte: 720.0,
            espesor: 18.0,        regaton_alto: 0.0,
        };
        let (ac, alc) = aplicar_cantos(&pieza, 2.0, 2.0, 0.0, 0.0, 25.0);
        assert_eq!(ac,  446.0); // 450 - 2 - 2
        assert_eq!(alc, 695.0); // 720 - 0 - 0 - 25
    }
}