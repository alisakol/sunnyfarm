import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveTool,
  AnimalConfig,
  AnimalState,
  AnimalType,
  BuildingId,
  BuildingState,
  ClaimedRewardResult,
  CropId,
  DailyRewardItem,
  FarmPlot,
  GuestbookComment,
  InventoryItem,
  NeighborFarm,
  Order,
  OrchardTree,
  PlayerStats,
  SeasonId,
  SeasonMode,
  WeatherType,
  FarmerJournalEntry,
  NpcQuest,
  PlayerGift,
  PlayerVisitLog,
  PlayerHorse,
  ActiveHorseRide,
  HorseBreedId,
} from '../types/game';
import {
  ANIMALS,
  CROPS,
  CUSTOMERS,
  DAILY_REWARDS_CONFIG,
  INITIAL_ACHIEVEMENTS,
  INITIAL_BUILDINGS,
  INITIAL_TREES,
  LEVEL_REQUIREMENTS,
  MAX_LEVEL,
  getXpRequiredForLevel,
  RECIPES,
  WEATHER_CONFIG,
} from '../utils/constants';
import { INITIAL_NEIGHBOR_FARMS, INITIAL_PLAYER_GIFTS, INITIAL_VISIT_LOGS } from '../utils/neighborsData';
import { getCalendarSeason } from '../utils/seasonalData';
import { sound } from '../utils/audio';
import { vibrateLight, vibrateSuccess, vibrateLevelUp } from '../utils/haptics';
import { CloudSavePayload } from '../services/cloudSync';
import { DECORATIONS_CATALOG } from '../utils/decorationsData';
import { INITIAL_NPC_QUESTS, generateDailyQuestsRefresh } from '../utils/questsData';
import {
  INITIAL_PLAYER_HORSES,
  HORSE_BREEDS,
  TACK_CATALOG,
  RIDE_ROUTES,
  HORSE_TREATS,
  calculateHorseStats,
} from '../utils/stablesData';
import { createInitialJournalEntries, formatJournalDate } from '../utils/journalData';

const STORAGE_KEY = 'SUNNY_FARM_DATA_V2';

export const getCropGrowthMultiplier = (
  weather: WeatherType,
  watered: boolean,
  fertilized: boolean,
  cropId?: CropId | null,
  season?: SeasonId
): number => {
  if (fertilized) return 999;
  const cfg = WEATHER_CONFIG[weather] || WEATHER_CONFIG.sunny;
  const baseSpeed = watered ? 1.5 : 1.0;
  let seasonalBonus = 1.0;

  if (cropId && CROPS[cropId]) {
    const crop = CROPS[cropId];
    if (crop.season && crop.season === season) {
      seasonalBonus = 1.45; // 45% bonus for growing seasonal crop during its season!
    } else if (season === 'autumn' && (cropId === 'pumpkin' || cropId === 'wheat' || cropId === 'hazelnut' || cropId === 'lingonberry')) {
      seasonalBonus = 1.4;
    } else if (season === 'spring' && (cropId === 'carrot' || cropId === 'strawberry' || cropId === 'tulip' || cropId === 'green_peas')) {
      seasonalBonus = 1.4;
    } else if (season === 'summer' && (cropId === 'corn' || cropId === 'sunflower' || cropId === 'watermelon' || cropId === 'peach' || cropId === 'bell_pepper')) {
      seasonalBonus = 1.4;
    } else if (season === 'winter' && (cropId === 'winterberry' || cropId === 'pinecone')) {
      seasonalBonus = 1.45;
    }
  }

  return baseSpeed * cfg.speedMultiplier * seasonalBonus;
};

export interface FloatingText {
  id: string;
  text: string;
  x?: number;
  y?: number;
  color?: string;
}

export function useGameState() {
  // Coins & progression
  const [coins, setCoins] = useState<number>(120);
  const [gems, setGems] = useState<number>(15);
  const [level, setLevel] = useState<number>(1);
  const [xp, setXp] = useState<number>(0);
  const [newLevelUnlocked, setNewLevelUnlocked] = useState<number | null>(null);

  // Daily reward system
  const [lastDailyClaimDate, setLastDailyClaimDate] = useState<string | null>(null);
  const [dailyStreak, setDailyStreak] = useState<number>(1);
  const [lastQuestsRefreshDate, setLastQuestsRefreshDate] = useState<string | null>(null);

  // Seasonal surprise system (1 surprise claim per day)
  const [lastSeasonalSurpriseDate, setLastSeasonalSurpriseDate] = useState<string | null>(null);

  // Neighbor Farms
  const [neighbors, setNeighbors] = useState<NeighborFarm[]>(INITIAL_NEIGHBOR_FARMS);

  // Player-to-Player Interaction: Gift box & Farm visitors history log
  const [playerGifts, setPlayerGifts] = useState<PlayerGift[]>(INITIAL_PLAYER_GIFTS);
  const [playerVisitLogs, setPlayerVisitLogs] = useState<PlayerVisitLog[]>(INITIAL_VISIT_LOGS);


  // Barn storage
  const [barnCapacity, setBarnCapacity] = useState<number>(50);

  const [inventory, setInventory] = useState<Record<string, number>>({
    wheat: 8,
    carrot: 4,
    corn: 2,
    egg: 2,
    flour: 1,
    apple: 3,
  });

  // Farm Plots (36 plots total, 4 initial)
  const [plots, setPlots] = useState<FarmPlot[]>(() => {
    return Array.from({ length: 36 }, (_, i) => {
      const unlockLevel =
        i < 4 ? 1 : i < 12 ? Math.floor(i / 2) + 1 : i < 20 ? Math.floor(i / 2) + 1 : 11 + (i - 19) * 2;
      return {
        id: i,
        unlocked: i < 4,
        unlockLevel,
        unlockCost: (i + 1) * 45,
        cropId: null,
        plantedAt: null,
        watered: false,
        fertilized: false,
      };
    });
  });

  // Stables & Horses System
  const [playerHorses, setPlayerHorses] = useState<PlayerHorse[]>(INITIAL_PLAYER_HORSES);
  const [activeHorseRides, setActiveHorseRides] = useState<ActiveHorseRide[]>([]);
  const [unlockedTackIds, setUnlockedTackIds] = useState<string[]>([
    'pad_linen',
    'bridle_leather',
    'saddle_village',
    'horseshoe_iron',
  ]);

  // Animals
  const [animals, setAnimals] = useState<AnimalState[]>([
    { id: 'ch_1', type: 'chicken', fedAt: null, isReady: false, lastPetAt: null },
    { id: 'ch_2', type: 'chicken', fedAt: null, isReady: false, lastPetAt: null },
  ]);

  // Production buildings
  const [buildings, setBuildings] = useState<BuildingState[]>(INITIAL_BUILDINGS);

  // Orchard trees
  const [trees, setTrees] = useState<OrchardTree[]>(INITIAL_TREES);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);

  // Achievements
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);

  // Stats
  const [stats, setStats] = useState<PlayerStats>({
    totalHarvested: 0,
    totalAnimalProducts: 0,
    totalCrafted: 0,
    totalOrdersDelivered: 0,
    totalCoinsEarned: 120,
  });

  // Tools & UI state
  const [activeTool, setActiveTool] = useState<ActiveTool>('hand');
  const [selectedCropId, setSelectedCropId] = useState<CropId>('wheat');
  const [weather, setWeather] = useState<WeatherType>('sunny');
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('auto');
  const effectiveSeason: SeasonId = seasonMode === 'auto' ? getCalendarSeason() : seasonMode;
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [truckDelivering, setTruckDelivering] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabledState] = useState<boolean>(false);

  // Farm decorations & aesthetics
  const [purchasedDecorations, setPurchasedDecorations] = useState<string[]>(['flower_arch']);
  const [placedDecorations, setPlacedDecorations] = useState<string[]>(['flower_arch']);

  // Farmer's Journal (Дневник Фермера) & NPC Quests
  const [journalEntries, setJournalEntries] = useState<FarmerJournalEntry[]>(() =>
    createInitialJournalEntries(1)
  );
  const [npcQuests, setNpcQuests] = useState<NpcQuest[]>(INITIAL_NPC_QUESTS);

  // Total items in barn
  const barnUsed = Object.values(inventory).reduce((acc, count) => acc + count, 0);

  // Add floating banner/text
  const showFloating = useCallback((text: string, color: string = 'text-amber-300') => {
    const id = Math.random().toString(36).substring(2, 9);
    setFloatingTexts((prev) => [...prev, { id, text, color }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  }, []);

  // Generate random customer order
  const generateOrder = useCallback((idStr?: string): Order => {
    const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const id = idStr || Math.random().toString(36).substring(2, 9);

    // Pick 1-2 items appropriate for current level
    const candidates = ['wheat', 'carrot', 'egg', 'apple'];
    if (level >= 2) candidates.push('corn', 'flour', 'bread', 'cornmeal');
    if (level >= 3) candidates.push('strawberry', 'milk', 'butter', 'carrot_cake', 'powdered_sugar');
    if (level >= 4) candidates.push('pumpkin', 'wool', 'cheese', 'sweater', 'cherry_muffin', 'oat_flakes');
    if (level >= 5) candidates.push('sunflower', 'honey', 'cookies', 'rustic_pizza', 'fresh_cider');
    if (level >= 6) candidates.push('strawberry_jam', 'cheese_baguette', 'berry_ice_cream', 'apple_cinnamon_jam');
    if (level >= 7) candidates.push('grape', 'lingonberry_jam', 'cherry_confiture', 'peach_shake', 'manor_carpet');
    if (level >= 8) candidates.push('eggplant', 'grape_jelly', 'berry_lemonade', 'eggplant_quiche');
    if (level >= 9) candidates.push('artichoke', 'watermelon_juice', 'grape_juice', 'peperonata_sauce');
    if (level >= 10) candidates.push('pineapple', 'pineapple_smoothie', 'artichoke_tart');
    if (level >= 12) candidates.push('golden_wheat', 'golden_flour', 'truffle_cheese', 'pineapple_jam');
    if (level >= 14) candidates.push('tsar_loaf', 'royal_brocade', 'hazelnut_truffle', 'grape_praline');
    if (level >= 16) candidates.push('truffle_brie', 'royal_pavlova', 'truffle_praline');

    const numItems = Math.random() > 0.5 ? 2 : 1;
    const requirements: { itemId: string; count: number }[] = [];
    const used = new Set<string>();

    for (let i = 0; i < numItems; i++) {
      const available = candidates.filter((c) => !used.has(c));
      if (available.length === 0) break;
      const itemId = available[Math.floor(Math.random() * available.length)];
      used.add(itemId);
      const count = Math.floor(Math.random() * 3) + 1;
      requirements.push({ itemId, count });
    }

    // Calculate nice rewards
    let rewardCoins = 0;
    let rewardXp = 0;
    requirements.forEach((req) => {
      const crop = CROPS[req.itemId];
      const rec = RECIPES.find((r) => r.outputItemId === req.itemId);
      if (crop) {
        rewardCoins += crop.sellPrice * req.count * 1.4;
        rewardXp += crop.xp * req.count * 1.5;
      } else if (rec) {
        rewardCoins += rec.sellPrice * req.count * 1.4;
        rewardXp += rec.xp * req.count * 1.5;
      } else {
        rewardCoins += 35 * req.count;
        rewardXp += 25 * req.count;
      }
    });

    return {
      id,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      customerTitle: customer.title,
      requirements,
      rewardCoins: Math.round(rewardCoins),
      rewardXp: Math.round(rewardXp),
      status: 'available',
    };
  }, [level]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.coins !== undefined) setCoins(parsed.coins);
        if (parsed.gems !== undefined) setGems(parsed.gems);
        if (parsed.level !== undefined) setLevel(parsed.level);
        if (parsed.xp !== undefined) setXp(parsed.xp);
        if (parsed.barnCapacity !== undefined) setBarnCapacity(parsed.barnCapacity);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.plots) {
          if (parsed.plots.length < 36) {
            const existingPlots = [...parsed.plots];
            for (let i = existingPlots.length; i < 36; i++) {
              const unlockLevel =
                i < 4 ? 1 : i < 12 ? Math.floor(i / 2) + 1 : i < 20 ? Math.floor(i / 2) + 1 : 11 + (i - 19) * 2;
              existingPlots.push({
                id: i,
                unlocked: false,
                unlockLevel,
                unlockCost: (i + 1) * 45,
                cropId: null,
                plantedAt: null,
                watered: false,
                fertilized: false,
              });
            }
            setPlots(existingPlots);
          } else {
            setPlots(parsed.plots);
          }
        }
        if (parsed.animals) setAnimals(parsed.animals);
        if (parsed.buildings) {
          const existingBuildingIds = new Set(parsed.buildings.map((b: any) => b.id));
          const newBuildings = INITIAL_BUILDINGS.filter((b) => !existingBuildingIds.has(b.id));
          setBuildings([...parsed.buildings, ...newBuildings]);
        }
        if (parsed.trees) setTrees(parsed.trees);
        if (parsed.orders && parsed.orders.length > 0) setOrders(parsed.orders);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.stats) setStats(parsed.stats);
        if (parsed.neighbors && parsed.neighbors.length > 0) setNeighbors(parsed.neighbors);
        if (parsed.seasonMode) setSeasonMode(parsed.seasonMode);
        if (parsed.lastSeasonalSurpriseDate) setLastSeasonalSurpriseDate(parsed.lastSeasonalSurpriseDate);
        if (parsed.purchasedDecorations) setPurchasedDecorations(parsed.purchasedDecorations);
        if (parsed.placedDecorations) setPlacedDecorations(parsed.placedDecorations);
        if (parsed.playerHorses && parsed.playerHorses.length > 0) setPlayerHorses(parsed.playerHorses);
        if (parsed.activeHorseRides) setActiveHorseRides(parsed.activeHorseRides);
        if (parsed.unlockedTackIds && parsed.unlockedTackIds.length > 0) setUnlockedTackIds(parsed.unlockedTackIds);
        if (parsed.journalEntries && parsed.journalEntries.length > 0) setJournalEntries(parsed.journalEntries);
        if (parsed.npcQuests && parsed.npcQuests.length > 0) {
          // Normalize legacy pie objectives to accept strawberry_pie and all freshly baked pies
          const migratedQuests: NpcQuest[] = parsed.npcQuests.map((q: NpcQuest) => ({
            ...q,
            objectives: q.objectives.map((o) => {
              if (o.itemId === 'pie' || o.id === 'obj_pie' || o.id === 'obj_pie_caravan') {
                return {
                  ...o,
                  itemId: 'strawberry_pie',
                  allowedItemIds: ['strawberry_pie', 'apple_pie', 'pumpkin_pie', 'pie'],
                  description:
                    o.id === 'obj_pie_caravan'
                      ? 'Сдать пироги (клубничные, яблочные или праздничные тыквенные)'
                      : 'Сдать ароматные пироги (клубничный / яблочный / тыквенный)',
                };
              }
              return o;
            }),
          }));

          // Merge any brand new quests from INITIAL_NPC_QUESTS
          const existingIds = new Set(migratedQuests.map((q) => q.id));
          const newQuestsToAdd = INITIAL_NPC_QUESTS.filter((template) => !existingIds.has(template.id));
          setNpcQuests([...migratedQuests, ...newQuestsToAdd]);
        }
        if (parsed.lastQuestsRefreshDate) setLastQuestsRefreshDate(parsed.lastQuestsRefreshDate);
        if (parsed.playerGifts && parsed.playerGifts.length > 0) setPlayerGifts(parsed.playerGifts);
        if (parsed.playerVisitLogs && parsed.playerVisitLogs.length > 0) setPlayerVisitLogs(parsed.playerVisitLogs);
        if (parsed.lastDailyClaimDate) {
          setLastDailyClaimDate(parsed.lastDailyClaimDate);
          // Check streak continuity: if last claim was earlier than yesterday, streak resets to 1
          const nowD = new Date();
          const yesterdayD = new Date();
          yesterdayD.setDate(yesterdayD.getDate() - 1);
          const yStr = `${yesterdayD.getFullYear()}-${String(yesterdayD.getMonth() + 1).padStart(2, '0')}-${String(yesterdayD.getDate()).padStart(2, '0')}`;
          const tStr = `${nowD.getFullYear()}-${String(nowD.getMonth() + 1).padStart(2, '0')}-${String(nowD.getDate()).padStart(2, '0')}`;

          if (parsed.lastDailyClaimDate === yStr || parsed.lastDailyClaimDate === tStr) {
            setDailyStreak(parsed.dailyStreak || 1);
          } else {
            // Gap of > 1 day: reset streak to 1
            setDailyStreak(1);
          }
        }
      } else {
        // Init default orders
        setOrders([generateOrder('ord_1'), generateOrder('ord_2'), generateOrder('ord_3')]);
      }
    } catch (e) {
      console.warn('Could not restore farm data:', e);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    try {
      const dataToSave = {
        coins,
        gems,
        level,
        xp,
        lastDailyClaimDate,
        dailyStreak,
        barnCapacity,
        inventory,
        plots,
        animals,
        buildings,
        trees,
        orders,
        achievements,
        stats,
        neighbors,
        seasonMode,
        lastSeasonalSurpriseDate,
        purchasedDecorations,
        placedDecorations,
        journalEntries,
        npcQuests,
        lastQuestsRefreshDate,
        playerGifts,
        playerVisitLogs,
        playerHorses,
        activeHorseRides,
        unlockedTackIds,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // ignore
    }
  }, [coins, gems, level, xp, lastDailyClaimDate, dailyStreak, barnCapacity, inventory, plots, animals, buildings, trees, orders, achievements, stats, neighbors, seasonMode, lastSeasonalSurpriseDate, purchasedDecorations, placedDecorations, journalEntries, npcQuests, lastQuestsRefreshDate, playerGifts, playerVisitLogs, playerHorses, activeHorseRides, unlockedTackIds]);

  // XP & Level-up system (Железный сброс в 0 через линейный IF)
const addXp = useCallback((amount: number) => {
  setXp((prevXp) => {
    const nextLevelRequirement = LEVEL_REQUIREMENTS[level] || level * 1000;
    const newTotal = prevXp + amount;

    // Если набрали достаточно опыта для ОДНОГО следующего уровня
    if (newTotal >= nextLevelRequirement) {
      const nextLvl = level + 1;
      
      // Меняем уровни и ресурсы напрямую
      setLevel(nextLvl);
      if (typeof setNewLevelUnlocked === 'function') setNewLevelUnlocked(nextLvl);
      setGems((g) => g + 3);
      setCoins((c) => c + nextLvl * 50);

      // Эффекты
      if (typeof sound?.playLevelUp === 'function') sound.playLevelUp();
      if (typeof vibrateLevelUp === 'function') vibrateLevelUp();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      showFloating(`Уровень ${nextLvl}! +3 💎 +${nextLvl * 50} 🪙`, 'text-emerald-300');

      // Запись в журнал
      const nowObj = new Date();
      setJournalEntries((prev) => [
        {
          id: `journal_lvl_${nextLvl}_${Date.now()}`,
          type: 'level_up',
          title: `Достигнут Уровень ${nextLvl}`,
          description: `Фермер достиг ${nextLvl}-го уровня мастерства! Награда: +3 💎, +${nextLvl * 50} 🪙.`,
          timestamp: nowObj.toISOString(),
          formattedDate: formatJournalDate(nowObj),
          icon: '🌟',
          badge: `Уровень ${nextLvl}`,
          levelNumber: nextLvl,
          rewardsSummary: `+3 💎, +${nextLvl * 50} 🪙`,
        },
        ...prev,
      ]);

      // ЖЕСТКИЙ СБРОС: Возвращаем ровно 0 на новом уровне, весь излишек сгорает
      return 0; 
    }

    // Если уровень не повысился, просто прибавляем опыт как обычно
    return newTotal;
  });
}, [level, showFloating]); // <-- Обязательно добавляем level в зависимости, так как мы убрали сложный setLevel(prev => ...)

  // Main 1-second game tick loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // Check plots ready state
      setPlots((prev) =>
        prev.map((plot) => {
          if (!plot.cropId || !plot.plantedAt) return plot;
          const crop = CROPS[plot.cropId];
          if (!crop) return plot;
          const speedMultiplier = getCropGrowthMultiplier(weather, plot.watered, plot.fertilized, plot.cropId, effectiveSeason);
          const requiredMs = (crop.growthTime * 1000) / speedMultiplier;
          // is ready if elapsed >= required
          return plot;
        })
      );

      // Check animals ready state
      setAnimals((prev) =>
        prev.map((anim) => {
          if (!anim.fedAt || anim.isReady) return anim;
          const cfg = ANIMALS[anim.type];
          if (!cfg) return anim;
          if (now - anim.fedAt >= cfg.cycleTime * 1000) {
            return { ...anim, isReady: true };
          }
          return anim;
        })
      );

      // Check buildings queue
      setBuildings((prev) =>
        prev.map((b) => {
          if (b.queue.length === 0) return b;
          const updatedQueue = b.queue.map((slot) => {
            if (slot.completed) return slot;
            if (now - slot.startedAt >= slot.duration * 1000) {
              return { ...slot, completed: true };
            }
            return slot;
          });
          return { ...b, queue: updatedQueue };
        })
      );

      // Check orchard trees
      setTrees((prev) =>
        prev.map((t) => {
          if (t.isReady) return t;
          if (now - t.lastHarvestedAt >= t.harvestTime * 1000) {
            return { ...t, isReady: true };
          }
          return t;
        })
      );

      // Check truck deliveries
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.status === 'delivering' && ord.deliveringUntil && now >= ord.deliveringUntil) {
            // Delivery done!
            setCoins((c) => c + ord.rewardCoins);
            addXp(ord.rewardXp);
            sound.playCoins();
            vibrateSuccess();
            showFloating(`+${ord.rewardCoins} 🪙 +${ord.rewardXp} XP от ${ord.customerName}!`, 'text-amber-300');
            setTruckDelivering(false);

            setStats((st) => ({
              ...st,
              totalOrdersDelivered: st.totalOrdersDelivered + 1,
              totalCoinsEarned: st.totalCoinsEarned + ord.rewardCoins,
            }));

            // Replace with a new order
            return generateOrder();
          }
          return ord;
        })
      );

      // Check active horse rides
      setActiveHorseRides((prev) =>
        prev.map((ride) => {
          if (ride.completed) return ride;
          if (now - ride.startedAt >= ride.durationMs) {
            sound.playHarvest();
            showFloating('Верховая прогулка завершена! 🐴 Нажмите забрать награды', 'text-amber-300');
            return { ...ride, completed: true };
          }
          return ride;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [addXp, generateOrder, showFloating]);

  // Weather & day cycle timer (every 60s switch weather with real bonuses)
  useEffect(() => {
    const weatherCycle: WeatherType[] = ['sunny', 'rain', 'rainbow', 'sunset', 'night'];
    const timer = setInterval(() => {
      setWeather((w) => {
        const nextIdx = (weatherCycle.indexOf(w) + 1) % weatherCycle.length;
        const next = weatherCycle[nextIdx];
        if (next === 'sunny') {
          showFloating('☀️ Яркое солнце: Скорость роста урожая +40%!', 'text-amber-300');
        } else if (next === 'rain') {
          showFloating('🌧️ Тёплый дождь: Автополив грядок и скорость +60%!', 'text-sky-300');
        } else if (next === 'rainbow') {
          showFloating('🌈 Радуга над фермой: Удвоенная скорость роста (2x)!', 'text-pink-300');
        } else if (next === 'sunset') {
          showFloating('🌅 Золотой закат: +25% бонусного опыта (XP) при сборе!', 'text-amber-200');
        } else if (next === 'night') {
          showFloating('✨ Звёздная ночь: Ночная роса и светлячки над полями!', 'text-indigo-200');
        }
        return next;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [showFloating]);

  // Auto-water if it's raining!
  useEffect(() => {
    if (weather === 'rain') {
      setPlots((prev) =>
        prev.map((p) => {
          if (p.cropId && !p.watered) {
            return { ...p, watered: true };
          }
          return p;
        })
      );
    }
  }, [weather]);

  // --- ACTIONS ---

  // 1. Plant crop
  const plantCrop = useCallback(
    (plotId: number) => {
      const plot = plots.find((p) => p.id === plotId);
      if (!plot || !plot.unlocked || plot.cropId) return;

      const crop = CROPS[selectedCropId];
      if (!crop) return;

      if (level < crop.minLevel) {
        showFloating(`Требуется уровень ${crop.minLevel}!`, 'text-red-400');
        sound.playTap();
        return;
      }

      if (coins < crop.cost) {
        showFloating('Недостаточно монет для семян!', 'text-red-400');
        sound.playTap();
        return;
      }

      setCoins((c) => c - crop.cost);
      setPlots((prev) =>
        prev.map((p) =>
          p.id === plotId
            ? {
                ...p,
                cropId: selectedCropId,
                plantedAt: Date.now(),
                watered: weather === 'rain',
                fertilized: false,
              }
            : p
        )
      );

      sound.playPlant();
      vibrateLight();
      showFloating(`-${crop.cost} 🪙 Посажено: ${crop.name}`);
    },
    [coins, level, plots, selectedCropId, showFloating, weather]
  );

  // 2. Water plot
  const waterPlot = useCallback(
    (plotId: number) => {
      const plot = plots.find((p) => p.id === plotId);
      if (!plot || !plot.unlocked || !plot.cropId || plot.watered) return;

      setPlots((prev) => prev.map((p) => (p.id === plotId ? { ...p, watered: true } : p)));
      sound.playWater();
      vibrateLight();
      showFloating('💧 Полит! Скорость +50%', 'text-sky-300');
    },
    [plots, showFloating]
  );

  // 3. Fertilize plot (uses 1 gem to instantly grow)
  const fertilizePlot = useCallback(
    (plotId: number) => {
      const plot = plots.find((p) => p.id === plotId);
      if (!plot || !plot.unlocked || !plot.cropId) return;

      if (gems < 1) {
        showFloating('Нужен 1 💎 кристал для удобрения!', 'text-red-400');
        return;
      }

      setGems((g) => g - 1);
      setPlots((prev) =>
        prev.map((p) =>
          p.id === plotId
            ? {
                ...p,
                fertilized: true,
                plantedAt: Date.now() - 9999999, // instant ready
              }
            : p
        )
      );

      sound.playHarvest();
      vibrateLight();
      showFloating('✨ Мгновенно созрело! (-1 💎)', 'text-emerald-300');
    },
    [gems, plots, showFloating]
  );

  // 4. Harvest plot
  const harvestPlot = useCallback(
    (plotId: number) => {
      const plot = plots.find((p) => p.id === plotId);
      if (!plot || !plot.cropId || !plot.plantedAt) return;

      const crop = CROPS[plot.cropId];
      if (!crop) return;

      // Check if growth finished with dynamic weather speed and seasonal bonuses
      const speed = getCropGrowthMultiplier(weather, plot.watered, plot.fertilized, plot.cropId, effectiveSeason);
      const neededMs = (crop.growthTime * 1000) / speed;
      const elapsed = Date.now() - plot.plantedAt;

      if (elapsed < neededMs) {
        const remainingSec = Math.ceil((neededMs - elapsed) / 1000);
        showFloating(`Созревает... ещё ${remainingSec}с`, 'text-amber-200');
        sound.playTap();
        return;
      }

      // Check barn space
      if (barnUsed >= barnCapacity) {
        showFloating('Амбар заполнен! Продайте или расширьте амбар', 'text-rose-400');
        sound.playTap();
        return;
      }

      // Harvested!
      const harvestYield = 2; // yields 2 crops per plot!
      setInventory((inv) => ({
        ...inv,
        [crop.id]: (inv[crop.id] || 0) + harvestYield,
      }));

      setPlots((prev) =>
        prev.map((p) =>
          p.id === plotId
            ? {
                ...p,
                cropId: null,
                plantedAt: null,
                watered: false,
                fertilized: false,
              }
            : p
        )
      );

      // Weather and Seasonal bonus XP
      const isSeasonMatch = crop.season && crop.season === effectiveSeason;
      const weatherMultiplier = weather === 'sunset' ? 1.25 : 1.0;
      const seasonMultiplier = isSeasonMatch ? 1.25 : 1.0;
      const earnedXp = Math.round(crop.xp * weatherMultiplier * seasonMultiplier);
      addXp(earnedXp);
      sound.playHarvest();
      vibrateSuccess();

      const xpNote = (weather === 'sunset' ? ' 🌅(+25% XP!)' : '') + (isSeasonMatch ? ' 🍂(+Сезон!)' : '');
      showFloating(`+${harvestYield} ${crop.emoji} ${crop.name} (+${earnedXp} XP${xpNote})`, 'text-emerald-300');

      setStats((st) => ({
        ...st,
        totalHarvested: st.totalHarvested + harvestYield,
      }));
    },
    [addXp, barnCapacity, barnUsed, effectiveSeason, plots, showFloating, weather]
  );

  // 5. Unlock plot
  const unlockPlot = useCallback(
    (plotId: number) => {
      const plot = plots.find((p) => p.id === plotId);
      if (!plot || plot.unlocked) return;

      if (level < plot.unlockLevel) {
        showFloating(`Требуется уровень ${plot.unlockLevel}!`, 'text-red-400');
        return;
      }

      if (coins < plot.unlockCost) {
        showFloating(`Нужно ${plot.unlockCost} 🪙 монет!`, 'text-red-400');
        return;
      }

      setCoins((c) => c - plot.unlockCost);
      setPlots((prev) => prev.map((p) => (p.id === plotId ? { ...p, unlocked: true } : p)));
      sound.playCoins();
      vibrateSuccess();
      showFloating(`Грядка #${plotId + 1} открыта! 🎉`, 'text-amber-300');
    },
    [coins, level, plots, showFloating]
  );

  // 6. Feed Animal
  const feedAnimal = useCallback(
    (animalId: string) => {
      const animal = animals.find((a) => a.id === animalId);
      if (!animal || animal.fedAt) return;

      const cfg = ANIMALS[animal.type];
      if (!cfg) return;

      const hasFood = (inventory[cfg.feedCropId] || 0) >= cfg.feedAmount;
      if (!hasFood) {
        const feedCrop = CROPS[cfg.feedCropId];
        showFloating(`Нужно ${cfg.feedAmount} ${feedCrop?.emoji} ${feedCrop?.name}!`, 'text-rose-400');
        sound.playTap();
        return;
      }

      // Consume food
      setInventory((inv) => ({
        ...inv,
        [cfg.feedCropId]: (inv[cfg.feedCropId] || 0) - cfg.feedAmount,
      }));

      setAnimals((prev) =>
        prev.map((a) => (a.id === animalId ? { ...a, fedAt: Date.now(), isReady: false } : a))
      );

      sound.playAnimalFeed();
      vibrateLight();
      showFloating(`Ням-ням! ${animal.type === 'chicken' ? 'Курочка сыта' : 'Животное сыто'} 🌾`);
    },
    [animals, inventory, showFloating]
  );

  // 7. Pet Animal (cute heart reaction)
  const petAnimal = useCallback(
    (animalId: string) => {
      sound.playAnimalCollect();
      vibrateLight();
      setAnimals((prev) =>
        prev.map((a) => (a.id === animalId ? { ...a, lastPetAt: Date.now() } : a))
      );
      showFloating('❤️ Животное счастливо! (+1 XP)', 'text-rose-300');
      addXp(1);
    },
    [addXp, showFloating]
  );

  // 8. Collect Animal Product
  const collectAnimalProduct = useCallback(
    (animalId: string) => {
      const animal = animals.find((a) => a.id === animalId);
      if (!animal || !animal.isReady) return;

      const cfg = ANIMALS[animal.type];
      if (!cfg) return;

      if (barnUsed >= barnCapacity) {
        showFloating('Амбар заполнен!', 'text-rose-400');
        sound.playTap();
        return;
      }

      setInventory((inv) => ({
        ...inv,
        [cfg.produceItemId]: (inv[cfg.produceItemId] || 0) + 1,
      }));

      setAnimals((prev) =>
        prev.map((a) => (a.id === animalId ? { ...a, fedAt: null, isReady: false } : a))
      );

      addXp(cfg.xp);
      sound.playAnimalCollect();
      vibrateSuccess();
      showFloating(`+1 ${cfg.produceEmoji} ${cfg.produceName} (+${cfg.xp} XP)`, 'text-amber-300');

      setStats((st) => ({
        ...st,
        totalAnimalProducts: st.totalAnimalProducts + 1,
      }));
    },
    [addXp, animals, barnCapacity, barnUsed, showFloating]
  );

  // 9. Buy new animal
  const buyAnimal = useCallback(
    (type: AnimalType) => {
      const cfg = ANIMALS[type];
      if (!cfg) return;

      if (level < cfg.minLevel) {
        showFloating(`Требуется уровень ${cfg.minLevel}!`, 'text-rose-400');
        return;
      }

      const currentCount = animals.filter((a) => a.type === type).length;
      if (currentCount >= cfg.maxPerPen) {
        showFloating(`Максимум в загоне: ${cfg.maxPerPen}!`, 'text-rose-400');
        return;
      }

      if (coins < cfg.purchaseCost) {
        showFloating(`Нужно ${cfg.purchaseCost} 🪙 монет!`, 'text-rose-400');
        return;
      }

      setCoins((c) => c - cfg.purchaseCost);
      const newAnimal: AnimalState = {
        id: `${type}_${Date.now()}`,
        type,
        fedAt: null,
        isReady: false,
        lastPetAt: null,
      };
      setAnimals((prev) => [...prev, newAnimal]);
      sound.playCoins();
      vibrateSuccess();
      showFloating(`Куплено: ${cfg.emoji} ${cfg.name}! 🎉`, 'text-emerald-300');
    },
    [animals, coins, level, showFloating]
  );

  // ==================== STABLES & HORSES METHODS ====================

  // Feed horse with treat
  const feedHorse = useCallback(
    (horseId: string, treatItemId: string) => {
      const horse = playerHorses.find((h) => h.id === horseId);
      if (!horse) return;

      const treat = HORSE_TREATS.find((t) => t.itemId === treatItemId);
      if (!treat) return;

      const stock = inventory[treatItemId] || 0;
      if (stock <= 0) {
        showFloating(`Нет ${treat.emoji} ${treat.name} в амбаре!`, 'text-rose-400');
        sound.playTap();
        return;
      }

      setInventory((inv) => ({
        ...inv,
        [treatItemId]: Math.max(0, (inv[treatItemId] || 0) - 1),
      }));

      setPlayerHorses((prev) =>
        prev.map((h) => {
          if (h.id !== horseId) return h;
          const newEnergy = Math.min(100, h.energy + treat.energyGain);
          let newBondXp = h.bondXp + treat.bondGain;
          let newBondLevel = h.bondLevel;

          const neededXp = newBondLevel * 60;
          if (newBondXp >= neededXp && newBondLevel < 10) {
            newBondXp -= neededXp;
            newBondLevel += 1;
            sound.playLevelUp();
            vibrateLevelUp();
            confetti({ particleCount: 50, spread: 60 });
            showFloating(`Уровень доверия вырос: ${newBondLevel}! 💖`, 'text-pink-300');
          }

          return {
            ...h,
            energy: newEnergy,
            bondXp: newBondXp,
            bondLevel: newBondLevel,
            lastFedAt: Date.now(),
          };
        })
      );

      sound.playSuccess();
      vibrateSuccess();
      showFloating(`+${treat.energyGain} ⚡ Энергии, +${treat.bondGain} 💖 Дружбы!`, 'text-amber-300');
    },
    [inventory, playerHorses, showFloating]
  );

  // Groom horse (brush & wash)
  const groomHorse = useCallback(
    (horseId: string) => {
      const horse = playerHorses.find((h) => h.id === horseId);
      if (!horse) return;

      setPlayerHorses((prev) =>
        prev.map((h) => {
          if (h.id !== horseId) return h;
          const newEnergy = Math.min(100, h.energy + 15);
          let newBondXp = h.bondXp + 20;
          let newBondLevel = h.bondLevel;

          const neededXp = newBondLevel * 60;
          if (newBondXp >= neededXp && newBondLevel < 10) {
            newBondXp -= neededXp;
            newBondLevel += 1;
            sound.playLevelUp();
            vibrateLevelUp();
            showFloating(`Уровень доверия вырос: ${newBondLevel}! 💖`, 'text-pink-300');
          }

          return {
            ...h,
            energy: newEnergy,
            bondXp: newBondXp,
            bondLevel: newBondLevel,
            lastGroomedAt: Date.now(),
          };
        })
      );

      addXp(25);
      sound.playSuccess();
      vibrateLight();
      showFloating(`Конь вычищен до блеска! ✨ +15 ⚡ +25 XP`, 'text-emerald-300');
    },
    [addXp, playerHorses, showFloating]
  );

  // Pet horse
  const petHorse = useCallback(
    (horseId: string) => {
      setPlayerHorses((prev) =>
        prev.map((h) => {
          if (h.id !== horseId) return h;
          let newBondXp = h.bondXp + 10;
          let newBondLevel = h.bondLevel;
          const neededXp = newBondLevel * 60;
          if (newBondXp >= neededXp && newBondLevel < 10) {
            newBondXp -= neededXp;
            newBondLevel += 1;
            sound.playLevelUp();
            vibrateLevelUp();
          }
          return {
            ...h,
            bondXp: newBondXp,
            bondLevel: newBondLevel,
          };
        })
      );
      sound.playTap();
      vibrateLight();
      showFloating('Лошадка ласково фыркает 💖 +10 доверия', 'text-pink-300');
    },
    [showFloating]
  );

  // Rename horse
  const renameHorse = useCallback(
    (horseId: string, newName: string) => {
      if (!newName.trim()) return;
      setPlayerHorses((prev) =>
        prev.map((h) => (h.id === horseId ? { ...h, customName: newName.trim() } : h))
      );
      showFloating(`Кличка обновлена: ${newName.trim()} 🐴`, 'text-amber-200');
    },
    [showFloating]
  );

  // Equip tack onto horse
  const equipTack = useCallback(
    (horseId: string, tackId: string) => {
      const tack = TACK_CATALOG.find((t) => t.id === tackId);
      if (!tack) return;

      setPlayerHorses((prev) =>
        prev.map((h) => {
          if (h.id !== horseId) return h;
          const currentEq = { ...h.equippedTack };
          if (currentEq[tack.category] === tackId) {
            delete currentEq[tack.category];
            showFloating(`Снято: ${tack.name}`, 'text-stone-300');
          } else {
            currentEq[tack.category] = tackId;
            sound.playSuccess();
            showFloating(`Надето: ${tack.name} ✨`, 'text-amber-300');
          }
          return { ...h, equippedTack: currentEq };
        })
      );
    },
    [showFloating]
  );

  // Buy tack item from tack shop
  const buyTack = useCallback(
    (tackId: string) => {
      const tack = TACK_CATALOG.find((t) => t.id === tackId);
      if (!tack) return;

      if (level < tack.minLevel) {
        showFloating(`Требуется уровень ${tack.minLevel}!`, 'text-rose-400');
        return;
      }

      if (tack.costCoins && coins < tack.costCoins) {
        showFloating(`Нужно ${tack.costCoins} 🪙 монет!`, 'text-rose-400');
        return;
      }
      if (tack.costGems && gems < tack.costGems) {
        showFloating(`Нужно ${tack.costGems} 💎 кристаллов!`, 'text-rose-400');
        return;
      }

      if (tack.costCoins) setCoins((c) => c - (tack.costCoins ?? 0));
      if (tack.costGems) setGems((g) => g - (tack.costGems ?? 0));

      setUnlockedTackIds((prev) => (prev.includes(tackId) ? prev : [...prev, tackId]));
      sound.playCoins();
      vibrateSuccess();
      showFloating(`Куплено: ${tack.emoji} ${tack.name}! 🎉`, 'text-amber-300');
    },
    [coins, gems, level, showFloating]
  );

  // Buy new horse breed
  const buyHorseBreed = useCallback(
    (breedId: HorseBreedId, customName?: string) => {
      const breed = HORSE_BREEDS[breedId];
      if (!breed) return;

      if (level < breed.minLevel) {
        showFloating(`Требуется уровень ${breed.minLevel}!`, 'text-rose-400');
        return;
      }

      if (breed.costCoins && coins < breed.costCoins) {
        showFloating(`Нужно ${breed.costCoins} 🪙 монет!`, 'text-rose-400');
        return;
      }
      if (breed.costGems && gems < breed.costGems) {
        showFloating(`Нужно ${breed.costGems} 💎 кристаллов!`, 'text-rose-400');
        return;
      }

      if (breed.costCoins) setCoins((c) => c - (breed.costCoins ?? 0));
      if (breed.costGems) setGems((g) => g - (breed.costGems ?? 0));

      const newHorse: PlayerHorse = {
        id: `horse_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        breedId,
        customName: customName?.trim() || breed.name,
        bondLevel: 1,
        bondXp: 0,
        energy: 100,
        maxEnergy: 100,
        lastGroomedAt: null,
        lastFedAt: null,
        equippedTack: {},
        totalRidesCompleted: 0,
        favoriteTreatItemId: 'apple',
      };

      setPlayerHorses((prev) => [...prev, newHorse]);
      sound.playLevelUp();
      vibrateLevelUp();
      confetti({ particleCount: 70, spread: 70 });
      showFloating(`Новый скакун в конюшне: ${newHorse.customName}! 🐴✨`, 'text-amber-300');
    },
    [coins, gems, level, showFloating]
  );

  // Start trail ride
  const startHorseRide = useCallback(
    (horseId: string, routeId: string) => {
      const horse = playerHorses.find((h) => h.id === horseId);
      if (!horse) return;

      const isAlreadyRiding = activeHorseRides.some((r) => r.horseId === horseId && !r.collected);
      if (isAlreadyRiding) {
        showFloating('Этот конь уже на верховой прогулке!', 'text-amber-400');
        return;
      }

      const route = RIDE_ROUTES.find((r) => r.id === routeId);
      if (!route) return;

      if (level < route.minPlayerLevel) {
        showFloating(`Требуется уровень фермера ${route.minPlayerLevel}!`, 'text-rose-400');
        return;
      }

      if (horse.bondLevel < route.minBondLevel) {
        showFloating(`Требуется доверие коня ур. ${route.minBondLevel}!`, 'text-rose-400');
        return;
      }

      const horseStats = calculateHorseStats(horse);
      const actualEnergyCost = Math.max(5, Math.round(route.energyCost * (1 - horseStats.energySavePercentBonus / 100)));

      if (horse.energy < actualEnergyCost) {
        showFloating(`Мало энергии! Нужно ${actualEnergyCost} ⚡ (У лошади: ${horse.energy} ⚡)`, 'text-rose-400');
        return;
      }

      setPlayerHorses((prev) =>
        prev.map((h) => (h.id === horseId ? { ...h, energy: h.energy - actualEnergyCost } : h))
      );

      const speedMultiplier = 1 + horseStats.speedPercentBonus / 100;
      const actualDurationMs = Math.round((route.durationSeconds * 1000) / speedMultiplier);

      const newRide: ActiveHorseRide = {
        id: `ride_${Date.now()}`,
        horseId,
        routeId,
        startedAt: Date.now(),
        durationMs: actualDurationMs,
        completed: false,
      };

      setActiveHorseRides((prev) => [...prev, newRide]);
      sound.playCoins();
      vibrateLight();
      showFloating(`Конь отправился в поход: ${route.name}! 🐎`, 'text-emerald-300');
    },
    [activeHorseRides, level, playerHorses, showFloating]
  );

  // Speed up trail ride with gems
  const speedUpHorseRide = useCallback(
    (rideId: string, gemCost: number) => {
      if (gems < gemCost) {
        showFloating(`Нужно ${gemCost} 💎 кристаллов!`, 'text-rose-400');
        return;
      }
      setGems((g) => g - gemCost);
      setActiveHorseRides((prev) =>
        prev.map((r) => (r.id === rideId ? { ...r, completed: true, startedAt: Date.now() - r.durationMs } : r))
      );
      sound.playSuccess();
      vibrateSuccess();
      showFloating('Скакун мгновенно вернулся с прогулки! ⚡', 'text-amber-300');
    },
    [gems, showFloating]
  );

  // Collect trail ride rewards
  const collectHorseRideReward = useCallback(
    (rideId: string) => {
      const ride = activeHorseRides.find((r) => r.id === rideId);
      if (!ride) return null;

      const route = RIDE_ROUTES.find((r) => r.id === ride.routeId);
      const horse = playerHorses.find((h) => h.id === ride.horseId);
      if (!route || !horse) return null;

      const horseStats = calculateHorseStats(horse);
      const rewardMultiplier = 1 + horseStats.rewardPercentBonus / 100;

      const rawCoins = Math.floor(Math.random() * (route.rewardMaxCoins - route.rewardMinCoins + 1)) + route.rewardMinCoins;
      const earnedCoins = Math.round(rawCoins * rewardMultiplier);
      const earnedXp = Math.round(route.rewardXp * (horse.breedId === 'arabian' ? 1.35 : 1.0));

      const luckMultiplier = 1 + horseStats.luckPercentBonus / 100;
      let earnedGems = 0;
      if (Math.random() < Math.min(1, route.rewardGemsChance * luckMultiplier)) {
        earnedGems = route.rewardGemsAmount || 1;
      }

      const droppedItems: { itemId: string; name: string; emoji: string; count: number }[] = [];
      const newInventory = { ...inventory };

      for (const drop of route.bonusDrops) {
        const effectiveChance = Math.min(1, drop.chance * (1 + horseStats.luckPercentBonus / 100));
        if (Math.random() < effectiveChance) {
          const count = horse.breedId === 'shire' ? drop.count * 2 : drop.count;
          newInventory[drop.itemId] = (newInventory[drop.itemId] || 0) + count;
          droppedItems.push({
            itemId: drop.itemId,
            name: drop.name,
            emoji: drop.emoji,
            count,
          });
        }
      }

      setCoins((c) => c + earnedCoins);
      if (earnedGems > 0) setGems((g) => g + earnedGems);
      setInventory(newInventory);
      addXp(earnedXp);

      setPlayerHorses((prev) =>
        prev.map((h) => {
          if (h.id !== horse.id) return h;
          let newBondXp = h.bondXp + 25;
          let newBondLevel = h.bondLevel;
          const neededXp = newBondLevel * 60;
          if (newBondXp >= neededXp && newBondLevel < 10) {
            newBondXp -= neededXp;
            newBondLevel += 1;
          }
          return {
            ...h,
            bondXp: newBondXp,
            bondLevel: newBondLevel,
            totalRidesCompleted: h.totalRidesCompleted + 1,
          };
        })
      );

      setActiveHorseRides((prev) => prev.filter((r) => r.id !== rideId));
      sound.playHarvest();
      vibrateSuccess();
      confetti({ particleCount: 60, spread: 60 });

      return {
        coins: earnedCoins,
        xp: earnedXp,
        gems: earnedGems,
        items: droppedItems,
        routeName: route.name,
        horseName: horse.customName,
      };
    },
    [activeHorseRides, addXp, inventory, playerHorses]
  );

  // 10. Start Crafting Recipe in Building
  const startCrafting = useCallback(
    (buildingId: BuildingId, recipeId: string) => {
      const building = buildings.find((b) => b.id === buildingId);
      if (!building || !building.unlocked) return;

      const recipe = RECIPES.find((r) => r.id === recipeId);
      if (!recipe) return;

      if (level < recipe.minLevel) {
        showFloating(`Требуется уровень ${recipe.minLevel}!`, 'text-rose-400');
        return;
      }

      if (building.queue.length >= building.maxSlots) {
        showFloating('Очередь производства заполнена!', 'text-rose-400');
        sound.playTap();
        return;
      }

      // Check ingredients
      for (const ing of recipe.ingredients) {
        if ((inventory[ing.itemId] || 0) < ing.count) {
          showFloating(`Не хватает ингредиентов!`, 'text-rose-400');
          sound.playTap();
          return;
        }
      }

      // Deduct ingredients
      setInventory((inv) => {
        const next = { ...inv };
        for (const ing of recipe.ingredients) {
          next[ing.itemId] = (next[ing.itemId] || 0) - ing.count;
        }
        return next;
      });

      const slot = {
        id: Math.random().toString(36).substring(2, 9),
        recipeId: recipe.id,
        startedAt: Date.now(),
        duration: recipe.craftTime,
        completed: false,
      };

      setBuildings((prev) =>
        prev.map((b) => (b.id === buildingId ? { ...b, queue: [...b.queue, slot] } : b))
      );

      sound.playPlant();
      vibrateLight();
      showFloating(`Готовится: ${recipe.emoji} ${recipe.name} ⏳`, 'text-amber-300');
    },
    [buildings, inventory, level, showFloating]
  );

  // 11. Collect Crafted item
  const collectCrafted = useCallback(
    (buildingId: BuildingId, slotId: string) => {
      const building = buildings.find((b) => b.id === buildingId);
      if (!building) return;

      const slot = building.queue.find((s) => s.id === slotId);
      if (!slot || !slot.completed) return;

      const recipe = RECIPES.find((r) => r.id === slot.recipeId);
      if (!recipe) return;

      if (barnUsed >= barnCapacity) {
        showFloating('Амбар полон! Освободите место', 'text-rose-400');
        sound.playTap();
        return;
      }

      setInventory((inv) => ({
        ...inv,
        [recipe.outputItemId]: (inv[recipe.outputItemId] || 0) + recipe.outputCount,
      }));

      setBuildings((prev) =>
        prev.map((b) =>
          b.id === buildingId ? { ...b, queue: b.queue.filter((s) => s.id !== slotId) } : b
        )
      );

      addXp(recipe.xp);
      sound.playHarvest();
      vibrateSuccess();
      showFloating(`Готово: +${recipe.outputCount} ${recipe.emoji} ${recipe.name}! (+${recipe.xp} XP)`, 'text-emerald-300');

      setStats((st) => ({
        ...st,
        totalCrafted: st.totalCrafted + recipe.outputCount,
      }));
    },
    [addXp, barnCapacity, barnUsed, buildings, showFloating]
  );

  // 12. Unlock Building
  const unlockBuilding = useCallback(
    (buildingId: BuildingId) => {
      const building = buildings.find((b) => b.id === buildingId);
      if (!building || building.unlocked) return;

      if (level < building.minLevel) {
        showFloating(`Требуется уровень ${building.minLevel}!`, 'text-rose-400');
        return;
      }

      if (coins < building.unlockCost) {
        showFloating(`Нужно ${building.unlockCost} 🪙 монет!`, 'text-rose-400');
        return;
      }

      setCoins((c) => c - building.unlockCost);
      setBuildings((prev) =>
        prev.map((b) => (b.id === buildingId ? { ...b, unlocked: true } : b))
      );

      sound.playCoins();
      vibrateSuccess();
      showFloating(`${building.name} построена! 🏗️🎉`, 'text-amber-300');
    },
    [buildings, coins, level, showFloating]
  );

  // 13. Deliver Order (send truck)
  const deliverOrder = useCallback(
    (orderId: string) => {
      if (truckDelivering) {
        showFloating('Грузовичок уже в пути!', 'text-amber-300');
        return;
      }

      const order = orders.find((o) => o.id === orderId);
      if (!order || order.status !== 'available') return;

      // Check requirements
      for (const req of order.requirements) {
        if ((inventory[req.itemId] || 0) < req.count) {
          showFloating('Не все товары есть на складе!', 'text-rose-400');
          sound.playTap();
          return;
        }
      }

      // Deduct items
      setInventory((inv) => {
        const next = { ...inv };
        for (const req of order.requirements) {
          next[req.itemId] = (next[req.itemId] || 0) - req.count;
        }
        return next;
      });

      // Start delivery animation
      setTruckDelivering(true);
      const deliveryDurationSec = 6;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'delivering',
                deliveringUntil: Date.now() + deliveryDurationSec * 1000,
              }
            : o
        )
      );

      sound.playTruck();
      vibrateSuccess();
      showFloating(`Грузовичок везёт заказ для ${order.customerName}! 🚚💨`, 'text-amber-300');
    },
    [inventory, orders, showFloating, truckDelivering]
  );

  // 14. Dismiss Order
  const dismissOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? generateOrder() : o)));
      sound.playTap();
      showFloating('Заказ обновлён 🔄');
    },
    [generateOrder, showFloating]
  );

  // 15. Pick Orchard Tree Fruit
  const harvestTree = useCallback(
    (treeId: string) => {
      const tree = trees.find((t) => t.id === treeId);
      if (!tree || !tree.isReady) {
        showFloating('Фрукты ещё созревают 🍏', 'text-amber-200');
        return;
      }

      if (barnUsed >= barnCapacity) {
        showFloating('Амбар заполнен!', 'text-rose-400');
        return;
      }

      setInventory((inv) => ({
        ...inv,
        [tree.fruitItemId]: (inv[tree.fruitItemId] || 0) + tree.count,
      }));

      setTrees((prev) =>
        prev.map((t) =>
          t.id === treeId
            ? { ...t, isReady: false, lastHarvestedAt: Date.now() }
            : t
        )
      );

      addXp(12);
      sound.playHarvest();
      vibrateSuccess();
      showFloating(`+${tree.count} ${tree.emoji} ${tree.fruitName} (+12 XP)`, 'text-emerald-300');
    },
    [addXp, barnCapacity, barnUsed, showFloating, trees]
  );

  // 16. Sell item directly from barn
  const sellItem = useCallback(
    (itemId: string, count: number = 1) => {
      const current = inventory[itemId] || 0;
      if (current < count) return;

      // Find price
      let unitPrice = 5;
      if (CROPS[itemId]) unitPrice = CROPS[itemId].sellPrice;
      const animMatch = Object.values(ANIMALS).find((a) => a.produceItemId === itemId);
      if (animMatch) unitPrice = animMatch.sellPrice;
      const recMatch = RECIPES.find((r) => r.outputItemId === itemId);
      if (recMatch) unitPrice = recMatch.sellPrice;
      if (itemId === 'apple') unitPrice = 14;
      if (itemId === 'cherry') unitPrice = 18;

      const earned = unitPrice * count;
      setInventory((inv) => ({
        ...inv,
        [itemId]: inv[itemId] - count,
      }));
      setCoins((c) => c + earned);
      sound.playCoins();
      vibrateLight();
      showFloating(`+${earned} 🪙 Продано x${count}!`, 'text-amber-300');
    },
    [inventory, showFloating]
  );

  // 17. Upgrade Barn Capacity
  const upgradeBarn = useCallback(() => {
    const cost = Math.floor(barnCapacity * 4.5);
    if (coins < cost) {
      showFloating(`Нужно ${cost} 🪙 монет для расширения!`, 'text-rose-400');
      return;
    }

    setCoins((c) => c - cost);
    setBarnCapacity((b) => b + 25);
    sound.playCoins();
    vibrateSuccess();
    showFloating(`Амбар расширен до ${barnCapacity + 25} мест! 🎒✨`, 'text-emerald-300');
  }, [barnCapacity, coins, showFloating]);

  // 18. Claim Achievement
  const claimAchievement = useCallback(
    (achId: string) => {
      const ach = achievements.find((a) => a.id === achId);
      if (!ach || ach.claimed) return;

      setAchievements((prev) =>
        prev.map((a) => (a.id === achId ? { ...a, claimed: true } : a))
      );
      setCoins((c) => c + ach.rewardCoins);
      setGems((g) => g + ach.rewardGems);
      sound.playLevelUp();
      vibrateSuccess();
      showFloating(`Награда: +${ach.rewardCoins} 🪙 +${ach.rewardGems} 💎!`, 'text-amber-300');
    },
    [achievements, showFloating]
  );

  // Check achievements progress dynamically
  useEffect(() => {
    setAchievements((prev) =>
      prev.map((ach) => {
        let val = 0;
        if (ach.id === 'harvest_1' || ach.id === 'harvest_2') val = stats.totalHarvested;
        if (ach.id === 'animals_1') val = stats.totalAnimalProducts;
        if (ach.id === 'orders_1') val = stats.totalOrdersDelivered;
        if (ach.id === 'baker_1') val = stats.totalCrafted;

        const isUnlocked = val >= ach.target;
        return {
          ...ach,
          current: val,
          unlocked: isUnlocked,
        };
      })
    );
  }, [stats]);

  // Helper for today's date
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const isDailyAvailable = lastDailyClaimDate !== getTodayDateStr();
  const isSeasonalSurpriseAvailable = lastSeasonalSurpriseDate !== getTodayDateStr();

  // 19. Claim Daily Reward
  const claimDailyReward = useCallback((): ClaimedRewardResult | null => {
    const todayStr = getTodayDateStr();
    if (lastDailyClaimDate === todayStr) {
      return null;
    }

    const currentDay = ((dailyStreak - 1) % 7) + 1;
    const tier = DAILY_REWARDS_CONFIG.find((t) => t.day === currentDay) || DAILY_REWARDS_CONFIG[0];

    const randomCoins = Math.floor(Math.random() * (tier.maxCoins - tier.minCoins + 1)) + tier.minCoins;
    const rewardGems = tier.gems || 0;

    let rewardResource: DailyRewardItem | undefined;
    if (tier.resource) {
      const count = Math.floor(Math.random() * (tier.resource.maxCount - tier.resource.minCount + 1)) + tier.resource.minCount;
      rewardResource = {
        id: tier.resource.itemId,
        name: tier.resource.name,
        emoji: tier.resource.emoji,
        count,
      };
    }

    // Apply rewards
    setCoins((c) => c + randomCoins);
    if (rewardGems > 0) {
      setGems((g) => g + rewardGems);
    }
    if (rewardResource) {
      setInventory((inv) => ({
        ...inv,
        [rewardResource.id]: (inv[rewardResource.id] || 0) + rewardResource.count,
      }));
    }

    setLastDailyClaimDate(todayStr);
    const nextStreak = currentDay >= 7 ? 1 : currentDay + 1;
    setDailyStreak(nextStreak);

    sound.playLevelUp();
    sound.playCoins();
    vibrateSuccess();

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.5 },
    });

    const resLabel = rewardResource ? ` +${rewardResource.count} ${rewardResource.emoji}` : '';
    showFloating(`Ежедневный бонус! +${randomCoins}🪙 ${rewardGems > 0 ? `+${rewardGems}💎` : ''}${resLabel}`, 'text-amber-300');

    setStats((st) => ({
      ...st,
      totalDailyRewardsClaimed: (st.totalDailyRewardsClaimed || 0) + 1,
      totalCoinsEarned: st.totalCoinsEarned + randomCoins,
    }));

    return {
      day: currentDay,
      coins: randomCoins,
      gems: rewardGems,
      resource: rewardResource,
    };
  }, [dailyStreak, lastDailyClaimDate, showFloating]);

  // 20. Buy surplus item from neighbor's roadside stall
  const buyFromNeighbor = useCallback((farmId: string, tradeItemId: string) => {
    const farm = neighbors.find((f) => f.id === farmId);
    if (!farm) return;
    const item = farm.sellItems.find((s) => s.id === tradeItemId);
    if (!item || item.sold) return;

    if (coins < item.price) {
      showFloating(`Не хватает монет! Нужно ${item.price} 🪙`, 'text-rose-400');
      sound.playTap();
      return;
    }

    if (barnUsed + item.count > barnCapacity) {
      showFloating('Амбар переполнен! Освободите место', 'text-rose-400');
      sound.playTap();
      return;
    }

    setCoins((c) => c - item.price);
    setInventory((inv) => ({
      ...inv,
      [item.itemId]: (inv[item.itemId] || 0) + item.count,
    }));

    setNeighbors((prev) =>
      prev.map((f) =>
        f.id === farmId
          ? {
              ...f,
              sellItems: f.sellItems.map((s) => (s.id === tradeItemId ? { ...s, sold: true } : s)),
            }
          : f
      )
    );

    addXp(10);
    sound.playCoins();
    vibrateLight();
    showFloating(`Куплено у соседа: +${item.count} ${item.emoji} ${item.name}!`, 'text-emerald-300');
  }, [barnCapacity, barnUsed, coins, neighbors, showFloating, addXp]);

  // 21. Sell surplus item to neighbor (satisfy neighbor's demand)
  const sellToNeighbor = useCallback((farmId: string, wantedItemId: string) => {
    const farm = neighbors.find((f) => f.id === farmId);
    if (!farm) return;
    const wanted = farm.buyItems.find((b) => b.id === wantedItemId);
    if (!wanted || wanted.fulfilled) return;

    const available = inventory[wanted.itemId] || 0;
    if (available < wanted.count) {
      showFloating(`Не хватает товара! Нужно ${wanted.count} шт.`, 'text-rose-400');
      sound.playTap();
      return;
    }

    setInventory((inv) => ({
      ...inv,
      [wanted.itemId]: inv[wanted.itemId] - wanted.count,
    }));

    setCoins((c) => c + wanted.rewardCoins);

    setNeighbors((prev) =>
      prev.map((f) =>
        f.id === farmId
          ? {
              ...f,
              buyItems: f.buyItems.map((b) => (b.id === wantedItemId ? { ...b, fulfilled: true } : b)),
            }
          : f
      )
    );

    addXp(15);
    sound.playCoins();
    vibrateSuccess();
    showFloating(`Продано соседу: +${wanted.rewardCoins} 🪙 (+15 XP)!`, 'text-amber-300');
    setStats((st) => ({
      ...st,
      totalCoinsEarned: st.totalCoinsEarned + wanted.rewardCoins,
    }));
  }, [inventory, neighbors, showFloating, addXp]);

  // 22. Help neighbor farm (water dry crops or pet animal)
  const helpNeighborFarm = useCallback((farmId: string) => {
    const farm = neighbors.find((f) => f.id === farmId);
    if (!farm || farm.helpedWaterToday) {
      showFloating('Вы уже помогли этому соседу сегодня!', 'text-amber-200');
      return;
    }

    const rewardBonusCoins = 25;
    const rewardBonusXp = 20;

    setCoins((c) => c + rewardBonusCoins);
    addXp(rewardBonusXp);

    setNeighbors((prev) =>
      prev.map((f) =>
        f.id === farmId
          ? {
              ...f,
              reputation: f.reputation + 2,
              helpedWaterToday: true,
            }
          : f
      )
    );

    sound.playWater();
    sound.playHarvest();
    vibrateSuccess();
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 },
    });
    showFloating(`Помощь соседу: +${rewardBonusCoins} 🪙 +${rewardBonusXp} XP ❤️`, 'text-rose-300');
  }, [neighbors, showFloating, addXp]);

  // 23. Add comment to neighbor's guestbook
  const addNeighborComment = useCallback((farmId: string, text: string) => {
    if (!text.trim()) return;

    const newComment: GuestbookComment = {
      id: Math.random().toString(36).substring(2, 9),
      author: 'Вы (Фермер)',
      avatar: '🧑‍🌾',
      text: text.trim(),
      timestamp: 'Только что',
      isPlayer: true,
    };

    setNeighbors((prev) =>
      prev.map((f) =>
        f.id === farmId
          ? {
              ...f,
              reputation: f.reputation + 1,
              guestbook: [newComment, ...f.guestbook],
            }
          : f
      )
    );

    addXp(5);
    sound.playHarvest();
    vibrateLight();
    showFloating('Отзыв оставлен в гостевой книге! (+5 XP)', 'text-emerald-300');
  }, [addXp, showFloating]);

  // 24. Refresh / Restock neighbor stalls
  const refreshNeighborStalls = useCallback(() => {
    setNeighbors((prev) =>
      prev.map((f) => {
        const initial = INITIAL_NEIGHBOR_FARMS.find((init) => init.id === f.id);
        if (!initial) return f;
        return {
          ...f,
          sellItems: initial.sellItems.map((s) => ({ ...s, sold: false })),
          buyItems: initial.buyItems.map((b) => ({ ...b, fulfilled: false })),
          helpedWaterToday: false,
        };
      })
    );
    sound.playTap();
    showFloating('Лавки соседей обновлены и пополнены! 🧺✨', 'text-amber-300');
  }, [showFloating]);

  // 24b. Send Gift to Neighbor or Real Player (Подарить подарок другу-фермеру)
  const sendGiftToNeighbor = useCallback(
    (
      farmId: string,
      giftType: 'seeds' | 'fertilizer' | 'coins' | 'gems' | 'pie',
      note: string,
      targetFarm?: NeighborFarm
    ): boolean => {
      const farm = targetFarm || neighbors.find((f) => f.id === farmId || f.uid === farmId);
      if (!farm) return false;

      // Deduct cost based on gift type
      if (giftType === 'coins') {
        if (coins < 50) {
          showFloating('Недостаточно монет для подарка (нужно 50 🪙)!', 'text-rose-400');
          sound.playError();
          return false;
        }
        setCoins((c) => c - 50);
      } else if (giftType === 'gems') {
        if (gems < 1) {
          showFloating('Недостаточно кристаллов (нужен 1 💎)!', 'text-rose-400');
          sound.playError();
          return false;
        }
        setGems((g) => g - 1);
      } else if (giftType === 'pie') {
        if ((inventory.strawberry_pie || 0) < 1) {
          showFloating('У вас нет клубничного пирога в амбаре!', 'text-rose-400');
          sound.playError();
          return false;
        }
        setInventory((inv) => ({ ...inv, strawberry_pie: inv.strawberry_pie - 1 }));
      }

      // If it's a local NPC farm, update local state
      if (!farm.isRealPlayer) {
        setNeighbors((prev) =>
          prev.map((f) =>
            f.id === farmId
              ? {
                  ...f,
                  reputation: f.reputation + 5,
                  guestbook: [
                    {
                      id: Math.random().toString(36).substring(2, 9),
                      author: 'Вы (Фермер)',
                      avatar: '🧑‍🌾',
                      text: `🎁 Отправил вам подарок: ${note || 'С наилучшими пожеланиями для фермы!'}`,
                      timestamp: 'Только что',
                      isPlayer: true,
                    },
                    ...f.guestbook,
                  ],
                }
              : f
          )
        );
      }

      addXp(30);
      sound.playLevelUp();
      vibrateSuccess();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      showFloating(`Подарок отправлен фермеру ${farm.ownerName}! (+30 XP, +5 Репутации) 🎁✨`, 'text-amber-300');
      return true;
    },
    [coins, gems, inventory, neighbors, addXp, showFloating]
  );

  // 24c. Claim received Gift from player gift box
  const claimPlayerGift = useCallback(
    (giftId: string, giftItem?: PlayerGift) => {
      const gift = giftItem || playerGifts.find((g) => g.id === giftId);
      if (!gift || gift.claimed) return;

      if (gift.giftType === 'coins') {
        setCoins((c) => c + gift.count);
      } else if (gift.giftType === 'gems') {
        setGems((g) => g + gift.count);
      } else if (gift.giftType === 'seeds') {
        setInventory((inv) => ({ ...inv, sunflower: (inv.sunflower || 0) + gift.count }));
      } else if (gift.giftType === 'fertilizer') {
        // Quick boost: fertilize dry plots or give wheat
        setInventory((inv) => ({ ...inv, wheat: (inv.wheat || 0) + gift.count * 2 }));
      } else if (gift.giftType === 'pie') {
        setInventory((inv) => ({ ...inv, strawberry_pie: (inv.strawberry_pie || 0) + gift.count }));
      }

      setPlayerGifts((prev) =>
        prev.map((g) => (g.id === giftId ? { ...g, claimed: true } : g))
      );

      sound.playCoins();
      vibrateSuccess();
      showFloating(`Подарок от ${gift.senderName} получен: ${gift.giftEmoji} ${gift.giftName}!`, 'text-emerald-300');
    },
    [playerGifts, showFloating]
  );

  // 24d. Claim thank-you reward from visitor log
  const claimVisitorBonus = useCallback(
    (logId: string) => {
      const log = playerVisitLogs.find((l) => l.id === logId);
      if (!log || log.rewardClaimed) return;

      setCoins((c) => c + 15);
      addXp(10);

      setPlayerVisitLogs((prev) =>
        prev.map((l) => (l.id === logId ? { ...l, rewardClaimed: true } : l))
      );

      sound.playHarvest();
      vibrateLight();
      showFloating(`Бонус взаимности от визита ${log.visitorName}: +15 🪙 +10 XP! ❤️`, 'text-rose-300');
    },
    [playerVisitLogs, addXp, showFloating]
  );

  // 25. Add Fishing & Butterfly Catch Reward
  const addFishingReward = useCallback((coinsEarned: number, xpEarned: number, gemsEarned?: number) => {
    setCoins((c) => c + coinsEarned);
    addXp(xpEarned);
    if (gemsEarned && gemsEarned > 0) {
      setGems((g) => g + gemsEarned);
    }
    const gemText = gemsEarned ? ` +${gemsEarned}💎` : '';
    showFloating(`Улов! +${coinsEarned}🪙 +${xpEarned}XP${gemText}`, 'text-amber-300');
    setStats((st) => ({
      ...st,
      totalCoinsEarned: st.totalCoinsEarned + coinsEarned,
    }));
  }, [addXp, showFloating]);

  // 26. Manually change / summon weather
  const changeWeather = useCallback((newWeather: WeatherType) => {
    setWeather(newWeather);
    const cfg = WEATHER_CONFIG[newWeather];
    if (cfg) {
      showFloating(`${cfg.icon} Погода: ${cfg.name}! ${cfg.bonusText}`, 'text-amber-300');
    }
    sound.playWater();
    vibrateLight();
  }, [showFloating]);

  // Interact with festive seasonal decorations (Surprise can be claimed only ONCE per day)
  const interactWithSeasonalDecoration = useCallback(
    (decorationId: string) => {
      const todayStr = getTodayDateStr();
      const isFirstTimeToday = lastSeasonalSurpriseDate !== todayStr;

      if (!isFirstTimeToday) {
        // Already claimed today: play fun tactile audio and visual feedback without giving extra loot
        vibrateLight();
        switch (decorationId) {
          case 'jack_o_lantern':
            sound.playSeasonalChime();
            showFloating('🎃 Огонёк в тыкве мерцает! Сюрприз дня уже получен (ждите завтра) ✨', 'text-amber-200');
            break;
          case 'scarecrow':
            sound.playLeafRustle();
            showFloating('🌾 Пугало приветливо машет шляпой! Сюрприз дня уже собран.', 'text-amber-200');
            break;
          case 'hay_bale':
            sound.playLeafRustle();
            showFloating('🍄 Золотистые снопы сена. Следующий сезонный сюрприз будет завтра!', 'text-amber-200');
            break;
          case 'snowman':
            sound.playSnowball();
            showFloating('⛄ Снеговик бросил снежок! Сюрприз дня уже получен ❄️', 'text-sky-200');
            break;
          case 'holiday_tree':
            sound.playSeasonalChime();
            showFloating('🎄 Ёлочка переливается огоньками! Сюрприз уже собран сегодня.', 'text-emerald-200');
            break;
          case 'ice_lantern':
            sound.playSeasonalChime();
            showFloating('🎁 Подарочная коробка пуста. Новый сюрприз прибудет завтра!', 'text-sky-200');
            break;
          case 'cherry_blossom':
            sound.playSeasonalChime();
            showFloating('🌸 Лепестки сакуры кружатся! Сюрприз дня уже забран.', 'text-pink-200');
            break;
          case 'birdhouse':
            sound.playBirdChirp();
            showFloating('🐦 Птички поют весеннюю песню! Сюрприз уже получен сегодня 🎶', 'text-emerald-200');
            break;
          case 'tulip_basket':
            sound.playSeasonalChime();
            showFloating('🌷 Весенний букет первоцветов. Ждите новый сюрприз завтра!', 'text-pink-200');
            break;
          case 'sunflower_stand':
            sound.playSeasonalChime();
            showFloating('🌻 Подсолнухи греются на солнце! Сюрприз дня уже получен ☀️', 'text-yellow-200');
            break;
          case 'watermelon_cart':
            sound.playTap();
            showFloating('🍉 Тележка со сладкими арбузами. Завтра будет новый подарок!', 'text-emerald-200');
            break;
          case 'bunting_flags':
            sound.playTap();
            showFloating('🎪 Ярмарка гудит! Приходите за новым сюрпризом завтра.', 'text-amber-200');
            break;
          default:
            sound.playTap();
            showFloating('✨ Сезонный сюрприз уже получен сегодня! Возвращайтесь завтра 🎁', 'text-amber-200');
            break;
        }
        return;
      }

      // First time today: grant the generous festive seasonal surprise once per day!
      setLastSeasonalSurpriseDate(todayStr);

      switch (decorationId) {
        case 'jack_o_lantern': {
          sound.playLevelUp();
          sound.playSeasonalChime();
          vibrateSuccess();
          setCoins((c) => c + 60);
          setGems((g) => g + 2);
          setInventory((inv) => ({ ...inv, pumpkin: (inv.pumpkin || 0) + 3 }));
          showFloating('🎁 Сезонный сюрприз дня! +60 🪙 +2 💎 +3 Тыквы (1 раз в день)', 'text-amber-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'scarecrow': {
          sound.playLevelUp();
          sound.playLeafRustle();
          vibrateSuccess();
          setCoins((c) => c + 60);
          setGems((g) => g + 2);
          setInventory((inv) => ({ ...inv, wheat: (inv.wheat || 0) + 5 }));
          showFloating('🎁 Сезонный сюрприз дня! +60 🪙 +2 💎 +5 Пшеницы (1 раз в день)', 'text-amber-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'hay_bale': {
          sound.playLevelUp();
          sound.playLeafRustle();
          vibrateSuccess();
          setCoins((c) => c + 75);
          setGems((g) => g + 2);
          showFloating('🎁 Сезонный сюрприз дня! +75 🪙 +2 💎 Грибы и яблоки (1 раз в день)', 'text-amber-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'snowman': {
          sound.playLevelUp();
          sound.playSnowball();
          vibrateSuccess();
          setCoins((c) => c + 60);
          setGems((g) => g + 2);
          setInventory((inv) => ({ ...inv, carrot: (inv.carrot || 0) + 4 }));
          showFloating('🎁 Зимний сюрприз от Снеговика! +60 🪙 +2 💎 +4 Моркови (1 раз в день)', 'text-sky-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'holiday_tree': {
          sound.playLevelUp();
          sound.playSeasonalChime();
          vibrateSuccess();
          setGems((g) => g + 3);
          setCoins((c) => c + 80);
          showFloating('🎁 Праздничный сюрприз с Ёлочки! +80 🪙 +3 💎 (1 раз в день)', 'text-emerald-300');
          confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
          break;
        }
        case 'ice_lantern': {
          sound.playLevelUp();
          sound.playSeasonalChime();
          vibrateSuccess();
          setCoins((c) => c + 75);
          setGems((g) => g + 2);
          showFloating('🎁 Зимний подарок открыт! +75 🪙 +2 💎 (1 раз в день)', 'text-sky-200');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'cherry_blossom': {
          sound.playLevelUp();
          sound.playSeasonalChime();
          vibrateSuccess();
          setCoins((c) => c + 60);
          setGems((g) => g + 2);
          addXp(60);
          showFloating('🎁 Весенний сюрприз Сакуры! +60 🪙 +2 💎 +60 XP (1 раз в день)', 'text-pink-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'birdhouse': {
          sound.playLevelUp();
          sound.playBirdChirp();
          vibrateSuccess();
          setCoins((c) => c + 60);
          setGems((g) => g + 2);
          setInventory((inv) => ({ ...inv, wheat: (inv.wheat || 0) + 4 }));
          showFloating('🎁 Скворечник подарил весенний сюрприз! +60 🪙 +2 💎 (1 раз в день)', 'text-emerald-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'tulip_basket': {
          sound.playLevelUp();
          sound.playSeasonalChime();
          vibrateSuccess();
          setCoins((c) => c + 75);
          setGems((g) => g + 2);
          showFloating('🎁 Весенний букет первоцветов! +75 🪙 +2 💎 (1 раз в день)', 'text-pink-200');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'sunflower_stand': {
          sound.playLevelUp();
          sound.playSeasonalChime();
          vibrateSuccess();
          setInventory((inv) => ({ ...inv, sunflower: (inv.sunflower || 0) + 3 }));
          setCoins((c) => c + 60);
          setGems((g) => g + 2);
          showFloating('🎁 Летний сюрприз подсолнухов! +60 🪙 +2 💎 +3 Подсолнуха (1 раз в день)', 'text-yellow-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'watermelon_cart': {
          sound.playLevelUp();
          sound.playTap();
          vibrateSuccess();
          setCoins((c) => c + 75);
          setGems((g) => g + 2);
          setInventory((inv) => ({ ...inv, watermelon: (inv.watermelon || 0) + 2 }));
          showFloating('🎁 Ярмарочный арбузный подарок! +75 🪙 +2 💎 +2 Арбуза (1 раз в день)', 'text-emerald-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        case 'bunting_flags': {
          sound.playLevelUp();
          sound.playTap();
          vibrateSuccess();
          setCoins((c) => c + 70);
          setGems((g) => g + 2);
          addXp(50);
          showFloating('🎁 Летний ярмарочный сюрприз! +70 🪙 +2 💎 +50 XP (1 раз в день)', 'text-amber-300');
          confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
          break;
        }
        default:
          sound.playTap();
          break;
      }
    },
    [addXp, lastSeasonalSurpriseDate, showFloating]
  );

  // Buy decoration from catalog
  const buyDecoration = useCallback((decorId: string) => {
    const item = DECORATIONS_CATALOG.find((d) => d.id === decorId);
    if (!item) return;

    if (purchasedDecorations.includes(decorId)) {
      showFloating('Уже в вашей коллекции!', 'text-amber-300');
      return;
    }

    if (level < item.minLevel) {
      sound.playError();
      showFloating(`Требуется уровень ${item.minLevel}!`, 'text-rose-400');
      return;
    }

    if (item.costCoins > 0 && coins < item.costCoins) {
      sound.playError();
      showFloating('Недостаточно монет 🪙!', 'text-rose-400');
      return;
    }

    if (item.costGems > 0 && gems < item.costGems) {
      sound.playError();
      showFloating('Недостаточно гемов 💎!', 'text-cyan-400');
      return;
    }

    // Deduct currency
    if (item.costCoins > 0) setCoins((c) => c - item.costCoins);
    if (item.costGems > 0) setGems((g) => g - item.costGems);

    setPurchasedDecorations((prev) => [...prev, decorId]);
    setPlacedDecorations((prev) => (prev.includes(decorId) ? prev : [...prev, decorId]));

    addXp(item.aestheticPoints * 2);

    if (item.rarity === 'legendary' || item.rarity === 'epic') {
      sound.playLevelUp();
      vibrateLevelUp();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } else {
      sound.playCoins();
      vibrateSuccess();
    }

    // Automatically record to Farmer's Journal
    const nowObj = new Date();
    const rarityLabel =
      item.rarity === 'legendary'
        ? 'Легендарное'
        : item.rarity === 'epic'
        ? 'Эпическое'
        : item.rarity === 'rare'
        ? 'Редкое'
        : 'Декор';

    setJournalEntries((prev) => [
      {
        id: `journal_buy_${decorId}_${Date.now()}`,
        type: 'rare_purchase',
        title: `Приобретение: ${item.name}`,
        description: `Коллекция поместья пополнилась ценным украшением: ${item.emoji} «${item.name}» (${rarityLabel}). Эстетика фермы возросла на +${item.aestheticPoints} ⭐. Спецэффект: ${item.perk}.`,
        timestamp: nowObj.toISOString(),
        formattedDate: formatJournalDate(nowObj),
        icon: item.emoji,
        badge: rarityLabel,
        decorId: item.id,
        decorName: item.name,
        rarity: item.rarity,
        rewardsSummary: `+${item.aestheticPoints} ⭐ Эстетики`,
      },
      ...prev,
    ]);

    showFloating(`Куплено: ${item.name}! +${item.aestheticPoints} ⭐ Эстетики`, 'text-amber-300');
  }, [addXp, coins, gems, level, purchasedDecorations, showFloating]);

  // Place or remove decoration from farm
  const togglePlaceDecoration = useCallback((decorId: string) => {
    const item = DECORATIONS_CATALOG.find((d) => d.id === decorId);
    if (!item) return;

    setPlacedDecorations((prev) => {
      const isPlaced = prev.includes(decorId);
      if (isPlaced) {
        sound.playTap();
        vibrateLight();
        showFloating(`${item.name} убран в хранилище`, 'text-stone-300');
        return prev.filter((id) => id !== decorId);
      } else {
        sound.playSeasonalChime();
        vibrateSuccess();
        showFloating(`${item.name} установлен на ферме! ✨`, 'text-emerald-300');
        return [...prev, decorId];
      }
    });
  }, [showFloating]);

  // Tap on placed decoration on the farm
  const interactWithPlacedDecoration = useCallback((decorId: string) => {
    const item = DECORATIONS_CATALOG.find((d) => d.id === decorId);
    if (!item) return;

    sound.playSeasonalChime();
    vibrateLight();
    showFloating(`${item.emoji} ${item.name}: ${item.perk}`, 'text-amber-200');
  }, [showFloating]);

  // Contribute inventory items to NPC quest objective
  const contributeToQuest = useCallback(
    (questId: string, objectiveId: string) => {
      const quest = npcQuests.find((q) => q.id === questId);
      if (!quest || quest.completed) return;

      const obj = quest.objectives.find((o) => o.id === objectiveId);
      if (!obj || !obj.itemId) return;

      const needed = Math.max(0, obj.targetCount - obj.currentCount);
      if (needed <= 0) return;

      // Determine candidate items in inventory (supports pie / strawberry_pie / apple_pie / pumpkin_pie)
      const candidateItemIds: string[] = obj.allowedItemIds && obj.allowedItemIds.length > 0
        ? obj.allowedItemIds
        : obj.itemId === 'pie'
        ? ['strawberry_pie', 'apple_pie', 'pumpkin_pie', 'pie']
        : [obj.itemId];

      // Find first available candidate with inventory > 0
      const availableItemId = candidateItemIds.find((id) => Boolean(inventory[id] && inventory[id] > 0));
      const available = availableItemId ? inventory[availableItemId] : 0;

      if (!availableItemId || available <= 0) {
        sound.playError();
        showFloating(`Не хватает ${obj.description}!`, 'text-rose-400');
        return;
      }

      const toDeliver = Math.min(needed, available);

      // Deduct from inventory
      setInventory((prev) => {
        const next = { ...prev };
        const remaining = (next[availableItemId] || 0) - toDeliver;
        if (remaining <= 0) {
          delete next[availableItemId];
        } else {
          next[availableItemId] = remaining;
        }
        return next;
      });

      // Update quest objective count
      setNpcQuests((prev) =>
        prev.map((q) => {
          if (q.id !== questId) return q;
          return {
            ...q,
            objectives: q.objectives.map((o) => {
              if (o.id !== objectiveId) return o;
              return { ...o, currentCount: o.currentCount + toDeliver };
            }),
          };
        })
      );

      sound.playCoins();
      vibrateLight();
      showFloating(`Сдано для квеста: +${toDeliver}!`, 'text-emerald-300');
    },
    [inventory, npcQuests, showFloating]
  );

  // Complete NPC quest and claim unique rewards & decor
  const completeNpcQuest = useCallback(
    (questId: string) => {
      const quest = npcQuests.find((q) => q.id === questId);
      if (!quest || quest.completed) return;

      // Ensure all objectives are done
      const allDone = quest.objectives.every((o) => o.currentCount >= o.targetCount);
      if (!allDone) {
        sound.playError();
        showFloating('Выполните все цели квеста!', 'text-rose-400');
        return;
      }

      // Mark completed
      const nowObj = new Date();
      setNpcQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, completed: true, completedAt: nowObj.toISOString() } : q))
      );

      // Grant rewards
      setCoins((c) => c + quest.rewards.coins);
      setGems((g) => g + quest.rewards.gems);
      addXp(quest.rewards.xp);

      // If quest grants unique decor item
      if (quest.rewards.decorItem) {
        const decorId = quest.rewards.decorItem.id;
        setPurchasedDecorations((prev) => (prev.includes(decorId) ? prev : [...prev, decorId]));
        setPlacedDecorations((prev) => (prev.includes(decorId) ? prev : [...prev, decorId]));
      }

      // Record in Farmer's Journal!
      const difficultyName =
        quest.difficulty === 'epic'
          ? 'Эпический подвиг'
          : quest.difficulty === 'master'
          ? 'Мастерское испытание'
          : 'Сложный квест';

      setJournalEntries((prev) => [
        {
          id: `journal_quest_${quest.id}_${Date.now()}`,
          type: 'quest_completed',
          title: `Выполнен квест: «${quest.title}»`,
          description: `Успешно исполнено ответственное поручение для ${quest.npcAvatar} ${quest.npcName} (${quest.npcRole}). Сложность: ${difficultyName}. Получена награда: +${quest.rewards.coins} 🪙, +${quest.rewards.gems} 💎, +${quest.rewards.xp} XP${
            quest.rewards.decorItem ? ` и эксклюзивный декор «${quest.rewards.decorItem.name}»` : ''
          }!`,
          timestamp: nowObj.toISOString(),
          formattedDate: formatJournalDate(nowObj),
          icon: quest.rewards.decorItem ? quest.rewards.decorItem.emoji : '📜',
          badge: difficultyName,
          questId: quest.id,
          npcName: quest.npcName,
          rewardsSummary: `+${quest.rewards.coins} 🪙, +${quest.rewards.gems} 💎, +${quest.rewards.xp} XP`,
        },
        ...prev,
      ]);

      // Celebrate
      sound.playLevelUp();
      vibrateLevelUp();
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
      });
      showFloating(`Квест «${quest.title}» триумфально завершён!`, 'text-amber-300');
    },
    [addXp, npcQuests, showFloating]
  );

  // Manual or Daily Refresh of NPC Quests (1 раз в день или по желанию игрока)
  const refreshNpcQuestsDaily = useCallback((force: boolean = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!force && lastQuestsRefreshDate === todayStr) {
      showFloating('Квесты уже обновлены на сегодня! 📜', 'text-amber-200');
      return false;
    }

    const refreshed = generateDailyQuestsRefresh(npcQuests);
    setNpcQuests(refreshed);
    setLastQuestsRefreshDate(todayStr);

    sound.playSeasonalChime();
    vibrateSuccess();
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
    showFloating('🌅 Новые ежедневные квесты от жителей долины!', 'text-emerald-300');
    return true;
  }, [lastQuestsRefreshDate, npcQuests, showFloating]);

  // Automatic daily refresh check on load / day change
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastQuestsRefreshDate && lastQuestsRefreshDate !== todayStr) {
      const refreshed = generateDailyQuestsRefresh(npcQuests);
      setNpcQuests(refreshed);
      setLastQuestsRefreshDate(todayStr);
    } else if (!lastQuestsRefreshDate) {
      setLastQuestsRefreshDate(todayStr);
    }
  }, [lastQuestsRefreshDate]);

  // Apply Cloud Save from Firestore
  const applyCloudSave = useCallback((data: CloudSavePayload) => {
    if (data.coins !== undefined) setCoins(data.coins);
    if (data.gems !== undefined) setGems(data.gems);
    if (data.level !== undefined) setLevel(data.level);
    if (data.xp !== undefined) setXp(data.xp);
    if (data.barnCapacity !== undefined) setBarnCapacity(data.barnCapacity);
    if (data.inventory) setInventory(data.inventory);
    if (data.plots) setPlots(data.plots);
    if (data.animals) setAnimals(data.animals);
    if (data.buildings) setBuildings(data.buildings);
    if (data.trees) setTrees(data.trees);
    if (data.orders && data.orders.length > 0) setOrders(data.orders);
    if (data.achievements) setAchievements(data.achievements);
    if (data.stats) setStats(data.stats);
    if (data.neighbors && data.neighbors.length > 0) setNeighbors(data.neighbors);
    if (data.seasonMode) setSeasonMode(data.seasonMode as SeasonMode);
    if (data.lastSeasonalSurpriseDate) setLastSeasonalSurpriseDate(data.lastSeasonalSurpriseDate);
    if (data.lastDailyClaimDate) setLastDailyClaimDate(data.lastDailyClaimDate);
    if (data.dailyStreak) setDailyStreak(data.dailyStreak);
    if (data.purchasedDecorations) setPurchasedDecorations(data.purchasedDecorations);
    if (data.placedDecorations) setPlacedDecorations(data.placedDecorations);
    if (data.journalEntries && data.journalEntries.length > 0) setJournalEntries(data.journalEntries);
    if (data.npcQuests && data.npcQuests.length > 0) {
      const migratedQuests: NpcQuest[] = data.npcQuests.map((q: NpcQuest) => ({
        ...q,
        objectives: q.objectives.map((o) => {
          if (o.itemId === 'pie' || o.id === 'obj_pie' || o.id === 'obj_pie_caravan') {
            return {
              ...o,
              itemId: 'strawberry_pie',
              allowedItemIds: ['strawberry_pie', 'apple_pie', 'pumpkin_pie', 'pie'],
              description:
                o.id === 'obj_pie_caravan'
                  ? 'Сдать пироги (клубничные, яблочные или праздничные тыквенные)'
                  : 'Сдать ароматные пироги (клубничный / яблочный / тыквенный)',
            };
          }
          return o;
        }),
      }));
      const existingIds = new Set(migratedQuests.map((q) => q.id));
      const newQuestsToAdd = INITIAL_NPC_QUESTS.filter((template) => !existingIds.has(template.id));
      setNpcQuests([...migratedQuests, ...newQuestsToAdd]);
    }
    if (data.lastQuestsRefreshDate) setLastQuestsRefreshDate(data.lastQuestsRefreshDate);
    if (data.playerGifts && data.playerGifts.length > 0) setPlayerGifts(data.playerGifts);
    if (data.playerVisitLogs && data.playerVisitLogs.length > 0) setPlayerVisitLogs(data.playerVisitLogs);
    showFloating('☁️ Прогресс загружен из облака!', 'text-emerald-300');
  }, [showFloating]);

  // Extract current state for cloud sync
  const getCloudSavePayload = useCallback((): CloudSavePayload => {
    return {
      coins,
      gems,
      level,
      xp,
      barnCapacity,
      inventory,
      plots,
      animals,
      buildings,
      trees,
      orders,
      achievements,
      stats,
      neighbors,
      seasonMode,
      lastDailyClaimDate,
      dailyStreak,
      lastSeasonalSurpriseDate,
      purchasedDecorations,
      placedDecorations,
      journalEntries,
      npcQuests,
      lastQuestsRefreshDate,
      playerGifts,
      playerVisitLogs,
    };
  }, [
    coins,
    gems,
    level,
    xp,
    barnCapacity,
    inventory,
    plots,
    animals,
    buildings,
    trees,
    orders,
    achievements,
    stats,
    neighbors,
    seasonMode,
    lastDailyClaimDate,
    dailyStreak,
    lastSeasonalSurpriseDate,
    purchasedDecorations,
    placedDecorations,
    journalEntries,
    npcQuests,
    lastQuestsRefreshDate,
    playerGifts,
    playerVisitLogs,
  ]);

  // Reset Game
  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  // Audio toggles
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabledState(next);
    sound.setSoundEnabled(next);
  };

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabledState(next);
    sound.setMusicEnabled(next);
  };

  return {
    coins,
    gems,
    level,
    xp,
    xpToNext: LEVEL_REQUIREMENTS[level] || level * 1000,
    newLevelUnlocked,
    setNewLevelUnlocked,
    dailyStreak,
    isDailyAvailable,
    lastDailyClaimDate,
    claimDailyReward,
    neighbors,
    playerGifts,
    setPlayerGifts,
    playerVisitLogs,
    setPlayerVisitLogs,
    showFloating,
    buyFromNeighbor,
    sellToNeighbor,
    helpNeighborFarm,
    addNeighborComment,
    refreshNeighborStalls,
    sendGiftToNeighbor,
    claimPlayerGift,
    claimVisitorBonus,
    plots,
    animals,
    buildings,
    trees,
    orders,
    inventory,
    barnCapacity,
    barnUsed,
    achievements,
    stats,
    activeTool,
    setActiveTool,
    selectedCropId,
    setSelectedCropId,
    weather,
    seasonMode,
    effectiveSeason,
    changeSeasonMode: setSeasonMode,
    interactWithSeasonalDecoration,
    isSeasonalSurpriseAvailable,
    lastSeasonalSurpriseDate,
    floatingTexts,
    truckDelivering,
    soundEnabled,
    musicEnabled,
    toggleSound,
    toggleMusic,
    plantCrop,
    waterPlot,
    fertilizePlot,
    harvestCrop: harvestPlot,
    unlockPlot,
    feedAnimal,
    petAnimal,
    collectAnimalProduct,
    buyAnimal,
    startCrafting,
    collectCrafted,
    unlockBuilding,
    deliverOrder,
    dismissOrder,
    harvestTree,
    sellItem,
    upgradeBarn,
    claimAchievement,
    addFishingReward,
    changeWeather,
    purchasedDecorations,
    placedDecorations,
    buyDecoration,
    togglePlaceDecoration,
    interactWithPlacedDecoration,
    journalEntries,
    npcQuests,
    contributeToQuest,
    completeNpcQuest,
    refreshNpcQuestsDaily,
    lastQuestsRefreshDate,
    applyCloudSave,
    getCloudSavePayload,
    resetGame,
    // Stables & Horses
    playerHorses,
    activeHorseRides,
    unlockedTackIds,
    feedHorse,
    groomHorse,
    petHorse,
    renameHorse,
    equipTack,
    buyTack,
    buyHorseBreed,
    startHorseRide,
    speedUpHorseRide,
    collectHorseRideReward,
  };
}
