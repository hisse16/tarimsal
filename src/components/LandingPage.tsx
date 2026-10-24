import React from 'react';
import { 
  Sprout, 
  Leaf, 
  Map, 
  TrendingUp, 
  Users, 
  Activity, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle,
  Clock,
  ChevronRight,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { useTranslation, Language } from '../lib/i18n';

interface LandingPageProps {
  onEnterApp: () => void;
  onEnterAuth: () => void;
}

export default function LandingPage({ onEnterApp, onEnterAuth }: LandingPageProps) {
  const { t, language, setLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Ambient background rays */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08)_0%,transparent_55%)] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.04)_0%,transparent_60%)] pointer-events-none" />
      
      {/* Top Navbar with Language Switcher */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-900/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Sprout className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <span className="font-display font-black text-xl tracking-tight text-white flex items-center gap-1.5">
                Pro-Agri <span className="text-xs bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/20">SaaS</span>
              </span>
              <span className="text-[9px] text-slate-500 font-bold font-mono block tracking-wider">
                {language === 'tr' ? 'YAPAY ZEKA TARIM' : language === 'es' ? 'IA AGRICULTURA' : 'AI INTELLIGENT AGRICULTURE'}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              {language === 'tr' ? 'Özellikler' : language === 'es' ? 'Características' : 'Features'}
            </a>
            <a href="#technology" className="hover:text-white transition-colors">
              {language === 'tr' ? 'Yapay Zeka & GIS' : language === 'es' ? 'IA y GIS' : 'AI & GIS'}
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              {language === 'tr' ? 'Fiyatlandırma' : language === 'es' ? 'Precios' : 'Pricing'}
            </a>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="tr">TR (Türkçe)</option>
                <option value="en">EN (English)</option>
                <option value="es">ES (Español)</option>
              </select>
            </div>

            <button
              onClick={onEnterAuth}
              className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900/60 rounded-xl border border-slate-900 hover:border-slate-800 transition-all cursor-pointer"
            >
              {language === 'tr' ? 'Giriş Yap' : language === 'es' ? 'Ingresar' : 'Sign In'}
            </button>
            <button
              onClick={onEnterAuth}
              className="px-4 py-2 text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-[0_4px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] cursor-pointer flex items-center gap-1 group"
            >
              <span>{language === 'tr' ? 'Başla' : language === 'es' ? 'Comenzar' : 'Start'}</span> 
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
                {language === 'tr' ? 'YAPAY ZEKA DESTEKLİ HASAT OPTİMİZASYONU' : 'AI-POWERED SOWING & HARVEST OPTIMIZATION'}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-white tracking-tight leading-[1.1] !font-sans">
              {t('hero_title_1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-450 via-emerald-400 to-teal-400">
                {t('hero_title_2')}
              </span> <br />{t('hero_title_3')}
            </h1>

            <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-xl">
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={onEnterAuth}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs md:text-sm rounded-xl transition-all shadow-[0_4px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_35px_rgba(16,185,129,0.5)] cursor-pointer flex items-center gap-2 group"
              >
                {t('hero_btn_start')} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#features"
                className="px-5 py-3.5 text-xs md:text-sm font-bold text-slate-350 hover:text-white rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {t('hero_btn_features')}
              </a>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-900">
              <div>
                <span className="text-2xl md:text-3xl font-black text-white font-mono block">12.000+</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold mt-1 block">
                  {t('stat_users')}
                </span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-black text-white font-mono block">%35+</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold mt-1 block">
                  {t('stat_yield')}
                </span>
              </div>
              <div>
                <span className="text-2xl md:text-3xl font-black text-white font-mono block">850K+</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold mt-1 block">
                  {t('stat_area')}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Mockup */}
          <div className="lg:col-span-5 relative z-10">
            <div className="relative rounded-3xl border border-slate-850 bg-slate-900/60 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                  <span className="text-[10px] font-mono text-emerald-450 font-bold">CANLI SENTINEL SPEKTRUM</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono">Bursa / Nilüfer - 39.93° N</span>
              </div>

              <div className="space-y-4 pt-4">
                <div className="rounded-2xl bg-slate-950 p-4 border border-slate-900 relative">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">AKILLI PARSEL</span>
                      <span className="text-xs font-bold text-white">Nilüfer Ova Mevkii (Parsel #4)</span>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-900 text-emerald-400 font-mono">NDVI: 0.82</span>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Toprak Nemi</span>
                      <span className="text-blue-400">%64</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                      <div className="w-[64%] h-full bg-blue-500 rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>NPK Azot Seviyesi</span>
                      <span className="text-purple-400">Yüksek (72 ppm)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                      <div className="w-[85%] h-full bg-purple-500 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-950/20 border border-emerald-900/30 p-3.5 flex items-start gap-3">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-450 border border-emerald-500/20 shrink-0">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <div className="text-left text-xs leading-relaxed">
                    <strong className="text-emerald-400 block mb-0.5">Yapay Zeka Sulama Tavsiyesi:</strong>
                    "Önümüzdeki 3 gün yağış beklenmiyor. Toprak nemi kritik sınırın (%65) altına inmek üzere. Bu akşam saat 21:00 itibarıyla damlama sulama döngüsünü başlatın."
                  </div>
                </div>

                <button
                  onClick={onEnterAuth}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-slate-350 hover:text-white border border-slate-850 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Giriş Yaparak Tarlanı Ekle <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">
              {language === 'tr' ? 'PREMİUM MODÜLLER VE ÖZELLİKLER' : 'PREMIUM MODULES & FEATURES'}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white font-display">
              {language === 'tr' ? 'Tarımsal Gücü Tek Panelden Yönetin' : 'Intelligent Farming Power Combined'}
            </h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              {language === 'tr' 
                ? 'Profesyonel tarım analistlerinin ve kooperatif birliklerinin kullandığı modern veri teknolojilerini, her çiftçinin kolayca anlayabileceği sade bir arayüze sığdırdık.'
                : 'We compiled state-of-the-art satellite analysis systems into a very sleek and straightforward agricultural layout designed for every family or enterprise.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="bg-slate-900/40 hover:bg-slate-900 border border-slate-900 p-6 rounded-2xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-450 rounded-xl w-12 h-12 flex items-center justify-center">
                  <Map className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-bold font-display text-white text-base">Sentinel GIS Coğrafi Bilgi Sistemi</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  İllerden ilçelere, mahallelerden bireysel tapu ve parsel düzeylerine kadar inen spektral analiz haritaları. NDVI, toprak nemi ve klorofil ısı haritaları tek tıkla elinizde.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/40 hover:bg-slate-900 border border-slate-900 p-6 rounded-2xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-450 rounded-xl w-12 h-12 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-bold font-display text-white text-base">Yapay Zeka Destekli Reçeteler</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toprağınızın türüne, ekili mahsulün cinsine ve fenolojik gelişim aşamasına özel NPK gübreleme reçeteleri ve akıllı sulama zamanlamaları.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/40 hover:bg-slate-900 border border-slate-900 p-6 rounded-2xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-450 rounded-xl w-12 h-12 flex items-center justify-center">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="font-bold font-display text-white text-base">Dijital Kooperatif Ağı</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Bölgenizdeki diğer üreticilerle bir araya gelerek ortak girdi alımları yapın, traktör ekipmanlarını paylaşın ve kooperatif odalarında canlı konuşun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Technology */}
      <section id="technology" className="py-20 border-t border-slate-900 bg-slate-950/40 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="order-2 lg:order-1 relative">
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-4 relative overflow-hidden">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-extrabold">YAPAY ZEKA KAMERA TARAMASI</span>
                <h3 className="text-sm font-bold text-white font-display">Hastalık ve Haşere Teşhisi</h3>
                
                <div className="aspect-[4/3] bg-slate-950 rounded-xl border border-slate-900 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-[bounce_3s_infinite]" />
                  <div className="text-center p-6 space-y-3">
                    <Leaf className="w-12 h-12 text-emerald-400 mx-auto opacity-70" />
                    <span className="text-xs text-slate-400 block">Kamera Görüntüsü Analiz Ediliyor...</span>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-900 text-left">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-red-400">⚠️ Teşhis Edilen: Mildiyö (Yaprak Küfü)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Doğruluk: %94</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider">HASSAS TARIM METOLOJİSİ</span>
              <h2 className="text-3xl font-extrabold text-white font-display leading-tight">Zamanında ve Noktasal <br />Müdahale Teknolojisi</h2>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                Bitkilerinizin dertlerini henüz gözle görülür hale gelmeden tespit ediyoruz. Sentinel uydularının 5 günde bir sunduğu spektral tazelemeleri yapay zekamız işler ve tarlanızdaki her parselin sağlık durumunu anlık olarak raporlar.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-900 bg-slate-950 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider font-extrabold">ŞEFFAF, KOLAY PLANLAR</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white font-display">Tüm Tarım Seviyelerine Uygun Paketler</h2>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              İster hobi amaçlı küçük bir tarlanız olsun, ister binlerce dönümü kontrol eden büyük bir tarım kooperatifi, sizin için en uygun paket hazır.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-8 text-left space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-slate-500 font-bold uppercase">GİRİŞ SEVİYESİ</span>
                  <h3 className="text-lg font-bold text-white mt-1">Standart Çiftçi</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">₺0</span>
                  <span className="text-slate-500 text-xs">/ Ömür boyu</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tek tarla yönetimi, temel hava durumu ve sulama günlüğü tutmak isteyen küçük üreticiler için ideal.
                </p>
                <div className="w-full h-px bg-slate-850" />
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">✓ Tek Sınırlı Tarla</li>
                  <li className="flex items-center gap-2">✓ Manuel Sulama Girişi</li>
                </ul>
              </div>
              <button onClick={onEnterAuth} className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">Başla</button>
            </div>

            <div className="bg-emerald-950/20 border-2 border-emerald-500/50 rounded-2xl p-8 text-left space-y-6 flex flex-col justify-between relative shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-mono font-black text-[9px] uppercase px-3.5 py-1 rounded-full tracking-wider">
                EN ÇOK TERCİH EDİLEN
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-emerald-450 font-bold uppercase">SAAS AVANTAJI</span>
                  <h3 className="text-lg font-bold text-white mt-1">Premium Çiftçi</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">₺149</span>
                  <span className="text-slate-400 text-xs">/ Aylık</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tüm arazi büyüklükleri için gelişmiş NDVI spektral uydularını, toprak analizlerini ve kooperatif ağlarını aktif eden en popüler paket.
                </p>
                <div className="w-full h-px bg-emerald-900/30" />
                <ul className="space-y-3 text-xs text-slate-200">
                  <li className="flex items-center gap-2">✓ Sınırsız Tarla & Mahsul Ekleme</li>
                  <li className="flex items-center gap-2">✓ Sentinel Uydu GIS Harita Katmanları</li>
                  <li className="flex items-center gap-2">✓ Yapay Zeka Hastalık Taraması (Sınırsız)</li>
                </ul>
              </div>
              <button onClick={onEnterAuth} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer">Satın Al</button>
            </div>

            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-8 text-left space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono text-slate-500 font-bold uppercase">AKADEMİK & EKİP</span>
                  <h3 className="text-lg font-bold text-white mt-1">Yönetici / Agronomist</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">₺499</span>
                  <span className="text-slate-500 text-xs">/ Aylık</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ziraat Mühendisleri, tarım danışmanları ve kooperatif yöneticileri için geliştirilmiş detaylı yönetim paneli ve yetki yönetim araçları.
                </p>
              </div>
              <button onClick={onEnterAuth} className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition-all cursor-pointer">Bizimle Görüşün</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-12 px-6 text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-slate-300">© 2026 Pro-Agri SaaS Inc. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}</span>
          </div>
          <div className="flex gap-6 font-mono text-xs">
            <a href="#" className="hover:text-emerald-400 transition-colors">KVKK & Gizlilik</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">İletişim</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
