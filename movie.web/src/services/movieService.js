const API_URL = "http://localhost:5037/api/movie";
const ACCOUNT_API = "http://localhost:5037/api/account";

let currentController = null;

export async function searchMoviesByTitle(title) {
    if (currentController) {
        currentController.abort();
    }

    currentController = new AbortController();
    const signal = currentController.signal;

    try {
        const response = await fetch(
            `${API_URL}?title=${encodeURIComponent(title)}`,
            {
                signal,
                credentials: "include",
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to search movies");
        }

        const data = await response.json();
        return data || [];
    } catch (error) {
        if (error.name === "AbortError") {
            return [];
        }
        throw error;
    } finally {
        currentController = null;
    }
}

export async function getMovieById(imdbId) {
    const response = await fetch(`${API_URL}/${encodeURIComponent(imdbId)}`, {
        credentials: "include",
        cache: "no-store",
    });
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
    return response.json(); 
}

export async function getUserInfo() {
    const res = await fetch(`${ACCOUNT_API}/me`, {
        credentials: 'include',
        cache: 'no-store',
    });

    if (res.status === 401) return null;
    if (!res.ok) throw new Error(`GET /me failed: ${res.status}`);

    const data = await res.json();
    console.log('userInfo', data); 

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

export async function getMoviesFromHistory() {
    const res = await fetch(`${API_URL}/from-history`, {
        credentials: 'include',
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch history movies');
    return res.json(); 
}
