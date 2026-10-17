export type CropId =
  | 'wheat'
  | 'carrot'
  | 'corn'
  | 'strawberry'
  | 'pumpkin'
  | 'sunflower'
  | 'watermelon'
  | 'hazelnut'
  | 'lingonberry'
  | 'winterberry'
  | 'pinecone'
  | 'tulip'
  | 'green_peas'
  | 'peach'
  | 'bell_pepper'
  | 'grape'
  | 'eggplant'
  | 'pineapple'
  | 'artichoke'
  | 'truffle_mushroom'
  | 'lavender'
  | 'golden_wheat'
  | 'dragonfruit'
  | 'starfruit';

export interface CropConfig {
  id: CropId;
  name: string;
  emoji: string;
  growthTime: number; // in seconds
  cost: number;
  sellPrice: number;
  xp: number;
  minLevel: number;
  description: string;
  season?: SeasonId; // if set, this is a seasonal crop
  seasonalBonusDescription?: string;
}

export interface FarmPlot {
  id: number;
  unlocked: boolean;
  unlockLevel: number;
  unlockCost: number;
  cropId: CropId | null;
  plantedAt: number | null; // timestamp ms
  watered: boolean;
  fertilized: boolean;
}

export type AnimalType = 'chicken' | 'cow' | 'sheep' | 'bee';

export interface AnimalConfig {
  type: AnimalType;
  name: string;
  emoji: string;
  produceName: string;
  produceEmoji: string;
  produceItemId: string;
  feedCropId: CropId;
  feedAmount: number;
  cycleTime: number; // seconds
  sellPrice: number;
  xp: number;
  minLevel: number;
  purchaseCost: number;
  maxPerPen: number;
}

export interface AnimalState {
  id: string;
  type: AnimalType;
  fedAt: number | null;
  isReady: boolean;
  lastPetAt: number | null;
}

export type BuildingId =
  | 'windmill'
  | 'bakery'
  | 'dairy'
  | 'loom'
  | 'jam_maker'
  | 'juice_press'
  | 'confectionery';

export interface Recipe {
  id: string;
  name: string;
  emoji: string;
  buildingId: BuildingId;
  craftTime: number; // in seconds
  ingredients: { itemId: string; count: number }[];
  outputItemId: string;
  outputCount: number;
  sellPrice: number;
  xp: number;
  minLevel: number;
  description?: string;
  category?: 'baking' | 'milling' | 'dairy' | 'weaving' | 'preserves' | 'drinks' | 'sweets';
}

export interface CraftingSlot {
  id: string;
  recipeId: string;
  startedAt: number;
  duration: number; // in seconds
  completed: boolean;
}

export interface BuildingState {
  id: BuildingId;
  name: string;
  emoji: string;
  unlocked: boolean;
  minLevel: number;
  unlockCost: number;
  queue: CraftingSlot[];
  maxSlots: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  count: number;
  category: 'crop' | 'animal' | 'product' | 'fruit' | 'tack' | 'treasure';
  sellPrice: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerAvatar: string;
  customerTitle: string;
  requirements: { itemId: string; count: number }[];
  rewardCoins: number;
  rewardXp: number;
  status: 'available' | 'delivering' | 'completed';
  deliveringUntil?: number;
}

export interface OrchardTree {
  id: string;
  type: 'apple' | 'cherry';
  name: string;
  emoji: string;
  fruitItemId: string;
  fruitName: string;
  harvestTime: number; // seconds
  lastHarvestedAt: number;
  isReady: boolean;
  count: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  rewardCoins: number;
  rewardGems: number;
  unlocked: boolean;
  claimed: boolean;
}

export type WeatherType = 'sunny' | 'rain' | 'rainbow' | 'sunset' | 'night';

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';
export type SeasonMode = 'auto' | SeasonId;

export interface SeasonalDecorationConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  actionText: string;
}

export interface SeasonInfo {
  id: SeasonId;
  name: string;
  monthsName: string;
  icon: string;
  tagline: string;
  bonusText: string;
  bgGradient: string;
  decorations: SeasonalDecorationConfig[];
}

export type ActiveTool = 'hand' | 'seed' | 'water' | 'fertilizer';

export interface PlayerStats {
  totalHarvested: number;
  totalAnimalProducts: number;
  totalCrafted: number;
  totalOrdersDelivered: number;
  totalCoinsEarned: number;
  totalDailyRewardsClaimed?: number;
}

export interface DailyRewardItem {
  id: string;
  name: string;
  emoji: string;
  count: number;
}

export interface DailyRewardTier {
  day: number;
  minCoins: number;
  maxCoins: number;
  gems?: number;
  resource?: {
    itemId: string;
    name: string;
    emoji: string;
    minCount: number;
    maxCount: number;
  };
  bonusDescription: string;
}

export interface ClaimedRewardResult {
  day: number;
  coins: number;
  gems: number;
  resource?: DailyRewardItem;
}

export interface GuestbookComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  isPlayer?: boolean;
}

export interface PlayerGift {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderLevel: number;
  giftType: 'seeds' | 'fertilizer' | 'coins' | 'gems' | 'pie';
  giftName: string;
  giftEmoji: string;
  count: number;
  note: string;
  timestamp: string;
  claimed: boolean;
  senderUid?: string;
  recipientUid?: string;
  isFromFirestore?: boolean;
}

export interface PlayerVisitLog {
  id: string;
  visitorName: string;
  visitorAvatar: string;
  visitorLevel: number;
  action: 'watered' | 'petted' | 'gifted' | 'left_note' | 'admired';
  actionText: string;
  timestamp: string;
  rewardClaimed?: boolean;
  visitorUid?: string;
  recipientUid?: string;
  isFromFirestore?: boolean;
}

export interface NeighborTradeItem {
  id: string;
  itemId: string;
  name: string;
  emoji: string;
  count: number;
  price: number;
  sold: boolean;
}

export interface NeighborWantedItem {
  id: string;
  itemId: string;
  name: string;
  emoji: string;
  count: number;
  rewardCoins: number;
  fulfilled: boolean;
}

export interface NeighborFarm {
  id: string;
  name: string;
  ownerName: string;
  ownerAvatar: string;
  level: number;
  reputation: number;
  bio: string;
  specialty: string;
  coverEmoji: string;
  cropsPreview: { name: string; emoji: string; status: string }[];
  animalsPreview: { name: string; emoji: string; count: number }[];
  sellItems: NeighborTradeItem[];
  buyItems: NeighborWantedItem[];
  canHelpWater: boolean;
  helpedWaterToday: boolean;
  guestbook: GuestbookComment[];
  isRealPlayer?: boolean;
  photoURL?: string;
  isFriend?: boolean;
  uid?: string;
}

export type DecorCategory = 'all' | 'nature' | 'structures' | 'lighting' | 'cozy';
export type DecorRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface DecorItem {
  id: string;
  name: string;
  emoji: string;
  category: 'nature' | 'structures' | 'lighting' | 'cozy';
  rarity: DecorRarity;
  costCoins: number;
  costGems: number;
  minLevel: number;
  aestheticPoints: number;
  perk: string;
  description: string;
}

export interface AestheticRankInfo {
  title: string;
  minScore: number;
  icon: string;
  badgeColor: string;
  bonusText: string;
}

export type JournalEntryType = 'level_up' | 'rare_purchase' | 'quest_completed' | 'milestone' | 'artifact_found';

export interface FarmerJournalEntry {
  id: string;
  type: JournalEntryType;
  title: string;
  description: string;
  timestamp: string; // ISO string
  formattedDate: string; // Formatted date string
  icon: string;
  badge: string;
  levelNumber?: number;
  decorId?: string;
  decorName?: string;
  rarity?: DecorRarity;
  questId?: string;
  npcName?: string;
  rewardsSummary?: string;
  artifactId?: string;
  artifactName?: string;
}

export type QuestDifficulty = 'challenging' | 'master' | 'epic';
export type QuestCategory = 'story' | 'seasonal' | 'daily_npc';

export interface NpcQuestObjective {
  id: string;
  description: string;
  targetCount: number;
  currentCount: number;
  itemId?: string; // item in inventory to turn in or harvested
  allowedItemIds?: string[]; // alternative valid items (e.g. any pie: strawberry_pie, apple_pie, pumpkin_pie)
  type: 'harvest' | 'deliver_item' | 'craft' | 'water' | 'action';
}

export interface NpcQuest {
  id: string;
  npcName: string;
  npcAvatar: string;
  npcRole: string; // e.g. "Сельский Староста", "Травница", "Шеф-Повар"
  title: string;
  story: string;
  dialogue: string;
  difficulty: QuestDifficulty;
  category?: QuestCategory; // 'story' | 'seasonal' | 'daily_npc'
  season?: SeasonId; // for seasonal quests
  chapter?: number; // for story quest chapters
  chapterName?: string;
  unlockedAtLevel?: number;
  objectives: NpcQuestObjective[];
  rewards: {
    coins: number;
    gems: number;
    xp: number;
    decorItem?: DecorItem;
    specialTitle?: string;
  };
  completed: boolean;
  completedAt?: string;
}

// ==================== STABLES & HORSES SYSTEM ====================

export type HorseBreedId =
  | 'orlov_trotter'
  | 'arabian'
  | 'friesian'
  | 'akhal_teke'
  | 'shire'
  | 'appaloosa'
  | 'pegasus';

export type TackCategory = 'blanket' | 'bridle' | 'saddle' | 'horseshoe';

export interface TackItem {
  id: string;
  name: string;
  category: TackCategory;
  emoji: string;
  description: string;
  costCoins?: number;
  costGems?: number;
  minLevel: number;
  bonusSpeedPercent: number;
  bonusRewardPercent: number;
  bonusLuckPercent: number;
  bonusEnergySavePercent: number;
}

export interface HorseBreedConfig {
  id: HorseBreedId;
  name: string;
  coatColor: string;
  emoji: string;
  avatarIcon: string;
  description: string;
  traitName: string;
  traitDescription: string;
  costCoins: number;
  costGems?: number;
  minLevel: number;
  baseSpeed: number; // 1-10
  baseStamina: number; // 1-10
  baseLuck: number; // 1-10
}

export interface PlayerHorse {
  id: string;
  breedId: HorseBreedId;
  customName: string;
  bondLevel: number; // 1 to 10
  bondXp: number;
  energy: number; // 0 to 100
  maxEnergy: number; // 100
  lastGroomedAt: number | null;
  lastFedAt: number | null;
  equippedTack: {
    blanket?: string; // TackItem.id
    bridle?: string;
    saddle?: string;
    horseshoe?: string;
  };
  totalRidesCompleted: number;
  favoriteTreatItemId?: string;
}

export interface HorseRideDrop {
  itemId: string;
  name: string;
  emoji: string;
  count: number;
  chance: number; // 0-1
}

export interface HorseRideRoute {
  id: string;
  name: string;
  destination: string;
  emoji: string;
  badge: string;
  description: string;
  durationSeconds: number;
  energyCost: number;
  minBondLevel: number;
  minPlayerLevel: number;
  rewardMinCoins: number;
  rewardMaxCoins: number;
  rewardXp: number;
  rewardGemsChance: number; // 0-1
  rewardGemsAmount?: number;
  bonusDrops: HorseRideDrop[];
  events: string[]; // fun event log lines during the trip
}

export interface ActiveHorseRide {
  id: string;
  horseId: string;
  routeId: string;
  startedAt: number;
  durationMs: number;
  completed: boolean;
  collected?: boolean;
}

// ----------------------------------------------------------------------------
// Treasure Hunt Activity Types
// ----------------------------------------------------------------------------

export type ArtifactRarity = 'rare' | 'epic' | 'legendary';

export interface FarmArtifact {
  id: string;
  name: string;
  emoji: string;
  rarity: ArtifactRarity;
  description: string;
  lore: string;
  perk: string;
  discoveredAt?: string;
}

export type ChestTier = 'wooden' | 'iron' | 'bronze' | 'silver' | 'gold';

export interface TreasureChest {
  id: string;
  step: number; // 1 to 5
  tier: ChestTier;
  name: string;
  locationName: string;
  sector: 'my_farm' | 'neighbor_farm';
  x: number; // 5 to 95% on map canvas
  y: number; // 10 to 90% on map canvas
  discovered: boolean;
  opened: boolean;
  rewards: {
    gems: number;
    coins: number;
    xp: number;
    artifact?: FarmArtifact;
    bonusItem?: { id: string; name: string; emoji: string; count: number };
  };
}

export interface TreasureHuntState {
  lastHuntDate: string; // YYYY-MM-DD
  currentStep: number; // 1 to 5 (which chest player is currently tracking)
  totalChestsFound: number;
  unlockedArtifactIds: string[];
  activeChests: TreasureChest[];
  compassScansUsedToday: number;
}


