import { FarmerJournalEntry, JournalEntryType } from '../types/game';

export function formatJournalDate(date: Date = new Date()): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('ru-RU', options);
}

export function createInitialJournalEntries(level: number = 1): FarmerJournalEntry[] {
  const entries: FarmerJournalEntry[] = [
    {
      id: 'journal_founding',
      type: 'milestone',
      title: 'Основание Хутора «Зелёная Долина»',
      description: 'Заложен первый краеугольный камень в плодородную землю. Распаханы стартовые наделы, получен первый мешок отборной пшеницы и открыта амбарная книга.',
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      formattedDate: formatJournalDate(new Date(Date.now() - 86400000 * 3)),
      icon: '🏡',
      badge: 'Основание',
      rewardsSummary: 'Земельный надел и амбар',
    },
    {
      id: 'journal_lvl_1',
      type: 'level_up',
      title: 'Начало Пути: 1 Уровень Фермера',
      description: 'Присвоено звание юного хлебороба. Освоены азы полива и удобрения почвы. Местные соседи приветствуют нового хозяина.',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      formattedDate: formatJournalDate(new Date(Date.now() - 86400000 * 2)),
      icon: '🌱',
      badge: 'Уровень 1',
      levelNumber: 1,
      rewardsSummary: 'Стартовый капитал и семена',
    },
  ];

  if (level > 1) {
    for (let l = 2; l <= level; l++) {
      entries.push({
        id: `journal_lvl_${l}_seed`,
        type: 'level_up',
        title: `Достигнут Уровень ${l}`,
        description: `Фермер достиг ${l}-го уровня мастерства! Расширены земельные владения, стали доступны новые культуры и перерабатывающие здания.`,
        timestamp: new Date(Date.now() - 86400000 * (level - l + 0.5)).toISOString(),
        formattedDate: formatJournalDate(new Date(Date.now() - 86400000 * (level - l + 0.5))),
        icon: '🌟',
        badge: `Уровень ${l}`,
        levelNumber: l,
        rewardsSummary: `+3 💎, +${l * 50} 🪙`,
      });
    }
  }

  return entries;
}
