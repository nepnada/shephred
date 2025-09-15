import { useState, createContext, useContext, ReactNode } from 'react';

type Language = 'ar' | 'en' | 'darija';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

const translations = {
  // Menu items
  'menu.dashboard': {
    ar: 'لوحة التحكم',
    en: 'Dashboard',
    darija: 'لوحة التحكم'
  },
  'menu.health': {
    ar: 'مراقب الصحة',
    en: 'Health Monitor',
    darija: 'مراقب الصحة'
  },
  'menu.counter': {
    ar: 'عداد الأغنام',
    en: 'Sheep Counter', 
    darija: 'عداد الأغنام'
  },
  'menu.map': {
    ar: 'خريطة الرعي',
    en: 'Grazing Map',
    darija: 'خريطة الرعي'
  },
  'menu.plants': {
    ar: 'النباتات والتنبيهات',
    en: 'Plants & Alerts',
    darija: 'النباتات والتنبيهات'
  },
  'menu.settings': {
    ar: 'الإعدادات',
    en: 'Settings',
    darija: 'الإعدادات'
  },
  'menu.title': {
    ar: 'القائمة',
    en: 'Menu',
    darija: 'القائمة'
  },

  // Header & Navigation
  'header.title': {
    ar: 'أطلس حارس القطيع',
    en: 'Atlas Flock Guard',
    darija: 'أطلس حارس القطيع'
  },
  'header.subtitle': {
    ar: 'نظام إدارة الأغنام الذكي',
    en: 'Smart Sheep Management System', 
    darija: 'نظام إدارة الأغنام الذكي'
  },
  
  // Hero Section
  'hero.title': {
    ar: 'حماية ذكية للأغنام بالذكاء الاصطناعي',
    en: 'AI-Powered Smart Sheep Protection',
    darija: 'حماية ذكية للڭنم بالذكاء الاصطناعي'
  },
  'hero.subtitle': {
    ar: 'تقنيات متقدمة لمراقبة صحة القطيع، عدّ الأغنام، والرعي الآمن في المغرب',
    en: 'Advanced technology for flock health monitoring, sheep counting, and safe grazing in Morocco',
    darija: 'تقنيات متقدمة لمراقبة صحة القطيع، عدّ الڭنم، والرعي الآمن ف المغريب'
  },
  'hero.cta': {
    ar: 'ابدأ الآن',
    en: 'Get Started',
    darija: 'بدا دابا'
  },
  
  // Health Monitor
  'health.title': {
    ar: 'مراقبة صحة الأغنام',
    en: 'Sheep Health Monitor',
    darija: 'مراقبة صحة الڭنم'
  },
  'health.description': {
    ar: 'ارفع أو التقط صورة لخروفك للحصول على تحليل صحي بالذكاء الاصطناعي',
    en: 'Upload or capture a photo of your sheep for AI health analysis',
    darija: 'ارفع ولا صور الخروف ديالك باش تاخد تحليل صحي بالذكاء الاصطناعي'
  },
  'health.upload': {
    ar: 'رفع صورة',
    en: 'Upload Photo',
    darija: 'رفع صورة'
  },
  'health.camera': {
    ar: 'التقاط صورة',
    en: 'Take Photo',
    darija: 'صور'
  },
  'health.analyzing': {
    ar: 'جاري تحليل صحة الخروف...',
    en: 'Analyzing sheep health...',
    darija: 'كنحلل صحة الخروف...'
  },
  'health.healthy': {
    ar: 'خروف سليم',
    en: 'Healthy Sheep',
    darija: 'خروف سليم'
  },
  'health.issues': {
    ar: 'مشاكل صحية مكتشفة',
    en: 'Health Issues Detected',
    darija: 'مشاكل صحية مكتشفة'
  },
  'health.confidence': {
    ar: 'الثقة',
    en: 'Confidence',
    darija: 'الثقة'
  },
  'health.recommendations': {
    ar: 'التوصيات',
    en: 'Recommendations',
    darija: 'التوصيات'
  },
  'health.another': {
    ar: 'تحليل خروف آخر',
    en: 'Analyze Another Sheep',
    darija: 'حلل خروف آخر'
  },
  
  // Flock Counter
  'flock.title': {
    ar: 'عداد الأغنام وكشف السرقة',
    en: 'Sheep Counter & Theft Detection',
    darija: 'عداد الڭنم وكشف السرقة'
  },
  'flock.description': {
    ar: 'مراقبة القطيع بالكاميرا المباشرة وكشف الأنشطة المشبوهة',
    en: 'Live camera monitoring and suspicious activity detection',
    darija: 'مراقبة القطيع بالكاميرا المباشرة وكشف الأنشطة المشبوهة'
  },
  'flock.camera': {
    ar: 'تشغيل الكاميرا',
    en: 'Start Camera',
    darija: 'شغل الكاميرا'
  },
  'flock.count': {
    ar: 'عدد الأغنام',
    en: 'Sheep Count',
    darija: 'عدد الڭنم'
  },
  'flock.status': {
    ar: 'الحالة',
    en: 'Status',
    darija: 'الحالة'
  },
  'flock.all_present': {
    ar: 'جميع الأغنام موجودة',
    en: 'All sheep present',
    darija: 'جميع الڭنم موجودة'
  },
  'flock.missing': {
    ar: 'أغنام مفقودة',
    en: 'sheep missing',
    darija: 'ڭنم مفقودة'
  },
  'flock.suspicious': {
    ar: 'نشاط مشبوه مكتشف',
    en: 'Suspicious activity detected',
    darija: 'نشاط مشبوه مكتشف'
  },
  'flock.last_count': {
    ar: 'آخر عدد',
    en: 'Last Count',
    darija: 'آخر عدد'
  },
  
  // Grazing Map
  'map.title': {
    ar: 'مسارات الرعي الآمنة',
    en: 'Safe Grazing Routes',
    darija: 'مسارات الرعي الآمنة'
  },
  'map.description': {
    ar: 'مسارات محسنة بالذكاء الاصطناعي تتجنب المخاطر والمناطق المحمية',
    en: 'AI-optimized routes avoiding dangers and protected areas',
    darija: 'مسارات محسنة بالذكاء الاصطناعي تتجنب المخاطر والمناطق المحمية'
  },
  'map.interactive': {
    ar: 'خريطة الرعي التفاعلية',
    en: 'Interactive Grazing Map',
    darija: 'خريطة الرعي التفاعلية'
  },
  'map.directions': {
    ar: 'الحصول على الاتجاهات',
    en: 'Get Directions',
    darija: 'الحصول على الاتجاهات'
  },
  'map.weather': {
    ar: 'فحص الطقس',
    en: 'Weather Check',
    darija: 'فحص الطقس'
  },
  'map.routes': {
    ar: 'المسارات المتاحة',
    en: 'Available Routes',
    darija: 'المسارات المتاحة'
  },
  'map.safe': {
    ar: 'آمن',
    en: 'Safe',
    darija: 'آمن'
  },
  'map.caution': {
    ar: 'احذر',
    en: 'Caution',
    darija: 'احذر'
  },
  'map.danger': {
    ar: 'خطر',
    en: 'Danger',
    darija: 'خطر'
  },
  'map.distance': {
    ar: 'المسافة',
    en: 'Distance',
    darija: 'المسافة'
  },
  'map.duration': {
    ar: 'المدة',
    en: 'Duration',
    darija: 'المدة'
  },
  'map.hazards': {
    ar: 'المخاطر',
    en: 'Hazards',
    darija: 'المخاطر'
  },
  'map.features': {
    ar: 'المميزات',
    en: 'Features',
    darija: 'المميزات'
  },
  'map.weather_alert': {
    ar: 'تنبيه جوي',
    en: 'Weather Alert',
    darija: 'تنبيه جوي'
  },
  'map.rain_warning': {
    ar: 'أمطار متوقعة بعد الظهر. تجنب المناطق المنخفضة.',
    en: 'Rain expected this afternoon. Avoid low-lying areas.',
    darija: 'شتا متوقعة هاد العشية. تجنب المناطق المنخفضة.'
  },
  
  // Language Selector
  'language.arabic': {
    ar: 'العربية',
    en: 'Arabic',
    darija: 'العربية'
  },
  'language.english': {
    ar: 'الإنجليزية',
    en: 'English',
    darija: 'الإنجليزية'
  },
  'language.darija': {
    ar: 'الدارجة',
    en: 'Darija',
    darija: 'الدارجة'
  },
  
  // Security & Protection
  'security.title': {
    ar: 'حماية من السرقة',
    en: 'Theft Protection',
    darija: 'حماية من السرقة'
  },
  'security.description': {
    ar: 'تنبيهات فورية للأنشطة المشبوهة',
    en: 'Instant alerts for suspicious activities',
    darija: 'تنبيهات فورية للأنشطة المشبوهة'
  },

  // Health Monitor additional
  'health.upload_photo': {
    ar: 'رفع صورة',
    en: 'Upload Photo',
    darija: 'رفع صورة'
  },
  'health.take_photo': {
    ar: 'التقاط صورة',
    en: 'Take Photo',
    darija: 'صور'
  },
  'health.upload_title': {
    ar: 'رفع صورة الخروف',
    en: 'Upload Sheep Photo',
    darija: 'رفع صورة الخروف'
  },
  'health.upload_instruction': {
    ar: 'التقط صورة واضحة لخروفك للحصول على تحليل صحي',
    en: 'Take a clear photo of your sheep for health analysis',
    darija: 'صور الخروف ديالك واضح باش تاخد تحليل صحي'
  },
  'health.analysis_title': {
    ar: 'تحليل الصحة',
    en: 'Health Analysis',
    darija: 'تحليل الصحة'
  },
  'health.issues_found': {
    ar: 'المشاكل المكتشفة:',
    en: 'Issues Found:',
    darija: 'المشاكل المكتشفة:'
  },
  'health.upload_instruction_start': {
    ar: 'ارفع صورة لبدء تحليل الصحة',
    en: 'Upload a photo to begin health analysis',
    darija: 'رفع صورة باش تبدا تحليل الصحة'
  },

  // Flock Counter additional
  'flock.security_mode': {
    ar: 'وضع الأمان',
    en: 'Security Mode',
    darija: 'وضع الأمان'
  },
  'flock.ai_analyzing': {
    ar: 'الذكاء الاصطناعي يحلل القطيع...',
    en: 'AI analyzing flock...',
    darija: 'الذكاء الاصطناعي كيحلل القطيع...'
  },
  'flock.camera_feed': {
    ar: 'سيظهر هنا بث الكاميرا',
    en: 'Camera feed will appear here',
    darija: 'غادي يبان هنا بث الكاميرا'
  },
  'flock.sheep_detected': {
    ar: 'أغنام مكتشفة',
    en: 'Sheep detected',
    darija: 'ڭنم مكتشفة'
  },
  'flock.confidence_percent': {
    ar: '% ثقة',
    en: '% confidence',
    darija: '% ثقة'
  },
  'flock.previous_count': {
    ar: 'العدد السابق',
    en: 'Previous count',
    darija: 'العدد السابق'
  },
  'flock.difference': {
    ar: 'الفرق',
    en: 'Difference',
    darija: 'الفرق'
  },
  'flock.alert_missing': {
    ar: 'تنبيه: أغنام مفقودة',
    en: 'Alert: Missing Sheep',
    darija: 'تنبيه: ڭنم مفقودة'
  },
  'flock.missing_description': {
    ar: 'أغنام مفقودة من قطيعك. يرجى فحص المنطقة المحيطة والنظر في الإبلاغ إذا تم اكتشاف نشاط مشبوه.',
    en: 'sheep are missing from your flock. Please check the surrounding area and consider reporting if suspicious activity was detected.',
    darija: 'ڭنم مفقودة من القطيع ديالك. تأكد من المنطقة لي حداك وفكر تبلغ إذا تم اكتشاف نشاط مشبوه.'
  },
  'flock.suspicious_detected': {
    ar: 'تم اكتشاف نشاط مشبوه',
    en: 'Suspicious Activity Detected',
    darija: 'تم اكتشاف نشاط مشبوه'
  },
  'flock.suspicious_description': {
    ar: 'تم اكتشاف أنماط حركة غير عادية. راقب قطيعك عن كثب.',
    en: 'Unusual movement patterns detected. Monitor your flock closely.',
    darija: 'تم اكتشاف أنماط حركة غير عادية. راقب القطيع ديالك مزيان.'
  },
  'flock.last_counted': {
    ar: 'آخر عد:',
    en: 'Last counted:',
    darija: 'آخر عد:'
  },
  'flock.start_counting': {
    ar: 'ابدأ العد لرؤية النتائج',
    en: 'Start counting to see results',
    darija: 'بدا العد باش تشوف النتائج'
  },

  // Grazing Map additional
  'map.your_location': {
    ar: 'موقعك',
    en: 'Your Location',
    darija: 'موقعك'
  },
  'map.route_north': {
    ar: 'طريق الوادي الشمالي',
    en: 'North Valley Route',
    darija: 'طريق الوادي الشمالي'
  },
  'map.route_east': {
    ar: 'طريق التلال الشرقية',
    en: 'East Hills Route',
    darija: 'طريق التلال الشرقية'
  },
  'map.route_south': {
    ar: 'طريق الطريق الجنوبي',
    en: 'South Road Route',
    darija: 'طريق الطريق الجنوبي'
  },
  'map.fresh_grass': {
    ar: 'عشب طازج',
    en: 'Fresh grass',
    darija: 'حشيش طازج'
  },
  'map.water_source': {
    ar: 'مصدر مياه',
    en: 'Water source',
    darija: 'مصدر الماء'
  },
  'map.shade_available': {
    ar: 'ظل متوفر',
    en: 'Shade available',
    darija: 'ظل متوفر'
  },
  'map.steep_terrain': {
    ar: 'تضاريس شديدة الانحدار',
    en: 'Steep terrain',
    darija: 'تضاريس صعيبة'
  },
  'map.weather_warning': {
    ar: 'تحذير جوي',
    en: 'Weather warning',
    darija: 'تحذير جوي'
  },
  'map.rich_pasture': {
    ar: 'مرعى غني',
    en: 'Rich pasture',
    darija: 'مرعى غني'
  },
  'map.mineral_deposits': {
    ar: 'رواسب معدنية',
    en: 'Mineral deposits',
    darija: 'رواسب معدنية'
  },
  'map.busy_road': {
    ar: 'طريق مزدحم',
    en: 'Busy road',
    darija: 'طريق مزحام'
  },
  'map.toxic_plants': {
    ar: 'نباتات سامة',
    en: 'Toxic plants',
    darija: 'نباتات سامة'
  },
  'map.protected_area': {
    ar: 'منطقة محمية',
    en: 'Protected area',
    darija: 'منطقة محمية'
  },
  'map.excellent_grass': {
    ar: 'جودة عشب ممتازة',
    en: 'Excellent grass quality',
    darija: 'جودة حشيش ممتازة'
  },

  // Plants & Insects
  'plants.title': {
    ar: 'تنبيهات النباتات والحشرات',
    en: 'Plants & Insects Alerts',
    darija: 'تنبيهات النباتات والحشرات'
  },
  'plants.description': {
    ar: 'معلومات محدثة حول المخاطر النباتية والحشرية حسب المدينة والموسم',
    en: 'Updated regional and seasonal hazard information',
    darija: 'معلومات محدثة حول المخاطر النباتية والحشرية حسب المدينة والموسم'
  },
  'plants.select_city': {
    ar: 'اختر مدينتك',
    en: 'Select Your City',
    darija: 'اختار مدينتك'
  },
  'plants.poisonous': {
    ar: 'النباتات السامة',
    en: 'Poisonous Plants',
    darija: 'النباتات السامة'
  },
  'plants.insects': {
    ar: 'الحشرات الموسمية',
    en: 'Seasonal Insects',
    darija: 'الحشرات الموسمية'
  },
  'plants.weather_info': {
    ar: 'معلومات الطقس',
    en: 'Weather Information',
    darija: 'معلومات الطقس'
  },
  'plants.symptoms': {
    ar: 'الأعراض',
    en: 'Symptoms',
    darija: 'الأعراض'
  },
  'plants.locations': {
    ar: 'الأماكن',
    en: 'Locations',
    darija: 'الأماكن'
  },
  'plants.prevention': {
    ar: 'الوقاية',
    en: 'Prevention',
    darija: 'الوقاية'
  },
  'plants.high_toxicity': {
    ar: 'عالي الخطورة',
    en: 'High Toxicity',
    darija: 'عالي الخطورة'
  },
  'plants.medium_toxicity': {
    ar: 'متوسط الخطورة',
    en: 'Medium Toxicity',
    darija: 'متوسط الخطورة'
  },
  'plants.low_toxicity': {
    ar: 'منخفض الخطورة',
    en: 'Low Toxicity',
    darija: 'منخفض الخطورة'
  },

  // Common
  'loading': {
    ar: 'جاري التحميل...',
    en: 'Loading...',
    darija: 'كيتحمل...'
  },
  'error': {
    ar: 'خطأ',
    en: 'Error',
    darija: 'خطأ'
  },
  'success': {
    ar: 'نجح',
    en: 'Success', 
    darija: 'نجح'
  },
  'start': {
    ar: 'ابدأ',
    en: 'Start',
    darija: 'بدا'
  },
  'stop': {
    ar: 'توقف',
    en: 'Stop',
    darija: 'وقف'
  },
  'live': {
    ar: 'مباشر',
    en: 'Live',
    darija: 'مباشر'
  },
  'camera': {
    ar: 'الكاميرا',
    en: 'Camera',
    darija: 'الكاميرا'
  },
  'route': {
    ar: 'الطريق',
    en: 'Route',
    darija: 'الطريق'
  },
  'routes': {
    ar: 'الطرق',
    en: 'Routes',
    darija: 'الطرق'
  },

  // Dashboard
  'dashboard.welcome': {
    ar: 'مرحباً بك في مزرعتك',
    en: 'Welcome to Your Farm',
    darija: 'مرحباً بك في مزرعتك'
  },
  'dashboard.subtitle': {
    ar: 'إدارة قطيعك بسهولة وكفاءة',
    en: 'Manage your flock with ease and efficiency',
    darija: 'إدارة قطيعك بسهولة وكفاءة'
  },
  'dashboard.my_flock': {
    ar: 'قطيعي',
    en: 'My Flock',
    darija: 'قطيعي'
  },
  'dashboard.total_sheep': {
    ar: 'إجمالي الأغنام',
    en: 'Total Sheep',
    darija: 'إجمالي الأغنام'
  },
  'dashboard.healthy': {
    ar: 'سليمة',
    en: 'Healthy',
    darija: 'سليمة'
  },
  'dashboard.sick': {
    ar: 'مريضة',
    en: 'Sick',
    darija: 'مريضة'
  },
  'dashboard.location': {
    ar: 'الموقع',
    en: 'Location',
    darija: 'الموقع'
  },
  'dashboard.update_data': {
    ar: 'تحديث بيانات القطيع',
    en: 'Update Flock Data',
    darija: 'تحديث بيانات القطيع'
  },
  'dashboard.sheep_count': {
    ar: 'عدد الأغنام',
    en: 'Sheep Count',
    darija: 'عدد الأغنام'
  },
  'dashboard.quick_locations': {
    ar: 'المواقع السريعة',
    en: 'Quick Locations',
    darija: 'المواقع السريعة'
  },
  'dashboard.last_updated': {
    ar: 'آخر تحديث',
    en: 'Last Updated',
    darija: 'آخر تحديث'
  },
  'dashboard.active_alerts': {
    ar: 'التنبيهات النشطة',
    en: 'Active Alerts',
    darija: 'التنبيهات النشطة'
  },
  'dashboard.health_check': {
    ar: 'فحص صحي',
    en: 'Health Check',
    darija: 'فحص صحي'
  },
  'dashboard.update_location': {
    ar: 'تحديث الموقع',
    en: 'Update Location',
    darija: 'تحديث الموقع'
  },
  'dashboard.manage_flocks': {
    ar: 'إدارة القطعان',
    en: 'Manage Flocks',
    darija: 'إدارة القطعان'
  },
  'dashboard.add_flock': {
    ar: 'إضافة قطيع',
    en: 'Add Flock',
    darija: 'إضافة قطيع'
  },
  'dashboard.flock_name': {
    ar: 'اسم القطيع',
    en: 'Flock Name',
    darija: 'اسم القطيع'
  },
  'dashboard.enter_flock_name': {
    ar: 'أدخل اسم القطيع',
    en: 'Enter flock name',
    darija: 'أدخل اسم القطيع'
  },
  'dashboard.sheep_in_flock': {
    ar: 'عدد الأغنام في القطيع',
    en: 'Sheep in flock',
    darija: 'عدد الأغنام في القطيع'
  },
  'dashboard.add': {
    ar: 'إضافة',
    en: 'Add',
    darija: 'إضافة'
  },
  'dashboard.edit': {
    ar: 'تعديل',
    en: 'Edit',
    darija: 'تعديل'
  },
  'dashboard.delete': {
    ar: 'حذف',
    en: 'Delete',
    darija: 'حذف'
  },
  'dashboard.no_flocks': {
    ar: 'لا توجد قطعان مسجلة',
    en: 'No flocks registered',
    darija: 'لا توجد قطعان مسجلة'
  },
  'dashboard.create_first_flock': {
    ar: 'أنشئ قطيعك الأول',
    en: 'Create your first flock',
    darija: 'أنشئ قطيعك الأول'
  }
};

interface TranslationProviderProps {
  children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
  const [language, setLanguage] = useState<Language>('ar');
  
  const t = (key: string): string => {
    const translation = translations[key as keyof typeof translations];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };
  
  const value = {
    language,
    setLanguage,
    t
  };
  
  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};