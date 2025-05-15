const TOKEN_KEY = "token";

// 🔐 Login
export async function loginUser({ username, password }) {
  const res = await fetch("http://localhost:8000/api/token/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("❌ Error de login:", errorData);
    throw new Error("Login fallido");
  }

  return res.json(); // { access, refresh }
}

// 💾 Guarda el token (solo si window existe)
export function saveToken(token) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event("authChanged"));
  }
}

// 🔍 Obtener token actual
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

// 🚪 Logout
export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("authChanged"));
  }
}

// 🔎 Obtener ID de usuario desde el token
export function getUserId() {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id || payload.id;
  } catch (error) {
    console.error("Error al decodificar token:", error);
    return null;
  }
}
