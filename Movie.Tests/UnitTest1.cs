using Movie.Entities;
using Movie.Data;
using Movie.Services;
using Xunit;

namespace Movie.Tests;

public class MovieServiceTests
{
    [Fact]
    public void AddMovie_Should_Add_To_Repository()
    {
        var repo = new MovieRepository();
        var service = new MovieService(repo);

        var movie = new MovieItem { Id = 1, Title = "Inception", Genre = "Sci-Fi", ReleaseDate = DateTime.Now };
        service.AddMovie(movie);

        Assert.Contains(movie, repo.GetAll());
    }
}
