"use client";

import Layout from "../componentes/Layout/Layout";
import { useEffect, useState } from "react";
import styles from "./subastas.module.css";
import { fetchAuctions } from "@/lib/api";
import { useSearchParams } from "next/navigation";

const SubastasClient = () => {
  const [subastas, setSubastas] = useState([]);
  const [subastasFiltradas, setSubastasFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [precioMax, setPrecioMax] = useState(100000);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("Todas");
  const [ratingMin, setRatingMin] = useState(0);
  const [categorias, setCategorias] = useState([]);

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query")?.toLowerCase() || "";

  useEffect(() => {
    const fetchAllSubastas = async () => {
      try {
        const data = await fetchAuctions();
        setSubastas(data);
        setSubastasFiltradas(data);

        const categoriasUnicas = [
          ...new Set(
            data
              .map((s) => s.category_data?.name)
              .filter((name) => name !== undefined && name !== null)
          ),
        ];
        setCategorias(categoriasUnicas);
      } catch (error) {
        console.error("Error al obtener subastas:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchAllSubastas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [subastas, precioMax, categoriaSeleccionada, estadoSeleccionado, ratingMin, searchQuery]);

  const aplicarFiltros = () => {
    let filtradas = subastas.filter((s) => {
      const cumplePrecio = s.price <= precioMax;
      const cumpleCategoria =
        categoriaSeleccionada === "Todas" || s.category_data?.name === categoriaSeleccionada;

      const cumpleRating = s.average_rating === null || s.average_rating >= ratingMin;

      const ahora = new Date();
      const cierre = new Date(s.closing_date);
      const estaAbierta = ahora < cierre;

      const cumpleEstado =
        estadoSeleccionado === "Todas" ||
        (estadoSeleccionado === "Abiertas" && estaAbierta) ||
        (estadoSeleccionado === "Cerradas" && !estaAbierta);

      const cumpleBusqueda =
        s.title.toLowerCase().includes(searchQuery) ||
        s.description.toLowerCase().includes(searchQuery);

      return (
        cumplePrecio &&
        cumpleCategoria &&
        cumpleEstado &&
        cumpleRating &&
        cumpleBusqueda
      );
    });

    setSubastasFiltradas(filtradas);
  };

  return (
    <Layout>
      <h1>Subastas disponibles</h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <a href="/subastas/nueva">
          <button className={styles.createButton}>➕ Crear nueva subasta</button>
        </a>
      </div>

      <div className={styles.filters}>
        <div>
          <label>Precio máximo:</label>
          <input
            type="range"
            min="0"
            max="100000"
            value={precioMax}
            onChange={(e) => setPrecioMax(Number(e.target.value))}
          />
          <span>{precioMax}€</span>
        </div>

        <div>
          <label>Categoría:</label>
          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {categorias.map((cat, i) => (
              <option key={i} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Estado:</label>
          <select
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
          >
            <option value="Todas">Todas</option>
            <option value="Abiertas">Abiertas</option>
            <option value="Cerradas">Cerradas</option>
          </select>
        </div>

        <div>
          <label>Valoración mínima:</label>
          <select
            value={ratingMin}
            onChange={(e) => setRatingMin(Number(e.target.value))}
          >
            {[0, 1, 2, 3, 4, 5].map((val) => (
              <option key={val} value={val}>{val} ⭐</option>
            ))}
          </select>
        </div>

        <button onClick={aplicarFiltros}>Aplicar Filtros</button>
      </div>

      <div className={styles.productContainer}>
        {cargando ? (
          <p>Cargando subastas...</p>
        ) : subastasFiltradas.length === 0 ? (
          <p>No hay subastas disponibles con esos filtros.</p>
        ) : (
          subastasFiltradas.map((s) => (
            <div className={styles.productCard} key={s.id}>
              <a href={`/detalle/${s.id}`}>
                <img src={s.thumbnail} alt={s.title} />
                <h2>{s.title}</h2>
                <p>{s.description}</p>
                <p><strong>Precio:</strong> {Number(s.price).toFixed(2)}€</p>
                <p><strong>Categoría:</strong> {s.category_data?.name || "Sin categoría"}</p>
                <p><strong>Rating:</strong> {s.average_rating ?? "N/A"} ⭐</p>
              </a>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default SubastasClient;
