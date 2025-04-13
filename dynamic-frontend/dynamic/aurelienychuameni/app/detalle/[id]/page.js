"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./detalle.module.css";
import Layout from "../../componentes/Layout/Layout";
import { fetchAuction, createBid, fetchBidsByAuction } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { format } from "date-fns";


export default function DetalleSubasta() {
  const { id } = useParams();
  const router = useRouter();

  const [subasta, setSubasta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [puja, setPuja] = useState("");
  const [mensajePuja, setMensajePuja] = useState("");
  const [bids, setBids] = useState([]);

  useEffect(() => {
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

    if (id) {
      loadAuction();
      loadBids();
    }
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
  
        // Elimina las pujas anteriores del mismo usuario
        const nuevasPujas = bids.filter(
          (b) => b.bidder_username !== result.bidder_username
        );
  
        // Añade la nueva al principio
        nuevasPujas.unshift(result);
  
        // Reordena
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
  

  if (cargando) return <Layout><p className={styles.cargando}>Cargando subasta...</p></Layout>;
  if (error) return <Layout><p className={styles.error}>{error}</p></Layout>;

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.productDetail}>
          <h1>{subasta.title}</h1>
          <img src={subasta.thumbnail} alt={subasta.title} className={styles.productImage} />
          <p>{subasta.description}</p>
          <p><strong>Valor actual:</strong> {parseFloat(subasta.price).toFixed(2)} €</p>

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

          <button onClick={handlePuja} className={styles.bidButton}>Pujar</button>

          {mensajePuja && <p className={styles.bidMessage}>{mensajePuja}</p>}

          <button onClick={() => router.push("/subastas")} className={styles.volverBtn}>⬅ Volver a subastas</button>
        </div>

        <div className={styles.bidList}>
          <h3>📜 Historial de pujas</h3>
          {bids.length === 0 ? (
            <p>No hay pujas todavía.</p>
          ) : (
            <ul>
            {bids.map((bid, index) => (
              <li key={index}>
                💰 <strong>{Number(bid.amount).toFixed(2)}€</strong> – 👤 {bid.bidder_username} – ⏱ {format(new Date(bid.timestamp), "d/M/yyyy, HH:mm:ss")}
              </li>
            ))}

            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}