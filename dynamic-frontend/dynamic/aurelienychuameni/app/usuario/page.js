"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "../componentes/Layout/Layout";
import styles from "./usuario.module.css";
import { getProfile } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";

export default function Usuario() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.warn("No se encontró token, redirigiendo a login.");
      router.push("/login");
      return;
    }

    getProfile(token)
      .then((data) => {
        if (data.username) {
          setUserData(data);
        } else {
          throw new Error("No se pudieron obtener los datos del usuario");
        }
      })
      .catch((err) => {
        console.error("Error al obtener perfil:", err);
        removeToken();
        router.push("/login");
      });
  }, [router]);

  const handleLogout = () => {
    removeToken();
    window.dispatchEvent(new Event("logout"));
    router.push("/login");
  };

  if (!userData) {
    return (
      <Layout>
        <main className={styles.usuario}>
          <h1>Cargando datos de usuario...</h1>
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className={styles.usuario}>
        <h1>Perfil de Usuario</h1>
        <p><strong>Usuario:</strong> {userData.username}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Fecha de nacimiento:</strong> {userData.birth_date}</p>
        <p><strong>Localidad:</strong> {userData.locality}</p>
        <p><strong>Municipio:</strong> {userData.municipality}</p>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar sesión
        </button>
      </main>
    </Layout>
  );
}
