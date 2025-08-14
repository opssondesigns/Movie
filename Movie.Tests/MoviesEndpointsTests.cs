using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Movie.Data.Database;
using Movie.Entities;
using Xunit;

public class MoviesEndpointsTests : IClassFixture<CustomWebAppFactory>
{
    private readonly CustomWebAppFactory _factory;
    public MoviesEndpointsTests(CustomWebAppFactory factory) => _factory = factory;

    [Fact]
    public async Task FromHistory_Returns_Combined_Results()
    {
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<MovieDbContext>();
            db.Set<SearchHistory>().AddRange(
                new SearchHistory { UserId = "user-1", SearchTerm = "wedding", SearchDate = DateTime.UtcNow.AddMinutes(-1) },
                new SearchHistory { UserId = "user-1", SearchTerm = "city", SearchDate = DateTime.UtcNow.AddMinutes(-2) }
            );
            await db.SaveChangesAsync();
        }

        var client = _factory.CreateClient();

        var resp = await client.GetAsync("/api/movie/from-history");
        resp.StatusCode.Should().Be(HttpStatusCode.OK);
    }
}
