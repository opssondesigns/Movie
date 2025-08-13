using Movie.Entities;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;

namespace Movie.Data
{
    public class MovieRepository : IMovieRepository
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public MovieRepository(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }
        public async Task<IEnumerable<OmdbMovie>> SearchMoviesByTitle(string? title, int page = 1)
        {
            var baseUrl = _configuration["MovieApi:BaseUrl"];
            var apiKey = _configuration["MovieApi:ApiKey"];

            var fullUrl = string.IsNullOrEmpty(title)
                            ? $"{baseUrl}?apikey={apiKey}&page={page}"
                            : $"{baseUrl}?apikey={apiKey}&s={title}&page={page}";

            var searchResponse = await _httpClient.GetFromJsonAsync<OmdbSearchResponse>(fullUrl);

            if (searchResponse?.Search == null)
                return Enumerable.Empty<OmdbMovie>();

            return searchResponse.Search.Select(item => new OmdbMovie
            {
                Title = item.Title,
                ImdbID = item.ImdbID,
                Poster = item.Poster,
            });
        }

        public async Task<OmdbMovie?> GetMovieByIdAsync(string imdbId)
        {
            var baseUrl = _configuration["MovieApi:BaseUrl"];
            var apiKey = _configuration["MovieApi:ApiKey"];
            var fullUrl = $"{baseUrl}?apikey={apiKey}&i={imdbId}&plot=short";

            var movieDetail = await _httpClient.GetFromJsonAsync<OmdbMovie>(fullUrl);
            return movieDetail;
        }


        private class OmdbSearchResponse
        {
            public List<OmdbSearchItem>? Search { get; set; }
            public string? TotalResults { get; set; }
            public string? Response { get; set; }
        }

        private class OmdbSearchItem
        {
            public string Title { get; set; } = string.Empty;
            public string ImdbID { get; set; } = string.Empty;
            public string Poster { get; set; } = string.Empty;
      
        }
    }
}
