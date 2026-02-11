using Microsoft.EntityFrameworkCore;
using Posterr.Core.Entities;

namespace Posterr.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Post> Posts => Set<Post>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).HasMaxLength(50).IsRequired();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Content).HasMaxLength(777).IsRequired();
            entity.Property(p => p.CreatedAt).IsRequired();

            entity.HasOne(p => p.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.OriginalPost)
                .WithMany(p => p.Reposts)
                .HasForeignKey(p => p.OriginalPostId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(p => p.CreatedAt);
            entity.HasIndex(p => p.AuthorId);
            entity.HasIndex(p => p.OriginalPostId);
        });
    }
}
