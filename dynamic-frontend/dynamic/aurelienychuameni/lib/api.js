const BASE_URL = "http://localhost:8000/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
    return res.json();
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
  return res.json();
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

// =============== BIDS MANAGER ===================
export async function deleteBid(id, token) {
  const res = await fetch(`${BASE_URL}/auctions/bids/${id}/`, {
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

// =============== RATINGS ===================
export async function fetchRatings(auctionId) {
  const res = await fetch(`${BASE_URL}/auctions/ratings/${auctionId}/`);
  return res.json();
}

export async function createOrUpdateRating(auctionId, value, token) {
  const res = await fetch(`${BASE_URL}/auctions/ratings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      auction: auctionId,
      value,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al crear o actualizar valoración: ${errorText}`);
  }

  return res.json();
}

export async function deleteRating(ratingId, token) {
  const res = await fetch(`${BASE_URL}/auctions/ratings/${ratingId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.ok;
}
export async function fetchGlobalAverageRating() {
  const res = await fetch(`${BASE_URL}/auctions/ratings/global-average/`);
  if (!res.ok) {
    throw new Error("No se pudo obtener la media global.");
  }
  const data = await res.json();
  return data.average_rating;
}
export async function fetchComments(auctionId, token) {
  const res = await fetch(`${BASE_URL}/auctions/comments/?auction=${auctionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error al obtener comentarios:", errorText);
    throw new Error("No se pudieron cargar los comentarios.");
  }

  return res.json();
}

// =============== COMMENTS ===================

export async function createComment(commentData, token) {
  const res = await fetch(`${BASE_URL}/auctions/comments/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(commentData),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("❌ Error al crear comentario:", text);
    throw new Error(`Error al crear comentario: ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("❌ No se pudo parsear la respuesta JSON del comentario.");
  }
}



export async function deleteComment(commentId, token) {
  const res = await fetch(`${BASE_URL}/auctions/comments/${commentId}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Error al eliminar comentario:", text);
    throw new Error("Error al eliminar comentario");
  }

  return true;
}
export async function updateComment(commentId, data, token) {
  const res = await fetch(`${BASE_URL}/auctions/comments/${commentId}/`, {

    method: "PUT", // o "PATCH" si lo prefieres
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error("Error al editar comentario:", error);
    throw new Error("Error al editar comentario");
  }

  return await res.json();
}

// =============== MIS VALORACIONES ===================
export async function fetchMisValoraciones(token) {
  const res = await fetch(`${BASE_URL}/auctions/ratings/mine/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Error al obtener tus valoraciones:", errorText);
    throw new Error("Error al obtener tus valoraciones");
  }

  return res.json();
}
export async function updateRating(ratingId, data, token) {
  const res = await fetch(`${BASE_URL}/auctions/ratings/${ratingId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data), // ← debe incluir { auction: ..., value: ... }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error al actualizar valoración: ${errorText}`);
  }

  return res.json();
}


