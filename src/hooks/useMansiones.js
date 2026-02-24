// src/hooks/useMansiones.js
// F2-05 — Hook para cargar todas las mansiones disponibles
// Usado en el formulario de creación de usuario

import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export function useMansiones() {
  const [mansiones, setMansiones] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    setLoading(true);
    invoke("get_mansiones")
      .then(setMansiones)
      .catch((e) => setError(typeof e === "string" ? e : "Error al cargar mansiones"))
      .finally(() => setLoading(false));
  }, []);

  return { mansiones, loading, error };
}
