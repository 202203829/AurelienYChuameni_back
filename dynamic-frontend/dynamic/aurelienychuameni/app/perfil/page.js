"use client";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import Layout from "../componentes/Layout/Layout";
import { fetchUserProfile } from "@/lib/api";

export default function Perfil() {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("🟡 Token desde localStorage:", token); // debug

    if (!token) {
      setError("No estás autenticado.");
      return;
    }

    fetchUserProfile(token)
      .then((data) => setUserData(data))
      .catch((err) => {
        console.error("❌ Error al cargar perfil:", err);
        setError("No se pudo cargar el perfil.");
      });
  }, []);

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Mi Perfil</h1>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : userData ? (
          <ul className={styles.userDataList}>
            <li><strong>Usuario:</strong> {userData.username}</li>
            <li><strong>Email:</strong> {userData.email}</li>
            <li><strong>Nombre:</strong> {userData.first_name}</li>
            <li><strong>Apellidos:</strong> {userData.last_name}</li>
          </ul>
        ) : (
          <p>Cargando datos...</p>
        )}
      </div>
    </Layout>
  );
}
