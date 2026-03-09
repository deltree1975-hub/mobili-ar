#!/usr/bin/env python3
# ============================================================
# MOBILI-AR — Generador de Lista de Corte
# Archivo  : scripts/lista_corte.py
# Módulo   : B4-01
# Entrada  : JSON por stdin
# Salida   : PDF en ruta indicada en JSON
# Diseño   : Taller — una sola tabla continua, membrete compacto
# ============================================================

import sys, json
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame,
    Table, TableStyle, Paragraph
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfgen import canvas as rl_canvas

W, H = A4
MARGIN_H = 10 * mm
MARGIN_V = 8  * mm
HEADER_H = 30 * mm
FOOTER_H = 8  * mm

GRIS_HEADER   = colors.HexColor('#2c2c2c')
GRIS_MOD      = colors.HexColor('#d0d8e0')
GRIS_FILA     = colors.HexColor('#f2f2f2')
BLANCO        = colors.white
NEGRO         = colors.HexColor('#1a1a1a')
GRIS_TEXTO    = colors.HexColor('#555555')
BORDE         = colors.HexColor('#aaaaaa')
VERDE_FONDO   = colors.HexColor('#e8f5e8')
AMARILLO_FAJA = colors.HexColor('#fff8e0')


class TallerCanvas(rl_canvas.Canvas):
    def __init__(self, filename, datos, **kw):
        super().__init__(filename, **kw)
        self.datos = datos
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved_page_states)
        for i, state in enumerate(self._saved_page_states, 1):
            self.__dict__.update(state)
            self._membrete(i, total)
            rl_canvas.Canvas.showPage(self)
        rl_canvas.Canvas.save(self)

    def _membrete(self, pagina, total):
        d    = self.datos
        emp  = d.get('empresa', {})
        trab = d.get('trabajo', {})
        comp = d.get('composicion', {})

        # Borde membrete
        self.setStrokeColor(BORDE)
        self.setLineWidth(0.5)
        self.rect(MARGIN_H, H - MARGIN_V - HEADER_H,
                  W - 2*MARGIN_H, HEADER_H, fill=0, stroke=1)

        # Banda empresa
        self.setFillColor(GRIS_HEADER)
        self.rect(MARGIN_H, H - MARGIN_V - 10*mm,
                  W - 2*MARGIN_H, 10*mm, fill=1, stroke=0)

        y1 = H - MARGIN_V - 7*mm
        self.setFillColor(BLANCO)
        self.setFont('Helvetica-Bold', 9)
        self.drawString(MARGIN_H + 3*mm, y1,
                        emp.get('nombre', 'EMPRESA').upper())

        self.setFont('Helvetica', 7.5)
        contacto = '   '.join(filter(None,
            [emp.get('telefono',''), emp.get('email','')]))
        self.drawCentredString(W/2, y1, contacto)

        self.setFont('Helvetica-Bold', 8)
        self.drawRightString(W - MARGIN_H - 3*mm, y1,
                             f'Hoja {pagina} / {total}')

        # Campos técnicos — 6 columnas
        col_w = (W - 2*MARGIN_H) / 6
        campos = [
            ('O.T.',     trab.get('id', '')[:16]),
            ('Cliente',  trab.get('cliente', '—')),
            ('Proyecto', comp.get('nombre', '—')),
            ('Material', d.get('material_principal', '—')),
            ('Fecha',    datetime.now().strftime('%d/%m/%Y')),
            ('',         'MOBILI-AR'),
        ]
        y_label = H - MARGIN_V - 17*mm
        y_valor = H - MARGIN_V - 24*mm
        for i, (label, valor) in enumerate(campos):
            x = MARGIN_H + i * col_w
            if i > 0:
                self.setStrokeColor(BORDE)
                self.setLineWidth(0.3)
                self.line(x, H - MARGIN_V - 10*mm,
                          x, H - MARGIN_V - HEADER_H)
            self.setFillColor(GRIS_TEXTO)
            self.setFont('Helvetica', 6)
            self.drawString(x + 2*mm, y_label, label.upper())
            self.setFillColor(NEGRO)
            self.setFont('Helvetica-Bold', 7.5)
            self.drawString(x + 2*mm, y_valor, str(valor)[:24])

        # Pie
        self.setFont('Helvetica', 6)
        self.setFillColor(GRIS_TEXTO)
        self.drawCentredString(W/2, MARGIN_V,
            f'MOBILI-AR  —  Lista de Corte  —  '
            f'{datetime.now().strftime("%d/%m/%Y %H:%M")}  —  '
            f'Hoja {pagina} de {total}')
        self.setStrokeColor(BORDE)
        self.setLineWidth(0.3)
        self.line(MARGIN_H, MARGIN_V + 3*mm,
                  W - MARGIN_H, MARGIN_V + 3*mm)


def mts2(largo, ancho):
    return (largo * ancho) / 1_000_000

def filos_str(pieza):
    f = []
    if pieza.get('canto_frente_id'):    f.append('Fr')
    if pieza.get('canto_posterior_id'): f.append('Po')
    if pieza.get('canto_superior_id'):  f.append('Su')
    if pieza.get('canto_inferior_id'):  f.append('In')
    return '/'.join(f) if f else ''

def mat_label(mid, mmap):
    m = mmap.get(mid)
    return f"{m['color']} {m['espesor']}mm" if m else ''

def cel(txt, fs=7.5, bold=False, align=TA_LEFT, color=NEGRO):
    fn = 'Helvetica-Bold' if bold else 'Helvetica'
    st = ParagraphStyle('_', fontName=fn, fontSize=fs,
                        textColor=color, alignment=align,
                        leading=fs * 1.2, spaceBefore=0, spaceAfter=0)
    return Paragraph(str(txt) if txt is not None else '', st)


def build_tabla(modulos, cantos_map, materiales_map):
    CW = [7*mm, 55*mm, 12*mm, 18*mm, 18*mm, 10*mm, 36*mm, 18*mm, 16*mm]

    HDR = [
        cel('Nro',            6.5, True, TA_CENTER, BLANCO),
        cel('Detalle',        6.5, True, TA_LEFT,   BLANCO),
        cel('Cant',           6.5, True, TA_CENTER, BLANCO),
        cel('Largo',          6.5, True, TA_CENTER, BLANCO),
        cel('Ancho',          6.5, True, TA_CENTER, BLANCO),
        cel('Esp',            6.5, True, TA_CENTER, BLANCO),
        cel('Color/Material', 6.5, True, TA_LEFT,   BLANCO),
        cel('Filos',          6.5, True, TA_CENTER, BLANCO),
        cel('Mts²',           6.5, True, TA_CENTER, BLANCO),
    ]

    rows   = [HDR]
    cmds   = []
    nro    = 1
    fi     = 1   # índice fila en tabla

    for modulo in modulos:
        piezas = modulo.get('piezas', [])
        if not piezas:
            continue

        disp_id  = modulo.get('disposicion', '')
        disp_nom = modulo.get('disposicion_nombre', disp_id)
        dims     = (f"{modulo.get('ancho',0):.0f}×"
                    f"{modulo.get('alto',0):.0f}×"
                    f"{modulo.get('profundidad',0):.0f}mm")
        mat_mod  = (mat_label(modulo.get('material_id'), materiales_map)
                    or modulo.get('color_material', ''))

        # Fila separadora módulo
        label = f"{modulo.get('nombre','').upper()}   {disp_nom} [{disp_id}]   {dims}"
        rows.append([
            cel('', 7), cel(label, 7.5, bold=True, color=GRIS_HEADER),
            cel(''), cel(''), cel(''), cel(''), cel(''), cel(''), cel('')
        ])
        cmds += [
            ('BACKGROUND',    (0,fi), (-1,fi), GRIS_MOD),
            ('SPAN',          (1,fi), (-1,fi)),
            ('TOPPADDING',    (0,fi), (-1,fi), 3),
            ('BOTTOMPADDING', (0,fi), (-1,fi), 3),
        ]
        fi += 1

        for i, pieza in enumerate(piezas):
            largo = pieza.get('ancho_corte', pieza.get('ancho_nominal', 0))
            ancho = pieza.get('alto_corte',  pieza.get('alto_nominal',  0))
            esp   = pieza.get('espesor', 0)
            cant  = pieza.get('cantidad', 1)
            tipo  = pieza.get('tipo', '')
            mat_p = mat_label(pieza.get('material_id'), materiales_map) or mat_mod
            m2    = mts2(largo * cant, ancho)
            m2s   = f"{m2:.4f}" if m2 > 0 else ''

            rows.append([
                cel(str(nro),             7.5, align=TA_CENTER),
                cel(pieza.get('nombre',''), 7.5),
                cel(str(cant),            7.5, align=TA_CENTER),
                cel(f"{largo:.0f}",       7.5, align=TA_CENTER),
                cel(f"{ancho:.0f}",       7.5, align=TA_CENTER),
                cel(f"{esp:.0f}",         7.5, align=TA_CENTER),
                cel(mat_p,                7.5),
                cel(filos_str(pieza),     7.5, align=TA_CENTER),
                cel(m2s,                  7.5, align=TA_RIGHT),
            ])

            if   tipo == 'back': bg = VERDE_FONDO
            elif tipo == 'faja': bg = AMARILLO_FAJA
            elif i % 2 == 0:     bg = GRIS_FILA
            else:                bg = BLANCO

            cmds.append(('BACKGROUND', (0,fi), (-1,fi), bg))
            nro += 1
            fi  += 1

    ts = TableStyle([
        ('BACKGROUND',    (0,0), (-1,0), GRIS_HEADER),
        ('TOPPADDING',    (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING',   (0,0), (-1,-1), 2),
        ('RIGHTPADDING',  (0,0), (-1,-1), 2),
        ('GRID',          (0,0), (-1,-1), 0.25, BORDE),
        ('BOX',           (0,0), (-1,-1), 0.6,  GRIS_HEADER),
        ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
    ])
    for cmd in cmds:
        ts.add(*cmd)

    t = Table(rows, colWidths=CW, repeatRows=1)
    t.setStyle(ts)
    return t


def generar_pdf(datos, output_path):
    cantos_map     = {c['id']: c for c in datos.get('cantos', [])}
    materiales_map = {m['id']: m for m in datos.get('materiales', [])}
    modulos        = datos.get('modulos', [])

    doc = BaseDocTemplate(
        output_path, pagesize=A4,
        leftMargin=MARGIN_H, rightMargin=MARGIN_H,
        topMargin=HEADER_H + MARGIN_V + 2*mm,
        bottomMargin=FOOTER_H + MARGIN_V,
    )
    frame = Frame(
        MARGIN_H, FOOTER_H + MARGIN_V,
        W - 2*MARGIN_H,
        H - HEADER_H - MARGIN_V - FOOTER_H - MARGIN_V - 2*mm,
        id='main', leftPadding=0, rightPadding=0,
        topPadding=0, bottomPadding=0,
    )
    doc.addPageTemplates([PageTemplate(id='main', frames=[frame])])

    tabla = build_tabla(modulos, cantos_map, materiales_map)

    def canvas_maker(filename, **kw):
        return TallerCanvas(filename, datos, **kw)

    doc.build([tabla], canvasmaker=canvas_maker)


if __name__ == '__main__':
    datos = json.loads(sys.stdin.read())
    out   = datos.get('output_path', '/tmp/lista_corte.pdf')
    generar_pdf(datos, out)
    print(json.dumps({'ok': True, 'path': out}))
