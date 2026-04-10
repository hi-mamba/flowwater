import { useStore } from '../store';

export interface StoryNode {
  id: number;
  text: string;
  options?: {
    text: string;
    action: () => void;
  }[];
}

export interface StoryChapter {
  id: number;
  title: string;
  nodes: StoryNode[];
}

export const STORY_CONTENT: StoryChapter[] = [
  {
    id: 1,
    title: '七玄门·初入仙途',
    nodes: [
      { id: 0, text: '你本是青牛镇一个普通的农家少年，为了让家里人过上好日子，在三叔的介绍下，你参加了七玄门的入门考核。' },
      { id: 1, text: '虽然资质平平，但你凭借着坚韧的毅力，勉强成为了七玄门的记名弟子，并被神秘的墨大夫收入神手谷。' },
      { 
        id: 2, 
        text: '在神手谷中，你偶然捡到了一个神秘的绿色小瓶。你发现这个小瓶似乎能吸收月光，凝聚出一种神奇的绿液。',
        options: [
          {
            text: '仔细研究掌天瓶',
            action: () => {
              const store = useStore.getState();
              store.addLog(0); // Add a log or just trigger something
              // Unlock bottle spirit or just give some liquid
              useStore.setState({ palmBottleLiquid: store.palmBottleLiquid + 3 });
            }
          }
        ]
      },
      { 
        id: 3, 
        text: '墨大夫传授了你一套名为《长春功》的口诀，并时常对你进行试探。你隐隐感觉到，这位看似慈祥的师傅，似乎对你另有所图...',
        options: [
          {
            text: '假装听话，暗中修炼',
            action: () => {
              // Success path
              useStore.setState({ bonusPoints: useStore.getState().bonusPoints + 1000 });
            }
          },
          {
            text: '将掌天瓶献给墨大夫',
            action: () => {
              // Failure path
              useStore.getState().die('你将掌天瓶献给墨大夫，墨大夫大喜过望。然而，在利用绿液培育出珍稀灵草后，他立刻对你进行了夺舍。你，陨落了。');
            }
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: '黄枫谷·隐忍修炼',
    nodes: [
      { id: 0, text: '历经九死一生，你终于摆脱了墨大夫的魔爪，并凭借升仙令，成功拜入了越国七大修仙门派之一的黄枫谷。' },
      { id: 1, text: '在黄枫谷中，你深知自己资质低劣，唯有依靠掌天瓶催熟灵草，炼制丹药，方能有一线生机。你选择了低调隐忍，默默修炼。' },
      { id: 2, text: '血色试炼即将开启，这是获取筑基丹主药的唯一途径。虽然危险重重，但为了筑基，你决定放手一搏。' },
      { id: 3, text: '在血色试炼中，你遭遇了掩月宗的南宫婉，两人共同面对墨蛟的威胁，结下了一段不解之缘...' }
    ]
  },
  {
    id: 3,
    title: '乱星海·亡命天涯',
    nodes: [
      { id: 0, text: '魔道六宗入侵越国，黄枫谷被迫撤离。你作为弃子，在千钧一发之际，通过古传送阵逃到了遥远的乱星海。' },
      { id: 1, text: '乱星海广阔无垠，妖兽横行。你在这里隐姓埋名，猎杀妖兽，搜集资源，修为稳步提升。' },
      { id: 2, text: '虚天殿开启，引来无数高阶修士。你机缘巧合之下进入其中，不仅获得了虚天鼎，还结识了紫灵仙子等人。' },
      { id: 3, text: '怀揣重宝，你成为了众矢之的。为了躲避追杀，你不得不再次踏上亡命天涯的旅程...' }
    ]
  }
];
