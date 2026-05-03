'use client';

import styles from './TechnicalDrawing.module.scss';

export default function TechnicalDrawing() {
    return (
        <div className={styles.wrapper}>
            <svg
                viewBox="0 0 600 600"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.svg}
            >
                {/* ============================================ */}
                {/* VISTA FRONTAL (arriba izquierda)            */}
                {/* ============================================ */}
                <g className={styles.frontView}>
                    {/* Contorno de la pieza en T invertida con corte */}
                    <path
                        d="M 60 100 L 60 160 L 110 160 L 110 80 L 200 80 L 200 160 L 250 160 L 250 100 L 60 100 Z"
                        fill="none"
                        stroke="#0d9488"
                        strokeWidth="2"
                    />
                    {/* Línea de corte vertical interna izquierda */}
                    <line x1="155" y1="80" x2="155" y2="160" stroke="#0d9488" strokeWidth="1.5" />
                    {/* Detalle del escalón superior (la T) */}
                    <line x1="110" y1="100" x2="155" y2="100" stroke="#0d9488" strokeWidth="1.5" />
                    {/* Líneas de eje */}
                    <line x1="50" y1="120" x2="260" y2="120" stroke="#0d9488" strokeWidth="0.7" strokeDasharray="8 2 1 2" />
                    <line x1="155" y1="65" x2="155" y2="170" stroke="#0d9488" strokeWidth="0.7" strokeDasharray="8 2 1 2" />
                </g>

                {/* Rayado de corte (líneas diagonales que indican sección) */}
                <g className={styles.hatchFront}>
                    <defs>
                        <pattern id="hatch1" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="6" stroke="#0d9488" strokeWidth="0.6" opacity="0.6" />
                        </pattern>
                    </defs>
                    <path
                        d="M 155 100 L 155 160 L 200 160 L 200 80 L 200 80 L 155 80 L 155 100 Z M 155 100 L 200 100 L 200 80"
                        fill="url(#hatch1)"
                    />
                </g>

                {/* Cota 90 abajo */}
                <g className={styles.dim1}>
                    <line x1="60" y1="195" x2="250" y2="195" stroke="#0f766e" strokeWidth="1" />
                    <line x1="60" y1="190" x2="60" y2="200" stroke="#0f766e" strokeWidth="1.5" />
                    <line x1="250" y1="190" x2="250" y2="200" stroke="#0f766e" strokeWidth="1.5" />
                    <text x="155" y="212" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="600">90</text>
                </g>

                {/* Cota 50 arriba */}
                <g className={styles.dim1}>
                    <line x1="110" y1="55" x2="200" y2="55" stroke="#0f766e" strokeWidth="1" />
                    <line x1="110" y1="50" x2="110" y2="60" stroke="#0f766e" strokeWidth="1.5" />
                    <line x1="200" y1="50" x2="200" y2="60" stroke="#0f766e" strokeWidth="1.5" />
                    <text x="155" y="47" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="600">50</text>
                </g>

                {/* Cota 10 (parte interna) */}
                <g className={styles.dim1}>
                    <line x1="155" y1="35" x2="200" y2="35" stroke="#0f766e" strokeWidth="1" />
                    <line x1="155" y1="30" x2="155" y2="40" stroke="#0f766e" strokeWidth="1.5" />
                    <line x1="200" y1="30" x2="200" y2="40" stroke="#0f766e" strokeWidth="1.5" />
                    <text x="178" y="27" textAnchor="middle" fill="#0f766e" fontSize="11" fontWeight="600">10</text>
                </g>

                {/* ============================================ */}
                {/* VISTA LATERAL (arriba derecha)              */}
                {/* ============================================ */}
                <g className={styles.sideView}>
                    {/* Base inferior */}
                    <rect x="350" y="160" width="120" height="25" fill="none" stroke="#10b981" strokeWidth="2" />
                    {/* Cuerpo vertical */}
                    <rect x="370" y="80" width="80" height="80" fill="none" stroke="#10b981" strokeWidth="2" />
                    {/* Curva superior — el "ojo" del soporte */}
                    <path
                        d="M 370 80 Q 410 30 450 80"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                    />
                    {/* Círculo del agujero (Ø20) */}
                    <circle cx="410" cy="80" r="18" fill="none" stroke="#10b981" strokeWidth="2" />
                    {/* Líneas de eje */}
                    <line x1="385" y1="80" x2="435" y2="80" stroke="#10b981" strokeWidth="0.7" strokeDasharray="8 2 1 2" />
                    <line x1="410" y1="55" x2="410" y2="190" stroke="#10b981" strokeWidth="0.7" strokeDasharray="8 2 1 2" />
                </g>

                {/* Cota Ø20 con flecha diagonal */}
                <g className={styles.dim2}>
                    <line x1="410" y1="80" x2="500" y2="35" stroke="#0f766e" strokeWidth="1" />
                    <text x="505" y="32" fill="#0f766e" fontSize="12" fontWeight="600">⌀20</text>
                </g>

                {/* Cota R20 (radio del arco) */}
                <g className={styles.dim2}>
                    <line x1="410" y1="55" x2="540" y2="60" stroke="#0f766e" strokeWidth="1" />
                    <text x="545" y="63" fill="#0f766e" fontSize="12" fontWeight="600">R20</text>
                </g>

                {/* Cota 40 vertical */}
                <g className={styles.dim2}>
                    <line x1="335" y1="80" x2="335" y2="160" stroke="#0f766e" strokeWidth="1" />
                    <line x1="330" y1="80" x2="340" y2="80" stroke="#0f766e" strokeWidth="1.5" />
                    <line x1="330" y1="160" x2="340" y2="160" stroke="#0f766e" strokeWidth="1.5" />
                    <text x="325" y="123" textAnchor="end" fill="#0f766e" fontSize="12" fontWeight="600">40</text>
                </g>

                {/* Cota 30 vertical (parte derecha) */}
                <g className={styles.dim2}>
                    <line x1="490" y1="80" x2="490" y2="160" stroke="#0f766e" strokeWidth="1" />
                    <line x1="485" y1="80" x2="495" y2="80" stroke="#0f766e" strokeWidth="1.5" />
                    <line x1="485" y1="160" x2="495" y2="160" stroke="#0f766e" strokeWidth="1.5" />
                    <text x="498" y="123" fill="#0f766e" fontSize="12" fontWeight="600">30</text>
                </g>

                {/* Cota 10 (base) */}
                <g className={styles.dim2}>
                    <line x1="335" y1="160" x2="335" y2="185" stroke="#0f766e" strokeWidth="1" />
                    <line x1="330" y1="160" x2="340" y2="160" stroke="#0f766e" strokeWidth="1.5" />
                    <line x1="330" y1="185" x2="340" y2="185" stroke="#0f766e" strokeWidth="1.5" />
                    <text x="325" y="177" textAnchor="end" fill="#0f766e" fontSize="11" fontWeight="600">10</text>
                </g>

                {/* ============================================ */}
                {/* VISTA SUPERIOR (abajo izquierda)            */}
                {/* ============================================ */}
                <g className={styles.topView}>
                    {/* Contorno alargado */}
                    <rect x="60" y="290" width="200" height="60" fill="none" stroke="#14b8a6" strokeWidth="2" />
                    {/* Líneas internas que indican el escalón */}
                    <line x1="100" y1="290" x2="100" y2="350" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="220" y1="290" x2="220" y2="350" stroke="#14b8a6" strokeWidth="1.5" />
                    {/* Agujero izquierdo (Ø10) */}
                    <circle cx="90" cy="320" r="9" fill="none" stroke="#14b8a6" strokeWidth="2" />
                    {/* Agujero derecho (Ø10) */}
                    <circle cx="230" cy="320" r="9" fill="none" stroke="#14b8a6" strokeWidth="2" />
                    {/* Líneas de eje */}
                    <line x1="50" y1="320" x2="270" y2="320" stroke="#14b8a6" strokeWidth="0.7" strokeDasharray="8 2 1 2" />
                    <line x1="90" y1="305" x2="90" y2="335" stroke="#14b8a6" strokeWidth="0.7" strokeDasharray="8 2 1 2" />
                    <line x1="230" y1="305" x2="230" y2="335" stroke="#14b8a6" strokeWidth="0.7" strokeDasharray="8 2 1 2" />
                </g>

                {/* Cota 70 (entre agujeros) */}
                <g className={styles.dim3}>
                    <line x1="90" y1="385" x2="230" y2="385" stroke="#0f766e" strokeWidth="1" />
                    <line x1="90" y1="380" x2="90" y2="390" stroke="#0f766e" strokeWidth="1.5" />
                    <line x1="230" y1="380" x2="230" y2="390" stroke="#0f766e" strokeWidth="1.5" />
                    <text x="160" y="402" textAnchor="middle" fill="#0f766e" fontSize="12" fontWeight="600">70</text>
                </g>

                {/* Cota Ø10 con línea diagonal hacia agujero derecho */}
                <g className={styles.dim3}>
                    <line x1="230" y1="320" x2="295" y2="365" stroke="#0f766e" strokeWidth="1" />
                    <text x="298" y="370" fill="#0f766e" fontSize="12" fontWeight="600">⌀10</text>
                </g>

                {/* Cota 40 vertical (alto) */}
                <g className={styles.dim3}>
                    <line x1="35" y1="290" x2="35" y2="350" stroke="#0f766e" strokeWidth="1" />
                    <line x1="30" y1="290" x2="40" y2="290" stroke="#0f766e" strokeWidth="1.5" />
                    <line x1="30" y1="350" x2="40" y2="350" stroke="#0f766e" strokeWidth="1.5" />
                    <text x="25" y="323" textAnchor="end" fill="#0f766e" fontSize="12" fontWeight="600">40</text>
                </g>

                {/* Cota 20 (subnivel) */}
                <g className={styles.dim3}>
                    <line x1="35" y1="305" x2="35" y2="335" stroke="#0f766e" strokeWidth="1" />
                    <text x="48" y="324" fill="#0f766e" fontSize="11" fontWeight="600">20</text>
                </g>

                {/* ============================================ */}
                {/* VISTA ISOMÉTRICA (abajo derecha)            */}
                {/* ============================================ */}
                <g className={styles.isoView}>
                    {/* Base trasera */}
                    <path
                        d="M 380 360 L 480 320 L 540 350 L 440 390 Z"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1.8"
                    />
                    {/* Cara frontal vertical */}
                    <path
                        d="M 380 360 L 440 390 L 440 460 L 380 430 Z"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1.8"
                    />
                    {/* Cara lateral derecha */}
                    <path
                        d="M 440 390 L 540 350 L 540 420 L 440 460 Z"
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="1.8"
                    />
                    {/* Cilindro superior (el ojo en isométrica) */}
                    <ellipse cx="460" cy="335" rx="20" ry="8" fill="none" stroke="#0f766e" strokeWidth="1.8" />
                    <ellipse cx="460" cy="335" rx="10" ry="4" fill="none" stroke="#0f766e" strokeWidth="1.5" />
                    {/* Línea cilindro arriba */}
                    <line x1="440" y1="335" x2="440" y2="365" stroke="#0f766e" strokeWidth="1.8" />
                    <line x1="480" y1="335" x2="480" y2="365" stroke="#0f766e" strokeWidth="1.8" />
                    {/* Detalle interno del agujero pasante */}
                    <ellipse cx="460" cy="365" rx="10" ry="4" fill="none" stroke="#0f766e" strokeWidth="1" strokeDasharray="3 2" />
                </g>

                {/* ============================================ */}
                {/* ETIQUETAS                                    */}
                {/* ============================================ */}
                <text x="155" y="240" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600" className={styles.label}>
                    VISTA FRONTAL
                </text>
                <text x="410" y="220" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600" className={styles.label}>
                    VISTA LATERAL
                </text>
                <text x="160" y="425" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600" className={styles.label}>
                    VISTA SUPERIOR
                </text>
                <text x="460" y="490" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600" className={styles.label}>
                    ISOMÉTRICA
                </text>

                {/* ============================================ */}
                {/* CAJETÍN                                      */}
                {/* ============================================ */}
                <g className={styles.titleBlockGroup}>
                    <rect x="60" y="500" width="480" height="80" fill="none" stroke="#0d9488" strokeWidth="1.5" />
                    <line x1="60" y1="525" x2="540" y2="525" stroke="#0d9488" strokeWidth="0.8" />
                    <line x1="60" y1="555" x2="540" y2="555" stroke="#0d9488" strokeWidth="0.8" />
                    <line x1="180" y1="500" x2="180" y2="580" stroke="#0d9488" strokeWidth="0.8" />
                    <line x1="360" y1="500" x2="360" y2="580" stroke="#0d9488" strokeWidth="0.8" />
                    <text x="65" y="518" fill="#475569" fontSize="10" fontWeight="600">PIEZA</text>
                    <text x="185" y="518" fill="#475569" fontSize="10">SOPORTE</text>
                    <text x="365" y="518" fill="#475569" fontSize="10" fontWeight="600">ESCALA</text>
                    <text x="65" y="548" fill="#475569" fontSize="10" fontWeight="600">MATERIAL</text>
                    <text x="185" y="548" fill="#475569" fontSize="10">ACERO</text>
                    <text x="365" y="548" fill="#475569" fontSize="10">1:1</text>
                    <text x="65" y="575" fill="#475569" fontSize="10" fontWeight="600">PROY.</text>
                    <text x="185" y="575" fill="#475569" fontSize="10">ORTOGONAL</text>
                    <text x="365" y="575" fill="#475569" fontSize="10">COTAS: mm</text>
                </g>
            </svg>
        </div>
    );
}