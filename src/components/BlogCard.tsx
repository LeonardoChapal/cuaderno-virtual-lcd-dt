import Link from 'next/link';
import Image from 'next/image';
import styles from './BlogCard.module.scss';

interface BlogCardProps {
    title: string;
    excerpt: string;
    slug: string;
    date: string;
    category: string;
    readTime: string;
    author?: string;
    image?: string;
    tags?: string[];
}

// Iconos según categoría
const categoryIcons: Record<string, string> = {
    'Fundamentación Tecnológica': '🧭',
    'Diseño Aplicado': '✏️',
    'Apuntes': '📝',
    'Investigaciones': '🔬',
    'Planchas': '📐',
    'Ejercicios': '✏️',
    'Exámenes': '📄',
};

// Clase de gradiente según categoría
const categoryClasses: Record<string, string> = {
    'Fundamentación Tecnológica': 'cardFundamentacion',
    'Diseño Aplicado': 'cardDiseno',
};

export default function BlogCard({ title, excerpt, slug, date, category, readTime, author, image, tags }: BlogCardProps) {
    const icon = categoryIcons[category] || '📌';
    const cardVariant = categoryClasses[category] || '';

    return (
        <article className={`${styles.card} ${cardVariant ? styles[cardVariant] : ''}`}>
            {image && (
                <div className={styles.imageWrapper}>
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
            )}

            <div className={styles.body}>
                <div className={styles.header}>
                    <span className={styles.category}>
                        <span className={styles.categoryIcon}>{icon}</span>
                        {category}
                    </span>
                    <span className={styles.readTime}>{readTime}</span>
                </div>

                <h3 className={styles.title}>
                    <Link href={`/blog/${slug}`}>
                        {title}
                    </Link>
                </h3>

                <p className={styles.excerpt}>{excerpt}</p>

                {tags && tags.length > 0 && (
                    <div className={styles.tags}>
                        {tags.map((tag) => (
                            <span key={tag} className={styles.tag}>{tag}</span>
                        ))}
                    </div>
                )}

                <div className={styles.footer}>
                    <div className={styles.meta}>
                        <time className={styles.date}>{new Date(date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</time>
                        {author && <span className={styles.author}>· {author}</span>}
                    </div>

                    <Link href={`/blog/${slug}`} className={styles.readMore}>
                        Leer más <span className={styles.arrow}>→</span>
                    </Link>
                </div>
            </div>
        </article>
    );
}