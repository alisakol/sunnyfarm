import React from 'react';
import { Lock, Sparkles, Clock, Check, BookOpen } from 'lucide-react';
import { BuildingId, BuildingState } from '../types/game';
import { RECIPES, CROPS, ANIMALS, INITIAL_TREES } from '../utils/constants';

interface BuildingsViewProps {
  buildings: BuildingState[];
  inventory: Record<string, number>;
  coins: number;
  level: number;
  onStartCrafting: (buildingId: BuildingId, recipeId: string) => void;
  onCollectCrafted: (buildingId: BuildingId, slotId: string) => void;
  onUnlockBuilding: (buildingId: BuildingId) => void;
  onOpenRecipeBook?: () => void;
}

export const BuildingsView: React.FC<BuildingsViewProps> = ({
  buildings,
  inventory,
  coins,
  level,
  onStartCrafting,
  onCollectCrafted,
  onUnlockBuilding,
  onOpenRecipeBook,
}) => {
  const now = Date.now();

  return (
    /* ВАЖНО: Увеличен отступ снизу до pb-28, чтобы контент не перекрывался нижней панелью */
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-28 px-3">
      {/* Title Banner */}
      <div className="mt-2.5 mb-2.5 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-100 shadow-sm">
        <span className="font-bold text-amber-200 flex items-center gap-1.5">
          <span>🥖</span> Производство и Мастерские
        </span>
        {onOpenRecipeBook ? (
          <button
            onClick={onOpenRecipeBook}
            className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            title="Открыть Книгу Рецептов"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Книга Рецептов 📖</span>
          </button>
        ) : (
          <span className="text-[10px] text-emerald-300">
            Перерабатывайте сырьё в дорогую выпечку и товары!
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {buildings.map((building) => {
          const isUnlocked = building.unlocked;
          const buildingRecipes = RECIPES.filter((r) => r.buildingId === building.id);
          const canUnlock = coins >= building.unlockCost && level >= building.minLevel;

          if (!isUnlocked) {
            return (
              <div
                key={building.id}
                className="rounded-2xl border border-stone-800 bg-stone-900/80 p-3 shadow-md flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-xl text-stone-400">
                    <Lock className="w-5 h-5 text-stone-400" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-stone-200">{building.name}</h3>
                    <p className="text-[10px] text-stone-400">
                      Откроется на уровне {building.minLevel}
                    </p>
                  </div>
                </div>

                <button
                  disabled={!canUnlock}
                  onClick={() => onUnlockBuilding(building.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    canUnlock
                      ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-md active:scale-95'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  }`}
                >
                  Построить ({building.unlockCost} 🪙)
                </button>
              </div>
            );
          }

          return (
            <div
              key={building.id}
              className="rounded-2xl border border-emerald-700/70 bg-gradient-to-b from-amber-950/70 via-emerald-950/80 to-emerald-950/90 p-3 shadow-md"
            >
              {/* Building Header */}
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl ${building.id === 'windmill' ? 'animate-sway' : ''}`}>
                    {building.emoji}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{building.name}</span>
                    </h3>
                    <span className="text-[10px] text-emerald-300">
                      Очередь: {building.queue.length}/{building.maxSlots} слотов
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Queue Slots */}
              {building.queue.length > 0 && (
                <div className="mb-3 bg-emerald-950/70 border border-emerald-800/70 rounded-xl p-2">
                  <span className="text-[10px] font-bold text-amber-200 block mb-1.5 px-0.5">
                    Сейчас в производстве:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {building.queue.map((slot) => {
                      const recipe = RECIPES.find((r) => r.id === slot.recipeId);
                      if (!recipe) return null;

                      const totalMs = slot.duration * 1000;
                      const elapsed = now - slot.startedAt;
                      const percent = Math.min(100, Math.floor((elapsed / totalMs) * 100));
                      const remainingSec = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
                      const isFinished = slot.completed || elapsed >= totalMs;

                      return (
                        <div
                          key={slot.id}
                          className={`rounded-lg p-2 border flex flex-col justify-between ${
                            isFinished
                              ? 'bg-amber-900/40 border-amber-400 ring-1 ring-amber-400/50'
                              : 'bg-emerald-900/40 border-emerald-700/60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{recipe.emoji}</span>
                            <span className="text-[10px] font-bold text-white truncate max-w-[80px]">
                              {recipe.name}
                            </span>
                          </div>

                          <div className="my-1.5">
                            {isFinished ? (
                              <div className="flex items-center justify-center gap-1 text-[10px] font-extrabold text-amber-300 animate-pulse">
                                <Sparkles className="w-3 h-3" />
                                <span>ГОТОВО!</span>
                              </div>
                            ) : (
                              <div>
                                <div className="flex items-center justify-between text-[9px] text-emerald-200 mb-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{remainingSec}с</span>
                                </div>
                                <div className="w-full bg-emerald-950 rounded-full h-1 overflow-hidden">
                                  <div
                                    className="h-full bg-amber-400 transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {isFinished ? (
                            <button
                              onClick={() => onCollectCrafted(building.id, slot.id)}
                              className="w-full py-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-amber-950 font-extrabold rounded-md text-[10px] shadow-sm transition-transform active:scale-95 cursor-pointer"
                            >
                              Забрать +1
                            </button>
                          ) : (
                            <div className="text-[9px] text-center text-emerald-300/70 py-0.5">
                              Готовится...
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recipe Cards List */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-emerald-200 px-0.5">
                  Рецепты для приготовления:
                </span>
                {buildingRecipes.map((recipe) => {
                  const isRecipeUnlocked = level >= recipe.minLevel;
                  const queueFull = building.queue.length >= building.maxSlots;

                  let hasAllIngredients = true;
                  const ingredientsCheck = recipe.ingredients.map((ing) => {
                    const have = inventory[ing.itemId] || 0;
                    const ok = have >= ing.count;
                    if (!ok) hasAllIngredients = false;
                    return { ...ing, have, ok };
                  });

                  const canCraft = isRecipeUnlocked && !queueFull && hasAllIngredients;

                  return (
                    <div
                      key={recipe.id}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        !isRecipeUnlocked
                          ? 'bg-stone-900/40 border-stone-800 opacity-60'
                          : 'bg-emerald-950/60 border-emerald-800/60 hover:border-emerald-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-2xl shrink-0">{recipe.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {recipe.name}
                            </span>
                            <span className="text-[9px] text-amber-300 font-semibold shrink-0">
                              +{recipe.sellPrice}🪙
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px]">
                            {ingredientsCheck.map((ing, i) => {
                              let ingLabel = ing.itemId;
                              let ingEmoji = '📦';
                              if (CROPS[ing.itemId]) {
                                ingLabel = CROPS[ing.itemId].name;
                                ingEmoji = CROPS[ing.itemId].emoji;
                              } else if (ing.itemId === 'apple') {
                                ingLabel = 'Яблоки';
                                ingEmoji = '🍎';
                              } else if (ing.itemId === 'cherry') {
                                ingLabel = 'Вишня';
                                ingEmoji = '🍒';
                              } else {
                                const anim = Object.values(ANIMALS).find((a) => a.produceItemId === ing.itemId);
                                if (anim) {
                                  ingLabel = anim.produceName;
                                  ingEmoji = anim.produceEmoji;
                                } else {
                                  const r = RECIPES.find((rec) => rec.outputItemId === ing.itemId);
                                  if (r) {
                                    ingLabel = r.name;
                                    ingEmoji = r.emoji;
                                  }
                                }
                              }

                              return (
                                <span
                                  key={i}
                                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg ${
                                    ing.ok
                                      ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50'
                                      : 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                                  }`}
                                  title={`${ingLabel}: в наличии ${ing.have} из ${ing.count}`}
                                >
                                  <span>{ingEmoji}</span>
                                  <span className="font-medium truncate max-w-[90px]">{ingLabel}</span>
                                  <span className="font-mono font-bold">({ing.have}/{ing.count})</span>
                                </span>
                              );
                            })}
                            <span className="text-emerald-300/80 font-mono text-[9px] ml-0.5">· {recipe.craftTime}с</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {isRecipeUnlocked ? (
                          <button
                            disabled={!canCraft}
                            onClick={() => onStartCrafting(building.id, recipe.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              canCraft
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-95'
                                : 'bg-emerald-950/60 text-emerald-400/40 border border-emerald-800/40 cursor-not-allowed'
                            }`}
                          >
                            {queueFull ? 'Занято' : !hasAllIngredients ? 'Мало сырья' : 'Готовить'}
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">
                            Ур. {recipe.minLevel}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};