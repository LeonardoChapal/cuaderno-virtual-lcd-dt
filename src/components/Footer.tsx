import Link from 'next/link';
import styles from './Footer.module.scss';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3>Cuaderno Virtual</h3>
                        <p>Apuntes, planchas e investigaciones de la especialidad de Dibujo Técnico — ITSIM, Pasto.</p>
                    </div>

                    <div className={styles.section}>
                        <h4>Enlaces</h4>
                        <nav className={styles.links}>
                            <Link href="/">Inicio</Link>
                            <Link href="/blog">Apuntes</Link>
                            <Link href="/about">Sobre Mí</Link>
                        </nav>
                    </div>

                    <div className={styles.section}>
                        <h4>Contacto</h4>
                        <div className={styles.social}>
                            <a href="https://github.com/WilmerBotina132" target="_blank" rel="noopener noreferrer">
                                GitHub
                            </a>
                            <a href="https://wa.me/57XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {currentYear} Wilmer Andrey Botina Ortiz. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}