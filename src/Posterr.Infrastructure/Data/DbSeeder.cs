using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Posterr.Core.Entities;

namespace Posterr.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        await context.Database.MigrateAsync();
        logger.LogInformation("Database migrations applied successfully.");

        if (await context.Users.AnyAsync())
        {
            logger.LogInformation("Database already seeded.");
            return;
        }

        var users = new List<User>
        {
            new() { Id = Guid.NewGuid(), Username = "alice_johnson", CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Username = "john_doe", CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Username = "jane_smith", CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), Username = "bob_wilson", CreatedAt = DateTime.UtcNow }
        };

        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        logger.LogInformation("Database seeded with {Count} users.", users.Count);
    }
}
