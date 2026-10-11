import React from 'react';
import { Truck, RotateCw, Check, ArrowRight } from 'lucide-react';
import { Order } from '../types/game';
import { CROPS, ANIMALS, RECIPES } from '../utils/constants';

interface OrdersViewProps {
  orders: Order[];
  inventory: Record<string, number>;
  truckDelivering: boolean;
  onDeliverOrder: (orderId: string) => void;
  onDismissOrder: (orderId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  inventory,
  truckDelivering,
  onDeliverOrder,
  onDismissOrder,
}) => {
  // Helper to look up item emoji & name
  const getItemInfo = (itemId: string) => {
    if (CROPS[itemId]) return { name: CROPS[itemId].name, emoji: CROPS[itemId].emoji };
    const anim = Object.values(ANIMALS).find((a) => a.produceItemId === itemId);
    if (anim) return { name: anim.produceName, emoji: anim.produceEmoji };
    const rec = RECIPES.find((r) => r.outputItemId === itemId);
    if (rec) return { name: rec.name, emoji: rec.emoji };
    if (itemId === 'apple') return { name: 'Яблоки', emoji: '🍎' };
    if (itemId === 'cherry') return { name: 'Вишня', emoji: '🍒' };
    return { name: itemId, emoji: '📦' };
  };

  const deliveringOrder = orders.find((o) => o.status === 'delivering');

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-3 px-3">
      {/* Title Banner */}
      <div className="mt-2.5 mb-2.5 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-100 shadow-sm">
        <span className="font-bold text-amber-200 flex items-center gap-1.5">
          <span>🚚</span> Доска Заказов и Рыночный Грузовичок
        </span>
        <span className="text-[10px] text-emerald-300">
          Снабжайте жителей деревни свежими продуктами!
        </span>
      </div>

      {/* Farm Delivery Truck Status Panel */}
      <div className="mb-3 rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border border-amber-700/60 p-3 shadow-md overflow-hidden relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Грузовичок "Ветерок"</span>
          </span>
          <span className="text-[10px] text-emerald-300">
            {truckDelivering ? 'В пути к клиенту... 💨' : 'Готов к отправке в гараже 🏁'}
          </span>
        </div>

        {/* Truck Animation track */}
        <div className="h-12 bg-stone-950/80 rounded-xl border border-stone-800 flex items-center px-3 relative overflow-hidden">
          {/* Road dashes */}
          <div className="absolute inset-x-0 bottom-2.5 border-b border-dashed border-stone-600 opacity-40"></div>

          {/* Truck visual */}
          <div
            className={`flex items-center gap-1.5 transition-all duration-700 ${
              truckDelivering ? 'animate-truck-drive text-3xl' : 'text-3xl'
            }`}
          >
            <span>🚚</span>
            {truckDelivering && (
              <span className="text-xs font-bold text-amber-300 bg-amber-900/80 px-1.5 py-0.5 rounded border border-amber-500/50">
                Везу заказ...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-2.5">
        {orders.map((order) => {
          const isDeliveringThis = order.status === 'delivering';

          // Check if player has all requirements
          let hasEverything = true;
          const reqStatus = order.requirements.map((req) => {
            const have = inventory[req.itemId] || 0;
            const ok = have >= req.count;
            if (!ok) hasEverything = false;
            const info = getItemInfo(req.itemId);
            return { ...req, have, ok, info };
          });

          return (
            <div
              key={order.id}
              className={`rounded-2xl border p-3 shadow-md transition-all ${
                isDeliveringThis
                  ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-400/50'
                  : 'bg-gradient-to-b from-amber-950/60 via-emerald-950/70 to-emerald-950/80 border-emerald-700/60'
              }`}
            >
              {/* Customer header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-900/50 border border-amber-600/50 flex items-center justify-center text-xl shadow-inner">
                    {order.customerAvatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {order.customerName}
                    </h4>
                    <span className="text-[10px] text-emerald-300">
                      {order.customerTitle}
                    </span>
                  </div>
                </div>

                {/* Dismiss button */}
                {!isDeliveringThis && (
                  <button
                    onClick={() => onDismissOrder(order.id)}
                    className="p-1 rounded-lg text-emerald-400/70 hover:text-emerald-200 hover:bg-emerald-900/50 transition-colors cursor-pointer"
                    title="Заменить заказ"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Requirements & Rewards */}
              <div className="flex items-center justify-between gap-2">
                {/* Requirements items */}
                <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                  {reqStatus.map((req, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${
                        req.ok
                          ? 'bg-emerald-900/50 border-emerald-600/70 text-emerald-100'
                          : 'bg-rose-950/60 border-rose-800/70 text-rose-200'
                      }`}
                    >
                      <span>{req.info.emoji}</span>
                      <span>{req.info.name}</span>
                      <span className={`font-bold ${req.ok ? 'text-amber-300' : 'text-rose-400'}`}>
                        {req.have}/{req.count}
                      </span>
                      {req.ok && <Check className="w-3 h-3 text-emerald-400" />}
                    </div>
                  ))}
                </div>

                {/* Rewards preview */}
                <div className="flex flex-col items-end shrink-0 pl-1">
                  <span className="text-xs font-bold text-amber-300">
                    +{order.rewardCoins} 🪙
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-300">
                    +{order.rewardXp} XP
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-2.5">
                {isDeliveringThis ? (
                  <div className="w-full py-1.5 bg-amber-900/50 border border-amber-600/60 rounded-xl text-center text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 animate-bounce-mini" />
                    <span>Грузовик доставляет... скоро вернётся!</span>
                  </div>
                ) : (
                  <button
                    disabled={!hasEverything || truckDelivering}
                    onClick={() => onDeliverOrder(order.id)}
                    className={`w-full py-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                      hasEverything && !truckDelivering
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-amber-950 active:scale-98'
                        : 'bg-emerald-950/60 text-emerald-500/50 border border-emerald-800/40 cursor-not-allowed'
                    }`}
                  >
                    <span>Отправить грузовичок</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
