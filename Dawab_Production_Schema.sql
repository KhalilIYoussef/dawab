IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [Animals] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(120) NOT NULL,
        [DefaultInitialWeight] decimal(18,2) NOT NULL,
        [DefaultTargetWeight] decimal(18,2) NOT NULL,
        [DefaultPricePerHead] decimal(18,2) NOT NULL,
        [DefaultBarnInsuranceCost] decimal(18,2) NOT NULL,
        [DefaultDurationDays] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Animals] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Phone] nvarchar(450) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Role] int NOT NULL,
        [Status] int NOT NULL,
        [ProfilePictureUrl] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [BreederProfiles] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [FarmName] nvarchar(max) NULL,
        [Governorate] nvarchar(max) NULL,
        [Address] nvarchar(max) NULL,
        [GoogleMapsUrl] nvarchar(max) NULL,
        [SpaceLimit] int NOT NULL,
        [AvailableSpace] int NOT NULL,
        [Rating] decimal(18,2) NOT NULL,
        [CriminalRecordUrl] nvarchar(max) NULL,
        [PhysicalPapersSent] bit NOT NULL,
        [PhysicalPapersVerified] bit NOT NULL,
        [VerifiedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_BreederProfiles] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_BreederProfiles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [Cycles] (
        [Id] uniqueidentifier NOT NULL,
        [BreederId] uniqueidentifier NOT NULL,
        [AnimalId] uniqueidentifier NULL,
        [AnimalType] nvarchar(max) NOT NULL,
        [InitialWeight] decimal(18,2) NOT NULL,
        [TargetWeight] decimal(18,2) NOT NULL,
        [TotalHeads] int NOT NULL,
        [AvailableHeads] int NOT NULL,
        [StartPricePerHead] decimal(18,2) NOT NULL,
        [FundingGoal] decimal(18,2) NOT NULL,
        [CurrentFunding] decimal(18,2) NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [ExpectedDurationDays] int NOT NULL,
        [ActualEndDate] datetime2 NULL,
        [Status] int NOT NULL,
        [ImageUrl] nvarchar(max) NOT NULL,
        [HealthCertUrl] nvarchar(max) NULL,
        [Description] nvarchar(max) NOT NULL,
        [AdminNote] nvarchar(max) NULL,
        [IsBarnInsured] bit NOT NULL,
        [BarnInsuranceCost] decimal(18,2) NOT NULL,
        [InsurancePolicyNumber] nvarchar(max) NULL,
        [FinalSalePrice] decimal(18,2) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Cycles] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Cycles_Animals_AnimalId] FOREIGN KEY ([AnimalId]) REFERENCES [Animals] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Cycles_Users_BreederId] FOREIGN KEY ([BreederId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [KycDocuments] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [NationalId] nvarchar(max) NULL,
        [BankName] nvarchar(max) NULL,
        [Iban] nvarchar(max) NULL,
        [IdCardFrontUrl] nvarchar(max) NULL,
        [IdCardBackUrl] nvarchar(max) NULL,
        [ContractUrl] nvarchar(max) NULL,
        [IsVerified] bit NOT NULL,
        [RejectionReason] nvarchar(max) NULL,
        [ReviewedBy] uniqueidentifier NULL,
        [ReviewedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_KycDocuments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_KycDocuments_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [AiRiskAssessments] (
        [Id] uniqueidentifier NOT NULL,
        [CycleId] uniqueidentifier NOT NULL,
        [ModelVersion] nvarchar(max) NOT NULL,
        [PromptPayload] nvarchar(max) NOT NULL,
        [AiResponse] nvarchar(max) NOT NULL,
        [RiskScore] decimal(18,2) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_AiRiskAssessments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AiRiskAssessments_Cycles_CycleId] FOREIGN KEY ([CycleId]) REFERENCES [Cycles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [CycleLogs] (
        [Id] uniqueidentifier NOT NULL,
        [CycleId] uniqueidentifier NOT NULL,
        [LogDate] datetime2 NOT NULL,
        [CurrentWeight] decimal(18,2) NULL,
        [FoodSummary] nvarchar(max) NOT NULL,
        [WaterLiters] int NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_CycleLogs] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CycleLogs_Cycles_CycleId] FOREIGN KEY ([CycleId]) REFERENCES [Cycles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [CycleSettlements] (
        [Id] uniqueidentifier NOT NULL,
        [CycleId] uniqueidentifier NOT NULL,
        [SettledBy] uniqueidentifier NOT NULL,
        [SettlerId] uniqueidentifier NOT NULL,
        [TotalRevenue] decimal(18,2) NOT NULL,
        [InitialFunding] decimal(18,2) NOT NULL,
        [GrossProfit] decimal(18,2) NOT NULL,
        [PlatformCommission] decimal(18,2) NOT NULL,
        [BreederPayout] decimal(18,2) NOT NULL,
        [TotalInvestorsPayout] decimal(18,2) NOT NULL,
        [SettlementDate] datetime2 NOT NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_CycleSettlements] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CycleSettlements_Cycles_CycleId] FOREIGN KEY ([CycleId]) REFERENCES [Cycles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CycleSettlements_Users_SettlerId] FOREIGN KEY ([SettlerId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [CycleVaccinePlans] (
        [Id] uniqueidentifier NOT NULL,
        [CycleId] uniqueidentifier NOT NULL,
        [VaccineName] nvarchar(max) NOT NULL,
        [IsMandatory] bit NOT NULL,
        [RecommendedDayOffset] int NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_CycleVaccinePlans] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CycleVaccinePlans_Cycles_CycleId] FOREIGN KEY ([CycleId]) REFERENCES [Cycles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [FatteningStages] (
        [Id] uniqueidentifier NOT NULL,
        [CycleId] uniqueidentifier NOT NULL,
        [StageOrder] int NOT NULL,
        [StageName] nvarchar(max) NOT NULL,
        [FeedConcentrateKg] decimal(18,2) NOT NULL,
        [RoughageKg] decimal(18,2) NOT NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_FatteningStages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_FatteningStages_Cycles_CycleId] FOREIGN KEY ([CycleId]) REFERENCES [Cycles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [Investments] (
        [Id] uniqueidentifier NOT NULL,
        [InvestorId] uniqueidentifier NOT NULL,
        [CycleId] uniqueidentifier NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [HeadsCount] int NOT NULL,
        [PlatformFee] decimal(18,2) NOT NULL,
        [HasAnimalInsurance] bit NOT NULL,
        [AnimalInsuranceFee] decimal(18,2) NOT NULL,
        [TotalPaid] decimal(18,2) NOT NULL,
        [TransferReceiptUrl] nvarchar(max) NULL,
        [BankReferenceNumber] nvarchar(max) NULL,
        [Status] int NOT NULL,
        [RejectionReason] nvarchar(max) NULL,
        [ApprovedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Investments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Investments_Cycles_CycleId] FOREIGN KEY ([CycleId]) REFERENCES [Cycles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Investments_Users_InvestorId] FOREIGN KEY ([InvestorId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [CycleLogImages] (
        [Id] uniqueidentifier NOT NULL,
        [LogId] uniqueidentifier NOT NULL,
        [ImageUrl] nvarchar(max) NOT NULL,
        [Caption] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_CycleLogImages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CycleLogImages_CycleLogs_LogId] FOREIGN KEY ([LogId]) REFERENCES [CycleLogs] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [LogFeedItems] (
        [Id] uniqueidentifier NOT NULL,
        [LogId] uniqueidentifier NOT NULL,
        [Category] int NOT NULL,
        [ItemName] nvarchar(max) NOT NULL,
        [Quantity] decimal(18,2) NOT NULL,
        [Unit] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_LogFeedItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_LogFeedItems_CycleLogs_LogId] FOREIGN KEY ([LogId]) REFERENCES [CycleLogs] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [LogVetRecords] (
        [Id] uniqueidentifier NOT NULL,
        [LogId] uniqueidentifier NOT NULL,
        [RecordType] int NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [Dosage] nvarchar(max) NULL,
        [Notes] nvarchar(max) NULL,
        [AdministeredAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_LogVetRecords] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_LogVetRecords_CycleLogs_LogId] FOREIGN KEY ([LogId]) REFERENCES [CycleLogs] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [ContractHeads] (
        [Id] uniqueidentifier NOT NULL,
        [InvestmentId] uniqueidentifier NOT NULL,
        [CycleId] uniqueidentifier NOT NULL,
        [ContractCode] nvarchar(450) NOT NULL,
        [HeadIndex] int NOT NULL,
        [PdfContractUrl] nvarchar(max) NULL,
        [IssuedAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_ContractHeads] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ContractHeads_Cycles_CycleId] FOREIGN KEY ([CycleId]) REFERENCES [Cycles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ContractHeads_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [InsurancePolicies] (
        [Id] uniqueidentifier NOT NULL,
        [PolicyNumber] nvarchar(max) NOT NULL,
        [PolicyType] int NOT NULL,
        [CycleId] uniqueidentifier NOT NULL,
        [InvestmentId] uniqueidentifier NULL,
        [PremiumAmount] decimal(18,2) NOT NULL,
        [CoverageDetails] nvarchar(max) NULL,
        [Status] int NOT NULL,
        [StartsAt] datetime2 NOT NULL,
        [ExpiresAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_InsurancePolicies] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InsurancePolicies_Cycles_CycleId] FOREIGN KEY ([CycleId]) REFERENCES [Cycles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_InsurancePolicies_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [SettlementInvestorPayouts] (
        [Id] uniqueidentifier NOT NULL,
        [SettlementId] uniqueidentifier NOT NULL,
        [InvestmentId] uniqueidentifier NOT NULL,
        [InvestorId] uniqueidentifier NOT NULL,
        [CapitalReturned] decimal(18,2) NOT NULL,
        [ProfitShare] decimal(18,2) NOT NULL,
        [TotalPayout] decimal(18,2) NOT NULL,
        [IsTransferred] bit NOT NULL,
        [TransferReference] nvarchar(max) NULL,
        [TransferredAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_SettlementInvestorPayouts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SettlementInvestorPayouts_CycleSettlements_SettlementId] FOREIGN KEY ([SettlementId]) REFERENCES [CycleSettlements] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_SettlementInvestorPayouts_Investments_InvestmentId] FOREIGN KEY ([InvestmentId]) REFERENCES [Investments] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_SettlementInvestorPayouts_Users_InvestorId] FOREIGN KEY ([InvestorId]) REFERENCES [Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE TABLE [InsuranceClaims] (
        [Id] uniqueidentifier NOT NULL,
        [PolicyId] uniqueidentifier NOT NULL,
        [ClaimantId] uniqueidentifier NOT NULL,
        [IncidentDate] datetime2 NOT NULL,
        [IncidentType] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [ClaimAmount] decimal(18,2) NOT NULL,
        [ApprovedAmount] decimal(18,2) NOT NULL,
        [Status] int NOT NULL,
        [VetInspectionReportUrl] nvarchar(max) NULL,
        [ResolutionNotes] nvarchar(max) NULL,
        [ResolvedBy] uniqueidentifier NULL,
        [ResolvedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_InsuranceClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InsuranceClaims_InsurancePolicies_PolicyId] FOREIGN KEY ([PolicyId]) REFERENCES [InsurancePolicies] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_InsuranceClaims_Users_ClaimantId] FOREIGN KEY ([ClaimantId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AiRiskAssessments_CycleId] ON [AiRiskAssessments] ([CycleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Animals_Name] ON [Animals] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_BreederProfiles_UserId] ON [BreederProfiles] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ContractHeads_ContractCode] ON [ContractHeads] ([ContractCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ContractHeads_CycleId] ON [ContractHeads] ([CycleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ContractHeads_InvestmentId] ON [ContractHeads] ([InvestmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CycleLogImages_LogId] ON [CycleLogImages] ([LogId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CycleLogs_CycleId] ON [CycleLogs] ([CycleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Cycles_AnimalId] ON [Cycles] ([AnimalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Cycles_BreederId] ON [Cycles] ([BreederId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_CycleSettlements_CycleId] ON [CycleSettlements] ([CycleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CycleSettlements_SettlerId] ON [CycleSettlements] ([SettlerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CycleVaccinePlans_CycleId] ON [CycleVaccinePlans] ([CycleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_FatteningStages_CycleId] ON [FatteningStages] ([CycleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InsuranceClaims_ClaimantId] ON [InsuranceClaims] ([ClaimantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InsuranceClaims_PolicyId] ON [InsuranceClaims] ([PolicyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InsurancePolicies_CycleId] ON [InsurancePolicies] ([CycleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InsurancePolicies_InvestmentId] ON [InsurancePolicies] ([InvestmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Investments_CycleId] ON [Investments] ([CycleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Investments_InvestorId] ON [Investments] ([InvestorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_KycDocuments_UserId] ON [KycDocuments] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_LogFeedItems_LogId] ON [LogFeedItems] ([LogId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_LogVetRecords_LogId] ON [LogVetRecords] ([LogId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SettlementInvestorPayouts_InvestmentId] ON [SettlementInvestorPayouts] ([InvestmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SettlementInvestorPayouts_InvestorId] ON [SettlementInvestorPayouts] ([InvestorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_SettlementInvestorPayouts_SettlementId] ON [SettlementInvestorPayouts] ([SettlementId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Phone] ON [Users] ([Phone]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261124075444_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261124075444_InitialCreate', N'11.0.0');
END;

COMMIT;
GO

