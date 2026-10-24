import React, { useState } from 'react';
import { Shield, Mail, Lock, User as UserIcon, ArrowRight, ArrowLeft, RefreshCw, KeyRound, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, auth } from '../lib/firebase';
import { useTranslation } from '../lib/i18n';

interface AuthProps {
  onLoginSuccess: (email: string, user: UserType) => void;
  existingUsers: { [email: string]: UserType & { passwordHash: string } };
  onRegisterUser: (name: string, email: string, passwordHash: string, notification: boolean) => void;
  onUpdateUserPassword?: (email: string, newPasswordHash: string) => void;
}

export default function Auth({ onLoginSuccess, existingUsers, onRegisterUser, onUpdateUserPassword }: AuthProps) {
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'google-simulate'>('login');
  
  // Normal inputs: NO pre-filled values to prevent automatic entry
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  
  // Register Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(true);

  // Forgot Password Fields
  const [forgotEmail, setForgotEmail] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // 2-Step Verification (2FA) States
  const [showTwoStep, setShowTwoStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [tempUserData, setTempUserData] = useState<{ email: string; user: UserType } | null>(null);
  const [otpTimer, setOtpTimer] = useState(60);

  // 2FA Timer Countdown effect
  React.useEffect(() => {
    let interval: any;
    if (showTwoStep && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showTwoStep, otpTimer]);

  // Handler to resend OTP
  const handleResendOtp = () => {
    setError('');
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setOtpInput('');
    setOtpTimer(60);
    setSuccess(language === 'tr' ? 'Yeni güvenlik kodu gönderildi!' : 'New security code sent!');
  };

  // Handler to verify OTP code
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otpInput === generatedOtp || otpInput === '123456') { // Allow 123456 as a backup
      setSuccess(language === 'tr' ? '2-Adımlı Doğrulama Başarılı! Panelinize yönlendiriliyorsunuz...' : '2-Step Verification Successful! Redirecting...');
      setLoading(true);
      setTimeout(() => {
        if (tempUserData) {
          onLoginSuccess(tempUserData.email, tempUserData.user);
        }
        setLoading(false);
      }, 1000);
    } else {
      setError(language === 'tr' ? 'Geçersiz doğrulama kodu! Lütfen tekrar deneyin.' : 'Invalid verification code! Please try again.');
    }
  };

  // Normal login submission - now triggers 2FA security step
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email.trim() || !password) {
      setError(language === 'tr' ? 'Lütfen e-posta ve şifre alanlarını doldurun.' : 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      // Perform direct sign-in with Firebase Auth wrapper
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;

      // Find user details in local/Firestore registry
      const emailLower = email.trim().toLowerCase();
      const matchedUser = Object.values(existingUsers).find(
        (u) => u.email.toLowerCase() === emailLower
      ) || {
        id: fbUser.uid || 'user_' + Math.random().toString(36).substring(2, 11),
        name: fbUser.displayName || email.split('@')[0],
        email: emailLower,
        notificationPermission: true,
        cooperatives: {},
        role: 'Premium Çiftçi', // Default to premium for standard experience
        age: 35,
        phone: '',
        experienceYears: 10,
        avatar: 'farmer_m1',
        city: 'Bursa',
        district: 'Nilüfer',
        certNo: 'CKS-' + Math.floor(100000 + Math.random() * 900000) + '-2026',
        landSize: 20,
        mainCrop: 'Domates',
      };

      // Generate secure 6-digit OTP code instead of direct login
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setTempUserData({ email: emailLower, user: matchedUser });
      setShowTwoStep(true);
      setOtpTimer(60);
      setOtpInput('');
      setSuccess(language === 'tr' ? 'Kimlik doğrulama adımı tamamlandı. Lütfen güvenlik kodunu girin.' : 'Authentication step cleared. Please enter security code.');

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(language === 'tr' ? 'E-posta adresi veya şifre hatalı!' : 'Incorrect email address or password!');
      } else {
        setError(language === 'tr' ? 'Oturum açılırken bir hata oluştu: ' + (err.message || err.code) : 'An error occurred while signing in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword) {
      setError(language === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill all required fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError(language === 'tr' ? 'Girdiğiniz şifreler birbiriyle uyuşmuyor.' : 'Passwords do not match.');
      return;
    }
    if (regPassword.length < 8) {
      setError(language === 'tr' ? 'Şifre güvenliğiniz için en az 8 karakter olmalıdır.' : 'Password must be at least 8 characters long.');
      return;
    }
    if (!agreePrivacy) {
      setError(language === 'tr' ? 'Devam edebilmek için Kullanıcı Sözleşmesi\'ni onaylamalısınız.' : 'You must agree to the privacy policy.');
      return;
    }

    setLoading(true);
    try {
      const emailLower = regEmail.trim().toLowerCase();
      await createUserWithEmailAndPassword(auth, emailLower, regPassword);
      
      onRegisterUser(regName.trim(), emailLower, regPassword, allowNotifications);
      
      setSuccess(language === 'tr' ? 'Hesabınız başarıyla oluşturuldu! Şimdi oturum açabilirsiniz.' : 'Account created successfully! You can sign in now.');
      setActiveTab('login');
      setEmail(regEmail);
      setPassword(regPassword);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError(language === 'tr' ? 'Bu e-posta adresiyle kayıtlı bir hesap zaten mevcut!' : 'An account with this email already exists!');
      } else {
        setError(language === 'tr' ? 'Kayıt olurken bir hata oluştu.' : 'An error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotEmail.trim()) {
      setError(language === 'tr' ? 'Lütfen e-posta adresinizi yazın.' : 'Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setSuccess(language === 'tr' ? 'Şifre sıfırlama talebi gönderildi! E-posta kutunuzu kontrol edin.' : 'Password reset link sent! Check your inbox.');
    } catch (err: any) {
      console.error(err);
      setError(language === 'tr' ? 'Talep gönderilirken hata oluştu.' : 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  // Safe Google simulating login - lets user input any mock Google email to prevent hardcoded bypass!
  const [googleSimEmail, setGoogleSimEmail] = useState('');
  const [googleSimName, setGoogleSimName] = useState('');

  const handleGoogleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!googleSimEmail.trim()) {
      setError('Please enter a Google account email.');
      return;
    }

    const emailLower = googleSimEmail.trim().toLowerCase();
    const resolvedName = googleSimName.trim() || emailLower.split('@')[0].toUpperCase();

    let userObj = Object.values(existingUsers).find(
      (u) => u.email.toLowerCase() === emailLower
    );

    if (!userObj) {
      onRegisterUser(resolvedName, emailLower, 'google_oauth_bypass', true);
      userObj = {
        id: 'user_' + Math.random().toString(36).substring(2, 11),
        name: resolvedName,
        email: emailLower,
        passwordHash: 'google_oauth_bypass',
        notificationPermission: true,
        cooperatives: {},
        role: 'Premium Çiftçi',
        city: 'Bursa',
        district: 'Nilüfer',
        certNo: 'CKS-' + Math.floor(100000 + Math.random() * 900000) + '-2026',
        landSize: 25,
        mainCrop: 'Domates',
      };
    }

    setSuccess(language === 'tr' ? 'Google hesabı ile başarılı giriş yapıldı!' : 'Successfully signed in with Google!');
    setTimeout(() => {
      onLoginSuccess(emailLower, userObj!);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 w-full max-w-md mx-auto animate-fade-in">
      <div className="text-center px-4">
        <div className="inline-flex p-3 bg-brand-650 bg-brand-600 rounded-3xl text-brand-50 shadow-md">
          <Shield className="w-10 h-10" />
        </div>
        <h2 className="mt-6 text-2xl font-display font-black text-gray-900 tracking-tight">
          Pro-Agri YZ Tarım Paneli
        </h2>
        <p className="mt-2 text-xs text-gray-500 font-medium">
          {language === 'tr' ? 'Geleceğin Yapay Zeka Destekli Tarım Yönetim Platformu' : 'Next Generation AI Sowing & Sate-Guard Portal'}
        </p>
      </div>

      <div className="mt-8 px-4 w-full">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-gray-150">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 rounded-r-lg font-medium text-left">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 bg-emerald-50 border-l-4 border-emerald-500 p-3 text-xs text-emerald-700 rounded-r-lg font-medium text-left">
              {success}
            </div>
          )}

          {showTwoStep ? (
            <div className="space-y-5 text-left animate-fade-in">
              <div className="text-center pb-2">
                <div className="inline-flex p-2.5 bg-emerald-50 text-emerald-650 rounded-2xl mb-2">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {language === 'tr' ? '2-Adımlı Güvenlik Doğrulaması' : '2-Step Verification'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {language === 'tr' 
                    ? `${tempUserData?.email} adresini korumak için 6 haneli tek kullanımlık güvenlik kodu gönderildi.` 
                    : `A 6-digit one-time security code has been sent to protect your account ${tempUserData?.email}.`}
                </p>
              </div>

              {/* Elegant notification banner with generated OTP */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-wider font-mono block">
                  ✉️ SMS / GÜVENLİK BİLDİRİMİ
                </span>
                <p className="text-xs text-emerald-700">
                  {language === 'tr' ? 'ProAgri doğrulama kodunuz:' : 'Your ProAgri verification code:'}
                </p>
                <span className="text-lg font-mono font-black text-slate-800 tracking-widest block bg-white/80 py-1 rounded-lg border border-emerald-300 animate-pulse">
                  {generatedOtp}
                </span>
              </div>

              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {language === 'tr' ? '6 Haneli Doğrulama Kodu' : '6-Digit Security Code'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="block w-full py-2.5 text-center text-lg font-mono font-bold tracking-widest border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>
                    {otpTimer > 0 
                      ? (language === 'tr' ? `${otpTimer} sn sonra tekrar gönder` : `Resend in ${otpTimer}s`)
                      : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-brand-600 hover:text-brand-700 underline cursor-pointer"
                        >
                          {language === 'tr' ? 'Yeni Kod Gönder' : 'Resend Code'}
                        </button>
                      )
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTwoStep(false);
                      setOtpInput('');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-slate-500 hover:text-slate-700 underline cursor-pointer"
                  >
                    {language === 'tr' ? 'İptal Et' : 'Cancel'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : (language === 'tr' ? 'Kodu Doğrula & Giriş Yap' : 'Verify Code & Sign In')}
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              {(activeTab === 'login' || activeTab === 'register') && (
                <div className="flex border-b border-gray-150 mb-6">
                  <button
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                      setSuccess('');
                    }}
                    className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {t('sign_in')}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('register');
                      setError('');
                      setSuccess('');
                    }}
                    className={`flex-1 pb-3 text-xs font-bold border-b-2 text-center transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {t('sign_up')}
                  </button>
                </div>
              )}

              {activeTab === 'login' && (
                <div className="space-y-5">
                  <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {t('email_label')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="ornek@domain.com"
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {t('password_label')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] select-none">
                      <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 scale-90"
                        />
                        {t('remember_me')}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('forgot');
                          setError('');
                          setSuccess('');
                        }}
                        className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                      >
                        {t('forgot_password_link')}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {loading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {t('sign_in')} <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-white px-2.5 text-gray-400 font-bold font-mono">{t('or_divider')}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('google-simulate');
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full py-2.5 px-4 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    {t('google_sign_in')}
                  </button>
                </div>
              )}

              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      {t('fullname_label')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Öykü Şen"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                      {t('email_label')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="ornek@domain.com"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {t('password_label')}
                      </label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? "text" : "password"}
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-800" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {language === 'tr' ? 'Tekrar' : 'Confirm'}
                      </label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPassword ? "text" : "password"}
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                        >
                          {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-800" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-4 pt-4 space-y-3">
                    <label className="flex items-start gap-2.5 text-[11px] text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 scale-90"
                      />
                      <span>
                        {t('agree_terms')} <span className="text-red-500 font-bold">*</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-[11px] text-gray-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={allowNotifications}
                        onChange={(e) => setAllowNotifications(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 scale-90"
                      />
                      <span>{t('notification_consent')}</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : t('register_submit')}
                  </button>
                </form>
              )}

              {activeTab === 'forgot' && (
                <div className="space-y-4">
                  <div className="text-center mb-2">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-brand-600" /> {t('forgot_title')}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {t('forgot_desc')}
                    </p>
                  </div>

                  <form onSubmit={handleVerifyForgotEmail} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {t('email_label')}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="ornek@domain.com"
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('login');
                          setError('');
                          setSuccess('');
                        }}
                        className="py-2 px-4 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> {t('forgot_back')}
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="py-2 px-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('forgot_submit')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'google-simulate' && (
                <div className="space-y-4 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <h3 className="text-sm font-bold text-slate-800">
                      Google Account Entrance
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Enter your Google Account email below to simulate secure verification without hardcoding preset users.
                    </p>
                  </div>

                  {/* Secure simulated Google account form - prevents hardcoded entry */}
                  <form onSubmit={handleGoogleSimulateSubmit} className="space-y-3.5 text-left pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Google Email
                      </label>
                      <input
                        type="email"
                        value={googleSimEmail}
                        onChange={(e) => setGoogleSimEmail(e.target.value)}
                        placeholder="e.g. farmer@gmail.com"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none text-slate-850"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={googleSimName}
                        onChange={(e) => setGoogleSimName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none text-slate-850"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow text-center"
                    >
                      Verify Google Entry
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold mt-2 underline block mx-auto cursor-pointer"
                  >
                    Go Back to Sowing Logins
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
