import React, { useState } from 'react';
import { Heart, Droplets, ShoppingBag, ArrowDownLeft, ArrowUpRight, MessageSquare, Send, RotateCw, CheckCircle2, Award, Gift, Users, ShieldCheck } from 'lucide-react';
import { NeighborFarm } from '../types/game';
import { QUICK_COMMENTS } from '../utils/neighborsData';

interface NeighborsViewProps {
  neighbors: NeighborFarm[];
  coins: number;
  inventory: Record<string, number>;
  barnUsed: number;
  barnCapacity: number;
  incomingGiftsCount?: number;
  realFriendsCount?: number;
  selectedFarmId?: string;
  onSelectFarm?: (farmId: string) => void;
  onBuyFromNeighbor: (farmId: string, tradeItemId: string) => void;
  onSellToNeighbor: (farmId: string, wantedItemId: string) => void;
  onHelpNeighbor: (farmId: string) => void;
  onAddComment: (farmId: string, text: string) => void;
  onRefreshStalls: () => void;
  onOpenInteractionsHub?: () => void;
  onSendGiftDirect?: (farmId: string) => void;
  onOpenRealFriends?: () => void;
}

export const NeighborsView: React.FC<NeighborsViewProps> = ({
  neighbors,
  coins,
  inventory,
  barnUsed,
  barnCapacity,
  incomingGiftsCount = 0,
  realFriendsCount = 0,
  selectedFarmId: controlledFarmId,
  onSelectFarm,
  onBuyFromNeighbor,
  onSellToNeighbor,
  onHelpNeighbor,
  onAddComment,
  onRefreshStalls,
  onOpenInteractionsHub,
  onSendGiftDirect,
  onOpenRealFriends,
}) => {
  const [internalFarmId, setInternalFarmId] = useState<string>(controlledFarmId || neighbors[0]?.id || '');
  const selectedFarmId = controlledFarmId || internalFarmId;
  const setSelectedFarmId = (id: string) => {
    setInternalFarmId(id);
    if (onSelectFarm) onSelectFarm(id);
  };
  const [commentInput, setCommentInput] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'market' | 'visit' | 'guestbook'>('market');

  const currentFarm = neighbors.find((f) => f.id === selectedFarmId || f.uid === selectedFarmId) || neighbors[0];

  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentInput.trim() || !currentFarm) return;
    onAddComment(currentFarm.id, commentInput);
    setCommentInput('');
  };

  const handleQuickComment = (text: string) => {
    if (!currentFarm) return;
    onAddComment(currentFarm.id, text);
  };

  if (!currentFarm) return null;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-3 px-3">
      {/* Top Banner */}
      <div className="mt-2.5 mb-2 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-100 shadow-sm gap-2">
        <span className="font-bold text-amber-200 flex items-center gap-1.5 truncate">
          <span>🏡</span> Соседские Фермы и Обмен
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenRealFriends && (
            <button
              onClick={onOpenRealFriends}
              className="flex items-center gap-1 text-[10px] font-bold text-stone-950 bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 px-2 py-0.5 rounded-lg transition-transform active:scale-95 cursor-pointer shadow-sm relative"
              title="Найти реальных игроков и добавить в друзья через Google"
            >
              <Users className="w-3 h-3 text-stone-950" />
              <span>Друзья (Google)</span>
              {realFriendsCount > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-700 text-white text-[8px] font-extrabold flex items-center justify-center border border-white">
                  {realFriendsCount}
                </span>
              )}
            </button>
          )}

          {onOpenInteractionsHub && (
            <button
              onClick={onOpenInteractionsHub}
              className="flex items-center gap-1 text-[10px] font-bold text-rose-950 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 px-2 py-0.5 rounded-lg transition-transform active:scale-95 cursor-pointer shadow-sm relative"
              title="Открыть подарки и журнал гостей"
            >
              <Gift className="w-3 h-3 text-rose-950" />
              <span className="hidden xs:inline">Подарки</span>
              {incomingGiftsCount > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-extrabold flex items-center justify-center border border-white">
                  {incomingGiftsCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onRefreshStalls}
            className="flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
            title="Обновить прилавки и запросы соседей"
          >
            <RotateCw className="w-3 h-3" />
            <span className="hidden sm:inline">Обновить</span>
          </button>
        </div>
      </div>

      {/* Neighbor Selection Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-2.5 pb-1">
        {neighbors.map((farm) => {
          const isSelected = farm.id === currentFarm.id;
          return (
            <button
              key={farm.id}
              onClick={() => setSelectedFarmId(farm.id)}
              className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500/30 to-emerald-700/50 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400 scale-102'
                  : 'bg-emerald-950/70 border-emerald-800/60 text-emerald-200 hover:bg-emerald-900/60'
              }`}
            >
              <div className="relative shrink-0">
                {farm.photoURL || farm.ownerAvatar?.startsWith('http') ? (
                  <img
                    src={farm.photoURL || farm.ownerAvatar}
                    alt={farm.ownerName}
                    className="w-7 h-7 rounded-lg object-cover border border-emerald-400 shadow-xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-xl shrink-0">{farm.ownerAvatar}</div>
                )}
                {farm.isRealPlayer && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-sky-400 rounded-full border border-stone-900" title="Реальный игрок" />
                )}
              </div>
              <div className="text-left">
                <span className="text-[11px] font-bold block leading-tight text-white flex items-center gap-1">
                  <span>{farm.ownerName}</span>
                  {farm.isRealPlayer && (
                    <span className="text-[8px] bg-sky-950 text-sky-300 border border-sky-500/50 px-1 rounded">
                      Google
                    </span>
                  )}
                </span>
                <span className="text-[9px] text-emerald-300 block truncate max-w-[90px]">
                  {farm.name}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-[9px] font-bold text-rose-300 bg-rose-950/60 px-1 py-0.2 rounded border border-rose-800/40">
                <Heart className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                <span>{farm.reputation}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Neighbor Profile Card */}
      <div className="rounded-2xl bg-gradient-to-b from-amber-950/70 via-emerald-950/80 to-emerald-950/90 border border-emerald-700/70 p-3 shadow-md mb-2.5">
        <div className="flex items-start justify-between gap-2 border-b border-emerald-800/60 pb-2.5 mb-2.5">
          <div className="flex items-center gap-2.5">
            {currentFarm.photoURL || currentFarm.ownerAvatar?.startsWith('http') ? (
              <img
                src={currentFarm.photoURL || currentFarm.ownerAvatar}
                alt={currentFarm.ownerName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-sky-400 shadow-md shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-emerald-700 border border-amber-400/80 flex items-center justify-center text-2xl shadow-md shrink-0">
                {currentFarm.ownerAvatar}
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs font-bold text-white leading-tight">
                  {currentFarm.name}
                </h3>
                <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-600/50 px-1 rounded">
                  Ур. {currentFarm.level}
                </span>
                {currentFarm.isRealPlayer && (
                  <span className="text-[9px] font-bold text-sky-200 bg-sky-950/80 border border-sky-500/50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5 text-sky-400" />
                    <span>Реальный игрок</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-300 font-medium block">
                Владелец: {currentFarm.ownerName} · {currentFarm.specialty}
              </span>
              <p className="text-[10px] text-amber-200/90 italic mt-0.5 line-clamp-1">
                "{currentFarm.bio}"
              </p>
            </div>
          </div>

          {/* Actions: Help & Send Gift */}
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
            {onSendGiftDirect && (
              <button
                onClick={() => onSendGiftDirect(currentFarm.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Отправить подарок этому соседу"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Подарок 🎁</span>
              </button>
            )}

            {/* Help Button */}
            <button
              disabled={currentFarm.helpedWaterToday}
              onClick={() => onHelpNeighbor(currentFarm.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                !currentFarm.helpedWaterToday
                  ? 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 text-stone-950 active:scale-95 animate-pulse'
                  : 'bg-emerald-950/60 text-emerald-400/60 border border-emerald-800/40 cursor-not-allowed'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>{currentFarm.helpedWaterToday ? 'Помогли ✓' : 'Полить (+25🪙)'}</span>
            </button>
          </div>
        </div>

        {/* View Sub-Tabs (Лавка товаров, Обзор хозяйства, Гостевая книга) */}
        <div className="grid grid-cols-3 gap-1 bg-emerald-950/80 p-1 rounded-xl border border-emerald-800/60">
          <button
            onClick={() => setActiveSubTab('market')}
            className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeSubTab === 'market'
                ? 'bg-amber-500 text-amber-950 shadow-sm'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Торговля</span>
          </button>

          <button
            onClick={() => setActiveSubTab('visit')}
            className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeSubTab === 'visit'
                ? 'bg-amber-500 text-amber-950 shadow-sm'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <span>🌾</span>
            <span>Хозяйство</span>
          </button>

          <button
            onClick={() => setActiveSubTab('guestbook')}
            className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 relative ${
              activeSubTab === 'guestbook'
                ? 'bg-amber-500 text-amber-950 shadow-sm'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Отзывы ({currentFarm.guestbook.length})</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TRADING STAND (Купить и Продать) */}
      {activeSubTab === 'market' && (
        <div className="flex flex-col gap-3">
          {/* 1. Buy from Neighbor's Roadside Stall */}
          <div className="rounded-2xl border border-emerald-700/60 bg-emerald-950/70 p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>Прилавок соседа (Купить излишки):</span>
              </span>
              <span className="text-[10px] text-emerald-300">
                Свободно в амбаре: {barnCapacity - barnUsed} мест
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentFarm.sellItems.map((item) => {
                const canAfford = coins >= item.price;
                const hasSpace = barnUsed + item.count <= barnCapacity;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      item.sold
                        ? 'bg-emerald-950/40 border-emerald-900/40 opacity-60'
                        : 'bg-emerald-900/40 border-emerald-700/60 hover:border-emerald-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white truncate block">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold">
                          <span>x{item.count} шт.</span>
                          <span>· {item.price} 🪙</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {item.sold ? (
                        <span className="text-[10px] font-bold text-stone-400 px-2 py-1 bg-stone-900/60 rounded-md">
                          Продано
                        </span>
                      ) : (
                        <button
                          disabled={!canAfford || !hasSpace}
                          onClick={() => onBuyFromNeighbor(currentFarm.id, item.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                            canAfford && hasSpace
                              ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-sm active:scale-95'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                          }`}
                        >
                          Купить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Sell to Neighbor (Neighbor's Wanted Demands) */}
          <div className="rounded-2xl border border-emerald-700/60 bg-emerald-950/70 p-3 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Сосед ищет товары (Продать соседу с бонусом):</span>
              </span>
              <span className="text-[10px] text-emerald-300">
                Повышенные цены за выкуп
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentFarm.buyItems.map((item) => {
                const haveCount = inventory[item.itemId] || 0;
                const canSell = haveCount >= item.count;

                return (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                      item.fulfilled
                        ? 'bg-emerald-950/40 border-emerald-900/40 opacity-60'
                        : 'bg-emerald-900/40 border-emerald-700/60 hover:border-emerald-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-white truncate block">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1 text-[10px]">
                          <span className={canSell ? 'text-amber-300 font-bold' : 'text-rose-400 font-bold'}>
                            У вас: {haveCount}/{item.count} шт.
                          </span>
                          <span className="text-emerald-300 font-bold">
                            · Награда: +{item.rewardCoins} 🪙
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {item.fulfilled ? (
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-1 bg-emerald-900/40 rounded-md">
                          Сдано ✓
                        </span>
                      ) : (
                        <button
                          disabled={!canSell}
                          onClick={() => onSellToNeighbor(currentFarm.id, item.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                            canSell
                              ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-stone-950 shadow-sm active:scale-95'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                          }`}
                        >
                          Сдать
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FARM SCENERY & ANIMALS (Хозяйство соседа) */}
      {activeSubTab === 'visit' && (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-emerald-700/60 bg-emerald-950/70 p-3 shadow-md">
            <span className="text-xs font-bold text-amber-200 block mb-2 flex items-center gap-1">
              <span>🌾</span> Поля и грядки хозяйства:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {currentFarm.cropsPreview.map((crop, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl border border-emerald-800/60 bg-emerald-900/30 flex flex-col items-center text-center"
                >
                  <span className="text-2xl mb-1">{crop.emoji}</span>
                  <span className="text-xs font-bold text-white truncate max-w-full">
                    {crop.name}
                  </span>
                  <span className="text-[10px] text-amber-300 font-semibold mt-0.5">
                    {crop.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-700/60 bg-emerald-950/70 p-3 shadow-md">
            <span className="text-xs font-bold text-amber-200 block mb-2 flex items-center gap-1">
              <span>🐾</span> Домашние животные соседа:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {currentFarm.animalsPreview.map((anim, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl border border-emerald-800/60 bg-emerald-900/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{anim.emoji}</span>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {anim.name}
                      </span>
                      <span className="text-[10px] text-emerald-300">
                        В загоне: {anim.count} шт.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/40">
                    ❤️ Сыты
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: GUESTBOOK & COMMENTS (Гостевая книга) */}
      {activeSubTab === 'guestbook' && (
        <div className="flex flex-col gap-2.5">
          {/* Quick Comment Chips */}
          <div className="bg-emerald-950/70 border border-emerald-800/70 rounded-2xl p-2.5 shadow-sm">
            <span className="text-[10px] font-bold text-amber-200 block mb-1.5">
              Быстрые отзывы в гостевую книгу:
            </span>
            <div className="flex flex-wrap gap-1">
              {QUICK_COMMENTS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickComment(chip)}
                  className="text-[10px] bg-emerald-900/60 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/50 px-2 py-1 rounded-lg transition-colors cursor-pointer text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Comment Input Form */}
          <form
            onSubmit={handleSendComment}
            className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-1.5 shadow-sm"
          >
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Напишите доброе пожелание соседу..."
              maxLength={120}
              className="flex-1 bg-transparent px-2.5 py-1 text-xs text-white placeholder-emerald-400/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                commentInput.trim()
                  ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 shadow-sm active:scale-95'
                  : 'bg-emerald-900/40 text-emerald-500/40 cursor-not-allowed'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>Оставить</span>
            </button>
          </form>

          {/* Comments List */}
          <div className="flex flex-col gap-1.5">
            {currentFarm.guestbook.map((comm) => (
              <div
                key={comm.id}
                className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                  comm.isPlayer
                    ? 'bg-gradient-to-r from-amber-950/60 to-emerald-950/80 border-amber-500/50'
                    : 'bg-emerald-950/60 border-emerald-800/60'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-900/50 border border-emerald-700/40 shrink-0 flex items-center justify-center overflow-hidden">
                  {comm.avatar?.startsWith('http') ? (
                    <img
                      src={comm.avatar}
                      alt={comm.author}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.textContent = '🧑‍🌾';
                        }
                      }}
                    />
                  ) : (
                    <span className="text-xl">{comm.avatar || '🧑‍🌾'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {comm.author}
                    </span>
                    <span className="text-[9px] text-emerald-400/70">
                      {comm.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5 leading-snug">
                    {comm.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
