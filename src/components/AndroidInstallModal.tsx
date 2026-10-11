import React from 'react';
import { Smartphone, Download, X, CheckCircle2 } from 'lucide-react';

interface AndroidInstallModalProps {
  onClose: () => void;
  deferredPrompt?: any;
  onTriggerInstall?: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  onClose,
  deferredPrompt,
  onTriggerInstall,
}) => {
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 border border-emerald-300 flex items-center justify-center text-2xl shadow-md">
            🌾
          </div>
          <div>
            <h3 className="text-base font-game font-bold text-white leading-tight">
              Установка на Android
            </h3>
            <span className="text-xs text-emerald-300">
              Полноэкранная игра без браузерной строки
            </span>
          </div>
        </div>

        {/* Direct Install Button if supported by browser */}
        {deferredPrompt && onTriggerInstall && (
          <button
            onClick={() => {
              onTriggerInstall();
              onClose();
            }}
            className="w-full mb-3.5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 text-emerald-950 font-game font-extrabold text-sm rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Установить прямо сейчас</span>
          </button>
        )}

        {/* Step-by-step Guide */}
        <div className="bg-emerald-950/70 border border-emerald-800/70 rounded-2xl p-3.5 mb-4 flex flex-col gap-3 text-xs text-emerald-100">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <span className="font-bold text-white block">Откройте сайт в Google Chrome</span>
              <span className="text-[11px] text-emerald-300">
                На вашем Android смартфоне откройте эту страницу в мобильном Chrome.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <span className="font-bold text-white block">Нажмите меню (три точки ⋮)</span>
              <span className="text-[11px] text-emerald-300">
                В правом верхнем углу браузера нажмите на иконку настроек Chrome.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-800 text-emerald-200 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <span className="font-bold text-white block">"Добавить на главный экран"</span>
              <span className="text-[11px] text-emerald-300">
                Или пункт "Установить приложение". На рабочем столе появится ярлык «Солнечная Ферма»!
              </span>
            </div>
          </div>
        </div>

        {/* Feature benefits */}
        <div className="space-y-1.5 text-xs text-emerald-200/90 mb-4 px-1">
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Работает в автономном режиме без интернета</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Плавная анимация 60 FPS и вибрация касаний</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Автосохранение всего прогресса на телефоне</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-emerald-800/80 hover:bg-emerald-700/80 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};
