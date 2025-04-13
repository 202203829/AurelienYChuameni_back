"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMyAuctions } from "@/lib/api";
import Layout from "../componentes/Layout/Layout";
import styles from "./page.module.css";

export default function MisSubastas() {
  const [subastas, setSubastas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("❌ No hay token, no se puede pedir mis subastas");
      return;
    }

    fetchMyAuctions(token)
      .then((data) => {
        setSubastas(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error("❌ Error al obtener mis subastas:", error);
        setCargando(false);
      });
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`https://aurelienychuameni-back.onrender.com/api/auctions/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setSubastas((prev) => prev.filter((s) => s.id !== id));
      } else {
        const text = await res.text();
        console.error("❌ Error al eliminar subasta:", text);
      }
    } catch (error) {
      console.error("❌ Error general al eliminar:", error);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Mis Subastas</h1>
        {cargando ? (
          <p>Cargando subastas...</p>
        ) : subastas.length === 0 ? (
          <p>No has creado ninguna subasta.</p>
        ) : (
          <div className={styles.productContainer}>
            {subastas.map((subasta, index) => (
              <div key={`${subasta.id}-${index}`} className={styles.productCard}>
                <a href={`/detalle/${subasta.id}`}>
                  <img src={subasta.thumbnail} alt={subasta.title} />
                  <h2>{subasta.title}</h2>
                  <p>{subasta.description}</p>
                  <p><strong>Precio:</strong> {Number(subasta.price).toFixed(2)}€</p>
                </a>

                <div className={styles.buttonGroup}>
                  <button
                    className={styles.editBtn}
                    onClick={() => router.push(`/subastas/edit/${subasta.id}`)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(subasta.id)}
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
