const BASE_URL = "https://aurelienychuameni-back.onrender.com/api";

fetch(`${BASE_URL}/api/auctions`)

// =============== AUTH =================
export async function registerUser(data) {
  const res = await fetch(`${BASE_URL}/users/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// =============== PROFILE ================
export async function getProfile(token) {
  const res = await fetch(`${BASE_URL}/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// =============== AUCTIONS ================
export async function fetchAuctions() {
  try {
    const res = await fetch(`${BASE_URL}/auctions/`);
    if (!res.ok) throw new Error("Error al obtener las subastas");
    return res.json(); // <-- Esto debería devolver objetos con category.name
  } catch (error) {
    console.error("❌ fetchAuctions error:", error);
    throw error;
  }
}

export async function fetchAuction(id) {
  const res = await fetch(`${BASE_URL}/auctions/${id}/`);
  return res.json();
}

export async function createAuction(data, token) {
  const res = await fetch(`${BASE_URL}/auctions/`, {
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
  const res = await fetch(`${BASE_URL}/auctions/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Error al eliminar subasta:", text);
    throw new Error("Error al eliminar subasta");
  }
}

export async function updateAuction(id, data, token) {
  const res = await fetch(`${BASE_URL}/auctions/${id}/`, {
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
  const res = await fetch(`${BASE_URL}/auctions/bids/`, {
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
  const res = await fetch(`${BASE_URL}/auctions/bids/auction/${auctionId}/`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener pujas: ${text}`);
  }
  return res.json();
}


export async function fetchMyBids(token) {
  const res = await fetch(`${BASE_URL}/auctions/mybids/`, {
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
  const res = await fetch(`${BASE_URL}/auctions/categories/`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error al obtener categorías: ${text}`);
  }
  return res.json(); // [{id, name}]
}

export async function createCategory(name, token) {
  const res = await fetch(`${BASE_URL}/auctions/categories/`, {
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
  const res = await fetch(`${BASE_URL}/auctions/users/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function fetchUserProfile(token) {
  try {
    const res = await fetch(`${BASE_URL}/users/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
  } catch (error) {
    console.error("❌ Error general al obtener perfil:", error);
    throw error;
  }
}
const eliminarPuja = async (bidId) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    await deleteBid(bidId, token); // 🔁 necesitas esta función en la API
    setPujas((prev) => prev.filter((b) => b.id !== bidId));
  } catch (error) {
    console.error("❌ Error al eliminar puja:", error);
  }
};
export async function deleteBid(id, token) {
  const res = await fetch(`${BASE_URL}/auctions/bids/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status !== 204) {
    const text = await res.text();  // Captura error HTML si lo hay
    throw new Error(`Error al eliminar puja: ${text}`);
  }
}
export async function updateBid(id, data, token) {
  const res = await fetch(`${BASE_URL}/auctions/bids/${id}/`, {
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

export async function createOrUpdateRating(ratingData) {
  const res = await fetch(`${BASE_URL}/auctions/ratings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(ratingData),
  });

  if (!res.ok) {
    throw new Error("Error al enviar valoración");
  }

  return res.json();
}