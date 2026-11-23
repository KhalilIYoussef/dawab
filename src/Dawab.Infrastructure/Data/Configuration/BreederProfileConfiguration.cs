using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dawab.Infrastructure.Data.Configuration;

public class BreederProfileConfiguration : IEntityTypeConfiguration<BreederProfile>
{
    public void Configure(EntityTypeBuilder<BreederProfile> builder)
    {
        builder.HasOne(profile => profile.User)
            .WithOne(user => user.BreederProfile)
            .HasForeignKey<BreederProfile>(profile => profile.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
