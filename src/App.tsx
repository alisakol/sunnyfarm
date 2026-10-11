import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useGameState } from './hooks/useGameState';
import { AndroidFrame } from './components/AndroidFrame';
import { HeaderBar } from './components/HeaderBar';
import { BottomNav, TabType } from './components/BottomNav';
import { FieldsView } from './components/FieldsView';
import { AnimalsView } from './components/AnimalsView';
import { BuildingsView } from './components/BuildingsView';
import { OrdersView } from './components/OrdersView';
import { BarnView } from './components/BarnView';
import { AchievementsModal } from './components/AchievementsModal';
import { LevelUpModal } from './components/LevelUpModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { SettingsModal } from './components/SettingsModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { NeighborsView } from './components/NeighborsView';
import { FishingMiniGame } from './components/FishingMiniGame';
import { WeatherOverlay } from './components/WeatherOverlay';
import { SeasonalModal } from './components/SeasonalModal';
import { AuthModal } from './components/AuthModal';
import { DecorShopView } from './components/DecorShopView';
import { FarmerJournalModal } from './components/FarmerJournalModal';
import { NpcQuestsModal } from './components/NpcQuestsModal';
import { PlayerInteractionsHubModal } from './components/PlayerInteractionsHubModal';
import { FarmMapModal } from './components/FarmMapModal';
import { RealFriendsModal } from './components/RealFriendsModal';
import { RecipeBookModal } from './components/RecipeBookModal';
import {
  FirestoreUserProfile,
  syncUserProfile,
  fetchCommunityPlayers,
  fetchUserFriends,
  addFriend,
  removeFriend,
  convertPlayerToNeighborFarm,
  sendGiftToRealPlayer,
  subscribeToUserGifts,
  claimGiftInFirestore,
  subscribeToUserVisits,
  claimVisitBonusInFirestore,
  recordWaterHelpRealPlayer,
} from './services/friendsService';
import { useAuth } from './context/AuthContext';
import { CROPS } from './utils/constants';
import { DECORATIONS_CATALOG, getAestheticRank } from './utils/decorationsData';
import { SEASONS_CONFIG } from './utils/seasonalData';

export default function App() {
  const {
    coins,
    gems,
    level,
    xp,
    xpToNext,
    newLevelUnlocked,
    setNewLevelUnlocked,
    dailyStreak,
    isDailyAvailable,
    claimDailyReward,
    neighbors,
    playerGifts,
    setPlayerGifts,
    playerVisitLogs,
    setPlayerVisitLogs,
    showFloating,
    buyFromNeighbor,
    sellToNeighbor,
    helpNeighborFarm,
    addNeighborComment,
    refreshNeighborStalls,
    sendGiftToNeighbor,
    claimPlayerGift,
    claimVisitorBonus,
    addFishingReward,
    changeWeather,
    seasonMode,
    effectiveSeason,
    changeSeasonMode,
    interactWithSeasonalDecoration,
    isSeasonalSurpriseAvailable,
    plots,
    animals,
    buildings,
    trees,
    orders,
    inventory,
    barnCapacity,
    barnUsed,
    achievements,
    stats,
    activeTool,
    setActiveTool,
    selectedCropId,
    setSelectedCropId,
    weather,
    floatingTexts,
    truckDelivering,
    soundEnabled,
    musicEnabled,
    toggleSound,
    toggleMusic,
    plantCrop,
    waterPlot,
    fertilizePlot,
    harvestCrop,
    unlockPlot,
    feedAnimal,
    petAnimal,
    collectAnimalProduct,
    buyAnimal,
    startCrafting,
    collectCrafted,
    unlockBuilding,
    deliverOrder,
    dismissOrder,
    harvestTree,
    sellItem,
    upgradeBarn,
    claimAchievement,
    purchasedDecorations,
    placedDecorations,
    buyDecoration,
    togglePlaceDecoration,
    interactWithPlacedDecoration,
    journalEntries,
    npcQuests,
    contributeToQuest,
    completeNpcQuest,
    refreshNpcQuestsDaily,
    applyCloudSave,
    getCloudSavePayload,
    resetGame,
  } = useGameState();

  const { user, isSyncing, saveToCloud, loadFromCloud } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('fields');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState<boolean>(false);
  const [isFishingOpen, setIsFishingOpen] = useState<boolean>(false);
  const [isSeasonalModalOpen, setIsSeasonalModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState<boolean>(false);
  const [isInteractionsHubOpen, setIsInteractionsHubOpen] = useState<boolean>(false);
  const [interactionHubInitialRecipient, setInteractionHubInitialRecipient] = useState<string>('');
  const [interactionHubInitialTab, setInteractionHubInitialTab] = useState<'inbox' | 'send' | 'visitors'>('inbox');
  const [selectedNeighborFarmId, setSelectedNeighborFarmId] = useState<string>('');
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState<boolean>(false);
  const [isRealFriendsOpen, setIsRealFriendsOpen] = useState<boolean>(false);
  const [communityPlayers, setCommunityPlayers] = useState<FirestoreUserProfile[]>([]);
  const [friendsUids, setFriendsUids] = useState<string[]>([]);
  const [isLoadingCommunity, setIsLoadingCommunity] = useState<boolean>(false);
  const [selectedQuestIdForModal, setSelectedQuestIdForModal] = useState<string | undefined>(undefined);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const handleOpenSendGift = useCallback((recipientId?: string) => {
    if (recipientId) {
      setInteractionHubInitialRecipient(recipientId);
      setInteractionHubInitialTab('send');
    } else {
      setInteractionHubInitialTab('inbox');
    }
    setIsInteractionsHubOpen(true);
  }, []);

  // Sync user's profile to Firestore when level or credentials change
  useEffect(() => {
    if (user) {
      syncUserProfile(user.uid, {
        displayName: user.displayName || 'Фермер',
        email: user.email || '',
        photoURL: user.photoURL || '',
        level,
        farmName: `Ферма ${user.displayName || 'Фермера'}`,
        specialty: level >= 4 ? 'Органическое земледелие и выпечка' : 'Свежее фермерское молоко и клубника',
        reputation: 15,
        bio: 'Привет! Я настоящий игрок из Google AI Studio, развиваю свою солнечную ферму.',
      }).catch((e) => console.warn('Could not sync user profile:', e));
    }
  }, [user, level]);

  // Load community players & user's friends from Firestore
  const loadCommunityAndFriends = useCallback(async () => {
    setIsLoadingCommunity(true);
    try {
      const players = await fetchCommunityPlayers(user?.uid);
      setCommunityPlayers(players);
      if (user) {
        const friends = await fetchUserFriends(user.uid);
        setFriendsUids(friends.map((f) => f.friendUid));
      }
    } catch (e) {
      console.warn('Error loading community players:', e);
    } finally {
      setIsLoadingCommunity(false);
    }
  }, [user]);

  useEffect(() => {
    loadCommunityAndFriends();
  }, [loadCommunityAndFriends]);

  // Real-time listener for incoming gifts from Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserGifts(user.uid, (firestoreGifts) => {
      if (firestoreGifts.length > 0) {
        setPlayerGifts((prev) => {
          const firestoreMap = new Map(firestoreGifts.map((g) => [g.id, g]));
          const localOnly = prev.filter((g) => !firestoreMap.has(g.id));
          return [...firestoreGifts, ...localOnly];
        });
      }
    });
    return () => unsubscribe();
  }, [user, setPlayerGifts]);

  // Real-time listener for incoming farm visits from Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserVisits(user.uid, (firestoreVisits) => {
      if (firestoreVisits.length > 0) {
        setPlayerVisitLogs((prev) => {
          const firestoreMap = new Map(firestoreVisits.map((v) => [v.id, v]));
          const localOnly = prev.filter((v) => !firestoreMap.has(v.id));
          return [...firestoreVisits, ...localOnly];
        });
      }
    });
    return () => unsubscribe();
  }, [user, setPlayerVisitLogs]);

  const handleAddRealFriend = useCallback(
    async (player: FirestoreUserProfile) => {
      if (!user) {
        setIsAuthModalOpen(true);
        return;
      }
      const ok = await addFriend(user.uid, {
        uid: player.id,
        displayName: player.displayName || 'Фермер',
        photoURL: player.photoURL,
        farmName: player.farmName,
        level: player.level || 1,
      });
      if (ok) {
        setFriendsUids((prev) => (prev.includes(player.id) ? prev : [...prev, player.id]));
      }
    },
    [user]
  );

  const handleRemoveRealFriend = useCallback(
    async (friendUid: string) => {
      if (!user) return;
      const ok = await removeFriend(user.uid, friendUid);
      if (ok) {
        setFriendsUids((prev) => prev.filter((id) => id !== friendUid));
      }
    },
    [user]
  );

  const handleOpenQuests = (questId?: string) => {
    if (questId) {
      setSelectedQuestIdForModal(questId);
    }
    setIsQuestsOpen(true);
  };

  // Auto-sync with cloud on user login
  useEffect(() => {
    let cancelled = false;
    if (user) {
      loadFromCloud().then((cloudData) => {
        if (cancelled) return;
        if (cloudData) {
          // If cloud progress has higher level or coins, or local is virgin state
          if (cloudData.level > level || cloudData.coins > coins || (level === 1 && coins === 120)) {
            applyCloudSave(cloudData);
          } else {
            // Push local to cloud
            saveToCloud(getCloudSavePayload());
          }
        } else {
          // No cloud save exists yet for this user: save initial farm to cloud
          saveToCloud(getCloudSavePayload());
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Periodic debounced cloud auto-save when user is logged in
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      saveToCloud(getCloudSavePayload());
    }, 8000);
    return () => clearTimeout(timer);
  }, [
    user,
    coins,
    gems,
    level,
    xp,
    inventory,
    plots,
    animals,
    buildings,
    trees,
    orders,
    achievements,
    saveToCloud,
    getCloudSavePayload,
  ]);

  // Auto-open daily reward modal on first load if available today
  useEffect(() => {
    if (isDailyAvailable) {
      const timer = setTimeout(() => {
        setIsDailyModalOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isDailyAvailable]);

  // Capture Android PWA install event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleTriggerInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  // Badges calculations for bottom nav
  const now = Date.now();
  const readyCropsCount = plots.filter((p) => {
    if (!p.unlocked || !p.cropId || !p.plantedAt) return false;
    const crop = CROPS[p.cropId];
    if (!crop) return false;
    const speed = p.fertilized ? 999 : p.watered ? 1.5 : 1.0;
    return now - p.plantedAt >= (crop.growthTime * 1000) / speed;
  }).length;

  const readyAnimalsCount = animals.filter((a) => a.isReady).length;
  const readyBuildingsCount = buildings.reduce((acc, b) => acc + b.queue.filter((s) => s.completed).length, 0);

  const readyOrdersCount = orders.filter((o) => {
    if (o.status !== 'available') return false;
    return o.requirements.every((req) => (inventory[req.itemId] || 0) >= req.count);
  }).length;

  const claimableAchievementsCount = achievements.filter((a) => a.unlocked && !a.claimed).length;
  const availableNeighborsHelpCount = neighbors.filter((n) => !n.helpedWaterToday).length;
  const availableDecorBadgeCount = DECORATIONS_CATALOG.filter(
    (d) => !purchasedDecorations.includes(d.id) && level >= d.minLevel && coins >= d.costCoins && gems >= d.costGems
  ).length > 0 ? 1 : 0;

  const totalAestheticScore = useMemo(() => {
    return placedDecorations.reduce((acc, id) => {
      const item = DECORATIONS_CATALOG.find((d) => d.id === id);
      return acc + (item ? item.aestheticPoints : 0);
    }, 0);
  }, [placedDecorations]);

  const currentAestheticRank = useMemo(() => {
    return getAestheticRank(totalAestheticScore);
  }, [totalAestheticScore]);

  // Merge local NPC neighbors with real Google community players
  const combinedNeighbors = useMemo(() => {
    if (communityPlayers.length === 0) return neighbors;
    const realPlayerFarms = communityPlayers.map((player) =>
      convertPlayerToNeighborFarm(player, friendsUids.includes(player.id))
    );
    // Put real player friends first, then other real players, then local NPC farms
    const friends = realPlayerFarms.filter((f) => f.isFriend);
    const nonFriends = realPlayerFarms.filter((f) => !f.isFriend);
    return [...friends, ...nonFriends, ...neighbors];
  }, [neighbors, communityPlayers, friendsUids]);

  const handleUnifiedSendGift = useCallback(
    async (
      recipientId: string,
      giftType: 'seeds' | 'fertilizer' | 'coins' | 'gems' | 'pie',
      note: string
    ) => {
      const recipient = combinedNeighbors.find(
        (f) => f.id === recipientId || f.uid === recipientId || `player_${f.uid}` === recipientId
      );

      if (!recipient) {
        showFloating('Получатель не найден!', 'text-rose-400');
        return false;
      }

      if (recipient.isRealPlayer && recipient.uid) {
        if (!user) {
          showFloating('Войдите через Google, чтобы дарить подарки реальным друзьям! 🔐', 'text-sky-300');
          setIsAuthModalOpen(true);
          return false;
        }

        const giftOpt = [
          { type: 'seeds', name: 'Семена подсолнухов', emoji: '🌻', count: 5 },
          { type: 'fertilizer', name: 'Эко-удобрение', emoji: '✨', count: 3 },
          { type: 'coins', name: 'Мешочек золота (50 🪙)', emoji: '🪙', count: 50 },
          { type: 'gems', name: 'Сияющий кристалл (1 💎)', emoji: '💎', count: 1 },
          { type: 'pie', name: 'Клубничный пирог', emoji: '🥧', count: 1 },
        ].find((o) => o.type === giftType);

        if (!giftOpt) return false;

        const success = sendGiftToNeighbor(recipient.id, giftType, note, recipient);
        if (!success) return false;

        try {
          const ok = await sendGiftToRealPlayer(
            {
              uid: user.uid,
              displayName: user.displayName || 'Фермер',
              photoURL: user.photoURL || undefined,
              level,
            },
            recipient.uid,
            {
              giftType,
              giftName: giftOpt.name,
              giftEmoji: giftOpt.emoji,
              count: giftOpt.count,
              note,
            }
          );
          if (ok) {
            showFloating(`Подарок отправлен другу ${recipient.ownerName} через Firestore! 🎁✨`, 'text-emerald-300');
          }
          return ok;
        } catch (e) {
          console.warn('Error sending gift to Firestore:', e);
          return false;
        }
      } else {
        return sendGiftToNeighbor(recipientId, giftType, note, recipient);
      }
    },
    [combinedNeighbors, user, level, sendGiftToNeighbor, showFloating]
  );

  const handleClaimGiftUnified = useCallback(
    async (giftId: string) => {
      const gift = playerGifts.find((g) => g.id === giftId);
      if (!gift || gift.claimed) return;

      if (user && gift.isFromFirestore) {
        try {
          await claimGiftInFirestore(user.uid, giftId);
        } catch (e) {
          console.warn('Could not mark gift claimed in firestore:', e);
        }
      }
      claimPlayerGift(giftId, gift);
    },
    [playerGifts, user, claimPlayerGift]
  );

  const handleClaimVisitorBonusUnified = useCallback(
    async (logId: string) => {
      const log = playerVisitLogs.find((l) => l.id === logId);
      if (!log || log.rewardClaimed) return;

      if (user && log.isFromFirestore) {
        try {
          await claimVisitBonusInFirestore(user.uid, logId);
        } catch (e) {
          console.warn('Could not mark visitor bonus claimed in firestore:', e);
        }
      }
      claimVisitorBonus(logId);
    },
    [playerVisitLogs, user, claimVisitorBonus]
  );

  const handleHelpNeighborUnified = useCallback(
    async (farmId: string) => {
      const farm = combinedNeighbors.find((f) => f.id === farmId || f.uid === farmId);
      helpNeighborFarm(farmId);
      if (user && farm && farm.isRealPlayer && farm.uid) {
        try {
          await recordWaterHelpRealPlayer(
            {
              uid: user.uid,
              displayName: user.displayName || 'Фермер',
              photoURL: user.photoURL || undefined,
              level,
            },
            farm.uid
          );
        } catch (e) {
          console.warn('Could not record water help in firestore:', e);
        }
      }
    },
    [combinedNeighbors, user, level, helpNeighborFarm]
  );

  return (
    <AndroidFrame
      soundEnabled={soundEnabled}
      musicEnabled={musicEnabled}
      onToggleSound={toggleSound}
      onToggleMusic={toggleMusic}
      onOpenInstallModal={() => setIsInstallModalOpen(true)}
    >
      {/* Top Header */}
      <HeaderBar
        level={level}
        xp={xp}
        xpToNext={xpToNext}
        coins={coins}
        gems={gems}
        barnUsed={barnUsed}
        barnCapacity={barnCapacity}
        weather={weather}
        season={effectiveSeason}
        isDailyAvailable={isDailyAvailable}
        user={user}
        isSyncing={isSyncing}
        journalCount={journalEntries.length}
        availableQuestsCount={npcQuests.filter((q) => !q.completed).length}
        incomingGiftsCount={playerGifts.filter((g) => !g.claimed).length}
        realFriendsCount={friendsUids.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBarn={() => setActiveTab('barn')}
        onOpenDailyRewards={() => setIsDailyModalOpen(true)}
        onOpenSeason={() => setIsSeasonalModalOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
        onOpenQuests={() => handleOpenQuests()}
        onOpenInteractionsHub={() => handleOpenSendGift()}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenRecipeBook={() => setIsRecipeBookOpen(true)}
        onOpenRealFriends={() => setIsRealFriendsOpen(true)}
      />


      {/* Main View Area */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {/* Dynamic Weather Visual Effects Overlay */}
        <WeatherOverlay weather={weather} />

        {/* Floating alerts / notifications */}
        <div className="absolute top-2 inset-x-0 flex flex-col items-center pointer-events-none z-40 gap-1.5 px-4">
          {floatingTexts.map((f) => (
            <div
              key={f.id}
              className={`px-3 py-1 rounded-full bg-stone-950/85 backdrop-blur-xs border border-amber-500/70 shadow-lg text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200 ${
                f.color || 'text-amber-300'
              }`}
            >
              {f.text}
            </div>
          ))}
        </div>

        {/* Tab Components */}
        {activeTab === 'fields' && (
          <FieldsView
            plots={plots}
            trees={trees}
            level={level}
            coins={coins}
            activeTool={activeTool}
            selectedCropId={selectedCropId}
            weather={weather}
            season={effectiveSeason}
            isSeasonalSurpriseAvailable={isSeasonalSurpriseAvailable}
            onSelectTool={setActiveTool}
            onSelectCrop={setSelectedCropId}
            onPlant={plantCrop}
            onWater={waterPlot}
            onFertilize={fertilizePlot}
            onHarvest={harvestCrop}
            onUnlockPlot={unlockPlot}
            onHarvestTree={harvestTree}
            onOpenFishing={() => setIsFishingOpen(true)}
            onChangeWeather={changeWeather}
            placedDecorations={placedDecorations}
            onInteractDecoration={interactWithSeasonalDecoration}
            onInteractPlacedDecoration={interactWithPlacedDecoration}
            onOpenSeasonalModal={() => setIsSeasonalModalOpen(true)}
            onOpenDecorShop={() => setActiveTab('decor')}
            onOpenJournal={() => setIsJournalOpen(true)}
            onOpenQuests={handleOpenQuests}
            onOpenInteractionsHub={() => handleOpenSendGift()}
            onOpenMap={() => setIsMapOpen(true)}
            incomingGiftsCount={playerGifts.filter((g) => !g.claimed).length}
            npcQuests={npcQuests}
            inventory={inventory}
          />
        )}

        {activeTab === 'decor' && (
          <DecorShopView
            level={level}
            coins={coins}
            gems={gems}
            purchasedDecorations={purchasedDecorations}
            placedDecorations={placedDecorations}
            onBuyDecoration={buyDecoration}
            onTogglePlaceDecoration={togglePlaceDecoration}
            onGoToFarm={() => setActiveTab('fields')}
          />
        )}

        {activeTab === 'animals' && (
          <AnimalsView
            animals={animals}
            inventory={inventory}
            coins={coins}
            level={level}
            onFeedAnimal={feedAnimal}
            onPetAnimal={petAnimal}
            onCollectProduct={collectAnimalProduct}
            onBuyAnimal={buyAnimal}
          />
        )}

        {activeTab === 'buildings' && (
          <BuildingsView
            buildings={buildings}
            inventory={inventory}
            coins={coins}
            level={level}
            onStartCrafting={startCrafting}
            onCollectCrafted={collectCrafted}
            onUnlockBuilding={unlockBuilding}
            onOpenRecipeBook={() => setIsRecipeBookOpen(true)}
          />
        )}

        {activeTab === 'neighbors' && (
          <NeighborsView
            neighbors={combinedNeighbors}
            coins={coins}
            inventory={inventory}
            barnUsed={barnUsed}
            barnCapacity={barnCapacity}
            incomingGiftsCount={playerGifts.filter((g) => !g.claimed).length}
            realFriendsCount={friendsUids.length}
            selectedFarmId={selectedNeighborFarmId}
            onSelectFarm={setSelectedNeighborFarmId}
            onBuyFromNeighbor={buyFromNeighbor}
            onSellToNeighbor={sellToNeighbor}
            onHelpNeighbor={handleHelpNeighborUnified}
            onAddComment={addNeighborComment}
            onRefreshStalls={refreshNeighborStalls}
            onOpenInteractionsHub={() => handleOpenSendGift()}
            onSendGiftDirect={(farmId) => handleOpenSendGift(farmId)}
            onOpenRealFriends={() => setIsRealFriendsOpen(true)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            inventory={inventory}
            truckDelivering={truckDelivering}
            onDeliverOrder={deliverOrder}
            onDismissOrder={dismissOrder}
          />
        )}

        {activeTab === 'barn' && (
          <BarnView
            inventory={inventory}
            barnCapacity={barnCapacity}
            barnUsed={barnUsed}
            coins={coins}
            onSellItem={sellItem}
            onUpgradeBarn={upgradeBarn}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsModal
            achievements={achievements}
            onClaimAchievement={claimAchievement}
          />
        )}
      </main>

      {/* Bottom Android Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        readyCropsCount={readyCropsCount}
        readyAnimalsCount={readyAnimalsCount}
        readyBuildingsCount={readyBuildingsCount}
        readyOrdersCount={readyOrdersCount}
        claimableAchievementsCount={claimableAchievementsCount}
        availableNeighborsHelpCount={availableNeighborsHelpCount}
        availableDecorBadgeCount={availableDecorBadgeCount}
      />

      {/* Modals */}
      {isFishingOpen && (
        <FishingMiniGame
          onClose={() => setIsFishingOpen(false)}
          onReward={addFishingReward}
          readyCropsCount={readyCropsCount}
        />
      )}

      {isDailyModalOpen && (
        <DailyRewardModal
          onClose={() => setIsDailyModalOpen(false)}
          dailyStreak={dailyStreak}
          isDailyAvailable={isDailyAvailable}
          onClaimDailyReward={claimDailyReward}
        />
      )}

      {isSeasonalModalOpen && (
        <SeasonalModal
          onClose={() => setIsSeasonalModalOpen(false)}
          seasonMode={seasonMode}
          effectiveSeason={effectiveSeason}
          onChangeSeasonMode={changeSeasonMode}
        />
      )}

      {newLevelUnlocked && (
        <LevelUpModal
          level={newLevelUnlocked}
          onClose={() => setNewLevelUnlocked(null)}
        />
      )}

      {isInstallModalOpen && (
        <AndroidInstallModal
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
          onTriggerInstall={handleTriggerInstall}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          soundEnabled={soundEnabled}
          musicEnabled={musicEnabled}
          stats={stats}
          user={user}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onToggleSound={toggleSound}
          onToggleMusic={toggleMusic}
          onOpenInstallModal={() => {
            setIsSettingsOpen(false);
            setIsInstallModalOpen(true);
          }}
          onOpenSeasonModal={() => setIsSeasonalModalOpen(true)}
          onResetGame={resetGame}
        />
      )}

      {/* Cloud Auth & Cross-Device Sync Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          currentFarmState={getCloudSavePayload()}
          onApplyCloudSave={applyCloudSave}
        />
      )}

      {/* Farmer's Journal (Дневник Фермера) with Page Flip Animation */}
      <FarmerJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
        npcQuests={npcQuests}
        level={level}
        aestheticScore={totalAestheticScore}
        aestheticRankTitle={currentAestheticRank.title}
        onOpenQuests={() => {
          setIsJournalOpen(false);
          handleOpenQuests();
        }}
        onOpenDecorShop={() => {
          setIsJournalOpen(false);
          setActiveTab('decor');
        }}
      />

      {/* NPC Quests & Challenges Modal */}
      <NpcQuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        npcQuests={npcQuests}
        inventory={inventory}
        onContribute={contributeToQuest}
        onCompleteQuest={completeNpcQuest}
        onRefreshDailyQuests={refreshNpcQuestsDaily}
        onOpenJournal={() => {
          setIsQuestsOpen(false);
          setIsJournalOpen(true);
        }}
        level={level}
        initialQuestId={selectedQuestIdForModal}
        effectiveSeason={effectiveSeason}
      />

      {/* Player-to-Player Interactions Hub Modal (Подарки и Гости) */}
      <PlayerInteractionsHubModal
        isOpen={isInteractionsHubOpen}
        onClose={() => setIsInteractionsHubOpen(false)}
        neighbors={combinedNeighbors}
        playerGifts={playerGifts}
        playerVisitLogs={playerVisitLogs}
        coins={coins}
        gems={gems}
        inventory={inventory}
        currentUser={user}
        initialRecipientId={interactionHubInitialRecipient}
        initialTab={interactionHubInitialTab}
        onSendGift={handleUnifiedSendGift}
        onClaimGift={handleClaimGiftUnified}
        onClaimVisitorBonus={handleClaimVisitorBonusUnified}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Interactive Farm Map Modal (Карта фермы) */}
      <FarmMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsMapOpen(false);
        }}
        onOpenRecipeBook={() => setIsRecipeBookOpen(true)}
        level={level}
        unlockedPlotsCount={plots.filter((p) => p.unlocked).length}
        totalPlotsCount={plots.length}
        readyCropsCount={readyCropsCount}
        animalsCount={animals.length}
        readyAnimalsCount={readyAnimalsCount}
        unlockedBuildingsCount={buildings.filter((b) => b.unlocked).length}
        totalBuildingsCount={buildings.length}
        ordersCount={orders.length}
        readyOrdersCount={readyOrdersCount}
        neighborsCount={neighbors.length}
        placedDecorationsCount={placedDecorations.length}
        currentSeasonName={SEASONS_CONFIG[effectiveSeason]?.name || 'Сезон'}
        currentSeasonEmoji={SEASONS_CONFIG[effectiveSeason]?.icon || '🌾'}
      />

      {/* Ancient Recipe Book Modal (Старинная Книга Рецептов) */}
      <RecipeBookModal
        isOpen={isRecipeBookOpen}
        onClose={() => setIsRecipeBookOpen(false)}
        level={level}
        inventory={inventory}
        onGoToWorkshop={(buildingId) => {
          setActiveTab('buildings');
          setIsRecipeBookOpen(false);
        }}
      />

      {/* Real Google Friends & Player Discovery Modal */}
      <RealFriendsModal
        isOpen={isRealFriendsOpen}
        onClose={() => setIsRealFriendsOpen(false)}
        currentUser={user}
        communityPlayers={communityPlayers}
        friendsUids={friendsUids}
        isLoading={isLoadingCommunity}
        onAddFriend={handleAddRealFriend}
        onRemoveFriend={handleRemoveRealFriend}
        onOpenAuth={() => {
          setIsRealFriendsOpen(false);
          setIsAuthModalOpen(true);
        }}
        onVisitPlayerFarm={(player) => {
          setSelectedNeighborFarmId('player_' + player.id);
          setIsRealFriendsOpen(false);
          setActiveTab('neighbors');
        }}
        onSendGiftToFriend={(player) => {
          setIsRealFriendsOpen(false);
          handleOpenSendGift('player_' + player.id);
        }}
      />
    </AndroidFrame>
  );
}
