import React, { useState } from 'react';
import { Lock, Droplets, Sparkles, CheckCheck, CloudSun, ChevronDown, Calendar, Layers } from 'lucide-react';
import { ActiveTool, CropId, FarmPlot, OrchardTree, SeasonId, WeatherType, NpcQuest } from '../types/game';
import { CROPS, WEATHER_CONFIG } from '../utils/constants';
import { SEASONS_CONFIG, getCalendarMonthName } from '../utils/seasonalData';
import { DECORATIONS_CATALOG, getAestheticRank } from '../utils/decorationsData';
import { SeasonalDecorations } from './SeasonalDecorations';
import { NpcVisitorsRoad } from './NpcVisitorsRoad';

interface FieldsViewProps {
  plots: FarmPlot[];
  trees: OrchardTree[];
  level: number;
  coins: number;
  activeTool: ActiveTool;
  selectedCropId: CropId;
  weather: WeatherType;
  season: SeasonId;
  placedDecorations?: string[];
  onSelectTool: (tool: ActiveTool) => void;
  onSelectCrop: (cropId: CropId) => void;
  onPlant: (plotId: number) => void;
  onWater: (plotId: number) => void;
  onFertilize: (plotId: number) => void;
  onHarvest: (plotId: number) => void;
  onUnlockPlot: (plotId: number) => void;
  onHarvestTree: (treeId: string) => void;
  onOpenFishing: () => void;
  onChangeWeather?: (w: WeatherType) => void;
  onInteractDecoration: (decorationId: string) => void;
  onInteractPlacedDecoration?: (decorId: string) => void;
  onOpenSeasonalModal: () => void;
  onOpenDecorShop?: () => void;
  onOpenJournal?: () => void;
  onOpenQuests?: (questId?: string) => void;
  onOpenInteractionsHub?: () => void;
  onOpenMap?: () => void;
  incomingGiftsCount?: number;
  isSeasonalSurpriseAvailable: boolean;
  npcQuests?: NpcQuest[];
  inventory?: Record<string, number>;
}

export const FieldsView: React.FC<FieldsViewProps> = ({
  plots,
  trees,
  level,
  coins,
  activeTool,
  selectedCropId,
  weather,
  season,
  placedDecorations = [],
  isSeasonalSurpriseAvailable,
  onSelectTool,
  onSelectCrop,
  onPlant,
  onWater,
  onFertilize,
  onHarvest,
  onUnlockPlot,
  onHarvestTree,
  onOpenFishing,
  onChangeWeather,
  onInteractDecoration,
  onInteractPlacedDecoration,
  onOpenSeasonalModal,
  onOpenDecorShop,
  onOpenJournal,
  onOpenQuests,
  onOpenInteractionsHub,
  onOpenMap,
  incomingGiftsCount = 0,
  npcQuests = [],
  inventory = {},
}) => {
  const [showWeatherSelector, setShowWeatherSelector] = useState<boolean>(false);
  const [cropFilter, setCropFilter] = useState<'all' | 'seasonal' | 'standard'>('all');
  const now = Date.now();

  const weatherCfg = WEATHER_CONFIG[weather] || WEATHER_CONFIG.sunny;
  const seasonCfg = SEASONS_CONFIG[season];
  const currentMonthName = getCalendarMonthName();

  // Helper to check progress with dynamic weather & seasonal modifier
  const getPlotGrowth = (plot: FarmPlot) => {
    if (!plot.cropId || !plot.plantedAt) return { percent: 0, isReady: false, remainingSec: 0, speedMultiplier: 1.0 };
    const crop = CROPS[plot.cropId];
    if (!crop) return { percent: 0, isReady: false, remainingSec: 0, speedMultiplier: 1.0 };

    let seasonalBonus = 1.0;
    if (crop.season && crop.season === season) {
      seasonalBonus = 1.45;
    } else if (season === 'autumn' && (crop.id === 'pumpkin' || crop.id === 'wheat' || crop.id === 'hazelnut' || crop.id === 'lingonberry')) {
      seasonalBonus = 1.4;
    } else if (season === 'spring' && (crop.id === 'carrot' || crop.id === 'strawberry' || crop.id === 'tulip' || crop.id === 'green_peas')) {
      seasonalBonus = 1.4;
    } else if (season === 'summer' && (crop.id === 'corn' || crop.id === 'sunflower' || crop.id === 'watermelon' || crop.id === 'peach' || crop.id === 'bell_pepper')) {
      seasonalBonus = 1.4;
    } else if (season === 'winter' && (crop.id === 'winterberry' || crop.id === 'pinecone')) {
      seasonalBonus = 1.45;
    }

    const baseWaterSpeed = plot.watered ? 1.5 : 1.0;
    const speed = plot.fertilized ? 999 : baseWaterSpeed * weatherCfg.speedMultiplier * seasonalBonus;
    const totalMs = (crop.growthTime * 1000) / speed;
    const elapsed = now - plot.plantedAt;
    const percent = Math.min(100, Math.floor((elapsed / totalMs) * 100));
    const isReady = elapsed >= totalMs;
    const remainingSec = Math.max(0, Math.ceil((totalMs - elapsed) / 1000));

    return { percent, isReady, remainingSec, speedMultiplier: weatherCfg.speedMultiplier * seasonalBonus };
  };

  // Check how many are ready
  const readyPlots = plots.filter((p) => p.unlocked && getPlotGrowth(p).isReady);
  const unwateredPlots = plots.filter((p) => p.unlocked && p.cropId && !p.watered && !getPlotGrowth(p).isReady);

  const handlePlotClick = (plot: FarmPlot) => {
    if (!plot.unlocked) {
      onUnlockPlot(plot.id);
      return;
    }

    const growth = getPlotGrowth(plot);

    // If already ready, harvest regardless of active tool for convenience!
    if (growth.isReady) {
      onHarvest(plot.id);
      return;
    }

    if (!plot.cropId) {
      // Empty plot: plant current selected crop
      onPlant(plot.id);
      return;
    }

    // Growing plot
    if (activeTool === 'water' && !plot.watered) {
      onWater(plot.id);
      return;
    }

    if (activeTool === 'fertilizer' && !growth.isReady) {
      onFertilize(plot.id);
      return;
    }

    // Default action: if not watered, water it; otherwise show remaining time
    if (!plot.watered) {
      onWater(plot.id);
    } else {
      onHarvest(plot.id); // shows remaining time toast
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-3 px-3">
      {/* Weather & Day Sky Ambience banner with active buff indicator */}
      <div className="mt-2.5 mb-2 relative">
        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-100 shadow-sm">
          <div className="flex items-center gap-1.5 font-medium flex-1 min-w-0">
            <span className="text-base shrink-0">{weatherCfg.icon}</span>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-bold text-white text-xs">{weatherCfg.name}</span>
                <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1 rounded border border-amber-600/50">
                  {weatherCfg.badge}
                </span>
              </div>
              <span className="text-[10px] text-emerald-300 truncate">
                {weatherCfg.description}
              </span>
            </div>
          </div>

          {/* Weather Switcher & Quick Batch Actions */}
          <div className="flex items-center gap-1 shrink-0 ml-1.5">
            {onChangeWeather && (
              <button
                onClick={() => setShowWeatherSelector(!showWeatherSelector)}
                className="p-1 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-amber-200 border border-emerald-700/60 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px] font-semibold"
                title="Сменить погоду"
              >
                <CloudSun className="w-3.5 h-3.5" />
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
            )}

            {readyPlots.length > 0 && (
              <button
                onClick={() => readyPlots.forEach((p) => onHarvest(p.id))}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded-lg text-[11px] shadow-sm cursor-pointer transition-transform active:scale-95"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Собрать ({readyPlots.length})</span>
              </button>
            )}
            {unwateredPlots.length > 0 && weather !== 'rain' && (
              <button
                onClick={() => unwateredPlots.forEach((p) => onWater(p.id))}
                className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-bold px-2 py-0.5 rounded-lg text-[11px] shadow-sm cursor-pointer transition-transform active:scale-95"
              >
                <Droplets className="w-3 h-3" />
                <span>Полить</span>
              </button>
            )}
          </div>
        </div>

        {/* Weather Selector Dropdown */}
        {showWeatherSelector && onChangeWeather && (
          <div className="absolute top-full left-0 right-0 mt-1 z-30 p-2 rounded-2xl bg-emerald-950/95 border border-emerald-600/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <span className="text-[10px] font-bold text-amber-200 block mb-1.5 px-1">
              Выберите погоду на ферме:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {Object.values(WEATHER_CONFIG).map((cfg) => (
                <button
                  key={cfg.type}
                  onClick={() => {
                    onChangeWeather(cfg.type);
                    setShowWeatherSelector(false);
                  }}
                  className={`p-1.5 rounded-xl border text-left flex items-center gap-1.5 transition-all cursor-pointer ${
                    weather === cfg.type
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-emerald-900/40 border-emerald-800/60 text-emerald-100 hover:bg-emerald-850'
                  }`}
                >
                  <span className="text-xl">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold block truncate leading-tight text-white">{cfg.name}</span>
                    <span className="text-[9px] text-amber-300 block truncate">{cfg.badge}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seasonal Decorations & Interactive Props Section */}
      <div className="mb-2.5">
        {/* Season header bar with current month and modal trigger */}
        <div
          onClick={onOpenSeasonalModal}
          className="flex items-center justify-between text-xs px-2.5 py-1.5 mb-1 rounded-xl bg-gradient-to-r from-stone-900/90 via-amber-950/70 to-stone-900/90 border border-amber-600/50 text-amber-100 shadow-sm cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center gap-1.5 font-medium min-w-0">
            <span className="text-base shrink-0">{seasonCfg.icon}</span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-white text-xs truncate">{seasonCfg.name}</span>
              <span className="text-[9px] text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-600/50 shrink-0">
                {currentMonthName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-300 font-bold shrink-0 ml-1">
            <span>{seasonCfg.tagline.split(' ')[0]}</span>
            <span>⚙️</span>
          </div>
        </div>

        {/* Centerpiece interactive seasonal figures */}
        <SeasonalDecorations
          season={season}
          isSurpriseAvailable={isSeasonalSurpriseAvailable}
          onInteractDecoration={onInteractDecoration}
        />
      </div>

      {/* Active NPC Visitors Road (Сельская Дорога с Гостями и Квестами) */}
      {npcQuests && npcQuests.length > 0 && onOpenQuests && (
        <NpcVisitorsRoad
          npcQuests={npcQuests}
          inventory={inventory}
          onOpenQuests={(questId) => onOpenQuests(questId)}
        />
      )}

      {/* Farm Aesthetic Decorations Promenade (Аллея Декораций Фермы) */}
      <div className="mb-3 bg-gradient-to-r from-stone-900/90 via-emerald-950/80 to-stone-900/90 border border-amber-600/40 rounded-2xl p-2.5 shadow-md">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">⛲</span>
            <div>
              <span className="text-xs font-black text-amber-200 block leading-tight">
                Сад Декора & Эстетики
              </span>
              <span className="text-[10px] text-emerald-300">
                {placedDecorations.length > 0
                  ? `Размещено ${placedDecorations.length} украшений • Нажмите для эффекта`
                  : 'Украсьте ферму в Магазине Декора!'}
              </span>
            </div>
          </div>

          {onOpenDecorShop && (
            <button
              onClick={onOpenDecorShop}
              className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Магазин</span>
            </button>
          )}
        </div>

        {placedDecorations.length > 0 ? (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {placedDecorations.map((decorId) => {
              const item = DECORATIONS_CATALOG.find((d) => d.id === decorId);
              if (!item) return null;
              return (
                <button
                  key={decorId}
                  onClick={() => onInteractPlacedDecoration && onInteractPlacedDecoration(decorId)}
                  className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-950/70 border border-emerald-600/40 hover:border-amber-400 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 min-w-[76px] group shadow-sm text-center"
                  title={`${item.name} (${item.perk})`}
                >
                  <span className="text-2xl filter drop-shadow-sm group-hover:animate-bounce-mini mb-0.5">
                    {item.emoji}
                  </span>
                  <span className="text-[9.5px] font-extrabold text-stone-200 truncate max-w-[72px] leading-tight">
                    {item.name}
                  </span>
                  <span className="text-[8.5px] text-amber-300/90 font-bold mt-0.5">
                    ⭐ +{item.aestheticPoints}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-center rounded-xl bg-stone-950/50 border border-stone-800">
            <p className="text-[11px] text-stone-300 mb-1.5">
              У вас пока нет установленных декораций.
            </p>
            {onOpenDecorShop && (
              <button
                onClick={onOpenDecorShop}
                className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Купить украшения в Магазине ⛲
              </button>
            )}
          </div>
        )}
      </div>

      {/* Farmer's Journal & NPC Quests & Player Interactions & Map Quick Access Strip */}
      {(onOpenJournal || onOpenQuests || onOpenInteractionsHub || onOpenMap) && (
        <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-teal-950/90 via-stone-900 to-emerald-950/90 border border-teal-500/50 hover:border-teal-350 text-left transition-all active:scale-97 cursor-pointer shadow-md group flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  🗺️
                </div>
                <div>
                  <span className="text-xs font-bold text-teal-200 block leading-tight font-game">
                    Карта Фермы
                  </span>
                  <span className="text-[10px] text-teal-300/70">
                    Все секторы
                  </span>
                </div>
              </div>
              <span className="text-xs text-teal-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                ▶
              </span>
            </button>
          )}

          {onOpenJournal && (
            <button
              onClick={onOpenJournal}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-[#3b200d] via-[#2d1808] to-[#1c0f05] border border-[#784720] hover:border-amber-400 text-left transition-all active:scale-97 cursor-pointer shadow-md group flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  📖
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-200 block leading-tight font-game">
                    Дневник
                  </span>
                  <span className="text-[10px] text-amber-300/70">
                    Хроника побед
                  </span>
                </div>
              </div>
              <span className="text-xs text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                ▶
              </span>
            </button>
          )}

          {onOpenQuests && (
            <button
              onClick={() => onOpenQuests()}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-950/80 via-stone-900 to-stone-950 border border-amber-600/50 hover:border-amber-400 text-left transition-all active:scale-97 cursor-pointer shadow-md group flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                  📜
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-200 block leading-tight font-game">
                    Квесты NPC
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Испытания
                  </span>
                </div>
              </div>
              <span className="text-xs text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                ▶
              </span>
            </button>
          )}

          {onOpenInteractionsHub && (
            <button
              onClick={onOpenInteractionsHub}
              className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-950/80 via-stone-900 to-amber-950/80 border border-rose-600/50 hover:border-rose-400 text-left transition-all active:scale-97 cursor-pointer shadow-md group flex items-center justify-between col-span-2 sm:col-span-1"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-lg group-hover:scale-110 transition-transform relative">
                  🤝
                  {incomingGiftsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-600 rounded-full border border-white text-[8px] font-bold text-white flex items-center justify-center">
                      {incomingGiftsCount}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-200 block leading-tight font-game">
                    Друзья & Подарки
                  </span>
                  <span className="text-[10px] text-rose-300/70">
                    {incomingGiftsCount > 0 ? `Подарков: ${incomingGiftsCount}` : 'Взаимодействие'}
                  </span>
                </div>
              </div>
              <span className="text-xs text-rose-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                ▶
              </span>
            </button>
          )}
        </div>
      )}

      {/* Orchard Section (Сад деревьев) */}
      <div className="mb-3 bg-gradient-to-r from-emerald-900/80 via-emerald-800/80 to-emerald-900/80 border border-emerald-600/40 rounded-2xl p-2.5 shadow-md">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
            <span>🌳</span> Фруктовый Сад
          </span>
          <span className="text-[10px] text-emerald-300">Нажмите, чтобы собрать плоды</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {trees.map((tree) => {
            return (
              <button
                key={tree.id}
                onClick={() => onHarvestTree(tree.id)}
                className={`relative flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  tree.isReady
                    ? 'bg-gradient-to-b from-amber-600/30 to-emerald-900/70 border-amber-400/80 shadow-md ring-1 ring-amber-400/50 scale-101'
                    : 'bg-emerald-950/60 border-emerald-700/50 opacity-90'
                }`}
              >
                <div className={`text-2xl ${tree.isReady ? 'animate-bounce-mini' : ''}`}>
                  {tree.emoji}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-bold text-white truncate">{tree.name}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {tree.isReady ? (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-1.5 py-0.5 rounded-md border border-amber-500/50">
                        Собрать x{tree.count} {tree.emoji}
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-300">Созревает...</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Country Pond & Fishing Mini-Game Banner */}
      <div className="mb-3">
        <button
          onClick={onOpenFishing}
          className="w-full bg-gradient-to-r from-teal-900/90 via-sky-900/80 to-emerald-900/90 border border-teal-500/60 rounded-2xl p-2.5 shadow-md flex items-center justify-between transition-all hover:border-teal-400 active:scale-98 cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-400/60 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🎣
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-200">Деревенский Пруд</span>
                <span className="text-[9px] bg-teal-500/20 text-teal-300 font-bold px-1.5 py-0.2 rounded-full border border-teal-400/40">
                  Мини-игра
                </span>
              </div>
              <span className="text-[10px] text-teal-100/90 block mt-0.5">
                Ловите рыбу и бабочек, пока созревает урожай! 🐟🦋
              </span>
            </div>
          </div>
          <div className="bg-teal-700/70 group-hover:bg-teal-600 text-teal-100 px-2.5 py-1 rounded-xl text-xs font-bold border border-teal-400/50 shadow-sm shrink-0">
            Рыбачить ➔
          </div>
        </button>
      </div>

      {/* Plots Grid Title */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-emerald-100 flex items-center gap-1">
          <span>🌱</span> Грядки ({plots.filter((p) => p.unlocked).length}/{plots.length})
        </span>
        <span className="text-[10px] text-emerald-300">
          Инструмент: {activeTool === 'seed' ? `Посев (${CROPS[selectedCropId]?.name})` : activeTool === 'water' ? 'Полив' : activeTool === 'fertilizer' ? 'Удобрение' : 'Сбор урожая'}
        </span>
      </div>

      {/* 12 Farm Plots Grid (Responsive for Mobile, Landscape & Tablet) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5 mb-3">
        {plots.map((plot) => {
          if (!plot.unlocked) {
            const canAfford = coins >= plot.unlockCost && level >= plot.unlockLevel;
            return (
              <button
                key={plot.id}
                onClick={() => onUnlockPlot(plot.id)}
                className="relative aspect-square rounded-2xl bg-stone-900/80 border-2 border-dashed border-stone-600/70 p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:border-amber-500/60 active:scale-95 shadow-inner"
              >
                <Lock className="w-5 h-5 text-stone-400 mb-1" />
                <span className="text-[10px] font-bold text-stone-300">Ур. {plot.unlockLevel}</span>
                <span className="text-[10px] font-semibold text-amber-400 mt-0.5">{plot.unlockCost} 🪙</span>
                {canAfford && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[8px] font-extrabold px-1 rounded-full animate-pulse">
                    ОТКРЫТЬ
                  </span>
                )}
              </button>
            );
          }

          const growth = getPlotGrowth(plot);
          const crop = plot.cropId ? CROPS[plot.cropId] : null;

          return (
            <button
              key={plot.id}
              onClick={() => handlePlotClick(plot)}
              className={`relative aspect-square rounded-2xl p-1.5 flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 select-none shadow-md ${
                plot.watered
                  ? 'bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 border-2 border-sky-500/70 ring-1 ring-sky-400/40'
                  : 'bg-gradient-to-b from-amber-900 via-stone-900 to-amber-950 border-2 border-amber-800/80'
              } ${growth.isReady ? 'ring-2 ring-amber-400 animate-pulse-glow bg-amber-950/90' : ''}`}
            >
              {/* Soil Rows Visual Pattern */}
              <div className="absolute inset-0 opacity-15 rounded-2xl bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

              {/* Water indicator */}
              {plot.watered && (
                <div className="absolute top-1 right-1 flex items-center bg-sky-950/80 border border-sky-400/60 rounded-full px-1 py-0.2 text-[9px] text-sky-300 font-bold">
                  💧
                </div>
              )}

              {/* Empty Plot */}
              {!plot.cropId && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-amber-900/40 border border-amber-700/50 flex items-center justify-center text-amber-400 text-lg mb-1">
                    +
                  </div>
                  <span className="text-[10px] text-amber-200/80 font-medium">Посадить</span>
                </div>
              )}

              {/* Growing / Ready Plot */}
              {plot.cropId && crop && (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    {growth.isReady ? (
                      <div className="flex flex-col items-center animate-bounce-mini">
                        <span className="text-3xl filter drop-shadow-md">{crop.emoji}</span>
                        <span className="text-[9px] font-extrabold text-amber-300 bg-amber-950/80 border border-amber-400/70 px-1 rounded-md mt-0.5">
                          СПЕЛО!
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-xl opacity-90">
                          {growth.percent < 40 ? '🌱' : growth.percent < 75 ? '🌿' : crop.emoji}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-200 mt-1 flex items-center justify-center gap-0.5">
                          <span>{growth.remainingSec}с</span>
                          {weatherCfg.speedMultiplier > 1.0 && (
                            <span className="text-[7.5px] font-extrabold text-amber-300 bg-amber-950/80 px-0.5 rounded border border-amber-500/40">
                              ⚡{weatherCfg.speedMultiplier}x
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {!growth.isReady && (
                    <div className="w-full bg-stone-950/80 rounded-full h-1.5 overflow-hidden border border-emerald-800/60 mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${growth.percent}%` }}
                      />
                    </div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbelt & Seed Selector */}
      <div className="bg-emerald-950/90 border border-emerald-700/60 rounded-2xl p-2.5 shadow-lg">
        {/* Tool Mode Buttons */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
          <button
            onClick={() => onSelectTool('hand')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'hand'
                ? 'bg-amber-500 text-amber-950 shadow-md ring-1 ring-amber-300 scale-102'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-850'
            }`}
          >
            <span>🖐️</span>
            <span>Сбор</span>
          </button>

          <button
            onClick={() => onSelectTool('seed')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'seed'
                ? 'bg-amber-500 text-amber-950 shadow-md ring-1 ring-amber-300 scale-102'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-850'
            }`}
          >
            <span>🌱</span>
            <span>Семена</span>
          </button>

          <button
            onClick={() => onSelectTool('water')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'water'
                ? 'bg-sky-500 text-sky-950 shadow-md ring-1 ring-sky-300 scale-102'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-850'
            }`}
          >
            <span>💧</span>
            <span>Лейка</span>
          </button>

          <button
            onClick={() => onSelectTool('fertilizer')}
            className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTool === 'fertilizer'
                ? 'bg-purple-500 text-purple-950 shadow-md ring-1 ring-purple-300 scale-102'
                : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-850'
            }`}
          >
            <span>✨</span>
            <span>Удобрить</span>
          </button>
        </div>

        {/* Crops Filter Tabs & Horizontal Scroll Selector */}
        <div className="flex items-center justify-between gap-1 pt-1 pb-0.5 px-0.5">
          <div className="flex items-center gap-1 text-[10px]">
            <button
              onClick={() => setCropFilter('all')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                cropFilter === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
              }`}
            >
              Все семена
            </button>
            <button
              onClick={() => setCropFilter('seasonal')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                cropFilter === 'seasonal'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-600/40 hover:bg-amber-900/60'
              }`}
            >
              <span>{seasonCfg.icon}</span>
              <span>Сезонные ({Object.values(CROPS).filter((c) => Boolean(c.season)).length})</span>
            </button>
            <button
              onClick={() => setCropFilter('standard')}
              className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                cropFilter === 'standard'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60'
              }`}
            >
              🌾 Базовые
            </button>
          </div>

          <span className="text-[9px] text-amber-300 font-medium hidden sm:inline">
            {seasonCfg.icon} В сезон: <strong>+45% скорости</strong>
          </span>
        </div>

        {/* Crops Horizontal Scroll Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {Object.values(CROPS)
            .filter((crop) => {
              if (cropFilter === 'seasonal') return Boolean(crop.season);
              if (cropFilter === 'standard') return !crop.season;
              return true;
            })
            .map((crop) => {
              const isUnlocked = level >= crop.minLevel;
              const isSelected = selectedCropId === crop.id;
              const isSeasonMatch = crop.season && crop.season === season;

              return (
                <button
                  key={crop.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    onSelectCrop(crop.id);
                    onSelectTool('seed');
                  }}
                  className={`relative flex flex-col items-center p-1.5 rounded-xl min-w-[70px] border transition-all cursor-pointer shrink-0 ${
                    !isUnlocked
                      ? 'opacity-40 bg-stone-900/50 border-stone-700 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-b from-amber-500/30 to-amber-700/40 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400 scale-103'
                      : isSeasonMatch
                      ? 'bg-gradient-to-b from-amber-950/70 to-emerald-950/70 border-amber-500/80 text-amber-200 shadow-sm hover:scale-101'
                      : 'bg-emerald-900/40 border-emerald-700/60 text-emerald-100 hover:bg-emerald-850'
                  }`}
                  title={crop.description}
                >
                  {/* Seasonal badge */}
                  {crop.season && (
                    <span
                      className={`absolute -top-1 -right-1 text-[8px] font-black px-1 rounded-full flex items-center shadow-xs ${
                        isSeasonMatch
                          ? 'bg-amber-400 text-stone-950 ring-1 ring-amber-300 animate-pulse'
                          : 'bg-stone-800 text-stone-300 border border-stone-600'
                      }`}
                    >
                      {crop.season === 'autumn'
                        ? '🍂'
                        : crop.season === 'winter'
                        ? '❄️'
                        : crop.season === 'spring'
                        ? '🌸'
                        : '☀️'}
                      {isSeasonMatch && '⚡'}
                    </span>
                  )}

                  <span className="text-xl">{crop.emoji}</span>
                  <span className="text-[10px] font-bold mt-0.5 truncate max-w-[64px]">
                    {crop.name}
                  </span>
                  <div className="flex items-center gap-0.5 text-[9px] text-amber-300 font-semibold mt-0.5">
                    <span>{crop.cost}🪙</span>
                    <span className="text-emerald-300">· {crop.growthTime}с</span>
                  </div>
                  {!isUnlocked ? (
                    <span className="text-[8px] text-rose-300 font-bold mt-0.5">Ур. {crop.minLevel}</span>
                  ) : isSeasonMatch ? (
                    <span className="text-[8px] text-amber-300 font-bold mt-0.5">Сезон +45%</span>
                  ) : null}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};
