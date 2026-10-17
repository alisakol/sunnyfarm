import React, { useState } from 'react';
import { Plus, Coins } from 'lucide-react';
import { CROPS, ANIMALS, RECIPES } from '../utils/constants';

interface BarnViewProps {
  inventory: Record<string, number>;
  barnCapacity: number;
  barnUsed: number;
  coins: number;
  onSellItem: (itemId: string, count: number) => void;
  onUpgradeBarn: () => void;
}

export const BarnView: React.FC<BarnViewProps> = ({
  inventory,
  barnCapacity,
  barnUsed,
  coins,
  onSellItem,
  onUpgradeBarn,
}) => {
  const [filter, setFilter] = useState<'all' | 'crops' | 'animals' | 'products' | 'fruits'>('all');

  const upgradeCost = Math.floor(barnCapacity * 4.5);
  const canUpgrade = coins >= upgradeCost;

  // Build items list
  const allItems = Object.entries(inventory)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => {
      let name = id;
      let emoji = '📦';
      let category: 'crops' | 'animals' | 'products' | 'fruits' = 'crops';
      let sellPrice = 5;

      if (CROPS[id]) {
        name = CROPS[id].name;
        emoji = CROPS[id].emoji;
        category = 'crops';
        sellPrice = CROPS[id].sellPrice;
      } else if (id === 'apple' || id === 'cherry') {
        name = id === 'apple' ? 'Яблоки' : 'Вишня';
        emoji = id === 'apple' ? '🍎' : '🍒';
        category = 'fruits';
        sellPrice = id === 'apple' ? 14 : 18;
      } else {
        const anim = Object.values(ANIMALS).find((a) => a.produceItemId === id);
        if (anim) {
          name = anim.produceName;
          emoji = anim.produceEmoji;
          category = 'animals';
          sellPrice = anim.sellPrice;
        } else {
          const rec = RECIPES.find((r) => r.outputItemId === id);
          if (rec) {
            name = rec.name;
            emoji = rec.emoji;
            category = 'products';
            sellPrice = rec.sellPrice;
          }
        }
      }

      return { id, name, emoji, count, category, sellPrice };
    });

  const filteredItems = allItems.filter((item) => filter === 'all' || item.category === filter);

  return (
    /* ВАЖНО: Увеличен отступ снизу до pb-28 для фиксации под плавающей навигацией */
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-28 px-3">
      {/* Title Banner */}
      <div className="mt-2.5 mb-2.5 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-100 shadow-sm">
        <span className="font-bold text-amber-200 flex items-center gap-1.5">
          <span>🎒</span> Деревенский Амбар и Склад
        </span>
        <span className="text-[10px] text-emerald-300">
          Храните припасы или продавайте излишки торговцам!
        </span>
      </div>

      {/* Barn Capacity & Upgrade Card */}
      <div className="mb-3 rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border border-amber-700/60 p-3 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Вместимость амбара:</span>
              <span className={`font-extrabold ${barnUsed >= barnCapacity ? 'text-rose-400' : 'text-amber-300'}`}>
                {barnUsed} / {barnCapacity}
              </span>
            </span>
            <div className="w-48 sm:w-60 bg-emerald-950 rounded-full h-2 mt-1.5 overflow-hidden border border-emerald-800">
              <div
                className={`h-full transition-all duration-300 ${
                  barnUsed >= barnCapacity ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (barnUsed / barnCapacity) * 100)}%` }}
              />
            </div>
          </div>

          <button
            disabled={!canUpgrade}
            onClick={onUpgradeBarn}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              canUpgrade
                ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-md active:scale-95'
                : 'bg-emerald-950/60 text-emerald-500/40 border border-emerald-800/40 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+25 мест ({upgradeCost} 🪙)</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-2.5">
        {[
          { id: 'all', label: 'Всё' },
          { id: 'crops', label: '🌱 Урожай' },
          { id: 'animals', label: '🥚 Продукты' },
          { id: 'products', label: '🍞 Изделия' },
          { id: 'fruits', label: '🍎 Фрукты' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              filter === tab.id
                ? 'bg-amber-500 text-amber-950 shadow-sm'
                : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 border border-emerald-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8 text-xs text-emerald-300 bg-emerald-950/40 rounded-2xl border border-dashed border-emerald-800/60">
          <span>В этой категории пока ничего нет. Соберите урожай на ферме!</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl border border-emerald-800/70 bg-gradient-to-b from-amber-950/50 via-emerald-950/70 to-emerald-950/80 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-extrabold text-amber-300 bg-emerald-900/60 px-1.5 py-0.5 rounded-md border border-emerald-700/60">
                  x{item.count}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-emerald-300 mt-0.5">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span>Цена: {item.sellPrice} 🪙</span>
                </div>
              </div>

              {/* Sell buttons */}
              <div className="grid grid-cols-2 gap-1 mt-2">
                <button
                  onClick={() => onSellItem(item.id, 1)}
                  className="py-1 px-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-600/50 rounded-lg text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                >
                  Прод. 1
                </button>
                <button
                  onClick={() => onSellItem(item.id, item.count)}
                  className="py-1 px-1 bg-amber-600 hover:bg-amber-500 text-amber-950 font-extrabold rounded-lg text-[10px] transition-all active:scale-95 cursor-pointer"
                >
                  Все ({item.count * item.sellPrice}🪙)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
