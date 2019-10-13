using System;
using System.Text;
using System.Threading.Tasks;
using API.Middleware;
using API.SignalR;
using Application.Activities;
using Application.Interfaces;
using Application.Profiles;
using AutoMapper;
using Domain;
using FluentValidation.AspNetCore;
using Infrastructure.Photos;
using Infrastructure.Security;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Persistence;

namespace API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureDevelopmentServices(IServiceCollection services) {
              services.AddDbContext<DataContext>(opt => {
                opt.UseLazyLoadingProxies();
                opt.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));
            });

            ConfigureServices(services);
        }

        public void ConfigureProductionServices(IServiceCollection services) {
              services.AddDbContext<DataContext>(opt => {
                opt.UseLazyLoadingProxies();
                opt.UseMySql(Configuration.GetConnectionString("DefaultConnection"));
                //opt.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"));
            });

            ConfigureServices(services);
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(opt => {
                opt.AddPolicy("CorsPolicy", policy => {
                    policy.AllowAnyHeader()
                    .AllowAnyMethod()
                    .WithExposedHeaders("WWW-Authenticate")
                    .WithOrigins("http://localhost:3000")
                    .AllowCredentials();
                });
            });
            services.AddMediatR(typeof(List.Handler).Assembly);
            services.AddAutoMapper(typeof(List.Handler));
            services.AddSignalR();

            // Configure Authentication Policy
            services.AddMvc(opt => 
            {
                var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                opt.Filters.Add(new AuthorizeFilter(policy));
            })
                .AddFluentValidation(cfg => cfg.RegisterValidatorsFromAssemblyContaining<Create>())
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_2);

            // Configure Identity
            // Note! Use AddIdentity if MVC or for WebPage that use Cookie and Razor engine. But since we use ASP.Net Core as API and React as client, use AddIdentityCore
            var builder = services.AddIdentityCore<AppUser>(); 
            var identityBuilder = new IdentityBuilder(builder.UserType, builder.Services);
            identityBuilder.AddEntityFrameworkStores<DataContext>();
            identityBuilder.AddSignInManager<SignInManager<AppUser>>();

            services.AddAuthorization(opt => {
                opt.AddPolicy("IsActivityHost", policy => {
                    policy.Requirements.Add(new IsHostRequirement());
                });
            });
            services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();

            // Configure Authentication 
            //var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super secret key"));       // TODO
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["TokenKey"]));  // Note! Available only in Devt using user-secrets

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opt => {
                    opt.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey =  key,
                        ValidateAudience = false,
                        ValidateIssuer = false,
                        ValidateLifetime = true,        // Validate jwt token expiry
                        ClockSkew = TimeSpan.Zero       // As soon as session expires, return 401
                    };
                    opt.Events = new JwtBearerEvents{
                        OnMessageReceived = context => {
                            var accessToken = context.Request.Query["access_token"]; // This key 'access_token' is set in the client
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chat")) 
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });
            
            services.AddScoped<IJwtGenerator, JwtGenerator>();
            services.AddScoped<IUserAccessor, UserAccessor>();
            services.AddScoped<IPhotoAccessor, PhotoAccessor>();
            services.AddScoped<IProfileReader, ProfileReader>();
            services.Configure<CloudinarySettings>(Configuration.GetSection("Cloudinary"));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            app.UseMiddleware<ErrorHandlingMiddleware>(); 

            if (env.IsDevelopment())
            {
                //app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                //app.UseHsts();
            }

                 
            // Security Headers setting must be defined at the top of the Middleware chain
            app.UseXContentTypeOptions(); // To prevent content sniffing
            app.UseReferrerPolicy(opt => opt.NoReferrer()); // To limit information when referring sites
            app.UseXXssProtection(opt => opt.EnabledWithBlockMode()); // To prevent cross site scripting attack
            app.UseXfo(opt => opt.Deny()); // To prevent IFrame and click-jacking attacks
            app.UseCspReportOnly(opt => opt          // Important Note! This is to block all external CSS, Fonts, Frames, Images, etc.
            //app.UseCsp(opt => opt
                    .BlockAllMixedContent()
                    .StyleSources(s => s.Self().CustomSources("https://fonts.googleapis.com", "sha256-F4GpCPyRepgP5znjMD8sc7PEjzet5Eef4r09dEGPpTs=", "sha256-4Su6mBWzEIFnH4pAGMOuaeBrstwJN4Z3pq/s1Kn4/KQ="))  // Note! Hash from inline css style
                    .FontSources(s => s.Self().CustomSources("https://fonts.gstatic.com", "https://fonts.googleapis.com", "data:"))
                    .FormActions(s => s.Self())
                    .FrameAncestors(s => s.Self())
                    .ImageSources(s => s.Self().CustomSources("https://res.cloudinary.com", "blob:", "data:"))
                    .ScriptSources(s => s.Self().CustomSources("sha256-EWcbgMMrMgeuxsyT4o76Gq/C5zilrLxiq6oTo2KDqus="))  // Note! Hash from webpack
                );
            
            //app.UseHttpsRedirection();
            app.UseDefaultFiles();
            app.UseStaticFiles();   // Serve javascript, css, image, html assets, etc.
            app.UseAuthentication();
            app.UseCors("CorsPolicy");
            app.UseSignalR(routes => { routes.MapHub<ChatHub>("/chat"); });
            app.UseMvc(routes => {
                routes.MapSpaFallbackRoute(  // This applies when the route is neither 'API' or 'chat'
                    name: "spa-fallback",
                    defaults: new {controller = "Fallback", action = "Index"}  // Note! The 'Index' method should serve the wwwroot/index.html
                );
            });
        }
    }
}
