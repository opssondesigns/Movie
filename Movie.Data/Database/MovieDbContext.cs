using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Movie.Entities;

namespace Movie.Data.Database
{
    public class MovieDbContext : IdentityDbContext<MovieIdentityUser>
    {
        protected readonly IConfiguration Configuration = null!;

        public MovieDbContext()
        {
        }

        public MovieDbContext(DbContextOptions<MovieDbContext> options)
           : base(options)
        {
        }

        //public DbSet<MovieItem> Movies { get; set; }
        public DbSet<SearchHistory> SearchHistories { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                IConfigurationRoot configuration = new ConfigurationBuilder()
                    .SetBasePath(Directory.GetParent(AppContext.BaseDirectory)!.FullName)
                    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                    .Build();

                optionsBuilder.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    options => options.EnableRetryOnFailure(10, TimeSpan.FromSeconds(30), null)
                );
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            //modelBuilder.Entity<SearchHistory>(entity =>
            //{
            //    entity.HasKey(e => e.Id);
            //    entity.Property(e => e.UserId)
            //            .HasMaxLength(255); ;

            //    entity.Property(e => e.SearchTerm)
            //        .HasMaxLength(255);

            //    entity.Property(e => e.SearchDate)
            //        .HasDefaultValueSql("GETUTCDATE()");             

            //    entity.ToTable("SearchHistory");
            //});

            // In OnModelCreating of your DbContext
            modelBuilder.Entity<SearchHistory>()
                .HasIndex(x => new { x.UserId, x.SearchTerm })
                .IsUnique();



        }

    }
}
