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
            {
                throw new InvalidOperationException("Пользователь с таким email уже существует");
            }

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
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Ошибка создания пользователя: {errors}");
            }

            await _userManager.AddToRoleAsync(user, "User");
            await LogActivityAsync(user.Id, ActivityAction.Register, true);

            var tokens = await GenerateTokensAsync(user);

            return new AuthResponseDto
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                ExpiresAt = tokens.ExpiresAt,
                User = MapToUserProfileDto(user)
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null || !user.IsActive)
            {
                await LogActivityAsync(null, ActivityAction.Login, false, "Пользователь не найден");
                throw new UnauthorizedAccessException("Неверные учетные данные");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, true);
            if (!result.Succeeded)
            {
                await LogActivityAsync(user.Id, ActivityAction.Login, false, "Неверный пароль");
                throw new UnauthorizedAccessException("Неверные учетные данные");
            }

            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);
            await LogActivityAsync(user.Id, ActivityAction.Login, true);

            var tokens = await GenerateTokensAsync(user);

            return new AuthResponseDto
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                ExpiresAt = tokens.ExpiresAt,
                User = MapToUserProfileDto(user)
            };
        }

        public async Task<bool> LogoutAsync(string userId, string? refreshToken = null)
        {
            try
            {
                if (!string.IsNullOrEmpty(refreshToken))
                {
                    var session = await _context.UserSessions
                        .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && !s.IsRevoked);

                    if (session != null)
                    {
                        session.IsRevoked = true;
                        session.RevokedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                    }
                }

                await LogActivityAsync(userId, ActivityAction.Logout, true);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при выходе пользователя {UserId}", userId);
                return false;
            }
        }

        public async Task<AuthResponseDto> RefreshTokenFromCookieAsync(string refreshToken)
        {
            var session = await _context.UserSessions
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && !s.IsRevoked);

            if (session == null || session.ExpiresAt <= DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Недействительный refresh токен");
            }

            session.IsRevoked = true;
            session.RevokedAt = DateTime.UtcNow;

            var tokens = await GenerateTokensAsync(session.User);
            await _context.SaveChangesAsync();

            return new AuthResponseDto
            {
                AccessToken = tokens.AccessToken,
                RefreshToken = tokens.RefreshToken,
                ExpiresAt = tokens.ExpiresAt,
                User = MapToUserProfileDto(session.User)
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(RefreshTokenDto refreshTokenDto)
        {
            return await RefreshTokenFromCookieAsync(refreshTokenDto.RefreshToken);
        }

        public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("Пользователь не найден");

            var result = await _userManager.ChangePasswordAsync(user, changePasswordDto.CurrentPassword,
                changePasswordDto.NewPassword);
            if (!result.Succeeded)
            {
                await LogActivityAsync(userId, ActivityAction.ChangePassword, false);
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Ошибка смены пароля: {errors}");
            }

            await LogActivityAsync(userId, ActivityAction.ChangePassword, true);
            return true;
        }

        public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return user != null ? MapToUserProfileDto(user) : null;
        }

        private async Task<TokenResult> GenerateTokensAsync(ApplicationUser user)
        {
            var accessToken = await _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddMinutes(60);

            var session = new UserSession
            {
                UserId = user.Id,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(30),
                IsRevoked = false
            };

            _context.UserSessions.Add(session);
            await _context.SaveChangesAsync();

            return new TokenResult
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt
            };
        }

        private UserProfileDto MapToUserProfileDto(ApplicationUser user)
        {
            return new UserProfileDto
            {
                FullName = user.FullName,
                Email = user.Email ?? "",
                Department = user.Department,
                Avatar = user.Avatar,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLogin = user.LastLogin
            };
        }

        private async Task LogActivityAsync(string? userId, ActivityAction action, bool success, string? details = null)
        {
            try
            {
                var log = new ActivityLog
                {
                    UserId = userId ?? "Unknown",
                    Action = action,
                    Success = success,
                    Details = details,
                    Timestamp = DateTime.UtcNow
                };

                _context.ActivityLogs.Add(log);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при логировании активности");
            }
        }

        private class TokenResult
        {
            public string AccessToken { get; set; } = string.Empty;
            public string RefreshToken { get; set; } = string.Empty;
            public DateTime ExpiresAt { get; set; }
        }
    }
}