"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/app/componentes/Layout/Layout";
import styles from "./editarPuja.module.css";
import {
  fetchMyBids,
  updateBid,
  fetchAuction,
  fetchBidsByAuction,
  updateAuction
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function EditarPuja() {
  const { id } = useParams();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [auctionId, setAuctionId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    fetchMyBids(token)
      .then((data) => {
        const bid = data.find((b) => b.id === parseInt(id));
        if (bid) {
          setAmount(bid.amount);
          setAuctionId(bid.auction_id);
        } else {
          setError("❌ Puja no encontrada");
        }
      })
      .catch(() => setError("Error al cargar la puja"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !auctionId) return;

    try {
      const payload = { amount, auction: auctionId };
      await updateBid(id, payload, token);

      const allBids = await fetchBidsByAuction(auctionId);
      const maxBid = Math.max(...allBids.map((b) => b.amount));

      const auction = await fetchAuction(auctionId);
      if (maxBid > auction.price) {
        await updateAuction(auctionId, { ...auction, price: maxBid }, token);
      }

      router.push("/misPujas");
    } catch (err) {
      console.error("Error al editar puja:", err);
      setError("Error al editar la puja");
    }
  };

  if (loading) return <Layout><p>Cargando puja...</p></Layout>;
  if (error) return <Layout><p>{error}</p></Layout>;

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Editar Puja</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Cantidad:</label>
          <input
            className={styles.input}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className={styles.buttons}>
            <button type="submit" className={styles.saveBtn}>💾 Guardar Cambios</button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => router.push("/misPujas")}
            >
              ❌ Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
