'use client'; 
import { useRouter } from 'next/navigation';
import Layout from "../componentes/Layout/Layout";
import styles from './index.module.css';  // Asegúrate de que esta línea esté correcta

export default function Home() {
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    const query = event.target.buscar.value;  // Tomamos el valor del input
    router.push(`/subastas?query=${query}`);  // Redirigimos a subastas con el query
  };

  return (
    <Layout>
      <div className={styles.searchContainer}>
        <label className={styles.bigLabel} htmlFor="buscar">Pon lo que buscas… y prepárate para la guerra.</label>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="buscar" 
            placeholder="Buscar..." 
            className={styles.inputField}  // Añadir clase si no lo has hecho
          />
          <button type="submit" className={styles.searchButton}>Buscar</button>
        </form>
      </div>
    </Layout>
  );
}
