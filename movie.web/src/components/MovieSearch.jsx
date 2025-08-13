import React, { useEffect, useState } from "react";
import { searchMoviesByTitle } from "../services/movieService";
import MovieCard from "./MovieCard";
import SearchBar from "./SearchBar";
import Pagination from "./Pagination";

const PAGE_SIZE = 12;

export default function MovieSearch() {
    const [movies, setMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasNext, setHasNext] = useState(false); 

    useEffect(() => {
        if (!searchQuery) {
            setMovies([]);
            setHasNext(false);
            return;
        }

        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);
                const results = await searchMoviesByTitle(searchQuery, {
                    page,
                    signal: controller.signal,
                });
                setMovies(results || []);
                setHasNext((results?.length || 0) === PAGE_SIZE); 
            } catch (err) {
                if (err.name !== "AbortError") console.error(err);
                setMovies([]);
                setHasNext(false);
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [searchQuery, page]);

    const handleSearch = (q) => {
        setSearchQuery(q);
        setPage(1);
    };

    const pseudoTotal = page * PAGE_SIZE + (hasNext ? 1 : 0);

    return (
        <div style={{ marginBottom: 24 }}>
            <SearchBar onSearch={handleSearch} placeholder="Search movies by title..." />

            {/*{loading && <div style={{ color: "#9CA3AF", marginTop: 8 }}>Searching…</div>}*/}

            {/*{!loading && movies.length === 0 && searchQuery && (*/}
            {/*    <div style={{ color: "#9CA3AF", marginTop: 8 }}>No results found.</div>*/}
            {/*)}*/}

            {!loading && movies.length > 0 && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: 16,
                            marginTop: 12,
                        }}
                    >
                        {movies.map((movie, index) => (
                            <MovieCard key={movie.imdbID || movie.id || index} movie={movie} />
                        ))}
                    </div>

                    <Pagination
                        page={page}
                        total={pseudoTotal} 
                        pageSize={PAGE_SIZE}
                        onChange={setPage}
                    />
                </>
            )}
        </div>
    );
}
