import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'fr' | 'es';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionary
const translations = {
  en: {
    // Header
    home: 'Home',
    summaries: 'Summaries',
    calculators: 'Calculators',
    about: 'About',
    profile: 'Profile',
    login: 'Log In',
    signup: 'Sign Up',
    logout: 'Logout',
    welcome: 'Welcome',
    
    // Homepage
    heroTitle: 'Unlock Big Ideas, Faster.',
    heroSubtitle: 'BookBriefs uses AI to provide you with concise summaries and key takeaways from the world\'s best books. Spend less time reading and more time learning.',
    exploreSummaries: 'Explore Summaries',
    whyPeopleLove: 'Why People Love Using',
    joinThousands: 'Join thousands of readers who learn faster than they ever thought possible.',
    signupFree: 'Sign up for free',
    
    // Footer
    joinNewsletter: 'Join Our Newsletter',
    newsletterText: 'Get the latest market news and books delivered to your inbox.',
    subscribe: 'Subscribe',
    allRightsReserved: 'All rights reserved.',
    
    // Profile
    myProfile: 'My Profile',
    trackProgress: 'Track your reading progress and discover new books',
    
    // Auth
    loginTitle: 'Log In to BookBriefs',
    signupTitle: 'Join BookBriefs',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    confirmPassword: 'Confirm Password',
    loggingIn: 'Logging in...',
    creatingAccount: 'Creating Account...',
    dontHaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    signupHere: 'Sign up here',
    loginHere: 'Log in here',
    demoText: 'Demo: Use any email and password to log in'
  },
  ar: {
    // Header
    home: 'الرئيسية',
    summaries: 'الملخصات',
    calculators: 'الحاسبات',
    about: 'حول',
    profile: 'الملف الشخصي',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    welcome: 'مرحباً',
    
    // Homepage
    heroTitle: 'اكتشف الأفكار الكبيرة، بشكل أسرع.',
    heroSubtitle: 'يستخدم BookBriefs الذكاء الاصطناعي لتقديم ملخصات موجزة والنقاط الرئيسية من أفضل الكتب في العالم. اقضِ وقتاً أقل في القراءة ووقتاً أكثر في التعلم.',
    exploreSummaries: 'استكشف الملخصات',
    whyPeopleLove: 'لماذا يحب الناس استخدام',
    joinThousands: 'انضم إلى آلاف القراء الذين يتعلمون بشكل أسرع مما كانوا يعتقدون.',
    signupFree: 'اشترك مجاناً',
    
    // Footer
    joinNewsletter: 'انضم إلى نشرتنا الإخبارية',
    newsletterText: 'احصل على آخر أخبار السوق والكتب في صندوق الوارد الخاص بك.',
    subscribe: 'اشترك',
    allRightsReserved: 'جميع الحقوق محفوظة.',
    
    // Profile
    myProfile: 'ملفي الشخصي',
    trackProgress: 'تتبع تقدم القراءة واكتشف كتباً جديدة',
    
    // Auth
    loginTitle: 'تسجيل الدخول إلى BookBriefs',
    signupTitle: 'انضم إلى BookBriefs',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    confirmPassword: 'تأكيد كلمة المرور',
    loggingIn: 'جاري تسجيل الدخول...',
    creatingAccount: 'جاري إنشاء الحساب...',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signupHere: 'اشترك هنا',
    loginHere: 'سجل الدخول هنا',
    demoText: 'تجريبي: استخدم أي بريد إلكتروني وكلمة مرور لتسجيل الدخول'
  },
  fr: {
    // Header
    home: 'Accueil',
    summaries: 'Résumés',
    calculators: 'Calculatrices',
    about: 'À propos',
    profile: 'Profil',
    login: 'Se connecter',
    signup: 'S\'inscrire',
    logout: 'Se déconnecter',
    welcome: 'Bienvenue',
    
    // Homepage
    heroTitle: 'Débloquez les grandes idées, plus rapidement.',
    heroSubtitle: 'BookBriefs utilise l\'IA pour vous fournir des résumés concis et des points clés des meilleurs livres du monde. Passez moins de temps à lire et plus de temps à apprendre.',
    exploreSummaries: 'Explorer les résumés',
    whyPeopleLove: 'Pourquoi les gens adorent utiliser',
    joinThousands: 'Rejoignez des milliers de lecteurs qui apprennent plus vite qu\'ils ne l\'auraient jamais cru possible.',
    signupFree: 'Inscrivez-vous gratuitement',
    
    // Footer
    joinNewsletter: 'Rejoignez notre newsletter',
    newsletterText: 'Recevez les dernières nouvelles du marché et des livres dans votre boîte de réception.',
    subscribe: 'S\'abonner',
    allRightsReserved: 'Tous droits réservés.',
    
    // Profile
    myProfile: 'Mon profil',
    trackProgress: 'Suivez vos progrès de lecture et découvrez de nouveaux livres',
    
    // Auth
    loginTitle: 'Se connecter à BookBriefs',
    signupTitle: 'Rejoindre BookBriefs',
    email: 'Email',
    password: 'Mot de passe',
    fullName: 'Nom complet',
    confirmPassword: 'Confirmer le mot de passe',
    loggingIn: 'Connexion en cours...',
    creatingAccount: 'Création du compte...',
    dontHaveAccount: 'Vous n\'avez pas de compte ?',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    signupHere: 'Inscrivez-vous ici',
    loginHere: 'Connectez-vous ici',
    demoText: 'Démo : Utilisez n\'importe quel email et mot de passe pour vous connecter'
  },
  es: {
    // Header
    home: 'Inicio',
    summaries: 'Resúmenes',
    calculators: 'Calculadoras',
    about: 'Acerca de',
    profile: 'Perfil',
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    logout: 'Cerrar sesión',
    welcome: 'Bienvenido',
    
    // Homepage
    heroTitle: 'Desbloquea grandes ideas, más rápido.',
    heroSubtitle: 'BookBriefs usa IA para proporcionarte resúmenes concisos y puntos clave de los mejores libros del mundo. Pasa menos tiempo leyendo y más tiempo aprendiendo.',
    exploreSummaries: 'Explorar resúmenes',
    whyPeopleLove: 'Por qué la gente ama usar',
    joinThousands: 'Únete a miles de lectores que aprenden más rápido de lo que jamás creyeron posible.',
    signupFree: 'Regístrate gratis',
    
    // Footer
    joinNewsletter: 'Únete a nuestro boletín',
    newsletterText: 'Recibe las últimas noticias del mercado y libros en tu bandeja de entrada.',
    subscribe: 'Suscribirse',
    allRightsReserved: 'Todos los derechos reservados.',
    
    // Profile
    myProfile: 'Mi perfil',
    trackProgress: 'Rastrea tu progreso de lectura y descubre nuevos libros',
    
    // Auth
    loginTitle: 'Iniciar sesión en BookBriefs',
    signupTitle: 'Únete a BookBriefs',
    email: 'Correo electrónico',
    password: 'Contraseña',
    fullName: 'Nombre completo',
    confirmPassword: 'Confirmar contraseña',
    loggingIn: 'Iniciando sesión...',
    creatingAccount: 'Creando cuenta...',
    dontHaveAccount: '¿No tienes una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    signupHere: 'Regístrate aquí',
    loginHere: 'Inicia sesión aquí',
    demoText: 'Demo: Usa cualquier email y contraseña para iniciar sesión'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('bookbriefs_language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('bookbriefs_language', language);
    
    // Set document direction for Arabic
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key as keyof typeof translations['en']] || key;
  };

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
