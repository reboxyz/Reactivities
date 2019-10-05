using System;

namespace Domain
{
    // Join Table for User and Activity which is Many-to-Many relationship
    public class UserActivity
    {
        public string AppUserId { get; set;}
        public virtual AppUser AppUser { get; set;}  // Note! virtual in the navigation property is essential for lazy loading
        public Guid ActivityId { get; set; }
        public virtual Activity Activity { get; set; } // Note! virtual in the navigation property is essential for lazy loading
        public DateTime DateJoined { get; set; }
        public bool IsHost { get; set; }
    }
}