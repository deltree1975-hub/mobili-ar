// ============================================================
// MOBILI-AR — Queries SQLite: Composiciones y Módulos
// Archivo  : src-tauri/src/db/composiciones.rs
// Módulo   : F1-04 — Capa de comandos Tauri
// Depende  : rusqlite, types::{Composicion, Modulo}
// Expone   : get_composiciones(), crear_composicion(),
//            get_modulos(), crear_modulo(), actualizar_modulo(),
//            eliminar_modulo(), get_libreria()
// Creado   : [fecha]
// ============================================================

use crate::types::{
    Composicion, CrearComposicionInput, CrearModuloInput, LibreriaModulo, Modulo,
};
use rusqlite::{Connection, params};
use uuid::Uuid;

// ── COMPOSICIONES ─────────────────────────────────────────────

/// Retorna todas las composiciones de un trabajo, ordenadas por orden ASC.
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

    let items = stmt.query_map(params![trabajo_id], |row| {
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

/// Crea una nueva composición dentro de un trabajo.
pub fn crear_composicion(
    conn: &Connection,
    datos: CrearComposicionInput,
) -> anyhow::Result<Composicion> {
    let id = Uuid::new_v4().to_string();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    // Calcular el próximo orden
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

// ── MÓDULOS ───────────────────────────────────────────────────
/// Retorna todos los módulos de una composición.
pub fn get_modulos(conn: &Connection, composicion_id: &str) -> anyhow::Result<Vec<Modulo>> {
    let mut stmt = conn.prepare(
        "SELECT id, composicion_id, nombre, codigo, disposicion,
                ancho, alto, profundidad, espesor_tablero, espesor_fondo,
                tipo_union, costados_por_fuera, fondo_embutido, tapa_apoyada,
                cant_estantes, cant_puertas, overlap_puertas,
                inset_estantes, offset_tirador, estado, creado_en,
                material_id, color_material, tipo_canto, espesor_canto,
                canto_sup, canto_inf, canto_izq, canto_der, apertura_puerta
         FROM modulos
         WHERE composicion_id = ?1
         ORDER BY creado_en ASC",
    )?;

    let items = stmt.query_map(params![composicion_id], |row| {
        Ok(Modulo {
            id:                 row.get(0)?,
            composicion_id:     row.get(1)?,
            nombre:             row.get(2)?,
            codigo:             row.get(3)?,
            disposicion:        row.get(4)?,
            ancho:              row.get(5)?,
            alto:               row.get(6)?,
            profundidad:        row.get(7)?,
            espesor_tablero:    row.get(8)?,
            espesor_fondo:      row.get(9)?,
            tipo_union:         row.get(10)?,
            costados_por_fuera: row.get::<_, i64>(11)? != 0,
            fondo_embutido:     row.get::<_, i64>(12)? != 0,
            tapa_apoyada:       row.get::<_, i64>(13)? != 0,
            cant_estantes:      row.get(14)?,
            cant_puertas:       row.get(15)?,
            overlap_puertas:    row.get(16)?,
            inset_estantes:     row.get(17)?,
            offset_tirador:     row.get(18)?,
            estado:             row.get(19)?,
            creado_en:          row.get(20)?,
            material_id:        row.get(21)?,
            color_material:     row.get(22)?,
            tipo_canto:         row.get(23)?,
            espesor_canto:      row.get(24)?,
            canto_sup:          row.get::<_, i64>(25)? != 0,
            canto_inf:          row.get::<_, i64>(26)? != 0,
            canto_izq:          row.get::<_, i64>(27)? != 0,
            canto_der:          row.get::<_, i64>(28)? != 0,
            apertura_puerta:    row.get(29)?,
        })
    })?
    .collect::<Result<Vec<_>, _>>()?;

    Ok(items)
}

/// Crea un nuevo módulo con valores por defecto para campos opcionales.
pub fn crear_modulo(conn: &Connection, datos: CrearModuloInput) -> anyhow::Result<Modulo> {
    let id = Uuid::new_v4().to_string();
    let ahora = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    // ── VALORES POR DEFECTO ───────────────────────────────────
    let espesor_tablero  = datos.espesor_tablero.unwrap_or(18.0);
    let espesor_fondo    = datos.espesor_fondo.unwrap_or(3.0);
    let tipo_union       = datos.tipo_union.unwrap_or_else(|| "cam_locks".to_string());
    let costados_x_fuera = datos.costados_por_fuera.unwrap_or(true);
    let fondo_embutido   = datos.fondo_embutido.unwrap_or(false);
    let tapa_apoyada     = datos.tapa_apoyada.unwrap_or(true);
    let cant_estantes    = datos.cant_estantes.unwrap_or(1);
    let cant_puertas     = datos.cant_puertas.unwrap_or(1);
    let overlap_puertas  = datos.overlap_puertas.unwrap_or(2.0);
    let inset_estantes   = datos.inset_estantes.unwrap_or(5.0);
    let offset_tirador   = datos.offset_tirador.unwrap_or(35.0);
    let tipo_canto       = datos.tipo_canto.unwrap_or_else(|| "pvc".to_string());
    let espesor_canto    = datos.espesor_canto.unwrap_or(0.4);
    let canto_sup        = datos.canto_sup.unwrap_or(true);
    let canto_inf        = datos.canto_inf.unwrap_or(true);
    let canto_izq        = datos.canto_izq.unwrap_or(true);
    let canto_der        = datos.canto_der.unwrap_or(true);
    let apertura_puerta  = datos.apertura_puerta.unwrap_or_else(|| "derecha".to_string());

    // ── INSERT ────────────────────────────────────────────────
    conn.execute(
        "INSERT INTO modulos (
            id, composicion_id, nombre, disposicion,
            ancho, alto, profundidad, espesor_tablero, espesor_fondo,
            tipo_union, costados_por_fuera, fondo_embutido, tapa_apoyada,
            cant_estantes, cant_puertas, overlap_puertas,
            inset_estantes, offset_tirador,
            material_id, color_material, tipo_canto, espesor_canto,
            canto_sup, canto_inf, canto_izq, canto_der, apertura_puerta,
            estado, creado_en
         ) VALUES (
            ?1, ?2, ?3, ?4,
            ?5, ?6, ?7, ?8, ?9,
            ?10, ?11, ?12, ?13,
            ?14, ?15, ?16,
            ?17, ?18,
            ?19, ?20, ?21, ?22,
            ?23, ?24, ?25, ?26, ?27,
            'borrador', ?28
         )",
        params![
            id, datos.composicion_id, datos.nombre, datos.disposicion,
            datos.ancho, datos.alto, datos.profundidad,
            espesor_tablero, espesor_fondo,
            tipo_union,
            costados_x_fuera as i64, fondo_embutido as i64, tapa_apoyada as i64,
            cant_estantes, cant_puertas, overlap_puertas,
            inset_estantes, offset_tirador,
            datos.material_id, datos.color_material, tipo_canto, espesor_canto,
            canto_sup as i64, canto_inf as i64, canto_izq as i64, canto_der as i64,
            apertura_puerta,
            ahora
        ],
    )?;

    // ── RETORNAR MÓDULO CREADO ────────────────────────────────
    Ok(Modulo {
        id,
        composicion_id: datos.composicion_id,
        nombre:         datos.nombre,
        codigo:         None,
        disposicion:    datos.disposicion,
        ancho:          datos.ancho,
        alto:           datos.alto,
        profundidad:    datos.profundidad,
        espesor_tablero,
        espesor_fondo,
        tipo_union,
        costados_por_fuera: costados_x_fuera,
        fondo_embutido,
        tapa_apoyada,
        cant_estantes,
        cant_puertas,
        overlap_puertas,
        inset_estantes,
        offset_tirador,
        material_id:     datos.material_id,
        color_material:  datos.color_material,
        tipo_canto,
        espesor_canto,
        canto_sup,
        canto_inf,
        canto_izq,
        canto_der,
        apertura_puerta,
        estado:    "borrador".to_string(),
        creado_en: ahora,
    })
}

/// Elimina un módulo y todas sus piezas (CASCADE en el schema).
pub fn eliminar_modulo(conn: &Connection, id: &str) -> anyhow::Result<()> {
    conn.execute("DELETE FROM modulos WHERE id = ?1", params![id])?;
    Ok(())
}

// ── LIBRERÍA ──────────────────────────────────────────────────

/// Retorna todos los módulos activos de la librería.
pub fn get_libreria(conn: &Connection) -> anyhow::Result<Vec<LibreriaModulo>> {
    let mut stmt = conn.prepare(
        "SELECT id, codigo, disposicion, nombre, descripcion, config_json
         FROM libreria_modulos
         WHERE activo = 1
         ORDER BY disposicion ASC, nombre ASC",
    )?;

    let items = stmt.query_map([], |row| {
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
pub fn actualizar_modulo(
    conn: &Connection,
    id: &str,
    d: crate::types::ActualizarModuloInput,
) -> anyhow::Result<()> {
    conn.execute(
        "UPDATE modulos SET
            nombre = ?1, disposicion = ?2,
            ancho = ?3, alto = ?4, profundidad = ?5,
            espesor_tablero = ?6, espesor_fondo = ?7,
            tipo_union = ?8, costados_por_fuera = ?9,
            fondo_embutido = ?10, tapa_apoyada = ?11,
            cant_estantes = ?12, cant_puertas = ?13,
            overlap_puertas = ?14, inset_estantes = ?15,
            offset_tirador = ?16, material_id = ?17,
            color_material = ?18, tipo_canto = ?19,
            espesor_canto = ?20, canto_sup = ?21,
            canto_inf = ?22, canto_izq = ?23,
            canto_der = ?24, apertura_puerta = ?25
         WHERE id = ?26",
        params![
            d.nombre, d.disposicion,
            d.ancho, d.alto, d.profundidad,
            d.espesor_tablero, d.espesor_fondo,
            d.tipo_union, d.costados_por_fuera as i64,
            d.fondo_embutido as i64, d.tapa_apoyada as i64,
            d.cant_estantes, d.cant_puertas,
            d.overlap_puertas, d.inset_estantes,
            d.offset_tirador, d.material_id,
            d.color_material, d.tipo_canto,
            d.espesor_canto, d.canto_sup as i64,
            d.canto_inf as i64, d.canto_izq as i64,
            d.canto_der as i64, d.apertura_puerta,
            id
        ],
    )?;
    Ok(())
}