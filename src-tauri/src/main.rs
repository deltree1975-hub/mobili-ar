// ============================================================
// MOBILI-AR — Punto de entrada de la aplicación Tauri
// Archivo  : src-tauri/src/main.rs
// Módulo   : F1-01 — Setup proyecto Tauri
// Creado   : [fecha]
// ============================================================
// F1-02: mod db;
// F1-04: mod commands;

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    mobili_ar_lib::run()
}