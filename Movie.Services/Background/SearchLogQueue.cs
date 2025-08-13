using System.Threading.Channels;

namespace Movie.Services.Background
{
    

    public class SearchLogQueue : ISearchLogQueue
    {
        private readonly Channel<SearchLog> _queue =
            Channel.CreateBounded<SearchLog>(new BoundedChannelOptions(512)
            {
                SingleReader = true,
                SingleWriter = false,
                FullMode = BoundedChannelFullMode.DropOldest
            });

        public ValueTask EnqueueAsync(SearchLog item, CancellationToken ct = default)
            => _queue.Writer.WriteAsync(item, ct);

        public ValueTask<SearchLog> DequeueAsync(CancellationToken ct)
            => _queue.Reader.ReadAsync(ct);
    }

}
