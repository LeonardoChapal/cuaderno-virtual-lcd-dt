import authorData from '@/data/author.json';
import styles from './page.module.scss';

export default function AboutPage() {
    return (
        <div className={styles.aboutPage}>
            <div className="container">
                <div className={styles.profile}>
                    <div className={styles.avatar}>
                        {authorData.name.charAt(0)}
                    </div>
                    <div className={styles.info}>
                        <h1 className={styles.name}>{authorData.name}</h1>
                        <p className={styles.role}>{authorData.role}</p>
                        <p className={styles.bio}>{authorData.bio}</p>
                        <div className={styles.details}>
                            <span>📍 {authorData.location}</span>
                            <span>🎓 {authorData.education}</span>
                        </div>
                    </div>
                </div>

                <section className={styles.section}>
                    <h2>Habilidades</h2>
                    <div className={styles.skills}>
                        {authorData.skills.map((skill) => (
                            <span key={skill} className={styles.skill}>{skill}</span>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Contacto</h2>
                    <div className={styles.social}>
                        <a href={authorData.social.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                        <a href={authorData.social.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    </div>
                </section>
            </div>
        </div>
    );
}