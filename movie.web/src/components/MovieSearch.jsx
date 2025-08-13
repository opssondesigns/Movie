import React, { useState, useEffect, useRef } from "react";
import { searchMoviesByTitle } from "../services/movieService";
import MovieCard from "./MovieCard";
import SearchBar from "./SearchBar";
import "./MovieCarousel.css";

export default function MovieSearch() {
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const carouselRef = useRef(null);

    useEffect(() => {
        if (!searchQuery) {
            setMovies([]);
            return;
        }

        const controller = new AbortController();

        (async () => {
            try {
                console.log("search by title", searchQuery);
                const results = await searchMoviesByTitle(searchQuery, { signal: controller.signal });

                // Only update if results differ
                if (JSON.stringify(results) !== JSON.stringify(movies)) {
                    setMovies(results || []);
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error fetching search results:", error);
                }
            }
        })();

        return () => controller.abort();

    }, [searchQuery]);

    useEffect(() => {
        console.log("data result", movies);
    }, [movies]);

    const scrollLeft = () => {
        carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    };

    const scrollRight = () => {
        carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    };

    return (
        <div className="movie-search">
            <SearchBar onSearch={setSearchQuery} placeholder="Search movies by title..." />

            {movies.length > 0 && (
                <div className="carousel-container">
                    <button className="scroll-btn left" onClick={scrollLeft}>
                        &#10094;
                    </button>
                    <div className="carousel" ref={carouselRef}>
                        {movies.map((movie, index) => (
                            <MovieCard key={movie.id || index} movie={movie} />
                        ))}
                    </div>
                    <button className="scroll-btn right" onClick={scrollRight}>
                        &#10095;
                    </button>
                </div>
            )}
        </div>
    );
}
