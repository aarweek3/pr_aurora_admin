//namespace Project_Server_Auth.Extensions
//{
//    public static class CorsExtensions
//    {
//        public static IServiceCollection AddCorsConfiguration(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
//        {
//            var corsSettings = GetCorsSettings(configuration, environment);

//            services.AddCors(options =>
//            {
//                options.AddPolicy("AngularPolicy", policy =>
//                {
//                    policy.WithOrigins(corsSettings.AllowedOrigins)
//                          .AllowAnyMethod()
//                          .AllowAnyHeader()
//                          .AllowCredentials();
//                });

//                options.AddPolicy("StrictPolicy", policy =>
//                {
//                    policy.WithOrigins(corsSettings.ProductionOrigins)
//                          .WithMethods("GET", "POST", "PUT", "DELETE")
//                          .WithHeaders("Content-Type", "Authorization")
//                          .AllowCredentials();
//                });

//                if (environment.IsDevelopment())
//                {
//                    options.AddPolicy("DevelopmentPolicy", policy =>
//                    {
//                        policy.WithOrigins(corsSettings.AllowedOrigins)
//                              .AllowAnyMethod()
//                              .AllowAnyHeader()
//                              .AllowCredentials()
//                              .SetPreflightMaxAge(TimeSpan.FromDays(1));
//                    });
//                }
//            });

//            services.AddSingleton(corsSettings);
//            return services;
//        }

//        public static WebApplication UseCorsConfiguration(this WebApplication app, IWebHostEnvironment environment)
//        {
//            // Применяем CORS-политику до маршрутизации
//            if (environment.IsDevelopment())
//            {
//                app.UseCors("DevelopmentPolicy");
//            }
//            else if (environment.IsProduction())
//            {
//                app.UseCors("StrictPolicy");
//            }
//            else
//            {
//                app.UseCors("AngularPolicy");
//            }

//            // Явная обработка preflight-запросов
//            app.Use(async (context, next) =>
//            {
//                var logger = context.RequestServices.GetService<ILogger<Program>>();
//                logger?.LogInformation("CORS: Entering middleware for Origin={Origin}, Path={Path}, Method={Method}",
//                    context.Request.Headers["Origin"], context.Request.Path, context.Request.Method);

//                if (context.Request.Method == "OPTIONS")
//                {
//                    logger?.LogInformation("CORS: Handling preflight request");
//                    context.Response.StatusCode = StatusCodes.Status204NoContent;
//                    context.Response.Headers["Access-Control-Allow-Origin"] = context.Request.Headers["Origin"];
//                    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
//                    context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
//                    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
//                    context.Response.Headers["Access-Control-Max-Age"] = "86400";
//                    context.Response.Headers["Access-Control-Expose-Headers"] = "Access-Control-Allow-Origin,Access-Control-Allow-Methods,Access-Control-Allow-Headers,Access-Control-Allow-Credentials,Access-Control-Max-Age";
//                    logger?.LogInformation("CORS: Handled preflight request with headers={Headers}",
//                        string.Join(", ", context.Response.Headers.Select(h => $"{h.Key}={h.Value}")));
//                    return;
//                }

//                await next();

//                logger?.LogInformation("CORS: Response Headers={Headers}",
//                    string.Join(", ", context.Response.Headers.Select(h => $"{h.Key}={h.Value}")));
//            });

//            return app;
//        }

//        public static WebApplication AddCorsCookieSupport(this WebApplication app, IWebHostEnvironment environment)
//        {
//            return app;
//        }

//        public static WebApplication AddCookieModificationMiddleware(this WebApplication app, IWebHostEnvironment environment)
//        {
//            if (!environment.IsDevelopment())
//                return app;

//            app.Use(async (context, next) =>
//            {
//                context.Response.OnStarting(() =>
//                {
//                    if (context.Response.Headers.ContainsKey("Set-Cookie"))
//                    {
//                        var cookies = context.Response.Headers["Set-Cookie"].ToList();
//                        var modified = false;

//                        for (int i = 0; i < cookies.Count; i++)
//                        {
//                            if (cookies[i].Contains("accessToken") || cookies[i].Contains("refreshToken"))
//                            {
//                                cookies[i] = cookies[i].Replace("; Secure", "").Replace("; SameSite=None", "; SameSite=Lax");
//                                modified = true;
//                            }
//                        }

//                        if (modified)
//                            context.Response.Headers["Set-Cookie"] = cookies.ToArray();
//                    }
//                    return Task.CompletedTask;
//                });

//                await next();
//            });

//            return app;
//        }

//        private static CorsSettings GetCorsSettings(IConfiguration configuration, IWebHostEnvironment environment)
//        {
//            var settings = new CorsSettings
//            {
//                AllowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? GetDefaultAllowedOrigins(environment),
//                ProductionOrigins = configuration.GetSection("Cors:ProductionOrigins").Get<string[]>() ?? new[] { "https://yourdomain.com" }
//            };

//            return settings;
//        }

//        private static string[] GetDefaultAllowedOrigins(IWebHostEnvironment environment)
//        {
//            if (environment.IsDevelopment())
//                return new[] { "http://localhost:4200", "https://localhost:4200" };
//            return Array.Empty<string>();
//        }
//    }

//    public class CorsSettings
//    {
//        public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
//        public string[] ProductionOrigins { get; set; } = Array.Empty<string>();
//    }
//}

namespace pr_srv_names.Extensions
{
    public static class CorsExtensions
    {
        public static IServiceCollection AddCorsConfiguration(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            var corsSettings = GetCorsSettings(configuration, environment);

            services.AddCors(options =>
            {
                options.AddPolicy("AngularPolicy", policy =>
                {
                    policy.WithOrigins(corsSettings.AllowedOrigins)
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });

                options.AddPolicy("StrictPolicy", policy =>
                {
                    policy.WithOrigins(corsSettings.ProductionOrigins)
                          .WithMethods("GET", "POST", "PUT", "DELETE")
                          .WithHeaders("Content-Type", "Authorization")
                          .AllowCredentials();
                });

                if (environment.IsDevelopment())
                {
                    options.AddPolicy("DevelopmentPolicy", policy =>
                    {
                        policy.WithOrigins(corsSettings.AllowedOrigins)
                              .AllowAnyMethod()
                              .AllowAnyHeader()
                              .AllowCredentials()
                              .SetPreflightMaxAge(TimeSpan.FromDays(1));
                    });
                }
            });

            services.AddSingleton(corsSettings);
            return services;
        }

        public static WebApplication UseCorsConfiguration(this WebApplication app, IWebHostEnvironment environment)
        {
            // Применяем CORS-политику до маршрутизации
            if (environment.IsDevelopment())
            {
                app.UseCors("DevelopmentPolicy");
            }
            else if (environment.IsProduction())
            {
                app.UseCors("StrictPolicy");
            }
            else
            {
                app.UseCors("AngularPolicy");
            }

            // Явная обработка CORS
            app.Use(async (context, next) =>
            {
                var logger = context.RequestServices.GetService<ILogger<Program>>();
                logger?.LogInformation("CORS: Entering middleware for Origin={Origin}, Path={Path}, Method={Method}",
                    context.Request.Headers["Origin"], context.Request.Path, context.Request.Method);

                if (context.Request.Method == "OPTIONS")
                {
                    logger?.LogInformation("CORS: Handling preflight request");
                    context.Response.StatusCode = StatusCodes.Status204NoContent;
                    context.Response.Headers["Access-Control-Allow-Origin"] = context.Request.Headers["Origin"];
                    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
                    context.Response.Headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With";
                    context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                    context.Response.Headers["Access-Control-Max-Age"] = "86400";
                    context.Response.Headers["Access-Control-Expose-Headers"] =
                        "Access-Control-Allow-Origin,Access-Control-Allow-Methods,Access-Control-Allow-Headers,Access-Control-Allow-Credentials,Access-Control-Max-Age";
                    logger?.LogInformation("CORS: Handled preflight request with headers={Headers}",
                        string.Join(", ", context.Response.Headers.Select(h => $"{h.Key}={h.Value}")));
                    return;
                }

                // Добавляем CORS-заголовки для всех ответов
                context.Response.OnStarting(() =>
                {
                    if (context.Request.Headers.ContainsKey("Origin"))
                    {
                        context.Response.Headers["Access-Control-Allow-Origin"] = context.Request.Headers["Origin"];
                        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                        context.Response.Headers["Access-Control-Expose-Headers"] =
                            "Access-Control-Allow-Origin,Access-Control-Allow-Credentials,Content-Type," +
                            "X-Content-Type-Options,X-Frame-Options,X-XSS-Protection,Strict-Transport-Security,Content-Security-Policy,Referrer-Policy";
                    }
                    return Task.CompletedTask;
                });

                await next();

                logger?.LogInformation("CORS: Response Headers={Headers}",
                    string.Join(", ", context.Response.Headers.Select(h => $"{h.Key}={h.Value}")));
            });

            return app;
        }

        public static WebApplication AddCorsCookieSupport(this WebApplication app, IWebHostEnvironment environment)
        {
            return app;
        }

        public static WebApplication AddCookieModificationMiddleware(this WebApplication app, IWebHostEnvironment environment)
        {
            if (!environment.IsDevelopment())
                return app;

            app.Use(async (context, next) =>
            {
                context.Response.OnStarting(() =>
                {
                    if (context.Response.Headers.ContainsKey("Set-Cookie"))
                    {
                        var cookies = context.Response.Headers["Set-Cookie"].ToList();
                        var modified = false;

                        for (int i = 0; i < cookies.Count; i++)
                        {
                            if (cookies[i].Contains("accessToken") || cookies[i].Contains("refreshToken"))
                            {
                                cookies[i] = cookies[i].Replace("; Secure", "").Replace("; SameSite=None", "; SameSite=Lax");
                                modified = true;
                            }
                        }

                        if (modified)
                            context.Response.Headers["Set-Cookie"] = cookies.ToArray();
                    }
                    return Task.CompletedTask;
                });

                await next();
            });

            return app;
        }

        private static CorsSettings GetCorsSettings(IConfiguration configuration, IWebHostEnvironment environment)
        {
            var settings = new CorsSettings
            {
                AllowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? GetDefaultAllowedOrigins(environment),
                ProductionOrigins = configuration.GetSection("Cors:ProductionOrigins").Get<string[]>() ?? new[] { "https://yourdomain.com" }
            };

            return settings;
        }

        private static string[] GetDefaultAllowedOrigins(IWebHostEnvironment environment)
        {
            if (environment.IsDevelopment())
                return new[] { "http://localhost:4200", "https://localhost:4200" };
            return Array.Empty<string>();
        }
    }

    public class CorsSettings
    {
        public string[] AllowedOrigins { get; set; } = Array.Empty<string>();
        public string[] ProductionOrigins { get; set; } = Array.Empty<string>();
    }
}