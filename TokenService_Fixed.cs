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

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
                    new Claim(ClaimTypes.Email, user.Email ?? ""),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim("sub", user.Id),
                    new Claim("FirstName", user.FirstName),
                    new Claim("LastName", user.LastName),
                    new Claim("IsActive", user.IsActive.ToString())
                };

                if (!string.IsNullOrEmpty(user.Department))
                    claims.Add(new Claim("Department", user.Department));

                // Получаем роли пользователя (Distinct для исключения дублей)
                var roles = (await _userManager.GetRolesAsync(user)).Distinct().ToList();

                // Добавляем каждую роль как отдельный claim
                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                if (roles.Any())
                {
                    claims.Add(new Claim("roles", string.Join(",", roles)));
                    claims.Add(new Claim("isAdmin", roles.Contains("Admin").ToString().ToLower()));
                    claims.Add(new Claim("isModerator", roles.Contains("Moderator").ToString().ToLower()));
                    claims.Add(new Claim("isUser", roles.Contains("User").ToString().ToLower()));
                }

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
                return tokenHandler.WriteToken(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при генерации access токена для пользователя {UserId}", user.Id);
                throw new InvalidOperationException("Не удалось создать access токен", ex);
            }
        }

        public string GenerateRefreshToken()
        {
            try
            {
                var randomBytes = new byte[64];
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при генерации refresh токена");
                throw new InvalidOperationException("Не удалось создать refresh токен", ex);
            }
        }

        public ClaimsPrincipal? GetClaimsFromToken(string token)
        {
            try
            {
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
                    ClockSkew = TimeSpan.Zero,
                    RequireExpirationTime = true
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);

                if (validatedToken is not JwtSecurityToken jwtToken ||
                    !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public bool ValidateToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return false;
            try
            {
                var claims = GetClaimsFromToken(token);
                return claims != null;
            }
            catch
            {
                return false;
            }
        }

        public DateTime GetTokenExpiration(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token)) return DateTime.MinValue;
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                return jwtToken.ValidTo;
            }
            catch
            {
                return DateTime.MinValue;
            }
        }

        public string? GetUserIdFromToken(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token)) return null;
                var claims = GetClaimsFromToken(token);
                return claims?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            }
            catch
            {
                return null;
            }
        }

        public List<string> GetUserRolesFromToken(string token)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(token)) return new List<string>();
                var claims = GetClaimsFromToken(token);
                if (claims == null) return new List<string>();

                return claims.FindAll(ClaimTypes.Role)
                    .Select(c => c.Value)
                    .Where(role => !string.IsNullOrEmpty(role))
                    .Distinct()
                    .ToList();
            }
            catch
            {
                return new List<string>();
            }
        }

        public bool HasRole(string token, string role)
        {
            var roles = GetUserRolesFromToken(token);
            return roles.Contains(role, StringComparer.OrdinalIgnoreCase);
        }

        private string GetSecretKey()
        {
            var key = _configuration["JwtSettings:SecretKey"];
            if (string.IsNullOrEmpty(key) || key.Length < 32)
                throw new InvalidOperationException("JWT SecretKey отсутствует или слишком короткий");
            return key;
        }

        private double GetExpirationMinutes()
        {
            var configValue = _configuration["JwtSettings:ExpirationMinutes"];
            if (double.TryParse(configValue, System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture, out var minutes))
            {
                return (minutes <= 0 || minutes > 1440) ? 60 : minutes;
            }
            return 60;
        }

        private string GetIssuer() => _configuration["JwtSettings:Issuer"] ?? "Project_Server_Auth";
        private string GetAudience() => _configuration["JwtSettings:Audience"] ?? "Project_Client_Auth";
    }
}
