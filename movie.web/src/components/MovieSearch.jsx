import React, { useEffect, useState } from "react";
import { searchMoviesByTitle } from "../services/movieService";
import MovieCard from "./MovieCard";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";

const PAGE_SIZE = 12;

function Spinner({ size = 28 }) {
    return (
        <div style={{ display: "grid", placeItems: "center", marginTop: 8 }}>
            <svg width={size} height={size} viewBox="0 0 50 50" aria-label="Loading" role="img">
                <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" fill="none" opacity="0.25" />
                <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" strokeDasharray="90 126">
                    <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite" />
                </circle>
            </svg>
        </div>
    );
}

export default function MovieSearch() {
    const [movies, setMovies] = useState([]);    
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = (searchQuery || "").trim();
        if (!q) {
            setMovies([]);
            return;
        }

        const controller = new AbortController();
        (async () => {
            try {
                setLoading(true);
                const results = await searchMoviesByTitle(q, { signal: controller.signal });
                setMovies(results || []);
                setPage(1); 
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error(err);
                    setMovies([]);
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [searchQuery]);

    const handleSearch = (q) => setSearchQuery(q);

    const total = movies.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = movies.slice(start, start + PAGE_SIZE);

    return (
        <div style={{ marginBottom: 24 }}>
            <SearchBar onSearch={handleSearch} placeholder="Search movies by title..." />

            {loading && <Spinner />}

            {!loading && total === 0 && searchQuery && (
                <div style={{ color: "#9CA3AF", marginTop: 8 }}>No results found.</div>
            )}

            {!loading && total > 0 && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: 16,
                            marginTop: 12,
                        }}
                    >
                        {pageItems.map((movie, index) => (
                            <MovieCard key={movie.imdbID || movie.ImdbID || index} movie={movie} />
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
