using AuthAPI.Models;
using AuthAPI.Services;
using Microsoft.AspNetCore.Mvc;

namespace AuthAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // POST: api/auth/register
        // Body: { "fullName": "John", "email": "john@email.com", "password": "Pass@123" }
        // role passed as query param: ?role=Admin or ?role=User
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model, [FromQuery] string role = "User")
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (status, message) = await _authService.Register(model, role);
            if (status == 0) return BadRequest(message);
            return Ok(new { Message = message });
        }

        // POST: api/auth/login
        // Body: { "email": "john@email.com", "password": "Pass@123" }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var (status, token) = await _authService.Login(model);
            if (status == 0) return Unauthorized(new { Message = token });
            return Ok(new { Token = token });
        }
    }
}