import React from 'react';
import { X, Sparkles, Calendar, Check, Compass } from 'lucide-react';
import { SeasonId, SeasonMode } from '../types/game';
import { SEASONS_CONFIG, getCalendarMonthName, getCalendarSeason } from '../utils/seasonalData';
import { CROPS } from '../utils/constants';

interface SeasonalModalProps {
  onClose: () => void;
  seasonMode: SeasonMode;
  effectiveSeason: SeasonId;
  onChangeSeasonMode: (mode: SeasonMode) => void;
}

export const SeasonalModal: React.FC<SeasonalModalProps> = ({
  onClose,
  seasonMode,
  effectiveSeason,
  onChangeSeasonMode,
}) => {
  const currentMonthName = getCalendarMonthName();
  const calendarSeason = getCalendarSeason();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 border border-amber-600/60 rounded-3xl p-4 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner">
              🎪
            </div>
            <div>
              <h3 className="font-extrabold text-base text-amber-200 leading-tight">
                Сезоны и Декорации
              </h3>
              <p className="text-[11px] text-stone-400">
                Календарь времен года на ферме
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Month & Real-world Season Status Banner */}
        <div className="my-3 p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border border-amber-600/40 shadow-inner flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-lg">
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-semibold block uppercase tracking-wider">
                Текущий календарный месяц
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5">
                {currentMonthName} • {SEASONS_CONFIG[calendarSeason].icon} {SEASONS_CONFIG[calendarSeason].name}
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
            Авто
          </span>
        </div>

        {/* Mode Selector Buttons */}
        <div className="mb-2">
          <span className="text-[11px] font-bold text-stone-300 block mb-1.5 px-0.5">
            Режим отображения декораций:
          </span>
          <button
            onClick={() => onChangeSeasonMode('auto')}
            className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer mb-2 ${
              seasonMode === 'auto'
                ? 'bg-amber-500/20 border-amber-400 text-amber-100 shadow-md ring-1 ring-amber-400/50'
                : 'bg-stone-900/90 border-stone-800 text-stone-300 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold block leading-tight">
                  Автоматически (по реальному календарю)
                </span>
                <span className="text-[10px] text-stone-400">
                  Меняется каждый месяц: сейчас {SEASONS_CONFIG[calendarSeason].name}
                </span>
              </div>
            </div>
            {seasonMode === 'auto' && <Check className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

        {/* 4 Seasons Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
          <span className="text-[11px] font-bold text-stone-300 block px-0.5">
            Или выберите сезон вручную для предпросмотра:
          </span>

          {(['autumn', 'winter', 'spring', 'summer'] as SeasonId[]).map((sId) => {
            const cfg = SEASONS_CONFIG[sId];
            const isSelected = seasonMode === sId;
            const isCurrentEffective = effectiveSeason === sId;

            return (
              <div
                key={sId}
                onClick={() => onChangeSeasonMode(sId)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-stone-900/60 border-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cfg.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{cfg.name}</span>
                        <span className="text-[9px] text-stone-400">({cfg.monthsName})</span>
                        {isCurrentEffective && (
                          <span className="text-[8px] bg-amber-500 text-stone-950 font-black px-1.5 rounded-full">
                            АКТИВЕН
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-300 font-medium">
                        {cfg.tagline}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>

                {/* Season bonus */}
                <div className="text-[10px] text-emerald-300 bg-emerald-950/50 border border-emerald-700/40 rounded-xl px-2 py-1 mb-1.5">
                  {cfg.bonusText}
                </div>

                {/* Seasonal crops badges */}
                <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                  <span className="text-[9px] text-amber-300/80 font-bold">🌱 Семена сезона:</span>
                  {Object.values(CROPS)
                    .filter((c) => c.season === sId)
                    .map((c) => (
                      <span
                        key={c.id}
                        className="text-[9px] bg-amber-950/80 border border-amber-600/50 text-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-1 font-bold shadow-xs"
                      >
                        <span>{c.emoji}</span>
                        <span>{c.name}</span>
                      </span>
                    ))}
                </div>

                {/* Props preview badges */}
                <div className="flex items-center gap-1.5">
                  {cfg.decorations.map((d) => (
                    <span
                      key={d.id}
                      className="text-[10px] bg-stone-950/80 border border-stone-700/60 px-1.5 py-0.5 rounded-lg text-stone-200 flex items-center gap-1"
                    >
                      <span>{d.emoji}</span>
                      <span className="truncate max-w-[80px]">{d.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="leading-tight">🎁 Сезонный сюрприз с фигурок выдается 1 раз в день!</span>
          </div>
          <button
            onClick={onClose}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer shrink-0 ml-2"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
