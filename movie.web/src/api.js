const API_BASE = "http://localhost:5000/api/movies";

export async function fetchMovies(query = "", page = 1) {
    const response = await fetch(`${API_BASE}?query=${query}&page=${page}`);
    if (!response.ok) throw new Error("Failed to fetch movies");
    return response.json();
}
