import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  Clock,
  Coins,
  Star,
  ChefHat,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  Check,
  Zap,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Recipe, BuildingId, BuildingState } from '../types/game';
import { RECIPES, INITIAL_BUILDINGS, CROPS, ANIMALS, INITIAL_TREES } from '../utils/constants';
import { sound } from '../utils/audio';

interface RecipeBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  inventory: Record<string, number>;
  buildings?: BuildingState[];
  onStartCrafting?: (buildingId: BuildingId, recipeId: string) => void;
  onGoToWorkshop: (buildingId: BuildingId) => void;
}

// Ingredient metadata mapping with Russian labels and source hints
const INGREDIENT_DETAILS: Record<
  string,
  { name: string; emoji: string; source: string }
> = {
  // Crops
  wheat: { name: 'Пшеница', emoji: '🌾', source: 'Грядки' },
  carrot: { name: 'Морковь', emoji: '🥕', source: 'Грядки' },
  corn: { name: 'Кукуруза', emoji: '🌽', source: 'Грядки' },
  strawberry: { name: 'Клубника', emoji: '🍓', source: 'Грядки' },
  pumpkin: { name: 'Тыква', emoji: '🎃', source: 'Грядки' },
  sunflower: { name: 'Подсолнух', emoji: '🌻', source: 'Грядки' },
  watermelon: { name: 'Арбуз', emoji: '🍉', source: 'Грядки' },
  hazelnut: { name: 'Лесной Фундук', emoji: '🌰', source: 'Осенние грядки' },
  lingonberry: { name: 'Брусника', emoji: '🫐', source: 'Лесные грядки' },
  winterberry: { name: 'Зимняя Ягода', emoji: '❄️', source: 'Зимние грядки' },
  pinecone: { name: 'Кедровая Шишка', emoji: '🌲', source: 'Лесные грядки' },
  tulip: { name: 'Тюльпаны', emoji: '🌷', source: 'Цветочные грядки' },
  green_peas: { name: 'Зелёный Горошек', emoji: '🫛', source: 'Грядки' },
  peach: { name: 'Сочный Персик', emoji: '🍑', source: 'Летние грядки' },
  bell_pepper: { name: 'Сладкий Перец', emoji: '🫑', source: 'Летние грядки' },
  grape: { name: 'Сладкий Виноград', emoji: '🍇', source: 'Осенние грядки' },
  eggplant: { name: 'Баклажан', emoji: '🍆', source: 'Летние грядки' },
  artichoke: { name: 'Артишок', emoji: '🥑', source: 'Весенние грядки' },
  pineapple: { name: 'Тропический Ананас', emoji: '🍍', source: 'Грядки' },
  golden_wheat: { name: 'Царская Пшеница', emoji: '🌾', source: 'Элитные грядки' },
  truffle_mushroom: { name: 'Белый Трюфель', emoji: '🍄', source: 'Лесные угодья' },
  lavender: { name: 'Горная Лаванда', emoji: '🪻', source: 'Лавандовые грядки' },
  dragonfruit: { name: 'Питахайя', emoji: '🐲', source: 'Тропические грядки' },
  starfruit: { name: 'Звёздная Карамбола', emoji: '⭐', source: 'Звёздные грядки' },

  // Animals & Trees
  egg: { name: 'Яйцо', emoji: '🥚', source: 'Курятник' },
  milk: { name: 'Парное Молоко', emoji: '🥛', source: 'Коровник' },
  wool: { name: 'Овечья Шерсть', emoji: '🧶', source: 'Овчарня' },
  honey: { name: 'Цветочный Мёд', emoji: '🍯', source: 'Пасека' },
  apple: { name: 'Спелые Яблоки', emoji: '🍎', source: 'Яблоневый сад' },
  cherry: { name: 'Вишня', emoji: '🍒', source: 'Вишнёвый сад' },

  // Artisan products used as ingredients
  flour: { name: 'Мука', emoji: '🌾', source: 'Мельница' },
  cornmeal: { name: 'Кукурузная Мука', emoji: '🌽', source: 'Мельница' },
  butter: { name: 'Сливочное Масло', emoji: '🧈', source: 'Сыроварня' },
  cream: { name: 'Свежие Сливки', emoji: '🥛', source: 'Сыроварня' },
  cheese: { name: 'Деревенский Сыр', emoji: '🧀', source: 'Сыроварня' },
};

export const RecipeBookModal: React.FC<RecipeBookModalProps> = ({
  isOpen,
  onClose,
  level,
  inventory,
  buildings = INITIAL_BUILDINGS,
  onStartCrafting,
  onGoToWorkshop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'craftable' | 'unlocked'>('all');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(RECIPES[0]?.id || 'bread');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Все рецепты', icon: '📖' },
    { id: 'bakery', label: 'Пекарня', icon: '🥐', buildingId: 'bakery' },
    { id: 'dairy', label: 'Сыроварня', icon: '🧀', buildingId: 'dairy' },
    { id: 'milling', label: 'Мельница', icon: '💨', buildingId: 'windmill' },
    { id: 'weaving', label: 'Ткацкий станок', icon: '🧵', buildingId: 'loom' },
    { id: 'preserves', label: 'Вареньеварня', icon: '🍯', buildingId: 'jam_maker' },
    { id: 'drinks', label: 'Соковарня', icon: '🧃', buildingId: 'juice_press' },
    { id: 'sweets', label: 'Кондитерская', icon: '🎂', buildingId: 'confectionery' },
  ];

  // Helper for ingredient metadata
  const getIngredientInfo = (id: string) => {
    if (INGREDIENT_DETAILS[id]) return INGREDIENT_DETAILS[id];

    if (CROPS[id]) {
      return { name: CROPS[id].name, emoji: CROPS[id].emoji, source: 'Грядки' };
    }
    const anim = Object.values(ANIMALS).find((a) => a.produceItemId === id);
    if (anim) {
      return { name: anim.produceName, emoji: anim.produceEmoji, source: anim.name };
    }
    const tree = INITIAL_TREES.find((t) => t.fruitItemId === id);
    if (tree) {
      return { name: tree.fruitName, emoji: tree.emoji, source: 'Фруктовый сад' };
    }
    const rec = RECIPES.find((r) => r.outputItemId === id);
    if (rec) {
      const b = INITIAL_BUILDINGS.find((bld) => bld.id === rec.buildingId);
      return { name: rec.name, emoji: rec.emoji, source: b?.name || 'Мастерская' };
    }
    return { name: id, emoji: '📦', source: 'Ферма' };
  };

  const filteredRecipes = useMemo(() => {
    return RECIPES.filter((r) => {
      // Category check
      if (selectedCategory !== 'all') {
        const matchesCategory =
          r.category === selectedCategory ||
          r.buildingId === selectedCategory ||
          (selectedCategory === 'milling' && r.buildingId === 'windmill') ||
          (selectedCategory === 'weaving' && r.buildingId === 'loom') ||
          (selectedCategory === 'preserves' && r.buildingId === 'jam_maker') ||
          (selectedCategory === 'drinks' && r.buildingId === 'juice_press') ||
          (selectedCategory === 'sweets' && r.buildingId === 'confectionery');
        if (!matchesCategory) return false;
      }

      // Filter mode check
      const isLevelUnlocked = level >= r.minLevel;
      const canCraft = r.ingredients.every(
        (ing) => (inventory[ing.itemId] || 0) >= ing.count
      );

      if (filterMode === 'craftable' && (!canCraft || !isLevelUnlocked)) return false;
      if (filterMode === 'unlocked' && !isLevelUnlocked) return false;

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesDesc = r.description?.toLowerCase().includes(q);
        const matchesIngredients = r.ingredients.some((ing) => {
          const info = getIngredientInfo(ing.itemId);
          return (
            info.name.toLowerCase().includes(q) ||
            ing.itemId.toLowerCase().includes(q)
          );
        });

        if (!matchesName && !matchesDesc && !matchesIngredients) return false;
      }

      return true;
    });
  }, [selectedCategory, filterMode, searchQuery, level, inventory]);

  if (!isOpen) return null;

  const selectedRecipe =
    RECIPES.find((r) => r.id === selectedRecipeId) ||
    filteredRecipes[0] ||
    RECIPES[0];

  const buildingConfig = INITIAL_BUILDINGS.find((b) => b.id === selectedRecipe.buildingId);
  const activeBuilding = buildings.find((b) => b.id === selectedRecipe.buildingId);
  const isBuildingUnlocked = activeBuilding?.unlocked ?? false;
  const isLevelUnlocked = level >= selectedRecipe.minLevel;

  const canCraftNow =
    isLevelUnlocked &&
    selectedRecipe.ingredients.every(
      (ing) => (inventory[ing.itemId] || 0) >= ing.count
    );

  const canQuickCraft =
    canCraftNow &&
    isBuildingUnlocked &&
    activeBuilding &&
    activeBuilding.queue.length < activeBuilding.maxSlots;

  // Stats counters for header
  const totalCraftable = RECIPES.filter(
    (r) =>
      level >= r.minLevel &&
      r.ingredients.every((ing) => (inventory[ing.itemId] || 0) >= ing.count)
  ).length;

  const totalUnlocked = RECIPES.filter((r) => level >= r.minLevel).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/70 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-600 to-amber-700 border border-amber-400 flex items-center justify-center text-2xl shadow-lg shadow-amber-900/30">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-game text-amber-200 leading-tight">
                  Старинная Книга Рецептов
                </h2>
                <span className="text-[10px] bg-amber-950/90 text-amber-300 px-2 py-0.5 rounded-full border border-amber-600/60 font-bold">
                  {RECIPES.length} рецептов
                </span>
                {totalCraftable > 0 && (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600/60 font-bold animate-pulse flex items-center gap-1">
                    <span>✨</span> {totalCraftable} готово к готовке!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                Мастерство выпечки, сыроварения, помола муки, ткачества, варенья и десертов
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="flex flex-col gap-2 my-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию блюда, сладости или ингредиенту (напр. клубника, мед)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950/90 border border-stone-800 text-xs text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/80 transition-colors"
              />
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1 shrink-0 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                onClick={() => {
                  sound.playTap();
                  setFilterMode('all');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  filterMode === 'all'
                    ? 'bg-amber-600 text-stone-950'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setFilterMode('craftable');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  filterMode === 'craftable'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
                title="Только рецепты с ингредиентами в наличии"
              >
                <span>🧺</span>
                <span>Готовы</span>
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setFilterMode('unlocked');
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  filterMode === 'unlocked'
                    ? 'bg-yellow-600 text-stone-950'
                    : 'text-yellow-400 hover:text-yellow-300'
                }`}
                title="Только доступные по уровню"
              >
                <span>🔓</span>
                <span>По уровню</span>
              </button>
            </div>
          </div>

          {/* Workshop Categories Scrolling Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playTap();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-md font-extrabold'
                      : 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:bg-stone-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area: Recipes List on Left, Detail Card on Right */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-12 gap-3 min-h-0">
          {/* Recipe List */}
          <div className="sm:col-span-5 overflow-y-auto no-scrollbar space-y-1.5 pr-1 max-h-[220px] sm:max-h-full">
            {filteredRecipes.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-stone-950/60 border border-stone-800 text-stone-400 text-xs">
                <span className="text-2xl block mb-2">🔍</span>
                <span className="font-bold text-amber-200 block mb-1">Ничего не найдено</span>
                <span className="text-[11px] text-stone-400">
                  Попробуйте изменить запрос или переключить фильтры.
                </span>
              </div>
            ) : (
              filteredRecipes.map((r) => {
                const isSelected = r.id === selectedRecipe.id;
                const isUnlocked = level >= r.minLevel;
                const hasIngredients = r.ingredients.every(
                  (ing) => (inventory[ing.itemId] || 0) >= ing.count
                );

                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      sound.playTap();
                      setSelectedRecipeId(r.id);
                    }}
                    className={`w-full p-2 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/25 to-emerald-950/70 border-amber-400 ring-1 ring-amber-400 shadow-md'
                        : 'bg-stone-950/70 border-stone-800 hover:border-amber-700/60 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl shrink-0 p-1 bg-stone-900/60 rounded-xl border border-stone-800/80">
                        {r.emoji}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {r.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-amber-300/80">
                            {isUnlocked ? `${r.craftTime} сек` : `Ур. ${r.minLevel}`}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {r.sellPrice}🪙
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isUnlocked ? (
                        <div className="flex items-center gap-1 text-[10px] text-stone-500 font-bold bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                          <Lock className="w-3 h-3 text-stone-500" />
                          <span>{r.minLevel}</span>
                        </div>
                      ) : hasIngredients ? (
                        <span
                          className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/80 text-[10px] font-bold flex items-center gap-1 animate-pulse"
                          title="Ингредиенты готовы к приготовлению!"
                        >
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Готово</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-mono">
                          +{r.xp}xp
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Recipe Detailed Showcase Card */}
          <div className="sm:col-span-7 bg-stone-950/90 border border-amber-700/60 rounded-2xl p-3 sm:p-4 flex flex-col justify-between overflow-y-auto no-scrollbar shadow-inner">
            <div>
              {/* Recipe Header */}
              <div className="flex items-start justify-between gap-2 border-b border-stone-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-950 via-stone-900 to-amber-900 border-2 border-amber-500/60 flex items-center justify-center text-3xl shadow-md">
                    {selectedRecipe.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-white leading-tight font-game">
                        {selectedRecipe.name}
                      </h3>
                      {!isLevelUnlocked ? (
                        <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-700/60 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> С уровня {selectedRecipe.minLevel}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded font-bold">
                          Доступен
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-amber-300/90 block mt-0.5">
                      Мастерская: {buildingConfig?.name || 'Производство'} {buildingConfig?.emoji}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right shrink-0">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{selectedRecipe.sellPrice} 🪙</span>
                  </span>
                  <span className="text-[10px] text-purple-300 flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-purple-400 fill-purple-400" />
                    <span>+{selectedRecipe.xp} XP</span>
                  </span>
                </div>
              </div>

              {/* Recipe Lore & Description */}
              <p className="text-xs text-stone-300/90 italic font-serif bg-black/30 p-2.5 rounded-xl border border-stone-800/80 mb-3 leading-relaxed">
                "{selectedRecipe.description || 'Традиционный изысканный деревенский продукт ручной работы.'}"
              </p>

              {/* Required Ingredients */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <span>🧺</span> Необходимые ингредиенты:
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {selectedRecipe.ingredients.every((ing) => (inventory[ing.itemId] || 0) >= ing.count)
                      ? '✅ Все в наличии'
                      : '⚠️ Не хватает компонентов'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedRecipe.ingredients.map((ing) => {
                    const haveCount = inventory[ing.itemId] || 0;
                    const hasEnough = haveCount >= ing.count;
                    const info = getIngredientInfo(ing.itemId);

                    return (
                      <div
                        key={ing.itemId}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          hasEnough
                            ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
                            : 'bg-stone-900 border-stone-800 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{info.emoji}</span>
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">
                              {info.name}
                            </span>
                            <span className="text-[10px] text-stone-400 block">
                              Источник: {info.source}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-mono font-bold text-xs ${
                              hasEnough ? 'text-emerald-300' : 'text-rose-400'
                            }`}
                          >
                            {haveCount} / {ing.count}
                          </span>
                          {hasEnough ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="text-[9px] text-rose-400 bg-rose-950/60 px-1 py-0.2 rounded border border-rose-800/60">
                              не хватает {ing.count - haveCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cooking Time Stats & Building Status */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-stone-400">Время готовки:</span>
                    <span className="font-bold text-white font-mono">{selectedRecipe.craftTime} сек</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-300 flex items-center gap-1.5">
                  <span className="text-base shrink-0">{buildingConfig?.emoji || '🏭'}</span>
                  <div>
                    <span className="block text-[10px] text-stone-400">Статус здания:</span>
                    <span className={`font-bold ${isBuildingUnlocked ? 'text-emerald-300' : 'text-amber-400'}`}>
                      {isBuildingUnlocked ? 'Построено' : 'Не построено'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Quick Craft or Jump to Workshop */}
            <div className="pt-2 border-t border-stone-800 space-y-2">
              {/* Quick Craft Button if workshop is unlocked & player has ingredients */}
              {canQuickCraft && onStartCrafting && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onStartCrafting(selectedRecipe.buildingId, selectedRecipe.id);
                  }}
                  className="w-full py-2.5 rounded-xl font-black text-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 text-stone-950"
                >
                  <Zap className="w-4 h-4 fill-stone-950 text-stone-950" />
                  <span>Приготовить прямо сейчас! ({selectedRecipe.emoji})</span>
                </button>
              )}

              {/* Jump to Workshop Button */}
              <button
                onClick={() => {
                  sound.playTap();
                  onGoToWorkshop(selectedRecipe.buildingId);
                  onClose();
                }}
                className={`w-full py-2 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                  !isBuildingUnlocked
                    ? 'bg-amber-600/90 hover:bg-amber-500 text-stone-950 border border-amber-400'
                    : canCraftNow
                    ? 'bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>
                  {!isBuildingUnlocked
                    ? `Построить «${buildingConfig?.name}» ➔`
                    : `Перейти в «${buildingConfig?.name}» ➔`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2.5 pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>
              В книге {RECIPES.length} рецептов • Доступно {totalUnlocked} • Готово к крафту: {totalCraftable}
            </span>
          </span>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="text-amber-300 hover:text-amber-200 font-bold cursor-pointer"
          >
            Закрыть [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
