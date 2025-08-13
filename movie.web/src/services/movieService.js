const API_URL = "http://localhost:5037/api/movie";
const ACCOUNT_API = "http://localhost:5037/api/account";

export const getMovies = async () => {
    const response = await fetch(`${API_URL}?title=${encodeURIComponent("wedding")}`);
    if (!response.ok) throw new Error("Failed to fetch movies");
    const data = await response.json();  
    console.log("Movies", data);         

    return data;
};

let currentController = null;

export async function searchMoviesByTitle(title) {
    // Abort previous request if it exists
    if (currentController) {
        currentController.abort();
    }

    currentController = new AbortController();
    const signal = currentController.signal;

    try {
        const response = await fetch(
            `${API_URL}?title=${encodeURIComponent(title)}`,
            { signal }
        );

        if (!response.ok) {
            throw new Error("Failed to search movies");
        }

        const data = await response.json();

        //console.log("search by title data", data);

        // Reset controller after successful fetch
        currentController = null;

        return data || [];
    } catch (error) {
        if (error.name === "AbortError") {
            // Request was aborted, silently handle or ignore
            return [];
        }
        throw error;
    }
}

export async function getMovieById(imdbId) {
    const response = await fetch(`${API_URL}/${imdbId}`);
    if (!response.ok) throw new Error("Failed to fetch movie details");
    return response.json();
}

export async function registerUser({ fullName, email, password }) {
    console.log("fullname", fullName);
    console.log("Email", email);
    console.log("Password", password);
    const response = await fetch(`${ACCOUNT_API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
    });
    console.log("register data", response);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.[0]?.description || "Registration failed");
    }
    return response.json();
}

export async function loginUser(email, password) {
    const response = await fetch(`${ACCOUNT_API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error("Invalid credentials");
    }
    return response.json(); // Expected to include token
}

export async function getUserInfo() {
    const res = await fetch(`${ACCOUNT_API}/me`, {
        credentials: 'include',
        cache: 'no-store',
    });

    // Handle unauthenticated cleanly
    if (res.status === 401) return null;
    if (!res.ok) throw new Error(`GET /me failed: ${res.status}`);

    const data = await res.json();
    console.log('userInfo', data); // <- you'll see Claims here

    // Normalize field names for the UI
    // API returns { FullName, Username, Claims }
    return {
        fullName: data.fullName ?? data.FullName ?? data.Username ?? null,
        username: data.Username ?? null,
        claims: data.Claims ?? data.claims ?? [],
        raw: data,
    };
}

export async function logoutUser() {
    const res = await fetch(`${ACCOUNT_API}/logout`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`POST /logout failed: ${res.status}`);
}


