using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dawab.Infrastructure.Data.Configuration;

public class CycleSettlementConfiguration : IEntityTypeConfiguration<CycleSettlement>
{
    public void Configure(EntityTypeBuilder<CycleSettlement> builder)
    {
        builder.HasOne(settlement => settlement.Cycle)
            .WithOne(cycle => cycle.Settlement)
            .HasForeignKey<CycleSettlement>(settlement => settlement.CycleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
