// Last Train i18n — zh / en. Voice + decorative titles English per series rule.
type Locale = 'zh' | 'en';
const STORAGE_KEY = 'lt_locale';

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const override = window.localStorage.getItem(STORAGE_KEY);
    if (override === 'zh' || override === 'en') return override;
  } catch {}
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en') || 'en';
  return nav.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

const LOCALE: Locale = detectLocale();

const STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    'hint.firstTap': 'look around the car —',
    'btn.onceMore': 'ride again',
    'hotspot.map': 'the strip map',
    'hotspot.window': 'the window',
    'hotspot.her': 'the woman',
    'hotspot.doors': 'the doors',
    'hotspot.seat': 'the seat beside you',
    'hotspot.showtime': 'the train slows',
    'sub.map': 'Every station on the map is this one.',
    'sub.window': 'In the black glass, her reflection is already watching me.',
    'sub.her': "Soaked through. She smiles like she's been waiting for me.",
    'sub.doors': 'We passed my stop. And the next. The doors never open.',
    'sub.seat': 'When did she come and sit beside me?',
    'sub.climax': 'This is your stop. It always was.',
  },
  zh: {
    'hint.firstTap': '看看这节车厢 —',
    'btn.onceMore': '再坐一程',
    'hotspot.map': '线路图',
    'hotspot.window': '车窗',
    'hotspot.her': '对座的女人',
    'hotspot.doors': '车门',
    'hotspot.seat': '身旁的座位',
    'hotspot.showtime': '末班车进站',
    'sub.map': '线路图上, 每一站都是这一站。',
    'sub.window': '漆黑的车窗里, 她的倒影早就在看着我。',
    'sub.her': '浑身湿透。她笑着, 像是等我很久了。',
    'sub.doors': '过了我的站。又一站。门, 从来没开过。',
    'sub.seat': '她什么时候坐到我身边来的?',
    'sub.climax': '这是你的站。一直都是。',
  },
};

export function t(key: string): string {
  return STRINGS[LOCALE]?.[key] ?? STRINGS.en[key] ?? key;
}
export function getLocale(): Locale { return LOCALE; }
