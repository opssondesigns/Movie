using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movie.Entities
{
    public class MovieIdentityUser : IdentityUser
    {
        public string? FullName { get; set; }
   
    }
}
