import React, { useState } from 'react';
import { Map, X, Sparkles, Navigation, Layers, CheckCircle2, ChevronRight, ChevronDown, User } from 'lucide-react';
import { TabType } from './BottomNav';
import { sound } from '../utils/audio';

interface FarmMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: TabType) => void;
  level: number;
  unlockedPlotsCount: number;
  totalPlotsCount: number;
  readyCropsCount: number;
  animalsCount: number;
  readyAnimalsCount: number;
  unlockedBuildingsCount: number;
  totalBuildingsCount: number;
  ordersCount: number;
  readyOrdersCount: number;
  neighborsCount: number;
  placedDecorationsCount: number;
  currentSeasonName: string;
  currentSeasonEmoji: string;
  onOpenRecipeBook?: () => void;
}

export const FarmMapModal: React.FC<FarmMapModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  level,
  unlockedPlotsCount,
  totalPlotsCount,
  readyCropsCount,
  animalsCount,
  readyAnimalsCount,
  unlockedBuildingsCount,
  totalBuildingsCount,
  ordersCount,
  readyOrdersCount,
  neighborsCount,
  placedDecorationsCount,
  currentSeasonName,
  currentSeasonEmoji,
  onOpenRecipeBook,
}) => {
  // Состояние для отслеживания открытой зоны (по умолчанию открыты 'fields')
  const [expandedZone, setExpandedZone] = useState<TabType | null>('fields');

  if (!isOpen) return null;

  const farmZones = [
    {
      id: 'fields' as TabType,
      name: 'Поля & Фруктовый Сад',
      subtitle: 'Сельхозугодья, грядки и плодовые деревья',
      emoji: '🌾',
      badge: readyCropsCount > 0 ? `Готово: ${readyCropsCount} 🌾` : `${unlockedPlotsCount}/${totalPlotsCount} грядок`,
      badgeColor: readyCropsCount > 0 ? 'bg-amber-500 text-stone-950 font-extrabold animate-pulse' : 'bg-emerald-900/80 text-emerald-200',
      gradient: 'from-amber-900/40 via-emerald-950/70 to-emerald-900/50',
      border: readyCropsCount > 0 ? 'border-amber-400' : 'border-emerald-600/50',
      coords: 'Северная долина',
      status: readyCropsCount > 0 ? 'Созрел урожай!' : 'Идёт рост культур',
    },
    {
      id: 'animals' as TabType,
      name: 'Скотный Двор & Загоны',
      subtitle: 'Курятники, коровы, овечки и пчелиные ульи',
      emoji: '🐮',
      badge: readyAnimalsCount > 0 ? `Собрать: ${readyAnimalsCount} 🥛` : `${animalsCount} питомцев`,
      badgeColor: readyAnimalsCount > 0 ? 'bg-rose-500 text-white font-extrabold animate-pulse' : 'bg-emerald-900/80 text-emerald-200',
      gradient: 'from-amber-950/50 via-stone-900/70 to-emerald-950/50',
      border: readyAnimalsCount > 0 ? 'border-rose-400' : 'border-emerald-600/50',
      coords: 'Западный луг',
      status: readyAnimalsCount > 0 ? 'Продукция готова!' : 'Животные отдыхают',
    },
    {
      id: 'stables' as TabType,
      name: 'Императорская Конюшня & Манеж',
      subtitle: 'Породы скакунов, экипировка, уход и верховые прогулки',
      emoji: '🐴',
      badge: 'Скакуны & Прогулки',
      badgeColor: 'bg-amber-800/80 text-amber-200',
      gradient: 'from-amber-950/60 via-stone-900/80 to-emerald-950/60',
      border: 'border-amber-500/60',
      coords: 'Северо-западный манеж',
      status: 'Скакуны готовы к выезду',
    },
    {
      id: 'buildings' as TabType,
      name: 'Ремесленный Квартал & Заводы',
      subtitle: 'Ветряная мельница, пекарня, сыроварня, ткацкий станок',
      emoji: '🥐',
      badge: `${unlockedBuildingsCount}/${totalBuildingsCount} построек`,
      badgeColor: 'bg-amber-900/70 text-amber-200',
      gradient: 'from-stone-900/70 via-amber-950/40 to-stone-900/70',
      border: 'border-amber-600/50',
      coords: 'Центральная площадь',
      status: 'Печи топятся и работают',
    },
    {
      id: 'decor' as TabType,
      name: 'Усадьба & Парковый Декор',
      subtitle: 'Фонтаны, беседки, цветущие арки и ландшафт',
      emoji: '⛲',
      badge: `${placedDecorationsCount} украшений`,
      badgeColor: 'bg-purple-900/70 text-purple-200',
      gradient: 'from-purple-950/40 via-stone-900/70 to-amber-950/40',
      border: 'border-purple-500/50',
      coords: 'Центральный сад',
      status: 'Эстетическое поместье',
    },
    {
      id: 'orders' as TabType,
      name: 'Торговый Тракт & Грузовик',
      subtitle: 'Доставка заказов горожанам, ярмарка и почта',
      emoji: '🚚',
      badge: readyOrdersCount > 0 ? `Готово к отправке: ${readyOrdersCount} 🚚` : `${ordersCount} заказов`,
      badgeColor: readyOrdersCount > 0 ? 'bg-sky-500 text-stone-950 font-extrabold animate-pulse' : 'bg-stone-800 text-stone-300',
      gradient: 'from-sky-950/40 via-stone-900/70 to-emerald-950/50',
      border: readyOrdersCount > 0 ? 'border-sky-400' : 'border-stone-700',
      coords: 'Южный выезд',
      status: readyOrdersCount > 0 ? 'Грузовик ожидает погрузки!' : 'Сбор заказов',
    },
    {
      id: 'neighbors' as TabType,
      name: 'Соседский Тракт & Фактория',
      subtitle: 'Посещения соседских хозяйств, подарки и обмен товарами',
      emoji: '🏡',
      badge: `${neighborsCount} соседей`,
      badgeColor: 'bg-teal-900/70 text-teal-200',
      gradient: 'from-teal-950/40 via-emerald-950/60 to-stone-900/70',
      border: 'border-teal-500/50',
      coords: 'Восточный мост',
      status: 'Друзья на связи',
    },
  ];

  const handleSelectZone = (tab: TabType) => {
    sound.playTap();
    onNavigateTab(tab);
    onClose();
  };

  const toggleZone = (tab: TabType) => {
    sound.playTap();
    setExpandedZone(expandedZone === tab ? null : tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/70 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-amber-100">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-emerald-600 border border-amber-400 flex items-center justify-center text-2xl shadow-lg">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-game text-amber-200 leading-tight">
                  Интерактивная Карта Поместья
                </h2>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-600/50 font-bold">
                  Уровень {level}
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/90 flex items-center gap-1.5 mt-0.5">
                <span>{currentSeasonEmoji} Сезон: {currentSeasonName}</span>
                <span>•</span>
                <span>Нажмите на сектор для просмотра деталей</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRecipeBook && (
              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                  onOpenRecipeBook();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Открыть старинную книгу рецептов"
              >
                <span>📜</span>
                <span className="hidden sm:inline">Книга Рецептов</span>
              </button>
            )}

            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Map Overview Mini Panorama Banner */}
        <div className="my-2.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-amber-950/50 to-emerald-950/80 border border-emerald-700/60 flex items-center justify-between gap-2 shadow-inner shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏞️</span>
            <div>
              <span className="text-xs font-bold text-amber-200 block">
                Генеральный план владения «Солнечная Ферма»
              </span>
              <span className="text-[10px] text-emerald-300">
                Все 6 секторов функционируют. Быстрый обзор готовности ресурсов:
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-xs">
            {readyCropsCount > 0 && (
              <span className="px-2 py-1 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-[10px]">
                🌾 {readyCropsCount}
              </span>
            )}
            {readyAnimalsCount > 0 && (
              <span className="px-2 py-1 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-300 font-bold text-[10px]">
                🥛 {readyAnimalsCount}
              </span>
            )}
            {readyOrdersCount > 0 && (
              <span className="px-2 py-1 rounded-xl bg-sky-500/20 border border-sky-400 text-sky-300 font-bold text-[10px]">
                🚚 {readyOrdersCount}
              </span>
            )}
          </div>
        </div>

        {/* Interactive Farm Zones Accordion (Single Column layout for accordion) */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 pr-1 py-1">
          {farmZones.map((zone) => {
            const isExpanded = expandedZone === zone.id;

            return (
              <div
                key={zone.id}
                className={`rounded-2xl border bg-gradient-to-br transition-all duration-300 shadow-md overflow-hidden ${
                  isExpanded ? `${zone.gradient}${zone.border}` : 'bg-stone-900 border-stone-800/80'
                }`}
              >
                {/* Аккордеон: Заголовок (Кликабельный) */}
                <button
                  onClick={() => toggleZone(zone.id)}
                  className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-stone-800/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-stone-900/80 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {zone.emoji}
                    </div>
                    <div>
                      <h3 className={`text-xs sm:text-sm font-bold transition-colors ${isExpanded ? 'text-amber-200' : 'text-stone-300'}`}>
                        {zone.name}
                      </h3>
                      {!isExpanded && (
                         <span className="text-[10px] text-stone-500 block leading-tight font-mono mt-0.5">
                           📍 {zone.coords}
                         </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg border border-amber-500/30 shrink-0 ${zone.badgeColor}`}>
                      {zone.badge}
                    </span>
                    <div className="text-stone-500">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Аккордеон: Раскрывающийся контент */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                    <p className="text-[11px] text-stone-300/90 mb-3 leading-relaxed">
                      {zone.subtitle}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/80 text-[10px]">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{zone.status}</span>
                      </span>
                      
                      {/* Кнопка "Перейти" теперь внутри раскрытого контента */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Предотвращает закрытие аккордеона при клике на Перейти
                          handleSelectZone(zone.id);
                        }}
                        className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Перейти в локацию</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Fast Navigation Footnote */}
        <div className="mt-2.5 pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1">
            <Navigation className="w-3 h-3 text-amber-400" />
            <span>Карта синхронизирована с текущим состоянием хозяйства</span>
          </span>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="text-amber-300 hover:text-amber-200 font-bold cursor-pointer"
          >
            Закрыть карту [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};