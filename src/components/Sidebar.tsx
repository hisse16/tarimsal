import React, { useState } from 'react';
import { 
  Sprout, 
  RefreshCw, 
  Send, 
  BrainCircuit, 
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Field, Crop, User as UserType } from '../types';
import ConfirmationModal from './ConfirmationModal';
import AdBanner from './AdBanner';
import { useTranslation } from '../lib/i18n';

interface SidebarProps {
  activeField: Field | null;
  activeCrop: Crop | null;
  onSwitchField: () => void;
  onLogout: () => void;
  userEmail: string;
  currentUser: UserType | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenProfile: () => void;
  focusMode?: boolean;
}

export default function Sidebar({
  activeField,
  activeCrop,
  onSwitchField,
  onLogout,
  userEmail,
  currentUser,
  isCollapsed,
  onToggleCollapse,
  onOpenProfile,
  focusMode = false,
}: SidebarProps) {
  const { t, language } = useTranslation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'gemini'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userQuestion = question;
    setQuestion('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: userQuestion }]);
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          language, // send current language context to Gemini!
          crop: activeCrop?.name || 'Domates',
          stage: activeCrop?.currentStage || 'Gelişim',
          soilType: activeField?.soilType || 'Tınlı',
          city: activeField?.city || 'Bursa',
          district: activeField?.district || 'Nilüfer',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setChatHistory((prev) => [...prev, { sender: 'gemini', text: data.reply }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { sender: 'gemini', text: `Hata: ${data.error || 'Yanıt alınamadı.'}` },
        ]);
      }
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'gemini', text: language === 'tr' ? 'Teknik bağlantı hatası.' : 'Technical connection error.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarEmoji = () => {
    const avatarMap: { [key: string]: string } = {
      farmer_m1: '🧑‍🌾',
      farmer_m2: '👨‍🌾',
      farmer_w1: '👩‍🌾',
      agri_eng: '🧑‍🔬',
      tractor_p: '🚜',
      bee_p: '🐝',
    };
    return avatarMap[currentUser?.avatar || ''] || '🧑‍🌾';
  };

  return (
    <aside 
      className={`bg-white text-slate-800 flex flex-col h-screen border-r border-slate-150 transition-all duration-300 relative select-none shrink-0 ${
        isCollapsed ? 'w-0 overflow-hidden border-r-0' : 'w-80 border-r'
      }`}
    >
      {/* Toggle Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-6 -right-3 z-20 w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white border border-slate-200 flex items-center justify-center transition-all shadow-md cursor-pointer"
        title={isCollapsed ? "Yan Paneli Aç" : "Yan Paneli Kapat"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-150 flex items-center gap-3 ${isCollapsed ? 'justify-center p-4' : 'p-6'}`}>
        <div className="p-2 bg-emerald-600 rounded-xl text-white">
          <Sprout className="w-5 h-5" />
        </div>
        {!isCollapsed && (
          <div className="text-left">
            <h1 className="font-display font-bold text-lg tracking-tight text-slate-800 leading-none flex items-center gap-1.5">
              Pro-Agri YZ <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            </h1>
            <span className="text-[10px] text-slate-500 font-medium font-mono">
              {language === 'tr' ? 'Akıllı Tarım Portalı' : 'AI Sate-Guard Hub'}
            </span>
          </div>
        )}
      </div>

      {/* User Info */}
      <div className={`border-b border-slate-150 bg-emerald-50/20 ${isCollapsed ? 'p-3 flex justify-center' : 'p-4 px-6'}`}>
        {isCollapsed ? (
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center text-xl hover:scale-105 transition-all cursor-pointer"
            title="Profile"
          >
            {getAvatarEmoji()}
          </button>
        ) : (
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl select-none shadow-inner">
                {getAvatarEmoji()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {currentUser?.name || 'Farmer'}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-mono">
                  {currentUser?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onOpenProfile}
                className="flex-1 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                {language === 'tr' ? 'Detaylı Profilim' : 'Detailed Profile'}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-650 text-[10px] font-bold rounded-lg border border-red-200 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3 h-3 mx-auto" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!isCollapsed ? (
        <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto custom-scrollbar">
          
          {activeField ? (
            <div className="space-y-2.5 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  {t('active_field')}
                </h3>
                <button
                  onClick={onSwitchField}
                  className="text-[10px] text-emerald-650 hover:text-emerald-500 flex items-center gap-1 font-bold transition-all cursor-pointer animate-pulse"
                >
                  <RefreshCw className="w-3 h-3" /> {t('change_field')}
                </button>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                <div className="font-display font-bold text-sm text-slate-800">
                  {activeField.name}
                </div>
                <div className="text-[10px] text-slate-600 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span>{t('location')}:</span>
                    <span className="font-bold text-slate-800">
                      {activeField.city} / {activeField.district}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('total_area')}:</span>
                    <span className="font-bold text-slate-800">{activeField.totalArea} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('soil_type')}:</span>
                    <span className="font-bold text-slate-800">{activeField.soilType}</span>
                  </div>
                  {activeCrop && (
                    <>
                      <div className="border-t border-slate-200 my-2 pt-1.5" />
                      <div className="flex justify-between">
                        <span>{t('active_crop')}:</span>
                        <span className="font-bold text-emerald-650">{activeCrop.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('area_distribution')}:</span>
                        <span className="font-bold text-slate-800">{activeCrop.area} m²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('current_stage')}:</span>
                        <span className="font-bold text-emerald-650 truncate max-w-[120px]">
                          {activeCrop.currentStage}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
              No field is selected. Enter a field.
            </div>
          )}

          {/* Precision Analytics */}
          <div className="space-y-2 text-left">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
              {t('ai_accuracy_title')}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-150 text-center">
                <span className="text-[9px] text-slate-500 block font-mono">{t('accuracy')}</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">%91.4</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-150 text-center">
                <span className="text-[9px] text-slate-500 block font-mono">{t('mae')}</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">±3.2 L</span>
              </div>
            </div>
          </div>

          {/* Quick Chat */}
          <div className="flex-1 flex flex-col min-h-[220px] space-y-2 text-left">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-emerald-600" /> {language === 'tr' ? 'Ziraat Mühendisi (YZ)' : 'Agronomist AI Bot'}
            </h3>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl flex flex-col overflow-hidden">
              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-[11px] custom-scrollbar max-h-[160px]">
                {chatHistory.length === 0 ? (
                  <div className="text-slate-500 text-center py-4 font-medium">
                    {language === 'tr' ? 'Ürününüz, sulama durumunuz veya toprak tipi hakkında ziraat mühendisimize danışın.' : 'Consult our expert agronomist about crop development, soil quality or irrigation decisions.'}
                  </div>
                ) : (
                  chatHistory.map((chat, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg max-w-[90%] ${
                        chat.sender === 'user'
                          ? 'bg-emerald-650 text-white ml-auto'
                          : 'bg-white text-slate-800 mr-auto border border-slate-200 shadow-sm'
                      }`}
                    >
                      <span className="font-bold block mb-0.5 text-[9px] text-slate-400">
                        {chat.sender === 'user' ? 'Siz' : 'Ahmet Bey'}
                      </span>
                      <p className="whitespace-pre-line leading-relaxed">{chat.text}</p>
                    </div>
                  ))
                )}
                {loading && (
                  <div className="bg-slate-100 text-slate-505 p-2 rounded-lg mr-auto max-w-[90%] animate-pulse font-mono">
                    ...
                  </div>
                )}
              </div>

              <form onSubmit={handleAskGemini} className="p-1.5 border-t border-slate-200 bg-white flex gap-1.5">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={language === 'tr' ? 'Sorunuzu yazın...' : 'Ask a question...'}
                  disabled={loading}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!question.trim() || loading}
                  className="p-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>

          <AdBanner layout="sidebar" focusMode={focusMode} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center gap-6 pt-8 text-slate-400">
          <button 
            onClick={onToggleCollapse} 
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 transition-all cursor-pointer text-xl"
            title="Saha Detayları"
          >
            🌾
          </button>
          <button 
            onClick={onToggleCollapse} 
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 transition-all cursor-pointer"
            title="Chat"
          >
            <BrainCircuit className="w-5 h-5 text-emerald-600" />
          </button>
        </div>
      )}

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title={language === 'tr' ? 'Güvenli Çıkış Yap' : 'Log Out Securely'}
        message={language === 'tr' ? 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?' : 'Are you sure you want to end your current session?'}
        confirmText={language === 'tr' ? 'Evet, Çıkış Yap' : 'Yes, Log Out'}
        cancelText={language === 'tr' ? 'Vazgeç' : 'Cancel'}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </aside>
  );
}
