
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Sprout, LayoutDashboard, Wallet, TrendingUp, History, 
  Settings, LogOut, Plus, FileText, ChevronRight, MapPin, Search,
  AlertTriangle, DollarSign, Activity, Wheat, CheckCircle, Clock,
  Upload, Camera, Utensils, Menu, X, Tractor, ShieldCheck, Ban, Trash2, Eye,
  Lock, ArrowRight, UserPlus, LogIn, FileCheck, FileWarning, Filter, Check, XCircle,
  Banknote, Image as ImageIcon, ClipboardList, Scale, Shield, Info, PieChart, Coins,
  Calculator, ArrowDown, ShoppingBag, Gavel, UserCog
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

// Placeholder Logo URL matching the theme (Livestock Investment)
const LOGO_URL = "https://cdn-icons-png.flaticon.com/512/6202/6202865.png";

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
    const { name, phone, password } = formData;

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

    // 4. Password Validation (Complex)
    const hasNumber = /\d/;
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_]/;
    if (password.length < 8 || !hasNumber.test(password) || !hasSymbol.test(password)) {
         setError("كلمة المرور ضعيفة: يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم ورمز خاص (مثل @, #).");
         return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      phone: phone,
      role: formData.role,
      status: UserStatus.PENDING, // ALL REGISTRATIONS ARE PENDING
      documentsVerified: false,
      profilePictureUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
    };

    setUsers([...users, newUser]);
    setIsRegistering(false); // Switch back to login view
    setSuccess('تم إنشاء الحساب بنجاح! حسابك الآن قيد المراجعة، سيقوم المسؤول بتفعيله قريباً.');
    setFormData(prev => ({ ...prev, name: '', role: UserRole.INVESTOR })); // Clear name but keep phone/pass
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex overflow-hidden min-h-[500px]">
        {/* Visual Side */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary text-white p-12 text-center relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80')] opacity-10 bg-cover bg-center"></div>
          <img src={LOGO_URL} alt="Dawab Logo" className="w-40 h-40 mb-6 z-10 object-contain drop-shadow-xl" />
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
             <Input 
                label="رقم الهاتف" 
                value={formData.phone} 
                disabled={!isEditing} 
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={11}
                onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setFormData({...formData, phone: val});
                }} 
             />
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

  // -- Modal State for Adding User (Admin Only) --
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
      name: '',
      phone: '',
      password: '',
      role: UserRole.INVESTOR
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

  // Gemini AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

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

  const handleAddUser = () => {
      // Validation Logic
      const { name, phone, password } = newUserForm;

      // 1. Empty Check
      if(!name || !phone || !password) {
          alert("يرجى ملء جميع الحقول");
          return;
      }

      // 2. Name Validation (Letters and spaces only)
      // Regex allows Arabic range, English letters, and spaces.
      const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
      if (!nameRegex.test(name)) {
          alert("خطأ في الاسم: يجب أن يحتوي الاسم على أحرف فقط (دون أرقام أو رموز).");
          return;
      }

      // 3. Phone Validation (Exactly 11 digits)
      const phoneRegex = /^\d{11}$/;
      if (!phoneRegex.test(phone)) {
          alert("خطأ في رقم الهاتف: يجب أن يتكون من 11 رقم بالضبط.");
          return;
      }

      // 4. Password Validation (Complex: Numbers + Symbols)
      const hasNumber = /\d/;
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>\-_]/;
      if (password.length < 8 || !hasNumber.test(password) || !hasSymbol.test(password)) {
           alert("خطأ في كلمة المرور: يجب أن تكون 8 أحرف على الأقل وتحتوي على رقم ورمز خاص (مثل @, #, $).");
           return;
      }

      // 5. Duplicate Check
      if (users.some(u => u.phone === phone)) {
        alert('رقم الهاتف مسجل بالفعل.');
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        phone: phone,
        role: newUserForm.role,
        status: UserStatus.ACTIVE, // Admin added users are active by default
        documentsVerified: false,
        profilePictureUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
      };

      setUsers([...users, newUser]);
      setAddUserModalOpen(false);
      setNewUserForm({ name: '', phone: '', password: '', role: UserRole.INVESTOR });
      setSuccessModal({ isOpen: true, message: 'تم إضافة المستخدم الجديد بنجاح.' });
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

  const handleAnalyzeCycle = async () => {
    if (!detailsModal.cycle) return;
    setLoadingAi(true);
    setAiAnalysis(""); // clear previous
    try {
        const result = await analyzeCycleRisk(detailsModal.cycle);
        setAiAnalysis(result);
    } catch(e) {
        setAiAnalysis("فشل التحليل");
    }
    setLoadingAi(false);
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
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h2>
            <Button onClick={() => setAddUserModalOpen(true)}>
                <Plus size={18} />
                إضافة مستخدم جديد
            </Button>
        </div>
        
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
                        <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-2xl text-center">
                            <p className="text-gray-600 mb-2 font-medium">إجمالي المبالغ المدفوعة</p>
                            <p className="text-4xl font-bold text-gray-900">{totalGross.toLocaleString()} <span className="text-lg text-gray-500 font-normal">ج.م</span></p>
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
                        <div className="bg-white border border-green-200 shadow-sm p-6 rounded-2xl text-center">
                            <p className="text-green-700 mb-2 font-medium">صافي أرباح المنصة</p>
                            <p className="text-4xl font-bold text-green-800">{totalRevenue.toLocaleString()} <span className="text-lg text-green-600 font-normal">ج.م</span></p>
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
                        <div className="bg-white border border-blue-200 shadow-sm p-6 rounded-2xl text-center">
                            <p className="text-blue-700 mb-2 font-medium">محفظة التأمين المجمعة</p>
                            <p className="text-4xl font-bold text-blue-800">{totalInsurancePool.toLocaleString()} <span className="text-lg text-blue-600 font-normal">ج.م</span></p>
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
                         <div className="bg-white border border-purple-200 shadow-sm p-6 rounded-2xl text-center">
                            <p className="text-purple-700 mb-2 font-medium">صافي رأس المال المستثمر</p>
                            <p className="text-4xl font-bold text-purple-900">{netCapitalDeployed.toLocaleString()} <span className="text-lg text-purple-600 font-normal">ج.م</span></p>
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
    const myCycles = cycles.filter(c => c.breederId === currentUser?.id);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">إدارة مزرعتي</h2>
            <Button onClick={() => setCreateModalOpen(true)}>
                <Plus size={18} />
                دورة جديدة
            </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <StatCard title="الدورات النشطة" value={myCycles.filter(c => c.status === CycleStatus.ACTIVE).length} icon={Sprout} color="primary" />
             <StatCard title="إجمالي التمويل" value={`${myCycles.reduce((acc, c) => acc + c.currentFunding, 0).toLocaleString()} ج.م`} icon={DollarSign} color="secondary" />
             <StatCard title="تقييم المزرعة" value={currentUser?.rating || '4.8'} icon={Activity} color="accent" />
        </div>

        {/* Cycles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCycles.map(cycle => (
                <Card key={cycle.id} className="overflow-hidden flex flex-col">
                    <div className="h-48 relative">
                        <img src={cycle.imageUrl} alt={cycle.animalType} className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4">
                             <StatusBadge status={cycle.status} type="cycle" />
                        </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                         <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-lg text-gray-800">{cycle.animalType}</h3>
                             <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">{cycle.initialWeight} -> {cycle.targetWeight} كجم</span>
                         </div>
                         <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">التمويل: {Math.round((cycle.currentFunding/cycle.fundingGoal)*100)}%</span>
                                <span className="font-bold">{cycle.currentFunding.toLocaleString()} / {cycle.fundingGoal.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(cycle.currentFunding/cycle.fundingGoal)*100}%` }}></div>
                            </div>
                         </div>
                         
                         <div className="mt-auto flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDetailsModal({isOpen: true, cycle}); setAiAnalysis(""); }}>التفاصيل</Button>
                            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setLogsModal({isOpen: true, cycle})}>سجل المتابعة</Button>
                         </div>
                    </div>
                </Card>
            ))}
        </div>
      </div>
    );
  };

  const renderInvestorDashboard = () => {
    // Show active cycles for investment
    const opportunities = cycles.filter(c => c.status === CycleStatus.ACTIVE);
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">فرص الاستثمار المتاحة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {opportunities.map(cycle => {
                    const breeder = users.find(u => u.id === cycle.breederId);
                    const percent = Math.min(100, Math.round((cycle.currentFunding / cycle.fundingGoal) * 100));
                    return (
                        <Card key={cycle.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                            <div className="h-56 relative group">
                                <img src={cycle.imageUrl} alt={cycle.animalType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-4 right-4 text-white">
                                    <p className="font-bold text-lg">{cycle.animalType}</p>
                                    <p className="text-sm opacity-90">{breeder?.name}</p>
                                </div>
                                {cycle.insurancePolicyNumber && (
                                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                                        <ShieldCheck size={14} /> مؤمن
                                    </div>
                                )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">مدة الدورة</span>
                                        <span className="font-bold text-gray-800">{cycle.expectedDuration} يوم</span>
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-500">العائد المتوقع</span>
                                        <span className="font-bold text-green-600">~15-20%</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">تم جمع</span>
                                        <span className="font-bold">{percent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-primary h-2 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">المستهدف: {cycle.fundingGoal.toLocaleString()} ج.م</p>
                                </div>

                                <div className="mt-auto flex gap-2">
                                  <Button 
                                      className="flex-1" 
                                      onClick={() => openInvestModal(cycle.id, 5000)} // Default amount for quick action, or open empty
                                      disabled={percent >= 100}
                                  >
                                      {percent >= 100 ? 'اكتمل التمويل' : 'استثمر الآن'}
                                  </Button>
                                  <Button variant="outline" onClick={() => { setDetailsModal({isOpen: true, cycle}); setAiAnalysis(""); }}>
                                      <Eye size={18} />
                                  </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
  };
  
  const renderInvestorPortfolio = () => {
      const myInvestments = investments.filter(inv => inv.investorId === currentUser?.id);
      return (
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">محفظتي الاستثمارية</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <StatCard title="إجمالي الاستثمار" value={`${myInvestments.reduce((acc, i) => acc + i.amount, 0).toLocaleString()} ج.م`} icon={Wallet} color="primary" />
                 <StatCard title="عدد العقود" value={myInvestments.length} icon={FileText} color="blue" />
                 <StatCard title="الأرباح المتوقعة" value={`${(myInvestments.reduce((acc, i) => acc + i.amount, 0) * 0.15).toLocaleString()} ج.م`} icon={TrendingUp} color="secondary" />
              </div>

              <Card>
                  <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                          <tr>
                              <th className="text-right p-4 text-sm text-gray-500">الدورة</th>
                              <th className="text-right p-4 text-sm text-gray-500">المبلغ</th>
                              <th className="text-right p-4 text-sm text-gray-500">التاريخ</th>
                              <th className="text-right p-4 text-sm text-gray-500">الحالة</th>
                              <th className="text-right p-4 text-sm text-gray-500">التأمين</th>
                          </tr>
                      </thead>
                      <tbody>
                          {myInvestments.map(inv => {
                              const cycle = cycles.find(c => c.id === inv.cycleId);
                              return (
                                  <tr key={inv.id} className="border-b hover:bg-gray-50">
                                      <td className="p-4 font-bold text-gray-800">{cycle?.animalType}</td>
                                      <td className="p-4 font-bold text-green-700">{inv.amount.toLocaleString()} ج.م</td>
                                      <td className="p-4 text-gray-500">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                                      <td className="p-4"><StatusBadge status={inv.status} /></td>
                                      <td className="p-4">
                                          {(inv.hasAnimalInsurance || cycle?.insurancePolicyNumber) ? (
                                              <span className="text-blue-600 flex items-center gap-1 text-xs font-bold"><ShieldCheck size={14}/> مؤمن</span>
                                          ) : (
                                              <span className="text-gray-400 text-xs">غير مؤمن</span>
                                          )}
                                      </td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </Card>
          </div>
      )
  }

  if (!currentUser) {
      return <LoginScreen onLogin={(user) => { setCurrentUser(user); setActiveTab('dashboard'); }} users={users} setUsers={setUsers} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-right" dir="rtl">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 right-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:static md:shadow-none border-l`}>
             <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain" />
                <h1 className="text-xl font-bold text-green-800">منصة دواب</h1>
                <button onClick={() => setSidebarOpen(false)} className="mr-auto md:hidden text-gray-500"><X size={20}/></button>
             </div>
             
             <div className="p-4 space-y-2">
                <SidebarItem icon={LayoutDashboard} label="الرئيسية" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} />
                
                {currentUser.role === UserRole.ADMIN && (
                    <>
                        <SidebarItem icon={Users} label="المستخدمين" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} />
                        <SidebarItem icon={Sprout} label="الدورات" active={activeTab === 'cycles'} onClick={() => { setActiveTab('cycles'); setSidebarOpen(false); }} />
                        <SidebarItem icon={Wallet} label="المالية" active={activeTab === 'financials'} onClick={() => { setActiveTab('financials'); setSidebarOpen(false); }} />
                    </>
                )}

                {currentUser.role === UserRole.BREEDER && (
                     <SidebarItem icon={Sprout} label="دوراتي" active={activeTab === 'my-cycles'} onClick={() => { setActiveTab('my-cycles'); setSidebarOpen(false); }} />
                )}

                {currentUser.role === UserRole.INVESTOR && (
                    <>
                        <SidebarItem icon={TrendingUp} label="فرص الاستثمار" active={activeTab === 'opportunities'} onClick={() => { setActiveTab('opportunities'); setSidebarOpen(false); }} />
                        <SidebarItem icon={PieChart} label="محفظتي" active={activeTab === 'portfolio'} onClick={() => { setActiveTab('portfolio'); setSidebarOpen(false); }} />
                    </>
                )}

                <SidebarItem icon={UserCog} label="الملف الشخصي" active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }} />

                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-8">
                    <LogOut size={20} />
                    <span>تسجيل الخروج</span>
                </button>
             </div>
        </aside>

        {/* Overlay */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
             <header className="bg-white border-b p-4 flex justify-between items-center md:hidden">
                <div className="flex items-center gap-2">
                    <img src={LOGO_URL} alt="" className="w-8 h-8" />
                    <span className="font-bold">دواب</span>
                </div>
                <button onClick={() => setSidebarOpen(true)} className="p-2 bg-gray-100 rounded-lg"><Menu size={24}/></button>
             </header>

             <div className="flex-1 overflow-y-auto p-4 md:p-8">
                  {activeTab === 'profile' ? (
                      <ProfileView user={currentUser} onUpdate={handleUpdateProfile} />
                  ) : (
                      <>
                        {currentUser.role === UserRole.ADMIN && (
                            <>
                                {activeTab === 'dashboard' && renderAdminDashboard()}
                                {activeTab === 'users' && renderAdminUsers()}
                                {activeTab === 'cycles' && renderAdminCycles()}
                                {activeTab === 'financials' && renderAdminInvestments()}
                            </>
                        )}
                        {currentUser.role === UserRole.BREEDER && (
                            <>
                                {activeTab === 'dashboard' && renderBreederDashboard()}
                                {activeTab === 'my-cycles' && renderBreederDashboard()}
                            </>
                        )}
                        {currentUser.role === UserRole.INVESTOR && (
                            <>
                                {activeTab === 'dashboard' && renderInvestorDashboard()}
                                {activeTab === 'opportunities' && renderInvestorDashboard()}
                                {activeTab === 'portfolio' && renderInvestorPortfolio()}
                            </>
                        )}
                      </>
                  )}
             </div>
        </main>

        {/* --- Modals Section --- */}

        {/* 1. Add User (Admin) */}
        <Modal isOpen={isAddUserModalOpen} onClose={() => setAddUserModalOpen(false)} title="إضافة مستخدم جديد">
            <div className="space-y-4">
                <Input label="الاسم" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} placeholder="الاسم ثلاثي" />
                <Input label="رقم الهاتف" value={newUserForm.phone} onChange={e => setNewUserForm({...newUserForm, phone: e.target.value})} placeholder="01xxxxxxxxx" maxLength={11} />
                <Input label="كلمة المرور" type="password" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع الحساب</label>
                    <select 
                        className="w-full p-2 border rounded-lg bg-white"
                        value={newUserForm.role}
                        onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value as UserRole})}
                    >
                        <option value={UserRole.INVESTOR}>مستثمر</option>
                        <option value={UserRole.BREEDER}>مربي</option>
                        <option value={UserRole.ADMIN}>مدير (Admin)</option>
                    </select>
                </div>

                <Button onClick={handleAddUser} className="w-full mt-4">إضافة المستخدم</Button>
            </div>
        </Modal>

        {/* 2. Success Modal */}
        <Modal isOpen={successModal.isOpen} onClose={() => setSuccessModal({...successModal, isOpen: false})} title="عملية ناجحة">
            <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <p className="text-gray-700 font-medium whitespace-pre-line leading-relaxed">{successModal.message}</p>
                <Button onClick={() => setSuccessModal({...successModal, isOpen: false})} className="w-full mt-6">حسناً</Button>
            </div>
        </Modal>

        {/* 3. Create Cycle Modal (Breeder) */}
        <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="تسجيل دورة جديدة">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">نوع الحيوان</label>
                        <select 
                            className="w-full border rounded-lg p-2"
                            value={breederForm.animalType}
                            onChange={(e) => setBreederForm({...breederForm, animalType: e.target.value as any})}
                        >
                            <option value="cows">عجول تسمين</option>
                            <option value="sheep">أغنام (خراف)</option>
                        </select>
                    </div>
                    <Input label="العدد (رؤوس)" value="1" disabled className="bg-gray-100" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="الوزن الحالي (كجم)" type="number" value={breederForm.initialWeight} onChange={e => setBreederForm({...breederForm, initialWeight: Number(e.target.value)})} />
                    <Input label="الوزن المستهدف (كجم)" type="number" value={breederForm.targetWeight} onChange={e => setBreederForm({...breederForm, targetWeight: Number(e.target.value)})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input label="سعر البدء (شراء + مصاريف)" type="number" value={breederForm.startPricePerHead} onChange={e => setBreederForm({...breederForm, startPricePerHead: Number(e.target.value)})} />
                    <Input label="مدة الدورة (يوم)" type="number" value={breederForm.expectedDuration} onChange={e => setBreederForm({...breederForm, expectedDuration: Number(e.target.value)})} />
                </div>

                <Input label="وصف الدورة (السلالة، المصدر..)" value={breederForm.description} onChange={e => setBreederForm({...breederForm, description: e.target.value})} />

                <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-bold text-sm mb-3">خطة التغذية والرعاية</h4>
                    <SimplePlanBuilder 
                        key={breederForm.animalType} // Force reset when animal type changes
                        animalType={breederForm.animalType as 'cows'|'sheep'}
                        onChange={handlePlanChange}
                    />
                </div>

                <div className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setBreederForm(prev => ({...prev, isInsured: !prev.isInsured}))}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${breederForm.isInsured ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}>
                        {breederForm.isInsured && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-sm font-medium">طلب تأمين شامل على الدورة (يخصم من الأرباح)</span>
                </div>

                <Button onClick={handleBreederCreateCycle} className="w-full">إرسال للمراجعة</Button>
            </div>
        </Modal>
        
        {/* 4. Cycle Details Modal */}
        <Modal isOpen={detailsModal.isOpen} onClose={() => setDetailsModal({...detailsModal, isOpen: false})} title="تفاصيل الدورة">
            {detailsModal.cycle && (
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <img src={detailsModal.cycle.imageUrl} className="w-24 h-24 rounded-lg object-cover" alt="" />
                        <div>
                            <h3 className="font-bold text-lg">{detailsModal.cycle.animalType}</h3>
                            <p className="text-sm text-gray-500">{detailsModal.cycle.description}</p>
                            <StatusBadge status={detailsModal.cycle.status} />
                        </div>
                    </div>

                    {/* Gemini AI Analysis Section */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div> تحليل الذكاء الاصطناعي (Gemini)</h4>
                            <Button size="sm" variant="ghost" onClick={handleAnalyzeCycle} disabled={loadingAi}>
                                {loadingAi ? 'جاري التحليل...' : 'طلب تحليل المخاطر'}
                            </Button>
                        </div>
                        {aiAnalysis && (
                            <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-900 leading-relaxed border border-purple-100">
                                {aiAnalysis}
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <h4 className="font-bold border-b pb-2 mb-3">خطة التسمين</h4>
                        <FatteningPlanViewer planText={detailsModal.cycle.fatteningPlan || ''} />
                    </div>

                    <div className="bg-gray-100 p-3 rounded-lg text-sm space-y-2">
                        <div className="flex justify-between">
                            <span>الوزن الابتدائي:</span>
                            <span className="font-bold">{detailsModal.cycle.initialWeight} كجم</span>
                        </div>
                         <div className="flex justify-between">
                            <span>الهدف:</span>
                            <span className="font-bold">{detailsModal.cycle.targetWeight} كجم</span>
                        </div>
                    </div>
                </div>
            )}
        </Modal>

        {/* 5. Logs Modal */}
        <Modal isOpen={logsModal.isOpen} onClose={() => setLogsModal({...logsModal, isOpen: false})} title="سجل المتابعة الدورية">
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 border">
                    <h4 className="font-bold text-sm text-gray-700">إضافة تحديث جديد</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="الوزن الحالي (كجم)" type="number" value={logForm.weight} onChange={e => setLogForm({...logForm, weight: e.target.value})} />
                        <Input label="نوع العلف / الكمية" value={logForm.food} onChange={e => setLogForm({...logForm, food: e.target.value})} />
                    </div>
                    <Input label="ملاحظات صحية / عامة" value={logForm.notes} onChange={e => setLogForm({...logForm, notes: e.target.value})} />
                    <Button size="sm" onClick={handleSaveLog}>حفظ التحديث</Button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {logs.filter(l => l.cycleId === logsModal.cycle?.id).map(log => (
                        <div key={log.id} className="border-r-2 border-primary pr-3 mr-1 relative">
                             <div className="absolute -right-[5px] top-0 w-2 h-2 rounded-full bg-primary"></div>
                             <p className="text-xs text-gray-400">{new Date(log.date).toLocaleDateString('ar-EG')}</p>
                             <p className="font-bold text-sm text-gray-800">الوزن: {log.weight} كجم</p>
                             <p className="text-sm text-gray-600">{log.foodDetails}</p>
                             {log.notes && <p className="text-xs text-gray-500 bg-yellow-50 p-1 rounded mt-1">{log.notes}</p>}
                        </div>
                    ))}
                    {logs.filter(l => l.cycleId === logsModal.cycle?.id).length === 0 && <p className="text-center text-gray-400 text-sm">لا توجد سجلات سابقة</p>}
                </div>
            </div>
        </Modal>

        {/* 6. Invest Modal */}
        <Modal isOpen={investModal.isOpen} onClose={() => setInvestModal({...investModal, isOpen: false})} title="تأكيد الاستثمار">
            {investModal.cycle && (
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2">ملخص الطلب</h4>
                        <div className="flex justify-between text-sm mb-1">
                            <span>الدورة:</span>
                            <span className="font-bold">{investModal.cycle.animalType}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>قيمة الاستثمار:</span>
                            <span className="font-bold">{investModal.amount.toLocaleString()} ج.م</span>
                        </div>
                        <div className="flex justify-between text-sm text-red-600 mt-2 border-t border-blue-200 pt-2">
                             <span>رسوم المنصة ({PLATFORM_FEE_PERCENT*100}%):</span>
                             <span>-{(investModal.amount * PLATFORM_FEE_PERCENT).toLocaleString()} ج.م</span>
                        </div>
                        {(investModal.wantsInsurance || investModal.cycle.insurancePolicyNumber) && (
                            <div className="flex justify-between text-sm text-red-600">
                                <span>رسوم التأمين ({INSURANCE_FEE_PERCENT*100}%):</span>
                                <span>-{(investModal.amount * INSURANCE_FEE_PERCENT).toLocaleString()} ج.م</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-blue-200 text-green-700">
                             <span>الصافي المستثمر في الدورة:</span>
                             <span>{(investModal.amount - (investModal.amount * PLATFORM_FEE_PERCENT) - ((investModal.wantsInsurance || investModal.cycle.insurancePolicyNumber) ? investModal.amount * INSURANCE_FEE_PERCENT : 0)).toLocaleString()} ج.م</span>
                        </div>
                    </div>

                    {!investModal.cycle.insurancePolicyNumber && (
                        <div 
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${investModal.wantsInsurance ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setInvestModal(prev => ({...prev, wantsInsurance: !prev.wantsInsurance}))}
                        >
                            <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center ${investModal.wantsInsurance ? 'bg-green-600 border-green-600' : 'bg-white border-gray-400'}`}>
                                {investModal.wantsInsurance && <Check size={14} className="text-white"/>}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-gray-800 flex items-center gap-1"><ShieldCheck size={16}/> إضافة تأمين على الحياة (اختياري)</p>
                                <p className="text-xs text-gray-500">يضمن لك استرداد رأس المال في حالة نفوق الحيوان لا قدر الله. (تكلفة 3%)</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-sm font-medium">إرفاق إيصال التحويل البنكي</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                            <input type="file" accept="image/*" onChange={handleReceiptFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            {investModal.receiptFile ? (
                                <div className="text-green-600 flex flex-col items-center">
                                    <CheckCircle size={32} className="mb-2"/>
                                    <span className="text-sm font-bold">{investModal.receiptFile.name}</span>
                                </div>
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center">
                                    <Upload size={32} className="mb-2"/>
                                    <span className="text-sm">اضغط لرفع صورة الإيصال</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 flex gap-2">
                        <Info size={16} className="shrink-0" />
                        <p>بإتمام هذه العملية، أنت توافق على شروط الاستثمار وسياسة المخاطر الخاصة بالمنصة.</p>
                    </div>

                    <Button onClick={submitInvestment} className="w-full" disabled={!investModal.receiptFile}>تأكيد وإرسال الطلب</Button>
                </div>
            )}
        </Modal>

        {/* 7. End Cycle Modal (Admin) */}
        <Modal isOpen={endCycleModal.isOpen} onClose={() => setEndCycleModal({...endCycleModal, isOpen: false})} title="إنهاء الدورة وبيع القطيع">
            <div className="space-y-4">
                 <p className="text-gray-600 text-sm">أنت بصدد إنهاء الدورة <span className="font-bold text-black">{endCycleModal.cycle?.animalType}</span> وتسجيل عملية البيع النهائية.</p>
                 <Input 
                    label="سعر البيع النهائي (الإجمالي)" 
                    type="number" 
                    value={endCycleModal.salePrice} 
                    onChange={e => setEndCycleModal({...endCycleModal, salePrice: e.target.value})} 
                    placeholder="مثال: 45000"
                 />
                 <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm flex gap-2 items-center">
                    <AlertTriangle size={18} />
                    <span>لا يمكن التراجع عن هذه العملية بعد التأكيد.</span>
                 </div>
                 <Button variant="danger" onClick={confirmEndCycle} className="w-full">تأكيد البيع وإنهاء الدورة</Button>
            </div>
        </Modal>

    </div>
  );
}
