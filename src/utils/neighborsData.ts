import { NeighborFarm } from '../types/game';

export const INITIAL_NEIGHBOR_FARMS: NeighborFarm[] = [
  {
    id: 'farm_kuzmich',
    name: 'Медовая Поляна',
    ownerName: 'Дядя Кузьмич',
    ownerAvatar: '👴',
    level: 7,
    reputation: 98,
    bio: 'Старейший пчеловод округа. Мои пчёлы собирают ароматный мёд с лучших лугов!',
    specialty: 'Пасека и Подсолнухи',
    coverEmoji: '🐝',
    cropsPreview: [
      { name: 'Подсолнух', emoji: '🌻', status: 'Цветёт' },
      { name: 'Пшеница', emoji: '🌾', status: 'Спеет' },
      { name: 'Клевер', emoji: '☘️', status: 'Зеленеет' },
    ],
    animalsPreview: [
      { name: 'Пчелиный улей', emoji: '🐝', count: 4 },
      { name: 'Курочка', emoji: '🐔', count: 3 },
    ],
    sellItems: [
      { id: 'k_s1', itemId: 'honey', name: 'Ароматный Мёд', emoji: '🍯', count: 2, price: 90, sold: false },
      { id: 'k_s2', itemId: 'sunflower', name: 'Подсолнухи', emoji: '🌻', count: 3, price: 180, sold: false },
      { id: 'k_s3', itemId: 'cookies', name: 'Печенье с Мёдом', emoji: '🍪', count: 1, price: 110, sold: false },
    ],
    buyItems: [
      { id: 'k_b1', itemId: 'wheat', name: 'Пшеница', emoji: '🌾', count: 4, rewardCoins: 30, fulfilled: false },
      { id: 'k_b2', itemId: 'corn', name: 'Кукуруза', emoji: '🌽', count: 2, rewardCoins: 45, fulfilled: false },
    ],
    canHelpWater: true,
    helpedWaterToday: false,
    guestbook: [
      { id: 'g1', author: 'Фермерша Анна', avatar: '👩‍🌾', text: 'Мёд как всегда высшего сорта! Взяла для чаепития ☕', timestamp: 'Сегодня, 11:20' },
      { id: 'g2', author: 'Шеф Марк', avatar: '👨‍🍳', text: 'Отличное сырьё для ресторанных десертов!', timestamp: 'Вчера, 16:45' },
    ],
  },
  {
    id: 'farm_anna',
    name: 'Зелёные Холмы',
    ownerName: 'Фермерша Анна',
    ownerAvatar: '👩‍🌾',
    level: 6,
    reputation: 114,
    bio: 'Выращиваю отборных коров на свежей альпийской траве. Делаю домашнее масло и сыр.',
    specialty: 'Молочная ферма',
    coverEmoji: '🐮',
    cropsPreview: [
      { name: 'Кукуруза', emoji: '🌽', status: 'Спелая' },
      { name: 'Пшеница', emoji: '🌾', status: 'Колосится' },
      { name: 'Люцерна', emoji: '🌿', status: 'Свежая' },
    ],
    animalsPreview: [
      { name: 'Коровка', emoji: '🐮', count: 4 },
      { name: 'Овечка', emoji: '🐑', count: 2 },
    ],
    sellItems: [
      { id: 'a_s1', itemId: 'milk', name: 'Свежее Молоко', emoji: '🥛', count: 3, price: 50, sold: false },
      { id: 'a_s2', itemId: 'butter', name: 'Сливочное Масло', emoji: '🧈', count: 2, price: 70, sold: false },
      { id: 'a_s3', itemId: 'cheese', name: 'Деревенский Сыр', emoji: '🧀', count: 1, price: 65, sold: false },
    ],
    buyItems: [
      { id: 'a_b1', itemId: 'corn', name: 'Кукуруза', emoji: '🌽', count: 5, rewardCoins: 110, fulfilled: false },
      { id: 'a_b2', itemId: 'carrot', name: 'Морковь', emoji: '🥕', count: 4, rewardCoins: 48, fulfilled: false },
    ],
    canHelpWater: true,
    helpedWaterToday: false,
    guestbook: [
      { id: 'g3', author: 'Бабушка Нина', avatar: '👵', text: 'Сливочное масло просто тает во рту! Спасибо Аннушка!', timestamp: 'Сегодня, 09:15' },
    ],
  },
  {
    id: 'farm_matvey',
    name: 'Клубничная Сказка',
    ownerName: 'Садовник Матвей',
    ownerAvatar: '🧑‍🌾',
    level: 5,
    reputation: 82,
    bio: 'Люблю спелые ягоды, яблоневые сады и свежую выпечку. Заходите отведать клубники!',
    specialty: 'Ягоды и Выпечка',
    coverEmoji: '🍓',
    cropsPreview: [
      { name: 'Клубника', emoji: '🍓', status: 'Спелая' },
      { name: 'Яблоня', emoji: '🍎', status: 'Плодоносит' },
      { name: 'Морковь', emoji: '🥕', status: 'Зеленеет' },
    ],
    animalsPreview: [
      { name: 'Курочка', emoji: '🐔', count: 4 },
    ],
    sellItems: [
      { id: 'm_s1', itemId: 'strawberry', name: 'Спелая Клубника', emoji: '🍓', count: 4, price: 95, sold: false },
      { id: 'm_s2', itemId: 'strawberry_pie', name: 'Клубничный Пирог', emoji: '🥧', count: 1, price: 85, sold: false },
      { id: 'm_s3', itemId: 'apple', name: 'Яблоки', emoji: '🍎', count: 3, price: 35, sold: false },
    ],
    buyItems: [
      { id: 'm_b1', itemId: 'flour', name: 'Мука', emoji: '🌾', count: 2, rewardCoins: 40, fulfilled: false },
      { id: 'm_b2', itemId: 'egg', name: 'Яйца', emoji: '🥚', count: 3, rewardCoins: 42, fulfilled: false },
    ],
    canHelpWater: true,
    helpedWaterToday: false,
    guestbook: [
      { id: 'g4', author: 'Дядя Кузьмич', avatar: '👴', text: 'Пирог с чаем удался на славу! 🥧', timestamp: 'Вчера, 18:20' },
    ],
  },
  {
    id: 'farm_klavdiya',
    name: 'Шерстяной Уют',
    ownerName: 'Бабушка Клавдия',
    ownerAvatar: '👵',
    level: 8,
    reputation: 140,
    bio: 'Пасу пушистых овечек на тихих лугах и вяжу тёплые вещи. Всегда рада гостям!',
    specialty: 'Овцеводство и Пряжа',
    coverEmoji: '🐑',
    cropsPreview: [
      { name: 'Морковь', emoji: '🥕', status: 'Спеет' },
      { name: 'Пшеница', emoji: '🌾', status: 'Готова' },
      { name: 'Вишня', emoji: '🍒', status: 'Спелая' },
    ],
    animalsPreview: [
      { name: 'Овечка', emoji: '🐑', count: 4 },
      { name: 'Курочка', emoji: '🐔', count: 2 },
    ],
    sellItems: [
      { id: 'kl_s1', itemId: 'wool', name: 'Нежная Шерсть', emoji: '🧶', count: 3, price: 95, sold: false },
      { id: 'kl_s2', itemId: 'sweater', name: 'Тёплый Свитер', emoji: '🧵', count: 1, price: 120, sold: false },
      { id: 'kl_s3', itemId: 'cherry', name: 'Вишня', emoji: '🍒', count: 3, price: 45, sold: false },
    ],
    buyItems: [
      { id: 'kl_b1', itemId: 'carrot', name: 'Морковь', emoji: '🥕', count: 5, rewardCoins: 55, fulfilled: false },
      { id: 'kl_b2', itemId: 'honey', name: 'Мёд', emoji: '🍯', count: 1, rewardCoins: 75, fulfilled: false },
    ],
    canHelpWater: true,
    helpedWaterToday: false,
    guestbook: [
      { id: 'g5', author: 'Фермерша Анна', avatar: '👩‍🌾', text: 'Свитер невероятно мягкий и греет вечерами! ❤️', timestamp: 'Вчера, 14:10' },
    ],
  },
  {
    id: 'farm_victor',
    name: 'Овощной Рай',
    ownerName: 'Агроном Виктор',
    ownerAvatar: '👨‍🌾',
    level: 6,
    reputation: 90,
    bio: 'Выращиваю тыквы-рекордсмены и сладкую хрустящую морковь. Обмениваю излишки!',
    specialty: 'Овощеводство и Селекция',
    coverEmoji: '🎃',
    cropsPreview: [
      { name: 'Тыква', emoji: '🎃', status: 'Огромная' },
      { name: 'Морковь', emoji: '🥕', status: 'Спелая' },
      { name: 'Арбуз', emoji: '🍉', status: 'Наливается' },
    ],
    animalsPreview: [
      { name: 'Курочка', emoji: '🐔', count: 3 },
      { name: 'Коровка', emoji: '🐮', count: 2 },
    ],
    sellItems: [
      { id: 'v_s1', itemId: 'pumpkin', name: 'Спелая Тыква', emoji: '🎃', count: 2, price: 110, sold: false },
      { id: 'v_s2', itemId: 'carrot', name: 'Морковь', emoji: '🥕', count: 6, price: 40, sold: false },
      { id: 'v_s3', itemId: 'bread', name: 'Свежий Хлеб', emoji: '🍞', count: 2, price: 65, sold: false },
    ],
    buyItems: [
      { id: 'v_b1', itemId: 'egg', name: 'Яйца', emoji: '🥚', count: 3, rewardCoins: 45, fulfilled: false },
      { id: 'v_b2', itemId: 'strawberry', name: 'Клубника', emoji: '🍓', count: 3, rewardCoins: 115, fulfilled: false },
    ],
    canHelpWater: true,
    helpedWaterToday: false,
    guestbook: [
      { id: 'g6', author: 'Шеф Марк', avatar: '👨‍🍳', text: 'Тыквенный суп из твоих овощей получился божественным! 🍲', timestamp: '2 дня назад' },
    ],
  },
];

export const QUICK_COMMENTS = [
  'Прекрасная ферма! Всё цветёт и радует глаз 🌸',
  'Полил грядку и погладил питомцев ❤️',
  'Отличная лавка со свежими товарами! Спасибо за сделку 🤝',
  'Уютное хозяйство, вдохновляет развивать свою ферму! 🌾',
  'Шикарный урожай и милейшие животные 🐮✨',
];

export const INITIAL_PLAYER_GIFTS = [
  {
    id: 'gift_init_1',
    senderName: 'Фермерша Анна',
    senderAvatar: '👩‍🌾',
    senderLevel: 6,
    giftType: 'fertilizer' as const,
    giftName: 'Золотое эко-удобрение',
    giftEmoji: '✨',
    count: 3,
    note: 'Привет соседям! Держи немного удобрений для быстрого созревания твоих полей!',
    timestamp: 'Сегодня, 10:15',
    claimed: false,
  },
  {
    id: 'gift_init_2',
    senderName: 'Дядя Кузьмич',
    senderAvatar: '👴',
    senderLevel: 7,
    giftType: 'seeds' as const,
    giftName: 'Семена подсолнухов',
    giftEmoji: '🌻',
    count: 5,
    note: 'Угощайся отборными семенами с моей пасеки. Пусть поле золотится на солнце!',
    timestamp: 'Вчера, 18:30',
    claimed: false,
  },
];

export const INITIAL_VISIT_LOGS = [
  {
    id: 'visit_1',
    visitorName: 'Садовник Матвей',
    visitorAvatar: '🧑‍🌾',
    visitorLevel: 5,
    action: 'watered' as const,
    actionText: 'Полил ваши сухие грядки с клубникой (+15 🪙 бонус вам)',
    timestamp: '30 минут назад',
    rewardClaimed: false,
  },
  {
    id: 'visit_2',
    visitorName: 'Фермерша Анна',
    visitorAvatar: '👩‍🌾',
    visitorLevel: 6,
    action: 'petted' as const,
    actionText: 'Погладила коров в загоне и пожелала хорошего дня ❤️',
    timestamp: '2 часа назад',
    rewardClaimed: true,
  },
  {
    id: 'visit_3',
    visitorName: 'Агроном Виктор',
    visitorAvatar: '👨‍🌾',
    visitorLevel: 6,
    action: 'left_note' as const,
    actionText: 'Оставил душевную запись в вашей гостевой книге ✍️',
    timestamp: 'Вчера, 14:10',
    rewardClaimed: true,
  },
];

