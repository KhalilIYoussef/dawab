import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Sprout, LayoutDashboard, Wallet, TrendingUp, History, 
  Settings, LogOut, Plus, FileText, ChevronRight, MapPin, Search,
  AlertTriangle, DollarSign, Activity, Wheat, CheckCircle, Clock,
  Upload, Camera, Utensils, Menu, X, Tractor, ShieldCheck, Ban, Trash2, Eye,
  Lock, ArrowRight, UserPlus, LogIn, FileCheck, FileWarning, Filter, Check, XCircle,
  Banknote, Image as ImageIcon, ClipboardList, Scale, Shield, Info, PieChart, Coins,
  Calculator, ArrowDown, ShoppingBag, Gavel, UserCog, Calendar
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

// App Logo Configuration
const APP_LOGO = "dawab_logo2.png"; 
// Fallback logo in case dawab_logo2.png is missing or broken (Cow Head Icon)
const FALLBACK_LOGO = "https://cdn-icons-png.flaticon.com/512/3069/3069172.png";

const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_LOGO;
    e.currentTarget.onerror = null; // Prevent infinite loop
};

// --- Helper Components ---

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
  const bgColors = {
    primary: 'bg-green-50 text-green-600',
    secondary: 'bg-orange-50 text-orange-600',
    accent: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const textColors = {
    primary: 'text-green-700',
    secondary: 'text-orange-700',
    accent: 'text-yellow-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
  };
  
  return (
    <div onClick={onClick} className={`${onClick ? 'cursor-pointer transform hover:scale-[1.02] transition-transform duration-200' : ''} h-full`}>
      <Card className="p-6 flex items-center gap-4 hover:shadow-md transition-shadow h-full relative group">
        <div className={`p-4 rounded-2xl ${bgColors[color] || bgColors.primary}`}>
          <Icon size={28} />
        </div>
        <div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
          <p className={`text-xl md:text-2xl font-bold ${textColors[color] || 'text-black'}`}>{value}</p>
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
    'COMPLETED': 'مباعة',
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
    role: UserRole.INVESTOR
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Strict Input Control
    if (name === 'phone') {
        // Remove non-digits immediately
        const numericValue = value.replace(/\D/g, '');
        // Enforce max length of 11 chars
        if (numericValue.length <= 11) {
            setFormData({ ...formData, [name]: numericValue });
        }
    } else {
        setFormData({ ...formData, [name]: value });
    }
    
    setError('');
    setSuccess('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.phone === formData.phone);
    if (user) {
      if (user.status === UserStatus.PENDING) {
        setError('الحساب قيد المراجعة. يرجى انتظار تفعيل الحساب من قبل الإدارة.');
        return;
      }
      if (user.status === UserStatus.REJECTED) {
        setError('عذراً، تم رفض هذا الحساب. يرجى التواصل مع الدعم الفني.');
        return;
      }
      onLogin(user);
    } else {
      setError('رقم الهاتف غير مسجل. يرجى التأكد من الرقم أو إنشاء حساب جديد.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone } = formData;

    // 1. Check Duplicate
    if (users.some(u => u.phone === phone)) {
      setError('رقم الهاتف مسجل بالفعل.');
      return;
    }

    // 2. Name Validation (Letters and spaces only)
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
        setError("خطأ في الاسم: يجب أن يحتوي الاسم على أحرف فقط (دون أرقام أو رموز).");
        return;
    }

    // 3. Phone Validation (Exactly 11 digits)
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phone)) {
       setError('رقم الهاتف غير صحيح: يجب أن يتكون من 11 رقم بالضبط.');
       return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      phone: phone,
      role: UserRole.INVESTOR, // Default role for public registration
      status: UserStatus.PENDING, // ALL REGISTRATIONS ARE PENDING
      documentsVerified: false,
      profilePictureUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
    };

    setUsers([...users, newUser]);
    setIsRegistering(false); // Switch back to login view
    setSuccess('تم إنشاء الحساب بنجاح! حسابك الآن قيد المراجعة، سيقوم المسؤول بتفعيله قريباً.');
    setFormData(prev => ({ ...prev, name: '' })); // Clear name but keep phone
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[500px]">
        {/* Visual Side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary text-white p-12 text-center relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] opacity-10 bg-cover bg-center"></div>
          <img 
            src={APP_LOGO} 
            onError={handleLogoError}
            alt="Dawab Logo" 
            className="w-40 h-40 mb-6 z-10 object-contain drop-shadow-xl" 
          />
          <h1 className="text-4xl font-bold mb-4 z-10">منصة دواب</h1>
          <p className="text-lg opacity-90 z-10">استثمر في الثروة الحيوانية بأمان، أو ابدأ دورتك الإنتاجية بتمويل تشاركي.</p>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-right">
            <h2 className="text-2xl font-bold text-black mb-2">
              {isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isRegistering ? 'أدخل بياناتك للانضمام إلينا' : 'أدخل رقم هاتفك للمتابعة'}
            </p>
          </div>

          {success && (
             <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start gap-2">
                <CheckCircle size={18} className="shrink-0 mt-0.5" />
                <span>{success}</span>
             </div>
          )}

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
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              value={formData.phone} 
              onChange={handleInputChange} 
              placeholder="01xxxxxxxxx" 
              required 
            />

            {error && (
               <div className="mb-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
               </div>
            )}

            <Button type="submit" className="w-full py-3 text-lg" disabled={false}>
              {isRegistering ? 'إنشاء الحساب' : 'دخول'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setSuccess('');
              }}
              className="text-primary hover:underline text-sm font-medium"
            >
              {isRegistering ? 'لدي حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
            </button>
          </div>

          {/* Quick Demo Links */}
          <div className="mt-8 pt-6 border-t border-gray-100">
             <p className="text-xs text-center text-gray-400 mb-3">للتجربة السريعة (Demo Users)</p>
             <div className="flex justify-center gap-2 flex-wrap">
                <button onClick={() => onLogin(users[0])} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-black">Admin</button>
                <button onClick={() => onLogin(users[1])} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-black">Breeder</button>
                <button onClick={() => onLogin(users[3])} className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 text-black">Investor</button>
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
  const [formData, setFormData] = useState(user);
  
  // Handlers for file uploads (simulated)
  const handleFileUpload = (field: keyof User) => {
    alert("تم رفع الملف بنجاح (محاكاة)");
    onUpdate({ ...user, [field]: 'uploaded_url' });
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
             <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 shadow-md overflow-hidden flex items-center justify-center text-2xl font-bold text-black">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
             </div>
             <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow border hover:bg-gray-50 text-black">
                <Camera size={16} />
             </button>
          </div>
          <div className="flex-1 text-center md:text-right mb-4 md:mb-0">
             <h2 className="text-2xl font-bold text-black">{user.name}</h2>
             <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                <MapPin size={16} /> {user.governorate || 'غير محدد'}
             </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={user.status} type="user" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Personal Info */}
         <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black"><UserCog size={20}/> البيانات الشخصية</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-sm text-gray-500">رقم الهاتف</label>
                  <p className="font-medium text-black">{user.phone}</p>
               </div>
               <div>
                  <label className="text-sm text-gray-500">الرقم القومي</label>
                  <p className="font-medium text-black">{user.nationalId || 'غير مسجل'}</p>
               </div>
               {user.role === UserRole.BREEDER && (
                 <>
                    <div>
                      <label className="text-sm text-gray-500">عنوان المزرعة</label>
                      <p className="font-medium text-black truncate">
                        {user.googleMapsUrl ? <a href={user.googleMapsUrl} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1"><MapPin size={14}/> عرض على الخريطة</a> : 'غير محدد'}
                      </p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">الطاقة الاستيعابية</label>
                        <p className="font-medium text-black">{user.spaceLimit} رأس</p>
                    </div>
                 </>
               )}
            </div>
         </Card>

         {/* Verification & Documents */}
         <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black"><ShieldCheck size={20}/> التوثيق والأوراق</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${user.documentsVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {user.documentsVerified ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                     </div>
                     <div>
                        <p className="font-medium text-sm text-black">التوثيق الرقمي</p>
                        <p className="text-xs text-gray-500">{user.documentsVerified ? 'تم التحقق من الهوية' : 'بانتظار رفع المستندات'}</p>
                     </div>
                  </div>
                  {!user.documentsVerified && (
                     <Button size="sm" variant="outline" onClick={() => handleFileUpload('idCardFrontUrl')}>رفع الهوية</Button>
                  )}
               </div>

               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${user.physicalPapersVerified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {user.physicalPapersVerified ? <FileCheck size={20} /> : <FileText size={20} />}
                     </div>
                     <div>
                        <p className="font-medium text-sm text-black">العقود الورقية</p>
                        <p className="text-xs text-gray-500">
                           {user.physicalPapersVerified ? 'تم استلام العقود' : user.physicalPapersSent ? 'تم الإرسال - قيد المراجعة' : 'لم يتم الإرسال'}
                        </p>
                     </div>
                  </div>
                  {!user.physicalPapersVerified && !user.physicalPapersSent && (
                     <Button size="sm" variant="secondary" onClick={handlePhysicalPaperConfirm}>تأكيد الإرسال</Button>
                  )}
               </div>
            </div>
         </Card>
      </div>
    </div>
  );
};

// --- Dashboards ---

const AdminDashboard: React.FC<{ 
    users: User[], setUsers: (u: User[]) => void, 
    cycles: Cycle[], setCycles: (c: Cycle[]) => void 
}> = ({ users, setUsers, cycles, setCycles }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cycles'>('overview');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    
    // New User Form State
    const [newUserForm, setNewUserForm] = useState({ name: '', phone: '', role: UserRole.INVESTOR });
    
    // Sell Cycle States
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [selectedCycleToSell, setSelectedCycleToSell] = useState<Cycle | null>(null);
    const [salePrice, setSalePrice] = useState<string>('');

    const pendingUsers = users.filter(u => u.status === UserStatus.PENDING);
    const pendingCycles = cycles.filter(c => c.status === CycleStatus.PENDING);

    const handleUserAction = (id: string, action: 'approve' | 'reject') => {
        setUsers(users.map(u => u.id === id ? { ...u, status: action === 'approve' ? UserStatus.ACTIVE : UserStatus.REJECTED } : u));
    };

    const handleCycleAction = (id: string, action: 'approve' | 'reject') => {
        setCycles(cycles.map(c => c.id === id ? { ...c, status: action === 'approve' ? CycleStatus.ACTIVE : CycleStatus.REJECTED } : c));
    };

    const handleCreateUser = () => {
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: newUserForm.name,
            phone: newUserForm.phone,
            role: newUserForm.role,
            status: UserStatus.ACTIVE, // Admin created users are active
            documentsVerified: true
        };
        setUsers([...users, newUser]);
        setIsAddUserModalOpen(false);
        setNewUserForm({ name: '', phone: '', role: UserRole.INVESTOR });
    };

    const openSellModal = (cycle: Cycle) => {
        setSelectedCycleToSell(cycle);
        // Suggest a 25% profit margin as default input
        setSalePrice((cycle.fundingGoal * 1.25).toString());
        setIsSellModalOpen(true);
    };

    const handleConfirmSale = () => {
        if (!selectedCycleToSell) return;
        
        const price = parseFloat(salePrice);
        if (isNaN(price) || price <= 0) {
            alert("يرجى إدخال سعر بيع صحيح");
            return;
        }

        const updatedCycles = cycles.map(c => {
            if (c.id === selectedCycleToSell.id) {
                return {
                    ...c,
                    status: CycleStatus.COMPLETED,
                    finalSalePrice: price,
                    actualEndDate: new Date().toISOString().split('T')[0]
                };
            }
            return c;
        });

        setCycles(updatedCycles as Cycle[]);
        setIsSellModalOpen(false);
        setSelectedCycleToSell(null);
        setSalePrice('');
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b overflow-x-auto pb-2">
                {['overview', 'users', 'cycles'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-black opacity-60'}`}
                    >
                        {tab === 'overview' ? 'نظرة عامة' : tab === 'users' ? 'المستخدمين' : 'الدورات'}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="إجمالي المستخدمين" value={users.length} icon={Users} color="blue" />
                    <StatCard title="طلبات التسجيل المعلقة" value={pendingUsers.length} icon={UserPlus} color="secondary" />
                    <StatCard title="الدورات النشطة" value={cycles.filter(c => c.status === CycleStatus.ACTIVE).length} icon={Activity} color="primary" />
                    
                    <div className="md:col-span-3">
                        <h3 className="font-bold text-black mb-4">طلبات تتطلب اتخاذ إجراء</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pending Users */}
                            <Card className="p-4">
                                <h4 className="font-bold text-sm text-black opacity-70 mb-3 flex justify-between">
                                    <span>مستخدمين جدد ({pendingUsers.length})</span>
                                    <span className="text-xs text-primary cursor-pointer" onClick={() => setActiveTab('users')}>عرض الكل</span>
                                </h4>
                                {pendingUsers.slice(0, 3).map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-3 border-b last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-black">{u.name[0]}</div>
                                            <div>
                                                <p className="text-sm font-bold text-black">{u.name}</p>
                                                <p className="text-xs text-gray-500">{u.role === UserRole.BREEDER ? 'مربي' : 'مستثمر'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleUserAction(u.id, 'approve')} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={18}/></button>
                                            <button onClick={() => handleUserAction(u.id, 'reject')} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                                {pendingUsers.length === 0 && <p className="text-sm text-gray-400 text-center py-4 text-black opacity-50">لا يوجد طلبات معلقة</p>}
                            </Card>

                            {/* Pending Cycles */}
                            <Card className="p-4">
                                <h4 className="font-bold text-sm text-black opacity-70 mb-3">دورات بانتظار الموافقة ({pendingCycles.length})</h4>
                                {pendingCycles.slice(0, 3).map(c => (
                                    <div key={c.id} className="flex items-center justify-between p-3 border-b last:border-0">
                                        <div>
                                            <p className="text-sm font-bold text-black">{c.animalType}</p>
                                            <p className="text-xs text-gray-500">الهدف: {c.fundingGoal.toLocaleString()} ج.م</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleCycleAction(c.id, 'approve')} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={18}/></button>
                                            <button onClick={() => handleCycleAction(c.id, 'reject')} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                                {pendingCycles.length === 0 && <p className="text-sm text-gray-400 text-center py-4 text-black opacity-50">لا يوجد دورات معلقة</p>}
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-black">إدارة المستخدمين</h3>
                        <Button size="sm" onClick={() => setIsAddUserModalOpen(true)}><Plus size={16}/> إضافة مستخدم</Button>
                    </div>
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-black text-sm">
                                <tr>
                                    <th className="p-4">الاسم</th>
                                    <th className="p-4">الدور</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-bold text-black">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.phone}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded ${u.role === UserRole.BREEDER ? 'bg-purple-100 text-purple-700' : u.role === UserRole.ADMIN ? 'bg-gray-800 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4"><StatusBadge status={u.status} type="user" /></td>
                                        <td className="p-4">
                                            {u.status === UserStatus.PENDING && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleUserAction(u.id, 'approve')}>قبول</Button>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleUserAction(u.id, 'reject')}>رفض</Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'cycles' && (
                <div>
                    <h3 className="font-bold text-lg mb-4 text-black">إدارة الدورات الإنتاجية</h3>
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-black text-sm">
                                <tr>
                                    <th className="p-4">صورة</th>
                                    <th className="p-4">المربي</th>
                                    <th className="p-4">تفاصيل الدورة</th>
                                    <th className="p-4">التمويل</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {cycles.map(c => {
                                    const breeder = users.find(u => u.id === c.breederId);
                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="p-4">
                                                <img src={c.imageUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-100" alt="" />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-black">{breeder?.name || 'غير معروف'}</div>
                                                <div className="text-xs text-gray-500">{breeder?.phone}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-black">{c.animalType}</div>
                                                <div className="text-xs text-gray-500">{c.totalHeads} رأس | {c.expectedDuration} يوم</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-black">{c.fundingGoal.toLocaleString()} ج.م</div>
                                                <div className="text-xs text-gray-500">تم جمع: {c.currentFunding.toLocaleString()}</div>
                                                {c.finalSalePrice && (
                                                    <div className="text-xs text-green-600 font-bold mt-1">
                                                        بيع بـ: {c.finalSalePrice.toLocaleString()} (+{Math.round(((c.finalSalePrice - c.fundingGoal) / c.fundingGoal) * 100)}%)
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4"><StatusBadge status={c.status} type="cycle" /></td>
                                            <td className="p-4">
                                                {c.status === CycleStatus.PENDING ? (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleCycleAction(c.id, 'approve')} className="bg-green-600 hover:bg-green-700 text-white">قبول</Button>
                                                        <Button size="sm" onClick={() => handleCycleAction(c.id, 'reject')} className="bg-red-600 hover:bg-red-700 text-white">رفض</Button>
                                                    </div>
                                                ) : c.status === CycleStatus.ACTIVE ? (
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => openSellModal(c)} 
                                                            className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
                                                            title="تسجيل بيع الدورة"
                                                        >
                                                            <DollarSign size={16} /> بيع
                                                        </Button>
                                                        <button onClick={() => {
                                                            if(confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
                                                                setCycles(cycles.filter(cycle => cycle.id !== c.id));
                                                            }
                                                        }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <span className="text-xs text-gray-400 font-medium px-2">مكتملة</span>
                                                        <button onClick={() => {
                                                            if(confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
                                                                setCycles(cycles.filter(cycle => cycle.id !== c.id));
                                                            }
                                                        }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {cycles.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-400 text-black opacity-50">لا توجد دورات مسجلة</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="إضافة مستخدم جديد">
                <div className="space-y-4">
                    <Input 
                        label="الاسم" 
                        value={newUserForm.name} 
                        onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                    />
                    <Input 
                        label="رقم الهاتف" 
                        value={newUserForm.phone} 
                        onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})}
                    />
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">نوع المستخدم</label>
                        <select 
                            className="w-full p-2 border rounded-lg text-black"
                            value={newUserForm.role}
                            onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value as UserRole})}
                        >
                            <option value={UserRole.INVESTOR}>مستثمر</option>
                            <option value={UserRole.BREEDER}>مربي</option>
                            <option value={UserRole.ADMIN}>مشرف (Admin)</option>
                        </select>
                    </div>
                    <Button className="w-full mt-4" onClick={handleCreateUser}>إضافة</Button>
                </div>
            </Modal>

            <Modal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} title="إنهاء وبيع الدورة">
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800 mb-4">
                        <p className="font-bold flex items-center gap-2"><AlertTriangle size={16}/> تنبيه هام</p>
                        <p>أنت على وشك تسجيل عملية بيع لهذه الدورة. هذا الإجراء سيقوم بتحويل حالة الدورة إلى "مباعة" (COMPLETED) ولن يمكن التراجع عنه.</p>
                    </div>
                    
                    {selectedCycleToSell && (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-black opacity-60">نوع الحيوان:</span>
                                <span className="font-bold text-black">{selectedCycleToSell.animalType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-black opacity-60">رأس المال المستثمر:</span>
                                <span className="font-bold text-black">{selectedCycleToSell.fundingGoal.toLocaleString()} ج.م</span>
                            </div>
                        </div>
                    )}

                    <Input 
                        label="سعر البيع النهائي (ج.م)" 
                        type="number"
                        value={salePrice} 
                        onChange={(e) => setSalePrice(e.target.value)}
                        placeholder="أدخل المبلغ الإجمالي للبيع"
                    />
                    
                    {selectedCycleToSell && salePrice && !isNaN(Number(salePrice)) && (
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                             <span className="text-green-800 font-medium">الربح المتوقع:</span>
                             <span className="text-green-700 font-bold text-lg">
                                {Math.max(0, Number(salePrice) - selectedCycleToSell.fundingGoal).toLocaleString()} ج.م 
                                <span className="text-xs mr-1">
                                    ({Math.round(((Number(salePrice) - selectedCycleToSell.fundingGoal) / selectedCycleToSell.fundingGoal) * 100)}%)
                                </span>
                             </span>
                        </div>
                    )}

                    <Button className="w-full mt-4" onClick={handleConfirmSale} disabled={!salePrice}>تأكيد البيع</Button>
                </div>
            </Modal>
        </div>
    );
};

const BreederActiveCycles: React.FC<{
  user: User;
  cycles: Cycle[];
  logs: CycleLog[];
  setLogs: (logs: CycleLog[]) => void;
}> = ({ user, cycles, logs, setLogs }) => {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newLogData, setNewLogData] = useState({ weight: '', food: '', notes: '' });

  const activeCycles = cycles.filter(c => c.breederId === user.id && c.status === CycleStatus.ACTIVE);
  const selectedCycle = cycles.find(c => c.id === selectedCycleId);
  
  // Get logs for selected cycle
  const cycleLogs = logs.filter(l => l.cycleId === selectedCycleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddLog = () => {
    if (!selectedCycleId) return;
    const newLog: CycleLog = {
        id: Math.random().toString(36).substr(2, 9),
        cycleId: selectedCycleId,
        date: new Date().toISOString().split('T')[0],
        weight: newLogData.weight ? parseFloat(newLogData.weight) : undefined,
        foodDetails: newLogData.food,
        notes: newLogData.notes
    };
    setLogs([newLog, ...logs]);
    setIsLogModalOpen(false);
    setNewLogData({ weight: '', food: '', notes: '' });
  };

  if (selectedCycle) {
      // Detail View
      return (
          <div className="space-y-6">
              <button onClick={() => setSelectedCycleId(null)} className="flex items-center gap-2 text-black opacity-60 hover:opacity-100">
                  <ArrowRight size={20}/> رجوع للقائمة
              </button>
              
              {/* Header Info */}
              <div className="flex justify-between items-start bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex gap-4">
                      <img src={selectedCycle.imageUrl} className="w-24 h-24 rounded-lg object-cover" />
                      <div>
                          <h2 className="text-xl font-bold mb-1 text-black">{selectedCycle.animalType}</h2>
                          <p className="text-gray-500 text-sm mb-2">تاريخ البدء: {selectedCycle.startDate}</p>
                          <div className="flex gap-4 text-sm">
                              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">الوزن الحالي: {cycleLogs[0]?.weight || selectedCycle.initialWeight} كجم</span>
                              <span className="bg-gray-100 text-black px-3 py-1 rounded-full opacity-70">الهدف: {selectedCycle.targetWeight} كجم</span>
                          </div>
                      </div>
                  </div>
                  <Button onClick={() => setIsLogModalOpen(true)}><Plus size={16}/> تسجيل تحديث يومي</Button>
              </div>

              {/* Logs Timeline */}
              <div className="space-y-4">
                  <h3 className="font-bold text-lg text-black">سجل المتابعة اليومي</h3>
                  {cycleLogs.map(log => (
                      <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                          <div className="flex flex-col items-center min-w-[80px] border-l pl-4 border-gray-100">
                              <span className="font-bold text-lg text-black">{new Date(log.date).getDate()}</span>
                              <span className="text-xs text-gray-500">{new Date(log.date).toLocaleString('default', { month: 'short' })}</span>
                          </div>
                          <div className="flex-1 space-y-2">
                               <div className="flex justify-between">
                                  <span className="font-bold text-sm text-black">تقرير المتابعة</span>
                                  {log.weight && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">وزن: {log.weight} كجم</span>}
                               </div>
                               <p className="text-sm text-black flex items-center gap-2">
                                  <Utensils size={14} className="text-orange-500"/> {log.foodDetails}
                               </p>
                               {log.notes && (
                                   <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded italic text-black">"{log.notes}"</p>
                               )}
                          </div>
                      </div>
                  ))}
                  {cycleLogs.length === 0 && <p className="text-center text-gray-400 py-8 text-black opacity-50">لا توجد سجلات متابعة بعد.</p>}
              </div>

              <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="تسجيل تحديث يومي">
                  <div className="space-y-4 text-black">
                      <Input label="تفاصيل العلف والماء" value={newLogData.food} onChange={(e) => setNewLogData({...newLogData, food: e.target.value})} placeholder="مثال: 5 كجم علف مركز + 20 لتر ماء" />
                      <Input label="الوزن الحالي (اختياري - كجم)" type="number" value={newLogData.weight} onChange={(e) => setNewLogData({...newLogData, weight: e.target.value})} />
                      <Input label="ملاحظات أخرى (صحة، نشاط...)" value={newLogData.notes} onChange={(e) => setNewLogData({...newLogData, notes: e.target.value})} />
                      <Button onClick={handleAddLog} className="w-full mt-2">حفظ السجل</Button>
                  </div>
              </Modal>
          </div>
      );
  }

  return (
      <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4 text-black">الدورات النشطة (متابعة يومية)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeCycles.map(cycle => {
                  const latestLog = logs.filter(l => l.cycleId === cycle.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                  const currentWeight = latestLog?.weight || cycle.initialWeight;
                  
                  return (
                      <Card key={cycle.id} className="p-4 flex flex-col gap-4">
                          <div className="flex items-start gap-4">
                              <img src={cycle.imageUrl} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                              <div>
                                  <h3 className="font-bold text-black">{cycle.animalType}</h3>
                                  <p className="text-xs text-gray-500 mb-2">تاريخ البدء: {cycle.startDate}</p>
                                  <div className="flex gap-2">
                                      <Badge color="green">نشطة</Badge>
                                      <Badge color="blue">{currentWeight} كجم</Badge>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                              <span className="text-xs text-gray-400 text-black opacity-50">آخر تحديث: {latestLog ? latestLog.date : 'لا يوجد'}</span>
                              <Button size="sm" onClick={() => setSelectedCycleId(cycle.id)}>عرض ومتابعة</Button>
                          </div>
                      </Card>
                  )
              })}
              {activeCycles.length === 0 && <p className="col-span-2 text-center text-gray-400 py-10 text-black opacity-50">لا توجد دورات نشطة حالياً.</p>}
          </div>
      </div>
  );
};

const BreederDashboard: React.FC<{
  user: User;
  cycles: Cycle[];
  setCycles: (cycles: Cycle[]) => void;
}> = ({ user, cycles, setCycles }) => {
  // Simple subset of breeder dashboard
  const myCycles = cycles.filter(c => c.breederId === user.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCycle, setNewCycle] = useState<Partial<Cycle>>({
      animalType: '',
      initialWeight: 0,
      targetWeight: 0,
      fundingGoal: 0,
      description: '',
      fatteningPlan: '',
  });

  const handleAddCycle = () => {
    // Basic validation
    if (!newCycle.animalType || !newCycle.fundingGoal) return;
    
    const cycle: Cycle = {
        id: Math.random().toString(36).substr(2, 9),
        breederId: user.id,
        status: CycleStatus.PENDING,
        startDate: new Date().toISOString().split('T')[0],
        totalHeads: 1,
        availableHeads: 1,
        currentFunding: 0,
        expectedDuration: 180,
        imageUrl: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        healthCertUrl: "#",
        ...newCycle as any
    };
    
    setCycles([...cycles, cycle]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-black">دوراتي الإنتاجية</h2>
            <Button onClick={() => setIsModalOpen(true)}><Plus size={18}/> إضافة دورة</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCycles.map(cycle => (
                <Card key={cycle.id} className="overflow-hidden">
                    <div className="h-40 bg-gray-200 relative">
                        <img src={cycle.imageUrl} alt={cycle.animalType} className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2">
                            <StatusBadge status={cycle.status} type="cycle" />
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 text-black">{cycle.animalType}</h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{cycle.description}</p>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-black opacity-60">التمويل المطلوب:</span>
                            <span className="font-bold text-black">{cycle.fundingGoal.toLocaleString()} ج.م</span>
                        </div>
                         <div className="flex justify-between text-sm">
                            <span className="text-black opacity-60">الوزن الحالي:</span>
                            <span className="font-bold text-black">{cycle.initialWeight} كجم</span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة دورة جديدة">
            <div className="space-y-4 text-black">
                <Input label="نوع الحيوان" value={newCycle.animalType} onChange={(e) => setNewCycle({...newCycle, animalType: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="الوزن الحالي (كجم)" type="number" value={newCycle.initialWeight} onChange={(e) => setNewCycle({...newCycle, initialWeight: Number(e.target.value)})} />
                    <Input label="الوزن المستهدف (كجم)" type="number" value={newCycle.targetWeight} onChange={(e) => setNewCycle({...newCycle, targetWeight: Number(e.target.value)})} />
                </div>
                <Input label="مبلغ التمويل المطلوب (ج.م)" type="number" value={newCycle.fundingGoal} onChange={(e) => setNewCycle({...newCycle, fundingGoal: Number(e.target.value)})} />
                <Input label="الوصف" value={newCycle.description} onChange={(e) => setNewCycle({...newCycle, description: e.target.value})} />
                <Button className="w-full mt-4" onClick={handleAddCycle}>حفظ وإرسال للمراجعة</Button>
            </div>
        </Modal>
    </div>
  );
};

const InvestorPortfolio: React.FC<{
    user: User;
    cycles: Cycle[];
    investments: Investment[];
}> = ({ user, cycles, investments }) => {
    // Portfolio Data
    const myInvestments = investments.filter(inv => inv.investorId === user.id);
    const totalInvested = myInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const activeInvestmentCount = myInvestments.filter(inv => {
        const cycle = cycles.find(c => c.id === inv.cycleId);
        return cycle && cycle.status === CycleStatus.ACTIVE;
    }).length;

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center gap-4 bg-blue-50 border-blue-100">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Wallet size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">إجمالي الاستثمارات</p>
                        <p className="text-xl font-bold text-blue-700">{totalInvested.toLocaleString()} ج.م</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-green-50 border-green-100">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full"><Activity size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">دورات نشطة</p>
                        <p className="text-xl font-bold text-green-700">{activeInvestmentCount}</p>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-purple-50 border-purple-100">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><CheckCircle size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">دورات مكتملة</p>
                        <p className="text-xl font-bold text-purple-700">{myInvestments.length - activeInvestmentCount}</p>
                    </div>
                </Card>
            </div>

            <h2 className="text-xl font-bold text-black">استثماراتي</h2>
            <div className="space-y-4">
                {myInvestments.map(inv => {
                    const cycle = cycles.find(c => c.id === inv.cycleId);
                    if (!cycle) return null;

                    const isCompleted = cycle.status === CycleStatus.COMPLETED;
                    // Calculate Profit if completed
                    let profit = 0;
                    let roi = 0;
                    if (isCompleted && cycle.finalSalePrice && cycle.finalSalePrice > 0) {
                        const shareRatio = inv.amount / cycle.fundingGoal;
                        const finalValue = cycle.finalSalePrice * shareRatio;
                        profit = finalValue - inv.amount;
                        roi = (profit / inv.amount) * 100;
                    }

                    return (
                        <Card key={inv.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <img src={cycle.imageUrl} className="w-full md:w-32 h-32 object-cover rounded-lg" alt="" />
                            
                            <div className="flex-1 space-y-2 w-full">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-black">{cycle.animalType}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock size={12}/> تاريخ الاستثمار: {new Date(inv.date).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                    <StatusBadge status={cycle.status} type="cycle" />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-3 rounded-lg text-sm">
                                    <div>
                                        <span className="block text-gray-500 text-xs">مبلغ الاستثمار</span>
                                        <span className="font-bold text-black">{inv.amount.toLocaleString()} ج.م</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs">تاريخ البدء</span>
                                        <span className="font-medium text-black">{cycle.startDate}</span>
                                    </div>
                                    
                                    {isCompleted ? (
                                        <>
                                            <div>
                                                <span className="block text-gray-500 text-xs">العائد النهائي</span>
                                                <span className="font-bold text-green-700">{(inv.amount + profit).toLocaleString()} ج.م</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-500 text-xs">صافي الربح</span>
                                                <span className="font-bold text-green-600">
                                                    +{profit.toLocaleString()} <span className="text-xs">({roi.toFixed(1)}%)</span>
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="col-span-2">
                                            <span className="block text-gray-500 text-xs mb-1">حالة الدورة</span>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                            </div>
                                            <span className="text-xs text-primary mt-1 block">جاري التسمين...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
                
                {myInvestments.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                            <Sprout size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-black">لم تقم بأي استثمار بعد</h3>
                        <p className="text-gray-500 mb-4">ابدأ استثمارك الأول في الثروة الحيوانية الآن.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InvestorDashboard: React.FC<{
    user: User;
    cycles: Cycle[];
    setCycles: (cycles: Cycle[]) => void;
    investments: Investment[];
    setInvestments: (inv: Investment[]) => void;
    onInvestSuccess: () => void;
}> = ({ user, cycles, setCycles, investments, setInvestments, onInvestSuccess }) => {
    // Show active cycles available for funding
    const availableCycles = cycles.filter(c => c.status === CycleStatus.ACTIVE && c.currentFunding < c.fundingGoal);
    
    // Investment Modal State
    const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
    const [investAmount, setInvestAmount] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [receiptImage, setReceiptImage] = useState<string | null>(null);

    const handleOpenInvestModal = (cycle: Cycle) => {
        setSelectedCycle(cycle);
        setInvestAmount('');
        setError('');
        setReceiptImage(null);
        setIsInvestModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setReceiptImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmInvest = () => {
        if (!selectedCycle) return;
        
        const amount = parseFloat(investAmount);
        const remainingNeeded = selectedCycle.fundingGoal - selectedCycle.currentFunding;

        if (isNaN(amount) || amount <= 0) {
            setError("يرجى إدخال مبلغ صحيح أكبر من صفر.");
            return;
        }

        if (amount > remainingNeeded) {
            setError(`المبلغ المدخل يتجاوز المبلغ المتبقي المطلوب (${remainingNeeded.toLocaleString()} ج.م)`);
            return;
        }

        if (!receiptImage) {
            setError("يرجى إرفاق صورة إيصال التحويل البنكي.");
            return;
        }

        // Create new Investment
        const newInv: Investment = {
            id: Math.random().toString(),
            investorId: user.id,
            cycleId: selectedCycle.id,
            amount: amount,
            date: new Date().toISOString(),
            status: 'APPROVED',
            headsCount: 1, // Simplified for now
            contractCodes: ['DEMO-CONTRACT'],
            transferReceiptUrl: receiptImage
        };

        // Update Investments State
        setInvestments([...investments, newInv]);

        // Update Cycle Funding State
        const updatedCycles = cycles.map(c => {
            if (c.id === selectedCycle.id) {
                return { ...c, currentFunding: c.currentFunding + amount };
            }
            return c;
        });
        setCycles(updatedCycles);

        setIsInvestModalOpen(false);
        setSelectedCycle(null);
        setInvestAmount('');
        setReceiptImage(null);
        alert("تم الاستثمار بنجاح! جاري مراجعة الإيصال.");
        onInvestSuccess();
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 text-black">فرص الاستثمار المتاحة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCycles.map(cycle => (
                    <Card key={cycle.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                        <img src={cycle.imageUrl} alt={cycle.animalType} className="w-full h-48 object-cover" />
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-black">{cycle.animalType}</h3>
                                <Badge color="green">متاح</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cycle.description}</p>
                            
                            <div className="mt-auto space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span className="text-black opacity-60">نسبة التغطية</span>
                                        <span className="text-black">{Math.round((cycle.currentFunding / cycle.fundingGoal) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: `${(cycle.currentFunding / cycle.fundingGoal) * 100}%` }}></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-black font-bold">{cycle.currentFunding.toLocaleString()} ج.م</span>
                                    <span className="text-black opacity-50">من {cycle.fundingGoal.toLocaleString()}</span>
                                </div>
                                <Button className="w-full" onClick={() => handleOpenInvestModal(cycle)}>استثمار الآن</Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {availableCycles.length === 0 && <p className="col-span-3 text-center text-gray-500 py-10 text-black opacity-50">لا توجد فرص استثمارية متاحة حالياً.</p>}
            </div>

            <Modal isOpen={isInvestModalOpen} onClose={() => setIsInvestModalOpen(false)} title="استثمار جديد">
                <div className="space-y-4 text-black">
                    {selectedCycle && (
                        <>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm mb-2 space-y-2">
                                <div className="flex justify-between">
                                    <span className="opacity-60">الدورة:</span>
                                    <span className="font-bold">{selectedCycle.animalType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="opacity-60">التمويل المطلوب:</span>
                                    <span>{selectedCycle.fundingGoal.toLocaleString()} ج.م</span>
                                </div>
                                <div className="flex justify-between text-primary font-bold">
                                    <span>المبلغ المتبقي:</span>
                                    <span>{(selectedCycle.fundingGoal - selectedCycle.currentFunding).toLocaleString()} ج.م</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">مبلغ الاستثمار (ج.م)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-black"
                                        value={investAmount}
                                        onChange={(e) => {
                                            setInvestAmount(e.target.value);
                                            setError('');
                                        }}
                                        placeholder="أدخل المبلغ"
                                    />
                                    <button 
                                        className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
                                        onClick={() => setInvestAmount((selectedCycle.fundingGoal - selectedCycle.currentFunding).toString())}
                                    >
                                        كامل المبلغ
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium">صورة إيصال التحويل</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                    {receiptImage ? (
                                        <div className="relative h-32 w-full">
                                            <img src={receiptImage} alt="Receipt" className="h-full w-full object-contain mx-auto" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-xs opacity-0 hover:opacity-100 transition-opacity rounded-lg">تغيير الصورة</div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <Upload size={24} className="mb-2" />
                                            <span className="text-xs">اضغط لرفع صورة الإيصال</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-xs mt-1 font-bold">{error}</p>}

                            <Button className="w-full mt-4" onClick={handleConfirmInvest}>تأكيد ودفع</Button>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};

// --- Main App Component ---
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [cycles, setCycles] = useState<Cycle[]>(INITIAL_CYCLES);
  const [investments, setInvestments] = useState<Investment[]>(INITIAL_INVESTMENTS);
  const [logs, setLogs] = useState<CycleLog[]>(INITIAL_LOGS);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine Dashboard Component based on Role
  const renderContent = () => {
    if (activeTab === 'settings' || activeTab === 'profile') {
        return <ProfileView user={currentUser!} onUpdate={(u) => {
            setUsers(users.map(user => user.id === u.id ? u : user));
            setCurrentUser(u);
        }} />;
    }

    if (activeTab === 'investments') {
        return <InvestorPortfolio user={currentUser!} cycles={cycles} investments={investments} />;
    }

    if (activeTab === 'active_cycles') {
        return <BreederActiveCycles user={currentUser!} cycles={cycles} logs={logs} setLogs={setLogs} />;
    }

    switch (currentUser?.role) {
        case UserRole.ADMIN:
            return <AdminDashboard users={users} setUsers={setUsers} cycles={cycles} setCycles={setCycles} />;
        case UserRole.BREEDER:
            return <BreederDashboard user={currentUser} cycles={cycles} setCycles={setCycles} />;
        case UserRole.INVESTOR:
            return <InvestorDashboard 
                user={currentUser} 
                cycles={cycles} 
                setCycles={setCycles} 
                investments={investments} 
                setInvestments={setInvestments}
                onInvestSuccess={() => setActiveTab('investments')} 
            />;
        default:
            return <div>Unknown Role</div>;
    }
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} users={users} setUsers={setUsers} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        {/* Sidebar */}
        <aside className={`
            fixed md:sticky top-0 right-0 h-screen w-64 bg-white border-l border-gray-200 z-50 transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img 
                      src={APP_LOGO} 
                      onError={handleLogoError}
                      alt="Logo" 
                      className="w-8 h-8 object-contain" 
                    />
                    <h1 className="text-xl font-bold text-black">دواب</h1>
                </div>
                <button className="md:hidden text-gray-500" onClick={() => setIsMobileMenuOpen(false)}>
                    <X size={24} />
                </button>
            </div>
            
            <div className="p-4 space-y-2">
                <SidebarItem 
                    icon={LayoutDashboard} 
                    label="لوحة التحكم" 
                    active={activeTab === 'dashboard'} 
                    onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} 
                />
                
                {currentUser?.role === UserRole.INVESTOR && (
                     <SidebarItem 
                        icon={PieChart} 
                        label="استثماراتي" 
                        active={activeTab === 'investments'} 
                        onClick={() => { setActiveTab('investments'); setIsMobileMenuOpen(false); }} 
                    />
                )}

                {currentUser?.role === UserRole.BREEDER && (
                     <SidebarItem 
                        icon={Activity} 
                        label="الدورات النشطة" 
                        active={activeTab === 'active_cycles'} 
                        onClick={() => { setActiveTab('active_cycles'); setIsMobileMenuOpen(false); }} 
                    />
                )}

                <SidebarItem 
                    icon={UserCog} 
                    label="الملف الشخصي" 
                    active={activeTab === 'profile'} 
                    onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} 
                />
                
                <div className="pt-4 mt-4 border-t border-gray-100">
                    <button 
                        onClick={() => setCurrentUser(null)} 
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">تسجيل خروج</span>
                    </button>
                </div>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between md:hidden">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-gray-600">
                    <Menu size={24} />
                </button>
                <span className="font-bold text-lg text-black">دواب</span>
                <div className="w-8"></div> {/* Spacer */}
            </header>

            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </main>
    </div>
  );
}

export default App;
