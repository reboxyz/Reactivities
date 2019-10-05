namespace Infrastructure.Photos
{
    public class CloudinarySettings
    {
        // Note! In the Configuration, this is set as follows: Cloudinary:CloudName, Cloudinary:ApiSecret, Cloudinary:ApiSecret which
        // we can refer the "Cloudinary" as section
        public string CloudName { get; set; }
        public string ApiKey { get; set; }
        public string ApiSecret { get; set; }   
    }
}