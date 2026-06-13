import { useState, useEffect, useRef } from 'react';
import { useStore, CULTIVATION_LEVELS, REGIONS, SECTS } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react';

interface JournalEntry {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  type: 'breakthrough' | 'encounter' | 'event' | 'sect' | 'companion' | 'milestone';
}

function generateJournalEntry(
  type: string,
  data: any
): JournalEntry | null {
  const now = Date.now();
  switch (type) {
    case 'breakthrough': {
      const level = CULTIVATION_LEVELS[data.levelIndex];
      if (!level) return null;
      return {
        id: `b_${now}`,
        timestamp: now,
        title: `突破·${level.name}`,
        content: `经过多年苦修，你终于突破了瓶颈，踏入${level.name}境界。体内灵力如江河奔涌，寿元随之增长。这一刻，你离大道又近了一步。`,
        type: 'breakthrough',
      };
    }
    case 'tribulation_survived': {
      return {
        id: `t_${now}`,
        timestamp: now,
        title: '天劫渡过',
        content: `天雷滚滚，九死一生。你以坚强的意志扛过了天劫的洗礼。雷劫淬体，你的肉身更加坚不可摧，对天地法则的感悟也更进一层。`,
        type: 'milestone',
      };
    }
    case 'tribulation_failed': {
      return {
        id: `tf_${now}`,
        timestamp: now,
        title: '渡劫失败',
        content: `天威难测。你未能完全抵御天劫的威力，修为受损。但修仙之路本就如此——跌倒后再爬起，方能走得更远。`,
        type: 'event',
      };
    }
    case 'sect_joined': {
      const sect = SECTS.find(s => s.id === data.sectId);
      return {
        id: `sj_${now}`,
        timestamp: now,
        title: `拜入·${sect?.name || '宗门'}`,
        content: `你正式拜入${sect?.name || '宗门'}，从此不再是散修。${sect?.desc || ''}在宗门庇护下，你的修行之路有了新的方向。`,
        type: 'sect',
      };
    }
    case 'artifact_bound': {
      return {
        id: `ab_${now}`,
        timestamp: now,
        title: `本命法宝·${data.name}`,
        content: `你以精血祭炼${data.name}，从此法宝与你心神相连。它将在你的修仙之路上相伴始终，成为你最可靠的倚仗。`,
        type: 'milestone',
      };
    }
    case 'region_change': {
      return {
        id: `rc_${now}`,
        timestamp: now,
        title: `踏入·${data.region}`,
        content: `你穿越茫茫大地，终于来到了${data.region}。眼前是一片全新的天地，灵气浓度与此前截然不同。新的机缘与危险都在等待着你。`,
        type: 'event',
      };
    }
    case 'companion_married': {
      return {
        id: `cm_${now}`,
        timestamp: now,
        title: `结为道侣·${data.name}`,
        content: `你与${data.name}结为道侣。从此修仙路上不再孤单，有人陪你共赴大道，同生共死。`,
        type: 'companion',
      };
    }
    case 'encounter_survived': {
      return {
        id: `es_${now}`,
        timestamp: now,
        title: `奇遇·${data.title}`,
        content: data.message || '一次偶然的相遇，改变了你的命运。',
        type: 'encounter',
      };
    }
    default:
      return null;
  }
}

export default function CultivationJournal() {
  const {
    levelIndex, breakthroughEvent, currentRegion, sect,
    tribulation, lifeboundArtifact, daoCompanion,
  } = useStore();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [expanded, setExpanded] = useState(false);
  const prevLevel = useRef(levelIndex);
  const prevTribActive = useRef(false);
  const prevSect = useRef(sect);
  const prevRegion = useRef(currentRegion);
  const prevArtifact = useRef(lifeboundArtifact.id);

  // Generate journal entries on events
  useEffect(() => {
    if (levelIndex !== prevLevel.current && levelIndex > prevLevel.current) {
      const entry = generateJournalEntry('breakthrough', { levelIndex });
      if (entry) setEntries(prev => [entry, ...prev]);
      prevLevel.current = levelIndex;
    }
  }, [levelIndex]);

  useEffect(() => {
    if (!tribulation.active && prevTribActive.current) {
      const success = tribulation.survivedStrikes >= tribulation.totalStrikes * 0.5;
      const entry = generateJournalEntry(
        success ? 'tribulation_survived' : 'tribulation_failed', {}
      );
      if (entry) setEntries(prev => [entry, ...prev]);
    }
    prevTribActive.current = tribulation.active;
  }, [tribulation.active]);

  useEffect(() => {
    if (sect && sect !== prevSect.current) {
      const entry = generateJournalEntry('sect_joined', { sectId: sect });
      if (entry) setEntries(prev => [entry, ...prev]);
      prevSect.current = sect;
    }
  }, [sect]);

  useEffect(() => {
    if (currentRegion !== prevRegion.current) {
      const entry = generateJournalEntry('region_change', { region: currentRegion });
      if (entry) setEntries(prev => [entry, ...prev]);
      prevRegion.current = currentRegion;
    }
  }, [currentRegion]);

  useEffect(() => {
    if (lifeboundArtifact.id && lifeboundArtifact.id !== prevArtifact.current) {
      const entry = generateJournalEntry('artifact_bound', { name: lifeboundArtifact.name });
      if (entry) setEntries(prev => [entry, ...prev]);
      prevArtifact.current = lifeboundArtifact.id;
    }
  }, [lifeboundArtifact.id]);

  if (entries.length === 0) return null;

  const displayed = expanded ? entries : entries.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ScrollText size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-amber-300">修仙日志</h3>
          <span className="text-[10px] text-amber-400/40">({entries.length})</span>
        </div>
        {entries.length > 3 && (
          <button onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-amber-400/60 hover:text-amber-300 flex items-center space-x-1">
            <span>{expanded ? '收起' : '展开全部'}</span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {displayed.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-3 rounded-xl border ${
                entry.type === 'breakthrough' ? 'bg-purple-500/5 border-purple-500/20' :
                entry.type === 'milestone' ? 'bg-amber-500/5 border-amber-500/20' :
                entry.type === 'encounter' ? 'bg-emerald-500/5 border-emerald-500/20' :
                entry.type === 'companion' ? 'bg-pink-500/5 border-pink-500/20' :
                entry.type === 'sect' ? 'bg-cyan-500/5 border-cyan-500/20' :
                'bg-slate-500/5 border-slate-500/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${
                  entry.type === 'breakthrough' ? 'text-purple-300' :
                  entry.type === 'milestone' ? 'text-amber-300' :
                  entry.type === 'encounter' ? 'text-emerald-300' :
                  entry.type === 'companion' ? 'text-pink-300' :
                  entry.type === 'sect' ? 'text-cyan-300' :
                  'text-slate-300'
                }`}>
                  {entry.title}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(entry.timestamp).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{entry.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
