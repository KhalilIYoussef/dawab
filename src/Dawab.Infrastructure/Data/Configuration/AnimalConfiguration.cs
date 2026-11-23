using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dawab.Infrastructure.Data.Configuration;

public class AnimalConfiguration : IEntityTypeConfiguration<Animal>
{
    public void Configure(EntityTypeBuilder<Animal> builder)
    {
        builder.HasIndex(animal => animal.Name).IsUnique();
        builder.Property(animal => animal.Name).HasMaxLength(120).IsRequired();
        builder.Property(animal => animal.DefaultInitialWeight).HasPrecision(18, 2);
        builder.Property(animal => animal.DefaultTargetWeight).HasPrecision(18, 2);
        builder.Property(animal => animal.DefaultPricePerHead).HasPrecision(18, 2);
        builder.Property(animal => animal.DefaultBarnInsuranceCost).HasPrecision(18, 2);
    }
}
