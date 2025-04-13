// auth.js

const TOKEN_KEY = "token";  // 🔑 Clave unificada para almacenar el token

// 🔐 Login: obtiene access y refresh tokens
export async function loginUser({ username, password }) {
  const res = await fetch("https://aurelienychuameni-back.onrender.com/api/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("❌ Error de login:", errorData);
    throw new Error("Login fallido");
  }

  return res.json(); // { access, refresh }
}

// 💾 Guarda el token y notifica el cambio de sesión
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("authChanged")); // 🔄 Notifica al layout
}

// 🔍 Obtiene el token actual desde localStorage
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// 🚪 Elimina el token (logout) y notifica
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("authChanged")); // 🔄 Notifica al layout
}
