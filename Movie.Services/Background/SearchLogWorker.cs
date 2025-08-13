using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Movie.Services.Background
{
    // Infrastructure/SearchLogWorker.cs
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Movie.Data.Database;
    using Movie.Entities;

    public class SearchLogWorker : BackgroundService
    {
        private readonly ISearchLogQueue _queue;
        private readonly IServiceScopeFactory _scopeFactory;

        public SearchLogWorker(ISearchLogQueue queue, IServiceScopeFactory scopeFactory)
        {
            _queue = queue;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var log = await _queue.DequeueAsync(stoppingToken);

                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<MovieDbContext>();

                try
                {
                    // Upsert
                    var existing = await db.SearchHistories
                        .SingleOrDefaultAsync(h => h.UserId == log.UserId && h.SearchTerm == log.SearchTerm, stoppingToken);

                    if (existing is null)
                    {
                        db.SearchHistories.Add(new SearchHistory
                        {
                            UserId = log.UserId,
                            SearchTerm = log.SearchTerm,
                            SearchDate = DateTime.UtcNow
                        });
                    }
                    else
                    {
                        existing.SearchDate = DateTime.UtcNow;
                    }

                    await db.SaveChangesAsync(stoppingToken);

                    // Keep only latest 5 for this user
                    var oldIds = await db.SearchHistories
                        .Where(h => h.UserId == log.UserId)
                        .OrderByDescending(h => h.SearchDate)
                        .Select(h => h.Id)
                        .Skip(5)
                        .ToListAsync(stoppingToken);

                    if (oldIds.Count > 0)
                    {
                        await db.Database.ExecuteSqlInterpolatedAsync(
                            $"DELETE FROM SearchHistories WHERE Id IN ({oldIds})", stoppingToken);
                    }
                }
                catch (Exception)
                {
                    
                }
            }
        }
    }

}
