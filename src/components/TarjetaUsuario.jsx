// ============================================================
// MOBILI-AR — Tarjeta de usuario imprimible
// Archivo  : src/components/TarjetaUsuario.jsx
// Módulo   : F2-06 — Tarjeta con código de barras
// Depende  : jsbarcode (npm install jsbarcode)
// ============================================================

import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import './TarjetaUsuario.css';

const LABELS_ROL = {
  operario:  'Operario',
  disenador: 'Diseñador',
  admin:     'Administrador',
  dueno:     'Dueño',
};

const COLORES_ROL = {
  operario:  '#4a7fa5',
  disenador: '#7a5ea5',
  admin:     '#d9541e',
  dueno:     '#c9a227',
};

// usuario: { id, nombre, apellido, rol, token, activo }
export function TarjetaUsuario({ usuario, onCerrar }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !usuario?.token) return;

    JsBarcode(svgRef.current, usuario.token, {
      format:      'CODE128',
      width:       2,
      height:      48,
      displayValue: true,
      text:        usuario.token,
      fontSize:    10,
      fontOptions: 'bold',
      font:        'monospace',
      textAlign:   'center',
      textPosition:'bottom',
      textMargin:  4,
      background:  '#ffffff',
      lineColor:   '#111111',
      margin:      8,
    });
  }, [usuario?.token]);

  if (!usuario) return null;

  const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ');
  const inicial = usuario.nombre?.charAt(0)?.toUpperCase() ?? '?';
  const colorRol = COLORES_ROL[usuario.rol] ?? '#555';
  const labelRol = LABELS_ROL[usuario.rol] ?? usuario.rol;

  function handleImprimir() {
    window.print();
  }

  return (
    <div className="tu-overlay">
      {/* Controles — se ocultan al imprimir */}
      <div className="tu-controles no-print">
        <p className="tu-instruccion">
          Vista previa de tarjeta · Tamaño carnet (85 × 54 mm)
        </p>
        <div className="tu-btns">
          <button className="tu-btn tu-btn--cancelar" onClick={onCerrar}>
            Cancelar
          </button>
          <button className="tu-btn tu-btn--imprimir" onClick={handleImprimir}>
            🖨 Imprimir tarjeta
          </button>
        </div>
      </div>

      {/* Tarjeta — esto es lo que se imprime */}
      <div className="tu-tarjeta" id="tarjeta-imprimible">

        {/* Franja superior con color de rol */}
        <div className="tu-franja" style={{ background: colorRol }} />

        {/* Cabecera */}
        <div className="tu-cabecera">
          <div className="tu-avatar" style={{ borderColor: colorRol }}>
            {inicial}
          </div>
          <div className="tu-info">
            <span className="tu-nombre">{nombreCompleto}</span>
            <span className="tu-rol" style={{ color: colorRol }}>{labelRol}</span>
          </div>
          <div className="tu-logo">M</div>
        </div>

        {/* Divider */}
        <div className="tu-divider" />

        {/* Código de barras */}
        <div className="tu-barcode-wrap">
          <svg ref={svgRef} className="tu-barcode" />
        </div>

        {/* Pie */}
        <div className="tu-pie">
          <span>MOBILI-AR</span>
          <span className="tu-pie-sep">·</span>
          <span>Control de acceso</span>
        </div>

      </div>
    </div>
  );
}
