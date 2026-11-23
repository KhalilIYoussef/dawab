using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Animal> Animals { get; }
    DbSet<BreederProfile> BreederProfiles { get; }
    DbSet<KycDocument> KycDocuments { get; }
    DbSet<Cycle> Cycles { get; }
    DbSet<FatteningStage> FatteningStages { get; }
    DbSet<CycleVaccinePlan> CycleVaccinePlans { get; }
    DbSet<Investment> Investments { get; }
    DbSet<ContractHead> ContractHeads { get; }
    DbSet<CycleLog> CycleLogs { get; }
    DbSet<LogFeedItem> LogFeedItems { get; }
    DbSet<LogVetRecord> LogVetRecords { get; }
    DbSet<CycleLogImage> CycleLogImages { get; }
    DbSet<InsurancePolicy> InsurancePolicies { get; }
    DbSet<InsuranceClaim> InsuranceClaims { get; }
    DbSet<CycleSettlement> CycleSettlements { get; }
    DbSet<SettlementInvestorPayout> SettlementInvestorPayouts { get; }
    DbSet<AiRiskAssessment> AiRiskAssessments { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
