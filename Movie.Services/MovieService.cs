using Microsoft.AspNetCore.Http;
using Movie.Data;
using Movie.Entities;

namespace Movie.Services
{
    public class MovieService
    {
        private readonly IMovieRepository _movieRepository;

        public MovieService(IMovieRepository movieRepository)
        {
            _movieRepository = movieRepository;
        }

        public async Task<IEnumerable<dynamic>> GetMoviesAsync(string title, CancellationToken ct)
        {    
            return await _movieRepository.SearchMoviesByTitle(title, ct);
        }

        public async Task<OmdbMovie?> GetMovieByIdAsync(string imdbId)
        {
            return await _movieRepository.GetMovieByIdAsync(imdbId);
        }

    }
}
