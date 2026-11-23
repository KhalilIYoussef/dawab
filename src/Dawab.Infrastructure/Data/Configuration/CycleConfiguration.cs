using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dawab.Infrastructure.Data.Configuration;

public class CycleConfiguration : IEntityTypeConfiguration<Cycle>
{
    public void Configure(EntityTypeBuilder<Cycle> builder)
    {
        builder.HasOne(cycle => cycle.Animal)
            .WithMany()
            .HasForeignKey(cycle => cycle.AnimalId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(cycle => cycle.Breeder)
            .WithMany(user => user.BreederCycles)
            .HasForeignKey(cycle => cycle.BreederId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
