import { useEffect, useState, useRef, useMemo, type Dispatch, type SetStateAction, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, CULTIVATION_LEVELS, SHOP_ITEMS, SPIRITUAL_ROOTS, DAO_COMPANIONS, REGIONS, SECTS, GAME_SKILLS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, CloudSun, Footprints, Coffee, CupSoda, Share2, List, Trash2, X, Download, Flame, ScrollText, CheckCircle2, Gem, Store, Sparkles, Shield, Heart, Trophy, Compass, PackageOpen, Package, BookMarked, BookOpen, AlertCircle, Users, Map, Edit2, Home, Pickaxe, Swords } from 'lucide-react';
import { formatDistanceToNowStrict, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { connectSocket, getSocket } from '../socket';
import AdBanner from '../components/AdBanner';
import { toPng } from 'html-to-image';
import QRCode from 'react-qr-code';
import { STORY_CONTENT } from '../data/story';
import {
  getChapterSnapshot,
  getNarrativeFeedback,
  type DrinkType,
  type NarrativeFeedbackEvent,
  type NarrativePhase,
} from '../data/narrativeFeedback';

import { getUniqueEmotionalMessage } from '../data/emotionalMessages';
import Tribulation from '../components/Tribulation';
import { emitQiDraw } from '../components/QiDraw';
import WorldMap from '../components/WorldMap';
import CultivationJournal from '../components/CultivationJournal';

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
    millennium_pill: '千年灵丹', jiuzhuan_pill: '九转金丹', flying_sword: '青锋剑', shield_artifact: '玄铁盾'
  };
  
  const isPill = id.includes('pill');
  return {
    name: names[id] || id,
    color: isPill ? 'text-amber-300' : 'text-slate-300',
    desc: isPill ? '丹药' : '修仙材料',
    type: isPill ? 'consumable' : 'material'
  };
};

interface EnergyTrail {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { setActiveGame, getNextReminder, addLog, removeLog, logs, settings, todaySteps, todayTemperature, setHealthData, checkIn, streakDays, pendingStreakRescue, rescueStreak, bonusPoints, quests, claimQuestReward, spiritStones, inventory, buyItem, sellItem, materials, spiritualRoot, sect, sectStatus, sectPosition, sectContribution, sectCompetitionWins, promoteSectPosition, testSpiritualRoot, joinSect, leaveSect, addSectContribution, donateToSect, marrowWashProgress, highestLevelReached, setHighestLevelReached, unlockAchievement, showMarrowWashEvent, setShowMarrowWashEvent, breakthroughEvent, setBreakthroughEvent, daoCompanion, setDaoCompanion, marriedCompanions, setMarriedCompanions, unlockedCompanions, unlockCompanion, interactWithCompanion, isFirstTime, setIsFirstTime, hasDoneFirstDrink, setHasDoneFirstDrink, cave, dailyEncyclopediaItems, currentTitle, unlockedTitles, setCurrentTitle, dailyFates, selectedFate, selectFate, chests, openChest, skills, equippedSkills, skillProficiency, artifacts, equippedArtifacts, artifactLevels, equipSkill, unequipSkill, equipArtifact, unequipArtifact, gainSkillProficiency, upgradeArtifact, storyChapter, storyNode, advanceStory, globalEvent, contributeToGlobalEvent, playerName, setPlayerName, currentRegion, setCurrentRegion, levelIndex, attemptBreakthrough, setLevelIndex, talismans, formations, monsterMaterials, alchemyLevel, craftingLevel, talismanLevel, formationLevel, makeTalisman, makePill, craftArtifact, setupFormation, participateImmortalAssembly, ascend, sectNpcs, gatherMaterials, age, lifespan, addMaterial, addSpiritStones, sectLevel, upgradeSect, adventure } = useStore();
  
  const currentSectInfo = useMemo(() => SECTS.find(s => s.id === sect), [sect]);
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
  const [nextTime, setNextTime] = useState<number | null>(null);
  const [todayAmount, setTodayAmount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>('定位中...');
  
  const [showDetails, setShowDetails] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showQuests, setShowQuests] = useState(false);
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [showCompanionInteractModal, setShowCompanionInteractModal] = useState(false);
  const [selectedInteractCompanionId, setSelectedInteractCompanionId] = useState<string | null>(null);
  const [activeQuestTab, setActiveQuestTab] = useState<'quests' | 'ranking' | 'competition'>('quests');
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showSectInvitation, setShowSectInvitation] = useState(false);
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
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showNpcModal, setShowNpcModal] = useState(false);
  const [showRootGachaModal, setShowRootGachaModal] = useState(false);
  const [gachaRootId, setGachaRootId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [chestReward, setChestReward] = useState<{ type: string, name: string, amount?: number } | null>(null);
  const [noviceStep, setNoviceStep] = useState(0); // 0: Elder, 1: Root Card, 2: Task
  const shareRef = useRef<HTMLDivElement>(null);
  const [narrativeEvent, setNarrativeEvent] = useState<NarrativeFeedbackEvent | null>(null);
  const [energyTrail, setEnergyTrail] = useState<EnergyTrail | null>(null);
  const [isDailyPulsing, setIsDailyPulsing] = useState(false);
  const [isRealmPulsing, setIsRealmPulsing] = useState(false);
  const [isChapterPulsing, setIsChapterPulsing] = useState(false);
  const dailyCardRef = useRef<HTMLDivElement>(null);
  const realmCardRef = useRef<HTMLDivElement>(null);
  const chapterCardRef = useRef<HTMLDivElement>(null);
  
  // Multiplayer states
  const socket = getSocket();
  const [onlinePlayers, setOnlinePlayers] = useState<any[]>([]);
  const [secretRealmActive, setSecretRealmActive] = useState(false);

  useEffect(() => {
    if (isFirstTime && !hasDoneFirstDrink) {
      setShowNoviceGuide(true);
    }
  }, [isFirstTime, hasDoneFirstDrink]);

  useEffect(() => {
    // Connect to WebSocket via global singleton (lifecycle-aware)
    const newSocket = connectSocket();

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
      // Socket lifecycle is managed globally by socket.ts — don't disconnect here.
      // Just remove local listeners if needed.
      newSocket.off('connect');
      newSocket.off('world_state');
      newSocket.off('cultivator_joined');
      newSocket.off('cultivator_left');
      newSocket.off('player_updated');
      newSocket.off('greeting_received');
      newSocket.off('sect_event');
      newSocket.off('secret_realm_status');
      newSocket.off('combat_result');
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
      passiveMultiplier *= (1 + (skillInfo.effect - 1) * proficiencyBonus);
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
  const [showBreakthroughFail, setShowBreakthroughFail] = useState<string | null>(null);
  
  // Recovery for NaN state
  const safePassiveMultiplier = isNaN(passiveMultiplier) ? 1 : passiveMultiplier;
  const safeBonusPoints = isNaN(bonusPoints) ? 0 : bonusPoints;
  
  const totalAmount = logs.reduce((sum, l) => sum + (isNaN(l.amount) ? 0 : l.amount) * safePassiveMultiplier, 0) + safeBonusPoints;
  
  // Backward compatibility: if levelIndex is 0 but totalAmount is high, set it
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

  const currentLevel = CULTIVATION_LEVELS[levelIndex] || CULTIVATION_LEVELS[0];
  const nextLevel = CULTIVATION_LEVELS[levelIndex + 1];
  const narrativePhase = useMemo<NarrativePhase>(() => {
    if (levelIndex < 14) return 'human_early';
    if (levelIndex < 22) return 'human_mid';
    if (levelIndex < 38) return 'human_late';
    return 'spirit_world';
  }, [levelIndex]);
  const chapterSnapshot = useMemo(() => getChapterSnapshot(narrativePhase, logs.length % 4), [narrativePhase, logs.length]);
  const phaseLabel = useMemo(() => {
    switch (narrativePhase) {
      case 'human_early':
        return '凡人初修';
      case 'human_mid':
        return '黄枫谷';
      case 'human_late':
        return '人界机缘';
      case 'spirit_world':
        return '灵界';
      default:
        return '修行中';
    }
  }, [narrativePhase]);

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
  }, [checkIn]);

  useEffect(() => {
    if (streakDays >= 7 && sectStatus === 'none' && spiritualRoot && spiritualRoot !== 'none') {
      setShowSectInvitation(true);
    }
  }, [streakDays, sectStatus, spiritualRoot]);

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
        if (next <= Date.now()) {
           setTimeLeft('就是现在');
        } else {
           setTimeLeft(formatDistanceToNowStrict(next, { locale: zhCN, addSuffix: true }));
        }
      } else {
        setTimeLeft('今天没有提醒了');
      }

      // Calculate today's amount with multipliers
      const multipliers = settings.drinkMultipliers || { water: 1, tea: 0.9, coffee: 0.8, milktea: 0.5 };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLogs = logs.filter((l) => l.timestamp >= today.getTime());
      
      const amount = todayLogs.reduce((sum, l) => sum + l.amount * (multipliers[l.type || 'water']), 0);
      setTodayAmount(Math.round(amount));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [getNextReminder, logs]);

  useEffect(() => {
    if (!narrativeEvent) return;

    const timeout = window.setTimeout(() => {
      setNarrativeEvent((current) => (current?.id === narrativeEvent.id ? null : current));
    }, narrativeEvent.presentationLevel === 'milestone' ? 3600 : 1800);

    return () => window.clearTimeout(timeout);
  }, [narrativeEvent]);

  const triggerPulse = (setter: Dispatch<SetStateAction<boolean>>, duration = 900) => {
    setter(true);
    window.setTimeout(() => setter(false), duration);
  };

  const handleDrink = (amount: number, type: DrinkType, e?: MouseEvent) => {
    const finalAmount = addLog(amount, type);
    // Emit QiDraw animation
    emitQiDraw(Math.round(finalAmount),
      type === 'water' ? '一缕灵气终于沉入丹田。你不再只是凡人，修行之路真正开始了。' :
      type === 'coffee' ? '灵咖入腹，一股热流涌遍全身。精神百倍，道心更坚。' :
      type === 'tea' ? '灵茶清香入喉，心如止水。修行之道，贵在持之以恒。' :
      '仙奶茶的甜蜜让你短暂忘却修行的艰辛。偶尔放纵，无伤大雅。'
    );
    
    // Gain proficiency for equipped skills
    equippedSkills.forEach(skillId => {
      gainSkillProficiency(skillId, 1); // +1% proficiency per drink
    });
    
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }

    // Play sound effect
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}

    const effectiveAmount = Math.round(finalAmount * safePassiveMultiplier);
    const reachesDailyGoal = todayAmount < dynamicGoal && todayAmount + effectiveAmount >= dynamicGoal;
    const reachesRealmThreshold = Boolean(nextLevel && totalAmount < nextLevel.min && totalAmount + effectiveAmount >= nextLevel.min);
    const isMilestone = !hasDoneFirstDrink || reachesDailyGoal || reachesRealmThreshold;

    const feedback = getNarrativeFeedback({
      drinkType: type,
      amount,
      phase: narrativePhase,
      majorRealm: currentLevel.name,
      minorLevel: subLevel,
      chapterStep: (logs.length + 1) % 4,
      rewardValue: effectiveAmount,
      isMilestone,
    });
    let randomMsg = feedback.caption;

    setNarrativeEvent(feedback);
    triggerPulse(setIsDailyPulsing, 850);
    triggerPulse(setIsRealmPulsing, reachesRealmThreshold ? 1400 : 950);
    triggerPulse(setIsChapterPulsing, feedback.presentationLevel === 'milestone' ? 1200 : 900);
    
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

  const handleCinematicDrink = (amount: number, type: DrinkType, e?: MouseEvent) => {
    const finalAmount = addLog(amount, type);

    equippedSkills.forEach(skillId => {
      gainSkillProficiency(skillId, 1);
    });

    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }

    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch (error) {}

    const effectiveAmount = Math.round(finalAmount * safePassiveMultiplier);
    const reachesDailyGoal = todayAmount < dynamicGoal && todayAmount + effectiveAmount >= dynamicGoal;
    const reachesRealmThreshold = Boolean(nextLevel && totalAmount < nextLevel.min && totalAmount + effectiveAmount >= nextLevel.min);
    const isMilestone = !hasDoneFirstDrink || reachesDailyGoal || reachesRealmThreshold;

    const feedback = getNarrativeFeedback({
      drinkType: type,
      amount,
      phase: narrativePhase,
      majorRealm: currentLevel.name,
      minorLevel: subLevel,
      chapterStep: (logs.length + 1) % 4,
      rewardValue: effectiveAmount,
      isMilestone,
    });

    setNarrativeEvent(feedback);
    triggerPulse(setIsDailyPulsing, 850);
    triggerPulse(setIsRealmPulsing, reachesRealmThreshold ? 1400 : 950);
    triggerPulse(setIsChapterPulsing, feedback.presentationLevel === 'milestone' ? 1200 : 900);

    if (e && realmCardRef.current) {
      const sourceRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const targetRect = realmCardRef.current.getBoundingClientRect();
      const trailId = Date.now();
      const colors: Record<DrinkType, string> = {
        water: 'rgba(186, 230, 253, 0.95)',
        tea: 'rgba(217, 249, 157, 0.95)',
        coffee: 'rgba(251, 191, 36, 0.95)',
        milktea: 'rgba(251, 207, 232, 0.95)',
      };

      setEnergyTrail({
        id: trailId,
        startX: sourceRect.left + sourceRect.width / 2,
        startY: sourceRect.top + sourceRect.height / 2,
        endX: targetRect.left + targetRect.width / 2,
        endY: targetRect.top + targetRect.height / 2,
        color: colors[type],
      });

      window.setTimeout(() => {
        setEnergyTrail((current) => (current?.id === trailId ? null : current));
      }, 950);
    }

    if (reachesDailyGoal) {
      unlockAchievement('daily_goal');
      if (sect && sectStatus === 'joined') {
        addSectContribution(100);
      }
    }

    const newTotal = logs.reduce((sum, l) => sum + l.amount, 0) + amount;
    if (newTotal >= 10000) unlockAchievement('total_10l');
    if (newTotal >= 50000) unlockAchievement('total_50l');
    if (streakDays >= 3) unlockAchievement('streak_3');
    if (streakDays >= 7) unlockAchievement('streak_7');
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

  const progress = Math.min((todayAmount / dynamicGoal) * 100, 100);

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
  const regularNarrativeEvent = narrativeEvent?.presentationLevel === 'milestone' ? null : narrativeEvent;
  const milestoneNarrativeEvent = narrativeEvent?.presentationLevel === 'milestone' ? narrativeEvent : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 relative">
      {/* V6.0: 天劫系统 */}
      <Tribulation />

      {/* V8.0: 修仙日志 */}
      <CultivationJournal />

      {/* V8.0: 世界地图 */}
      <WorldMap />

      {/* V8.0: 奇遇触发按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          import('../data/encounters').then(({ ENCOUNTERS, getAvailableEncounters, pickRandomEncounter }) => {
            const state = useStore.getState();
            const hasDrunk = state.logs.length > 0 &&
              state.logs[state.logs.length - 1].timestamp > Date.now() - 24 * 60 * 60 * 1000;
            const recentBreakthrough = state.breakthroughEvent !== null;
            const available = getAvailableEncounters(state.levelIndex, state.currentRegion, hasDrunk, recentBreakthrough);
            const enc = pickRandomEncounter(available);
            if (enc) {
              useStore.setState({ pendingEncounterId: enc.id });
            }
          });
        }}
        className="w-full mb-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 text-amber-300/60 text-xs flex items-center justify-center space-x-2 hover:border-amber-500/40 hover:text-amber-300 transition-all"
      >
        <Compass size={14} />
        <span>探寻仙缘</span>
      </motion.button>

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
          onClick={() => navigate('/cave')}
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
            <span className="text-xs font-medium">连续修炼 {streakDays} 天</span>
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
            <button onClick={() => navigate('/adventure')} className="flex items-center space-x-1 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 hover:bg-amber-500/30 transition-colors">
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
            <button onClick={() => navigate('/sect')} className="flex items-center space-x-1 bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors relative">
              <ScrollText size={14} />
              <span className="text-xs font-medium">宗门</span>
              {quests.some(q => q.progress >= q.target && !q.completed) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {levelIndex >= 27 && (
              <button onClick={() => navigate('/adventure')} className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors animate-bounce">
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

        <motion.div
          ref={chapterCardRef}
          className="w-full mb-6 rounded-3xl border border-slate-700/60 bg-slate-900/70 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.35)] backdrop-blur-xl"
          animate={isChapterPulsing ? { scale: [1, 1.01, 1], borderColor: ['rgba(51,65,85,0.6)', 'rgba(186,230,253,0.6)', 'rgba(51,65,85,0.6)'] } : { scale: 1, borderColor: 'rgba(51,65,85,0.6)' }}
          transition={{ duration: isChapterPulsing ? 0.9 : 0.2, ease: 'easeInOut' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.3em] text-slate-500">{phaseLabel}</span>
            <span className="text-[10px] text-slate-400">{chapterSnapshot.progressCurrent}/{chapterSnapshot.progressTarget}</span>
          </div>
          <h3 className="mt-2 text-lg text-slate-100">{chapterSnapshot.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{chapterSnapshot.currentSegment}</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-200/80 via-emerald-200/70 to-amber-200/80"
              animate={{ width: `${(chapterSnapshot.progressCurrent / chapterSnapshot.progressTarget) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        <div className="mb-8 flex flex-col items-center w-full">
          <div ref={realmCardRef} className={`relative mb-4 transition-transform duration-700 ${isRealmPulsing ? 'scale-[1.025]' : 'scale-100'}`}>
            <div className="w-40 h-40 rounded-full border-4 border-slate-700/50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm shadow-2xl relative overflow-hidden">
              <div className={`absolute inset-0 opacity-20 bg-gradient-to-t ${currentLevel.bg}`} />
              {isRealmPulsing && <div className="absolute inset-2 rounded-full border border-amber-200/45 shadow-[0_0_30px_rgba(251,191,36,0.24)]" />}
              <span className="text-4xl font-light text-white mb-1 tracking-tighter">{Math.floor(totalAmount)}</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest">当前修为</span>
            </div>
            {/* Sub-level indicator */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-600 px-3 py-1 rounded-full flex items-center shadow-lg whitespace-nowrap">
              <span className="text-[10px] text-amber-400 font-bold tracking-widest">{currentLevel.name} {subLevel}阶</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-3 mt-2 flex-wrap gap-y-1">
            <span className="flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-cyan-900/40 text-cyan-300 border border-cyan-700/50">
              <Gem size={14} className="mr-1.5" /> {spiritStones || 0} 灵石
            </span>
            <span className="flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-rose-900/40 text-rose-300 border border-rose-700/50">
              寿元 {age} / {lifespan === Infinity ? '与天同寿' : lifespan}
            </span>
            <a href="#/adventure" className="flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700/50 hover:bg-amber-900/60 transition-colors">
              <Compass size={14} className="mr-1.5" /> ⚡{adventure?.spiritPower || 0}/{adventure?.maxSpiritPower || 50} 灵力
            </a>
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
                  const result = attemptBreakthrough(useQingxinPill);
                  setToastMessage(result.message);
                  setTimeout(() => setToastMessage(null), 3000);
                  if (result.tribulation) {
                    // 天劫触发：不播放"突破成功"动画，由 <Tribulation /> 组件接管渡劫流程
                    return;
                  }
                  if (result.success) {
                    setShowBreakthroughEffect(true);
                    setTimeout(() => setShowBreakthroughEffect(false), 3000);
                    setBreakthroughEvent(nextLevel.name);
                  } else {
                    // 突破失败：弹出红色提示动画
                    setShowBreakthroughFail(result.message);
                    setTimeout(() => setShowBreakthroughFail(null), 3000);
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
                <span className="text-amber-400 font-medium">{Math.floor(subLevelProgress * 100)}%</span>
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
                  距 <span className="text-amber-400 font-bold">{nextLevel.name}</span> 还需 <span className="text-sky-400 font-bold">{Math.max(0, Math.floor(nextLevel.min - totalAmount))}</span> 修为
                  <span className="text-slate-500 ml-1">(约 {Math.ceil(Math.max(0, nextLevel.min - totalAmount) / 250)} 杯水)</span>
                </span>
              </div>
            </div>
          )}

          {safePassiveMultiplier > 1 && (
            <span className="text-[10px] text-amber-400/80 mt-2 flex items-center">
              <Sparkles size={10} className="mr-1" /> 修为获取倍率: {safePassiveMultiplier.toFixed(1)}x
            </span>
          )}
        </div>

        {/* Continuous Check-in Calendar */}
        <div className="w-full mb-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3 z-20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-300 font-medium flex items-center"><Flame size={14} className="text-rose-400 mr-1" /> 闭关日历</span>
            <span className="text-xs text-slate-500">连续 {streakDays} 天</span>
          </div>
          <div className="flex justify-between items-center">
            {[...Array(7)].map((_, i) => {
               const isCompleted = i < (streakDays % 7 === 0 && streakDays > 0 ? 7 : streakDays % 7);
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
                      <span className="text-sm font-bold text-blue-300">{currentSectInfo?.name || sect} <span className="text-xs text-blue-400/70">Lv.{sectLevel}</span></span>
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
                      <span className="text-xs text-slate-400">宗门贡献：<span className="text-amber-400 font-bold">{sectContribution}</span></span>
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
                          提升宗门 (Lv.{sectLevel})
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
                <span className="text-emerald-400">{marrowWashProgress} / 5000</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (marrowWashProgress / 5000) * 100)}%` }}></div>
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
              <span className="text-sm text-rose-400 font-bold flex items-center cursor-pointer" onClick={() => navigate('/sect')}><Flame size={14} className="mr-1" /> 宗门大事件</span>
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
                <span>剩余时间: {Math.max(0, Math.ceil((globalEvent.endTime - Date.now()) / (1000 * 60 * 60 * 24)))}天</span>
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
          ref={dailyCardRef}
          className="relative w-64 h-64 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(56,189,248,0.2)] overflow-hidden"
          animate={isDailyPulsing ? { y: [0, -12, 0], scale: [1, 1.02, 1] } : { y: [0, -10, 0], scale: 1 }}
          transition={{ duration: isDailyPulsing ? 0.9 : 4, repeat: isDailyPulsing ? 0 : Infinity, ease: "easeInOut" }}
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
          {isDailyPulsing && <div className="absolute inset-3 rounded-full border border-sky-200/50 shadow-[0_0_35px_rgba(186,230,253,0.22)]" />}
          
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
            {todayAmount} <span className="text-lg text-slate-500">/ {dynamicGoal} ml</span>
          </p>
          {dynamicGoal > settings.dailyGoal && (
            <p className="text-[10px] text-emerald-400/80 mt-1">
              (已根据天气和步数动态增加目标)
            </p>
          )}
        </div>

        {/* Cave Section */}
        <div className="w-full mt-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50 flex flex-col gap-3 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-rose-400">
              <Home size={16} className="mr-2" />
              <span className="text-sm font-bold">洞府修行</span>
            </div>
            <span className="text-[10px] text-slate-500">等级: {Math.floor(alchemyLevel + craftingLevel)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              onClick={() => navigate('/cave')}
              className="py-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center justify-center hover:bg-rose-500/20 transition-colors"
            >
              <Flame size={14} className="mr-1" /> 进入洞府
            </button>
          </div>
        </div>

        {/* Drink Categories */}
        <div className="grid grid-cols-4 gap-3 mt-8 w-full">
          <motion.button whileTap={{ scale: 0.96 }} onClick={(e) => handleCinematicDrink(250, 'water', e)} className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-2xl py-3 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-sky-500/20 opacity-0 group-active:opacity-100 transition-opacity duration-300"></div>
            <Droplets size={24} className="text-sky-400 mb-1" />
            <span className="text-xs text-slate-300">灵泉水</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={(e) => handleCinematicDrink(250, 'tea', e)} className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-2xl py-3 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-active:opacity-100 transition-opacity duration-300"></div>
            <CupSoda size={24} className="text-emerald-500 mb-1" />
            <span className="text-xs text-slate-300">灵茶</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={(e) => handleCinematicDrink(250, 'coffee', e)} className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-2xl py-3 transition-colors relative overflow-hidden group">
            <div className="absolute inset-0 bg-amber-600/20 opacity-0 group-active:opacity-100 transition-opacity duration-300"></div>
            <Coffee size={24} className="text-amber-600 mb-1" />
            <span className="text-xs text-slate-300">灵咖</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={(e) => handleCinematicDrink(250, 'milktea', e)} className="flex flex-col items-center justify-center bg-slate-800/80 hover:bg-slate-700 border border-slate-700/50 rounded-2xl py-3 transition-colors relative overflow-hidden group">
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

      <AnimatePresence>
        {energyTrail && (
          <motion.div
            key={energyTrail.id}
            initial={{ opacity: 0, x: energyTrail.startX, y: energyTrail.startY, scale: 0.7 }}
            animate={{ opacity: [0, 0.95, 0.25], x: energyTrail.endX, y: energyTrail.endY, scale: [0.7, 1.1, 0.9] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-[95] pointer-events-none"
          >
            <div
              className="h-4 w-4 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.45)]"
              style={{ background: energyTrail.color }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {regularNarrativeEvent && (
          <motion.div
            key={regularNarrativeEvent.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-24 z-[96] mx-auto w-[min(92vw,30rem)] rounded-3xl border border-slate-700/80 bg-slate-950/78 px-5 py-4 text-center shadow-2xl backdrop-blur-xl"
          >
            <div className="text-[10px] tracking-[0.32em] text-slate-500">{regularNarrativeEvent.title}</div>
            <div className="mt-3 text-sm leading-relaxed text-slate-100">{regularNarrativeEvent.caption}</div>
            {regularNarrativeEvent.body && (
              <div className="mt-2 text-xs leading-relaxed text-slate-400">{regularNarrativeEvent.body}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {milestoneNarrativeEvent && (
          <motion.div
            key={`${milestoneNarrativeEvent.id}-milestone`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-center justify-center bg-slate-950/72 px-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-amber-200/25 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.16),rgba(15,23,42,0.92)_58%)] px-6 py-8 text-center shadow-[0_30px_120px_rgba(15,23,42,0.7)]"
            >
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
              <motion.div
                animate={{ opacity: [0.25, 0.8, 0.25], scale: [0.96, 1.02, 0.96] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 h-20 w-20 rounded-full border border-amber-200/30 bg-amber-100/5 shadow-[0_0_40px_rgba(251,191,36,0.22)]"
              />
              <div className="text-[11px] tracking-[0.4em] text-amber-200/70">关键时刻</div>
              <div className="mt-4 text-2xl text-slate-50">{milestoneNarrativeEvent.title}</div>
              <div className="mt-3 text-sm leading-relaxed text-amber-50/90">{milestoneNarrativeEvent.caption}</div>
              {milestoneNarrativeEvent.body && (
                <div className="mt-4 text-sm leading-relaxed text-slate-300">{milestoneNarrativeEvent.body}</div>
              )}
            </motion.div>
          </motion.div>
        )}
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
                <div key={log.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
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
              )) : (
                <p className="text-center text-slate-500 text-sm py-8">今天还没有喝水哦，快去补充水分吧！</p>
              )}
            </div>
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
      <AnimatePresence>
        {showBreakthroughEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0, scale: 2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/50 backdrop-blur-sm"
          >
            <div className="text-6xl font-bold text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse p-8 bg-slate-900/80 rounded-3xl border border-amber-500/30">
              突破成功！
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakthrough Failure Effect */}
      <AnimatePresence>
        {showBreakthroughFail && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              animate={{ x: [0, -8, 8, -6, 6, -3, 3, 0] }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center p-8 bg-slate-900/90 rounded-3xl border border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.4)] max-w-sm mx-6"
            >
              <div className="text-5xl font-bold text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] mb-3">
                突破失败！
              </div>
              <p className="text-sm text-red-300/80 text-center leading-relaxed">
                {showBreakthroughFail}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Quests Modal */}
      <AnimatePresence>
        {showQuests && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 z-[60] bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 pb-12 max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex space-x-4">
                <button 
                  onClick={() => setActiveQuestTab('quests')}
                  className={`text-lg font-bold flex items-center transition-colors ${activeQuestTab === 'quests' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <ScrollText size={18} className="mr-2" /> 宗门任务
                </button>
                <button 
                  onClick={() => setActiveQuestTab('ranking')}
                  className={`text-lg font-bold flex items-center transition-colors ${activeQuestTab === 'ranking' ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Trophy size={18} className="mr-2" /> 宗门排行
                </button>
                <button 
                  onClick={() => setActiveQuestTab('competition')}
                  className={`text-lg font-bold flex items-center transition-colors ${activeQuestTab === 'competition' ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Swords size={18} className="mr-2" /> 门派大比
                </button>
              </div>
              <button onClick={() => setShowQuests(false)} className="text-slate-400 p-1"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-10">
              {activeQuestTab === 'quests' ? (
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
              </>
              ) : activeQuestTab === 'ranking' ? (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center mb-4">
                    <h3 className="text-amber-400 font-bold mb-1">{currentSectInfo?.name || sect || '散修联盟'} 本周排行</h3>
                    <p className="text-[10px] text-slate-400">根据本周累计修为与活跃度排名</p>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Mock Ranking Data */}
                    {[
                      { rank: 1, name: '清风剑客', level: '筑基后期', score: 12500, isMe: false },
                      { rank: 2, name: '紫云仙子', level: '筑基中期', score: 11200, isMe: false },
                      { rank: 3, name: '狂刀老祖', level: '筑基初期', score: 9800, isMe: false },
                      { rank: 12, name: '你', level: currentLevel.name, score: Math.floor(totalAmount), isMe: true },
                    ].map((user, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${user.isMe ? 'bg-indigo-900/30 border-indigo-500/50' : 'bg-slate-900/50 border-slate-700/50'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${user.rank === 1 ? 'bg-amber-500 text-slate-900' : user.rank === 2 ? 'bg-slate-300 text-slate-900' : user.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {user.rank}
                          </div>
                          <div>
                            <div className={`text-sm font-bold ${user.isMe ? 'text-indigo-300' : 'text-slate-200'}`}>{user.name}</div>
                            <div className="text-[10px] text-slate-500">{user.level}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-amber-400">{user.score}</div>
                          <div className="text-[10px] text-slate-500">贡献度</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center text-[10px] text-slate-500">
                    每周日晚 24:00 结算，前三名可获得灵石与称号奖励。
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center mb-4">
                    <h3 className="text-red-400 font-bold mb-1">门派大比</h3>
                    <p className="text-[10px] text-slate-400">与其他同门弟子切磋，展露头角</p>
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
                        
                        // Calculate win chance based on cultivation difference
                        const myCultivation = totalAmount;
                        const oppCultivation = opponent.cultivation;
                        let winChance = 0.5;
                        if (myCultivation > oppCultivation * 2) winChance = 0.95;
                        else if (myCultivation > oppCultivation) winChance = 0.7;
                        else if (myCultivation < oppCultivation / 2) winChance = 0.05;
                        else winChance = 0.3;
                        
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
                          
                          setToastMessage(`你击败了【${opponent.name}】！大比获胜！获得500贡献、1000灵石${extraReward}！`);
                        } else {
                          setToastMessage(`你遭遇了【${opponent.name}】，大比落败，技不如人，还需努力修炼！`);
                        }
                        setTimeout(() => setToastMessage(null), 4000);
                      }}
                      className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center"
                    >
                      <Swords size={18} className="mr-2" /> 报名参赛 (100灵石)
                    </button>
                  </div>
                </div>
              )}
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
                      {artifacts.map(artifactId => {
                        const isEquipped = equippedArtifacts.includes(artifactId);
                        const level = artifactLevels[artifactId] || 1;
                        // Mock artifact details for now
                        const artifactName = artifactId === 'julian_array' ? '聚灵阵' : artifactId === 'ancient_sword' ? '上古残剑' : '未知法宝';
                        const artifactDesc = artifactId === 'julian_array' ? `饮水修为 +${30 + (level-1)*10}%` : artifactId === 'ancient_sword' ? `秘境历练灵石收益 +${20 + (level-1)*5}%` : '神秘效果';
                        return (
                          <div key={artifactId} className={`flex flex-col p-3 rounded-xl border transition-colors ${isEquipped ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
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

                <button 
                  onClick={advanceStory}
                  className="w-full py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm hover:bg-emerald-500/30 transition-colors"
                >
                  继续历练
                </button>
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
                        <p className="text-xs text-slate-500 mt-1">{npc.level}</p>
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
    </div>
  );
}
