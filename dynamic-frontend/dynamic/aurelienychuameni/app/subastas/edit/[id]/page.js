"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/app/componentes/Layout/Layout";
import styles from "./edit.module.css";
import {
  fetchAuction,
  updateAuction,
  fetchCategories,
  createCategory,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function EditSubasta() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    rating: "",
    brand: "",
    thumbnail: "",
    category: "",
    closing_date: "",
  });
  const [originalCategory, setOriginalCategory] = useState(""); // 👈🏼 Guardamos original
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [subasta, cats] = await Promise.all([
          fetchAuction(id),
          fetchCategories(),
        ]);
        setCategories(cats);
        setFormData({
            title: subasta.title || "",
            description: subasta.description || "",
            price: subasta.price || "",
            stock: subasta.stock || "",
            rating: subasta.rating || "",
            brand: subasta.brand || "",
            thumbnail: subasta.thumbnail || "",
            category:
            typeof subasta.category === "object"
                ? subasta.category.name
                : categories.find((c) => c.id === subasta.category)?.name || "",

            closing_date: subasta.closing_date
              ? subasta.closing_date.slice(0, 16)
              : "",
          });
          
          setOriginalCategory(
            typeof subasta.category === "object" ? subasta.category.name : ""
          );
          
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert("No autorizado");

    // Validación mínima
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.stock ||
      !formData.rating ||
      !formData.thumbnail
    ) {
      setError("⚠️ Todos los campos obligatorios deben estar completos.");
      return;
    }

    try {
      let categoryId;

      // Si no ha cambiado la categoría, la mantenemos
      if (formData.category.toLowerCase() === originalCategory.toLowerCase()) {
        const cat = categories.find(
          (c) => c.name.toLowerCase() === originalCategory.toLowerCase()
        );
        categoryId = cat?.id;
      } else {
        const existente = categories.find(
          (c) => c.name.toLowerCase() === formData.category.toLowerCase()
        );
        if (existente) {
          categoryId = existente.id;
        } else {
          const nueva = await createCategory(formData.category, token);
          categoryId = nueva.id;
        }
      }

      const payload = {
        ...formData,
        category: categoryId,
      };

      await updateAuction(id, payload, token);
      router.push("/misSubastas");
    } catch (err) {
      console.error("❌ Error al guardar:", err);
      setError("Error al guardar los cambios.");
    }
  };

  if (loading) return <Layout><p>Cargando datos...</p></Layout>;
  if (error) return <Layout><p className={styles.error}>{error}</p></Layout>;

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Editar Subasta</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>Título:</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Descripción:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
            required
          />

          <label className={styles.label}>Precio:</label>
          <input
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Stock:</label>
          <input
            name="stock"
            type="number"
            value={formData.stock}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Rating:</label>
          <input
            name="rating"
            type="number"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Marca:</label>
          <input
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className={styles.input}
          />

          <label className={styles.label}>Imagen (URL):</label>
          <input
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label className={styles.label}>Categoría:</label>
          <input
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.input}
            placeholder="Introduce la categoría"
            required
          />

          <label className={styles.label}>Fecha de cierre:</label>
          <input
            name="closing_date"
            type="datetime-local"
            value={formData.closing_date || ""}
            onChange={handleChange}
            className={styles.input}
          />

          <button type="submit" className={styles.saveBtn}>
            Guardar Cambios
          </button>
        </form>
      </div>
    </Layout>
  );
}
