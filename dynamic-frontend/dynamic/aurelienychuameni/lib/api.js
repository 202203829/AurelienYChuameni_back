const BASE_URL = "https://aurelienychuameni-back.onrender.com";

// =============== AUTH =================
export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/api/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// =============== PROFILE ================
export async function getProfile(token) {
  const res = await fetch(`${BASE_URL}/api/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// =============== AUCTIONS ================
export async function fetchAuctions() {
  const res = await fetch(`${BASE_URL}/api/auctions/`);
  if (!res.ok) throw new Error("Error al obtener las subastas");
  return res.json();
}
export async function fetchAuction(id) {
  const res = await fetch(`${BASE_URL}/api/auctions/${id}/`);
  if (!res.ok) throw new Error("Subasta no encontrada.");
  return res.json();
}


export async function createAuction(data, token) {
  const res = await fetch(`${BASE_URL}/api/auctions/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const jsonError = await res.json();
      console.error("❌ Error JSON al crear subasta:", jsonError);
    } else {
      const htmlError = await res.text();
      console.error("❌ Error HTML al crear subasta:", htmlError);
    }
    throw new Error("Error al crear subasta");
  }

  return res.json();
}

export async function deleteAuction(id, token) {
  const res = await fetch(`${BASE_URL}/api/auctions/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Error al eliminar subasta:", text);
    throw new Error("Error al eliminar subasta");
  }
}

export async function updateAuction(id, data, token) {
  const res = await fetch(`${BASE_URL}/api/auctions/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al actualizar subasta: ${errorText}`);
  }

  return res.json();
}

// =============== BIDS ===================
export async function createBid(data, token) {
  const res = await fetch(`${BASE_URL}/api/auctions/bids/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error al pujar:", res.status, errorText);
    throw new Error("Error al pujar");
  }

  return res.json();
}

export async function fetchBidsByAuction(auctionId) {
  const res = await fetch(`${BASE_URL}/api/auctions/bids/auction/${auctionId}/`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener pujas: ${text}`);
  }
  return res.json();
}


export async function fetchMyBids(token) {
  const res = await fetch(`${BASE_URL}/api/auctions/mybids/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("❌ Error al obtener mis pujas:", text);
    throw new Error("Error al obtener pujas");
  }

  return res.json();
}

// =============== CATEGORIES ===================
export async function fetchCategories() {
  const res = await fetch(`${BASE_URL}/api/auctions/categories/`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener categorías: ${text}`);
  }
  return res.json();
}

export async function createCategory(name, token) {
  const res = await fetch(`${BASE_URL}/api/auctions/categories/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Error al crear categoría:", text);
    throw new Error(`❌ Error al crear categoría: ${text}`);
  }

  return res.json();
}

// =============== PERSONAL ===================
export async function fetchMyAuctions(token) {
  const res = await fetch(`${BASE_URL}/api/auctions/users/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function fetchUserProfile(token) {
  const res = await fetch(`${BASE_URL}/api/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("❌ El servidor no devolvió JSON");
  }

  if (!res.ok) {
    const errorData = await res.json();
    console.error("❌ Error de perfil:", errorData);
    throw new Error("Error al obtener perfil");
  }

  return res.json();
}

export async function deleteBid(id, token) {
  const res = await fetch(`${BASE_URL}/api/auctions/bids/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status !== 204) {
    const text = await res.text();
    throw new Error(`Error al eliminar puja: ${text}`);
  }
}

export async function updateBid(id, data, token) {
  const res = await fetch(`${BASE_URL}/api/auctions/bids/${id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al editar puja: ${text}`);
  }

  return res.json();
}

// =============== RATINGS ===================
import { getToken } from "./auth"; // asegúrate de tener esta función bien definida

export async function createOrUpdateRating(ratingData, token) {
  const res = await fetch(`${BASE_URL}/api/ratings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(ratingData),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error al valorar:", res.status, errorText);
    throw new Error("Error al enviar valoración");
  }

  return res.json();
}
