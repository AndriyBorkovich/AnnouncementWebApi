using Microsoft.EntityFrameworkCore;

namespace AnnouncementWebApi.Models
{
    public class AnnouncementContext: DbContext
    {
        public AnnouncementContext(DbContextOptions<AnnouncementContext> options)
    : base(options)
        {

        }

        public DbSet<Announcement> Announcements { get; set; } = null!;

    }
}
