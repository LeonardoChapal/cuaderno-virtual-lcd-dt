'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Header.module.scss';

const links = [
    { href: '/', label: 'Inicio' },
    { href: '/blog', label: 'Apuntes' },
    { href: '/about', label: 'Sobre Mí' },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    return (
        <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <h1>Cuaderno Virtual</h1>
                </Link>

                <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}>
                    {links.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${styles.navLink} ${pathname === href ? styles.active : ''}`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <button
                    className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Abrir menú"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        </header>
    );
}