import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, CULTIVATION_LEVELS, SHOP_ITEMS, SPIRITUAL_ROOTS, DAO_COMPANIONS, REGIONS, SECTS, GAME_SKILLS, PRESET_CHARACTERS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, CloudSun, Footprints, Coffee, CupSoda, Share2, List, Trash2, X, Download, Flame, ScrollText, CheckCircle2, Gem, Store, Sparkles, Shield, Heart, Trophy, Compass, PackageOpen, Package, BookMarked, BookOpen, AlertCircle, Users, Map, Edit2, Home, Pickaxe, Swords, Mountain, Gift, Sprout, Star, BrainCircuit, Skull, User, Book, ShieldAlert } from 'lucide-react';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { io } from 'socket.io-client';
import AdBanner from '../components/AdBanner';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';
import { STORY_CONTENT } from '../data/story';
import CharacterSelectionModal from '../components/CharacterSelectionModal';
import DeathModal from '../components/DeathModal';
import ConsultHeavens from '../components/ConsultHeavens';
import { EncyclopediaModal } from '../components/EncyclopediaModal';
import { NarrativeHeader } from '../components/NarrativeHeader';
import { PalmBottleModal } from '../components/PalmBottleModal';
import { CombatAnimation } from '../components/CombatAnimation';
import { BreakthroughAnimation } from '../components/BreakthroughAnimation';
import { getUniqueEmotionalMessage } from '../data/emotionalMessages';

const EMOTIONAL_MESSAGES: Record<string, string[]> = {
  water: [
    "咕噜咕噜，健康加分！💧",
    "水是生命之源，你正在滋养自己 🌿",
    "每一滴水，都是对身体的告白 💙",
    "灵液入体，修为精进！✨",
    "洗毛伐髓，脱胎换骨！⚡",
    "念头通达，修为更进一步！"
  ],
  coffee: [
    "咖啡续命，打工魂燃烧！☕",
    "提神醒脑，Bug 变少！💻",
    "冰美式，打工人的生命之水！🧊",
    "念头通达，精神百倍！"
  ],
  tea: [
    "品茗静心，佛系打工 🍵",
    "茶香四溢，心平气和 🌿",
    "一口清茶，洗去班味 🍃",
    "道友，喝茶养性，念头通达！"
  ],
  milktea: [
    "奶茶续命，快乐起飞！🧋",
    "偶尔放纵一下，快乐最重要！✨",
    "糖分摄入，多巴胺分泌中... 💖",
    "念头通达，快乐修仙！"
  ]
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 9) return "早安，道友！新的一天从吐纳灵气开始 🌅";
  if (hour < 12) return "上午好！修炼再忙也要补充灵液哦 ☕";
  if (hour < 14) return "午休时间，打坐调息一下吧 🍱";
  if (hour < 18) return "下午容易心魔滋生，喝水稳固道心 ⚡";
  if (hour < 21) return "下班了吗？辛苦了一天，补充点水分 🌆";
  return "夜深了，喝点温水准备歇息吧，切勿走火入魔 🌙";
};

export const getItemInfo = (id: string) => {
  const shopItem = SHOP_ITEMS.find(i => i.id === id);
  if (shopItem) return { name: shopItem.name, color: 'text-emerald-300', desc: shopItem.desc, type: shopItem.type };
  
  const skillItem = GAME_SKILLS.find(i => i.id === id);
  if (skillItem) return { name: skillItem.name, color: 'text-blue-300', desc: skillItem.desc, type: 'skill' };

  const names: Record<string, string> = {
    common_herb: '普通灵草', rare_herb: '珍稀灵草', stone: '灵石矿', profound_iron: '玄铁精',
    millennium_lingzhi: '千年灵芝', jiuzhuan_grass: '九转玄草', monster_bone: '妖兽骨骼',
    monster_fur: '妖兽皮毛', paper: '符纸', cinnabar: '朱砂', pill_1: '黄龙丹',
    pill_foundation: '筑基丹', pill_golden_core: '降尘丹', pill_nascent_soul: '定灵丹',
    zhuyan_pill: '驻颜丹', juqi_pill: '聚气散', humai_pill: '护脉丹', qingxin_pill: '清心丹',
    millennium_pill: '千年灵丹', jiuzhuan_pill: '九转金丹', artifact_flying_sword: '青锋剑', artifact_shield: '玄铁盾'
  };
  
  const isPill = id.includes('pill');
  return {
    name: names[id] || id,
    color: isPill ? 'text-amber-300' : 'text-slate-300',
    desc: isPill ? '丹药' : '修仙材料',
    type: isPill ? 'consumable' : 'material'
  };
};

import { LIFE_STAGES } from '../store';

export default function HomePage() {
  const navigate = useNavigate();
  const { 
    hasClaimedDailyReward, claimDailyReward, claimOfflineGains, exploreRealm, setActiveGame, getNextReminder, addLog, removeLog, logs, settings, todaySteps, todayTemperature, setHealthData, checkIn, streakDays, pendingStreakRescue, rescueStreak, bonusPoints, quests, claimQuestReward, sectMissions, claimSectMissionReward, spiritStones, inventory, buyItem, sellItem, materials, spiritualRoot, sect, sectStatus, sectPosition, sectContribution, sectCompetitionWins, promoteSectPosition, testSpiritualRoot, joinSect, leaveSect, addSectContribution, donateToSect, marrowWashProgress, highestLevelReached, setHighestLevelReached, unlockAchievement, showMarrowWashEvent, setShowMarrowWashEvent, breakthroughEvent, setBreakthroughEvent, daoCompanion, setDaoCompanion, marriedCompanions, setMarriedCompanions, unlockedCompanions, unlockCompanion, interactWithCompanion, isFirstTime, setIsFirstTime, hasDoneFirstDrink, setHasDoneFirstDrink, cave, dailyEncyclopediaItems, currentTitle, unlockedTitles, setCurrentTitle, dailyFates, selectedFate, selectFate, chests, openChest, skills, equippedSkills, skillProficiency, artifacts, equippedArtifacts, artifactLevels, equipSkill, unequipSkill, equipArtifact, unequipArtifact, gainSkillProficiency, upgradeArtifact, storyChapter, storyNode, advanceStory, globalEvent, contributeToGlobalEvent, playerName, setPlayerName, currentRegion, setCurrentRegion, levelIndex, attemptBreakthrough, setLevelIndex, talismans, formations, monsterMaterials, alchemyLevel, craftingLevel, talismanLevel, formationLevel, makeTalisman, makePill, craftArtifact, setupFormation, participateImmortalAssembly, ascend, sectNpcs, gatherMaterials, age, lifespan, addMaterial, addSpiritStones, sectLevel, upgradeSect, sectPrestige, sectWealth, interSectWins, dailySalaryClaimed, claimSectSalary, challengeOtherSect, activateSectFormation, sectBuff, cultivationMode, foundationDamaged,
    characterId, characterPreset, isDead, deathReason, rebirthCount, storyProgress, selectCharacter, die, rebirth, completeStoryNode, consultHeavens, companionDailyEvent
  } = useStore();
  
  const [showConsultHeavens, setShowConsultHeavens] = useState(false);
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [showCharacterSelection, setShowCharacterSelection] = useState(isFirstTime || !characterId);
  const currentLevelName = useMemo(() => CULTIVATION_LEVELS[levelIndex]?.name || '凡人', [levelIndex]);
  const marketPrices = useMemo(() => {
    const seed = new Date().getHours(); // Changes every hour
    const random = (min: number, max: number, offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      const r = x - Math.floor(x);
      return Math.floor(r * (max - min + 1)) + min;
    };
    return {
      common_herb: 10,
      rare_herb: random(40, 80, 1),
      stone: 5,
      profound_iron: random(100, 200, 4),
      millennium_lingzhi: random(300, 500, 5),
      jiuzhuan_grass: random(500, 1000, 6),
      juqi_pill: 20,
      humai_pill: random(80, 150, 2),
      qingxin_pill: random(30, 60, 3),
      millennium_pill: random(800, 1500, 7),
      jiuzhuan_pill: random(2000, 5000, 8)
    };
  }, []);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [nextTime, setNextTime] = useState<{ time: number, plan: any } | null>(null);
  const [todayAmount, setTodayAmount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [combatState, setCombatState] = useState<{ isOpen: boolean; attackerName: string; defenderName: string; isVictory: boolean; message: string; loot?: { spiritStones?: number } } | null>(null);
  const [cityName, setCityName] = useState<string>('定位中...');
  
  const [showDetails, setShowDetails] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [showCompanionInteractModal, setShowCompanionInteractModal] = useState(false);
  const [selectedInteractCompanionId, setSelectedInteractCompanionId] = useState<string | null>(null);
  const [activeQuestTab, setActiveQuestTab] = useState<'quests' | 'ranking' | 'competition' | 'sectWar' | 'hall' | 'members' | 'factions'>('quests');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopTab, setShopTab] = useState<'buy' | 'sell'>('buy');
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showSectInvitation, setShowSectInvitation] = useState(false);
  const [showSectSelection, setShowSectSelection] = useState(false);
  const [showCreateSectModal, setShowCreateSectModal] = useState(false);
  const [newSectName, setNewSectName] = useState('');
  const [showNoviceGuide, setShowNoviceGuide] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showFateModal, setShowFateModal] = useState(false);
  const [showChestModal, setShowChestModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [useQingxinPill, setUseQingxinPill] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showBottleModal, setShowBottleModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showNpcModal, setShowNpcModal] = useState(false);
  const [showDailyRewardModal, setShowDailyRewardModal] = useState(false);
  const [showTribulationModal, setShowTribulationModal] = useState(false);
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineData, setOfflineData] = useState<{ time: number; exp: number; items: { id: string, amount: number }[] } | null>(null);
  const [encounterData, setEncounterData] = useState<{ title: string; desc: string; reward: string; onClaim: () => void } | null>(null);
  const [tribulationStrikes, setTribulationStrikes] = useState(0);
  const [tribulationProgress, setTribulationProgress] = useState(0);
  const [tribulationTimer, setTribulationTimer] = useState(10);
  const [showRootGachaModal, setShowRootGachaModal] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [exploreResult, setExploreResult] = useState<any>(null);
  const [gachaRootId, setGachaRootId] = useState<string | null>(null);
  const [productionTab, setProductionTab] = useState<'alchemy' | 'crafting' | 'talisman' | 'formation'>('alchemy');
  const [tempName, setTempName] = useState('');
  const [chestReward, setChestReward] = useState<{ type: string, name: string, amount?: number } | null>(null);
  const [noviceStep, setNoviceStep] = useState(0); // 0: Elder, 1: Root Card, 2: Task
  const shareRef = useRef<HTMLDivElement>(null);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, text: string, x: number, y: number}[]>([]);
  
  // Multiplayer states
  const [socket, setSocket] = useState<any>(null);
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [secretRealmActive, setSecretRealmActive] = useState(false);

  useEffect(() => {
    if (isFirstTime && !hasDoneFirstDrink && characterId) {
      setShowNoviceGuide(true);
    }
  }, [isFirstTime, hasDoneFirstDrink, characterId]);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', {
        name: playerName,
        level: currentLevel.name,
        sect: sect,
        power: Math.floor(totalAmount / 10)
      });
    });

    newSocket.on('world_state', (state) => {
      setOnlinePlayers(state.players);
      setSecretRealmActive(state.secretRealmActive);
    });

    newSocket.on('cultivator_joined', (player) => {
      setOnlinePlayers(prev => [...prev, player]);
      setToastMessage(`【系统】道友 ${player.name} (${player.level}) 降临此界！`);
      setTimeout(() => setToastMessage(null), 3000);
    });

    newSocket.on('cultivator_left', (id) => {
      setOnlinePlayers(prev => prev.filter(p => p.id !== id));
    });

    newSocket.on('player_updated', (updatedPlayer) => {
      setOnlinePlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    });

    newSocket.on('greeting_received', (data) => {
      setToastMessage(`【传音】${data.from} 向你发送了连续道友请求！`);
      setTimeout(() => setToastMessage(null), 4000);
    });

    newSocket.on('sect_event', (event) => {
      setToastMessage(`【宗门传闻】${event.message}`);
      setTimeout(() => setToastMessage(null), 5000);
    });

    newSocket.on('secret_realm_status', (status) => {
      setSecretRealmActive(status.active);
      setToastMessage(`【秘境】${status.message}`);
      setTimeout(() => setToastMessage(null), 5000);
    });

    newSocket.on('combat_result', (result) => {
      if (result.success) {
        if (result.target) {
          setToastMessage(`【战斗】偷袭 ${result.target} 成功！夺得 ${result.reward} 灵石！`);
        } else {
          setToastMessage(`【战斗】反杀 ${result.attacker} 成功！夺得 ${result.reward} 灵石！`);
        }
        useStore.getState().addSpiritStones(result.reward);
      } else {
        if (result.target) {
          setToastMessage(`【战斗】偷袭 ${result.target} 失败！被反杀损失 ${result.loss} 灵石！`);
        } else {
          setToastMessage(`【战斗】遭到 ${result.attacker} 偷袭！损失 ${result.loss} 灵石！`);
        }
        // Deduct spirit stones logic can be added here if needed
      }
      setTimeout(() => setToastMessage(null), 5000);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate dynamic goal
  let dynamicGoal = settings.dailyGoal;
  if (todayTemperature && todayTemperature > 28) {
    dynamicGoal += 500; // Hot weather
  }
  if (todaySteps > 8000) {
    dynamicGoal += 300; // Active day
  }

  // Calculate Passive Multipliers from Inventory and V4.0 Systems
  let passiveMultiplier = 1;
  if (inventory?.includes('book_1')) passiveMultiplier *= 1.2;
  if (inventory?.includes('book_2')) passiveMultiplier *= 1.05;
  if (inventory?.includes('artifact_1')) passiveMultiplier *= 2.0;
  if (inventory?.includes('artifact_2')) passiveMultiplier *= 1.5;
  
  equippedSkills?.forEach(skillId => {
    const skillInfo = GAME_SKILLS.find(s => s.id === skillId);
    if (skillInfo) {
      const proficiency = skillProficiency[skillId] || 0;
      const proficiencyBonus = 1 + (proficiency / 100) * 0.5; // Up to 50% extra effect
      passiveMultiplier *= (1 + (skillInfo.value - 1) * proficiencyBonus);
    }
  });

  if (equippedArtifacts?.includes('julian_array')) {
    const level = useStore.getState().artifactLevels['julian_array'] || 1;
    passiveMultiplier *= (1.3 + (level - 1) * 0.1); // 聚灵阵
  }
  
  if (marriedCompanions && marriedCompanions.length > 0) {
    marriedCompanions.forEach(mc => {
      const companion = DAO_COMPANIONS.find(c => c.id === mc.id);
      if (companion) {
        // Base effect + level bonus (e.g., 1.1 + 0.05 per level)
        const levelBonus = (mc.levelIndex || 0) * 0.05;
        passiveMultiplier *= (companion.effect + levelBonus);
      }
    });
  } else if (daoCompanion && daoCompanion.active) {
    const companion = DAO_COMPANIONS.find(c => c.id === daoCompanion.id);
    if (companion) passiveMultiplier *= companion.effect;
  }

  if (selectedFate?.effectType === 'cultivation_multiplier') {
    passiveMultiplier *= selectedFate.value;
  }

  const rootInfo = SPIRITUAL_ROOTS.find(r => r.id === spiritualRoot);
  if (rootInfo) {
    passiveMultiplier *= rootInfo.bonus;
  }

  const regionInfo = REGIONS.find(r => r.id === currentRegion);
  if (regionInfo && regionInfo.multiplier) {
    passiveMultiplier *= regionInfo.multiplier;
  }

  if (sectStatus === 'joined' && sectLevel > 1) {
    passiveMultiplier *= (1 + (sectLevel - 1) * 0.1); // 10% bonus per level
  }

  // Calculate Cultivation Level
  const [showBreakthroughEffect, setShowBreakthroughEffect] = useState(false);
  
  // Recovery for NaN state
  const safePassiveMultiplier = isNaN(passiveMultiplier) ? 1 : passiveMultiplier;
  const safeBonusPoints = isNaN(bonusPoints) ? 0 : bonusPoints;
  
  const totalAmount = logs.reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount) * safePassiveMultiplier, 0) + safeBonusPoints;
  
  // Backward compatibility: if levelIndex is 0 but totalAmount is high, set it
  useEffect(() => {
    const playIntro = () => {
      const audio = document.getElementById('bgm-audio') as HTMLAudioElement;
      if (audio) {
        audio.currentTime = 0;
        audio.play().then(() => {
          // Play for 12 seconds then fade out
          setTimeout(() => {
            let vol = 1;
            const fadeOut = setInterval(() => {
              if (vol > 0.1) {
                vol -= 0.1;
                audio.volume = vol;
              } else {
                clearInterval(fadeOut);
                audio.pause();
                audio.volume = 1;
              }
            }, 200);
          }, 12000);
        }).catch(e => console.log('Autoplay prevented:', e));
      }
    };
    
    // Try to play immediately
    playIntro();
    
    // Also play on first interaction if autoplay was blocked
    const onInteract = () => {
      playIntro();
      document.removeEventListener('click', onInteract);
    };
    document.addEventListener('click', onInteract);
    
    return () => document.removeEventListener('click', onInteract);
  }, []);

  useEffect(() => {
    if (levelIndex === 0 && totalAmount > 0) {
      let calculatedIndex = CULTIVATION_LEVELS.findIndex(l => totalAmount < l.min) - 1;
      if (calculatedIndex === -2) {
        // If totalAmount is greater than the max level, set to max level
        calculatedIndex = CULTIVATION_LEVELS.length - 1;
      }
      if (calculatedIndex > 0) {
        setLevelIndex(calculatedIndex);
      }
    }
  }, [levelIndex, totalAmount, setLevelIndex]);

  const currentSectInfo = SECTS.find(s => s.id === sect);
  const currentLevel = CULTIVATION_LEVELS[levelIndex] || CULTIVATION_LEVELS[0];
  const nextLevel = CULTIVATION_LEVELS[levelIndex + 1];

  // Calculate Sub-level (1-10)
  let subLevel = 1;
  let subLevelProgress = 0;
  let canBreakthrough = false;

  if (nextLevel) {
    const range = nextLevel.min - currentLevel.min;
    const progress = Math.max(0, totalAmount - currentLevel.min);
    
    if (progress >= range) {
      canBreakthrough = true;
      subLevel = 10;
      subLevelProgress = 1;
    } else {
      const subRange = range / 10;
      subLevel = Math.min(10, Math.floor(progress / subRange) + 1);
      subLevelProgress = (progress % subRange) / subRange;
    }
  } else {
    // Max level reached
    subLevel = 10;
    subLevelProgress = 1;
  }

  useEffect(() => {
    if (socket) {
      socket.emit('update_cultivation', {
        name: playerName,
        level: currentLevel.name,
        power: Math.floor(totalAmount / 10)
      });
    }
  }, [playerName, currentLevel.name, totalAmount, socket]);

  useEffect(() => {
    if (currentLevel.name !== highestLevelReached) {
      if (highestLevelReached !== null) {
        // Trigger breakthrough event for ANY major level up
        // Only trigger if the new level is higher than the previous highest
        const currentLevelIndex = CULTIVATION_LEVELS.findIndex(l => l.name === currentLevel.name);
        const highestLevelIndex = CULTIVATION_LEVELS.findIndex(l => l.name === highestLevelReached);
        
        if (currentLevelIndex > highestLevelIndex) {
          setBreakthroughEvent(currentLevel.name);
        }
      }
      setHighestLevelReached(currentLevel.name);
    }
  }, [currentLevel.name, highestLevelReached, setHighestLevelReached, setBreakthroughEvent]);

  useEffect(() => {
    checkIn();
    
    // Check offline gains
    const gains = claimOfflineGains();
    if (gains) {
      setOfflineData(gains);
      setShowOfflineModal(true);
    }

    // Every minute, update lastActiveTimestamp
    const interval = setInterval(() => {
      useStore.setState({ lastActiveTimestamp: Date.now() });
    }, 60000);

    return () => clearInterval(interval);
  }, [checkIn, claimOfflineGains]);

  useEffect(() => {
    if (!hasClaimedDailyReward && !isFirstTime) {
      setShowDailyRewardModal(true);
    }
  }, [hasClaimedDailyReward, isFirstTime]);

  // Tribulation Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showTribulationModal && tribulationTimer > 0 && tribulationProgress < 100) {
      interval = setInterval(() => {
        setTribulationTimer(prev => prev - 1);
      }, 1000);
    } else if (showTribulationModal && tribulationTimer === 0 && tribulationProgress < 100) {
      // Failed tribulation
      setShowTribulationModal(false);
      const result = attemptBreakthrough(useQingxinPill, false);
      setToastMessage(result.success ? "雷劫失败，但你侥幸突破成功！" : "雷劫失败，突破失败！");
      setTimeout(() => setToastMessage(null), 3000);
      if (result.success) {
        setShowBreakthroughEffect(true);
        setTimeout(() => setShowBreakthroughEffect(false), 3000);
        setBreakthroughEvent(CULTIVATION_LEVELS[levelIndex + 1]?.name);
      }
    }
    return () => clearInterval(interval);
  }, [showTribulationModal, tribulationTimer, tribulationProgress, attemptBreakthrough, useQingxinPill, levelIndex]);

  useEffect(() => {
    if (showTribulationModal && tribulationProgress >= 100) {
      // Success tribulation
      setTimeout(() => {
        setShowTribulationModal(false);
        const result = attemptBreakthrough(useQingxinPill, true); // Force success
        setToastMessage("渡劫成功，境界突破！");
        setTimeout(() => setToastMessage(null), 3000);
        setShowBreakthroughEffect(true);
        setTimeout(() => setShowBreakthroughEffect(false), 3000);
        setBreakthroughEvent(CULTIVATION_LEVELS[levelIndex + 1]?.name);
      }, 1000);
    }
  }, [showTribulationModal, tribulationProgress, attemptBreakthrough, useQingxinPill, levelIndex]);

  const fetchWeatherData = async () => {
    setIsRefreshing(true);
    const fetchWeatherByCoords = async (lat: number, lon: number, city?: string) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        const temp = data.current_weather.temperature;
        
        setHealthData(todaySteps, temp); // Keep existing steps, update temp
        
        if (city) {
          setCityName(city);
        } else {
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`);
            const geoData = await geoRes.json();
            setCityName(geoData.city || geoData.locality || '当前位置');
          } catch (e) {
            setCityName('当前位置');
          }
        }
      } catch (e) {
        console.error("Failed to fetch weather", e);
        setCityName('获取失败');
      } finally {
        setIsRefreshing(false);
      }
    };

    const fetchWeatherByIP = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          await fetchWeatherByCoords(parseFloat(data.latitude), parseFloat(data.longitude), data.city || '未知城市');
        } else {
          throw new Error("Invalid IP geo data");
        }
      } catch (e) {
        console.log("IP Geolocation failed, falling back to Beijing", e);
        fetchWeatherByCoords(39.9042, 116.4074, '北京市');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
        (err) => {
          console.log("Geolocation denied or failed, trying IP...", err);
          fetchWeatherByIP();
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeatherByIP();
    }
  };

  useEffect(() => {
    if (todayTemperature === null) {
      fetchWeatherData();
    }
  }, []);

  // Dynamic Step Counter using DeviceMotionEvent
  useEffect(() => {
    let stepCount = todaySteps;
    let lastZ = 0;
    let lastTime = 0;
    const threshold = 1.5; // Acceleration threshold for a step

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;
      const { x, y, z } = event.accelerationIncludingGravity;
      if (x === null || y === null || z === null) return;
      
      // Calculate magnitude
      const magnitude = Math.sqrt(x*x + y*y + z*z);
      const currentTime = Date.now();

      // Simple peak detection
      if (Math.abs(magnitude - lastZ) > threshold && (currentTime - lastTime) > 300) {
        stepCount += 1;
        setHealthData(stepCount, todayTemperature);
        lastTime = currentTime;
      }
      lastZ = magnitude;
    };

    // Request permission for iOS 13+
    const requestMotionPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permissionState = await (DeviceMotionEvent as any).requestPermission();
          if (permissionState === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        } catch (e) {
          console.error('Motion permission denied', e);
        }
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestMotionPermission();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [todayTemperature, setHealthData]);

  useEffect(() => {
    const update = () => {
      const next = getNextReminder();
      setNextTime(next);
      if (next) {
        if (next.time <= Date.now()) {
           setTimeLeft('就是现在');
        } else {
           setTimeLeft(formatDistanceToNowStrict(next.time, { locale: zhCN, addSuffix: true }));
        }
      } else {
        setTimeLeft('今天没有提醒了');
      }

      // Calculate today's amount with multipliers
      const multipliers = settings.drinkMultipliers || { water: 1, tea: 0.9, coffee: 0.8, milktea: 0.5 };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLogs = logs.filter((l) => l.timestamp >= today.getTime());
      
      const amount = todayLogs.reduce((sum, l) => {
        const mult = multipliers[l.type || 'water'] ?? 1;
        return sum + (isNaN(l.amount) ? 0 : l.amount) * mult;
      }, 0);
      setTodayAmount(isNaN(amount) ? 0 : Math.round(amount));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [getNextReminder, logs]);

  const triggerRandomEncounter = () => {
    const encounters = [
      {
        title: '神秘洞府',
        desc: '你在打坐时，神识意外探入一处微型空间裂缝，发现了一个古修士遗留的储物袋。',
        reward: '灵石 x50',
        onClaim: () => addSpiritStones(50)
      },
      {
        title: '天地异象',
        desc: '天降甘霖，灵气浓郁成雾，你趁机疯狂吸纳，修为大增。',
        reward: '修为 +1000',
        onClaim: () => addMaterial('pill_jinsui', 1) // Give a pill equivalent
      },
      {
        title: '仙人指路',
        desc: '一位路过的元婴期前辈见你骨骼惊奇，随口点拨了你几句，让你茅塞顿开。',
        reward: '普通灵草 x2',
        onClaim: () => addMaterial('common_herb', 2)
      },
      {
        title: '掌天瓶异动',
        desc: '你怀中的掌天瓶突然吸收了一缕月华，凝聚出一滴绿液。',
        reward: '绿液滴 x1',
        onClaim: () => useStore.getState().addHeavenlyBottleDrop(1)
      }
    ];
    
    const randomEncounter = encounters[Math.floor(Math.random() * encounters.length)];
    setEncounterData(randomEncounter);
    setShowEncounterModal(true);
  };

  const handleDrink = (amount: number, type: 'water' | 'coffee' | 'tea' | 'milktea', e?: React.MouseEvent) => {
    const finalAmount = addLog(amount, type);
    
    // Gain proficiency for equipped skills
    equippedSkills.forEach(skillId => {
      gainSkillProficiency(skillId, 1); // +1% proficiency per drink
    });

    // 5% chance for random encounter
    if (Math.random() < 0.05) {
      triggerRandomEncounter();
    }
    
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    // Play sound effect
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    const messages = EMOTIONAL_MESSAGES[type] || EMOTIONAL_MESSAGES['water'];
    let randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    // Check if goal reached just now (approximate check)
    const effectiveAmount = finalAmount * safePassiveMultiplier;
    
    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      const id = Date.now();
      const pct = ((effectiveAmount / dynamicGoal) * 100).toFixed(1);
      setFloatingTexts(prev => [...prev, { id, text: `修为 +${Math.round(effectiveAmount)} (${pct}%)`, x, y }]);
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 2000);
    }

    if (todayAmount < dynamicGoal && todayAmount + effectiveAmount >= dynamicGoal) {
      randomMsg = "太棒了！你完成了今天的饮水目标！🎉 奖励自己休息一下吧！";
      unlockAchievement('daily_goal');
      if (sect && sectStatus === 'joined') {
        addSectContribution(100);
        setToastMessage('【宗门传音】完成今日修炼，宗门贡献 +100！');
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
    
    // Check total water achievement
    const newTotal = logs.reduce((sum, l) => sum + l.amount, 0) + amount;
    if (newTotal >= 10000) unlockAchievement('total_10l');
    if (newTotal >= 50000) unlockAchievement('total_50l');
    if (streakDays >= 3) unlockAchievement('streak_3');
    if (streakDays >= 7) unlockAchievement('streak_7');

    setToastMessage(randomMsg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuy = (item: any) => {
    const success = buyItem(item.id, item.cost, item.type === 'consumable', item.effect);
    if (success) {
      setToastMessage(`成功购买 ${item.name}！`);
    } else {
      setToastMessage(`灵石不足或已拥有该物品！`);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = async () => {
    if (shareRef.current) {
      try {
        const dataUrl = await toPng(shareRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#0f172a' });
        const link = document.createElement('a');
        link.download = '悦泉修仙卡片.png';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.error("Failed to generate poster", e);
        setToastMessage("生成海报失败，请长按截图保存");
        setTimeout(() => setToastMessage(null), 2000);
      }
    }
  };

  const progress = isNaN(todayAmount) || isNaN(dynamicGoal) || dynamicGoal === 0 ? 0 : Math.min((todayAmount / dynamicGoal) * 100, 100);

  // Today's logs for details modal
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayLogs = logs.filter((l) => l.timestamp >= today.getTime()).sort((a, b) => b.timestamp - a.timestamp);

  const getTypeLabel = (type?: string) => {
    switch(type) {
      case 'coffee': return '灵咖';
      case 'tea': return '灵茶';
      case 'milktea': return '仙奶茶';
      default: return '灵泉水';
    }
  };

  const getTypeIcon = (type?: string) => {
    switch(type) {
      case 'coffee': return <Coffee size={16} className="text-amber-600" />;
      case 'tea': return <CupSoda size={16} className="text-emerald-500" />;
      case 'milktea': return <CupSoda size={16} className="text-rose-400" />;
      default: return <Droplets size={16} className="text-sky-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 relative">
      <NarrativeHeader />
      {/* Leave Sect Confirm Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertCircle size={20} />
                <h2 className="text-lg font-medium">退出宗门</h2>
              </div>
              <button onClick={() => setShowLeaveConfirm(false)} className="text-slate-400 p-1"><X size={20} /></button>
            </div>
            <p className="text-slate-300 mb-6">退出宗门后，你的职位和贡献度将被清空，但可以随时重新加入。是否确认退出？</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  leaveSect();
                  setShowLeaveConfirm(false);
                }}
                className="flex-1 py-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/50 font-medium"
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`absolute inset-0 opacity-40 transition-colors duration-1000 bg-gradient-to-b ${currentLevel.bg}`} />

      <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center z-20">
        <button onClick={fetchWeatherData} className={`flex items-center space-x-2 bg-slate-800/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50 transition-colors ${isRefreshing ? 'opacity-50' : 'hover:bg-slate-700/60'}`}>
          <CloudSun size={14} className="text-amber-400" />
          <span className="text-xs text-slate-300">
            {cityName} {todayTemperature !== null ? `${todayTemperature}°C` : '--°C'}
          </span>
        </button>
        <div className="flex items-center space-x-2 bg-slate-800/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50">
          <Footprints size={14} className="text-emerald-400" />
          <span className="text-xs text-slate-300">{todaySteps > 0 ? todaySteps : '0'} 步</span>
        </div>
      </div>

      {/* V4.0 Floating Actions */}
      <div className="absolute right-4 top-24 flex flex-col space-y-3 z-30">
        <button 
          onClick={() => setShowConsultHeavens(true)}
          className="relative w-12 h-12 bg-indigo-500/20 border border-indigo-500/50 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)] group"
          title="推演天机"
        >
          <BrainCircuit size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => setShowExploreModal(true)}
          className="relative w-12 h-12 bg-purple-500/20 border border-purple-500/50 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        >
          <Mountain size={20} className="text-purple-400" />
        </button>
        <button 
          onClick={() => setShowChestModal(true)}
          className="relative w-12 h-12 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        >
          <PackageOpen size={20} className="text-amber-400" />
          {chests > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
              {chests}
            </span>
          )}
        </button>
        <button 
          onClick={() => setShowEncyclopedia(true)}
          title="修仙百科"
          className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/50 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)] group"
        >
          <Book size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => setShowSkillsModal(true)}
          className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/50 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.3)]"
        >
          <BookMarked size={20} className="text-indigo-400" />
        </button>
        <button 
          onClick={() => setShowStoryModal(true)}
          className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <BookOpen size={20} className="text-emerald-400" />
        </button>
        <button 
          onClick={() => setShowProductionModal(true)}
          className="w-12 h-12 bg-rose-500/20 border border-rose-500/50 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(244,63,94,0.3)]"
        >
          <Flame size={20} className="text-rose-400" />
        </button>
        <button 
          onClick={() => setShowNpcModal(true)}
          className="w-12 h-12 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <Users size={20} className="text-blue-400" />
        </button>
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-md mt-12">
        <div className="flex items-center justify-between w-full px-2 mb-2">
          <div className="flex items-center space-x-1 bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full border border-rose-500/30">
            <Flame size={14} />
            <span className="text-xs font-medium">连续修炼 {streakDays || 0} 天</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowNameModal(true)} className="flex items-center space-x-1 bg-slate-500/20 text-slate-300 px-3 py-1 rounded-full border border-slate-500/30 hover:bg-slate-500/30 transition-colors">
              <Edit2 size={14} />
              <span className="text-xs font-medium">{playerName}</span>
            </button>
            <button onClick={() => setShowMapModal(true)} className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors">
              <Map size={14} />
              <span className="text-xs font-medium">{regionInfo?.name || '凡人界'}</span>
            </button>
            <button onClick={() => setShowInventoryModal(true)} className="flex items-center space-x-1 bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
              <Package size={14} />
              <span className="text-xs font-medium">储物袋</span>
            </button>
            <button onClick={() => setShowShop(true)} className="flex items-center space-x-1 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 hover:bg-amber-500/30 transition-colors">
              <Store size={14} />
              <span className="text-xs font-medium">坊市</span>
            </button>
            <button onClick={() => setShowMultiplayerModal(true)} className="flex items-center space-x-1 bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors relative">
              <Users size={14} />
              <span className="text-xs font-medium">大千世界</span>
              {onlinePlayers.length > 1 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </button>
            <button onClick={() => setShowQuests(true)} className="flex items-center space-x-1 bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors relative">
              <ScrollText size={14} />
              <span className="text-xs font-medium">宗门任务</span>
              {quests.some(q => q.progress >= q.target && !q.completed) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {levelIndex >= 54 && (
              <button onClick={() => {
                const res = ascend();
                setToastMessage(res.message);
                setTimeout(() => setToastMessage(null), 3000);
              }} className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors animate-bounce">
                <Sparkles size={14} />
                <span className="text-xs font-bold">飞升灵界</span>
              </button>
            )}
          </div>
        </div>
        
        <h1 className="text-2xl font-light mb-2 tracking-wider text-slate-300 mt-4">悦泉</h1>
        
        <p className="text-xs text-slate-400 mb-6 bg-slate-800/40 px-4 py-2 rounded-full border border-slate-700/50">
          {getGreeting()}
        </p>

        <div className="mb-8 flex flex-col items-center w-full">
          <div className="relative mb-4">
            <div className="w-40 h-40 rounded-full border-4 border-slate-700/50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm shadow-2xl relative overflow-hidden">
              <div className={`absolute inset-0 opacity-20 bg-gradient-to-t ${currentLevel.bg}`} />
              <span className="text-4xl font-light text-white mb-1 tracking-tighter">{Math.floor(totalAmount || 0)}</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest">当前修为</span>
            </div>
            {/* Sub-level indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 px-3 py-1 rounded-full flex items-center shadow-lg whitespace-nowrap">
              <span className="text-[10px] text-amber-400 font-bold tracking-widest">{currentLevel.name} {subLevel}阶</span>
            </div>
          </div>

          {foundationDamaged && (
            <div className="mb-4 flex items-center space-x-2 bg-red-900/40 border border-red-500/50 px-4 py-2 rounded-xl text-red-300 animate-pulse">
              <ShieldAlert size={16} />
              <span className="text-xs font-bold">根基受损！修为停滞，请使用掌天瓶修复。</span>
            </div>
          )}

          <div className="flex items-center space-x-2 mb-3 mt-2">
            <span className="flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">
              <Gem size={14} className="mr-1.5" /> {spiritStones || 0} 灵石
            </span>
            <span className="flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-rose-900/40 text-rose-300 border border-rose-700/50">
              寿元 {age || 0} / {lifespan === Infinity ? '与天同寿' : (lifespan || 100)}
            </span>
          </div>

          {currentTitle && (
            <button onClick={() => setShowTitleModal(true)} className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 mb-2 hover:bg-amber-500/20 transition-colors flex items-center">
              <Trophy size={12} className="mr-1" /> {currentTitle}
            </button>
          )}
          {!currentTitle && unlockedTitles && unlockedTitles.length > 0 && (
            <button onClick={() => setShowTitleModal(true)} className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full border border-slate-700/50 mb-2 hover:bg-slate-700/50 transition-colors">
              佩戴称号
            </button>
          )}

          {/* Breakthrough Button or Progress */}
          {canBreakthrough && nextLevel ? (
            <div className="flex flex-col items-center mt-4">
              <button
                onClick={() => {
                  const isMajor = currentLevel.name === '炼气十三层' || currentLevel.name === '筑基巅峰' || currentLevel.name === '结丹巅峰';
                  
                  if (isMajor) {
                    let requiredPill = '';
                    if (currentLevel.name === '炼气十三层') requiredPill = 'pill_foundation';
                    else if (currentLevel.name === '筑基巅峰') requiredPill = 'pill_golden_core';
                    else if (currentLevel.name === '结丹巅峰') requiredPill = 'pill_nascent_soul';

                    if (requiredPill && (materials[requiredPill] || 0) <= 0) {
                      setToastMessage(`大境界突破需要丹药，请先准备。`);
                      setTimeout(() => setToastMessage(null), 3000);
                      return;
                    }
                    if (useQingxinPill && (materials['qingxin_pill'] || 0) <= 0) {
                      setToastMessage(`清心丹数量不足。`);
                      setTimeout(() => setToastMessage(null), 3000);
                      return;
                    }

                    // Start Tribulation
                    setTribulationStrikes(0);
                    setTribulationProgress(0);
                    setTribulationTimer(10);
                    setShowTribulationModal(true);
                  } else {
                    const result = attemptBreakthrough(useQingxinPill);
                    setToastMessage(result.message);
                    setTimeout(() => setToastMessage(null), 3000);
                    if (result.success) {
                      setShowBreakthroughEffect(true);
                      setTimeout(() => setShowBreakthroughEffect(false), 3000);
                      setBreakthroughEvent(nextLevel.name);
                    }
                  }
                }}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-full font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all animate-pulse flex items-center text-sm"
              >
                <Flame size={18} className="mr-2" /> 尝试突破至 {nextLevel.name}
              </button>
              {(materials['qingxin_pill'] || 0) > 0 && (
                <label className="mt-3 flex items-center space-x-2 text-xs text-slate-300 cursor-pointer bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                  <input 
                    type="checkbox" 
                    checked={useQingxinPill} 
                    onChange={(e) => setUseQingxinPill(e.target.checked)}
                    className="rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500/50"
                  />
                  <span>使用清心丹 (成功率+20%, 拥有: {materials['qingxin_pill']})</span>
                </label>
              )}
            </div>
          ) : nextLevel && (
            <div className="w-full max-w-sm mt-4 flex flex-col items-center bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50 shadow-inner">
              <div className="flex justify-between w-full text-xs mb-2">
                <span className="text-slate-400">当前境界进度</span>
                <span className="text-amber-400 font-medium">{Math.floor((subLevelProgress || 0) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden mb-3 shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r ${currentLevel.bg} transition-all duration-1000 ease-out relative`}
                  style={{ width: `${subLevelProgress * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center justify-center text-xs text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                <Droplets size={14} className="text-sky-400 mr-1.5" />
                <span>
                  距 <span className="text-amber-400 font-bold">{nextLevel.name}</span> 还需 <span className="text-sky-400 font-bold">{Math.max(0, Math.floor(nextLevel.min - (totalAmount || 0)))}</span> 修为
                  <span className="text-slate-500 ml-1">(约 {Math.ceil(Math.max(0, nextLevel.min - (totalAmount || 0)) / 250)} 杯水)</span>
                </span>
              </div>
            </div>
          )}

          {safePassiveMultiplier > 1 && (
            <span className="text-[10px] text-amber-400/80 mt-2 flex items-center">
              <Sparkles size={10} className="mr-1" /> 修为获取倍率: {(safePassiveMultiplier || 1).toFixed(1)}x
            </span>
          )}
        </div>

        {/* Continuous Check-in Calendar */}
        <div className="w-full mb-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3 z-20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300 font-medium flex items-center"><Flame size={14} className="text-rose-400 mr-1" /> 闭关日历</span>
            <span className="text-xs text-slate-500">连续 {streakDays || 0} 天</span>
          </div>
          <div className="flex justify-between items-center">
            {[...Array(7)].map((_, i) => {
               const safeStreak = streakDays || 0;
               const isCompleted = i < (safeStreak % 7 === 0 && safeStreak > 0 ? 7 : safeStreak % 7);
               return (
                 <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isCompleted ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-800/50 border-slate-700/50 text-slate-600'}`}>
                   {isCompleted ? <Sparkles size={16} /> : <span className="text-xs font-mono">{i + 1}</span>}
                 </div>
               )
            })}
          </div>
        </div>

        {/* Daily Fate */}
        <div className="w-full mb-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3 z-20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300 font-medium flex items-center"><Compass size={14} className="text-purple-400 mr-1" /> 今日天机</span>
            {selectedFate ? (
              <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">已窥天机</span>
            ) : (
              <button 
                onClick={() => setShowFateModal(true)}
                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30 animate-pulse"
              >
                窥探天机
              </button>
            )}
          </div>
          {selectedFate ? (
            <div className={`p-3 rounded-xl border flex items-start space-x-3 ${selectedFate.type === 'fortune' ? 'bg-amber-900/20 border-amber-500/30' : selectedFate.type === 'disaster' ? 'bg-rose-900/20 border-rose-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
              <div className={`p-2 rounded-lg ${selectedFate.type === 'fortune' ? 'bg-amber-500/20 text-amber-400' : selectedFate.type === 'disaster' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {selectedFate.type === 'fortune' ? <Sparkles size={16} /> : selectedFate.type === 'disaster' ? <Flame size={16} /> : <Compass size={16} />}
              </div>
              <div>
                <h4 className={`text-sm font-bold ${selectedFate.type === 'fortune' ? 'text-amber-400' : selectedFate.type === 'disaster' ? 'text-rose-400' : 'text-blue-400'}`}>{selectedFate.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{selectedFate.desc}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500 text-xs">
              今日天机尚未开启，吉凶未卜...
            </div>
          )}
        </div>

        {/* Lore Section: Spiritual Root & Sect */}
        <div className="w-full mb-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Sparkles size={16} className="text-amber-400 mr-2" />
              <span className="text-sm text-slate-300">灵根：</span>
              {spiritualRoot ? (
                <span className={`text-sm font-bold ${rootInfo?.color}`}>{rootInfo?.name}</span>
              ) : (
                <button onClick={() => {
                  const root = testSpiritualRoot();
                  setGachaRootId(root);
                  setShowRootGachaModal(true);
                }} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">
                  测定灵根
                </button>
              )}
            </div>
            {spiritualRoot && spiritualRoot !== 'none' && (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Shield size={16} className="text-blue-400 mr-2" />
                  <span className="text-sm text-slate-300">宗门：</span>
                  {sect ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm font-bold text-blue-300">{currentSectInfo?.name || sect} <span className="text-xs text-blue-400/70">Lv.{sectLevel || 1}</span></span>
                      <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">
                        {sectPosition === 'patriarch' ? '宗主' : sectPosition === 'elder' ? '长老' : sectPosition === 'core' ? '亲传弟子' : sectPosition === 'inner' ? '内门弟子' : '外门弟子'}
                      </span>
                      <div className="flex-1"></div>
                      <button onClick={() => setShowLeaveConfirm(true)} className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                        退出
                      </button>
                    </div>
                  ) : sectStatus === 'left' ? (
                    <span className="text-sm font-bold text-amber-400">散修</span>
                  ) : (
                    <button onClick={() => {
                      const res = participateImmortalAssembly();
                      setToastMessage(res.message);
                      setTimeout(() => setToastMessage(null), 3000);
                    }} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                      参加升仙大会
                    </button>
                  )}
                </div>
                {sect && (
                  <div className="flex flex-col pl-6 mt-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">宗门贡献：<span className="text-amber-400 font-bold">{sectContribution || 0}</span></span>
                      {sectPosition !== 'patriarch' && (
                        <button 
                          onClick={() => {
                            const result = promoteSectPosition();
                            setToastMessage(result.message);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                        >
                          晋升职位
                        </button>
                      )}
                      {sectPosition === 'patriarch' && (
                        <button 
                          onClick={() => {
                            const result = upgradeSect();
                            setToastMessage(result.message);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                        >
                          提升宗门 (Lv.{sectLevel || 1})
                        </button>
                      )}
                      <button 
                        onClick={() => setShowDonateModal(true)}
                        className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors ml-2"
                      >
                        捐献物资
                      </button>
                    </div>
                    {currentSectInfo && (
                      <div className="text-[10px] text-slate-500 bg-slate-800/30 px-2 py-1 rounded border border-slate-700/30">
                        <span className="text-blue-400">宗门秘法：</span>{currentSectInfo.desc}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {spiritualRoot === 'none' && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">洗毛伐髓进度 (多喝水重塑灵根)</span>
                <span className="text-emerald-400">{marrowWashProgress || 0} / 5000</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, ((marrowWashProgress || 0) / 5000) * 100)}%` }}></div>
              </div>
            </div>
          )}

          {/* Dao Companion Section */}
          <div className="flex items-center mt-2 pt-2 border-t border-slate-700/50">
            <Heart size={16} className="text-rose-400 mr-2" />
            <span className="text-sm text-slate-300">道侣：</span>
            {currentLevel.min < 30000 ? (
              <span className="text-xs text-slate-500">结丹期开启</span>
            ) : (marriedCompanions?.length > 0 || daoCompanion) ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-rose-300">
                  {marriedCompanions?.length > 0 ? `${marriedCompanions.length}位` : daoCompanion?.name}
                  {daoCompanion && marriedCompanions?.length > 0 && ` (主修: ${daoCompanion.name})`}
                </span>
                {daoCompanion?.active && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    阴阳交汇 (+{Math.round((DAO_COMPANIONS.find(c => c.id === daoCompanion.id)?.effect || 1) * 100 - 100)}%)
                  </span>
                )}
                {!daoCompanion?.active && daoCompanion && (
                  <button onClick={() => {
                    setToastMessage('已发送传音符提醒道侣！');
                    setTimeout(() => setToastMessage(null), 3000);
                  }} className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                    提醒打卡
                  </button>
                )}
                <button onClick={() => setShowCompanionInteractModal(true)} className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30 ml-2">
                  互动
                </button>
                <button onClick={() => setShowCompanionModal(true)} className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 ml-2">
                  寻觅
                </button>
              </div>
            ) : (
              <button onClick={() => setShowCompanionModal(true)} className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded border border-rose-500/30">
                寻觅道侣
              </button>
            )}
          </div>
        </div>

        {/* Companion Daily Event */}
        {companionDailyEvent && (
          <div className="w-full mb-6 bg-pink-900/20 rounded-2xl p-4 border border-pink-500/30 flex justify-between items-center z-20">
            <div className="flex items-center text-pink-300">
              <Heart size={16} className="mr-2" />
              <span className="text-sm font-bold">道侣传音</span>
            </div>
            <button
              onClick={() => {
                const res = useStore.getState().claimCompanionEvent?.();
                if (res && res.message) setToastMessage(res.message);
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="px-3 py-1 bg-pink-600/30 hover:bg-pink-600/50 text-pink-200 text-xs font-bold rounded-lg transition-colors border border-pink-500/50"
            >
              查看
            </button>
          </div>
        )}

        {/* Cultivation Lore Records */}
        {dailyEncyclopediaItems && dailyEncyclopediaItems.length > 0 && (
          <div className="w-full mb-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-2 z-20">
            <div className="flex items-center text-amber-400 mb-1">
              <ScrollText size={16} className="mr-2" />
              <span className="text-sm font-bold">修仙见闻录</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "今日传闻：{
                parseInt(dailyEncyclopediaItems[0].split('_')[1]) % 3 === 0 
                  ? `东海之滨惊现上古秘境，疑似有真仙遗宝出世。` 
                  : parseInt(dailyEncyclopediaItems[0].split('_')[1]) % 3 === 1 
                  ? `某位大能冲击化神期失败，引得天地灵气剧烈动荡。`
                  : `坊市中流传着一种新型聚气散的配方，据说效果惊人。`
              }"
            </p>
            <div className="text-[10px] text-slate-500 text-right mt-1">
              根据你的境界【{currentLevel.name}】推演
            </div>
          </div>
        )}

        {/* Global Event Placeholder */}
        {globalEvent && (
          <div className="w-full mb-6 bg-slate-800/40 rounded-2xl p-4 border border-rose-500/30 flex flex-col gap-3 z-20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Flame size={80} className="text-rose-500" />
            </div>
            <div className="flex justify-between items-center mb-1 relative z-10">
              <span className="text-sm text-rose-400 font-bold flex items-center"><Flame size={14} className="mr-1" /> 宗门大事件</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${globalEvent.status === 'active' ? 'text-rose-300 bg-rose-500/20 border-rose-500/30 animate-pulse' : 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30'}`}>
                {globalEvent.status === 'active' ? '进行中' : '已完成'}
              </span>
            </div>
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-slate-200 mb-1">{globalEvent.title}</h4>
              <p className="text-xs text-slate-400">{globalEvent.description}</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3 mb-1">
                <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${(globalEvent.progress / globalEvent.target) * 100}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                <span>进度: {globalEvent.progress}/{globalEvent.target}</span>
                <span>剩余时间: {Math.max(0, Math.ceil(((globalEvent.endTime || Date.now()) - Date.now()) / (1000 * 60 * 60 * 24)))}天</span>
              </div>
              {globalEvent.status === 'active' && (
                <button
                  onClick={() => {
                    if (spiritStones >= 1) {
                      contributeToGlobalEvent(1);
                      setToastMessage('成功捐献 1 灵石，宗门护阵加固！');
                      setTimeout(() => setToastMessage(null), 2000);
                    } else {
                      setToastMessage('灵石不足！');
                      setTimeout(() => setToastMessage(null), 2000);
                    }
                  }}
                  className="w-full py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold text-xs hover:bg-rose-500/30 transition-colors"
                >
                  贡献力量 (消耗 1 灵石)
                </button>
              )}
            </div>
          </div>
        )}

        <motion.div
          className="relative w-64 h-64 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.2)] overflow-hidden"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div 
            className="absolute bottom-0 w-[200%] bg-gradient-to-t from-sky-500 to-sky-300/80 transition-all duration-1000 ease-in-out"
            style={{ height: `${progress}%`, left: '-50%', borderRadius: '40% 40% 0 0', animation: 'wave 4s infinite linear' }}
          />
          <div 
            className="absolute bottom-0 w-[200%] bg-gradient-to-t from-emerald-500/50 to-sky-300/50 transition-all duration-1000 ease-in-out"
            style={{ height: `${progress + 2}%`, left: '-50%', borderRadius: '40% 40% 0 0', animation: 'wave 5s infinite linear reverse' }}
          />
          <div className="absolute inset-0 rounded-full border-4 border-slate-700/50" />
          
          <div className="z-10 flex flex-col items-center text-center">
            <span className="text-sm text-slate-300/80 mb-2">下次提醒</span>
            <span className="text-3xl font-medium text-white tracking-tight">{timeLeft}</span>
            {nextTime && (
              <span className="text-xs text-slate-400 mt-2 font-mono">
                {new Date(nextTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </motion.div>

        <div className="mt-8 text-center w-full">
          <p className="text-slate-400 text-sm mb-2">今日有效补水</p>
          <p className="text-4xl font-light text-white">
            {isNaN(todayAmount) ? 0 : todayAmount} <span className="text-lg text-slate-500">/ {dynamicGoal} ml</span>
          </p>
          {dynamicGoal > settings.dailyGoal && (
            <p className="text-[10px] text-emerald-400/80 mt-1">
              (已根据天气和步数动态增加目标)
            </p>
          )}
        </div>

        {/* Cultivation Mode Selector */}
        <div className="w-full mt-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3 z-20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-amber-400">
              <Compass size={16} className="mr-2" />
              <span className="text-sm font-bold">修炼模式</span>
            </div>
            <span className="text-[10px] text-slate-500">影响收益与风险</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => useStore.setState({ cultivationMode: 'safe' })}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors flex flex-col items-center justify-center gap-1 ${
                cultivationMode === 'safe' || !cultivationMode
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
              }`}
            >
              <Home size={14} />
              <span>洞府闭关</span>
              <span className="text-[9px] opacity-70 font-normal">100%安全</span>
            </button>
            <button
              onClick={() => useStore.setState({ cultivationMode: 'normal' })}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors flex flex-col items-center justify-center gap-1 ${
                cultivationMode === 'normal'
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/50'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
              }`}
            >
              <Footprints size={14} />
              <span>外出历练</span>
              <span className="text-[9px] opacity-70 font-normal">1.5倍收益</span>
            </button>
            <button
              onClick={() => useStore.setState({ cultivationMode: 'risky' })}
              className={`py-2 px-1 rounded-xl text-xs font-bold border transition-colors flex flex-col items-center justify-center gap-1 ${
                cultivationMode === 'risky'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
              }`}
            >
              <Skull size={14} />
              <span>秘境探险</span>
              <span className="text-[9px] opacity-70 font-normal">高风险高回报</span>
            </button>
          </div>
        </div>

        {/* Cave Section */}
        <div className="w-full mt-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-rose-400">
              <Home size={16} className="mr-2" />
              <span className="text-sm font-bold">洞府修行</span>
            </div>
            <span className="text-[10px] text-slate-500">等级: {Math.floor((alchemyLevel || 1) + (craftingLevel || 1))}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => {
                gatherMaterials();
                setToastMessage('正在后山采药挖矿...');
                setTimeout(() => setToastMessage(null), 2000);
              }}
              className="py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
            >
              <Pickaxe size={14} className="mr-1" /> 采药挖矿
            </button>
            <button 
              onClick={() => setShowProductionModal(true)}
              className="py-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-rose-500/20 transition-colors"
            >
              <Flame size={14} className="mr-1" /> 洞府炼制
            </button>
            <button 
              onClick={() => setShowBottleModal(true)}
              className="py-3 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-emerald-500/30 transition-colors relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent"></div>
              <Droplets size={14} className="mr-1" /> 掌天瓶
            </button>
          </div>
        </div>

        {/* Drink Categories */}
        <div className="grid grid-cols-4 gap-3 mt-8 w-full">
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleDrink(250, 'water', e)} className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-2xl py-3 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-sky-500/20 opacity-0 group-active:opacity-100 transition-opacity duration-300"></div>
            <Droplets size={24} className="text-sky-400 mb-1" />
            <span className="text-xs text-slate-300">灵泉水</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleDrink(250, 'tea', e)} className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-2xl py-3 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-active:opacity-100 transition-opacity duration-300"></div>
            <CupSoda size={24} className="text-emerald-500 mb-1" />
            <span className="text-xs text-slate-300">灵茶</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleDrink(250, 'coffee', e)} className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-2xl py-3 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-600/20 opacity-0 group-active:opacity-100 transition-opacity duration-300"></div>
            <Coffee size={24} className="text-amber-600 mb-1" />
            <span className="text-xs text-slate-300">灵咖</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => handleDrink(250, 'milktea', e)} className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-2xl py-3 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-400/20 opacity-0 group-active:opacity-100 transition-opacity duration-300"></div>
            <CupSoda size={24} className="text-rose-400 mb-1" />
            <span className="text-xs text-slate-300">仙奶茶</span>
          </motion.button>
        </div>

        {/* Action Links */}
        <div className="flex justify-between w-full mt-6 px-2">
          <button onClick={() => setShowDetails(true)} className="flex items-center text-slate-400 hover:text-slate-200 text-sm transition-colors">
            <List size={16} className="mr-1" /> 今日明细
          </button>
          <button onClick={() => setShowShare(true)} className="flex items-center text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
            <Share2 size={16} className="mr-1" /> 炫耀一下
          </button>
        </div>
        
        <AdBanner />
      </div>

      {/* Floating Texts */}
      <AnimatePresence>
        {floatingTexts.map(ft => (
          <motion.div
            key={ft.id}
            initial={{ opacity: 1, y: ft.y, x: ft.x - 40, scale: 0.5 }}
            animate={{ opacity: 0, y: ft.y - 100, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="fixed z-[100] pointer-events-none text-emerald-400 font-bold text-sm drop-shadow-md whitespace-nowrap"
          >
            {ft.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 pb-safe max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-white">今日饮水明细</h2>
              <button onClick={() => setShowDetails(false)} className="text-slate-400 p-1"><X size={20} /></button>
            </div>
            
            <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl">
              <p className="text-sm text-indigo-300 italic text-center">
                "{getUniqueEmotionalMessage()}"
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {todayLogs.length > 0 ? todayLogs.map(log => (
                <div key={log.id} className="flex flex-col bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-900 rounded-lg">
                        {getTypeIcon(log.type)}
                      </div>
                      <div>
                        <p className="text-sm text-slate-200">{getTypeLabel(log.type)} {log.amount}ml</p>
                        <p className="text-xs text-slate-500">{format(new Date(log.timestamp), 'HH:mm')}</p>
                      </div>
                    </div>
                    <button onClick={() => removeLog(log.timestamp)} className="text-rose-400/70 hover:text-rose-400 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {log.message && (
                    <div className="mt-2 text-xs text-amber-400 bg-amber-900/20 p-2 rounded border border-amber-500/20">
                      {log.message}
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-center text-slate-500 text-sm py-8">今天还没有喝水哦，快去补充水分吧！</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Reward Modal */}
      <AnimatePresence>
        {showDailyRewardModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
                  <Gift className="text-amber-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white">每日签到奖励</h2>
                <p className="text-slate-400 text-sm mt-1">连续签到 {streakDays || 0} 天</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="flex items-center text-slate-300">
                    <Gem size={18} className="text-cyan-400 mr-2" />
                    <span>灵石</span>
                  </div>
                  <span className="font-bold text-cyan-400">+{100 * ((((streakDays || 0) - 1) % 7) + 1)}</span>
                </div>
                
                {(((streakDays || 0) - 1) % 7) === 0 && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center text-slate-300">
                      <Sprout size={18} className="text-emerald-400 mr-2" />
                      <span>普通灵草</span>
                    </div>
                    <span className="font-bold text-emerald-400">+1</span>
                  </div>
                )}
                {(((streakDays || 0) - 1) % 7) === 1 && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center text-slate-300">
                      <Package size={18} className="text-amber-400 mr-2" />
                      <span>黄龙丹</span>
                    </div>
                    <span className="font-bold text-amber-400">+1</span>
                  </div>
                )}
                {(((streakDays || 0) - 1) % 7) === 2 && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center text-slate-300">
                      <Droplets size={18} className="text-emerald-400 mr-2" />
                      <span>绿液滴</span>
                    </div>
                    <span className="font-bold text-emerald-400">+1</span>
                  </div>
                )}
                {(((streakDays || 0) - 1) % 7) === 3 && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center text-slate-300">
                      <Sprout size={18} className="text-purple-400 mr-2" />
                      <span>珍稀灵草</span>
                    </div>
                    <span className="font-bold text-purple-400">+1</span>
                  </div>
                )}
                {(((streakDays || 0) - 1) % 7) === 4 && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center text-slate-300">
                      <Package size={18} className="text-yellow-400 mr-2" />
                      <span>金髓丸</span>
                    </div>
                    <span className="font-bold text-yellow-400">+1</span>
                  </div>
                )}
                {(((streakDays || 0) - 1) % 7) === 5 && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center text-slate-300">
                      <Droplets size={18} className="text-emerald-400 mr-2" />
                      <span>绿液滴</span>
                    </div>
                    <span className="font-bold text-emerald-400">+2</span>
                  </div>
                )}
                {(((streakDays || 0) - 1) % 7) === 6 && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center text-slate-300">
                      <Droplets size={18} className="text-emerald-400 mr-2" />
                      <span>绿液滴</span>
                    </div>
                    <span className="font-bold text-emerald-400">+5</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  claimDailyReward();
                  setShowDailyRewardModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all"
              >
                领取奖励
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Gains Modal */}
      <AnimatePresence>
        {showOfflineModal && offlineData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(16,185,129,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"></div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                  <CloudSun className="text-emerald-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-widest">闭关归来</h2>
                <p className="text-sm text-slate-400 mt-1">你闭关修炼了 {Math.floor((offlineData.time || 0) / 60)}小时 {(offlineData.time || 0) % 60}分钟</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">修为增长</span>
                  <span className="text-emerald-400 font-bold">+{offlineData.exp}</span>
                </div>
                {offlineData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-slate-300">{item.id === 'spirit_stone' ? '灵石' : getItemInfo(item.id)?.name || item.id}</span>
                    <span className="text-amber-400 font-bold">+{item.amount}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setShowOfflineModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
              >
                出关
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Random Encounter Modal */}
      <AnimatePresence>
        {showEncounterModal && encounterData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-purple-500/50 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(168,85,247,0.3)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500"></div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                  <Sparkles className="text-purple-400" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-widest">{encounterData.title}</h2>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 mb-6">
                <p className="text-slate-300 text-sm leading-relaxed text-center">
                  {encounterData.desc}
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 mb-6 text-emerald-400 font-bold">
                <Gift size={18} />
                <span>奖励: {encounterData.reward}</span>
              </div>

              <button
                onClick={() => {
                  encounterData.onClaim();
                  setShowEncounterModal(false);
                  setToastMessage(`奇遇奖励已领取：${encounterData.reward}`);
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all"
              >
                收下机缘
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tribulation Modal */}
      <AnimatePresence>
        {showTribulationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Lightning effects */}
              <motion.div
                animate={{ opacity: [0, 0.8, 0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute inset-0 bg-blue-500/10"
              />
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
                  transition={{ duration: 0.2, delay: Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() * 3 }}
                  className="absolute top-0 w-2 h-full bg-blue-400 blur-sm origin-top"
                  style={{ left: `${Math.random() * 100}%`, transform: `rotate(${Math.random() * 20 - 10}deg)` }}
                />
              ))}
            </div>

            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative z-10 w-full max-w-sm flex flex-col items-center"
            >
              <h2 className="text-4xl font-black text-blue-400 mb-2 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)] tracking-widest">天劫降临</h2>
              <p className="text-slate-300 mb-8 text-center">抵御九天神雷，方可突破大境界！<br/>剩余时间: <span className="text-rose-400 font-bold text-xl">{tribulationTimer}s</span></p>

              <div className="w-full h-4 bg-slate-800 rounded-full mb-8 overflow-hidden border border-slate-700">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${tribulationProgress}%` }}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setTribulationStrikes(prev => prev + 1);
                  setTribulationProgress(prev => Math.min(100, prev + 10)); // 10 clicks to win
                }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 border-4 border-blue-400 flex items-center justify-center shadow-[0_0_30px_rgba(96,165,250,0.6)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 group-active:bg-white/40 transition-colors" />
                <span className="text-2xl font-bold text-white tracking-widest">御雷</span>
              </motion.button>
              
              <p className="mt-6 text-sm text-slate-400">狂点按钮抵抗雷劫！</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Root Gacha Modal */}
      <AnimatePresence>
        {showRootGachaModal && gachaRootId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="relative w-full max-w-sm aspect-[3/4] rounded-2xl border-2 overflow-hidden flex flex-col items-center justify-center"
              style={{
                borderColor: gachaRootId === 'waste_genius' ? '#10b981' : gachaRootId === 'mutated' ? '#f43f5e' : gachaRootId === 'heaven' ? '#f59e0b' : gachaRootId === 'dual' ? '#a855f7' : gachaRootId === 'triple' ? '#3b82f6' : '#64748b',
                background: gachaRootId === 'waste_genius' ? 'linear-gradient(to bottom right, #064e3b, #022c22)' : gachaRootId === 'mutated' ? 'linear-gradient(to bottom right, #881337, #4c0519)' : gachaRootId === 'heaven' ? 'linear-gradient(to bottom right, #451a03, #78350f)' : gachaRootId === 'dual' ? 'linear-gradient(to bottom right, #3b0764, #581c87)' : gachaRootId === 'triple' ? 'linear-gradient(to bottom right, #172554, #1e3a8a)' : 'linear-gradient(to bottom right, #0f172a, #1e293b)',
                boxShadow: gachaRootId === 'waste_genius' ? '0 0 50px rgba(16,185,129,0.5)' : gachaRootId === 'mutated' ? '0 0 50px rgba(244,63,94,0.5)' : gachaRootId === 'heaven' ? '0 0 50px rgba(245,158,11,0.5)' : gachaRootId === 'dual' ? '0 0 40px rgba(168,85,247,0.4)' : gachaRootId === 'triple' ? '0 0 30px rgba(59,130,246,0.3)' : '0 0 20px rgba(100,116,139,0.2)'
              }}
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
              
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="z-10 flex flex-col items-center"
              >
                <Sparkles size={48} className={`mb-6 ${gachaRootId === 'waste_genius' ? 'text-emerald-400' : gachaRootId === 'mutated' ? 'text-rose-400' : gachaRootId === 'heaven' ? 'text-amber-400' : gachaRootId === 'dual' ? 'text-purple-400' : gachaRootId === 'triple' ? 'text-blue-400' : 'text-slate-400'}`} />
                <h2 className={`text-4xl font-black tracking-widest mb-2 ${gachaRootId === 'waste_genius' ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]' : gachaRootId === 'mutated' ? 'text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]' : gachaRootId === 'heaven' ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : gachaRootId === 'dual' ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' : gachaRootId === 'triple' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'text-slate-300'}`}>
                  {SPIRITUAL_ROOTS.find(r => r.id === gachaRootId)?.name}
                </h2>
                <p className="text-sm text-slate-300 mt-4 px-8 text-center">
                  {SPIRITUAL_ROOTS.find(r => r.id === gachaRootId)?.desc}
                </p>
                <div className="mt-8 px-4 py-2 bg-black/50 rounded-full border border-white/10">
                  <span className="text-xs text-slate-400">修炼速度倍率: <span className="text-white font-bold">{SPIRITUAL_ROOTS.find(r => r.id === gachaRootId)?.bonus}x</span></span>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={() => setShowRootGachaModal(false)}
                className="absolute bottom-8 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-colors z-20"
              >
                踏入仙途
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Streak Rescue Modal */}
      <AnimatePresence>
        {pendingStreakRescue !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-rose-500/50 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(244,63,94,0.2)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-amber-500"></div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mb-4 border border-rose-500/50">
                  <AlertCircle size={32} className="text-rose-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">道心蒙尘，断签警告！</h2>
                <p className="text-sm text-slate-300 mb-6">
                  道友昨日未能坚持修炼，原本 <span className="text-amber-400 font-bold">{pendingStreakRescue}</span> 天的连续闭关记录即将中断！
                  <br/><br/>
                  是否使用 <span className="text-emerald-400 font-bold">护脉丹</span> 稳固道心，挽回断签？
                </p>
                
                <div className="flex flex-col w-full gap-3">
                  <button
                    onClick={() => {
                      const success = rescueStreak(true);
                      if (success) {
                        setToastMessage('服用护脉丹成功，道心稳固，连续闭关记录已恢复！');
                        setTimeout(() => setToastMessage(null), 3000);
                      } else {
                        setToastMessage('护脉丹不足！请前往坊市购买或自行炼制。');
                        setTimeout(() => setToastMessage(null), 3000);
                      }
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center"
                  >
                    <Flame size={18} className="mr-2" /> 服用护脉丹 (拥有: {materials['humai_pill'] || 0})
                  </button>
                  <button
                    onClick={() => rescueStreak(false)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium border border-slate-700 transition-all"
                  >
                    顺其自然，从头再来
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Modal (元婴期) */}
      <AnimatePresence>
        {showLevelUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              className="bg-gradient-to-b from-yellow-900/90 to-slate-900 border border-yellow-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl shadow-yellow-500/20"
            >
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.5)]"
              >
                <Sparkles size={48} className="text-yellow-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2 tracking-widest">碎丹成婴！</h2>
              <p className="text-yellow-100/80 text-sm mb-8 leading-relaxed">
                恭喜道友，历经千辛万苦，终于碎丹成婴，寿元大增！从此元婴不灭，神魂不散，真正踏入高阶修士行列！
              </p>
              <button
                onClick={() => setShowLevelUpModal(false)}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-yellow-600/30"
              >
                念头通达
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm p-6"
          >
            <button onClick={() => setShowShare(false)} className="absolute top-6 right-6 text-slate-400 p-2"><X size={24} /></button>
            
            {/* The Poster to be captured */}
            <div ref={shareRef} className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl relative overflow-hidden bg-gradient-to-br ${currentLevel.bg}`}>
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px]"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-sky-500/20 animate-pulse"></div>
                  <Droplets size={32} className="text-sky-400 relative z-10" />
                </div>
                <h2 className="text-2xl font-black tracking-widest text-white mb-1 drop-shadow-md">悦泉修仙录</h2>
                <div className="text-sm font-bold text-cyan-300 mb-4 tracking-wider">{playerName}</div>
                
                <div className="flex space-x-2 mb-6">
                  <div className={`text-sm font-bold px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/50 shadow-inner ${currentLevel.color}`}>
                    境界：{currentLevel.name}
                  </div>
                  {spiritualRoot && spiritualRoot !== 'none' && (
                    <div className={`text-sm font-bold px-4 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/50 shadow-inner ${rootInfo?.color}`}>
                      灵根：{rootInfo?.name}
                    </div>
                  )}
                </div>
                
                <div className="bg-slate-900/60 rounded-2xl p-5 w-full mb-6 border border-slate-700/50 shadow-inner relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                    <Droplets size={80} className="text-sky-400" />
                  </div>
                  <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider">今日有效补水</p>
                  <p className="text-4xl font-light text-white flex items-baseline justify-center">
                    {todayAmount} <span className="text-sm text-slate-500 ml-1 font-normal">ml</span>
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-2">
                    已转化修为：{Math.floor(todayAmount * safePassiveMultiplier)} 点
                  </p>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 w-full relative">
                  <div className="absolute -top-3 left-4 bg-slate-800 px-2 text-[10px] text-slate-400 border border-slate-700/50 rounded-full">修仙感悟</div>
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    "{
                      spiritualRoot === 'waste_genius' ? '三十年河东，三十年河西，莫欺少年穷！今日饮水，他日必定登仙！' :
                      spiritualRoot === 'heaven' ? '天生道体，万法自然。区区几杯水，便抵凡人数年苦修！' :
                      currentLevel.min > 10000 ? '大道无情，唯水长流。我辈修士，当饮水思源，稳固道心。' :
                      '仙路崎岖，唯有坚持。今日带薪喝水，击败了全国 99% 的打工人！'
                    }"
                  </p>
                </div>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent my-6"></div>
                <div className="flex items-center justify-between w-full px-4">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 tracking-widest mb-1">FLOW WATER</p>
                    <p className="text-xs font-bold text-slate-300 tracking-widest">饮水修仙</p>
                  </div>
                  <div className="w-12 h-12 bg-white p-1 rounded-lg">
                    <QRCode value={window.location.href} size={40} />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleShare} className="mt-8 flex items-center bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-medium shadow-lg shadow-emerald-500/20 transition-colors">
              <Download size={18} className="mr-2" /> 保存海报
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm relative">
              <button onClick={() => setShowNameModal(false)} className="absolute top-4 right-4 text-slate-400 p-1"><X size={20} /></button>
              <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center">
                <Edit2 size={20} className="mr-2" /> 道号设定
              </h2>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="输入你的道号..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 mb-4 focus:outline-none focus:border-cyan-500"
                maxLength={10}
              />
              <button
                onClick={() => {
                  if (tempName.trim()) {
                    setPlayerName(tempName.trim());
                    setShowNameModal(false);
                    setToastMessage('道号已更新！');
                    setTimeout(() => setToastMessage(null), 3000);
                  }
                }}
                className="w-full py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-500 transition-colors"
              >
                确认
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-md relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setShowMapModal(false)} className="absolute top-4 right-4 text-slate-400 p-1"><X size={20} /></button>
              <h2 className="text-xl font-bold text-slate-200 mb-2 flex items-center">
                <Map size={20} className="mr-2" /> 传送阵
              </h2>
              <p className="text-xs text-slate-400 mb-6">当前所在：<span className="text-cyan-400 font-bold">{regionInfo?.name || '凡人界'}</span></p>
              
              <div className="space-y-4">
                {REGIONS.map(region => {
                  const canTravel = totalAmount >= region.minLevel;
                  const isCurrent = currentRegion === region.id;
                  
                  return (
                    <div key={region.id} className={`bg-slate-900/50 border ${isCurrent ? 'border-cyan-500/50' : 'border-slate-700'} rounded-xl p-4 relative overflow-hidden`}>
                      <div className="flex flex-col mb-2">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className={`text-lg font-bold ${isCurrent ? 'text-cyan-300' : 'text-slate-300'}`}>{region.name}</h3>
                          {isCurrent ? (
                            <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30">当前位置</span>
                          ) : (
                            <button
                              disabled={!canTravel}
                              onClick={() => {
                                if (spiritStones >= region.cost) {
                                  useStore.getState().addSpiritStones(-region.cost);
                                  setCurrentRegion(region.id);
                                  setShowMapModal(false);
                                  setToastMessage(`已传送到 ${region.name}！`);
                                  setTimeout(() => setToastMessage(null), 3000);
                                } else {
                                  setToastMessage('灵石不足！');
                                  setTimeout(() => setToastMessage(null), 3000);
                                }
                              }}
                              className={`text-xs px-3 py-1.5 rounded font-bold ${canTravel ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                            >
                              {canTravel ? `传送 (${region.cost}灵石)` : `需修为达到 ${region.minLevel}`}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{region.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multiplayer Modal */}
      <AnimatePresence>
        {showMultiplayerModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-cyan-500/30 rounded-3xl p-6 w-full max-w-sm relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setShowMultiplayerModal(false)} className="absolute top-4 right-4 text-slate-400 p-1"><X size={20} /></button>
              <h2 className="text-xl font-bold text-cyan-300 mb-2 flex items-center">
                <Users size={20} className="mr-2" /> 大千世界
              </h2>
              <p className="text-xs text-slate-400 mb-4">此处可查探同一界域（局域网）内的其他修仙者。</p>
              
              {secretRealmActive && (
                <div className="bg-rose-900/30 border border-rose-500/50 rounded-xl p-4 mb-4 animate-pulse">
                  <h3 className="text-sm font-bold text-rose-400 mb-1">血色禁地已开启！</h3>
                  <p className="text-xs text-rose-300/80 mb-3">秘境内危机四伏，可与其他修士厮杀夺宝！</p>
                  <button 
                    onClick={() => {
                      if (socket) {
                        socket.emit('enter_secret_realm');
                      }
                      setActiveGame('blood_forbidden');
                      navigate('/games');
                      setShowMultiplayerModal(false);
                    }}
                    className="w-full py-2 bg-rose-500/20 text-rose-300 border border-rose-500/50 rounded-lg text-xs font-bold hover:bg-rose-500/30"
                  >
                    进入秘境
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300 mb-2">在线道友 ({onlinePlayers.length})</h3>
                {onlinePlayers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">当前界域空无一人...</p>
                ) : (
                  onlinePlayers.map(player => (
                    <div key={player.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-cyan-200">{player.name}</div>
                        <div className="text-[10px] text-slate-400">{SECTS.find(s => s.id === player.sect)?.name || player.sect || '散修'} · {player.level}</div>
                      </div>
                      <div className="flex space-x-2">
                        {secretRealmActive ? (
                          <button 
                            onClick={() => {
                              if (socket) socket.emit('attack_player', player.id);
                            }}
                            className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-1 rounded border border-rose-500/30 hover:bg-rose-500/30"
                          >
                            偷袭
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              if (socket) {
                                socket.emit('greet', player.id);
                                setToastMessage(`已向 ${player.name} 发送传音！`);
                                setTimeout(() => setToastMessage(null), 3000);
                              }
                            }}
                            className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded border border-cyan-500/30 hover:bg-cyan-500/30"
                          >
                            结交
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion Interact Modal */}
      <AnimatePresence>
        {showCompanionInteractModal && (marriedCompanions?.length > 0 || daoCompanion) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-rose-300 flex items-center">
                  <Heart className="mr-2" size={20} />
                  道侣互动
                </h2>
                <button onClick={() => {
                  setShowCompanionInteractModal(false);
                  setSelectedInteractCompanionId(null);
                }} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              {(() => {
                const companionsList = marriedCompanions?.length > 0 ? marriedCompanions : (daoCompanion ? [daoCompanion] : []);
                const selectedCompanion = selectedInteractCompanionId 
                  ? companionsList.find(c => c.id === selectedInteractCompanionId) 
                  : null;

                if (!selectedCompanion) {
                  return (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-400 mb-4">请选择要互动的道侣：</p>
                      {companionsList.map(comp => (
                        <div key={comp.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50 flex justify-between items-center">
                          <div>
                            <div className="font-bold text-rose-300">{comp.name}</div>
                            <div className="text-xs text-slate-400">好感度: {comp.favorability || 0} | 修为: {CULTIVATION_LEVELS[comp.levelIndex || 0]?.name || '炼气初期'}</div>
                          </div>
                          <div className="flex space-x-2">
                            {daoCompanion?.id !== comp.id && (
                              <button 
                                onClick={() => setDaoCompanion(comp)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                              >
                                设为主修
                              </button>
                            )}
                            <button 
                              onClick={() => setSelectedInteractCompanionId(comp.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                            >
                              互动
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`确定要与 ${comp.name} 解除道侣关系吗？`)) {
                                  setMarriedCompanions(marriedCompanions.filter(c => c.id !== comp.id));
                                  if (daoCompanion?.id === comp.id) {
                                    setDaoCompanion(null);
                                  }
                                  setToastMessage(`已与 ${comp.name} 解除道侣关系。`);
                                  setTimeout(() => setToastMessage(null), 3000);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-slate-500 border border-slate-700 hover:text-rose-400 hover:border-rose-500/30"
                            >
                              解除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                return (
                  <>
                    <button 
                      onClick={() => setSelectedInteractCompanionId(null)}
                      className="text-xs text-slate-400 hover:text-white mb-4 flex items-center"
                    >
                      ← 返回列表
                    </button>
                    <div className="mb-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">好感度</span>
                        <span className="text-sm font-bold text-rose-400">{selectedCompanion.favorability || 0}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">修为</span>
                        <span className="text-sm font-bold text-purple-400">{CULTIVATION_LEVELS[selectedCompanion.levelIndex || 0]?.name || '炼气初期'}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">今日互动</span>
                        <span className="text-sm font-bold text-cyan-400">{(selectedCompanion.lastInteractionDate === format(new Date(), 'yyyy-MM-dd') ? selectedCompanion.dailyInteractions : 0) || 0} / 3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">关系境界</span>
                        <span className="text-sm font-bold text-amber-400">
                          {(selectedCompanion.favorability || 0) >= 500 ? '双修伴侣' : (selectedCompanion.favorability || 0) >= 200 ? '道侣' : (selectedCompanion.favorability || 0) >= 50 ? '知己' : '普通'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button 
                        disabled={(selectedCompanion.favorability || 0) < 500 || (selectedCompanion.lastInteractionDate === format(new Date(), 'yyyy-MM-dd') ? (selectedCompanion.dailyInteractions || 0) : 0) >= 3}
                        onClick={() => {
                          const res = interactWithCompanion('dual_cultivate', selectedCompanion.id);
                          setToastMessage(res.message);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className={`w-full p-4 rounded-2xl border transition-colors flex items-center justify-between ${(selectedCompanion.favorability || 0) < 500 || (selectedCompanion.lastInteractionDate === format(new Date(), 'yyyy-MM-dd') ? (selectedCompanion.dailyInteractions || 0) : 0) >= 3 ? 'border-slate-700/50 bg-slate-800/50 cursor-not-allowed opacity-50' : 'border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20'}`}
                      >
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${(selectedCompanion.favorability || 0) < 500 || (selectedCompanion.lastInteractionDate === format(new Date(), 'yyyy-MM-dd') ? (selectedCompanion.dailyInteractions || 0) : 0) >= 3 ? 'bg-slate-700/50' : 'bg-rose-900/50'}`}>
                            <Sparkles className={(selectedCompanion.favorability || 0) < 500 || (selectedCompanion.lastInteractionDate === format(new Date(), 'yyyy-MM-dd') ? (selectedCompanion.dailyInteractions || 0) : 0) >= 3 ? 'text-slate-500' : 'text-rose-400'} size={20} />
                          </div>
                          <div className="text-left">
                            <div className={`font-bold ${(selectedCompanion.favorability || 0) < 500 || (selectedCompanion.lastInteractionDate === format(new Date(), 'yyyy-MM-dd') ? (selectedCompanion.dailyInteractions || 0) : 0) >= 3 ? 'text-slate-400' : 'text-rose-300'}`}>双修</div>
                            <div className="text-xs text-slate-400">{(selectedCompanion.favorability || 0) < 500 ? '需达到双修伴侣境界 (500好感度)' : '消耗互动次数，获得大量修为'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">每次增加</div>
                          <div className="text-sm font-bold text-rose-400">1000+ 修为</div>
                        </div>
                      </button>

                      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-emerald-900/50 rounded-xl flex items-center justify-center mr-3">
                            <Package className="text-emerald-400" size={20} />
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-emerald-300">赠礼</div>
                            <div className="text-xs text-slate-400">赠送丹药或灵草，提升好感与修为</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(() => {
                            const giftableItems = [
                              ...Object.entries(materials).map(([id, count]) => ({ id, count, isSkill: false })),
                              ...Array.from(new Set(inventory)).map(id => ({ id, count: inventory.filter(i => i === id).length, isSkill: true }))
                            ].filter(item => item.count > 0);

                            if (giftableItems.length === 0) {
                              return <div className="col-span-2 text-center text-slate-500 text-xs py-2">暂无物品可赠送</div>;
                            }

                            return giftableItems.map(item => {
                              const info = getItemInfo(item.id);
                              return (
                                <button 
                                  key={item.id}
                                  onClick={() => {
                                    const res = interactWithCompanion('gift', selectedCompanion.id, item.id);
                                    setToastMessage(res.message);
                                    setTimeout(() => setToastMessage(null), 3000);
                                  }}
                                  className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-left"
                                >
                                  <div className={`font-bold ${info.color}`}>{info.name}</div>
                                  <div className="text-slate-500">拥有: {item.count}</div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion Modal */}
      <AnimatePresence>
        {showCompanionModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-rose-500/30 rounded-3xl p-6 w-full max-w-sm relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setShowCompanionModal(false)} className="absolute top-4 right-4 text-slate-400 p-1"><X size={20} /></button>
              <h2 className="text-xl font-bold text-rose-300 mb-2 flex items-center">
                <Heart size={20} className="mr-2" /> 寻觅道侣
              </h2>
              <p className="text-xs text-slate-400 mb-6">结为道侣后，可获得双修加成，提升修炼速度。不同道侣有不同的结缘条件。</p>
              
              <div className="space-y-4">
                {DAO_COMPANIONS.map(companion => {
                  const reqLevelIndex = CULTIVATION_LEVELS.findIndex(l => l.name === companion.reqLevel);
                  const currentLevelIndex = levelIndex;
                  
                  const isMarried = marriedCompanions?.some(c => c.id === companion.id);
                  let canMarry = false;
                  let customAction = null;
                  
                  if (companion.id === 'nangongwan') {
                    canMarry = currentLevelIndex >= reqLevelIndex || (currentSectInfo?.name === '掩月宗' && currentLevelIndex >= CULTIVATION_LEVELS.findIndex(l => l.name === '筑基初期'));
                  } else if (companion.id === 'ziling') {
                    const hasZhuyan = (materials['zhuyan_pill'] || 0) > 0;
                    const hasStones = (spiritStones || 0) >= 100000;
                    canMarry = currentLevelIndex >= reqLevelIndex && (hasZhuyan || hasStones);
                    
                    if (!canMarry && currentLevelIndex >= reqLevelIndex && !isMarried) {
                      customAction = (
                        <div className="flex space-x-2 w-full mt-3">
                          <button onClick={() => {
                            if (hasZhuyan) {
                              addMaterial('zhuyan_pill', -1);
                              setDaoCompanion({ id: companion.id, name: companion.name, active: true });
                              setShowCompanionModal(false);
                              setToastMessage(`成功与 ${companion.name} 结为道侣！`);
                              setTimeout(() => setToastMessage(null), 3000);
                            } else {
                              setToastMessage('缺少稀有驻颜丹！');
                              setTimeout(() => setToastMessage(null), 3000);
                            }
                          }} className="flex-1 py-2 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700">赠送驻颜丹</button>
                          <button onClick={() => {
                            if (hasStones) {
                              addSpiritStones(-100000);
                              setDaoCompanion({ id: companion.id, name: companion.name, active: true });
                              setShowCompanionModal(false);
                              setToastMessage(`成功与 ${companion.name} 结为道侣！`);
                              setTimeout(() => setToastMessage(null), 3000);
                            } else {
                              setToastMessage('灵石不足10万！');
                              setTimeout(() => setToastMessage(null), 3000);
                            }
                          }} className="flex-1 py-2 rounded-lg text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700">赠送10万灵石</button>
                        </div>
                      );
                    }
                  } else if (companion.id === 'dongxuaner') {
                    canMarry = currentSectInfo?.name === '黄枫谷' && (sectCompetitionWins || 0) >= 5;
                  } else if (['yinyue', 'yuanyao', 'chenqiaoqian'].includes(companion.id)) {
                    canMarry = unlockedCompanions?.includes(companion.id);
                  } else {
                    canMarry = currentLevelIndex >= reqLevelIndex && (companion.sect === '无' || companion.sect === currentSectInfo?.name);
                  }
                  
                  return (
                    <div key={companion.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-sm font-bold text-rose-200">{companion.name}</h3>
                          <span className="text-[10px] text-slate-500">{companion.sect !== '无' ? companion.sect : '散修'}</span>
                        </div>
                        <span className="text-xs font-medium text-emerald-400">加成: {companion.effect}x</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{companion.desc}</p>
                      <div className="text-[10px] text-amber-500/80 mb-3 bg-amber-500/10 p-2 rounded">
                        结缘条件: {companion.strategy}
                      </div>
                      {isMarried ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-lg text-xs font-bold transition-colors bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-not-allowed"
                        >
                          已结缘
                        </button>
                      ) : customAction ? customAction : (
                        <button
                          onClick={() => {
                            if (canMarry) {
                              setDaoCompanion({ id: companion.id, name: companion.name, active: true });
                              setShowCompanionModal(false);
                              setToastMessage(`成功与 ${companion.name} 结为道侣！`);
                              setTimeout(() => setToastMessage(null), 3000);
                            } else {
                              setToastMessage('未满足结缘条件！');
                              setTimeout(() => setToastMessage(null), 3000);
                            }
                          }}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${canMarry ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30' : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'}`}
                        >
                          {canMarry ? '结为道侣' : '条件未满'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakthrough Effect */}
      <BreakthroughAnimation 
        isOpen={showBreakthroughEffect} 
        levelIndex={levelIndex} 
        levelName={currentLevelName}
        onComplete={() => setShowBreakthroughEffect(false)} 
      />
      <audio id="bgm-audio" src="https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=epic-chinese-orchestra-103292.mp3" preload="auto" />
      
      {/* Quests Modal */}
      <AnimatePresence>
        {combatState && combatState.isOpen && (
        <CombatAnimation
          attackerName={combatState.attackerName}
          defenderName={combatState.defenderName}
          isVictory={combatState.isVictory}
          message={combatState.message}
          loot={combatState.loot}
          onClose={() => setCombatState(null)}
        />
      )}
      {showQuests && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[60] bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 pb-12 max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
                <button 
                  onClick={() => setActiveQuestTab('hall')}
                  className={`text-sm font-bold flex items-center transition-colors whitespace-nowrap ${activeQuestTab === 'hall' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Home size={16} className="mr-1" /> 宗门大殿
                </button>
                {sectStatus !== 'none' && (
                  <>
                    <button 
                      onClick={() => setActiveQuestTab('quests')}
                      className={`text-sm font-bold flex items-center transition-colors whitespace-nowrap ${activeQuestTab === 'quests' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <ScrollText size={16} className="mr-1" /> 宗门任务
                    </button>
                    <button 
                      onClick={() => setActiveQuestTab('competition')}
                      className={`text-sm font-bold flex items-center transition-colors whitespace-nowrap ${activeQuestTab === 'competition' ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Swords size={16} className="mr-1" /> 内门大比
                    </button>
                    <button 
                      onClick={() => setActiveQuestTab('sectWar')}
                      className={`text-sm font-bold flex items-center transition-colors whitespace-nowrap ${activeQuestTab === 'sectWar' ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Shield size={16} className="mr-1" /> 宗门战
                    </button>
                    <button 
                      onClick={() => setActiveQuestTab('members')}
                      className={`text-sm font-bold flex items-center transition-colors whitespace-nowrap ${activeQuestTab === 'members' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <Users size={16} className="mr-1" /> 宗门同门
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setActiveQuestTab('factions')}
                  className={`text-sm font-bold flex items-center transition-colors whitespace-nowrap ${activeQuestTab === 'factions' ? 'text-rose-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Skull size={16} className="mr-1" /> 天下势力
                </button>
                <button 
                  onClick={() => setActiveQuestTab('ranking')}
                  className={`text-sm font-bold flex items-center transition-colors whitespace-nowrap ${activeQuestTab === 'ranking' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Trophy size={16} className="mr-1" /> 宗门排行
                </button>
              </div>
              <button onClick={() => setShowQuests(false)} className="text-slate-400 p-1"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-10">
              {activeQuestTab === 'hall' ? (
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center mb-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                    <h3 className="text-emerald-400 font-bold text-xl mb-1">{currentSectInfo?.name || sect || '散修联盟'}</h3>
                    <p className="text-xs text-slate-400">{currentSectInfo?.desc}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                        <div className="text-xs text-slate-400">宗门威望</div>
                        <div className="text-lg font-bold text-amber-400">{sectPrestige || 1000}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                        <div className="text-xs text-slate-400">宗门底蕴</div>
                        <div className="text-lg font-bold text-sky-400">{sectWealth || 50000}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    {sectStatus === 'none' ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-300 mb-4">你目前是一介散修，无依无靠。是否要拜入宗门？</p>
                        <button 
                          onClick={() => {
                            if (spiritualRoot === 'none' || !spiritualRoot) {
                              setToastMessage('没有灵根，无法加入宗门！');
                              setTimeout(() => setToastMessage(null), 3000);
                              return;
                            }
                            setShowSectSelection(true);
                          }}
                          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
                        >
                          选择宗门
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <span className="text-sm text-slate-300 block">我的身份</span>
                            <span className="text-lg font-bold text-white">
                              {sectPosition === 'patriarch' ? '宗主' : sectPosition === 'elder' ? '长老' : sectPosition === 'core' ? '核心弟子' : sectPosition === 'inner' ? '内门弟子' : '外门弟子'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm text-slate-300 block">宗门贡献</span>
                            <span className="text-lg font-bold text-emerald-400">{sectContribution || 0}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => {
                              const result = claimSectSalary();
                              setToastMessage(result.message);
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            disabled={dailySalaryClaimed}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${dailySalaryClaimed ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
                          >
                            {dailySalaryClaimed ? '已领俸禄' : '领取每日俸禄'}
                          </button>
                          
                          <button 
                            onClick={() => {
                              const result = promoteSectPosition();
                              setToastMessage(result.message);
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
                          >
                            晋升职位
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {(sectPosition === 'elder' || sectPosition === 'patriarch') && (
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                      <h4 className="text-amber-400 font-bold mb-2 flex items-center"><Sparkles size={16} className="mr-1" /> 宗门管理 (高层权限)</h4>
                      <p className="text-xs text-slate-400 mb-3">消耗宗门底蕴，开启全宗增益阵法。</p>
                      <button 
                        onClick={() => {
                          const res = activateSectFormation();
                          if (res.success) {
                            setToastMessage(res.message);
                            setTimeout(() => setToastMessage(null), 3000);
                          } else {
                            setToastMessage(res.message);
                            setTimeout(() => setToastMessage(null), 3000);
                          }
                        }}
                        disabled={!!(sectBuff && sectBuff.expiresAt > Date.now())}
                        className={`w-full py-2 border rounded-lg text-sm font-bold transition-all ${
                          sectBuff && sectBuff.expiresAt > Date.now() 
                            ? 'bg-amber-900/50 border-amber-500/20 text-amber-500/50 cursor-not-allowed' 
                            : 'bg-amber-600/20 hover:bg-amber-600/40 border-amber-500/50 text-amber-400'
                        }`}
                      >
                        {sectBuff && sectBuff.expiresAt > Date.now() ? '护宗大阵运转中' : '开启护宗大阵 (消耗 10000 底蕴)'}
                      </button>
                    </div>
                  )}
                </div>
              ) : activeQuestTab === 'quests' ? (
                <>
                  {/* NPC Messages */}
              {sectStatus === 'joined' && (
                <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center mr-2 border border-blue-500/30">
                      <span className="text-[10px] text-blue-300">师姐</span>
                    </div>
                    <span className="text-xs text-slate-300 font-medium">热心师姐</span>
                    <span className="text-[10px] text-slate-500 ml-auto">刚刚</span>
                  </div>
                  <p className="text-xs text-slate-400 italic">"师弟/师妹，今日修炼切勿懈怠，记得多饮灵泉，完成日课方能稳固道心。"</p>
                </div>
              )}
              
              {/* Main Quests */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">宗门必做</h3>
              {quests.filter(q => q.category === 'main').map(quest => {
                const isCompleted = quest.completed;
                const canClaim = quest.progress >= quest.target && !isCompleted;
                
                return (
                  <div key={quest.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isCompleted ? 'bg-slate-800/30 border-slate-800' : canClaim ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium mb-1 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{quest.title}</h3>
                      {quest.desc && <p className="text-[10px] text-slate-400 mb-2">{quest.desc}</p>}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isCompleted ? 'bg-slate-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-12 text-right">
                          {Math.min(quest.progress, quest.target)}/{quest.target}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isCompleted ? (
                        <div className="flex items-center text-slate-500 text-xs">
                          <CheckCircle2 size={14} className="mr-1" /> 已领取
                        </div>
                      ) : canClaim ? (
                        <button 
                          onClick={() => claimQuestReward(quest.id)}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs rounded-full shadow-lg shadow-indigo-500/20 transition-colors flex items-center"
                        >
                          领取 <Gem size={12} className="ml-1 mr-0.5" /> {quest.reward}
                        </button>
                      ) : (
                        <div className="flex items-center text-xs text-slate-500">
                          奖励 <Gem size={12} className="ml-1 mr-0.5 text-cyan-500/50" /> {quest.reward}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Optional Quests */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">历练与冥想 (可选)</h3>
              {quests.filter(q => q.category === 'optional').map(quest => {
                const isCompleted = quest.completed;
                const canClaim = quest.progress >= quest.target && !isCompleted;
                
                return (
                  <div key={quest.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isCompleted ? 'bg-slate-800/30 border-slate-800' : canClaim ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium mb-1 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{quest.title}</h3>
                      {quest.desc && <p className="text-[10px] text-slate-400 mb-2">{quest.desc}</p>}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isCompleted ? 'bg-slate-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-12 text-right">
                          {Math.min(quest.progress, quest.target)}/{quest.target}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isCompleted ? (
                        <div className="flex items-center text-slate-500 text-xs">
                          <CheckCircle2 size={14} className="mr-1" /> 已领取
                        </div>
                      ) : canClaim ? (
                        <button 
                          onClick={() => claimQuestReward(quest.id)}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs rounded-full shadow-lg shadow-indigo-500/20 transition-colors flex items-center"
                        >
                          领取 <Gem size={12} className="ml-1 mr-0.5" /> {quest.reward}
                        </button>
                      ) : (
                        <div className="flex items-center text-xs text-slate-500">
                          奖励 <Gem size={12} className="ml-1 mr-0.5 text-cyan-500/50" /> {quest.reward}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Side Quests */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">支线任务</h3>
              {quests.filter(q => q.category === 'side').map(quest => {
                const isCompleted = quest.completed;
                const canClaim = quest.progress >= quest.target && !isCompleted;
                
                return (
                  <div key={quest.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isCompleted ? 'bg-slate-800/30 border-slate-800' : canClaim ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium mb-1 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{quest.title}</h3>
                      {quest.desc && <p className="text-[10px] text-slate-400 mb-2">{quest.desc}</p>}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isCompleted ? 'bg-slate-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono w-12 text-right">
                          {Math.min(quest.progress, quest.target)}/{quest.target}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isCompleted ? (
                        <div className="flex items-center text-slate-500 text-xs">
                          <CheckCircle2 size={14} className="mr-1" /> 已领取
                        </div>
                      ) : canClaim ? (
                        <button 
                          onClick={() => claimQuestReward(quest.id)}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs rounded-full shadow-lg shadow-indigo-500/20 transition-colors flex items-center"
                        >
                          领取 <Gem size={12} className="ml-1 mr-0.5" /> {quest.reward}
                        </button>
                      ) : (
                        <div className="flex items-center text-xs text-slate-500">
                          奖励 <Gem size={12} className="ml-1 mr-0.5 text-cyan-500/50" /> {quest.reward}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Sect Missions */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-6 mb-2">宗门悬赏</h3>
              {sectMissions?.map(mission => {
                const isCompleted = mission.completed;
                const canClaim = levelIndex >= mission.reqLevelIndex && !isCompleted;
                const diffColor = mission.difficulty === 'easy' ? 'text-green-400' : mission.difficulty === 'normal' ? 'text-blue-400' : 'text-purple-400';
                const diffText = mission.difficulty === 'easy' ? '简单' : mission.difficulty === 'normal' ? '普通' : '困难';
                
                return (
                  <div key={mission.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${isCompleted ? 'bg-slate-800/30 border-slate-800' : canClaim ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${mission.difficulty === 'easy' ? 'bg-green-900/30 border-green-500/30 text-green-400' : mission.difficulty === 'normal' ? 'bg-blue-900/30 border-blue-500/30 text-blue-400' : 'bg-purple-900/30 border-purple-500/30 text-purple-400'} mr-2`}>
                          {diffText}
                        </span>
                        <h3 className={`text-sm font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{mission.title}</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-2">{mission.desc}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                        <span className="flex items-center"><Gem size={10} className="mr-1 text-cyan-500" /> {mission.rewardSpiritStones}</span>
                        <span className="flex items-center"><Star size={10} className="mr-1 text-amber-500" /> {mission.rewardContribution} 贡献</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isCompleted ? (
                        <div className="flex items-center text-slate-500 text-xs">
                          <CheckCircle2 size={14} className="mr-1" /> 已完成
                        </div>
                      ) : canClaim ? (
                        <button 
                          onClick={() => {
                            const res = claimSectMissionReward(mission.id);
                            setToastMessage(res.message);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-colors"
                        >
                          执行
                        </button>
                      ) : (
                        <div className="text-xs text-red-400/70 text-center">
                          境界不足
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </>
              ) : activeQuestTab === 'ranking' ? (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center mb-4">
                    <h3 className="text-amber-400 font-bold mb-1">天下宗门威望榜</h3>
                    <p className="text-[10px] text-slate-400">各派实力与底蕴之争</p>
                  </div>
                  
                  <div className="space-y-2">
                    {(() => {
                      // Generate dynamic leaderboard
                      const otherSects = SECTS.filter(s => s.id !== sect).map((s, i) => {
                        // Seeded random prestige based on sect id length and index
                        const basePrestige = 100000 - (i * 2000) - (s.id.length * 500);
                        return {
                          rank: 0,
                          name: s.name,
                          prestige: Math.max(1000, basePrestige),
                          isMySect: false
                        };
                      });
                      
                      const mySectEntry = {
                        rank: 0,
                        name: currentSectInfo?.name || '散修联盟',
                        prestige: sectPrestige || 1000,
                        isMySect: true
                      };
                      
                      const allSects = [...otherSects, mySectEntry]
                        .sort((a, b) => b.prestige - a.prestige)
                        .slice(0, 50); // Show top 50
                        
                      return allSects.map((s, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${s.isMySect ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-900/50 border-slate-700/50'}`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-500 text-slate-900' : idx === 1 ? 'bg-slate-300 text-slate-900' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                              {idx + 1}
                            </div>
                            <div className={`text-sm font-bold ${s.isMySect ? 'text-amber-300' : 'text-slate-200'}`}>{s.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-amber-400 font-bold">{s.prestige.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-500">威望</div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ) : activeQuestTab === 'sectWar' ? (
                <div className="space-y-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center mb-4">
                    <h3 className="text-purple-400 font-bold mb-1">宗门战 / 外战</h3>
                    <p className="text-[10px] text-slate-400">挑战他派天骄，扬我宗门威名</p>
                    <div className="mt-2 text-sm text-slate-300">
                      外战胜场: <span className="text-purple-400 font-bold">{interSectWins || 0}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {sectNpcs.filter(n => n.sectId !== sect).slice(0, 10).map(npc => {
                      const oppSect = SECTS.find(s => s.id === npc.sectId)?.name || '散修';
                      return (
                        <div key={npc.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-bold text-rose-300 mr-2">{npc.name}</span>
                                <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{oppSect}</span>
                              </div>
                              <div className="text-xs text-slate-400 mt-1">境界: {npc.level}</div>
                              <div className="text-xs text-slate-400 mt-1">
                                好感度: <span className={`${(npc.favorability || 0) < 0 ? 'text-red-400' : 'text-pink-400'}`}>{npc.favorability || 0}</span> ({
                                  npc.relationship === 'close_friend' ? '生死之交' :
                                  npc.relationship === 'close' ? '莫逆之交' :
                                  npc.relationship === 'friend' ? '至交好友' :
                                  npc.relationship === 'acquaintance' ? '泛泛之交' : 
                                  npc.relationship === 'enemy' ? '仇深似海' : '素昧平生'
                                })
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const result = challengeOtherSect(npc.id);
                                setToastMessage(result.message);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all"
                            >
                              挑战
                            </button>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <button
                              onClick={() => {
                                const result = useStore.getState().interactWithNpc?.(npc.id, 'chat');
                                if (result && result.message) setToastMessage(result.message);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition-colors"
                            >
                              论道
                            </button>
                            <button
                              onClick={() => {
                                const result = useStore.getState().interactWithNpc?.(npc.id, 'gift');
                                if (result && result.message) setToastMessage(result.message);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="flex-1 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/30 text-xs font-bold rounded-lg transition-colors"
                            >
                              赠礼 (100灵石)
                            </button>
                            <button
                              onClick={() => {
                                const result = useStore.getState().interactWithNpc?.(npc.id, 'spar');
                                if (result && result.message) setToastMessage(result.message);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="flex-1 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold rounded-lg transition-colors"
                            >
                              切磋
                            </button>
                            <button
                              onClick={() => {
                                const result = useStore.getState().interactWithNpc?.(npc.id, 'rob');
                                if (result) {
                                  setCombatState({
                                    isOpen: true,
                                    attackerName: playerName,
                                    defenderName: npc.name,
                                    isVictory: result.success || false,
                                    message: result.message,
                                    loot: result.loot
                                  });
                                }
                              }}
                              className="flex-1 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg transition-colors"
                            >
                              杀人夺宝
                            </button>
                            <button
                              onClick={() => {
                                const result = useStore.getState().interactWithNpc?.(npc.id, 'snatch');
                                if (result) {
                                  setCombatState({
                                    isOpen: true,
                                    attackerName: playerName,
                                    defenderName: npc.name,
                                    isVictory: result.success || false,
                                    message: result.message,
                                    loot: result.loot
                                  });
                                }
                              }}
                              className="flex-1 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-lg transition-colors"
                            >
                              夺取机缘
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              
              ) : activeQuestTab === 'factions' ? (
                <div className="space-y-4">
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center mb-4">
                    <h3 className="text-rose-400 font-bold mb-1">天下势力</h3>
                    <p className="text-[10px] text-slate-400">修仙界弱肉强食，实力为尊。若实力足够，可覆灭宗门夺取底蕴。</p>
                  </div>
                  
                  {useStore.getState().mySect ? (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-purple-300 font-bold text-lg">{useStore.getState().mySect?.name}</h3>
                        <span className="text-xs bg-purple-800/50 text-purple-200 px-2 py-1 rounded">我的宗门</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-3">
                        <div>弟子数量: <span className="text-purple-400">{useStore.getState().mySect?.disciples}</span></div>
                        <div>宗门底蕴: <span className="text-purple-400">{useStore.getState().mySect?.power}</span></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const result = useStore.getState().recruitDisciples?.('normal');
                            if (result) {
                              setToastMessage(result.message);
                              setTimeout(() => setToastMessage(null), 3000);
                            }
                          }}
                          className="w-full py-2 bg-purple-600/40 hover:bg-purple-600/60 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          凡俗寻仙 (1000灵石)
                        </button>
                        <button
                          onClick={() => {
                            const result = useStore.getState().recruitDisciples?.('grand');
                            if (result) {
                              setToastMessage(result.message);
                              setTimeout(() => setToastMessage(null), 3000);
                            }
                          }}
                          className="w-full py-2 bg-amber-600/40 hover:bg-amber-600/60 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          升仙大会 (10000灵石)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-4 text-center">
                      <p className="text-sm text-slate-400 mb-3">你尚未开宗立派</p>
                      <button
                        onClick={() => setShowCreateSectModal(true)}
                        className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-xs font-bold rounded-lg transition-colors"
                      >
                        创立宗门 (消耗10000灵石)
                      </button>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {SECTS.filter(s => !useStore.getState().destroyedSects?.includes(s.id) && !useStore.getState().conqueredSects?.includes(s.id)).map(s => (
                      <div key={s.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="flex items-center">
                              <span className="text-sm font-bold text-rose-300 mr-2">{s.name}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">宗门</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {s.desc}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => {
                              const result = useStore.getState().annihilateSect?.(s.id);
                              if (result) {
                                setCombatState({
                                  isOpen: true,
                                  attackerName: playerName,
                                  defenderName: s.name,
                                  isVictory: result.success || false,
                                  message: result.message,
                                  loot: result.loot
                                });
                              }
                            }}
                            className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg transition-colors flex items-center justify-center"
                          >
                            <Skull size={14} className="mr-1" /> 覆灭宗门
                          </button>
                          <button
                            onClick={() => {
                              const result = useStore.getState().conquerSect?.(s.id);
                              if (result) {
                                setCombatState({
                                  isOpen: true,
                                  attackerName: playerName,
                                  defenderName: s.name,
                                  isVictory: result.success || false,
                                  message: result.message,
                                  loot: result.loot
                                });
                              }
                            }}
                            className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-xs font-bold rounded-lg transition-colors flex items-center justify-center mt-2"
                          >
                            <Shield size={14} className="mr-1" /> 收服宗门
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
) : activeQuestTab === 'members' ? (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center mb-4">
                    <h3 className="text-blue-400 font-bold mb-1">宗门同门</h3>
                    <p className="text-[10px] text-slate-400">结交同门，共探仙途</p>
                  </div>
                  
                  <div className="space-y-3">
                    {sectNpcs.filter(n => n.sectId === sect).map(npc => (
                      <div key={npc.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="flex items-center">
                              <span className="text-sm font-bold text-blue-300 mr-2">{npc.name}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-700 rounded-full text-slate-300">{npc.level}</span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              好感度: <span className={`${(npc.favorability || 0) < 0 ? 'text-red-400' : 'text-pink-400'}`}>{npc.favorability || 0}</span> ({
                                npc.relationship === 'close_friend' ? '生死之交' :
                                npc.relationship === 'close' ? '莫逆之交' :
                                npc.relationship === 'friend' ? '至交好友' :
                                npc.relationship === 'acquaintance' ? '泛泛之交' : 
                                npc.relationship === 'enemy' ? '仇深似海' : '素昧平生'
                              })
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => {
                              const result = useStore.getState().interactWithNpc?.(npc.id, 'chat');
                              if (result && result.message) setToastMessage(result.message);
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-lg transition-colors"
                          >
                            论道
                          </button>
                          <button
                            onClick={() => {
                              const result = useStore.getState().interactWithNpc?.(npc.id, 'gift');
                              if (result && result.message) setToastMessage(result.message);
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            className="flex-1 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/30 text-xs font-bold rounded-lg transition-colors"
                          >
                            赠礼 (100灵石)
                          </button>
                          <button
                            onClick={() => {
                              const result = useStore.getState().interactWithNpc?.(npc.id, 'spar');
                              if (result && result.message) setToastMessage(result.message);
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            className="flex-1 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold rounded-lg transition-colors"
                          >
                            切磋
                          </button>
                          <button
                            onClick={() => {
                              const result = useStore.getState().interactWithNpc?.(npc.id, 'rob');
                              if (result) {
                                setCombatState({
                                  isOpen: true,
                                  attackerName: playerName,
                                  defenderName: npc.name,
                                  isVictory: result.success || false,
                                  message: result.message,
                                  loot: result.loot
                                });
                              }
                            }}
                            className="flex-1 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold rounded-lg transition-colors"
                          >
                            杀人夺宝
                          </button>
                          <button
                            onClick={() => {
                              const result = useStore.getState().interactWithNpc?.(npc.id, 'snatch');
                              if (result) {
                                setCombatState({
                                  isOpen: true,
                                  attackerName: playerName,
                                  defenderName: npc.name,
                                  isVictory: result.success || false,
                                  message: result.message,
                                  loot: result.loot
                                });
                              }
                            }}
                            className="flex-1 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 text-xs font-bold rounded-lg transition-colors"
                          >
                            夺取机缘
                          </button>
                        </div>
                      </div>
                    ))}
                    {sectNpcs.filter(n => n.sectId === sect).length === 0 && (
                      <div className="text-center text-slate-500 text-sm py-8">
                        宗门内暂无其他知名修士。
                      </div>
                    )}
                  </div>
                </div>
              ) : activeQuestTab === 'competition' ? (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center mb-4">
                    <h3 className="text-red-400 font-bold mb-1">宗门大比</h3>
                    <p className="text-[10px] text-slate-400">与其他门派天骄切磋，扬我宗门威名</p>
                  </div>
                  
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-slate-300">当前胜场</span>
                      <span className="text-lg font-bold text-red-400">{sectCompetitionWins || 0}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-4">
                      大比奖励：胜者可获得 500 宗门贡献、1000 灵石，并有几率获得珍稀材料。
                    </div>
                    <button 
                      onClick={() => {
                        if (spiritStones < 100) {
                          setToastMessage('灵石不足，无法报名参加大比！');
                          setTimeout(() => setToastMessage(null), 3000);
                          return;
                        }
                        useStore.getState().addSpiritStones(-100);
                        
                        // Pick a random opponent
                        const opponent = sectNpcs[Math.floor(Math.random() * sectNpcs.length)];
                        const opponentSect = SECTS.find(s => s.id === opponent.sectId)?.name || '散修';
                        
                        // Calculate win chance based on cultivation difference
                        const myCultivation = totalAmount;
                        const oppCultivation = opponent.cultivation;
                        let winChance = 0.5;
                        if (myCultivation > oppCultivation * 5) winChance = 0.99;
                        else if (myCultivation > oppCultivation * 2) winChance = 0.90;
                        else if (myCultivation > oppCultivation) winChance = 0.65;
                        else if (myCultivation < oppCultivation / 5) winChance = 0.01;
                        else if (myCultivation < oppCultivation / 2) winChance = 0.1;
                        else winChance = 0.35;
                        
                        // Apply sect bonus if applicable
                        const mySectInfo = SECTS.find(s => s.id === sect);
                        if (mySectInfo?.bonusType === 'combat_win_rate') {
                          winChance += mySectInfo.bonusValue;
                        }
                        
                        if (Math.random() < winChance) {
                          useStore.getState().winSectCompetition();
                          useStore.getState().addSectContribution(500);
                          useStore.getState().addSpiritStones(1000);
                          
                          let extraReward = '';
                          if (Math.random() < 0.3) {
                            useStore.getState().addMaterial('rare_herb', 1);
                            extraReward = '，并获得珍稀灵草x1';
                          } else if (Math.random() < 0.3) {
                            useStore.getState().addMaterial('profound_iron', 1);
                            extraReward = '，并获得玄铁精x1';
                          }
                          
                          setToastMessage(`你击败了【${opponentSect}】的【${opponent.name}】(${opponent.level})！大比获胜！获得500贡献、1000灵石${extraReward}！`);
                        } else {
                          setToastMessage(`你遭遇了【${opponentSect}】的【${opponent.name}】(${opponent.level})，大比落败，技不如人，还需努力修炼！`);
                        }
                        setTimeout(() => setToastMessage(null), 4000);
                      }}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center"
                    >
                      <Swords size={18} className="mr-2" /> 报名参赛 (100灵石)
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Modal */}
      <AnimatePresence>
        {showTitleModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center space-x-2">
                  <Trophy className="text-amber-400" />
                  <h2 className="text-lg font-medium text-white">修仙称号</h2>
                </div>
                <button onClick={() => setShowTitleModal(false)} className="text-slate-400 p-1"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-4">
                {unlockedTitles && unlockedTitles.length > 0 ? (
                  unlockedTitles.map((title, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${currentTitle === title ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                      <div className="flex items-center space-x-3">
                        <Trophy size={16} className={currentTitle === title ? 'text-amber-400' : 'text-slate-500'} />
                        <span className={`text-sm font-bold ${currentTitle === title ? 'text-amber-400' : 'text-slate-300'}`}>{title}</span>
                      </div>
                      {currentTitle === title ? (
                        <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">已佩戴</span>
                      ) : (
                        <button 
                          onClick={() => {
                            setCurrentTitle(title);
                            setShowTitleModal(false);
                          }}
                          className="text-xs text-slate-300 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors"
                        >
                          佩戴
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-8 text-sm">
                    暂未解锁任何称号。继续修炼吧！
                  </div>
                )}
                
                {currentTitle && (
                  <button 
                    onClick={() => {
                      setCurrentTitle(null);
                      setShowTitleModal(false);
                    }}
                    className="w-full mt-4 py-2 text-xs text-slate-400 border border-slate-700 rounded-xl hover:bg-slate-700/50 transition-colors"
                  >
                    卸下当前称号
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fate Modal */}
      <AnimatePresence>
        {showFateModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center space-x-2">
                  <Compass className="text-purple-400" />
                  <h2 className="text-lg font-medium text-white">今日天机</h2>
                </div>
                <button onClick={() => setShowFateModal(false)} className="text-slate-400 p-1"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-4">
                <p className="text-sm text-slate-400 mb-4">道友，天机不可泄露，今日你只能选择一条命运轨迹...</p>
                {dailyFates && dailyFates.length > 0 ? (
                  dailyFates.map((fate) => (
                    <button 
                      key={fate.id}
                      onClick={() => {
                        selectFate(fate.id);
                        setShowFateModal(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-colors ${fate.type === 'fortune' ? 'bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/40' : fate.type === 'disaster' ? 'bg-rose-900/20 border-rose-500/30 hover:bg-rose-900/40' : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/40'}`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${fate.type === 'fortune' ? 'bg-amber-500/20 text-amber-400' : fate.type === 'disaster' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {fate.type === 'fortune' ? <Sparkles size={16} /> : fate.type === 'disaster' ? <Flame size={16} /> : <Compass size={16} />}
                        </div>
                        <span className={`text-sm font-bold ${fate.type === 'fortune' ? 'text-amber-400' : fate.type === 'disaster' ? 'text-rose-400' : 'text-blue-400'}`}>{fate.title}</span>
                      </div>
                      <p className="text-xs text-slate-300">{fate.desc}</p>
                    </button>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-8 text-sm">
                    今日天机尚未生成，请稍后再试。
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explore Modal */}
      <AnimatePresence>
        {showExploreModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-purple-500/30 rounded-3xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center space-x-2">
                  <Mountain className="text-purple-400" />
                  <h2 className="text-lg font-medium text-white">秘境探索</h2>
                </div>
                <button onClick={() => { setShowExploreModal(false); setExploreResult(null); }} className="text-slate-400 p-1"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide pb-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-slate-300">
                    当前区域：<span className="text-purple-300 font-bold">{REGIONS.find(r => r.id === currentRegion)?.name || currentRegion}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    今日已探索：{useStore.getState().realmExplorationsToday}/10 次
                  </p>
                </div>

                {exploreResult ? (
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-purple-500/50 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                      {exploreResult.type === 'monster' || exploreResult.type === 'combat' ? <Swords size={32} className="text-rose-400" /> : <Sparkles size={32} className="text-amber-400" />}
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${exploreResult.type === 'monster' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {exploreResult.type === 'monster' ? '遭遇妖兽！' : exploreResult.type === 'hidden_cave' ? '奇遇！' : '探索收获'}
                    </h3>
                    <p className="text-sm text-slate-300 mb-6">
                      {exploreResult.type === 'monster' ? `你遭遇了强大的妖兽，损失了 ${exploreResult.penalty * 100}% 的修为。` : 
                       exploreResult.type === 'hidden_cave' ? exploreResult.reward :
                       exploreResult.type === 'pill' ? `获得丹药：${SHOP_ITEMS.find(i => i.id === exploreResult.itemId)?.name || '未知丹药'} x${exploreResult.amount}` :
                       exploreResult.type === 'skill' ? `获得功法：${SHOP_ITEMS.find(i => i.id === exploreResult.itemId)?.name || '未知功法'}` :
                       exploreResult.type === 'stone' ? `获得灵石 x${exploreResult.amount}` :
                       exploreResult.type === 'inheritance' ? exploreResult.reward :
                       exploreResult.type === 'material' ? `获得材料：${SHOP_ITEMS.find(i => i.id === exploreResult.itemId)?.name || exploreResult.itemId} x${exploreResult.amount}` :
                       `获得材料：${SHOP_ITEMS.find(i => i.id === exploreResult.type)?.name || exploreResult.type} x${exploreResult.amount}`}
                    </p>
                    <button 
                      onClick={() => setExploreResult(null)}
                      className="w-full py-2 bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded-xl font-bold text-sm hover:bg-purple-500/30"
                    >
                      继续探索
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        const res = exploreRealm('low');
                        setExploreResult(res);
                        if (res.type === 'combat') {
                          setCombatState({
                            isOpen: true,
                            attackerName: playerName,
                            defenderName: res.enemyName,
                            isVictory: res.isVictory,
                            message: res.message,
                            loot: res.loot
                          });
                        }
                      }}
                      disabled={useStore.getState().realmExplorationsToday >= 3}
                      className={`w-full p-4 rounded-2xl border transition-colors flex items-center justify-between ${useStore.getState().realmExplorationsToday >= 3 ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed' : 'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/40'}`}
                    >
                      <div className="text-left">
                        <div className="font-bold text-emerald-400">外围探索 (低风险)</div>
                        <div className="text-xs text-slate-400">可能获得普通材料、少量灵石</div>
                      </div>
                      <div className="text-emerald-500"><Compass size={20} /></div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        const res = exploreRealm('mid');
                        setExploreResult(res);
                        if (res.type === 'combat') {
                          setCombatState({
                            isOpen: true,
                            attackerName: playerName,
                            defenderName: res.enemyName,
                            isVictory: res.isVictory,
                            message: res.message,
                            loot: res.loot
                          });
                        }
                      }}
                      disabled={useStore.getState().realmExplorationsToday >= 3}
                      className={`w-full p-4 rounded-2xl border transition-colors flex items-center justify-between ${useStore.getState().realmExplorationsToday >= 3 ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed' : 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/40'}`}
                    >
                      <div className="text-left">
                        <div className="font-bold text-blue-400">深入腹地 (中风险)</div>
                        <div className="text-xs text-slate-400">可能获得珍稀材料、功法、丹药</div>
                      </div>
                      <div className="text-blue-500"><Compass size={20} /></div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        const res = exploreRealm('high');
                        setExploreResult(res);
                        if (res.type === 'combat') {
                          setCombatState({
                            isOpen: true,
                            attackerName: playerName,
                            defenderName: res.enemyName,
                            isVictory: res.isVictory,
                            message: res.message,
                            loot: res.loot
                          });
                        }
                      }}
                      disabled={useStore.getState().realmExplorationsToday >= 3}
                      className={`w-full p-4 rounded-2xl border transition-colors flex items-center justify-between ${useStore.getState().realmExplorationsToday >= 3 ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed' : 'bg-rose-900/20 border-rose-500/30 hover:bg-rose-900/40'}`}
                    >
                      <div className="text-left">
                        <div className="font-bold text-rose-400">禁地寻宝 (高风险)</div>
                        <div className="text-xs text-slate-400">极品机缘、上古传承，伴随陨落风险</div>
                      </div>
                      <div className="text-rose-500"><Compass size={20} /></div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chest Modal */}
      <AnimatePresence>
        {showChestModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden items-center text-center">
              <button onClick={() => { setShowChestModal(false); setChestReward(null); }} className="absolute top-4 right-4 text-slate-400 p-1"><X size={20} /></button>
              
              <PackageOpen size={64} className="text-amber-400 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">灵宝箱</h2>
              <p className="text-sm text-slate-400 mb-6">你拥有 <span className="text-amber-400 font-bold">{chests}</span> 个灵宝箱，开启可能获得功法、法宝、灵石等机缘。</p>
              
              {chestReward ? (
                <div className="mb-6 p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl w-full animate-pulse">
                  <p className="text-sm text-amber-300 mb-2">恭喜获得机缘！</p>
                  <p className="text-lg font-bold text-amber-400">{chestReward.name}</p>
                </div>
              ) : null}

              <button 
                onClick={() => {
                  const reward = openChest();
                  if (reward) setChestReward(reward);
                }}
                disabled={chests <= 0}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${chests > 0 ? 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
              >
                {chests > 0 ? '开启宝箱' : '暂无宝箱'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills & Artifacts Modal */}
      <AnimatePresence>
        {showSkillsModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center space-x-2">
                  <BookMarked className="text-indigo-400" />
                  <h2 className="text-lg font-medium text-white">功法与法宝</h2>
                </div>
                <button onClick={() => setShowSkillsModal(false)} className="text-slate-400 p-1"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pb-4">
                {/* Skills Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center"><ScrollText size={14} className="mr-1 text-indigo-400"/> 已学功法 ({equippedSkills.length}/3)</h3>
                  {skills.length > 0 ? (
                    <div className="space-y-2">
                      {skills.map(skillId => {
                        const isEquipped = equippedSkills.includes(skillId);
                        const proficiency = skillProficiency[skillId] || 0;
                        // Mock skill details for now
                        const skillInfo = GAME_SKILLS.find(s => s.id === skillId);
                        const skillName = skillInfo?.name || '未知功法';
                        const skillDesc = skillInfo?.desc || '神秘效果';
                        return (
                          <div key={skillId} className={`flex flex-col p-3 rounded-xl border transition-colors ${isEquipped ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className={`text-sm font-bold ${isEquipped ? 'text-indigo-400' : 'text-slate-300'}`}>{skillName}</div>
                                <div className="text-[10px] text-slate-400">{skillDesc}</div>
                              </div>
                              {isEquipped ? (
                                <button onClick={() => unequipSkill(skillId)} className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">卸下</button>
                              ) : (
                                <button onClick={() => equipSkill(skillId)} disabled={equippedSkills.length >= 3} className={`text-xs px-2 py-1 rounded ${equippedSkills.length >= 3 ? 'bg-slate-700 text-slate-500' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}`}>运转</button>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>熟练度: {proficiency}%</span>
                              <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${proficiency}%` }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">暂未习得任何功法...</div>
                  )}
                </div>

                {/* Artifacts Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center"><Gem size={14} className="mr-1 text-amber-400"/> 拥有法宝 ({equippedArtifacts.length}/1)</h3>
                  {artifacts.length > 0 ? (
                    <div className="space-y-2">
                      {artifacts.map((artifactId, index) => {
                        const isEquipped = equippedArtifacts.includes(artifactId);
                        const level = artifactLevels[artifactId] || 1;
                        // Mock artifact details for now
                        const artifactName = artifactId === 'julian_array' ? '聚灵阵' : artifactId === 'ancient_sword' ? '上古残剑' : artifactId === 'artifact_flying_sword' ? '青锋剑' : artifactId === 'artifact_shield' ? '玄铁盾' : '未知法宝';
                        const artifactDesc = artifactId === 'julian_array' ? `饮水修为 +${30 + (level-1)*10}%` : artifactId === 'ancient_sword' ? `秘境历练灵石收益 +${20 + (level-1)*5}%` : '神秘效果';
                        return (
                          <div key={`${artifactId}-${index}`} className={`flex flex-col p-3 rounded-xl border transition-colors ${isEquipped ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className={`text-sm font-bold ${isEquipped ? 'text-amber-400' : 'text-slate-300'}`}>{artifactName} <span className="text-xs text-amber-500/70 ml-1">Lv.{level}</span></div>
                                <div className="text-[10px] text-slate-400">{artifactDesc}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {level < 5 && (
                                  <button 
                                    onClick={() => {
                                      if (spiritStones >= level * 10) {
                                        useStore.getState().addSpiritStones(-(level * 10));
                                        upgradeArtifact(artifactId);
                                        setToastMessage(`祭炼成功！消耗 ${level * 10} 灵石`);
                                        setTimeout(() => setToastMessage(null), 2000);
                                      } else {
                                        setToastMessage('灵石不足！');
                                        setTimeout(() => setToastMessage(null), 2000);
                                      }
                                    }}
                                    className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-1 rounded border border-amber-500/30"
                                  >
                                    祭炼 ({level * 10}灵石)
                                  </button>
                                )}
                                {isEquipped ? (
                                  <button onClick={() => unequipArtifact(artifactId)} className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">收起</button>
                                ) : (
                                  <button onClick={() => equipArtifact(artifactId)} disabled={equippedArtifacts.length >= 1} className={`text-xs px-2 py-1 rounded ${equippedArtifacts.length >= 1 ? 'bg-slate-700 text-slate-500' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>祭出</button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">暂未获得任何法宝...</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Modal */}
      <AnimatePresence>
        {showStoryModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-sm flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center space-x-2">
                  <BookOpen className="text-emerald-400" />
                  <h2 className="text-lg font-medium text-white">修仙传</h2>
                </div>
                <button onClick={() => setShowStoryModal(false)} className="text-slate-400 p-1"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide pb-4">
                <div className="text-center mb-6">
                  <div className="text-xs text-emerald-500 font-bold mb-1">第 {storyChapter} 章</div>
                  <h3 className="text-xl font-bold text-slate-200">
                    {STORY_CONTENT.find(c => c.id === storyChapter)?.title || '未知章节'}
                  </h3>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700/50">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {STORY_CONTENT.find(c => c.id === storyChapter)?.nodes.find(n => n.id === storyNode)?.text || '你的修仙之旅仍在继续，前方还有更多的挑战和机缘等待着你...'}
                  </p>
                </div>

                {STORY_CONTENT.find(c => c.id === storyChapter)?.nodes.find(n => n.id === storyNode)?.options ? (
                  <div className="space-y-3">
                    {STORY_CONTENT.find(c => c.id === storyChapter)?.nodes.find(n => n.id === storyNode)?.options?.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => {
                          opt.action();
                          advanceStory();
                        }}
                        className="w-full py-3 bg-slate-800/80 text-slate-300 border border-slate-700 rounded-xl font-bold text-sm hover:border-emerald-500/50 hover:text-emerald-400 transition-colors"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button 
                    onClick={advanceStory}
                    className="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm hover:bg-emerald-500/30 transition-colors"
                  >
                    继续历练
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory Modal */}
      <AnimatePresence>
        {showInventoryModal && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[60] bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 pb-12 h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="flex items-center space-x-2">
                <Package className="text-purple-400" />
                <h2 className="text-lg font-medium text-white">储物袋</h2>
              </div>
              <button onClick={() => setShowInventoryModal(false)} className="text-slate-400 p-1"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-10">
              {Object.keys(materials).length > 0 ? (
                Object.entries(materials).map(([id, count]) => {
                  if (count <= 0) return null;
                  const isPill = id.includes('pill');
                  const itemInfo = SHOP_ITEMS.find(i => i.id === id) || 
                                   { id, name: id === 'common_herb' ? '灵草' : id === 'rare_herb' ? '珍稀灵草' : id === 'stone' ? '灵石矿' : id === 'profound_iron' ? '玄铁精' : id === 'millennium_lingzhi' ? '千年灵芝' : id === 'jiuzhuan_grass' ? '九转玄草' : id === 'monster_bone' ? '妖兽骨骼' : id === 'monster_fur' ? '妖兽皮毛' : id === 'paper' ? '符纸' : id === 'cinnabar' ? '朱砂' : id === 'pill_1' ? '黄龙丹' : id === 'pill_foundation' ? '筑基丹' : id === 'pill_golden_core' ? '降尘丹' : id === 'pill_nascent_soul' ? '定灵丹' : id === 'zhuyan_pill' ? '驻颜丹' : id === 'juqi_pill' ? '聚气散' : id === 'humai_pill' ? '护脉丹' : id === 'qingxin_pill' ? '清心丹' : id === 'millennium_pill' ? '千年灵丹' : id === 'jiuzhuan_pill' ? '九转金丹' : id, desc: isPill ? '丹药' : '修仙材料', type: isPill ? 'consumable' : 'material', effect: id === 'juqi_pill' ? 1000 : id === 'millennium_pill' ? 10000 : id === 'jiuzhuan_pill' ? 100000 : 0 };
                  
                  const isConsumable = itemInfo.type === 'consumable';
                  
                  return (
                    <div key={id} className="flex flex-col p-4 rounded-xl border bg-slate-800/50 border-slate-700/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <h3 className="text-sm font-medium text-slate-200">{itemInfo.name} <span className="text-xs text-slate-400 ml-2">拥有: {count}</span></h3>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{itemInfo.desc}</p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-end">
                          {isConsumable && (
                            <button 
                              onClick={() => {
                                if (id === 'humai_pill') {
                                  setToastMessage('护脉丹在断签时自动提示使用！');
                                  setTimeout(() => setToastMessage(null), 2000);
                                  return;
                                }
                                if (id === 'qingxin_pill') {
                                  setToastMessage('清心丹在突破大境界时勾选使用！');
                                  setTimeout(() => setToastMessage(null), 2000);
                                  return;
                                }
                                if (id === 'pill_foundation' || id === 'pill_golden_core' || id === 'pill_nascent_soul') {
                                  setToastMessage('突破丹药在突破大境界时自动使用！');
                                  setTimeout(() => setToastMessage(null), 2000);
                                  return;
                                }
                                if (id === 'zhuyan_pill') {
                                  setToastMessage('驻颜丹用于赠送给道侣，无法直接服用！');
                                  setTimeout(() => setToastMessage(null), 2000);
                                  return;
                                }
                                // Consume item
                                const effect = itemInfo.effect || 0;
                                addLog(effect, 'water');
                                addMaterial(id, -1);
                                setToastMessage(`服用 ${itemInfo.name}，修为增加 ${effect}`);
                                setTimeout(() => setToastMessage(null), 2000);
                              }}
                              className="px-3 py-1.5 text-xs rounded-full shadow-lg transition-colors flex items-center bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20"
                            >
                              服用
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  储物袋空空如也
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[60] bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 pb-12 h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="flex items-center space-x-2">
                <Store className="text-amber-400" />
                <h2 className="text-lg font-medium text-white">{currentRegion}坊市</h2>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm font-medium px-2 py-1 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">
                  <Gem size={14} className="mr-1" /> {spiritStones || 0}
                </div>
                <button onClick={() => setShowShop(false)} className="text-slate-400 p-1"><X size={20} /></button>
              </div>
            </div>
            
            <div className="flex space-x-2 mb-4 shrink-0">
              <button
                onClick={() => setShopTab('buy')}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${shopTab === 'buy' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
              >
                购买
              </button>
              <button
                onClick={() => setShopTab('sell')}
                className={`flex-1 py-2 text-sm font-medium rounded-xl transition-colors ${shopTab === 'sell' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
              >
                出售
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-10">
              {shopTab === 'buy' && SHOP_ITEMS.filter(i => !i.region || i.region === 'all' || i.region === currentRegion).map(item => {
                const isOwned = (item.type === 'passive' || item.type === 'skill') && (inventory?.includes(item.id) || skills?.includes(item.id));
                const canAfford = (spiritStones || 0) >= item.cost;
                const inventoryCount = (item.type === 'consumable' || item.type === 'breakthrough' || item.type === 'material') ? (materials[item.id] || 0) : (inventory?.filter(i => i === item.id).length || 0);
                
                return (
                  <div key={item.id} className="flex flex-col p-4 rounded-xl border bg-slate-800/50 border-slate-700/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="text-sm font-medium text-slate-200">
                          {item.name}
                          {inventoryCount > 0 && <span className="ml-2 text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full">持有: {inventoryCount}</span>}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end">
                        {isOwned ? (
                          <div className="flex items-center text-slate-500 text-xs px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                            <CheckCircle2 size={14} className="mr-1" /> 已拥有
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleBuy(item)}
                            disabled={!canAfford}
                            className={`px-3 py-1.5 text-xs rounded-full shadow-lg transition-colors flex items-center ${canAfford ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                          >
                            购买 <Gem size={12} className="ml-1 mr-0.5" /> {item.cost}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {shopTab === 'sell' && (
                <>
                  {[
                    ...Object.keys(materials).map(id => ({
                      id,
                      name: SHOP_ITEMS.find(i => i.id === id)?.name || (id === 'stone' ? '灵矿石' : id === 'monster_bone' ? '妖兽骨骼' : id === 'monster_fur' ? '妖兽皮毛' : id === 'paper' ? '符纸' : id === 'cinnabar' ? '朱砂' : id),
                      type: 'material',
                      price: (id in marketPrices) ? (marketPrices as any)[id] : (SHOP_ITEMS.find(i => i.id === id) ? Math.floor(SHOP_ITEMS.find(i => i.id === id)!.cost / 2) : (id === 'stone' ? 5 : id === 'monster_bone' ? 50 : id === 'monster_fur' ? 30 : id === 'paper' ? 2 : id === 'cinnabar' ? 5 : 5)),
                      desc: SHOP_ITEMS.find(i => i.id === id)?.desc || (id.includes('pill') ? '丹药' : '修仙材料')
                    })),
                    ...Array.from(new Set(inventory)).map(id => {
                      const shopItem = SHOP_ITEMS.find(i => i.id === id);
                      if (!shopItem) return null;
                      return {
                        id,
                        name: shopItem.name,
                        type: shopItem.type === 'skill' ? 'skill' : 'inventory',
                        price: Math.floor(shopItem.cost / 2),
                        desc: shopItem.desc
                      };
                    }).filter(Boolean) as any[]
                  ].map(item => {
                    const count = item.type === 'material' ? (materials[item.id] || 0) : inventory.filter(i => i === item.id).length;
                    if (count <= 0) return null;
                    
                    return (
                      <div key={item.id} className="flex flex-col p-4 rounded-xl border bg-slate-800/50 border-slate-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 pr-4">
                            <h3 className="text-sm font-medium text-slate-200">{item.name} <span className="text-xs text-slate-400 ml-2">拥有: {count}</span></h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                          </div>
                          <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                            {item.type === 'skill' && (
                              <button 
                                onClick={() => {
                                  useStore.getState().learnSkill(item.id);
                                  useStore.getState().sellItem(item.id, 'inventory', 1, 0); // Remove from inventory
                                  setToastMessage(`成功学习 ${item.name}！`);
                                  setTimeout(() => setToastMessage(null), 2000);
                                }}
                                className="px-3 py-1.5 text-xs rounded-full shadow-lg transition-colors flex items-center bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20"
                              >
                                学习 <ScrollText size={12} className="ml-1 mr-0.5" />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                const sellType = (item.type === 'material' || item.type === 'consumable' || item.type === 'breakthrough') ? 'material' : 'inventory';
                                if (sellItem(item.id, sellType, 1, item.price)) {
                                  setToastMessage(`出售成功，获得 ${item.price} 灵石`);
                                  setTimeout(() => setToastMessage(null), 2000);
                                }
                              }}
                              className="px-3 py-1.5 text-xs rounded-full shadow-lg transition-colors flex items-center bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20"
                            >
                              出售 <Gem size={12} className="ml-1 mr-0.5" /> {item.price}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {Object.keys(materials).length === 0 && (
                    <div className="text-center py-10 text-slate-500 text-sm">
                      暂无物品可出售
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Novice Guide Modal */}
      <AnimatePresence>
        {showNoviceGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            {noviceStep === 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-800 border border-blue-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
              >
                <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                  <span className="text-4xl">👴</span>
                </div>
                <h2 className="text-2xl font-bold text-blue-300 mb-4">宗门长老</h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-8">
                  "咦？老夫观你骨骼惊奇，体内隐隐有灵气波动……你，可是身具灵根之人？"
                </p>
                <button
                  onClick={() => setNoviceStep(1)}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-colors"
                >
                  接受灵根鉴定
                </button>
              </motion.div>
            )}

            {noviceStep === 1 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-800 border border-purple-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
              >
                <div className="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                  <Sparkles size={40} className="text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-purple-300 mb-4">灵根鉴定结果</h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  鉴定完毕！你的灵根属性为：
                </p>
                <div className={`text-2xl font-bold mb-8 ${rootInfo?.color || 'text-slate-400'}`}>
                  {rootInfo?.name || '未知灵根'}
                </div>
                <p className="text-slate-400 text-xs mb-8">
                  {rootInfo?.desc || '天机不可泄露'}
                </p>
                <button
                  onClick={() => setNoviceStep(2)}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-400 text-white rounded-xl font-medium shadow-lg shadow-purple-500/20 transition-colors"
                >
                  下一步
                </button>
              </motion.div>
            )}

            {noviceStep === 2 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-800 border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
              >
                <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <Droplets size={40} className="text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-300 mb-4">初窥门径</h2>
                <p className="text-slate-300 text-sm leading-relaxed mb-8">
                  "长老：既然你体内有灵根，先饮一杯灵泉试试吧。向灵泉献上一杯清水，以感应天地灵气。"
                </p>
                <button
                  onClick={() => {
                    setShowNoviceGuide(false);
                    setIsFirstTime(false);
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-colors animate-pulse"
                >
                  去喝第一杯水
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sect Invitation Modal */}
      <AnimatePresence>
        {showSectInvitation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 border border-blue-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Shield size={40} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-blue-300 mb-4">宗门大选</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                道友连续闭关修炼 <span className="text-rose-400 font-bold">7</span> 天，道心坚毅，已引起修仙界各大宗门的注意！<br/><br/>
                <span className="text-blue-400 font-medium">仙缘已至！</span><br/>
                是否接受邀请，正式拜入修仙大派？
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    joinSect();
                    setShowSectInvitation(false);
                    setToastMessage('恭喜加入宗门！');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-colors"
                >
                  接受邀请，拜入宗门
                </button>
                <button
                  onClick={() => setShowSectInvitation(false)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  婉拒好意，做个散修
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sect Selection Modal */}
      <AnimatePresence>
        {showSectSelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 border border-blue-500/30 rounded-3xl p-6 max-w-2xl w-full relative overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-300 flex items-center">
                  <Shield size={24} className="mr-2" /> 宗门大选
                </h2>
                <button onClick={() => setShowSectSelection(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="overflow-y-auto pr-2 space-y-3 flex-1 scrollbar-hide">
                {SECTS.map((s) => (
                  <div key={s.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 flex justify-between items-center hover:border-blue-500/30 transition-colors">
                    <div>
                      <h3 className="text-lg font-bold text-blue-400 mb-1">{s.name}</h3>
                      <p className="text-xs text-slate-400">{s.desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        joinSect(s.id);
                        setShowSectSelection(false);
                        setToastMessage(`恭喜加入 ${s.name}！`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
                    >
                      拜入山门
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marrow Wash Event Modal */}
      <AnimatePresence>
        {showMarrowWashEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 border border-emerald-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
              <div className="w-20 h-20 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <Sparkles size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-300 mb-4">奇遇：洗髓灵液</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-8">
                道友本是无灵根的凡人之躯，却在饮下这杯水时，意外触发了神秘老爷爷留下的洗髓灵液！<br/><br/>
                <span className="text-emerald-400 font-medium">脱胎换骨，逆天改命！</span><br/>
                你的体质已蜕变为<span className="text-amber-400 font-bold">【伪灵根】</span>，从此踏上修仙之路！
              </p>
              <button
                onClick={() => setShowMarrowWashEvent(false)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-colors"
              >
                拜谢前辈，开始修炼
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakthrough Event Modal */}
      <AnimatePresence>
        {breakthroughEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="bg-slate-800 border border-amber-500/30 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
              {breakthroughEvent === '炼虚初期' ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none"></div>
                  <div className="w-24 h-24 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20 relative">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-rose-500/30 rounded-full"
                    />
                    <CloudSun size={48} className="text-rose-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-rose-400 mb-2 tracking-widest">飞升灵界！</h2>
                  <p className="text-xl text-white font-medium mb-6">晋升【{breakthroughEvent}】</p>
                  <p className="text-rose-100/80 text-sm mb-8 leading-relaxed">
                    天劫已过，霞光万道！道友历经千辛万苦，终于打破人界桎梏，成功化神飞升灵界！<br/><br/>
                    <span className="text-amber-400 font-medium">从此海阔凭鱼跃，天高任鸟飞！</span>
                  </p>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>
                  <div className="w-24 h-24 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 relative">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-amber-500/30 rounded-full"
                    />
                    <Flame size={48} className="text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-amber-300 mb-2 tracking-widest">境界突破</h2>
                  <p className="text-xl text-white font-medium mb-6">晋升【{breakthroughEvent}】</p>
                  <p className="text-slate-300 text-sm leading-relaxed mb-8">
                    天道酬勤，水滴石穿。<br/>
                    道友日夜苦修，终于打破瓶颈，修为更进一步！
                  </p>
                </>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setBreakthroughEvent(null);
                    setShowShare(true);
                  }}
                  className={`w-full py-3 ${breakthroughEvent === '炼虚初期' ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20' : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'} text-white rounded-xl font-medium shadow-lg transition-colors flex items-center justify-center`}
                >
                  <Share2 size={18} className="mr-2" /> 分享喜悦
                </button>
                <button
                  onClick={() => setBreakthroughEvent(null)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  继续闭关
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotional Value Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 bg-slate-800/90 backdrop-blur-md text-emerald-300 px-6 py-3 rounded-2xl shadow-xl border border-emerald-500/20 z-50 text-sm font-medium text-center max-w-[80%]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Palm Bottle Modal */}
      <AnimatePresence>
        {showBottleModal && (
          <PalmBottleModal onClose={() => setShowBottleModal(false)} />
        )}
      </AnimatePresence>

      {/* Production Modal */}
      <AnimatePresence>
        {showProductionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <Flame size={20} className="text-rose-400" />
                  <h2 className="text-xl font-bold text-white">洞府炼制</h2>
                </div>
                <button onClick={() => setShowProductionModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex border-b border-slate-700 bg-slate-900/30">
                <button 
                  onClick={() => setProductionTab('alchemy')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${productionTab === 'alchemy' ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-400/5' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  炼丹 (Lv.{alchemyLevel || 1})
                </button>
                <button 
                  onClick={() => setProductionTab('crafting')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${productionTab === 'crafting' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  炼器 (Lv.{craftingLevel || 1})
                </button>
                <button 
                  onClick={() => setProductionTab('talisman')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${productionTab === 'talisman' ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/5' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  符箓 (Lv.{talismanLevel || 1})
                </button>
                <button 
                  onClick={() => setProductionTab('formation')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${productionTab === 'formation' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  阵法 (Lv.{formationLevel || 1})
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {productionTab === 'alchemy' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">炼丹需要消耗灵草，提升炼丹术可提高成功率。</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'pill_1', name: '黄龙丹', cost: { common_herb: 2 }, desc: '提升少量修为' },
                        { id: 'pill_foundation', name: '筑基丹', cost: { common_herb: 10, rare_herb: 2 }, desc: '突破筑基期必备' },
                        { id: 'pill_golden_core', name: '降尘丹', cost: { rare_herb: 5, millennium_lingzhi: 1 }, desc: '突破结丹期必备' },
                        { id: 'pill_nascent_soul', name: '定灵丹', cost: { millennium_lingzhi: 3, jiuzhuan_grass: 1 }, desc: '突破元婴期必备' },
                        { id: 'zhuyan_pill', name: '驻颜丹', cost: { rare_herb: 10, millennium_lingzhi: 2 }, desc: '稀有丹药，可永驻容颜，女修梦寐以求之物' },
                      ].map(item => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(item.cost).map(([mat, amt]) => (
                                <span key={mat} className={`text-[10px] px-2 py-0.5 rounded-full ${(materials[mat] || 0) >= amt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                  {mat === 'common_herb' ? '灵草' : mat === 'rare_herb' ? '珍稀灵草' : mat === 'millennium_lingzhi' ? '千年灵芝' : '九转玄草'}: {materials[mat] || 0}/{amt}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const res = makePill(item.id);
                              setToastMessage(res.message);
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/50 rounded-xl text-xs font-bold"
                          >
                            炼制
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {productionTab === 'crafting' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">炼器需要消耗玄铁和妖兽材料，可制作威力巨大的法宝。</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                      { id: 'artifact_flying_sword', name: '青锋剑', cost: { profound_iron: 5, monster_bone: 1 }, desc: '基础法器，提升攻击力' },
                        { id: 'artifact_shield', name: '玄铁盾', cost: { profound_iron: 10, monster_fur: 2 }, desc: '防御法器，大幅提升防御' },
                      ].map(item => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Object.entries(item.cost).map(([mat, amt]) => (
                                <span key={mat} className={`text-[10px] px-2 py-0.5 rounded-full ${(materials[mat] || 0) >= amt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                  {mat === 'profound_iron' ? '玄铁' : mat === 'monster_bone' ? '妖兽骨骼' : '妖兽皮毛'}: {materials[mat] || 0}/{amt}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              craftArtifact(item.id);
                              setToastMessage(`开始炼制 ${item.name}...`);
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            className="px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-xl text-xs font-bold"
                          >
                            炼制
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {productionTab === 'talisman' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">符箓是一次性消耗品，在战斗中可起到出奇制胜的效果。</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'fireball', name: '火球符', cost: { paper: 1, cinnabar: 1 }, desc: '释放火球攻击敌人' },
                        { id: 'shield', name: '金刚符', cost: { paper: 1, cinnabar: 2 }, desc: '短时间内提供护盾' },
                        { id: 'escape', name: '遁地符', cost: { paper: 1, cinnabar: 3 }, desc: '战斗中强制逃跑' },
                      ].map(item => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                            <div className="flex space-x-2 mt-2">
                              {Object.entries(item.cost).map(([mat, amt]) => (
                                <span key={mat} className={`text-[10px] px-2 py-0.5 rounded-full ${(materials[mat] || 0) >= amt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                  {mat === 'paper' ? '符纸' : '朱砂'}: {materials[mat] || 0}/{amt}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              const res = makeTalisman(item.id);
                              setToastMessage(res.message);
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            className="px-4 py-2 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-xl text-xs font-bold"
                          >
                            制作
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {productionTab === 'formation' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">阵法可布置在洞府或战斗中，提供持续的增益或控制。</p>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'gathering', name: '聚灵阵', cost: 100, desc: '提升洞府灵气浓度' },
                        { id: 'trapping', name: '困仙阵', cost: 500, desc: '降低敌人移动速度' },
                        { id: 'killing', name: '九天雷劫阵', cost: 2000, desc: '对阵内敌人造成持续伤害' },
                      ].map(item => (
                        <div key={item.id} className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                            <p className="text-[10px] text-amber-400 mt-2">消耗: {item.cost} 灵石</p>
                          </div>
                          <button 
                            onClick={() => {
                              setupFormation(item.id);
                              setToastMessage(`布置 ${item.name} 成功！`);
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-xl text-xs font-bold"
                          >
                            布置
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Donate Modal */}
      <AnimatePresence>
        {showDonateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <Shield size={20} className="text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">捐献物资</h2>
                </div>
                <button onClick={() => setShowDonateModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <p className="text-sm text-slate-400 mb-4">将多余的药材、丹药或功法捐献给宗门，可获得宗门贡献。</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'common_herb', name: '普通灵草', color: 'text-emerald-200', points: 10 },
                    { id: 'rare_herb', name: '珍稀灵草', color: 'text-emerald-300', points: 50 },
                    { id: 'millennium_lingzhi', name: '千年灵芝', color: 'text-emerald-400', points: 10 },
                    { id: 'jiuzhuan_grass', name: '九转还魂草', color: 'text-purple-300', points: 200 },
                    { id: 'zhuyan_pill', name: '驻颜丹', color: 'text-rose-300', points: 500 },
                    { id: 'pill_1', name: '黄龙丹', color: 'text-amber-300', points: 100 },
                    { id: 'pill_foundation', name: '筑基丹', color: 'text-cyan-300', points: 500 },
                    { id: 'pill_golden_core', name: '降尘丹', color: 'text-yellow-500', points: 2000 },
                    { id: 'pill_nascent_soul', name: '定灵丹', color: 'text-orange-400', points: 10 },
                    { id: 'skill_1', name: '青元剑诀', color: 'text-blue-300', points: 1000 },
                    { id: 'skill_2', name: '玄阴诀', color: 'text-purple-400', points: 1000 },
                    { id: 'skill_3', name: '五行诀', color: 'text-yellow-300', points: 1000 },
                    { id: 'skill_4', name: '长生诀', color: 'text-emerald-300', points: 1000 },
                    { id: 'skill_5', name: '天雷双剑', color: 'text-cyan-400', points: 1000 },
                  ].map(item => {
                    const isSkill = item.id.startsWith('skill_');
                    const count = isSkill ? inventory.filter(i => i === item.id).length : (materials[item.id] || 0);
                    if (count <= 0) return null;
                    return (
                      <button 
                        key={item.id}
                        onClick={() => {
                          const res = donateToSect(item.id);
                          setToastMessage(res.message);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="p-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-left transition-colors"
                      >
                        <div className={`font-bold text-sm ${item.color}`}>{item.name}</div>
                        <div className="text-xs text-slate-400 mt-1">拥有: {count}</div>
                        <div className="text-[10px] text-amber-400 mt-1">+{item.points} 贡献</div>
                      </button>
                    );
                  })}
                </div>
                {Object.keys(materials).length === 0 && inventory.filter(i => i.startsWith('skill_')).length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    暂无可捐献的物资
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NPC Modal */}
      <AnimatePresence>
        {showNpcModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                <div className="flex items-center space-x-2">
                  <Users size={20} className="text-blue-400" />
                  <h2 className="text-xl font-bold text-white">此界修士</h2>
                </div>
                <button onClick={() => setShowNpcModal(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {[...sectNpcs].sort((a, b) => b.cultivation - a.cultivation).map((npc, idx) => (
                  <div key={npc.id} className="bg-slate-900/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-white font-medium flex items-center">
                          {npc.name}
                          {npc.name === '韩立' && <Sparkles size={12} className="ml-1 text-amber-400" />}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {SECTS.find(s => s.id === npc.sectId)?.name || '散修'} · {npc.level}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">修为</p>
                      <p className="text-sm font-mono text-blue-400">{npc.cultivation}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-900/30 text-center">
                <p className="text-[10px] text-slate-500 italic">“大道无情，唯有苦修方能长生。”</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Modals */}
      <CharacterSelectionModal 
        isOpen={showCharacterSelection} 
        onSelect={(id, data) => {
          selectCharacter(id, data);
          setShowCharacterSelection(false);
        }} 
      />

      <DeathModal 
        isOpen={isDead} 
        reason={deathReason} 
        rebirthCount={rebirthCount} 
        onRebirth={(talent) => {
          rebirth(talent);
        }} 
      />

      <ConsultHeavens 
        isOpen={showConsultHeavens} 
        onClose={() => setShowConsultHeavens(false)} 
        playerName={playerName}
        level={currentLevelName}
        sect={sect ? SECTS.find(s => s.id === sect)?.name || null : null}
      />

      <EncyclopediaModal
        isOpen={showEncyclopedia}
        onClose={() => setShowEncyclopedia(false)}
      />

      {/* Create Sect Modal */}
      <AnimatePresence>
        {showCreateSectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-sm flex flex-col overflow-hidden shadow-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-4">创立宗门</h2>
              <p className="text-sm text-slate-400 mb-4">开宗立派需要消耗 10000 灵石。请输入宗门名称：</p>
              <input 
                type="text" 
                value={newSectName} 
                onChange={(e) => setNewSectName(e.target.value)}
                placeholder="例如：青云门"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white mb-6 focus:outline-none focus:border-purple-500"
              />
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowCreateSectModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-medium"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    if (newSectName.trim()) {
                      const result = useStore.getState().createMySect?.(newSectName.trim());
                      if (result) {
                        setToastMessage(result.message);
                        setTimeout(() => setToastMessage(null), 3000);
                        if (result.success) {
                          setShowCreateSectModal(false);
                          setNewSectName('');
                        }
                      }
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
                >
                  确认创立
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
