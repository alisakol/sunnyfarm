import React, { useState } from 'react';
import { X, Cloud, CloudCheck, RefreshCw, LogIn, LogOut, ShieldCheck, Smartphone, Laptop, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CloudSavePayload } from '../services/cloudSync';

interface AuthModalProps {
  onClose: () => void;
  currentFarmState: CloudSavePayload;
  onApplyCloudSave: (savedState: CloudSavePayload) => void;
  onShowNotification?: (text: string, color?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  currentFarmState,
  onApplyCloudSave,
  onShowNotification,
}) => {
  const { user, isLoadingAuth, isSyncing, lastSyncedAt, syncError, login, logout, saveToCloud, loadFromCloud } = useAuth();
  const [localFeedback, setLocalFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleLogin = async () => {
    try {
      setIsProcessing(true);
      setLocalFeedback(null);
      const u = await login();
      if (u) {
        setLocalFeedback('Вы успешно вошли в аккаунт Google!');
        onShowNotification?.('Вход выполнен! Синхронизируем ферму...', 'text-emerald-300');
        // Check if there is an existing cloud save
        const cloudData = await loadFromCloud();
        if (cloudData && (cloudData.level > currentFarmState.level || cloudData.coins > currentFarmState.coins)) {
          // Cloud has more advanced progress, apply it!
          onApplyCloudSave(cloudData);
          onShowNotification?.('Загружено сохранение из облака!', 'text-amber-300');
        } else {
          // Push current state to cloud
          await saveToCloud(currentFarmState);
          onShowNotification?.('Прогресс сохранен в облако!', 'text-emerald-300');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setLocalFeedback('Не удалось войти в аккаунт. Попробуйте еще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSave = async () => {
    setIsProcessing(true);
    setLocalFeedback(null);
    const success = await saveToCloud(currentFarmState);
    setIsProcessing(false);
    if (success) {
      setLocalFeedback('Прогресс успешно сохранён в облако!');
      onShowNotification?.('Ферма сохранена в облаке!', 'text-emerald-300');
    } else {
      setLocalFeedback('Ошибка сохранения. Проверьте соединение.');
    }
  };

  const handleManualLoad = async () => {
    setIsProcessing(true);
    setLocalFeedback(null);
    const data = await loadFromCloud();
    setIsProcessing(false);
    if (data) {
      onApplyCloudSave(data);
      setLocalFeedback('Сохранение успешно загружено из облака!');
      onShowNotification?.('Ферма загружена из облака!', 'text-amber-300');
    } else {
      setLocalFeedback('В облаке пока нет более нового сохранения.');
    }
  };

  const handleLogout = async () => {
    setIsProcessing(true);
    await logout();
    setIsProcessing(false);
    setLocalFeedback('Вы вышли из аккаунта. Локальный прогресс сохранен.');
    onShowNotification?.('Вы вышли из аккаунта', 'text-stone-300');
  };

  const formattedSyncTime = lastSyncedAt
    ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-emerald-900 via-stone-900 to-stone-950 border border-emerald-600/80 p-5 shadow-2xl text-left relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
            <Cloud className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-game font-bold text-white leading-tight">
              Облачная синхронизация
            </h3>
            <p className="text-[11px] text-emerald-300/80">Сохранение на всех ваших устройствах</p>
          </div>
        </div>

        {/* Feedback Alert */}
        {(localFeedback || syncError) && (
          <div
            className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              syncError
                ? 'bg-rose-950/80 border border-rose-700/60 text-rose-200'
                : 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-200'
            }`}
          >
            {syncError ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span className="leading-snug">{syncError || localFeedback}</span>
          </div>
        )}

        {!user ? (
          /* NOT LOGGED IN STATE */
          <div className="flex flex-col gap-3">
            <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-2xl p-3.5 flex flex-col gap-2.5">
              <p className="text-xs text-emerald-100 leading-relaxed">
                Войдите в аккаунт, чтобы игровой прогресс, монеты, кристаллы и постройки автоматически синхронизировались между всеми вашими устройствами.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-200/90 font-medium pt-1">
                <div className="flex items-center gap-1.5 bg-stone-900/70 p-2 rounded-xl border border-emerald-900/50">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Телефон</span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-900/70 p-2 rounded-xl border border-emerald-900/50">
                  <Laptop className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Компьютер</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-300 px-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ваш текущий прогресс не сбросится, а сохранится в облаке.</span>
            </div>

            {/* Google Sign In Button */}
            <button
              onClick={handleLogin}
              disabled={isProcessing || isLoadingAuth}
              className="w-full mt-1 py-3 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-98 transition-all cursor-pointer disabled:opacity-60"
            >
              {/* Google G Logo SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isProcessing ? 'Авторизация...' : 'Войти через Google'}</span>
            </button>
          </div>
        ) : (
          /* LOGGED IN STATE */
          <div className="flex flex-col gap-3">
            {/* User Profile Card */}
            <div className="bg-emerald-950/70 border border-emerald-700/70 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Фермер'}
                    className="w-10 h-10 rounded-full border-2 border-emerald-400 object-cover shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                    {user.displayName?.charAt(0) || 'Ф'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate">
                    {user.displayName || 'Фермер'}
                  </div>
                  <div className="text-[10px] text-emerald-300 truncate">
                    {user.email || 'Google Аккаунт'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-emerald-900/60 border border-emerald-600/50 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Облако</span>
              </div>
            </div>

            {/* Sync Status Info */}
            <div className="bg-stone-900/70 border border-stone-800 rounded-2xl p-3 flex flex-col gap-1.5 text-xs text-stone-300">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Статус:</span>
                <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Автосинхронизация активна
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-400">Последняя синхронизация:</span>
                <span className="text-[11px] text-amber-200 font-mono">
                  {formattedSyncTime ? formattedSyncTime : 'Только что'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleManualSave}
                disabled={isProcessing || isSyncing}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Сохранить</span>
              </button>

              <button
                onClick={handleManualLoad}
                disabled={isProcessing || isSyncing}
                className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                <span>Загрузить</span>
              </button>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={isProcessing}
              className="w-full py-2 px-3 rounded-xl bg-stone-900/60 hover:bg-rose-950/60 border border-stone-800 hover:border-rose-800/60 text-stone-400 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти из аккаунта</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
