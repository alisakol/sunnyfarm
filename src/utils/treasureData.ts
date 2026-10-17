import { FarmArtifact, TreasureChest, ChestTier } from '../types/game';

export const ANCIENT_ARTIFACTS: FarmArtifact[] = [
  {
    id: 'art_golden_sickle',
    name: 'Золотой Серп Первопроходца',
    emoji: '🌾',
    rarity: 'epic',
    description: 'Древний кованый серп с гравировкой первых колосков Солнечной Долины.',
    lore: 'Им дедушка Матвей заложил самое первое поле в долине более полувека назад.',
    perk: '+10% к золоту за сбор любого спелого урожая',
  },
  {
    id: 'art_sun_compass',
    name: 'Солнечный Латунный Компас',
    emoji: '🧭',
    rarity: 'rare',
    description: 'Латунный компас геодезистов, всегда указывающий на плодородные земли.',
    lore: 'Стрелка компаса вибрирует, когда рядом созревает отборный урожай.',
    perk: '+5% к скорости роста всех сельскохозяйственных культур',
  },
  {
    id: 'art_emerald_acorn',
    name: 'Изумрудный Жёлудь Вечности',
    emoji: '🌰',
    rarity: 'legendary',
    description: 'Окаменевший священный плод Великого Дуба с изумрудным отливом.',
    lore: 'Считается символом непрекращающегося плодородия и вечной молодости сада.',
    perk: '+20 XP при каждом сборе плодов с деревьев и кустарников',
  },
  {
    id: 'art_amber_clover',
    name: 'Янтарный Четырёхлистник',
    emoji: '🍀',
    rarity: 'epic',
    description: 'Идеальный четырёхлистный клевер, навеки застывший в прозрачном балтийском янтаре.',
    lore: 'Приносит небывалую купеческую удачу при заключении сделок.',
    perk: '+10% к награде за все выполненные дорожные заказы',
  },
  {
    id: 'art_pasture_bell',
    name: 'Рунный Колокольчик Пастбища',
    emoji: '🔔',
    rarity: 'rare',
    description: 'Мелодичный бронзовый колокольчик с руническими символами благополучия животных.',
    lore: 'Его нежный перезвон мгновенно успокаивает даже самых капризных коров и овечек.',
    perk: '+15% к шансу получить двойной продукт от сытых питомцев',
  },
  {
    id: 'art_river_amulet',
    name: 'Амулет Речного Духа',
    emoji: '🐟',
    rarity: 'epic',
    description: 'Гладкий речной лазурит, отшлифованный быстрыми водами зеркальной реки.',
    lore: 'Приманивает редчайшую королевскую форель и золотистых линей.',
    perk: '+15% к весу рыбы и редким находкам во время рыбалки',
  },
  {
    id: 'art_ancient_key',
    name: 'Бронзовый Ключ Хранителя',
    emoji: '🗝️',
    rarity: 'rare',
    description: 'Искусно выточенный старинный ключ от тайных погребов родового амбара.',
    lore: 'Открывает доступ к скрытым резервам и экономии строительных материалов.',
    perk: '+10 бесплатных ячеек к вместимости амбара навсегда',
  },
  {
    id: 'art_star_prism',
    name: 'Звёздная Призма Долины',
    emoji: '🔮',
    rarity: 'legendary',
    description: 'Магический кристалл горного хрусталя, преломляющий солнечный свет в радугу.',
    lore: 'Подарок мудрого Радомира за гармонию между человеком и природой.',
    perk: '+1 Самоцвет (Гем 💎) к каждой полученной ежедневной награде',
  },
];

interface LocationTemplate {
  name: string;
  sector: 'my_farm' | 'neighbor_farm';
  xRange: [number, number];
  yRange: [number, number];
  clue: string;
}

export const VALLEY_LOCATIONS: LocationTemplate[] = [
  // My Farm locations (West & Center)
  {
    name: 'Яблоневый сад у пруда',
    sector: 'my_farm',
    xRange: [15, 30],
    yRange: [20, 38],
    clue: 'Слышен шелест наливных яблонь и плеск речной воды...',
  },
  {
    name: 'Ветряная мельница на холме',
    sector: 'my_farm',
    xRange: [22, 38],
    yRange: [45, 62],
    clue: 'Тень огромных лопастей скользит по спелой золотой пшенице...',
  },
  {
    name: 'Утиный мостик через протоку',
    sector: 'my_farm',
    xRange: [12, 28],
    yRange: [65, 82],
    clue: 'Старые деревянные перила, где любят отдыхать кряквы...',
  },
  {
    name: 'Тайный погреб у Амбара',
    sector: 'my_farm',
    xRange: [35, 48],
    yRange: [25, 42],
    clue: 'Пахнет сушёными травами, мёдом и кедровой смолой...',
  },
  {
    name: 'Цветочная оранжерея усадьбы',
    sector: 'my_farm',
    xRange: [38, 50],
    yRange: [60, 80],
    clue: 'Яркие бутоны лаванды и подсолнухов скрывают старинную кладку...',
  },

  // Neighbor Farms & Valley Commons (East & North-East)
  {
    name: 'Пасека дедушки Кузьмича',
    sector: 'neighbor_farm',
    xRange: [55, 70],
    yRange: [18, 35],
    clue: 'Тихое жужжание пчёл среди ароматных лип соседа...',
  },
  {
    name: 'Подсолнуховое поле Фермерши Анны',
    sector: 'neighbor_farm',
    xRange: [72, 88],
    yRange: [22, 40],
    clue: 'Гигантские золотые шляпки подсолнухов тянутся к самому солнцу...',
  },
  {
    name: 'Речной причал у Шефа Марка',
    sector: 'neighbor_farm',
    xRange: [60, 75],
    yRange: [50, 68],
    clue: 'Рыбацкие лодки мерно качаются у деревянных мостков...',
  },
  {
    name: 'Конный выгон на холмах',
    sector: 'neighbor_farm',
    xRange: [75, 90],
    yRange: [55, 75],
    clue: 'Широкие луга, где резвятся породистые скакуны соседей...',
  },
  {
    name: 'Каменная арка дружбы Долины',
    sector: 'neighbor_farm',
    xRange: [65, 82],
    yRange: [76, 90],
    clue: 'Древний каменный монумент на границе соседских владений...',
  },
];

export const CHEST_TIERS: {
  tier: ChestTier;
  title: string;
  icon: string;
  baseCoins: number;
  baseGems: number;
  baseXp: number;
}[] = [
  { tier: 'wooden', title: 'Деревянный Ларец', icon: '🪵', baseCoins: 150, baseGems: 1, baseXp: 50 },
  { tier: 'iron', title: 'Кованый Железный Сундук', icon: '📦', baseCoins: 300, baseGems: 2, baseXp: 100 },
  { tier: 'bronze', title: 'Медный Тайник Долины', icon: '🥉', baseCoins: 550, baseGems: 3, baseXp: 180 },
  { tier: 'silver', title: 'Серебряный Сейф Мастера', icon: '🥈', baseCoins: 900, baseGems: 5, baseXp: 280 },
  { tier: 'gold', title: 'Древний Золотой Реликварий', icon: '👑', baseCoins: 1600, baseGems: 10, baseXp: 450 },
];

/**
 * Generate the 5-step daily sequence of treasure chests
 */
export function generateDailyTreasureChests(
  level: number = 1,
  unlockedArtifactIds: string[] = []
): TreasureChest[] {
  // Pick 5 distinct locations across own farm (first 2-3) and neighbors (remaining)
  const myFarmLocs = [...VALLEY_LOCATIONS.filter((l) => l.sector === 'my_farm')].sort(() => 0.5 - Math.random());
  const neighborLocs = [...VALLEY_LOCATIONS.filter((l) => l.sector === 'neighbor_farm')].sort(() => 0.5 - Math.random());

  const chosenLocations: LocationTemplate[] = [
    myFarmLocs[0],
    myFarmLocs[1],
    neighborLocs[0],
    myFarmLocs[2] || neighborLocs[1],
    neighborLocs[neighborLocs.length - 1],
  ];

  // Candidates for artifact drop (not yet discovered)
  const remainingArtifacts = ANCIENT_ARTIFACTS.filter((a) => !unlockedArtifactIds.includes(a.id));
  const candidateArtifact =
    remainingArtifacts.length > 0
      ? remainingArtifacts[Math.floor(Math.random() * remainingArtifacts.length)]
      : undefined;

  const bonusItems = [
    { id: 'fertilizer', name: 'Супер-Удобрение', emoji: '🧪', count: 3 },
    { id: 'strawberry_pie', name: 'Клубничный пирог', emoji: '🥧', count: 2 },
    { id: 'honey', name: 'Цветочный мёд', emoji: '🍯', count: 4 },
    { id: 'cheese', name: 'Фермерский сыр', emoji: '🧀', count: 3 },
    { id: 'strawberry', name: 'Спелая клубника', emoji: '🍓', count: 8 },
  ];

  return CHEST_TIERS.map((tierConfig, index) => {
    const step = index + 1;
    const loc = chosenLocations[index];

    // Randomize precise coordinates inside location's defined bounds
    const x = Math.round(loc.xRange[0] + Math.random() * (loc.xRange[1] - loc.xRange[0]));
    const y = Math.round(loc.yRange[0] + Math.random() * (loc.yRange[1] - loc.yRange[0]));

    // Scale rewards with level
    const levelMult = 1 + (level - 1) * 0.08;
    const coins = Math.round(tierConfig.baseCoins * levelMult);
    const gems = tierConfig.baseGems;
    const xp = Math.round(tierConfig.baseXp * levelMult);

    // Guaranteed artifact on final 5th chest if any undiscovered remain
    const artifact = step === 5 ? candidateArtifact : undefined;

    return {
      id: `chest_step_${step}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      step,
      tier: tierConfig.tier,
      name: tierConfig.title,
      locationName: loc.name,
      sector: loc.sector,
      x,
      y,
      discovered: false,
      opened: false,
      rewards: {
        gems,
        coins,
        xp,
        artifact,
        bonusItem: bonusItems[index % bonusItems.length],
      },
    };
  });
}
