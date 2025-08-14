🎬 Movie Hub — React + .NET Core 
====================================

A full-stack web app that lets users search movies by title (via OMDb), view details, and automatically save the LAST FIVE search queries per authenticated user. The app uses React (Vite) on the client and ASP.NET Core + Identity + EF Core (SQL Server) on the server with cookie-based auth.

------------------------------------
FEATURES
------------------------------------
• Search by title 
• “Last 5 searches” per user (de-duplicated, most-recent first)
• Movie details modal (poster, year, plot, cast, IMDb rating)
• Cookie-based auth (login/logout/me), secure CORS configuration
• Unit tests: Movie.Tests

------------------------------------
PROJECT LAYOUT
------------------------------------
Solution 'Movie'
├─ Movie.API        # ASP.NET Core Web API (controllers, auth e.t.c)
├─ Movie.Data       # Repositories, EF Core DbContext
├─ Movie.Entities   # Entity models (Identity + SearchHistory + OMDb DTOs)
├─ Movie.Services   # Domain services (movieService)
├─ Movie.Tests      # Backend unit/integration tests (xUnit)
└─ movie.web        # React app (Vite), and UI components

------------------------------------
PREREQUISITES
------------------------------------
• .NET SDK 8.x
• SQL Server
• Node.js ≥ 18
• OMDb API key: https://www.omdbapi.com/apikey/title

------------------------------------
CONFIGURATION (BACKEND: Movie.API)
------------------------------------
Create/update appsettings.Development.json:

{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\MSSQLLocalDB;Database=MovieHub;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "MovieApi": {
    "BaseUrl": "https://www.omdbapi.com/",
    "ApiKey": "<YOUR_OMDB_KEY>"
  }
}

Notes:
• Identity cookie + session are set for local dev: SameSite=Lax, Secure=None.
• In production, use HTTPS with SameSite=None + Secure=Always.

------------------------------------
GETTING STARTED (DEVELOPMENT)
------------------------------------
1) Restore & run the backend
   dotnet restore
   dotnet build
   # optional: apply migrations if you have them
   # dotnet ef database update --project Movie.Data --startup-project Movie.API
   dotnet run --project Movie.API
   # API at http://localhost:5037 (Swagger: /swagger)

2) Install & run the frontend (Vite)
   cd movie.web
   npm ci
   npm install vite@4.5.3    
   npm start                   # "start" should map to "vite" in package.json
   # UI at http://localhost:5173

Proxy/CORS:
• If UI runs on 5173 and API on 5037, either rely on the API CORS policy (AllowMovieHub) and use credentials: 'include', or configure a Vite proxy to forward /api → http://localhost:5037.

------------------------------------
HOW TO USE
------------------------------------
1. Register/Sign-In (top-right).
2. Use the search bar to find movies by title.
3. Click a poster to open full details.
4. Go to Your Search Lists (top-right) to see a combined stream from your last five queries.

------------------------------------
API ENDPOINTS (SUMMARY)
------------------------------------
Auth:
• POST /api/account/login        -> cookie login
• POST /api/account/logout       -> logout (clears cookies)
• GET  /api/account/me           -> current user info + claims

Movies:
• GET  /api/movie?title=<q>     -> search via OMDb; returns a flat list (server aggregates pages)
• GET  /api/movie?title=<q>&i=imdbId    -> search via OMDb; returns movie detail
• GET  /api/movie/from-history  -> combined results from last 5 terms

Swagger (development): http://localhost:5037/swagger

------------------------------------
TESTING
------------------------------------
Backend tests:
  dotnet test Movie.Tests
  
------------------------------------
SECURITY
------------------------------------
• OMDb key is stored server-side; the client never sees it.
• Cookies are HttpOnly. Use HTTPS with SameSite=None + Secure=Always in production.
• CORS is restricted to your configured frontend origin; tighten in prod.

------------------------------------
TROUBLESHOOTING
------------------------------------
• 401 on /api/account/me: ensure credentials:'include' on fetch and align cookie SameSite/Secure with your environment.
• CORS errors: ensure origin in API CORS policy matches http://localhost:5173 during dev.
• OMDb 404/429: check MovieApi.ApiKey and consider a small retry policy.

------------------------------------
PRODUCTION DEPLOYMENT (OVERVIEW)
------------------------------------
Option A — Reverse proxy + Kestrel (Windows/Linux)
  1) Publish API:
     dotnet publish Movie.API -c Release -o out
  2) Host behind IIS (Windows) or Nginx (Linux) with HTTPS; reverse-proxy to Kestrel.
  3) Build frontend:
     cd movie.web
     npm ci
     npm run build          # vite build → /dist
  4) Serve /dist as static site; proxy /api/* to the API host.

Option B — Azure App Service
  • Deploy API as a .NET Web App.
  • Deploy /dist to Static Web Apps or same App Service (wwwroot) and proxy /api.

Option C — Docker
  • One container for API (ASP.NET runtime), one for UI (Nginx serving /dist).
  • Compose the two; UI proxies /api to API container.

Remember to switch cookie settings (Secure + SameSite=None), set production connection strings and OMDb key via environment variables.

------------------------------------
QUICK COMMANDS
------------------------------------
Frontend:
  npm install vite@4.5.3
  npm start

Production build:
  cd movie.web
  npm run build

------------------------------------
AUTHOR
------------------------------------
Osinaike Opeyemi — Software Engineer
