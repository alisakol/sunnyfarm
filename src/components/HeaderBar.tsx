import React, { useRef, useState, useEffect } from 'react';
import { Settings, Sparkles, Cloud, BookOpen, Scroll, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import { SeasonId, WeatherType } from '../types/game';

interface HeaderBarProps {
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  gems: number;
  barnUsed: number;
  barnCapacity: number;
  weather: WeatherType;
  season: SeasonId;
  isDailyAvailable: boolean;
  user?: any;
  isSyncing?: boolean;
  journalCount?: number;
  availableQuestsCount?: number;
  incomingGiftsCount?: number;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenBarn: () => void;
  onOpenDailyRewards: () => void;
  onOpenSeason: () => void;
  onOpenJournal: () => void;
  onOpenQuests: () => void;
  onOpenInteractionsHub?: () => void;
  onOpenMap?: () => void;
  onOpenRecipeBook?: () => void;
  onOpenRealFriends?: () => void;
  onOpenStables?: () => void;
  onOpenTreasureHunt?: () => void;
  treasureHuntCount?: number;
  isTreasureHuntAvailable?: boolean;
  realFriendsCount?: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  level,
  xp,
  xpToNext,
  coins,
  gems,
  barnUsed,
  barnCapacity,
  weather,
  season,
  isDailyAvailable,
  user,
  isSyncing,
  journalCount = 0,
  availableQuestsCount = 0,
  incomingGiftsCount = 0,
  realFriendsCount = 0,
  onOpenAuth,
  onOpenSettings,
  onOpenBarn,
  onOpenDailyRewards,
  onOpenSeason,
  onOpenJournal,
  onOpenQuests,
  onOpenInteractionsHub,
  onOpenMap,
  onOpenRecipeBook,
  onOpenRealFriends,
  onOpenStables,
  onOpenTreasureHunt,
  treasureHuntCount = 0,
  isTreasureHuntAvailable = false,
}) => {
  const xpPercent = Math.min(100, Math.round((xp / (xpToNext || 1)) * 100));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -180 : 180;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const weatherIcons: Record<WeatherType, { icon: string; name: string }> = {
    sunny: { icon: '☀️', name: 'Ясно' },
    rain: { icon: '🌧️', name: 'Дождь' },
    rainbow: { icon: '🌈', name: 'Радуга' },
    sunset: { icon: '🌅', name: 'Закат' },
    night: { icon: '🌙', name: 'Ночь' },
  };

  const seasonIcons: Record<SeasonId, { icon: string; name: string }> = {
    autumn: { icon: '🍂', name: 'Осень' },
    winter: { icon: '❄️', name: 'Зима' },
    spring: { icon: '🌸', name: 'Весна' },
    summer: { icon: '☀️', name: 'Лето' },
  };

  const isBarnFull = barnUsed >= barnCapacity;

  return (
    <header className="w-full bg-emerald-950/95 backdrop-blur-md px-2 py-1.5 border-b border-emerald-700/60 shadow-md select-none shrink-0 z-20">
      {/* Scrollable Navigation Container */}
      <div className="relative flex items-center max-w-full">
        {/* Left Scroll Indicator Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 z-30 h-8 w-6 bg-gradient-to-r from-emerald-950 via-emerald-900/90 to-transparent flex items-center justify-start pl-0.5 text-amber-300 hover:text-white transition-opacity active:scale-95 cursor-pointer shadow-md rounded-l"
            title="Прокрутить влево"
            aria-label="Прокрутить влево"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
          </button>
        )}

        {/* Scrollable Items Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full py-0.5 px-0.5 touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Level & XP */}
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700/80 rounded-xl px-2 py-1 shadow-inner shrink-0">
            <div className="relative flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 flex items-center justify-center font-game font-bold text-amber-950 text-sm shadow-md border border-amber-200">
                {level}
              </div>
              <Sparkles className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 drop-shadow" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[10px] text-emerald-200 font-bold leading-tight">
                <span>УР. {level}</span>
                <span className="text-emerald-300 ml-1.5">{xp}/{xpToNext} XP</span>
              </div>
              <div className="w-16 sm:w-20 h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-700/60">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1 bg-amber-950/80 border border-amber-700/70 rounded-lg px-2 py-1 shadow-inner shrink-0">
            <span className="text-sm">🪙</span>
            <span className="font-game font-bold text-xs sm:text-sm text-amber-300 tracking-wide">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1 bg-sky-950/80 border border-sky-700/70 rounded-lg px-2 py-1 shadow-inner shrink-0">
            <span className="text-sm">💎</span>
            <span className="font-game font-bold text-xs sm:text-sm text-sky-300 tracking-wide">
              {gems}
            </span>
          </div>

          {/* Barn Capacity Button */}
          <button
            onClick={onOpenBarn}
            className={`flex items-center gap-1 border rounded-lg px-2 py-1 shadow-inner cursor-pointer transition-transform active:scale-95 shrink-0 ${
              isBarnFull
                ? 'bg-rose-950/85 border-rose-600 animate-pulse text-rose-300'
                : 'bg-emerald-950/80 border-emerald-700/70 text-emerald-200 hover:border-emerald-500'
            }`}
            title="Открыть амбар"
          >
            <span className="text-xs">🎒</span>
            <span className="font-semibold text-xs whitespace-nowrap">
              {barnUsed}/{barnCapacity}
            </span>
          </button>

          {/* Farmer's Journal Button */}
          <button
            onClick={onOpenJournal}
            className="relative px-2 py-1 rounded-lg bg-gradient-to-r from-[#3d200d] to-[#4e260e] hover:from-[#522d12] hover:to-[#633614] border border-[#8b4513] text-amber-200 shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
            title="Дневник Фермера (Хроника уровней, редких покупок и подвигов)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] font-bold text-amber-100 hidden xs:inline whitespace-nowrap">Дневник</span>
            {journalCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 border border-stone-900 animate-pulse" />
            )}
          </button>

          {/* Farm Map Button (Интерактивная карта поместья) */}
          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="relative px-2 py-1 rounded-lg bg-gradient-to-r from-teal-950/90 to-emerald-950/80 hover:from-teal-900 hover:to-emerald-900 border border-teal-500/60 text-teal-200 shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              title="Интерактивная карта фермы и сектора хозяйства"
            >
              <span className="text-xs leading-none">🗺️</span>
              <span className="text-[11px] font-bold text-teal-200 hidden xs:inline whitespace-nowrap">Карта</span>
            </button>
          )}

          {/* Treasure Hunt Button (Поиск сокровищ) */}
          {onOpenTreasureHunt && (
            <button
              onClick={onOpenTreasureHunt}
              className={`relative px-2 py-1 rounded-lg border shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 ${
                isTreasureHuntAvailable
                  ? 'bg-gradient-to-r from-[#4a2608] via-[#63330b] to-[#4a2608] border-amber-400 text-amber-200 hover:border-amber-300 ring-1 ring-amber-400/50'
                  : 'bg-amber-950/70 border-amber-800/60 text-amber-300 hover:border-amber-500'
              }`}
              title="Поиск сокровищ: ежедневные 5 сундуков, компас-радар и древние реликвии"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-200 hidden xs:inline whitespace-nowrap">Сокровища</span>
              {treasureHuntCount < 5 ? (
                <span className="min-w-[14px] h-3.5 px-1 rounded-full bg-amber-500 text-[9px] font-bold text-stone-950 flex items-center justify-center border border-white leading-none shadow-xs font-mono">
                  {5 - treasureHuntCount}
                </span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-bold">✓</span>
              )}
              {isTreasureHuntAvailable && (
                <span className="w-2 h-2 rounded-full bg-amber-400 border border-stone-900 animate-ping" />
              )}
            </button>
          )}

          {/* NPC Quests Button */}
          <button
            onClick={onOpenQuests}
            className="relative px-2 py-1 rounded-lg bg-gradient-to-r from-purple-950/90 to-amber-950/80 hover:from-purple-900 hover:to-amber-900 border border-purple-500/60 text-amber-200 shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
            title="Сложные квесты от NPC & Поручения"
          >
            <Scroll className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-[11px] font-bold text-purple-200 hidden xs:inline whitespace-nowrap">Квесты</span>
            {availableQuestsCount > 0 && (
              <span className="min-w-[14px] h-3.5 px-1 rounded-full bg-purple-600 text-[9px] font-bold text-white flex items-center justify-center border border-white leading-none shadow-xs">
                {availableQuestsCount}
              </span>
            )}
          </button>

          {/* Recipe Book Button */}
          {onOpenRecipeBook && (
            <button
              onClick={onOpenRecipeBook}
              className="relative px-2 py-1 rounded-lg bg-gradient-to-r from-amber-950/90 to-orange-950/80 hover:from-amber-900 hover:to-orange-900 border border-amber-500/60 text-amber-200 shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              title="Старинная книга рецептов & Справочник мастерских"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] font-bold text-amber-200 hidden xs:inline whitespace-nowrap">Рецепты</span>
            </button>
          )}

          {/* Real Google Friends Button */}
          {onOpenRealFriends && (
            <button
              onClick={onOpenRealFriends}
              className="relative px-2 py-1 rounded-lg bg-gradient-to-r from-sky-950/90 to-teal-950/80 hover:from-sky-900 hover:to-teal-900 border border-sky-500/60 text-sky-200 shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              title="Реальные игроки через Google: поиск и список друзей"
            >
              <span className="text-xs leading-none">👥</span>
              <span className="text-[11px] font-bold text-sky-200 hidden xs:inline whitespace-nowrap">Игроки (Google)</span>
              {realFriendsCount > 0 && (
                <span className="min-w-[14px] h-3.5 px-1 rounded-full bg-sky-500 text-[9px] font-bold text-stone-950 flex items-center justify-center border border-white leading-none shadow-xs font-mono">
                  {realFriendsCount}
                </span>
              )}
            </button>
          )}

          {/* Player Interactions / Gifts Hub Button */}
          {onOpenInteractionsHub && (
            <button
              onClick={onOpenInteractionsHub}
              className="relative px-2 py-1 rounded-lg bg-gradient-to-r from-rose-950/90 to-amber-950/80 hover:from-rose-900 hover:to-amber-900 border border-rose-500/60 text-rose-200 shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
              title="Взаимодействие игроков: подарки от друзей и журнал гостей"
            >
              <span className="text-xs leading-none">🤝</span>
              <span className="text-[11px] font-bold text-rose-200 hidden xs:inline whitespace-nowrap">Друзья</span>
              {incomingGiftsCount > 0 && (
                <span className="min-w-[14px] h-3.5 px-1 rounded-full bg-rose-600 text-[9px] font-bold text-white flex items-center justify-center border border-white leading-none shadow-xs animate-bounce-mini">
                  {incomingGiftsCount}
                </span>
              )}
            </button>
          )}

          {/* Daily Gift Button */}
          <button
            onClick={onOpenDailyRewards}
            className={`relative px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
              isDailyAvailable
                ? 'bg-gradient-to-b from-amber-500 to-yellow-400 border-amber-300 text-amber-950 shadow-md animate-bounce-mini font-bold'
                : 'bg-emerald-950/80 border-emerald-700/70 text-emerald-200 hover:text-white'
            }`}
            title="Ежедневный подарок"
          >
            <span className="text-xs leading-none">🎁</span>
            <span className="text-[11px] font-semibold hidden xs:inline whitespace-nowrap">Бонус</span>
            {isDailyAvailable && (
              <span className="w-2 h-2 bg-rose-500 rounded-full border border-white animate-ping" />
            )}
          </button>

          {/* Weather Indicator */}
          <div
            className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-700/60 rounded-lg px-2 py-1 text-xs text-emerald-200 shrink-0 cursor-default"
            title={`Погода: ${weatherIcons[weather].name}`}
          >
            <span className="text-sm">{weatherIcons[weather].icon}</span>
            <span className="text-[10px] font-medium hidden sm:inline">{weatherIcons[weather].name}</span>
          </div>

          {/* Season Festival Button */}
          <button
            onClick={onOpenSeason}
            className="flex items-center gap-1 bg-amber-950/80 border border-amber-600/70 hover:border-amber-400 rounded-lg px-2 py-1 text-xs text-amber-200 transition-colors cursor-pointer shrink-0"
            title={`Сезон: ${seasonIcons[season].name}. Нажмите для настройки декораций`}
          >
            <span className="text-sm">{seasonIcons[season].icon}</span>
            <span className="text-[10px] font-medium hidden sm:inline">{seasonIcons[season].name}</span>
          </button>

          {/* Stables Quick Button */}
          {onOpenStables && (
            <button
              onClick={onOpenStables}
              className="flex items-center gap-1 bg-amber-950/80 border border-amber-600/70 hover:border-amber-400 rounded-lg px-2 py-1 text-xs text-amber-200 transition-colors cursor-pointer shrink-0"
              title="Императорская Конюшня: скакуны, прогулки и амуниция"
            >
              <span className="text-sm">🐴</span>
              <span className="text-[11px] font-semibold hidden xs:inline whitespace-nowrap">Конюшня</span>
            </button>
          )}

          {/* Cloud Account & Cross-Device Sync Button */}
          <button
            onClick={onOpenAuth}
            className={`relative p-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
              user
                ? 'bg-emerald-950/85 border-emerald-500/70 text-emerald-300 hover:border-emerald-400'
                : 'bg-amber-950/80 border-amber-600/70 text-amber-300 hover:border-amber-400 animate-pulse'
            }`}
            title={
              user
                ? `Аккаунт: ${user.displayName || user.email || 'Фермер'} (Облачная синхронизация)`
                : 'Войти для сохранения прогресса между устройствами'
            }
          >
            {user ? (
              user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="avatar"
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <Cloud className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
              )
            ) : (
              <Cloud className="w-4 h-4 text-amber-300" />
            )}
            <span
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-stone-900 ${
                user ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/70 text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer shrink-0 mr-1"
            title="Настройки"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Right Scroll Indicator Arrow */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 z-30 h-8 w-6 bg-gradient-to-l from-emerald-950 via-emerald-900/90 to-transparent flex items-center justify-end pr-0.5 text-amber-300 hover:text-white transition-opacity active:scale-95 cursor-pointer shadow-md rounded-r"
            title="Прокрутить вправо"
            aria-label="Прокрутить вправо"
          >
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        )}
      </div>
    </header>
  );
};


