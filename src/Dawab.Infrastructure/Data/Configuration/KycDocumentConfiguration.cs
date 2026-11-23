using Dawab.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Dawab.Infrastructure.Data.Configuration;

public class KycDocumentConfiguration : IEntityTypeConfiguration<KycDocument>
{
    public void Configure(EntityTypeBuilder<KycDocument> builder)
    {
        builder.HasOne(document => document.User)
            .WithOne(user => user.KycDocument)
            .HasForeignKey<KycDocument>(document => document.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
