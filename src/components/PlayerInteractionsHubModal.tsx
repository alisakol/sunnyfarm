import React, { useState } from 'react';
import { Gift, Sparkles, Send, CheckCircle, PackageOpen, History, Heart, UserCheck, MessageSquare, ShieldCheck, LogIn } from 'lucide-react';
import { NeighborFarm, PlayerGift, PlayerVisitLog } from '../types/game';
import { sound } from '../utils/audio';
import { vibrateLight } from '../utils/haptics';

interface PlayerInteractionsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighbors: NeighborFarm[];
  playerGifts: PlayerGift[];
  playerVisitLogs: PlayerVisitLog[];
  coins: number;
  gems: number;
  inventory: Record<string, number>;
  currentUser?: any;
  initialRecipientId?: string;
  initialTab?: 'inbox' | 'send' | 'visitors';
  onSendGift: (farmId: string, giftType: 'seeds' | 'fertilizer' | 'coins' | 'gems' | 'pie', note: string) => Promise<boolean | void> | boolean | void;
  onClaimGift: (giftId: string) => void;
  onClaimVisitorBonus: (logId: string) => void;
  onOpenAuth?: () => void;
}

export const PlayerInteractionsHubModal: React.FC<PlayerInteractionsHubModalProps> = ({
  isOpen,
  onClose,
  neighbors,
  playerGifts,
  playerVisitLogs,
  coins,
  gems,
  inventory,
  currentUser,
  initialRecipientId,
  initialTab = 'inbox',
  onSendGift,
  onClaimGift,
  onClaimVisitorBonus,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'send' | 'visitors'>(initialTab);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(initialRecipientId || neighbors[0]?.id || '');
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'real' | 'npc'>('all');
  const [selectedGiftType, setSelectedGiftType] = useState<'seeds' | 'fertilizer' | 'coins' | 'gems' | 'pie'>('seeds');
  const [giftNote, setGiftNote] = useState<string>('Удачи в сборе богатого урожая! 🌾');
  const [isSending, setIsSending] = useState(false);

  // Sync initial tab and recipient when opened
  React.useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialRecipientId) {
        setSelectedRecipientId(initialRecipientId);
      } else if (!selectedRecipientId && neighbors.length > 0) {
        setSelectedRecipientId(neighbors[0].id);
      }
    }
  }, [isOpen, initialRecipientId, initialTab, neighbors]);

  if (!isOpen) return null;

  const unclaimedGiftsCount = playerGifts.filter((g) => !g.claimed).length;
  const unclaimedBonusesCount = playerVisitLogs.filter((v) => !v.rewardClaimed).length;

  const selectedRecipient =
    neighbors.find((f) => f.id === selectedRecipientId || f.uid === selectedRecipientId) ||
    neighbors[0];

  const filteredNeighbors = neighbors.filter((farm) => {
    if (recipientFilter === 'real') return farm.isRealPlayer;
    if (recipientFilter === 'npc') return !farm.isRealPlayer;
    return true;
  });

  const giftOptions = [
    {
      type: 'seeds' as const,
      name: 'Семена подсолнухов',
      emoji: '🌻',
      count: 5,
      costText: 'Бесплатно ',
      available: true,
      desc: 'Позволит соседу вырастить красивые подсолнухи',
    },
    {
      type: 'fertilizer' as const,
      name: 'Эко-удобрение',
      emoji: '✨',
      count: 3,
      costText: 'Бесплатно ',
      available: true,
      desc: 'Мгновенно ускоряет рост посевов',
    },
    {
      type: 'coins' as const,
      name: 'Мешочек золота (50 🪙)',
      emoji: '🪙',
      count: 50,
      costText: 'Стоимость: 50 🪙',
      available: coins >= 50,
      desc: 'Приятная финансовая поддержка для соседа',
    },
    {
      type: 'gems' as const,
      name: 'Сияющий кристалл (1 💎)',
      emoji: '💎',
      count: 1,
      costText: 'Стоимость: 1 💎',
      available: gems >= 1,
      desc: 'Драгоценный подарок особой дружбы',
    },
    {
      type: 'pie' as const,
      name: 'Клубничный пирог',
      emoji: '🥧',
      count: 1,
      costText: `В амбаре: ${inventory.strawberry_pie || 0} шт.`,
      available: (inventory.strawberry_pie || 0) >= 1,
      desc: 'Вкуснейшее угощение из собственной пекарни',
    },
  ];

  const handleSend = async () => {
    if (!selectedRecipientId || isSending) return;
    setIsSending(true);
    try {
      await onSendGift(selectedRecipientId, selectedGiftType, giftNote);
      vibrateLight();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/60 rounded-3xl p-4 shadow-2xl flex flex-col max-h-[90vh] text-amber-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xl shadow-lg border border-amber-300">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-amber-200 font-game leading-tight">
                  Взаимодействие игроков
                </h2>
                <span className="text-[10px] bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-700/60 font-semibold">
                  Мультиплеер
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80">
                Подарки соседям, гостевая книга и журнал визитов
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-stone-950/80 p-1 rounded-2xl border border-amber-800/40 my-3 shrink-0">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('inbox');
            }}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
              activeTab === 'inbox'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md'
                : 'text-amber-200/80 hover:bg-stone-900'
            }`}
          >
            <PackageOpen className="w-3.5 h-3.5" />
            <span>Входящие</span>
            {unclaimedGiftsCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold border border-white">
                {unclaimedGiftsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('send');
            }}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'send'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md'
                : 'text-amber-200/80 hover:bg-stone-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Отправить</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('visitors');
            }}
            className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
              activeTab === 'visitors'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md'
                : 'text-amber-200/80 hover:bg-stone-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Гости фермы</span>
            {unclaimedBonusesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-[9px] text-white flex items-center justify-center font-bold border border-white">
                {unclaimedBonusesCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Inbox / Gifts Received */}
        {activeTab === 'inbox' && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
            {playerGifts.length === 0 ? (
              <div className="text-center py-10 text-stone-400">
                <Gift className="w-10 h-10 mx-auto mb-2 text-stone-600" />
                <p className="text-sm">Пока нет входящих подарков</p>
                <p className="text-xs text-stone-500 mt-1">
                  Помогайте соседям и поливайте их поля, чтобы получать взаимные сюрпризы!
                </p>
              </div>
            ) : (
              playerGifts.map((gift) => (
                <div
                  key={gift.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    gift.claimed
                      ? 'bg-stone-900/40 border-stone-800/60 opacity-70'
                      : 'bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-950 border-amber-500/60 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {gift.giftEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {gift.giftName}
                          </span>
                          <span className="text-[10px] bg-amber-950 px-1.5 py-0.2 rounded font-bold text-amber-300 border border-amber-600/50">
                            x{gift.count}
                          </span>
                        </div>
                        {/* ИСПРАВЛЕНИЕ ОТОБРАЖЕНИЯ АВАТАРКИ/ССЫЛКИ ОТПРАВИТЕЛЯ */}
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium mt-0.5">
                          <span>Отправитель:</span>
                          {gift.senderAvatar?.startsWith('http') ? (
                            <img
                              src={gift.senderAvatar}
                              alt=""
                              className="w-4 h-4 rounded-full object-cover border border-emerald-500/50 inline-block"
                            />
                          ) : (
                            <span>{gift.senderAvatar}</span>
                          )}
                          <span className="truncate max-w-[160px]">{gift.senderName}</span>
                          <span className="shrink-0">(Ур. {gift.senderLevel})</span>
                        </div>
                        <p className="text-[11px] text-amber-200/90 italic mt-0.5 line-clamp-2">
                          «{gift.note}»
                        </p>
                        <span className="text-[9px] text-stone-400 mt-1 block">
                          {gift.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {gift.claimed ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-xl">
                          <CheckCircle className="w-3 h-3" />
                          <span>Получено</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onClaimGift(gift.id)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 animate-pulse"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Забрать</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Send Gift to Neighbor */}
        {activeTab === 'send' && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
            {/* Recipient select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-amber-300">
                  1. Выберите получателя:
                </label>
                <div className="flex items-center gap-1 bg-stone-950 p-0.5 rounded-lg border border-stone-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setRecipientFilter('all')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      recipientFilter === 'all' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientFilter('real')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer flex items-center gap-1 ${
                      recipientFilter === 'real' ? 'bg-sky-500 text-stone-950' : 'text-sky-300'
                    }`}
                  >
                    <span>Google Друзья</span>
                    <span className="text-[9px] bg-black/40 px-1 rounded">
                      {neighbors.filter((n) => n.isRealPlayer).length}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientFilter('npc')}
                    className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                      recipientFilter === 'npc' ? 'bg-emerald-600 text-stone-950' : 'text-stone-400'
                    }`}
                  >
                    Соседи долины
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {filteredNeighbors.map((farm) => {
                  const isSelected = selectedRecipientId === farm.id;
                  return (
                    <button
                      key={farm.id}
                      onClick={() => {
                        sound.playTap();
                        setSelectedRecipientId(farm.id);
                      }}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md'
                          : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-850'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {farm.photoURL ? (
                          <img
                            src={farm.photoURL}
                            alt={farm.ownerName}
                            className="w-7 h-7 rounded-lg object-cover border border-sky-400"
                          />
                        ) : (
                          <span className="text-xl">{farm.ownerAvatar}</span>
                        )}
                        {farm.isRealPlayer && (
                          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-sky-400 rounded-full border border-stone-900" title="Google игрок" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white block truncate leading-tight flex items-center gap-1">
                          <span className="truncate">{farm.ownerName}</span>
                          {farm.isFriend && (
                            <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400 shrink-0" />
                          )}
                        </span>
                        <span className="text-[9px] text-emerald-300 block truncate">
                          Ур. {farm.level} · {farm.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real Player Notice / Auth check */}
            {selectedRecipient?.isRealPlayer && (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-950/80 to-stone-950 border border-sky-500/50 flex items-center justify-between gap-2 shadow-sm text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block truncate">
                      Получатель: {selectedRecipient.ownerName} (Google игрок)
                    </span>
                    <span className="text-[10px] text-sky-200 block truncate">
                      Подарок поступит другу в реальном времени через Firestore!
                    </span>
                  </div>
                </div>
                {!currentUser && onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      onOpenAuth();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-[10px] shrink-0 flex items-center gap-1 shadow-sm"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Войти</span>
                  </button>
                )}
              </div>
            )}

            {/* Gift type select */}
            <div>
              <label className="text-[11px] font-bold text-amber-300 block mb-1">
                2. Что отправить в подарок:
              </label>
              <div className="space-y-1.5">
                {giftOptions.map((opt) => {
                  const isSelected = selectedGiftType === opt.type;
                  return (
                    <button
                      key={opt.type}
                      disabled={!opt.available}
                      onClick={() => {
                        sound.playTap();
                        setSelectedGiftType(opt.type);
                      }}
                      className={`w-full p-2 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        !opt.available
                          ? 'bg-stone-950/40 border-stone-800/40 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400 shadow-sm'
                          : 'bg-stone-900/50 border-stone-800/80 hover:bg-stone-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{opt.emoji}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">
                              {opt.name}
                            </span>
                            <span className="text-[10px] text-amber-300 font-semibold">
                              x{opt.count} шт.
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 block">
                            {opt.desc}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded-lg shrink-0">
                        {opt.costText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom note */}
            <div>
              <label className="text-[11px] font-bold text-amber-300 block mb-1">
                3. Прикрепить тёплое пожелание:
              </label>
              <input
                type="text"
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                maxLength={90}
                placeholder="Напишите пару добрых слов..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Send CTA */}
            <button
              disabled={isSending || (selectedRecipient?.isRealPlayer && !currentUser)}
              onClick={handleSend}
              className={`w-full py-2.5 rounded-xl font-game font-bold text-sm shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2 ${
                selectedRecipient?.isRealPlayer && !currentUser
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 cursor-pointer'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>
                {isSending
                  ? 'Отправка подарка...'
                  : selectedRecipient?.isRealPlayer && !currentUser
                  ? 'Войдите через Google для отправки'
                  : selectedRecipient?.isRealPlayer
                  ? 'Отправить реальному другу 🎁 (+30 XP)'
                  : 'Отправить подарок (+30 XP & +5 Репутации)'}
              </span>
            </button>
          </div>
        )}

        {/* Tab 3: Visitors Log */}
        {activeTab === 'visitors' && (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-2.5 text-xs text-emerald-200 flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Здесь отображаются друзья и соседи, которые посещали вашу ферму, поливали сухие грядки и гладили питомцев!
              </span>
            </div>

            {playerVisitLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-2xl bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-stone-950 border border-stone-800/80 flex items-center justify-between gap-2.5 shadow-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center text-xl shrink-0">
                    {log.visitorAvatar}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {log.visitorName}
                      </span>
                      <span className="text-[9px] text-amber-300 font-bold bg-amber-950/70 border border-amber-600/40 px-1 rounded">
                        Ур. {log.visitorLevel}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-300 block truncate">
                      {log.actionText}
                    </span>
                    <span className="text-[9px] text-stone-400 block mt-0.5">
                      {log.timestamp}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  {log.rewardClaimed ? (
                    <span className="text-[10px] text-stone-400 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 flex items-center gap-1">
                      <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                      <span>Спасибо!</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onClaimVisitorBonus(log.id)}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 text-stone-950 font-bold text-[11px] shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center gap-1 animate-pulse"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>+15 🪙 бонус</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};