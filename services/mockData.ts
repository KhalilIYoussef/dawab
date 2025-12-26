
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
    password: '123',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    documentsVerified: true,
    profilePictureUrl: 'https://i.pravatar.cc/150?u=admin',
  },
  {
    id: '2',
    name: 'مزرعة الحاج متولي',
    phone: '01200000002',
    password: '123',
    role: UserRole.BREEDER,
    status: UserStatus.ACTIVE,
    spaceLimit: 50,
    availableSpace: 30,
    rating: 4.8,
    documentsVerified: true,
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
    password: '123',
    role: UserRole.BREEDER,
    status: UserStatus.PENDING,
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
    password: '123',
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
    password: '123',
    role: UserRole.INVESTOR,
    status: UserStatus.PENDING,
    documentsVerified: false,
    profilePictureUrl: 'https://i.pravatar.cc/150?u=mona',
    idCardFrontUrl: 'uploaded',
    idCardBackUrl: 'uploaded',
  }
];

// --- Mock Cycles ---

const today = new Date();
const twoMonthsAgo = new Date(new Date().setDate(today.getDate() - 60)).toISOString().split('T')[0];
const sixMonthsAgo = new Date(new Date().setDate(today.getDate() - 180)).toISOString().split('T')[0];

export const INITIAL_CYCLES: Cycle[] = [
  {
    id: '100',
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
    insurancePolicyNumber: 'POL-999-FIN'
  },
  {
    id: '101',
    breederId: '2',
    animalType: 'عجل خليط رقم 101',
    initialWeight: 250,
    targetWeight: 450,
    fundingGoal: 32000,
    currentFunding: 32000,
    totalHeads: 1,
    availableHeads: 0, 
    startPricePerHead: 32000,
    startDate: twoMonthsAgo, 
    expectedDuration: 180, 
    status: CycleStatus.ACTIVE,
    healthCertUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'عجل خليط عالي التحويل، شراكة بين مستثمرين.',
    fatteningPlan: STANDARD_COW_PLAN,
    insurancePolicyNumber: 'POL-101-99',
    isBarnInsured: true,
    barnInsuranceCost: 750
  },
  {
    id: '102',
    breederId: '3',
    animalType: 'خروف برقي ممتاز',
    initialWeight: 35,
    targetWeight: 55, 
    fundingGoal: 6500,
    currentFunding: 1500, 
    totalHeads: 1,
    availableHeads: 1,
    startPricePerHead: 6500,
    startDate: new Date().toISOString().split('T')[0], 
    expectedDuration: 100,
    status: CycleStatus.PENDING, 
    healthCertUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1484557985045-6f550bb4377c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'تسمين خروف برقي ممتاز بعزبة أولاد رجب. فرصة استثمارية قصيرة المدى.',
    fatteningPlan: STANDARD_SHEEP_PLAN,
    insurancePolicyNumber: 'INS-SHEEP-01'
  },
  {
    id: '103',
    breederId: '2',
    animalType: 'عجل هولشتاين صغير',
    initialWeight: 180,
    targetWeight: 400, 
    fundingGoal: 28000,
    currentFunding: 12000, 
    totalHeads: 1,
    availableHeads: 1,
    startPricePerHead: 28000,
    startDate: new Date().toISOString().split('T')[0], 
    expectedDuration: 210,
    status: CycleStatus.PENDING, 
    healthCertUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'دورة تسمين عجول هولشتاين، سلالة عالية التحويل في مزرعة الحاج متولي.',
    fatteningPlan: STANDARD_COW_PLAN,
    insurancePolicyNumber: 'POL-HOL-003',
    isBarnInsured: true,
    barnInsuranceCost: 750
  },
  {
    id: '104',
    breederId: '2',
    animalType: 'مجموعة أغنام عساف (5 رؤوس)',
    initialWeight: 30,
    targetWeight: 60, 
    fundingGoal: 35000,
    currentFunding: 0, 
    totalHeads: 5,
    availableHeads: 5,
    startPricePerHead: 7000,
    startDate: new Date().toISOString().split('T')[0], 
    expectedDuration: 120,
    status: CycleStatus.PENDING, 
    healthCertUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1511117833452-482268548b01?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    description: 'دورة تسمين جماعية لـ 5 رؤوس من غنم العساف الممتاز.',
    fatteningPlan: STANDARD_SHEEP_PLAN,
    insurancePolicyNumber: 'INS-ASSAF-GROUP',
    isBarnInsured: true,
    barnInsuranceCost: 750
  },
  {
    id: '105',
    breederId: '2',
    animalType: 'عجل بقري بلدي',
    initialWeight: 220,
    targetWeight: 500, 
    fundingGoal: 33000,
    currentFunding: 5000, 
    totalHeads: 1,
    availableHeads: 1,
    startPricePerHead: 33000,
    startDate: new Date().toISOString().split('T')[0], 
    expectedDuration: 200,
    status: CycleStatus.PENDING, 
    healthCertUrl: '#',
    imageUrl: 'https://images.unsplash.com/photo-1545468841-72460679809a?auto=format&fit=crop&w=800&q=80',
    description: 'عجل بقري بلدي ممتاز، دورة استثمارية متوسطة المدى.',
    fatteningPlan: STANDARD_COW_PLAN,
    insurancePolicyNumber: 'POL-BALADI-202'
  }
];

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
    hasAnimalInsurance: true,
    animalInsuranceFee: 900 // 3% of 30,000
  },
  {
    id: 'inv_101_1',
    investorId: '4',
    cycleId: '101',
    amount: 32000, 
    headsCount: 1,
    contractCodes: ['DW-101-FULL'],
    date: twoMonthsAgo,
    status: 'APPROVED',
    hasAnimalInsurance: true,
    animalInsuranceFee: 960 // 3% of 32,000
  },
  {
    id: 'inv_102_1',
    investorId: '4',
    cycleId: '102',
    amount: 1500, 
    headsCount: 1,
    contractCodes: ['DW-102-MOCK'],
    date: today.toISOString(),
    status: 'APPROVED',
    hasAnimalInsurance: true,
    animalInsuranceFee: 45
  },
  {
    id: 'inv_mock_3',
    investorId: '4',
    cycleId: '103',
    amount: 12000, 
    headsCount: 1,
    contractCodes: ['DW-103-MOCK'],
    date: today.toISOString(),
    status: 'APPROVED',
    hasAnimalInsurance: true,
    animalInsuranceFee: 360 // 3% of 12,000
  },
  {
    id: 'inv_105_1',
    investorId: '4',
    cycleId: '105',
    amount: 5000, 
    headsCount: 1,
    contractCodes: ['DW-105-MOCK'],
    date: today.toISOString(),
    status: 'APPROVED',
    hasAnimalInsurance: true,
    animalInsuranceFee: 150
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
