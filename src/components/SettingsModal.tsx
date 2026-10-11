import React, { useState } from 'react';
import { Volume2, VolumeX, Music, RotateCcw, X, Smartphone, Award, Cloud } from 'lucide-react';
import { PlayerStats } from '../types/game';

interface SettingsModalProps {
  onClose: () => void;
  soundEnabled: boolean;
  musicEnabled: boolean;
  stats: PlayerStats;
  user?: any;
  onOpenAuth?: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenInstallModal: () => void;
  onOpenSeasonModal?: () => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  soundEnabled,
  musicEnabled,
  stats,
  user,
  onOpenAuth,
  onToggleSound,
  onToggleMusic,
  onOpenInstallModal,
  onOpenSeasonModal,
  onResetGame,
}) => {
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-emerald-900 via-emerald-950 to-stone-950 border border-emerald-600/80 p-5 shadow-2xl text-left relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-game font-bold text-white mb-3 flex items-center gap-2">
          <span>⚙️</span> Настройки Фермы
        </h3>

        {/* Audio Toggles */}
        <div className="bg-emerald-950/70 border border-emerald-800/70 rounded-2xl p-3 mb-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-100 flex items-center gap-2 font-semibold">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
              <span>Звуковые эффекты</span>
            </span>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-amber-500 text-amber-950 shadow-sm'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
            >
              {soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-emerald-850/60 pt-2">
            <span className="text-xs text-emerald-100 flex items-center gap-2 font-semibold">
              <Music className={`w-4 h-4 ${musicEnabled ? 'text-amber-400' : 'text-stone-400'}`} />
              <span>Музыкальное сопровождение</span>
            </span>
            <button
              onClick={onToggleMusic}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                musicEnabled
                  ? 'bg-amber-500 text-amber-950 shadow-sm'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
            >
              {musicEnabled ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
          </div>
        </div>

        {/* Player Stats */}
        <div className="bg-emerald-950/70 border border-emerald-800/70 rounded-2xl p-3 mb-3">
          <span className="text-xs font-bold text-amber-200 block mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Статистика фермы:</span>
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-200">
            <div className="bg-emerald-900/40 p-1.5 rounded-lg border border-emerald-800/50">
              <span className="text-stone-400 block text-[10px]">Собрано растений:</span>
              <span className="font-bold text-white text-xs">{stats.totalHarvested} шт.</span>
            </div>
            <div className="bg-emerald-900/40 p-1.5 rounded-lg border border-emerald-800/50">
              <span className="text-stone-400 block text-[10px]">Продуктов животных:</span>
              <span className="font-bold text-white text-xs">{stats.totalAnimalProducts} шт.</span>
            </div>
            <div className="bg-emerald-900/40 p-1.5 rounded-lg border border-emerald-800/50">
              <span className="text-stone-400 block text-[10px]">Приготовлено блюд:</span>
              <span className="font-bold text-white text-xs">{stats.totalCrafted} шт.</span>
            </div>
            <div className="bg-emerald-900/40 p-1.5 rounded-lg border border-emerald-800/50">
              <span className="text-stone-400 block text-[10px]">Заказов доставлено:</span>
              <span className="font-bold text-white text-xs">{stats.totalOrdersDelivered} шт.</span>
            </div>
          </div>
        </div>

        {/* Cloud Sync & Account Button */}
        {onOpenAuth && (
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="w-full mb-2.5 py-2.5 bg-gradient-to-r from-emerald-950 via-sky-950 to-stone-900 hover:from-emerald-900 hover:to-sky-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-between px-3 border border-sky-600/50 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-400" />
              <span>{user ? `Облако: ${user.displayName || 'Подключено'}` : 'Войти и сохранить в облаке'}</span>
            </div>
            <span className="text-[10px] text-sky-300 font-mono bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-700/60">
              {user ? 'Активно ✅' : 'Google Вход'}
            </span>
          </button>
        )}

        {/* Seasonal Decorations Button */}
        {onOpenSeasonModal && (
          <button
            onClick={() => {
              onClose();
              onOpenSeasonModal();
            }}
            className="w-full mb-2.5 py-2 bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-600/60 shadow-sm"
          >
            <span className="text-sm">🎪</span>
            <span>Сезонные декорации и времена года</span>
          </button>
        )}

        {/* Install Android Button */}
        <button
          onClick={() => {
            onClose();
            onOpenInstallModal();
          }}
          className="w-full mb-3 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-600/50"
        >
          <Smartphone className="w-4 h-4 text-emerald-300" />
          <span>Инструкция по установке на Android</span>
        </button>

        {/* Reset Farm */}
        <div className="pt-2 border-t border-emerald-850">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-1.5 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Начать игру с чистого листа</span>
            </button>
          ) : (
            <div className="bg-rose-950/80 border border-rose-800 rounded-xl p-2.5 text-center">
              <p className="text-[11px] text-rose-200 mb-2 font-medium">
                Вы уверены? Весь текущий прогресс будет сброшен!
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={onResetGame}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Да, сбросить
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
