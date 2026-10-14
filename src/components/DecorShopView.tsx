import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Award,
  Coins,
  Gem,
  Lock,
  Check,
  Package,
  Layers,
  Heart,
  HelpCircle,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { DecorCategory, DecorItem } from '../types/game';
import {
  DECORATIONS_CATALOG,
  getAestheticRank,
  getNextAestheticRank,
} from '../utils/decorationsData';

interface DecorShopViewProps {
  level: number;
  coins: number;
  gems: number;
  purchasedDecorations: string[];
  placedDecorations: string[];
  onBuyDecoration: (decorId: string) => void;
  onTogglePlaceDecoration: (decorId: string) => void;
  onGoToFarm?: () => void;
}

export const DecorShopView: React.FC<DecorShopViewProps> = ({
  level,
  coins,
  gems,
  purchasedDecorations,
  placedDecorations,
  onBuyDecoration,
  onTogglePlaceDecoration,
  onGoToFarm,
}) => {
  const [activeCategory, setActiveCategory] = useState<DecorCategory | 'gems_only' | 'inventory'>('all');
  const [selectedDecorModal, setSelectedDecorModal] = useState<DecorItem | null>(null);

  // Calculate total aesthetic score of currently placed decorations
  const totalAestheticScore = useMemo(() => {
    return placedDecorations.reduce((sum, decorId) => {
      const item = DECORATIONS_CATALOG.find((d) => d.id === decorId);
      return sum + (item ? item.aestheticPoints : 0);
    }, 0);
  }, [placedDecorations]);

  const currentRank = getAestheticRank(totalAestheticScore);
  const { nextRank, pointsNeeded, progressPercent } = getNextAestheticRank(totalAestheticScore);

  // Filtered decorations
  const filteredItems = useMemo(() => {
    if (activeCategory === 'inventory') {
      return DECORATIONS_CATALOG.filter((item) => purchasedDecorations.includes(item.id));
    }
    if (activeCategory === 'gems_only') {
      return DECORATIONS_CATALOG.filter((item) => item.costGems > 0);
    }
    if (activeCategory === 'all') {
      return DECORATIONS_CATALOG;
    }
    return DECORATIONS_CATALOG.filter((item) => item.category === activeCategory);
  }, [activeCategory, purchasedDecorations]);

  const categories = [
    { id: 'all', label: 'Все', icon: '🌟' },
    { id: 'nature', label: 'Природа', icon: '🌸' },
    { id: 'structures', label: 'Постройки', icon: '🏛️' },
    { id: 'lighting', label: 'Свет', icon: '✨' },
    { id: 'cozy', label: 'Уют', icon: '🪑' },
    { id: 'gems_only', label: 'За Гемы', icon: '💎' },
    { id: 'inventory', label: `Мои (${purchasedDecorations.length})`, icon: '🎒' },
  ];

  const getRarityBadge = (rarity: DecorItem['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return {
          label: 'Легендарный',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
          border: 'border-amber-500/70 shadow-amber-500/20',
          glow: 'from-amber-900/40 via-stone-900/90 to-stone-950',
        };
      case 'epic':
        return {
          label: 'Эпический',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
          border: 'border-purple-500/70 shadow-purple-500/20',
          glow: 'from-purple-950/40 via-stone-900/90 to-stone-950',
        };
      case 'rare':
        return {
          label: 'Редкий',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
          border: 'border-blue-500/70 shadow-blue-500/20',
          glow: 'from-blue-950/40 via-stone-900/90 to-stone-950',
        };
      default:
        return {
          label: 'Обычный',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          border: 'border-emerald-700/60 shadow-emerald-950/20',
          glow: 'from-emerald-950/30 via-stone-900/90 to-stone-950',
        };
    }
  };

  return (
    /* ВАЖНО: Увеличен отступ снизу до pb-28, чтобы контент не перекрывался нижней панелью */
    <div className="flex-1 flex flex-col h-full bg-radial from-stone-900 via-emerald-950/40 to-stone-950 overflow-y-auto pb-28 select-none">
      {/* Top Header Card: Aesthetic Status */}
      <div className="p-3 bg-gradient-to-b from-emerald-900/60 via-stone-950/90 to-stone-950 border-b border-emerald-800/50 shrink-0 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-md border border-amber-300/40">
              ⛲
            </div>
            <div>
              <h1 className="text-base font-black text-amber-200 tracking-wide flex items-center gap-1.5">
                Магазин Декора
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Эстетика Фермы
                </span>
              </h1>
              <p className="text-[11px] text-emerald-300/80">
                Украшайте владения, повышайте престиж и активируйте бонусы
              </p>
            </div>
          </div>

          {/* Quick Balance */}
          <div className="flex flex-col items-end gap-1 text-xs shrink-0">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-500/50 font-bold text-amber-300 shadow-xs">
              <span>🪙</span>
              <span>{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 font-bold text-cyan-300 shadow-xs">
              <span>💎</span>
              <span>{gems}</span>
            </div>
          </div>
        </div>

        {/* Aesthetic Rank Banner */}
        <div className="mt-2.5 p-2.5 rounded-xl bg-stone-900/90 border border-amber-500/30 backdrop-blur-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl filter drop-shadow-sm">{currentRank.icon}</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-amber-100">{currentRank.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/40">
                    ⭐ {totalAestheticScore} очков
                  </span>
                </div>
                <span className="text-[10px] text-stone-300 block">{currentRank.bonusText}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <Layers className="w-3 h-3" />
                {placedDecorations.length} на ферме
              </span>
              <span className="text-[9px] text-stone-400">из {purchasedDecorations.length} купленных</span>
            </div>
          </div>

          {/* Rank Progress Bar */}
          {nextRank && (
            <div className="w-full">
              <div className="flex items-center justify-between text-[10px] text-stone-300 mb-1">
                <span>
                  Следующий ранг: <strong className="text-amber-300">{nextRank.title} {nextRank.icon}</strong>
                </span>
                <span className="font-semibold text-amber-200">
                  Осталось: +{pointsNeeded} ⭐ ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden border border-stone-700/80 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="px-3 pt-2 pb-1 shrink-0 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30 scale-102 border border-amber-300'
                  : 'bg-stone-900/80 text-stone-300 border border-stone-700/60 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Catalog Grid */}
      <div className="px-3 py-2 flex-1">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-stone-950/60 border border-stone-800 rounded-2xl my-4">
            <span className="text-4xl block mb-2">🪴</span>
            <h3 className="text-sm font-bold text-stone-200 mb-1">Коллекция пуста</h3>
            <p className="text-xs text-stone-400 mb-3">
              Вы еще не приобрели украшений в этой категории. Выберите предмет из каталога!
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Смотреть все украшения
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredItems.map((item) => {
              const isOwned = purchasedDecorations.includes(item.id);
              const isPlaced = placedDecorations.includes(item.id);
              const isLevelLocked = level < item.minLevel;
              const canAffordCoins = item.costCoins === 0 || coins >= item.costCoins;
              const canAffordGems = item.costGems === 0 || gems >= item.costGems;
              const canAfford = canAffordCoins && canAffordGems;
              const rarityStyle = getRarityBadge(item.rarity);

              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl p-3 border bg-gradient-to-br ${rarityStyle.glow} ${
                    isPlaced
                      ? 'border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500/40'
                      : rarityStyle.border
                  } flex flex-col justify-between transition-all hover:translate-y-[-1px]`}
                >
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${rarityStyle.badge}`}
                      >
                        {rarityStyle.label}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                        ⭐ +{item.aestheticPoints} Эстетика
                      </span>
                    </div>

                    {isPlaced ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 border border-emerald-300 flex items-center gap-1 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                        На ферме
                      </span>
                    ) : isOwned ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-600 flex items-center gap-1">
                        <Package className="w-3 h-3" />В складе
                      </span>
                    ) : null}
                  </div>

                  {/* Main Content Area */}
                  <div className="flex items-center gap-3 my-1">
                    <div className="w-14 h-14 rounded-2xl bg-stone-950/80 border border-stone-700/80 flex items-center justify-center text-3xl shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                      {item.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-extrabold text-stone-100 leading-tight truncate">
                        {item.name}
                      </h3>
                      <p className="text-[10.5px] text-stone-300 mt-0.5 line-clamp-2 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Passive Perk Banner */}
                  <div className="mt-1.5 mb-2.5 px-2.5 py-1 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center gap-1.5 text-[10.5px] text-amber-200/90 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{item.perk}</span>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800/80 mt-auto">
                    <div className="flex items-center gap-2">
                      {!isOwned ? (
                        isLevelLocked ? (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Уровень {item.minLevel}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-extrabold">
                            {item.costCoins > 0 && (
                              <span
                                className={`flex items-center gap-1 ${
                                  canAffordCoins ? 'text-amber-300' : 'text-rose-400'
                                }`}
                              >
                                🪙 {item.costCoins.toLocaleString()}
                              </span>
                            )}
                            {item.costGems > 0 && (
                              <span
                                className={`flex items-center gap-1 ${
                                  canAffordGems ? 'text-cyan-300' : 'text-rose-400'
                                }`}
                              >
                                💎 {item.costGems}
                              </span>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="text-[10px] text-stone-400">
                          {isPlaced ? 'Красуется на ваших грядках' : 'Готово к установке'}
                        </div>
                      )}
                    </div>

                    <div>
                      {!isOwned ? (
                        <button
                          disabled={isLevelLocked || !canAfford}
                          onClick={() => onBuyDecoration(item.id)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-md cursor-pointer ${
                            isLevelLocked
                              ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                              : !canAfford
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-700 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 border border-amber-300'
                          }`}
                        >
                          {isLevelLocked ? (
                            <>
                              <Lock className="w-3 h-3" />
                              Закрыто
                            </>
                          ) : !canAfford ? (
                            'Не хватает'
                          ) : (
                            'Купить'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => onTogglePlaceDecoration(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                            isPlaced
                              ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-600'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 active:scale-95'
                          }`}
                        >
                          {isPlaced ? 'Снять в склад' : 'Разместить ✨'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Active Perks Summary Section */}
        {placedDecorations.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-stone-950/80 border border-emerald-800/60 shadow-lg">
            <h4 className="text-xs font-black text-emerald-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Активные эффекты декораций на ферме ({placedDecorations.length}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {placedDecorations.map((id) => {
                const item = DECORATIONS_CATALOG.find((d) => d.id === id);
                if (!item) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-stone-900/70 border border-stone-800 text-[10px] text-stone-200"
                  >
                    <span className="text-base shrink-0">{item.emoji}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-amber-200 block truncate">{item.name}</span>
                      <span className="text-stone-300 truncate block">{item.perk}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};