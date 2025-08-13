import React, { useEffect, useState } from "react";
import { getMovies } from "../services/movieService";
import MovieCard from "./MovieCard";
import Pagination from "./Pagination";
import "./MovieCarousel.css";

const PAGE_SIZE = 10;

export default function MovieList({ title = "Popular Movies" }) {
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let mounted = true;
        getMovies()
            .then((data) => { if (mounted) setMovies(data || []); })
            .catch(console.error);
        return () => { mounted = false; };
    }, []);

    const total = movies.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = movies.slice(start, start + PAGE_SIZE);

    return (
        <div className="movie-search" style={{ padding: 16 }}>
            {title && <h2 className="carousel-title">{title}</h2>}

            {total > 0 && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: 16,
                            marginTop: 12
                        }}
                    >
                        {pageItems.map((movie, index) => (
                            <MovieCard key={movie.imdbID || index} movie={movie} />
                        ))}
                    </div>

                    <Pagination
                        page={page}
                        total={total}
                        pageSize={PAGE_SIZE}
                        onChange={setPage}
                    />
                </>
            )}
        </div>
    );
}
