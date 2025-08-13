import React, { useEffect, useState, useRef } from "react";
import { getMovies } from "../services/movieService";
import MovieCard from "./MovieCard";
import "./MovieCarousel.css"; // shared with MovieSearch

const MovieList = ({ title = "Popular Movies" }) => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const carouselRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        getMovies()
            .then((data) => {
                if (isMounted) setMovies(data || []);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
        return () => {
            isMounted = false;
        };
    }, []);

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: -300,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({
                left: 300,
                behavior: "smooth",
            });
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="movie-search">
            {title && <h2 className="carousel-title">{title}</h2>}

            {movies.length > 0 && (
                <div className="carousel-container">
                    <button className="scroll-btn left" onClick={scrollLeft}>
                        &#10094;
                    </button>
                    <div className="carousel" ref={carouselRef}>
                        {movies.map((movie, index) => (
                            <MovieCard key={movie.imdbID || index} movie={movie} />
                        ))}
                    </div>
                    <button className="scroll-btn right" onClick={scrollRight}>
                        &#10095;
                    </button>
                </div>
            )}
        </div>
    );
};

export default MovieList;
