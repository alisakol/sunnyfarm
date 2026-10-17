import React from 'react';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { AnimalConfig, AnimalState, AnimalType } from '../types/game';
import { ANIMALS, CROPS } from '../utils/constants';

interface AnimalsViewProps {
  animals: AnimalState[];
  inventory: Record<string, number>;
  coins: number;
  level: number;
  onFeedAnimal: (animalId: string) => void;
  onPetAnimal: (animalId: string) => void;
  onCollectProduct: (animalId: string) => void;
  onBuyAnimal: (type: AnimalType) => void;
  onOpenStables?: () => void;
}

export const AnimalsView: React.FC<AnimalsViewProps> = ({
  animals,
  inventory,
  coins,
  level,
  onFeedAnimal,
  onPetAnimal,
  onCollectProduct,
  onBuyAnimal,
  onOpenStables,
}) => {
  const now = Date.now();

  const animalGroups: AnimalType[] = ['chicken', 'cow', 'sheep', 'bee'];

  const getAnimalProgress = (animal: AnimalState, cfg: AnimalConfig) => {
    if (!animal.fedAt || animal.isReady) {
      return { percent: 100, remainingSec: 0, isReady: animal.isReady };
    }
    const totalMs = cfg.cycleTime * 1000;
    const elapsed = now - animal.fedAt;
    const percent = Math.min(100, Math.floor((elapsed / totalMs) * 100));
    const remainingSec = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));
    return { percent, remainingSec, isReady: elapsed >= totalMs };
  };

  return (
    /* ВАЖНО: Увеличен отступ снизу до pb-28 для фиксации под плавающей навигацией */
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-28 px-3">
      {/* Title Banner */}
      <div className="mt-2.5 mb-2.5 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-100 shadow-sm">
        <span className="font-bold text-amber-200 flex items-center gap-1.5">
          <span>🐾</span> Домашние Животные и Пасека
        </span>
        <span className="text-[10px] text-emerald-300">
          Кормите любимцев и собирайте ценные продукты!
        </span>
      </div>

      {/* Stables Shortcut Banner */}
      {onOpenStables && (
        <button
          onClick={onOpenStables}
          className="mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-emerald-950 border border-amber-500/60 flex items-center justify-between text-left hover:border-amber-400 transition-all cursor-pointer active:scale-98 shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐴</span>
            <div>
              <div className="text-xs font-bold text-amber-200">
                Конюшня «Серебряная Подкова»
              </div>
              <div className="text-[10px] text-emerald-300">
                Породы лошадей, верховые прогулки, уход и конная амуниция
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-1 rounded-xl border border-amber-600/50">
            В конюшню →
          </span>
        </button>
      )}

      <div className="flex flex-col gap-3">
        {animalGroups.map((type) => {
          const cfg = ANIMALS[type];
          const groupAnimals = animals.filter((a) => a.type === type);
          const isUnlocked = level >= cfg.minLevel;
          const feedCrop = CROPS[cfg.feedCropId];
          const feedStock = inventory[cfg.feedCropId] || 0;
          const canBuy = coins >= cfg.purchaseCost && groupAnimals.length < cfg.maxPerPen;

          return (
            <div
              key={type}
              className={`rounded-2xl border p-3 shadow-md transition-all ${
                !isUnlocked
                  ? 'bg-stone-900/60 border-stone-800 opacity-60'
                  : 'bg-gradient-to-b from-amber-950/70 via-emerald-950/80 to-emerald-950/90 border-emerald-700/70'
              }`}
            >
              {/* Pen Header */}
              <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cfg.emoji}</span>
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{cfg.name}</span>
                      <span className="text-[10px] font-normal text-emerald-300">
                        ({groupAnimals.length}/{cfg.maxPerPen})
                      </span>
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-amber-200">
                      <span>Продукт: {cfg.produceEmoji} {cfg.produceName}</span>
                      <span className="text-emerald-400">· Цикл: {cfg.cycleTime}с</span>
                    </div>
                  </div>
                </div>

                {/* Buy Button */}
                {isUnlocked ? (
                  <button
                    disabled={!canBuy}
                    onClick={() => onBuyAnimal(type)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      canBuy
                        ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-sm active:scale-95'
                        : 'bg-emerald-950/60 text-emerald-400/50 cursor-not-allowed border border-emerald-800/40'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{cfg.purchaseCost} 🪙</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-rose-300 bg-rose-950/60 border border-rose-800/50 px-2 py-0.5 rounded-lg">
                    Ур. {cfg.minLevel}
                  </span>
                )}
              </div>

              {/* Feed Crop Info Banner */}
              {isUnlocked && (
                <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-800/50 rounded-xl px-2.5 py-1 mb-2.5 text-[11px]">
                  <span className="text-emerald-200 flex items-center gap-1">
                    <span>Корм:</span>
                    <span className="font-bold text-white">{feedCrop?.emoji} {feedCrop?.name}</span>
                    <span className="text-emerald-400">({cfg.feedAmount} шт.)</span>
                  </span>
                  <span className={`font-bold ${feedStock >= cfg.feedAmount ? 'text-amber-300' : 'text-rose-400'}`}>
                    В наличии: {feedStock} шт.
                  </span>
                </div>
              )}

              {/* Animals in Pen */}
              {isUnlocked && groupAnimals.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {groupAnimals.map((animal, idx) => {
                    const prog = getAnimalProgress(animal, cfg);
                    const isReady = animal.isReady || prog.isReady;
                    const isEating = animal.fedAt && !isReady;
                    const isHungry = !animal.fedAt && !isReady;

                    return (
                      <div
                        key={animal.id}
                        className={`relative rounded-xl p-2.5 border flex flex-col justify-between transition-all ${
                          isReady
                            ? 'bg-gradient-to-b from-amber-600/30 to-amber-950/80 border-amber-400 ring-1 ring-amber-400/60 shadow-lg'
                            : 'bg-emerald-950/70 border-emerald-800/60'
                        }`}
                      >
                        {/* Top: Pet button & Animal Avatar */}
                        <div className="flex items-center justify-between mb-1">
                          <button
                            onClick={() => onPetAnimal(animal.id)}
                            className="p-1 rounded-full bg-rose-950/70 hover:bg-rose-900 border border-rose-600/50 text-rose-300 text-xs transition-transform active:scale-125 cursor-pointer"
                            title="Погладить (+1 XP)"
                          >
                            <Heart className="w-3 h-3 fill-rose-400 text-rose-400" />
                          </button>

                          <div className={`text-2xl ${isReady ? 'animate-bounce-mini' : isEating ? 'animate-sway' : ''}`}>
                            {cfg.emoji}
                          </div>

                          <span className="text-[10px] text-emerald-300 font-semibold">
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Status Label */}
                        <div className="my-1 text-center">
                          {isHungry && (
                            <span className="text-[10px] text-amber-300/90 font-medium">
                              Голоден...
                            </span>
                          )}
                          {isEating && (
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-emerald-200 font-semibold">
                                Кушает... {prog.remainingSec}с
                              </span>
                              <div className="w-full bg-emerald-950 rounded-full h-1 mt-1 overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 transition-all duration-300"
                                  style={{ width: `${prog.percent}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {isReady && (
                            <div className="flex items-center justify-center gap-1 text-[11px] font-extrabold text-amber-300 animate-pulse">
                              <Sparkles className="w-3 h-3" />
                              <span>ГОТОВО!</span>
                            </div>
                          )}
                        </div>

                        {/* Action Button: Feed or Collect */}
                        <div className="mt-1">
                          {isHungry && (
                            <button
                              onClick={() => onFeedAnimal(animal.id)}
                              className="w-full py-1 px-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-lg text-[10px] shadow-sm transition-transform active:scale-95 cursor-pointer"
                            >
                              Покормить (-{cfg.feedAmount})
                            </button>
                          )}
                          {isEating && (
                            <button
                              disabled
                              className="w-full py-1 px-1.5 bg-emerald-950/60 text-emerald-400/60 font-medium rounded-lg text-[10px] cursor-not-allowed border border-emerald-800/40"
                            >
                              Ожидание...
                            </button>
                          )}
                          {isReady && (
                            <button
                              onClick={() => onCollectProduct(animal.id)}
                              className="w-full py-1 px-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-extrabold rounded-lg text-[10px] shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                            >
                              <span>Собрать {cfg.produceEmoji}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : isUnlocked ? (
                <div className="text-center py-3 text-xs text-emerald-300 bg-emerald-950/40 rounded-xl border border-dashed border-emerald-800/60">
                  <span>Загон пуст. Нажмите кнопку выше, чтобы купить {cfg.name}!</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
