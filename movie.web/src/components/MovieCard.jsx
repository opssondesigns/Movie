import React, { useState } from "react";
import { getMovieById } from "../services/movieService";

const MovieCard = ({ movie }) => {
    const [showModal, setShowModal] = useState(false);
    const [fullDetails, setFullDetails] = useState(null);
    const [isSelected, setIsSelected] = useState(false);

    const handleOpenModal = async () => {
        try {
            const details = await getMovieById(movie.imdbID);
            setFullDetails(details);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching movie details:", error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFullDetails(null);
    };

    const handlePlayClick = () => {
        if (fullDetails?.Title) {
            const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(fullDetails.Title)}+trailer`;
            window.open(trailerUrl, "_blank");
        }
    };

    const handleAddToList = () => {
        setIsSelected(prev => !prev);
    };

    return (
        <>
            {/* Movie Poster */}
            <div
                style={{
                    borderRadius: "8px",
                    width: "100%",
                    height: "200px",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                    transition: "transform 0.2s ease-in-out",
                }}
                onClick={handleOpenModal}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
                <img
                    src={movie.Poster}
                    alt={movie.Title}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                    }}
                />
            </div>

            {/* Movie Details Modal */}
            {showModal && fullDetails && (
                <div
                    onClick={handleCloseModal}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0,0,0,0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "#181818",
                            padding: "20px",
                            borderRadius: "10px",
                            width: "100%",
                            maxWidth: "700px",
                            color: "#fff",
                            display: "flex",
                            gap: "20px",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                            position: "relative",
                        }}
                    >
                        {/* "X" Close Button */}
                        <button
                            onClick={handleCloseModal}
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "15px",
                                background: "transparent",
                                border: "none",
                                color: "#fff",
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => (e.target.style.color = "#ff4d4d")}
                            onMouseLeave={(e) => (e.target.style.color = "#fff")}
                        >
                            &times;
                        </button>

                        {/* Poster */}
                        <div style={{ flex: "0 0 200px" }}>
                            <img
                                src={fullDetails.Poster}
                                alt={fullDetails.Title}
                                style={{
                                    width: "100%",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                }}
                            />
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1 }}>
                            <h2 style={{ marginBottom: "5px", fontSize: "1.8rem" }}>
                                {fullDetails.Title}
                            </h2>
                            <p style={{ fontSize: "0.9rem", color: "#aaa" }}>
                                {fullDetails.Type?.toUpperCase()} • {fullDetails.Year}
                            </p>

                            <p style={{ marginTop: "10px", lineHeight: "1.4", color: "#ccc" }}>
                                {fullDetails.Plot || "No description available."}
                            </p>

                            <div style={{ marginTop: "15px", fontSize: "0.95rem", color: "#ddd" }}>
                                <p><strong>Genre:</strong> {fullDetails.Genre}</p>
                                <p><strong>Cast:</strong> {fullDetails.Actors}</p>
                                <p><strong>Language:</strong> {fullDetails.Language}</p>
                                <p><strong>Rated:</strong> {fullDetails.Rated}</p>
                                <p><strong>Released:</strong> {fullDetails.Released}</p>
                            </div>

                            {fullDetails.imdbRating && (
                                <p style={{ marginTop: "10px", fontWeight: "bold", color: "#ffcc00" }}>
                                    ⭐ IMDb Score: {fullDetails.imdbRating}
                                </p>
                            )}
                          
                            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                                <button
                                    onClick={handlePlayClick}
                                    style={{
                                        flex: "0.2",
                                        padding: "5px",
                                        backgroundColor: "#ff4d4d",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "1rem",
                                        fontWeight: "bold",
                                    }}
                                >
                                    ▶ PLAY
                                </button>
                                <button
                                    onClick={handleAddToList}
                                    style={{
                                        padding: "12px",
                                        backgroundColor: isSelected ? "#2ecc71" : "#555",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        fontSize: "1.2rem",
                                        cursor: "pointer",
                                        minWidth: "50px",
                                    }}
                                    title={isSelected ? "Selected" : "Add to My List"}
                                >
                                    {isSelected ? "✓" : "+"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MovieCard;
