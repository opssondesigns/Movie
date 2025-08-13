namespace Movie.Entities;

public class SearchHistory
{
    public int Id { get; set; }
    public string? UserId { get; set; } 

    public string SearchTerm { get; set; }
    public DateTime SearchDate { get; set; }
}

