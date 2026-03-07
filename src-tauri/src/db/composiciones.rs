// ============================================================
// MOBILI-AR -- Queries SQLite: Composiciones y Modulos
// Archivo  : src-tauri/src/db/composiciones.rs
// Modulo   : F1-04 / F3-02
// ============================================================

use crate::types::{
    ActualizarModuloInput, Composicion, CrearComposicionInput, CrearModuloInput,
    LibreriaModulo, Modulo,
};
use rusqlite::{Connection, params};
use uuid::Uuid;

// -- COMPOSICIONES --------------------------------------------

pub fn get_composiciones(
    conn: &Connection,
    trabajo_id: &str,
) -> anyhow::Result<Vec<Composicion>> {
    let mut stmt = conn.prepare(
        "SELECT id, trabajo_id, nombre, descripcion, orden, creado_en
         FROM composiciones
         WHERE trabajo_id = ?1
         ORDER BY orden ASC",
    )?;

    let items = stmt
        .query_map(params![trabajo_id], |row| {
            Ok(Composicion {
                id:          row.get(0)?,
                trabajo_id:  row.get(1)?,
                nombre:      row.get(2)?,
                descripcion: row.get(3)?,
                orden:       row.get(4)?,
                creado_en:   row.get(5)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}

pub fn crear_composicion(
    conn: &Connection,
    datos: CrearComposicionInput,
) -> anyhow::Result<Composicion> {
    let id = Uuid::new_v4().to_string();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let orden: i64 = conn.query_row(
        "SELECT COALESCE(MAX(orden), -1) + 1 FROM composiciones WHERE trabajo_id = ?1",
        params![datos.trabajo_id],
        |row| row.get(0),
    )?;

    conn.execute(
        "INSERT INTO composiciones (id, trabajo_id, nombre, descripcion, orden, creado_en)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, datos.trabajo_id, datos.nombre, datos.descripcion, orden, ahora],
    )?;

    Ok(Composicion {
        id,
        trabajo_id:  datos.trabajo_id,
        nombre:      datos.nombre,
        descripcion: datos.descripcion,
        orden,
        creado_en:   ahora,
    })
}

// -- MODULOS --------------------------------------------------
pub fn get_modulos(conn: &Connection, composicion_id: &str) -> anyhow::Result<Vec<Modulo>> {
    let mut stmt = conn.prepare(
        "SELECT id, composicion_id, nombre, codigo, disposicion,
                ancho, alto, profundidad, espesor_tablero, espesor_fondo,
                tipo_union, cant_estantes, cant_puertas, overlap_puertas,
                offset_tirador, apertura_puerta, estado, creado_en,
                material_id, color_material, color_puerta, canto_general_id,
                COALESCE(tiene_fondo, 1),
                COALESCE(alto_faja, 80.0),
                material_fondo_id,
                COALESCE(faja_acostada, 0),
                COALESCE(tiene_techo, 1),
                COALESCE(tiene_piso, 1),
                COALESCE(tiene_costado_izq, 1),
                COALESCE(tiene_costado_der, 1),
                COALESCE(tiene_faja_sup, 0),
                COALESCE(tiene_faja_inf, 0),
                COALESCE(alto_faja_sup, 80.0),
                COALESCE(alto_faja_inf, 80.0)
         FROM modulos
         WHERE composicion_id = ?1
         ORDER BY creado_en ASC",
    )?;

    let items = stmt
        .query_map(params![composicion_id], |row| {
            Ok(Modulo {
                id:               row.get(0)?,
                composicion_id:   row.get(1)?,
                nombre:           row.get(2)?,
                codigo:           row.get(3)?,
                disposicion:      row.get(4)?,
                ancho:            row.get(5)?,
                alto:             row.get(6)?,
                profundidad:      row.get(7)?,
                espesor_tablero:  row.get(8)?,
                espesor_fondo:    row.get(9)?,
                tipo_union:       row.get(10)?,
                cant_estantes:    row.get(11)?,
                cant_puertas:     row.get(12)?,
                overlap_puertas:  row.get(13)?,
                offset_tirador:   row.get(14)?,
                apertura_puerta:  row.get(15)?,
                estado:           row.get(16)?,
                creado_en:        row.get(17)?,
                material_id:      row.get(18)?,
                color_material:   row.get(19)?,
                color_puerta:     row.get(20)?,
                canto_general_id: row.get(21)?,
                tiene_fondo:      row.get::<_, i64>(22)? != 0,
                alto_faja:        row.get(23)?,
                material_fondo_id: row.get(24)?,
                faja_acostada:    row.get::<_, i64>(25)? != 0,
                tiene_techo:      row.get::<_, i64>(26)? != 0,
                tiene_piso:       row.get::<_, i64>(27)? != 0,
                tiene_costado_izq: row.get::<_, i64>(28)? != 0,
                tiene_costado_der: row.get::<_, i64>(29)? != 0,
                tiene_faja_sup:   row.get::<_, i64>(30)? != 0,
                tiene_faja_inf:   row.get::<_, i64>(31)? != 0,
                alto_faja_sup:    row.get(32)?,
                alto_faja_inf:    row.get(33)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}

pub fn crear_modulo(conn: &Connection, datos: CrearModuloInput) -> anyhow::Result<Modulo> {
    let id = Uuid::new_v4().to_string();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let espesor_tablero = datos.espesor_tablero.unwrap_or(18.0);
    let espesor_fondo   = datos.espesor_fondo.unwrap_or(3.0);
    let tipo_union      = datos.tipo_union.unwrap_or_else(|| "cam_locks".to_string());
    let cant_estantes   = datos.cant_estantes.unwrap_or(0);
    let cant_puertas    = datos.cant_puertas.unwrap_or(0);
    let overlap_puertas = datos.overlap_puertas.unwrap_or(2.0);
    let offset_tirador  = datos.offset_tirador.unwrap_or(0.0);
    let apertura_puerta = datos.apertura_puerta.unwrap_or_else(|| "derecha".to_string());
    let tiene_fondo     = datos.tiene_fondo.unwrap_or(true);
    let alto_faja       = datos.alto_faja.unwrap_or(80.0);
    let faja_acostada   = datos.faja_acostada.unwrap_or(false);
    // Al inicio de crear_modulo, después de los unwrap_or existentes:
    let tiene_techo       = datos.tiene_techo.unwrap_or(true);
    let tiene_piso        = datos.tiene_piso.unwrap_or(true);
    let tiene_costado_izq = datos.tiene_costado_izq.unwrap_or(true);
    let tiene_costado_der = datos.tiene_costado_der.unwrap_or(true);
    let tiene_faja_sup    = datos.tiene_faja_sup.unwrap_or(false);
    let tiene_faja_inf    = datos.tiene_faja_inf.unwrap_or(false);
    let alto_faja_sup     = datos.alto_faja_sup.unwrap_or(80.0);
    let alto_faja_inf     = datos.alto_faja_inf.unwrap_or(80.0);

    conn.execute(
    "INSERT INTO modulos (
        id, composicion_id, nombre, disposicion,
        ancho, alto, profundidad, espesor_tablero, espesor_fondo,
        tipo_union, cant_estantes, cant_puertas, overlap_puertas,
        offset_tirador, apertura_puerta,
        material_id, color_material, color_puerta, canto_general_id,
        tiene_fondo, alto_faja, material_fondo_id, faja_acostada,
        tiene_techo, tiene_piso, tiene_costado_izq, tiene_costado_der,
        tiene_faja_sup, tiene_faja_inf, alto_faja_sup, alto_faja_inf,
        estado, creado_en
     ) VALUES (
        ?1,  ?2,  ?3,  ?4,
        ?5,  ?6,  ?7,  ?8,  ?9,
        ?10, ?11, ?12, ?13,
        ?14, ?15,
        ?16, ?17, ?18, ?19,
        ?20, ?21, ?22, ?23,
        ?24, ?25, ?26, ?27,
        ?28, ?29, ?30, ?31,
        'borrador', ?32
     )",
    params![
        id, datos.composicion_id, datos.nombre, datos.disposicion,
        datos.ancho, datos.alto, datos.profundidad,
        espesor_tablero, espesor_fondo,
        tipo_union, cant_estantes, cant_puertas, overlap_puertas,
        offset_tirador, apertura_puerta,
        datos.material_id, datos.color_material, datos.color_puerta, datos.canto_general_id,
        tiene_fondo as i64, alto_faja, datos.material_fondo_id, faja_acostada as i64,
        tiene_techo as i64, tiene_piso as i64,
        tiene_costado_izq as i64, tiene_costado_der as i64,
        tiene_faja_sup as i64, tiene_faja_inf as i64,
        alto_faja_sup, alto_faja_inf,
        ahora
    ],
    )?;

    Ok(Modulo {
        id,
        composicion_id:   datos.composicion_id,
        nombre:           datos.nombre,
        codigo:           None,
        disposicion:      datos.disposicion,
        ancho:            datos.ancho,
        alto:             datos.alto,
        profundidad:      datos.profundidad,
        espesor_tablero,
        espesor_fondo,
        tipo_union,
        cant_estantes,
        cant_puertas,
        overlap_puertas,
        offset_tirador,
        apertura_puerta:  Some(apertura_puerta),
        material_id:      datos.material_id,
        color_material:   datos.color_material,
        color_puerta:     datos.color_puerta,
        canto_general_id: datos.canto_general_id,
        tiene_fondo,
        alto_faja,
        material_fondo_id: datos.material_fondo_id,
        faja_acostada,
        estado:           "borrador".to_string(),
        creado_en:        ahora,
        tiene_techo,
        tiene_piso,
        tiene_costado_izq,
        tiene_costado_der,
        tiene_faja_sup,
        tiene_faja_inf,
        alto_faja_sup,
        alto_faja_inf,
    })
}

pub fn eliminar_modulo(conn: &Connection, id: &str) -> anyhow::Result<()> {
    conn.execute("DELETE FROM modulos WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn actualizar_modulo(
    conn: &Connection,
    id: &str,
    d: ActualizarModuloInput,
) -> anyhow::Result<()> {
    conn.execute(
    "UPDATE modulos SET
        nombre = ?1, disposicion = ?2,
        ancho = ?3, alto = ?4, profundidad = ?5,
        espesor_tablero = ?6, espesor_fondo = ?7,
        tipo_union = ?8, cant_estantes = ?9, cant_puertas = ?10,
        overlap_puertas = ?11, offset_tirador = ?12,
        apertura_puerta = ?13, material_id = ?14,
        color_material = ?15, color_puerta = ?16, canto_general_id = ?17,
        tiene_fondo = ?18, alto_faja = ?19,
        material_fondo_id = ?20, faja_acostada = ?21,
        tiene_techo = ?22, tiene_piso = ?23,
        tiene_costado_izq = ?24, tiene_costado_der = ?25,
        tiene_faja_sup = ?26, tiene_faja_inf = ?27,
        alto_faja_sup = ?28, alto_faja_inf = ?29
     WHERE id = ?30",
    params![
        d.nombre, d.disposicion,
        d.ancho, d.alto, d.profundidad,
        d.espesor_tablero, d.espesor_fondo,
        d.tipo_union, d.cant_estantes, d.cant_puertas,
        d.overlap_puertas, d.offset_tirador,
        d.apertura_puerta, d.material_id,
        d.color_material, d.color_puerta, d.canto_general_id,
        d.tiene_fondo as i64, d.alto_faja,
        d.material_fondo_id, d.faja_acostada as i64,
        d.tiene_techo as i64, d.tiene_piso as i64,
        d.tiene_costado_izq as i64, d.tiene_costado_der as i64,
        d.tiene_faja_sup as i64, d.tiene_faja_inf as i64,
        d.alto_faja_sup, d.alto_faja_inf,
        id
    ],
    )?;
    Ok(())
}

// -- LIBRERIA -------------------------------------------------

pub fn get_libreria(conn: &Connection) -> anyhow::Result<Vec<LibreriaModulo>> {
    let mut stmt = conn.prepare(
        "SELECT id, codigo, disposicion, nombre, descripcion, config_json
         FROM libreria_modulos
         WHERE activo = 1
         ORDER BY disposicion ASC, nombre ASC",
    )?;

    let items = stmt
        .query_map([], |row| {
            Ok(LibreriaModulo {
                id:          row.get(0)?,
                codigo:      row.get(1)?,
                disposicion: row.get(2)?,
                nombre:      row.get(3)?,
                descripcion: row.get(4)?,
                config_json: row.get(5)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}
pub fn get_disposicion(
    conn: &Connection,
    id: &str,
) -> anyhow::Result<crate::types::Disposicion> {

    let disposicion = conn.query_row(
        "SELECT id, nombre,
                COALESCE(tiene_techo, 1), COALESCE(tiene_piso, 1),
                COALESCE(tiene_costado_izq, 1), COALESCE(tiene_costado_der, 1),
                COALESCE(tiene_fondo, 1),
                COALESCE(tiene_faja_sup, 0), COALESCE(tiene_faja_inf, 0),
                COALESCE(alto_faja_sup, 80.0), COALESCE(alto_faja_inf, 80.0),
                COALESCE(costado_izq_pasante_techo, 1),
                COALESCE(costado_der_pasante_techo, 1),
                COALESCE(costado_izq_pasante_piso, 1),
                COALESCE(costado_der_pasante_piso, 1),
                COALESCE(fondo_tipo, 'interno'),
                COALESCE(fondo_retranqueo, 12.0),
                COALESCE(es_sistema, 0),
                COALESCE(activo, 1)
         FROM disposiciones WHERE id = ?1",
        params![id],
        |row| {
            Ok(crate::types::Disposicion {
                id:                        row.get(0)?,
                nombre:                    row.get(1)?,
                tiene_techo:               row.get::<_, i64>(2)? != 0,
                tiene_piso:                row.get::<_, i64>(3)? != 0,
                tiene_costado_izq:         row.get::<_, i64>(4)? != 0,
                tiene_costado_der:         row.get::<_, i64>(5)? != 0,
                tiene_fondo:               row.get::<_, i64>(6)? != 0,
                tiene_faja_sup:            row.get::<_, i64>(7)? != 0,
                tiene_faja_inf:            row.get::<_, i64>(8)? != 0,
                alto_faja_sup:             row.get(9)?,
                alto_faja_inf:             row.get(10)?,
                costado_izq_pasante_techo: row.get::<_, i64>(11)? != 0,
                costado_der_pasante_techo: row.get::<_, i64>(12)? != 0,
                costado_izq_pasante_piso:  row.get::<_, i64>(13)? != 0,
                costado_der_pasante_piso:  row.get::<_, i64>(14)? != 0,
                fondo_tipo:                row.get(15)?,
                fondo_retranqueo:          row.get(16)?,
                es_sistema:                row.get::<_, i64>(17)? != 0,
                activo:                    row.get::<_, i64>(18)? != 0,
            })
        },
    )?;

    Ok(disposicion)
}
pub fn get_disposiciones(conn: &Connection) -> anyhow::Result<Vec<crate::types::Disposicion>> {
    let mut stmt = conn.prepare(
        "SELECT id, nombre,
                COALESCE(tiene_techo, 1), COALESCE(tiene_piso, 1),
                COALESCE(tiene_costado_izq, 1), COALESCE(tiene_costado_der, 1),
                COALESCE(tiene_fondo, 1),
                COALESCE(tiene_faja_sup, 0), COALESCE(tiene_faja_inf, 0),
                COALESCE(alto_faja_sup, 80.0), COALESCE(alto_faja_inf, 80.0),
                COALESCE(costado_izq_pasante_techo, 1),
                COALESCE(costado_der_pasante_techo, 1),
                COALESCE(costado_izq_pasante_piso, 1),
                COALESCE(costado_der_pasante_piso, 1),
                COALESCE(fondo_tipo, 'interno'),
                COALESCE(fondo_retranqueo, 12.0),
                COALESCE(es_sistema, 0),
                COALESCE(activo, 1)
         FROM disposiciones
         WHERE activo = 1
         ORDER BY nombre ASC",
    )?;

    let items = stmt
        .query_map([], |row| {
            Ok(crate::types::Disposicion {
                id:                        row.get(0)?,
                nombre:                    row.get(1)?,
                tiene_techo:               row.get::<_, i64>(2)? != 0,
                tiene_piso:                row.get::<_, i64>(3)? != 0,
                tiene_costado_izq:         row.get::<_, i64>(4)? != 0,
                tiene_costado_der:         row.get::<_, i64>(5)? != 0,
                tiene_fondo:               row.get::<_, i64>(6)? != 0,
                tiene_faja_sup:            row.get::<_, i64>(7)? != 0,
                tiene_faja_inf:            row.get::<_, i64>(8)? != 0,
                alto_faja_sup:             row.get(9)?,
                alto_faja_inf:             row.get(10)?,
                costado_izq_pasante_techo: row.get::<_, i64>(11)? != 0,
                costado_der_pasante_techo: row.get::<_, i64>(12)? != 0,
                costado_izq_pasante_piso:  row.get::<_, i64>(13)? != 0,
                costado_der_pasante_piso:  row.get::<_, i64>(14)? != 0,
                fondo_tipo:                row.get(15)?,
                fondo_retranqueo:          row.get(16)?,
                es_sistema:                row.get::<_, i64>(17)? != 0,
                activo:                    row.get::<_, i64>(18)? != 0,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}