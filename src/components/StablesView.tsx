import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Zap,
  Clock,
  Compass,
  ShoppingBag,
  Edit3,
  Check,
  Lock,
  ChevronRight,
  Shield,
  Award,
  ArrowRight,
  Flame,
  Info,
} from 'lucide-react';
import {
  ActiveHorseRide,
  HorseBreedId,
  PlayerHorse,
  TackCategory,
  TackItem,
} from '../types/game';
import {
  HORSE_BREEDS,
  TACK_CATALOG,
  RIDE_ROUTES,
  HORSE_TREATS,
  calculateHorseStats,
  getBondTitle,
} from '../utils/stablesData';

interface StablesViewProps {
  playerHorses: PlayerHorse[];
  activeHorseRides: ActiveHorseRide[];
  unlockedTackIds: string[];
  inventory: Record<string, number>;
  coins: number;
  gems: number;
  level: number;
  onFeedHorse: (horseId: string, treatItemId: string) => void;
  onGroomHorse: (horseId: string) => void;
  onPetHorse: (horseId: string) => void;
  onRenameHorse: (horseId: string, newName: string) => void;
  onEquipTack: (horseId: string, tackId: string) => void;
  onBuyTack: (tackId: string) => void;
  onBuyHorseBreed: (breedId: HorseBreedId, customName?: string) => void;
  onStartHorseRide: (horseId: string, routeId: string) => void;
  onSpeedUpHorseRide: (rideId: string, gemCost: number) => void;
  onCollectHorseRideReward: (rideId: string) => any;
  onGoToFarm?: () => void;
}

export const StablesView: React.FC<StablesViewProps> = ({
  playerHorses,
  activeHorseRides,
  unlockedTackIds,
  inventory,
  coins,
  gems,
  level,
  onFeedHorse,
  onGroomHorse,
  onPetHorse,
  onRenameHorse,
  onEquipTack,
  onBuyTack,
  onBuyHorseBreed,
  onStartHorseRide,
  onSpeedUpHorseRide,
  onCollectHorseRideReward,
  onGoToFarm,
}) => {
  const [activeTab, setActiveTab] = useState<'horses' | 'rides' | 'shop'>('horses');
  const [selectedHorseId, setSelectedHorseId] = useState<string>(
    playerHorses[0]?.id || ''
  );
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameInput, setRenameInput] = useState<string>('');
  const [shopCategory, setShopCategory] = useState<'all' | TackCategory | 'breeds'>('all');
  const [showTreatModal, setShowTreatModal] = useState<boolean>(false);
  const [showTackSelectorCategory, setShowTackSelectorCategory] = useState<TackCategory | null>(null);
  const [rewardResult, setRewardResult] = useState<any>(null);
  const [newHorseBreedId, setNewHorseBreedId] = useState<HorseBreedId | null>(null);
  const [newHorseName, setNewHorseName] = useState<string>('');

  const now = Date.now();
  const currentHorse =
    playerHorses.find((h) => h.id === selectedHorseId) || playerHorses[0];

  const currentHorseStats = currentHorse ? calculateHorseStats(currentHorse) : null;
  const activeRideForCurrentHorse = currentHorse
    ? activeHorseRides.find((r) => r.horseId === currentHorse.id && !r.collected)
    : null;

  // Handle renaming
  const handleStartRename = () => {
    if (!currentHorse) return;
    setRenameInput(currentHorse.customName);
    setIsRenaming(true);
  };

  const handleSaveRename = () => {
    if (!currentHorse || !renameInput.trim()) return;
    onRenameHorse(currentHorse.id, renameInput.trim());
    setIsRenaming(false);
  };

  // Collect reward handler
  const handleCollectReward = (rideId: string) => {
    const res = onCollectHorseRideReward(rideId);
    if (res) {
      setRewardResult(res);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-16 px-2.5 sm:px-4 select-none">
      {/* Top Banner */}
      <div className="mt-2.5 mb-3 flex items-center justify-between px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-950/80 via-emerald-950/90 to-amber-950/80 border border-amber-600/50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-600/30 border border-amber-400/60 flex items-center justify-center text-xl shadow-inner">
            🐴
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black font-game text-amber-200 leading-tight">
              Императорская Конюшня «Серебряная Подкова»
            </h2>
            <p className="text-[10px] text-emerald-300">
              Породы скакунов, прогулки, тренировки и конная амуниция
            </p>
          </div>
        </div>

        {onGoToFarm && (
          <button
            onClick={onGoToFarm}
            className="px-2.5 py-1 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-600/60 text-emerald-100 text-[11px] font-bold cursor-pointer transition-transform active:scale-95"
          >
            🌾 На ферму
          </button>
        )}
      </div>

      {/* Main Stables Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 mb-3 bg-stone-900/90 border border-emerald-800/50 rounded-2xl">
        <button
          onClick={() => setActiveTab('horses')}
          className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'horses'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold'
              : 'text-emerald-300 hover:text-white'
          }`}
        >
          <span>🐴 Мои Лошади</span>
          <span className="text-[10px] bg-stone-950/60 px-1.5 py-0.2 rounded-full font-bold">
            {playerHorses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rides')}
          className={`relative py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'rides'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold'
              : 'text-emerald-300 hover:text-white'
          }`}
        >
          <span>🌲 Прогулки</span>
          {activeHorseRides.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1 right-2" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('shop')}
          className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'shop'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md font-extrabold'
              : 'text-emerald-300 hover:text-white'
          }`}
        >
          <span>🛍️ Шорная Лавка</span>
        </button>
      </div>

      {/* ==================== TAB 1: MY HORSES ==================== */}
      {activeTab === 'horses' && (
        <div className="flex flex-col gap-3">
          {/* Horse Selector Carousel */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {playerHorses.map((horse) => {
              const breed = HORSE_BREEDS[horse.breedId] || HORSE_BREEDS.orlov_trotter;
              const isSelected = horse.id === currentHorse?.id;
              const isRiding = activeHorseRides.some((r) => r.horseId === horse.id && !r.collected);

              return (
                <button
                  key={horse.id}
                  onClick={() => setSelectedHorseId(horse.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-500/25 to-emerald-950 border-amber-400 text-amber-200 shadow-md scale-102'
                      : 'bg-stone-900/80 border-emerald-900/60 text-stone-300 hover:border-emerald-700'
                  }`}
                >
                  <span className="text-2xl">{breed.emoji}</span>
                  <div className="text-left">
                    <div className="text-xs font-bold flex items-center gap-1">
                      <span>{horse.customName}</span>
                      {isRiding && <span className="text-[10px] text-sky-400 animate-pulse">🏇</span>}
                    </div>
                    <div className="text-[10px] text-emerald-400">
                      Ур. доверия {horse.bondLevel} 💖
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Quick Buy Breed Button in Carousel */}
            <button
              onClick={() => {
                setActiveTab('shop');
                setShopCategory('breeds');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-dashed border-amber-500/60 bg-amber-950/30 text-amber-300 hover:bg-amber-950/60 text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <span>+ Купить лошадь</span>
            </button>
          </div>

          {currentHorse && currentHorseStats && (
            <div className="bg-gradient-to-b from-amber-950/70 via-stone-900/90 to-emerald-950/90 border border-amber-500/50 rounded-3xl p-3.5 sm:p-4 shadow-xl">
              {/* Horse Profile Header */}
              <div className="flex items-start justify-between border-b border-amber-700/30 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600/40 via-stone-800 to-emerald-900/40 border-2 border-amber-400/80 flex items-center justify-center text-4xl shadow-inner">
                    {currentHorseStats.breed.emoji}
                    <span className="absolute -bottom-1 -right-1 text-sm bg-stone-950 px-1 rounded-full border border-amber-400/60">
                      {currentHorseStats.breed.avatarIcon}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      {isRenaming ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            className="bg-stone-950 border border-amber-400 rounded-lg px-2 py-0.5 text-xs text-amber-200 font-bold focus:outline-hidden"
                            autoFocus
                            maxLength={16}
                          />
                          <button
                            onClick={handleSaveRename}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base sm:text-lg font-black font-game text-amber-200">
                            {currentHorse.customName}
                          </h3>
                          <button
                            onClick={handleStartRename}
                            className="p-1 text-amber-400/80 hover:text-amber-200 cursor-pointer"
                            title="Изменить кличку"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-emerald-300 font-medium">
                      Порода: <b className="text-white">{currentHorseStats.breed.name}</b>
                    </div>
                    <div className="text-[11px] text-amber-200/80 mt-0.5">
                      Масть: {currentHorseStats.breed.coatColor}
                    </div>
                  </div>
                </div>

                {/* Bond Level Badge */}
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-950/80 border border-pink-500/60 text-pink-200 text-xs font-black shadow-sm">
                    <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                    <span>Доверие {currentHorse.bondLevel}</span>
                  </div>
                  <div className="text-[10px] text-pink-300/80 mt-1">
                    {getBondTitle(currentHorse.bondLevel)}
                  </div>
                </div>
              </div>

              {/* Energy & Friendship Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
                {/* Energy */}
                <div className="bg-stone-950/60 border border-amber-700/40 rounded-2xl p-2.5">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-amber-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>Энергия скакуна</span>
                    </span>
                    <span className="text-white">
                      {currentHorse.energy} / {currentHorse.maxEnergy} ⚡
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${(currentHorse.energy / currentHorse.maxEnergy) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Bond XP */}
                <div className="bg-stone-950/60 border border-pink-700/40 rounded-2xl p-2.5">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-pink-300 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                      <span>Дружба и опыт</span>
                    </span>
                    <span className="text-white">
                      {currentHorse.bondLevel >= 10 ? 'Максимум' : `${currentHorse.bondXp} / ${currentHorse.bondLevel * 60} XP`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-300"
                      style={{
                        width: `${currentHorse.bondLevel >= 10 ? 100 : Math.min(100, (currentHorse.bondXp / (currentHorse.bondLevel * 60)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Breed Trait Highlight Box */}
              <div className="mb-3.5 p-2.5 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-start gap-2.5 text-xs text-amber-200">
                <span className="text-xl shrink-0">✨</span>
                <div>
                  <b className="text-amber-300 block">{currentHorseStats.breed.traitName}</b>
                  <span className="text-[11px] text-emerald-200">
                    {currentHorseStats.breed.traitDescription}
                  </span>
                </div>
              </div>

              {/* Horse Care Action Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setShowTreatModal(true)}
                  className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-game font-bold text-xs shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-xl">🥕</span>
                  <span>Покормить</span>
                </button>

                <button
                  onClick={() => onGroomHorse(currentHorse.id)}
                  className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-game font-bold text-xs shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-xl">🧼</span>
                  <span>Почистить</span>
                </button>

                <button
                  onClick={() => onPetHorse(currentHorse.id)}
                  className="py-2.5 px-2 rounded-2xl bg-gradient-to-b from-rose-600 to-pink-700 hover:from-rose-500 hover:to-pink-600 text-white font-game font-bold text-xs shadow-md transition-all active:scale-95 flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-xl">💖</span>
                  <span>Погладить</span>
                </button>
              </div>

              {/* Active Ride Banner for this Horse */}
              {activeRideForCurrentHorse && (
                <div className="mb-4 p-3 rounded-2xl bg-sky-950/80 border-2 border-sky-400 shadow-lg animate-pulse-glow">
                  {(() => {
                    const route = RIDE_ROUTES.find((r) => r.id === activeRideForCurrentHorse.routeId);
                    const elapsed = now - activeRideForCurrentHorse.startedAt;
                    const remainingSec = Math.max(0, Math.ceil((activeRideForCurrentHorse.durationMs - elapsed) / 1000));
                    const isCompleted = activeRideForCurrentHorse.completed || remainingSec === 0;

                    return (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-extrabold text-sky-200 flex items-center gap-1">
                            <span>🏇</span> В пути: {route?.name}
                          </span>
                          <span className="text-amber-300 font-bold">
                            {isCompleted ? 'Готово к сбору!' : `${remainingSec} сек.`}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden mb-2">
                          <div
                            className="h-full bg-sky-400 transition-all duration-300"
                            style={{
                              width: `${isCompleted ? 100 : Math.min(100, (elapsed / activeRideForCurrentHorse.durationMs) * 100)}%`,
                            }}
                          />
                        </div>

                        {isCompleted ? (
                          <button
                            onClick={() => handleCollectReward(activeRideForCurrentHorse.id)}
                            className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 text-stone-950 font-game font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 animate-bounce-mini"
                          >
                            <span>🎁 Забрать награды верховой прогулки!</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onSpeedUpHorseRide(activeRideForCurrentHorse.id, 2)}
                            className="w-full py-1.5 bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>⚡ Завершить мгновенно (2 💎)</span>
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Equipped Tack Section (Вальтрапы/Коврики, Узды, Седла, Подковы) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Атрибутика и экипировка скакуна:</span>
                  </h4>
                  <button
                    onClick={() => {
                      setActiveTab('shop');
                      setShopCategory('all');
                    }}
                    className="text-[11px] text-emerald-300 hover:text-white underline cursor-pointer"
                  >
                    В магазин амуниции →
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Slot 1: Blanket / Pad */}
                  {renderTackSlot(
                    'blanket',
                    'Вальтрап / Коврик',
                    '🧣',
                    currentHorse.equippedTack.blanket,
                    () => setShowTackSelectorCategory('blanket')
                  )}

                  {/* Slot 2: Bridle */}
                  {renderTackSlot(
                    'bridle',
                    'Уздечка / Узда',
                    '🪢',
                    currentHorse.equippedTack.bridle,
                    () => setShowTackSelectorCategory('bridle')
                  )}

                  {/* Slot 3: Saddle */}
                  {renderTackSlot(
                    'saddle',
                    'Верховое Седло',
                    '🪵',
                    currentHorse.equippedTack.saddle,
                    () => setShowTackSelectorCategory('saddle')
                  )}

                  {/* Slot 4: Horseshoe */}
                  {renderTackSlot(
                    'horseshoe',
                    'Кованые Подковы',
                    '🧲',
                    currentHorse.equippedTack.horseshoe,
                    () => setShowTackSelectorCategory('horseshoe')
                  )}
                </div>

                {/* Overall Stats summary with tack bonuses */}
                <div className="mt-3 p-2.5 rounded-2xl bg-stone-950/70 border border-emerald-800/40 grid grid-cols-4 gap-1 text-center text-[10px]">
                  <div>
                    <span className="text-stone-400 block">Скорость</span>
                    <span className="font-bold text-amber-300">
                      +{currentHorseStats.speedPercentBonus}%
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Награды</span>
                    <span className="font-bold text-emerald-300">
                      +{currentHorseStats.rewardPercentBonus}%
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Удача</span>
                    <span className="font-bold text-sky-300">
                      +{currentHorseStats.luckPercentBonus}%
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Энергия</span>
                    <span className="font-bold text-pink-300">
                      -{currentHorseStats.energySavePercentBonus}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: TRAIL RIDES ==================== */}
      {activeTab === 'rides' && (
        <div className="flex flex-col gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 to-stone-900 border border-emerald-700/60 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-amber-200">Верховые Тропы и Маршруты</h3>
              <p className="text-[11px] text-emerald-300">
                Отправляйте скакунов на прогулки за редкими плодами, сокровищами и кристаллами!
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block">Выбран скакун:</span>
              <span className="font-bold text-amber-300 text-xs">
                {currentHorse?.customName} ({currentHorse?.energy} ⚡)
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {RIDE_ROUTES.map((route) => {
              const isLocked = level < route.minPlayerLevel;
              const isBondLow = (currentHorse?.bondLevel || 1) < route.minBondLevel;
              const activeRide = activeHorseRides.find((r) => r.routeId === route.id && !r.collected);
              const isRiding = Boolean(activeRide);

              const elapsed = activeRide ? now - activeRide.startedAt : 0;
              const remainingSec = activeRide
                ? Math.max(0, Math.ceil((activeRide.durationMs - elapsed) / 1000))
                : 0;
              const isReadyToCollect = activeRide?.completed || (activeRide && remainingSec === 0);

              return (
                <div
                  key={route.id}
                  className={`rounded-2xl border p-3.5 transition-all shadow-md ${
                    isLocked || isBondLow
                      ? 'bg-stone-950/70 border-stone-800 opacity-60'
                      : isRiding
                      ? 'bg-gradient-to-b from-sky-950/90 to-stone-900 border-sky-400 ring-1 ring-sky-400/50'
                      : 'bg-gradient-to-b from-stone-900/90 to-emerald-950/90 border-emerald-700/70 hover:border-amber-500/60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-900/40 border border-emerald-600/50 flex items-center justify-center text-2xl shadow-inner">
                        {route.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">
                            {route.name}
                          </h4>
                          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded-full font-bold">
                            {route.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-300 mt-0.5">
                          {route.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-400 block flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{route.durationSeconds}с</span>
                      </span>
                      <span className="text-xs font-bold text-amber-400">
                        -{route.energyCost} ⚡
                      </span>
                    </div>
                  </div>

                  {/* Route Rewards Preview */}
                  <div className="flex items-center justify-between bg-stone-950/60 border border-emerald-900/40 rounded-xl px-2.5 py-1.5 text-xs mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <span>🪙</span>
                        <span>{route.rewardMinCoins}-{route.rewardMaxCoins}</span>
                      </span>
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        <span>🌟</span>
                        <span>+{route.rewardXp} XP</span>
                      </span>
                      {route.rewardGemsAmount && (
                        <span className="text-sky-300 font-bold flex items-center gap-1">
                          <span>💎</span>
                          <span>до {route.rewardGemsAmount}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-300">
                      <span>Находки:</span>
                      {route.bonusDrops.map((d) => (
                        <span key={d.itemId} title={d.name}>
                          {d.emoji}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action / Status */}
                  {isLocked ? (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Откроется на {route.minPlayerLevel} уровне фермы</span>
                    </div>
                  ) : isBondLow ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                      <Heart className="w-3.5 h-3.5" />
                      <span>Требуется доверие коня {route.minBondLevel} уровня</span>
                    </div>
                  ) : isRiding ? (
                    <div>
                      {isReadyToCollect ? (
                        <button
                          onClick={() => handleCollectReward(activeRide!.id)}
                          className="w-full py-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:from-amber-300 text-stone-950 font-game font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 animate-bounce-mini"
                        >
                          <span>🎁 Забрать награды!</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-sky-300 font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Скакун на маршруте: ещё {remainingSec} сек.</span>
                          </span>
                          <button
                            onClick={() => onSpeedUpHorseRide(activeRide!.id, 2)}
                            className="px-2.5 py-1 bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                          >
                            ⚡ 2 💎
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (currentHorse) onStartHorseRide(currentHorse.id, route.id);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-game font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Отправиться на прогулку на коне {currentHorse?.customName}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: TACK SHOP & BREEDS ==================== */}
      {activeTab === 'shop' && (
        <div className="flex flex-col gap-3">
          {/* Shop Subcategory Filter */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setShopCategory('all')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                shopCategory === 'all'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900 text-emerald-300 hover:text-white'
              }`}
            >
              Вся амуниция
            </button>
            <button
              onClick={() => setShopCategory('blanket')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                shopCategory === 'blanket'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900 text-emerald-300 hover:text-white'
              }`}
            >
              🧣 Вальтрапы & Коврики
            </button>
            <button
              onClick={() => setShopCategory('bridle')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                shopCategory === 'bridle'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900 text-emerald-300 hover:text-white'
              }`}
            >
              🪢 Узды
            </button>
            <button
              onClick={() => setShopCategory('saddle')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                shopCategory === 'saddle'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900 text-emerald-300 hover:text-white'
              }`}
            >
              🪵 Сёдла
            </button>
            <button
              onClick={() => setShopCategory('horseshoe')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                shopCategory === 'horseshoe'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900 text-emerald-300 hover:text-white'
              }`}
            >
              🧲 Подковы
            </button>
            <button
              onClick={() => setShopCategory('breeds')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                shopCategory === 'breeds'
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900 text-emerald-300 hover:text-white'
              }`}
            >
              🐎 Породы Лошадей
            </button>
          </div>

          {/* Breeds Section */}
          {shopCategory === 'breeds' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(HORSE_BREEDS).map((breed) => {
                const isOwned = playerHorses.some((h) => h.breedId === breed.id);
                const isLocked = level < breed.minLevel;
                const canAffordCoins = !breed.costCoins || coins >= breed.costCoins;
                const canAffordGems = !breed.costGems || gems >= breed.costGems;
                const canBuy = !isLocked && canAffordCoins && canAffordGems;

                return (
                  <div
                    key={breed.id}
                    className={`rounded-2xl border p-3.5 transition-all shadow-md flex flex-col justify-between ${
                      isLocked
                        ? 'bg-stone-950/70 border-stone-800 opacity-60'
                        : isOwned
                        ? 'bg-gradient-to-b from-amber-950/40 via-stone-900 to-emerald-950/70 border-emerald-600/70'
                        : 'bg-gradient-to-b from-stone-900/90 to-amber-950/60 border-amber-500/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-400/60 flex items-center justify-center text-3xl shadow-inner">
                            {breed.emoji}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{breed.name}</span>
                              {isOwned && (
                                <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 rounded-full font-bold">
                                  Есть в конюшне
                                </span>
                              )}
                            </h4>
                            <span className="text-[11px] text-amber-200 block">
                              Масть: {breed.coatColor}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-300 mb-2">
                        {breed.description}
                      </p>

                      <div className="p-2 rounded-xl bg-stone-950/60 border border-amber-800/40 mb-3 text-[11px]">
                        <b className="text-amber-300 block">Особенность: {breed.traitName}</b>
                        <span className="text-emerald-300">{breed.traitDescription}</span>
                      </div>

                      {/* Base Stats */}
                      <div className="grid grid-cols-3 gap-1 mb-3 text-center text-[10px] bg-stone-900/70 p-1.5 rounded-xl border border-stone-800">
                        <div>
                          <span className="text-stone-400 block">Скорость</span>
                          <span className="font-bold text-amber-300">{breed.baseSpeed}/10</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Выносливость</span>
                          <span className="font-bold text-emerald-300">{breed.baseStamina}/10</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Удача</span>
                          <span className="font-bold text-sky-300">{breed.baseLuck}/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Buy Button */}
                    {isLocked ? (
                      <div className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Откроется на {breed.minLevel} уровне</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {breed.costCoins > 0 && (
                            <span className="text-amber-300">{breed.costCoins} 🪙</span>
                          )}
                          {breed.costGems && breed.costGems > 0 && (
                            <span className="text-sky-300">{breed.costGems} 💎</span>
                          )}
                          {breed.costCoins === 0 && !breed.costGems && (
                            <span className="text-emerald-400">Бесплатно</span>
                          )}
                        </div>

                        <button
                          disabled={!canBuy}
                          onClick={() => {
                            setNewHorseBreedId(breed.id);
                            setNewHorseName(breed.name);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            canBuy
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md active:scale-95'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          Купить скакуна
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Tack Catalog Section */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TACK_CATALOG.filter(
                (item) => shopCategory === 'all' || item.category === shopCategory
              ).map((tack) => {
                const isUnlocked = unlockedTackIds.includes(tack.id);
                const isLockedByLevel = level < tack.minLevel;
                const canAffordCoins = !tack.costCoins || coins >= tack.costCoins;
                const canAffordGems = !tack.costGems || gems >= tack.costGems;
                const canBuy = !isLockedByLevel && canAffordCoins && canAffordGems;

                const isEquippedOnCurrentHorse =
                  currentHorse &&
                  currentHorse.equippedTack[tack.category] === tack.id;

                return (
                  <div
                    key={tack.id}
                    className={`rounded-2xl border p-3 flex flex-col justify-between shadow-md ${
                      isLockedByLevel
                        ? 'bg-stone-950/70 border-stone-800 opacity-60'
                        : isUnlocked
                        ? 'bg-stone-900/90 border-emerald-700/60'
                        : 'bg-gradient-to-b from-stone-900/90 to-amber-950/50 border-amber-600/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{tack.emoji}</span>
                          <div>
                            <h4 className="text-xs font-bold text-white">{tack.name}</h4>
                            <span className="text-[10px] text-stone-400">
                              {tack.category === 'blanket'
                                ? 'Вальтрап / Коврик'
                                : tack.category === 'bridle'
                                ? 'Уздечка'
                                : tack.category === 'saddle'
                                ? 'Седло'
                                : 'Подковы'}
                            </span>
                          </div>
                        </div>

                        {isUnlocked && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.2 rounded-full font-bold">
                            В гардеробе
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-300 mb-2">{tack.description}</p>

                      {/* Stat Bonuses */}
                      <div className="flex flex-wrap gap-1 mb-2.5 text-[10px]">
                        {tack.bonusSpeedPercent > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800">
                            +{tack.bonusSpeedPercent}% к скорости
                          </span>
                        )}
                        {tack.bonusRewardPercent > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                            +{tack.bonusRewardPercent}% к наградам
                          </span>
                        )}
                        {tack.bonusLuckPercent > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-sky-950 text-sky-300 border border-sky-800">
                            +{tack.bonusLuckPercent}% к удаче
                          </span>
                        )}
                        {tack.bonusEnergySavePercent > 0 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-pink-950 text-pink-300 border border-pink-800">
                            -{tack.bonusEnergySavePercent}% усталости
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Controls */}
                    {isLockedByLevel ? (
                      <div className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        <span>С {tack.minLevel} уровня</span>
                      </div>
                    ) : isUnlocked ? (
                      <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                        <span className="text-[11px] text-emerald-400">
                          {isEquippedOnCurrentHorse ? '✨ Надето на коня' : 'В сундуке'}
                        </span>
                        <button
                          onClick={() => {
                            if (currentHorse) onEquipTack(currentHorse.id, tack.id);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isEquippedOnCurrentHorse
                              ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          }`}
                        >
                          {isEquippedOnCurrentHorse ? 'Снять' : 'Надеть'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t border-stone-800">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          {tack.costCoins && (
                            <span className="text-amber-300">{tack.costCoins} 🪙</span>
                          )}
                          {tack.costGems && (
                            <span className="text-sky-300">{tack.costGems} 💎</span>
                          )}
                        </div>

                        <button
                          disabled={!canBuy}
                          onClick={() => onBuyTack(tack.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            canBuy
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md active:scale-95'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          Купить
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== MODAL: FEED TREAT SELECTOR ==================== */}
      {showTreatModal && currentHorse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-900 to-emerald-950 border-2 border-amber-500/80 rounded-3xl p-4 shadow-2xl text-amber-100">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-700/40">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <span>🥕</span> Угостить скакуна {currentHorse.customName}
              </h3>
              <button
                onClick={() => setShowTreatModal(false)}
                className="text-stone-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300 mb-3">
              Кормление восстанавливает энергию ⚡ для верховых прогулок и повышает уровень доверия 💖:
            </p>

            <div className="flex flex-col gap-2 mb-3">
              {HORSE_TREATS.map((treat) => {
                const count = inventory[treat.itemId] || 0;
                return (
                  <button
                    key={treat.itemId}
                    disabled={count <= 0}
                    onClick={() => {
                      onFeedHorse(currentHorse.id, treat.itemId);
                      setShowTreatModal(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left ${
                      count > 0
                        ? 'bg-stone-900/90 hover:bg-stone-800/90 border-amber-600/50 cursor-pointer active:scale-95'
                        : 'bg-stone-950/60 border-stone-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{treat.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{treat.name}</span>
                          <span className="text-[10px] text-amber-300 font-semibold">
                            (В амбаре: {count} шт.)
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-300">
                          +{treat.energyGain} ⚡ энергии, +{treat.bondGain} 💖 дружбы
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowTreatModal(false)}
              className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EQUIP TACK SELECTOR ==================== */}
      {showTackSelectorCategory && currentHorse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-900 to-emerald-950 border-2 border-amber-500/80 rounded-3xl p-4 shadow-2xl text-amber-100">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-700/40">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <span>🛡️</span> Выбрать амуницию
              </h3>
              <button
                onClick={() => setShowTackSelectorCategory(null)}
                className="text-stone-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto no-scrollbar mb-3">
              {TACK_CATALOG.filter((t) => t.category === showTackSelectorCategory).map((tack) => {
                const isUnlocked = unlockedTackIds.includes(tack.id);
                const isEquipped = currentHorse.equippedTack[tack.category] === tack.id;

                return (
                  <div
                    key={tack.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-900/90 border border-stone-800"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{tack.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{tack.name}</div>
                        <div className="text-[10px] text-emerald-300">
                          +{tack.bonusSpeedPercent}% скор. / +{tack.bonusRewardPercent}% наград
                        </div>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          onEquipTack(currentHorse.id, tack.id);
                          setShowTackSelectorCategory(null);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                        }`}
                      >
                        {isEquipped ? 'Снять' : 'Надеть'}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowTackSelectorCategory(null);
                          setActiveTab('shop');
                          setShopCategory(tack.category);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
                      >
                        Купить
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowTackSelectorCategory(null)}
              className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold cursor-pointer"
            >
              Готово
            </button>
          </div>
        </div>
      )}

      {/* ==================== MODAL: BUY HORSE CONFIRMATION ==================== */}
      {newHorseBreedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-stone-900 via-amber-950 to-stone-900 border-2 border-amber-400 rounded-3xl p-4 shadow-2xl text-center text-amber-100">
            {(() => {
              const breed = HORSE_BREEDS[newHorseBreedId];
              return (
                <div>
                  <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-amber-600/30 border border-amber-400 flex items-center justify-center text-4xl shadow-lg">
                    {breed.emoji}
                  </div>

                  <h3 className="text-base font-bold font-game text-amber-200">
                    Приобрести породу: {breed.name}
                  </h3>
                  <p className="text-xs text-emerald-200 mt-1 mb-3">
                    Масть: {breed.coatColor} · {breed.traitDescription}
                  </p>

                  <div className="mb-3 text-left">
                    <label className="text-[11px] text-stone-300 block mb-1 font-bold">
                      Дайте имя вашему новому скакуну:
                    </label>
                    <input
                      type="text"
                      value={newHorseName}
                      onChange={(e) => setNewHorseName(e.target.value)}
                      className="w-full bg-stone-950 border border-amber-400 rounded-xl px-3 py-2 text-sm text-amber-100 font-bold focus:outline-hidden"
                      maxLength={18}
                      placeholder="Например: Граф, Буран, Альтаир..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNewHorseBreedId(null)}
                      className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold cursor-pointer"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => {
                        onBuyHorseBreed(newHorseBreedId, newHorseName);
                        setNewHorseBreedId(null);
                        setActiveTab('horses');
                      }}
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md cursor-pointer"
                    >
                      Подтвердить покупку
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==================== CELEBRATION REWARD MODAL ==================== */}
      {rewardResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-amber-900 via-stone-950 to-emerald-950 border-2 border-amber-400 rounded-3xl p-5 shadow-2xl text-center text-amber-100">
            <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-lg animate-bounce-mini">
              🏆
            </div>

            <h3 className="text-base font-black font-game text-amber-200">
              Возвращение с верховой прогулки!
            </h3>
            <p className="text-xs text-emerald-300 mt-1 mb-3">
              Скакун <b>{rewardResult.horseName}</b> успешно завершил поход по маршруту «{rewardResult.routeName}»!
            </p>

            {/* Rewards Breakdown */}
            <div className="bg-stone-950/80 border border-emerald-700/60 rounded-2xl p-3 mb-3 flex flex-col gap-2">
              <div className="flex items-center justify-around font-bold text-xs">
                <span className="text-amber-300 flex items-center gap-1">
                  <span>🪙</span>
                  <span>+{rewardResult.coins} Монет</span>
                </span>
                <span className="text-emerald-300 flex items-center gap-1">
                  <span>🌟</span>
                  <span>+{rewardResult.xp} Опыта</span>
                </span>
                {rewardResult.gems > 0 && (
                  <span className="text-sky-300 flex items-center gap-1">
                    <span>💎</span>
                    <span>+{rewardResult.gems} Самоцветов</span>
                  </span>
                )}
              </div>

              {rewardResult.items && rewardResult.items.length > 0 && (
                <div className="border-t border-stone-800 pt-2 text-left">
                  <span className="text-[10px] text-stone-400 block mb-1 font-bold">
                    Собранные на маршруте трофеи:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rewardResult.items.map((it: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-xs text-white flex items-center gap-1"
                      >
                        <span>{it.emoji}</span>
                        <span>{it.name} (+{it.count})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setRewardResult(null)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-stone-950 font-game font-black text-xs rounded-xl shadow-lg cursor-pointer"
            >
              Отлично!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Tack Slot Renderer
function renderTackSlot(
  category: TackCategory,
  label: string,
  emptyIcon: string,
  equippedTackId: string | undefined,
  onClick: () => void
) {
  const item = equippedTackId ? TACK_CATALOG.find((t) => t.id === equippedTackId) : null;

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-2xl border transition-all text-left flex flex-col items-center justify-between cursor-pointer active:scale-95 ${
        item
          ? 'bg-stone-950/80 border-amber-400/80 shadow-md ring-1 ring-amber-400/40'
          : 'bg-stone-950/40 border-dashed border-stone-700 text-stone-400 hover:border-amber-500/60'
      }`}
    >
      <span className="text-[9px] text-stone-400 font-bold block mb-1 truncate max-w-full">
        {label}
      </span>
      <span className="text-2xl my-0.5">{item ? item.emoji : emptyIcon}</span>
      <span className="text-[10px] font-bold text-amber-200 truncate max-w-full text-center">
        {item ? item.name : 'Пусто'}
      </span>
    </button>
  );
}
