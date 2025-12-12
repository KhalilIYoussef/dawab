
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Sprout, LayoutDashboard, Wallet, TrendingUp, History, 
  Settings, LogOut, Plus, FileText, ChevronRight, MapPin, Search,
  AlertTriangle, DollarSign, Activity, Wheat, CheckCircle, Clock,
  Upload, Camera, Utensils, Menu, X, Tractor, ShieldCheck, Ban, Trash2, Eye,
  Lock, ArrowRight, UserPlus, LogIn, FileCheck, FileWarning, Filter, Check, XCircle,
  Banknote, Image as ImageIcon, ClipboardList, Scale, Shield, Info, PieChart, Coins,
  Calculator, ArrowDown, ShoppingBag, Gavel
} from 'lucide-react';
import { 
  INITIAL_USERS, INITIAL_CYCLES, INITIAL_INVESTMENTS, INITIAL_LOGS,
  STANDARD_COW_PLAN, STANDARD_SHEEP_PLAN
} from './services/mockData';
import { 
  User, UserRole, UserStatus, Cycle, CycleStatus, Investment, CycleLog 
} from './types';
import { analyzeCycleRisk } from './services/geminiService';
import { Button, Card, Badge, Modal, Input, FatteningPlanViewer, SimplePlanBuilder } from './components/UIComponents';

// --- Constants ---
const PLATFORM_FEE_PERCENT = 0.025; // 2.5% Platform Operation Fee
const INSURANCE_FEE_PERCENT = 0.03; // 3.0% Animal Life Insurance

// --- Helper Components (Defined outside App to avoid re-renders) ---

const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary text-white shadow-lg shadow-primary/30 translate-x-1' 
        : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-primary'
    }`}
  >
    <Icon size={20} strokeWidth={active ? 2.5 : 2} />
    <span className={`font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
    {active && <ChevronRight size={16} className="mr-auto" />}
  </button>
);

const StatCard: React.FC<{ 
  title: string, 
  value: string | number, 
  icon: any, 
  color: 'primary' | 'secondary' | 'accent' | 'blue' | 'purple',
  onClick?: () => void 
}> = ({ title, value, icon: Icon, color, onClick }) => {
  const colors = {
    primary: 'bg-green-50 text-green-600',
    secondary: 'bg-orange-50 text-orange-600',
    accent: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  
  return (
    <div onClick={onClick} className={`${onClick ? 'cursor-pointer transform hover:scale-[1.02] transition-transform duration-200' : ''} h-full`}>
      <Card className="p-6 flex items-center gap-4 hover:shadow-md transition-shadow h-full relative group">
        <div className={`p-4 rounded-2xl ${colors[color] || colors.primary}`}>
          <Icon size={28} />
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <p className="text-xl md:text-2xl font-bold text-gray-800">{value}</p>
        </div>
        {onClick && (
            <div className="absolute top-4 right-4 text-gray-300 group-hover:text-primary transition-colors">
                <Info size={16} />
            </div>
        )}
      </Card>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string; type?: 'user' | 'cycle' }> = ({ status, type }) => {
  const styles: {[key: string]: string} = {
    'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
    'PENDING': type === 'user' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
    'REJECTED': 'bg-red-100 text-red-700 border-red-200',
    'APPROVED': 'bg-green-100 text-green-700',
    'PENDING_APPROVAL': 'bg-yellow-100 text-yellow-700'
  };

  const labels: {[key: string]: string} = {
    'ACTIVE': type === 'cycle' ? 'نشطة' : 'نشط',
    'PENDING': type === 'user' ? 'معلق' : 'قيد المراجعة',
    'COMPLETED': 'مكتملة',
    'REJECTED': 'مرفوضة',
    'APPROVED': 'مقبول',
    'PENDING_APPROVAL': 'بانتظار الموافقة'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status}
    </span>
  );
};

// --- Login / Registration Screen Component ---
interface LoginScreenProps {
  onLogin: (user: User) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, users, setUsers }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    role: UserRole.INVESTOR
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.phone === formData.phone);
    if (user) {
      onLogin(user);
    } else {
      setError('رقم الهاتف غير مسجل. يرجى التأكد من الرقم أو إنشاء حساب جديد.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.phone === formData.phone)) {
      setError('رقم الهاتف مسجل بالفعل.');
      return;
    }
    if (formData.phone.length < 11) {
       setError('رقم الهاتف غير صحيح.');
       return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      status: UserStatus.PENDING,
      documentsVerified: false,
      profilePictureUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
    };

    setUsers([...users, newUser]);
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[500px]">
        {/* Visual Side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary text-white p-12 text-center relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] opacity-10 bg-cover bg-center"></div>
          <Sprout size={64} className="mb-6 z-10" />
          <h1 className="text-4xl font-bold mb-4 z-10">منصة دواب</h1>
          <p className="text-lg opacity-90 z-10">استثمر في الثروة الحيوانية بأمان، أو ابدأ دورتك الإنتاجية بتمويل تشاركي.</p>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-right">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isRegistering ? 'أدخل بياناتك للانضمام إلينا' : 'أدخل رقم هاتفك للمتابعة'}
            </p>
          </div>

          <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
            {isRegistering && (
              <Input 
                label="الاسم بالكامل" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                placeholder="أحمد محمد" 
                required 
              />
            )}
            
            <Input 
              label="رقم الهاتف" 
              name="phone" 
              value={formData.phone} 
              onChange={handleInputChange} 
              placeholder="01xxxxxxxxx" 
              required 
            />

            <Input 
              label="كلمة المرور" 
              type="password"
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              placeholder="******" 
              required 
            />

            {isRegistering && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الحساب</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.INVESTOR})}
                    className={`p-3 rounded-lg border text-center transition-all ${formData.role === UserRole.INVESTOR ? 'border-primary bg-green-50 text-primary font-bold' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    مستثمر
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: UserRole.BREEDER})}
                    className={`p-3 rounded-lg border text-center transition-all ${formData.role === UserRole.BREEDER ? 'border-secondary bg-orange-50 text-secondary font-bold' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    مربي
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" className="w-full py-3 text-lg" disabled={false}>
              {isRegistering ? 'إنشاء الحساب' : 'دخول'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary hover:underline text-sm font-medium"
            >
              {isRegistering ? 'لدي حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
            </button>
          </div>

          {/* Quick Demo Links */}
          <div className="mt-8 pt-6 border-t border-gray-100">
             <p className="text-xs text-center text-gray-400 mb-3">للتجربة السريعة (Demo Users)</p>
             <div className="flex justify-center gap-2 flex-wrap">
                <button onClick={() => onLogin(users[0])} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Admin</button>
                <button onClick={() => onLogin(users[1])} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Breeder</button>
                <button onClick={() => onLogin(users[3])} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Investor</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Profile View Component ---
const ProfileView: React.FC<{
  user: User;
  onUpdate: (updatedUser: User) => void;
}> = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  
  // Handlers for file uploads (simulated)
  const handleFileUpload = (field: keyof User) => {
    alert("تم رفع الملف بنجاح (محاكاة)");
    onUpdate({ ...user, [field]: 'uploaded_url' });
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handlePhysicalPaperConfirm = () => {
    if (confirm("هل أنت متأكد من أنك قمت بإرسال الأوراق الأصلية عبر البريد المسجل؟")) {
      onUpdate({ ...user, physicalPapersSent: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-green-600 to-green-400"></div>
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-12 px-4">
          <div className="relative group">
             <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 shadow-md overflow-hidden flex items-center justify-center text-2xl font-bold text-gray-400">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
             </div>
             <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border hover:bg-gray-50 text-gray-600">
                <Camera size={16} />
             </button>
          </div>
          <div className="flex-1 text-center md:text-right mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
               <span className="text-sm">{user.role === UserRole.BREEDER ? 'مربي مواشي' : user.role === UserRole.ADMIN ? 'مدير النظام' : 'مستثمر'}</span>
               {user.status === UserStatus.ACTIVE && <CheckCircle size={16} className="text-blue-500" />}
            </div>
          </div>
          {isEditing ? (
             <div className="flex gap-2">
               <Button onClick={handleSave} size="sm">حفظ التغييرات</Button>
               <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">إلغاء</Button>
             </div>
          ) : (
             <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">تعديل الملف</Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Settings size={20} className="text-primary"/> البيانات الشخصية
          </h3>
          <div className="space-y-4">
             <Input label="الاسم" value={formData.name} disabled={!isEditing} onChange={e => setFormData({...formData, name: e.target.value})} />
             <Input label="رقم الهاتف" value={formData.phone} disabled={!isEditing} onChange={e => setFormData({...formData, phone: e.target.value})} />
             {user.role === UserRole.BREEDER && (
                <>
                   <Input label="المحافظة" value={formData.governorate || ''} disabled={!isEditing} onChange={e => setFormData({...formData, governorate: e.target.value})} />
                   <Input label="رابط الموقع (Google Maps)" value={formData.googleMapsUrl || ''} disabled={!isEditing} onChange={e => setFormData({...formData, googleMapsUrl: e.target.value})} />
                </>
             )}
          </div>
        </Card>

        {/* Verification & Documents - Hidden for Admin */}
        {user.role !== UserRole.ADMIN && (
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary"/> التوثيق والأمان
            </h3>
            
            <div className="space-y-4">
               {/* Digital ID */}
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${user.idCardFrontUrl ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                        <FileText size={20} />
                     </div>
                     <div>
                        <p className="font-medium text-sm">بطاقة الرقم القومي</p>
                        <p className="text-xs text-gray-500">{user.idCardFrontUrl ? 'تم الرفع' : 'مطلوب'}</p>
                     </div>
                  </div>
                  {!user.idCardFrontUrl && <Button size="sm" variant="outline" onClick={() => handleFileUpload('idCardFrontUrl')}>رفع</Button>}
               </div>

               {/* Criminal Record (Breeders Only) */}
               {user.role === UserRole.BREEDER && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-full ${user.criminalRecordUrl ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                          <FileWarning size={20} />
                       </div>
                       <div>
                          <p className="font-medium text-sm">الفيش الجنائي</p>
                          <p className="text-xs text-gray-500">{user.criminalRecordUrl ? 'تم الرفع' : 'مطلوب للتوثيق'}</p>
                       </div>
                    </div>
                    {!user.criminalRecordUrl && <Button size="sm" variant="outline" onClick={() => handleFileUpload('criminalRecordUrl')}>رفع</Button>}
                  </div>
               )}

               {/* Physical Contracts */}
               <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">العقود الورقية</h4>
                  <p className="text-xs text-gray-500 mb-3">يجب إرسال أصول العقود الموقعة وصور الأوراق الثبوتية عبر البريد إلى: <span className="font-bold text-gray-700">ص.ب 1234، القاهرة الجديدة، مبنى دواب.</span></p>
                  
                  {user.physicalPapersVerified ? (
                     <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 text-sm font-bold">
                        <CheckCircle size={18} /> تم استلام ومراجعة الأوراق الأصلية
                     </div>
                  ) : user.physicalPapersSent ? (
                     <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg flex items-center gap-2 text-sm">
                        <Clock size={18} /> بانتظار استلام البريد من قبل الإدارة
                     </div>
                  ) : (
                     <Button onClick={handlePhysicalPaperConfirm} variant="secondary" className="w-full">
                        تأكيد إرسال الأوراق بالبريد
                     </Button>
                  )}
               </div>
            </div>
          </Card>
        )}

        {/* Financial Info (IBAN) - Hidden for Admin */}
        {user.role !== UserRole.ADMIN && (
          <Card className="p-6 md:col-span-2">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Banknote size={20} className="text-primary"/> بيانات الحساب البنكي (لتحويل الأرباح)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                  label="اسم البنك" 
                  value={formData.bankName || ''} 
                  disabled={!isEditing} 
                  onChange={e => setFormData({...formData, bankName: e.target.value})} 
                  placeholder="مثال: البنك الأهلي المصري"
               />
               <Input 
                  label="رقم الآيبان (IBAN)" 
                  value={formData.iban || ''} 
                  disabled={!isEditing} 
                  onChange={e => setFormData({...formData, iban: e.target.value})} 
                  placeholder="EG..."
                  dir="ltr"
                  className="text-left font-mono placeholder:text-right"
               />
            </div>
          </Card>
        )}

        {/* Stats for Breeder */}
        {user.role === UserRole.BREEDER && (
          <Card className="p-6 md:col-span-2">
            <h3 className="font-bold text-lg mb-4">إحصائيات المزرعة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-green-50 p-4 rounded-xl flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={175} strokeDashoffset={175 - (175 * ((user.availableSpace || 0) / (user.spaceLimit || 100)))} className="text-green-500" />
                     </svg>
                     <span className="absolute text-sm font-bold">{user.availableSpace}</span>
                  </div>
                  <div>
                     <p className="text-sm text-gray-500">الأماكن المتاحة</p>
                     <p className="font-bold">من أصل {user.spaceLimit}</p>
                  </div>
               </div>
               
               <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                     <Activity size={20} className="text-blue-500" />
                     <span className="font-bold text-gray-700">تقييم الأداء</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{user.rating} <span className="text-sm text-gray-400">/ 5.0</span></div>
                  <p className="text-xs text-gray-500 mt-1">بناءً على الدورات السابقة</p>
               </div>

               <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                     <AlertTriangle size={20} className="text-orange-500" />
                     <span className="font-bold text-gray-700">معدل النفوق</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-700">0.5% <span className="text-sm text-gray-400">منخفض</span></div>
                  <p className="text-xs text-gray-500 mt-1">آخر 12 شهر</p>
               </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [cycles, setCycles] = useState<Cycle[]>(INITIAL_CYCLES);
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);
  const [logs, setLogs] = useState<CycleLog[]>(INITIAL_LOGS);
  
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  // -- Modals State for Breeder --
  const [detailsModal, setDetailsModal] = useState<{isOpen: boolean, cycle: Cycle | null}>({isOpen: false, cycle: null});
  const [logsModal, setLogsModal] = useState<{isOpen: boolean, cycle: Cycle | null}>({isOpen: false, cycle: null});
  const [logForm, setLogForm] = useState({ weight: '', food: '', notes: '' });

  // -- Modal State for Financial Details (Admin) --
  const [financialDetails, setFinancialDetails] = useState<{isOpen: boolean, type: 'TOTAL' | 'REVENUE' | 'INSURANCE' | 'NET_CAPITAL' | null}>({isOpen: false, type: null});

  // -- Modal State for Ending Cycle (Admin) --
  const [endCycleModal, setEndCycleModal] = useState<{isOpen: boolean, cycle: Cycle | null, salePrice: string}>({
      isOpen: false, cycle: null, salePrice: ''
  });

  // Success Modal State
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  // Invest Confirmation Modal State (With Receipt)
  const [investModal, setInvestModal] = useState({
    isOpen: false,
    cycle: null as Cycle | null,
    amount: 0,
    receiptFile: null as File | null,
    wantsInsurance: false, // New state for investor opting for insurance
  });

  // Admin specific states
  const [cycleFilter, setCycleFilter] = useState<CycleStatus | 'ALL'>('ALL');

  // -- States for Breeder Form --
  const [breederForm, setBreederForm] = useState<Partial<Cycle> & { isInsured: boolean }>({
    animalType: 'cows',
    initialWeight: 200,
    targetWeight: 450,
    startPricePerHead: 30000,
    description: '',
    fatteningPlan: STANDARD_COW_PLAN, 
    expectedDuration: 180,
    isInsured: false, // Breeder chooses if the whole cycle is insured
  });

  // -- Stable handler for PlanBuilder to avoid infinite loops --
  const handlePlanChange = useCallback((newPlan: string) => {
    setBreederForm(prev => {
        if (prev.fatteningPlan === newPlan) return prev;
        return { ...prev, fatteningPlan: newPlan };
    });
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setSidebarOpen(false);
  };

  const handleUpdateProfile = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const verifyUser = (userId: string, status: boolean) => {
    setUsers(users.map(u => u.id === userId ? { 
      ...u, 
      status: status ? UserStatus.ACTIVE : UserStatus.REJECTED,
      documentsVerified: status,
      physicalPapersVerified: status
    } : u));
  };

  const updateCycleStatus = (cycleId: string, newStatus: CycleStatus) => {
    setCycles(prevCycles => prevCycles.map(c => 
        c.id === cycleId ? { ...c, status: newStatus } : c
    ));
    if (newStatus === CycleStatus.ACTIVE) {
        setSuccessModal({ isOpen: true, message: 'تم اعتماد الدورة ونشرها للمستثمرين بنجاح.' });
    }
  };

  const updateInvestmentStatus = (investmentId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setInvestments(prev => prev.map(inv => 
      inv.id === investmentId ? { ...inv, status: newStatus } : inv
    ));
    // Note: In a real app, if rejected, we would reverse the funding on the cycle.
    // For this demo, we assume Approved confirms the funding we already reserved.
  };

  const deleteCycle = (cycleId: string) => {
    if(confirm('هل أنت متأكد من حذف هذه الدورة نهائياً؟')) {
        setCycles(prev => prev.filter(c => c.id !== cycleId));
    }
  };

  // --- End Cycle Handler ---
  const confirmEndCycle = () => {
      if (!endCycleModal.cycle || !endCycleModal.salePrice) return;
      
      const salePrice = parseFloat(endCycleModal.salePrice);
      
      setCycles(prev => prev.map(c => c.id === endCycleModal.cycle!.id ? {
          ...c,
          status: CycleStatus.COMPLETED,
          finalSalePrice: salePrice,
          actualEndDate: new Date().toISOString().split('T')[0]
      } : c));

      setEndCycleModal({ isOpen: false, cycle: null, salePrice: '' });
      setSuccessModal({ isOpen: true, message: `تم تسجيل بيع القطيع بمبلغ ${salePrice.toLocaleString()} ج.م وإنهاء الدورة بنجاح. سيتم توزيع الأرباح على المستثمرين (محاكاة).` });
  };

  const handleBreederCreateCycle = () => {
    if (!breederForm.fatteningPlan || breederForm.fatteningPlan.length < 50) {
      alert("يرجى التأكد من ملء خطة التسمين بشكل صحيح.");
      return;
    }

    const newCycle: Cycle = {
      id: Math.random().toString(36).substr(2, 9),
      breederId: currentUser!.id,
      animalType: breederForm.animalType === 'cows' ? 'عجول تسمين' : 'خراف برقي',
      initialWeight: Number(breederForm.initialWeight),
      targetWeight: Number(breederForm.targetWeight),
      startPricePerHead: Number(breederForm.startPricePerHead),
      fundingGoal: Number(breederForm.startPricePerHead), // For 1 head cycle
      currentFunding: 0,
      totalHeads: 1,
      availableHeads: 1,
      startDate: new Date().toISOString().split('T')[0],
      expectedDuration: Number(breederForm.expectedDuration),
      status: CycleStatus.PENDING,
      healthCertUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53',
      description: breederForm.description || '',
      fatteningPlan: breederForm.fatteningPlan,
      // If breeder checks insurance, we flag it.
      insurancePolicyNumber: breederForm.isInsured ? 'PENDING-REQ' : undefined 
    };
    
    setCycles([...cycles, newCycle]);
    setCreateModalOpen(false);
    setSuccessModal({ isOpen: true, message: 'تم إرسال الدورة للمراجعة من قبل الإدارة.' });
  };

  // --- LOGS HANDLER ---
  const handleSaveLog = () => {
    if (!logsModal.cycle || !logForm.weight) {
        alert("يرجى إدخال الوزن على الأقل.");
        return;
    }
    const newLog: CycleLog = {
        id: Math.random().toString(36).substr(2, 9),
        cycleId: logsModal.cycle.id,
        date: new Date().toISOString(),
        weight: Number(logForm.weight),
        foodDetails: logForm.food,
        notes: logForm.notes
    };
    setLogs([newLog, ...logs]);
    setLogForm({ weight: '', food: '', notes: '' });
  };

  // STEP 1: Open the Modal
  const openInvestModal = (cycleId: string, amount: number) => {
    const cycle = cycles.find(c => c.id === cycleId);
    if (!cycle) return;

    const remaining = cycle.fundingGoal - cycle.currentFunding;

    if (amount > remaining) {
      alert(`عفواً، المبلغ المتاح للاستثمار هو ${remaining.toLocaleString()} ج.م فقط.`);
      return;
    }

    // Reset and open modal
    setInvestModal({
      isOpen: true,
      cycle: cycle,
      amount: amount,
      receiptFile: null,
      wantsInsurance: false, // Reset option
    });
  };

  // STEP 2: Handle File Selection
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvestModal(prev => ({ ...prev, receiptFile: e.target.files![0] }));
    }
  };

  // STEP 3: Confirm and Submit Investment
  const submitInvestment = () => {
    const { cycle, amount, receiptFile, wantsInsurance } = investModal;
    if (!cycle || !currentUser) return;

    if (!receiptFile) {
       alert("الرجاء رفع صورة إيصال التحويل لإكمال العملية.");
       return;
    }

    // Calculate Fees (Deducted from Total Amount)
    const platformFee = amount * PLATFORM_FEE_PERCENT;
    const insuranceFee = (wantsInsurance || cycle.insurancePolicyNumber) ? amount * INSURANCE_FEE_PERCENT : 0;
    const totalDeductions = platformFee + insuranceFee;
    const netInvestment = amount - totalDeductions;

    const sharePercentage = netInvestment / cycle.fundingGoal;
    
    // Create local object URL for the uploaded file to display it (Simulation)
    const receiptUrl = URL.createObjectURL(receiptFile);

    const newInvestment: Investment = {
      id: Math.random().toString(36).substr(2, 9),
      investorId: currentUser.id,
      cycleId: cycle.id,
      amount: amount, // Total paid
      headsCount: sharePercentage, // Share based on NET investment
      contractCodes: [`DW-${cycle.id}-${Math.floor(Math.random() * 1000)}`],
      date: new Date().toISOString(),
      status: 'PENDING_APPROVAL',
      transferReceiptUrl: receiptUrl, // Add the receipt
      hasAnimalInsurance: !!cycle.insurancePolicyNumber || wantsInsurance // Either included by breeder OR opted by investor
    };

    setInvestments([...investments, newInvestment]);
    
    // Update cycle funding locally for demo (using NET investment technically, but for visual goal tracking we usually track capital raised. Let's track net for accurate filling)
    setCycles(cycles.map(c => c.id === cycle.id ? {
      ...c,
      currentFunding: c.currentFunding + netInvestment, // Only net goes to cycle
      availableHeads: (c.currentFunding + netInvestment) >= c.fundingGoal ? 0 : 1
    } : c));

    // Close invest modal
    setInvestModal({ isOpen: false, cycle: null, amount: 0, receiptFile: null, wantsInsurance: false });

    // Show success
    setSuccessModal({ 
      isOpen: true, 
      message: `تم تسجيل طلب استثمار بقيمة ${amount.toLocaleString()} ج.م بنجاح!
      \nصافي الاستثمار في الدورة: ${netInvestment.toLocaleString()} ج.م
      ${wantsInsurance ? '\n تم تفعيل التأمين على الحياة.' : ''}
      \nسيقوم فريق الإدارة بمراجعة إيصال التحويل وتأكيد العملية.`
    });
  };

  // --- RENDER FUNCTIONS ---

  const renderAdminDashboard = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">لوحة تحكم الإدارة</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="إجمالي الاستثمارات" 
            value={`${cycles.reduce((acc, c) => acc + c.currentFunding, 0).toLocaleString()} ج.م`} 
            icon={DollarSign} 
            color="primary" 
            onClick={() => setActiveTab('financials')}
          />
          <StatCard 
            title="الدورات النشطة" 
            value={cycles.filter(c => c.status === CycleStatus.ACTIVE).length} 
            icon={Sprout} 
            color="secondary" 
            onClick={() => {
              setActiveTab('cycles');
              setCycleFilter(CycleStatus.ACTIVE);
            }}
          />
          <StatCard 
            title="المستخدمين" 
            value={users.length} 
            icon={Users} 
            color="accent" 
            onClick={() => setActiveTab('users')}
          />
          <StatCard 
            title="طلبات التسجيل" 
            value={users.filter(u => u.status === UserStatus.PENDING).length} 
            icon={UserPlus} 
            color="primary" 
            onClick={() => setActiveTab('users')}
          />
        </div>
      </div>
    );
  };

  const renderAdminUsers = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-4 text-sm text-gray-500">المستخدم</th>
                  <th className="text-right p-4 text-sm text-gray-500">الدور</th>
                  <th className="text-right p-4 text-sm text-gray-500">الوثائق</th>
                  <th className="text-right p-4 text-sm text-gray-500">العقود الورقية</th>
                  <th className="text-right p-4 text-sm text-gray-500">الحالة</th>
                  <th className="text-right p-4 text-sm text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.filter(u => u.role !== UserRole.ADMIN).map(user => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                           <img src={user.profilePictureUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                           <p className="font-bold text-gray-900">{user.name}</p>
                           <p className="text-xs text-gray-500">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded ${user.role === UserRole.BREEDER ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role === UserRole.BREEDER ? 'مربي' : 'مستثمر'}
                      </span>
                    </td>
                    <td className="p-4">
                        <div className="flex gap-1">
                            <span title="البطاقة الشخصية" className={`p-1 rounded-full ${user.idCardFrontUrl ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-300'}`}><FileText size={14} /></span>
                            {user.role === UserRole.BREEDER && (
                                <span title="الفيش الجنائي" className={`p-1 rounded-full ${user.criminalRecordUrl ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-300'}`}><FileWarning size={14} /></span>
                            )}
                        </div>
                    </td>
                    <td className="p-4">
                        {user.physicalPapersVerified ? (
                            <span title="تم استلام الأصول" className="inline-flex">
                                <CheckCircle size={18} className="text-green-500" />
                            </span>
                        ) : user.physicalPapersSent ? (
                            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs">
                                <Clock size={14} /> <span>بالطريق</span>
                            </div>
                        ) : (
                            <span className="text-gray-300 text-xs">-</span>
                        )}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={user.status} type="user"/>
                    </td>
                    <td className="p-4">
                      {user.status === UserStatus.PENDING && (
                        <div className="flex gap-2">
                          <button onClick={() => verifyUser(user.id, true)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="تفعيل">
                            <Check size={18} />
                          </button>
                          <button onClick={() => verifyUser(user.id, false)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="رفض">
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderAdminCycles = () => {
    const filteredCycles = cycles.filter(c => cycleFilter === 'ALL' || c.status === cycleFilter);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-800">إدارة الدورات</h2>
             <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                {['ALL', CycleStatus.PENDING, CycleStatus.ACTIVE, CycleStatus.COMPLETED].map((filter) => {
                    const labelMap: any = { 'ALL': 'الكل', [CycleStatus.PENDING]: 'قيد الانتظار', [CycleStatus.ACTIVE]: 'نشطة', [CycleStatus.COMPLETED]: 'مكتملة' };
                    return (
                        <button 
                            key={filter}
                            onClick={() => setCycleFilter(filter as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${cycleFilter === filter ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {labelMap[filter]}
                        </button>
                    )
                })}
             </div>
        </div>

        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-right p-4 text-sm text-gray-500">الدورة</th>
                            <th className="text-right p-4 text-sm text-gray-500">المربي</th>
                            <th className="text-right p-4 text-sm text-gray-500">التمويل المحصل</th>
                            <th className="text-right p-4 text-sm text-gray-500">الحالة</th>
                            <th className="text-right p-4 text-sm text-gray-500">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCycles.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">لا توجد دورات مطابقة للبحث</td></tr>
                        ) : (
                            filteredCycles.map(cycle => {
                                const breeder = users.find(u => u.id === cycle.breederId);
                                const percent = Math.round((cycle.currentFunding / cycle.fundingGoal) * 100);
                                return (
                                    <tr key={cycle.id} className="border-b hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden relative">
                                                    <img src={cycle.imageUrl} alt="" className="w-full h-full object-cover"/>
                                                    {cycle.insurancePolicyNumber && (
                                                      <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-0.5 rounded-tl-lg" title="دورة مؤمنة">
                                                        <Shield size={10} />
                                                      </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">{cycle.animalType}</p>
                                                    <p className="text-xs text-gray-500">وزن {cycle.initialWeight} كجم • {cycle.expectedDuration} يوم</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <p className="font-semibold text-gray-900">{breeder?.name || 'مجهول'}</p>
                                            <p className="text-xs text-gray-500">{breeder?.phone}</p>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="w-32">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-bold">{percent}%</span>
                                                    <span className="text-gray-500">{cycle.currentFunding.toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">من {cycle.fundingGoal.toLocaleString()} ج.م</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={cycle.status} type="cycle" />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                {cycle.status === CycleStatus.PENDING && (
                                                    <>
                                                        <Button size="sm" onClick={() => updateCycleStatus(cycle.id, CycleStatus.ACTIVE)}>قبول</Button>
                                                        <Button size="sm" variant="danger" onClick={() => updateCycleStatus(cycle.id, CycleStatus.REJECTED)}>رفض</Button>
                                                    </>
                                                )}
                                                {cycle.status === CycleStatus.ACTIVE && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="secondary" 
                                                        onClick={() => setEndCycleModal({ isOpen: true, cycle, salePrice: '' })}
                                                        title="البيع الفوري وإنهاء الدورة"
                                                        className="px-2"
                                                    >
                                                        <Gavel size={16} className="md:ml-1" />
                                                        <span className="hidden md:inline">بيع وإنهاء</span>
                                                    </Button>
                                                )}
                                                {(cycle.status === CycleStatus.ACTIVE || cycle.status === CycleStatus.COMPLETED) && (
                                                    <button onClick={() => deleteCycle(cycle.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                <button className="p-2 text-gray-400 hover:text-primary hover:bg-green-50 rounded-full transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    );
  };

  const renderAdminInvestments = () => {
    // 1. Calculate Financial Statistics
    const totalGross = investments.reduce((acc, inv) => acc + inv.amount, 0);
    const totalRevenue = totalGross * PLATFORM_FEE_PERCENT; // 2.5% of gross
    const activeInvestments = investments.filter(inv => inv.status === 'APPROVED');
    const totalTransactionsCount = investments.length;
    
    const totalInsurancePool = investments.reduce((acc, inv) => {
      // Calculate insurance fee portion (3%) only if insurance was applied
      const cycle = cycles.find(c => c.id === inv.cycleId);
      const hasInsurance = inv.hasAnimalInsurance || cycle?.insurancePolicyNumber;
      return acc + (hasInsurance ? inv.amount * INSURANCE_FEE_PERCENT : 0);
    }, 0);

    const netCapitalDeployed = totalGross - totalRevenue - totalInsurancePool;

    // Helper for Modal Content
    const renderFinancialDetailContent = () => {
        switch(financialDetails.type) {
            case 'TOTAL':
                return (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-6 rounded-2xl text-center">
                            <p className="text-gray-500 mb-2">إجمالي المبالغ المدفوعة</p>
                            <p className="text-4xl font-bold text-gray-800">{totalGross.toLocaleString()} <span className="text-lg text-gray-400">ج.م</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">عدد المعاملات</p>
                                <p className="text-xl font-bold">{totalTransactionsCount}</p>
                            </div>
                            <div className="border p-4 rounded-xl">
                                <p className="text-sm text-gray-500 mb-1">متوسط العملية</p>
                                <p className="text-xl font-bold">{totalTransactionsCount > 0 ? Math.round(totalGross/totalTransactionsCount).toLocaleString() : 0} ج.م</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            يمثل هذا الرقم إجمالي التدفقات النقدية الواردة من المستثمرين قبل خصم أي رسوم إدارية أو تأمينية.
                        </p>
                    </div>
                );
            case 'REVENUE':
                return (
                    <div className="space-y-4">
                        <div className="bg-green-50 p-6 rounded-2xl text-center">
                            <p className="text-green-700 mb-2">صافي أرباح المنصة</p>
                            <p className="text-4xl font-bold text-green-800">{totalRevenue.toLocaleString()} <span className="text-lg text-green-600">ج.م</span></p>
                        </div>
                        <div className="bg-white border rounded-xl p-4">
                            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Calculator size={16}/> معادلة الاحتساب</h4>
                            <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg font-mono" dir="ltr">
                                <span>{totalGross.toLocaleString()}</span>
                                <span className="text-gray-400">x</span>
                                <span className="text-blue-600 font-bold">2.5%</span>
                                <span className="text-gray-400">=</span>
                                <span className="text-green-700 font-bold">{totalRevenue.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-right">
                                يتم اقتطاع نسبة 2.5% من إجمالي مبلغ الاستثمار كرسوم تشغيل وإدارة للمنصة فور تأكيد الدفع.
                            </p>
                        </div>
                    </div>
                );
            case 'INSURANCE':
                 const insuredCount = investments.filter(inv => {
                    const cycle = cycles.find(c => c.id === inv.cycleId);
                    return inv.hasAnimalInsurance || cycle?.insurancePolicyNumber;
                 }).length;
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-6 rounded-2xl text-center">
                            <p className="text-blue-700 mb-2">محفظة التأمين المجمعة</p>
                            <p className="text-4xl font-bold text-blue-800">{totalInsurancePool.toLocaleString()} <span className="text-lg text-blue-600">ج.م</span></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="border p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-500 mb-1">العمليات المؤمنة</p>
                                <p className="text-xl font-bold text-gray-800">{insuredCount}</p>
                            </div>
                             <div className="border p-4 rounded-xl bg-gray-50">
                                <p className="text-sm text-gray-500 mb-1">نسبة الاستقطاع</p>
                                <p className="text-xl font-bold text-red-600">3.0%</p>
                            </div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-sm text-yellow-800 flex gap-2 items-start">
                            <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                            <p>يستخدم هذا الصندوق لتعويض المستثمرين والمربين في حالات النفوق القهري للحيوانات. يتم الخصم فقط من الدورات أو الأسهم التي طلب أصحابها التأمين.</p>
                        </div>
                    </div>
                );
            case 'NET_CAPITAL':
                return (
                    <div className="space-y-5">
                         <div className="bg-purple-50 p-6 rounded-2xl text-center">
                            <p className="text-purple-700 mb-2">صافي رأس المال المستثمر</p>
                            <p className="text-4xl font-bold text-purple-900">{netCapitalDeployed.toLocaleString()} <span className="text-lg text-purple-600">ج.م</span></p>
                        </div>
                        
                        <div className="relative border-r-2 border-gray-200 pr-6 mr-3 space-y-6">
                            <div className="relative">
                                <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-gray-400 border-2 border-white"></div>
                                <p className="text-sm text-gray-500">إجمالي التعاملات</p>
                                <p className="font-bold text-lg">{totalGross.toLocaleString()} ج.م</p>
                            </div>
                            
                            <div className="relative">
                                <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-red-400 border-2 border-white"></div>
                                <p className="text-sm text-red-500 flex items-center gap-1"><ArrowDown size={14}/> يخصم: رسوم المنصة (2.5%)</p>
                                <p className="font-bold text-lg text-red-600">-{totalRevenue.toLocaleString()} ج.م</p>
                            </div>

                            <div className="relative">
                                <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-red-400 border-2 border-white"></div>
                                <p className="text-sm text-red-500 flex items-center gap-1"><ArrowDown size={14}/> يخصم: رسوم التأمين (3%)</p>
                                <p className="font-bold text-lg text-red-600">-{totalInsurancePool.toLocaleString()} ج.م</p>
                            </div>

                            <div className="relative pt-2 border-t border-dashed">
                                <div className="absolute -right-[31px] top-3 w-4 h-4 rounded-full bg-purple-600 border-2 border-white"></div>
                                <p className="text-sm text-purple-700 font-bold">الصافي الفعلي لشراء الرؤوس</p>
                                <p className="font-bold text-xl text-purple-900">{netCapitalDeployed.toLocaleString()} ج.م</p>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const getModalTitle = () => {
         switch(financialDetails.type) {
            case 'TOTAL': return 'تفاصيل حجم التعاملات';
            case 'REVENUE': return 'تحليل أرباح المنصة';
            case 'INSURANCE': return 'صندوق التأمين والمخاطر';
            case 'NET_CAPITAL': return 'تدفق رأس المال التشغيلي';
            default: return '';
        }
    };

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">الإدارة المالية والحسابات</h2>
        
        {/* Financial Modal */}
        <Modal 
            isOpen={financialDetails.isOpen} 
            onClose={() => setFinancialDetails({...financialDetails, isOpen: false})} 
            title={getModalTitle()}
        >
            {renderFinancialDetailContent()}
        </Modal>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           <StatCard 
             title="إجمالي حجم التعاملات" 
             value={`${totalGross.toLocaleString()} ج.م`} 
             icon={Activity} 
             color="secondary"
             onClick={() => setFinancialDetails({isOpen: true, type: 'TOTAL'})}
           />
           <StatCard 
             title="صافي أرباح المنصة (2.5%)" 
             value={`${totalRevenue.toLocaleString()} ج.م`} 
             icon={TrendingUp} 
             color="primary"
             onClick={() => setFinancialDetails({isOpen: true, type: 'REVENUE'})}
           />
           <StatCard 
             title="محفظة التأمين المجمعة (3%)" 
             value={`${totalInsurancePool.toLocaleString()} ج.م`} 
             icon={ShieldCheck} 
             color="blue"
             onClick={() => setFinancialDetails({isOpen: true, type: 'INSURANCE'})}
           />
           <StatCard 
             title="صافي رأس المال المستثمر" 
             value={`${netCapitalDeployed.toLocaleString()} ج.م`} 
             icon={Coins} 
             color="purple"
             onClick={() => setFinancialDetails({isOpen: true, type: 'NET_CAPITAL'})}
           />
        </div>

        <h3 className="text-xl font-bold text-gray-700 mt-8 mb-4">سجل طلبات الاستثمار</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right p-4 text-sm text-gray-500">المستثمر</th>
                  <th className="text-right p-4 text-sm text-gray-500">الدورة</th>
                  <th className="text-right p-4 text-sm text-gray-500">المبلغ المدفوع</th>
                  <th className="text-right p-4 text-sm text-gray-500">الإيصال</th>
                  <th className="text-right p-4 text-sm text-gray-500">التاريخ</th>
                  <th className="text-right p-4 text-sm text-gray-500">الحالة</th>
                  <th className="text-right p-4 text-sm text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {investments.slice().reverse().map(inv => { // Show newest first
                    const cycle = cycles.find(c => c.id === inv.cycleId);
                    const investor = users.find(u => u.id === inv.investorId);
                    return (
                        <tr key={inv.id} className="border-b hover:bg-gray-50">
                            <td className="p-4 text-sm font-bold text-gray-900">{investor?.name || 'مستثمر'}</td>
                            <td className="p-4 text-sm text-gray-800">{cycle?.animalType}</td>
                            <td className="p-4 text-sm font-bold text-green-700">{inv.amount.toLocaleString()} ج.م</td>
                            <td className="p-4">
                                {inv.transferReceiptUrl ? (
                                    <a href={inv.transferReceiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline text-xs">
                                        <ImageIcon size={14} /> عرض الإيصال
                                    </a>
                                ) : (
                                    <span className="text-gray-400 text-xs">لا يوجد</span>
                                )}
                            </td>
                            <td className="p-4 text-sm text-gray-600">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                            <td className="p-4"><StatusBadge status={inv.status} /></td>
                            <td className="p-4">
                                {inv.status === 'PENDING_APPROVAL' && (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => updateInvestmentStatus(inv.id, 'APPROVED')}>تأكيد</Button>
                                        <Button size="sm" variant="danger" onClick={() => updateInvestmentStatus(inv.id, 'REJECTED')}>رفض</Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderBreederDashboard = () => {
    const myCycles = cycles.filter(c => c.breederId === currentUser!.id);
    const activeCount = myCycles.filter(c => c.status === CycleStatus.ACTIVE).length;
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">لوحة تحكم المربي</h2>
            <p className="text-gray-500">أهلاً بك، {currentUser!.name}</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="shadow-lg shadow-green-200">
            <Plus size={20} />
            إضافة دورة تسمين جديدة
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <StatCard title="الدورات النشطة" value={activeCount} icon={Activity} color="primary" />
           <StatCard title="إجمالي الدورات" value={myCycles.length} icon={LayoutDashboard} color="secondary" />
           <StatCard title="تقييم المزرعة" value={currentUser!.rating || 5.0} icon={TrendingUp} color="accent" />
        </div>

        <h3 className="text-xl font-bold text-gray-700 mt-4">دورات التسمين الخاصة بي</h3>
        {myCycles.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Tractor size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">لم تقم بإضافة أي دورات بعد.</p>
            <Button onClick={() => setCreateModalOpen(true)} variant="outline" className="mt-4">إبدأ الآن</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCycles.map(cycle => (
              <Card key={cycle.id} className="overflow-hidden flex flex-col">
                <div className="relative h-48">
                  <img src={cycle.imageUrl} alt={cycle.animalType} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={cycle.status} type="cycle" />
                  </div>
                  {cycle.insurancePolicyNumber && (
                    <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <ShieldCheck size={12} /> مؤمنة
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-lg text-gray-800">{cycle.animalType}</h3>
                     <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{cycle.expectedDuration} يوم</span>
                  </div>
                  
                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                     <div className="flex justify-between">
                        <span>الوزن الحالي:</span>
                        <span className="font-bold">{cycle.initialWeight} كجم</span>
                     </div>
                     <div className="flex justify-between">
                        <span>التمويل:</span>
                        <span className="font-bold text-green-700">{cycle.currentFunding.toLocaleString()} / {cycle.fundingGoal.toLocaleString()}</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(100, (cycle.currentFunding / cycle.fundingGoal) * 100)}%` }}></div>
                     </div>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDetailsModal({ isOpen: true, cycle })}>
                       التفاصيل
                    </Button>
                    <Button size="sm" onClick={() => setLogsModal({ isOpen: true, cycle })}>
                       سجل المتابعة
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderInvestorDashboard = () => {
    // Marketplace: Active cycles that are not fully funded (or available heads > 0)
    // Note: Cycle status is ACTIVE means approved by admin.
    const marketplaceCycles = cycles.filter(c => c.status === CycleStatus.ACTIVE && c.currentFunding < c.fundingGoal);
    
    // My Investments
    const myInvestments = investments.filter(i => i.investorId === currentUser!.id);
    const totalInvested = myInvestments.reduce((sum, i) => sum + i.amount, 0);

    return (
      <div className="space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-2 opacity-90">
                 <Wallet size={24} />
                 <span className="font-medium">محفظتي الاستثمارية</span>
              </div>
              <p className="text-3xl font-bold">{totalInvested.toLocaleString()} <span className="text-base font-normal opacity-80">ج.م</span></p>
           </div>
           
           <StatCard title="الاستثمارات النشطة" value={myInvestments.filter(i => i.status === 'APPROVED').length} icon={Activity} color="secondary" />
           <StatCard title="العوائد المتوقعة" value="-- %" icon={TrendingUp} color="accent" />
        </div>

        {/* Marketplace Section */}
        <div>
           <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
             <ShoppingBag size={24} className="text-primary" />
             فرص الاستثمار المتاحة (السوق)
           </h2>
           
           {marketplaceCycles.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-xl">
               <p className="text-gray-500">لا توجد فرص متاحة حالياً. يرجى العودة لاحقاً.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceCycles.map(cycle => {
                  const percent = Math.round((cycle.currentFunding / cycle.fundingGoal) * 100);
                  const breeder = users.find(u => u.id === cycle.breederId);
                  const remaining = cycle.fundingGoal - cycle.currentFunding;

                  return (
                    <Card key={cycle.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                       <div className="relative h-48 group cursor-pointer" onClick={() => setDetailsModal({isOpen: true, cycle})}>
                          <img src={cycle.imageUrl} alt={cycle.animalType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                             <p className="text-white text-sm line-clamp-2">{cycle.description}</p>
                          </div>
                          {cycle.insurancePolicyNumber && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                               <ShieldCheck size={12} /> مؤمنة
                            </div>
                          )}
                       </div>
                       <div className="p-5 flex-1 flex flex-col">
                          <div className="flex justify-between items-start mb-1">
                             <h3 className="font-bold text-lg text-gray-900">{cycle.animalType}</h3>
                             <Badge color="blue">{cycle.expectedDuration} يوم</Badge>
                          </div>
                          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                             <MapPin size={14}/> {breeder?.governorate || 'مصر'} • {breeder?.name}
                          </p>

                          <div className="space-y-3 mb-6">
                             <div>
                                <div className="flex justify-between text-sm mb-1">
                                   <span className="text-gray-600">اكتمال التمويل</span>
                                   <span className="font-bold text-primary">{percent}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                   <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                </div>
                             </div>
                             
                             <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg">
                                <span className="text-xs text-green-700">المبلغ المطلوب للاكتمال</span>
                                <span className="font-bold text-green-800">{remaining.toLocaleString()} ج.م</span>
                             </div>
                          </div>

                          <Button onClick={() => openInvestModal(cycle.id, remaining)} className="w-full mt-auto">
                             استثمر الآن
                          </Button>
                       </div>
                    </Card>
                  );
                })}
             </div>
           )}
        </div>

        {/* My Portfolio Section */}
        <div>
           <h2 className="text-xl font-bold text-gray-800 mb-4">استثماراتي الحالية</h2>
           {myInvestments.length === 0 ? (
              <p className="text-gray-500 text-sm">لم تقم بأي استثمار بعد.</p>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {myInvestments.map(inv => {
                    const cycle = cycles.find(c => c.id === inv.cycleId);
                    return (
                       <Card key={inv.id} className="p-4 flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                             <img src={cycle?.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                             <h4 className="font-bold text-gray-800">{cycle?.animalType}</h4>
                             <p className="text-sm text-gray-500 mb-1">تاريخ الاستثمار: {new Date(inv.date).toLocaleDateString('ar-EG')}</p>
                             <div className="flex gap-2">
                                <Badge color={inv.status === 'APPROVED' ? 'green' : 'yellow'}>
                                   {inv.status === 'APPROVED' ? 'مقبول' : 'قيد المراجعة'}
                                </Badge>
                                {inv.hasAnimalInsurance && <Badge color="blue">مؤمن</Badge>}
                             </div>
                          </div>
                          <div className="text-left">
                             <p className="font-bold text-lg text-primary">{inv.amount.toLocaleString()}</p>
                             <p className="text-xs text-gray-400">ج.م</p>
                             <button 
                               onClick={() => setDetailsModal({ isOpen: true, cycle: cycle || null })}
                               className="text-xs text-blue-600 hover:underline mt-1 block"
                             >
                               تفاصيل الدورة
                             </button>
                          </div>
                       </Card>
                    );
                 })}
              </div>
           )}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} users={users} setUsers={setUsers} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans text-right" dir="rtl">
      {/* Sidebar - Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Success Modal */}
      <Modal 
        isOpen={successModal.isOpen} 
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })} 
        title="تمت العملية بنجاح"
      >
        <div className="text-center py-6">
           <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
           </div>
           <p className="text-gray-700 whitespace-pre-line leading-relaxed">{successModal.message}</p>
           <Button className="w-full mt-6" onClick={() => setSuccessModal({ ...successModal, isOpen: false })}>
             حسناً
           </Button>
        </div>
      </Modal>

      {/* End Cycle / Sell Modal */}
      <Modal 
        isOpen={endCycleModal.isOpen} 
        onClose={() => setEndCycleModal({ ...endCycleModal, isOpen: false })} 
        title="إنهاء الدورة والبيع الفوري"
      >
        <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex items-start gap-3">
                <Gavel size={24} className="text-orange-600 mt-1" />
                <div>
                    <h4 className="font-bold text-orange-800">تنبيه هام</h4>
                    <p className="text-sm text-orange-700">هذا الإجراء نهائي. سيتم تحويل حالة الدورة إلى "مكتملة" ولن يتمكن المستثمرون من الاستثمار بها بعد الآن. سيتم اعتبار القطيع مباعاً بالكامل.</p>
                </div>
            </div>

            <div>
                <Input 
                    label="سعر البيع النهائي للقطيع (ج.م)" 
                    type="number"
                    value={endCycleModal.salePrice}
                    onChange={(e) => setEndCycleModal({...endCycleModal, salePrice: e.target.value})}
                    placeholder="أدخل إجمالي المبلغ المحصل من البيع"
                />
            </div>

            {endCycleModal.cycle && endCycleModal.salePrice && (
                 <div className="bg-gray-100 p-3 rounded-lg text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">رأس المال المستثمر:</span>
                        <span className="font-bold">{endCycleModal.cycle.currentFunding.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">سعر البيع:</span>
                        <span className="font-bold text-green-700">{parseFloat(endCycleModal.salePrice).toLocaleString()} ج.م</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 flex justify-between font-bold">
                        <span>الربح/الخسارة الإجمالية:</span>
                        <span className={parseFloat(endCycleModal.salePrice) >= endCycleModal.cycle.currentFunding ? 'text-green-600' : 'text-red-600'}>
                             {(parseFloat(endCycleModal.salePrice) - endCycleModal.cycle.currentFunding).toLocaleString()} ج.م
                        </span>
                    </div>
                 </div>
            )}

            <Button onClick={confirmEndCycle} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                تأكيد البيع وإنهاء الدورة
            </Button>
        </div>
      </Modal>

      {/* Invest Confirmation Modal (With Receipt) */}
      <Modal 
        isOpen={investModal.isOpen} 
        onClose={() => setInvestModal({ ...investModal, isOpen: false })} 
        title="تأكيد الاستثمار"
      >
        <div className="space-y-4">
           <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              <p className="font-bold mb-3 text-gray-800 border-b pb-2">تفاصيل الاستثمار</p>
              
              <div className="mb-4">
                 <label className="block text-xs font-medium text-gray-700 mb-1">المبلغ المراد استثماره (ج.م)</label>
                 <div className="relative">
                    <input 
                        type="number"
                        min="1"
                        value={investModal.amount}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            const remaining = investModal.cycle ? investModal.cycle.fundingGoal - investModal.cycle.currentFunding : 0;
                            if (val <= remaining) {
                                setInvestModal({ ...investModal, amount: val });
                            }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-lg font-bold text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                 </div>
                 <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>المبلغ المتاح:</span>
                    <span className="font-bold">
                        {investModal.cycle ? (investModal.cycle.fundingGoal - investModal.cycle.currentFunding).toLocaleString() : 0} ج.م
                    </span>
                 </div>
              </div>

              {/* Insurance Option for Investor (Only if Breeder hasn't insured it) */}
              {investModal.cycle && !investModal.cycle.insurancePolicyNumber && (
                 <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-3">
                       <input 
                          type="checkbox" 
                          id="investorInsurance"
                          checked={investModal.wantsInsurance}
                          onChange={(e) => setInvestModal({...investModal, wantsInsurance: e.target.checked})}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                       />
                       <div>
                          <label htmlFor="investorInsurance" className="font-bold text-gray-800 text-sm flex items-center gap-1 cursor-pointer">
                             <Shield size={14} className="text-blue-600"/> تفعيل تأمين على الحياة (ضد النفوق)
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                             يتم خصم <span className="font-bold text-red-500">{(investModal.amount * INSURANCE_FEE_PERCENT).toLocaleString()} ج.م</span> (3%) من مبلغ التمويل لصالح وثيقة التأمين.
                          </p>
                       </div>
                    </div>
                 </div>
              )}

              {/* Calculation Summary (Invoice) */}
              {investModal.amount > 0 && (
                <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 mb-4 text-sm">
                    <div className="flex justify-between mb-1">
                        <span className="text-gray-600">المبلغ المدفوع:</span>
                        <span className="font-bold">{investModal.amount.toLocaleString()} ج.م</span>
                    </div>
                    <div className="flex justify-between mb-1 text-red-600 text-xs">
                        <span>- رسوم تشغيل المنصة (2.5%):</span>
                        <span>{(investModal.amount * PLATFORM_FEE_PERCENT).toLocaleString()} ج.م</span>
                    </div>
                    {(investModal.wantsInsurance || investModal.cycle?.insurancePolicyNumber) && (
                        <div className="flex justify-between mb-1 text-red-600 text-xs">
                            <span>- رسوم التأمين (3%):</span>
                            <span>{(investModal.amount * INSURANCE_FEE_PERCENT).toLocaleString()} ج.م</span>
                        </div>
                    )}
                    <div className="border-t border-gray-300 my-2 pt-2 flex justify-between font-bold text-green-700">
                        <span>صافي الاستثمار (لشراء الرؤوس):</span>
                        <span>
                            {(
                                investModal.amount - 
                                (investModal.amount * PLATFORM_FEE_PERCENT) - 
                                ((investModal.wantsInsurance || investModal.cycle?.insurancePolicyNumber) ? investModal.amount * INSURANCE_FEE_PERCENT : 0)
                            ).toLocaleString()} ج.م
                        </span>
                    </div>
                </div>
              )}

              <div className="bg-white p-3 rounded border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 mb-2">بيانات التحويل البنكي:</p>
                  <div className="flex justify-between mb-1">
                     <span>الحساب البنكي:</span>
                     <span className="font-bold font-mono text-gray-800">EG12000200010005 (CIB)</span>
                  </div>
                  <div className="flex justify-between">
                     <span>فودافون كاش:</span>
                     <span className="font-bold font-mono text-gray-800">01000000000</span>
                  </div>
              </div>
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة إيصال التحويل</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                 <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleReceiptFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 {investModal.receiptFile ? (
                    <div className="flex flex-col items-center text-green-600">
                        <CheckCircle size={32} className="mb-2" />
                        <span className="text-sm font-bold">{investModal.receiptFile.name}</span>
                        <span className="text-xs mt-1">اضغط للتغيير</span>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center text-gray-400">
                        <Upload size={32} className="mb-2" />
                        <span className="text-sm">اضغط هنا لرفع الصورة</span>
                        <span className="text-xs mt-1">JPG, PNG</span>
                    </div>
                 )}
              </div>
           </div>

           <Button 
             className="w-full mt-2" 
             onClick={submitInvestment}
             disabled={!investModal.receiptFile}
           >
             تأكيد الدفع وإتمام الاستثمار
           </Button>
        </div>
      </Modal>

      {/* Logs Modal (Breeder) */}
      <Modal 
        isOpen={logsModal.isOpen} 
        onClose={() => setLogsModal({ ...logsModal, isOpen: false })} 
        title="سجل المتابعة الدورية"
      >
        <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Plus size={18}/> إضافة تحديث جديد</h4>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input 
                            label="الوزن الحالي (كجم)" 
                            type="number" 
                            value={logForm.weight}
                            onChange={(e) => setLogForm({...logForm, weight: e.target.value})}
                            className="bg-white"
                        />
                        <Input 
                            label="تفاصيل العلف" 
                            value={logForm.food}
                            onChange={(e) => setLogForm({...logForm, food: e.target.value})}
                            placeholder="مثال: 5ك علف + 2ك تبن"
                            className="bg-white"
                        />
                    </div>
                    <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                        placeholder="ملاحظات بيطرية أو عامة..."
                        value={logForm.notes}
                        onChange={(e) => setLogForm({...logForm, notes: e.target.value})}
                    ></textarea>
                    <Button onClick={handleSaveLog} className="w-full">حفظ التحديث</Button>
                </div>
            </div>

            <div className="border-t pt-4">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><History size={18}/> السجل السابق</h4>
                <div className="space-y-4">
                    {logs.filter(l => l.cycleId === logsModal.cycle?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                        <div key={log.id} className="relative pl-4 border-r-2 border-primary/20 pr-4 pb-4 last:pb-0">
                            <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white"></div>
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-gray-500">{new Date(log.date).toLocaleDateString('ar-EG')}</span>
                                {log.weight && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{log.weight} كجم</span>}
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm text-sm">
                                <div className="flex items-start gap-2 mb-1">
                                    <Utensils size={14} className="mt-0.5 text-gray-400"/>
                                    <span className="text-gray-700">{log.foodDetails}</span>
                                </div>
                                {log.notes && (
                                    <div className="flex items-start gap-2 text-gray-500">
                                        <FileText size={14} className="mt-0.5"/>
                                        <span>{log.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {logs.filter(l => l.cycleId === logsModal.cycle?.id).length === 0 && (
                        <p className="text-center text-gray-400 text-sm py-4">لا توجد سجلات سابقة لهذه الدورة.</p>
                    )}
                </div>
            </div>
        </div>
      </Modal>

      {/* Details Modal (Breeder) */}
      <Modal 
        isOpen={detailsModal.isOpen} 
        onClose={() => setDetailsModal({ ...detailsModal, isOpen: false })} 
        title="تفاصيل الدورة"
      >
        {detailsModal.cycle && (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <img src={detailsModal.cycle.imageUrl} className="w-20 h-20 rounded-xl object-cover border border-gray-200" alt=""/>
                    <div>
                        <h3 className="font-bold text-lg">{detailsModal.cycle.animalType}</h3>
                        <p className="text-sm text-gray-500">{detailsModal.cycle.description}</p>
                        <div className="flex gap-2 mt-1">
                            <Badge color={detailsModal.cycle.status === CycleStatus.ACTIVE ? 'green' : 'yellow'}>
                                {detailsModal.cycle.status === CycleStatus.ACTIVE ? 'نشطة' : 'معلقة'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl text-sm">
                    <div>
                        <p className="text-gray-500 text-xs mb-1">تاريخ البدء</p>
                        <p className="font-bold">{new Date(detailsModal.cycle.startDate).toLocaleDateString('ar-EG')}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-1">مدة الدورة</p>
                        <p className="font-bold">{detailsModal.cycle.expectedDuration} يوم</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-1">الوزن المبدئي</p>
                        <p className="font-bold">{detailsModal.cycle.initialWeight} كجم</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-1">الوزن المستهدف</p>
                        <p className="font-bold text-green-600">{detailsModal.cycle.targetWeight} كجم</p>
                    </div>
                    <div className="col-span-2 border-t pt-2 mt-1">
                         <div className="flex justify-between items-center">
                            <p className="text-gray-500 text-xs">نسبة التمويل</p>
                            <p className="font-bold text-blue-600">{Math.round((detailsModal.cycle.currentFunding / detailsModal.cycle.fundingGoal) * 100)}%</p>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                             <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(detailsModal.cycle.currentFunding / detailsModal.cycle.fundingGoal) * 100}%` }}></div>
                         </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm"><ClipboardList size={16}/> خطة التسمين المعتمدة</h4>
                    <FatteningPlanViewer planText={detailsModal.cycle.fatteningPlan || ''} />
                </div>
            </div>
        )}
      </Modal>

      {/* Create Cycle Modal (Breeder) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="إضافة دورة تسمين جديدة"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الحيوان</label>
              <select 
                className="w-full px-3 py-2 border rounded-lg bg-white"
                value={breederForm.animalType}
                onChange={(e) => setBreederForm({...breederForm, animalType: e.target.value as 'cows' | 'sheep' || 'cows'})}
              >
                <option value="cows">عجول تسمين</option>
                <option value="sheep">خراف</option>
              </select>
            </div>
            <Input 
              label="مدة الدورة (يوم)" 
              type="number" 
              value={breederForm.expectedDuration} 
              onChange={(e) => setBreederForm({...breederForm, expectedDuration: Number(e.target.value)})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="الوزن الحالي (كجم)" 
              type="number" 
              value={breederForm.initialWeight} 
              onChange={(e) => setBreederForm({...breederForm, initialWeight: Number(e.target.value)})}
            />
            <Input 
              label="الوزن المستهدف (كجم)" 
              type="number" 
              value={breederForm.targetWeight} 
              onChange={(e) => setBreederForm({...breederForm, targetWeight: Number(e.target.value)})}
            />
          </div>

          <Input 
            label="سعر الرأس / تكلفة البداية (ج.م)" 
            type="number" 
            value={breederForm.startPricePerHead} 
            onChange={(e) => setBreederForm({...breederForm, startPricePerHead: Number(e.target.value)})}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الدورة والسلالة</label>
            <textarea 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary h-24"
              placeholder="اكتب تفاصيل عن السلالة، مصدر الشراء، والمميزات..."
              value={breederForm.description}
              onChange={(e) => setBreederForm({...breederForm, description: e.target.value})}
            />
            <button 
                type="button" 
                onClick={async () => {
                    if (!breederForm.description) return;
                    // Mock analysis or implement real call if needed, but for now simple alert or just placeholder
                    alert("سيتم تحليل الوصف (محاكاة)");
                }}
                className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
            >
                <Sprout size={12}/> تحليل الوصف بالذكاء الاصطناعي
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
             <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800 text-sm">خطة التغذية والبرنامج الوقائي</h4>
                <Badge color="green">مساعد ذكي</Badge>
             </div>
             
             {/* Use key to force re-render when animal type changes */}
             <SimplePlanBuilder 
               key={breederForm.animalType}
               animalType={breederForm.animalType as 'cows' | 'sheep'}
               onChange={handlePlanChange}
             />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-3">
             <input 
                type="checkbox" 
                id="cycleInsurance"
                checked={breederForm.isInsured}
                onChange={(e) => setBreederForm({...breederForm, isInsured: e.target.checked})}
                className="mt-1 w-4 h-4 text-blue-600 rounded"
             />
             <div>
                <label htmlFor="cycleInsurance" className="font-bold text-gray-800 text-sm cursor-pointer">
                   طلب تأمين شامل على الدورة
                </label>
                <p className="text-xs text-gray-500">
                   يغطي النفوق والأمراض الوبائية. سيتم خصم قسط التأمين من التمويل.
                </p>
             </div>
          </div>

          <Button onClick={handleBreederCreateCycle} className="w-full">
            إرسال للمراجعة
          </Button>
        </div>
      </Modal>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 right-0 h-screen w-72 bg-white border-l border-gray-100 shadow-xl md:shadow-none z-30 transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Sprout size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">دواب</h1>
          </div>
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={LayoutDashboard} 
            label="الرئيسية" 
            active={activeTab === 'dashboard'} 
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} 
          />
          
          {currentUser.role === UserRole.ADMIN && (
            <>
              <SidebarItem 
                icon={Users} 
                label="المستخدمين" 
                active={activeTab === 'users'} 
                onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={History} 
                label="إدارة الدورات" 
                active={activeTab === 'cycles'} 
                onClick={() => { setActiveTab('cycles'); setSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={Banknote} 
                label="الإدارة المالية" 
                active={activeTab === 'financials'} 
                onClick={() => { setActiveTab('financials'); setSidebarOpen(false); }} 
              />
            </>
          )}

          <SidebarItem 
            icon={Settings} 
            label="الملف الشخصي" 
            active={activeTab === 'profile'} 
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} 
          />

          <div className="pt-8 mt-8 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </nav>

        {/* User Mini Profile in Sidebar */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img src={currentUser.profilePictureUrl || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="" className="w-full h-full object-cover"/>
             </div>
             <div>
                <p className="font-bold text-sm text-gray-800 truncate w-32">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <header className="md:hidden flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Sprout size={18} />
             </div>
             <span className="font-bold text-lg text-gray-800">دواب</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white rounded-lg shadow-sm border text-gray-600">
            <Menu size={24} />
          </button>
        </header>

        {activeTab === 'dashboard' && currentUser.role === UserRole.ADMIN && renderAdminDashboard()}
        {activeTab === 'users' && currentUser.role === UserRole.ADMIN && renderAdminUsers()}
        {activeTab === 'cycles' && currentUser.role === UserRole.ADMIN && renderAdminCycles()}
        {activeTab === 'financials' && currentUser.role === UserRole.ADMIN && renderAdminInvestments()}
        
        {activeTab === 'dashboard' && currentUser.role === UserRole.BREEDER && renderBreederDashboard()}
        
        {activeTab === 'dashboard' && currentUser.role === UserRole.INVESTOR && renderInvestorDashboard()}
        
        {activeTab === 'profile' && (
          <ProfileView user={currentUser} onUpdate={handleUpdateProfile} />
        )}
      </main>
    </div>
  );
}
