// Services/TokenService.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DAL.Models;
using pr_srv_names.Services.Interfaces;

namespace pr_srv_names.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<TokenService> _logger;
        private readonly UserManager<ApplicationUser> _userManager;

        public TokenService(
            IConfiguration configuration,
            ILogger<TokenService> logger,
            UserManager<ApplicationUser> userManager)
        {
            _configuration = configuration;
            _logger = logger;
            _userManager = userManager;
        }

        public async Task<string> GenerateAccessToken(ApplicationUser user)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(GetSecretKey());

                // Получаем уникальный список ролей
                var roles = (await _userManager.GetRolesAsync(user)).Distinct().ToList();

                var claims = new List<Claim>
                {
                    // Использование стандартных ClaimTypes для совместимости с ASP.NET Core Identity
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email ?? ""),
                    new Claim(ClaimTypes.Name, user.FullName),

                    // Стандартные JWT клеймы
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),

                    // Дополнительные данные
                    new Claim("FirstName", user.FirstName ?? ""),
                    new Claim("LastName", user.LastName ?? ""),
                    new Claim("IsActive", user.IsActive.ToString().ToLower())
                };

                if (!string.IsNullOrEmpty(user.Department))
                    claims.Add(new Claim("Department", user.Department));

                // Добавляем роли (по одной записи на каждую роль, без дублей)
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                // Вспомогательные булевы клеймы (удобно для фронтенда)
                claims.Add(new Claim("isAdmin", roles.Contains("Admin").ToString().ToLower()));
                claims.Add(new Claim("isModerator", roles.Contains("Moderator").ToString().ToLower()));

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddMinutes(GetExpirationMinutes()),
                    SigningCredentials = new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature),
                    Issuer = GetIssuer(),
                    Audience = GetAudience()
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                _logger.LogInformation("JWT Access Token generated for user {Email}. Roles: {Roles}",
                    user.Email, string.Join(", ", roles));

                return tokenString;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating access token for user {UserId}", user.Id);
                throw;
            }
        }

        public string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        public ClaimsPrincipal? GetClaimsFromToken(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token)) return null;

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(GetSecretKey());

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = GetIssuer(),
                    ValidateAudience = true,
                    ValidAudience = GetAudience(),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                // ВАЖНО: При получении Claims из токена, ASP.NET может автоматически маппить короткие имена в длинные.
                // Если мы хотим чистоты, мы можем отключить DefaultInboundClaimTypeMap,
                // но здесь мы просто возвращаем Principal как есть.
                return tokenHandler.ValidateToken(token, validationParameters, out _);
            }
            catch (Exception ex)
            {
                _logger.LogDebug("Token validation failed: {Message}", ex.Message);
                return null;
            }
        }

        public bool ValidateToken(string token) => GetClaimsFromToken(token) != null;

        public DateTime GetTokenExpiration(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                return jwtToken.ValidTo;
            }
            catch { return DateTime.MinValue; }
        }

        public string? GetUserIdFromToken(string token) =>
            GetClaimsFromToken(token)?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        public List<string> GetUserRolesFromToken(string token)
        {
            var principal = GetClaimsFromToken(token);
            if (principal == null) return new List<string>();

            return principal.FindAll(ClaimTypes.Role)
                .Select(c => c.Value)
                .Distinct()
                .ToList();
        }

        public bool HasRole(string token, string role) =>
            GetUserRolesFromToken(token).Contains(role, StringComparer.OrdinalIgnoreCase);

        private string GetSecretKey() => _configuration["JwtSettings:SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey missing");
        private double GetExpirationMinutes() =>
            double.TryParse(_configuration["JwtSettings:ExpirationMinutes"], out var min) ? min : 60;
        private string GetIssuer() => _configuration["JwtSettings:Issuer"] ?? "Project_Server_Auth";
        private string GetAudience() => _configuration["JwtSettings:Audience"] ?? "Project_Client_Auth";
    }
}
