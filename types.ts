
export enum UserRole {
  ADMIN = 'ADMIN',
  BREEDER = 'BREEDER',
  INVESTOR = 'INVESTOR',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
}

export enum CycleStatus {
  PENDING = 'PENDING', // Waiting for Admin approval
  ACTIVE = 'ACTIVE',   // Funding/Fattening in progress
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string; // New: Security
  role: UserRole;
  status: UserStatus;
  profilePictureUrl?: string; // New: Profile Picture
  spaceLimit?: number; // For Breeders: max number of animals
  availableSpace?: number; // For Breeders
  rating?: number; // For Breeders 1-5
  documentsVerified?: boolean; // Digital Verification
  
  // Physical Papers Verification (Anti-Fraud)
  physicalPapersSent?: boolean; // User clicked "I sent the mail"
  physicalPapersVerified?: boolean; // Admin received the mail
  
  // Location Info (New)
  governorate?: string; // e.g. Sharqia, Fayoum
  googleMapsUrl?: string; // Link to farm location

  // KYC & Financial Info
  nationalId?: string;
  iban?: string;
  bankName?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  contractUrl?: string; // New: Signed contract copy
  
  // Breeder Security Docs (New)
  criminalRecordUrl?: string; // الفيش الجنائي
}

export interface Cycle {
  id: string;
  breederId: string;
  animalType: string; // Cow, Sheep, Camel
  initialWeight: number; // kg
  targetWeight: number; // kg (estimated)
  fundingGoal: number; // SAR (Calculated: totalHeads * startPricePerHead)
  currentFunding: number; // SAR
  
  // Per Head Logic
  totalHeads: number; // Total number of animals in this cycle
  availableHeads: number; // Remaining animals to be sold
  
  // Simplified Cost Logic
  startPricePerHead: number; // Total cost to start (Animal + Care estimated)

  startDate: string;
  expectedDuration: number; // Duration in days (e.g., 180 for cows, 90 for sheep)
  status: CycleStatus;
  healthCertUrl: string;
  imageUrl: string;
  description: string;
  fatteningPlan?: string; // New: Feeding and Care Plan details
  isInsured?: boolean; // New: Flag for cycle insurance
  insurancePolicyNumber?: string; // Animal Insurance
  animalInsuranceCost?: number;
  adminNote?: string;
  
  // Financials & Completion
  finalSalePrice?: number; // Total revenue from selling the animals
  actualEndDate?: string;
}

export interface Investment {
  id: string;
  investorId: string;
  cycleId: string;
  amount: number;
  
  // Per Head Investment
  headsCount: number; // How many animals bought
  contractCodes: string[]; // e.g. ["DW-101-01", "DW-101-02"] unique contract per animal

  date: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  transferReceiptUrl?: string; // URL/Path to the uploaded image
  
  // Investor Animal Insurance
  hasAnimalInsurance?: boolean; // Opt-in if cycle isn't insured
  animalInsuranceFee?: number;
}

export interface CycleLog {
  id: string;
  cycleId: string;
  date: string; // YYYY-MM-DD
  weight?: number; // Current weight in KG
  foodDetails: string; // e.g., "5kg Alfalfa + 2kg Concentrates"
  waterDetails?: string; // e.g., "30 Liters"
  notes?: string;
  images?: string[]; // Array of image URLs
}
