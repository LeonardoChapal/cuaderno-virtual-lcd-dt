import { notFound } from 'next/navigation';
import Link from 'next/link';
import postsData from '@/data/posts.json';
import styles from './page.module.scss';

export async function generateStaticParams() {
    return postsData.map((post) => ({
        slug: post.slug,
    }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = postsData.find((p) => p.slug === slug);

    if (!post) notFound();
    if (!post) return null;

    return (
        <div className={styles.postPage}>
            <div className="container">
                <Link href="/blog" className={styles.back}>
                    ← Volver a apuntes
                </Link>

                <header className={styles.header}>
                    <span className={styles.category}>{post.category}</span>
                    <h1 className={styles.title}>{post.title}</h1>
                    <div className={styles.meta}>
                        <span>{post.author}</span>
                        <span>·</span>
                        <time>{new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                        <span>·</span>
                        <span>{post.readTime} de lectura</span>
                    </div>
                </header>

                <article className={styles.content}>
                    <p>{post.content}</p>
                </article>
            </div>
        </div>
    );
}