import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Plus, 
  Trash2, 
  Settings, 
  Droplet, 
  FileText, 
  LayoutDashboard, 
  User, 
  Users, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  Sun, 
  CloudRain, 
  Database, 
  LogOut, 
  Camera, 
  Calendar, 
  Send, 
  Share2, 
  HelpCircle, 
  CheckCircle, 
  MessageSquare, 
  AlertTriangle, 
  Globe, 
  RefreshCw, 
  Eye, 
  Map, 
  Activity, 
  Flame, 
  ShieldCheck, 
  ChevronRight,
  Sparkle,
  X
} from 'lucide-react';

import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

import SoilMoistureGrid from './components/SoilMoistureGrid';
import AdBanner from './components/AdBanner';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import AppGuideWidget from './components/AppGuideWidget';
import ConfirmationModal from './components/ConfirmationModal';

import { 
  predictIrrigation, 
  censorText, 
  ALL_PLANTS, 
  PLANT_LIBRARY, 
  calculatePlantStage 
} from './data';

import { 
  db, 
  auth as fbAuth, 
  onAuthStateChanged, 
  signOut as fbSignOut 
} from './lib/firebase';

import { 
  LanguageProvider, 
  useTranslation, 
  Language 
} from './lib/i18n';

import { Field, Crop, User as UserType } from './types';

// Wrap App in LanguageProvider so children can access translation context safely
export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

// Sample mock leaf images for diagnosis scan
const MOCK_LEAF_IMAGES = [
  { id: 'leaf-tomato-healthy', name: 'Domates - Sağlıklı Yaprak', url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=300', crop: 'Domates', type: 'Sağlıklı' },
  { id: 'leaf-tomato-mold', name: 'Domates - Yaprak Küfü (Mildiyö)', url: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=300', crop: 'Domates', type: 'Yaprak Küfü' },
  { id: 'leaf-pepper-pest', name: 'Biber - Kırmızı Örümcek Hasarı', url: 'https://images.unsplash.com/photo-1600853926898-69198a3a30c3?auto=format&fit=crop&q=80&w=300', crop: 'Biber', type: 'Haşere Zararı' },
  { id: 'leaf-wheat-rust', name: 'Buğday - Kahverengi Pas Hastalığı', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300', crop: 'Buğday', type: 'Pas Hastalığı' },
];

function AppContent() {
  const { t, language, setLanguage } = useTranslation();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('proagri_logged_in') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('proagri_user_email') || '';
  });
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('proagri_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    return localStorage.getItem('proagri_hide_landing') !== 'true';
  });
  const [authView, setAuthView] = useState<boolean>(false);

  // Focus Mode State (Hides ads/alerts for premium clean UI)
  const [focusMode, setFocusMode] = useState<boolean>(() => {
    return localStorage.getItem('proagri_focus_mode') === 'true';
  });
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);

  // App Layout Collapse State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'analiz' | 'asistan' | 'gubre' | 'saglik' | 'pazar' | 'kooperatif' | 'harita' | 'kayitlar' | 'tumkodlar'>('analiz');

  // Application Data States (Fields, Crops, Logs, Cooperatives)
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [activeField, setActiveField] = useState<Field | null>(null);
  const [activeCrop, setActiveCrop] = useState<Crop | null>(null);

  // Logs / Activities Diary
  const [activities, setActivities] = useState<{
    id: string;
    fieldId: string;
    cropId: string;
    type: 'Sulama' | 'Gübreleme' | 'İlaçlama' | 'Hasat' | 'Gözlem';
    notes: string;
    date: string;
    operator: string;
  }[]>([]);

  // Cooperative Forum posts
  const [cooperativePosts, setCooperativePosts] = useState<{
    id: string;
    author: string;
    title: string;
    content: string;
    date: string;
    likes: number;
    replies: number;
    category: 'Girdi Alımı' | 'Ekipman' | 'Saha Yardımlaşma' | 'Fiyat Tartışma';
  }[]>([]);

  // Initial user accounts registry
  const [userAccounts, setUserAccounts] = useState<{ [email: string]: UserType & { passwordHash: string } }>({
    'hilmiselimsen@gmail.com': {
      id: 'usr-1',
      name: 'Hilmi Selim Şen',
      email: 'hilmiselimsen@gmail.com',
      passwordHash: '12345678',
      notificationPermission: true,
      cooperatives: { 'Bursa': true },
      role: 'Premium Çiftçi',
      age: 46,
      phone: '05321234567',
      experienceYears: 24,
      avatar: 'farmer_m1',
      city: 'Bursa',
      district: 'Nilüfer',
      certNo: 'CKS-421098-2026',
      landSize: 45,
      mainCrop: 'Domates'
    }
  });

  // Loading indicator
  const [appLoading, setAppLoading] = useState(false);

  // Forms states - NO pre-filled values to prevent automatic entry
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldCity, setNewFieldCity] = useState('');
  const [newFieldDistrict, setNewFieldDistrict] = useState('');
  const [newFieldArea, setNewFieldArea] = useState('');
  const [newFieldSoil, setNewFieldSoil] = useState<'Tınlı' | 'Kumlu' | 'Killi'>('Tınlı');

  // Crop form states - NO pre-filled values
  const [newCropName, setNewCropName] = useState('');
  const [newCropArea, setNewCropArea] = useState('');
  const [newCropSowingDate, setNewCropSowingDate] = useState('');
  const [newCropFieldId, setNewCropFieldId] = useState('');

  // Sowing activity form - NO pre-filled values
  const [newLogType, setNewLogType] = useState<'Sulama' | 'Gübreleme' | 'İlaçlama' | 'Hasat' | 'Gözlem'>('Sulama');
  const [newLogNotes, setNewLogNotes] = useState('');

  // Cooperative Post form - NO pre-filled values
  const [newPostCategory, setNewPostCategory] = useState<'Girdi Alımı' | 'Ekipman' | 'Saha Yardımlaşma' | 'Fiyat Tartışma'>('Girdi Alımı');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  
  // Interactive Cooperative states
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [selectedPostIdForReplies, setSelectedPostIdForReplies] = useState<string | null>(null);
  const [newReplyText, setNewReplyText] = useState('');
  const [postReplies, setPostReplies] = useState<{[key: string]: {author: string, text: string, date: string}[]}>({
    'post-1': [
      { author: 'Mehmet Yılmaz', text: 'Ben 5 torba alırım Hilmi abi.', date: 'Dün' },
      { author: 'Can Demir', text: 'Fiyatı ton başına ne kadar olacak?', date: 'Dün' }
    ],
    'post-2': [
      { author: 'Süleyman Öztürk', text: 'Karacabeyde bende biçerdöver var, haftaya müsaittim.', date: '2 gün önce' }
    ]
  });

  // Smart Irrigation input simulator
  const [simTemp, setSimTemp] = useState<number>(28);
  const [simHumidity, setSimHumidity] = useState<number>(55);
  const [simDaysAgo, setSimDaysAgo] = useState<number>(3);
  const [simFutureRain, setSimFutureRain] = useState<number>(0);
  const [irrigationResult, setIrrigationResult] = useState<any>(null);

  // Leaf Disease AI scanner
  const [selectedLeafImage, setSelectedLeafImage] = useState<string>('');
  const [customLeafFile, setCustomLeafFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanDiagnosis, setScanDiagnosis] = useState<any>(null);

  // Agronomist Chat Assistant
  interface AsistanMessage {
    sender: 'user' | 'ahmet';
    text: string;
    time: string;
  }
  const [asistanInput, setAsistanInput] = useState('');
  const [asistanHistory, setAsistanHistory] = useState<AsistanMessage[]>(() => {
    const saved = localStorage.getItem('proagri_asistan_history');
    return saved ? JSON.parse(saved) : [
      {
        sender: 'ahmet',
        text: language === 'tr' 
          ? 'Merhaba! Ben ProAgri baş ziraat mühendisiyim. Bana tarlanızdaki her türlü zararlıyı, hastalık belirtilerini, kalsiyum/azot eksikliklerini veya NPK reçetelerini sorabilirsiniz.'
          : 'Hello! Ask me any questions about crop planning, pesticide application, nitrogen calculations, or soil conditions.',
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [asistanLoading, setAsistanLoading] = useState(false);

  const handleAsistanSend = async (customPrompt?: string) => {
    const promptToSend = customPrompt || asistanInput;
    if (!promptToSend.trim() || asistanLoading) return;

    const userMsg: AsistanMessage = {
      sender: 'user',
      text: promptToSend,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...asistanHistory, userMsg];
    setAsistanHistory(updatedHistory);
    localStorage.setItem('proagri_asistan_history', JSON.stringify(updatedHistory));
    
    if (!customPrompt) {
      setAsistanInput('');
    }
    
    setAsistanLoading(true);

    try {
      const response = await fetch('/api/gemini/asistan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: promptToSend,
          language,
          history: asistanHistory,
          soilType: activeField?.soilType || 'Tınlı',
          activeCrop: activeCrop?.name || 'Domates',
          activeStage: activeCrop ? (language === 'tr' ? 'Çiçeklenme Dönemi' : 'Flowering Period') : 'Seedling'
        })
      });

      const data = await response.json();
      if (response.ok) {
        const replyMsg: AsistanMessage = {
          sender: 'ahmet',
          text: data.reply,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        };
        const finalHistory = [...updatedHistory, replyMsg];
        setAsistanHistory(finalHistory);
        localStorage.setItem('proagri_asistan_history', JSON.stringify(finalHistory));
      } else {
        throw new Error(data.error || 'Failed to get agronomist reply');
      }
    } catch (e: any) {
      console.error(e);
      const errorMsg: AsistanMessage = {
        sender: 'ahmet',
        text: language === 'tr' 
          ? 'Üzgünüm, şu anda bağlantı kurulamıyor. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
          : 'Sorry, I cannot connect right now. Please check your internet connection and try again.',
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };
      const finalHistory = [...updatedHistory, errorMsg];
      setAsistanHistory(finalHistory);
      localStorage.setItem('proagri_asistan_history', JSON.stringify(finalHistory));
    } finally {
      setAsistanLoading(false);
    }
  };

  // Wholesale wholesale price data
  const wholesalePrices = [
    { date: '01 Tem', Domates: 14.5, Salatalık: 12.0, Biber: 18.5, Patates: 11.0 },
    { date: '02 Tem', Domates: 15.0, Salatalık: 11.5, Biber: 19.0, Patates: 10.5 },
    { date: '03 Tem', Domates: 16.2, Salatalık: 13.0, Biber: 21.0, Patates: 11.2 },
    { date: '04 Tem', Domates: 15.8, Salatalık: 14.2, Biber: 22.5, Patates: 11.5 },
    { date: '05 Tem', Domates: 17.0, Salatalık: 13.5, Biber: 24.0, Patates: 12.0 },
    { date: '06 Tem', Domates: 18.5, Salatalık: 15.0, Biber: 23.5, Patates: 11.8 },
    { date: '07 Tem', Domates: 19.2, Salatalık: 16.5, Biber: 25.0, Patates: 12.5 },
  ];

  // Freight delivery shipping rates per ton
  const freightShippingRates = [
    { route: 'Bursa ➔ İstanbul', rate: 750, duration: '2.5 saat' },
    { route: 'Bursa ➔ Ankara', rate: 1200, duration: '4.5 saat' },
    { route: 'Bursa ➔ İzmir', rate: 1100, duration: '4.0 saat' },
    { route: 'Bursa ➔ Antalya', rate: 1800, duration: '7.0 saat' },
  ];

  // Sync state to local storage and load defaults if empty
  useEffect(() => {
    // 1. Fields
    const savedFields = localStorage.getItem('proagri_fields');
    if (savedFields) {
      const fList = JSON.parse(savedFields);
      setFields(fList);
      if (fList.length > 0) setActiveField(fList[0]);
    } else {
      const initialFields: Field[] = [
        { id: 'f-1', name: 'Ova Bölgesi Domates Tarlası', city: 'Bursa', district: 'Nilüfer', totalArea: 25000, soilType: 'Tınlı' },
        { id: 'f-2', name: 'Eğrekkaya Buğday Sapağı', city: 'Bursa', district: 'Karacabey', totalArea: 40000, soilType: 'Killi' }
      ];
      setFields(initialFields);
      setActiveField(initialFields[0]);
      localStorage.setItem('proagri_fields', JSON.stringify(initialFields));
    }

    // 2. Crops
    const savedCrops = localStorage.getItem('proagri_crops');
    if (savedCrops) {
      const cList = JSON.parse(savedCrops);
      setCrops(cList);
    } else {
      const initialCrops: Crop[] = [
        { id: 'c-1', fieldId: 'f-1', name: 'Domates', area: 15000, sowingDate: '2026-05-10', currentStage: 'Çiçeklenme & Meyve Bağlama' },
        { id: 'c-2', fieldId: 'f-1', name: 'Biber', area: 10000, sowingDate: '2026-05-15', currentStage: 'Erken Vejetatif Gelişim' },
        { id: 'c-3', fieldId: 'f-2', name: 'Buğday', area: 40000, sowingDate: '2026-03-01', currentStage: 'Tane Doldum / Hasat Dönemi' }
      ];
      setCrops(initialCrops);
      localStorage.setItem('proagri_crops', JSON.stringify(initialCrops));
    }

    // 3. Activities Logbook
    const savedActs = localStorage.getItem('proagri_activities');
    if (savedActs) {
      setActivities(JSON.parse(savedActs));
    } else {
      const initialActs = [
        { id: 'act-1', fieldId: 'f-1', cropId: 'c-1', type: 'Sulama' as const, notes: 'A1 Kuzey-Doğu parseline m² başına 25L damlama sulama verildi.', date: '2026-07-05', operator: 'Hilmi Selim Şen' },
        { id: 'act-2', fieldId: 'f-1', cropId: 'c-1', type: 'Gübreleme' as const, notes: 'NPK 15-15-15 kompoze gübre serpiştirildi (Dönüm başına 15 kg).', date: '2026-07-02', operator: 'Selim Şen' }
      ];
      setActivities(initialActs);
      localStorage.setItem('proagri_activities', JSON.stringify(initialActs));
    }

    // 4. Cooperative posts
    const savedPosts = localStorage.getItem('proagri_cooperative_posts');
    if (savedPosts) {
      setCooperativePosts(JSON.parse(savedPosts));
    } else {
      const initialPosts = [
        { id: 'post-1', author: 'Ahmet Karabulut', title: 'Toplu Üre Alımı İlanı', content: 'Arkadaşlar Nilüfer bölgesi kooperatifi olarak GÜBRETAŞ firmasından toplu tır bazında Üre (%46 N) gübresi sipariş edeceğiz. Katılmak isteyenler miktarını belirtsin.', date: '2026-07-06', likes: 14, replies: 6, category: 'Girdi Alımı' as const },
        { id: 'post-2', author: 'Cemil Karaca', title: 'Biçerdöver Kiralama İhtiyacı', content: 'Karacabey bölgesinde buğday hasadı için ortaklaşa biçerdöver kiralayabileceğimiz veya makinesini paylaşmak isteyen var mıdır? Yakıt gideri bana ait.', date: '2026-07-04', likes: 8, replies: 3, category: 'Ekipman' as const },
      ];
      setCooperativePosts(initialPosts);
      localStorage.setItem('proagri_cooperative_posts', JSON.stringify(initialPosts));
    }
  }, []);

  // Update active crop automatically when active field changes
  useEffect(() => {
    if (activeField) {
      const associatedCrops = crops.filter(c => c.fieldId === activeField.id);
      if (associatedCrops.length > 0) {
        setActiveCrop(associatedCrops[0]);
      } else {
        setActiveCrop(null);
      }
      setNewCropFieldId(activeField.id);
    } else {
      setActiveCrop(null);
      if (fields.length > 0) {
        setNewCropFieldId(fields[0].id);
      }
    }
  }, [activeField, crops, fields]);

  // Recalculate irrigation model when active crop changes
  useEffect(() => {
    if (activeCrop && activeField) {
      const res = predictIrrigation({
        temp: simTemp,
        humidity: simHumidity,
        daysAgo: simDaysAgo,
        soilType: activeField.soilType,
        plantName: activeCrop.name,
        mlStage: activeCrop.currentStage,
        pastRain: [0, 5, 0],
        futureRain: simFutureRain
      });
      setIrrigationResult(res);
    }
  }, [activeCrop, activeField, simTemp, simHumidity, simDaysAgo, simFutureRain]);

  // Firebase auth state monitoring listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fbAuth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email || '');
        
        // Find existing user info or merge default
        const emailLower = (user.email || '').toLowerCase();
        let matched = userAccounts[emailLower];
        if (!matched) {
          matched = {
            id: user.uid,
            name: user.displayName || emailLower.split('@')[0],
            email: emailLower,
            passwordHash: '',
            notificationPermission: true,
            cooperatives: {},
            role: 'Premium Çiftçi',
            city: 'Bursa',
            district: 'Nilüfer',
            certNo: 'CKS-' + Math.floor(100000 + Math.random() * 900000) + '-2026',
            landSize: 20,
            mainCrop: 'Domates'
          };
        }
        setCurrentUser(matched);
        localStorage.setItem('proagri_user_profile', JSON.stringify(matched));
      } else {
        // Only trigger logout if we explicitly cleared
      }
    });
    return () => unsubscribe();
  }, [userAccounts]);

  const handleLoginSuccess = (email: string, user: UserType) => {
    setIsAuthenticated(true);
    setUserEmail(email);
    setCurrentUser(user);
    localStorage.setItem('proagri_logged_in', 'true');
    localStorage.setItem('proagri_user_email', email);
    localStorage.setItem('proagri_user_profile', JSON.stringify(user));
    setShowLanding(false);
    localStorage.setItem('proagri_hide_landing', 'true');
    setAuthView(false);
  };

  const handleRegisterUser = (name: string, email: string, passwordHash: string, notify: boolean) => {
    const newUser: UserType = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11),
      name,
      email,
      notificationPermission: notify,
      cooperatives: {},
      role: 'Premium Çiftçi',
      age: 38,
      experienceYears: 12,
      avatar: 'farmer_m2',
      city: 'Bursa',
      district: 'Nilüfer',
      certNo: 'CKS-' + Math.floor(100000 + Math.random() * 900000) + '-2026',
      landSize: 30,
      mainCrop: 'Buğday'
    };

    setUserAccounts(prev => ({
      ...prev,
      [email]: { ...newUser, passwordHash }
    }));
  };

  const handleLogout = async () => {
    try {
      await fbSignOut(fbAuth);
    } catch (e) {
      console.warn(e);
    }
    setIsAuthenticated(false);
    setUserEmail('');
    setCurrentUser(null);
    localStorage.removeItem('proagri_logged_in');
    localStorage.removeItem('proagri_user_email');
    localStorage.removeItem('proagri_user_profile');
    setShowLanding(true);
    localStorage.removeItem('proagri_hide_landing');
  };

  // Add Field action (Saves to state and local storage)
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim() || !newFieldCity.trim() || !newFieldDistrict.trim() || !newFieldArea) return;

    const newF: Field = {
      id: 'f-' + Date.now(),
      name: newFieldName.trim(),
      city: newFieldCity.trim(),
      district: newFieldDistrict.trim(),
      totalArea: parseInt(newFieldArea),
      soilType: newFieldSoil
    };

    const updated = [...fields, newF];
    setFields(updated);
    setActiveField(newF);
    localStorage.setItem('proagri_fields', JSON.stringify(updated));

    // Reset inputs
    setNewFieldName('');
    setNewFieldCity('');
    setNewFieldDistrict('');
    setNewFieldArea('');
  };

  // Delete Field
  const handleDeleteField = (id: string) => {
    const updated = fields.filter(f => f.id !== id);
    setFields(updated);
    localStorage.setItem('proagri_fields', JSON.stringify(updated));
    if (activeField?.id === id) {
      setActiveField(updated.length > 0 ? updated[0] : null);
    }
  };

  // Add Crop action
  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    const targetFieldId = newCropFieldId || activeField?.id || (fields.length > 0 ? fields[0].id : '');
    if (!targetFieldId || !newCropName.trim() || !newCropArea || !newCropSowingDate) return;

    const calcStage = calculatePlantStage(newCropName.trim(), newCropSowingDate);

    const newC: Crop = {
      id: 'c-' + Date.now(),
      fieldId: targetFieldId,
      name: newCropName.trim(),
      area: parseInt(newCropArea),
      sowingDate: newCropSowingDate,
      currentStage: calcStage
    };

    const updated = [...crops, newC];
    setCrops(updated);
    setActiveCrop(newC);
    
    // Auto-focus on the target field
    const matchedField = fields.find(f => f.id === targetFieldId);
    if (matchedField) {
      setActiveField(matchedField);
    }
    
    localStorage.setItem('proagri_crops', JSON.stringify(updated));

    // Reset inputs
    setNewCropName('');
    setNewCropArea('');
    setNewCropSowingDate('');
  };

  // Delete Crop
  const handleDeleteCrop = (id: string) => {
    const updated = crops.filter(c => c.id !== id);
    setCrops(updated);
    localStorage.setItem('proagri_crops', JSON.stringify(updated));
    if (activeCrop?.id === id) {
      const associated = updated.filter(c => c.fieldId === activeField?.id);
      setActiveCrop(associated.length > 0 ? associated[0] : null);
    }
  };

  // Add Activities log
  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeField || !activeCrop || !newLogNotes.trim()) return;

    // Run profanity censor text filter flawlessly!
    const filteredNotes = censorText(newLogNotes.trim());

    const newAct = {
      id: 'act-' + Date.now(),
      fieldId: activeField.id,
      cropId: activeCrop.id,
      type: newLogType,
      notes: filteredNotes,
      date: new Date().toISOString().split('T')[0],
      operator: currentUser?.name || 'Saha Operatörü'
    };

    const updated = [newAct, ...activities];
    setActivities(updated);
    localStorage.setItem('proagri_activities', JSON.stringify(updated));

    // Reset
    setNewLogNotes('');
  };

  // Delete Activity Log
  const handleDeleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    localStorage.setItem('proagri_activities', JSON.stringify(updated));
  };

  // Add Cooperative Forum post
  const handleAddCooperativePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    // Censor profanity flawlessly before posting to community bulletin
    const filteredTitle = censorText(newPostTitle.trim());
    const filteredContent = censorText(newPostContent.trim());

    const newPost = {
      id: 'post-' + Date.now(),
      author: currentUser?.name || 'Misafir Çiftçi',
      title: filteredTitle,
      content: filteredContent,
      date: 'Bugün',
      likes: 0,
      replies: 0,
      category: newPostCategory
    };

    const updated = [newPost, ...cooperativePosts];
    setCooperativePosts(updated);
    localStorage.setItem('proagri_cooperative_posts', JSON.stringify(updated));

    // Reset
    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleLikePost = (id: string) => {
    if (likedPosts.includes(id)) return;
    setLikedPosts(prev => [...prev, id]);
    const updated = cooperativePosts.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.likes + 1 };
      }
      return p;
    });
    setCooperativePosts(updated);
    localStorage.setItem('proagri_cooperative_posts', JSON.stringify(updated));
  };

  const handleAddReply = (postId: string) => {
    if (!newReplyText.trim()) return;
    const cleanReply = censorText(newReplyText.trim());
    const replyObj = {
      author: currentUser?.name || 'Çiftçi',
      text: cleanReply,
      date: 'Şimdi'
    };
    setPostReplies(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), replyObj]
    }));
    const updated = cooperativePosts.map(p => {
      if (p.id === postId) {
        return { ...p, replies: p.replies + 1 };
      }
      return p;
    });
    setCooperativePosts(updated);
    localStorage.setItem('proagri_cooperative_posts', JSON.stringify(updated));
    setNewReplyText('');
  };

  // Simulate Leaf Diagnosis Scan
  const handleLeafScan = () => {
    if (!selectedLeafImage && !customLeafFile) return;
    setIsScanning(true);
    setScanDiagnosis(null);

    // Dynamic timeout simulating server AI vision processing
    setTimeout(async () => {
      try {
        const cropName = activeCrop?.name || 'Domates';
        const imgUrl = selectedLeafImage || 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&q=80&w=300';
        
        const response = await fetch('/api/gemini/diagnose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: imgUrl,
            crop: cropName,
            language
          })
        });

        const data = await response.json();
        if (response.ok) {
          setScanDiagnosis({
            disease: data.disease,
            confidence: data.confidence || 95.4,
            cause: data.cause,
            remedy: data.remedy,
            organicTreatment: data.organicTreatment
          });
        } else {
          // Fallback if API has transient errors
          setScanDiagnosis({
            disease: language === 'tr' ? 'Yaprak Klorozu (Besin Eksikliği)' : 'Leaf Chlorosis (Nutrient Deficiency)',
            confidence: 88.5,
            cause: language === 'tr' ? 'Topraktaki demir (Fe) veya azot miktarının yetersizliği ve hatalı pH dengesi.' : 'Inadequate iron (Fe) or nitrogen levels in the soil substrate.',
            remedy: language === 'tr' ? 'Sulu çözelti halinde şelatlı demir takviyesi yapın ve toprak pH derecesini dengeleyin.' : 'Apply chelated iron solution and balance pH grades.',
            organicTreatment: language === 'tr' ? 'Kompost çayı ve seyreltilmiş ısırgan otu suyu püskürtün.' : 'Sprinkle organic compost tea.'
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsScanning(false);
      }
    }, 2000);
  };

  // Load and show Landing Page
  if (showLanding && !authView) {
    return (
      <LandingPage 
        onEnterApp={() => {
          setShowLanding(false);
          localStorage.setItem('proagri_hide_landing', 'true');
        }}
        onEnterAuth={() => {
          setAuthView(true);
        }}
      />
    );
  }

  // Load and show Login / Register screen
  if (authView && !isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-slate-50 flex items-center justify-center">
        <button
          onClick={() => setAuthView(false)}
          className="absolute top-6 left-6 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
        >
          ← {language === 'tr' ? 'Giriş Sayfasına Dön' : 'Back to Entrance'}
        </button>
        <Auth 
          onLoginSuccess={handleLoginSuccess}
          existingUsers={userAccounts}
          onRegisterUser={handleRegisterUser}
        />
      </div>
    );
  }

  // Double guard: If landing is skipped but user isn't authenticated, enforce auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Auth 
          onLoginSuccess={handleLoginSuccess}
          existingUsers={userAccounts}
          onRegisterUser={handleRegisterUser}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans select-none antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Primary Portal Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-150 px-4 md:px-6 py-3.5 flex items-center justify-between select-none shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <Sprout className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-base text-slate-900 tracking-tight flex items-center gap-1.5">
                Pro-Agri <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-1.5 py-0.5 rounded border border-emerald-200/50">PRO</span>
              </span>
              <span className="text-[9px] text-slate-500 font-bold font-mono block tracking-wider uppercase">
                {language === 'tr' ? 'SaaS AKILLI TARIM PORTAL' : 'AI SOWING OPERATIONS PORTAL'}
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Active Field Dropdown Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{activeField ? activeField.name : 'Tarla Seçilmedi'}</span>
          </div>
        </div>

        {/* Header Right Interactions */}
        <div className="flex items-center gap-3">
          
          {/* Premium Status Banner/Button */}
          <button
            onClick={() => setShowPremiumModal(true)}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              focusMode 
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm' 
                : 'bg-white text-slate-505 border-slate-200 hover:border-slate-300'
            }`}
            title={language === 'tr' ? 'Premium Abonelik Durumu' : 'Premium Subscription'}
          >
            <Sparkles className={`w-3.5 h-3.5 ${focusMode ? 'text-amber-500 fill-amber-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{focusMode ? (language === 'tr' ? 'PREMİUM AKTİF' : 'PREMIUM ACTIVE') : (language === 'tr' ? 'PREMİUMA GEÇ' : 'UPGRADE PREMIUM')}</span>
          </button>

          {/* Language Picker Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="tr">TR</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>

          {/* Quick Landing Page Link */}
          <button
            onClick={() => {
              setShowLanding(true);
              localStorage.removeItem('proagri_hide_landing');
            }}
            className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 cursor-pointer hidden md:block"
            title="SaaS Anasayfası"
          >
            <LayoutDashboard className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsible Sidebar */}
        <Sidebar 
          activeField={activeField}
          activeCrop={activeCrop}
          onSwitchField={() => setActiveTab('analiz')}
          onLogout={handleLogout}
          userEmail={userEmail}
          currentUser={currentUser}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenProfile={() => setActiveTab('analiz')}
          focusMode={focusMode}
        />

        {/* Tab Content Canvas Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 text-left max-w-7xl mx-auto w-full">
          
          {/* Suppressed / Active banner in Focus Mode */}
          <AdBanner focusMode={focusMode} />

          {/* Main Top Navigation Row */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-1 pb-px select-none scrollbar-thin">
            <button
              onClick={() => setActiveTab('analiz')}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'analiz'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {language === 'tr' ? 'Akıllı Analiz & Dashboard' : 'Smart Analysis'}
            </button>
            <button
              onClick={() => setActiveTab('asistan')}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'asistan'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {language === 'tr' ? 'Ziraat YZ Asistanı' : 'Sowing AI Bot'}
            </button>
            <button
              onClick={() => setActiveTab('saglik')}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saglik'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              {language === 'tr' ? 'YZ Hastalık Teşhisi' : 'Leaf Disease Vision'}
            </button>
            <button
              onClick={() => setActiveTab('gubre')}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gubre'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              {language === 'tr' ? 'Gübreleme Reçetesi' : 'Fertilization Recipe'}
            </button>
            <button
              onClick={() => setActiveTab('pazar')}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pazar'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              {language === 'tr' ? 'Hal Fiyatları & Navlun' : 'Produce Rates & Freight'}
            </button>
            <button
              onClick={() => setActiveTab('kooperatif')}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'kooperatif'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              {language === 'tr' ? 'Dijital Kooperatif' : 'Cooperative Network'}
            </button>
            <button
              onClick={() => setActiveTab('kayitlar')}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'kayitlar'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              {language === 'tr' ? 'Kayıt Defteri' : 'Daily Logs'}
            </button>
            <button
              onClick={() => setActiveTab('tumkodlar')}
              className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tumkodlar'
                  ? 'border-emerald-600 text-emerald-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database className="w-4 h-4" />
              {language === 'tr' ? 'Sistem Kodları' : 'All Code (TXT)'}
            </button>
          </div>

          {/* 1. AKILLI ANALİZ & DASHBOARD TAB */}
          {activeTab === 'analiz' && (
            <div className="space-y-6">
              
              {/* Climate Widget & Dynamic Alert Summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-8 bg-white border border-slate-150 rounded-2xl p-4 md:p-5 shadow-xs text-left">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-800">
                        {language === 'tr' ? 'Nilüfer Meteoroloji İstasyonu & Sentinel-2 Uydusu' : 'Climate & Satellite Telemetry'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">Bursa / Nilüfer Enlem: 40.21° N Boylam: 28.93° E</p>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold">AKTİF HAVA DURUMU</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-[9px] text-slate-500 block">SICAKLIK</span>
                        <span className="text-sm font-extrabold text-slate-800">28.5 °C</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Droplet className="w-5 h-5" />
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-[9px] text-slate-500 block">NEM</span>
                        <span className="text-sm font-extrabold text-slate-800">%52</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                        <Map className="w-5 h-5" />
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-[9px] text-slate-500 block">NDVI ALFA</span>
                        <span className="text-sm font-extrabold text-slate-800">0.81</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-150">
                      <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
                        <CloudRain className="w-5 h-5" />
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-[9px] text-slate-500 block">YAĞIŞ (3G)</span>
                        <span className="text-sm font-extrabold text-slate-800">12 mm</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 bg-emerald-950 text-emerald-100 rounded-2xl p-5 text-left relative overflow-hidden flex flex-col justify-between shadow-md">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                  
                  <div className="space-y-1 z-10">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> {language === 'tr' ? 'Premium Çiftçi Durumu' : 'Premium Farmer Grade'}
                    </div>
                    <h3 className="text-sm font-bold text-white font-display">ÇKS Kayıt Doğrulaması</h3>
                    <p className="text-[10px] text-emerald-350 leading-relaxed font-mono">
                      No: {currentUser?.certNo || 'CKS-421098-2026'}<br />
                      Maksimum Alan Limiti: Sınırsız
                    </p>
                  </div>

                  <div className="pt-3 border-t border-emerald-900 z-10">
                    <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider block font-mono">Ana Mahsul</span>
                    <span className="text-white text-xs font-bold font-mono">
                      {activeCrop ? `${activeCrop.name} (${activeCrop.area} m²)` : 'Domates'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Moisture Grid Visualization */}
              <SoilMoistureGrid />

              {/* Tarlalarım ve Mahsullerim (Registration section with zero pre-filled inputs) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                
                {/* Fields List */}
                <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-800">
                        {language === 'tr' ? 'Kayıtlı Tarım Tarlalarım' : 'Registered Land Plots'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {language === 'tr' ? 'Kayıtlı CKS tarlaları ve parselleri' : 'Registered CKS certified field tracts'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {fields.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No fields registered yet.</p>
                    ) : (
                      fields.map((f) => (
                        <div 
                          key={f.id} 
                          onClick={() => setActiveField(f)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                            activeField?.id === f.id 
                              ? 'bg-emerald-50/50 border-emerald-400/80 shadow-xs' 
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${activeField?.id === f.id ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                              {f.name}
                            </h5>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-mono">
                              <span>📍 {f.city} / {f.district}</span>
                              <span>📐 {f.totalArea.toLocaleString()} m²</span>
                              <span>🌱 {f.soilType} {language === 'tr' ? 'Toprak' : 'Soil'}</span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteField(f.id);
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Tarlayı Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Field Form (BLANK defaults to allow user to enter normal values) */}
                  <form onSubmit={handleAddField} className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 pt-3">
                    <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                      ➕ {language === 'tr' ? 'YENİ TARLA EKLE (ÇKS)' : 'REGISTER NEW LAND PLOT'}
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Tarla Adı</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Karacabey Ovası" 
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Toplam Alan (m²)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 15000" 
                          value={newFieldArea}
                          onChange={(e) => setNewFieldArea(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">İl (Şehir)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Bursa" 
                          value={newFieldCity}
                          onChange={(e) => setNewFieldCity(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">İlçe</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Nilüfer" 
                          value={newFieldDistrict}
                          onChange={(e) => setNewFieldDistrict(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Toprak Tipi</label>
                        <select 
                          value={newFieldSoil}
                          onChange={(e: any) => setNewFieldSoil(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                        >
                          <option value="Tınlı">Tınlı (Dengeli)</option>
                          <option value="Kumlu">Kumlu</option>
                          <option value="Killi">Killi</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {language === 'tr' ? 'Sisteme Kaydet' : 'Register Field'}
                    </button>
                  </form>
                </div>

                {/* Crops associated with Active Field */}
                <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="pb-2 border-b border-slate-100">
                    <h4 className="font-display font-bold text-sm text-slate-800">
                      {activeField ? `${activeField.name} ${language === 'tr' ? 'Ürünleri' : 'Crops'}` : 'Saha Mahsulleri'}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {language === 'tr' ? 'Bu tarlaya ait ekili bitkiler' : 'Active sowings inside this parcel'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {(!activeField || crops.filter(c => c.fieldId === activeField.id).length === 0) ? (
                      <p className="text-xs text-slate-500 italic">No crops registered for this field.</p>
                    ) : (
                      crops.filter(c => c.fieldId === activeField.id).map((c) => (
                        <div 
                          key={c.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center"
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                              🍏 {c.name}
                            </span>
                            <div className="flex flex-col gap-0.5 text-[9px] text-slate-500 font-mono">
                              <span>📐 Alan: {c.area.toLocaleString()} m²</span>
                              <span>📅 Ekim: {c.sowingDate}</span>
                              <span className="text-emerald-650 font-bold">✨ Aşama: {c.currentStage}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteCrop(c.id)}
                            className="p-1 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition-colors cursor-pointer"
                            title="Ürünü Sil"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Crop Form (BLANK defaults to allow user to enter normal values) */}
                  {fields.length > 0 && (
                    <form onSubmit={handleAddCrop} className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3 pt-3">
                      <h5 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                        ➕ {language === 'tr' ? 'YENİ MAHSUL EKLE' : 'ADD NEW CROP'}
                      </h5>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Eklenecek Tarla</label>
                          <select 
                            value={newCropFieldId}
                            onChange={(e: any) => setNewCropFieldId(e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                            required
                          >
                            <option value="" disabled>{language === 'tr' ? 'Tarla Seçiniz...' : 'Select Field...'}</option>
                            {fields.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Ürün / Bitki Adı</label>
                          <input 
                            type="text" 
                            list="all-plants-list"
                            placeholder="e.g. Domates, Buğday..." 
                            value={newCropName}
                            onChange={(e) => setNewCropName(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                            required
                          />
                          <datalist id="all-plants-list">
                            {ALL_PLANTS.map(p => <option key={p} value={p} />)}
                          </datalist>
                        </div>
 
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Ekim Alanı (m²)</label>
                            <input 
                              type="number" 
                              placeholder="e.g. 5000" 
                              value={newCropArea}
                              onChange={(e) => setNewCropArea(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Ekim Tarihi</label>
                            <input 
                              type="date" 
                              value={newCropSowingDate}
                              onChange={(e) => setNewCropSowingDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {language === 'tr' ? 'Ekim Kaydet' : 'Record Crop Sowing'}
                      </button>
                    </form>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* 2. ZİRAAT YZ ASİSTANI TAB */}
          {activeTab === 'asistan' && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500 animate-spin-slow" />
                  {language === 'tr' ? 'Ziraat Mühendisi Ahmet Bey (Gemini 2.5 YZ)' : 'Agronomist Ahmet Bey (Gemini 2.5 AI)'}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                  {language === 'tr' 
                    ? 'Tarlanızın spektral Sentinel verilerini, toprak çeşidini ve ekili ürünün fenolojik evresini bilerek tavsiye verir.'
                    : 'Provides custom precision farming answers regarding soil metrics, climate stresses and fertilization schedules.'}
                </p>
              </div>

              {/* Dedicated full-width chat interface */}
              <div className="h-[480px] bg-slate-50 border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs md:text-sm custom-scrollbar">
                  
                  {asistanHistory.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender !== 'user' && (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-base shrink-0">
                          👨‍🌾
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl p-3.5 space-y-1 ${
                        msg.sender === 'user' 
                          ? 'bg-emerald-600 text-white rounded-tr-none text-right' 
                          : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none text-left'
                      }`}>
                        <div className="text-xs md:text-sm whitespace-pre-wrap font-sans leading-relaxed">
                          {msg.text}
                        </div>
                        <span className={`block text-[10px] ${msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400 font-mono'}`}>
                          {msg.time}
                        </span>
                      </div>
                      {msg.sender === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs shrink-0 font-bold text-slate-600">
                          {currentUser?.name ? currentUser.name[0].toUpperCase() : 'C'}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Dynamic interactive prompts */}
                  {asistanHistory.length <= 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => {
                          const q = language === 'tr' 
                            ? 'Domates için çiçeklenme evresinde hangi gübreyi ne miktarda vermeliyim?' 
                            : 'What fertilizer dosage should I use for tomatoes in flowering stage?';
                          handleAsistanSend(q);
                        }}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all cursor-pointer font-medium text-xs text-slate-700 shadow-2xs"
                      >
                        💡 {language === 'tr' ? 'Domates Çiçeklenme Dönemi Gübresi' : 'Tomato Flowering Fertilizers'}
                      </button>
                      <button 
                        onClick={() => {
                          const q = language === 'tr' 
                            ? 'Tınlı toprakta kloroz (yaprak sararması) gördüm, sebebi ne olabilir?' 
                            : 'I noticed leaf yellowing in loamy soil, what causes this?';
                          handleAsistanSend(q);
                        }}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all cursor-pointer font-medium text-xs text-slate-700 shadow-2xs"
                      >
                        💡 {language === 'tr' ? 'Yaprak Sararması (Kloroz) Analizi' : 'Leaf Yellowing Causes'}
                      </button>
                    </div>
                  )}

                  {asistanLoading && (
                    <div className="flex gap-3 items-start justify-start">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-base shrink-0">
                        👨‍🌾
                      </div>
                      <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-emerald-500 animate-spin" />
                        <span className="text-xs text-slate-500 font-mono">
                          {language === 'tr' ? 'Ahmet Bey yazıyor...' : 'Ahmet Bey is typing...'}
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Chat input footer */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAsistanSend();
                  }}
                  className="p-3 bg-white border-t border-slate-200 flex gap-2"
                >
                  <input
                    type="text"
                    value={asistanInput}
                    onChange={(e) => setAsistanInput(e.target.value)}
                    disabled={asistanLoading}
                    placeholder={language === 'tr' ? 'Ziraat sorunuzu yazın... (Örn: NPK gübre oranları)' : 'Ask your farming question...'}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!asistanInput.trim() || asistanLoading}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 3. YZ BİTKİ SAĞLIĞI (DIAGNOSIS) TAB */}
          {activeTab === 'saglik' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-emerald-500" />
                    {language === 'tr' ? 'Yapay Zeka Bitki Hastalığı ve Teşhis Taraması (Vision)' : 'AI Plant Leaf Disease Diagnosis (Vision)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                    {language === 'tr' 
                      ? 'Bitkinizin yaprağındaki küf, leke, böcek ısırığı veya kloroz belirtisini anında tespit etmek için fotoğraf seçin veya kameranızı açın.'
                      : 'Capture or select photos of plant leaves to instantly detect pathogens, blight, or nutrient anomalies using Gemini Vision.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  
                  {/* Select or upload leaf image */}
                  <div className="lg:col-span-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                      {language === 'tr' ? 'Adım 1: Tarama Fotoğrafı Belirleyin' : 'Step 1: Set Scan Image'}
                    </h4>

                    {/* Pre-uploaded sample leaf images list */}
                    <div className="grid grid-cols-2 gap-3">
                      {MOCK_LEAF_IMAGES.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => {
                            setSelectedLeafImage(img.url);
                            setCustomLeafFile(null);
                          }}
                          className={`group rounded-xl border p-2 overflow-hidden flex flex-col gap-2 transition-all cursor-pointer text-left ${
                            selectedLeafImage === img.url 
                              ? 'ring-2 ring-emerald-500 border-transparent bg-emerald-50/20' 
                              : 'border-slate-200 hover:border-slate-350 bg-white'
                          }`}
                        >
                          <img 
                            src={img.url} 
                            alt={img.name} 
                            referrerPolicy="no-referrer"
                            className="w-full aspect-[4/3] object-cover rounded-lg group-hover:scale-101 transition-transform" 
                          />
                          <span className="text-[10px] font-extrabold text-slate-800 leading-snug line-clamp-1 block">
                            {img.name}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <div className="relative flex justify-center text-[9px] uppercase font-bold text-slate-400 font-mono">
                        <span className="bg-white px-2">OR UPLOAD FILE</span>
                      </div>
                    </div>

                    {/* Custom File uploader */}
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100 transition-colors relative cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCustomLeafFile(file);
                            setSelectedLeafImage(URL.createObjectURL(file));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                      <span className="text-xs font-bold text-slate-700 block">
                        {customLeafFile ? customLeafFile.name : (language === 'tr' ? 'Cihazdan Fotoğraf Yükleyin veya Çekin' : 'Upload from Local Device')}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Supports PNG, JPG, WEBP (Max 5MB)</span>
                    </div>

                    <button
                      onClick={handleLeafScan}
                      disabled={isScanning || !selectedLeafImage}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-350 text-white font-black text-xs rounded-xl shadow-md hover:scale-101 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Tarama Yapılıyor...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          <span>{language === 'tr' ? 'Yapay Zeka Teşhisi Başlat' : 'Diagnose Plant Disease'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Diagnostic response screen */}
                  <div className="lg:col-span-6 bg-slate-50 border border-slate-150 rounded-xl p-4 md:p-5 flex flex-col justify-between min-h-[360px] text-left">
                    {isScanning ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="relative w-16 h-16 rounded-full border border-dashed border-emerald-500 animate-spin flex items-center justify-center">
                          <Camera className="w-6 h-6 text-emerald-650" />
                        </div>
                        <p className="text-xs font-bold text-slate-700">Sentinel-Vision yaprak dokusu taranıyor...</p>
                        <p className="text-[10px] text-slate-400 font-mono">Running convolutional neural network grids...</p>
                      </div>
                    ) : scanDiagnosis ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase font-mono tracking-wider">TEŞHİS RAPORU</span>
                            <h4 className="text-base font-extrabold text-red-650 leading-tight mt-0.5">
                              {scanDiagnosis.disease}
                            </h4>
                          </div>
                          <span className="px-2.5 py-1 bg-red-50 text-red-650 font-bold font-mono text-xs rounded-xl border border-red-200">
                            {scanDiagnosis.confidence}% Eşleşme
                          </span>
                        </div>

                        <div className="space-y-3.5 text-xs text-slate-750">
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono mb-1">Hastalık Nedeni (Oluşumu):</span>
                            <p className="bg-white p-3 rounded-lg border border-slate-200/50 leading-relaxed text-slate-800">
                              {scanDiagnosis.cause}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono mb-1">Mühendis Reçetesi & Çözümü:</span>
                            <p className="bg-white p-3 rounded-lg border border-slate-200/50 leading-relaxed text-slate-800">
                              {scanDiagnosis.remedy}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 block uppercase font-mono mb-1">Organik & Doğal Tedavi Tavsiyesi:</span>
                            <p className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-200/40 leading-relaxed text-slate-800">
                              {scanDiagnosis.organicTreatment}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <Camera className="w-12 h-12 text-slate-300" />
                        <h5 className="font-bold text-slate-700">{language === 'tr' ? 'Teşhis Bekleniyor' : 'Awaiting Diagnosis'}</h5>
                        <p className="text-xs text-slate-500 max-w-sm">
                          {language === 'tr' ? 'Soldaki hazır bitki yapraklarından birini seçerek veya fotoğraf yükleyerek testi başlatabilirsiniz.' : 'Select a leaf template or upload a file from your field to compute disease classification reports.'}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* 4. GÜBRELEME REÇETESİ TAB */}
          {activeTab === 'gubre' && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  {language === 'tr' ? 'Yapay Zeka Destekli Hassas Gübreleme ve NPK Planı' : 'AI Crop Nutrient & NPK Fertilization Planner'}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                  {language === 'tr' 
                    ? 'Toprağınızın kimyasal bileşimine ve ürününüzün ekim gününe göre mükemmel N (Azot), P (Fosfor), K (Potasyum) hesaplamasını yapar.'
                    : 'Calculate accurate NPK distribution timelines based on planting schedules, moisture retention and soil depth.'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                      NPK GÜBRELEME SİMÜLATÖRÜ
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Ürün Grubu</label>
                        <select className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 cursor-pointer">
                          <option value="Sebze">Sebzeler (Domates, Patlıcan vb.)</option>
                          <option value="Meyve">Meyve Ağaçları & Bağlar</option>
                          <option value="Tahıl">Tahıllar & Baklagiller (Buğday vb.)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Toprak Çeşidi</label>
                        <input 
                          type="text" 
                          value={activeField?.soilType || 'Tınlı'} 
                          disabled
                          className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Büyüme Evresi</label>
                        <input 
                          type="text" 
                          value={activeCrop?.currentStage || 'Gelişim'} 
                          disabled
                          className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-150 rounded-xl">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase font-mono block">MÜHENDİS TAVSİYESİ</span>
                    <p className="text-[11px] text-emerald-700 leading-relaxed mt-1.5">
                      "Çiçeklenme evresinde azot gübrelerini azaltın ve tomurcuk verimi için fosforu artırın. Dekar başına 18 kg DAP gübrelemesi önerilir."
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    {language === 'tr' ? 'Hesaplanan Besin İhtiyaç Grafiği (Dekar Başına)' : 'Calculated Nutrient Dosage per Decare'}
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      <span className="text-[10px] text-slate-500 block uppercase font-mono mt-1">Azot (N)</span>
                      <strong className="text-xl font-extrabold text-slate-800 font-mono mt-1 block">12.5 kg</strong>
                      <span className="text-[8px] text-slate-400 block mt-0.5">Maks: 15.0 kg</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      <span className="text-[10px] text-slate-500 block uppercase font-mono mt-1">Fosfor (P₂O₅)</span>
                      <strong className="text-xl font-extrabold text-slate-800 font-mono mt-1 block">18.0 kg</strong>
                      <span className="text-[8px] text-slate-400 block mt-0.5">Maks: 20.0 kg</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center">
                      <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                      <span className="text-[10px] text-slate-500 block uppercase font-mono mt-1">Potasyum (K₂O)</span>
                      <strong className="text-xl font-extrabold text-slate-800 font-mono mt-1 block">14.2 kg</strong>
                      <span className="text-[8px] text-slate-400 block mt-0.5">Maks: 18.0 kg</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wide font-mono block">GÜBRELEME TAKVİMİ</span>
                    <div className="text-xs text-slate-650 space-y-1.5 leading-relaxed font-mono">
                      <p>✓ <strong>Gün 1:</strong> Dekar başına 6 kg Amonyum Sülfat ile ilk can canlandırması.</p>
                      <p>✓ <strong>Gün 7:</strong> Damla sulama sistemiyle 8 kg Potasyum Nitrat takviyesi.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. GÜNLÜK HAL FİYATLARI TAB */}
          {activeTab === 'pazar' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      {language === 'tr' ? 'Bursa Büyükşehir Belediyesi Hal Pazar Fiyatları' : 'Wholesale Produce Prices & Cargo Rates'}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                      {language === 'tr' ? 'Günlük hal pazarı fiyat hareketleri ve sevkiyat lojistik fiyat endeksi' : 'Daily market price index and freight container shipping cost estimator'}
                    </p>
                  </div>
                  <span className="text-[9px] bg-blue-50 text-blue-650 border border-blue-200 px-2.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                    {language === 'tr' ? 'BİLGiSAYAR DESTEKLİ ENTEGRASYON' : 'LIVE FEED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  
                  {/* Market price chart */}
                  <div className="lg:col-span-8 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                      {language === 'tr' ? 'Son 7 Günlük Fiyat Değişim Grafiği (TL/Kg)' : '7-Day Price Evolution (TRY/Kg)'}
                    </h4>

                    <div className="h-64 bg-slate-50 border border-slate-150 p-2 rounded-xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={wholesalePrices} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <Tooltip />
                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                          <Line type="monotone" dataKey="Domates" stroke="#EF4444" strokeWidth={2.5} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="Salatalık" stroke="#10B981" strokeWidth={2} />
                          <Line type="monotone" dataKey="Biber" stroke="#F59E0B" strokeWidth={2} />
                          <Line type="monotone" dataKey="Patates" stroke="#8B5CF6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Freight Estimator */}
                  <div className="lg:col-span-4 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                      {language === 'tr' ? 'Lojistik & Nakliye Fiyatları (Ton)' : 'Freight Shipping Estimates per Ton'}
                    </h4>

                    <div className="space-y-3">
                      {freightShippingRates.map((fr, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center text-xs">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 font-mono block">{fr.route}</span>
                            <span className="text-[10px] text-slate-500 font-mono">⏱️ {fr.duration}</span>
                          </div>
                          <div className="text-right font-mono">
                            <strong className="text-sm font-extrabold text-slate-800">₺{fr.rate}</strong>
                            <span className="text-[8px] text-slate-400 block mt-0.5">/ ton</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* 6. DİJİTAL KOOPERATİF TAB */}
          {activeTab === 'kooperatif' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      {language === 'tr' ? 'Bölgesel Dijital Kooperatif Yardımlaşma Ağı' : 'Cooperative Peer Social Network'}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                      {language === 'tr' ? 'Bursa ve Karacabey çevresindeki çiftçilerle ortak alım yapın, makine kiralayın' : 'Coordinate equipment sharing, collective fertilizer orders, and farming announcements'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  
                  {/* Forum list */}
                  <div className="lg:col-span-8 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                      {language === 'tr' ? 'Kooperatif Panosu & İlanlar' : 'Peer Announcements & Bulletin board'}
                    </h4>

                    <div className="space-y-3.5">
                      {cooperativePosts.map((post) => (
                        <div key={post.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs shadow-inner">👨‍🌾</span>
                              <div>
                                <span className="font-bold text-slate-800 block">{post.author}</span>
                                <span className="text-[9px] text-slate-400 font-mono block">{post.date}</span>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold font-mono text-[9px] rounded-md uppercase">
                              {post.category}
                            </span>
                          </div>

                          <h5 className="font-bold text-sm text-slate-800 mt-1">{post.title}</h5>
                          <p className="text-slate-650 leading-relaxed">{post.content}</p>

                          <div className="pt-2 border-t border-slate-200/50 flex flex-col gap-2.5">
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                              <button 
                                onClick={() => handleLikePost(post.id)}
                                className={`flex items-center gap-1 transition-colors cursor-pointer ${likedPosts.includes(post.id) ? 'text-emerald-700 font-extrabold' : 'hover:text-emerald-600'}`}
                              >
                                {likedPosts.includes(post.id) ? '❤️' : '👍'} {post.likes} {language === 'tr' ? 'Beğeni' : 'Likes'}
                              </button>
                              <button 
                                onClick={() => setSelectedPostIdForReplies(selectedPostIdForReplies === post.id ? null : post.id)}
                                className={`flex items-center gap-1 transition-colors cursor-pointer ${selectedPostIdForReplies === post.id ? 'text-emerald-700 font-extrabold' : 'hover:text-emerald-600'}`}
                              >
                                💬 {post.replies} {language === 'tr' ? 'Yanıt' : 'Replies'}
                              </button>
                            </div>

                            {selectedPostIdForReplies === post.id && (
                              <div className="pt-2 border-t border-slate-200/40 space-y-2.5">
                                {/* Replies List */}
                                <div className="space-y-1.5">
                                  {(postReplies[post.id] || []).length === 0 ? (
                                    <p className="text-[10px] text-slate-400 italic font-mono">{language === 'tr' ? 'Henüz yanıt yok' : 'No replies yet'}</p>
                                  ) : (
                                    (postReplies[post.id] || []).map((reply, rIdx) => (
                                      <div key={rIdx} className="bg-white border border-slate-100 p-2.5 rounded-lg text-[11px] leading-relaxed">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="font-bold text-slate-700">{reply.author}</span>
                                          <span className="text-[9px] text-slate-400 font-mono">{reply.date}</span>
                                        </div>
                                        <p className="text-slate-650">{reply.text}</p>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {/* Add Reply Form */}
                                <div className="flex gap-1.5 pt-1">
                                  <input
                                    type="text"
                                    placeholder={language === 'tr' ? 'Yanıt yazın... (Süzgeç aktiftir)' : 'Reply...'}
                                    value={newReplyText}
                                    onChange={(e) => setNewReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleAddReply(post.id);
                                      }
                                    }}
                                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                                  />
                                  <button
                                    onClick={() => handleAddReply(post.id)}
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                                  >
                                    {language === 'tr' ? 'Gönder' : 'Send'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Bulletin post (BLANK defaults to allow user to enter normal values) */}
                  <div className="lg:col-span-4 bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                      📢 {language === 'tr' ? 'YENİ KOOPERATİF İLANI OLUŞTUR' : 'CREATE NEW COOPERATIVE POST'}
                    </h4>

                    <form onSubmit={handleAddCooperativePost} className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">İlan Başlığı</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Ortak Üre Gübresi Alımı" 
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">İlan Kategorisi</label>
                        <select 
                          value={newPostCategory}
                          onChange={(e: any) => setNewPostCategory(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                        >
                          <option value="Girdi Alımı">Girdi Alımı (Gübre, Tohum)</option>
                          <option value="Ekipman">Ekipman Kiralama & Paylaşım</option>
                          <option value="Saha Yardımlaşma">Saha Yardımlaşma</option>
                          <option value="Fiyat Tartışma">Fiyat Tartışma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Detaylı İlan Açıklaması</label>
                        <textarea 
                          placeholder="İlan içeriğinizi buraya detaylı olarak yazın..." 
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          rows={4}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 text-left resize-none"
                          required
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        {language === 'tr' ? 'İlanı Yayınla' : 'Publish Announcement'}
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* 7. KAYIT DEFTERİ TAB (With Profanity Censor filter) */}
          {activeTab === 'kayitlar' && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    {language === 'tr' ? 'Saha Operatör Defteri & Günlük Kayıtlar' : 'Agricultural Activity Logbook & Sowing Register'}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                    {language === 'tr' 
                      ? 'Tarla aktivitelerinizi yazın. Güvenliğiniz için kayıtlar otomatik olarak küfür filtresinden geçirilir.' 
                      : 'Log sowing, chemical applications, and water volume. Profanity is censored in the journal entries.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                
                {/* Historical Log list */}
                <div className="lg:col-span-7 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                    {language === 'tr' ? 'Geçmiş Defter Kayıtları' : 'Historical logs & actions'}
                  </h4>

                  {activities.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No logs recorded yet.</p>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-xs flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold font-mono text-[9px] rounded-md uppercase">
                              {act.type}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono font-semibold">{act.date}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{act.notes}</p>
                          <span className="text-[9px] text-slate-500 font-mono font-bold block">✍️ {act.operator}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Create Log form (BLANK defaults) */}
                <div className="lg:col-span-5 bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 text-left">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">
                    📝 {language === 'tr' ? 'YENİ GÜNLÜK KAYIT EKLE' : 'ADD NEW ACTIVITY LOG'}
                  </h4>

                  <form onSubmit={handleAddActivity} className="space-y-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Aktivite Türü</label>
                      <select 
                        value={newLogType}
                        onChange={(e: any) => setNewLogType(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                      >
                        <option value="Sulama">💧 Sulama (Watering)</option>
                        <option value="Gübreleme">🧪 Gübreleme (NPK Nutrient)</option>
                        <option value="İlaçlama">🛡️ İlaçlama (Chemicals Spraying)</option>
                        <option value="Hasat">🌾 Hasat (Harvesting)</option>
                        <option value="Gözlem">🔍 Genel Saha Gözlemi (Observation)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase font-mono mb-1">Aktivite Detayı (Küfür süzgeci aktiftir)</label>
                      <textarea 
                        placeholder="Açıklama giriniz... (Örn: Kuzey parseline potasyum verildi)" 
                        value={newLogNotes}
                        onChange={(e) => setNewLogNotes(e.target.value)}
                        rows={4}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 text-left resize-none"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {language === 'tr' ? 'Kayıt Defterine İşle' : 'Add to Logbook'}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* 8. TÜM KODLAR (TXT) TAB */}
          {activeTab === 'tumkodlar' && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4 text-left">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="font-display font-bold text-base text-slate-800">
                  {language === 'tr' ? 'ProAgri Yazılım Kod Yapısı' : 'Source Code & Integrity Inspector'}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed font-mono">
                  {language === 'tr' ? 'Aşağıdaki dosyaları indirerek veya inceleyerek projenizin bütünlüğünü doğrulayabilirsiniz.' : 'Check directory files code structure.'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold font-mono text-slate-800">1. /src/lib/i18n.tsx</span>
                  <span className="text-[10px] text-slate-500 font-mono">Multilingual translation Provider & hook (TR, EN, ES)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold font-mono text-slate-800">2. /src/data.ts</span>
                  <span className="text-[10px] text-slate-500 font-mono">Plant Library lists, Irrigation prediction algorithm, bad words list</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold font-mono text-slate-800">3. /src/lib/firebase.ts</span>
                  <span className="text-[10px] text-slate-500 font-mono">Real Firestore and local database fallback wrapper layer</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Floating Interactive Guide Widget */}
      <AppGuideWidget activeTab={activeTab} setActiveTab={setActiveTab} />

      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-150 p-6 max-w-md w-full shadow-2xl relative text-left space-y-4 animate-fade-in">
            <button
              onClick={() => setShowPremiumModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 pb-2 border-b border-slate-100">
              <div className="inline-flex p-3 bg-amber-50 rounded-2xl text-amber-500 shadow-sm">
                <Sparkles className="w-7 h-7 fill-amber-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                {language === 'tr' ? 'Pro-Agri YZ Premium' : 'Pro-Agri AI Premium'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'tr' ? 'Sınırsız Özellikler & Reklamsız Deneyim' : 'Unlimited Features & Ad-Free Experience'}
              </p>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700 py-1">
              <div className="flex items-start gap-2.5">
                <div className="p-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">✓</div>
                <p>
                  <strong>{language === 'tr' ? 'Sıfır Reklam Deneyimi:' : 'Zero Ads Experience:'}</strong>{' '}
                  {language === 'tr' ? 'Tüm sponsorlu bannerlar ve dikkat dağıtıcılar gizlenir, sessiz odaklanma sağlanır.' : 'All sponsored banners and distractions are hidden for silent focusing.'}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">✓</div>
                <p>
                  <strong>{language === 'tr' ? 'Sınırsız YZ Analizi:' : 'Unlimited AI Analysis:'}</strong>{' '}
                  {language === 'tr' ? 'Ziraat mühendisi yapay zeka asistanı ile sınırsız chat ve anlık gübreleme tahmini.' : 'Unlimited chat with agronomy bot and instant fertilization prediction.'}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-0.5 bg-emerald-100 text-emerald-700 rounded-full shrink-0">✓</div>
                <p>
                  <strong>{language === 'tr' ? 'Öncelikli Destek:' : 'Priority Support:'}</strong>{' '}
                  {language === 'tr' ? 'Kooperatif içi öncelikli lojistik, tohum ve makine tedariği önceliği.' : 'Priority logistical, seeds, and machinery supply from your cooperative.'}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] font-bold text-amber-800 block font-mono uppercase">{language === 'tr' ? 'ÖZEL PLAN' : 'SPECIAL PLAN'}</span>
                <span className="text-base font-black text-slate-800 font-mono">249.99 TL / {language === 'tr' ? 'Ay' : 'Mo'}</span>
              </div>
              <span className="text-[9px] font-bold bg-amber-500 text-white px-2.5 py-1 rounded-full uppercase tracking-wider">
                {language === 'tr' ? 'Yıllık %30 İndirim' : '30% Annual Off'}
              </span>
            </div>

            <div className="space-y-2 text-center">
              {focusMode ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs font-bold">
                  {language === 'tr' ? '🎉 Premium Aboneliğiniz Aktif!' : '🎉 Your Premium Subscription is Active!'}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setFocusMode(true);
                    localStorage.setItem('proagri_focus_mode', 'true');
                    setShowPremiumModal(false);
                    alert(language === 'tr' ? 'Tebrikler! Premium Aboneliğiniz simüle edildi ve aktifleştirildi.' : 'Congratulations! Your Premium subscription has been simulated and activated.');
                  }}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center block"
                >
                  {language === 'tr' ? 'Premium Aboneliği Başlat' : 'Start Premium Subscription'}
                </button>
              )}
              <span className="text-[10px] text-slate-400 block pt-1 leading-snug">
                {language === 'tr' 
                  ? 'Online ödeme entegrasyonu hazırlandığı için deneme amaçlı aboneliği simüle edebilirsiniz.' 
                  : 'Since online payment integration is being prepared, you can simulate the subscription for testing.'}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
