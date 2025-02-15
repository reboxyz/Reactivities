using System.Collections.Generic;
using Domain;
using Newtonsoft.Json;

namespace Application.Profiles
{
    public class Profile
    {
        public string DisplayName { get; set; }
        public string Username { get; set; }
        public string Image { get; set; }
        public string Bio { get; set; }

        [JsonProperty("following")]
        public bool IsFollowed { get; set;}  // Flag to signify the this User is being followed by the current logged User
        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public ICollection<Photo> Photos { get; set; }
    }
}