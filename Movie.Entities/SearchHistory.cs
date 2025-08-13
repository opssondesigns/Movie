using System.Text.Json.Serialization;
using System.Collections.Generic;
using Movie.Entities;
namespace Movie.Entities;

public class SearchHistory
{
    public int Id { get; set; }
    public string? UserId { get; set; } 

    public string? SearchTerm { get; set; }
    public DateTime SearchDate { get; set; }
}

