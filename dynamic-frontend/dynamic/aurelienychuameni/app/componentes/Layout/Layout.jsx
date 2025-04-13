'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';
import { getToken, removeToken } from '@/lib/auth';

const Layout = ({ children, showSearch = true }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener("authChanged", checkAuth);
    return () => window.removeEventListener("authChanged", checkAuth);
  }, []);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const handleLogout = () => {
    removeToken();
    window.dispatchEvent(new Event("authChanged"));
    setShowDropdown(false);
    router.push("/");
  };

  const goTo = (path) => {
    setShowDropdown(false);
    router.push(path);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/subastas?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.menu}>
          <ul className={styles.navList}>
            <li className={styles.leftSection}>
              <Link href="/">
                <img src="/tchouameni.jpg" alt="Tchouameni" className={styles.logo} />
              </Link>
              {showSearch && (
                <form onSubmit={handleSearch} className={styles.searchForm}>
                  <input
                    type="text"
                    name="buscar"
                    placeholder="Buscar productos..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </form>
              )}
            </li>

            <li className={styles.middle}>
              <h1>Subasta Aurélien y Tchouameni</h1>
            </li>

            <li className={styles.rightSection}>
              {isAuthenticated ? (
                <>
                  <div className={styles.dropdown}>
                    <button onClick={toggleDropdown} className={styles.btn}>
                      Mi Perfil ⯆
                    </button>
                    {showDropdown && (
                      <div className={styles.dropdownContent}>
                        <button onClick={() => goTo("/usuario")}>👤 Mi perfil</button>
                        <button onClick={() => goTo("/misSubastas")}>📦 Mis subastas</button>
                        <button onClick={() => goTo("/misPujas")}>💰 Mis pujas</button>
                      </div>
                    )}
                  </div>
                  <button onClick={handleLogout} className={styles.btn}>Logout</button>
                </>
              ) : (
                <>
                  <Link href="/registro" className={styles.btn}>Registro</Link>
                  <Link href="/login" className={styles.btn}>Login</Link>
                </>
              )}
            </li>
          </ul>
        </nav>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>Creado por Álvaro Fernández y Pablo Bilbao - 2025</p>
      </footer>
    </div>
  );
};

export default Layout;
