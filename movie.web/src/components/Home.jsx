import React from "react";
import MovieList from "../components/MovieList";
import MovieSearch from "../components/MovieSearch";
import Navbar from "../components/Navbar";

const Home = () => {
    return (
        <div style={{ padding: "20px" }}>
            <Navbar />
            <h1>🎬 Movie Hub</h1>
            <MovieSearch />
            <MovieList />
        </div>
    );
};

export default Home;
