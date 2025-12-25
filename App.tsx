
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, LayoutDashboard, Wallet, TrendingUp, History, 
  LogOut, Plus, ChevronRight, MapPin, Search,
  AlertTriangle, DollarSign, Activity, Wheat, CheckCircle, Clock,
  Upload, Camera, Menu, X, Tractor, ShieldCheck, Trash2, Eye,
  Lock, ArrowRight, Banknote, Scale, Shield, Info, PieChart, 
  UserCog, Calendar, ChevronDown, ChevronUp, Syringe, Stethoscope, Droplets, Minus, HeartPulse,
  Play, Zap, Leaf, FlaskConical
} from 'lucide-react';
import { 
  INITIAL_USERS, INITIAL_CYCLES, INITIAL_INVESTMENTS, INITIAL_LOGS
} from './services/mockData';
import { 
  User, UserRole, UserStatus, Cycle, CycleStatus, Investment, CycleLog 
} from './types';
import { Button, Card, Badge, Modal, Input } from './components/UIComponents';

// --- Predefined Feed Items Catalog ---
const FEED_CATALOG: Record<string, { name: string, unit: string, icon: any }[]> = {
  'cow': [
    { name: "علف مركز (16% بروتين)", unit: "كجم", icon: Zap },
    { name: "تبن / قش أرز", unit: "كجم", icon: Leaf },
    { name: "برسيم / دراوة", unit: "كجم", icon: Leaf },
    { name: "سيلاج ذرة", unit: "كجم", icon: Zap },
    { name: "أملاح معدنية", unit: "جم", icon: FlaskConical },
    { name: "فيتامينات (AD3E)", unit: "لتر", icon: Droplets }
  ],
  'sheep': [
    { name: "علف مركز (14% بروتين)", unit: "كجم", icon: Zap },
    { name: "دريس حجازي", unit: "كجم", icon: Leaf },
    { name: "ردة ناعمة (نخالة)", unit: "كجم", icon: Wheat },
    { name: "خميرة حية", unit: "جم", icon: FlaskConical }
  ],
  'general': [
    { name: "مياه شرب", unit: "لتر", icon: Droplets },
    { name: "محلول جفاف", unit: "كيس", icon: FlaskConical }
  ]
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
    <Icon size={20} />
    <span className={`font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
  </button>
);

const StatCard: React.FC<{ 
  title: string, 
  value: string | number, 
  icon: any, 
  color: 'primary' | 'secondary' | 'accent' | 'blue' | 'purple' 
}> = ({ title, value, icon: Icon, color }) => {
  const bgColors = {
    primary: 'bg-green-50 text-green-600',
    secondary: 'bg-orange-50 text-orange-600',
    accent: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <Card className="p-6 flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${bgColors[color]}`}>
        <Icon size={28} />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </Card>
  );
};

const StatusBadge: React.FC<{ status: string; type?: 'user' | 'cycle' }> = ({ status, type }) => {
  const styles: {[key: string]: string} = {
    'ACTIVE': 'bg-green-100 text-green-700 border-green-200',
    'PENDING': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'COMPLETED': 'bg-blue-100 text-blue-700 border-blue-200',
    'REJECTED': 'bg-red-100 text-red-700 border-red-200'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status === 'ACTIVE' ? 'نشط' : status === 'PENDING' ? 'معلق' : status}
    </span>
  );
};

// --- Specialized UI Components for Daily Logs ---

const QuantityControl: React.FC<{ value: number, onChange: (val: number) => void, unit: string }> = ({ value, onChange, unit }) => (
    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
        <button 
            onClick={() => onChange(Math.max(0, value - 1))}
            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-red-500 hover:bg-red-50"
        >
            <Minus size={16} />
        </button>
        <div className="flex-1 text-center font-bold text-black min-w-[50px]">
            {value} <span className="text-[10px] text-gray-400">{unit}</span>
        </div>
        <button 
            onClick={() => onChange(value + 1)}
            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary hover:bg-green-50"
        >
            <Plus size={16} />
        </button>
    </div>
);

const FeedItemCard: React.FC<{ icon: any, name: string, unit: string, value: number, onChange: (v: number) => void }> = ({ icon: Icon, name, unit, value, onChange }) => (
    <Card className="p-3 hover:border-primary/30 transition-all">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-primary">
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-xs text-black leading-tight">{name}</h4>
                <p className="text-[10px] text-gray-400">{unit}</p>
            </div>
        </div>
        <QuantityControl value={value} onChange={onChange} unit={unit} />
    </Card>
);

// --- Login Screen ---
const LoginScreen: React.FC<{ onLogin: (u: User) => void, users: User[], setUsers: any }> = ({ onLogin, users, setUsers }) => {
  const [isReg, setIsReg] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', password: '', role: UserRole.INVESTOR });
  
  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReg) {
      if (users.find(u => u.phone === form.phone)) return alert("رقم الهاتف مسجل مسبقاً");
      const newUser: User = { ...form, id: Math.random().toString(36).substr(2, 9), status: UserStatus.PENDING };
      setUsers([...users, newUser]);
      alert("تم التسجيل بنجاح! بانتظار تفعيل الحساب من قبل الإدارة.");
      setIsReg(false);
    } else {
      const user = users.find(u => u.phone === form.phone && u.password === form.password);
      if (user) {
        if (user.status === UserStatus.PENDING) return alert("حسابك بانتظار تفعيل الإدارة");
        onLogin(user);
      } else alert("بيانات الدخول غير صحيحة");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <Tractor size={48} className="mx-auto text-primary mb-2" />
          <h1 className="text-2xl font-bold text-primary">منصة دواب</h1>
          <p className="text-gray-500 text-sm mt-1">{isReg ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</p>
        </div>
        <form onSubmit={handleAction} className="space-y-4">
          {isReg && <Input label="الاسم الكامل" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />}
          <Input label="رقم الموبايل" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input label="كلمة المرور" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <Button className="w-full py-3" type="submit">{isReg ? 'إنشاء الحساب' : 'دخول'}</Button>
        </form>
        <button onClick={() => setIsReg(!isReg)} className="w-full mt-4 text-sm text-primary underline">
          {isReg ? 'لديك حساب؟ سجل دخولك' : 'ليس لديك حساب؟ اشترك الآن'}
        </button>
      </Card>
    </div>
  );
};

// --- Breeder Components ---

const BreederActiveCycles: React.FC<{
  user: User;
  cycles: Cycle[];
  logs: CycleLog[];
  setLogs: (logs: CycleLog[]) => void;
}> = ({ user, cycles, logs, setLogs }) => {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [feedItems, setFeedItems] = useState<Record<string, number>>({});
  const [currentWeight, setCurrentWeight] = useState('');
  const [notes, setNotes] = useState('');

  const activeCycles = cycles.filter(c => c.breederId === user.id && c.status === CycleStatus.ACTIVE);
  const selectedCycle = cycles.find(c => c.id === selectedCycleId);

  const getCatalog = () => {
    if (!selectedCycle) return [];
    const type = selectedCycle.animalType.includes('خروف') || selectedCycle.animalType.includes('ماعز') ? 'sheep' : 'cow';
    return [...FEED_CATALOG[type], ...FEED_CATALOG.general];
  };

  const handleAddLog = () => {
    if (!selectedCycleId) return;
    const foodDetails = Object.entries(feedItems)
      .filter(([_, val]) => val > 0)
      .map(([name, val]) => `${name}: ${val}`)
      .join(', ');

    const newLog: CycleLog = {
      id: Math.random().toString(36).substr(2, 9),
      cycleId: selectedCycleId,
      date: new Date().toISOString().split('T')[0],
      weight: currentWeight ? parseFloat(currentWeight) : undefined,
      foodDetails: foodDetails || "تغذية روتينية",
      notes: notes
    };
    setLogs([newLog, ...logs]);
    setIsLogModalOpen(false);
    setFeedItems({});
    setCurrentWeight('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4 text-black">متابعة الدورات النشطة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeCycles.map(cycle => (
          <Card key={cycle.id} className="p-4 flex justify-between items-center group">
            <div className="flex gap-4 items-center">
              <img src={cycle.imageUrl} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold text-black">{cycle.animalType}</h3>
                <p className="text-xs text-gray-500">بدأت في: {cycle.startDate}</p>
              </div>
            </div>
            <Button size="sm" onClick={() => { setSelectedCycleId(cycle.id); setIsLogModalOpen(true); }}>تحديث يومي</Button>
          </Card>
        ))}
      </div>

      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title="تسجيل التحديث اليومي">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="الوزن الحالي (كجم)" type="number" value={currentWeight} onChange={e => setCurrentWeight(e.target.value)} />
            <div className="flex flex-col justify-end mb-4">
              <label className="text-xs text-gray-500 mb-1">تاريخ اليوم</label>
              <div className="p-2 bg-gray-50 rounded-lg text-sm border font-bold">{new Date().toLocaleDateString('ar-EG')}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-black flex items-center gap-2">
              <Wheat size={18} className="text-primary" /> اختيار العلف والكميات مسبقة التعريف
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {getCatalog().map((item, idx) => (
                <FeedItemCard 
                  key={idx} 
                  icon={item.icon} 
                  name={item.name} 
                  unit={item.unit} 
                  value={feedItems[item.name] || 0} 
                  onChange={(v) => setFeedItems({...feedItems, [item.name]: v})} 
                />
              ))}
            </div>
          </div>

          <Input label="ملاحظات صحية أو عامة" value={notes} onChange={e => setNotes(e.target.value)} placeholder="مثال: تم إعطاء تحصين الحمى القلاعية..." />
          <Button className="w-full py-4 text-lg" onClick={handleAddLog}>حفظ التقرير وإرساله للأدمن</Button>
        </div>
      </Modal>
    </div>
  );
};

// --- Admin Dashboard ---

const AdminDashboard: React.FC<{ 
  users: User[], setUsers: (u: User[]) => void, 
  cycles: Cycle[], investments: Investment[]
}> = ({ users, setUsers, cycles, investments }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'insurance'>('users');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleUserAction = (id: string, action: 'approve' | 'delete') => {
    if (action === 'approve') {
      setUsers(users.map(u => u.id === id ? { ...u, status: UserStatus.ACTIVE } : u));
    } else {
      setUsers(users.filter(u => u.id !== id));
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b pb-2">
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold ${activeTab === 'users' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>المستخدمين</button>
        <button onClick={() => setActiveTab('insurance')} className={`px-4 py-2 font-bold ${activeTab === 'insurance' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}>صندوق التأمين</button>
      </div>

      {activeTab === 'users' && (
        <Card className="overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4">الاسم</th>
                <th className="p-4">الرقم القومي</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{u.name}</div>
                    <div className="text-xs text-gray-400">{u.phone}</div>
                  </td>
                  <td className="p-4 font-mono">{u.nationalId || '---'}</td>
                  <td className="p-4"><StatusBadge status={u.status} type="user" /></td>
                  <td className="p-4 flex gap-2">
                    {u.status === UserStatus.PENDING && <Button size="sm" onClick={() => handleUserAction(u.id, 'approve')}>تفعيل</Button>}
                    {u.role !== UserRole.ADMIN && <Button size="sm" variant="danger" onClick={() => setUserToDelete(u)}><Trash2 size={14}/></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'insurance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="إجمالي مبالغ التأمين" value="2,450 ج.م" icon={ShieldCheck} color="blue" />
          <StatCard title="رؤوس مؤمن عليها" value="12 رأس" icon={Activity} color="primary" />
        </div>
      )}

      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="تأكيد الحذف">
        <div className="space-y-4 text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500" />
          <p className="font-bold">هل أنت متأكد من حذف المستخدم "{userToDelete?.name}"؟</p>
          <p className="text-xs text-gray-500">لا يمكن التراجع عن هذا الإجراء وسيتم حذف كافة السجلات المرتبطة.</p>
          <div className="flex gap-2 pt-4">
            <Button variant="danger" className="flex-1" onClick={() => handleUserAction(userToDelete!.id, 'delete')}>نعم، حذف نهائي</Button>
            <Button variant="outline" className="flex-1" onClick={() => setUserToDelete(null)}>إلغاء</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- Main App ---

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [cycles, setCycles] = useState<Cycle[]>(INITIAL_CYCLES);
  const [logs, setLogs] = useState<CycleLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) return <LoginScreen onLogin={setCurrentUser} users={users} setUsers={setUsers} />;

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <aside className="w-64 bg-white border-l h-screen sticky top-0 hidden md:block shadow-sm">
        <div className="p-6 border-b flex items-center gap-2 text-primary font-bold">
          <Tractor size={24} /> <span>منصة دواب</span>
        </div>
        <div className="p-4 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="لوحة التحكم" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          {currentUser.role === UserRole.BREEDER && (
            <SidebarItem icon={Activity} label="الدورات النشطة" active={activeTab === 'active_cycles'} onClick={() => setActiveTab('active_cycles')} />
          )}
          <SidebarItem icon={UserCog} label="الملف الشخصي" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <button onClick={() => setCurrentUser(null)} className="w-full mt-10 flex gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <LogOut size={20} /> <span>خروج</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">أهلاً، {currentUser.name}</h1>
            <p className="text-sm text-gray-500">منصة دواب - {currentUser.role === UserRole.ADMIN ? 'إدارة المنصة' : 'لوحة المتابعة'}</p>
          </div>
          <Badge color="blue">{currentUser.role}</Badge>
        </header>
        
        {activeTab === 'dashboard' && currentUser.role === UserRole.ADMIN && (
          <AdminDashboard users={users} setUsers={setUsers} cycles={cycles} investments={INITIAL_INVESTMENTS} />
        )}
        
        {activeTab === 'active_cycles' && currentUser.role === UserRole.BREEDER && (
          <BreederActiveCycles user={currentUser} cycles={cycles} logs={logs} setLogs={setLogs} />
        )}

        {activeTab === 'dashboard' && currentUser.role !== UserRole.ADMIN && (
           <div className="p-10 text-center bg-white rounded-2xl shadow-sm border border-dashed text-gray-400 font-bold">
             الرئيسية قيد التحسين لمستخدمي المنصة...
           </div>
        )}
      </main>
    </div>
  );
}

export default App;
