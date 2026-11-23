using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dawab.Infrastructure.Data.Configuration;

public class InvestmentConfiguration : IEntityTypeConfiguration<Investment>
{
    public void Configure(EntityTypeBuilder<Investment> builder)
    {
        builder.HasOne(investment => investment.Investor)
            .WithMany(user => user.Investments)
            .HasForeignKey(investment => investment.InvestorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(investment => investment.Cycle)
            .WithMany(cycle => cycle.Investments)
            .HasForeignKey(investment => investment.CycleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
