import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, X, Send, Compass, Sparkles, MessageSquare, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { useTranslation, Language } from '../lib/i18n';

interface GuideMessage {
  sender: 'user' | 'guide';
  text: string;
  timestamp: string;
  suggestedTab?: string | null;
}

const PRESET_QUESTIONS_DICTIONARY: {
  [lang in Language]: { label: string; text: string }[]
} = {
  tr: [
    { label: '💧 Sulama zamanı/tahmini nerede?', text: 'Ne zaman sulama yapacağımı nereden öğrenebilirim? Sulama tahmini ve tarlamın nem durumunu nerede görebilirim?' },
    { label: '🛡️ Hastalık teşhisi nasıl yapılır?', text: 'Bitkimin yaprağındaki hastalık teşhisini nereden ve nasıl yapabilirim? Fotoğraf yükleme ekranı nerede?' },
    { label: '🌾 Tarla veya ürün nasıl eklenir?', text: 'Yeni bir tarla eklemek veya tarladaki ürünün büyüme evresini güncellemek için ne yapmalıyım?' },
    { label: '💰 Günlük hal fiyatları nerede?', text: 'Günlük meyve sebze hal pazar fiyatlarını ve grafiklerini nereden görebilirim?' },
    { label: '🤝 Diğer çiftçilerle mesajlaşma?', text: 'Diğer çiftçilerle nasıl konuşabilirim? Kooperatif yardımlaşma ekranı nerede?' },
  ],
  en: [
    { label: '💧 Where is irrigation forecast?', text: 'Where can I see when to irrigate my fields? Where is the soil moisture and climate forecast?' },
    { label: '🛡️ How to diagnose diseases?', text: 'How do I run a computer vision scan to diagnose plant leaf diseases? Where is the camera upload screen?' },
    { label: '🌾 How to add fields or crops?', text: 'How do I register a new land plot or update the growth stage of my crop sown?' },
    { label: '💰 Where are daily produce rates?', text: 'Where can I inspect wholesale produce market price charts and daily cargo shipment rates?' },
    { label: '🤝 How to chat with other farmers?', text: 'How do I send messages and cooperative help announcements to other farmers?' },
  ],
  es: [
    { label: '💧 ¿Dónde está el pronóstico de riego?', text: '¿Dónde puedo ver cuándo regar mis campos? ¿Dónde está el pronóstico de humedad del suelo?' },
    { label: '🛡️ ¿Cómo diagnosticar enfermedades?', text: '¿Cómo ejecuto un escaneo para diagnosticar enfermedades de las hojas? ¿Dónde está el cargador de fotos?' },
    { label: '🌾 ¿Cómo agregar campos o cultivos?', text: '¿Cómo registro un nuevo terreno o actualizo la etapa de crecimiento de mi cultivo?' },
    { label: '💰 ¿Dónde están los precios diarios?', text: '¿Dónde puedo inspeccionar los gráficos de precios del mercado de productos frescos?' },
    { label: '🤝 ¿Cómo chatear con agricultores?', text: '¿Cómo envío mensajes y anuncios de ayuda cooperativa a otros agricultores?' },
  ]
};

const WELCOME_MESSAGES = {
  tr: 'Merhaba! Ben **ProAgri Akıllı Tarım Platform Rehberi** 🌾\n\nPlatformda aradığınız her özelliği, menüyü ve sayfayı size bulabilirim. Örneğin bana şu sorulardan birini sorabilirsiniz:\n\n- *"Hastalık teşhisini nereden yaparım?"*\n- *"Ne zaman sulama yapacağımı nereden görebilirim?"*\n- *"Yeni bir tarla nasıl eklerim?"*\n\nSize doğrudan butonlar sunarak gitmek istediğiniz sayfaya anında yönlendirebilirim! Hazırsanız sorunuzu bekliyorum.',
  en: 'Hello! I am the **ProAgri Intelligent Agriculture Guide** 🌾\n\nI can locate any feature, tab, or screen you are looking for. For example, you can ask me:\n\n- *"Where do I diagnose leaf diseases?"*\n- *"Where can I see my irrigation plan?"*\n- *"How to register a new field plot?"*\n\nI will instantly guide you to the exact tab with automated shortcuts! Ask me anything.',
  es: '¡Hola! Soy la **Guía de la Plataforma de Agricultura Inteligente ProAgri** 🌾\n\nPuedo localizar cualquier función o pantalla que esté buscando. Por ejemplo, puede preguntarme:\n\n- *"¿Dónde diagnostico enfermedades de las hojas?"*\n- *"¿Dónde puedo ver mi plan de riego?"*\n- *"¿Cómo registro un nuevo campo?"*\n\n¡Le guiaré instantáneamente con accesos directos automáticos! Pregúnteme lo que quiera.'
};

interface AppGuideWidgetProps {
  activeTab: string;
  setActiveTab: (tabId: any) => void;
}

export default function AppGuideWidget({ activeTab, setActiveTab }: AppGuideWidgetProps) {
  const { language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<GuideMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a language-specific welcome message
  useEffect(() => {
    const saved = localStorage.getItem(`proagri_guide_chat_${language}`);
    if (saved) {
      setHistory(JSON.parse(saved));
    } else {
      const initialMsg: GuideMessage = {
        sender: 'guide',
        text: WELCOME_MESSAGES[language] || WELCOME_MESSAGES['tr'],
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory([initialMsg]);
    }
  }, [language]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(`proagri_guide_chat_${language}`, JSON.stringify(history));
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, language]);

  const handleAsk = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: GuideMessage = { sender: 'user', text: textToSend, timestamp };
    setHistory(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          language, // send user language context to prompt Gemini on guide instructions!
          history: history.slice(-8).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const data = await response.json();
      const botTimestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

      if (response.ok) {
        setHistory(prev => [...prev, {
          sender: 'guide',
          text: data.reply,
          timestamp: botTimestamp,
          suggestedTab: data.suggestedTab
        }]);
      } else {
        const errorFallbackText = {
          tr: 'Üzgünüm, rehber sisteminde geçici bir aksaklık oldu. İstediğiniz sayfaya üst menüden manuel olarak geçiş yapabilirsiniz.',
          en: 'Sorry, the guide bot is temporarily offline. You can manually navigate using the top tabs.',
          es: 'Lo sentimos, el bot de guía está fuera de línea. Puede navegar manualmente usando las pestañas superiores.'
        };
        setHistory(prev => [...prev, {
          sender: 'guide',
          text: errorFallbackText[language] || errorFallbackText['en'],
          timestamp: botTimestamp
        }]);
      }
    } catch (err) {
      console.error(err);
      const botTimestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [...prev, {
        sender: 'guide',
        text: language === 'tr' ? 'Bağlantı hatası yaşandı. İnternetinizi kontrol edin.' : 'Connection failure. Inspect your internet.',
        timestamp: botTimestamp
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getTabLabel = (tabId: string) => {
    switch (tabId) {
      case 'analiz': return language === 'tr' ? '💧 Akıllı Analiz' : language === 'es' ? '💧 Análisis Inteligente' : '💧 Smart Analysis';
      case 'asistan': return language === 'tr' ? '🤖 YZ Asistanı' : language === 'es' ? '🤖 Asistente de IA' : '🤖 AI Assistant';
      case 'gubre': return language === 'tr' ? '🧪 Gübreleme' : language === 'es' ? '🧪 Fertilización' : '🧪 Fertilization';
      case 'saglik': return language === 'tr' ? '🛡️ YZ Bitki Sağlığı' : language === 'es' ? '🛡️ IA Salud de Plantas' : '🛡️ AI Plant Health';
      case 'pazar': return language === 'tr' ? '💰 Hal Pazar' : language === 'es' ? '💰 Mercado Central' : '💰 Produce Market';
      case 'kooperatif': return language === 'tr' ? '🤝 Kooperatif' : language === 'es' ? '🤝 Cooperativa' : '🤝 Cooperative';
      case 'harita': return '🗺️ Tarım Haritası';
      case 'kayitlar': return '📝 Kayıtlar';
      case 'tumkodlar': return '💻 Tüm Kodlar (TXT)';
      default: return 'Giriş';
    }
  };

  // Safe markdown render helper
  const renderText = (txt: string) => {
    return txt.split('\n').map((line, idx) => {
      let renderedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      const parts = [];
      let lastIndex = 0;

      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(renderedLine.substring(lastIndex, match.index));
        parts.push(<strong key={match.index} className="font-extrabold text-slate-900">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(renderedLine.substring(lastIndex));

      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'mb-1.5 leading-relaxed'}>
          {parts.length > 1 ? parts : line}
        </p>
      );
    });
  };

  const presetQuestions = PRESET_QUESTIONS_DICTIONARY[language] || PRESET_QUESTIONS_DICTIONARY['tr'];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {isOpen && (
        <div className="w-[340px] md:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          <div className="p-4 bg-brand-700 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-left">
              <div className="p-2 bg-white/10 rounded-xl">
                <Compass className="w-5 h-5 text-brand-200 animate-spin-slow" />
              </div>
              <div>
                <h4 className="text-xs md:text-sm font-bold tracking-tight">
                  {language === 'tr' ? 'ProAgri Kılavuz Asistanı' : language === 'es' ? 'Asistente de Guía' : 'ProAgri Platform Guide'}
                </h4>
                <p className="text-[10px] text-brand-200 font-medium">
                  {language === 'tr' ? 'Uygulama İçi Akıllı Yönlendirici' : 'Interactive Map & App Shortcuts'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg text-brand-200 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-4 text-xs md:text-sm text-left">
            {history.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-mono text-gray-400 font-semibold">{msg.timestamp}</span>
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    {msg.sender === 'user' ? (language === 'tr' ? 'SİZ' : 'YOU') : 'PROAGRİ'}
                  </span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-[90%] shadow-sm text-left ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {renderText(msg.text)}

                  {msg.sender === 'guide' && msg.suggestedTab && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-left">
                      <span className="text-[10px] font-bold text-gray-400 block uppercase font-mono">
                        {language === 'tr' ? 'Pratik Kısayol:' : 'Quick Shortcut:'}
                      </span>
                      <button
                        onClick={() => {
                          setActiveTab(msg.suggestedTab);
                        }}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 hover:text-brand-800 rounded-xl transition-all border border-brand-200/50 font-bold text-[11px] cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                          <span className="truncate">{getTabLabel(msg.suggestedTab)}</span>
                        </span>
                        <ArrowRightCircle className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs italic">
                <Compass className="w-4 h-4 animate-spin text-brand-500" />
                <span>Searching guide...</span>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          <div className="px-3 py-2 bg-white border-t border-slate-100 text-left">
            <span className="text-[9px] font-bold text-gray-400 block mb-1 uppercase font-mono tracking-wider">
              {language === 'tr' ? 'Sık Sorulanlar:' : 'FAQ:'}
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
              {presetQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q.text)}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-[10px] text-slate-600 hover:text-slate-800 rounded-lg whitespace-nowrap border border-slate-200/40 transition-all font-medium cursor-pointer shrink-0"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(question);
            }}
            className="p-3 border-t border-slate-100 bg-white flex gap-2 items-center"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={language === 'tr' ? 'Uygulamada bir özelliği sorun...' : 'Ask about a specific feature...'}
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-slate-50/50 text-slate-800"
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-100 disabled:text-slate-350 text-white rounded-xl transition-all cursor-pointer shadow-sm shrink-0 flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <HelpCircle className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-xs font-bold tracking-tight pr-1">
          {language === 'tr' ? 'Uygulama Rehberi' : language === 'es' ? 'Guía de Aplicación' : 'App Guide'}
        </span>
      </button>

    </div>
  );
}
