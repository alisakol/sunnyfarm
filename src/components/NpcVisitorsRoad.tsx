import React, { useState } from 'react';
import { Sparkles, MessageCircle, CheckCircle, ChevronRight, Gift } from 'lucide-react';
import { NpcQuest } from '../types/game';
import { sound } from '../utils/audio';
import { vibrateLight } from '../utils/haptics';

interface NpcVisitorsRoadProps {
  npcQuests: NpcQuest[];
  inventory?: Record<string, number>;
  onOpenQuests: (questId: string) => void;
}

export const NpcVisitorsRoad: React.FC<NpcVisitorsRoadProps> = ({
  npcQuests,
  inventory = {},
  onOpenQuests,
}) => {
  const [hoveredNpcId, setHoveredNpcId] = useState<string | null>(null);

  if (!npcQuests || npcQuests.length === 0) return null;

  // Helper to determine NPC status and thought bubble message
  const getNpcStatus = (quest: NpcQuest) => {
    if (quest.completed) {
      return {
        isClaimable: false,
        isCompleted: true,
        thought: '«Спасибо за помощь ферме!» ✨',
        thoughtEmoji: '🌟',
        bubbleBorder: 'border-emerald-500/60 bg-emerald-950/90 text-emerald-200',
        badge: 'Завершено ✓',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      };
    }

    const allObjectivesDone = quest.objectives.every(
      (o) => o.currentCount >= o.targetCount
    );

    if (allObjectivesDone) {
      return {
        isClaimable: true,
        isCompleted: false,
        thought: '«Заказ готов! Забери награду!» 🎁',
        thoughtEmoji: '❗',
        bubbleBorder: 'border-amber-400 bg-amber-950/95 text-amber-200 ring-2 ring-amber-400/50',
        badge: 'Награда ждёт! 🎁',
        badgeBg: 'bg-amber-500/30 text-amber-200 border-amber-400 animate-pulse',
      };
    }

    // Check if player has any items in inventory ready to contribute
    const canContributeAny = quest.objectives.some((o) => {
      if (o.currentCount >= o.targetCount) return false;
      const candidateIds = o.allowedItemIds && o.allowedItemIds.length > 0
        ? o.allowedItemIds
        : o.itemId === 'pie'
        ? ['strawberry_pie', 'apple_pie', 'pumpkin_pie', 'pie']
        : o.itemId
        ? [o.itemId]
        : [];
      return candidateIds.some((id) => Boolean(inventory[id] && inventory[id] > 0));
    });

    if (canContributeAny) {
      return {
        isClaimable: false,
        isCompleted: false,
        thought: '«Вижу нужные товары в амбаре!» 🌾',
        thoughtEmoji: '📦',
        bubbleBorder: 'border-sky-500/60 bg-stone-900/95 text-sky-200',
        badge: 'Есть товары! 📦',
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      };
    }

    // Default waiting thoughts based on NPC role/lore
    let defaultThought = '«Жду помощи с важным делом!» 📜';
    if (quest.id === 'quest_saveliy') defaultThought = '«Нужны отборные колоски и хлеб!» 🌾🍞';
    else if (quest.id === 'quest_marfa') defaultThought = '«Ищу сладкие яблочки и молоко!» 🍏🥛';
    else if (quest.id === 'quest_auguste') defaultThought = '«Королевский банкет ждёт сыр и яйца!» 👨‍🍳🧀';
    else if (quest.id === 'quest_erofey') defaultThought = '«Лесным зверям нужны припасы!» 🦌🥕';
    else if (quest.id === 'quest_balthazar') defaultThought = '«Караван собирает редкие сокровища!» 💎🏺';
    else if (quest.id === 'quest_elena') defaultThought = '«Экспедиции нужна шерсть и тёплые свитера!» 🧶🧣';
    else if (quest.id === 'quest_prokhor') defaultThought = '«Пчёлам нужны подсолнухи и медовое печенье!» 🌻🍯';
    else if (quest.id === 'quest_innkeeper') defaultThought = '«Гости в трактире ждут блины и сыр!» 🥞🧀';
    else if (quest.id === 'quest_radomir') defaultThought = '«Ищу ингредиенты для великого эликсира!» 🔮✨';
    else if (quest.id === 'quest_svyatoslav') defaultThought = '«Княжеская дружина ждёт богатый провиант!» 🛡️🤴';
    else if (quest.id === 'quest_aglaya') defaultThought = '«Фестиваль цветов ждёт букеты и ягоды!» 🌸🍓';
    else if (quest.id === 'quest_vlas') defaultThought = '«Бриг готовится к дальнему плаванию!» ⚓⛵';

    return {
      isClaimable: false,
      isCompleted: false,
      thought: defaultThought,
      thoughtEmoji: '💭',
      bubbleBorder: 'border-amber-600/40 bg-stone-900/95 text-stone-200',
      badge: 'Новый квест 📜',
      badgeBg: 'bg-stone-800 text-amber-300 border-stone-700',
    };
  };

  const handleNpcClick = (questId: string) => {
    sound.playTap();
    vibrateLight();
    onOpenQuests(questId);
  };

  // Count active quests
  const activeCount = npcQuests.filter((q) => !q.completed).length;

  return (
    <div className="mb-3 bg-gradient-to-r from-stone-950 via-[#271d15] to-stone-950 border border-amber-600/40 rounded-2xl p-2.5 shadow-lg relative overflow-hidden">
      {/* Decorative pastoral road background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

      {/* Header of Visitors Walk */}
      <div className="flex items-center justify-between mb-2 px-1 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-base animate-bounce-mini">🚶‍♂️</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-200 block leading-tight font-game">
                Гости Фермы & Жители Долины
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full font-bold">
                {activeCount} активных
              </span>
            </div>
            <span className="text-[10px] text-stone-400">
              Нажмите на гостя, чтобы открыть его квест и сдать припасы
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playTap();
            vibrateLight();
            onOpenQuests(npcQuests[0]?.id || '');
          }}
          className="px-2 py-0.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <span>Все квесты</span>
          <ChevronRight className="w-3 h-3 text-amber-400" />
        </button>
      </div>

      {/* Rustic Walkway / Visitors Promenade */}
      <div className="relative z-10 flex items-stretch gap-2.5 overflow-x-auto no-scrollbar py-1 px-0.5">
        {npcQuests.map((quest, idx) => {
          const status = getNpcStatus(quest);
          const isHovered = hoveredNpcId === quest.id;
          const completedObjectives = quest.objectives.filter(
            (o) => o.currentCount >= o.targetCount
          ).length;

          // Alternate walking animations for natural variety
          const walkClass = idx % 2 === 0 ? 'animate-npc-stroll' : 'animate-npc-stroll-alt';

          return (
            <button
              key={quest.id}
              onClick={() => handleNpcClick(quest.id)}
              onMouseEnter={() => setHoveredNpcId(quest.id)}
              onMouseLeave={() => setHoveredNpcId(null)}
              className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer text-center shrink-0 min-w-[130px] sm:min-w-[145px] max-w-[155px] relative group text-left ${
                status.isClaimable
                  ? 'bg-gradient-to-b from-amber-950/80 via-stone-900 to-amber-950/60 border-amber-400 shadow-lg ring-1 ring-amber-400/60 scale-102'
                  : quest.completed
                  ? 'bg-stone-900/70 border-emerald-600/40 opacity-90 hover:opacity-100 hover:border-emerald-400'
                  : 'bg-stone-900/80 border-amber-700/40 hover:border-amber-400 hover:scale-102'
              }`}
            >
              {/* Thought Bubble (Облачко мыслей) hovering over NPC */}
              <div className="w-full flex flex-col items-center mb-1">
                <div
                  className={`relative px-2 py-1 rounded-xl text-[10px] font-medium leading-tight shadow-md border ${
                    status.bubbleBorder
                  } animate-thought-float w-full text-center transition-all group-hover:scale-105`}
                >
                  <p className="line-clamp-2 italic font-game text-[9.5px]">
                    {status.thought}
                  </p>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800 border border-amber-600/50 block" />
                  </div>
                </div>
              </div>

              {/* Character Avatar with movement animation */}
              <div className="relative my-1.5 flex items-center justify-center">
                <div className="absolute -bottom-1 w-10 h-3 bg-stone-800/80 rounded-[50%] blur-xs -z-0" />

                <div
                  className={`text-3xl filter drop-shadow-md select-none transition-transform z-10 ${walkClass} group-hover:scale-115`}
                >
                  {quest.npcAvatar}
                </div>

                {status.isClaimable ? (
                  <span className="absolute -top-1.5 -right-2 bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-white shadow-md animate-bounce">
                    🎁 ДАР
                  </span>
                ) : !quest.completed ? (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-stone-950 font-black text-[9px] rounded-full flex items-center justify-center border border-amber-300 shadow-xs animate-pulse">
                    !
                  </span>
                ) : (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center border border-emerald-300 shadow-xs">
                    ✓
                  </span>
                )}
              </div>

              {/* Character Name & Role */}
              <div className="w-full text-center mt-1">
                <span className="text-[11px] font-black text-amber-100 block truncate leading-tight group-hover:text-amber-300 transition-colors">
                  {quest.npcName}
                </span>
                <span className="text-[9px] text-stone-400 block truncate leading-tight">
                  {quest.npcRole}
                </span>
              </div>

              {/* Status pill & Objectives tracker */}
              <div className="w-full mt-2 pt-1.5 border-t border-stone-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px]">
                  <span className={`px-1.5 py-0.2 rounded-md font-bold border ${status.badgeBg}`}>
                    {status.badge}
                  </span>
                  <span className="text-stone-400 font-medium">
                    {completedObjectives}/{quest.objectives.length}
                  </span>
                </div>

                {/* Mini progress bar */}
                <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      quest.completed
                        ? 'bg-emerald-500'
                        : status.isClaimable
                        ? 'bg-amber-400'
                        : 'bg-amber-600'
                    }`}
                    style={{
                      width: `${(completedObjectives / quest.objectives.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
