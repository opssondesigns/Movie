using Movie.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Movie.Data
{
    public interface IMovieRepository
    {
        Task<IEnumerable<OmdbMovie>> SearchMoviesByTitle(string? title = null, int page = 1);
        Task<OmdbMovie?> GetMovieByIdAsync(string imdbId);
    }
}
