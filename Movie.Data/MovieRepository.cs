using Movie.Entities;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Collections.Concurrent;
using System.Net.Http;

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

        public async Task<IEnumerable<OmdbMovie>> SearchMoviesByTitle(string title,CancellationToken ct = default)
        {

            int maxPages = 100;
            int degreeOfParallelism = 6;

            var baseUrl = _configuration["MovieApi:BaseUrl"];
            var apiKey = _configuration["MovieApi:ApiKey"];

            if (string.IsNullOrWhiteSpace(title))
                return Enumerable.Empty<OmdbMovie>();

            async Task<OmdbSearchResponse?> FetchAsync(int page)
            {
                var url = $"{baseUrl}?apikey={apiKey}&s={Uri.EscapeDataString(title)}&page={page}";
                return await _httpClient.GetFromJsonAsync<OmdbSearchResponse>(url, ct);
            }

            // Fetch page 1 and learn TotalResults
            var first = await FetchAsync(1);
            if (first?.Search is null || string.Equals(first.Response, "False", StringComparison.OrdinalIgnoreCase))
                return Enumerable.Empty<OmdbMovie>();

            var dict = new ConcurrentDictionary<string, OmdbMovie>(StringComparer.OrdinalIgnoreCase);

            void AddRange(OmdbSearchResponse r)
            {
                if (r.Search == null) return;
                foreach (var item in r.Search)
                {
                    if (string.IsNullOrWhiteSpace(item.ImdbID)) continue;
                    dict.TryAdd(item.ImdbID, new OmdbMovie
                    {
                        Title = item.Title,
                        ImdbID = item.ImdbID,
                        Poster = item.Poster
                    });
                }
            }

            AddRange(first);

            // Determine actual page count
            int totalResults = 0;
            int.TryParse(first.TotalResults ?? "0", out totalResults);
            var totalPages = Math.Max(1, (int)Math.Ceiling(totalResults / 10.0));
            totalPages = Math.Min(totalPages, Math.Max(1, maxPages));

            if (totalPages > 1)
            {
                var pages = Enumerable.Range(2, totalPages - 1);
                var po = new ParallelOptions
                {
                    MaxDegreeOfParallelism = Math.Max(1, degreeOfParallelism),
                    CancellationToken = ct
                };

                await Parallel.ForEachAsync(pages, po, async (p, token) =>
                {
                    var res = await FetchAsync(p);
                    if (res?.Search == null || string.Equals(res.Response, "False", StringComparison.OrdinalIgnoreCase))
                        return;
                    AddRange(res);
                });
            }

            return dict.Values.OrderBy(m => m.Title).ToList();
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
