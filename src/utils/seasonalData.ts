import { SeasonId, SeasonInfo } from '../types/game';

// Determine the real-world season based on the calendar month
// Month is 0-indexed: 0=Jan, 1=Feb, 2=Mar, 3=Apr, 4=May, 5=Jun, 6=Jul, 7=Aug, 8=Sep, 9=Oct, 10=Nov, 11=Dec
export function getCalendarSeason(date: Date = new Date()): SeasonId {
  const month = date.getMonth();
  if (month === 11 || month === 0 || month === 1) {
    return 'winter';
  } else if (month >= 2 && month <= 4) {
    return 'spring';
  } else if (month >= 5 && month <= 7) {
    return 'summer';
  } else {
    // 8 (Sep), 9 (Oct), 10 (Nov)
    return 'autumn';
  }
}

export function getCalendarMonthName(date: Date = new Date()): string {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];
  return months[date.getMonth()];
}

export const SEASONS_CONFIG: Record<SeasonId, SeasonInfo> = {
  autumn: {
    id: 'autumn',
    name: 'Золотая Осень',
    monthsName: 'Сентябрь — Ноябрь',
    icon: '🍂',
    tagline: 'Сезон Тыкв и Щедрого Урожая',
    bonusText: '🎃 Тыквы и яблоки созревают на 30% быстрее!',
    bgGradient: 'from-amber-950/40 via-orange-950/20 to-stone-900/40',
    decorations: [
      {
        id: 'jack_o_lantern',
        name: 'Резные Тыквы с Огоньком',
        emoji: '🎃',
        description: 'Праздничные тыквы со свечками, мерцающие в вечернем тумане.',
        actionText: 'Зажечь огонёк и получить семена тыквы',
      },
      {
        id: 'scarecrow',
        name: 'Пугало «Страшила»',
        emoji: '🌾',
        description: 'Доброе пугало в соломенной шляпе, охраняющее урожай от хитрых ворон.',
        actionText: 'Поправить шляпу и получить зёрна пшеницы',
      },
      {
        id: 'hay_bale',
        name: 'Снопы Сена и Грибы',
        emoji: '🍄',
        description: 'Золотистые стога сена с корзинкой боровиков и спелых яблок.',
        actionText: 'Заглянуть в корзинку за сюрпризом',
      },
    ],
  },
  winter: {
    id: 'winter',
    name: 'Волшебная Зима',
    monthsName: 'Декабрь — Февраль',
    icon: '❄️',
    tagline: 'Зимняя Сказка, Снеговики и Огоньки',
    bonusText: '❄️ Зимнее тепло: пекарня и мельница работают на 25% быстрее!',
    bgGradient: 'from-sky-950/40 via-indigo-950/20 to-slate-900/40',
    decorations: [
      {
        id: 'snowman',
        name: 'Весёлый Снеговик',
        emoji: '⛄',
        description: 'Круглый снеговик в вязаном красном шарфе с оранжевым носом-морковкой.',
        actionText: 'Слепить снежок и получить сладкую морковку',
      },
      {
        id: 'holiday_tree',
        name: 'Нарядная Ёлочка',
        emoji: '🎄',
        description: 'Пышная ель с разноцветными шарами, золотой звездой и гирляндами.',
        actionText: 'Зажечь гирлянду и получить кристалл 💎',
      },
      {
        id: 'ice_lantern',
        name: 'Ледяной Фонарь и Подарки',
        emoji: '🎁',
        description: 'Сверкающие ледяные сосульки и праздничные коробки с бантиками.',
        actionText: 'Распаковать зимний подарок с монетами',
      },
    ],
  },
  spring: {
    id: 'spring',
    name: 'Цветущая Весна',
    monthsName: 'Март — Май',
    icon: '🌸',
    tagline: 'Пробуждение Природы и Первые Цветы',
    bonusText: '🌸 Весенняя свежесть: морковь и клубника растут на 30% быстрее!',
    bgGradient: 'from-emerald-950/40 via-pink-950/20 to-stone-900/40',
    decorations: [
      {
        id: 'cherry_blossom',
        name: 'Цветущая Сакура',
        emoji: '🌸',
        description: 'Нежное деревце, усыпанное благоухающими розовыми лепестками.',
        actionText: 'Полюбоваться цветами и получить +30 XP',
      },
      {
        id: 'birdhouse',
        name: 'Певчий Скворечник',
        emoji: '🐦',
        description: 'Уютный деревянный домик с поющими весенними птицами.',
        actionText: 'Послушать трель птиц и получить семена',
      },
      {
        id: 'tulip_basket',
        name: 'Корзина Тюльпанов',
        emoji: '🌷',
        description: 'Праздничная корзинка с разноцветными первоцветами и пасхальными крашенками.',
        actionText: 'Собрать букет и получить весенние монеты',
      },
    ],
  },
  summer: {
    id: 'summer',
    name: 'Солнечное Лето',
    monthsName: 'Июнь — Август',
    icon: '☀️',
    tagline: 'Жаркая Пора, Арбузы и Подсолнухи',
    bonusText: '🍉 Летнее изобилие: сбор кукурузы и пшеницы приносит +35% монет!',
    bgGradient: 'from-amber-950/40 via-yellow-950/20 to-emerald-950/40',
    decorations: [
      {
        id: 'sunflower_stand',
        name: 'Гигантские Подсолнухи',
        emoji: '🌻',
        description: 'Золотые шапки подсолнухов, тянущиеся к жаркому полуденному солнцу.',
        actionText: 'Собрать золотую пыльцу и получить семена',
      },
      {
        id: 'watermelon_cart',
        name: 'Ярмарочная Арбузная Телега',
        emoji: '🍉',
        description: 'Деревянная тележка, наполненная сахарными полосатыми арбузами со льдом.',
        actionText: 'Отрезать сочный ломтик и получить монеты',
      },
      {
        id: 'bunting_flags',
        name: 'Праздничные Флажки и Беседка',
        emoji: '🎪',
        description: 'Яркие ярмарочные флажки на заборчике и плетёный шезлонг под навесом.',
        actionText: 'Отдохнуть в тени и получить энергию фермера',
      },
    ],
  },
};
