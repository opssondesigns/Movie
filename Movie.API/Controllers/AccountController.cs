using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Movie.Entities;
using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<MovieIdentityUser> _userManager;
    private readonly SignInManager<MovieIdentityUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AccountController(UserManager<MovieIdentityUser> userManager, SignInManager<MovieIdentityUser> signInManager, IConfiguration configuration)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = new MovieIdentityUser { UserName = model.email, Email = model.email, FullName= model.fullName };
        var result = await _userManager.CreateAsync(user, model.password);
        if (result.Succeeded)
        {
            return Ok(new { message = "User registered successfully" });
        }
        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(model.email);
        if (user != null && await _userManager.CheckPasswordAsync(user, model.password))
        {

            HttpContext.Session.SetString("UserId", user.Id);
            HttpContext.Session.SetString("Email", user.Email);
            HttpContext.Session.SetString("Name", user.FullName);


            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim("FullName", user.FullName ?? user.UserName ?? user.Email ?? "")
        };
            var identity = new ClaimsIdentity(claims, IdentityConstants.ApplicationScheme);
            var principal = new ClaimsPrincipal(identity);


            await HttpContext.SignInAsync(IdentityConstants.ApplicationScheme, principal);

            return Ok(new { message = "Logged in successfully" });
        }
        return Unauthorized("Invalid username or password");
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var Name = User.Claims.FirstOrDefault(c => c.Type == "FullName")?.Value;

        var userInfo = new
        {
            FullName = Name,
            Claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
        };

        
        return Ok(userInfo);
    }

    //[HttpPost("logout")]
    //public async Task<IActionResult> Logout()
    //{
    //    await _signInManager.SignOutAsync();
    //    return Ok(new { message = "Logged out" });
    //}


    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        // 1) Sign out of Identity’s app cookie (same scheme that signed in)
        await HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);

        // 2) Also sign out via SignInManager (covers other Identity bits)
        await _signInManager.SignOutAsync();

        // 3) Clear session data
        HttpContext.Session.Clear();

        // 4) Belt-and-suspenders: delete possible cookie names by hand
        //    (use the exact names you configured in Program.cs)
        Response.Cookies.Delete(".MovieHub.Auth", new CookieOptions { Path = "/" });
        Response.Cookies.Delete(".AspNetCore.Identity.Application", new CookieOptions { Path = "/" }); // legacy, just in case
        Response.Cookies.Delete(".MovieHub.Session", new CookieOptions { Path = "/" });
        Response.Cookies.Delete(".AspNetCore.Session", new CookieOptions { Path = "/" });

        // 5) No content, no redirects (prevents browser caching weirdness)
        return NoContent(); // 204
    }

}


public class RegisterDto
{
    public string email { get; set; }
    public string password { get; set; }
    public string fullName { get; set; }
}

public class LoginDto
{
    public string email { get; set; }
    public string password { get; set; }
}
