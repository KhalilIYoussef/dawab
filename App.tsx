
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Sprout, LayoutDashboard, Wallet, TrendingUp, History, 
  Settings, LogOut, Plus, FileText, ChevronRight, MapPin, Search,
  AlertTriangle, DollarSign, Activity, Wheat, CheckCircle, Clock,
  Upload, Camera, Utensils, Menu, X, Tractor, ShieldCheck, Ban, Trash2, Eye,
  Lock, ArrowRight, UserPlus, LogIn, FileCheck, FileWarning, Filter, Check, XCircle,
  Banknote, Image as ImageIcon, ClipboardList, Scale, Shield, Info, PieChart, Coins,
  Calculator, ArrowDown, ShoppingBag, Gavel, UserCog, Calendar, ChevronDown, ChevronUp, Syringe, Pill, Stethoscope, Droplets, Minus, HeartPulse,
  Play
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
const FALLBACK_LOGO = "https://cdn-icons-png.flaticon.com/512/3069/3069172.png";

const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_LOGO;
    e.currentTarget.onerror = null;
};

// --- Shared Log Components ---

const DailyLogTimelineItem: React.FC<{ log: CycleLog }> = ({ log }) => {
    return (
        <div className="relative pl-8 pb-8 last:pb-0">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 group-last:bg-transparent"></div>
            
            {/* Timeline Dot */}
            <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-white bg-primary shadow-sm z-10"></div>
            
            <Card className="p-4 shadow-sm border-gray-100 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-bold text-black text-sm">
                            {new Date(log.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    {log.weight && (
                        <Badge color="blue">
                            <div className="flex items-center gap-1">
                                <Scale size={12} />
                                <span>{log.weight} كجم</span>
                            </div>
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                            <Wheat size={12} /> التغذية والمخزون
                        </h4>
                        <div className="bg-green-50/50 p-2.5 rounded-lg border border-green-100/50">
                            <p className="text-sm text-black leading-relaxed">
                                {log.foodDetails || "تغذية روتينية متوازنة حسب الخطة"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-[10px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1">
                            <HeartPulse size={12} /> الحالة الصحية والملاحظات
                        </h4>
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/50">
                            {log.notes ? (
                                <div className="space-y-1">
                                    {log.notes.split('|').map((note, idx) => (
                                        <div key={idx} className="text-sm text-black flex items-start gap-2">
                                            {note.includes('[vaccine]') ? <Syringe size={14} className="text-blue-500 mt-0.5 shrink-0" /> : 
                                             note.includes('[treatment]') ? <Stethoscope size={14} className="text-orange-500 mt-0.5 shrink-0" /> :
                                             <Info size={14} className="text-gray-400 mt-0.5 shrink-0" />}
                                            <span>{note.replace(/\[vaccine\]|\[treatment\]/g, '').trim()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 italic">لا توجد ملاحظات خاصة لهذا اليوم.</p>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
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
    'ACTIVE': type === 'cycle' ? 'نشطة (قيد التسمين)' : 'نشط',
    'PENDING': type === 'cycle' ? 'تحتاج تمويل' : (type === 'user' ? 'معلق' : 'قيد المراجعة'),
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
    password: '',
    role: UserRole.INVESTOR
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
        const numericValue = value.replace(/\D/g, '');
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
      if (user.password && user.password !== formData.password) {
          setError('كلمة مورور غير صحيحة.');
          return;
      }
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
    const { name, phone, password } = formData;
    if (users.some(u => u.phone === phone)) {
      setError('رقم الهاتف مسجل بالفعل.');
      return;
    }
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!nameRegex.test(name)) {
        setError("خطأ في الاسم: يجب أن يحتوي الاسم على أحرف فقط (دون أرقام أو رموز).");
        return;
    }
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phone)) {
       setError('رقم الهاتف غير صحيح: يجب أن يتكون من 11 رقم بالضبط.');
       return;
    }
    if (password.length < 3) {
       setError('كلمة المرور يجب أن تكون 3 أحرف على الأقل.');
       return;
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      phone: phone,
      password: password,
      role: UserRole.INVESTOR,
      status: UserStatus.PENDING,
      documentsVerified: false,
      profilePictureUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
    };
    setUsers([...users, newUser]);
    setIsRegistering(false);
    setSuccess('تم إنشاء الحساب بنجاح! حسابك الآن قيد المراجعة، سيقوم المسؤول بتفعيله قريباً.');
    setFormData(prev => ({ ...prev, name: '', password: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[500px]">
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary text-white p-12 text-center relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] opacity-10 bg-cover bg-center"></div>
          <img src={APP_LOGO} onError={handleLogoError} alt="Dawab Logo" className="w-40 h-40 mb-6 z-10 object-contain drop-shadow-xl" />
          <h1 className="text-4xl font-bold mb-4 z-10">منصة دواب</h1>
          <p className="text-lg opacity-90 z-10">استثمر في الثروة الحيوانية بأمان، أو ابدأ دورتك الإنتاجية بتمويل تشاركي.</p>
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-right">
            <h2 className="text-2xl font-bold text-black mb-2">{isRegistering ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h2>
            <p className="text-gray-500 text-sm">{isRegistering ? 'أدخل بياناتك للانضمام إلينا' : 'أدخل رقم هاتفك للمتابعة'}</p>
          </div>
          {success && (
             <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start gap-2">
                <CheckCircle size={18} className="shrink-0 mt-0.5" />
                <span>{success}</span>
             </div>
          )}
          <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-4">
            {isRegistering && <Input label="الاسم بالكامل" name="name" value={formData.name} onChange={handleInputChange} placeholder="أحمد محمد" required />}
            <Input label="رقم الهاتف" name="phone" type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={11} value={formData.phone} onChange={handleInputChange} placeholder="01xxxxxxxxx" required />
            <Input label="كلمة المرور" name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="********" required />
            {error && (
               <div className="mb-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
               </div>
            )}
            <Button type="submit" className="w-full py-3 text-lg"> {isRegistering ? 'إنشاء الحساب' : 'دخول'} </Button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }} className="text-primary hover:underline text-sm font-medium">
              {isRegistering ? 'لدي حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
            </button>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400 mb-4 font-bold uppercase tracking-widest">الدخول السريع (للتجربة)</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => onLogin(INITIAL_USERS[0])}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={18} />
                </div>
                <span className="text-[10px] font-bold text-gray-500">أدمن</span>
              </button>
              <button 
                onClick={() => onLogin(INITIAL_USERS[1])}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Tractor size={18} />
                </div>
                <span className="text-[10px] font-bold text-gray-500">مربي</span>
              </button>
              <button 
                onClick={() => onLogin(INITIAL_USERS[3])}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet size={18} />
                </div>
                <span className="text-[10px] font-bold text-gray-500">مستثمر</span>
              </button>
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
  const handleFileUpload = (field: keyof User) => {
    alert("تم رفع الملف بنجاح (محاكاة)");
    onUpdate({ ...user, [field]: 'uploaded_url' });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-green-600 to-green-400"></div>
        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pt-12 px-4">
          <div className="relative group">
             <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 shadow-md overflow-hidden flex items-center justify-center text-2xl font-bold text-black">
                {user.profilePictureUrl ? <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
             </div>
          </div>
          <div className="flex-1 text-center md:text-right mb-4 md:mb-0">
             <h2 className="text-2xl font-bold text-black">{user.name}</h2>
             <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2"> <MapPin size={16} /> {user.governorate || 'غير محدد'} </p>
          </div>
          <div className="flex gap-2"> <StatusBadge status={user.status} type="user" /> </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black"><UserCog size={20}/> البيانات الشخصية</h3>
            <div className="space-y-4">
               <div> <label className="text-sm text-gray-500">رقم الهاتف</label> <p className="font-medium text-black">{user.phone}</p> </div>
               <div> <label className="text-sm text-gray-500">الرقم القومي</label> <p className="font-medium text-black">{user.nationalId || 'غير مسجل'}</p> </div>
            </div>
         </Card>
         <Card className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-black"><ShieldCheck size={20}/> التوثيق والأوراق</h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-full ${user.documentsVerified ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}> {user.documentsVerified ? <CheckCircle size={20} /> : <AlertTriangle size={20} />} </div>
                     <div> <p className="font-medium text-sm text-black">التوثيق الرقمي</p> <p className="text-xs text-gray-500">{user.documentsVerified ? 'تم التحقق' : 'بانتظار الرفع'}</p> </div>
                  </div>
                  {!user.documentsVerified && <Button size="sm" variant="outline" onClick={() => handleFileUpload('idCardFrontUrl')}>رفع</Button>}
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
    cycles: Cycle[], setCycles: (c: Cycle[]) => void,
    investments: Investment[], setInvestments: (i: Investment[]) => void
}> = ({ users, setUsers, cycles, setCycles, investments, setInvestments }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'cycles' | 'investments'>('overview');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({ name: '', phone: '', password: '123', role: UserRole.INVESTOR });
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [selectedCycleToSell, setSelectedCycleToSell] = useState<Cycle | null>(null);
    const [salePrice, setSalePrice] = useState<string>('');

    const roleLabels = {
        [UserRole.ADMIN]: 'مدير النظام',
        [UserRole.BREEDER]: 'مربي',
        [UserRole.INVESTOR]: 'مستثمر'
    };

    const handleUserAction = (id: string, action: 'approve' | 'reject') => {
        setUsers(users.map(u => u.id === id ? { ...u, status: action === 'approve' ? UserStatus.ACTIVE : UserStatus.REJECTED } : u));
    };

    const handleCycleAction = (id: string, action: 'approve' | 'reject') => {
        const cycle = cycles.find(c => c.id === id);
        if (action === 'approve') {
          if (cycle && cycle.currentFunding < cycle.fundingGoal) {
            if (!confirm(`تنبيه: التمويل لم يكتمل بعد (${Math.floor((cycle.currentFunding / cycle.fundingGoal) * 100)}%). هل أنت متأكد من تنشيط الدورة وبدء مرحلة التسمين يدوياً الآن؟`)) {
              return;
            }
          }
        }
        setCycles(cycles.map(c => c.id === id ? { ...c, status: action === 'approve' ? CycleStatus.ACTIVE : CycleStatus.REJECTED } : c));
    };

    const handleInvestmentAction = (id: string, action: 'approve' | 'reject') => {
        const inv = investments.find(i => i.id === id);
        if (!inv) return;
        
        setInvestments(investments.map(i => i.id === id ? { ...i, status: action === 'approve' ? 'APPROVED' : 'REJECTED' } : i));
        
        if (action === 'approve') {
          setCycles(cycles.map(c => c.id === inv.cycleId ? { ...c, currentFunding: c.currentFunding + inv.amount } : c));
        }
    };

    const handleCreateUser = () => {
        const newUser: User = { id: Math.random().toString(36).substr(2, 9), name: newUserForm.name, phone: newUserForm.phone, password: newUserForm.password, role: newUserForm.role, status: UserStatus.ACTIVE, documentsVerified: true };
        setUsers([...users, newUser]);
        setIsAddUserModalOpen(false);
    };

    const openSellModal = (cycle: Cycle) => {
        setSelectedCycleToSell(cycle);
        setSalePrice((cycle.fundingGoal * 1.2).toString());
        setIsSellModalOpen(true);
    };

    const handleConfirmSale = () => {
        if (!selectedCycleToSell) return;
        const price = parseFloat(salePrice);
        setCycles(cycles.map(c => c.id === selectedCycleToSell.id ? { ...c, status: CycleStatus.COMPLETED, finalSalePrice: price, actualEndDate: new Date().toISOString().split('T')[0] } : c));
        setIsSellModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b overflow-x-auto pb-2">
                {['overview', 'users', 'cycles', 'investments'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 font-medium whitespace-nowrap transition-all ${activeTab === tab ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 hover:text-black'}`}>
                        {tab === 'overview' ? 'نظرة عامة' : tab === 'users' ? 'المستخدمين' : tab === 'cycles' ? 'الدورات' : 'الاستثمارات'}
                    </button>
                ))}
            </div>
            
            {activeTab === 'overview' && (
                <div className="animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard 
                            title="إجمالي المستخدمين" 
                            value={users.length} 
                            icon={Users} 
                            color="primary" 
                        />
                        <StatCard 
                            title="الدورات النشطة" 
                            value={cycles.filter(c => c.status === CycleStatus.ACTIVE).length} 
                            icon={Activity} 
                            color="blue" 
                        />
                        <StatCard 
                            title="إجمالي الاستثمارات" 
                            value={`${investments.filter(i => i.status === 'APPROVED').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} ج.م`} 
                            icon={Banknote} 
                            color="purple" 
                        />
                        <StatCard 
                            title="طلبات معلقة" 
                            value={users.filter(u => u.status === UserStatus.PENDING).length + investments.filter(i => i.status === 'PENDING_APPROVAL').length} 
                            icon={AlertTriangle} 
                            color="secondary" 
                        />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                                <History size={20} className="text-primary" /> نشاط النظام الأخير
                            </h3>
                            <div className="space-y-4">
                                {cycles.slice(-3).reverse().map(c => (
                                    <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Tractor size={18} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-black">إضافة دورة: {c.animalType}</p>
                                            <p className="text-xs text-gray-500">{new Date(c.startDate).toLocaleDateString('ar-EG')}</p>
                                        </div>
                                    </div>
                                ))}
                                {users.filter(u => u.status === UserStatus.PENDING).slice(0, 2).map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                                        <div className="flex items-center gap-3">
                                            <UserPlus size={18} className="text-orange-500" />
                                            <div>
                                                <p className="text-sm font-bold text-black">مستخدم جديد: {u.name}</p>
                                                <p className="text-xs text-gray-500">بانتظار التفعيل</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => setActiveTab('users')}>عرض</Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="p-6">
                            <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                                <TrendingUp size={20} className="text-blue-600" /> حالة التمويل
                            </h3>
                            <div className="space-y-6">
                                {cycles.filter(c => c.status === CycleStatus.PENDING).slice(0, 3).map(c => {
                                    const percent = Math.floor((c.currentFunding/c.fundingGoal)*100);
                                    return (
                                        <div key={c.id}>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-bold text-black">{c.animalType}</span>
                                                <span className="text-gray-500">{percent}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {cycles.filter(c => c.status === CycleStatus.PENDING).length === 0 && (
                                    <p className="text-center py-10 text-gray-400 italic">لا توجد دورات قيد التمويل حالياً</p>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
            
            {activeTab === 'users' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-4"> <h3 className="font-bold text-lg text-black">إدارة المستخدمين</h3> <Button size="sm" onClick={() => setIsAddUserModalOpen(true)}><Plus size={16}/> إضافة مستخدم</Button> </div>
                    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-black text-sm"> <tr> <th className="p-4">الاسم</th> <th className="p-4">الدور</th> <th className="p-4">الحالة</th> <th className="p-4">الإجراءات</th> </tr> </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4"> <div className="font-bold text-black">{u.name}</div> <div className="text-xs text-gray-500">{u.phone}</div> </td>
                                        <td className="p-4"> <span className="text-xs font-medium text-gray-800 bg-gray-100 px-2 py-1 rounded-md">{roleLabels[u.role] || u.role}</span> </td>
                                        <td className="p-4"><StatusBadge status={u.status} type="user" /></td>
                                        <td className="p-4"> {u.status === UserStatus.PENDING && ( <div className="flex gap-2"> <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => handleUserAction(u.id, 'approve')}>قبول</Button> <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => handleUserAction(u.id, 'reject')}>رفض</Button> </div> )} </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'cycles' && (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-lg mb-4 text-black">إدارة الدورات الإنتاجية</h3>
                    <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-black text-sm"> <tr> <th className="p-4">الدورة</th> <th className="p-4">التمويل والمشاركين</th> <th className="p-4">الحالة</th> <th className="p-4">الإجراءات</th> </tr> </thead>
                            <tbody className="divide-y divide-gray-100">
                                {cycles.map(c => {
                                    const cycleInvestments = investments.filter(inv => inv.cycleId === c.id && inv.status === 'APPROVED');
                                    const participants = cycleInvestments.map(inv => {
                                      const investor = users.find(u => u.id === inv.investorId);
                                      const share = ((inv.amount / c.fundingGoal) * 100).toFixed(1);
                                      return { name: investor?.name || "مستثمر", share };
                                    });
                                    const fundPercent = Math.floor((c.currentFunding/c.fundingGoal)*100);

                                    return (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="p-4"> <div className="font-bold text-black">{c.animalType}</div> <div className="text-xs text-gray-500">الهدف: {c.fundingGoal.toLocaleString()} ج.م</div> </td>
                                            <td className="p-4">
                                                <div className="text-xs font-bold text-primary mb-1">تم جمع: {c.currentFunding.toLocaleString()} ({fundPercent}%)</div>
                                                <div className="w-24 bg-gray-100 h-1 rounded-full mb-2 overflow-hidden">
                                                    <div className="bg-primary h-full" style={{ width: `${fundPercent}%` }}></div>
                                                </div>
                                                <div className="space-y-1">
                                                  {participants.map((p, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-gray-50 px-2 py-0.5 rounded text-[10px]">
                                                      <span className="text-gray-600 truncate max-w-[80px]">{p.name}</span>
                                                      <span className="font-bold text-primary">{p.share}%</span>
                                                    </div>
                                                  ))}
                                                </div>
                                            </td>
                                            <td className="p-4"><StatusBadge status={c.status} type="cycle" /></td>
                                            <td className="p-4">
                                                {c.status === CycleStatus.PENDING && (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" onClick={() => handleCycleAction(c.id, 'approve')} className="bg-green-600 flex items-center gap-1">
                                                          <Play size={14} /> تنشيط
                                                        </Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleCycleAction(c.id, 'reject')}>رفض</Button>
                                                    </div>
                                                )}
                                                {c.status === CycleStatus.ACTIVE && (
                                                  <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => openSellModal(c)} className="bg-orange-500">تسجيل بيع</Button>
                                                    <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => { if(confirm('تنبيه: هل أنت متأكد من رغبتك في إيقاف هذه الدورة وإعادتها لحالة "تحتاج تمويل"؟')) { setCycles(cycles.map(item => item.id === c.id ? {...item, status: CycleStatus.PENDING} : item)); } }}>إيقاف</Button>
                                                  </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'investments' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8">
                    <section>
                        <h3 className="font-bold text-lg mb-4 text-black flex items-center gap-2">
                            <Clock size={20} className="text-yellow-600" /> تأكيد تحويلات المستثمرين (بانتظار الموافقة)
                        </h3>
                        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 text-black text-sm"> <tr> <th className="p-4">المستثمر</th> <th className="p-4">المبلغ</th> <th className="p-4">الإيصال</th> <th className="p-4">الإجراء</th> </tr> </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {investments.filter(i => i.status === 'PENDING_APPROVAL').map(inv => {
                                        const investor = users.find(u => u.id === inv.investorId);
                                        return (
                                            <tr key={inv.id} className="hover:bg-gray-50">
                                                <td className="p-4"> <div className="font-bold text-black">{investor?.name}</div> </td>
                                                <td className="p-4 font-bold text-primary">{inv.amount.toLocaleString()} ج.م</td>
                                                <td className="p-4"> {inv.transferReceiptUrl && <button onClick={() => window.open(inv.transferReceiptUrl)} className="text-blue-600 text-xs hover:underline">عرض الإيصال</button>} </td>
                                                <td className="p-4 flex gap-2">
                                                    <Button size="sm" onClick={() => handleInvestmentAction(inv.id, 'approve')} className="bg-green-600">قبول</Button>
                                                    <Button size="sm" onClick={() => handleInvestmentAction(inv.id, 'reject')} className="bg-red-600">رفض</Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {investments.filter(i => i.status === 'PENDING_APPROVAL').length === 0 && (
                                        <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">لا توجد تحويلات بانتظار الموافقة حالياً</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg mb-4 text-black flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-600" /> التحويلات المؤكدة (تاريخ العمليات)
                        </h3>
                        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 text-black text-sm"> <tr> <th className="p-4">التاريخ</th> <th className="p-4">المستثمر</th> <th className="p-4">المبلغ</th> <th className="p-4">الحالة</th> </tr> </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {investments.filter(i => i.status !== 'PENDING_APPROVAL').reverse().map(inv => {
                                        const investor = users.find(u => u.id === inv.investorId);
                                        return (
                                            <tr key={inv.id} className="hover:bg-gray-50">
                                                <td className="p-4 text-xs text-gray-500">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                                                <td className="p-4"> <div className="font-bold text-black">{investor?.name}</div> </td>
                                                <td className="p-4 font-bold text-gray-700">{inv.amount.toLocaleString()} ج.م</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {inv.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="إضافة مستخدم">
                <div className="space-y-4">
                    <Input label="الاسم" value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} />
                    <Input label="رقم الهاتف" value={newUserForm.phone} onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})} />
                    <Input label="كلمة المرور" type="password" value={newUserForm.password} onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})} />
                    <Button className="w-full" onClick={handleCreateUser}>إضافة</Button>
                </div>
            </Modal>

            <Modal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} title="تسجيل بيع الدورة">
                <div className="space-y-4">
                    <Input label="سعر البيع النهائي (ج.م)" type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
                    <Button className="w-full" onClick={handleConfirmSale}>تأكيد البيع وتوزيع الأرباح</Button>
                </div>
            </Modal>
        </div>
    );
};

// --- Specialized UI Components for Daily Logs ---

const QuantityControl: React.FC<{ value: number, onChange: (val: number) => void, unit: string, step?: number }> = ({ value, onChange, unit, step = 1 }) => (
    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
        <button 
            onClick={() => onChange(Math.max(0, value - step))}
            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
        >
            <Minus size={16} />
        </button>
        <div className="flex-1 flex items-center justify-center gap-1 min-w-[60px]">
            <input 
                type="number" 
                value={value || ''} 
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-full text-center font-bold text-black bg-transparent focus:outline-none"
                placeholder="0"
                inputMode="decimal"
            />
            <span className="text-[10px] text-gray-400 font-medium">{unit}</span>
        </div>
        <button 
            onClick={() => onChange(value + step)}
            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary hover:bg-green-50 transition-colors"
        >
            <Plus size={16} />
        </button>
    </div>
);

const CollapsibleSection: React.FC<{ title: string, icon: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="space-y-3">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-gray-100/50 rounded-xl hover:bg-gray-200/50 transition-colors"
            >
                <div className="flex items-center gap-2 font-bold text-black">
                    <span className="text-xl">{icon}</span>
                    <span>{title}</span>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {isOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    );
};

const ItemCard: React.FC<{ icon: string, name: string, unit: string, value: number, onChange: (v: number) => void, warning?: boolean }> = ({ icon, name, unit, value, onChange, warning }) => (
    <Card className={`p-3 relative overflow-hidden transition-all duration-200 ${warning ? 'border-red-200 bg-red-50/30' : 'hover:border-primary/30'}`}>
        {warning && <div className="absolute top-1 right-1"><AlertTriangle size={12} className="text-red-500" /></div>}
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">{icon}</div>
            <div className="flex-1">
                <h4 className="font-bold text-sm text-black leading-tight">{name}</h4>
                <p className="text-[10px] text-gray-400">الوحدة: {unit}</p>
            </div>
        </div>
        <QuantityControl value={value} onChange={onChange} unit={unit} step={unit === 'لتر' ? 10 : 1} />
    </Card>
);

const VetCard: React.FC<{ icon: string, name: string, type: 'vaccine' | 'treatment', onApply: () => void }> = ({ icon, name, type, onApply }) => (
    <Card className={`p-4 flex items-center gap-4 hover:shadow-md transition-all ${type === 'vaccine' ? 'bg-blue-50/50 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">{icon}</div>
        <div className="flex-1">
            <h4 className="font-bold text-black">{name}</h4>
            <p className="text-xs text-gray-500">{type === 'vaccine' ? 'تحصين وقائي' : 'علاج طارئ'}</p>
        </div>
        <div className="flex gap-2">
            <Button size="sm" variant={type === 'vaccine' ? 'primary' : 'secondary'} onClick={onApply}>
                {type === 'vaccine' ? 'تسجيل تحصين' : 'تسجيل علاج'}
            </Button>
        </div>
    </Card>
);

const BreederActiveCycles: React.FC<{
  user: User;
  cycles: Cycle[];
  logs: CycleLog[];
  setLogs: (logs: CycleLog[]) => void;
}> = ({ user, cycles, logs, setLogs }) => {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeLogTab, setActiveLogTab] = useState<'feed' | 'health'>('feed');
  const [currentWeight, setCurrentWeight] = useState<string>('');
  
  // States for feed items
  const [feedItems, setFeedItems] = useState<Record<string, number>>({});
  const [vetItems, setVetItems] = useState<Array<{ name: string, date: string, type: string, note?: string }>>([]);
  const [notes, setNotes] = useState('');

  const activeCycles = cycles.filter(c => c.breederId === user.id && c.status === CycleStatus.ACTIVE);
  const selectedCycle = cycles.find(c => c.id === selectedCycleId);
  const cycleLogs = logs.filter(l => l.cycleId === selectedCycleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddLog = () => {
    if (!selectedCycleId) return;
    
    const feedLines = Object.entries(feedItems)
        .filter(([_, val]) => val > 0)
        .map(([name, val]) => `${name}: ${val}`)
        .join(', ');

    const vetLines = vetItems.map(v => `[${v.type}] ${v.name}`).join(' | ');

    const newLog: CycleLog = { 
        id: Math.random().toString(36).substr(2, 9), 
        cycleId: selectedCycleId, 
        date: new Date().toISOString().split('T')[0], 
        weight: currentWeight ? parseFloat(currentWeight) : undefined, 
        foodDetails: feedLines || "تغذية روتينية", 
        notes: [notes, vetLines].filter(Boolean).join(' | ')
    };
    
    setLogs([newLog, ...logs]);
    setIsLogModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFeedItems({});
    setVetItems([]);
    setCurrentWeight('');
    setNotes('');
    setActiveLogTab('feed');
  };

  const handleUpdateFeed = (name: string, val: number) => {
    setFeedItems(prev => ({ ...prev, [name]: val }));
  };

  const handleApplyVet = (name: string, type: 'vaccine' | 'treatment') => {
    const note = prompt(`ملاحظات إضافية لـ ${name}:`, "");
    setVetItems(prev => [...prev, {
        name,
        type,
        date: new Date().toISOString().split('T')[0],
        note: note || undefined
    }]);
    alert(`تم تسجيل ${type === 'vaccine' ? 'تحصين' : 'علاج'}: ${name}`);
  };

  if (selectedCycle) {
      return (
          <div className="space-y-6">
              <button onClick={() => setSelectedCycleId(null)} className="flex items-center gap-2 text-black opacity-60 hover:opacity-100 transition-opacity"> <ArrowRight size={20}/> رجوع للقائمة </button>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="relative">
                        <img src={selectedCycle.imageUrl} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-gray-50" />
                        <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-lg shadow-lg">
                            <Activity size={14} />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-1 text-black">{selectedCycle.animalType}</h2>
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-gray-400 text-xs flex items-center gap-1"><Calendar size={12}/> البدء: {selectedCycle.startDate}</span>
                            <Badge color="blue">الوزن الحالي: {cycleLogs[0]?.weight || selectedCycle.initialWeight} كجم</Badge>
                        </div>
                    </div>
                  </div>
                  <Button size="lg" onClick={() => setIsLogModalOpen(true)} className="w-full md:w-auto shadow-lg shadow-primary/20"> 
                    <Plus size={20}/> تسجيل تحديث يومي 
                  </Button>
              </div>

              <div className="space-y-4">
                  <h3 className="font-bold text-lg text-black flex items-center gap-2">
                    <History size={20} className="text-primary" /> سجل المتابعة اليومي
                  </h3>
                  <div className="space-y-2">
                    {cycleLogs.map(log => <DailyLogTimelineItem key={log.id} log={log} />)}
                    {cycleLogs.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Clock size={40} className="mx-auto text-gray-200 mb-3" />
                            <p className="text-gray-400">لا توجد سجلات متابعة بعد.</p>
                        </div>
                    )}
                  </div>
              </div>

              <Modal isOpen={isLogModalOpen} onClose={() => {setIsLogModalOpen(false); resetForm();}} title="تحديث يومي جديد">
                  <div className="space-y-6">
                      {/* Weight Card - Unified Experience */}
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                            <Scale size={18} /> الوزن الحالي للرأس (كجم)
                        </label>
                        <input 
                            type="number" 
                            value={currentWeight} 
                            onChange={(e) => setCurrentWeight(e.target.value)} 
                            className="w-full bg-white border-none rounded-xl p-3 text-lg font-bold text-blue-700 shadow-inner focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="مثال: 255"
                        />
                      </div>

                      {/* Tabs */}
                      <div className="flex p-1 bg-gray-100 rounded-2xl">
                        <button 
                            onClick={() => setActiveLogTab('feed')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeLogTab === 'feed' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Wheat size={18} /> التغذية
                        </button>
                        <button 
                            onClick={() => setActiveLogTab('health')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeLogTab === 'health' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Syringe size={18} /> الصحة
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="max-h-[50vh] overflow-y-auto px-1 space-y-6">
                        {activeLogTab === 'feed' ? (
                            <div className="space-y-6 pb-4">
                                <CollapsibleSection title="مركزات الطاقة والبروتين" icon="🌽">
                                    <ItemCard icon="🌽" name="ذرة صفراء مجروشة" unit="كجم" value={feedItems["ذرة صفراء"] || 0} onChange={(v) => handleUpdateFeed("ذرة صفراء", v)} />
                                    <ItemCard icon="🌾" name="شعير" unit="كجم" value={feedItems["شعير"] || 0} onChange={(v) => handleUpdateFeed("شعير", v)} />
                                    <ItemCard icon="🌱" name="فول صويا (كُسب)" unit="كجم" value={feedItems["فول صويا"] || 0} onChange={(v) => handleUpdateFeed("فول صويا", v)} />
                                    <ItemCard icon="🍚" name="ردة (نخالة)" unit="كجم" value={feedItems["ردة"] || 0} onChange={(v) => handleUpdateFeed("ردة", v)} />
                                    <ItemCard icon="🍂" name="نخالة قمح (خشنة)" unit="كجم" value={feedItems["نخالة قمح"] || 0} onChange={(v) => handleUpdateFeed("نخالة قمح", v)} />
                                    <ItemCard icon="⚫" name="بذور قطن" unit="كجم" value={feedItems["بذور قطن"] || 0} onChange={(v) => handleUpdateFeed("بذور قطن", v)} />
                                    <ItemCard icon="🏭" name="علف مركز (جاهز)" unit="كجم" value={feedItems["علف مركز"] || 0} onChange={(v) => handleUpdateFeed("علف مركز", v)} />
                                </CollapsibleSection>

                                <CollapsibleSection title="الأعلاف الخشنة والخضراء" icon="🌿">
                                    <ItemCard icon="🌿" name="علف أخضر برسيم" unit="كجم" value={feedItems["برسيم"] || 0} onChange={(v) => handleUpdateFeed("برسيم", v)} />
                                    <ItemCard icon="🌽📦" name="علف أخضر سيلاج ذرة" unit="طن" value={feedItems["سيلاج"] || 0} onChange={(v) => handleUpdateFeed("سيلاج", v)} />
                                    <ItemCard icon="🌾🟫" name="علف خشن دريس" unit="كجم" value={feedItems["دريس"] || 0} onChange={(v) => handleUpdateFeed("دريس", v)} />
                                    <ItemCard icon="🌾🟡" name="تبن قمح" unit="كجم" value={feedItems["تبن"] || 0} onChange={(v) => handleUpdateFeed("تبن", v)} />
                                    <ItemCard icon="🌾⚪" name="قش أرز" unit="كجم" value={feedItems["قش"] || 0} onChange={(v) => handleUpdateFeed("قش", v)} />
                                </CollapsibleSection>

                                <CollapsibleSection title="الإضافات والمياه" icon="🧂">
                                    <ItemCard icon="🧂" name="ملح طعام" unit="كجم" value={feedItems["ملح"] || 0} onChange={(v) => handleUpdateFeed("ملح", v)} />
                                    <ItemCard icon="🦴" name="كالسيوم (حجر جيري)" unit="كجم" value={feedItems["كالسيوم"] || 0} onChange={(v) => handleUpdateFeed("كالسيوم", v)} />
                                    <ItemCard icon="🧪" name="بيكاربونات صوديوم" unit="كجم" value={feedItems["بيكاربونات"] || 0} onChange={(v) => handleUpdateFeed("بيكاربونات", v)} />
                                    <ItemCard icon="🍞" name="خميرة حية" unit="جرام" value={feedItems["خميرة"] || 0} onChange={(v) => handleUpdateFeed("خميرة", v)} />
                                    <ItemCard icon="💎" name="أملاح معدنية" unit="كجم" value={feedItems["أملاح"] || 0} onChange={(v) => handleUpdateFeed("أملاح", v)} />
                                    <ItemCard icon="🍊" name="فيتامينات (AD3E)" unit="لتر" value={feedItems["فيتامينات"] || 0} onChange={(v) => handleUpdateFeed("فيتامينات", v)} />
                                    <ItemCard icon="💧" name="مياه الشرب" unit="لتر" value={feedItems["مياه"] || 0} onChange={(v) => handleUpdateFeed("مياه", v)} />
                                </CollapsibleSection>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-4">
                                <div className="space-y-3">
                                    <h4 className="font-bold text-black flex items-center gap-2 px-1 text-sm">
                                        <ShieldCheck size={18} className="text-blue-500" /> التحصينات الدورية
                                    </h4>
                                    <VetCard icon="🦠" name="حمى قلاعية (FMD)" type="vaccine" onApply={() => handleApplyVet("حمى قلاعية", "vaccine")} />
                                    <VetCard icon="🦟" name="حمى الوادى المتصدع" type="vaccine" onApply={() => handleApplyVet("حمى الوادى المتصدع", "vaccine")} />
                                    <VetCard icon="🐮🔴" name="جلد عقدى (LSD)" type="vaccine" onApply={() => handleApplyVet("جلد عقدى", "vaccine")} />
                                    <VetCard icon="🩸💀" name="تسمم دموى" type="vaccine" onApply={() => handleApplyVet("تسمم دموى", "vaccine")} />
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-bold text-black flex items-center gap-2 px-1 text-sm">
                                        <Stethoscope size={18} className="text-orange-500" /> العلاجات والطوارئ
                                    </h4>
                                    <VetCard icon="🫁" name="التهاب رئوى (علاج)" type="treatment" onApply={() => handleApplyVet("التهاب رئوى", "treatment")} />
                                    <VetCard icon="🪱" name="مضاد للديدان" type="treatment" onApply={() => handleApplyVet("مضاد للديدان", "treatment")} />
                                    <VetCard icon="🕷️" name="قراد (رش/تغطيس)" type="treatment" onApply={() => handleApplyVet("مكافحة طفيليات خارجية", "treatment")} />
                                    <VetCard icon="🐕" name="جرب (حقن/دهان)" type="treatment" onApply={() => handleApplyVet("علاج جرب", "treatment")} />
                                    <VetCard icon="🛢️" name="زيت برافين (للانتفاخ)" type="treatment" onApply={() => handleApplyVet("زيت برافين", "treatment")} />
                                    <VetCard icon="🥤⚡" name="محلول جفاف" type="treatment" onApply={() => handleApplyVet("محلول جفاف", "treatment")} />
                                </div>
                            </div>
                        )}
                      </div>

                      <div className="space-y-4 pt-4 border-t border-gray-100">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">ملاحظات إضافية</label>
                            <textarea 
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)} 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none h-20 resize-none text-black"
                                placeholder="أي تفاصيل أخرى تود ذكرها عن حالة الحيوانات اليوم..."
                            />
                        </div>
                        <Button 
                            onClick={handleAddLog} 
                            className="w-full py-4 text-lg shadow-xl shadow-primary/20"
                            disabled={Object.values(feedItems).every(v => v === 0) && vetItems.length === 0 && !currentWeight}
                        >
                            حفظ وإرسال التقرير
                        </Button>
                      </div>
                  </div>
              </Modal>
          </div>
      );
  }

  return (
      <div className="space-y-6">
          <h2 className="text-xl font-bold mb-4 text-black">الدورات النشطة (متابعة)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeCycles.map(cycle => (
                  <Card key={cycle.id} className="p-4 flex flex-col gap-4 hover:shadow-lg transition-all border-transparent hover:border-primary/10">
                      <div className="flex items-start gap-4"> 
                        <img src={cycle.imageUrl} className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shadow-sm" /> 
                        <div className="flex-1"> 
                          <h3 className="font-bold text-black text-lg">{cycle.animalType}</h3> 
                          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Clock size={12}/> البدء: {cycle.startDate}</p>
                          <Button size="sm" onClick={() => setSelectedCycleId(cycle.id)} variant="outline">عرض ومتابعة الدورة</Button>
                        </div> 
                      </div>
                  </Card>
              ))}
              {activeCycles.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <Tractor size={48} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-gray-400 font-medium">لا توجد دورات نشطة حالياً.</p>
                </div>
              )}
          </div>
      </div>
  );
};

const BreederDashboard: React.FC<{ user: User; cycles: Cycle[]; setCycles: (cycles: Cycle[]) => void; }> = ({ user, cycles, setCycles }) => {
  const myCycles = cycles.filter(c => c.breederId === user.id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCycle, setNewCycle] = useState<Partial<Cycle>>({ animalType: '', fundingGoal: 0, expectedDuration: 180, description: '' });

  const handleAddCycle = () => {
    const cycle: Cycle = { 
      id: Math.random().toString(36).substr(2, 9), 
      breederId: user.id, 
      status: CycleStatus.PENDING, 
      startDate: new Date().toISOString().split('T')[0], 
      totalHeads: 1, availableHeads: 1, currentFunding: 0, 
      imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 
      healthCertUrl: "#", startPricePerHead: 0, initialWeight: 200, targetWeight: 450,
      ...newCycle as any 
    };
    setCycles([...cycles, cycle]); 
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center"> <h2 className="text-xl font-bold text-black">دوراتي</h2> <Button onClick={() => setIsModalOpen(true)}><Plus size={18}/> إضافة دورة</Button> </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCycles.map(cycle => (
                <Card key={cycle.id} className="overflow-hidden">
                    <img src={cycle.imageUrl} className="w-full h-40 object-cover" />
                    <div className="p-4"> 
                      <h3 className="font-bold text-black">{cycle.animalType}</h3> 
                      <div className="flex justify-between text-xs mt-2"> <span>التمويل المطلوب:</span> <b>{cycle.fundingGoal.toLocaleString()} ج.م</b> </div>
                      <div className="mt-2"><StatusBadge status={cycle.status} type="cycle" /></div>
                    </div>
                </Card>
            ))}
        </div>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة دورة جديدة">
            <div className="space-y-4">
                <Input label="نوع الحيوان" value={newCycle.animalType} onChange={(e) => setNewCycle({...newCycle, animalType: e.target.value})} />
                <Input label="مبلغ التمويل المطلوب (ج.م)" type="number" value={newCycle.fundingGoal} onChange={(e) => setNewCycle({...newCycle, fundingGoal: Number(e.target.value)})} />
                <Input label="مدة الدورة (بالأيام)" type="number" value={newCycle.expectedDuration} onChange={(e) => setNewCycle({...newCycle, expectedDuration: Number(e.target.value)})} />
                <Button className="w-full" onClick={handleAddCycle}>حفظ وإرسال للمراجعة</Button>
            </div>
        </Modal>
    </div>
  );
};

const InvestorPortfolio: React.FC<{
    user: User;
    cycles: Cycle[];
    investments: Investment[];
    logs: CycleLog[];
}> = ({ user, cycles, investments, logs }) => {
    const [selectedCycleForLogs, setSelectedCycleForLogs] = useState<Cycle | null>(null);
    const myInvestments = investments.filter(inv => inv.investorId === user.id);

    if (selectedCycleForLogs) {
        const cycleLogs = logs.filter(l => l.cycleId === selectedCycleForLogs.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return (
            <div className="space-y-6">
                <button onClick={() => setSelectedCycleForLogs(null)} className="flex items-center gap-2 text-black opacity-60"> <ArrowRight size={20}/> رجوع </button>
                <h2 className="text-2xl font-bold text-black">{selectedCycleForLogs.animalType}</h2>
                <div className="space-y-4">
                    {cycleLogs.map(log => <DailyLogTimelineItem key={log.id} log={log} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-black">محفظتي الاستثمارية</h2>
            <div className="space-y-4">
                {myInvestments.map(inv => {
                    const cycle = cycles.find(c => c.id === inv.cycleId);
                    if (!cycle) return null;
                    return (
                        <Card key={inv.id} className="p-4 flex gap-4 items-center">
                            <img src={cycle.imageUrl} className="w-20 h-20 object-cover rounded-lg" />
                            <div className="flex-1">
                                <h3 className="font-bold text-black">{cycle.animalType}</h3>
                                <p className="text-xs text-gray-500">مبلغ الاستثمار: {inv.amount.toLocaleString()} ج.م</p>
                                <div className="mt-2 flex gap-2">
                                  <StatusBadge status={inv.status} />
                                  {inv.status === 'APPROVED' && cycle.status === CycleStatus.ACTIVE && (
                                    <Button size="sm" variant="outline" onClick={() => setSelectedCycleForLogs(cycle)}>متابعة</Button>
                                  )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

const InvestorDashboard: React.FC<{ user: User; cycles: Cycle[]; setCycles: (cycles: Cycle[]) => void; investments: Investment[]; setInvestments: (inv: Investment[]) => void; }> = ({ user, cycles, setCycles, investments, setInvestments }) => {
    const [searchQuery, setSearchQuery] = useState('');
    // Investors can see PENDING cycles to fund them
    const availableCycles = cycles.filter(c => 
      c.status === CycleStatus.PENDING && 
      c.currentFunding < c.fundingGoal &&
      (c.animalType.toLowerCase().includes(searchQuery.toLowerCase()) || 
       c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
    const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
    const [investAmount, setInvestAmount] = useState<string>('');
    const [receiptImage, setReceiptImage] = useState<string | null>(null);

    const handleOpenInvestModal = (cycle: Cycle) => { setSelectedCycle(cycle); setInvestAmount(''); setReceiptImage(null); setIsInvestModalOpen(true); };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; const reader = new FileReader(); reader.onloadend = () => { setReceiptImage(reader.result as string); }; reader.readAsDataURL(file); } };
    
    const handleConfirmInvest = () => {
        if (!selectedCycle) return;
        const amount = parseFloat(investAmount);
        const newInv: Investment = { id: Math.random().toString(), investorId: user.id, cycleId: selectedCycle.id, amount, date: new Date().toISOString(), status: 'PENDING_APPROVAL', headsCount: 1, contractCodes: ['DW-DEMO'], transferReceiptUrl: receiptImage || undefined };
        setInvestments([...investments, newInv]);
        setIsInvestModalOpen(false);
        alert("تم إرسال طلب الاستثمار بنجاح! سيظهر في محفظتك بعد تأكيد المسؤول.");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-black">فرص الاستثمار المتاحة</h2>
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center"> <Search size={18} className="text-gray-400" /> </div>
                    <input type="text" placeholder="ابحث..." className="w-full pr-10 pl-4 py-2 border rounded-xl text-black" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCycles.map(cycle => (
                    <Card key={cycle.id} className="overflow-hidden">
                        <img src={cycle.imageUrl} className="h-40 w-full object-cover" />
                        <div className="p-4 space-y-3">
                            <h3 className="font-bold text-black">{cycle.animalType}</h3>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-primary h-full" style={{ width: `${(cycle.currentFunding/cycle.fundingGoal)*100}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs"> <span>المجمع: {cycle.currentFunding.toLocaleString()}</span> <span>الهدف: {cycle.fundingGoal.toLocaleString()}</span> </div>
                            <Button className="w-full" onClick={() => handleOpenInvestModal(cycle)}>استثمر الآن</Button>
                        </div>
                    </Card>
                ))}
            </div>
            <Modal isOpen={isInvestModalOpen} onClose={() => setIsInvestModalOpen(false)} title="استثمار جديد">
                <div className="space-y-4">
                    <Input label="مبلغ الاستثمار (ج.م)" type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} />
                    <div className="border-2 border-dashed p-4 text-center rounded-xl">
                      <input type="file" onChange={handleImageChange} className="hidden" id="receipt-upload" />
                      <label htmlFor="receipt-upload" className="cursor-pointer text-gray-500"> {receiptImage ? <img src={receiptImage} className="h-20 mx-auto" /> : "اضغط لرفع إيصال التحويل"} </label>
                    </div>
                    <Button className="w-full" onClick={handleConfirmInvest}>تأكيد</Button>
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

  const renderContent = () => {
    if (activeTab === 'profile') return <ProfileView user={currentUser!} onUpdate={(u) => { setUsers(users.map(user => user.id === u.id ? u : user)); setCurrentUser(u); }} />;
    if (activeTab === 'investments') return <InvestorPortfolio user={currentUser!} cycles={cycles} investments={investments} logs={logs} />;
    if (activeTab === 'active_cycles') return <BreederActiveCycles user={currentUser!} cycles={cycles} logs={logs} setLogs={setLogs} />;
    
    switch (currentUser?.role) {
        case UserRole.ADMIN: return <AdminDashboard users={users} setUsers={setUsers} cycles={cycles} setCycles={setCycles} investments={investments} setInvestments={setInvestments} />;
        case UserRole.BREEDER: return <BreederDashboard user={currentUser} cycles={cycles} setCycles={setCycles} />;
        case UserRole.INVESTOR: return <InvestorDashboard user={currentUser} cycles={cycles} setCycles={setCycles} investments={investments} setInvestments={setInvestments} />;
        default: return null;
    }
  };

  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} users={users} setUsers={setUsers} />;

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden" 
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
        )}
        <aside className={`fixed md:sticky top-0 right-0 h-screen w-64 bg-white border-l z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
            <div className="p-6 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary rounded-lg text-white">
                        <Tractor size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-black">منصة دواب</h1>
                </div>
                <button className="md:hidden text-gray-500 hover:bg-gray-100 p-1 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
                    <X size={20}/>
                </button>
            </div>
            <div className="p-4 space-y-2">
                <SidebarItem icon={LayoutDashboard} label="لوحة التحكم" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
                {currentUser.role === UserRole.INVESTOR && <SidebarItem icon={PieChart} label="محفظتي" active={activeTab === 'investments'} onClick={() => { setActiveTab('investments'); setIsMobileMenuOpen(false); }} />}
                {currentUser.role === UserRole.BREEDER && <SidebarItem icon={Activity} label="الدورات النشطة" active={activeTab === 'active_cycles'} onClick={() => { setActiveTab('active_cycles'); setIsMobileMenuOpen(false); }} />}
                <SidebarItem icon={UserCog} label="الملف الشخصي" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsMobileMenuOpen(false); }} />
                <div className="pt-4 border-t border-gray-100">
                    <button onClick={() => setCurrentUser(null)} className="w-full flex gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"> 
                        <LogOut size={20} /> 
                        <span className="font-medium">تسجيل خروج</span> 
                    </button>
                </div>
            </div>
        </aside>
        <main className="flex-1 min-w-0">
            <header className="bg-white border-b p-4 md:hidden flex justify-between items-center sticky top-0 z-30"> 
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <Menu size={24} className="text-gray-600" />
                </button> 
                <span className="font-bold text-black">منصة دواب</span>
                <div className="w-8"></div>
            </header>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">{renderContent()}</div>
        </main>
    </div>
  );
}

export default App;
