import React from 'react';

export type TabType =
  | 'fields'
  | 'animals'
  | 'stables'
  | 'buildings'
  | 'decor'
  | 'neighbors'
  | 'orders'
  | 'barn'
  | 'achievements';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  readyCropsCount: number;
  readyAnimalsCount: number;
  readyBuildingsCount: number;
  readyOrdersCount: number;
  claimableAchievementsCount: number;
  availableNeighborsHelpCount?: number;
  availableDecorBadgeCount?: number;
  activeRidesReadyCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  readyCropsCount,
  readyAnimalsCount,
  readyBuildingsCount,
  readyOrdersCount,
  claimableAchievementsCount,
  availableNeighborsHelpCount = 0,
  availableDecorBadgeCount = 0,
  activeRidesReadyCount = 0,
}) => {
  const tabs = [
    { id: 'fields' as TabType, label: 'Поле', icon: '🌾', badge: readyCropsCount },
    { id: 'animals' as TabType, label: 'Загон', icon: '🐮', badge: readyAnimalsCount },
    { id: 'stables' as TabType, label: 'Конюшня', icon: '🐴', badge: activeRidesReadyCount },
    { id: 'buildings' as TabType, label: 'Заводы', icon: '🥖', badge: readyBuildingsCount },
    { id: 'decor' as TabType, label: 'Декор', icon: '⛲', badge: availableDecorBadgeCount },
    { id: 'orders' as TabType, label: 'Заказы', icon: '🚚', badge: readyOrdersCount },
    { id: 'neighbors' as TabType, label: 'Соседи', icon: '🏡', badge: availableNeighborsHelpCount },
    { id: 'barn' as TabType, label: 'Амбар', icon: '🎒', badge: 0 },
    { id: 'achievements' as TabType, label: 'Квесты', icon: '🏆', badge: claimableAchievementsCount },
  ];

  return (
    <nav className="w-full bg-emerald-950/95 backdrop-blur-md border-t border-emerald-800/80 px-0.5 sm:px-1 py-1 z-20 select-none shrink-0 shadow-lg">
      <div className="grid grid-cols-9 gap-0.5 max-w-xl md:max-w-3xl mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-b from-emerald-600/40 to-emerald-700/60 border border-emerald-500/60 text-amber-300 font-bold shadow-inner scale-102'
                  : 'text-emerald-300/80 hover:text-emerald-100 hover:bg-emerald-900/40'
              }`}
            >
              <span className={`text-base sm:text-xl transition-transform ${isActive ? 'scale-115 -translate-y-0.5' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[8px] sm:text-[10px] md:text-xs tracking-tight mt-0.5 font-medium leading-none truncate max-w-full">
                {tab.label}
              </span>

              {/* Notification Badge */}
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-rose-500 text-white text-[8px] sm:text-[9px] font-extrabold w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center shadow-md animate-bounce-mini">
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};


