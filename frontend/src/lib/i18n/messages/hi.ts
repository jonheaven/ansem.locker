import type { MessageTree } from './types';

/** Hindi UI strings (India). Merged over English at runtime. */
export const hi: MessageTree = {
  common: {
    loading: 'लोड हो रहा है…',
    dismiss: 'बंद करें',
    max: 'अधिकतम',
    unlock: 'अनलॉक',
    lock: 'लॉक',
    share: 'शेयर',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    currency: 'मुद्रा',
  },
  locale: {
    en: 'English',
    hi: 'हिन्दी',
    pt: 'Português',
    ko: '한국어',
    ja: '日本語',
    es: 'Español',
    ru: 'Русский',
    tr: 'Türkçe',
    id: 'Bahasa Indonesia',
    zh: '中文',
  },
  tabs: {
    lock: 'लॉक',
    ranks: 'खुर',
    why: 'क्यों',
    how: 'कैसे',
    myLocks: 'मेरे लॉक',
  },
  home: {
    headline: 'अपने हीरे के खुर साबित करें',
    tagline:
      'चेन पर ANSEM लॉक करें, 𝕏 पर फ्लेक्स करें, और लॉकर लिस्ट में शामिल हों। सबसे बड़ा लॉक + सबसे लंबा विश्वास = हीरे के खुर रैंक में शीर्ष।',
    hero: {
      lock: {
        headline: 'अपने हीरे के खुर साबित करें',
        tagline: 'राशि और अनलॉक तारीख चुनें — आप वॉलेट में साइन करते हैं; हम आपकी कुंजी नहीं छूते।',
      },
      lockCommitted: {
        tagline: 'अभी 𝕏 पर फ्लेक्स करें — दिखाएँ कौन हीरे के खुर वाला है।',
      },
      lockDisconnected: {
        tagline: 'ANSEM चेन पर लॉक करने के लिए वॉलेट कनेक्ट करें। हर कदम आपके साइन से।',
      },
      leaderboard: {
        headline: 'हीरे के खुर रैंक',
        tagline: 'खुर स्कोर = राशि × लॉक दिन। सबसे मजबूत ऑन-चेन विश्वास किसका?',
      },
      why: {
        headline: 'ANSEM क्यों लॉक करें?',
        tagline: 'असली सप्लाई शॉक, सार्वजनिक प्रमाण, और वॉल्ट में बैलों के लिए रैंक बोर्ड।',
      },
      how: {
        headline: 'यह कैसे काम करता है',
        tagline: 'कनेक्ट → लॉक सेट → एक बार अप्रूव। Solana पर Jupiter Lock — ऑडिटेड, ओपन सोर्स।',
      },
      locks: {
        headline: 'मेरे लॉक',
        tagline: 'आपके सक्रिय एस्क्रो — अनलॉक समय पर यहाँ क्लेम करें।',
      },
      locksClaim: {
        tagline: 'अनलॉक समय बीत गया — एक वॉलेट साइन से ANSEM वापस लें।',
      },
    },
  },
  lock: {
    title: 'ANSEM लॉक करें',
    lockButton: 'ANSEM लॉक करें',
    yourBalance: 'आपका बैलेंस',
    lockAmount: 'लॉक राशि',
    lockUntil: 'लॉक जब तक',
    connectFirst: 'पहले वॉलेट कनेक्ट करें',
    lockedToast: 'लॉक हो गया — 𝕏 पर फ्लेक्स करें',
  },
  locks: {
    title: 'मेरे लॉक',
    readyToClaim: 'क्लेम के लिए तैयार',
    claimBack: 'ANSEM वापस लें',
    shareLock: '𝕏 पर शेयर',
    lockProgressAria: 'लॉक प्रगति',
  },
  leaderboard: {
    title: 'हीरे के खुर रैंक',
    description:
      'किसने सबसे ज्यादा ANSEM सबसे लंबे समय के लिए लॉक किया? खुर स्कोर = राशि × बचे दिन — ऑन-चेन विश्वास बोर्ड।',
    sortScore: 'खुर स्कोर',
    sortAmount: 'लॉक',
    sortDuration: 'अवधि',
    verifiedFlex: 'सत्यापित फ्लेक्स',
    verifiedOnly: 'केवल सत्यापित फ्लेक्स',
    lockerListTitle: 'लॉकर लिस्ट',
    lockerListJoin: 'लॉकर लिस्ट में शामिल हों',
    shareRanks: 'रैंक शेयर करें',
    loading: 'लॉक लोड हो रहे हैं…',
    empty: 'अभी कोई हीरे के खुर नहीं।',
  },
  flex: {
    flexOnX: '𝕏 पर फ्लेक्स',
    verifyTitle: 'अपना फ्लेक्स साबित करें → लॉकर लिस्ट',
    verifySubmit: 'सत्यापित करें और लॉकर लिस्ट में शामिल हों',
    verifySuccess: 'आप लॉकर लिस्ट पर हैं',
    verifyRequiresWallet: 'पहले वॉलेट कनेक्ट करें',
  },
  duration: {
    diamondHooves: 'हीरे के खुर',
    warmingUp: 'गर्म हो रहा है…',
    gettingBullish: 'बुलिश हो रहे हैं',
    bullMode: 'बुल मोड',
  },
  tools: {
    nav: 'टूल्स',
    title: 'टूल्स',
  },
  xMenu: {
    joinLockerList: 'लॉकर लिस्ट में शामिल हों',
    onLockerList: 'लॉकर लिस्ट पर',
    connectFirst: 'पहले वॉलेट कनेक्ट करें',
  },
};
