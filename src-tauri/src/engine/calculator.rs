// ============================================================
// MOBILI-AR — Lógica de cálculo paramétrico
// Archivo  : src-tauri/src/engine/calculator.rs
// Módulo   : F3-01 / F3-02 / B3-07 / B3-08
// Sin efectos secundarios — función pura
// ============================================================

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

    let et_ef = et + off;

    let fondo_pasante = e.fondo_tipo == FondoTipo::Pasante;
    let fr            = e.fondo_retranqueo;

    // ── LATERALES ─────────────────────────────────────────────
    let lat_ancho = if fondo_pasante { p - ef } else { p };

    if params.tiene_costado_izq {
        let izq_desc_sup = if !e.costado_izq_pasante_techo { et_ef } else { 0.0 };
        let izq_desc_inf = if !e.costado_izq_pasante_piso  { et_ef } else { 0.0 };
        let izq_alto     = al - izq_desc_sup - izq_desc_inf;

        piezas.push(PiezaCalculada {
            tipo:          "side".to_string(),
            nombre:        "Lateral Izquierdo".to_string(),
            codigo:        "LAT-IZQ".to_string(),
            ancho_nominal: lat_ancho,
            alto_nominal:  izq_alto,
            ancho_corte:   lat_ancho,
            alto_corte:    izq_alto,
            espesor:       et,
            regaton_alto:  0.0,
            ..Default::default()
        });
    }

    if params.tiene_costado_der {
        let der_desc_sup = if !e.costado_der_pasante_techo { et_ef } else { 0.0 };
        let der_desc_inf = if !e.costado_der_pasante_piso  { et_ef } else { 0.0 };
        let der_alto     = al - der_desc_sup - der_desc_inf;

        piezas.push(PiezaCalculada {
            tipo:          "side".to_string(),
            nombre:        "Lateral Derecho".to_string(),
            codigo:        "LAT-DER".to_string(),
            ancho_nominal: lat_ancho,
            alto_nominal:  der_alto,
            ancho_corte:   lat_ancho,
            alto_corte:    der_alto,
            espesor:       et,
            regaton_alto:  0.0,
            ..Default::default()
        });
    }
    // ── TECHO o FAJA SUPERIOR ─────────────────────────────────
    let horiz_ancho_base = {
        let techo_pasante = e.costado_izq_pasante_techo && e.costado_der_pasante_techo;
        if techo_pasante { a - et_ef * 2.0 } else { a }
    };
    let horiz_prof = if fondo_pasante { p - ef } else { p };

    if params.tiene_faja_sup {
        let faja_alto = params.alto_faja_sup.max(1.0);
        let doble = ef < 18.0;

        piezas.push(PiezaCalculada {
            tipo:          "faja".to_string(),
            nombre:        "Faja Superior Frente".to_string(),
            codigo:        "FAJA-SUP-F".to_string(),
            ancho_nominal: horiz_ancho_base,
            alto_nominal:  faja_alto,
            ancho_corte:   horiz_ancho_base,
            alto_corte:    faja_alto,
            espesor:       et,
            regaton_alto:  0.0,
            ..Default::default()
        });

        if doble {
            piezas.push(PiezaCalculada {
                tipo:          "faja".to_string(),
                nombre:        "Faja Superior Trasera".to_string(),
                codigo:        "FAJA-SUP-T".to_string(),
                ancho_nominal: horiz_ancho_base,
                alto_nominal:  faja_alto,
                ancho_corte:   horiz_ancho_base,
                alto_corte:    faja_alto,
                espesor:       et,
                regaton_alto:  0.0,
                ..Default::default()
            });
        }
    } else if params.tiene_techo {
        piezas.push(PiezaCalculada {
            tipo:          "horizontal".to_string(),
            nombre:        "Techo".to_string(),
            codigo:        "TECHO".to_string(),
            ancho_nominal: horiz_ancho_base,
            alto_nominal:  horiz_prof,
            ancho_corte:   horiz_ancho_base,
            alto_corte:    horiz_prof,
            espesor:       et,
            regaton_alto:  0.0,
            ..Default::default()
        });
    }
    // ── PISO o FAJA INFERIOR ──────────────────────────────────
    let piso_ancho_base = {
        let piso_pasante = e.costado_izq_pasante_piso && e.costado_der_pasante_piso;
        if piso_pasante { a - et_ef * 2.0 } else { a }
    };

    if params.tiene_faja_inf {
        let faja_alto = params.alto_faja_inf.max(1.0);
        let doble = ef < 18.0;

        piezas.push(PiezaCalculada {
            tipo:          "faja".to_string(),
            nombre:        "Faja Inferior Frente".to_string(),
            codigo:        "FAJA-INF-F".to_string(),
            ancho_nominal: piso_ancho_base,
            alto_nominal:  faja_alto,
            ancho_corte:   piso_ancho_base,
            alto_corte:    faja_alto,
            espesor:       et,
            regaton_alto:  0.0,
            ..Default::default()
        });

        if doble {
            piezas.push(PiezaCalculada {
                tipo:          "faja".to_string(),
                nombre:        "Faja Inferior Trasera".to_string(),
                codigo:        "FAJA-INF-T".to_string(),
                ancho_nominal: piso_ancho_base,
                alto_nominal:  faja_alto,
                ancho_corte:   piso_ancho_base,
                alto_corte:    faja_alto,
                espesor:       et,
                regaton_alto:  0.0,
                ..Default::default()
            });
        }
    } else if params.tiene_piso {
        piezas.push(PiezaCalculada {
            tipo:          "horizontal".to_string(),
            nombre:        "Piso".to_string(),
            codigo:        "PISO".to_string(),
            ancho_nominal: piso_ancho_base,
            alto_nominal:  horiz_prof,
            ancho_corte:   piso_ancho_base,
            alto_corte:    horiz_prof,
            espesor:       et,
            regaton_alto:  0.0,
            ..Default::default()
        });
    }
    
    // ── FONDO ─────────────────────────────────────────────────
    if params.tiene_fondo {
        let ranura      = 8.0;
        let fondo_ancho = if fondo_pasante || ef > 3.0 { a  - et_ef * 2.0 } else { a  - et_ef * 2.0 + ranura * 2.0 };
        let fondo_alto  = if fondo_pasante || ef > 3.0 { al - et_ef * 2.0 } else { al - et_ef * 2.0 + ranura * 2.0 };

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
            ..Default::default()
        });
    }

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
            ..Default::default()
        });
    }

    // ── DIVISORES ─────────────────────────────────────────────
    if params.divisores.as_ref().map_or(false, |d| !d.is_empty()) {
        let extra = calcular_piezas_divisores(params, &mut piezas);
        piezas.extend(extra);
    }

    piezas
}

// ── AJUSTE DE CORTE POR CANTOS ────────────────────────────────
pub fn aplicar_cantos(
    pieza:         &PiezaCalculada,
    frente_esp:    f64,
    posterior_esp: f64,
    superior_esp:  f64,
    inferior_esp:  f64,
    regaton_alto:  f64,
) -> (f64, f64) {
    let ancho_corte = pieza.ancho_nominal - frente_esp - posterior_esp;
    let alto_corte  = pieza.alto_nominal  - superior_esp - inferior_esp - regaton_alto;
    (ancho_corte, alto_corte)
}

// ── MOTOR DE DIVISORES ────────────────────────────────────────

fn posicion_y_referencia(nombre: &str, posiciones_estantes: &[f64], alto_interno: f64) -> f64 {
    match nombre {
        "techo" => 0.0,
        "piso"  => alto_interno,
        s if s.starts_with("estante_") => {
            let idx: usize = s
                .trim_start_matches("estante_")
                .parse()
                .unwrap_or(1);
            posiciones_estantes
                .get(idx.saturating_sub(1))
                .copied()
                .unwrap_or(alto_interno)
        }
        _ => 0.0,
    }
}

fn calcular_posiciones_estantes(cant_estantes: i64, alto_interno: f64) -> Vec<f64> {
    if cant_estantes <= 0 {
        return vec![];
    }
    let sep = alto_interno / (cant_estantes + 1) as f64;
    (1..=cant_estantes).map(|i| sep * i as f64).collect()
}

pub fn calcular_piezas_divisores(
    params:             &MotorParams,
    piezas_existentes:  &mut Vec<PiezaCalculada>,
) -> Vec<PiezaCalculada> {
    let divisores = match &params.divisores {
        Some(d) if !d.is_empty() => d,
        _ => return vec![],
    };

    let a   = params.ancho;
    let al  = params.alto;
    let p   = params.profundidad;
    let et  = params.espesor_tablero;
    let ef  = params.espesor_fondo;
    let e   = &params.ensamble;

    let fondo_pasante = e.fondo_tipo == FondoTipo::Pasante;
    let fr            = e.fondo_retranqueo;

    let ancho_interno  = a - et * 2.0;
    let alto_interno   = al - et * 2.0;
    let est_alto_corte = if fondo_pasante { p - ef } else { p - ef - fr };

    let posiciones_est = calcular_posiciones_estantes(params.cant_estantes, alto_interno);

    let mut nuevas: Vec<PiezaCalculada> = Vec::new();

    for (i, div) in divisores.iter().enumerate() {
        let letra = (b'A' + i as u8) as char;

        if div.posicion_x <= et || div.posicion_x >= ancho_interno - et {
            continue;
        }

        let y_desde = posicion_y_referencia(&div.desde, &posiciones_est, alto_interno);
        let y_hasta = posicion_y_referencia(&div.hasta, &posiciones_est, alto_interno);

        if y_desde >= y_hasta {
            continue;
        }

        let alto_div = y_hasta - y_desde;
        let descuento_superior = if div.desde != "techo" { et } else { 0.0 };
        let descuento_inferior = if div.hasta != "piso"  { et } else { 0.0 };
        let alto_div_real = alto_div - descuento_superior - descuento_inferior;

        nuevas.push(PiezaCalculada {
            tipo:          "divisor".to_string(),
            nombre:        format!("Divisor {}", letra),
            codigo:        format!("DIV-{}", letra),
            ancho_nominal: est_alto_corte,
            alto_nominal:  alto_div_real,
            ancho_corte:   est_alto_corte,
            alto_corte:    alto_div_real,
            espesor:       et,
            regaton_alto:  0.0,
            ..Default::default()
        });

        let mut codigos_a_eliminar: Vec<String> = Vec::new();

        for (j, &pos_y) in posiciones_est.iter().enumerate() {
            if pos_y > y_desde && pos_y < y_hasta {
                let num = j + 1;
                let ancho_izq = div.posicion_x - et;
                let ancho_der = ancho_interno - div.posicion_x - et;

                nuevas.push(PiezaCalculada {
                    tipo:          "shelf".to_string(),
                    nombre:        format!("Estante {} Izq", num),
                    codigo:        format!("EST-{}A", num),
                    ancho_nominal: ancho_izq,
                    alto_nominal:  est_alto_corte,
                    ancho_corte:   ancho_izq,
                    alto_corte:    est_alto_corte,
                    espesor:       et,
                    regaton_alto:  0.0,
                    ..Default::default()
                });

                nuevas.push(PiezaCalculada {
                    tipo:          "shelf".to_string(),
                    nombre:        format!("Estante {} Der", num),
                    codigo:        format!("EST-{}B", num),
                    ancho_nominal: ancho_der,
                    alto_nominal:  est_alto_corte,
                    ancho_corte:   ancho_der,
                    alto_corte:    est_alto_corte,
                    espesor:       et,
                    regaton_alto:  0.0,
                    ..Default::default()
                });

                codigos_a_eliminar.push(format!("EST-{}", num));
            }
        }

        piezas_existentes.retain(|p| !codigos_a_eliminar.contains(&p.codigo));
    }

    nuevas
}

// ── TESTS ─────────────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{EnsambleConfig, FondoTipo, MotorParams};

    fn ensamble_default() -> EnsambleConfig {
        EnsambleConfig {
            modulo_id:                 "test".to_string(),
            costado_izq_pasante_techo: true,
            costado_der_pasante_techo: true,
            costado_izq_pasante_piso:  true,
            costado_der_pasante_piso:  true,
            fondo_tipo:                FondoTipo::Interno,
            fondo_retranqueo:          12.0,
        }
    }

    fn params_default() -> MotorParams {
        MotorParams {
            ancho:             600.0,
            alto:              720.0,
            profundidad:       550.0,
            espesor_tablero:   18.0,
            espesor_fondo:     3.0,
            offset:            0.5,
            cant_estantes:     1,
            ensamble:          ensamble_default(),
            // paneles — todos activos por defecto en tests
            tiene_techo:       true,
            tiene_piso:        true,
            tiene_costado_izq: true,
            tiene_costado_der: true,
            tiene_fondo:       true,
            tiene_faja_sup:    false,
            tiene_faja_inf:    false,
            alto_faja_sup:     80.0,
            alto_faja_inf:     80.0,
            // legacy
            tiene_fajas:       false,
            posicion_faja:     "superior".to_string(),
            alto_faja:         80.0,
            faja_acostada:     false,
            material_fondo_id: None,
            divisores:         None,
        }
    }

    #[test]
    fn test_cantidad_piezas() {
        let piezas = calcular_piezas(&params_default());
        // 2 laterales + techo + piso + fondo + 1 estante = 6
        assert_eq!(piezas.len(), 6);
    }

    #[test]
    fn test_fondo_interno_ranura() {
        let piezas = calcular_piezas(&params_default());
        let fondo = piezas.iter().find(|p| p.codigo == "FONDO").unwrap();
        let esperado_ancho = 600.0 - (18.0 + 0.5) * 2.0 + 16.0;
        let esperado_alto  = 720.0 - (18.0 + 0.5) * 2.0 + 16.0;
        assert_eq!(fondo.ancho_nominal, esperado_ancho);
        assert_eq!(fondo.alto_nominal,  esperado_alto);
    }

    #[test]
    fn test_fondo_interno_grueso() {
        let mut params = params_default();
        params.espesor_fondo = 18.0;
        let piezas = calcular_piezas(&params);
        let fondo = piezas.iter().find(|p| p.codigo == "FONDO").unwrap();
        let esperado_ancho = 600.0 - (18.0 + 0.5) * 2.0;
        let esperado_alto  = 720.0 - (18.0 + 0.5) * 2.0;
        assert_eq!(fondo.ancho_nominal, esperado_ancho);
        assert_eq!(fondo.alto_nominal,  esperado_alto);
    }

    #[test]
    fn test_techo_pasante() {
        let piezas = calcular_piezas(&params_default());
        let techo = piezas.iter().find(|p| p.codigo == "TECHO").unwrap();
        let esperado = 600.0 - (18.0 + 0.5) * 2.0;
        assert_eq!(techo.ancho_nominal, esperado);
    }

    #[test]
    fn test_aplicar_cantos() {
        let pieza = PiezaCalculada {
            tipo:          "side".to_string(),
            nombre:        "test".to_string(),
            codigo:        "T".to_string(),
            ancho_nominal: 450.0,
            alto_nominal:  720.0,
            ancho_corte:   450.0,
            alto_corte:    720.0,
            espesor:       18.0,
            regaton_alto:  0.0,
            ..Default::default()
        };
        let (ac, alc) = aplicar_cantos(&pieza, 2.0, 2.0, 0.0, 0.0, 25.0);
        assert_eq!(ac,  446.0);
        assert_eq!(alc, 695.0);
    }

    #[test]
    fn test_techo_asimetrico() {
        let mut e = ensamble_default();
        e.costado_der_pasante_techo = false;
        let params = MotorParams { ensamble: e, ..params_default() };
        let piezas = calcular_piezas(&params);
        let techo = piezas.iter().find(|p| p.codigo == "TECHO").unwrap();
        assert_eq!(techo.ancho_nominal, 600.0);
    }

   #[test]
    fn test_sin_techo_genera_faja_sup() {
        let mut params = params_default();
        params.tiene_techo    = false;
        params.tiene_faja_sup = true;
        params.alto_faja_sup  = 80.0;
        let piezas = calcular_piezas(&params);
        assert!(!piezas.iter().any(|p| p.codigo == "TECHO"));
        let faja = piezas.iter().find(|p| p.codigo == "FAJA-SUP-F").unwrap();
        assert_eq!(faja.alto_nominal, 80.0);
    }

    #[test]
    fn test_sin_techo_sin_faja_no_genera_horizontal_sup() {
        let mut params = params_default();
        params.tiene_techo    = false;
        params.tiene_faja_sup = false;
        let piezas = calcular_piezas(&params);
        assert!(!piezas.iter().any(|p| p.codigo == "TECHO"));
        assert!(!piezas.iter().any(|p| p.codigo == "FAJA-SUP"));
    }

    #[test]
    fn test_sin_costado_izq() {
        let mut params = params_default();
        params.tiene_costado_izq = false;
        let piezas = calcular_piezas(&params);
        assert!(!piezas.iter().any(|p| p.codigo == "LAT-IZQ"));
        assert!( piezas.iter().any(|p| p.codigo == "LAT-DER"));
    }
}

#[cfg(test)]
mod tests_divisores {
    use super::*;
    use crate::types::{DivisorParams, EnsambleConfig, FondoTipo, MotorParams};

    fn params_con_divisor() -> MotorParams {
        MotorParams {
            ancho:             600.0,
            alto:              720.0,
            profundidad:       550.0,
            espesor_tablero:   18.0,
            espesor_fondo:     3.0,
            offset:            0.5,
            cant_estantes:     2,
            ensamble: EnsambleConfig {
                modulo_id:                 "test".to_string(),
                costado_izq_pasante_techo: true,
                costado_der_pasante_techo: true,
                costado_izq_pasante_piso:  true,
                costado_der_pasante_piso:  true,
                fondo_tipo:                FondoTipo::Interno,
                fondo_retranqueo:          12.0,
            },
            tiene_techo:       true,
            tiene_piso:        true,
            tiene_costado_izq: true,
            tiene_costado_der: true,
            tiene_fondo:       true,
            tiene_faja_sup:    false,
            tiene_faja_inf:    false,
            alto_faja_sup:     80.0,
            alto_faja_inf:     80.0,
            tiene_fajas:       false,
            posicion_faja:     "superior".to_string(),
            alto_faja:         80.0,
            faja_acostada:     false,
            material_fondo_id: None,
            divisores: Some(vec![
                DivisorParams {
                    posicion_x: 264.0,
                    desde:      "techo".to_string(),
                    hasta:      "piso".to_string(),
                }
            ]),
        }
    }

    #[test]
    fn test_divisor_genera_pieza() {
        let piezas = calcular_piezas(&params_con_divisor());
        assert!(piezas.iter().any(|p| p.codigo == "DIV-A"));
    }

    #[test]
    fn test_estantes_partidos() {
        let piezas = calcular_piezas(&params_con_divisor());
        assert!(piezas.iter().any(|p| p.codigo == "EST-1A"));
        assert!(piezas.iter().any(|p| p.codigo == "EST-1B"));
        assert!(piezas.iter().any(|p| p.codigo == "EST-2A"));
        assert!(piezas.iter().any(|p| p.codigo == "EST-2B"));
        assert!(!piezas.iter().any(|p| p.codigo == "EST-1"));
        assert!(!piezas.iter().any(|p| p.codigo == "EST-2"));
    }

    #[test]
    fn test_ancho_mitades_correcto() {
        let piezas = calcular_piezas(&params_con_divisor());
        let izq = piezas.iter().find(|p| p.codigo == "EST-1A").unwrap();
        let der = piezas.iter().find(|p| p.codigo == "EST-1B").unwrap();
        assert_eq!(izq.ancho_nominal, 246.0);
        assert_eq!(der.ancho_nominal, 282.0);
        assert_eq!(izq.ancho_nominal + der.ancho_nominal + 18.0, 564.0);
    }
}