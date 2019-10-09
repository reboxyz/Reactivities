namespace Domain
{
    // Join table for many-to-many self-refencing entity class
    public class UserFollowing
    {
        public string ObserverId { get; set; }  // Note! Follower of TargetId
        public virtual AppUser Observer { get; set; }  // Navigational property
        public string TargetId { get; set; }   // Note! User that is being followed
        public virtual AppUser Target { get; set; }    // Navigational property
    }
}