// app/subastas/SubastasClient.jsx
"use client";

import Layout from "../componentes/Layout/Layout";
import { useEffect, useState } from "react";
import styles from "./subastas.module.css";
import { fetchAuctions } from "@/lib/api";
import { useSearchParams } from "next/navigation";

const SubastasClient = () => {
  const [subastas, setSubastas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [precioMax, setPrecioMax] = useState(100000);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [subastasFiltradas, setSubastasFiltradas] = useState([]);
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
  }, [subastas, precioMax, categoriaSeleccionada, searchQuery]);

  const aplicarFiltros = () => {
    let filtradas = subastas.filter(
      (s) =>
        s.price <= precioMax &&
        (categoriaSeleccionada === "Todas" || s.category_data?.name === categoriaSeleccionada)
    );

    if (searchQuery) {
      filtradas = filtradas.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery) ||
          s.description.toLowerCase().includes(searchQuery)
      );
    }

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
          <label htmlFor="precio">Precio máximo:</label>
          <input
            type="range"
            id="precio"
            min="0"
            max="100000"
            value={precioMax}
            onChange={(e) => setPrecioMax(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #ff6600 0%, #ff6600 ${precioMax / 1000}% , #ddd ${precioMax / 1000}% , #ddd 100%)`,
            }}
          />
          <span>{precioMax}€</span>
        </div>

        <div>
          <label htmlFor="categoria">Categoría:</label>
          <select
            id="categoria"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="Todas">Todas</option>
            {categorias.map((cat, index) => (
              <option key={`${cat}-${index}`} value={cat}>
                {cat}
              </option>
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
          subastasFiltradas.map((subasta) => (
            <div className={styles.productCard} key={subasta.id}>
              <a href={`/detalle/${subasta.id}`}>
                <img src={subasta.thumbnail} alt={subasta.title} />
                <h2>{subasta.title}</h2>
                <p>{subasta.description}</p>
                <p>
                  <strong>Precio:</strong>{" "}
                  {Number(subasta.price).toFixed(2)}€
                </p>
                <p>
                  <strong>Categoría:</strong>{" "}
                  {subasta.category_data?.name || "Sin categoría"}
                </p>
              </a>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default SubastasClient;
