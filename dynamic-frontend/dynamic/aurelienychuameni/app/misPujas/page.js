"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMyBids, deleteBid } from "@/lib/api";
import Layout from "../componentes/Layout/Layout";
import styles from "./page.module.css";
import Link from "next/link";

export default function MisPujas() {
  const [pujas, setPujas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchMyBids(token)
      .then((data) => {
        setPujas(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("❌ Error al obtener mis pujas:", error);
        setCargando(false);
      });
  }, []);

  const eliminarPuja = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await deleteBid(id, token);
      setPujas((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar puja:", err.message);
    }
  };
  
  

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Mis Pujas</h1>
        {cargando ? (
          <p>Cargando pujas...</p>
        ) : pujas.length === 0 ? (
          <p>No has realizado ninguna puja.</p>
        ) : (
          <div className={styles.productContainer}>
            {pujas.map((puja, index) => (
              <div key={`${puja.id}-${index}`} className={styles.productCard}>
                <Link href={`/detalle/${puja.auction_id}`} className={styles.link}>
                  <img
                    src={puja.auction_thumbnail}
                    alt={puja.auction_title}
                    className={styles.thumbnail}
                  />
                  <h2>{puja.auction_title || "Subasta"}</h2>
                </Link>

                <p>
                  <strong>Importe de la puja:</strong>{" "}
                  {Number(puja.amount).toFixed(2)}€
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(puja.timestamp).toLocaleString()}
                </p>

                <div className={styles.buttonContainer}>
                <button
                  onClick={() => router.push(`/editarPuja/${puja.id}`)}
                  className={styles.editButton}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => eliminarPuja(puja.id)}
                  className={styles.deleteButton}
                >
                  🗑 Eliminar
                </button>
              </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
