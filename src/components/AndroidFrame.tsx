import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, RotateCw, Download, Volume2, VolumeX, Music, Maximize2 } from 'lucide-react';
import { sound } from '../utils/audio';

export type DeviceMode = 'phone' | 'tablet' | 'fullscreen';
export type OrientationMode = 'portrait' | 'landscape';

interface AndroidFrameProps {
  children: React.ReactNode;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenInstallModal: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onOpenInstallModal,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('phone');
  const [orientation, setOrientation] = useState<OrientationMode>('portrait');
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const toggleOrientation = () => {
    sound.playTap();
    setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'));
  };

  const handleDeviceChange = (mode: DeviceMode) => {
    sound.playTap();
    setDeviceMode(mode);
  };

  // Determine container dimensions based on deviceMode & orientation
  const getContainerClasses = () => {
    if (deviceMode === 'fullscreen') {
      return 'w-full min-h-screen sm:min-h-[96vh] max-w-6xl sm:rounded-3xl sm:border-2 border-emerald-700/60';
    }

    if (deviceMode === 'tablet') {
      if (orientation === 'landscape') {
        // Landscape Tablet (e.g., 1024x768 / 980x640)
        return 'w-full sm:max-w-[960px] sm:h-[620px] sm:max-h-[92vh] sm:rounded-[36px] sm:border-[12px] sm:border-stone-850 sm:ring-4 sm:ring-black/50';
      } else {
        // Portrait Tablet (e.g., 768x1024 / 640x880)
        return 'w-full sm:max-w-[680px] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[36px] sm:border-[12px] sm:border-stone-850 sm:ring-4 sm:ring-black/50';
      }
    }

    // Phone Mode
    if (orientation === 'landscape') {
      // Landscape Smartphone (e.g., 820x412)
      return 'w-full sm:max-w-[780px] sm:h-[420px] sm:max-h-[90vh] sm:rounded-[40px] sm:border-[10px] sm:border-stone-800 sm:ring-4 sm:ring-black/40';
    } else {
      // Standard Portrait Smartphone (412x860)
      return 'w-full sm:max-w-[420px] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[10px] sm:border-stone-800 sm:ring-4 sm:ring-black/40';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 flex flex-col items-center justify-center p-0 sm:p-3 overflow-x-hidden transition-colors duration-300">
      {/* Top Desktop Helper Toolbar with Device Selector & Screen Flip */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-5xl mb-2 px-3 text-xs text-amber-200/90 select-none">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-lg">🌾</span>
          <span className="font-game tracking-wide text-amber-300">Солнечная Ферма</span>
          <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-600/40 px-2 py-0.5 rounded-full font-mono">
            {deviceMode === 'phone' ? '📱 Смартфон' : deviceMode === 'tablet' ? '📟 Планшет' : '🖥️ Полный экран'} • {orientation === 'portrait' ? 'Портрет' : 'Альбомный (переворот)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Switcher (Phone / Tablet / Fullscreen) */}
          <div className="flex items-center bg-stone-900/90 border border-amber-800/60 p-0.5 rounded-xl shadow-sm">
            <button
              onClick={() => handleDeviceChange('phone')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
                deviceMode === 'phone'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-amber-200 hover:text-white hover:bg-stone-800'
              }`}
              title="Режим смартфона (Android Phone)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Телефон</span>
            </button>

            <button
              onClick={() => handleDeviceChange('tablet')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
                deviceMode === 'tablet'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-amber-200 hover:text-white hover:bg-stone-800'
              }`}
              title="Режим планшета (Android Tablet)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Планшет</span>
            </button>

            <button
              onClick={() => handleDeviceChange('fullscreen')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
                deviceMode === 'fullscreen'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-amber-200 hover:text-white hover:bg-stone-800'
              }`}
              title="Широкий экран"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Экран</span>
            </button>
          </div>

          {/* Screen Flip Button (Поворот / Переворот экрана) */}
          <button
            onClick={toggleOrientation}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer font-bold text-[11px] border shadow-sm ${
              orientation === 'landscape'
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-stone-950 border-teal-300 ring-2 ring-teal-400/50'
                : 'bg-stone-900/90 text-amber-300 border-amber-700/60 hover:bg-stone-800'
            }`}
            title="Перевернуть экран (Альбомный / Портретный вид)"
          >
            <RotateCw className="w-3.5 h-3.5 animate-spin-once" />
            <span>Переворот ({orientation === 'portrait' ? '90°' : 'Вертикаль'})</span>
          </button>

          {/* Install PWA Button */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 border border-emerald-400/60 text-white font-bold rounded-xl px-2.5 py-1 text-[11px] shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Установить</span>
          </button>
        </div>
      </div>

      {/* Main Container: Bezel according to selected Device & Orientation */}
      <div
        className={`transition-all duration-300 relative flex flex-col bg-emerald-950 overflow-hidden shadow-2xl ${getContainerClasses()}`}
      >
        {/* Status Bar */}
        <div className="w-full bg-emerald-950/95 text-emerald-100 text-xs px-4 pt-2 pb-1.5 flex items-center justify-between border-b border-emerald-900/40 select-none z-30 shrink-0">
          <div className="font-semibold tracking-wide text-xs pl-1 flex items-center gap-2">
            <span>{currentTime}</span>
            {deviceMode === 'tablet' && (
              <span className="text-[9px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-700/50">
                Tablet HD
              </span>
            )}
          </div>

          {/* Android Punch Hole Camera (on Phone/Tablet mode) */}
          {deviceMode !== 'fullscreen' && (
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-stone-800 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>
            </div>
          )}

          {/* Status indicators (Sound controls, Screen Flip Quick Toggle, WiFi, Battery) */}
          <div className="flex items-center gap-2 pr-1">
            {/* Quick Screen Flip icon in status bar for mobile / tablet touch */}
            <button
              onClick={toggleOrientation}
              className={`p-1 rounded transition-colors cursor-pointer ${
                orientation === 'landscape' ? 'text-teal-300 hover:text-teal-200' : 'text-emerald-400 hover:text-white'
              }`}
              title="Перевернуть экран (горизонтальный / вертикальный)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleMusic}
              className={`p-1 rounded transition-colors cursor-pointer ${
                musicEnabled ? 'text-amber-300 hover:text-amber-200' : 'text-emerald-500/60 hover:text-emerald-300'
              }`}
              title={musicEnabled ? 'Выключить музыку' : 'Включить музыку'}
            >
              <Music className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onToggleSound}
              className={`p-1 rounded transition-colors cursor-pointer ${
                soundEnabled ? 'text-amber-300 hover:text-amber-200' : 'text-emerald-500/60 hover:text-emerald-300'
              }`}
              title={soundEnabled ? 'Выключить звуки' : 'Включить звуки'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <span className="text-[10px] font-mono font-bold text-emerald-400">5G</span>
            <div className="flex items-center gap-0.5" title="Батарея 100%">
              <div className="w-4 h-2.5 border border-emerald-300/80 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-emerald-400 rounded-2xs"></div>
              </div>
              <div className="w-0.5 h-1 bg-emerald-300/80 rounded-r-xs"></div>
            </div>
          </div>
        </div>

        {/* Game Viewport Container with Dynamic Orientation styling */}
        <div className={`relative flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-sky-400 via-emerald-500 to-green-600 ${
          orientation === 'landscape' ? 'landscape-mode' : 'portrait-mode'
        }`}>
          {children}
        </div>

        {/* Android Bottom Gesture Bar */}
        {deviceMode !== 'fullscreen' && (
          <div className="hidden sm:flex justify-center items-center py-1 bg-emerald-950 select-none shrink-0">
            <div className={`h-1 bg-stone-500/60 rounded-full ${deviceMode === 'tablet' ? 'w-48' : 'w-28'}`}></div>
          </div>
        )}
      </div>
    </div>
  );
};
