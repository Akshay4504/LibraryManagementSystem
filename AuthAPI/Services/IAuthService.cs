using AuthAPI.Models;

namespace AuthAPI.Services
{
    public interface IAuthService
    {
        /// <summary>
        /// Registers a new user with the given role.
        /// Returns (statusCode, message).
        /// </summary>
        Task<(int, string)> Register(RegisterModel model, string role);

        /// <summary>
        /// Logs in a user and returns (statusCode, jwtToken).
        /// </summary>
        Task<(int, string)> Login(LoginModel model);
    }
}