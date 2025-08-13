using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movie.Data.Database;
using Movie.Services;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Movie.Services.Background;
using Microsoft.AspNetCore.Identity;
using Movie.Entities;

namespace Movie.Api.Controllers
{
    [ApiController]
    [Route("api/movie")]
    public class MovieController : ControllerBase
    {
        private readonly UserManager<MovieIdentityUser> _userManager;
        private readonly MovieService _movieService;
        private readonly ISearchLogQueue _searchQueue;
        private MovieDbContext _context = new MovieDbContext();

        public MovieController(UserManager<MovieIdentityUser> userManager, MovieService movieService, ISearchLogQueue searchQueue)
        {
            _movieService = movieService;
            _searchQueue = searchQueue;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetMovies([FromQuery] string? title = null)
        {            
            var moviesTask = _movieService.GetMoviesAsync(title);          
            
            if (!string.IsNullOrWhiteSpace(title))
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;                

                await _searchQueue.EnqueueAsync(new SearchLog(userId, title.Trim()));
            }
            var movies = await moviesTask;
            return Ok(movies);
        }

        [HttpGet("{imdbId}")]
        public async Task<IActionResult> GetMovieById(string imdbId)
        {
            var movie = await _movieService.GetMovieByIdAsync(imdbId);
            if (movie == null) return NotFound();
            return Ok(movie);
        }

        [HttpGet("history")]
        public async Task<IActionResult> History(CancellationToken ct)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var recent = await _context.Set<SearchHistory>()
                .AsNoTracking()
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.SearchDate)
                .Select(h => h.SearchTerm)
                .Take(25)
                .ToListAsync(ct);

            var terms = recent
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(5)
                .ToList();

            return Ok(terms);
        }
        [Authorize]
        [HttpGet("from-history")]
        public async Task<IActionResult> FromHistory(CancellationToken ct)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var recent = await _context.SearchHistories
                .AsNoTracking()
                .Where(h => h.UserId != null && h.UserId == userId)
                .OrderByDescending(h => h.SearchDate)
                .Select(h => h.SearchTerm)
                .Take(25)
                .ToListAsync(ct);

            var terms = recent
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(5)
                .ToList();

            if (terms.Count == 0)
                return Ok(new { queries = Array.Empty<string>(), total = 0, results = Array.Empty<object>() });

            var tasks = terms.Select(t => _movieService.GetMoviesAsync(t)).ToArray();
            var lists = await Task.WhenAll(tasks);

            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var combined = new List<object>();

            for (int i = 0; i < terms.Count; i++)
            {
                var term = terms[i];
                var movies = lists[i] ?? Enumerable.Empty<dynamic>();

                foreach (var m in movies)
                {
                    string id = m?.ImdbID ?? "";
                    if (string.IsNullOrWhiteSpace(id) || !seen.Add(id)) continue;

                    combined.Add(new
                    {
                        imdbID = id,
                        Title = m?.Title ?? "",
                        Poster = m?.Poster ?? "",
                        _query = term
                    });
                }
            }

            return Ok(new { queries = terms, total = combined.Count, results = combined });
        }
    }

}
