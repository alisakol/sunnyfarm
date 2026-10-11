import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Check, X, Clock, Award } from 'lucide-react';
import { ClaimedRewardResult } from '../types/game';
import { DAILY_REWARDS_CONFIG } from '../utils/constants';

interface DailyRewardModalProps {
  onClose: () => void;
  dailyStreak: number;
  isDailyAvailable: boolean;
  onClaimDailyReward: () => ClaimedRewardResult | null;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  onClose,
  dailyStreak,
  isDailyAvailable,
  onClaimDailyReward,
}) => {
  const [claimedResult, setClaimedResult] = useState<ClaimedRewardResult | null>(null);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>('');

  // Current day index in the 7-day cycle (1 to 7)
  const currentDay = ((dailyStreak - 1) % 7) + 1;

  // Countdown to next midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilMidnight(
        `${String(hours).padStart(2, '0')}ч ${String(minutes).padStart(2, '0')}м ${String(seconds).padStart(2, '0')}с`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChest = () => {
    if (!isDailyAvailable || isOpening) return;

    setIsOpening(true);
    setTimeout(() => {
      const res = onClaimDailyReward();
      setClaimedResult(res);
      setIsOpening(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-amber-950 via-emerald-950 to-stone-950 border-2 border-amber-400/90 p-4 sm:p-5 shadow-2xl text-center relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Glow effect */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Серия входов: День {currentDay} из 7</span>
          </div>
          <h2 className="text-lg sm:text-xl font-game font-extrabold text-amber-300 flex items-center justify-center gap-1.5">
            <span>🎁</span> Ежедневный Подарок Фермера
          </h2>
          <p className="text-[11px] sm:text-xs text-emerald-200/90">
            Заходите в игру каждый день, чтобы забрать редкие ресурсы и джекпот!
          </p>
        </div>

        {/* Big Chest Animation Area */}
        <div className="my-2 p-3 rounded-2xl bg-gradient-to-b from-emerald-900/40 via-emerald-950/70 to-emerald-950/90 border border-emerald-700/60 relative overflow-hidden">
          {claimedResult ? (
            /* Reveal Screen */
            <div className="py-2 flex flex-col items-center animate-in zoom-in-95 duration-300">
              <span className="text-4xl animate-bounce-mini mb-1">🎉</span>
              <h3 className="text-sm font-game font-bold text-amber-200 mb-1">
                Вы получили награду за День {claimedResult.day}!
              </h3>

              <div className="flex flex-wrap items-center justify-center gap-2 my-2">
                {/* Coins */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/70 shadow-inner">
                  <span className="text-lg">🪙</span>
                  <span className="font-game font-extrabold text-sm text-amber-300">
                    +{claimedResult.coins}
                  </span>
                </div>

                {/* Gems */}
                {claimedResult.gems > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-950/80 border border-sky-500/70 shadow-inner">
                    <span className="text-lg">💎</span>
                    <span className="font-game font-extrabold text-sm text-sky-300">
                      +{claimedResult.gems}
                    </span>
                  </div>
                )}

                {/* Rare Resource */}
                {claimedResult.resource && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/70 shadow-inner">
                    <span className="text-lg">{claimedResult.resource.emoji}</span>
                    <span className="font-game font-extrabold text-sm text-emerald-200">
                      +{claimedResult.resource.count} {claimedResult.resource.name}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-emerald-300 mt-1">
                Все призы уже добавлены в ваш амбар и кошелёк!
              </p>
            </div>
          ) : isDailyAvailable ? (
            /* Unclaimed Chest Ready To Open */
            <div className="py-2 flex flex-col items-center">
              <button
                disabled={isOpening}
                onClick={handleOpenChest}
                className={`relative group cursor-pointer transition-transform ${
                  isOpening ? 'scale-110 animate-wiggle' : 'hover:scale-105 active:scale-95'
                }`}
              >
                <div className="text-5xl sm:text-6xl drop-shadow-xl animate-bounce-mini filter">
                  {currentDay === 7 ? '👑' : '🎁'}
                </div>
                <div className="absolute -bottom-1 inset-x-0 h-3 bg-black/40 rounded-full blur-xs -z-10" />
              </button>

              <div className="mt-2 text-xs font-game font-bold text-amber-200">
                {currentDay === 7 ? 'Королевский сундук 7-го дня!' : `Сундук дня #${currentDay} ждёт вас!`}
              </div>

              <button
                disabled={isOpening}
                onClick={handleOpenChest}
                className="mt-2.5 px-5 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-game font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <Gift className="w-4 h-4" />
                <span>{isOpening ? 'Открываем...' : 'Открыть подарок'}</span>
              </button>
            </div>
          ) : (
            /* Already Claimed Today */
            <div className="py-2.5 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-900/60 border border-emerald-600/60 flex items-center justify-center text-emerald-300 mb-1.5">
                <Check className="w-6 h-6 text-emerald-400 stroke-[3]" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">
                Награда за сегодня уже получена!
              </h4>
              <div className="flex items-center gap-1 text-[11px] text-amber-300 mt-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Следующий подарок через: <b>{timeUntilMidnight}</b></span>
              </div>
            </div>
          )}
        </div>

        {/* 7-Days Streak Calendar Grid */}
        <div className="overflow-y-auto no-scrollbar flex-1 pr-0.5">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Календарь наград недели:</span>
            </span>
            <span className="text-[10px] text-emerald-300">
              {currentDay < 7 ? `До джекпота: ${7 - currentDay} дн.` : 'Сегодня джекпот!'}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {DAILY_REWARDS_CONFIG.map((tier) => {
              const isPast = tier.day < currentDay || (!isDailyAvailable && tier.day === currentDay);
              const isToday = tier.day === currentDay;
              const isJackpot = tier.day === 7;

              return (
                <div
                  key={tier.day}
                  className={`relative rounded-xl p-1.5 border flex flex-col items-center justify-between text-center transition-all ${
                    isToday && isDailyAvailable
                      ? 'bg-gradient-to-b from-amber-600/30 to-amber-950/80 border-amber-400 ring-2 ring-amber-400/80 shadow-md scale-102'
                      : isPast
                      ? 'bg-emerald-950/50 border-emerald-800/50 opacity-80'
                      : 'bg-emerald-950/70 border-emerald-800/70'
                  } ${isJackpot ? 'col-span-2 sm:col-span-1 bg-gradient-to-b from-yellow-900/30 to-emerald-950/90' : ''}`}
                >
                  {/* Past Checkmark Badge */}
                  {isPast && (
                    <div className="absolute top-1 right-1 bg-emerald-500 text-stone-950 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8px] font-extrabold">
                      ✓
                    </div>
                  )}

                  {/* Day Label */}
                  <span className={`text-[9px] font-bold ${isToday ? 'text-amber-300' : 'text-emerald-300'}`}>
                    День {tier.day}
                  </span>

                  {/* Icon */}
                  <div className="my-0.5 text-xl">
                    {isJackpot ? '👑' : tier.resource?.emoji || '🪙'}
                  </div>

                  {/* Rewards preview */}
                  <div className="text-[8px] leading-tight">
                    <span className="font-bold text-amber-300 block">
                      {tier.minCoins}-{tier.maxCoins}🪙
                    </span>
                    {tier.gems && (
                      <span className="text-sky-300 font-semibold block">
                        +{tier.gems}💎
                      </span>
                    )}
                    {tier.resource && (
                      <span className="text-emerald-200 truncate max-w-[50px] block">
                        +{tier.resource.minCount} {tier.resource.emoji}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-3 pt-2 border-t border-emerald-900/80">
          <button
            onClick={onClose}
            className="w-full py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white font-game font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {claimedResult ? 'Отлично, спасибо!' : 'Вернуться на ферму'}
          </button>
        </div>
      </div>
    </div>
  );
};
