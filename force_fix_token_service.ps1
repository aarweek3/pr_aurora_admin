
$path = 'D:\_PROGECT\pr_srv_names\Project_Server_Auth\Services\TokenService.cs'
$code = @"
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

                var roles = (await _userManager.GetRolesAsync(user)).Distinct().ToList();

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
                _logger.LogError(ex, "Error generating access token");
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

                return tokenHandler.ValidateToken(token, validationParameters, out _);
            }
            catch { return null; }
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

        public List<string> GetUserRolesFromToken(string token) =>
            GetClaimsFromToken(token)?.FindAll(ClaimTypes.Role).Select(c => c.Value).Distinct().ToList() ?? new List<string>();

        public bool HasRole(string token, string role) =>
            GetUserRolesFromToken(token).Contains(role, StringComparer.OrdinalIgnoreCase);

        private string GetSecretKey() => _configuration["JwtSettings:SecretKey"] ?? throw new InvalidOperationException("SecretKey missing");
        private double GetExpirationMinutes() => double.TryParse(_configuration["JwtSettings:ExpirationMinutes"], out var min) ? min : 60;
        private string GetIssuer() => _configuration["JwtSettings:Issuer"] ?? "Project_Server_Auth";
        private string GetAudience() => _configuration["JwtSettings:Audience"] ?? "Project_Client_Auth";
    }
}
"@

[System.IO.File]::WriteAllText($path, $code, [System.Text.Encoding]::UTF8)
Write-Output "Fixed TokenService.cs with clean UTF8 write"
