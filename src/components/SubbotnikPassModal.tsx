import React from 'react';
import { X, Lock, CheckCircle2, Gift, Star, Leaf, Coins, Gem, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';
import { vibrateLight } from '../utils/haptics';

export interface PassReward {
  level: number;
  pointsRequired: number;
  free: { type: 'coins' | 'gems' | 'item'; amount: number; name: string; emoji: string };
  premium: { type: 'coins' | 'gems' | 'item' | 'decor'; amount: number; name: string; emoji: string };
}

// Шаблоны наград
const SUBBOTNIK_REWARDS: PassReward[] = [
  { level: 1, pointsRequired: 50, free: { type: 'coins', amount: 300, name: 'Монеты', emoji: '🪙' }, premium: { type: 'item', amount: 5, name: 'Эко-удобрение', emoji: '✨' } },
  { level: 2, pointsRequired: 150, free: { type: 'item', amount: 10, name: 'Семена тыквы', emoji: '🎃' }, premium: { type: 'gems', amount: 15, name: 'Кристаллы', emoji: '💎' } },
  { level: 3, pointsRequired: 300, free: { type: 'coins', amount: 500, name: 'Монеты', emoji: '🪙' }, premium: { type: 'item', amount: 3, name: 'Яблочный пирог', emoji: '🥧' } },
  { level: 4, pointsRequired: 500, free: { type: 'gems', amount: 5, name: 'Кристаллы', emoji: '💎' }, premium: { type: 'coins', amount: 2000, name: 'Монеты', emoji: '🪙' } },
  { level: 5, pointsRequired: 800, free: { type: 'item', amount: 5, name: 'Осенний морс', emoji: '🧃' }, premium: { type: 'decor', amount: 1, name: 'Золотая Тачка с Листьями', emoji: '🍂' } },
];

interface SubbotnikPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  isPremiumUnlocked: boolean;
  claimedFreeLevels: number[];
  claimedPremiumLevels: number[];
  onUnlockPremium: () => void;
  onClaimReward: (level: number, isPremium: boolean, reward: any) => void;
}

export const SubbotnikPassModal: React.FC<SubbotnikPassModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  isPremiumUnlocked,
  claimedFreeLevels,
  claimedPremiumLevels,
  onUnlockPremium,
  onClaimReward,
}) => {
  if (!isOpen) return null;

  const maxPoints = SUBBOTNIK_REWARDS[SUBBOTNIK_REWARDS.length - 1].pointsRequired;
  const progressPercent = Math.min(100, (currentPoints / maxPoints) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-stone-900 border-2 border-orange-600/60 rounded-3xl p-3 sm:p-4 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-stone-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-orange-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-400 flex items-center justify-center text-2xl shadow-lg">
              🍂
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-game text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-500 uppercase tracking-wide">
                Осенний Субботник
              </h2>
              <p className="text-[11px] sm:text-xs text-orange-200/80 font-medium">
                Выполняйте квесты, убирайте листья и получайте награды!
              </p>
            </div>
          </div>
          <button
            onClick={() => { sound.playTap(); onClose(); }}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="my-4 bg-orange-950/40 border border-orange-900/50 p-3 rounded-2xl shrink-0">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Очки Субботника:
            </span>
            <span className="text-sm font-black text-white">{currentPoints} <span className="text-orange-500">/ {maxPoints}</span></span>
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Premium Banner */}
        {!isPremiumUnlocked && (
          <div className="mb-4 shrink-0 bg-gradient-to-r from-amber-900/80 via-orange-900/80 to-amber-900/80 border border-amber-500/50 rounded-2xl p-3 flex items-center justify-between shadow-lg">
            <div>
              <span className="font-black text-amber-300 text-sm flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-300" /> Золотой Билет
              </span>
              <span className="text-[10px] text-amber-100/70 block mt-0.5">
                Откройте премиум-награды и эксклюзивный декор!
              </span>
            </div>
            <button
              onClick={onUnlockPremium}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black text-xs rounded-xl shadow-md hover:scale-105 transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" /> Купить (100 💎)
            </button>
          </div>
        )}

        {/* Rewards Track */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 pb-4">
          <div className="grid grid-cols-[50px_1fr_1fr] gap-2 mb-2 px-2">
            <div className="text-[10px] font-bold text-stone-500 text-center uppercase">Очки</div>
            <div className="text-[10px] font-bold text-emerald-400/70 text-center uppercase">Бесплатно</div>
            <div className="text-[10px] font-bold text-amber-400/70 text-center uppercase flex items-center justify-center gap-1">
              <Star className="w-3 h-3" /> Золотой
            </div>
          </div>

          {SUBBOTNIK_REWARDS.map((tier) => {
            const isUnlocked = currentPoints >= tier.pointsRequired;
            const freeClaimed = claimedFreeLevels.includes(tier.level);
            const premiumClaimed = claimedPremiumLevels.includes(tier.level);

            return (
              <div key={tier.level} className="grid grid-cols-[50px_1fr_1fr] gap-2 items-center">
                {/* Milestone Points */}
                <div className="flex flex-col items-center justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 ${
                    isUnlocked ? 'bg-orange-500/20 border-orange-500 text-orange-300' : 'bg-stone-800 border-stone-700 text-stone-500'
                  }`}>
                    {tier.pointsRequired}
                  </div>
                  {tier.level !== SUBBOTNIK_REWARDS.length && (
                    <div className={`w-1 h-6 ${isUnlocked ? 'bg-orange-500/50' : 'bg-stone-800'}`} />
                  )}
                </div>

                {/* Free Reward */}
                <div className={`relative p-2.5 rounded-2xl border transition-all ${
                  freeClaimed ? 'bg-emerald-950/20 border-emerald-900/30 opacity-60' :
                  isUnlocked ? 'bg-emerald-950/60 border-emerald-500/50 hover:bg-emerald-900/60 cursor-pointer shadow-md' :
                  'bg-stone-900/50 border-stone-800 opacity-50'
                }`}
                onClick={() => {
                  if (isUnlocked && !freeClaimed) {
                    sound.playTap();
                    vibrateLight();
                    onClaimReward(tier.level, false, tier.free);
                  }
                }}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tier.free.emoji}</span>
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-white block">{tier.free.name}</span>
                      <span className="text-[10px] font-extrabold text-emerald-300">x{tier.free.amount}</span>
                    </div>
                  </div>
                  {freeClaimed && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />}
                </div>

                {/* Premium Reward */}
                <div className={`relative p-2.5 rounded-2xl border transition-all ${
                  !isPremiumUnlocked ? 'bg-stone-900 border-stone-800 opacity-50 grayscale' :
                  premiumClaimed ? 'bg-amber-950/20 border-amber-900/30 opacity-60' :
                  isUnlocked ? 'bg-gradient-to-br from-amber-900/60 to-orange-950/60 border-amber-500/50 hover:from-amber-800/60 cursor-pointer shadow-md' :
                  'bg-stone-900/50 border-stone-800 opacity-50'
                }`}
                onClick={() => {
                  if (isPremiumUnlocked && isUnlocked && !premiumClaimed) {
                    sound.playTap();
                    vibrateLight();
                    onClaimReward(tier.level, true, tier.premium);
                  }
                }}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tier.premium.emoji}</span>
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-amber-100 block">{tier.premium.name}</span>
                      <span className="text-[10px] font-extrabold text-amber-400">x{tier.premium.amount}</span>
                    </div>
                  </div>
                  {!isPremiumUnlocked && <Lock className="absolute top-2 right-2 w-3.5 h-3.5 text-stone-500" />}
                  {isPremiumUnlocked && premiumClaimed && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-amber-500" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
