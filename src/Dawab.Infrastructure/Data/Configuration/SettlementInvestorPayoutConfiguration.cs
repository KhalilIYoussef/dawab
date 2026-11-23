using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dawab.Infrastructure.Data.Configuration;

public class SettlementInvestorPayoutConfiguration : IEntityTypeConfiguration<SettlementInvestorPayout>
{
    public void Configure(EntityTypeBuilder<SettlementInvestorPayout> builder)
    {
        builder.HasOne(payout => payout.Investor)
            .WithMany()
            .HasForeignKey(payout => payout.InvestorId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
