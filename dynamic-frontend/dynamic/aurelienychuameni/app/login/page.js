"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Layout from "../componentes/Layout/Layout";
import Link from "next/link";
import styles from "./page.module.css";

export default function Inicio() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8000/api/token/",
        {
          username,
          password,
        }
      );

      const accessToken = response.data.access;
      localStorage.setItem("token", accessToken);

      const profileRes = await fetch(
        "http://localhost:8000/api/users/me/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!profileRes.ok) throw new Error("Error al obtener perfil");
      const profileData = await profileRes.json();
      localStorage.setItem("user", JSON.stringify(profileData));

      setLoginError("");
      router.push("/");
    } catch (error) {
      if (error.response?.status === 401) {
        setLoginError("Usuario o contraseña incorrectos.");
      } else {
        console.error("❌ Error inesperado:", error);
        setLoginError("Error al iniciar sesión. Inténtalo más tarde.");
      }
    }
  };

  return (
    <Layout>
      <div className={styles.formulario}>
        <h2 className={styles.titulo}>Formulario de Login</h2>

        <form onSubmit={handleLogin}>
          <div className={styles.mb4}>
            <label htmlFor="usuario">Usuario:</label>
            <input
              type="text"
              id="usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.mb4}>
            <label htmlFor="contraseña">Contraseña:</label>
            <input
              type="password"
              id="contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {loginError && <p className={styles.textRed}>{loginError}</p>}

          <button type="submit" className={styles.boton}>
            Enviar
          </button>
        </form>

        <p>
          ¿No tienes cuenta?{" "}
          <Link href="/registro">
            <span style={{ textDecoration: "underline", color: "purple" }}>
              Regístrate aquí
            </span>
          </Link>
        </p>
      </div>
    </Layout>
  );
}
