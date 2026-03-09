// ============================================================
// MOBILI-AR — Comando: generación de lista de corte
// Archivo  : src-tauri/src/commands/lista_corte.rs
// Módulo   : B4-01
// ============================================================

use serde_json::{json, Value};
use std::io::Write;
use std::process::{Command, Stdio};
use tauri::State;

use crate::db::DbState;
use crate::types::ResultadoListaCorte;

#[tauri::command]
pub fn generar_lista_corte(
    state:          State<'_, DbState>,
    composicion_id: String,
    output_dir:     String,
) -> Result<ResultadoListaCorte, String> {
    let guard = state.0.lock().map_err(|e| e.to_string())?;
    let conn  = guard.as_ref().ok_or("Base de datos no conectada")?;

    let datos = armar_json(conn, &composicion_id, &output_dir)
        .map_err(|e| format!("Error armando datos: {}", e))?;

    let scripts_dir = resolver_scripts_dir();

    let pdf_path = invocar_script(&scripts_dir, "lista_corte.py", &datos)
        .map_err(|e| format!("Error generando PDF: {}", e))?;

    let pdf_ruta = pdf_path
        .get("path")
        .and_then(|v: &Value| v.as_str())
        .unwrap_or("")
        .to_string();

    let csv_result = invocar_script(&scripts_dir, "lista_corte_operativa.py", &datos)
        .map_err(|e| format!("Error generando CSVs: {}", e))?;

    let carpeta = csv_result
        .get("carpeta")
        .and_then(|v: &Value| v.as_str())
        .unwrap_or(&output_dir)
        .to_string();

    let csvs = csv_result
        .get("archivos")
        .and_then(|v| serde_json::from_value(v.clone()).ok())
        .unwrap_or_default();

    Ok(ResultadoListaCorte { pdf: pdf_ruta, carpeta, csvs })
}

fn armar_json(
    conn:           &rusqlite::Connection,
    composicion_id: &str,
    output_dir:     &str,
) -> Result<Value, rusqlite::Error> {
    let (comp_nombre, trabajo_id): (String, String) = conn.query_row(
        "SELECT nombre, trabajo_id FROM composiciones WHERE id = ?1",
        rusqlite::params![composicion_id],
        |row| Ok((row.get(0)?, row.get(1)?)),
    )?;

    let (trab_nombre, trab_cliente, trab_numero_ot): (String, Option<String>, Option<i64>) =
        conn.query_row(
            "SELECT nombre, cliente, numero_ot FROM trabajos WHERE id = ?1",
            rusqlite::params![trabajo_id],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )?;

    let empresa            = leer_empresa(conn);
    let material_principal = leer_material_principal(conn, composicion_id);
    let modulos            = leer_modulos_con_piezas(conn, composicion_id)?;
    let cantos             = leer_cantos(conn);
    let materiales         = leer_materiales(conn);

    let nro_ot   = trab_numero_ot.unwrap_or(0);
    let pdf_name = format!("lista_corte_{:04}.pdf", nro_ot);
    let pdf_path = format!("{}/{}", output_dir.trim_end_matches(['/', '\\']), pdf_name);

    Ok(json!({
        "output_path": pdf_path,
        "output_dir":  output_dir,
        "empresa":     empresa,
        "trabajo": {
            "id":        trabajo_id,
            "nombre":    trab_nombre,
            "cliente":   trab_cliente,
            "numero_ot": nro_ot,
        },
        "composicion": {
            "id":     composicion_id,
            "nombre": comp_nombre,
        },
        "material_principal": material_principal,
        "modulos":    modulos,
        "cantos":     cantos,
        "materiales": materiales,
    }))
}

pub fn leer_empresa(conn: &rusqlite::Connection) -> Value {
    let claves = ["empresa_nombre", "empresa_telefono", "empresa_email"];
    let mut emp = serde_json::Map::new();
    for clave in &claves {
        let val: String = conn.query_row(
            "SELECT valor FROM configuracion_terminal WHERE clave = ?1",
            rusqlite::params![clave],
            |row| row.get(0),
        ).unwrap_or_default();
        let campo = clave.replace("empresa_", "");
        emp.insert(campo, json!(val));
    }
    Value::Object(emp)
}

fn leer_material_principal(
    conn:           &rusqlite::Connection,
    composicion_id: &str,
) -> String {
    conn.query_row(
        "SELECT COALESCE(ma.color || ' ' || ma.espesor || 'mm', '')
         FROM modulos mo
         LEFT JOIN materiales ma ON mo.material_id = ma.id
         WHERE mo.composicion_id = ?1
         GROUP BY mo.material_id
         ORDER BY COUNT(*) DESC
         LIMIT 1",
        rusqlite::params![composicion_id],
        |row| row.get::<_, String>(0),
    ).unwrap_or_default()
}

pub fn leer_modulos_con_piezas(
    conn:           &rusqlite::Connection,
    composicion_id: &str,
) -> Result<Value, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, nombre, disposicion, ancho, alto, profundidad,
                espesor_tablero, espesor_fondo, material_id
         FROM modulos
         WHERE composicion_id = ?1
         ORDER BY creado_en ASC",
    )?;

    let modulos: Vec<Value> = stmt.query_map(
        rusqlite::params![composicion_id],
        |row| Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, f64>(3)?,
            row.get::<_, f64>(4)?,
            row.get::<_, f64>(5)?,
            row.get::<_, f64>(6)?,
            row.get::<_, f64>(7)?,
            row.get::<_, Option<String>>(8)?,
        )),
    )?
    .filter_map(|r| r.ok())
    .map(|(mid, nombre, disp, ancho, alto, prof, et, ef, mat_id)| {
        let piezas = leer_piezas_modulo(conn, &mid);
        json!({
            "id":              mid,
            "nombre":          nombre,
            "disposicion":     disp,
            "ancho":           ancho,
            "alto":            alto,
            "profundidad":     prof,
            "espesor_tablero": et,
            "espesor_fondo":   ef,
            "material_id":     mat_id,
            "piezas":          piezas,
        })
    })
    .collect();

    Ok(Value::Array(modulos))
}

pub fn leer_piezas_modulo(conn: &rusqlite::Connection, modulo_id: &str) -> Value {
    let mut stmt = match conn.prepare(
        "SELECT tipo, nombre, codigo,
                ancho_corte, alto_corte, espesor,
                material_id,
                canto_frente_id, canto_posterior_id,
                canto_superior_id, canto_inferior_id
         FROM piezas
         WHERE modulo_id = ?1
         ORDER BY rowid",
    ) {
        Ok(s)  => s,
        Err(_) => return Value::Array(vec![]),
    };

    let piezas: Vec<Value> = stmt
        .query_map(rusqlite::params![modulo_id], |row| {
            Ok(json!({
                "tipo":               row.get::<_,String>(0).unwrap_or_default(),
                "nombre":             row.get::<_,String>(1).unwrap_or_default(),
                "codigo":             row.get::<_,String>(2).unwrap_or_default(),
                "ancho_corte":        row.get::<_,f64>(3).unwrap_or(0.0),
                "alto_corte":         row.get::<_,f64>(4).unwrap_or(0.0),
                "espesor":            row.get::<_,f64>(5).unwrap_or(0.0),
                "cantidad":           1,
                "material_id":        row.get::<_,Option<String>>(6).unwrap_or(None),
                "canto_frente_id":    row.get::<_,Option<String>>(7).unwrap_or(None),
                "canto_posterior_id": row.get::<_,Option<String>>(8).unwrap_or(None),
                "canto_superior_id":  row.get::<_,Option<String>>(9).unwrap_or(None),
                "canto_inferior_id":  row.get::<_,Option<String>>(10).unwrap_or(None),
            }))
        })
        .ok()
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

    Value::Array(piezas)
}

pub fn leer_cantos(conn: &rusqlite::Connection) -> Value {
    let mut stmt = match conn.prepare(
        "SELECT id, color, espesor, alto_canto FROM cantos WHERE activo = 1",
    ) {
        Ok(s)  => s,
        Err(_) => return Value::Array(vec![]),
    };
    let rows: Vec<Value> = stmt
        .query_map([], |row| Ok(json!({
            "id":         row.get::<_,String>(0).unwrap_or_default(),
            "color":      row.get::<_,String>(1).unwrap_or_default(),
            "espesor":    row.get::<_,f64>(2).unwrap_or(0.0),
            "alto_canto": row.get::<_,f64>(3).unwrap_or(0.0),
        })))
        .ok()
        .map(|r| r.filter_map(|x| x.ok()).collect())
        .unwrap_or_default();
    Value::Array(rows)
}

pub fn leer_materiales(conn: &rusqlite::Connection) -> Value {
    let mut stmt = match conn.prepare(
        "SELECT id, tipo, color, espesor FROM materiales WHERE activo = 1",
    ) {
        Ok(s)  => s,
        Err(_) => return Value::Array(vec![]),
    };
    let rows: Vec<Value> = stmt
        .query_map([], |row| Ok(json!({
            "id":      row.get::<_,String>(0).unwrap_or_default(),
            "tipo":    row.get::<_,String>(1).unwrap_or_default(),
            "color":   row.get::<_,String>(2).unwrap_or_default(),
            "espesor": row.get::<_,f64>(3).unwrap_or(0.0),
        })))
        .ok()
        .map(|r| r.filter_map(|x| x.ok()).collect())
        .unwrap_or_default();
    Value::Array(rows)
}

pub fn resolver_scripts_dir() -> String {
    if let Ok(exe) = std::env::current_exe() {
        let dir = exe.parent().unwrap_or(std::path::Path::new("."));
        let dev_path = dir.ancestors().find_map(|p| {
            let candidate = p.join("src-tauri").join("scripts");
            if candidate.exists() { Some(candidate) } else { None }
        });
        if let Some(p) = dev_path {
            return p.to_string_lossy().to_string();
        }
        let prod_path = dir.join("scripts");
        if prod_path.exists() {
            return prod_path.to_string_lossy().to_string();
        }
    }
    "scripts".to_string()
}

pub fn invocar_script(
    scripts_dir: &str,
    script:      &str,
    datos:       &Value,
) -> Result<Value, String> {
    let script_path = format!("{}/{}", scripts_dir, script);
    let python      = python_cmd();

    let mut child = Command::new(&python)
        .arg(&script_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("No se pudo iniciar Python ({}): {}", python, e))?;

    if let Some(mut stdin) = child.stdin.take() {
        let payload = serde_json::to_string(datos)
            .map_err(|e| format!("Error serializando JSON: {}", e))?;
        stdin.write_all(payload.as_bytes())
            .map_err(|e| format!("Error escribiendo stdin: {}", e))?;
    }

    let output = child.wait_with_output()
        .map_err(|e| format!("Error esperando script: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Script {} falló:\n{}", script, stderr));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    serde_json::from_str(stdout.trim())
        .map_err(|e| format!("Respuesta inválida de {}: {} — stdout: {}", script, e, stdout))
}

pub fn python_cmd() -> String {
    if cfg!(target_os = "windows") {
        "python".to_string()
    } else {
        "python3".to_string()
    }
}