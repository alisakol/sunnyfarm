import React, { useMemo } from 'react';
import { SeasonId } from '../types/game';
import { SEASONS_CONFIG } from '../utils/seasonalData';

interface SeasonalDecorationsProps {
  season: SeasonId;
  isSurpriseAvailable: boolean;
  onInteractDecoration: (decorationId: string) => void;
}

export const SeasonalDecorations: React.FC<SeasonalDecorationsProps> = ({
  season,
  isSurpriseAvailable,
  onInteractDecoration,
}) => {
  const currentSeasonConfig = SEASONS_CONFIG[season];

  // Ambient floating particles based on season
  const seasonalParticles = useMemo(() => {
    const items =
      season === 'winter'
        ? ['❄️', '❅', '✨', '❄️']
        : season === 'autumn'
        ? ['🍂', '🍁', '🍃', '🍂']
        : season === 'spring'
        ? ['🌸', '🌺', '🌱', '🌸']
        : ['🌻', '✨', '🌾', '☀️'];

    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      char: items[i % items.length],
      left: `${(i * 7.2 + 4) % 94}%`,
      animationDelay: `${(i * 0.45).toFixed(2)}s`,
      duration: `${4 + (i % 4) * 1.2}s`,
      size: `${14 + (i % 3) * 4}px`,
      opacity: 0.5 + (i % 3) * 0.2,
    }));
  }, [season]);

  return (
    <div className="relative w-full select-none pointer-events-none">
      {/* 1. Ambient Floating Seasonal Particles Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {seasonalParticles.map((p) => (
          <div
            key={p.id}
            className="absolute top-0 animate-seasonal-fall filter drop-shadow-sm transition-all"
            style={{
              left: p.left,
              fontSize: p.size,
              opacity: p.opacity,
              animationDelay: p.animationDelay,
              animationDuration: p.duration,
            }}
          >
            {p.char}
          </div>
        ))}
      </div>

      {/* 2. Interactive Seasonal Centerpiece Props Bar */}
      <div className="relative z-20 pointer-events-auto px-1 py-1.5">
        <div className="rounded-2xl border bg-stone-950/70 backdrop-blur-xs p-2.5 shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-lg shrink-0">{currentSeasonConfig.icon}</span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-amber-200 block leading-tight truncate">
                  Сезонные декорации: {currentSeasonConfig.name}
                </span>
                <span className="text-[10px] text-stone-300 block truncate">
                  {isSurpriseAvailable
                    ? '🎁 Сюрприз дня готов! Нажмите (1 раз в день)'
                    : '✓ Сюрприз уже собран! Нажимайте для анимации.'}
                </span>
              </div>
            </div>
            <span
              className={`text-[9px] px-2 py-0.5 rounded-full font-bold border shrink-0 transition-colors ${
                isSurpriseAvailable
                  ? 'bg-amber-500 text-stone-950 border-amber-300 animate-pulse font-extrabold shadow'
                  : 'bg-stone-850 text-stone-400 border-stone-700'
              }`}
            >
              {isSurpriseAvailable ? '🎁 Сюрприз готов' : '✓ Взят сегодня'}
            </span>
          </div>

          {/* 3 Festive Interactive Props Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* AUTUMN PROPS */}
            {season === 'autumn' && (
              <>
                {/* 1. Jack-o-lantern */}
                <button
                  onClick={() => onInteractDecoration('jack_o_lantern')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-amber-900/60 via-stone-900/80 to-stone-950/90 border border-amber-600/60 hover:border-amber-400 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="relative text-3xl mb-1 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                    🎃
                    <span className="absolute -top-1 -right-1 text-xs animate-pulse">🔥</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-200 leading-tight">
                    Резные Тыквы
                  </span>
                  <span className="text-[8px] text-amber-300/80 mt-0.5 font-medium">
                    Свеча внутри
                  </span>
                </button>

                {/* 2. Scarecrow */}
                <button
                  onClick={() => onInteractDecoration('scarecrow')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-amber-900/60 via-stone-900/80 to-stone-950/90 border border-amber-600/60 hover:border-amber-400 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:rotate-6 group-hover:scale-110 transition-transform">
                    🌾
                  </div>
                  <span className="text-[10px] font-bold text-amber-200 leading-tight">
                    Пугало «Страшила»
                  </span>
                  <span className="text-[8px] text-amber-300/80 mt-0.5 font-medium">
                    Охраняет поле
                  </span>
                </button>

                {/* 3. Hay Bale & Mushrooms */}
                <button
                  onClick={() => onInteractDecoration('hay_bale')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-amber-900/60 via-stone-900/80 to-stone-950/90 border border-amber-600/60 hover:border-amber-400 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    🍄
                  </div>
                  <span className="text-[10px] font-bold text-amber-200 leading-tight">
                    Снопы и Грибы
                  </span>
                  <span className="text-[8px] text-amber-300/80 mt-0.5 font-medium">
                    Осенний сбор
                  </span>
                </button>
              </>
            )}

            {/* WINTER PROPS */}
            {season === 'winter' && (
              <>
                {/* 1. Snowman */}
                <button
                  onClick={() => onInteractDecoration('snowman')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-sky-900/60 via-stone-900/80 to-slate-950/90 border border-sky-400/60 hover:border-sky-300 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="relative text-3xl mb-1 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]">
                    ⛄
                    <span className="absolute -top-1 -right-1 text-xs">🧣</span>
                  </div>
                  <span className="text-[10px] font-bold text-sky-200 leading-tight">
                    Снеговик
                  </span>
                  <span className="text-[8px] text-sky-300/80 mt-0.5 font-medium">
                    Бросить снежок
                  </span>
                </button>

                {/* 2. Holiday Tree */}
                <button
                  onClick={() => onInteractDecoration('holiday_tree')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-sky-900/60 via-stone-900/80 to-slate-950/90 border border-sky-400/60 hover:border-sky-300 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]">
                    🎄
                  </div>
                  <span className="text-[10px] font-bold text-sky-200 leading-tight">
                    Нарядная Ёлка
                  </span>
                  <span className="text-[8px] text-sky-300/80 mt-0.5 font-medium">
                    Зимние огоньки
                  </span>
                </button>

                {/* 3. Ice Lantern & Gifts */}
                <button
                  onClick={() => onInteractDecoration('ice_lantern')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-sky-900/60 via-stone-900/80 to-slate-950/90 border border-sky-400/60 hover:border-sky-300 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    🎁
                  </div>
                  <span className="text-[10px] font-bold text-sky-200 leading-tight">
                    Зимний Подарок
                  </span>
                  <span className="text-[8px] text-sky-300/80 mt-0.5 font-medium">
                    Открыть коробку
                  </span>
                </button>
              </>
            )}

            {/* SPRING PROPS */}
            {season === 'spring' && (
              <>
                {/* 1. Cherry Blossom */}
                <button
                  onClick={() => onInteractDecoration('cherry_blossom')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-pink-900/60 via-stone-900/80 to-stone-950/90 border border-pink-400/60 hover:border-pink-300 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]">
                    🌸
                  </div>
                  <span className="text-[10px] font-bold text-pink-200 leading-tight">
                    Сакура в Цвету
                  </span>
                  <span className="text-[8px] text-pink-300/80 mt-0.5 font-medium">
                    Розовые лепестки
                  </span>
                </button>

                {/* 2. Birdhouse */}
                <button
                  onClick={() => onInteractDecoration('birdhouse')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-pink-900/60 via-stone-900/80 to-stone-950/90 border border-pink-400/60 hover:border-pink-300 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    🐦
                  </div>
                  <span className="text-[10px] font-bold text-pink-200 leading-tight">
                    Скворечник
                  </span>
                  <span className="text-[8px] text-pink-300/80 mt-0.5 font-medium">
                    Птичья трель
                  </span>
                </button>

                {/* 3. Tulip Basket */}
                <button
                  onClick={() => onInteractDecoration('tulip_basket')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-pink-900/60 via-stone-900/80 to-stone-950/90 border border-pink-400/60 hover:border-pink-300 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    🌷
                  </div>
                  <span className="text-[10px] font-bold text-pink-200 leading-tight">
                    Клумба Тюльпанов
                  </span>
                  <span className="text-[8px] text-pink-300/80 mt-0.5 font-medium">
                    Весенний букет
                  </span>
                </button>
              </>
            )}

            {/* SUMMER PROPS */}
            {season === 'summer' && (
              <>
                {/* 1. Watermelon Cart */}
                <button
                  onClick={() => onInteractDecoration('watermelon_cart')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-emerald-900/60 via-stone-900/80 to-stone-950/90 border border-emerald-500/60 hover:border-emerald-400 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    🍉
                  </div>
                  <span className="text-[10px] font-bold text-emerald-200 leading-tight">
                    Телега Арбузов
                  </span>
                  <span className="text-[8px] text-emerald-300/80 mt-0.5 font-medium">
                    Сладкая долька
                  </span>
                </button>

                {/* 2. Sunflowers */}
                <button
                  onClick={() => onInteractDecoration('sunflower_stand')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-amber-900/60 via-stone-900/80 to-stone-950/90 border border-amber-500/60 hover:border-amber-400 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform filter drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">
                    🌻
                  </div>
                  <span className="text-[10px] font-bold text-amber-200 leading-tight">
                    Подсолнухи
                  </span>
                  <span className="text-[8px] text-amber-300/80 mt-0.5 font-medium">
                    Золотые шапки
                  </span>
                </button>

                {/* 3. Bunting Flags */}
                <button
                  onClick={() => onInteractDecoration('bunting_flags')}
                  className="group relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-b from-amber-900/60 via-stone-900/80 to-stone-950/90 border border-amber-500/60 hover:border-amber-400 active:scale-95 transition-all cursor-pointer shadow-sm text-center"
                >
                  <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                    🎪
                  </div>
                  <span className="text-[10px] font-bold text-amber-200 leading-tight">
                    Ярмарка
                  </span>
                  <span className="text-[8px] text-amber-300/80 mt-0.5 font-medium">
                    Летний отдых
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Inline styles for seasonal falling animation */}
      <style>{`
        @keyframes seasonalFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(580px) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-seasonal-fall {
          animation: seasonalFall linear infinite;
        }
      `}</style>
    </div>
  );
};
