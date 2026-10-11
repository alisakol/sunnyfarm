import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Droplets, Fish, AlertCircle, ArrowLeft, RefreshCw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { vibrateLight, vibrateSuccess, vibrateLevelUp } from '../utils/haptics';

interface FishReward {
  id: string;
  name: string;
  emoji: string;
  weightKg: string;
  coins: number;
  xp: number;
  gems?: number;
  rarity: 'common' | 'rare' | 'legendary';
}

const FISH_CATALOG: FishReward[] = [
  { id: 'carp', name: 'Золотистый Карась', emoji: '🐟', weightKg: '0.8', coins: 18, xp: 10, rarity: 'common' },
  { id: 'perch', name: 'Речной Окунь', emoji: '🐡', weightKg: '1.2', coins: 25, xp: 14, rarity: 'common' },
  { id: 'trout', name: 'Радужная Форель', emoji: '🐠', weightKg: '2.1', coins: 38, xp: 22, rarity: 'rare' },
  { id: 'crayfish', name: 'Речной Рак', emoji: '🦐', weightKg: '0.4', coins: 22, xp: 12, rarity: 'common' },
  { id: 'oyster', name: 'Жемчужная Ракушка', emoji: '🐚', weightKg: '0.3', coins: 45, xp: 30, gems: 2, rarity: 'rare' },
  { id: 'royal_carp', name: 'Королевский Карп', emoji: '🦈', weightKg: '5.6', coins: 110, xp: 65, gems: 3, rarity: 'legendary' },
  { id: 'boot', name: 'Старый Башмак с Кладом', emoji: '👢', weightKg: '1.0', coins: 50, xp: 8, rarity: 'common' },
];

interface Butterfly {
  id: number;
  emoji: string;
  name: string;
  x: number; // percentage
  y: number; // percentage
  reward: number; // coins
}

interface FishingMiniGameProps {
  onClose: () => void;
  onReward: (coins: number, xp: number, gems?: number) => void;
  readyCropsCount: number;
}

type FishingState = 'IDLE' | 'WAITING' | 'BITING' | 'REELING' | 'CAUGHT';

export const FishingMiniGame: React.FC<FishingMiniGameProps> = ({
  onClose,
  onReward,
  readyCropsCount,
}) => {
  const [fishingState, setFishingState] = useState<FishingState>('IDLE');
  const [currentFish, setCurrentFish] = useState<FishReward | null>(null);
  const [caughtHistory, setCaughtHistory] = useState<FishReward[]>([]);

  // Mini-game tension & reel mechanics
  const [reelProgress, setReelProgress] = useState<number>(0);
  const [targetZone, setTargetZone] = useState<number>(45); // percentage
  const [currentTension, setCurrentTension] = useState<number>(40);

  // Bait count
  const [worms, setWorms] = useState<number>(10);

  // Butterflies in meadow
  const [butterflies, setButterflies] = useState<Butterfly[]>([
    { id: 1, emoji: '🦋', name: 'Лазурная бабочка', x: 20, y: 18, reward: 8 },
    { id: 2, emoji: '🦋', name: 'Золотой махаон', x: 65, y: 14, reward: 12 },
    { id: 3, emoji: '🐝', name: 'Лесная стрекоза', x: 45, y: 26, reward: 10 },
  ]);

  const biteTimerRef = useRef<number | null>(null);
  const biteExpiryRef = useRef<number | null>(null);
  const reelLoopRef = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (biteTimerRef.current) clearTimeout(biteTimerRef.current);
      if (biteExpiryRef.current) clearTimeout(biteExpiryRef.current);
      if (reelLoopRef.current) clearInterval(reelLoopRef.current);
    };
  }, []);

  // Move butterflies slowly
  useEffect(() => {
    const butterflyMover = setInterval(() => {
      setButterflies((prev) =>
        prev.map((b) => ({
          ...b,
          x: Math.max(10, Math.min(85, b.x + (Math.random() * 16 - 8))),
          y: Math.max(8, Math.min(32, b.y + (Math.random() * 12 - 6))),
        }))
      );
    }, 1800);
    return () => clearInterval(butterflyMover);
  }, []);

  // Refill worms slowly if empty
  useEffect(() => {
    if (worms < 5) {
      const refillTimer = setTimeout(() => {
        setWorms((w) => w + 3);
      }, 10000);
      return () => clearTimeout(refillTimer);
    }
  }, [worms]);

  // 1. Cast Rod into Water
  const handleCastRod = () => {
    if (fishingState !== 'IDLE' && fishingState !== 'CAUGHT') return;
    if (worms <= 0) {
      setWorms(5); // free emergency bait
    }

    setWorms((w) => Math.max(0, w - 1));
    setFishingState('WAITING');
    sound.playWater();
    vibrateLight();

    // Random wait for fish bite: 2.2 to 4.5 seconds
    const waitMs = Math.floor(Math.random() * 2300) + 2200;
    biteTimerRef.current = window.setTimeout(() => {
      // Fish bites!
      setFishingState('BITING');
      sound.playFishBite();
      vibrateLevelUp();

      // Reaction window: 2.5 seconds to hook!
      biteExpiryRef.current = window.setTimeout(() => {
        setFishingState('IDLE');
        sound.playTap();
      }, 2500);
    }, waitMs);
  };

  // 2. Hook / Strike on Bite
  const handleHookFish = () => {
    if (fishingState !== 'BITING') return;

    if (biteExpiryRef.current) clearTimeout(biteExpiryRef.current);

    sound.playFishBite();
    vibrateSuccess();

    // Start reel mini-game
    setFishingState('REELING');
    setReelProgress(30);
    setTargetZone(Math.floor(Math.random() * 40) + 30);
    setCurrentTension(40);

    // Reel physics loop
    if (reelLoopRef.current) clearInterval(reelLoopRef.current);
    reelLoopRef.current = window.setInterval(() => {
      // Natural tension drop
      setCurrentTension((t) => Math.max(5, t - 2.8));
      // Moving target zone oscillation
      setTargetZone((tz) => {
        const next = tz + (Math.random() * 10 - 5);
        return Math.max(20, Math.min(80, next));
      });
    }, 100);
  };

  // 3. Tap to Reel in
  const handleReelTap = () => {
    if (fishingState !== 'REELING') return;

    sound.playReelClick();
    vibrateLight();

    // Increase tension
    const nextTension = Math.min(100, currentTension + 12);
    setCurrentTension(nextTension);

    // Check if within target zone (+/- 20)
    const isInGreen = Math.abs(nextTension - targetZone) < 22;

    setReelProgress((prev) => {
      const delta = isInGreen ? 16 : -6;
      const updated = Math.max(0, Math.min(100, prev + delta));

      if (updated >= 100) {
        // Caught the fish!
        if (reelLoopRef.current) clearInterval(reelLoopRef.current);

        // Pick random fish with weighted probabilities
        const roll = Math.random();
        let selected = FISH_CATALOG[0];
        if (roll > 0.88) {
          selected = FISH_CATALOG[5]; // Royal Carp
        } else if (roll > 0.70) {
          selected = FISH_CATALOG[4]; // Pearl Oyster
        } else if (roll > 0.50) {
          selected = FISH_CATALOG[2]; // Trout
        } else if (roll > 0.30) {
          selected = FISH_CATALOG[1]; // Perch
        } else if (roll > 0.15) {
          selected = FISH_CATALOG[3]; // Crayfish
        } else if (roll > 0.08) {
          selected = FISH_CATALOG[6]; // Boot
        }

        setCurrentFish(selected);
        setCaughtHistory((h) => [selected, ...h.slice(0, 4)]);
        setFishingState('CAUGHT');

        sound.playHarvest();
        vibrateLevelUp();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });

        // Award player immediately
        onReward(selected.coins, selected.xp, selected.gems);
      }
      return updated;
    });
  };

  // 4. Catch a butterfly
  const handleCatchButterfly = (butterfly: Butterfly) => {
    sound.playButterflyCatch();
    vibrateSuccess();

    onReward(butterfly.reward, 5);

    // Temporarily remove & respawn
    setButterflies((prev) => prev.filter((b) => b.id !== butterfly.id));
    setTimeout(() => {
      setButterflies((prev) => [
        ...prev,
        {
          ...butterfly,
          x: Math.floor(Math.random() * 70) + 15,
          y: Math.floor(Math.random() * 20) + 10,
        },
      ]);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md h-[92vh] max-h-[820px] rounded-3xl bg-gradient-to-b from-sky-400 via-teal-700 to-emerald-950 border-2 border-amber-400/90 shadow-2xl relative overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="px-3 py-2 bg-emerald-950/80 backdrop-blur-md border-b border-emerald-700/60 flex items-center justify-between text-white shrink-0 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 text-emerald-200 cursor-pointer transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </button>
            <div className="flex items-center gap-1.5 font-game font-bold text-xs sm:text-sm text-amber-200">
              <span>🎣</span>
              <span>Рыбалка и Сад Бабочек</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Worms Bait Counter */}
            <div className="flex items-center gap-1 bg-amber-950/70 px-2 py-0.5 rounded-lg border border-amber-700/60 text-xs text-amber-300 font-bold">
              <span>🪱</span>
              <span>{worms} шт.</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Crops status radar banner */}
        {readyCropsCount > 0 && (
          <div className="bg-amber-500 text-amber-950 font-bold text-[11px] px-3 py-1 flex items-center justify-between shadow-md shrink-0 animate-pulse">
            <span className="flex items-center gap-1">
              <span>🌾</span>
              <span>На ваших грядках созрел урожай: {readyCropsCount} шт.!</span>
            </span>
            <button
              onClick={onClose}
              className="text-[10px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded-md font-extrabold cursor-pointer hover:bg-black"
            >
              Собрать
            </button>
          </div>
        )}

        {/* SCENERY VIEWPORT */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {/* Top Shore Meadow & Fluttering Butterflies */}
          <div className="h-44 relative bg-gradient-to-b from-emerald-500 via-green-600 to-teal-700 overflow-hidden border-b-2 border-amber-800/40">
            {/* Sun & Clouds */}
            <div className="absolute top-2 right-4 text-2xl animate-float-slow">☀️</div>
            <div className="absolute top-4 left-6 text-xl opacity-80 animate-sway">☁️</div>

            {/* Shore grass, flowers, mushrooms */}
            <div className="absolute bottom-1 inset-x-0 flex justify-around text-lg opacity-90 select-none pointer-events-none">
              <span>🌿</span>
              <span>🌸</span>
              <span>🍄</span>
              <span>🌾</span>
              <span>🌼</span>
              <span>🌿</span>
            </div>

            {/* Clickable Fluttering Butterflies */}
            {butterflies.map((b) => (
              <button
                key={b.id}
                onClick={() => handleCatchButterfly(b)}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className="absolute text-2xl transition-all duration-1000 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 active:scale-90 animate-bounce-mini drop-shadow-md z-10"
                title={`Поймать сачком: ${b.name} (+${b.reward} 🪙)`}
              >
                <span>{b.emoji}</span>
              </button>
            ))}

            {/* Helper label */}
            <div className="absolute top-1 left-2 text-[10px] text-emerald-950 font-bold bg-white/40 px-2 py-0.5 rounded-full pointer-events-none">
              Нажимайте на бабочек, чтобы поймать их сачком!
            </div>
          </div>

          {/* Deep Pond Water Area */}
          <div className="flex-1 relative bg-gradient-to-b from-teal-700 via-sky-800 to-emerald-950 overflow-hidden flex flex-col justify-between p-3">
            {/* Water ripples and lily pads */}
            <div className="absolute top-4 left-8 text-2xl opacity-70 animate-float-slow">🪷</div>
            <div className="absolute top-12 right-10 text-xl opacity-70 animate-sway">🦆</div>
            <div className="absolute bottom-12 left-6 text-xl opacity-60">🌾</div>

            {/* Swimming Fish Shadows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <div className="absolute top-1/3 left-10 text-2xl animate-truck-drive">🐟</div>
              <div className="absolute top-2/3 right-12 text-3xl animate-truck-drive delay-700">🐠</div>
            </div>

            {/* Center Bobber & Fishing Stage Visual */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
              {/* IDLE STATE */}
              {fishingState === 'IDLE' && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-teal-900/60 border-2 border-teal-400/50 flex items-center justify-center text-3xl mb-2 shadow-inner">
                    🎣
                  </div>
                  <h4 className="text-sm font-game font-bold text-white mb-1">
                    Тихий Деревенский Пруд
                  </h4>
                  <p className="text-xs text-teal-200/90 max-w-[240px] mb-3">
                    Забросьте удочку и ловите карасей, форель и жемчужные раковины!
                  </p>
                  <button
                    onClick={handleCastRod}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 text-amber-950 font-game font-extrabold text-sm rounded-2xl shadow-xl transition-transform active:scale-95 cursor-pointer flex items-center gap-2 animate-bounce-mini"
                  >
                    <span>Забросить удочку (-1 🪱)</span>
                  </button>
                </div>
              )}

              {/* WAITING STATE */}
              {fishingState === 'WAITING' && (
                <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
                  {/* Floating Bobber */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-bounce-mini">
                      ⚪
                    </div>
                    {/* Concentric ripples */}
                    <div className="absolute -inset-3 rounded-full border border-sky-300/60 animate-ping pointer-events-none" />
                  </div>
                  <span className="text-xs font-bold text-sky-200 mt-4 bg-sky-950/70 px-3 py-1 rounded-full border border-sky-600/50">
                    Поплавок в воде... Ждём поклёвку... 🌊
                  </span>
                </div>
              )}

              {/* BITING STATE (URGENT REACTION!) */}
              {fishingState === 'BITING' && (
                <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-150">
                  <div className="text-5xl animate-bounce-mini filter drop-shadow-xl mb-1">
                    ❗
                  </div>
                  <div className="w-12 h-12 rounded-full bg-rose-600 border-4 border-yellow-300 shadow-2xl flex items-center justify-center text-xl animate-pulse">
                    💦
                  </div>
                  <button
                    onClick={handleHookFish}
                    className="mt-3 px-8 py-3 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 text-white font-game font-extrabold text-base rounded-2xl shadow-2xl ring-4 ring-yellow-300 animate-pulse transition-transform active:scale-90 cursor-pointer"
                  >
                    ПОДСЕЧЬ! 🎣💥
                  </button>
                </div>
              )}

              {/* REELING STATE (TENSION MINI-GAME!) */}
              {fishingState === 'REELING' && (
                <div className="w-full max-w-[280px] bg-emerald-950/90 border-2 border-amber-400/80 rounded-2xl p-3 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200">
                  <h4 className="text-xs font-game font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <span>Рыба на крючке! Тяните!</span>
                  </h4>

                  {/* Reel Progress Bar */}
                  <div className="w-full bg-stone-900 rounded-full h-3 border border-emerald-600/70 overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-100"
                      style={{ width: `${reelProgress}%` }}
                    />
                  </div>

                  {/* Tension Meter Track */}
                  <div className="w-full h-8 bg-stone-950 rounded-xl relative border border-stone-700 overflow-hidden mb-3">
                    {/* Target Green Zone */}
                    <div
                      className="absolute top-0 bottom-0 bg-emerald-500/50 border-x-2 border-emerald-300 transition-all duration-150"
                      style={{
                        left: `${Math.max(0, targetZone - 15)}%`,
                        width: '30%',
                      }}
                    />

                    {/* Current Tension Indicator */}
                    <div
                      className="absolute top-0 bottom-0 w-2.5 bg-yellow-300 shadow-md rounded-xs transition-all duration-75"
                      style={{ left: `${currentTension}%` }}
                    />
                  </div>

                  {/* Reel Button */}
                  <button
                    onClick={handleReelTap}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-amber-950 font-game font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🔄 ТЯНУТЬ КАТУШКУ! ({Math.round(reelProgress)}%)</span>
                  </button>
                </div>
              )}

              {/* CAUGHT STATE */}
              {fishingState === 'CAUGHT' && currentFish && (
                <div className="w-full max-w-[280px] bg-gradient-to-b from-amber-950/95 via-emerald-950/95 to-stone-950 border-2 border-amber-400 rounded-3xl p-4 shadow-2xl text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
                  <span className="text-4xl animate-bounce-mini mb-1">
                    {currentFish.emoji}
                  </span>
                  <div className="inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold border border-amber-400/50 mb-1">
                    {currentFish.rarity === 'legendary' ? '👑 ЛЕГЕНДАРНЫЙ УЛОВ!' : currentFish.rarity === 'rare' ? '✨ РЕДКИЙ УЛОВ' : 'УСПЕШНАЯ ПОИМКА'}
                  </div>
                  <h3 className="text-sm font-game font-extrabold text-white">
                    {currentFish.name}
                  </h3>
                  <span className="text-[11px] text-emerald-300 mb-2">
                    Вес: {currentFish.weightKg} кг
                  </span>

                  {/* Rewards preview */}
                  <div className="flex items-center gap-2 bg-emerald-900/60 border border-emerald-700/60 rounded-xl px-3 py-1.5 mb-3">
                    <span className="text-xs font-bold text-amber-300">
                      +{currentFish.coins} 🪙
                    </span>
                    <span className="text-xs font-bold text-emerald-200">
                      +{currentFish.xp} XP
                    </span>
                    {currentFish.gems && (
                      <span className="text-xs font-bold text-sky-300">
                        +{currentFish.gems} 💎
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleCastRod}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-amber-950 font-game font-extrabold text-xs rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Забросить снова 🎣</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom: Recent Catches Tray */}
            {caughtHistory.length > 0 && (
              <div className="bg-emerald-950/70 border border-emerald-700/50 rounded-2xl p-2 shrink-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                    <span>🧺</span> Садок:
                  </span>
                  <div className="flex items-center gap-1 pl-1">
                    {caughtHistory.map((fish, i) => (
                      <span
                        key={i}
                        className="text-lg p-0.5 rounded-lg bg-emerald-900/50 border border-emerald-700/40"
                        title={`${fish.name} (+${fish.coins}🪙)`}
                      >
                        {fish.emoji}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-[10px] text-emerald-300 font-semibold">
                  Поймано: {caughtHistory.length} шт.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
