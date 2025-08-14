using Movie.Entities;

namespace Movie.Data
{
    public interface IMovieRepository
    {
        Task<IEnumerable<OmdbMovie>> SearchMoviesByTitle(string title, CancellationToken ct);
        Task<OmdbMovie?> GetMovieByIdAsync(string imdbId);
    }
}
