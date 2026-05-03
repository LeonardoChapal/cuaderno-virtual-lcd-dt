'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Stats.module.scss';

interface Stat {
    icon: string;
    value: number;
    label: string;
}

export default function Stats({ stats }: { stats: Stat[] }) {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className={styles.stats}>
            <div className="container">
                <div className={styles.grid}>
                    {stats.map((stat, i) => (
                        <div key={stat.label} className={styles.card} style={{ animationDelay: `${i * 0.1}s` }}>
                            <div className={styles.icon}>{stat.icon}</div>
                            <div className={styles.value}>
                                {visible ? <Counter end={stat.value} /> : 0}
                            </div>
                            <div className={styles.label}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Counter({ end }: { end: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 1200;
        const steps = 30;
        const increment = end / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [end]);

    return <>{count}</>;
}