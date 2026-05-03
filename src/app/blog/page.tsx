'use client';

import { useState } from 'react';
import BlogCard from '@/components/BlogCard';
import postsData from '@/data/posts.json';
import styles from './page.module.scss';

const ALL = 'Todos';

export default function BlogPage() {
    const categories = [ALL, ...Array.from(new Set(postsData.map((p) => p.category)))];
    const [selected, setSelected] = useState(ALL);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;

    const filtered = selected === ALL ? postsData : postsData.filter((p) => p.category === selected);
    const totalPages = Math.ceil(filtered.length / postsPerPage);
    const paginated = filtered.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

    const handleCategory = (cat: string) => {
        setSelected(cat);
        setCurrentPage(1);
    };

    return (
        <div className={styles.blogPage}>
            <div className="container">
                <header className={styles.header}>
                    <h1>Apuntes</h1>
                    <p>Fundamentación Tecnológica · Diseño Aplicado</p>
                </header>

                <div className={styles.filters}>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            className={`${styles.filterBtn} ${selected === cat ? styles.active : ''}`}
                            onClick={() => handleCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className={styles.postsGrid}>
                    {paginated.map((post) => (
                        <BlogCard
                            key={post.id}
                            title={post.title}
                            excerpt={post.excerpt}
                            slug={post.slug}
                            date={post.date}
                            category={post.category}
                            readTime={post.readTime}
                        />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            disabled={currentPage === 1}
                        >
                            ← Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}