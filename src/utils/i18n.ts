import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Helper functions for nested object access
const getNestedValue = (obj: any, keys: string[]): any => {
  return keys.reduce((current, key) => current?.[key], obj);
};

const setNestedValue = (obj: any, keys: string[], value: any): void => {
  keys.reduce((current, key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = current[key] || {};
    }
    return current[key];
  }, obj);
};

// Types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Translations {
  [key: string]: string | Translations;
}

// Available languages (8 most spoken languages globally)
export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' }
];

// Translation data (simplified for demo - in production, load from API)
const TRANSLATIONS: Record<string, Translations> = {
  en: {
    nav: {
      home: 'Home',
      services: 'Services',
      tracking: 'Tracking',
      quote: 'Quote',
      contact: 'Contact',
      getQuote: 'Get Quote'
    },
    services: {
      shipping: 'Maritime Shipping',
      air: 'Air Freight',
      delivery: 'Door-to-Door Delivery',
      special: 'Special Packages'
    },
    footer: {
      company: 'ColisSelect - Transport & Logistics',
      services: 'Our Services',
      quickLinks: 'Quick Links',
      contact: 'Contact',
      newsletter: 'Newsletter',
      copyright: '© 2025 ColisSelect. All rights reserved.'
    },
    home: {
      hero: {
        badge: 'Reliable Transport & Logistics',
        title: 'Fast and reliable package shipping',
        subtitle: 'Economic shipping solutions for individuals and businesses. Send your packages safely anywhere in France and internationally.',
        cta: 'Get a Quote',
        discover: 'Discover our services',
        tracking: 'Track your package',
        trackingPlaceholder: 'Ex: CS-12345678',
        trackingButton: 'Track my package',
        secure: 'Secure real-time tracking'
      },
      features: {
        global: 'Global Coverage',
        globalDesc: 'Ship your packages worldwide thanks to our international logistics network covering more than 200 countries.',
        competitive: 'Competitive Rates',
        competitiveDesc: 'Benefit from the best market prices thanks to our instant comparison system between carriers.',
        support: '24/7 Support',
        supportDesc: 'Our customer service team is available 24/7 to answer your questions and resolve your issues.'
      },
      services: {
        title: 'Premium Shipping Services',
        subtitle: 'Discover our different shipping solutions adapted to all your needs, whether by sea, air or land.',
        maritime: 'Maritime Shipping',
        maritimeDesc: 'Economic solution for bulky shipments without time constraints.',
        air: 'Air Freight',
        airDesc: 'Fast delivery for urgent shipments and important documents.',
        door: 'Door-to-Door Delivery',
        doorDesc: 'Complete service of home pickup and delivery.',
        special: 'Special Packages',
        specialDesc: 'Secure transport of fragile, valuable or oversized objects.'
      },
      howItWorks: {
        title: 'How it works',
        subtitle: 'Shipping a package with ColisSelect is simple and fast. Follow these steps to send your package safely.',
        step1: 'Get a quote',
        step1Desc: 'Fill out our online form to get an instant quote based on your shipment.',
        step2: 'Prepare your package',
        step2Desc: 'Carefully pack your package and prepare the necessary documents for shipping.',
        step3: 'Pickup or drop-off',
        step3Desc: 'Choose between home pickup or drop-off at one of our relay points.',
        step4: 'Track your shipment',
        step4Desc: 'Receive a tracking number to monitor your package progress in real time.',
        start: 'Start now'
      },
      testimonials: {
        title: 'What our customers say',
        subtitle: 'Discover testimonials from our satisfied customers who trust ColisSelect for their shipping needs.',
        text1: 'Excellent service! My fragile package arrived on time and in perfect condition despite an international journey. The ColisSelect team was proactive and kept me informed at every step.',
        text2: 'As an SME, we need reliable shipping service and affordable. ColisSelect perfectly meets our expectations with competitive rates and exceptional customer service.',
        text3: 'I appreciate the price transparency and the ability to track my package in real time. ColisSelect has made international shipping simple and affordable for my business.'
      },
      cta: {
        title: 'Ready to ship your package?',
        subtitle: 'Get an instant quote and start your shipment today with ColisSelect.',
        origin: 'Origin country',
        destination: 'Destination country',
        weight: 'Weight (kg)',
        weightPlaceholder: 'Ex: 5',
        getQuote: 'Get a quote',
        contact: 'Contact us'
      },
      trust: {
        experience: 'Years of experience',
        experienceDesc: 'Proven logistics expertise',
        packages: 'Packages delivered',
        packagesDesc: 'Every month worldwide',
        destinations: 'Destinations',
        destinationsDesc: 'Global coverage',
        satisfaction: 'Satisfied customers',
        satisfactionDesc: 'Premium customer service'
      },
      partners: {
        title: 'Our Trusted Partners',
        subtitle: 'We collaborate with the best global carriers to offer you optimal service'
      }
    }
  },
  zh: {
    nav: {
      home: '首页',
      services: '服务',
      tracking: '追踪',
      quote: '报价',
      contact: '联系我们',
      getQuote: '获取报价'
    },
    services: {
      shipping: '海运',
      air: '空运',
      delivery: '门到门配送',
      special: '特殊包裹'
    },
    footer: {
      company: 'ColisSelect - 运输与物流',
      services: '我们的服务',
      quickLinks: '快速链接',
      contact: '联系方式',
      newsletter: '新闻通讯',
      copyright: '© 2025 ColisSelect。保留所有权利。'
    },
    home: {
      hero: {
        badge: '可靠的运输与物流',
        title: '快速可靠的包裹运输',
        subtitle: '为个人和企业提供经济的运输解决方案。在法国和国际上安全发送您的包裹。',
        cta: '获取报价',
        discover: '发现我们的服务',
        tracking: '跟踪您的包裹',
        trackingPlaceholder: '例如：CS-12345678',
        trackingButton: '跟踪我的包裹',
        secure: '安全的实时跟踪'
      },
      features: {
        global: '全球覆盖',
        globalDesc: '通过我们的国际物流网络发送您的包裹，覆盖超过200个国家。',
        competitive: '有竞争力的价格',
        competitiveDesc: '通过我们的即时比较系统享受市场上最好的价格。',
        support: '24/7支持',
        supportDesc: '我们的客户服务团队24/7可用，回答您的问题并解决您的问题。'
      },
      services: {
        title: '优质运输服务',
        subtitle: '发现适合您所有需求的各种运输解决方案，无论是由海路、空运还是陆路。',
        maritime: '海运',
        maritimeDesc: '经济解决方案，用于大宗货物运输，没有时间限制。',
        air: '空运',
        airDesc: '快速交付紧急货物和重要文件。',
        door: '门到门交付',
        doorDesc: '完整的上门取货和送货服务。',
        special: '特殊包裹',
        specialDesc: '安全运输易碎、贵重或超大物品。'
      },
      howItWorks: {
        title: '它是如何工作的',
        subtitle: '使用ColisSelect发送包裹简单快捷。按照这些步骤安全发送您的包裹。',
        step1: '获取报价',
        step1Desc: '填写我们的在线表格，根据您的货物获取即时报价。',
        step2: '准备您的包裹',
        step2Desc: '仔细包装您的包裹并准备运输所需的必要文件。',
        step3: '取货或投递',
        step3Desc: '选择上门取货或在我们的某个中继点投递。',
        step4: '跟踪您的货物',
        step4Desc: '接收跟踪号码实时监控您的包裹进度。',
        start: '立即开始'
      },
      testimonials: {
        title: '我们的客户说什么',
        subtitle: '发现我们满意客户的推荐，他们信任ColisSelect处理他们的运输需求。',
        text1: '出色的服务！我的易碎包裹按时到达并完好无损，尽管是国际运输。ColisSelect团队非常主动，并在每个步骤都让我了解情况。',
        text2: '作为中小企业，我们需要可靠的运输服务和实惠。ColisSelect完美满足我们的期望，具有竞争力的价格和卓越的客户服务。',
        text3: '我特别欣赏价格透明度和实时跟踪包裹的能力。ColisSelect使国际运输对我的企业变得简单和实惠。'
      },
      cta: {
        title: '准备发送您的包裹？',
        subtitle: '立即获取即时报价，并开始使用ColisSelect进行您的运输。',
        origin: '原产国',
        destination: '目的地国家',
        weight: '重量（公斤）',
        weightPlaceholder: '例如：5',
        getQuote: '获取报价',
        contact: '联系我们'
      },
      trust: {
        experience: '多年的经验',
        experienceDesc: '经过验证的物流专业知识',
        packages: '交付的包裹',
        packagesDesc: '每月全球',
        destinations: '目的地',
        destinationsDesc: '全球覆盖',
        satisfaction: '满意的客户',
        satisfactionDesc: '优质客户服务'
      },
      partners: {
        title: '我们的可信合作伙伴',
        subtitle: '我们与最好的全球承运商合作，为您提供最佳服务'
      }
    }
  },
  hi: {
    nav: {
      home: 'होम',
      services: 'सेवाएं',
      tracking: 'ट्रैकिंग',
      quote: 'कोट',
      contact: 'संपर्क',
      getQuote: 'कोट प्राप्त करें'
    },
    services: {
      shipping: 'समुद्री शिपिंग',
      air: 'एयर फ्रेट',
      delivery: 'दरवाजे से दरवाजे डिलीवरी',
      special: 'विशेष पैकेज'
    },
    footer: {
      company: 'ColisSelect - परिवहन और लॉजिस्टिक्स',
      services: 'हमारी सेवाएं',
      quickLinks: 'त्वरित लिंक',
      contact: 'संपर्क',
      newsletter: 'न्यूज़लेटर',
      copyright: '© 2025 ColisSelect। सभी अधिकार सुरक्षित।'
    }
  },
  es: {
    nav: {
      home: 'Inicio',
      services: 'Servicios',
      tracking: 'Seguimiento',
      quote: 'Cotización',
      contact: 'Contacto',
      getQuote: 'Obtener Cotización'
    },
    services: {
      shipping: 'Envío Marítimo',
      air: 'Carga Aérea',
      delivery: 'Entrega Puerta a Puerta',
      special: 'Paquetes Especiales'
    },
    footer: {
      company: 'ColisSelect - Transporte y Logística',
      services: 'Nuestros Servicios',
      quickLinks: 'Enlaces Rápidos',
      contact: 'Contacto',
      newsletter: 'Boletín',
      copyright: '© 2025 ColisSelect. Todos los derechos reservados.'
    },
    home: {
      hero: {
        badge: 'Transporte y Logística Confiables',
        title: 'Envío de paquetes rápido y confiable',
        subtitle: 'Soluciones económicas de envío para individuos y empresas. Envía tus paquetes de forma segura en Francia e internacionalmente.',
        cta: 'Obtener Cotización',
        discover: 'Descubre nuestros servicios',
        tracking: 'Rastrea tu paquete',
        trackingPlaceholder: 'Ej: CS-12345678',
        trackingButton: 'Rastrear mi paquete',
        secure: 'Seguimiento seguro en tiempo real'
      },
      features: {
        global: 'Cobertura Global',
        globalDesc: 'Envía tus paquetes a todo el mundo gracias a nuestra red logística internacional que cubre más de 200 países.',
        competitive: 'Precios Competitivos',
        competitiveDesc: 'Disfruta de los mejores precios del mercado gracias a nuestro sistema de comparación instantánea entre transportistas.',
        support: 'Soporte 24/7',
        supportDesc: 'Nuestro equipo de servicio al cliente está disponible 24/7 para responder tus preguntas y resolver tus problemas.'
      },
      services: {
        title: 'Servicios de Envío Premium',
        subtitle: 'Descubre nuestras diferentes soluciones de envío adaptadas a todas tus necesidades, ya sea por mar, aire o tierra.',
        maritime: 'Envío Marítimo',
        maritimeDesc: 'Solución económica para envíos voluminosos sin restricciones de tiempo.',
        air: 'Carga Aérea',
        airDesc: 'Entrega rápida para envíos urgentes y documentos importantes.',
        door: 'Entrega Puerta a Puerta',
        doorDesc: 'Servicio completo de recogida y entrega a domicilio.',
        special: 'Paquetes Especiales',
        specialDesc: 'Transporte seguro de objetos frágiles, valiosos o de tamaño no estándar.'
      },
      howItWorks: {
        title: 'Cómo funciona',
        subtitle: 'Enviar un paquete con ColisSelect es simple y rápido. Sigue estos pasos para enviar tu paquete de forma segura.',
        step1: 'Obtener cotización',
        step1Desc: 'Completa nuestro formulario en línea para obtener una cotización instantánea basada en tu envío.',
        step2: 'Preparar tu paquete',
        step2Desc: 'Empaqueta cuidadosamente tu paquete y prepara los documentos necesarios para el envío.',
        step3: 'Recogida o entrega',
        step3Desc: 'Elige entre recogida a domicilio o entrega en uno de nuestros puntos de recogida.',
        step4: 'Rastrea tu envío',
        step4Desc: 'Recibe un número de seguimiento para monitorear el progreso de tu paquete en tiempo real.',
        start: 'Comenzar ahora'
      },
      testimonials: {
        title: 'Qué dicen nuestros clientes',
        subtitle: 'Descubre los testimonios de nuestros clientes satisfechos que confían en ColisSelect para sus necesidades de envío.',
        text1: '¡Servicio excepcional! Mi paquete frágil llegó a tiempo y en perfecto estado a pesar de un viaje internacional. El equipo de ColisSelect fue proactivo y me mantuvo informado en cada paso.',
        text2: 'Como PYME, necesitamos un servicio de envío confiable y asequible. ColisSelect cumple perfectamente con nuestras expectativas con tarifas competitivas y servicio al cliente excepcional.',
        text3: 'Aprecio especialmente la transparencia de precios y la posibilidad de rastrear mi paquete en tiempo real. ColisSelect ha hecho que el envío internacional sea simple y asequible para mi empresa.'
      },
      cta: {
        title: '¿Listo para enviar tu paquete?',
        subtitle: 'Obtén una cotización instantánea y comienza tu envío hoy con ColisSelect.',
        origin: 'País de origen',
        destination: 'País de destino',
        weight: 'Peso (kg)',
        weightPlaceholder: 'Ej: 5',
        getQuote: 'Obtener cotización',
        contact: 'Contáctanos'
      },
      trust: {
        experience: 'Años de experiencia',
        experienceDesc: 'Experiencia logística probada',
        packages: 'Paquetes entregados',
        packagesDesc: 'Cada mes en todo el mundo',
        destinations: 'Destinos',
        destinationsDesc: 'Cobertura global',
        satisfaction: 'Clientes satisfechos',
        satisfactionDesc: 'Servicio al cliente premium'
      },
      partners: {
        title: 'Nuestros Socios de Confianza',
        subtitle: 'Colaboramos con los mejores transportistas globales para ofrecerte un servicio óptimo'
      }
    }
  },
  fr: {
    nav: {
      home: 'Accueil',
      services: 'Services',
      tracking: 'Suivi',
      quote: 'Devis',
      contact: 'Contact',
      getQuote: 'Demander un devis'
    },
    services: {
      shipping: 'Expédition Maritime',
      air: 'Fret Aérien',
      delivery: 'Livraison Porte-à-Porte',
      special: 'Colis Spéciaux'
    },
    footer: {
      company: 'ColisSelect - Transport & Logistique',
      services: 'Nos Services',
      quickLinks: 'Liens Rapides',
      contact: 'Contact',
      newsletter: 'Newsletter',
      copyright: '© 2025 ColisSelect. Tous droits réservés.'
    }
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      services: 'الخدمات',
      tracking: 'التتبع',
      quote: 'عرض الأسعار',
      contact: 'اتصل بنا',
      getQuote: 'احصل على عرض أسعار'
    },
    services: {
      shipping: 'الشحن البحري',
      air: 'الشحن الجوي',
      delivery: 'التوصيل من الباب إلى الباب',
      special: 'الحزم الخاصة'
    },
    footer: {
      company: 'ColisSelect - النقل واللوجستيات',
      services: 'خدماتنا',
      quickLinks: 'روابط سريعة',
      contact: 'اتصل بنا',
      newsletter: 'النشرة الإخبارية',
      copyright: '© 2025 ColisSelect. جميع الحقوق محفوظة.'
    },
    home: {
      hero: {
        badge: 'النقل واللوجستيات الموثوقة',
        title: 'شحن سريع وموثوق للحزم',
        subtitle: 'حلول شحن اقتصادية للأفراد والشركات. أرسل حزمك بأمان في فرنسا ودولياً.',
        cta: 'احصل على عرض أسعار',
        discover: 'اكتشف خدماتنا',
        tracking: 'تتبع حزمةك',
        trackingPlaceholder: 'مثال: CS-12345678',
        trackingButton: 'تتبع حزمةي',
        secure: 'تتبع آمن في الوقت الفعلي'
      },
      features: {
        global: 'التغطية العالمية',
        globalDesc: 'أرسل حزمك إلى جميع أنحاء العالم بفضل شبكتنا اللوجستية الدولية التي تغطي أكثر من 200 دولة.',
        competitive: 'أسعار تنافسية',
        competitiveDesc: 'استمتع بأفضل الأسعار في السوق بفضل نظام المقارنة الفورية بين الناقلين.',
        support: 'دعم 24/7',
        supportDesc: 'فريق خدمة العملاء متاح 24/7 للإجابة على أسئلتك وحل مشاكلك.'
      },
      services: {
        title: 'خدمات الشحن المتميزة',
        subtitle: 'اكتشف حلول الشحن المختلفة المخصصة لجميع احتياجاتك، سواء كانت بحراً أو جواً أو براً.',
        maritime: 'الشحن البحري',
        maritimeDesc: 'حل اقتصادي للشحنات الكبيرة دون قيود زمنية.',
        air: 'الشحن الجوي',
        airDesc: 'تسليم سريع للشحنات العاجلة والوثائق المهمة.',
        door: 'التوصيل من الباب إلى الباب',
        doorDesc: 'خدمة كاملة للاستلام والتسليم إلى المنزل.',
        special: 'الحزم الخاصة',
        specialDesc: 'نقل آمن للأشياء الهشة أو الثمينة أو ذات الحجم غير القياسي.'
      },
      howItWorks: {
        title: 'كيف يعمل',
        subtitle: 'إرسال حزمة مع ColisSelect بسيط وسريع. اتبع هذه الخطوات لإرسال حزمةك بأمان.',
        step1: 'احصل على عرض أسعار',
        step1Desc: 'املأ نموذجنا عبر الإنترنت للحصول على عرض أسعار فوري بناءً على شحنتك.',
        step2: 'جهز حزمةك',
        step2Desc: 'قم بتعبئة حزمةك بعناية وأعد الوثائق اللازمة للشحن.',
        step3: 'الاستلام أو التسليم',
        step3Desc: 'اختر بين الاستلام من المنزل أو التسليم في أحد نقاط الاستلام لدينا.',
        step4: 'تتبع شحنتك',
        step4Desc: 'احصل على رقم تتبع لمراقبة تقدم حزمةك في الوقت الفعلي.',
        start: 'ابدأ الآن'
      },
      testimonials: {
        title: 'ماذا يقول عملاؤنا',
        subtitle: 'اكتشف شهادات عملائنا الراضين الذين يثقون بـ ColisSelect لاحتياجاتهم في الشحن.',
        text1: 'خدمة استثنائية! وصلت حزمةي الهشة في الوقت المحدد وبحالة مثالية رغم الرحلة الدولية. كان فريق ColisSelect نشطاً وأبقاني على اطلاع في كل خطوة.',
        text2: 'كشركة صغيرة ومتوسطة، نحتاج إلى خدمة شحن موثوقة وميسورة التكلفة. تلبي ColisSelect توقعاتنا تماماً مع أسعار تنافسية وخدمة عملاء استثنائية.',
        text3: 'أقدر بشكل خاص شفافية الأسعار وإمكانية تتبع حزمةي في الوقت الفعلي. جعلت ColisSelect الشحن الدولي بسيطاً وميسور التكلفة لشركتي.'
      },
      cta: {
        title: 'جاهز لإرسال حزمةك؟',
        subtitle: 'احصل على عرض أسعار فوري وبدء شحنتك اليوم مع ColisSelect.',
        origin: 'بلد المنشأ',
        destination: 'بلد الوجهة',
        weight: 'الوزن (كجم)',
        weightPlaceholder: 'مثال: 5',
        getQuote: 'احصل على عرض أسعار',
        contact: 'اتصل بنا'
      },
      trust: {
        experience: 'سنوات الخبرة',
        experienceDesc: 'خبرة لوجستية مثبتة',
        packages: 'الحزم المسلمة',
        packagesDesc: 'كل شهر في جميع أنحاء العالم',
        destinations: 'الوجهات',
        destinationsDesc: 'تغطية عالمية',
        satisfaction: 'العملاء الراضون',
        satisfactionDesc: 'خدمة عملاء متميزة'
      },
      partners: {
        title: 'شركاؤنا الموثوقون',
        subtitle: 'نتعاون مع أفضل الناقلين العالميين لتقديم خدمة مثالية لك'
      }
    }
  },
  bn: {
    nav: {
      home: 'হোম',
      services: 'সার্ভিস',
      tracking: 'ট্র্যাকিং',
      quote: 'কোট',
      contact: 'যোগাযোগ',
      getQuote: 'কোট পান'
    },
    services: {
      shipping: 'সামুদ্রিক শিপিং',
      air: 'এয়ার ফ্রেট',
      delivery: 'দরজা থেকে দরজা ডেলিভারি',
      special: 'বিশেষ প্যাকেজ'
    },
    footer: {
      company: 'ColisSelect - পরিবহন এবং লজিস্টিকস',
      services: 'আমাদের সার্ভিস',
      quickLinks: 'দ্রুত লিঙ্ক',
      contact: 'যোগাযোগ',
      newsletter: 'নিউজলেটার',
      copyright: '© 2025 ColisSelect। সমস্ত অধিকার সংরক্ষিত।'
    },
    home: {
      hero: {
        badge: 'বিশ্বস্ত পরিবহন এবং লজিস্টিকস',
        title: 'দ্রুত এবং বিশ্বস্ত প্যাকেজ শিপিং',
        subtitle: 'ব্যক্তি এবং ব্যবসায়ের জন্য অর্থনৈতিক শিপিং সমাধান। ফ্রান্স এবং আন্তর্জাতিকভাবে আপনার প্যাকেজ নিরাপদে পাঠান।',
        cta: 'কোট পান',
        discover: 'আমাদের সার্ভিস আবিষ্কার করুন',
        tracking: 'আপনার প্যাকেজ ট্র্যাক করুন',
        trackingPlaceholder: 'উদাহরণ: CS-12345678',
        trackingButton: 'আমার প্যাকেজ ট্র্যাক করুন',
        secure: 'নিরাপদ রিয়েল-টাইম ট্র্যাকিং'
      },
      features: {
        global: 'বৈশ্বিক কভারেজ',
        globalDesc: 'আমাদের আন্তর্জাতিক লজিস্টিকস নেটওয়ার্কের মাধ্যমে ২০০টিরও বেশি দেশে আপনার প্যাকেজ পাঠান।',
        competitive: 'প্রতিযোগিতামূলক রেট',
        competitiveDesc: 'ক্যারিয়ারদের মধ্যে আমাদের তাত্ক্ষণিক তুলনা সিস্টেমের মাধ্যমে বাজারের সেরা দাম উপভোগ করুন।',
        support: '২৪/৭ সাপোর্ট',
        supportDesc: 'আপনার প্রশ্নের উত্তর দেওয়া এবং আপনার সমস্যা সমাধানের জন্য আমাদের কাস্টমার সার্ভিস টিম ২৪/৭ উপলব্ধ।'
      },
      services: {
        title: 'প্রিমিয়াম শিপিং সার্ভিস',
        subtitle: 'সমুদ্র, বিমান বা স্থলপথে হোক না কেন, আপনার সমস্ত প্রয়োজনের জন্য আমাদের বিভিন্ন শিপিং সমাধান আবিষ্কার করুন।',
        maritime: 'সামুদ্রিক শিপিং',
        maritimeDesc: 'সময়ের কোনো সীমাবদ্ধতা ছাড়াই বড় প্যাকেজের জন্য অর্থনৈতিক সমাধান।',
        air: 'এয়ার ফ্রেট',
        airDesc: 'জরুরী শিপমেন্ট এবং গুরুত্বপূর্ণ ডকুমেন্টের জন্য দ্রুত ডেলিভারি।',
        door: 'দরজা থেকে দরজা ডেলিভারি',
        doorDesc: 'হোম পিকআপ এবং ডেলিভারির সম্পূর্ণ সার্ভিস।',
        special: 'বিশেষ প্যাকেজ',
        specialDesc: 'ভঙ্গুর, মূল্যবান বা অস্বাভাবিক আকারের বস্তুর নিরাপদ পরিবহন।'
      },
      howItWorks: {
        title: 'এটি কীভাবে কাজ করে',
        subtitle: 'ColisSelect দিয়ে একটি প্যাকেজ পাঠানো সহজ এবং দ্রুত। আপনার প্যাকেজ নিরাপদে পাঠানোর জন্য এই ধাপগুলি অনুসরণ করুন।',
        step1: 'কোট পান',
        step1Desc: 'আপনার শিপমেন্টের উপর ভিত্তি করে তাত্ক্ষণিক কোট পেতে আমাদের অনলাইন ফর্ম পূরণ করুন।',
        step2: 'আপনার প্যাকেজ প্রস্তুত করুন',
        step2Desc: 'সাবধানে আপনার প্যাকেজ প্যাক করুন এবং শিপিংয়ের জন্য প্রয়োজনীয় ডকুমেন্ট প্রস্তুত করুন।',
        step3: 'পিকআপ বা ড্রপ-অফ',
        step3Desc: 'হোম পিকআপ বা আমাদের কোনো রিলে পয়েন্টে ড্রপ-অফ বেছে নিন।',
        step4: 'আপনার শিপমেন্ট ট্র্যাক করুন',
        step4Desc: 'রিয়েল-টাইমে আপনার প্যাকেজের অগ্রগতি মনিটর করার জন্য ট্র্যাকিং নম্বর পান।',
        start: 'এখন শুরু করুন'
      },
      testimonials: {
        title: 'আমাদের ক্লায়েন্টরা কী বলছেন',
        subtitle: 'আমাদের সন্তুষ্ট ক্লায়েন্টদের সুপারিশ আবিষ্কার করুন যারা তাদের শিপিং প্রয়োজনের জন্য ColisSelect-এ বিশ্বাস করেন।',
        text1: 'অসাধারণ সার্ভিস! আমার ভঙ্গুর প্যাকেজ সময়মতো এবং আন্তর্জাতিক ভ্রমণ সত্ত্বেও নিখুঁত অবস্থায় পৌঁছেছে। ColisSelect টিম খুব সক্রিয় ছিল এবং প্রতিটি ধাপে আমাকে আপডেট রেখেছিল।',
        text2: 'এসএমই হিসেবে, আমাদের একটি বিশ্বস্ত শিপিং সার্ভিস এবং সাশ্রয়ী প্রয়োজন। ColisSelect প্রতিযোগিতামূলক রেট এবং অসাধারণ কাস্টমার সার্ভিস সহ আমাদের প্রত্যাশা পুরোপুরি পূরণ করে।',
        text3: 'আমি বিশেষভাবে দামের স্বচ্ছতা এবং রিয়েল-টাইমে আমার প্যাকেজ ট্র্যাক করার ক্ষমতা পছন্দ করি। ColisSelect আমার ব্যবসার জন্য আন্তর্জাতিক শিপিংকে সহজ এবং সাশ্রয়ী করে তুলেছে।'
      },
      cta: {
        title: 'আপনার প্যাকেজ পাঠানোর জন্য প্রস্তুত?',
        subtitle: 'তাত্ক্ষণিক কোট পান এবং আজই ColisSelect দিয়ে আপনার শিপিং শুরু করুন।',
        origin: 'উৎপত্তি দেশ',
        destination: 'গন্তব্য দেশ',
        weight: 'ওজন (কেজি)',
        weightPlaceholder: 'উদাহরণ: 5',
        getQuote: 'কোট পান',
        contact: 'যোগাযোগ করুন'
      },
      trust: {
        experience: 'অভিজ্ঞতার বছর',
        experienceDesc: 'প্রমাণিত লজিস্টিকস দক্ষতা',
        packages: 'ডেলিভার করা প্যাকেজ',
        packagesDesc: 'প্রতি মাসে বিশ্বব্যাপী',
        destinations: 'গন্তব্য',
        destinationsDesc: 'বৈশ্বিক কভারেজ',
        satisfaction: 'সন্তুষ্ট ক্লায়েন্ট',
        satisfactionDesc: 'প্রিমিয়াম কাস্টমার সার্ভিস'
      },
      partners: {
        title: 'আমাদের বিশ্বস্ত অংশীদার',
        subtitle: 'আপনাকে সর্বোত্তম সার্ভিস প্রদানের জন্য আমরা বিশ্বের সেরা ক্যারিয়ারদের সাথে সহযোগিতা করি'
      }
    }
  },
  pt: {
    nav: {
      home: 'Início',
      services: 'Serviços',
      tracking: 'Rastreamento',
      quote: 'Cotação',
      contact: 'Contato',
      getQuote: 'Obter Cotação'
    },
    services: {
      shipping: 'Envio Marítimo',
      air: 'Carga Aérea',
      delivery: 'Entrega Porta a Porta',
      special: 'Pacotes Especiais'
    },
    footer: {
      company: 'ColisSelect - Transporte e Logística',
      services: 'Nossos Serviços',
      quickLinks: 'Links Rápidos',
      contact: 'Contato',
      newsletter: 'Newsletter',
      copyright: '© 2025 ColisSelect. Todos os direitos reservados.'
    },
    home: {
      hero: {
        badge: 'Transporte e Logística Confiáveis',
        title: 'Envio de pacotes rápido e confiável',
        subtitle: 'Soluções econômicas de envio para indivíduos e empresas. Envie seus pacotes com segurança na França e internacionalmente.',
        cta: 'Obter Cotação',
        discover: 'Descubra nossos serviços',
        tracking: 'Rastreie seu pacote',
        trackingPlaceholder: 'Ex: CS-12345678',
        trackingButton: 'Rastrear meu pacote',
        secure: 'Rastreamento seguro em tempo real'
      },
      features: {
        global: 'Cobertura Global',
        globalDesc: 'Envie seus pacotes para todo o mundo graças à nossa rede logística internacional cobrindo mais de 200 países.',
        competitive: 'Preços Competitivos',
        competitiveDesc: 'Aproveite os melhores preços do mercado graças ao nosso sistema de comparação instantânea entre transportadoras.',
        support: 'Suporte 24/7',
        supportDesc: 'Nossa equipe de atendimento ao cliente está disponível 24/7 para responder suas perguntas e resolver seus problemas.'
      },
      services: {
        title: 'Serviços de Envio Premium',
        subtitle: 'Descubra nossas diferentes soluções de envio adaptadas a todas as suas necessidades, seja por mar, ar ou terra.',
        maritime: 'Envio Marítimo',
        maritimeDesc: 'Solução econômica para envios volumosos sem restrições de tempo.',
        air: 'Carga Aérea',
        airDesc: 'Entrega rápida para envios urgentes e documentos importantes.',
        door: 'Entrega Porta a Porta',
        doorDesc: 'Serviço completo de coleta e entrega em domicílio.',
        special: 'Pacotes Especiais',
        specialDesc: 'Transporte seguro de objetos frágeis, valiosos ou de tamanho não padrão.'
      },
      howItWorks: {
        title: 'Como funciona',
        subtitle: 'Enviar um pacote com ColisSelect é simples e rápido. Siga estes passos para enviar seu pacote com segurança.',
        step1: 'Obter cotação',
        step1Desc: 'Preencha nosso formulário online para obter uma cotação instantânea baseada no seu envio.',
        step2: 'Preparar seu pacote',
        step2Desc: 'Embale cuidadosamente seu pacote e prepare os documentos necessários para o envio.',
        step3: 'Coleta ou entrega',
        step3Desc: 'Escolha entre coleta em domicílio ou entrega em um de nossos pontos de coleta.',
        step4: 'Rastreie seu envio',
        step4Desc: 'Receba um número de rastreamento para monitorar o progresso do seu pacote em tempo real.',
        start: 'Começar agora'
      },
      testimonials: {
        title: 'O que dizem nossos clientes',
        subtitle: 'Descubra os depoimentos dos nossos clientes satisfeitos que confiam na ColisSelect para suas necessidades de envio.',
        text1: 'Serviço excepcional! Meu pacote frágil chegou no prazo e em perfeito estado apesar de uma viagem internacional. A equipe da ColisSelect foi proativa e me manteve informado em cada etapa.',
        text2: 'Como PME, precisamos de um serviço de envio confiável e acessível. A ColisSelect atende perfeitamente às nossas expectativas com tarifas competitivas e atendimento ao cliente excepcional.',
        text3: 'Aprecio especialmente a transparência de preços e a possibilidade de rastrear meu pacote em tempo real. A ColisSelect tornou o envio internacional simples e acessível para minha empresa.'
      },
      cta: {
        title: 'Pronto para enviar seu pacote?',
        subtitle: 'Obtenha uma cotação instantânea e comece seu envio hoje com a ColisSelect.',
        origin: 'País de origem',
        destination: 'País de destino',
        weight: 'Peso (kg)',
        weightPlaceholder: 'Ex: 5',
        getQuote: 'Obter cotação',
        contact: 'Entre em contato'
      },
      trust: {
        experience: 'Anos de experiência',
        experienceDesc: 'Especialização logística comprovada',
        packages: 'Pacotes entregues',
        packagesDesc: 'Cada mês em todo o mundo',
        destinations: 'Destinos',
        destinationsDesc: 'Cobertura global',
        satisfaction: 'Clientes satisfeitos',
        satisfactionDesc: 'Serviço ao cliente premium'
      },
      partners: {
        title: 'Nossos Parceiros de Confiança',
        subtitle: 'Colaboramos com os melhores transportadores globais para oferecer o melhor serviço possível'
      }
    }
  }
};

// Context
interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  languages: Language[];
  t: (key: string) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('language') || 'fr';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = ['ar'].includes(lang) ? 'rtl' : 'ltr';
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = ['ar'].includes(language) ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = TRANSLATIONS[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = TRANSLATIONS.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const isRTL = ['ar'].includes(language);

  return React.createElement(I18nContext.Provider, {
    value: {
      language,
      setLanguage,
      languages: LANGUAGES,
      t,
      isRTL
    }
  }, children);
};

// Hook to use i18n
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Component for automatic translation of any text
export const TranslatedText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const { language } = useI18n();
  const [translatedText, setTranslatedText] = React.useState(text);

  React.useEffect(() => {
    const translateContent = async () => {
      if (language !== 'fr') {
        try {
          const translated = await translateText(text, language, 'fr');
          setTranslatedText(translated);
        } catch (error) {
          console.warn('Translation failed:', error);
          setTranslatedText(text); // Fallback to original text
        }
      } else {
        setTranslatedText(text);
      }
    };

    translateContent();
  }, [text, language]);

  return React.createElement('span', { className }, translatedText);
};

// LibreTranslate API function (free and open source)
export const translateText = async (text: string, targetLang: string, sourceLang: string = 'fr'): Promise<string> => {
  try {
    // Using LibreTranslate API (free and open source)
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText;
  } catch (error) {
    console.error('Translation failed:', error);
    return text; // Return original text if translation fails
  }
};

// Enhanced translation function with LibreTranslate
export const loadTranslations = async (lang: string): Promise<Translations> => {
  try {
    // First try local translations
    const localTranslations = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // If the language is not French (source), translate missing keys using LibreTranslate
    if (lang !== 'fr') {
      const enhancedTranslations = { ...localTranslations };

      // Translate missing or incomplete translations
      for (const [section, content] of Object.entries(TRANSLATIONS.fr)) {
        if (typeof content === 'object' && content !== null) {
          for (const [key, frenchText] of Object.entries(content)) {
            if (typeof frenchText === 'string') {
              // Check if we have this translation locally
              const existingTranslation = (enhancedTranslations as any)[section]?.[key];
              if (!existingTranslation || existingTranslation === key) {
                // Translate using LibreTranslate API
                try {
                  const translatedText = await translateText(frenchText, lang, 'fr');
                  if (!enhancedTranslations[section]) {
                    enhancedTranslations[section] = {};
                  }
                  (enhancedTranslations[section] as any)[key] = translatedText;
                } catch (error) {
                  console.warn(`Failed to translate ${section}.${key}:`, error);
                }
              }
            }
          }
        }
      }

      return enhancedTranslations;
    }

    return localTranslations;
  } catch (error) {
    console.error('Failed to load translations:', error);
    return TRANSLATIONS.en;
  }
};