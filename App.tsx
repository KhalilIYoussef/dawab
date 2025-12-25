
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Sprout, LayoutDashboard, Wallet, TrendingUp, History, 
  Settings, LogOut, Plus, FileText, ChevronRight, MapPin, Search,
  AlertTriangle, DollarSign, Activity, Wheat, CheckCircle, Clock,
  Upload, Camera, Utensils, Menu, X, Tractor, ShieldCheck, Ban, Trash2, Eye,
  Lock, ArrowRight, UserPlus, LogIn, FileCheck, FileWarning, Filter, Check, XCircle,
  Banknote, Image as ImageIcon, ClipboardList, Scale, Shield, Info, PieChart, Coins,
  Calculator, ArrowDown, ShoppingBag, Gavel, UserCog, Calendar, ChevronDown, ChevronUp, Syringe, Pill, Stethoscope, Droplets, Minus, HeartPulse,
  Play, Zap, Leaf, FlaskConical, ZoomIn
} from 'lucide-react';
import { 
  INITIAL_USERS, INITIAL_CYCLES, INITIAL_INVESTMENTS, INITIAL_LOGS,
  STANDARD_COW_PLAN, STANDARD_SHEEP_PLAN
} from './services/mockData';
import { 
  User, UserRole, UserStatus, Cycle, CycleStatus, Investment, CycleLog 
} from './types';
import { analyzeCycleRisk } from './