"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./detalle.module.css";
import Layout from "../../componentes/Layout/Layout";
import {
  fetchAuction,
  createBid,
  fetchBidsByAuction,
  createOrUpdateRating,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { format } from "date-fns";

export default function DetalleSubasta() {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Extraemos el ID directamente desde la URL
  const id = pathname?.split("/").pop();

  const [subasta, setSubasta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [puja, setPuja] = useState("");
  const [mensajePuja, setMensajePuja] = useState("");
  const [bids, setBids] = useState([]);
  const [ratingValue, setRatingValue] = useState(1);
  const [ratingMessage, setRatingMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    console.log("🧩 ID extraído de la URL:", id);

    const loadAuction = async () => {
      try {
        const data = await fetchAuction(id);
        if (data && data.id) {
          setSubasta(data);
        } else {
          throw new Error("Subasta no encontrada.");
        }
      } catch (err) {
        console.error("Error al obtener subasta:", err);
        setError("No se pudo cargar la subasta.");
      } finally {
        setCargando(false);
      }
    };

    const loadBids = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const allBids = await fetchBidsByAuction(id, token);
        const sorted = allBids.sort((a, b) => {
          if (b.amount === a.amount)
            return new Date(a.timestamp) - new Date(b.timestamp);
          return b.amount - a.amount;
        });
        setBids(sorted);
      } catch (error) {
        console.error("Error al obtener pujas:", error);
      }
    };

    loadAuction();
    loadBids();
  }, [id]);

  const handlePuja = async () => {
    const pujaValor = parseFloat(puja);
    if (isNaN(pujaValor)) {
      setMensajePuja("⚠️ Introduce un número válido.");
      return;
    }
    if (pujaValor <= subasta.price) {
      setMensajePuja("❌ La puja debe ser mayor al valor actual.");
      return;
    }

    const token = getToken();
    if (!token) {
      alert("Necesitas iniciar sesión para pujar.");
      router.push("/login");
      return;
    }

    try {
      const bidData = { amount: pujaValor, auction: subasta.id };
      const result = await createBid(bidData, token);

      if (result.amount) {
        setMensajePuja(`✅ Has pujado ${pujaValor}€ correctamente.`);
        setSubasta({ ...subasta, price: pujaValor });
        setPuja("");

        const nuevasPujas = bids.filter(
          (b) => b.bidder_username !== result.bidder_username
        );
        nuevasPujas.unshift(result);
        nuevasPujas.sort((a, b) => {
          if (b.amount === a.amount) {
            return new Date(a.timestamp) - new Date(b.timestamp);
          }
          return b.amount - a.amount;
        });

        setBids(nuevasPujas);
      } else {
        console.error("Error en la puja:", result);
        setMensajePuja("❌ Error al enviar la puja.");
      }
    } catch (err) {
      console.error("Error al pujar:", err);
      setMensajePuja("❌ Error de conexión al pujar.");
    }
  };

  const handleRating = async () => {
    const token = getToken();
    if (!token) {
      alert("Necesitas iniciar sesión para valorar.");
      router.push("/login");
      return;
    }

    try {
      console.log("➡️ Enviando valoración para auction ID:", id);
      await createOrUpdateRating(id, { score: ratingValue }, token);
      setRatingMessage("✅ Valoración enviada correctamente.");
    } catch (err) {
      console.error("Error al valorar:", err);
      setRatingMessage("❌ Error al enviar valoración.");
    }
  };

  if (cargando) {
    return (
      <Layout>
        <p className={styles.cargando}>Cargando subasta...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p className={styles.error}>{error}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.productDetail}>
          <h1>{subasta.title}</h1>
          <img
            src={subasta.thumbnail}
            alt={subasta.title}
            className={styles.productImage}
          />
          <p>{subasta.description}</p>
          <p>
            <strong>Valor actual:</strong>{" "}
            {parseFloat(subasta.price).toFixed(2)} €
          </p>

          <p>
            <strong>Valoración media:</strong>{" "}
            {subasta.averageRating != null
              ? `${subasta.averageRating.toFixed(2)} ⭐`
              : "Sin valoraciones aún"}
          </p>

          <label htmlFor="bidAmount">Tu puja:</label>
          <input
            type="number"
            id="bidAmount"
            min={subasta.price + 1}
            step="1"
            value={puja}
            onChange={(e) => setPuja(e.target.value)}
            className={styles.inputNumber}
          />

          <button onClick={handlePuja} className={styles.bidButton}>
            Pujar
          </button>
          {mensajePuja && <p className={styles.bidMessage}>{mensajePuja}</p>}

          <div className={styles.ratingSection}>
            <label htmlFor="rating">Tu valoración:</label>
            <select
              id="rating"
              value={ratingValue}
              onChange={(e) => setRatingValue(parseInt(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>
                  {v} estrella{v > 1 && "s"}
                </option>
              ))}
            </select>
            <button onClick={handleRating}>Valorar</button>
            {ratingMessage && <p>{ratingMessage}</p>}
          </div>

          <button
            onClick={() => router.push("/subastas")}
            className={styles.volverBtn}
          >
            ⬅ Volver a subastas
          </button>
        </div>

        <div className={styles.bidList}>
          <h3>📜 Historial de pujas</h3>
          {bids.length === 0 ? (
            <p>No hay pujas todavía.</p>
          ) : (
            <ul>
              {bids.map((bid, index) => (
                <li key={index}>
                  💰 <strong>{Number(bid.amount).toFixed(2)}€</strong> - 👤{" "}
                  {bid.bidder_username} - ⏱{" "}
                  {format(new Date(bid.timestamp), "d/M/yyyy, HH:mm:ss")}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
