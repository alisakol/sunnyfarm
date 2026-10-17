import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  Coins,
  Gem,
  Package,
  RotateCw,
} from 'lucide-react';
import { NpcQuest, SeasonId } from '../types/game';
import { sound } from '../utils/audio';
import { vibrateLight } from '../utils/haptics';

interface NpcQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  npcQuests: NpcQuest[];
  inventory: Record<string, number>;
  onContribute: (questId: string, objectiveId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onOpenJournal: () => void;
  onRefreshDailyQuests?: (force?: boolean) => void;
  level: number;
  initialQuestId?: string;
  effectiveSeason?: SeasonId;
}

export const NpcQuestsModal: React.FC<NpcQuestsModalProps> = ({
  isOpen,
  onClose,
  npcQuests,
  inventory,
  onContribute,
  onCompleteQuest,
  onOpenJournal,
  onRefreshDailyQuests,
  level,
  initialQuestId,
  effectiveSeason = 'autumn',
}) => {
  const [questCategory, setQuestCategory] = useState<'all' | 'story' | 'seasonal' | 'daily_npc'>('story');
  
  // ИСПРАВЛЕНИЕ: Фиксация выбранного квеста, чтобы при обновлении стейта не сбрасывало в начало
  const [selectedQuestId, setSelectedQuestId] = useState<string>(() => {
    return initialQuestId || npcQuests[0]?.id || '';
  });

  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'challenging' | 'master' | 'epic'>('all');
  const [countdownStr, setCountdownStr] = useState<string>('');

  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownStr('00:00:00');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdownStr(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Синхронизация initialQuestId только при первичном открытии
  React.useEffect(() => {
    if (isOpen && initialQuestId) {
      setSelectedQuestId(initialQuestId);
      const target = npcQuests.find((q) => q.id === initialQuestId);
      if (target?.category) {
        setQuestCategory(target.category);
      }
    } else if (isOpen && !selectedQuestId && npcQuests[0]?.id) {
      setSelectedQuestId(npcQuests[0].id);
    }
  }, [isOpen, initialQuestId]);

  if (!isOpen) return null;

  // Filter by Category first
  const categoryQuests = npcQuests.filter((q) => {
    if (questCategory === 'all') return true;
    if (questCategory === 'story') return q.category === 'story';
    if (questCategory === 'seasonal') return q.category === 'seasonal' && q.season === effectiveSeason;
    if (questCategory === 'daily_npc') return !q.category || q.category === 'daily_npc';
    return true;
  });

  // Filter by Difficulty
  const filteredQuests = categoryQuests.filter((q) => {
    if (filterDifficulty === 'all') return true;
    return q.difficulty === filterDifficulty;
  });

  // Гарантируем, что выбранный квест всегда существует, иначе берем первый доступный
  const selectedQuest =
    filteredQuests.find((q) => q.id === selectedQuestId) ||
    categoryQuests.find((q) => q.id === selectedQuestId) ||
    filteredQuests[0] ||
    categoryQuests[0] ||
    npcQuests[0];

  const completedCount = npcQuests.filter((q) => q.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-stone-900 border-2 border-amber-600/60 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-stone-100">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-game text-amber-200">
                  Сложные Квесты & Гости Фермы
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  {completedCount}/{npcQuests.length} Выполнено
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Особые поручения от жителей долины с уникальными наградами
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onRefreshDailyQuests && (
              <button
                onClick={() => {
                  sound.playTap();
                  onRefreshDailyQuests(true);
                }}
                className="p-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                title="Сгенерировать новые ежедневные квесты"
              >
                <RotateCw className="w-4 h-4" />
                <span className="hidden sm:inline font-bold">Новые квесты</span>
              </button>
            )}
            <button
              onClick={() => {
                sound.playTap();
                onOpenJournal();
              }}
              className="p-1.5 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/60 text-amber-300 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Открыть Дневник Фермера"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Дневник</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Quest Category Navigation */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 pb-1 shrink-0">
          {[
            {
              id: 'story',
              label: 'Сюжет',
              icon: '📖',
              badge: `${npcQuests.filter((q) => q.category === 'story' && q.completed).length}/5`,
              color: 'from-amber-600 to-amber-700',
            },
            {
              id: 'seasonal',
              label: 'Сезон',
              icon: '🍂',
              badge: `${npcQuests.filter((q) => q.category === 'seasonal' && q.season === effectiveSeason && !q.completed).length}`,
              color: 'from-orange-600 to-amber-700',
            },
            {
              id: 'daily_npc',
              label: 'Жители',
              icon: '🌾',
              badge: `${npcQuests.filter((q) => (!q.category || q.category === 'daily_npc') && !q.completed).length}`,
              color: 'from-emerald-600 to-teal-700',
            },
            {
              id: 'all',
              label: 'Все',
              icon: '📜',
              badge: `${npcQuests.length}`,
              color: 'from-stone-700 to-stone-800',
            },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playTap();
                setQuestCategory(cat.id as any);
                const first = npcQuests.find((q) => {
                  if (cat.id === 'story') return q.category === 'story';
                  if (cat.id === 'seasonal') return q.category === 'seasonal' && q.season === effectiveSeason;
                  if (cat.id === 'daily_npc') return !q.category || q.category === 'daily_npc';
                  return true;
                });
                if (first) setSelectedQuestId(first.id);
              }}
              className={`p-2 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                questCategory === cat.id
                  ? `bg-gradient-to-b ${cat.color} text-white border-amber-300 shadow-md ring-1 ring-amber-400/50 scale-102`
                  : 'bg-stone-850/80 border-stone-750 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm">{cat.icon}</span>
                <span className="text-xs font-bold">{cat.label}</span>
              </div>
              <span className="text-[9px] text-amber-200/90 font-mono mt-0.5">
                {cat.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Narrative Context Banner */}
        {questCategory === 'story' && (
          <div className="bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border border-amber-600/50 rounded-2xl p-2.5 my-1.5 flex items-center justify-between text-xs shadow-inner shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <div>
                <span className="font-extrabold text-amber-200 block text-xs">
                  Сюжетная Сага: Наследие Дедушки Матвея
                </span>
                <span className="text-[10px] text-stone-300">
                  Выполняйте главы по порядку, открывайте лор долины и заслужите Орден Земледельцев!
                </span>
              </div>
            </div>
          </div>
        )}

        {questCategory === 'seasonal' && (
          <div className="bg-gradient-to-r from-orange-950/90 via-stone-900 to-amber-950/90 border border-orange-500/60 rounded-2xl p-2.5 my-1.5 flex items-center justify-between text-xs shadow-inner shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐿️</span>
              <div>
                <span className="font-extrabold text-amber-200 block text-xs">
                  Большой Сезонный Квест: {effectiveSeason === 'autumn' ? 'Золотая Осень' : effectiveSeason === 'winter' ? 'Волшебная Зима' : effectiveSeason === 'spring' ? 'Цветущая Весна' : 'Жаркое Лето'}
                </span>
                <span className="text-[10px] text-amber-100/90">
                  Выращивайте сезонные орехи 🌰 и плоды, чтобы получить легендарное Дерево Белочки!
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full shrink-0">
              ЭПИК
            </span>
          </div>
        )}

        {/* Daily Refresh Status Bar for Daily Quests */}
        {(questCategory === 'daily_npc' || questCategory === 'all') && (
          <div className="bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border border-amber-600/40 rounded-2xl p-2.5 my-1.5 flex items-center justify-between text-xs shadow-inner shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
                🌅
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-amber-200 text-xs">
                    Ежедневные поручения
                  </span>
                  <span className="text-[10px] bg-stone-800 text-amber-300 border border-stone-700 px-1.5 rounded font-mono">
                    Смена в 00:00
                  </span>
                </div>
                <span className="text-[10px] text-stone-300 block truncate">
                  ⏳ До смены: <strong className="text-amber-300 font-mono font-bold">{countdownStr}</strong>
                </span>
              </div>
            </div>

            {onRefreshDailyQuests && (
              <button
                onClick={() => {
                  sound.playTap();
                  onRefreshDailyQuests(true);
                }}
                className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 border border-emerald-400/60 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                title="Сгенерировать новые случайные квесты"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Новые квесты</span>
                <span className="xs:hidden">Смена</span>
              </button>
            )}
          </div>
        )}

        {/* Difficulty Filter Chips */}
        {(questCategory === 'daily_npc' || questCategory === 'all') && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs shrink-0">
            {[
              { id: 'all', label: `Все (${categoryQuests.length})`, icon: '📜' },
              { id: 'challenging', label: `Сложные (${categoryQuests.filter(q => q.difficulty === 'challenging').length})`, icon: '⚡' },
              { id: 'master', label: `Мастер (${categoryQuests.filter(q => q.difficulty === 'master').length})`, icon: '⭐' },
              { id: 'epic', label: `Эпические (${categoryQuests.filter(q => q.difficulty === 'epic').length})`, icon: '👑' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTap();
                  setFilterDifficulty(tab.id as any);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                  filterDifficulty === tab.id
                    ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 border border-stone-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Quest Tabs Selector */}
        <div className="flex items-center gap-2 my-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
          {filteredQuests.map((quest) => {
            const isSelected = quest.id === selectedQuest?.id;
            const allObjectivesDone = quest.objectives.every(
              (o) => o.currentCount >= o.targetCount
            );

            return (
              <button
                key={quest.id}
                onClick={() => {
                  sound.playTap();
                  vibrateLight();
                  setSelectedQuestId(quest.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-amber-950/70 border-amber-400 ring-1 ring-amber-400/50 shadow-md scale-102'
                    : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:border-stone-600'
                }`}
              >
                <div className="text-xl relative">
                  <span>{quest.npcAvatar}</span>
                  {quest.completed && (
                    <span className="absolute -bottom-1 -right-1 text-[10px] bg-emerald-500 rounded-full text-black px-0.5 font-bold">
                      ✓
                    </span>
                  )}
                  {!quest.completed && allObjectivesDone && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                  )}
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block text-white leading-tight">
                    {quest.chapter ? `Глава ${quest.chapter}` : quest.npcName}
                  </span>
                  <span className="text-[10px] text-stone-400 block truncate max-w-[110px]">
                    {quest.category === 'seasonal'
                      ? '🍂 Сезонный'
                      : quest.category === 'story'
                      ? quest.title
                      : quest.difficulty === 'epic'
                      ? '👑 Эпический'
                      : quest.difficulty === 'master'
                      ? '⭐ Мастер'
                      : '⚡ Сложный'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Quest Details Card */}
        {selectedQuest && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {/* NPC Story Dialogue Card */}
            <div className="bg-gradient-to-r from-stone-800/90 to-stone-800/50 border border-stone-700/80 rounded-2xl p-3 flex gap-3 shadow-inner">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl shrink-0">
                {selectedQuest.npcAvatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedQuest.chapterName && (
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">
                        📖 {selectedQuest.chapterName}
                      </span>
                    )}
                    {selectedQuest.category === 'seasonal' && (
                      <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider block">
                        🍂 Большой Сезонный Квест
                      </span>
                    )}
                    <h3 className="font-extrabold text-sm sm:text-base text-amber-200">
                      {selectedQuest.title}
                    </h3>
                    <span className="text-[11px] text-stone-400">
                      {selectedQuest.npcName} • {selectedQuest.npcRole}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                        selectedQuest.difficulty === 'epic'
                          ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                          : selectedQuest.difficulty === 'master'
                          ? 'bg-amber-900/60 border-amber-500 text-amber-200'
                          : 'bg-blue-900/60 border-blue-500 text-blue-200'
                      }`}
                    >
                      {selectedQuest.difficulty === 'epic'
                        ? 'Эпический подвиг'
                        : selectedQuest.difficulty === 'master'
                        ? 'Мастерский квест'
                        : 'Сложный квест'}
                    </span>
                    {selectedQuest.unlockedAtLevel && level < selectedQuest.unlockedAtLevel && (
                      <span className="text-[9px] bg-rose-950/80 border border-rose-500/60 text-rose-300 font-bold px-1.5 py-0.5 rounded-full">
                        🔒 Требуется Ур. {selectedQuest.unlockedAtLevel}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-amber-100/90 italic font-serif mt-1.5 bg-black/20 p-2 rounded-xl border border-stone-700/50">
                  {selectedQuest.dialogue}
                </p>
              </div>
            </div>

            {/* Objectives Checklist */}
            <div className="bg-stone-800/70 border border-stone-700 rounded-2xl p-3">
              <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🎯</span>
                <span>Цели испытания:</span>
              </h4>

              <div className="space-y-2">
                {selectedQuest.objectives.map((obj) => {
                  const isDone = obj.currentCount >= obj.targetCount;
                  const candidateIds = obj.allowedItemIds && obj.allowedItemIds.length > 0
                    ? obj.allowedItemIds
                    : obj.itemId === 'pie'
                    ? ['strawberry_pie', 'apple_pie', 'pumpkin_pie', 'pie']
                    : obj.itemId
                    ? [obj.itemId]
                    : [];

                  const availableInInventory = candidateIds.reduce(
                    (sum, id) => sum + (inventory[id] || 0),
                    0
                  );
                  const percent = Math.min(
                    100,
                    Math.round((obj.currentCount / obj.targetCount) * 100)
                  );

                  return (
                    <div
                      key={obj.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
                          : 'bg-stone-900/80 border-stone-750 text-stone-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className="flex items-center gap-1.5">
                            {isDone ? '✅' : '⏳'} {obj.description}
                          </span>
                          <span className="font-mono text-amber-300">
                            {obj.currentCount}/{obj.targetCount}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden border border-stone-700">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isDone
                                ? 'bg-emerald-400'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {!selectedQuest.completed && !isDone && (
                        <button
                          onClick={() => onContribute(selectedQuest.id, obj.id)}
                          disabled={availableInInventory <= 0}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 transition-transform active:scale-95 cursor-pointer flex items-center gap-1 ${
                            availableInInventory > 0
                              ? 'bg-emerald-700 hover:bg-emerald-600 border-emerald-400 text-white shadow-md'
                              : 'bg-stone-800 border-stone-700 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>Сдать ({availableInInventory})</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rewards Card */}
            <div className="bg-stone-800/70 border border-stone-700 rounded-2xl p-3">
              <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>🎁</span>
                <span>Награды за подвиг:</span>
              </h4>

              <div className="grid grid-cols-3 gap-2 text-center mb-2.5">
                <div className="bg-amber-950/60 border border-amber-600/50 p-2 rounded-xl">
                  <div className="text-sm">🪙</div>
                  <span className="font-extrabold text-amber-300 text-xs block">
                    +{selectedQuest.rewards.coins}
                  </span>
                  <span className="text-[10px] text-amber-200/70">Монеты</span>
                </div>
                <div className="bg-sky-950/60 border border-sky-600/50 p-2 rounded-xl">
                  <div className="text-sm">💎</div>
                  <span className="font-extrabold text-sky-300 text-xs block">
                    +{selectedQuest.rewards.gems}
                  </span>
                  <span className="text-[10px] text-sky-200/70">Гемы</span>
                </div>
                <div className="bg-purple-950/60 border border-purple-600/50 p-2 rounded-xl">
                  <div className="text-sm">🌟</div>
                  <span className="font-extrabold text-purple-300 text-xs block">
                    +{selectedQuest.rewards.xp}
                  </span>
                  <span className="text-[10px] text-purple-200/70">Опыт XP</span>
                </div>
              </div>
            </div>

            {/* Complete Quest Claim Button */}
            {selectedQuest.completed ? (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/60 rounded-2xl text-center text-emerald-300 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Квест завершён! Запись внесена в Дневник Фермера 📖</span>
              </div>
            ) : (
              (() => {
                const canComplete = selectedQuest.objectives.every(
                  (o) => o.currentCount >= o.targetCount
                );
                return (
                  <button
                    onClick={() => onCompleteQuest(selectedQuest.id)}
                    disabled={!canComplete}
                    className={`w-full py-3 rounded-2xl font-game font-extrabold text-sm uppercase tracking-wide border shadow-lg transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${
                      canComplete
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 border-amber-200 text-stone-950 animate-pulse'
                        : 'bg-stone-800 border-stone-750 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {canComplete
                        ? 'Завершить квест и записать в Дневник!'
                        : 'Выполните все цели, чтобы завершить'}
                    </span>
                  </button>
                );
              })()
            )}
          </div>
        )}
      </div>
    </div>
  );
};