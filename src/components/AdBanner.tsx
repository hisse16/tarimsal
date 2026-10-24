import React, { useState, useEffect } from 'react';
import { Sparkles, DollarSign, Settings, HelpCircle, X, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface SponsorAd {
  id: string;
  brand: string;
  title: { tr: string; en: string; es: string };
  description: { tr: string; en: string; es: string };
  cta: { tr: string; en: string; es: string };
  url: string;
  rewardAmount: number;
  logoEmoji: string;
}

const SPONSOR_ADS: SponsorAd[] = [
  {
    id: 'ad1',
    brand: 'GÜBRETAŞ',
    title: {
      tr: 'Yeni Nesil NPK Damla Gübreleri',
      en: 'New Generation NPK Drip Fertilizers',
      es: 'Fertilizantes de Goteo NPK de Nueva Generación'
    },
    description: {
      tr: 'Tarlalarda %25 verim artışı sağlayan çevre dostu organik gübreler.',
      en: 'Eco-friendly organic fertilizers yielding 25% extra efficiency.',
      es: 'Fertilizantes orgánicos ecológicos que rinden un 25% más de eficiencia.'
    },
    cta: {
      tr: 'Siparişe Özel %15 İndirim',
      en: 'Get Special 15% Off',
      es: 'Obtenga un 15% de Descuento Especial'
    },
    url: 'https://www.gubretas.com.tr/',
    rewardAmount: 1.25,
    logoEmoji: '🧪'
  },
  {
    id: 'ad2',
    brand: 'JOHN DEERE',
    title: {
      tr: '5E Serisi Kompakt Traktörler',
      en: '5E Series Compact Tractors',
      es: 'Tractores Compactos Serie 5E'
    },
    description: {
      tr: 'Küçük tarlalar için devasa güç. Sıfır faiz ve uzun vade kredi imkanı.',
      en: 'Colossal power for small fields. Zero interest and long-term financing options.',
      es: 'Potencia colosal para campos pequeños. Cero interés y opciones de financiación a largo plazo.'
    },
    cta: {
      tr: 'Fiyat Teklifi Al',
      en: 'Request Quote',
      es: 'Solicitar Presupuesto'
    },
    url: 'https://www.deere.com.tr/',
    rewardAmount: 2.50,
    logoEmoji: '🚜'
  },
  {
    id: 'ad3',
    brand: 'HEKTAŞ',
    title: {
      tr: 'Akıllı Damla Sulama Koruyucuları',
      en: 'Smart Drip Irrigation Protectors',
      es: 'Protectores de Riego por Goteo Inteligente'
    },
    description: {
      tr: 'Mantari ve böcek zararlılarına karşı su tasarruflu sıvı bitki koruma çözümleri.',
      en: 'Water-saving liquid crop protection formulas against fungal and insect pests.',
      es: 'Fórmulas líquidas de protección de cultivos que ahorran agua contra plagas de hongos e insectos.'
    },
    cta: {
      tr: 'Ürün Kataloğunu İncele',
      en: 'Inspect Catalogue',
      es: 'Inspeccionar Catálogo'
    },
    url: 'https://www.hektas.com.tr/',
    rewardAmount: 1.50,
    logoEmoji: '🛡️'
  },
  {
    id: 'ad4',
    brand: 'TOROS GÜBRE',
    title: {
      tr: 'Kalsiyum Amonyum Nitrat (CAN %26)',
      en: 'Calcium Ammonium Nitrate (CAN 26%)',
      es: 'Nitrato de Calcio y Amonio (CAN 26%)'
    },
    description: {
      tr: 'Hızlı çözünür azot ile çimlenme evresinde maksimum canlı gelişim desteği.',
      en: 'Fast-dissolving nitrogen for maximum vegetative growth support during germination.',
      es: 'Nitrógeno de rápida disolución para un máximo soporte del crecimiento vegetativo durante la germinación.'
    },
    cta: {
      tr: 'Size En Yakın Bayiyi Bul',
      en: 'Locate Nearest Dealer',
      es: 'Localizar Distribuidor Cercano'
    },
    url: 'https://www.toros.com.tr/',
    rewardAmount: 1.10,
    logoEmoji: '🌱'
  }
];

interface AdBannerProps {
  layout?: 'horizontal' | 'sidebar';
  focusMode?: boolean;
}

export default function AdBanner({ layout = 'horizontal', focusMode = false }: AdBannerProps) {
  const { language } = useTranslation();
  const [currentAd, setCurrentAd] = useState<SponsorAd | null>(null);
  const [adSenseClient, setAdSenseClient] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState<number>(() => {
    const saved = localStorage.getItem('proagri_ad_earnings');
    return saved ? parseFloat(saved) : 0;
  });
  const [showClickAlert, setShowClickAlert] = useState<{ active: boolean; adName: string; amount: number } | null>(null);

  // Focus Mode layout overrides
  if (focusMode) {
    if (layout === 'sidebar') {
      return (
        <div className="w-full bg-emerald-50/50 border border-emerald-150/45 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-1 shadow-sm">
          <span className="text-xl">🧘</span>
          <h4 className="text-[11px] font-bold text-emerald-800">
            {language === 'tr' ? 'Odak Modu Aktif' : language === 'es' ? 'Modo Foco Activo' : 'Focus Mode Active'}
          </h4>
          <p className="text-[9px] text-emerald-600 leading-snug">
            {language === 'tr' 
              ? 'Sponsorlu reklamlar ve tüm dikkat dağıtıcı öğeler gizlendi.' 
              : language === 'es' 
              ? 'Los anuncios patrocinados y los elementos de distracción se ocultan.' 
              : 'Sponsored advertisements and all distracting elements are hidden.'}
          </p>
        </div>
      );
    }

    return (
      <div className="w-full bg-emerald-50/40 border border-emerald-150/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm shadow-inner shrink-0">
            🧘
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-emerald-800 leading-none">
              {language === 'tr' ? 'Odak Modu Etkinleştirildi' : language === 'es' ? 'Modo Foco Activado' : 'Focus Mode Activated'}
            </h4>
            <p className="text-[10px] text-emerald-600 leading-relaxed mt-1">
              {language === 'tr' 
                ? 'Premium deneyim: Reklamlar, sponsorlar ve harici uyarıcılar geçici olarak devre dışı bırakıldı.' 
                : language === 'es' 
                ? 'Experiencia premium: Anuncios, patrocinadores y alertas externas temporalmente desactivados.' 
                : 'Premium experience: Ads, sponsors, and external triggers have been temporarily disabled.'}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-bold text-emerald-700 bg-white/60 border border-emerald-200/50 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider">
          {language === 'tr' ? 'PREMİUM SESSİZLİK' : language === 'es' ? 'SILENCIO PREMIUM' : 'PREMIUM SILENCE'}
        </span>
      </div>
    );
  }

  // Rotate sponsor ads every 30 seconds
  useEffect(() => {
    const pickRandomAd = () => {
      const idx = Math.floor(Math.random() * SPONSOR_ADS.length);
      setCurrentAd(SPONSOR_ADS[idx]);
    };
    pickRandomAd();
    const interval = setInterval(pickRandomAd, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check for .env variables or local config
  useEffect(() => {
    const envClient = (import.meta as any).env?.VITE_ADSENSE_CLIENT || '';
    if (envClient) {
      setAdSenseClient(envClient);
    } else {
      const savedClient = localStorage.getItem('proagri_adsense_client');
      if (savedClient) {
        setAdSenseClient(savedClient);
      }
    }
  }, []);

  // Google AdSense Dynamic Injection
  useEffect(() => {
    if (adSenseClient) {
      try {
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + adSenseClient;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);

        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (e) {
        console.warn('Google AdSense script injection paused or blocked:', e);
      }
    }
  }, [adSenseClient]);

  const handleAdClick = (ad: SponsorAd) => {
    const newEarnings = totalEarnings + ad.rewardAmount;
    setTotalEarnings(newEarnings);
    localStorage.setItem('proagri_ad_earnings', newEarnings.toFixed(2));

    setShowClickAlert({
      active: true,
      adName: ad.brand,
      amount: ad.rewardAmount
    });

    setTimeout(() => {
      setShowClickAlert(null);
    }, 4500);
  };

  const saveAdSenseConfig = (client: string) => {
    setAdSenseClient(client);
    localStorage.setItem('proagri_adsense_client', client);
    setShowConfig(false);
  };

  if (!currentAd) return null;

  const adTitle = currentAd.title[language] || currentAd.title['tr'];
  const adDesc = currentAd.description[language] || currentAd.description['tr'];
  const adCta = currentAd.cta[language] || currentAd.cta['tr'];

  // Sidebar Layout style
  if (layout === 'sidebar') {
    return (
      <div className="w-full relative mt-1">
        {showClickAlert && (
          <div className="absolute inset-0 z-30 bg-emerald-900/95 text-white p-3 rounded-2xl flex flex-col justify-center items-center text-center animate-in fade-in duration-250">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1 animate-bounce" />
            <span className="text-[11px] font-bold">
              {language === 'tr' ? 'Simüle Gelir Eklendi!' : language === 'es' ? '¡Ingreso Simulado!' : 'Simulated Income Added!'}
            </span>
            <span className="text-[13px] font-extrabold text-emerald-300">+{showClickAlert.amount.toFixed(2)} TL</span>
            <span className="text-[9px] text-emerald-200 mt-0.5">{showClickAlert.adName} Sponsorluğu</span>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 relative overflow-hidden flex flex-col gap-2 hover:border-brand-300 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold bg-slate-200/60 text-slate-500 px-1.5 py-0.5 rounded font-mono tracking-wide">
              {language === 'tr' ? 'SPONSOR REKLAM' : language === 'es' ? 'PATROCINIO' : 'SPONSOR'}
            </span>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setShowConfig(!showConfig)} 
                className="text-slate-400 hover:text-brand-600 transition-colors"
                title="Google AdSense"
              >
                <Settings className="w-3 h-3 cursor-pointer" />
              </button>
              <div className="flex items-center text-emerald-600 text-[9px] font-bold font-mono">
                <DollarSign className="w-3 h-3 shrink-0" />
                <span>{totalEarnings.toFixed(2)} TL</span>
              </div>
            </div>
          </div>

          {adSenseClient ? (
            <div className="min-h-[100px] flex flex-col items-center justify-center bg-white border border-dashed border-slate-200 rounded-lg p-2 text-center">
              <ins className="adsbygoogle"
                   style={{ display: 'block', minHeight: '100px' }}
                   data-ad-client={adSenseClient}
                   data-ad-slot="sidebar-auto"
                   data-ad-format="auto"
                   data-full-width-responsive="true" />
              <span className="text-[8px] text-slate-400 mt-1 font-mono">Google AdSense: {adSenseClient}</span>
            </div>
          ) : (
            <a 
              href={currentAd.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => handleAdClick(currentAd!)}
              className="group block text-left"
            >
              <div className="flex gap-2 items-start">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-lg shadow-inner shrink-0">
                  {currentAd.logoEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-[10px] font-extrabold text-slate-500 uppercase font-mono tracking-wider mb-0.5">
                    {currentAd.brand}
                  </h5>
                  <h4 className="text-[11px] font-bold text-slate-800 leading-snug group-hover:text-brand-700 transition-colors truncate">
                    {adTitle}
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-tight line-clamp-2 mt-0.5">
                    {adDesc}
                  </p>
                </div>
              </div>
              
              <div className="mt-2.5 flex items-center justify-between bg-white border border-slate-100 p-1 px-2 rounded-lg text-[10px] font-bold text-brand-700 group-hover:bg-brand-50 group-hover:text-brand-850 transition-all">
                <span>{adCta}</span>
                <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 py-0.5 rounded-md font-mono shrink-0">
                  +{currentAd.rewardAmount.toFixed(2)} TL
                </span>
              </div>
            </a>
          )}

          {showConfig && (
            <div className="absolute inset-0 bg-white/95 z-20 p-3 flex flex-col justify-between animate-in fade-in duration-200">
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span className="text-[10px] font-extrabold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                    Google AdSense
                  </span>
                  <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed">
                  Enter your Publisher ID (e.g. <code className="bg-slate-100 p-0.5 rounded font-mono text-[8px]">ca-pub-XXXXXXXXXX</code>) to host Google Ads:
                </p>
                <input 
                  type="text" 
                  defaultValue={adSenseClient}
                  placeholder="ca-pub-1234567890"
                  id="adsense-client-input"
                  className="w-full px-2 py-1 border border-slate-200 rounded text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="flex gap-1.5 justify-end">
                <button 
                  onClick={() => saveAdSenseConfig('')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-bold cursor-pointer"
                >
                  {language === 'tr' ? 'Sıfırla' : 'Reset'}
                </button>
                <button 
                  onClick={() => {
                    const val = (document.getElementById('adsense-client-input') as HTMLInputElement)?.value || '';
                    saveAdSenseConfig(val);
                  }}
                  className="px-2 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded text-[9px] font-bold cursor-pointer"
                >
                  {language === 'tr' ? 'Kaydet' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Horizontal Layout
  return (
    <div className="w-full relative">
      {showClickAlert && (
        <div className="absolute inset-0 z-35 bg-brand-900/95 text-white p-3 rounded-2xl flex items-center justify-center gap-3 animate-in fade-in duration-250">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
          <span className="text-xs font-bold">
            {language === 'tr' ? 'Sponsor Geliri Eklendi!' : language === 'es' ? '¡Ingreso Añadido!' : 'Sponsor Revenue Added!'}
          </span>
          <span className="text-sm font-extrabold text-emerald-300">+{showClickAlert.amount.toFixed(2)} TL</span>
          <span className="text-[10px] text-emerald-100">({showClickAlert.adName} Sponsor)</span>
        </div>
      )}

      <div className="bg-white border border-slate-150 rounded-2xl p-3.5 relative overflow-hidden flex flex-col md:flex-row gap-3 items-center hover:border-brand-200 transition-all shadow-sm">
        <div className="w-full md:w-auto flex md:flex-col justify-between md:justify-center items-center gap-1 border-b md:border-b-0 md:border-r border-slate-100 pb-2 md:pb-0 md:pr-4 shrink-0">
          <span className="text-[8px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono tracking-wider">
            {language === 'tr' ? 'REKLAM' : language === 'es' ? 'ANUNCIO' : 'AD'}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-brand-600"
              title="Google AdSense Setup"
            >
              <Settings className="w-3.5 h-3.5 cursor-pointer" />
            </button>
            <div className="flex items-center text-emerald-600 text-[10px] font-extrabold font-mono">
              <DollarSign className="w-3 h-3 shrink-0" />
              <span>{totalEarnings.toFixed(2)} TL</span>
            </div>
          </div>
        </div>

        {adSenseClient ? (
          <div className="flex-1 w-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2 min-h-[50px] text-center">
            <ins className="adsbygoogle"
                 style={{ display: 'inline-block', width: '100%', minHeight: '50px' }}
                 data-ad-client={adSenseClient}
                 data-ad-slot="horizontal-auto"
                 data-ad-format="auto"
                 data-full-width-responsive="true" />
            <span className="text-[8px] text-slate-400 font-mono">Google AdSense Active ({adSenseClient})</span>
          </div>
        ) : (
          <a 
            href={currentAd.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={() => handleAdClick(currentAd!)}
            className="flex-1 w-full flex flex-col md:flex-row gap-3 items-center group cursor-pointer text-center md:text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shadow-inner shrink-0">
              {currentAd.logoEmoji}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center md:justify-start gap-1.5">
                <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-widest font-mono">
                  {currentAd.brand}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full hidden md:inline-block" />
                <span className="text-[10px] font-bold text-slate-400 font-mono hidden md:inline-block">
                  {language === 'tr' ? 'Sponsorlu İşbirliği' : language === 'es' ? 'Asociación Patrocinada' : 'Sponsored Collaboration'}
                </span>
              </div>
              <h4 className="text-xs md:text-sm font-bold text-slate-800 leading-tight group-hover:text-brand-700 transition-colors mt-0.5 truncate">
                {adTitle}
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                {adDesc}
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto flex flex-col items-center gap-1.5">
              <span className="w-full md:w-auto text-center px-4 py-1.5 bg-brand-600 hover:bg-brand-700 group-hover:scale-103 text-white rounded-xl text-[11px] font-bold transition-all shadow-sm">
                {adCta}
              </span>
              <span className="text-[8px] text-slate-400 font-mono font-bold">
                {language === 'tr' ? 'Tıklama Ödülü:' : 'Reward:'} <strong className="text-emerald-600">+{currentAd.rewardAmount.toFixed(2)} TL</strong>
              </span>
            </div>
          </a>
        )}

        {showConfig && (
          <div className="absolute inset-0 bg-white/98 z-20 p-4 flex flex-col justify-between animate-in fade-in duration-200 border border-brand-200 rounded-2xl text-left">
            <div className="space-y-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  Google AdSense Publishing
                </span>
                <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Connect your AdSense client ID to monetize this banner space with real Google advertisements:
              </p>
              <div className="flex items-center gap-2 mt-2">
                <label className="text-[10px] font-bold text-slate-500 font-mono uppercase">Publisher ID:</label>
                <input 
                  type="text" 
                  defaultValue={adSenseClient}
                  placeholder="ca-pub-1234567890"
                  id="adsense-client-input-horiz"
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50"
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
              <button 
                onClick={() => saveAdSenseConfig('')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold cursor-pointer"
              >
                {language === 'tr' ? 'Sıfırla' : 'Reset'}
              </button>
              <button 
                onClick={() => {
                  const val = (document.getElementById('adsense-client-input-horiz') as HTMLInputElement)?.value || '';
                  saveAdSenseConfig(val);
                }}
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-[10px] font-bold cursor-pointer shadow-sm"
              >
                {language === 'tr' ? 'Entegrasyonu Kaydet' : 'Save Connection'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
