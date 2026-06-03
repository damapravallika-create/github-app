import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Lang = 'en' | 'hi' | 'te' | 'ta';

export const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    home:'Home', scan:'Scan', recipes:'Recipes', saved:'Saved',
    settings:'Settings', insights:'Insights', planner:'Planner',
    addItem:'Add Item', expiring:'Expiring', expired:'Expired',
    fresh:'Fresh', total:'Total', useThese:'Use these soon',
    getRecipes:'Get Recipes', searchFood:'Search food...',
    welcome:'Welcome back', wasteLess:'Waste less · Eat fresh · Save money',
  },
  hi: {
    home:'होम', scan:'स्कैन', recipes:'रेसिपी', saved:'सहेजा',
    settings:'सेटिंग्स', insights:'अंतर्दृष्टि', planner:'योजनाकार',
    addItem:'आइटम जोड़ें', expiring:'समाप्त हो रहा है', expired:'समाप्त',
    fresh:'ताज़ा', total:'कुल', useThese:'इन्हें जल्दी उपयोग करें',
    getRecipes:'रेसिपी पाएं', searchFood:'खाना खोजें...',
    welcome:'वापस स्वागत है', wasteLess:'कम बर्बाद · ताज़ा खाएं · पैसे बचाएं',
  },
  te: {
    home:'హోమ్', scan:'స్కాన్', recipes:'వంటకాలు', saved:'సేవ్ చేసారు',
    settings:'సెట్టింగ్స్', insights:'అంతర్దృష్టి', planner:'ప్లానర్',
    addItem:'వస్తువు జోడించు', expiring:'గడువు తీరుతుంది', expired:'గడువు తీరింది',
    fresh:'తాజా', total:'మొత్తం', useThese:'వీటిని త్వరగా వాడండి',
    getRecipes:'వంటకాలు పొందండి', searchFood:'ఆహారం వెతకండి...',
    welcome:'తిరిగి స్వాగతం', wasteLess:'తక్కువ వృధా · తాజాగా తినండి',
  },
  ta: {
    home:'முகப்பு', scan:'ஸ்கேன்', recipes:'சமையல்', saved:'சேமித்தது',
    settings:'அமைப்புகள்', insights:'நுண்ணறிவு', planner:'திட்டமிடுபவர்',
    addItem:'பொருள் சேர்', expiring:'காலாவதியாகிறது', expired:'காலாவதி',
    fresh:'புதியது', total:'மொத்தம்', useThese:'இவற்றை விரைவில் பயன்படுத்துங்கள்',
    getRecipes:'சமையல் பெறுங்கள்', searchFood:'உணவு தேடுங்கள்...',
    welcome:'மீண்டும் வரவேற்கிறோம்', wasteLess:'குறைவாக வீணாக்கு · புதியதாக சாப்பிடு',
  },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private platformId = inject(PLATFORM_ID);
  currentLang = signal<Lang>('en');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('sfet_lang') as Lang;
      if (saved) this.currentLang.set(saved);
    }
  }

  setLang(lang: Lang) {
    this.currentLang.set(lang);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('sfet_lang', lang);
    }
  }

  t(key: string): string {
    return TRANSLATIONS[this.currentLang()][key] || TRANSLATIONS['en'][key] || key;
  }
}
