import React, { useState, useEffect } from 'react';
import { X, Calendar, Syringe, Wheat, CheckCircle, Clock, Pill, Stethoscope, Droplets, Utensils, ChevronDown, ChevronUp, Plus, Minus, Trash2 } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyle = "rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-lg"
  };

  const variants = {
    primary: "bg-primary text-white hover:bg-green-800",
    secondary: "bg-secondary text-white hover:bg-orange-800",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-500 hover:bg-gray-100"
  };

  return (
    <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
    {children}
  </div>
);

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

// --- Modal ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input 
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
      {...props}
    />
  </div>
);

// --- Simple Plan Builder ---
interface PlanBuilderProps {
  animalType: 'cows' | 'sheep';
  onChange: (planText: string) => void;
}

export const SimplePlanBuilder: React.FC<PlanBuilderProps> = ({ animalType, onChange }) => {
  // Helpers to get initial data
  const getInitialStages = (type: 'cows' | 'sheep') => {
    return type === 'cows' 
      ? [
          { name: 'مرحلة التحضين', feed: 4, roughage: 1.5 },
          { name: 'مرحلة النمو', feed: 6, roughage: 2 },
          { name: 'مرحلة التشطيب', feed: 8, roughage: 2.5 }
        ]
      : [
          { name: 'مرحلة الاستقبال', feed: 0.25, roughage: 0.5 },
          { name: 'مرحلة التسمين', feed: 1, roughage: 0.5 },
          { name: 'مرحلة النهاية', feed: 1.5, roughage: 0.5 }
        ];
  };

  const getInitialVacs = (type: 'cows' | 'sheep') => {
    return type === 'cows'
      ? [
          { name: 'حمى قلاعية (FMD)', active: true },
          { name: 'جلد عقدي (LSD)', active: true },
          { name: 'تجريع ديدان (ايفوماك)', active: true }
        ]
      : [
          { name: 'تحصين كلوسترديا', active: true },
          { name: 'تجريع ديدان (البندازول)', active: true },
          { name: 'جدري أغنام', active: false }
        ];
  };

  // Initialize state based on prop. 
  // IMPORTANT: The parent must use key={animalType} to force a remount when type changes.
  const [stages, setStages] = useState(() => getInitialStages(animalType));
  const [vaccines, setVaccines] = useState(() => getInitialVacs(animalType));

  // Update Parent when local state changes
  useEffect(() => {
    let text = `مراحل التغذية المعتمدة:\n`;
    stages.forEach((s, i) => {
      text += `${i + 1}. ${s.name}:\n   - علف مركز: ${s.feed} كجم\n   - مواد خشنة: ${s.roughage} كجم\n`;
    });
    
    text += `\nالبرنامج البيطري والوقائي:\n`;
    const activeVacs = vaccines.filter(v => v.active).map(v => v.name);
    if (activeVacs.length > 0) {
      activeVacs.forEach(v => text += `- ${v}\n`);
    } else {
      text += `- لا يوجد تحصينات إضافية\n`;
    }

    onChange(text);
  }, [stages, vaccines, onChange]);

  const updateStage = (index: number, field: 'feed' | 'roughage', delta: number) => {
    const newStages = [...stages];
    const val = newStages[index][field] + delta;
    if (val >= 0) newStages[index][field] = Number(val.toFixed(2));
    setStages(newStages);
  };

  const toggleVaccine = (index: number) => {
    const newVacs = [...vaccines];
    newVacs[index].active = !newVacs[index].active;
    setVaccines(newVacs);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
          <Utensils size={16}/> كميات العلف اليومية (للرأس)
        </h4>
        {stages.map((stage, idx) => (
          <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col gap-2">
            <div className="font-bold text-green-800 text-sm">{stage.name}</div>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
               <span className="text-xs text-gray-500 w-20">علف مركز</span>
               <div className="flex items-center gap-3">
                  <button type="button" onClick={() => updateStage(idx, 'feed', -0.25)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">-</button>
                  <span className="font-bold w-12 text-center text-sm">{stage.feed}</span>
                  <button type="button" onClick={() => updateStage(idx, 'feed', 0.25)} className="w-6 h-6 rounded bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-700">+</button>
               </div>
               <span className="text-xs text-gray-400">كجم</span>
            </div>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
               <span className="text-xs text-gray-500 w-20">مواد خشنة</span>
               <div className="flex items-center gap-3">
                  <button type="button" onClick={() => updateStage(idx, 'roughage', -0.5)} className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">-</button>
                  <span className="font-bold w-12 text-center text-sm">{stage.roughage}</span>
                  <button type="button" onClick={() => updateStage(idx, 'roughage', 0.5)} className="w-6 h-6 rounded bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-700">+</button>
               </div>
               <span className="text-xs text-gray-400">كجم</span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
          <Syringe size={16}/> التحصينات المطلوبة
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {vaccines.map((vac, idx) => (
            <div 
              key={idx} 
              onClick={() => toggleVaccine(idx)}
              className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${vac.active ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-2">
                {vac.active ? <CheckCircle size={18} className="text-blue-600"/> : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300"></div>}
                <span className={`text-sm ${vac.active ? 'text-blue-800 font-medium' : 'text-gray-500'}`}>{vac.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Fattening Plan Viewer (Display Only) ---
export const FatteningPlanViewer: React.FC<{ planText: string }> = ({ planText }) => {
  if (!planText) return <p className="text-gray-400 italic text-center py-4">لا توجد خطة مسجلة لعرضها.</p>;

  const parts = planText.split(/البرنامج البيطري|البرنامج الوقائي/i);
  const feedingText = parts[0] || '';
  const medicalText = parts[1] || '';

  const feedingLinesRaw = feedingText.split('\n').filter(l => l.trim().length > 0);
  const feedingStages: { title: string, items: string[] }[] = [];
  let currentStage = { title: '', items: [] as string[] };
  
  feedingLinesRaw.forEach(line => {
    if (line.match(/المرحلة|يوم|شهر/) || line.match(/^\d+\./)) {
      if (currentStage.items.length > 0 || currentStage.title) feedingStages.push(currentStage);
      currentStage = { title: line.replace(/^\d+\.|[-•]/, '').trim(), items: [] };
    } else if (!line.includes('جدول') && !line.includes('مراحل التغذية')) {
       currentStage.items.push(line.replace(/^-|•/, '').trim());
    }
  });
  if (currentStage.items.length > 0 || currentStage.title) feedingStages.push(currentStage);

  const medicalLines = medicalText.split('\n').filter(l => l.trim().length > 0).map(l => l.replace(/^-|•/, '').trim());

  return (
    <div className="space-y-6 bg-white rounded-xl">
      <div className="relative border-r-4 border-green-100 mr-2 space-y-6 pr-6">
        {feedingStages.map((stage, idx) => (
            <div key={idx} className="relative">
                <div className="absolute -right-[35px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                <h5 className="font-bold text-green-800 text-sm mb-2">{stage.title}</h5>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
                    {stage.items.map((item, i) => <div key={i}>• {item}</div>)}
                </div>
            </div>
        ))}
      </div>
      
      {medicalLines.length > 0 && (
        <div className="border-t pt-4">
           <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2"><Stethoscope size={16}/> الوقاية والتحصين</h4>
           <div className="grid grid-cols-2 gap-2">
              {medicalLines.map((item, idx) => (
                 <div key={idx} className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg text-xs text-blue-700">
                    <CheckCircle size={12} className="shrink-0"/> {item}
                 </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};