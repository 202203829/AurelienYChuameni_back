"use client";

import Layout from "./componentes/Layout/Layout";
import styles from './componentes/Layout/styles.module.css';
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/subastas?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <Layout>
      <label className={styles.bigLabel} htmlFor="buscar">
        Pon lo que buscas… y prepárate para la guerra.
      </label>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Buscar..."
          name="buscar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Buscar</button>
      </form>
    </Layout>
  );
}
