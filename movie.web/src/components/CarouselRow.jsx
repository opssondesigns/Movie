// src/components/CarouselRow.jsx
import React, { useEffect, useRef, useState } from "react";
import "./MovieCarousel.css";

export default function CarouselRow({ children, step = 320, className = "" }) {
    const trackRef = useRef(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const update = () => {
        const el = trackRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        const left = el.scrollLeft;
        setCanLeft(left > 0);
        setCanRight(left < max - 1);
    };

    useEffect(() => {
        update();
        const el = trackRef.current;
        if (!el) return;
        const onScroll = () => update();
        el.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            el.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", update);
        };
    }, []);

    useEffect(() => { update(); }); // recalc when children change via React

    const scrollBy = (dx) => trackRef.current?.scrollBy({ left: dx, behavior: "smooth" });

    return (
        <div className={`carousel-row ${className}`}>
            <button
                className="scroll-btn left"
                onClick={() => scrollBy(-step)}
                disabled={!canLeft}
                aria-label="Scroll left"
            >
                &#10094;
            </button>

            <div className="carousel-track" ref={trackRef}>
                {children}
            </div>

            <button
                className="scroll-btn right"
                onClick={() => scrollBy(step)}
                disabled={!canRight}
                aria-label="Scroll right"
            >
                &#10095;
            </button>
        </div>
    );
}
