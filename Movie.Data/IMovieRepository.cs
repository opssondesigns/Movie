using Movie.Entities;

namespace Movie.Data
{
    public interface IMovieRepository
    {
        Task<IEnumerable<OmdbMovie>> SearchMoviesByTitle(string title);
        Task<OmdbMovie?> GetMovieByIdAsync(string imdbId);
    }
}
