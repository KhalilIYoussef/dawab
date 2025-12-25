
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
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  name: string;
  phone: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  profilePictureUrl?: string;
  spaceLimit?: number;
  availableSpace?: number;
  rating?: number;
  documentsVerified?: boolean;
  physicalPapersSent?: boolean;
  physicalPapersVerified?: boolean;
  governorate?: string;
  googleMapsUrl?: string;
  nationalId?: string;
  iban?: string;
  bankName?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  contractUrl?: string;
  criminalRecordUrl?: string;
}

export interface Cycle {
  id: string;
  breederId: string;
  animalType: string;
  initialWeight: number;
  targetWeight: number;
  fundingGoal: number;
  currentFunding: number;
  totalHeads: number;
  availableHeads: number;
  startPricePerHead: number;
  startDate: string; // تم التأكد من وجودها لتخزين تاريخ بدء الدورة
  expectedDuration: number;
  status: CycleStatus;
  healthCertUrl: string;
  imageUrl: string;
  description: string;
  fatteningPlan?: string;
  insurancePolicyNumber?: string;
  animalInsuranceCost?: number;
  adminNote?: string;
  finalSalePrice?: number;
  actualEndDate?: string;
}

export interface Investment {
  id: string;
  investorId: string;
  cycleId: string;
  amount: number;
  headsCount: number;
  contractCodes: string[];
  date: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  transferReceiptUrl?: string;
  hasAnimalInsurance?: boolean;
  animalInsuranceFee?: number;
}

export interface CycleLog {
  id: string;
  cycleId: string;
  date: string;
  weight?: number;
  foodDetails: string;
  waterDetails?: string;
  notes?: string;
  images?: string[];
}
