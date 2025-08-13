using Microsoft.AspNetCore.Identity;

namespace Movie.Entities
{
    public class MovieIdentityUser : IdentityUser
    {
        public string? FullName { get; set; }
   
    }
}
