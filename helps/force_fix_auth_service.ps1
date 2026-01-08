
$path = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Services\AuthService.cs'
$code = @"
// Services/AuthService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using DAL;
using DAL.Enums;
using DAL.Models;
using pr_srv_names.Dtos;
using pr_srv_names.Services.Interfaces;

namespace pr_srv_names.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;
        private readonly ITokenService _tokenService;

        public AuthService(
            AppDbContext context,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            ILogger<AuthService> logger,
            ITokenService tokenService)
        {
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            if (await _userManager.FindByEmailAsync(registerDto.Email) != null)
                throw new InvalidOperationException("Email already exists");

            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) throw new InvalidOperationException("Failed to create user");

            await _userManager.AddToRoleAsync(user, "User");
            var tokens = await GenerateTokensAsync(user);
            var roles = (await _userManager.GetRolesAsync(user)).Distinct().ToList();

            return new AuthResponseDto
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                ExpiresAt = tokens.ExpiresAt,
                User = MapToUserProfileDto(user, roles)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null || !user.IsActive) throw new UnauthorizedAccessException("Unauthorized");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, true);
            if (!result.Succeeded) throw new UnauthorizedAccessException("Unauthorized");

            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var tokens = await GenerateTokensAsync(user);
            var roles = (await _userManager.GetRolesAsync(user)).Distinct().ToList();

            return new AuthResponseDto
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                ExpiresAt = tokens.ExpiresAt,
                User = MapToUserProfileDto(user, roles)
            };
        }

        public async Task<bool> LogoutAsync(string userId, string? refreshToken = null)
        {
            if (!string.IsNullOrEmpty(refreshToken))
            {
                var session = await _context.UserSessions.FirstOrDefaultAsync(s => s.RefreshToken == refreshToken);
                if (session != null) { session.IsRevoked = true; await _context.SaveChangesAsync(); }
            }
            return true;
        }

        public async Task<AuthResponseDto> RefreshTokenFromCookieAsync(string refreshToken)
        {
            var session = await _context.UserSessions.Include(s => s.User).FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && !s.IsRevoked);
            if (session == null || session.ExpiresAt <= DateTime.UtcNow) throw new UnauthorizedAccessException("Invalid refresh token");

            session.IsRevoked = true;
            var tokens = await GenerateTokensAsync(session.User);
            var roles = (await _userManager.GetRolesAsync(session.User)).Distinct().ToList();
            return new AuthResponseDto { AccessToken = tokens.AccessToken, RefreshToken = tokens.RefreshToken, ExpiresAt = tokens.ExpiresAt, User = MapToUserProfileDto(session.User, roles) };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto dto) => await RefreshTokenFromCookieAsync(dto.RefreshToken);

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;
            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            return result.Succeeded;
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;
            var roles = (await _userManager.GetRolesAsync(user)).Distinct().ToList();
            return MapToUserProfileDto(user, roles);
        }

        private async Task<TokenResult> GenerateTokensAsync(ApplicationUser user)
        {
            var accessToken = await _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var session = new UserSession { UserId = user.Id, RefreshToken = refreshToken, ExpiresAt = DateTime.UtcNow.AddDays(30), IsRevoked = false };
            _context.UserSessions.Add(session);
            await _context.SaveChangesAsync();
            return new TokenResult { AccessToken = accessToken, RefreshToken = refreshToken, ExpiresAt = DateTime.UtcNow.AddMinutes(60) };
        }

        private UserProfileDto MapToUserProfileDto(ApplicationUser user, IList<string> roles) => new UserProfileDto
        {
            FullName = user.FullName, Email = user.Email ?? "", Department = user.Department, Avatar = user.Avatar,
            IsActive = user.IsActive, CreatedAt = user.CreatedAt, LastLogin = user.LastLogin, Roles = roles.Distinct().ToList()
        };

        private class TokenResult { public string AccessToken { get; set; } = ""; public string RefreshToken { get; set; } = ""; public DateTime ExpiresAt { get; set; } }
    }
}
"@
[System.IO.File]::WriteAllText($path, $code, [System.Text.Encoding]::UTF8)
Write-Output "Fixed AuthService.cs with clean UTF8 write"
