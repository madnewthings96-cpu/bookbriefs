import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'fr' | 'es';

interface LanguageContextType {
  currentLanguage: Language;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  getBookTitle: (bookId: string) => string;
  getBookAuthor: (bookId: string) => string;
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
    demoText: 'Demo: Use any email and password to log in',
    
    // Summary page content
    keyTakeaways: 'Key Takeaways',
    detailedSummary: 'Detailed Summary',
    listen: 'Listen',
    stop: 'Stop',
    bookNotFound: 'Book Not Found',
    bookNotFoundMessage: "We couldn't find the book you were looking for.",
    backToSummaries: 'Back to Summaries',
    summaryComingSoon: "This book summary is coming soon. We're working on providing detailed summaries for all books in our collection.",
    summaryInDevelopment: 'Summary in development',
    checkBackSoon: 'Check back soon for detailed content',
    
    // Book content
    bookTitles: {
      'atomic-habits': 'Atomic Habits',
      'trading-in-the-zone': 'Trading in the Zone',
      'the-subtle-art-of-not-giving-a-f': 'The Subtle Art of Not Giving a F*ck',
      'the-power-of-now': 'The Power of Now',
      'sapiens': 'Sapiens: A Brief History of Humankind',
      'thinking-fast-and-slow': 'Thinking, Fast and Slow',
      'the-alchemist': 'The Alchemist',
      'educated': 'Educated',
      'becoming': 'Becoming',
      'the-four-agreements': 'The Four Agreements',
      'dune': 'Dune',
      'project-hail-mary': 'Project Hail Mary',
      'rich-dad-poor-dad': 'Rich Dad Poor Dad'
    },
    bookAuthors: {
      'atomic-habits': 'James Clear',
      'trading-in-the-zone': 'Mark Douglas',
      'the-subtle-art-of-not-giving-a-f': 'Mark Manson',
      'the-power-of-now': 'Eckhart Tolle',
      'sapiens': 'Yuval Noah Harari',
      'thinking-fast-and-slow': 'Daniel Kahneman',
      'the-alchemist': 'Paulo Coelho',
      'educated': 'Tara Westover',
      'becoming': 'Michelle Obama',
      'the-four-agreements': 'Don Miguel Ruiz',
      'dune': 'Frank Herbert',
      'project-hail-mary': 'Andy Weir',
      'rich-dad-poor-dad': 'Robert T. Kiyosaki'
    }
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
    demoText: 'تجريبي: استخدم أي بريد إلكتروني وكلمة مرور لتسجيل الدخول',
    
    // Summary page content
    keyTakeaways: 'النقاط الرئيسية',
    detailedSummary: 'الملخص المفصل',
    listen: 'استمع',
    stop: 'توقف',
    bookNotFound: 'الكتاب غير موجود',
    bookNotFoundMessage: 'لم نتمكن من العثور على الكتاب الذي تبحث عنه.',
    backToSummaries: 'العودة إلى الملخصات',
    summaryComingSoon: 'ملخص هذا الكتاب قادم قريباً. نحن نعمل على توفير ملخصات مفصلة لجميع الكتب في مجموعتنا.',
    summaryInDevelopment: 'الملخص قيد التطوير',
    checkBackSoon: 'تحقق مرة أخرى قريباً للحصول على المحتوى المفصل',
    
    // Book content
    bookTitles: {
      'atomic-habits': 'العادات الذرية',
      'trading-in-the-zone': 'التداول في المنطقة',
      'the-subtle-art-of-not-giving-a-f': 'الفن الخفي لعدم الاكتراث',
      'the-power-of-now': 'قوة الآن',
      'sapiens': 'العاقل: تاريخ مختصر للجنس البشري',
      'thinking-fast-and-slow': 'التفكير السريع والبطيء',
      'the-alchemist': 'الخيميائي',
      'educated': 'متعلمة',
      'becoming': 'صيرورة',
      'the-four-agreements': 'الاتفاقيات الأربعة',
      'dune': 'الكثيب',
      'project-hail-mary': 'مشروع السلام عليك يا مريم',
      'rich-dad-poor-dad': 'الأب الغني والأب الفقير'
    },
    bookAuthors: {
      'atomic-habits': 'جيمس كلير',
      'trading-in-the-zone': 'مارك دوغلاس',
      'the-subtle-art-of-not-giving-a-f': 'مارك مانسون',
      'the-power-of-now': 'إيكهارت تول',
      'sapiens': 'يوفال نوح هراري',
      'thinking-fast-and-slow': 'دانيال كانيمان',
      'the-alchemist': 'باولو كويلو',
      'educated': 'تارا ويستوفر',
      'becoming': 'ميشيل أوباما',
      'the-four-agreements': 'دون ميغيل رويز',
      'dune': 'فرانك هربرت',
      'project-hail-mary': 'آندي وير',
      'rich-dad-poor-dad': 'روبرت تي كيوساكي'
    }
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
    demoText: 'Démo : Utilisez n\'importe quel email et mot de passe pour vous connecter',
    
    // Summary page content
    keyTakeaways: 'Points clés',
    detailedSummary: 'Résumé détaillé',
    listen: 'Écouter',
    stop: 'Arrêter',
    bookNotFound: 'Livre non trouvé',
    bookNotFoundMessage: 'Nous n\'avons pas pu trouver le livre que vous recherchiez.',
    backToSummaries: 'Retour aux résumés',
    summaryComingSoon: 'Le résumé de ce livre arrive bientôt. Nous travaillons à fournir des résumés détaillés pour tous les livres de notre collection.',
    summaryInDevelopment: 'Résumé en développement',
    checkBackSoon: 'Revenez bientôt pour du contenu détaillé',
    
    // Book content
    bookTitles: {
      'atomic-habits': 'Un rien peut tout changer',
      'trading-in-the-zone': 'Trader dans la zone',
      'the-subtle-art-of-not-giving-a-f': 'L\'art subtil de s\'en foutre',
      'the-power-of-now': 'Le pouvoir du moment présent',
      'sapiens': 'Sapiens : Une brève histoire de l\'humanité',
      'thinking-fast-and-slow': 'Système 1 / Système 2',
      'the-alchemist': 'L\'Alchimiste',
      'educated': 'Une éducation',
      'becoming': 'Devenir',
      'the-four-agreements': 'Les quatre accords toltèques',
      'dune': 'Dune',
      'project-hail-mary': 'Projet Hail Mary',
      'rich-dad-poor-dad': 'Père riche, père pauvre'
    },
    bookAuthors: {
      'atomic-habits': 'James Clear',
      'trading-in-the-zone': 'Mark Douglas',
      'the-subtle-art-of-not-giving-a-f': 'Mark Manson',
      'the-power-of-now': 'Eckhart Tolle',
      'sapiens': 'Yuval Noah Harari',
      'thinking-fast-and-slow': 'Daniel Kahneman',
      'the-alchemist': 'Paulo Coelho',
      'educated': 'Tara Westover',
      'becoming': 'Michelle Obama',
      'the-four-agreements': 'Don Miguel Ruiz',
      'dune': 'Frank Herbert',
      'project-hail-mary': 'Andy Weir',
      'rich-dad-poor-dad': 'Robert T. Kiyosaki'
    }
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
    demoText: 'Demo: Usa cualquier email y contraseña para iniciar sesión',
    
    // Summary page content
    keyTakeaways: 'Puntos clave',
    detailedSummary: 'Resumen detallado',
    listen: 'Escuchar',
    stop: 'Detener',
    bookNotFound: 'Libro no encontrado',
    bookNotFoundMessage: 'No pudimos encontrar el libro que estabas buscando.',
    backToSummaries: 'Volver a resúmenes',
    summaryComingSoon: 'El resumen de este libro llegará pronto. Estamos trabajando en proporcionar resúmenes detallados para todos los libros de nuestra colección.',
    summaryInDevelopment: 'Resumen en desarrollo',
    checkBackSoon: 'Vuelve pronto para contenido detallado',
    
    // Book content
    bookTitles: {
      'atomic-habits': 'Hábitos Atómicos',
      'trading-in-the-zone': 'Operar en la Zona',
      'the-subtle-art-of-not-giving-a-f': 'El sutil arte de que te importe un carajo',
      'the-power-of-now': 'El Poder del Ahora',
      'sapiens': 'Sapiens: De animales a dioses',
      'thinking-fast-and-slow': 'Pensar rápido, pensar despacio',
      'the-alchemist': 'El Alquimista',
      'educated': 'Una educación',
      'becoming': 'Mi historia',
      'the-four-agreements': 'Los cuatro acuerdos',
      'dune': 'Dune',
      'project-hail-mary': 'Proyecto Hail Mary',
      'rich-dad-poor-dad': 'Padre Rico, Padre Pobre'
    },
    bookAuthors: {
      'atomic-habits': 'James Clear',
      'trading-in-the-zone': 'Mark Douglas',
      'the-subtle-art-of-not-giving-a-f': 'Mark Manson',
      'the-power-of-now': 'Eckhart Tolle',
      'sapiens': 'Yuval Noah Harari',
      'thinking-fast-and-slow': 'Daniel Kahneman',
      'the-alchemist': 'Paulo Coelho',
      'educated': 'Tara Westover',
      'becoming': 'Michelle Obama',
      'the-four-agreements': 'Don Miguel Ruiz',
      'dune': 'Frank Herbert',
      'project-hail-mary': 'Andy Weir',
      'rich-dad-poor-dad': 'Robert T. Kiyosaki'
    }
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

    // Set text alignment based on language
    if (language === 'ar') {
      document.body.classList.add('rtl');
      document.body.style.textAlign = 'right';
    } else {
      document.body.classList.remove('rtl');
      document.body.style.textAlign = 'left';
    }

    // Trigger a re-render of the app
    window.dispatchEvent(new Event('languagechange'));
  };

  const t = (key: string): string => {
    const translation = translations[currentLanguage];
    if (!translation) return key;

    const value = translation[key as keyof typeof translations['en']];
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      // For nested objects like bookTitles and bookAuthors
      return JSON.stringify(value);
    }
    return key;
  };

  const getBookTitle = (bookId: string): string => {
    const bookTitles = translations[currentLanguage].bookTitles as any;
    return bookTitles?.[bookId] || bookId;
  };

  const getBookAuthor = (bookId: string): string => {
    const bookAuthors = translations[currentLanguage].bookAuthors as any;
    return bookAuthors?.[bookId] || bookId;
  };

  const value: LanguageContextType = {
    currentLanguage,
    language: currentLanguage,
    setLanguage,
    t,
    getBookTitle,
    getBookAuthor
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
