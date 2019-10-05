using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;

namespace Domain
{
    public class AppUser: IdentityUser
    {
        public string DisplayName { get; set; }
        public string Bio { get; set; }
        // Many-to-Many
        public virtual ICollection<UserActivity> UserActivities { get; set; }  // Note! virtual is essential for lazy loading
        // One-to-Many
        public virtual ICollection<Photo> Photos { get; set; } // Note! AppUserId field will be automatically added in the 'Photos' table
    }
}