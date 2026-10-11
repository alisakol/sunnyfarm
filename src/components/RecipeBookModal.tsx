import React, { useState, useMemo } from 'react';
import { BookOpen, Sparkles, Clock, Coins, Star, ChefHat, CheckCircle2, Lock, ArrowRight, ExternalLink, Search } from 'lucide-react';
import { Recipe, BuildingId } from '../types/game';
import { RECIPES, INITIAL_BUILDINGS } from '../utils/constants';
import { sound } from '../utils/audio';

interface RecipeBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  inventory: Record<string, number>;
  onGoToWorkshop: (buildingId: BuildingId) => void;
}

export const RecipeBookModal: React.FC<RecipeBookModalProps> = ({
  isOpen,
  onClose,
  level,
  inventory,
  onGoToWorkshop,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'baking' | 'milling' | 'dairy' | 'weaving'>('all');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(RECIPES[0]?.id || 'bread');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'Все рецепты', icon: '📖' },
    { id: 'baking', label: 'Пекарня', icon: '🥐' },
    { id: 'dairy', label: 'Сыроварня', icon: '🧀' },
    { id: 'milling', label: 'Мельница', icon: '💨' },
    { id: 'weaving', label: 'Ткацкий станок', icon: '🧵' },
  ];

  const filteredRecipes = useMemo(() => {
    return RECIPES.filter((r) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        r.category === selectedCategory ||
        r.buildingId === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const selectedRecipe =
    RECIPES.find((r) => r.id === selectedRecipeId) ||
    filteredRecipes[0] ||
    RECIPES[0];

  const buildingConfig = INITIAL_BUILDINGS.find((b) => b.id === selectedRecipe.buildingId);

  // Check if player has all ingredients in inventory right now
  const canCraftNow = selectedRecipe.ingredients.every(
    (ing) => (inventory[ing.itemId] || 0) >= ing.count
  );

  const isLevelUnlocked = level >= selectedRecipe.minLevel;

  const getIngredientLabel = (id: string) => {
    if (id === 'flour') return '🌾 Мука';
    if (id === 'wheat') return '🌾 Пшеница';
    if (id === 'corn') return '🌽 Кукуруза';
    if (id === 'egg') return '🥚 Яйцо';
    if (id === 'milk') return '🥛 Молоко';
    if (id === 'wool') return '🧶 Шерсть';
    if (id === 'honey') return '🍯 Мёд';
    if (id === 'strawberry') return '🍓 Клубника';
    if (id === 'apple') return '🍎 Яблоки';
    if (id === 'pumpkin') return '🎃 Тыква';
    if (id === 'sunflower') return '🌻 Подсолнух';
    if (id === 'carrot') return '🥕 Морковь';
    if (id === 'butter') return '🧈 Сливочное Масло';
    if (id === 'cream') return '🥛 Свежие Сливки';
    if (id === 'cheese') return '🧀 Деревенский Сыр';
    return id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/70 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-amber-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-600 to-amber-700 border border-amber-400 flex items-center justify-center text-2xl shadow-lg">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-game text-amber-200 leading-tight">
                  Старинная Книга Рецептов
                </h2>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-600/60 font-bold">
                  {RECIPES.length} рецептов
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Секреты деревенской выпечки, сыроварения, помола и ткачества
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
          <div className="relative">
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию блюда или ингредиенту..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-950/90 border border-stone-800 text-xs text-amber-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/80 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playTap();
                  setSelectedCategory(cat.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-md font-extrabold'
                    : 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:bg-stone-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area: Recipes List on Left, Detail Card on Right */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 sm:grid-cols-12 gap-3 min-h-0">
          {/* Recipe List */}
          <div className="sm:col-span-5 overflow-y-auto no-scrollbar space-y-1.5 pr-1 max-h-[220px] sm:max-h-full">
            {filteredRecipes.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-stone-950/60 border border-stone-800 text-stone-400 text-xs">
                <span>🔍 По вашему запросу ничего не найдено</span>
              </div>
            ) : (
              filteredRecipes.map((r) => {
              const isSelected = r.id === selectedRecipe.id;
              const isUnlocked = level >= r.minLevel;
              const hasIngredients = r.ingredients.every((ing) => (inventory[ing.itemId] || 0) >= ing.count);

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
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl shrink-0">{r.emoji}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">
                        {r.name}
                      </span>
                      <span className="text-[10px] text-amber-300/80 block">
                        {isUnlocked ? `${r.craftTime} сек` : `Ур. ${r.minLevel}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-stone-500" />
                    ) : hasIngredients ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-200 animate-pulse" title="Ингредиенты готовы!" />
                    ) : (
                      <span className="text-[10px] text-stone-500 font-mono">
                        {r.sellPrice}🪙
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
                      {!isLevelUnlocked && (
                        <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-700/60 px-1.5 rounded font-bold">
                          С уровня {selectedRecipe.minLevel}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-amber-300/90 block mt-0.5">
                      Мастерская: {buildingConfig?.name || 'Производство'} {buildingConfig?.emoji}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end text-right">
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
              <p className="text-xs text-stone-300/90 italic font-serif bg-black/20 p-2.5 rounded-xl border border-stone-800/80 mb-3">
                "{selectedRecipe.description || 'Изысканный традиционный продукт ручной деревенской работы.'}"
              </p>

              {/* Required Ingredients */}
              <div className="mb-3">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <span>🧺</span> Необходимые ингредиенты:
                </span>
                <div className="space-y-1.5">
                  {selectedRecipe.ingredients.map((ing) => {
                    const haveCount = inventory[ing.itemId] || 0;
                    const hasEnough = haveCount >= ing.count;

                    return (
                      <div
                        key={ing.itemId}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                          hasEnough
                            ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
                            : 'bg-stone-900 border-stone-800 text-stone-400'
                        }`}
                      >
                        <span className="font-medium">
                          {getIngredientLabel(ing.itemId)}
                        </span>

                        <span className={`font-mono font-bold ${hasEnough ? 'text-emerald-300' : 'text-rose-400'}`}>
                          {haveCount} / {ing.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cooking Time Stats */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-300 mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Время изготовления:</span>
                </span>
                <span className="font-bold text-white font-mono">{selectedRecipe.craftTime} секунд</span>
              </div>
            </div>

            {/* Action Button: Jump to workshop to craft! */}
            <div className="pt-2 border-t border-stone-800">
              <button
                onClick={() => {
                  sound.playTap();
                  onGoToWorkshop(selectedRecipe.buildingId);
                  onClose();
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                  isLevelUnlocked
                    ? canCraftNow
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-stone-950'
                    : 'bg-stone-800 border border-stone-700 text-stone-500 cursor-not-allowed'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>
                  {!isLevelUnlocked
                    ? `Требуется уровень ${selectedRecipe.minLevel}`
                    : canCraftNow
                    ? `Готовить в «${buildingConfig?.name}» ➔`
                    : `Перейти в «${buildingConfig?.name}»`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-2.5 pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Приготовленные блюда приносят максимум золота и опыта на рынке и в заказах</span>
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
