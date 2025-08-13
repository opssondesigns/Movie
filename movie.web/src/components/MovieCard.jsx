import React, { useEffect, useState } from "react";
import { getMovieById } from "../services/movieService";

export default function MovieCard({ movie }) {
    const [showModal, setShowModal] = useState(false);
    const [fullDetails, setFullDetails] = useState(null);
    const [isSelected, setIsSelected] = useState(false);

    const id = movie.imdbID || movie.imdbId;
    const title = movie.Title || movie.title;
    const poster = movie.Poster || movie.poster;

    const openModal = async () => {
        try {
            const details = await getMovieById(id);
            setFullDetails(details);
            setShowModal(true);
        } catch (e) {
            console.error(e);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setFullDetails(null);
    };
    const toggleSelect = () => setIsSelected((v) => !v);

    useEffect(() => {
        if (!showModal) return;
        const onKey = (e) => e.key === "Escape" && closeModal();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [showModal]);

    return (
        <>
            <div
                onClick={openModal}
                style={{
                    cursor: "pointer",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#111827",
                    border: "1px solid #374151",
                    boxShadow: "0 8px 24px rgba(0,0,0,.25)",
                    transition: "transform .15s ease",
                }}
                onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                }
            >
                <div style={{ height: 220, background: "#0f172a" }}>
                    {poster && poster !== "N/A" ? (
                        <img
                            src={poster}
                            alt={title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <div
                            style={{
                                height: "100%",
                                display: "grid",
                                placeItems: "center",
                                color: "#9CA3AF",
                            }}
                        >
                            No Poster
                        </div>
                    )}
                </div>                
            </div>

            {showModal && fullDetails && (
                <div
                    onClick={closeModal}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,.6)",
                        display: "grid",
                        placeItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${fullDetails.Title} details`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "min(900px,92vw)",
                            background: "#0B1220",
                            border: "1px solid #374151",
                            borderRadius: 16,
                            overflow: "hidden",
                            display: "grid",
                            gridTemplateColumns: "280px 1fr",
                            position: "relative",
                        }}
                    >                       
                        <button
                            onClick={closeModal}
                            aria-label="Close"
                            style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                width: 46,
                                height: 46,
                                borderRadius: "9999px",
                                background: "rgba(17,24,39,.65)",
                                color: "#E5E7EB",
                                border: "1px solid #374151",
                                cursor: "pointer",
                                backdropFilter: "blur(4px)",
                                transition: "transform .12s ease, background .15s ease, box-shadow .15s ease",
                                boxShadow: "0 6px 20px rgba(0,0,0,.35)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                                lineHeight: 0,
                                boxSizing: "border-box",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(31,41,55,.85)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(17,24,39,.65)")}
                            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.96)")}
                            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                                style={{ display: "block" }}        
                            >
                                <path d="M6 6l12 12M18 6L6 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round" />
                            </svg>
                        </button>
                        
                        <div style={{ background: "#0f172a", minHeight: 360 }}>
                            {fullDetails.Poster && fullDetails.Poster !== "N/A" ? (
                                <img
                                    src={fullDetails.Poster}
                                    alt={fullDetails.Title}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <div
                                    style={{
                                        height: "100%",
                                        display: "grid",
                                        placeItems: "center",
                                        color: "#9CA3AF",
                                    }}
                                >
                                    No Poster
                                </div>
                            )}
                        </div>
                        
                        <div style={{ padding: 18, color: "#E5E7EB" }}>
                            <div style={{ fontSize: 22, fontWeight: 800 }}>
                                {fullDetails.Title}
                            </div>
                            <div style={{ color: "#9CA3AF", marginTop: 4 }}>
                                {fullDetails.Year} • {fullDetails.Runtime} • {fullDetails.Genre}
                            </div>
                            <div style={{ marginTop: 10, lineHeight: 1.5 }}>
                                {fullDetails.Plot}
                            </div>
                            <div style={{ marginTop: 10, color: "#9CA3AF" }}>
                                Director:{" "}
                                <b style={{ color: "#E5E7EB" }}>{fullDetails.Director}</b>
                                <br />
                                Actors: <b style={{ color: "#E5E7EB" }}>{fullDetails.Actors}</b>
                            </div>
                            {fullDetails.imdbRating && (
                                <div style={{ marginTop: 12, fontWeight: 700 }}>
                                    IMDb: <span style={{ color: "#F59E0B" }}>{fullDetails.imdbRating}</span>
                                </div>
                            )}

                            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://www.youtube.com/results?search_query=${encodeURIComponent(
                                                fullDetails.Title
                                            )}+trailer`,
                                            "_blank"
                                        )
                                    }
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: 8,
                                        border: "1px solid #374151",
                                        background: "#111827",
                                        color: "#E5E7EB",
                                    }}
                                >
                                    ▶ Trailer
                                </button>
                                <button
                                    onClick={toggleSelect}
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: 8,
                                        border: "1px solid #374151",
                                        background: isSelected ? "#166534" : "#374151",
                                        color: "#E5E7EB",
                                    }}
                                >
                                    {isSelected ? "✓ Added" : "+ Add"}
                                </button>                         
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}