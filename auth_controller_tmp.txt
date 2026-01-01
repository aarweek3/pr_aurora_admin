// Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using pr_srv_names.Dtos;
using pr_srv_names.Services.Interfaces;

namespace pr_srv_names.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _authService = authService;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _authService.RegisterAsync(registerDto);

                // Устанавливаем оба токена в HttpOnly cookies
                SetTokenCookies(result.AccessToken, result.RefreshToken);

                // Не возвращаем токены в ответе
                var response = new
                {
                    success = true,
                    data = new
                    {
                        user = result.User
                    }
                };

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при регистрации");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _authService.LoginAsync(loginDto);

                // Устанавливаем оба токена в HttpOnly cookies
                SetTokenCookies(result.AccessToken, result.RefreshToken);

                _logger.LogInformation("Токены установлены в cookies для пользователя {Email}", loginDto.Email);

                // Не возвращаем токены в ответе
                var response = new
                {
                    success = true,
                    data = new
                    {
                        user = result.User
                    }
                };

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при входе");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                    return Unauthorized();

                var refreshToken = Request.Cookies["refreshToken"];
                await _authService.LogoutAsync(userId, refreshToken);

                // Удаляем токены из cookies
                ClearTokenCookies();

                return Ok(new { success = true, message = "Выход выполнен успешно" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при выходе");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            try
            {
                var refreshToken = Request.Cookies["refreshToken"];

                if (string.IsNullOrEmpty(refreshToken))
                {
                    _logger.LogWarning("Refresh token cookie не найден");
                    return Unauthorized(new { success = false, message = "Refresh token не найден" });
                }

                var result = await _authService.RefreshTokenFromCookieAsync(refreshToken);

                // Устанавливаем новые токены в cookies
                SetTokenCookies(result.AccessToken, result.RefreshToken);

                var response = new
                {
                    success = true,
                    data = new
                    {
                        user = result.User
                    }
                };

                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                ClearTokenCookies();
                return Unauthorized(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении токена");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                    return Unauthorized();

                var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);
                return Ok(new { success = result, message = "Пароль успешно изменен" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при смене пароля");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null)
                    return Unauthorized();

                var profile = await _authService.GetUserProfileAsync(userId);
                if (profile == null)
                    return NotFound(new { success = false, message = "Профиль не найден" });

                return Ok(new { success = true, data = profile });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении профиля");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        private void SetTokenCookies(string accessToken, string refreshToken)
        {
            var isDevelopment = _configuration.GetValue<bool>("Development:AllowInsecureCookies");

            // Access token cookie (короткий срок)
            var accessTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(1),
                Path = "/"
            };

            // Refresh token cookie (длинный срок)
            var refreshTokenOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !isDevelopment,
                SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddDays(30),
                Path = "/"
            };

            Response.Cookies.Append("accessToken", accessToken, accessTokenOptions);
            Response.Cookies.Append("refreshToken", refreshToken, refreshTokenOptions);

            _logger.LogDebug("Токены установлены в cookies: Access={HasAccess}, Refresh={HasRefresh}",
                !string.IsNullOrEmpty(accessToken), !string.IsNullOrEmpty(refreshToken));
        }

        private void ClearTokenCookies()
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = !_configuration.GetValue<bool>("Development:AllowInsecureCookies"),
                SameSite = SameSiteMode.Strict,
                Path = "/",
                Expires = DateTime.UtcNow.AddDays(-1)
            };

            Response.Cookies.Append("accessToken", "", cookieOptions);
            Response.Cookies.Append("refreshToken", "", cookieOptions);

            _logger.LogDebug("Токены удалены из cookies");
        }

        [HttpGet("debug-raw-token")]
        public IActionResult DebugRawToken()
        {
            var accessToken = Request.Cookies["accessToken"];
            if (string.IsNullOrEmpty(accessToken))
            {
                return Ok(new { hasToken = false, message = "No access token in cookies" });
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var token = handler.ReadJwtToken(accessToken);

                var claims = token.Claims.Select(c => new { c.Type, c.Value }).ToList();
                var roles = token.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList();

                return Ok(new
                {
                    hasToken = true,
                    expires = token.ValidTo,
                    claims = claims,
                    roles = roles,
                    tokenLength = accessToken.Length
                });
            }
            catch (Exception ex)
            {
                return Ok(new { hasToken = true, error = ex.Message, tokenLength = accessToken.Length });
            }
        }

        [HttpGet("debug-token")]
        [Authorize]
        public IActionResult DebugToken()
        {
            try
            {
                var claims = User.Claims.Select(c => new
                {
                    Type = c.Type ?? "unknown",
                    Value = c.Value ?? "null"
                }).ToList();

                var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var email = User.FindFirst(ClaimTypes.Email)?.Value;

                // Добавляем время истечения токена
                var exp = User.FindFirst("exp")?.Value;
                DateTime? expiresAt = null;

                if (long.TryParse(exp, out var expUnix))
                {
                    expiresAt = DateTimeOffset.FromUnixTimeSeconds(expUnix).DateTime;
                }

                return Ok(new
                {
                    success = true,
                    claims = claims,
                    roles = roles,
                    userId = userId ?? "unknown",
                    email = email ?? "unknown",
                    expiresAt = expiresAt?.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                    claimsCount = claims.Count,
                    isAuthenticated = User.Identity?.IsAuthenticated == true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка в debug-token endpoint");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Internal server error",
                    error = ex.Message
                });
            }
        }

        [HttpGet("debug-cookies")]
        public IActionResult DebugCookies()
        {
            try
            {
                var cookies = new Dictionary<string, object>();

                foreach (var cookie in Request.Cookies)
                {
                    var value = cookie.Value;
                    cookies[cookie.Key] = new
                    {
                        exists = !string.IsNullOrEmpty(value),
                        length = value?.Length ?? 0,
                        preview = value?.Length > 50 ? value.Substring(0, 50) + "..." : value
                    };
                }

                var hasAccessToken = Request.Cookies.ContainsKey("accessToken") &&
                                   !string.IsNullOrEmpty(Request.Cookies["accessToken"]);
                var hasRefreshToken = Request.Cookies.ContainsKey("refreshToken") &&
                                    !string.IsNullOrEmpty(Request.Cookies["refreshToken"]);

                _logger.LogInformation("Cookie debug: Access={HasAccess}, Refresh={HasRefresh}",
                    hasAccessToken, hasRefreshToken);

                return Ok(new
                {
                    success = true,
                    cookies = cookies,
                    hasAccessToken = hasAccessToken,
                    hasRefreshToken = hasRefreshToken,
                    cookieCount = Request.Cookies.Count,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка в debug-cookies endpoint");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Internal server error",
                    error = ex.Message
                });
            }
        }

        // === 2. СОЗДАНИЕ ТЕСТОВЫХ ENDPOINTS НА СЕРВЕРЕ ===
        // Добавьте в AuthController.cs:

        [HttpGet("test-401")]
        public IActionResult Test401()
        {
            return Unauthorized(new
            {
                success = false,
                message = "Test 401 endpoint - unauthorized access",
                status = 401
            });
        }

        [HttpGet("test-403")]
        [Authorize]
        public IActionResult Test403()
        {
            // Проверяем роль, которой у пользователя точно нет
            if (!User.IsInRole("SuperAdmin"))
            {
                return Forbid();
            }

            return Ok(new
            {
                success = true,
                message = "Access granted"
            });
        }
    }



}