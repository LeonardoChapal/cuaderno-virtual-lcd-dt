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
                {/* MURO EXTERIOR - se dibuja rápido al inicio */}
                <rect
                    x="80" y="100" width="440" height="380"
                    fill="white" stroke="#0d9488" strokeWidth="4"
                    className={styles.outerWall}
                />

                {/* TODO LO DEMÁS - se dibuja lento */}
                <g className={styles.interior}>
                    {/* ============================================ */}
                    {/* MUROS INTERIORES                             */}
                    {/* ============================================ */}

                    <line x1="320" y1="100" x2="320" y2="200" stroke="#0d9488" strokeWidth="3" />
                    <line x1="320" y1="240" x2="320" y2="290" stroke="#0d9488" strokeWidth="3" />

                    <line x1="320" y1="290" x2="380" y2="290" stroke="#0d9488" strokeWidth="3" />
                    <line x1="420" y1="290" x2="520" y2="290" stroke="#0d9488" strokeWidth="3" />

                    <line x1="320" y1="290" x2="320" y2="480" stroke="#0d9488" strokeWidth="3" />

                    <line x1="80" y1="290" x2="200" y2="290" stroke="#0d9488" strokeWidth="3" />

                    <line x1="80" y1="395" x2="200" y2="395" stroke="#0d9488" strokeWidth="3" />

                    <line x1="200" y1="290" x2="200" y2="320" stroke="#0d9488" strokeWidth="3" />
                    <line x1="200" y1="360" x2="200" y2="395" stroke="#0d9488" strokeWidth="3" />
                    <line x1="200" y1="395" x2="200" y2="420" stroke="#0d9488" strokeWidth="3" />
                    <line x1="200" y1="460" x2="200" y2="480" stroke="#0d9488" strokeWidth="3" />

                    {/* ============================================ */}
                    {/* PUERTAS                                      */}
                    {/* ============================================ */}

                    <line x1="240" y1="480" x2="290" y2="480" stroke="white" strokeWidth="6" />
                    <line x1="240" y1="480" x2="240" y2="430" stroke="#10b981" strokeWidth="2.5" />

                    <line x1="320" y1="200" x2="320" y2="240" stroke="white" strokeWidth="6" />
                    <line x1="320" y1="200" x2="360" y2="200" stroke="#10b981" strokeWidth="2.5" />

                    <line x1="380" y1="290" x2="420" y2="290" stroke="white" strokeWidth="6" />
                    <line x1="380" y1="290" x2="380" y2="330" stroke="#10b981" strokeWidth="2.5" />

                    <line x1="200" y1="320" x2="200" y2="360" stroke="white" strokeWidth="6" />
                    <line x1="200" y1="320" x2="240" y2="320" stroke="#10b981" strokeWidth="2.5" />

                    <line x1="200" y1="420" x2="200" y2="460" stroke="white" strokeWidth="6" />
                    <line x1="200" y1="420" x2="240" y2="420" stroke="#10b981" strokeWidth="2.5" />

                    {/* ============================================ */}
                    {/* VENTANAS                                     */}
                    {/* ============================================ */}

                    <line x1="140" y1="100" x2="240" y2="100" stroke="white" strokeWidth="6" />
                    <line x1="140" y1="97" x2="240" y2="97" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="140" y1="103" x2="240" y2="103" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="190" y1="92" x2="190" y2="108" stroke="#14b8a6" strokeWidth="1" />

                    <line x1="380" y1="100" x2="480" y2="100" stroke="white" strokeWidth="6" />
                    <line x1="380" y1="97" x2="480" y2="97" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="380" y1="103" x2="480" y2="103" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="430" y1="92" x2="430" y2="108" stroke="#14b8a6" strokeWidth="1" />

                    <line x1="380" y1="480" x2="480" y2="480" stroke="white" strokeWidth="6" />
                    <line x1="380" y1="477" x2="480" y2="477" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="380" y1="483" x2="480" y2="483" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="430" y1="472" x2="430" y2="488" stroke="#14b8a6" strokeWidth="1" />

                    <line x1="80" y1="420" x2="80" y2="470" stroke="white" strokeWidth="6" />
                    <line x1="77" y1="420" x2="77" y2="470" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="83" y1="420" x2="83" y2="470" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="72" y1="445" x2="88" y2="445" stroke="#14b8a6" strokeWidth="1" />

                    <line x1="80" y1="320" x2="80" y2="370" stroke="white" strokeWidth="6" />
                    <line x1="77" y1="320" x2="77" y2="370" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="83" y1="320" x2="83" y2="370" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="72" y1="345" x2="88" y2="345" stroke="#14b8a6" strokeWidth="1" />

                    <line x1="80" y1="180" x2="80" y2="240" stroke="white" strokeWidth="6" />
                    <line x1="77" y1="180" x2="77" y2="240" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="83" y1="180" x2="83" y2="240" stroke="#14b8a6" strokeWidth="1.5" />
                    <line x1="72" y1="210" x2="88" y2="210" stroke="#14b8a6" strokeWidth="1" />

                    {/* ============================================ */}
                    {/* MUEBLES                                      */}
                    {/* ============================================ */}

                    <rect x="95" y="115" width="120" height="22" fill="none" stroke="#0f766e" strokeWidth="1.5" />
                    <rect x="95" y="115" width="22" height="60" fill="none" stroke="#0f766e" strokeWidth="1.5" />
                    <rect x="125" y="118" width="28" height="17" fill="none" stroke="#0f766e" strokeWidth="1.2" />
                    <circle cx="132" cy="123" r="2" fill="none" stroke="#0f766e" strokeWidth="0.8" />
                    <circle cx="146" cy="123" r="2" fill="none" stroke="#0f766e" strokeWidth="0.8" />
                    <circle cx="132" cy="131" r="2" fill="none" stroke="#0f766e" strokeWidth="0.8" />
                    <circle cx="146" cy="131" r="2" fill="none" stroke="#0f766e" strokeWidth="0.8" />
                    <rect x="165" y="120" width="35" height="14" fill="none" stroke="#0f766e" strokeWidth="1.2" />

                    <circle cx="220" cy="240" r="22" fill="none" stroke="#0f766e" strokeWidth="1.5" />
                    <circle cx="220" cy="208" r="6" fill="none" stroke="#0f766e" strokeWidth="1.2" />
                    <circle cx="220" cy="272" r="6" fill="none" stroke="#0f766e" strokeWidth="1.2" />
                    <circle cx="188" cy="240" r="6" fill="none" stroke="#0f766e" strokeWidth="1.2" />
                    <circle cx="252" cy="240" r="6" fill="none" stroke="#0f766e" strokeWidth="1.2" />

                    <rect x="350" y="130" width="100" height="28" fill="none" stroke="#0f766e" strokeWidth="1.5" rx="4" />
                    <rect x="350" y="130" width="30" height="28" fill="none" stroke="#0f766e" strokeWidth="1" rx="2" />
                    <rect x="385" y="130" width="30" height="28" fill="none" stroke="#0f766e" strokeWidth="1" rx="2" />
                    <rect x="420" y="130" width="30" height="28" fill="none" stroke="#0f766e" strokeWidth="1" rx="2" />
                    <rect x="370" y="195" width="60" height="22" fill="none" stroke="#0f766e" strokeWidth="1.2" />
                    <rect x="390" y="248" width="40" height="6" fill="none" stroke="#0f766e" strokeWidth="1.2" />

                    <rect x="345" y="335" width="85" height="105" fill="none" stroke="#0f766e" strokeWidth="1.5" rx="4" />
                    <line x1="387" y1="335" x2="387" y2="440" stroke="#0f766e" strokeWidth="1" />
                    <rect x="350" y="340" width="33" height="20" fill="none" stroke="#0f766e" strokeWidth="0.8" />
                    <rect x="392" y="340" width="33" height="20" fill="none" stroke="#0f766e" strokeWidth="0.8" />
                    <rect x="455" y="335" width="55" height="22" fill="none" stroke="#0f766e" strokeWidth="1.2" />
                    <rect x="455" y="380" width="22" height="22" fill="none" stroke="#0f766e" strokeWidth="1" />

                    <rect x="100" y="410" width="45" height="60" fill="none" stroke="#0f766e" strokeWidth="1.5" rx="3" />
                    <rect x="105" y="415" width="35" height="14" fill="none" stroke="#0f766e" strokeWidth="0.8" />
                    <rect x="155" y="455" width="40" height="18" fill="none" stroke="#0f766e" strokeWidth="1.2" />

                    <ellipse cx="105" cy="335" rx="10" ry="13" fill="none" stroke="#0f766e" strokeWidth="1.2" />
                    <rect x="135" y="320" width="50" height="18" fill="none" stroke="#0f766e" strokeWidth="1.2" />
                    <ellipse cx="160" cy="329" rx="14" ry="5" fill="none" stroke="#0f766e" strokeWidth="1" />
                    <rect x="105" y="365" width="80" height="22" fill="none" stroke="#0f766e" strokeWidth="1" strokeDasharray="3 2" />

                    <line x1="265" y1="510" x2="265" y2="485" stroke="#10b981" strokeWidth="1.5" />
                    <path d="M 262 488 L 265 481 L 268 488 Z" fill="#10b981" />

                    {/* ============================================ */}
                    {/* ETIQUETAS                                    */}
                    {/* ============================================ */}
                    <text x="155" y="190" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">COCINA</text>
                    <text x="220" y="170" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">COMEDOR</text>
                    <text x="400" y="245" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">SALA</text>
                    <text x="430" y="460" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">HABITACIÓN</text>
                    <text x="430" y="473" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="500">PRINCIPAL</text>
                    <text x="180" y="430" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="700">HABITACIÓN</text>
                    <text x="180" y="442" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="500">SECUNDARIA</text>
                    <text x="145" y="358" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="700">BAÑO</text>
                    <text x="265" y="525" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="700">ENTRADA PRINCIPAL</text>

                    {/* ============================================ */}
                    {/* COTAS                                        */}
                    {/* ============================================ */}

                    <line x1="80" y1="60" x2="520" y2="60" stroke="#0f766e" strokeWidth="1" />
                    <path d="M 80 57 L 75 60 L 80 63 Z" fill="#0f766e" />
                    <path d="M 520 57 L 525 60 L 520 63 Z" fill="#0f766e" />
                    <text x="300" y="50" textAnchor="middle" fill="#0f766e" fontSize="13" fontWeight="600">12.00 m</text>

                    <line x1="555" y1="100" x2="555" y2="480" stroke="#0f766e" strokeWidth="1" />
                    <path d="M 552 100 L 555 95 L 558 100 Z" fill="#0f766e" />
                    <path d="M 552 480 L 555 485 L 558 480 Z" fill="#0f766e" />
                    <text x="565" y="295" fill="#0f766e" fontSize="13" fontWeight="600">10.00 m</text>

                    {/* ============================================ */}
                    {/* CAJETÍN                                      */}
                    {/* ============================================ */}
                    <text x="300" y="555" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">
                        PLANTA ARQUITECTÓNICA · VIVIENDA UNIFAMILIAR
                    </text>

                    <rect x="100" y="568" width="400" height="28" fill="none" stroke="#0d9488" strokeWidth="1.2" />
                    <line x1="220" y1="568" x2="220" y2="596" stroke="#0d9488" strokeWidth="0.8" />
                    <line x1="340" y1="568" x2="340" y2="596" stroke="#0d9488" strokeWidth="0.8" />
                    <line x1="430" y1="568" x2="430" y2="596" stroke="#0d9488" strokeWidth="0.8" />
                    <text x="160" y="586" textAnchor="middle" fill="#475569" fontSize="9">PLANTA BAJA</text>
                    <text x="280" y="586" textAnchor="middle" fill="#475569" fontSize="9">120 m²</text>
                    <text x="385" y="586" textAnchor="middle" fill="#475569" fontSize="9">ESC. 1:100</text>
                    <text x="465" y="586" textAnchor="middle" fill="#475569" fontSize="9">N ↑</text>
                </g>
            </svg>
        </div>
    );
}