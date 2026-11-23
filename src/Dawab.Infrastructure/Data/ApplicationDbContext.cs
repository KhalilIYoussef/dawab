using Dawab.Application.Common.Interfaces;
using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Data;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Animal> Animals => Set<Animal>();
    public DbSet<BreederProfile> BreederProfiles => Set<BreederProfile>();
    public DbSet<KycDocument> KycDocuments => Set<KycDocument>();
    public DbSet<Cycle> Cycles => Set<Cycle>();
    public DbSet<FatteningStage> FatteningStages => Set<FatteningStage>();
    public DbSet<CycleVaccinePlan> CycleVaccinePlans => Set<CycleVaccinePlan>();
    public DbSet<Investment> Investments => Set<Investment>();
    public DbSet<ContractHead> ContractHeads => Set<ContractHead>();
    public DbSet<CycleLog> CycleLogs => Set<CycleLog>();
    public DbSet<LogFeedItem> LogFeedItems => Set<LogFeedItem>();
    public DbSet<LogVetRecord> LogVetRecords => Set<LogVetRecord>();
    public DbSet<CycleLogImage> CycleLogImages => Set<CycleLogImage>();
    public DbSet<InsurancePolicy> InsurancePolicies => Set<InsurancePolicy>();
    public DbSet<InsuranceClaim> InsuranceClaims => Set<InsuranceClaim>();
    public DbSet<CycleSettlement> CycleSettlements => Set<CycleSettlement>();
    public DbSet<SettlementInvestorPayout> SettlementInvestorPayouts => Set<SettlementInvestorPayout>();
    public DbSet<AiRiskAssessment> AiRiskAssessments => Set<AiRiskAssessment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
