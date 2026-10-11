import React from 'react';
import { Check, Gift, Sparkles } from 'lucide-react';
import { Achievement } from '../types/game';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClaimAchievement: (achId: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClaimAchievement,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-3 px-3">
      {/* Title Banner */}
      <div className="mt-2.5 mb-2.5 flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-700/40 text-emerald-100 shadow-sm">
        <span className="font-bold text-amber-200 flex items-center gap-1.5">
          <span>🏆</span> Достижения и Награды Фермера
        </span>
        <span className="text-[10px] text-emerald-300">
          Выполняйте задания и получайте ценные кристаллы!
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {achievements.map((ach) => {
          const percent = Math.min(100, Math.floor((ach.current / ach.target) * 100));
          const canClaim = ach.unlocked && !ach.claimed;

          return (
            <div
              key={ach.id}
              className={`p-3 rounded-2xl border transition-all ${
                canClaim
                  ? 'bg-gradient-to-r from-amber-950 via-emerald-950 to-amber-950 border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                  : ach.claimed
                  ? 'bg-emerald-950/40 border-emerald-900/60 opacity-70'
                  : 'bg-emerald-950/80 border-emerald-800/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 rounded-xl bg-emerald-900/50 border border-emerald-700/50">
                    {ach.icon}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {ach.title}
                    </h4>
                    <p className="text-[10px] text-emerald-300 mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Reward preview */}
                <div className="flex items-center gap-1.5 shrink-0 bg-emerald-900/50 px-2 py-1 rounded-lg border border-emerald-700/50">
                  <span className="text-xs font-bold text-amber-300">+{ach.rewardCoins}🪙</span>
                  <span className="text-xs font-bold text-sky-300">+{ach.rewardGems}💎</span>
                </div>
              </div>

              {/* Progress Bar & Claim Button */}
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-emerald-800/40">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px] text-emerald-200 mb-1 font-semibold">
                    <span>Прогресс</span>
                    <span>
                      {Math.min(ach.current, ach.target)} / {ach.target}
                    </span>
                  </div>
                  <div className="w-full bg-emerald-950 rounded-full h-1.5 overflow-hidden border border-emerald-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Claim / Status */}
                <div className="shrink-0">
                  {canClaim ? (
                    <button
                      onClick={() => onClaimAchievement(ach.id)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-amber-950 font-extrabold rounded-xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1 animate-pulse"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Забрать</span>
                    </button>
                  ) : ach.claimed ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2 py-1 bg-emerald-900/40 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      <span>Получено</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400/60 font-semibold px-2 py-1">
                      В процессе
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
