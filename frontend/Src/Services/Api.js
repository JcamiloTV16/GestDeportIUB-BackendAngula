export const API = "http://localhost:8000"
import { cerrarSesion } from '../Store.js';

async function authFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (response.status === 401) {
    cerrarSesion();
    window.location.hash = '#/';
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }
  return response;
}

export async function obtenerDeportes() {
  const res = await authFetch(`${API}/deportes/`)
  return await res.json()
}

export async function agregarDeporte(deporte) {
  const res = await authFetch(`${API}/deportes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deporte)
  })
  return await res.json()
}

export async function eliminarDeporte(id) {
  const res = await authFetch(`${API}/deportes/${id}`, {
    method: "DELETE"
  })
  return await res.json()
}

export async function actualizarDeporte(id, deporte) {
  const res = await authFetch(`${API}/deportes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deporte)
  })
  return await res.json()
}

export async function obtenerDeportesInactivos(token) {
  const res = await authFetch(`${API}/deportes/inactivos/`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

export async function reactivarDeporte(id, token) {
  const res = await authFetch(`${API}/deportes/${id}/reactivar/`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

export async function obtenerDeportesEstudiante(estudianteId) {
  const res = await authFetch(`${API}/inscripciones/estudiante/${estudianteId}/deportes`)
  return await res.json()
}

export async function login(email, password) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, password: password })
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || "Error al iniciar sesión")
  }

  return await res.json()
}

export async function recoverPassword(email) {
  const res = await fetch(`${API}/auth/recover`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || "Error al recuperar la contraseña")
  }

  return await res.json()
}

export async function obtenerUsuarios(token) {
  const res = await authFetch(`${API}/usuarios/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function obtenerUsuariosInactivos(token) {
  const res = await authFetch(`${API}/usuarios/inactivos/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function actualizarUsuario(id, usuario, token) {
  const res = await authFetch(`${API}/usuarios/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(usuario)
  })
  return await res.json()
}

export async function eliminarUsuario(id, token) {
  const res = await authFetch(`${API}/usuarios/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function reactivarUsuario(id, token) {
  const res = await authFetch(`${API}/usuarios/${id}/reactivar/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function obtenerHorarios(token) {
  const res = await authFetch(`${API}/horarios/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function obtenerHorariosInactivos(token) {
  const res = await authFetch(`${API}/horarios/inactivos/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function reactivarHorario(id, token) {
  const res = await authFetch(`${API}/horarios/${id}/reactivar/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function obtenerInscritosPorHorario(horarioId, token) {
  const res = await authFetch(`${API}/inscripciones/horario/${horarioId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function inscribirEstudiante(datos, token) {
  const res = await authFetch(`${API}/inscripciones/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  })
  
  if (!res.ok) {
    let errMsg = "Error desconocido al inscribir";
    try {
      const err = await res.json();
      errMsg = err.detail || errMsg;
    } catch(e) {}
    throw new Error(errMsg);
  }
  
  return await res.json()
}

export async function obtenerAuditorias(token) {
  const res = await authFetch(`${API}/auditoria/`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function obtenerEntrenadores() {
  const res = await authFetch(`${API}/entrenadores/`)
  return await res.json()
}

export async function obtenerHorariosPorEntrenador(entrenadorId, token) {
  const res = await authFetch(`${API}/horarios/entrenador/${entrenadorId}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  return await res.json()
}

export async function obtenerHorariosPorDeporte(deporteId) {
  const res = await authFetch(`${API}/horarios/deporte/${deporteId}`)
  return await res.json()
}


// Obtener Roles (para el select de roles en el formulario)
export async function obtenerRoles(token) {
  const res = await authFetch(`${API}/roles/`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

// Obtener Facultades (si tienes una tabla de facultades)
export async function obtenerFacultades(token) {
  const res = await authFetch(`${API}/facultades`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

// Obtener Tipos de Documento
export async function obtenerTiposDocumento(token) {
  const res = await authFetch(`${API}/tipos-documento`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

// --- Torneos ---
export async function obtenerTorneos() {
  const res = await authFetch(`${API}/torneos/`)
  return await res.json()
}

export async function crearTorneo(datos, token) {
  const res = await authFetch(`${API}/torneos/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  })
  return await res.json()
}

export async function eliminarTorneo(id, token) {
  const res = await authFetch(`${API}/torneos/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

export async function cambiarEstadoTorneo(id, nuevoEstado, token) {
  const res = await authFetch(`${API}/torneos/${id}/estado`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ estado_torneo: nuevoEstado })
  })
  return await res.json()
}

// --- Inscripciones a Torneos ---
export async function inscribirseEnTorneo(datos, token) {
  const res = await authFetch(`${API}/inscripciones-torneo/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  })
  return await res.json()
}

export async function obtenerInscritosTorneo(torneoId, token) {
  const res = await authFetch(`${API}/inscripciones-torneo/torneo/${torneoId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

export async function obtenerMisTorneos(estudianteId, token) {
  const res = await authFetch(`${API}/inscripciones-torneo/estudiante/${estudianteId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

export async function cambiarEstadoInscripcionTorneo(id, estado, token) {
  const res = await authFetch(`${API}/inscripciones-torneo/${id}/estado`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ estado_inscripcion: estado })
  })
  return await res.json()
}

export async function cancelarInscripcionTorneo(id, token) {
  const res = await authFetch(`${API}/inscripciones-torneo/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  })
  return await res.json()
}

// --- Chatbot ---
export async function enviarMensajeChatbot(mensaje) {
  const res = await fetch(`${API}/chatbot/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje })
  })
  return await res.json()
}