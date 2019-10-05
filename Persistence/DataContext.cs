//using System;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class DataContext: IdentityDbContext<AppUser> //DbContext
    {
        public DataContext(DbContextOptions options): base(options)
        {
        }

        public DbSet<Value> Values { get; set; }
        public DbSet<Activity> Activities { get; set; }
        public DbSet<UserActivity> UserActivities { get; set; }


        protected override void OnModelCreating(ModelBuilder builder) {
            base.OnModelCreating(builder);  // Important setup for IdentityUser

            builder.Entity<Value>()
                .HasData(
                    new Value{Id = 1, Name = "Value 101"},
                    new Value{Id = 2, Name = "Value 102"},
                    new Value{Id = 3, Name = "Value 103"}
                );

            // Define the Primary Key of  'UserActivity' Entity
            builder.Entity<UserActivity>(x => x.HasKey(ua => new { ua.AppUserId, ua.ActivityId}));   

            // Define relationship of 'AppUser' and 'Activity'
            // First half of the relationship: UserActivity in relation to AppUser
            builder.Entity<UserActivity>()
                .HasOne(u => u.AppUser)
                .WithMany(a => a.UserActivities)
                .HasForeignKey(u => u.AppUserId);

            // Second half of the relationship: UserActivity in relation to Activity
            builder.Entity<UserActivity>()
                .HasOne(a => a.Activity)
                .WithMany(u => u.UserActivities)
                .HasForeignKey(a => a.ActivityId);

        }
    }
}
