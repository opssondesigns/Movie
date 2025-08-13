using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Movie.Data.Database;
using Movie.Entities;
using Movie.Services;
using Movie.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Movie.Services.Background;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// =============================
// Database
// =============================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<MovieDbContext>(options =>
    options.UseSqlServer(connectionString));

// =============================
// Identity (cookie-based auth)
// =============================
// NOTE: AddIdentity already registers the Identity.Application cookie scheme.
// Do NOT also call AddAuthentication().AddCookie(...) with the same scheme.
builder.Services.AddIdentity<MovieIdentityUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;

    options.ClaimsIdentity.UserIdClaimType = ClaimTypes.NameIdentifier;
    options.ClaimsIdentity.UserNameClaimType = ClaimTypes.Name;
})
.AddEntityFrameworkStores<MovieDbContext>()
.AddDefaultTokenProviders();

// Configure the existing Identity.Application cookie
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.Name = ".MovieHub.Auth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;            // dev over http with same-origin/proxy
    options.Cookie.SecurePolicy = CookieSecurePolicy.None; // allow http://localhost in dev
    options.SlidingExpiration = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(1);
    options.LoginPath = "/api/account/login";

    // Key: don't redirect for API calls
    options.Events = new CookieAuthenticationEvents
    {
        OnRedirectToLogin = ctx =>
        {
            if (ctx.Request.Path.StartsWithSegments("/api"))
            {
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            }
            ctx.Response.Redirect(ctx.RedirectUri);
            return Task.CompletedTask;
        },
        OnRedirectToAccessDenied = ctx =>
        {
            if (ctx.Request.Path.StartsWithSegments("/api"))
            {
                ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            }
            ctx.Response.Redirect(ctx.RedirectUri);
            return Task.CompletedTask;
        }
    };
});

// =============================
// MVC + Swagger
// =============================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// =============================
// App Services / HTTP clients
// =============================
builder.Services.AddHttpClient<IMovieRepository, MovieRepository>();
builder.Services.AddScoped<MovieService>();
// after AddDbContext / AddIdentity / etc.
builder.Services.AddSingleton<ISearchLogQueue, SearchLogQueue>();
builder.Services.AddHostedService<SearchLogWorker>();


// =============================
// Session (HttpContext.Session)
// =============================
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromHours(8);
    options.Cookie.Name = ".MovieHub.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.None; // allow http in dev
});

// =============================
// CORS (for SPA on http://localhost:5173 via Vite)
// =============================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowMovieHub", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// =============================
// Dev-only middleware
// =============================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// =============================
// Pipeline order matters
// =============================
app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowMovieHub");   // needed when hitting through Vite (5173) with credentials

app.UseSession();               // make session available before auth if needed
app.UseAuthentication();        // sets HttpContext.User from Identity cookie
app.UseAuthorization();

app.MapControllers();

app.Run();

/*
 * Frontend (Vite) should call relative paths so the proxy forwards to the API:
 *   fetch('/api/account/login', { credentials: 'include', ... })
 *   fetch('/api/account/me',    { credentials: 'include' })
 *
 * For production/HTTPS or true cross-origin:
 *   - Use SameSite=None and Secure=Always on cookies
 *   - Serve both SPA and API over HTTPS
 *   - Keep CORS with AllowCredentials and exact origins
 */
