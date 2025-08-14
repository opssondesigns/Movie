using System.Net;
using System.Net.Http;
using System.Text;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Movie.Data;
using Xunit;

public class MovieRepositoryTests
{
    private static IConfiguration MakeConfig(string baseUrl = "http://omdb.test/", string apiKey = "d1773c44")
    {
        var dict = new Dictionary<string, string?>
        {
            ["MovieApi:BaseUrl"] = baseUrl,
            ["MovieApi:ApiKey"] = apiKey
        };
        return new ConfigurationBuilder().AddInMemoryCollection(dict!).Build();
    }

    private static HttpClient MakeClient(FakeHttpMessageHandler handler)
    {
        return new HttpClient(handler)
        {
            BaseAddress = new Uri("http://localhost/")
        };
    }

    [Fact]
    public async Task SearchMoviesByTitle_MapsResults_And_UsesCorrectUrl()
    {
        // Arrange
        var handler = new FakeHttpMessageHandler();
        handler.Responder = (req) =>
        {
            req.RequestUri!.ToString().Should().Contain("http://omdb.test/?apikey=KEY&s=matrix&page=2");

            var payload = /* language=json */ """
            {
              "Search": [
                { "Title": "The Matrix", "ImdbID": "tt0133093", "Poster": "N/A" },
                { "Title": "The Matrix Reloaded", "ImdbID": "tt0234215", "Poster": "N/A" }
              ],
              "TotalResults": "2",
              "Response": "True"
            }
            """;
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(payload, Encoding.UTF8, "application/json")
            };
        };

        var client = MakeClient(handler);
        var config = MakeConfig();
        var repo = new MovieRepository(client, config);

        // Act
        var list = await repo.SearchMoviesByTitle("matrix");

        // Assert
        list.Should().NotBeNull();
        list.Should().HaveCount(2);
        list.First().Title.Should().Be("The Matrix");
        list.First().ImdbID.Should().Be("tt0133093");
        list.First().Poster.Should().Be("N/A");
    }

    [Fact]
    public async Task SearchMoviesByTitle_WhenSearchNull_ReturnsEmpty()
    {
        // Arrange
        var handler = new FakeHttpMessageHandler
        {
            Responder = _ =>
            {
                var payload = /* language=json */ """{ "Response":"False" }""";
                return new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(payload, Encoding.UTF8, "application/json")
                };
            }
        };
        var client = MakeClient(handler);
        var config = MakeConfig();
        var repo = new MovieRepository(client, config);

        // Act
        var list = await repo.SearchMoviesByTitle("unknown");

        // Assert
        list.Should().NotBeNull();
        list.Should().BeEmpty();
    }
}
