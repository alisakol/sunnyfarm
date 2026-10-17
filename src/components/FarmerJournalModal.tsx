import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Calendar,
  Award,
  Crown,
  Scroll,
  ShoppingBag,
  TrendingUp,
  Bookmark,
  Share2,
} from 'lucide-react';
import { FarmerJournalEntry, JournalEntryType, NpcQuest } from '../types/game';
import { sound } from '../utils/audio';
import { vibrateLight } from '../utils/haptics';

interface FarmerJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: FarmerJournalEntry[];
  npcQuests: NpcQuest[];
  level: number;
  aestheticScore: number;
  aestheticRankTitle: string;
  onOpenQuests?: () => void;
  onOpenDecorShop?: () => void;
}

type FilterTab = 'all' | 'level_up' | 'rare_purchase' | 'quest_completed' | 'artifact_found';

const ENTRIES_PER_PAGE = 3;

export const FarmerJournalModal: React.FC<FarmerJournalModalProps> = ({
  isOpen,
  onClose,
  entries,
  npcQuests,
  level,
  aestheticScore,
  aestheticRankTitle,
  onOpenQuests,
  onOpenDecorShop,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev' | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Filter entries
  const filteredEntries = useMemo(() => {
    if (activeFilter === 'all') return entries;
    return entries.filter((e) => e.type === activeFilter);
  }, [entries, activeFilter]);

  // Total pages: Page 0 is always the Cover / Title Page; Subsequent pages are journal logs
  const totalContentPages = Math.max(1, Math.ceil(filteredEntries.length / ENTRIES_PER_PAGE));
  const totalPages = 1 + totalContentPages; // 0 = Title page, 1..N = content pages

  // Quick stats
  const stats = useMemo(() => {
    const levelCount = entries.filter((e) => e.type === 'level_up').length;
    const purchasesCount = entries.filter((e) => e.type === 'rare_purchase').length;
    const completedQuestsCount = entries.filter((e) => e.type === 'quest_completed').length;
    const artifactsCount = entries.filter((e) => e.type === 'artifact_found').length;
    return {
      levelCount,
      purchasesCount,
      completedQuestsCount,
      artifactsCount,
      totalEntries: entries.length,
    };
  }, [entries]);

  const handlePageChange = (newPage: number, direction: 'next' | 'prev') => {
    if (newPage < 0 || newPage >= totalPages || isFlipping) return;

    sound.playPageTurn();
    vibrateLight();
    setFlipDirection(direction);
    setIsFlipping(true);

    setTimeout(() => {
      setCurrentPage(newPage);
      setFlipDirection(null);
      setIsFlipping(false);
    }, 320);
  };

  const handleFilterClick = (tab: FilterTab) => {
    sound.playTap();
    vibrateLight();
    setActiveFilter(tab);
    setCurrentPage(tab === 'all' ? 0 : 1);
  };

  if (!isOpen) return null;

  // Entries for current content page
  const pageEntriesIndex = (currentPage - 1) * ENTRIES_PER_PAGE;
  const currentEntries = filteredEntries.slice(pageEntriesIndex, pageEntriesIndex + ENTRIES_PER_PAGE);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Book Container with leather border and embossed stitching */}
      <div className="relative w-full max-w-xl bg-[#2a1708] p-2.5 sm:p-3.5 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-[#5a3416] flex flex-col max-h-[92vh] overflow-hidden select-none">
        {/* Leather texture stitches & ornamental corners */}
        <div className="absolute top-2 left-2 text-[#d4af37]/60 text-xs pointer-events-none">⚜</div>
        <div className="absolute top-2 right-2 text-[#d4af37]/60 text-xs pointer-events-none">⚜</div>
        <div className="absolute bottom-2 left-2 text-[#d4af37]/60 text-xs pointer-events-none">⚜</div>
        <div className="absolute bottom-2 right-2 text-[#d4af37]/60 text-xs pointer-events-none">⚜</div>

        {/* Top Header Bar & Close */}
        <div className="flex items-center justify-between pb-2 px-2 border-b border-[#5a3416]/80 text-[#e6c99c]">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold tracking-wide text-[#f3dfbe] font-game">
                Дневник Фермера
              </h2>
              <span className="text-[10px] text-[#b89569] block">
                Хроники достижений, редких покупок и подвигов
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#3d210d] hover:bg-[#522d12] border border-[#784720] text-[#e6c99c] flex items-center justify-center transition-colors cursor-pointer"
            title="Закрыть дневник"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Silk Bookmark Ribbons / Category Tabs */}
        <div className="flex items-center justify-between gap-1 my-2 px-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleFilterClick('all')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-t-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border-b-2 ${
              activeFilter === 'all'
                ? 'bg-[#f7eedb] text-[#3e240c] border-[#8b4513] shadow-md font-bold scale-102'
                : 'bg-[#3b200d] text-[#c9a777] border-transparent hover:bg-[#4d2c14]'
            }`}
          >
            <Scroll className="w-3.5 h-3.5 text-[#8b4513]" />
            <span>Все записи</span>
            <span className="text-[10px] opacity-75">({stats.totalEntries})</span>
          </button>

          <button
            onClick={() => handleFilterClick('level_up')}
            className={`flex items-center gap-1 px-2 py-1 rounded-t-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border-b-2 ${
              activeFilter === 'level_up'
                ? 'bg-[#f7eedb] text-[#3e240c] border-[#8b4513] shadow-md font-bold scale-102'
                : 'bg-[#3b200d] text-[#c9a777] border-transparent hover:bg-[#4d2c14]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
            <span>Уровни</span>
            <span className="text-[10px] opacity-75">({stats.levelCount})</span>
          </button>

          <button
            onClick={() => handleFilterClick('rare_purchase')}
            className={`flex items-center gap-1 px-2 py-1 rounded-t-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border-b-2 ${
              activeFilter === 'rare_purchase'
                ? 'bg-[#f7eedb] text-[#3e240c] border-[#8b4513] shadow-md font-bold scale-102'
                : 'bg-[#3b200d] text-[#c9a777] border-transparent hover:bg-[#4d2c14]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-800" />
            <span>Покупки</span>
            <span className="text-[10px] opacity-75">({stats.purchasesCount})</span>
          </button>

          <button
            onClick={() => handleFilterClick('quest_completed')}
            className={`flex items-center gap-1 px-2 py-1 rounded-t-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border-b-2 ${
              activeFilter === 'quest_completed'
                ? 'bg-[#f7eedb] text-[#3e240c] border-[#8b4513] shadow-md font-bold scale-102'
                : 'bg-[#3b200d] text-[#c9a777] border-transparent hover:bg-[#4d2c14]'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-800" />
            <span>Квесты</span>
            <span className="text-[10px] opacity-75">({stats.completedQuestsCount})</span>
          </button>

          <button
            onClick={() => handleFilterClick('artifact_found')}
            className={`flex items-center gap-1 px-2 py-1 rounded-t-lg text-xs font-semibold transition-all cursor-pointer shrink-0 border-b-2 ${
              activeFilter === 'artifact_found'
                ? 'bg-[#f7eedb] text-[#3e240c] border-[#8b4513] shadow-md font-bold scale-102'
                : 'bg-[#3b200d] text-[#c9a777] border-transparent hover:bg-[#4d2c14]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Реликвии</span>
            <span className="text-[10px] opacity-75">({stats.artifactsCount})</span>
          </button>
        </div>

        {/* Vintage Parchment Page with 3D Flip Animation */}
        <div
          className={`relative flex-1 bg-[#fbf6e9] rounded-2xl p-3 sm:p-5 shadow-inner border border-[#d6c5a5] flex flex-col overflow-y-auto transition-all duration-300 ${
            isFlipping
              ? flipDirection === 'next'
                ? 'scale-[0.98] rotate-y-6 opacity-75 shadow-2xl'
                : 'scale-[0.98] -rotate-y-6 opacity-75 shadow-2xl'
              : 'scale-100 rotate-y-0 opacity-100'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(#d6c29e 0.5px, transparent 0.5px), radial-gradient(#d6c29e 0.5px, #fbf6e9 0.5px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
            boxShadow:
              'inset 0 0 40px rgba(184, 150, 104, 0.35), inset 3px 0 10px rgba(60, 30, 10, 0.25)',
          }}
        >
          {/* Subtle Book Spine shadow on the left */}
          <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-[#2c170a]/20 via-[#2c170a]/5 to-transparent pointer-events-none" />

          {/* PAGE 0: Title Page & Estate Summary */}
          {currentPage === 0 ? (
            <div className="flex flex-col items-center justify-between h-full py-2 text-center text-[#3c220f]">
              {/* Filigree Ornament */}
              <div className="flex items-center gap-2 text-[#a8824a] text-xs">
                <span>✦ ──────</span>
                <span className="font-serif italic font-bold">Летопись Усадьбы</span>
                <span>────── ✦</span>
              </div>

              {/* Title & Crest */}
              <div className="my-2">
                <div className="relative inline-block my-1">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#f2e2c4] to-[#deb887] border-2 border-[#8b4513] shadow-md flex items-center justify-center text-4xl mx-auto">
                    🌾
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-red-800 border border-amber-300 text-white flex items-center justify-center text-xs shadow-md font-bold">
                    ★
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-black font-game text-[#42220d] tracking-wide mt-2">
                  ХУТОР «ЗОЛОТЫЕ НИВЫ»
                </h1>
                <p className="text-xs text-[#7d5028] italic font-serif max-w-xs mx-auto mt-0.5">
                  «В сей дневник заносятся славные деяния хозяина, даты возвышения мастерства и редкие сокровища двора.»
                </p>
              </div>

              {/* Stats Parchment Grid */}
              <div className="w-full grid grid-cols-2 gap-2 my-2 text-left">
                <div className="bg-[#f0e3cc]/80 border border-[#c4ab84] rounded-xl p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5c3717]">
                    <span>⭐</span>
                    <span>Мастерство</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#381f0b] mt-0.5">
                    Уровень {level}
                  </div>
                  <span className="text-[10px] text-[#855d38]">
                    {stats.levelCount} отметок о росте
                  </span>
                </div>

                <div className="bg-[#f0e3cc]/80 border border-[#c4ab84] rounded-xl p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5c3717]">
                    <span>⛲</span>
                    <span>Эстетика & Сад</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#381f0b] mt-0.5">
                    {aestheticScore} ⭐
                  </div>
                  <span className="text-[10px] text-[#855d38] truncate block">
                    {aestheticRankTitle}
                  </span>
                </div>

                <div className="bg-[#f0e3cc]/80 border border-[#c4ab84] rounded-xl p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5c3717]">
                    <span>📜</span>
                    <span>Сложные квесты</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#381f0b] mt-0.5">
                    {stats.completedQuestsCount} завершено
                  </div>
                  <span className="text-[10px] text-[#855d38]">
                    {npcQuests.length - stats.completedQuestsCount} активных поручений
                  </span>
                </div>

                <div className="bg-[#f0e3cc]/80 border border-[#c4ab84] rounded-xl p-2.5 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#5c3717]">
                    <span>👑</span>
                    <span>Шедевры Декора</span>
                  </div>
                  <div className="text-sm font-extrabold text-[#381f0b] mt-0.5">
                    {stats.purchasesCount} раритетов
                  </div>
                  <span className="text-[10px] text-[#855d38]">
                    Уникальные украшения
                  </span>
                </div>
              </div>

              {/* Action Banner to open Quests or Decor Shop */}
              <div className="w-full flex items-center justify-center gap-2 mt-1">
                {onOpenQuests && (
                  <button
                    onClick={() => {
                      sound.playTap();
                      onOpenQuests();
                    }}
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-[#9c4d18] to-[#7c380e] hover:from-[#aa541c] hover:to-[#8a3f12] text-[#fff2dc] border border-[#d6a76d] rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>📜</span>
                    <span>Квесты от NPC</span>
                  </button>
                )}
                {onOpenDecorShop && (
                  <button
                    onClick={() => {
                      sound.playTap();
                      onOpenDecorShop();
                    }}
                    className="flex-1 py-1.5 px-2 bg-gradient-to-r from-[#2e5934] to-[#1f4225] hover:from-[#36683d] hover:to-[#264f2c] text-[#ebfbee] border border-[#6baf76] rounded-xl text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>⛲</span>
                    <span>Магазин декора</span>
                  </button>
                )}
              </div>

              {/* Wax Seal Stamp bottom */}
              <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-[#855d38] font-serif">
                <span>🔴 Печать Совета Старост • Заверено Летописцем</span>
              </div>
            </div>
          ) : (
            /* PAGES 1..N: Journal Entries List */
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Page Title & Bookmark Indicator */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#cfbca1]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-[#8b4513]">❦</span>
                    <h3 className="font-game font-bold text-sm text-[#44230d]">
                      {activeFilter === 'all'
                        ? 'Летопись Поместья'
                        : activeFilter === 'level_up'
                        ? 'Хроника Развития & Уровней'
                        : activeFilter === 'rare_purchase'
                        ? 'Редкие Приобретения Декора'
                        : activeFilter === 'quest_completed'
                        ? 'Завершённые Сложные Квесты'
                        : 'Древние Реликвии Долины'}
                    </h3>
                  </div>
                  <span className="text-[11px] font-serif text-[#78532f] italic">
                    Лист {currentPage} из {totalPages - 1}
                  </span>
                </div>

                {/* Empty State */}
                {currentEntries.length === 0 ? (
                  <div className="text-center py-10 px-4 text-[#754f2a]">
                    <div className="text-3xl mb-2">📜</div>
                    <p className="font-bold text-sm">В этом разделе пока нет записей</p>
                    <p className="text-xs text-[#9c7146] mt-1 max-w-xs mx-auto">
                      {activeFilter === 'level_up'
                        ? 'Получайте опыт на полях и повышайте уровень, чтобы открыть новые страницы!'
                        : activeFilter === 'rare_purchase'
                        ? 'Приобретайте редкие и легендарные украшения в Магазине Декора!'
                        : activeFilter === 'quest_completed'
                        ? 'Выполняйте сложные задания приезжих NPC, чтобы запечатлеть свои подвиги!'
                        : 'Отправляйтесь в ежедневный «Поиск сокровищ» с компасом-радаром, чтобы найти древние реликвии!'}
                    </p>
                  </div>
                ) : (
                  /* Entries for this page */
                  <div className="space-y-2.5">
                    {currentEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-[#f2e7d1]/80 hover:bg-[#efe0c4] border border-[#cbbb9f] rounded-xl p-2.5 shadow-xs transition-colors relative overflow-hidden"
                      >
                        {/* Red Wax or Badge corner */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <div className="w-9 h-9 rounded-xl bg-[#e3d1b1] border border-[#a88a62] flex items-center justify-center text-xl shrink-0 shadow-inner">
                              {entry.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-game font-bold text-xs sm:text-sm text-[#381f0b] leading-tight">
                                  {entry.title}
                                </h4>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                                    entry.type === 'level_up'
                                      ? 'bg-amber-700/20 text-amber-900 border border-amber-700/40'
                                      : entry.type === 'rare_purchase'
                                      ? 'bg-emerald-700/20 text-emerald-950 border border-emerald-700/40'
                                      : entry.type === 'quest_completed'
                                      ? 'bg-purple-700/20 text-purple-950 border border-purple-700/40'
                                      : 'bg-stone-600/20 text-stone-900 border border-stone-600/40'
                                  }`}
                                >
                                  {entry.badge}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#5e3818] mt-1 leading-snug font-serif">
                                {entry.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Date and Reward Footer */}
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#d8c8ae] text-[10px] text-[#7a5430]">
                          <span className="flex items-center gap-1 font-serif italic">
                            <Calendar className="w-3 h-3 text-[#94653a]" />
                            {entry.formattedDate}
                          </span>
                          {entry.rewardsSummary && (
                            <span className="font-bold text-[#8b4513] bg-[#e6d6bc] px-2 py-0.5 rounded-full border border-[#c4b193]">
                              {entry.rewardsSummary}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vintage Ornamental Page Footnote */}
              <div className="mt-3 pt-2 border-t border-[#d6c4a6] flex items-center justify-between text-[10px] text-[#78532f] font-serif">
                <span className="italic">Фермерский дневник • Хроники долины</span>
                <span className="text-[#a8824a]">❦ ────── ❦</span>
              </div>
            </div>
          )}

          {/* Clickable Page Turn Corner Curler (Right bottom corner) */}
          {currentPage < totalPages - 1 && (
            <button
              onClick={() => handlePageChange(currentPage + 1, 'next')}
              className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-[#c9a777] to-transparent rounded-tl-xl border-t border-l border-[#8b4513]/40 cursor-pointer hover:from-[#ba945f] transition-all group"
              title="Перелистнуть вперёд"
            >
              <span className="absolute bottom-1 right-1 text-[9px] text-[#42220d] group-hover:scale-110">
                ▶
              </span>
            </button>
          )}

          {/* Clickable Page Turn Corner Curler (Left bottom corner) */}
          {currentPage > 0 && (
            <button
              onClick={() => handlePageChange(currentPage - 1, 'prev')}
              className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-[#c9a777] to-transparent rounded-tr-xl border-t border-r border-[#8b4513]/40 cursor-pointer hover:from-[#ba945f] transition-all group"
              title="Перелистнуть назад"
            >
              <span className="absolute bottom-1 left-1 text-[9px] text-[#42220d] group-hover:scale-110">
                ◀
              </span>
            </button>
          )}
        </div>

        {/* Bottom Page Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 px-1 text-[#e6c99c]">
          <button
            onClick={() => handlePageChange(currentPage - 1, 'prev')}
            disabled={currentPage === 0 || isFlipping}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              currentPage === 0 || isFlipping
                ? 'opacity-30 border-[#4a2b12] text-[#6b4728] cursor-not-allowed'
                : 'bg-[#3b200d] hover:bg-[#4d2c14] border-[#784720] text-[#f2dfbe] active:scale-95'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>

          {/* Page Indicator & Quick Jump Dots */}
          <div className="flex items-center gap-1.5 text-xs font-serif text-[#d6b485]">
            <button
              onClick={() => handlePageChange(0, 'prev')}
              className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors cursor-pointer ${
                currentPage === 0
                  ? 'bg-[#8b4513] border-amber-400 text-amber-200'
                  : 'bg-[#3b200d] border-[#5e3516] text-[#b89569] hover:bg-[#4d2c14]'
              }`}
              title="Титульный лист"
            >
              ⚜
            </button>
            <span className="text-xs">
              {currentPage === 0 ? 'Обложка' : `Стр. ${currentPage} из ${totalPages - 1}`}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1, 'next')}
            disabled={currentPage >= totalPages - 1 || isFlipping}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              currentPage >= totalPages - 1 || isFlipping
                ? 'opacity-30 border-[#4a2b12] text-[#6b4728] cursor-not-allowed'
                : 'bg-[#3b200d] hover:bg-[#4d2c14] border-[#784720] text-[#f2dfbe] active:scale-95'
            }`}
          >
            <span>Вперёд</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
