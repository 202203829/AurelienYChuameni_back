"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { fetchMisValoraciones, deleteRating, updateRating } from "@/lib/api";
import { useRouter } from "next/navigation";
import styles from "./valoraciones.module.css";
import Layout from "../componentes/Layout/Layout";

export default function MisValoraciones() {
  const [valoraciones, setValoraciones] = useState([]);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState(1);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const data = await fetchMisValoraciones(token);
        setValoraciones(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar valoraciones.");
      }
    };
    load();
  }, []);

  const handleDelete = async (ratingId) => {
    try {
      const token = getToken();
      if (!token) return;
      await deleteRating(ratingId, token);
      setValoraciones((prev) => prev.filter((v) => v.id !== ratingId));
    } catch (err) {
      console.error("Error al eliminar valoración:", err);
      alert("❌ No se pudo eliminar la valoración.");
    }
  };

  const handleEdit = (id, currentValue) => {
    setEditId(id);
    setEditValue(currentValue);
  };

  const handleSave = async (valoracion) => {
    try {
      const token = getToken();
      if (!token) return;

      await updateRating(valoracion.id, {
        auction: valoracion.auction.id,
        value: editValue,
      }, token);

      setValoraciones((prev) =>
        prev.map((v) =>
          v.id === valoracion.id ? { ...v, value: editValue } : v
        )
      );
      setEditId(null);
    } catch (err) {
      console.error("Error al guardar valoración:", err);
      alert("❌ No se pudo guardar la valoración.");
    }
  };

  return (
    <Layout>
      <div className={styles.wrapper}>
        <h1>⭐ Mis valoraciones</h1>
        {error && <p className={styles.error}>{error}</p>}
        {valoraciones.length === 0 ? (
          <p>No has valorado ninguna subasta.</p>
        ) : (
          valoraciones.map((valoracion) => (
            <div key={valoracion.id} className={styles.card}>
              <a href={`/detalle/${valoracion.auction.id}`} className={styles.cardLink}>
                <h2>{valoracion.auction.title}</h2>
                <p><strong>Precio:</strong> {parseFloat(valoracion.auction.price).toFixed(2)} €</p>
                <p><strong>Categoría:</strong> {valoracion.auction.category?.name || valoracion.auction.category}</p>
                <p><strong>Estado:</strong> {new Date(valoracion.auction.closing_date) > new Date() ? "Abierta" : "Cerrada"}</p>
                <p><strong>Tu valoración:</strong> {valoracion.value} / 5</p>
              </a>
              <div className={styles.cardButtons}>
                <button onClick={() => handleEdit(valoracion.id, valoracion.value)} className={styles.editBtn}>✏️ Editar</button>
                <button onClick={() => handleDelete(valoracion.id)} className={styles.deleteBtn}>🗑️ Eliminar</button>
              </div>
              {editId === valoracion.id && (
                <div className={styles.editForm}>
                  <label>Nueva valoración:</label>
                  <select value={editValue} onChange={(e) => setEditValue(Number(e.target.value))}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                  <button onClick={() => handleSave(valoracion)} className={styles.saveBtn}>💾 Guardar</button>
                  <button onClick={() => setEditId(null)} className={styles.cancelBtn}>❌ Cancelar</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  );
}
