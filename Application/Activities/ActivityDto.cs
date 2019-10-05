using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Application.Activities
{
    public class ActivityDto
    {
         public Guid Id { get; set; }
        public String Title { get; set; }
        public String Description { get; set; }
        public String Category { get; set; }
        public DateTime Date { get; set; }
        public String City { get; set; }
        public String Venue { get; set; }
        [JsonProperty("attendees")]        
        public ICollection<AttendeeDto> UserActivities { get; set; }
    }
}