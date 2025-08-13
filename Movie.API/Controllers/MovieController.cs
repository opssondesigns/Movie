using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Movie.Data.Database;
using Movie.Services;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Movie.Services.Background;

namespace Movie.Api.Controllers
{
    [ApiController]
    [Route("api/movie")]
    public class MovieController : ControllerBase
    {
        private readonly MovieService _movieService;
        private readonly ISearchLogQueue _searchQueue;
        private MovieDbContext _context = new MovieDbContext();

        public MovieController(MovieService movieService, ISearchLogQueue searchQueue)
        {
            _movieService = movieService;
            _searchQueue = searchQueue;
        }

        [HttpGet]
        public async Task<IActionResult> GetMovies([FromQuery] string? title = null)
        {
            
            var moviesTask = _movieService.GetMoviesAsync(title);

            var fullName = User.Identity!.Name;
            if (!string.IsNullOrWhiteSpace(title))
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var name = User.FindFirst(ClaimTypes.Name)?.Value;
                

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
    }
}
