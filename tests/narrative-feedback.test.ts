import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getNarrativeFeedback,
  getChapterSnapshot,
  type NarrativePhase,
} from '../src/data/narrativeFeedback.ts';

test('returns a daily caption with chapter context for human-realm early phase', () => {
  const feedback = getNarrativeFeedback({
    drinkType: 'water',
    amount: 250,
    phase: 'human_early',
    majorRealm: '炼气',
    minorLevel: 3,
    chapterStep: 0,
    rewardValue: 18,
    isMilestone: false,
  });

  assert.equal(feedback.sceneType, 'daily_caption');
  assert.match(feedback.caption, /修为 \+18/);
  assert.match(feedback.title, /凡人|黄枫谷|炼气|血色禁地/);
});

test('upgrades to milestone presentation when milestone flag is true', () => {
  const feedback = getNarrativeFeedback({
    drinkType: 'tea',
    amount: 250,
    phase: 'human_mid',
    majorRealm: '筑基',
    minorLevel: 1,
    chapterStep: 2,
    rewardValue: 24,
    isMilestone: true,
  });

  assert.equal(feedback.presentationLevel, 'milestone');
  assert.equal(feedback.sceneType, 'breakthrough');
  assert.ok(feedback.body);
});

test('returns chapter snapshot with bounded progress and segment text', () => {
  const snapshot = getChapterSnapshot('human_mid', 3);

  assert.equal(snapshot.phase, 'human_mid');
  assert.ok(snapshot.title.length > 0);
  assert.ok(snapshot.currentSegment.length > 0);
  assert.ok(snapshot.progressCurrent <= snapshot.progressTarget);
});

test('supports all narrative phases with a valid chapter snapshot', () => {
  const phases: NarrativePhase[] = ['human_early', 'human_mid', 'human_late', 'spirit_world'];

  for (const phase of phases) {
    const snapshot = getChapterSnapshot(phase, 1);
    assert.equal(snapshot.phase, phase);
    assert.ok(snapshot.summary.length > 0);
  }
});
