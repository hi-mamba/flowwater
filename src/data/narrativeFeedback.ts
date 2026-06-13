export type NarrativePhase = 'human_early' | 'human_mid' | 'human_late' | 'spirit_world';
export type DrinkType = 'water' | 'tea' | 'coffee' | 'milktea';
export type SceneType = 'daily_caption' | 'chapter_progress' | 'character_encounter' | 'breakthrough';
export type PresentationLevel = 'daily' | 'chapter' | 'milestone';

export interface NarrativeFeedbackInput {
  drinkType: DrinkType;
  amount: number;
  phase: NarrativePhase;
  majorRealm: string;
  minorLevel: number;
  chapterStep: number;
  rewardValue: number;
  isMilestone: boolean;
}

export interface NarrativeFeedbackEvent {
  id: string;
  phase: NarrativePhase;
  sceneType: SceneType;
  title: string;
  caption: string;
  body?: string;
  chapterId: string;
  rewardValue: number;
  presentationLevel: PresentationLevel;
}

export interface ChapterSnapshot {
  id: string;
  phase: NarrativePhase;
  title: string;
  summary: string;
  currentSegment: string;
  progressCurrent: number;
  progressTarget: number;
}

interface ChapterDefinition {
  id: string;
  phase: NarrativePhase;
  title: string;
  summary: string;
  segments: string[];
  milestoneTitle: string;
  milestoneBody: string;
}

const CHAPTERS: Record<NarrativePhase, ChapterDefinition> = {
  human_early: {
    id: 'mortal-awakening',
    phase: 'human_early',
    title: '凡人初醒',
    summary: '自山村启程，以每日吐纳打通第一缕灵气。',
    segments: [
      '残卷初开，灵气尚浅，只能一点点试着引气入体。',
      '夜色沉静，经脉微热，像是终于听见天地灵气的回音。',
      '灵泉入腹，气息转顺，凡人之身开始有了修行的痕迹。',
      '吐纳日久，根基渐稳，离真正踏入炼气期只差临门一脚。',
    ],
    milestoneTitle: '引气入体',
    milestoneBody: '一缕灵气终于沉入丹田。你不再只是凡人，修行之路真正开始了。',
  },
  human_mid: {
    id: 'yellow-maple-gate',
    phase: 'human_mid',
    title: '黄枫谷立足',
    summary: '在黄枫谷外门谨慎修行，慢慢换来资源与身份。',
    segments: [
      '黄枫谷山门已近，凡事仍需藏锋，不可让人看穿底牌。',
      '外门日常繁杂，却也让你学会在规矩之内默默积累。',
      '坊市走动渐多，灵石与丹药终于不再那样捉襟见肘。',
      '门中风声渐紧，血色禁地的名额，似乎正向你逼近。',
    ],
    milestoneTitle: '黄枫谷召令',
    milestoneBody: '一道师门召令落下，你终于真正被黄枫谷看见，身份也随之不同。',
  },
  human_late: {
    id: 'bloody-trials',
    phase: 'human_late',
    title: '血色禁地前夕',
    summary: '资源、风险与机缘同时逼近，修行开始带上真正的锋芒。',
    segments: [
      '血色禁地将启，人人都在盘算机缘，你也必须更稳一点。',
      '丹田灵力翻涌不休，像是在提醒你：筑基契机不会等人。',
      '古修残宝与秘境传闻四起，人界真正的争夺才刚刚露面。',
      '再往前一步，便不只是炼气修士，而是有资格改命的人。',
    ],
    milestoneTitle: '筑基契机',
    milestoneBody: '灵气忽然归于一线，体内桎梏松动。你隐约看见了筑基的大门。',
  },
  spirit_world: {
    id: 'spirit-world-arrival',
    phase: 'spirit_world',
    title: '灵界初临',
    summary: '飞升之后，天地更广，灵气更沉，真正的大道才缓缓铺开。',
    segments: [
      '灵界灵压远胜人界，一呼一吸都比往日沉重许多。',
      '此地强者如云，再多积累也不算多，唯有继续稳住心神。',
      '界域风貌陌生而浩大，每一点修为都来得更慢也更珍贵。',
      '你已走出人界，却也只是刚刚站在更高天地的门槛上。',
    ],
    milestoneTitle: '飞升灵界',
    milestoneBody: '界面压迫骤然散开，你终于立于灵界。更大的世界，也意味着更长的修行。',
  },
};

const DAILY_CAPTIONS: Record<NarrativePhase, string[]> = {
  human_early: [
    '灵泉入腹，经脉稍暖，修为 +{reward}',
    '吐纳平顺，第一缕灵气慢慢沉入体内，修为 +{reward}',
    '夜色未深，气息已定，离真正踏入炼气又近一步，修为 +{reward}',
  ],
  human_mid: [
    '【黄枫谷外门】今夜吐纳尚稳，修为 +{reward}',
    '【黄枫谷外门】灵气循经而走，根基又厚了一层，修为 +{reward}',
    '【黄枫谷坊市】资源虽少，胜在积累未断，修为 +{reward}',
  ],
  human_late: [
    '【血色禁地前夕】灵气略盛，心神却需更定，修为 +{reward}',
    '【筑基前夜】经脉愈发通畅，离突破又近一步，修为 +{reward}',
    '【人界机缘】丹田灵力翻涌，却终究被你稳稳压下，修为 +{reward}',
  ],
  spirit_world: [
    '【灵界初临】灵压沉沉，吐纳却更显珍贵，修为 +{reward}',
    '【灵界修行】灵气归府如潮退，修为 +{reward}',
    '【灵界界域】天地更广，唯有心神愈静，修为 +{reward}',
  ],
};

const DRINK_FLAVOR_PREFIX: Record<DrinkType, string> = {
  water: '灵泉',
  tea: '灵茶',
  coffee: '灵咖',
  milktea: '仙乳茶',
};

export function getChapterSnapshot(phase: NarrativePhase, chapterStep: number): ChapterSnapshot {
  const chapter = CHAPTERS[phase];
  const progressTarget = chapter.segments.length;
  const boundedStep = Math.max(0, Math.min(chapterStep, progressTarget - 1));

  return {
    id: chapter.id,
    phase,
    title: chapter.title,
    summary: chapter.summary,
    currentSegment: chapter.segments[boundedStep],
    progressCurrent: Math.min(boundedStep + 1, progressTarget),
    progressTarget,
  };
}

export function getNarrativeFeedback(input: NarrativeFeedbackInput): NarrativeFeedbackEvent {
  const chapter = getChapterSnapshot(input.phase, input.chapterStep);

  if (input.isMilestone) {
    const milestone = CHAPTERS[input.phase];
    return {
      id: `${milestone.id}-milestone-${input.chapterStep}-${input.rewardValue}`,
      phase: input.phase,
      sceneType: 'breakthrough',
      title: milestone.milestoneTitle,
      caption: `${milestone.milestoneTitle} · 修为 +${Math.round(input.rewardValue)}`,
      body: milestone.milestoneBody,
      chapterId: milestone.id,
      rewardValue: input.rewardValue,
      presentationLevel: 'milestone',
    };
  }

  const captions = DAILY_CAPTIONS[input.phase];
  const index = Math.abs((input.chapterStep + input.amount + input.minorLevel) % captions.length);
  const rawCaption = captions[index]
    .replace('{reward}', `${Math.round(input.rewardValue)}`)
    .replace('{drink}', DRINK_FLAVOR_PREFIX[input.drinkType]);

  return {
    id: `${chapter.id}-${input.chapterStep}-${input.rewardValue}-${input.drinkType}`,
    phase: input.phase,
    sceneType: 'daily_caption',
    title: chapter.title,
    caption: rawCaption,
    body: chapter.currentSegment,
    chapterId: chapter.id,
    rewardValue: input.rewardValue,
    presentationLevel: 'daily',
  };
}
