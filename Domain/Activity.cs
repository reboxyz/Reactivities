using System;
using System.Collections.Generic;

namespace Domain
{
    public class Activity
    {
        public Guid Id { get; set; }
        public String Title { get; set; }
        public String Description { get; set; }
        public String Category { get; set; }
        public DateTime Date { get; set; }
        public String City { get; set; }
        public String Venue { get; set; }
        public virtual ICollection<UserActivity> UserActivities { get; set; } // Note! virtual is essential for lazy loading
        public virtual ICollection<Comment> Comments { get; set; }
    }
}