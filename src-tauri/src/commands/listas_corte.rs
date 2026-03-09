// ============================================================
// MOBILI-AR — Comandos Tauri: Listas de Corte
// Archivo  : src-tauri/src/commands/listas_corte.rs
// Módulo   : B4-02
// ============================================================

use tauri::State;
use crate::db::DbState;
use crate::types::{CrearListaCorteInput, ListaCorte, ModuloParaLista, ListaCorteModulo};

/// Retorna todos los módulos del trabajo enriquecidos con estado de lista.
#[tauri::command]
pub fn get_modulos_para_lista(
    state:      State<'_, DbState>,
    trabajo_id: String,
) -> Result<Vec<ModuloParaLista>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::listas_corte::get_modulos_para_lista(conn, &trabajo_id)
        .map_err(|e| e.to_string())
}

/// Retorna todas las listas de corte de un trabajo.
#[tauri::command]
pub fn get_listas_corte(
    state:      State<'_, DbState>,
    trabajo_id: String,
) -> Result<Vec<ListaCorte>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::listas_corte::get_listas_trabajo(conn, &trabajo_id)
        .map_err(|e| e.to_string())
}

/// Retorna los módulos de una lista específica.
#[tauri::command]
pub fn get_modulos_lista(
    state:    State<'_, DbState>,
    lista_id: String,
) -> Result<Vec<ListaCorteModulo>, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::listas_corte::get_modulos_lista(conn, &lista_id)
        .map_err(|e| e.to_string())
}

/// Anula una lista liberando sus módulos.
#[tauri::command]
pub fn anular_lista_corte(
    state:    State<'_, DbState>,
    lista_id: String,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;
    crate::db::listas_corte::anular_lista(conn, &lista_id)
        .map_err(|e| e.to_string())
}

/// Crea la lista, genera PDF + CSVs con todos los módulos en un solo JSON.
/// Si falla la generación hace rollback de la lista.
#[tauri::command]
pub fn crear_y_generar_lista_corte(
    state: State<'_, DbState>,
    input: CrearListaCorteInput,
) -> Result<ListaCorte, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;

    // Validar que todos los módulos tienen piezas
    for modulo_id in &input.modulo_ids {
        let count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM piezas WHERE modulo_id = ?1",
            rusqlite::params![modulo_id],
            |row| row.get(0),
        ).unwrap_or(0);
        if count == 0 {
            return Err(format!("El módulo {} no tiene piezas confirmadas.", modulo_id));
        }
    }

    // Crear lista en DB (transaccional)
    let lista = crate::db::listas_corte::crear_lista(
        conn,
        &input.trabajo_id,
        &input.nombre,
        &input.modulo_ids,
    ).map_err(|e| format!("Error creando lista: {}", e))?;

    // Generar archivos — si falla, rollback
    let gen_resultado = generar_archivos(conn, &lista, &input);

    match gen_resultado {
        Ok((pdf_final, dir_final)) => {
            crate::db::listas_corte::actualizar_output(
                conn, &lista.id, &pdf_final, &dir_final,
            ).map_err(|e| format!("Error actualizando rutas: {}", e))?;

            // Abrir PDF con el visor del sistema
            let _ = std::process::Command::new("cmd")
                .args(["/C", "start", "", &pdf_final])
                .spawn();
            Ok(ListaCorte {
                output_pdf: Some(pdf_final),
                output_dir: Some(dir_final),
                ..lista
            })
        }
        Err(e) => {
            let _ = conn.execute(
                "DELETE FROM listas_corte WHERE id = ?1",
                rusqlite::params![lista.id],
            );
            Err(e)
        }
    }
}

// ── Genera PDF y CSVs con un solo JSON con todos los módulos ──
fn generar_archivos(
    conn:  &rusqlite::Connection,
    lista: &ListaCorte,
    input: &CrearListaCorteInput,
) -> Result<(String, String), String> {
    let scripts_dir = crate::commands::lista_corte::resolver_scripts_dir();

    let datos = armar_json_completo(conn, lista, input)
        .map_err(|e| format!("Error armando JSON: {}", e))?;

    let pdf_result = crate::commands::lista_corte::invocar_script(
        &scripts_dir, "lista_corte.py", &datos,
    ).map_err(|e| format!("Error PDF: {}", e))?;

    let pdf_final = pdf_result
        .get("path")
        .and_then(|v: &serde_json::Value| v.as_str())
        .unwrap_or("")
        .to_string();

    let csv_result = crate::commands::lista_corte::invocar_script(
        &scripts_dir, "lista_corte_operativa.py", &datos,
    ).map_err(|e| format!("Error CSVs: {}", e))?;

    let dir_final = csv_result
        .get("carpeta")
        .and_then(|v: &serde_json::Value| v.as_str())
        .unwrap_or(&input.output_dir)
        .to_string();

    Ok((pdf_final, dir_final))
}

// ── Arma un JSON con TODOS los módulos seleccionados ──────────
fn armar_json_completo(
    conn:  &rusqlite::Connection,
    lista: &ListaCorte,
    input: &CrearListaCorteInput,
) -> Result<serde_json::Value, rusqlite::Error> {
    use serde_json::json;

    // Datos del trabajo
    let (trab_nombre, trab_cliente): (String, Option<String>) = conn.query_row(
        "SELECT nombre, cliente FROM trabajos WHERE id = ?1",
        rusqlite::params![input.trabajo_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )?;

    let empresa    = crate::commands::lista_corte::leer_empresa(conn);
    let cantos     = crate::commands::lista_corte::leer_cantos(conn);
    let materiales = crate::commands::lista_corte::leer_materiales(conn);

    // Buscar todos los módulos seleccionados con su composición
    let mut stmt = conn.prepare(
        "SELECT m.id, m.nombre, m.disposicion, m.ancho, m.alto, m.profundidad,
                m.espesor_tablero, m.espesor_fondo, m.material_id,
                c.nombre as comp_nombre
         FROM modulos m
         JOIN composiciones c ON c.id = m.composicion_id
         ORDER BY c.creado_en ASC, m.creado_en ASC",
    )?;

    let todos: Vec<(String, String, String, f64, f64, f64, f64, f64, Option<String>, String)> =
        stmt.query_map(rusqlite::params![], |row| Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, f64>(3)?,
            row.get::<_, f64>(4)?,
            row.get::<_, f64>(5)?,
            row.get::<_, f64>(6)?,
            row.get::<_, f64>(7)?,
            row.get::<_, Option<String>>(8)?,
            row.get::<_, String>(9)?,
        )))?
        .filter_map(|r| r.ok())
        .collect();

    let modulos: Vec<serde_json::Value> = todos
        .into_iter()
        .filter(|(mid, ..)| input.modulo_ids.contains(mid))
        .map(|(mid, nombre, disp, ancho, alto, prof, et, ef, mat_id, comp_nombre)| {
            let piezas = crate::commands::lista_corte::leer_piezas_modulo(conn, &mid);

            let disp_nombre = match disp.as_str() {
                "bm" => "Bajomesa",
                "al" => "Aéreo",
                "to" => "Torre",
                "ca" => "Cajón",
                "ab" => "Abierto",
                "me" => "Mesa",
                "es" => "Estante",
                "co" => "Columna",
                _    => &disp,
            }.to_string();

            json!({
                "id":                 mid,
                "nombre":             nombre,
                "disposicion":        disp,
                "disposicion_nombre": disp_nombre,
                "composicion_nombre": comp_nombre,
                "ancho":              ancho,
                "alto":               alto,
                "profundidad":        prof,
                "espesor_tablero":    et,
                "espesor_fondo":      ef,
                "material_id":        mat_id,
                "piezas":             piezas,
            })
        })
        .collect();

    let pdf_name   = format!("lista_corte_{:04}.pdf", lista.numero_ot);
    let output_dir = input.output_dir.trim_end_matches(['/', '\\']).to_string();
    let pdf_path   = format!("{}/{}", output_dir, pdf_name);

    Ok(json!({
        "output_path": pdf_path,
        "output_dir":  output_dir,
        "empresa":     empresa,
        "trabajo": {
            "id":        input.trabajo_id,
            "nombre":    trab_nombre,
            "cliente":   trab_cliente,
            "numero_ot": lista.numero_ot,
        },
        "composicion": {
            "id":     "",
            "nombre": lista.nombre,
        },
        "material_principal": "",
        "modulos":    modulos,
        "cantos":     cantos,
        "materiales": materiales,
    }))
}
#[tauri::command]
pub fn reimprimir_lista_corte(
    state:      State<'_, DbState>,
    lista_id:   String,
    modulo_ids: Vec<String>,
    output_dir: String,
) -> Result<(), String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;

    let lista: ListaCorte = conn.query_row(
        "SELECT id, trabajo_id, numero_ot, nombre, output_pdf, output_dir, creado_en
         FROM listas_corte WHERE id = ?1",
        rusqlite::params![lista_id],
        |row| Ok(ListaCorte {
            id:         row.get(0)?,
            trabajo_id: row.get(1)?,
            numero_ot:  row.get(2)?,
            nombre:     row.get(3)?,
            output_pdf: row.get(4)?,
            output_dir: row.get(5)?,
            creado_en:  row.get(6)?,
        }),
    ).map_err(|e| e.to_string())?;

    let input = crate::types::CrearListaCorteInput {
        trabajo_id: lista.trabajo_id.clone(),
        nombre:     lista.nombre.clone(),
        modulo_ids,
        output_dir,
    };

    let (pdf_final, dir_final) = generar_archivos(conn, &lista, &input)?;

    crate::db::listas_corte::actualizar_output(conn, &lista_id, &pdf_final, &dir_final)
        .map_err(|e| e.to_string())?;

    // Abrir PDF con el visor del sistema
    let _ = std::process::Command::new("cmd")
        .args(["/C", "start", "", &pdf_final])
        .spawn();

    Ok(())
}