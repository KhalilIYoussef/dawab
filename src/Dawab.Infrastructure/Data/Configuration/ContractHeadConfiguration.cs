using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dawab.Infrastructure.Data.Configuration;

public class ContractHeadConfiguration : IEntityTypeConfiguration<ContractHead>
{
    public void Configure(EntityTypeBuilder<ContractHead> builder)
    {
        builder.HasIndex(contract => contract.ContractCode)
            .IsUnique();
    }
}
