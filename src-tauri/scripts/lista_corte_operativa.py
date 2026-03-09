#!/usr/bin/env python3
# ============================================================
# MOBILI-AR — Generador de CSVs operativos por material
# Archivo  : scripts/lista_corte_operativa.py
# Módulo   : B4-01
# Entrada  : JSON por stdin (mismo formato que lista_corte.py)
# Salida   : carpeta lista_corte_{numero_ot}/
#            un CSV por combinación material+color+espesor
#            compatible con WinCut y optimizadores externos
# ============================================================
#
# Formato CSV por archivo:
#   Detalle, Largo, Ancho, Cantidad
#
# Nombre de archivo:
#   {color}_{espesor}mm.csv  (ej: perla_blanco_18mm.csv)
#
# Detalle de pieza:
#   "{nombre} — {modulo}"  (ej: "Lateral Izquierdo — Bajo 600")
#
# Notas:
#   - Sin filos (van en lista general PDF)
#   - Sin piezas tipo 'back' con espesor <= 6mm (fondo delgado,
#     generalmente pre-cortado en rollo — se puede configurar)
#   - Un CSV por material, sin encabezados de módulo
#   - Filas ordenadas por Largo DESC para optimizar corte
# ============================================================

import sys, json, csv, os, re
from pathlib import Path

EXCLUIR_FONDO_DELGADO = True   # fondo <= 6mm va aparte
ESPESOR_FONDO_MAX     = 6.0    # mm — umbral fondo delgado


def slug(texto):
    """Convierte texto a nombre de archivo seguro."""
    t = texto.lower().strip()
    t = re.sub(r'[áàä]', 'a', t)
    t = re.sub(r'[éèë]', 'e', t)
    t = re.sub(r'[íìï]', 'i', t)
    t = re.sub(r'[óòö]', 'o', t)
    t = re.sub(r'[úùü]', 'u', t)
    t = re.sub(r'[^a-z0-9]+', '_', t)
    t = t.strip('_')
    return t


def clave_material(material):
    """Clave única por combinación color+espesor."""
    color   = material.get('color', 'sin_color')
    espesor = material.get('espesor', 0)
    return f"{slug(color)}_{int(espesor)}mm"


def nombre_archivo(material):
    return clave_material(material) + '.csv'


def es_fondo_delgado(pieza):
    return (
        pieza.get('tipo') == 'back'
        and pieza.get('espesor', 99) <= ESPESOR_FONDO_MAX
    )


def resolver_material(pieza, modulo, materiales_map):
    """
    Prioridad: material de la pieza → material del módulo → None
    Retorna dict con id, color, espesor o None.
    """
    mid = pieza.get('material_id') or modulo.get('material_id')
    if mid and mid in materiales_map:
        return materiales_map[mid]
    # Fallback: construir desde campos del módulo si existen
    color   = modulo.get('color_material', '')
    espesor = pieza.get('espesor', 0)
    if color:
        return {'id': None, 'color': color, 'espesor': espesor}
    return None


def agrupar_piezas(modulos, materiales_map):
    """
    Retorna dict: clave_material → {
        'material': {...},
        'filas': [{'detalle', 'largo', 'ancho', 'cantidad'}]
    }
    """
    grupos = {}

    for modulo in modulos:
        nombre_mod = modulo.get('nombre', 'Módulo')
        piezas     = modulo.get('piezas', [])

        for pieza in piezas:
            # Excluir fondos delgados si está configurado
            if EXCLUIR_FONDO_DELGADO and es_fondo_delgado(pieza):
                continue

            material = resolver_material(pieza, modulo, materiales_map)
            if not material:
                continue

            clave = clave_material(material)

            if clave not in grupos:
                grupos[clave] = {
                    'material': material,
                    'filas':    [],
                }

            nombre_pieza = pieza.get('nombre', pieza.get('tipo', ''))
            detalle      = f"{nombre_pieza} — {nombre_mod}"
            largo        = pieza.get('ancho_corte', pieza.get('ancho_nominal', 0))
            ancho        = pieza.get('alto_corte',  pieza.get('alto_nominal',  0))
            cantidad     = pieza.get('cantidad', 1)

            grupos[clave]['filas'].append({
                'detalle':  detalle,
                'largo':    int(round(largo)),
                'ancho':    int(round(ancho)),
                'cantidad': int(cantidad),
            })

    # Ordenar filas por largo DESC dentro de cada grupo
    for g in grupos.values():
        g['filas'].sort(key=lambda r: r['largo'], reverse=True)

    return grupos


def escribir_csvs(grupos, carpeta_salida):
    """Escribe un CSV por grupo en la carpeta indicada."""
    Path(carpeta_salida).mkdir(parents=True, exist_ok=True)
    archivos = []

    for clave, grupo in grupos.items():
        material = grupo['material']
        filas    = grupo['filas']
        nombre   = nombre_archivo(material)
        ruta     = os.path.join(carpeta_salida, nombre)

        with open(ruta, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Detalle', 'Largo', 'Ancho', 'Cantidad'])
            for fila in filas:
                writer.writerow([
                    fila['detalle'],
                    fila['largo'],
                    fila['ancho'],
                    fila['cantidad'],
                ])

        archivos.append({
            'archivo':  nombre,
            'ruta':     ruta,
            'material': f"{material.get('color','')} {material.get('espesor','')}mm",
            'piezas':   len(filas),
        })

    return archivos


def generar_csvs(datos, carpeta_salida):
    materiales_map = {m['id']: m for m in datos.get('materiales', [])}
    modulos        = datos.get('modulos', [])

    grupos   = agrupar_piezas(modulos, materiales_map)
    archivos = escribir_csvs(grupos, carpeta_salida)
    return archivos


if __name__ == '__main__':
    datos = json.loads(sys.stdin.read())

    # Determinar carpeta de salida
    # Usa numero_ot si está disponible, sino id del trabajo
    trabajo  = datos.get('trabajo', {})
    nro_ot   = trabajo.get('numero_ot') or trabajo.get('id', 'OT')[:8]
    base_dir = datos.get('output_dir', '/tmp')
    carpeta  = os.path.join(base_dir, f"lista_corte_{nro_ot:04}" if isinstance(nro_ot, int) else f"lista_corte_{nro_ot}")

    archivos = generar_csvs(datos, carpeta)

    print(json.dumps({
        'ok':      True,
        'carpeta': carpeta,
        'archivos': archivos,
    }, ensure_ascii=False))