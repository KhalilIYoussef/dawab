using Dawab.Application.Common.Interfaces;
using Dawab.Infrastructure.Data;
using Dawab.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Dawab.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // SQL Server Configuration
        if (!string.IsNullOrEmpty(connectionString))
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelay: TimeSpan.FromSeconds(5),
                        errorNumbersToAdd: null);
                });
            });
        }
        else
        {
            // Fallback for isolated development / testing
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseInMemoryDatabase("DawabDb");
            });
        }

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        // Register Business Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICycleService, CycleService>();
        services.AddScoped<IInvestmentService, InvestmentService>();
        services.AddScoped<IMonitoringService, MonitoringService>();
        services.AddScoped<IInsuranceService, InsuranceService>();
        services.AddScoped<ISettlementService, SettlementService>();

        // Domain Orchestration Services (Thin Controllers pattern)
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IBreederService, BreederService>();
        services.AddScoped<IHomeService, HomeService>();

        services.AddHttpClient<IAiRiskService, AiRiskService>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();

        return services;
    }
}
