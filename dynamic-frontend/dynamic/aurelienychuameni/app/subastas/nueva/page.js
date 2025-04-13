"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../componentes/Layout/Layout";
import { createAuction, fetchCategories, createCategory } from "@/lib/api";
import { getToken } from "@/lib/auth";
import styles from "./nueva.module.css";

export default function NuevaSubasta() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    rating: 5.0,
    stock: 1,
    brand: "",
    thumbnail: "",
    closing_date: "",
    category: "",
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();

    if (!token) {
      alert("Debes iniciar sesión para crear una subasta");
      router.push("/login");
      return;
    }

    if (categories.length === 0) {
      setError("❌ Espera a que se carguen las categorías antes de enviar.");
      return;
    }

    try {
      // Verificar si ya existe esa categoría (case-insensitive)
      const categoriaExistente = categories.find(
        (cat) => cat.name.toLowerCase() === formData.category.toLowerCase()
      );

      let categoryId = categoriaExistente?.id;

      // Crear categoría si no existe
      if (!categoryId) {
        try {
          const nuevaCat = await createCategory(formData.category, token);
          categoryId = nuevaCat.id;
        } catch (err) {
          console.error("❌ Error al crear categoría:", err);
          setError("❌ La categoría ya existe o no se pudo crear.");
          return;
        }
      }

      // Crear subasta
      try {
        const nuevaSubasta = await createAuction(
          { ...formData, category: categoryId },
          token
        );
        if (nuevaSubasta.id) {
          setMensaje("✅ Subasta creada correctamente");
          router.push(`/detalle/${nuevaSubasta.id}`);
        } else {
          throw nuevaSubasta;
        }
      } catch (err) {
        console.error("❌ Error al crear subasta:", err);
        const errores = Object.entries(err)
          .map(([campo, mensajes]) => `${campo}: ${mensajes.join(", ")}`)
          .join(" | ");
        setError(`❌ Error al crear la subasta: ${errores}`);
      }
    } catch (err) {
      console.error("❌ Error inesperado:", err);
      setError("❌ Error inesperado al crear la subasta.");
    }
  };

  return (
    <Layout>
      <h2 className={styles.title}>Crear nueva subasta</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input name="title" placeholder="Título" onChange={handleChange} required />
        <textarea name="description" placeholder="Descripción" onChange={handleChange} required />
        <input name="price" type="number" placeholder="Precio inicial (€)" onChange={handleChange} required />
        <input name="thumbnail" placeholder="URL de imagen" maxLength="200" onChange={handleChange} required />
        <input name="brand" placeholder="Marca" onChange={handleChange} />
        <input name="stock" type="number" placeholder="Stock" onChange={handleChange} />

        <input
          name="category"
          placeholder="Escribe una categoría"
          onChange={handleChange}
          value={formData.category}
          required
        />

        <input
          name="closing_date"
          type="datetime-local"
          onChange={handleChange}
          required
        />

        <button type="submit">Crear Subasta</button>
        {mensaje && <p className={styles.success}>{mensaje}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </Layout>
  );
}
