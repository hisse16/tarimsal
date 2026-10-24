import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'tr' | 'en' | 'es';

interface TranslationKeys {
  [key: string]: {
    tr: string;
    en: string;
    es: string;
  };
}

export const TRANSLATIONS: TranslationKeys = {
  // Navigation Tabs
  tab_analiz: { tr: '💧 Akıllı Analiz', en: '💧 Smart Analysis', es: '💧 Análisis Inteligente' },
  tab_asistan: { tr: '🤖 YZ Asistanı', en: '🤖 AI Assistant', es: '🤖 Asistente de IA' },
  tab_gubre: { tr: '🧪 Gübreleme', en: '🧪 Fertilization', es: '🧪 Fertilización' },
  tab_saglik: { tr: '🛡️ YZ Bitki Sağlığı', en: '🛡️ AI Plant Health', es: '🛡️ IA Salud de Plantas' },
  tab_pazar: { tr: '💰 Hal Pazar', en: '💰 Produce Market', es: '💰 Mercado Central' },
  tab_kooperatif: { tr: '🤝 Kooperatif', en: '🤝 Cooperative', es: '🤝 Cooperativa' },
  tab_harita: { tr: '🗺️ Tarım Haritası', en: '🗺️ Agricultural Map', es: '🗺️ Mapa Agrícola' },
  tab_kayitlar: { tr: '📝 Kayıtlar', en: '📝 Records Log', es: '📝 Registros' },
  tab_tumkodlar: { tr: '💻 Tüm Kodlar (TXT)', en: '💻 All Codes (TXT)', es: '💻 Códigos (TXT)' },

  // General Sidebar
  active_field: { tr: '🚜 Aktif Yönetilen Saha', en: '🚜 Active Field', es: '🚜 Campo Activo' },
  change_field: { tr: 'Değiştir', en: 'Change', es: 'Cambiar' },
  location: { tr: 'Konum', en: 'Location', es: 'Ubicación' },
  total_area: { tr: 'Toplam Alan', en: 'Total Area', es: 'Área Total' },
  soil_type: { tr: 'Toprak Türü', en: 'Soil Type', es: 'Tipo de Suelo' },
  active_crop: { tr: 'Aktif Ürün', en: 'Active Crop', es: 'Cultivo Activo' },
  area_distribution: { tr: 'Alan Dağılımı', en: 'Area Sowing', es: 'Área Sembrada' },
  current_stage: { tr: 'Canlı Evre', en: 'Growth Stage', es: 'Etapa de Crecimiento' },
  accuracy: { tr: 'Doğruluk Payı', en: 'Accuracy Rate', es: 'Precisión' },
  mae: { tr: 'Hata Marjı (MAE)', en: 'Error Margin (MAE)', es: 'Margen de Error (MAE)' },
  ai_accuracy_title: { tr: '📊 Canlı YZ Doğruluk Analizi', en: '📊 Live AI Accuracy Analysis', es: '📊 Análisis de Precisión de IA' },
  detailed_profile: { tr: 'Detaylı Profilim', en: 'My Detailed Profile', es: 'Mi Perfil Detallado' },
  logout: { tr: 'Çıkış Yap', en: 'Log Out', es: 'Cerrar Sesión' },
  focus_mode_active: { tr: 'Odak Modu Aktif', en: 'Focus Mode Active', es: 'Modo Foco Activo' },
  focus_mode_premium: { tr: 'Odak Modu (Premium)', en: 'Focus Mode (Premium)', es: 'Modo Foco (Premium)' },

  // Landing Page Hero
  hero_title_1: { tr: 'Toprağınızın Geleceğini', en: 'Manage the Future of Your Soil', es: 'Gestione el Futuro de Su Suelo' },
  hero_title_2: { tr: 'Yapay Zeka ve Uydularla', en: 'With AI and Satellites', es: 'Con Inteligencia Artificial y Satélites' },
  hero_title_3: { tr: 'Yönetin', en: 'Precisely', es: 'de manera precisa' },
  hero_subtitle: {
    tr: 'Pro-Agri, Sentinel uydularından gelen spektral verileri (NDVI, nem, sıcaklık) ve gelişmiş yapay zeka modellerini birleştirerek tarlanız için kusursuz gübreleme, sulama ve bitki sağlığı haritaları üreten profesyonel bir tarım işletim sistemidir.',
    en: 'Pro-Agri merges spectral data from Sentinel satellites (NDVI, moisture, temperature) and advanced AI models to generate flawless fertilization, irrigation, and plant health maps for your field.',
    es: 'Pro-Agri fusiona datos espectrales de satélites Sentinel (NDVI, humedad, temperatura) y modelos avanzados de IA para generar mapas impecables de fertilización, riego y salud vegetal.'
  },
  hero_btn_start: { tr: 'Ücretsiz Çiftçi Hesabı Oluştur', en: 'Create Free Farmer Account', es: 'Crear Cuenta de Agricultor Gratis' },
  hero_btn_features: { tr: 'Özellikleri İncele', en: 'Explore Features', es: 'Explorar Funciones' },
  stat_users: { tr: 'Aktif Kullanıcı', en: 'Active Users', es: 'Usuarios Activos' },
  stat_yield: { tr: 'Verim Artışı', en: 'Yield Increase', es: 'Aumento de Rendimiento' },
  stat_area: { tr: 'Taranmış Arazi', en: 'Scanned Land', es: 'Área Escaneada' },

  // Auth Forms
  sign_in: { tr: 'Oturum Aç', en: 'Sign In', es: 'Iniciar Sesión' },
  sign_up: { tr: 'Hesap Oluştur', en: 'Create Account', es: 'Crear Cuenta' },
  email_label: { tr: 'E-Posta Adresi', en: 'Email Address', es: 'Correo Electrónico' },
  password_label: { tr: 'Şifre', en: 'Password', es: 'Contraseña' },
  remember_me: { tr: 'Beni Hatırla', en: 'Remember Me', es: 'Recordarme' },
  forgot_password_link: { tr: 'Şifremi Unuttum', en: 'Forgot Password?', es: '¿Olvidó su contraseña?' },
  or_divider: { tr: 'veya', en: 'or', es: 'o' },
  google_sign_in: { tr: 'Google Hesabı ile Giriş Yap', en: 'Sign in with Google', es: 'Iniciar sesión con Google' },
  fullname_label: { tr: 'Adınız Soyadınız', en: 'Full Name', es: 'Nombre y Apellidos' },
  confirm_password_label: { tr: 'Şifreyi Tekrar Girin', en: 'Confirm Password', es: 'Confirmar Contraseña' },
  agree_terms: { tr: 'Kullanıcı Sözleşmesi\'ni okudum, onaylıyorum.', en: 'I have read and agree to terms of use.', es: 'He leído y acepto los términos de uso.' },
  notification_consent: { tr: 'Sulama uyarıları ve rekolte raporları için bildirim izni veriyorum.', en: 'I consent to receiving notifications for irrigation and yield alerts.', es: 'Doy mi consentimiento para recibir alertas de riego y rendimiento.' },
  register_submit: { tr: 'Hesabımı Oluştur ve Başla', en: 'Create My Account & Start', es: 'Crear Mi Cuenta y Comenzar' },
  forgot_title: { tr: 'Şifre Kurtarma Merkezi', en: 'Password Recovery Center', es: 'Recuperación de Contraseña' },
  forgot_desc: { tr: 'Şifresini unuttuğunuz hesabın e-postasını doğrulayarak şifre sıfırlama talebi gönderebilirsiniz.', en: 'Verify your account email to receive a password reset link.', es: 'Verifique su correo para recibir un enlace de restablecimiento.' },
  forgot_submit: { tr: 'Sıfırlama Talebi Gönder', en: 'Send Reset Request', es: 'Enviar Solicitud de Restablecimiento' },
  forgot_back: { tr: 'Geri Dön', en: 'Back', es: 'Regresar' },

  // Saas Dashboard / Komuta Merkezi
  dashboard_title: { tr: 'Pro-Agri Yönetim Paneli', en: 'Pro-Agri SaaS Dashboard', es: 'Panel de Control Pro-Agri' },
  dashboard_subtitle: { tr: 'SaaS Akıllı Tarım İşletim Sistemi Kontrol Merkezi', en: 'SaaS Intelligent Agriculture Command Center', es: 'Centro de Mando de Agricultura Inteligente SaaS' },
  tab_general_report: { tr: 'Genel Özet Raporu', en: 'Executive Report', es: 'Informe Ejecutivo' },
  tab_my_fields: { tr: 'Tarlalarım & Ürünler', en: 'My Fields & Crops', es: 'Campos y Cultivos' },
  tab_rbac_admin: { tr: 'Yetki & Rol Yönetimi', en: 'Access & Role Admin', es: 'Gestión de Roles' },
  stat_total_land: { tr: 'Toplam Arazi', en: 'Total Land Owned', es: 'Terreno Total' },
  stat_active_fields: { tr: 'Aktif Tarlalar', en: 'Active Fields', es: 'Campos Activos' },
  stat_registered_crops: { tr: 'Kayıtlı Mahsul', en: 'Registered Crops', es: 'Cultivos Registrados' },
  stat_saas_tier: { tr: 'SaaS Rütbe Katmanı', en: 'SaaS Role Tier', es: 'Nivel de Rol SaaS' },
  todo_title: { tr: 'Bugün Tarlada Ne Var?', en: 'Today\'s Field Agenda', es: 'Agenda del Campo de Hoy' },
  todo_desc: { tr: 'Yapay zeka ve hava durumuna dayalı dinamik yapılacaklar listesi', en: 'Dynamic to-do list based on weather and AI analytics', es: 'Lista dinámica de tareas basada en clima e IA' },
  risk_matrix_title: { tr: 'Anatolia Safe-Guard Risk Matrisi', en: 'Anatolia Safe-Guard Risk Matrix', es: 'Matriz de Riesgo Anatolia Safe-Guard' },
  risk_matrix_desc: { tr: 'Uydudan gelen mikroklima ve toprak nemi analizleri ile parsel bazlı riskler', en: 'Parcel-level risks mapped via satellite microclimate and soil moisture data', es: 'Riesgos por parcela mapeados mediante microclima satelital' },
  safe_guard_status: { tr: 'Safe-Guard Aktif', en: 'Safe-Guard Active', es: 'Safe-Guard Activo' },
  water_trend_title: { tr: 'Tarımsal Su & Yağış Endeksi', en: 'Agricultural Water & Rain Index', es: 'Índice Agrícola de Agua y Lluvia' },
  water_trend_desc: { tr: 'Aylara göre sulama ihtiyacı ve yağış miktarı', en: 'Monthly irrigation demands and average rainfall', es: 'Demanda mensual de riego y promedio de lluvia' },
  crop_dist_title: { tr: 'Ürün Ekiliş Dağılımları', en: 'Crop Sowing Distributions', es: 'Distribución de Cultivos Sembrados' },
  crop_dist_desc: { tr: 'Ekili ürün cinsine göre arazi dağılımı (Dönüm)', en: 'Land allocation by crop type (Decare)', es: 'Asignación de tierra por tipo de cultivo (Dönüm)' },
  market_prices_title: { tr: 'Dijital Hal & Piyasa', en: 'Digital Produce & Market Rates', es: 'Precios del Mercado Central' },
  market_tab_crops: { tr: 'Ürün Fiyatları', en: 'Crop Prices', es: 'Precios de Cultivos' },
  market_tab_inputs: { tr: 'Girdi Maliyetleri', en: 'Input Costs', es: 'Costos de Insumos' },
  garage_title: { tr: 'Akıllı Ekipman Garajı', en: 'Smart Equipment Garage', es: 'Garaje de Equipos Inteligentes' },
  garage_desc: { tr: 'Traktör ve ekipmanların çalışma saatleri ve bakım takipleri', en: 'Working hours and maintenance logs of machinery', es: 'Horas de trabajo y bitácoras de maquinaria' },
  ahmet_corner_title: { tr: 'Ahmet Bey\'in Köşesi', en: 'Ahmet Bey\'s Corner', es: 'El Rincón de Ahmet Bey' },
  ahmet_corner_desc: { tr: 'ÜRETİCİ FORUMU', en: 'FARMER SOCIAL FORUM', es: 'FORO SOCIAL DE AGRICULTORES' },

  // Tarla Yönetimi
  fields_title: { tr: 'Arazi ve Tarla Yönetim Portalı', en: 'Field and Crop Sowing Portal', es: 'Portal de Gestión de Campos' },
  fields_desc: { tr: 'Yeni tarlalar ve ekili ürünler tanımlayın, spektral analiz için tarlalara giriş yapın.', en: 'Define fields and crops, or enter fields to initiate spectral maps.', es: 'Defina campos y cultivos, o ingrese para iniciar mapas espectrales.' },
  add_field_title: { tr: 'Yeni Akıllı Tarla Tanımla', en: 'Define New Smart Field', es: 'Definir Nuevo Campo Inteligente' },
  add_field_desc: { tr: 'Tarlanızın konum, alan ve toprak yapısı özelliklerini girerek analize hazırlayın.', en: 'Provide location, area, and soil features to initialize analysis.', es: 'Proporcione ubicación, área y suelo para iniciar el análisis.' },
  field_name_label: { tr: 'Tarla Adı', en: 'Field Identifier Name', es: 'Nombre del Campo' },
  select_city: { tr: 'İl Seçiniz', en: 'Select Province', es: 'Seleccionar Provincia' },
  select_district: { tr: 'İlçe Seçiniz', en: 'Select District', es: 'Seleccionar Distrito' },
  total_area_m2: { tr: 'Toplam Alan (m²)', en: 'Total Area (m²)', es: 'Área Total (m²)' },
  soil_type_label: { tr: 'Toprak Yapısı', en: 'Soil Texture Structure', es: 'Textura del Suelo' },
  sow_crops_header: { tr: '🥦 Tarlaya Ürün(ler) Sür', en: '🥦 Sow Crops in Field', es: '🥦 Sembrar Cultivos en el Campo' },
  sow_row_add: { tr: 'Satır Ekle', en: 'Add Sowing Row', es: 'Añadir Fila de Siembra' },
  sow_crop_type: { tr: 'Ürün Türü', en: 'Crop Seed Variety', es: 'Tipo de Cultivo' },
  sow_area_m2: { tr: 'Alan (m²)', en: 'Allocated Area (m²)', es: 'Área Asignada (m²)' },
  sow_date: { tr: 'Ekim/Sürüm Tarihi', en: 'Sowing/Planting Date', es: 'Fecha de Siembra' },
  save_field_btn: { tr: 'Tarlayı ve Ürünleri Kaydet', en: 'Save Field and Sown Crops', es: 'Guardar Campo y Cultivos Sembrados' },
  registered_fields_hdr: { tr: 'Kayıtlı Tarlalarınız', en: 'Your Registered Fields', es: 'Sus Campos Registrados' },
  remaining_area: { tr: 'Kalan Boş Alan', en: 'Remaining Area Available', es: 'Área Libre Restante' },
  add_crop_to_existing_btn: { tr: 'Tarlaya Ürünü İlave Et', en: 'Sow Sibling Crop Here', es: 'Sembrar Cultivo Hermano Aquí' },
  analyze_now_btn: { tr: 'Analiz Yap', en: 'Run Live Analysis', es: 'Ejecutar Análisis' },

  // Akıllı Analiz
  analysis_title: { tr: '💧 Akıllı Sulama & Hava Tahmin Merkezi', en: '💧 Smart Irrigation & Weather Forecast', es: '💧 Riego Inteligente y Pronóstico Clima' },
  analysis_subtitle: { tr: 'Gerçek zamanlı meteoroloji istasyonu verileri ve FAO-56 evapotranspirasyon analizleri.', en: 'Real-time weather station metrics and FAO-56 evapotranspiration models.', es: 'Métricas climáticas en tiempo real y modelos FAO-56 de evapotranspiración.' },
  live_weather_title: { tr: 'Canlı Hava Durumu', en: 'Live Weather', es: 'Clima en Vivo' },
  humidity_label: { tr: 'Toprak / Hava Nemi', en: 'Humidity Scale', es: 'Humedad de Suelo/Aire' },
  wind_label: { tr: 'Rüzgar Hızı', en: 'Wind Speed', es: 'Velocidad del Viento' },
  temp_forecast_hdr: { tr: '36 Saatlik Sıcaklık Trendi (°C)', en: '36-Hour Temperature Trend (°C)', es: 'Tendencia de Temperatura de 36 Horas (°C)' },
  rain_forecast_hdr: { tr: '🌧️ 36 Saatlik Yağış Beklentisi (mm)', en: '🌧️ 36-Hour Precipitation Forecast (mm)', es: '🌧️ Pronóstico de Precipitación de 36 Horas (mm)' },
  irrigation_calc_title: { tr: '💧 Akıllı Sulama Karar Motoru', en: '💧 Smart Irrigation Decision Engine', es: '💧 Motor de Decisión de Riego Inteligente' },
  irrigation_calc_desc: { tr: 'Gerçek zamanlı hava parametrelerini FAO-56 katsayıları ile işleyerek sulama raporu üretir.', en: 'Processes real-time weather metrics with FAO-56 factors to compute demand.', es: 'Procesa métricas climáticas con factores FAO-56 para calcular la demanda.' },
  last_irrigation_date: { tr: 'Son Sulama Tarihi', en: 'Date Sown Last Watered', es: 'Última Fecha de Riego' },
  start_analysis_btn: { tr: '🚀 YZ Sulama Analizini Başlat', en: '🚀 Run AI Irrigation Analytics', es: '🚀 Ejecutar Analítica de Riego IA' },
  ai_irrigation_report_title: { tr: '🤖 Pro-Agri Yapay Zeka Karar Raporu', en: '🤖 Pro-Agri AI Sowing Decision Report', es: '🤖 Informe de Decisión de Riego Pro-Agri IA' },

  // YZ Asistan
  ai_chat_title: { tr: '🤖 Yapay Zeka Çiftçi Asistanı', en: '🤖 AI Agricultural Expert Chat', es: '🤖 Asistente de IA Agrícola Experto' },
  ai_chat_subtitle: { tr: 'Mühendis Ahmet Bey ile tarlanıza özel sulama, gübreleme ve koruma çözümlerini canlı konuşun.', en: 'Discuss personalized sowing, fertilization, and biological protection live with expert Ahmet Bey.', es: 'Discuta sobre siembra, fertilización y protección con el experto Ahmet Bey.' },
  clear_chat_btn: { tr: '🧹 Geçmişi Temizle', en: '🧹 Clear Log History', es: '🧹 Limpiar Historial' },
  image_upload_hint: { tr: 'Analiz edilecek yaprak/tarla fotoğrafı eklendi', en: 'Leaf/field photo attached for AI computer vision scan', es: 'Foto de hoja/campo adjunta para escaneo de visión de IA' },
  toggle_deep_analysis: { tr: 'Derin Analiz Modu', en: 'Deep Reasoning Mode', es: 'Modo Análisis Profundo' },
  toggle_google_search: { tr: 'Google Arama', en: 'Web Search', es: 'Búsqueda en Google' },
  toggle_google_maps: { tr: 'Google Haritalar', en: 'Google Maps', es: 'Google Maps' },
  input_chat_placeholder: { tr: 'Ahmet Bey\'e tarlanızla ilgili her şeyi sorun veya sesli konuşun...', en: 'Ask Ahmet Bey anything about your field or speak out loud...', es: 'Pregúntele a Ahmet Bey sobre su campo o hable en voz alta...' },
  voice_listening_banner: { tr: 'Mikrofon Açık: Konuşun, Ahmet Bey sizi dinliyor...', en: 'Microphone Active: Speak now, Ahmet Bey is listening...', es: 'Micrófono Activo: Hable ahora, Ahmet Bey está escuchando...' },
  recommended_questions_title: { tr: '💡 Önerilen Hızlı Sorular', en: '💡 Recommended Quick Questions', es: '💡 Preguntas Rápidas Recomendadas' },
  ahmet_who_is_title: { tr: 'Ahmet Bey Kimdir?', en: 'Who is Ahmet Bey?', es: '¿Quién es Ahmet Bey?' },
  ahmet_who_is_desc: { tr: '20 yıllık saha tecrübesine sahip simüle edilmiş Ziraat Mühendisi asistanıdır. Yapay zeka ile entegre çalışır.', en: 'A simulated agronomist with 20 years of field expertise, integrated with Gemini AI reasoning.', es: 'Un agrónomo simulado con 20 años de experiencia, integrado con razonamiento de IA de Gemini.' },

  // i18n General Language Selector text
  lang_select_title: { tr: 'Dil / Language / Idioma', en: 'Language / Dil / Idioma', es: 'Idioma / Dil / Language' },
  verified_farmer_title: { tr: 'Doğrulanmış Çiftçi', en: 'Verified Premium Farmer', es: 'Agricultor Verificado' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('proagri_lang');
    if (saved === 'en' || saved === 'es' || saved === 'tr') {
      return saved as Language;
    }
    return 'tr'; // default TR
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('proagri_lang', lang);
  };

  const t = (key: string): string => {
    const translation = TRANSLATIONS[key];
    if (translation) {
      return translation[language] || translation['tr'];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
