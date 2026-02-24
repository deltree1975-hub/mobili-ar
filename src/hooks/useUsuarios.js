// src/hooks/useUsuarios.js
// F2-05 — Hook de usuarios MOBILI-AR
// Calibrado a: commands/usuarios.rs (get_usuarios, crear_usuario,
//              get_mansiones_usuario, asignar_mansiones)

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useUsuarios() {
  const [usuarios, setUsuarios]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const cargarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoke("get_usuarios");
      setUsuarios(data);
    } catch (e) {
      setError(typeof e === "string" ? e : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  // payload: { nombre, apellido, rol, mansiones: string[] }
  const crearUsuario = useCallback(async (payload) => {
    const usuario = await invoke("crear_usuario", { datos: payload });
    setUsuarios((prev) => [usuario, ...prev]);
    return usuario; // Usuario con token incluido para F2-06
  }, []);

  // Carga las mansiones habilitadas para un usuario dado su rol
  const getMansionesUsuario = useCallback(async (usuarioId, rol) => {
    return await invoke("get_mansiones_usuario", {
      usuarioId,
      rol,
    });
  }, []);

  // Asigna mansiones a un usuario existente
  const asignarMansiones = useCallback(async (usuarioId, mansionIds) => {
    await invoke("asignar_mansiones", {
      usuarioId,
      mansionIds,
    });
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  return {
    usuarios,
    loading,
    error,
    crearUsuario,
    getMansionesUsuario,
    asignarMansiones,
    recargar: cargarUsuarios,
  };
}
