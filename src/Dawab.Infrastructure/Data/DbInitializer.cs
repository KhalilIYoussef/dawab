using Dawab.Domain.Entities;
using Dawab.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dawab.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (context.Database.IsSqlServer())
        {
            await context.Database.MigrateAsync();
        }
        else
        {
            await context.Database.EnsureCreatedAsync();
        }

        await EnsureAnimalCatalogSchemaAsync(context);
        await SeedAnimalsAsync(context);

        if (await context.Users.AnyAsync())
        {
            return; // DB has already been seeded
        }

        var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("123");

        // 1. Initial Users
        var adminUser = new User
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "المدير العام (أدمن)",
            Phone = "01000000001",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            ProfilePictureUrl = "https://i.pravatar.cc/150?u=admin"
        };

        var breederMetwally = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "مزرعة الحاج متولي",
            Phone = "01200000002",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Breeder,
            Status = UserStatus.Active,
            ProfilePictureUrl = "https://i.pravatar.cc/150?u=metwally",
            BreederProfile = new BreederProfile
            {
                FarmName = "مزرعة الحاج متولي للتسمين",
                Governorate = "الشرقية",
                Address = "مركز بلبيس، محافظة الشرقية",
                GoogleMapsUrl = "https://maps.google.com",
                SpaceLimit = 50,
                AvailableSpace = 30,
                Rating = 4.8m,
                PhysicalPapersSent = true,
                PhysicalPapersVerified = true,
                CriminalRecordUrl = "/uploads/criminal_records/sample.pdf",
                VerifiedAt = DateTime.UtcNow
            },
            KycDocument = new KycDocument
            {
                NationalId = "28001011234567",
                BankName = "البنك الأهلي المصري",
                Iban = "EG12000200010000000000000005",
                IsVerified = true,
                ReviewedAt = DateTime.UtcNow
            }
        };

        var breederRagab = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "عزبة أولاد رجب",
            Phone = "01100000003",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Breeder,
            Status = UserStatus.Pending,
            ProfilePictureUrl = "https://i.pravatar.cc/150?u=ragab",
            BreederProfile = new BreederProfile
            {
                FarmName = "عزبة أولاد رجب للمواشي",
                Governorate = "الفيوم",
                Address = "طريق الفيوم الزراعي",
                GoogleMapsUrl = "https://maps.google.com",
                SpaceLimit = 20,
                AvailableSpace = 20,
                Rating = 0.0m,
                PhysicalPapersSent = true,
                PhysicalPapersVerified = false
            }
        };

        var investorAhmed = new User
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Name = "أحمد المستثمر",
            Phone = "01500000004",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Investor,
            Status = UserStatus.Active,
            ProfilePictureUrl = "https://i.pravatar.cc/150?u=ahmed",
            KycDocument = new KycDocument
            {
                NationalId = "29012011234567",
                BankName = "بنك مصر",
                Iban = "EG55000300010000000000000009",
                IsVerified = true,
                ReviewedAt = DateTime.UtcNow
            }
        };

        var investorMona = new User
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            Name = "منى محمد",
            Phone = "01055555555",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Investor,
            Status = UserStatus.Pending,
            ProfilePictureUrl = "https://i.pravatar.cc/150?u=mona"
        };

        context.Users.AddRange(adminUser, breederMetwally, breederRagab, investorAhmed, investorMona);

        // 2. Initial Cycles
        var cycle1 = new Cycle
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            BreederId = breederMetwally.Id,
            AnimalType = "عجل خليط رقم 101",
            InitialWeight = 250,
            TargetWeight = 450,
            FundingGoal = 32000,
            CurrentFunding = 32000,
            TotalHeads = 1,
            AvailableHeads = 0,
            StartPricePerHead = 32000,
            StartDate = DateTime.UtcNow.AddDays(-60),
            ExpectedDurationDays = 180,
            Status = CycleStatus.Active,
            ImageUrl = "/images/cycles/calf.jpg",
            Description = "عجل خليط عالي التحويل، شراكة بين مستثمرين في مزرعة الحاج متولي.",
            IsBarnInsured = true,
            BarnInsuranceCost = 750,
            InsurancePolicyNumber = "POL-101-99"
        };

        cycle1.FatteningStages.Add(new FatteningStage { StageOrder = 1, StageName = "مرحلة التحضين (1-28 يوم)", FeedConcentrateKg = 4m, RoughageKg = 1.5m });
        cycle1.FatteningStages.Add(new FatteningStage { StageOrder = 2, StageName = "مرحلة النمو (29-90 يوم)", FeedConcentrateKg = 6m, RoughageKg = 2m });
        cycle1.FatteningStages.Add(new FatteningStage { StageOrder = 3, StageName = "مرحلة الإنهاء (91+ يوم)", FeedConcentrateKg = 8m, RoughageKg = 2.5m });
        cycle1.VaccinePlans.Add(new CycleVaccinePlan { VaccineName = "حمى قلاعية (FMD)", IsMandatory = true });
        cycle1.VaccinePlans.Add(new CycleVaccinePlan { VaccineName = "جلد عقدي (LSD)", IsMandatory = true });

        var cycle2 = new Cycle
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            BreederId = breederMetwally.Id,
            AnimalType = "مجموعة أغنام عساف (5 رؤوس)",
            InitialWeight = 30,
            TargetWeight = 60,
            FundingGoal = 35000,
            CurrentFunding = 14000,
            TotalHeads = 5,
            AvailableHeads = 3,
            StartPricePerHead = 7000,
            StartDate = DateTime.UtcNow,
            ExpectedDurationDays = 120,
            Status = CycleStatus.Funding,
            ImageUrl = "/images/cycles/sheep.jpg",
            Description = "دورة تسمين جماعية لـ 5 رؤوس من غنم العساف الممتاز بسلالة محسنة.",
            IsBarnInsured = true,
            BarnInsuranceCost = 750,
            InsurancePolicyNumber = "INS-ASSAF-GROUP"
        };

        var cycle3 = new Cycle
        {
            Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            BreederId = breederRagab.Id,
            AnimalType = "خروف برقي ممتاز",
            InitialWeight = 35,
            TargetWeight = 55,
            FundingGoal = 6500,
            CurrentFunding = 0,
            TotalHeads = 1,
            AvailableHeads = 1,
            StartPricePerHead = 6500,
            StartDate = DateTime.UtcNow,
            ExpectedDurationDays = 100,
            Status = CycleStatus.Pending,
            ImageUrl = "/images/cycles/ram.jpg",
            Description = "تسمين خروف برقي ممتاز بعزبة أولاد رجب. فرصة استثمارية قصيرة المدى.",
            IsBarnInsured = false,
            BarnInsuranceCost = 0
        };

        context.Cycles.AddRange(cycle1, cycle2, cycle3);

        // 3. Initial Investments
        var inv1 = new Investment
        {
            InvestorId = investorAhmed.Id,
            CycleId = cycle1.Id,
            Amount = 32000,
            HeadsCount = 1,
            PlatformFee = 800,
            HasAnimalInsurance = true,
            AnimalInsuranceFee = 960,
            TotalPaid = 33760,
            Status = InvestmentStatus.Approved,
            ApprovedAt = DateTime.UtcNow.AddDays(-60)
        };
        inv1.Contracts.Add(new ContractHead { CycleId = cycle1.Id, ContractCode = "DW-101-01", HeadIndex = 1 });

        context.Investments.Add(inv1);

        // 4. Initial Cycle Log
        var log1 = new CycleLog
        {
            CycleId = cycle1.Id,
            LogDate = DateTime.UtcNow.AddDays(-60),
            CurrentWeight = 250,
            FoodSummary = "علف بادي 16% + دريس حجازي",
            Notes = "استلام العجل وبدء فترة التحضين والتحصين الأولي."
        };
        log1.FeedItems.Add(new LogFeedItem { Category = FeedCategory.Energy, ItemName = "علف بادي 16%", Quantity = 4, Unit = "كجم" });
        log1.FeedItems.Add(new LogFeedItem { Category = FeedCategory.Roughage, ItemName = "دريس حجازي", Quantity = 1.5m, Unit = "كجم" });
        log1.VetRecords.Add(new LogVetRecord { RecordType = VetRecordType.Vaccine, Title = "تحصين الحمى القلاعية", Notes = "جرعة أولى" });

        context.CycleLogs.Add(log1);

        // 5. Insurance Policies
        var barnPolicy = new InsurancePolicy
        {
            PolicyNumber = "POL-101-99",
            PolicyType = PolicyType.BarnInsurance,
            CycleId = cycle1.Id,
            PremiumAmount = 750,
            CoverageDetails = "تغطية تأمينية شاملة للحظيرة ضد الحريق والكوارث الطبيعية",
            Status = PolicyStatus.Active
        };

        var animalPolicy = new InsurancePolicy
        {
            PolicyNumber = "INS-ANIMAL-101-1",
            PolicyType = PolicyType.AnimalLifeInsurance,
            CycleId = cycle1.Id,
            InvestmentId = inv1.Id,
            PremiumAmount = 960,
            CoverageDetails = "تأمين حياة الماشية ضد النفوق والأمراض الوبائية",
            Status = PolicyStatus.Active
        };

        context.InsurancePolicies.AddRange(barnPolicy, animalPolicy);

        await context.SaveChangesAsync();
    }

    private static async Task EnsureAnimalCatalogSchemaAsync(ApplicationDbContext context)
    {
        if (!context.Database.IsSqlServer())
        {
            return;
        }

        await context.Database.ExecuteSqlRawAsync("""
            IF OBJECT_ID(N'[dbo].[Animals]', N'U') IS NULL
            BEGIN
                CREATE TABLE [dbo].[Animals]
                (
                    [Id] uniqueidentifier NOT NULL CONSTRAINT [PK_Animals] PRIMARY KEY,
                    [Name] nvarchar(120) NOT NULL,
                    [DefaultInitialWeight] decimal(18,2) NOT NULL,
                    [DefaultTargetWeight] decimal(18,2) NOT NULL,
                    [DefaultPricePerHead] decimal(18,2) NOT NULL,
                    [DefaultBarnInsuranceCost] decimal(18,2) NOT NULL,
                    [DefaultDurationDays] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    [CreatedAt] datetime2 NOT NULL,
                    [UpdatedAt] datetime2 NOT NULL
                );
                CREATE UNIQUE INDEX [IX_Animals_Name] ON [dbo].[Animals] ([Name]);
            END;

            IF COL_LENGTH(N'dbo.Animals', N'DefaultBarnInsuranceCost') IS NULL
            BEGIN
                ALTER TABLE [dbo].[Animals] ADD [DefaultBarnInsuranceCost] decimal(18,2) NOT NULL CONSTRAINT [DF_Animals_DefaultBarnInsuranceCost] DEFAULT (750);
            END;

            IF COL_LENGTH(N'dbo.Cycles', N'AnimalId') IS NULL
            BEGIN
                ALTER TABLE [dbo].[Cycles] ADD [AnimalId] uniqueidentifier NULL;
            END;

            IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = N'FK_Cycles_Animals_AnimalId')
            BEGIN
                ALTER TABLE [dbo].[Cycles] WITH CHECK ADD CONSTRAINT [FK_Cycles_Animals_AnimalId]
                    FOREIGN KEY ([AnimalId]) REFERENCES [dbo].[Animals] ([Id]) ON DELETE NO ACTION;
            END;
            """);
    }

    private static async Task SeedAnimalsAsync(ApplicationDbContext context)
    {
        if (await context.Animals.AnyAsync())
        {
            return;
        }

        context.Animals.AddRange(
            CreateAnimal("عجل هولشتاين", 200m, 450m, 30000m, 180),
            CreateAnimal("عجل خليط ممتاز", 200m, 450m, 30000m, 180),
            CreateAnimal("عجل بلدي", 180m, 400m, 27000m, 180),
            CreateAnimal("خروف برقي", 25m, 55m, 9000m, 120),
            CreateAnimal("أغنام عساف", 30m, 65m, 10000m, 120),
            CreateAnimal("ماعز بور", 25m, 60m, 8500m, 150),
            CreateAnimal("إبل (جمل)", 250m, 450m, 60000m, 240));
        await context.SaveChangesAsync();
    }

    private static Animal CreateAnimal(string name, decimal initialWeight, decimal targetWeight, decimal pricePerHead, int durationDays)
    {
        return new Animal
        {
            Name = name,
            DefaultInitialWeight = initialWeight,
            DefaultTargetWeight = targetWeight,
            DefaultPricePerHead = pricePerHead,
            DefaultBarnInsuranceCost = 750m,
            DefaultDurationDays = durationDays,
            IsActive = true
        };
    }
}
