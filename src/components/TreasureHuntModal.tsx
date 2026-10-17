import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Compass,
  Sparkles,
  MapPin,
  HelpCircle,
  Award,
  ChevronRight,
  Gift,
  CheckCircle2,
  Lock,
  Search,
  Volume2,
  VolumeX,
  RotateCcw,
  Info,
} from 'lucide-react';
import { TreasureHuntState, TreasureChest, FarmArtifact, ChestTier } from '../types/game';
import { ANCIENT_ARTIFACTS, CHEST_TIERS } from '../utils/treasureData';
import { sound } from '../utils/audio';
import { vibrateLight, vibrateSuccess } from '../utils/haptics';

interface TreasureHuntModalProps {
  isOpen: boolean;
  onClose: () => void;
  treasureHuntState: TreasureHuntState;
  onDiscoverChest: (chestId: string) => void;
  onOpenChest: (chestId: string) => void;
  onUseCompassScan: () => void;
  onRefreshDaily?: () => void;
  onOpenJournal?: () => void;
}

export const TreasureHuntModal: React.FC<TreasureHuntModalProps> = ({
  isOpen,
  onClose,
  treasureHuntState,
  onDiscoverChest,
  onOpenChest,
  onUseCompassScan,
  onRefreshDaily,
  onOpenJournal,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'map' | 'artifacts'>('map');

  // Interactive compass radar state
  const mapRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanBeacon, setScanBeacon] = useState<{ x: number; y: number } | null>(null);
  const [recentlyOpenedChest, setRecentlyOpenedChest] = useState<TreasureChest | null>(null);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
  const [lastPingTime, setLastPingTime] = useState<number>(0);
  const [selectedArtifactForInspect, setSelectedArtifactForInspect] = useState<FarmArtifact | null>(null);

  // Active chest to find (current step)
  const currentStepChest = useMemo(() => {
    // Find the first unopened chest in the 5-step chain
    const unopened = treasureHuntState.activeChests.find((c) => !c.opened);
    return unopened || treasureHuntState.activeChests[treasureHuntState.activeChests.length - 1];
  }, [treasureHuntState.activeChests]);

  const allChestsCompleted = useMemo(() => {
    return treasureHuntState.activeChests.length > 0 && treasureHuntState.activeChests.every((c) => c.opened);
  }, [treasureHuntState.activeChests]);

  const chestsFoundTodayCount = useMemo(() => {
    return treasureHuntState.activeChests.filter((c) => c.opened).length;
  }, [treasureHuntState.activeChests]);

  // Calculate distance between cursor and current target chest
  const distance = useMemo(() => {
    if (!currentStepChest) return 100;
    const dx = cursorPos.x - currentStepChest.x;
    const dy = cursorPos.y - currentStepChest.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [cursorPos, currentStepChest]);

  // Compass needle angle
  const needleAngle = useMemo(() => {
    if (!currentStepChest) return 0;
    const dx = currentStepChest.x - cursorPos.x;
    const dy = currentStepChest.y - cursorPos.y;
    // In CSS rotation 0deg is pointing UP (North).
    // Math.atan2 returns angle where 0 is Right (+X).
    // Angle in degrees clockwise from North:
    const angleRad = Math.atan2(dy, dx);
    let deg = (angleRad * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
  }, [cursorPos, currentStepChest]);

  // Proximity level
  const proximity = useMemo(() => {
    if (allChestsCompleted) return { level: 'completed', text: 'Все сундуки открыты!', color: 'text-amber-400', bg: 'bg-amber-950/80', border: 'border-amber-500' };
    if (!currentStepChest) return { level: 'unknown', text: 'Поиск цели...', color: 'text-stone-400', bg: 'bg-stone-900', border: 'border-stone-700' };

    if (currentStepChest.discovered || distance < 6.5) {
      return {
        level: 'found',
        text: 'СУНДУК ЗДЕСЬ! ✨',
        color: 'text-amber-300',
        bg: 'bg-amber-500/30',
        border: 'border-amber-400',
        intensity: 'found' as const,
      };
    }
    if (distance < 16) {
      return {
        level: 'hot',
        text: 'Очень горячо! 🔥',
        color: 'text-rose-400',
        bg: 'bg-rose-950/70',
        border: 'border-rose-500',
        intensity: 'hot' as const,
      };
    }
    if (distance < 30) {
      return {
        level: 'warm',
        text: 'Теплеет! 🌤️',
        color: 'text-amber-300',
        bg: 'bg-amber-950/70',
        border: 'border-amber-600',
        intensity: 'warm' as const,
      };
    }
    if (distance < 50) {
      return {
        level: 'cold',
        text: 'Прохладно... 🍃',
        color: 'text-teal-300',
        bg: 'bg-teal-950/70',
        border: 'border-teal-700',
        intensity: 'cold' as const,
      };
    }
    return {
      level: 'freezing',
      text: 'Ледяной след... ❄️',
      color: 'text-sky-300',
      bg: 'bg-sky-950/70',
      border: 'border-sky-800',
      intensity: 'freezing' as const,
    };
  }, [distance, currentStepChest, allChestsCompleted]);

  // Handle map pointer move
  const handleMapPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mapRef.current || allChestsCompleted) return;
    const rect = mapRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setCursorPos({ x, y });

    // Throttle sound ping when moving close
    const now = Date.now();
    if (now - lastPingTime > 750 && proximity.intensity) {
      sound.playSonarPing(proximity.intensity);
      setLastPingTime(now);
    }
  };

  // Handle map click / touch: attempt to discover
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || allChestsCompleted || !currentStepChest) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setCursorPos({ x, y });

    // Calculate click distance
    const clickDist = Math.sqrt(Math.pow(x - currentStepChest.x, 2) + Math.pow(y - currentStepChest.y, 2));

    if (clickDist < 8.5 && !currentStepChest.discovered) {
      onDiscoverChest(currentStepChest.id);
      vibrateSuccess();
    } else if (clickDist < 18) {
      sound.playSonarPing('hot');
      vibrateLight();
    } else {
      sound.playSonarPing(proximity.intensity || 'cold');
      vibrateLight();
    }
  };

  // Activate radar scan beacon
  const handleTriggerScanner = () => {
    if (allChestsCompleted || !currentStepChest) return;
    setIsScanning(true);
    onUseCompassScan();

    // Pulse beacon around target chest
    setScanBeacon({ x: currentStepChest.x, y: currentStepChest.y });
    sound.playSonarPing('hot');
    vibrateLight();

    setTimeout(() => {
      setIsScanning(false);
      setTimeout(() => setScanBeacon(null), 3000);
    }, 1200);
  };

  // Open chest and trigger celebration modal
  const handleOpenChestAction = (chest: TreasureChest) => {
    if (chest.opened) return;
    setRecentlyOpenedChest(chest);
    setShowRewardModal(true);
    onOpenChest(chest.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[96vh] flex flex-col bg-gradient-to-b from-[#2e1c0c] via-[#221307] to-[#160c04] border-2 border-amber-600/70 rounded-2xl shadow-2xl overflow-hidden font-sans text-amber-50">
        {/* Ornate Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-950 via-[#3a200d] to-amber-950 border-b border-amber-700/60 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-md flex items-center justify-center">
              <span className="text-xl">🧭</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-game tracking-wide text-amber-200">
                  Поиск Сокровищ Долины
                </h2>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Ежедневная экспедиция
                </span>
              </div>
              <p className="text-xs text-amber-300/80">
                Ищите спрятанные тайники по компасу-радару на ферме и у соседей
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex rounded-lg bg-black/40 p-1 border border-amber-800/60">
              <button
                onClick={() => {
                  sound.playTap();
                  setActiveTab('map');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'map'
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : 'text-amber-300 hover:text-white'
                }`}
              >
                <span>🗺️</span>
                <span className="hidden sm:inline">Карта экспедиции</span>
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setActiveTab('artifacts');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'artifacts'
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : 'text-amber-300 hover:text-white'
                }`}
              >
                <span>🏛️</span>
                <span className="hidden sm:inline">Зал Реликвий</span>
                <span className="ml-1 px-1 rounded-full bg-black/40 text-[10px] text-amber-200 font-mono">
                  {treasureHuntState.unlockedArtifactIds.length}/{ANCIENT_ARTIFACTS.length}
                </span>
              </button>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-amber-300 hover:text-white transition-colors border border-amber-700/50"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5-Step Progress Chain Bar */}
        <div className="bg-[#1c0f05] px-4 py-2 border-b border-amber-900/60 flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-300">Сундуки дня:</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {treasureHuntState.activeChests.map((chest) => {
                const isCurrent = currentStepChest?.id === chest.id && !chest.opened;
                const isDone = chest.opened;
                const isDiscovered = chest.discovered;

                return (
                  <button
                    key={chest.id}
                    onClick={() => {
                      if (chest.discovered && !chest.opened) {
                        handleOpenChestAction(chest);
                      } else {
                        sound.playTap();
                      }
                    }}
                    className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border-2 transition-all ${
                      isDone
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                        : isCurrent
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 animate-pulse scale-105'
                        : isDiscovered
                        ? 'bg-yellow-950/80 border-yellow-500 text-yellow-300 animate-bounce-mini'
                        : 'bg-black/40 border-stone-700/70 text-stone-500 opacity-70'
                    }`}
                    title={`Шаг ${chest.step}: ${chest.name} (${isDone ? 'Открыт' : isDiscovered ? 'Найден! Откройте!' : 'Спрятан'})`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isDiscovered ? (
                      <span className="text-base animate-pulse">📦</span>
                    ) : isCurrent ? (
                      <span className="text-xs font-bold text-amber-300 font-mono">#{chest.step}</span>
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}

                    {/* Step multiplier badge */}
                    <span className="absolute -bottom-1.5 -right-1 text-[8px] font-bold px-1 rounded-sm bg-black/80 text-amber-300 border border-amber-700/60 leading-none">
                      x{chest.step === 5 ? '3.5' : (1 + (chest.step - 1) * 0.5).toFixed(1)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-amber-200/90 font-medium">
              Прогресс:{' '}
              <span className="font-bold text-amber-300">
                {chestsFoundTodayCount}/5 найдено
              </span>
            </div>
            {allChestsCompleted && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300">
                🎉 Экспедиция завершена!
              </span>
            )}
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gradient-to-b from-[#221307] to-[#150b03]">
          {activeTab === 'map' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
              {/* Left Column: Interactive Parchment Valley Map (8 cols) */}
              <div className="lg:col-span-8 flex flex-col gap-2">
                {/* Parchment Map Container */}
                <div
                  ref={mapRef}
                  onPointerMove={handleMapPointerMove}
                  onClick={handleMapClick}
                  className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-xl overflow-hidden border-2 border-[#b8860b]/70 shadow-2xl cursor-crosshair select-none touch-none bg-[#f4ead4]"
                  style={{
                    backgroundImage: `radial-gradient(#deb887 1px, transparent 1px), radial-gradient(#d2b48c 1px, #f4ead4 1px)`,
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px',
                  }}
                >
                  {/* Decorative Vintage Topographic Contours and Compass Rose Background */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern id="topoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#8b5a2b" strokeWidth="0.5" strokeDasharray="3,3" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#topoGrid)" />
                    {/* Winding River */}
                    <path
                      d="M 500,0 C 480,120 540,240 500,360 C 470,450 520,600 500,800"
                      fill="none"
                      stroke="#4682b4"
                      strokeWidth="24"
                      strokeOpacity="0.35"
                    />
                    <path
                      d="M 500,0 C 480,120 540,240 500,360 C 470,450 520,600 500,800"
                      fill="none"
                      stroke="#87ceeb"
                      strokeWidth="12"
                      strokeOpacity="0.5"
                    />
                  </svg>

                  {/* Sector dividing vintage dashed line */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0 border-r-2 border-dashed border-[#8b4513]/40 pointer-events-none flex flex-col justify-between py-2 items-center text-[10px] font-bold text-[#8b4513]/60">
                    <span className="bg-[#f4ead4]/90 px-1 rounded">← Наша Ферма</span>
                    <span className="bg-[#f4ead4]/90 px-1 rounded">Земли Соседей →</span>
                  </div>

                  {/* Map Landmarks Illustrations */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* 1. Apple orchard */}
                    <div className="absolute top-[26%] left-[20%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🍎🌳</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Яблоневый сад
                      </span>
                    </div>

                    {/* 2. Windmill on hill */}
                    <div className="absolute top-[52%] left-[28%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">💨🌾</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Мельница
                      </span>
                    </div>

                    {/* 3. Barn & cellar */}
                    <div className="absolute top-[32%] left-[42%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🏡🗝️</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Амбар & Погреб
                      </span>
                    </div>

                    {/* 4. Duck bridge */}
                    <div className="absolute top-[72%] left-[22%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🦆🪵</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Утиный мост
                      </span>
                    </div>

                    {/* 5. Flower greenhouse */}
                    <div className="absolute top-[70%] left-[44%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🌸🌻</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Оранжерея
                      </span>
                    </div>

                    {/* 6. Neighbor Kuzmich apiary */}
                    <div className="absolute top-[25%] left-[62%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🐝🍯</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Пасека Кузьмича
                      </span>
                    </div>

                    {/* 7. Anna's sunflower fields */}
                    <div className="absolute top-[30%] left-[80%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🌻☀️</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Поле подсолнухов
                      </span>
                    </div>

                    {/* 8. Chef Mark's river dock */}
                    <div className="absolute top-[58%] left-[66%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🎣⛵</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Речной причал
                      </span>
                    </div>

                    {/* 9. Horse meadow */}
                    <div className="absolute top-[65%] left-[82%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🐎🌾</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Конный выгон
                      </span>
                    </div>

                    {/* 10. Friendship stone arch */}
                    <div className="absolute top-[82%] left-[72%] -translate-x-1/2 -translate-y-1/2 text-center opacity-85">
                      <div className="text-xl sm:text-2xl drop-shadow">🏛️🌿</div>
                      <span className="text-[9px] font-bold text-[#5c3a21] bg-[#fdf6e2]/80 px-1 rounded shadow-xs">
                        Арка дружбы
                      </span>
                    </div>
                  </div>

                  {/* Radar Scanner Beacon (when user uses compass scan) */}
                  {scanBeacon && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                      style={{ left: `${scanBeacon.x}%`, top: `${scanBeacon.y}%` }}
                    >
                      <div className="w-24 h-24 rounded-full border-2 border-amber-500/80 bg-amber-400/20 animate-ping" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl animate-bounce">✨</span>
                      </div>
                    </div>
                  )}

                  {/* Render all chests on the map: completed or discovered */}
                  {treasureHuntState.activeChests.map((chest) => {
                    const isTarget = currentStepChest?.id === chest.id;
                    const canShow = chest.opened || chest.discovered;

                    if (!canShow) return null;

                    return (
                      <div
                        key={chest.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (chest.discovered && !chest.opened) {
                            handleOpenChestAction(chest);
                          }
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform hover:scale-125 ${
                          chest.opened ? 'opacity-80' : 'animate-bounce-mini'
                        }`}
                        style={{ left: `${chest.x}%`, top: `${chest.y}%` }}
                      >
                        <div
                          className={`flex items-center justify-center p-1.5 rounded-xl border-2 shadow-lg ${
                            chest.opened
                              ? 'bg-stone-800/90 border-stone-500 text-stone-300'
                              : 'bg-amber-500 border-amber-200 text-amber-950 ring-4 ring-amber-400/60'
                          }`}
                        >
                          <span className="text-xl">
                            {chest.opened ? '📭' : chest.tier === 'gold' ? '👑' : '📦'}
                          </span>
                        </div>
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-amber-200 border border-amber-600/60 shadow-md">
                          {chest.opened ? '✓ Открыт' : 'Нажмите!'}
                        </div>
                      </div>
                    );
                  })}

                  {/* Cursor detector crosshair ripple on hover */}
                  {!allChestsCompleted && (
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 transition-transform duration-75 ease-out"
                      style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
                    >
                      <div
                        className={`w-12 h-12 rounded-full border-2 border-dashed ${
                          proximity.border
                        } ${proximity.bg} transition-colors flex items-center justify-center ${
                          proximity.level === 'found' ? 'scale-125 animate-pulse' : ''
                        }`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      </div>
                    </div>
                  )}

                  {/* Vintage Compass Rose in Corner */}
                  <div className="absolute bottom-2 right-2 pointer-events-none opacity-40">
                    <div className="w-12 h-12 rounded-full border border-[#8b4513] flex items-center justify-center text-[10px] font-serif font-bold text-[#8b4513]">
                      <span>N</span>
                    </div>
                  </div>

                  {/* Bottom Map Status Bar */}
                  <div className="absolute bottom-1.5 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
                    <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-amber-700/60 text-xs font-medium text-amber-200 flex items-center gap-1.5 shadow-md">
                      <span>📍 Локация цели:</span>
                      <span className="font-bold text-amber-300">
                        {currentStepChest ? currentStepChest.locationName : 'Все локации пройдены'}
                      </span>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-amber-700/60 text-xs font-bold shadow-md flex items-center gap-1.5">
                      <span className="text-stone-300">Сектор:</span>
                      <span
                        className={
                          currentStepChest?.sector === 'my_farm' ? 'text-emerald-300' : 'text-sky-300'
                        }
                      >
                        {currentStepChest?.sector === 'my_farm' ? '🌿 Наша Ферма' : '🤝 У Соседей'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map hint & action prompt */}
                <div className="flex items-center justify-between text-xs text-amber-200/80 bg-black/30 px-3 py-1.5 rounded-lg border border-amber-900/50">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      Водите курсором по карте и следите за компасом. При приближении к тайнику нажмите, чтобы выкопать!
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Brass Compass Radar & Current Target Controls (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-3">
                {/* Brass Compass Detector Housing */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-b from-[#3a200d] via-[#2a1709] to-[#1c0f05] border-2 border-amber-500/70 shadow-xl relative overflow-hidden">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Компас-Детектор</span>
                  </div>

                  {/* Circular Compass Dial */}
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-[#160c04] via-[#241306] to-[#3a200d] border-4 border-[#b8860b] shadow-2xl p-1 flex items-center justify-center">
                    {/* Outer Degree Marks */}
                    <div className="absolute inset-1 rounded-full border border-amber-600/40 flex items-center justify-center">
                      <span className="absolute top-1 text-[9px] font-bold text-amber-300 font-serif">N</span>
                      <span className="absolute bottom-1 text-[9px] font-bold text-amber-300 font-serif">S</span>
                      <span className="absolute left-1.5 text-[9px] font-bold text-amber-300 font-serif">W</span>
                      <span className="absolute right-1.5 text-[9px] font-bold text-amber-300 font-serif">E</span>
                    </div>

                    {/* Rotating Magnetic Needle */}
                    <div
                      className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
                      style={{
                        transform: `rotate(${allChestsCompleted ? 0 : needleAngle}deg)`,
                      }}
                    >
                      {/* North Tip (Ruby Red) */}
                      <div className="absolute top-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[50px] border-b-rose-600 drop-shadow-md" />
                      {/* South Tip (Silver Steel) */}
                      <div className="absolute bottom-2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[50px] border-t-stone-300 drop-shadow-md" />
                      {/* Brass Center Cap */}
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 border-2 border-amber-950 z-10 shadow-sm" />
                    </div>

                    {/* Glass glare highlight */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                  </div>

                  {/* Distance Proximity Indicator */}
                  <div className="mt-3 w-full">
                    <div
                      className={`w-full py-1.5 px-3 rounded-lg border text-center font-bold text-sm shadow-md transition-all ${
                        proximity.bg
                      } ${proximity.border} ${proximity.color}`}
                    >
                      {proximity.text}
                    </div>
                  </div>

                  {/* Dig / Open Button when Chest is Discovered */}
                  {currentStepChest && !currentStepChest.opened && (
                    <div className="mt-3 w-full">
                      {currentStepChest.discovered ? (
                        <button
                          onClick={() => handleOpenChestAction(currentStepChest)}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-bold font-game text-sm shadow-lg border border-yellow-200 transition-transform active:scale-95 animate-bounce-mini cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4 text-amber-900" />
                          <span>ОТКРЫТЬ СУНДУК! 🗝️</span>
                        </button>
                      ) : distance < 8.5 ? (
                        <button
                          onClick={() => onDiscoverChest(currentStepChest.id)}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md border border-teal-300 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>⛏️</span>
                          <span>Выкопать тайник!</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleTriggerScanner}
                          disabled={isScanning}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-amber-100 font-semibold text-xs shadow-md border border-amber-500/60 transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Search className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                          <span>Использовать радар 🧭</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Current Target Details Card */}
                {currentStepChest && (
                  <div className="p-3.5 rounded-xl bg-black/40 border border-amber-800/60 flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-amber-900/60 pb-1.5">
                      <span className="text-xs font-bold text-amber-300">
                        Цель #{currentStepChest.step}: {currentStepChest.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {currentStepChest.step === 5 ? '⭐ Финал' : `Шаг ${currentStepChest.step}/5`}
                      </span>
                    </div>

                    <div className="text-xs text-amber-200/90 leading-relaxed">
                      <span className="font-semibold text-amber-300">Подсказка: </span>
                      Спрятан в окрестностях «{currentStepChest.locationName}».
                    </div>

                    {/* Rewards Preview */}
                    <div className="mt-1 pt-1.5 border-t border-amber-900/40">
                      <span className="text-[11px] font-semibold text-amber-400/90 block mb-1">
                        Награда за открытие:
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-700/60 text-amber-300 font-bold">
                          +{currentStepChest.rewards.coins} 🪙
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-700/60 text-sky-300 font-bold">
                          +{currentStepChest.rewards.gems} 💎
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-700/60 text-purple-300 font-bold">
                          +{currentStepChest.rewards.xp} XP
                        </span>
                        {currentStepChest.rewards.artifact && (
                          <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-600 to-yellow-500 text-stone-950 font-bold shadow-xs">
                            🏺 Реликвия!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fast travel to journal artifacts showcase */}
                {onOpenJournal && (
                  <button
                    onClick={() => {
                      sound.playTap();
                      onOpenJournal();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-black/30 hover:bg-black/50 border border-amber-700/50 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>📜</span>
                    <span>Открыть Дневник Фермера</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Artifacts Collection Showcase */
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-black/40 p-3 rounded-xl border border-amber-800/60">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-amber-200 font-game flex items-center gap-2">
                    <span>🏛️</span>
                    <span>Древние Реликвии Солнечной Долины</span>
                  </h3>
                  <p className="text-xs text-amber-300/80">
                    Найденные артефакты наделяют ферму постоянными пассивными бонусами
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300">
                    Собрано:{' '}
                    <span className="text-amber-100 font-mono text-sm">
                      {treasureHuntState.unlockedArtifactIds.length}/{ANCIENT_ARTIFACTS.length}
                    </span>
                  </span>
                </div>
              </div>

              {/* Artifacts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ANCIENT_ARTIFACTS.map((artifact) => {
                  const isUnlocked = treasureHuntState.unlockedArtifactIds.includes(artifact.id);

                  return (
                    <div
                      key={artifact.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedArtifactForInspect(artifact);
                      }}
                      className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isUnlocked
                          ? 'bg-gradient-to-b from-[#3a2310] to-[#251508] border-amber-500/80 hover:border-amber-300 shadow-lg hover:scale-[1.02]'
                          : 'bg-black/40 border-stone-800 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                            isUnlocked
                              ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 border-amber-200 shadow-md'
                              : 'bg-stone-900 border-stone-700 text-stone-600'
                          }`}
                        >
                          {isUnlocked ? artifact.emoji : '❓'}
                        </div>

                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            artifact.rarity === 'legendary'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                              : artifact.rarity === 'epic'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-400/50'
                              : 'bg-blue-500/20 text-blue-300 border-blue-400/50'
                          }`}
                        >
                          {artifact.rarity === 'legendary'
                            ? 'Легенда'
                            : artifact.rarity === 'epic'
                            ? 'Эпик'
                            : 'Редкий'}
                        </span>
                      </div>

                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            isUnlocked ? 'text-amber-200' : 'text-stone-400 font-mono'
                          }`}
                        >
                          {isUnlocked ? artifact.name : 'Неизвестная реликвия'}
                        </h4>
                        <p className="text-[11px] text-amber-300/70 line-clamp-2 mt-0.5">
                          {isUnlocked
                            ? artifact.description
                            : 'Спрятан в золотых реликвариях ежедневных поисков.'}
                        </p>
                      </div>

                      {/* Perk badge */}
                      <div
                        className={`text-[10px] font-bold p-1.5 rounded-lg border ${
                          isUnlocked
                            ? 'bg-emerald-950/70 border-emerald-600/70 text-emerald-300'
                            : 'bg-stone-900 border-stone-800 text-stone-500'
                        }`}
                      >
                        {isUnlocked ? `✨ ${artifact.perk}` : '🔒 Эффект скрыт'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-gradient-to-r from-amber-950 via-[#3a200d] to-amber-950 border-t border-amber-800/60 flex items-center justify-between text-xs text-amber-300/80">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Новая серия из 5 сундуков обновляется каждый день автоматически!</span>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshDaily && (
              <button
                onClick={() => {
                  sound.playTap();
                  onRefreshDaily();
                }}
                className="text-[11px] font-semibold text-amber-400 hover:text-white underline cursor-pointer"
                title="Обновить карту вручную"
              >
                Обновить карту
              </button>
            )}
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              Готово
            </button>
          </div>
        </div>

        {/* Chest Open Celebration Modal Overlay */}
        {showRewardModal && recentlyOpenedChest && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-gradient-to-b from-[#3a210d] via-[#281508] to-[#1a0c03] border-2 border-amber-400 shadow-2xl text-center flex flex-col items-center gap-3">
              {/* Golden Rays Background Accent */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none opacity-20 bg-[radial-gradient(circle,rgba(251,191,36,0.8)_0%,transparent_70%)]" />

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 shadow-2xl flex items-center justify-center animate-bounce-mini border-2 border-yellow-200">
                <span className="text-4xl">👑</span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-0.5">
                  Шаг {recentlyOpenedChest.step} из 5 завершён!
                </span>
                <h3 className="text-xl font-bold font-game text-amber-200">
                  {recentlyOpenedChest.name} Открыт!
                </h3>
                <p className="text-xs text-amber-300/80 mt-1">
                  Локация: «{recentlyOpenedChest.locationName}»
                </p>
              </div>

              {/* Rewards List */}
              <div className="w-full bg-black/50 p-3 rounded-xl border border-amber-700/60 flex flex-col gap-2 my-1">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Полученные трофеи:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-600/70 text-amber-300 flex items-center justify-center gap-1.5">
                    <span className="text-base">🪙</span>
                    <span>+{recentlyOpenedChest.rewards.coins} Монет</span>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-600/70 text-sky-300 flex items-center justify-center gap-1.5">
                    <span className="text-base">💎</span>
                    <span>+{recentlyOpenedChest.rewards.gems} Гемов</span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-600/70 text-purple-300 flex items-center justify-center gap-1.5">
                    <span className="text-base">⭐</span>
                    <span>+{recentlyOpenedChest.rewards.xp} XP</span>
                  </div>
                  {recentlyOpenedChest.rewards.bonusItem && (
                    <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 flex items-center justify-center gap-1.5">
                      <span className="text-base">{recentlyOpenedChest.rewards.bonusItem.emoji}</span>
                      <span>+{recentlyOpenedChest.rewards.bonusItem.count} {recentlyOpenedChest.rewards.bonusItem.name}</span>
                    </div>
                  )}
                </div>

                {/* If Ancient Artifact Unlocked! */}
                {recentlyOpenedChest.rewards.artifact && (
                  <div className="mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-600/30 via-yellow-500/30 to-amber-600/30 border-2 border-amber-400 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{recentlyOpenedChest.rewards.artifact.emoji}</span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                          Древняя Реликвия Долины!
                        </span>
                        <h4 className="text-sm font-bold text-amber-100 font-game">
                          {recentlyOpenedChest.rewards.artifact.name}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-amber-200/90 italic">
                      «{recentlyOpenedChest.rewards.artifact.description}»
                    </p>
                    <div className="mt-1.5 text-xs font-bold text-emerald-300 bg-black/40 px-2 py-1 rounded border border-emerald-600/60">
                      Дар: {recentlyOpenedChest.rewards.artifact.perk}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  setShowRewardModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-bold font-game text-sm shadow-lg border border-yellow-200 transition-transform active:scale-95 cursor-pointer"
              >
                Отлично! Забрать награду 🎁
              </button>
            </div>
          </div>
        )}

        {/* Artifact Inspect Modal */}
        {selectedArtifactForInspect && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-sm p-5 rounded-2xl bg-[#281508] border-2 border-amber-500 shadow-2xl text-center flex flex-col items-center gap-3">
              <button
                onClick={() => setSelectedArtifactForInspect(null)}
                className="absolute top-3 right-3 p-1 rounded-lg bg-black/40 text-amber-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-1 flex items-center justify-center text-3xl shadow-md border border-amber-200">
                {selectedArtifactForInspect.emoji}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {selectedArtifactForInspect.rarity === 'legendary'
                    ? 'Легендарная Реликвия'
                    : selectedArtifactForInspect.rarity === 'epic'
                    ? 'Эпический Артефакт'
                    : 'Редкий Артефакт'}
                </span>
                <h3 className="text-base font-bold font-game text-amber-200">
                  {selectedArtifactForInspect.name}
                </h3>
              </div>

              <p className="text-xs text-amber-200/90 leading-relaxed text-left bg-black/40 p-2.5 rounded-lg border border-amber-800/50">
                {selectedArtifactForInspect.description}
              </p>

              <div className="text-xs text-amber-300/80 italic text-left w-full">
                Лор: {selectedArtifactForInspect.lore}
              </div>

              <div className="w-full text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-600/70 p-2 rounded-lg text-left">
                Постоянный бонус: {selectedArtifactForInspect.perk}
              </div>

              <button
                onClick={() => setSelectedArtifactForInspect(null)}
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
