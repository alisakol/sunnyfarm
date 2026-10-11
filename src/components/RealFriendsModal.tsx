import React, { useState } from 'react';
import { UserCheck, UserPlus, Users, Search, Sparkles, ExternalLink, ShieldCheck, Heart, LogIn, Gift } from 'lucide-react';
import { FirestoreUserProfile } from '../services/friendsService';
import { sound } from '../utils/audio';

interface RealFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  communityPlayers: FirestoreUserProfile[];
  friendsUids: string[];
  isLoading: boolean;
  onAddFriend: (player: FirestoreUserProfile) => Promise<void>;
  onRemoveFriend: (friendUid: string) => Promise<void>;
  onOpenAuth: () => void;
  onVisitPlayerFarm: (player: FirestoreUserProfile) => void;
  onSendGiftToFriend?: (player: FirestoreUserProfile) => void;
}

export const RealFriendsModal: React.FC<RealFriendsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  communityPlayers,
  friendsUids,
  isLoading,
  onAddFriend,
  onRemoveFriend,
  onOpenAuth,
  onVisitPlayerFarm,
  onSendGiftToFriend,
}) => {
  const [activeTab, setActiveTab] = useState<'my_friends' | 'find_players'>('my_friends');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionInProgressUid, setActionInProgressUid] = useState<string | null>(null);

  if (!isOpen) return null;

  const friendsList = communityPlayers.filter((p) => friendsUids.includes(p.id));
  const otherPlayers = communityPlayers.filter((p) => !friendsUids.includes(p.id));

  const filteredPlayers = (activeTab === 'my_friends' ? friendsList : otherPlayers).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.displayName && p.displayName.toLowerCase().includes(q)) ||
      (p.farmName && p.farmName.toLowerCase().includes(q)) ||
      (p.specialty && p.specialty.toLowerCase().includes(q))
    );
  });

  const handleToggleFriend = async (player: FirestoreUserProfile) => {
    setActionInProgressUid(player.id);
    sound.playTap();
    try {
      if (friendsUids.includes(player.id)) {
        await onRemoveFriend(player.id);
      } else {
        await onAddFriend(player);
      }
    } finally {
      setActionInProgressUid(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-emerald-600/70 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-emerald-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-emerald-500 to-amber-500 border border-emerald-300 flex items-center justify-center text-2xl shadow-lg">
              👥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-game text-amber-200 leading-tight">
                  Друзья Фермеры 
                </h2>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-600/60 font-bold">
                  Реальные игроки
                </span>
              </div>
              <p className="text-[11px] text-stone-300">
                Авторизованные через Google игроки сообщества
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

        {/* Not Logged In Banner */}
        {!currentUser && (
          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-sky-950/90 via-emerald-950/80 to-stone-900 border border-sky-500/60 shadow-md flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🔐</span>
              <div>
                <span className="text-xs font-bold text-white block">
                  Войдите через Google для добавления в друзья!
                </span>
                <span className="text-[10px] text-sky-200">
                  Ваша ферма станет видна другим игрокам, и вы сможете обмениваться подарками.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onOpenAuth();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-stone-950 font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1 shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Войти</span>
            </button>
          </div>
        )}

        {/* Sub-Tabs: Мои друзья / Найти игроков */}
        <div className="grid grid-cols-2 gap-1.5 bg-stone-950/80 p-1 rounded-2xl border border-emerald-800/50 my-3 shrink-0">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('my_friends');
            }}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'my_friends'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-stone-950 shadow-md font-extrabold'
                : 'text-emerald-200/80 hover:bg-stone-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Мои Друзья ({friendsList.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('find_players');
            }}
            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'find_players'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-stone-950 shadow-md font-extrabold'
                : 'text-emerald-200/80 hover:bg-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Все Игроки ({otherPlayers.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-2 relative shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-emerald-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени фермера или названию хозяйства..."
            className="w-full bg-stone-950/80 border border-emerald-800/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-emerald-400/50 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Players List Container */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
          {isLoading ? (
            <div className="text-center py-10 text-emerald-300">
              <span className="animate-spin inline-block text-2xl mb-2">🌱</span>
              <p className="text-xs">Загрузка игроков из сообщества Firestore...</p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-10 text-stone-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-stone-600" />
              <p className="text-sm font-semibold text-stone-300">
                {activeTab === 'my_friends'
                  ? 'Список друзей пока пуст'
                  : 'Другие игроки не найдены'}
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                {activeTab === 'my_friends'
                  ? 'Перейдите на вкладку «Все Игроки», чтобы добавить реальных фермеров в друзья!'
                  : 'Поделитесь ссылкой на приложение с друзьями, чтобы они вошли через Google!'}
              </p>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isFriend = friendsUids.includes(player.id);
              const isWorking = actionInProgressUid === player.id;

              return (
                <div
                  key={player.id}
                  className="p-3 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-emerald-800/60 hover:border-emerald-500/80 transition-all flex items-center justify-between gap-2.5 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {player.photoURL ? (
                      <img
                        src={player.photoURL}
                        alt={player.displayName}
                        className="w-11 h-11 rounded-2xl object-cover border border-emerald-400 shadow-md shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-emerald-900/60 border border-emerald-600/60 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        🧑‍🌾
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white truncate">
                          {player.displayName || 'Фермер'}
                        </span>
                        <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-600/50 px-1 rounded font-bold">
                          Ур. {player.level || 1}
                        </span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-1 rounded flex items-center gap-0.5">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Google ✓</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-300 block truncate font-medium">
                        {player.farmName || 'Солнечная Ферма'}
                      </span>
                      <p className="text-[10px] text-stone-400 italic truncate">
                        "{player.bio || 'Развиваю ферму в Google AI Studio'}"
                      </p>
                    </div>
                  </div>

                  {/* Actions: Add / Remove Friend & Visit Farm */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isFriend && onSendGiftToFriend && (
                      <button
                        onClick={() => onSendGiftToFriend(player)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
                        title="Отправить подарок этому другу"
                      >
                        <Gift className="w-3 h-3 text-stone-950" />
                        <span>Подарок 🎁</span>
                      </button>
                    )}

                    <button
                      onClick={() => onVisitPlayerFarm(player)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700/60 text-emerald-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Перейти на ферму игрока"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>В гости</span>
                    </button>

                    {currentUser && (
                      <button
                        disabled={isWorking}
                        onClick={() => handleToggleFriend(player)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shadow-sm ${
                          isFriend
                            ? 'bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950'
                        }`}
                      >
                        {isFriend ? (
                          <>
                            <UserCheck className="w-3 h-3 text-rose-300" />
                            <span>Удалить</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3 text-stone-950" />
                            <span>В друзья</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-emerald-900/40 text-[10px] text-emerald-400/80 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Каждый авторизованный игрок получает персональную лавку и гостевую книгу</span>
          </span>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="text-amber-300 hover:text-amber-200 font-bold cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
