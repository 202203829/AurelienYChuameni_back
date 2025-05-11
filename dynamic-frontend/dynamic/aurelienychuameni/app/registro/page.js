"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../componentes/Layout/Layout";
import Link from "next/link";
import styles from './registro.module.css';
import { registerUser } from "@/lib/api";
import { saveToken } from "@/lib/auth";

const comunidadesData = [
  { nombre: "Andalucía", provincias: ["Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla"] },
  { nombre: "Aragón", provincias: ["Huesca", "Teruel", "Zaragoza"] },
  { nombre: "Asturias", provincias: ["Asturias"] },
  { nombre: "Islas Baleares", provincias: ["Islas Baleares"] },
  { nombre: "Canarias", provincias: ["Las Palmas", "Santa Cruz de Tenerife"] },
  { nombre: "Cantabria", provincias: ["Cantabria"] },
  { nombre: "Castilla-La Mancha", provincias: ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"] },
  { nombre: "Castilla y León", provincias: ["Ávila", "Burgos", "León", "Palencia", "Salamanca", "Segovia", "Soria", "Valladolid", "Zamora"] },
  { nombre: "Cataluña", provincias: ["Barcelona", "Girona", "Lleida", "Tarragona"] },
  { nombre: "Extremadura", provincias: ["Badajoz", "Cáceres"] },
  { nombre: "Galicia", provincias: ["A Coruña", "Lugo", "Ourense", "Pontevedra"] },
  { nombre: "Madrid", provincias: ["Madrid"] },
  { nombre: "Murcia", provincias: ["Murcia"] },
  { nombre: "Navarra", provincias: ["Navarra"] },
  { nombre: "La Rioja", provincias: ["La Rioja"] },
  { nombre: "País Vasco", provincias: ["Álava", "Bizkaia", "Gipuzkoa"] },
  { nombre: "Comunidad Valenciana", provincias: ["Alicante", "Castellón", "Valencia"] },
  { nombre: "Ceuta", provincias: ["Ceuta"] },
  { nombre: "Melilla", provincias: ["Melilla"] }
];

function Registro() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    locality: "",
    municipality: "",
    dni: "" 
  });

  const [comunidad, setComunidad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [dniError, setDniError] = useState("");
  const [ageError, setAgeError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleComunidadChange = (e) => {
    const selectedComunidad = e.target.value;
    setComunidad(selectedComunidad);
    setProvincia(""); 
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    validatePassword(newPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setPasswordMatchError(confirmPassword !== formData.password ? "Las contraseñas no coinciden" : "");
  };

  const handleDniChange = (e) => {
    const dni = e.target.value;
    setFormData({ ...formData, dni });
    validateDni(dni);
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData({ ...formData, birth_date: selectedDate });
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("Debe tener al menos 8 caracteres.");
    if (!/[A-Z]/.test(password)) errors.push("Debe contener una letra mayúscula.");
    if (!/[a-z]/.test(password)) errors.push("Debe contener una letra minúscula.");
    if (!/[0-9]/.test(password)) errors.push("Debe contener un número.");
    if (!/[@#$%^&()_+!¡¿?]/.test(password)) errors.push("Debe contener un carácter especial (@#$%^&...).");
    setPasswordErrors(errors);
  };

  const validateDni = (dni) => {
    const dniPattern = /^\d{8}[A-Za-z]$/;
    setDniError(!dniPattern.test(dni) ? "El DNI debe tener 8 números seguidos de una letra." : "");
  };

  const calculateAge = (birthDate) => {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const age = calculateAge(formData.birth_date);

    if (age < 18) {
      setAgeError("Debes ser mayor de 18 años para registrarte.");
      return;
    } else {
      setAgeError("");
    }

    const dataToSend = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      birth_date: formData.birth_date,
      locality: comunidad,
      municipality: provincia,
    };

    try {
      const response = await registerUser(dataToSend);

      if (response.access) {
        saveToken(response.access);
        router.push("/");
      } else if (response.email || response.username) {
        setPasswordMatchError("El usuario o email ya existen. Prueba a iniciar sesión.");
      } else {
        console.error("Respuesta inesperada en registro:", response);
        setPasswordMatchError("Ha ocurrido un error desconocido.");
      }
    } catch (error) {
      console.error("❌ Error en el registro:", error);
      setPasswordMatchError("No se pudo completar el registro. Inténtalo más tarde.");
    }
  };

  return (
    <Layout>
      <h2 className={styles.titulo}>Formulario de Registro</h2>
      <form className={styles.formulario} onSubmit={handleRegister}>
        <label htmlFor="first_name">Nombre:</label>
        <input className={styles.input} type="text" name="first_name" onChange={handleChange} required /><br /><br />

        <label htmlFor="last_name">Apellidos:</label>
        <input className={styles.input} type="text" name="last_name" onChange={handleChange} required /><br /><br />

        <label htmlFor="birth_date">Fecha de Nacimiento:</label>
        <input className={styles.input} type="date" name="birth_date" value={formData.birth_date} onChange={handleDateChange} required /><br /><br />
        {ageError && <p className={styles.textRed}>{ageError}</p>}

        <label htmlFor="email">Email:</label>
        <input className={styles.input} type="email" name="email" onChange={handleChange} required /><br /><br />

        <label htmlFor="username">Usuario:</label>
        <input className={styles.input} type="text" name="username" onChange={handleChange} required /><br /><br />

        <label htmlFor="password">Contraseña:</label>
        <input className={styles.input} type="password" name="password" onChange={handlePasswordChange} required /><br /><br />
        {passwordErrors.length > 0 && (
          <ul className={styles.textRed}>
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}

        <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
        <input className={styles.input} type="password" name="confirmPassword" onChange={handleConfirmPasswordChange} required /><br /><br />
        {passwordMatchError && <p className={styles.textRed}>{passwordMatchError}</p>}

        <label htmlFor="dni">DNI:</label>
        <input className={styles.input} type="text" name="dni" value={formData.dni} onChange={handleDniChange} required /><br />
        {dniError && <p className={styles.textRed}>{dniError}</p>}
        <br />

        <div className={styles.mb4}>
          <label>Comunidad Autónoma</label>
          <select className={styles.input} value={comunidad} onChange={handleComunidadChange}>
            <option value="" disabled>Selecciona una Comunidad</option>
            {comunidadesData.map((com) => (
              <option key={com.nombre} value={com.nombre}>{com.nombre}</option>
            ))}
          </select>
        </div>

        <div className={styles.mb4}>
          <label>Provincia</label>
          <select className={styles.input} value={provincia} onChange={(e) => setProvincia(e.target.value)} disabled={!comunidad}>
            <option value="" disabled>Selecciona una Provincia</option>
            {comunidad &&
              comunidadesData.find((com) => com.nombre === comunidad)?.provincias.map((prov) => (
                <option key={prov} value={prov}>{prov}</option>
              ))}
          </select>
        </div>

        <button className={styles.boton} type="submit" disabled={
          passwordErrors.length > 0 || passwordMatchError || dniError || ageError
        }>
          Registrarse
        </button>
      </form>

      <p>¿Ya tienes cuenta? <Link href="/login">Pincha aquí</Link></p>
    </Layout>
  );
}

export default Registro;
