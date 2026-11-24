using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dawab.Infrastructure.Migrations;

/// <inheritdoc />
public partial class _20261124075444_InitialCreate : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Animals",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                DefaultInitialWeight = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                DefaultTargetWeight = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                DefaultPricePerHead = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                DefaultBarnInsuranceCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                DefaultDurationDays = table.Column<int>(type: "int", nullable: false),
                IsActive = table.Column<bool>(type: "bit", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Animals", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "Users",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Phone = table.Column<string>(type: "nvarchar(450)", nullable: false),
                PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Role = table.Column<int>(type: "int", nullable: false),
                Status = table.Column<int>(type: "int", nullable: false),
                ProfilePictureUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Users", x => x.Id);
            });

        migrationBuilder.CreateTable(
            name: "BreederProfiles",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                FarmName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Governorate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                GoogleMapsUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                SpaceLimit = table.Column<int>(type: "int", nullable: false),
                AvailableSpace = table.Column<int>(type: "int", nullable: false),
                Rating = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                CriminalRecordUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                PhysicalPapersSent = table.Column<bool>(type: "bit", nullable: false),
                PhysicalPapersVerified = table.Column<bool>(type: "bit", nullable: false),
                VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_BreederProfiles", x => x.Id);
                table.ForeignKey(
                    name: "FK_BreederProfiles_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Cycles",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                BreederId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                AnimalId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                AnimalType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                InitialWeight = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                TargetWeight = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                TotalHeads = table.Column<int>(type: "int", nullable: false),
                AvailableHeads = table.Column<int>(type: "int", nullable: false),
                StartPricePerHead = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                FundingGoal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                CurrentFunding = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                ExpectedDurationDays = table.Column<int>(type: "int", nullable: false),
                ActualEndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                Status = table.Column<int>(type: "int", nullable: false),
                ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                HealthCertUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                AdminNote = table.Column<string>(type: "nvarchar(max)", nullable: true),
                IsBarnInsured = table.Column<bool>(type: "bit", nullable: false),
                BarnInsuranceCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                InsurancePolicyNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                FinalSalePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Cycles", x => x.Id);
                table.ForeignKey(
                    name: "FK_Cycles_Animals_AnimalId",
                    column: x => x.AnimalId,
                    principalTable: "Animals",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Cycles_Users_BreederId",
                    column: x => x.BreederId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "KycDocuments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                NationalId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                BankName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Iban = table.Column<string>(type: "nvarchar(max)", nullable: true),
                IdCardFrontUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                IdCardBackUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                ContractUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                IsVerified = table.Column<bool>(type: "bit", nullable: false),
                RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                ReviewedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_KycDocuments", x => x.Id);
                table.ForeignKey(
                    name: "FK_KycDocuments_Users_UserId",
                    column: x => x.UserId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "AiRiskAssessments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CycleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ModelVersion = table.Column<string>(type: "nvarchar(max)", nullable: false),
                PromptPayload = table.Column<string>(type: "nvarchar(max)", nullable: false),
                AiResponse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                RiskScore = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AiRiskAssessments", x => x.Id);
                table.ForeignKey(
                    name: "FK_AiRiskAssessments_Cycles_CycleId",
                    column: x => x.CycleId,
                    principalTable: "Cycles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "CycleLogs",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CycleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                LogDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                CurrentWeight = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                FoodSummary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                WaterLiters = table.Column<int>(type: "int", nullable: true),
                Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CycleLogs", x => x.Id);
                table.ForeignKey(
                    name: "FK_CycleLogs_Cycles_CycleId",
                    column: x => x.CycleId,
                    principalTable: "Cycles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "CycleSettlements",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CycleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SettledBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SettlerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                TotalRevenue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                InitialFunding = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                GrossProfit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                PlatformCommission = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                BreederPayout = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                TotalInvestorsPayout = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                SettlementDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CycleSettlements", x => x.Id);
                table.ForeignKey(
                    name: "FK_CycleSettlements_Cycles_CycleId",
                    column: x => x.CycleId,
                    principalTable: "Cycles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_CycleSettlements_Users_SettlerId",
                    column: x => x.SettlerId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "CycleVaccinePlans",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CycleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                VaccineName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                IsMandatory = table.Column<bool>(type: "bit", nullable: false),
                RecommendedDayOffset = table.Column<int>(type: "int", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CycleVaccinePlans", x => x.Id);
                table.ForeignKey(
                    name: "FK_CycleVaccinePlans_Cycles_CycleId",
                    column: x => x.CycleId,
                    principalTable: "Cycles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "FatteningStages",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CycleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                StageOrder = table.Column<int>(type: "int", nullable: false),
                StageName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                FeedConcentrateKg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                RoughageKg = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_FatteningStages", x => x.Id);
                table.ForeignKey(
                    name: "FK_FatteningStages_Cycles_CycleId",
                    column: x => x.CycleId,
                    principalTable: "Cycles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "Investments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CycleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                HeadsCount = table.Column<int>(type: "int", nullable: false),
                PlatformFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                HasAnimalInsurance = table.Column<bool>(type: "bit", nullable: false),
                AnimalInsuranceFee = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                TotalPaid = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                TransferReceiptUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                BankReferenceNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Status = table.Column<int>(type: "int", nullable: false),
                RejectionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Investments", x => x.Id);
                table.ForeignKey(
                    name: "FK_Investments_Cycles_CycleId",
                    column: x => x.CycleId,
                    principalTable: "Cycles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
                table.ForeignKey(
                    name: "FK_Investments_Users_InvestorId",
                    column: x => x.InvestorId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "CycleLogImages",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                LogId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Caption = table.Column<string>(type: "nvarchar(max)", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_CycleLogImages", x => x.Id);
                table.ForeignKey(
                    name: "FK_CycleLogImages_CycleLogs_LogId",
                    column: x => x.LogId,
                    principalTable: "CycleLogs",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "LogFeedItems",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                LogId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                Category = table.Column<int>(type: "int", nullable: false),
                ItemName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                Unit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_LogFeedItems", x => x.Id);
                table.ForeignKey(
                    name: "FK_LogFeedItems_CycleLogs_LogId",
                    column: x => x.LogId,
                    principalTable: "CycleLogs",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "LogVetRecords",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                LogId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                RecordType = table.Column<int>(type: "int", nullable: false),
                Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Dosage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                AdministeredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_LogVetRecords", x => x.Id);
                table.ForeignKey(
                    name: "FK_LogVetRecords_CycleLogs_LogId",
                    column: x => x.LogId,
                    principalTable: "CycleLogs",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "ContractHeads",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                InvestmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CycleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ContractCode = table.Column<string>(type: "nvarchar(450)", nullable: false),
                HeadIndex = table.Column<int>(type: "int", nullable: false),
                PdfContractUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ContractHeads", x => x.Id);
                table.ForeignKey(
                    name: "FK_ContractHeads_Cycles_CycleId",
                    column: x => x.CycleId,
                    principalTable: "Cycles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_ContractHeads_Investments_InvestmentId",
                    column: x => x.InvestmentId,
                    principalTable: "Investments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "InsurancePolicies",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                PolicyNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                PolicyType = table.Column<int>(type: "int", nullable: false),
                CycleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                InvestmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                PremiumAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                CoverageDetails = table.Column<string>(type: "nvarchar(max)", nullable: true),
                Status = table.Column<int>(type: "int", nullable: false),
                StartsAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_InsurancePolicies", x => x.Id);
                table.ForeignKey(
                    name: "FK_InsurancePolicies_Cycles_CycleId",
                    column: x => x.CycleId,
                    principalTable: "Cycles",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_InsurancePolicies_Investments_InvestmentId",
                    column: x => x.InvestmentId,
                    principalTable: "Investments",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "SettlementInvestorPayouts",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                SettlementId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                InvestmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                InvestorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                CapitalReturned = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                ProfitShare = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                TotalPayout = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                IsTransferred = table.Column<bool>(type: "bit", nullable: false),
                TransferReference = table.Column<string>(type: "nvarchar(max)", nullable: true),
                TransferredAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_SettlementInvestorPayouts", x => x.Id);
                table.ForeignKey(
                    name: "FK_SettlementInvestorPayouts_CycleSettlements_SettlementId",
                    column: x => x.SettlementId,
                    principalTable: "CycleSettlements",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_SettlementInvestorPayouts_Investments_InvestmentId",
                    column: x => x.InvestmentId,
                    principalTable: "Investments",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_SettlementInvestorPayouts_Users_InvestorId",
                    column: x => x.InvestorId,
                    principalTable: "Users",
                    principalColumn: "Id");
            });

        migrationBuilder.CreateTable(
            name: "InsuranceClaims",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                PolicyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ClaimantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                IncidentDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                IncidentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                ClaimAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                ApprovedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                Status = table.Column<int>(type: "int", nullable: false),
                VetInspectionReportUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                ResolutionNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                ResolvedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_InsuranceClaims", x => x.Id);
                table.ForeignKey(
                    name: "FK_InsuranceClaims_InsurancePolicies_PolicyId",
                    column: x => x.PolicyId,
                    principalTable: "InsurancePolicies",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "FK_InsuranceClaims_Users_ClaimantId",
                    column: x => x.ClaimantId,
                    principalTable: "Users",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AiRiskAssessments_CycleId",
            table: "AiRiskAssessments",
            column: "CycleId");

        migrationBuilder.CreateIndex(
            name: "IX_Animals_Name",
            table: "Animals",
            column: "Name",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_BreederProfiles_UserId",
            table: "BreederProfiles",
            column: "UserId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_ContractHeads_ContractCode",
            table: "ContractHeads",
            column: "ContractCode",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_ContractHeads_CycleId",
            table: "ContractHeads",
            column: "CycleId");

        migrationBuilder.CreateIndex(
            name: "IX_ContractHeads_InvestmentId",
            table: "ContractHeads",
            column: "InvestmentId");

        migrationBuilder.CreateIndex(
            name: "IX_CycleLogImages_LogId",
            table: "CycleLogImages",
            column: "LogId");

        migrationBuilder.CreateIndex(
            name: "IX_CycleLogs_CycleId",
            table: "CycleLogs",
            column: "CycleId");

        migrationBuilder.CreateIndex(
            name: "IX_Cycles_AnimalId",
            table: "Cycles",
            column: "AnimalId");

        migrationBuilder.CreateIndex(
            name: "IX_Cycles_BreederId",
            table: "Cycles",
            column: "BreederId");

        migrationBuilder.CreateIndex(
            name: "IX_CycleSettlements_CycleId",
            table: "CycleSettlements",
            column: "CycleId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_CycleSettlements_SettlerId",
            table: "CycleSettlements",
            column: "SettlerId");

        migrationBuilder.CreateIndex(
            name: "IX_CycleVaccinePlans_CycleId",
            table: "CycleVaccinePlans",
            column: "CycleId");

        migrationBuilder.CreateIndex(
            name: "IX_FatteningStages_CycleId",
            table: "FatteningStages",
            column: "CycleId");

        migrationBuilder.CreateIndex(
            name: "IX_InsuranceClaims_ClaimantId",
            table: "InsuranceClaims",
            column: "ClaimantId");

        migrationBuilder.CreateIndex(
            name: "IX_InsuranceClaims_PolicyId",
            table: "InsuranceClaims",
            column: "PolicyId");

        migrationBuilder.CreateIndex(
            name: "IX_InsurancePolicies_CycleId",
            table: "InsurancePolicies",
            column: "CycleId");

        migrationBuilder.CreateIndex(
            name: "IX_InsurancePolicies_InvestmentId",
            table: "InsurancePolicies",
            column: "InvestmentId");

        migrationBuilder.CreateIndex(
            name: "IX_Investments_CycleId",
            table: "Investments",
            column: "CycleId");

        migrationBuilder.CreateIndex(
            name: "IX_Investments_InvestorId",
            table: "Investments",
            column: "InvestorId");

        migrationBuilder.CreateIndex(
            name: "IX_KycDocuments_UserId",
            table: "KycDocuments",
            column: "UserId",
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_LogFeedItems_LogId",
            table: "LogFeedItems",
            column: "LogId");

        migrationBuilder.CreateIndex(
            name: "IX_LogVetRecords_LogId",
            table: "LogVetRecords",
            column: "LogId");

        migrationBuilder.CreateIndex(
            name: "IX_SettlementInvestorPayouts_InvestmentId",
            table: "SettlementInvestorPayouts",
            column: "InvestmentId");

        migrationBuilder.CreateIndex(
            name: "IX_SettlementInvestorPayouts_InvestorId",
            table: "SettlementInvestorPayouts",
            column: "InvestorId");

        migrationBuilder.CreateIndex(
            name: "IX_SettlementInvestorPayouts_SettlementId",
            table: "SettlementInvestorPayouts",
            column: "SettlementId");

        migrationBuilder.CreateIndex(
            name: "IX_Users_Phone",
            table: "Users",
            column: "Phone",
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(
            name: "AiRiskAssessments");

        migrationBuilder.DropTable(
            name: "BreederProfiles");

        migrationBuilder.DropTable(
            name: "ContractHeads");

        migrationBuilder.DropTable(
            name: "CycleLogImages");

        migrationBuilder.DropTable(
            name: "CycleVaccinePlans");

        migrationBuilder.DropTable(
            name: "FatteningStages");

        migrationBuilder.DropTable(
            name: "InsuranceClaims");

        migrationBuilder.DropTable(
            name: "KycDocuments");

        migrationBuilder.DropTable(
            name: "LogFeedItems");

        migrationBuilder.DropTable(
            name: "LogVetRecords");

        migrationBuilder.DropTable(
            name: "SettlementInvestorPayouts");

        migrationBuilder.DropTable(
            name: "InsurancePolicies");

        migrationBuilder.DropTable(
            name: "CycleLogs");

        migrationBuilder.DropTable(
            name: "CycleSettlements");

        migrationBuilder.DropTable(
            name: "Investments");

        migrationBuilder.DropTable(
            name: "Cycles");

        migrationBuilder.DropTable(
            name: "Animals");

        migrationBuilder.DropTable(
            name: "Users");
    }
}
