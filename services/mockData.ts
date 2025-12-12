
import { User, UserRole, UserStatus, Cycle, CycleStatus, Investment, CycleLog } from '../types';

// --- OCR Extracted Data & Constants ---

export const STANDARD_COW_PLAN = `جدول تسمين العجول القياسي (دورة 6 أشهر):
1. المرحلة الأولى (التحضين 1-28 يوم):
   - علف مركز (16% بروتين): 4 كجم (تدريجي)
   - مواد خشنة (تبن/قش أرز): 1.5 كجم
   - علف أخضر (برسيم/دراوة): 10 كجم
   - إضافات: أملاح معدنية (30 جم) + خميرة

2. المرحلة الثانية (النمو السريع 29-90 يوم):
   - علف مركز (14%): 5-6 كجم
   - مواد خشنة: 2 كجم
   - سيلاج: 8 كجم

3. المرحلة الثالثة (الإنهاء 91+ يوم):
   - علف مركز: 7-8 كجم
   - مواد خشنة: 2.5 كجم

البرنامج البيطري (أبقار/جاموس):
- تحصين الحمى القلاعية (FMD) ثلاثي العترة.
- تحصين الجلد العقدي (LSD).
- جرعات منتظمة للطفيليات الداخلية (ايفوماك).
- فيتامين AD3E أسبوعياً.`;

export const STANDARD_SHEEP_PLAN = `جدول تسمين الخراف (البرقي/الرحماني - 3 إلى 4 أشهر):
1. مرحلة الاستقبال (1-15 يوم):
   - علف مركز (16%): 250 جم (تدريجي لمنع اللكمة)
   - دريس حجازي: مفتوح (أفضل من البرسيم لتقليل الرطوبة)
   - تجريع ديدان (البندازول) + تحصين كلوسترديا.

2. مرحلة التسمين (16-75 يوم):
   - علف مركز (14%): 1 كجم - 1.25 كجم
   - تبن/قش: 0.5 كجم

3. مرحلة التشطيب (آخر 15-30 يوم):
   - علف مركز (طاقة عالية): 1.5 كجم`;

// --- Mock Users ---

export const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'المدير العام (أدمن)',
    phone: '01000000001',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    documentsVerified: true,
    profilePictureUrl: 'https://i.pravatar.cc/150?u=admin',
  },
  {
    id: '2',
    name: 'مزرعة الحاج متولي',
    phone: '01200000002',
    role: UserRole.BREEDER,
    status: UserStatus.ACTIVE,
    spaceLimit: 50,
    availableSpace: 30,
    rating: 4.8,
    documentsVerified: true, // Fully verified
    physicalPapersSent: true,
    physicalPapersVerified: true,
    governorate: 'الشرقية',
    googleMapsUrl: 'https://maps.google.com',
    nationalId: '28001011234567',
    iban: 'EG12000200010000000000000005',
    bankName: 'البنك الأهلي المصري',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=metwally',
    criminalRecordUrl: 'uploaded',
    idCardFrontUrl: 'uploaded',
  },
  {
    id: '3',
    name: 'عزبة أولاد رجب',
    phone: '01100000003',
    role: UserRole.BREEDER,
    status: UserStatus.PENDING, // Needs Admin Approval
    spaceLimit: 20,
    availableSpace: 20,
    rating: 0,
    documentsVerified: false,
    physicalPapersSent: true,
    physicalPapersVerified: false,
    governorate: 'الفيوم',
    googleMapsUrl: 'https://maps.google.com',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=ragab',
  },
  {
    id: '4',
    name: 'أحمد المستثمر',
    phone: '01500000004',
    role: UserRole.INVESTOR,
    status: UserStatus.ACTIVE,
    documentsVerified: true,
    nationalId: '29012011234567',
    iban: 'EG55000300010000000000000009',
    bankName: 'بنك مصر',
    profilePictureUrl: 'https://i.pravatar.cc/150?u=ahmed',
    idCardFrontUrl: 'uploaded',
  },
  {
    id: '5',
    name: 'منى محمد',
    phone: '01055555555',
    role: UserRole.INVESTOR,
    status: UserStatus.PENDING, // Needs Admin Verification (Docs uploaded)
    documentsVerified: false,
    profilePictureUrl: 'https://i.pravatar.cc/150?u=mona',
    idCardFrontUrl: 'uploaded', // Simulated upload
    idCardBackUrl: 'uploaded',
  }
];

// --- Mock Cycles ---

const today = new Date();
const twoMonthsAgo = new Date(new Date().setDate(today.getDate() - 60)).toISOString().split('T')[0];
const sixMonthsAgo = new Date(new Date().setDate(today.getDate() - 180)).toISOString().split('T')[0];

export const INITIAL_CYCLES: Cycle[] = [
  {
    id: '100', // Completed
    breederId: '2',
    animalType: 'عجل تسمين هولشتاين',
    initialWeight: 200,
    targetWeight: 450,
    fundingGoal: 30000, 
    currentFunding: 30000,
    totalHeads: 1,
    availableHeads: 0,
    startPricePerHead: 30000, 
    startDate: sixMonthsAgo,
    expectedDuration: 180,
    status: CycleStatus.COMPLETED,
    healthCertUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'دورة تسمين مكتملة لعجل واحد، تم بيعه وتحقيق أرباح.',
    fatteningPlan: STANDARD_COW_PLAN,
    finalSalePrice: 45000,
    actualEndDate: today.toISOString().split('T')[0],
  },
  {
    id: '101', // SHARED OWNERSHIP (Active)
    breederId: '2',
    animalType: 'عجل خليط رقم 101',
    initialWeight: 250,
    targetWeight: 450,
    fundingGoal: 32000,
    currentFunding: 0, // Reset to 0 for demo purposes (so buttons work)
    totalHeads: 1,
    availableHeads: 1, 
    startPricePerHead: 32000,
    startDate: twoMonthsAgo, 
    expectedDuration: 180, 
    status: CycleStatus.ACTIVE,
    healthCertUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'عجل خليط عالي التحويل، شراكة بين مستثمرين.',
    fatteningPlan: STANDARD_COW_PLAN,
  },
  {
    id: '102', // Partial Funding
    breederId: '3', // Ragab
    animalType: 'خروف برقي رقم 50',
    initialWeight: 35,
    targetWeight: 55, 
    fundingGoal: 6000,
    currentFunding: 2000, // Partially funded
    totalHeads: 1,
    availableHeads: 1,
    startPricePerHead: 6000,
    startDate: new Date().toISOString().split('T')[0], 
    expectedDuration: 100,
    status: CycleStatus.ACTIVE, 
    healthCertUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1484557985045-6f550bb4377c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'تسمين خروف برقي ممتاز. فرصة للمشاركة بمبلغ بسيط.',
    fatteningPlan: STANDARD_SHEEP_PLAN,
  }
];

// --- Mock Investments (Shared) ---

export const INITIAL_INVESTMENTS: Investment[] = [
  {
    id: 'inv_100_1',
    investorId: '4',
    cycleId: '100',
    amount: 30000, 
    headsCount: 1,
    contractCodes: ['DW-100-FULL'],
    date: sixMonthsAgo,
    status: 'APPROVED',
  },
  // Note: Cleared initial investments for 101 to match the 0 funding state
  {
    id: 'inv_102_1',
    investorId: '4', 
    cycleId: '102',
    amount: 2000,
    headsCount: 0.33,
    contractCodes: ['DW-102-PART1'],
    date: new Date().toISOString(),
    status: 'APPROVED',
  }
];

export const INITIAL_LOGS: CycleLog[] = [
  {
    id: 'log1',
    cycleId: '101',
    date: twoMonthsAgo, 
    weight: 250,
    foodDetails: 'علف بادي 16% + دريس حجازي',
    notes: 'استلام العجل وبدء فترة التحضين.',
  }
];
