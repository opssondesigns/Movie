namespace Movie.Services.Background
{
    public interface ISearchLogQueue
    {
        ValueTask EnqueueAsync(SearchLog item, CancellationToken ct = default);
        ValueTask<SearchLog> DequeueAsync(CancellationToken ct);
    }

    public record SearchLog(string? UserId, string? SearchTerm);

}
