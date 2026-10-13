import { HorseBreedConfig, HorseBreedId, HorseRideRoute, PlayerHorse, TackItem } from '../types/game';

// ==================== HORSE BREEDS CONFIG ====================

export const HORSE_BREEDS: Record<HorseBreedId, HorseBreedConfig> = {
  orlov_trotter: {
    id: 'orlov_trotter',
    name: 'Орловский рысак',
    coatColor: 'Серая в яблоках',
    emoji: '🐴',
    avatarIcon: '🐎',
    description: 'Гордость отечественного коннозаводства. Статная, грациозная и выносливая лошадь с широким летящим рысистым ходом.',
    traitName: 'Лёгкий аллюр',
    traitDescription: '+25% к монетам со всех прогулок и +10% к базовой скорости.',
    costCoins: 0,
    minLevel: 1,
    baseSpeed: 7,
    baseStamina: 7,
    baseLuck: 6,
  },
  arabian: {
    id: 'arabian',
    name: 'Арабская чистокровная',
    coatColor: 'Гнедая благородная',
    emoji: '🐎',
    avatarIcon: '🔥',
    description: 'Легендарная восточная порода с гордым профилем, огненным темпераментом и феноменальной выносливостью.',
    traitName: 'Неукротимый дух',
    traitDescription: '+35% опыта (XP) за верховые прогулки, расход энергии снижен на 20%.',
    costCoins: 850,
    minLevel: 6,
    baseSpeed: 8,
    baseStamina: 9,
    baseLuck: 7,
  },
  friesian: {
    id: 'friesian',
    name: 'Фризская вороная',
    coatColor: 'Угольно-чёрная с фризами',
    emoji: '🖤',
    avatarIcon: '👑',
    description: '«Чёрная жемчужина Фрисландии». Величественный вороной конь с волнистой густой гривой и пышными щётками на ногах.',
    traitName: 'Царственная поступь',
    traitDescription: 'Повышенный шанс (+30%) найти редкие самоцветы 💎 и древние сундуки.',
    costCoins: 1900,
    costGems: 4,
    minLevel: 10,
    baseSpeed: 8,
    baseStamina: 8,
    baseLuck: 9,
  },
  akhal_teke: {
    id: 'akhal_teke',
    name: 'Ахалтекинец',
    coatColor: 'Изабелловая / Золотисто-буланая',
    emoji: '✨',
    avatarIcon: '🌟',
    description: '«Золотой небесный конь» древнейших легенд. Шерсть отливает металлическим шелковистым блеском чистейшего золота.',
    traitName: 'Стрела пустыни',
    traitDescription: 'Самый стремительный скакун (-25% к времени любой прогулки).',
    costCoins: 3800,
    costGems: 8,
    minLevel: 14,
    baseSpeed: 10,
    baseStamina: 8,
    baseLuck: 9,
  },
  shire: {
    id: 'shire',
    name: 'Шайрский тяжеловоз',
    coatColor: 'Вороной гигант с чулками',
    emoji: '🪵',
    avatarIcon: '🛡️',
    description: 'Могучий британский исполин невиданной мощи и кроткого доброго нрава. Настоящий великан среди лошадей.',
    traitName: 'Богатырская тяга',
    traitDescription: 'Удваивает количество найденных стройматериалов, древесины и плодов.',
    costCoins: 6200,
    costGems: 12,
    minLevel: 18,
    baseSpeed: 6,
    baseStamina: 10,
    baseLuck: 8,
  },
  appaloosa: {
    id: 'appaloosa',
    name: 'Аппалуза',
    coatColor: 'Чубарая леопардовая',
    emoji: '🐆',
    avatarIcon: '🌿',
    description: 'Удивительная пятнистая лошадь индейских прерий. Невероятно зоркая, сообразительная и смелая на незнакомых тропах.',
    traitName: 'Следопыт прерий',
    traitDescription: 'Находит экзотические семена, дикие травы и редкие фермерские находки.',
    costCoins: 9500,
    costGems: 18,
    minLevel: 24,
    baseSpeed: 9,
    baseStamina: 9,
    baseLuck: 10,
  },
  pegasus: {
    id: 'pegasus',
    name: 'Звёздный Пегас',
    coatColor: 'Перламутровая с серебряными крыльями',
    emoji: '🦄',
    avatarIcon: '🌌',
    description: 'Мифический крылатый скакун небесных созвездий. Доступен великим мастерам фермерского мастерства.',
    traitName: 'Небесный полёт',
    traitDescription: 'Открывает Звёздную тропу! +50% ко всем наградам, самоцветам и опыту.',
    costCoins: 18000,
    costGems: 35,
    minLevel: 30,
    baseSpeed: 10,
    baseStamina: 10,
    baseLuck: 10,
  },
};

// ==================== TACK & HORSE GEAR CATALOG ====================
// Blankets/Pads (Вальтрапы/Коврики/Попоны), Bridles (Узды/Оголовья), Saddles (Седла), Horseshoes (Подковы)

export const TACK_CATALOG: TackItem[] = [
  // --- Вальтрапы и коврики (Blankets / Pads) ---
  {
    id: 'pad_linen',
    name: 'Льняной полевой вальтрап',
    category: 'blanket',
    emoji: '🌿',
    description: 'Натуральный мягкий льняной коврик под седло. Дышащий и легкий для первых прогулок.',
    costCoins: 120,
    minLevel: 1,
    bonusSpeedPercent: 5,
    bonusRewardPercent: 5,
    bonusLuckPercent: 0,
    bonusEnergySavePercent: 5,
  },
  {
    id: 'pad_velvet',
    name: 'Изумрудный бархатный коврик',
    category: 'blanket',
    emoji: '🍃',
    description: 'Плотный изумрудный бархат с золотой тесьмой. Дарит комфорт и привлекает взгляды.',
    costCoins: 420,
    minLevel: 5,
    bonusSpeedPercent: 8,
    bonusRewardPercent: 12,
    bonusLuckPercent: 5,
    bonusEnergySavePercent: 10,
  },
  {
    id: 'pad_autumn_wool',
    name: 'Осенний тёплый плед-попона',
    category: 'blanket',
    emoji: '🍂',
    description: 'Тёплая шерстяная попона из овечьей шерсти с клетчатым узором для осенних прогулок.',
    costCoins: 850,
    minLevel: 9,
    bonusSpeedPercent: 10,
    bonusRewardPercent: 18,
    bonusLuckPercent: 8,
    bonusEnergySavePercent: 15,
  },
  {
    id: 'pad_winter_fur',
    name: 'Морозная попона с меховой опушкой',
    category: 'blanket',
    emoji: '❄️',
    description: 'Непромокаемая утепленная попона с мягким мехом для комфортной езды в любую непогоду.',
    costCoins: 1500,
    costGems: 3,
    minLevel: 14,
    bonusSpeedPercent: 14,
    bonusRewardPercent: 22,
    bonusLuckPercent: 12,
    bonusEnergySavePercent: 20,
  },
  {
    id: 'pad_royal_silk',
    name: 'Королевский шёлковый вальтрап',
    category: 'blanket',
    emoji: '👑',
    description: 'Парадный пурпурный шелк ручной вышивки с золотым гербом ярмарочных чемпионов.',
    costCoins: 3200,
    costGems: 8,
    minLevel: 20,
    bonusSpeedPercent: 20,
    bonusRewardPercent: 35,
    bonusLuckPercent: 20,
    bonusEnergySavePercent: 25,
  },
  {
    id: 'pad_celestial',
    name: 'Звёздная попона Авроры',
    category: 'blanket',
    emoji: '✨',
    description: 'Сотканный из звёздного света мерцающий коврик. Дарует скакуну невиданную легкость.',
    costCoins: 7500,
    costGems: 20,
    minLevel: 28,
    bonusSpeedPercent: 30,
    bonusRewardPercent: 50,
    bonusLuckPercent: 35,
    bonusEnergySavePercent: 35,
  },

  // --- Уздечки и оголовья (Bridles / Узды) ---
  {
    id: 'bridle_leather',
    name: 'Сыромятная кожаная узда',
    category: 'bridle',
    emoji: '🪢',
    description: 'Простая и надёжная кожаная уздечка с мягким трензелем для верховых тренировок.',
    costCoins: 100,
    minLevel: 1,
    bonusSpeedPercent: 5,
    bonusRewardPercent: 5,
    bonusLuckPercent: 0,
    bonusEnergySavePercent: 5,
  },
  {
    id: 'bridle_silver',
    name: 'Уздечка с серебряными пряжками',
    category: 'bridle',
    emoji: '⛓️',
    description: 'Тонковыделанная юфть с филигранными серебряными накладками и удобным поводом.',
    costCoins: 480,
    minLevel: 7,
    bonusSpeedPercent: 10,
    bonusRewardPercent: 10,
    bonusLuckPercent: 10,
    bonusEnergySavePercent: 10,
  },
  {
    id: 'bridle_sapphire',
    name: 'Оголовье с сапфировым налобником',
    category: 'bridle',
    emoji: '💎',
    description: 'Изящное оголовье с сияющим камнем во лбу. Лошадь слушается малейшего прикосновения.',
    costCoins: 1300,
    costGems: 4,
    minLevel: 13,
    bonusSpeedPercent: 16,
    bonusRewardPercent: 20,
    bonusLuckPercent: 20,
    bonusEnergySavePercent: 15,
  },
  {
    id: 'bridle_golden_royal',
    name: 'Царская парадная узда мастеров',
    category: 'bridle',
    emoji: '⚜️',
    description: 'Шедевр конного снаряжения из тисненой кожи с позолоченными элементами и шёлковым поводом.',
    costCoins: 3600,
    costGems: 10,
    minLevel: 22,
    bonusSpeedPercent: 25,
    bonusRewardPercent: 35,
    bonusLuckPercent: 28,
    bonusEnergySavePercent: 25,
  },

  // --- Седла (Saddles) ---
  {
    id: 'saddle_village',
    name: 'Деревенское прогулочное седло',
    category: 'saddle',
    emoji: '🪵',
    description: 'Глубокое мягкое седло для неспешных прогулок по окрестным лугам и перелескам.',
    costCoins: 150,
    minLevel: 1,
    bonusSpeedPercent: 6,
    bonusRewardPercent: 8,
    bonusLuckPercent: 0,
    bonusEnergySavePercent: 5,
  },
  {
    id: 'saddle_cavalry',
    name: 'Кавалерийское спортивное седло',
    category: 'saddle',
    emoji: '🏇',
    description: 'Облегчённая спортивная конструкция, идеально сбалансированная для быстрого аллюра.',
    costCoins: 690,
    minLevel: 8,
    bonusSpeedPercent: 15,
    bonusRewardPercent: 15,
    bonusLuckPercent: 8,
    bonusEnergySavePercent: 15,
  },
  {
    id: 'saddle_royal_crest',
    name: 'Парадное седло с золотым тиснением',
    category: 'saddle',
    emoji: '🛡️',
    description: 'Седло из первоклассной замши с эргономичным упором и позолоченными стременами.',
    costCoins: 2100,
    costGems: 6,
    minLevel: 16,
    bonusSpeedPercent: 24,
    bonusRewardPercent: 30,
    bonusLuckPercent: 18,
    bonusEnergySavePercent: 22,
  },

  // --- Подковы (Horseshoes) ---
  {
    id: 'horseshoe_iron',
    name: 'Кованые железные подковы',
    category: 'horseshoe',
    emoji: '🧲',
    description: 'Крепкая кузнечная работа. Защищает копыта и добавляет уверенности на каменистых тропах.',
    costCoins: 90,
    minLevel: 1,
    bonusSpeedPercent: 8,
    bonusRewardPercent: 5,
    bonusLuckPercent: 0,
    bonusEnergySavePercent: 5,
  },
  {
    id: 'horseshoe_silver_luck',
    name: 'Серебряные подковы удачи',
    category: 'horseshoe',
    emoji: '🥈',
    description: 'Особый серебряный сплав местных мастеров. Приносит удачу и открывает тайники на маршрутах.',
    costCoins: 580,
    costGems: 2,
    minLevel: 10,
    bonusSpeedPercent: 14,
    bonusRewardPercent: 15,
    bonusLuckPercent: 25,
    bonusEnergySavePercent: 10,
  },
  {
    id: 'horseshoe_golden_wealth',
    name: 'Золотые подковы изобилия',
    category: 'horseshoe',
    emoji: '🥇',
    description: 'Драгоценные подковы с защитным покрытием. Звенят чистым золотом и удваивают монетные находки.',
    costCoins: 1800,
    costGems: 7,
    minLevel: 18,
    bonusSpeedPercent: 22,
    bonusRewardPercent: 38,
    bonusLuckPercent: 30,
    bonusEnergySavePercent: 20,
  },
];

// ==================== TRAIL RIDES ROUTES (ВЕРХОВЫЕ ПРОГУЛКИ) ====================

export const RIDE_ROUTES: HorseRideRoute[] = [
  {
    id: 'route_grove',
    name: 'Берёзовая роща & Старый Дуб',
    destination: 'Окрестности поместья',
    emoji: '🌲',
    badge: 'Живописная тропа',
    description: 'Неспешная утренняя поездка среди шелестящих белоствольных берёз и вековых дубов.',
    durationSeconds: 30,
    energyCost: 15,
    minBondLevel: 1,
    minPlayerLevel: 1,
    rewardMinCoins: 160,
    rewardMaxCoins: 280,
    rewardXp: 85,
    rewardGemsChance: 0.15,
    rewardGemsAmount: 1,
    bonusDrops: [
      { itemId: 'wheat', name: 'Дикие колоски', emoji: '🌾', count: 3, chance: 0.8 },
      { itemId: 'carrot', name: 'Свежая полевая морковь', emoji: '🥕', count: 2, chance: 0.7 },
      { itemId: 'hazelnut', name: 'Лесные орехи', emoji: '🌰', count: 2, chance: 0.5 },
    ],
    events: [
      'Лошадка весело заржала, почуяв свежий утренний ветерок!',
      'Заметили пушистую белку, прячущую орехи в дупле старого дуба.',
      'Перешли вброд чистый лесной ручей с хрустальной водой.',
      'Скакун с удовольствием сорвал сочный пучок полевых трав.',
    ],
  },
  {
    id: 'route_river',
    name: 'Речной брод & Зеркальное Озеро',
    destination: 'Речная долина',
    emoji: '🌊',
    badge: 'Водный простор',
    description: 'Освежающий галоп по песчаным берегам быстрой реки и кристально чистому озеру кувшинок.',
    durationSeconds: 60,
    energyCost: 25,
    minBondLevel: 2,
    minPlayerLevel: 4,
    rewardMinCoins: 380,
    rewardMaxCoins: 620,
    rewardXp: 180,
    rewardGemsChance: 0.35,
    rewardGemsAmount: 1,
    bonusDrops: [
      { itemId: 'strawberry', name: 'Дикая береговая земляника', emoji: '🍓', count: 3, chance: 0.75 },
      { itemId: 'tulip', name: 'Речные первоцветы', emoji: '🌷', count: 2, chance: 0.6 },
      { itemId: 'lingonberry', name: 'Свежая брусника', emoji: '🫐', count: 2, chance: 0.5 },
    ],
    events: [
      'Брызги воды сверкают на солнце, пока лошадь скачет по отмели!',
      'Вспугнули стайку диких уток, взмывших над камышами.',
      'Нашли на отмели гладкий ракушечник с перламутровым отливом.',
      'Конь напился родниковой воды и набрался сил!',
    ],
  },
  {
    id: 'route_mountain',
    name: 'Горный перевал Ветров',
    destination: 'Орлиный хребет',
    emoji: '⛰️',
    badge: 'Горная экспедиция',
    description: 'Захватывающий подъём на панорамную смотровую площадку над облаками и сосновым бором.',
    durationSeconds: 90,
    energyCost: 35,
    minBondLevel: 3,
    minPlayerLevel: 8,
    rewardMinCoins: 850,
    rewardMaxCoins: 1400,
    rewardXp: 350,
    rewardGemsChance: 0.55,
    rewardGemsAmount: 2,
    bonusDrops: [
      { itemId: 'pinecone', name: 'Кедровые шишки', emoji: '🌲', count: 3, chance: 0.8 },
      { itemId: 'winterberry', name: 'Морозные горные ягоды', emoji: '❄️', count: 2, chance: 0.6 },
      { itemId: 'honey', name: 'Дикий горный мёд', emoji: '🍯', count: 1, chance: 0.4 },
    ],
    events: [
      'С перевала открылся потрясающий вид на всё ваше процветающее поместье!',
      'Лошадь уверенно и легко преодолела крутой каменный склон.',
      'В скальной расщелине скакун заметил мерцающий друзовый кристалл.',
      'Горный воздух наполнил лёгкие свежестью сосновой хвои!',
    ],
  },
  {
    id: 'route_royal_fair',
    name: 'Королевский тракт к Ярмарке',
    destination: 'Столичный округ',
    emoji: '🏰',
    badge: 'Торговый вояж',
    description: 'Широкая мощёная дорога с караванами купцов, уличными музыкантами и щедрыми дарами.',
    durationSeconds: 150,
    energyCost: 50,
    minBondLevel: 4,
    minPlayerLevel: 14,
    rewardMinCoins: 1900,
    rewardMaxCoins: 3100,
    rewardXp: 750,
    rewardGemsChance: 0.8,
    rewardGemsAmount: 4,
    bonusDrops: [
      { itemId: 'peach', name: 'Ярмарочные персики', emoji: '🍑', count: 3, chance: 0.7 },
      { itemId: 'flour', name: 'Отборная столичная мука', emoji: '🌾', count: 3, chance: 0.6 },
      { itemId: 'bread', name: 'Пышный ярмарочный калач', emoji: '🍞', count: 2, chance: 0.5 },
    ],
    events: [
      'Горожане восторженно провожают взглядом вашего великолепного коня!',
      'Купцы из гильдии щедро отблагодарили за доставку почты.',
      'Торговец сувенирами вручил красивую памятную пряжку.',
      'Лошадь грациозно гарцует под звуки ярмарочной музыки!',
    ],
  },
  {
    id: 'route_celestial',
    name: 'Звёздная тропа Древнего Оазиса',
    destination: 'Заповедные земли',
    emoji: '🌌',
    badge: 'Мифический поход',
    description: 'Таинственная тропа под сиянием Млечного Пути. Награды достойны легендарных правителей.',
    durationSeconds: 240,
    energyCost: 65,
    minBondLevel: 6,
    minPlayerLevel: 22,
    rewardMinCoins: 4200,
    rewardMaxCoins: 6800,
    rewardXp: 1600,
    rewardGemsChance: 1.0,
    rewardGemsAmount: 8,
    bonusDrops: [
      { itemId: 'watermelon', name: 'Сахарные арбузы оазиса', emoji: '🍉', count: 3, chance: 0.8 },
      { itemId: 'pumpkin', name: 'Золотая тыква изобилия', emoji: '🎃', count: 2, chance: 0.7 },
      { itemId: 'honey', name: 'Нектар бессмертия', emoji: '🍯', count: 2, chance: 0.6 },
    ],
    events: [
      'Звёздное сияние окутало копыта коня серебристым мерцанием!',
      'Древнее святилище благословило скакуна неиссякаемой энергией.',
      'Тайный сундук сокровищ открылся под звуки небесных колокольчиков.',
      'Легендарный поход навеки записан в летописи вашей фермы!',
    ],
  },
];

// ==================== HORSE TREATS & CARE ====================

export interface HorseTreat {
  itemId: string;
  name: string;
  emoji: string;
  energyGain: number;
  bondGain: number;
  dialogue: string;
}

export const HORSE_TREATS: HorseTreat[] = [
  {
    itemId: 'carrot',
    name: 'Хрустящая морковка',
    emoji: '🥕',
    energyGain: 20,
    bondGain: 15,
    dialogue: 'Хрум-хрум! Лошадка довольно фыркает и тянется за добавкой.',
  },
  {
    itemId: 'apple',
    name: 'Сладкое яблочко',
    emoji: '🍎',
    energyGain: 30,
    bondGain: 25,
    dialogue: 'Сочное лакомство! Глаза лошадки сияют от восторга.',
  },
  {
    itemId: 'wheat',
    name: 'Золотой овёс / пшеница',
    emoji: '🌾',
    energyGain: 15,
    bondGain: 10,
    dialogue: 'Питательное зёрнышко даёт заряд сил перед долгой прогулкой.',
  },
  {
    itemId: 'peach',
    name: 'Спелый персик',
    emoji: '🍑',
    energyGain: 40,
    bondGain: 35,
    dialogue: 'Редкий королевский десерт! Конь нежно тычется мордой в ладонь.',
  },
  {
    itemId: 'watermelon',
    name: 'Сахарная долька арбуза',
    emoji: '🍉',
    energyGain: 50,
    bondGain: 45,
    dialogue: 'Освежающий сахарный ломтик арбуза! Лошадка в полном восторге.',
  },
];

// ==================== BOND TITLES ====================

export const BOND_TITLES: { level: number; title: string; perk: string }[] = [
  { level: 1, title: 'Первое знакомство', perk: 'Доступ к прогулке в Берёзовую рощу' },
  { level: 2, title: 'Верный товарищ', perk: 'Доступ к прогулке к Зеркальному озеру' },
  { level: 3, title: 'Надёжный друг', perk: '+10% к выносливости' },
  { level: 4, title: 'Любимый скакун', perk: 'Доступ к Горному перевалу' },
  { level: 5, title: 'Крылатая пара', perk: '+15% к скорости прогулок' },
  { level: 6, title: 'Неразлучные', perk: 'Доступ к Королевскому тракту' },
  { level: 7, title: 'Единая душа', perk: '+20% к шансу самоцветов' },
  { level: 8, title: 'Мастер выездки', perk: 'Доступ к Звёздной тропе' },
  { level: 9, title: 'Гордость поместья', perk: '+30% ко всем наградам' },
  { level: 10, title: 'Легендарный Всадник', perk: 'Максимальный почёт, титул и золотой венок!' },
];

export function getBondTitle(bondLevel: number): string {
  const item = BOND_TITLES.find((b) => b.level === bondLevel) || BOND_TITLES[BOND_TITLES.length - 1];
  return item.title;
}

// ==================== INITIAL STARTER HORSES ====================

export const INITIAL_PLAYER_HORSES: PlayerHorse[] = [
  {
    id: 'horse_starter_orlov',
    breedId: 'orlov_trotter',
    customName: 'Буран',
    bondLevel: 2,
    bondXp: 40,
    energy: 100,
    maxEnergy: 100,
    lastGroomedAt: null,
    lastFedAt: null,
    equippedTack: {
      blanket: 'pad_linen',
      bridle: 'bridle_leather',
      saddle: 'saddle_village',
      horseshoe: 'horseshoe_iron',
    },
    totalRidesCompleted: 1,
    favoriteTreatItemId: 'carrot',
  },
];

// Helper to calculate total horse stats with equipped gear
export function calculateHorseStats(horse: PlayerHorse) {
  const breed = HORSE_BREEDS[horse.breedId] || HORSE_BREEDS.orlov_trotter;
  let bonusSpeed = 0;
  let bonusRewards = 0;
  let bonusLuck = 0;
  let bonusEnergySave = 0;

  const tackIds = Object.values(horse.equippedTack).filter(Boolean) as string[];
  for (const tid of tackIds) {
    const item = TACK_CATALOG.find((t) => t.id === tid);
    if (item) {
      bonusSpeed += item.bonusSpeedPercent;
      bonusRewards += item.bonusRewardPercent;
      bonusLuck += item.bonusLuckPercent;
      bonusEnergySave += item.bonusEnergySavePercent;
    }
  }

  // Breed traits
  if (horse.breedId === 'orlov_trotter') {
    bonusRewards += 25;
    bonusSpeed += 10;
  } else if (horse.breedId === 'arabian') {
    bonusEnergySave += 20;
  } else if (horse.breedId === 'friesian') {
    bonusLuck += 30;
  } else if (horse.breedId === 'akhal_teke') {
    bonusSpeed += 25;
  } else if (horse.breedId === 'pegasus') {
    bonusRewards += 50;
    bonusSpeed += 25;
    bonusLuck += 35;
  }

  // Bond level bonuses
  const bondSpeedBonus = Math.floor(horse.bondLevel * 2.5);
  const totalSpeedPercent = bonusSpeed + bondSpeedBonus;

  return {
    breed,
    effectiveSpeed: breed.baseSpeed + Math.round(totalSpeedPercent / 10),
    speedPercentBonus: totalSpeedPercent,
    rewardPercentBonus: bonusRewards,
    luckPercentBonus: bonusLuck,
    energySavePercentBonus: bonusEnergySave,
  };
}
