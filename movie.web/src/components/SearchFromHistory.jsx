import React, { useEffect, useMemo, useState } from "react";
import { getMoviesFromHistory } from "../services/movieService";
import MovieCard from "./MovieCard";
import Pagination from "./Pagination";
import "../styles/MovieCarousel.css";

const PAGE_SIZE = 12;

export default function SearchFromHistory() {
    const [queries, setQueries] = useState([]);
    const [all, setAll] = useState([]);
    const [active, setActive] = useState("all");
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let ok = true;
        (async () => {
            try {
                setLoading(true);
                const { queries: q = [], results = [] } = await getMoviesFromHistory();
                if (!ok) return;
                setQueries(q);
                setAll(results);
            } catch (e) {
                console.error(e);
                if (ok) { setQueries([]); setAll([]); }
            } finally {
                if (ok) setLoading(false);
            }
        })();
        return () => { ok = false; };
    }, []);

    const filtered = useMemo(() => {
        if (active === "all") return all;
        return all.filter(m => (m._query || "").toLowerCase() === active.toLowerCase());
    }, [all, active]);

    useEffect(() => { setPage(1); }, [active, filtered.length]);

    const total = filtered.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    return (
        <div style={{ padding: 16 }}>
            <h2 style={{ color: "#E5E7EB", marginBottom: 8 }}>
                Search Results from your last 5 queries
            </h2>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <button
                    onClick={() => setActive("all")}
                    style={{
                        padding: "6px 10px", borderRadius: 9999,
                        border: "1px solid #374151",
                        background: active === "all" ? "#1F2937" : "#111827",
                        color: "#E5E7EB"
                    }}
                >
                    All ({all.length})
                </button>
                {queries.map(q => (
                    <button
                        key={q}
                        onClick={() => setActive(q)}
                        style={{
                            padding: "6px 10px", borderRadius: 9999,
                            border: "1px solid #374151",
                            background: active === q ? "#1F2937" : "#111827",
                            color: "#E5E7EB"
                        }}
                    >
                        {q} ({all.filter(m => (m._query || "").toLowerCase() === q.toLowerCase()).length})
                    </button>
                ))}
            </div>

            {loading && <div style={{ color: "#9CA3AF" }}>Loading…</div>}
            {!loading && total === 0 && (
                <div style={{ color: "#9CA3AF" }}>No movies yet. Search a few titles to build history.</div>
            )}

            {!loading && total > 0 && (
                <>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                            gap: 16,
                            marginTop: 12
                        }}
                    >
                        {pageItems.map((m, i) => (
                            <MovieCard key={m.imdbID || m.imdbId || i} movie={m} />
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
