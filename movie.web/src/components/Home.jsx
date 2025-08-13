// src/components/Home.jsx
import React from "react";
import MovieList from "../components/MovieList";
import MovieSearch from "../components/MovieSearch";

export default function Home() {
    return (
        <>
            <h1 className="page-title">🎬 Movie Hub</h1>
            <MovieSearch />
            <MovieList />
        </>
    );
}
