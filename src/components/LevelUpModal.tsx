import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CROPS, ANIMALS, RECIPES, INITIAL_BUILDINGS } from '../utils/constants';
import { HORSE_BREEDS, RIDE_ROUTES, TACK_CATALOG } from '../utils/stablesData';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, onClose }) => {
  // Find unlocks at this level
  const unlockedCrops = Object.values(CROPS).filter((c) => c.minLevel === level);
  const unlockedAnimals = Object.values(ANIMALS).filter((a) => a.minLevel === level);
  const unlockedBuildings = INITIAL_BUILDINGS.filter((b) => b.minLevel === level);
  const unlockedRecipes = RECIPES.filter((r) => r.minLevel === level);
  const unlockedBreeds = Object.values(HORSE_BREEDS).filter((b) => b.minLevel === level);
  const unlockedRoutes = RIDE_ROUTES.filter((r) => r.minPlayerLevel === level);
  const unlockedTack = TACK_CATALOG.filter((t) => t.minLevel === level);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-900 via-emerald-950 to-emerald-950 border-2 border-amber-400 p-5 shadow-2xl text-center relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Crown & Badge */}
        <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 flex items-center justify-center text-3xl font-game font-extrabold text-amber-950 shadow-lg border-2 border-white animate-bounce-mini">
          {level}
        </div>

        <h2 className="text-xl font-game font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span>НОВЫЙ УРОВЕНЬ!</span>
          <Sparkles className="w-5 h-5 text-yellow-300" />
        </h2>

        <p className="text-xs text-emerald-200 mt-1 mb-3">
          Поздравляем! Ваша ферма процветает и привлекает новых гостей!
        </p>

        {/* Level Bonus Box */}
        <div className="bg-emerald-900/60 border border-emerald-700/60 rounded-2xl p-2.5 mb-3 flex items-center justify-around">
          <div className="flex items-center gap-1 text-sm font-bold text-amber-300">
            <span>🪙</span>
            <span>+{level * 50} Монет</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-sky-300">
            <span>💎</span>
            <span>+3 Кристалла</span>
          </div>
        </div>

        {/* New Unlocked Items */}
        <div className="text-left bg-emerald-950/70 border border-emerald-800/70 rounded-2xl p-3 mb-4">
          <span className="text-xs font-bold text-amber-200 block mb-2">
            🔓 Открыто на {level} уровне:
          </span>

          <div className="flex flex-col gap-1.5 text-xs">
            {unlockedCrops.map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-white">
                <span className="text-lg">{c.emoji}</span>
                <span>Культура: <b>{c.name}</b></span>
              </div>
            ))}

            {unlockedAnimals.map((a) => (
              <div key={a.type} className="flex items-center gap-2 text-white">
                <span className="text-lg">{a.emoji}</span>
                <span>Животное: <b>{a.name}</b></span>
              </div>
            ))}

            {unlockedBuildings.map((b) => (
              <div key={b.id} className="flex items-center gap-2 text-white">
                <span className="text-lg">{b.emoji}</span>
                <span>Здание: <b>{b.name}</b></span>
              </div>
            ))}

            {unlockedRecipes.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-white">
                <span className="text-lg">{r.emoji}</span>
                <span>Рецепт: <b>{r.name}</b></span>
              </div>
            ))}

            {unlockedBreeds.map((b) => (
              <div key={b.id} className="flex items-center gap-2 text-white">
                <span className="text-lg">{b.emoji}</span>
                <span>Порода лошади: <b>{b.name}</b></span>
              </div>
            ))}

            {unlockedRoutes.map((rt) => (
              <div key={rt.id} className="flex items-center gap-2 text-white">
                <span className="text-lg">{rt.emoji}</span>
                <span>Верховой маршрут: <b>{rt.name}</b></span>
              </div>
            ))}

            {unlockedTack.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-white">
                <span className="text-lg">{t.emoji}</span>
                <span>Амуниция: <b>{t.name}</b></span>
              </div>
            ))}

            {unlockedCrops.length === 0 &&
              unlockedAnimals.length === 0 &&
              unlockedBuildings.length === 0 &&
              unlockedRecipes.length === 0 &&
              unlockedBreeds.length === 0 &&
              unlockedRoutes.length === 0 &&
              unlockedTack.length === 0 && (
                <div className="text-emerald-300 text-xs">
                  ✨ Открыты новые выгодные заказы на доске и расширение грядок!
                </div>
              )}
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-game font-extrabold text-sm rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Продолжить игру</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
