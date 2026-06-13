// 魔渊 Phaser 战斗 / Demon Abyss Phaser scene
// 单节阶战斗：上层每次只创建一次，传入 stage / monster mods / boss 信息
// 战斗完成后通过 onStageOver 回调上报结果

import * as Phaser from 'phaser';
import { sfx, playBgm, stopBgm } from './audio';

const FONT = '"Noto Serif SC", "Songti SC", "STSong", serif';
function vibrate(p: number | number[]) { try { (navigator as any).vibrate?.(p); } catch { /* ignore */ } }

export interface SkillSlot {
  id: string;
  name: string;
  desc: string;
  cooldown: number;
  type: 'pierce' | 'lifesteal' | 'aoe_small' | 'aoe_big' | 'basic';
  damage: number;
  color: string;
}

export interface DemonAbyssBattleOptions {
  parent: HTMLElement;
  width?: number; height?: number;

  // 玩家面板
  playerHealth: number;
  baseDmg: number;
  dmgBonus: number;
  passiveHealRate: number;
  fortuneSpeedMul: number;
  skills: SkillSlot[];

  // 节阶配置
  stage: 1 | 2 | 3;
  totalWaves: number;
  baseMonsterPower: number;
  hasBoss: boolean;
  bossInfo?: {
    name: string;
    hpMul: number;        // BOSS 血量倍数
    dmgMul: number;       // BOSS 伤害倍数
    bodyColor: number;
    glowColor: number;
  };

  // 剧情选项带来的修正
  monsterCountDelta: number;
  monsterPowerMul: number;
  spawnAllies: number;

  // 视觉主题
  bgColor: number;
  monsterBodyColor: number;
  monsterGlowColor: number;

  onStageOver: (result: { won: boolean; contribution: number }) => void;
}

interface MonsterData {
  hp: number; max: number; dmg: number; isBoss: boolean;
  hpBar?: Phaser.GameObjects.Rectangle;
  hpBarBg?: Phaser.GameObjects.Rectangle;
}

class DemonAbyssScene extends Phaser.Scene {
  private opts!: DemonAbyssBattleOptions;
  private W = 360; private H = 540;
  private playerX = 50;
  private spawnX = 380;
  private lanes: number[] = [];

  private heart!: Phaser.GameObjects.Container;
  private heartHp = 100;
  private heartMax = 100;
  private heartHpBarBg!: Phaser.GameObjects.Graphics;
  private heartHpBar!: Phaser.GameObjects.Graphics;

  private monsters!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private allies: { x: number; y: number; nextShot: number }[] = [];

  private contribution = 0;
  private wave = 0;
  private waveText!: Phaser.GameObjects.Text;
  private contribText!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
  private stageBadge!: Phaser.GameObjects.Text;

  private spawnQueue: { lane: number; tier: number; isBoss: boolean }[] = [];
  private nextSpawnAt = 0;
  private waveCleared = false;
  private waveCooldownEnd = 0;
  private nextBasicShot = 0;
  private over = false;

  private skillButtons: Phaser.GameObjects.Container[] = [];
  private skillCooldownEnd: number[] = [];
  private skillCdGraphics: Phaser.GameObjects.Graphics[] = [];
  private skillCdLabels: Phaser.GameObjects.Text[] = [];

  private healAccum = 0;

  constructor() { super({ key: 'demon_abyss' }); }

  init(data: DemonAbyssBattleOptions) {
    this.opts = data;
    this.W = data.width || 360;
    this.H = data.height || 540;
    this.playerX = Math.max(40, this.W * 0.13);
    this.spawnX = this.W + 30;
    this.lanes = [this.H * 0.32, this.H * 0.5, this.H * 0.68];
    this.heartMax = data.playerHealth;
    this.heartHp = data.playerHealth;
    this.contribution = 0;
    this.wave = 0;
    this.waveCleared = false;
    this.over = false;
    this.spawnQueue = [];
    this.skillCooldownEnd = data.skills.map(() => 0);
    this.skillButtons = [];
    this.skillCdGraphics = [];
    this.skillCdLabels = [];
    this.allies = [];
  }

  create() {
    const W = this.W, H = this.H;
    this.scale.resize(W, H);
    this.cameras.main.setBackgroundColor('#0d0307');

    this.drawBackground();
    playBgm(undefined, 0.05);

    // 玩家：界面之心
    this.heart = this.add.container(this.playerX, H / 2);
    const aura = this.add.circle(0, 0, 38, 0x10b981, 0.12);
    const ring = this.add.circle(0, 0, 28, 0x10b981, 0.25).setStrokeStyle(2, 0x6ee7b7, 0.7);
    const core = this.add.circle(0, 0, 20, 0x064e3b, 1).setStrokeStyle(1.5, 0xa7f3d0, 0.85);
    const sigil = this.add.text(0, 0, '道', { fontFamily: FONT, fontSize: '20px', color: '#a7f3d0', fontStyle: 'bold' }).setOrigin(0.5);
    this.heart.add([aura, ring, core, sigil]);
    this.tweens.add({ targets: aura, scale: { from: 0.85, to: 1.25 }, alpha: { from: 0.12, to: 0.28 }, yoyo: true, repeat: -1, duration: 1100 });
    this.tweens.add({ targets: ring, scale: { from: 1, to: 1.06 }, yoyo: true, repeat: -1, duration: 700 });

    this.physics.add.existing(this.heart);
    const heartBody = this.heart.body as Phaser.Physics.Arcade.Body;
    heartBody.setCircle(28, -28, -28);
    heartBody.setImmovable(true);

    // 友军 NPC（剧情选择带来）
    for (let i = 0; i < this.opts.spawnAllies; i++) {
      const ay = this.lanes[i % this.lanes.length];
      const ax = this.playerX + 50 + i * 18;
      const ally = this.add.container(ax, ay);
      const bg = this.add.circle(0, 0, 14, 0x60a5fa, 0.85).setStrokeStyle(2, 0xbfdbfe, 0.85);
      const lbl = this.add.text(0, 0, '同', { fontFamily: FONT, fontSize: '12px', color: '#dbeafe', fontStyle: 'bold' }).setOrigin(0.5);
      ally.add([bg, lbl]);
      this.allies.push({ x: ax, y: ay, nextShot: 0 });
    }

    // HP bar（在玩家下方）
    this.heartHpBarBg = this.add.graphics();
    this.heartHpBar = this.add.graphics();

    this.drawTopBar();

    this.monsters = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.physics.add.overlap(this.bullets, this.monsters, (b, m) => this.onBulletHit(b as any, m as any));
    this.physics.add.overlap(this.heart, this.monsters, (_h, m) => this.onMonsterHitHeart(m as any));

    this.createSkillBar();

    this.startWave();
  }

  private drawBackground() {
    const W = this.W, H = this.H;
    const g = this.add.graphics();
    const baseR = (this.opts.bgColor >> 16) & 0xff;
    const baseG = (this.opts.bgColor >> 8) & 0xff;
    const baseB = this.opts.bgColor & 0xff;
    // 渐变（基色为主，向下变深）
    for (let i = 0; i < 4; i++) {
      const f = 1 - i * 0.15;
      const c = ((baseR * f) << 16) | ((baseG * f) << 8) | (baseB * f);
      g.fillStyle(c, 1);
      g.fillRect(0, i * (H / 4), W, H / 4 + 1);
    }
    // 远处魔气
    g.fillStyle(this.opts.monsterGlowColor, 0.18);
    g.fillCircle(W * 0.92, H * 0.5, 200);
    g.fillStyle(this.opts.monsterGlowColor, 0.08);
    g.fillCircle(W * 0.85, H * 0.5, 130);

    // lanes
    this.lanes.forEach(y => {
      g.fillStyle(0x000000, 0.35);
      g.fillRect(0, y - 22, W, 44);
      g.lineStyle(1, this.opts.monsterGlowColor, 0.18);
      g.strokeRect(0, y - 22, W, 44);
    });

    // 圣域
    g.fillStyle(0x10b981, 0.05);
    g.fillRect(0, 0, this.playerX + 30, H);

    // 飘动魔焰
    this.time.addEvent({
      delay: 200, loop: true, callback: () => {
        if (this.over) return;
        const x = W * 0.7 + Math.random() * W * 0.3;
        const y = Math.random() * H;
        const ember = this.add.circle(x, y, 1.5 + Math.random(), this.opts.monsterGlowColor, 0.7);
        this.tweens.add({
          targets: ember, x: x - 80, y: y - 30,
          alpha: 0, duration: 1500 + Math.random() * 800,
          onComplete: () => ember.destroy(),
        });
      }
    });
  }

  private drawTopBar() {
    const W = this.W;
    this.add.rectangle(W / 2, 18, W, 36, 0x000000, 0.55);
    this.waveText = this.add.text(12, 8, '', { fontFamily: FONT, fontSize: '12px', color: '#fca5a5', fontStyle: 'bold' });
    this.contribText = this.add.text(W - 12, 22, '', { fontFamily: FONT, fontSize: '12px', color: '#fbbf24', fontStyle: 'bold' }).setOrigin(1, 0.5);
    this.add.text(W - 12, 8, '魔气', { fontFamily: FONT, fontSize: '10px', color: '#fde68a' }).setOrigin(1, 0);
    this.stageBadge = this.add.text(W / 2, 18, `节阶 ${this.opts.stage} / 3`, {
      fontFamily: FONT, fontSize: '11px', color: '#fde68a', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.banner = this.add.text(W / 2, 70, '', {
      fontFamily: FONT, fontSize: '18px', color: '#fde68a', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0);
  }

  private redrawHeartHpBar() {
    const pct = Phaser.Math.Clamp(this.heartHp / this.heartMax, 0, 1);
    const x = this.playerX, y = this.H / 2 + 42;
    this.heartHpBarBg.clear();
    this.heartHpBarBg.fillStyle(0x000000, 0.55);
    this.heartHpBarBg.fillRoundedRect(x - 30, y, 60, 6, 3);
    this.heartHpBarBg.lineStyle(1, 0x10b981, 0.4);
    this.heartHpBarBg.strokeRoundedRect(x - 30, y, 60, 6, 3);
    this.heartHpBar.clear();
    const c = pct > 0.5 ? 0x10b981 : pct > 0.25 ? 0xfbbf24 : 0xef4444;
    this.heartHpBar.fillStyle(c, 1);
    this.heartHpBar.fillRoundedRect(x - 29, y + 1, Math.max(0, 58 * pct), 4, 2);
    this.heartHpBar.fillStyle(0xffffff, 0.25);
    this.heartHpBar.fillRoundedRect(x - 29, y + 1, Math.max(0, 58 * pct), 1, 1);
  }

  private createSkillBar() {
    const skills = this.opts.skills.length > 0 ? this.opts.skills : [{
      id: 'basic', name: '剑指', desc: '凝指为剑',
      cooldown: 4000, type: 'basic', damage: this.opts.baseDmg * 4, color: '#94a3b8'
    } as SkillSlot];

    const W = this.W, H = this.H;
    const slot = 64;
    const gap = 12;
    const totalW = skills.length * slot + (skills.length - 1) * gap;
    const startX = (W - totalW) / 2 + slot / 2;
    const y = H - 50;

    skills.forEach((s, i) => {
      const x = startX + i * (slot + gap);
      const c = this.add.container(x, y);
      const colorInt = parseInt(s.color.slice(1), 16);
      const ringG = this.add.graphics();
      const bg = this.add.circle(0, 0, 28, 0x000000, 0.7).setStrokeStyle(2, colorInt, 0.85);
      const icon = this.add.text(0, -2, s.name.slice(0, 1), {
        fontFamily: FONT, fontSize: '20px', color: s.color, fontStyle: 'bold',
      }).setOrigin(0.5);
      const label = this.add.text(0, 26, s.name.slice(1, 3), {
        fontFamily: FONT, fontSize: '9px', color: s.color,
      }).setOrigin(0.5);
      const cdLabel = this.add.text(0, 0, '', {
        fontFamily: FONT, fontSize: '14px', color: '#f1f5f9', fontStyle: 'bold',
      }).setOrigin(0.5).setVisible(false);
      c.add([ringG, bg, icon, label, cdLabel]);
      c.setSize(slot, slot);
      c.setInteractive(new Phaser.Geom.Circle(0, 0, 32), Phaser.Geom.Circle.Contains);
      c.on('pointerdown', () => {
        this.tryCastSkill(i, skills[i]);
        this.tweens.add({ targets: bg, scale: { from: 0.85, to: 1 }, duration: 140, ease: 'Back' });
      });
      this.skillButtons.push(c);
      this.skillCdGraphics.push(ringG);
      this.skillCdLabels.push(cdLabel);
    });
  }

  private tryCastSkill(i: number, s: SkillSlot) {
    if (this.over) return;
    if (this.time.now < this.skillCooldownEnd[i]) return;
    this.skillCooldownEnd[i] = this.time.now + s.cooldown;
    vibrate(15);
    this.castSkill(s);
  }

  private castSkill(s: SkillSlot) {
    const dmg = Math.floor(s.damage * this.opts.dmgBonus);
    const colorInt = parseInt(s.color.slice(1), 16);
    if (s.type === 'pierce' || s.type === 'basic') {
      const target = this.findFrontMostMonster();
      if (!target) return;
      this.fireBeam(target.y, dmg, colorInt);
      sfx.attack();
    } else if (s.type === 'lifesteal') {
      const t = this.findFrontMostMonster();
      if (!t) return;
      this.damageMonster(t, dmg);
      const heal = Math.floor(dmg * 0.4);
      this.heartHp = Math.min(this.heartMax, this.heartHp + heal);
      this.popText(t.x, t.y - 22, `-${dmg}`, s.color, true);
      this.popText(this.playerX, this.H / 2 - 30, `+${heal}`, '#86efac', true);
      sfx.pillSuccess();
    } else if (s.type === 'aoe_small') {
      const t = this.findFrontMostMonster();
      if (!t) return;
      this.aoeAt(t.x, t.y, 70, dmg, colorInt);
      sfx.bossDown();
    } else if (s.type === 'aoe_big') {
      this.cameras.main.flash(220, 250, 240, 60);
      this.aoeAt(this.W * 0.6, this.H / 2, 280, dmg, colorInt);
      sfx.bossDown();
      vibrate([20, 40, 20, 40]);
    }
  }

  private fireBeam(y: number, dmg: number, color: number) {
    const beam = this.add.rectangle(this.playerX, y, this.W, 6, color, 0.9);
    const beam2 = this.add.rectangle(this.playerX, y, this.W, 14, color, 0.3);
    this.tweens.add({ targets: [beam, beam2], alpha: 0, duration: 380, onComplete: () => { beam.destroy(); beam2.destroy(); } });
    this.monsters.getChildren().forEach((m: any) => {
      if (Math.abs(m.y - y) < 22) this.damageMonster(m, dmg);
    });
  }

  private aoeAt(x: number, y: number, radius: number, dmg: number, color: number) {
    const ex = this.add.circle(x, y, radius, color, 0.4);
    const ring = this.add.circle(x, y, radius, color, 0).setStrokeStyle(3, color, 0.95);
    this.tweens.add({ targets: [ex, ring], alpha: 0, scale: 1.3, duration: 400, onComplete: () => { ex.destroy(); ring.destroy(); } });
    this.monsters.getChildren().forEach((m: any) => {
      if (Phaser.Math.Distance.Between(x, y, m.x, m.y) <= radius) this.damageMonster(m, dmg);
    });
  }

  private findFrontMostMonster(): Phaser.GameObjects.Container | undefined {
    let front: Phaser.GameObjects.Container | undefined;
    this.monsters.getChildren().forEach((m: any) => {
      if (!front || m.x < (front as any).x) front = m;
    });
    return front;
  }

  update(time: number, delta: number) {
    if (this.over) return;

    // 玩家自动剑气
    if (time > this.nextBasicShot) {
      this.nextBasicShot = time + 700;
      this.shootBasic();
    }

    // 友军自动射击
    this.allies.forEach(a => {
      if (time > a.nextShot) {
        a.nextShot = time + 1100;
        const target = this.findFrontMostMonster();
        if (target) {
          const beam = this.add.rectangle(a.x, a.y, this.W * 0.3, 4, 0x60a5fa, 0.8);
          this.tweens.add({ targets: beam, alpha: 0, duration: 320, onComplete: () => beam.destroy() });
          // 友军伤害固定
          this.damageMonster(target as any, Math.floor(this.opts.baseDmg * 2));
        }
      }
    });

    if (this.spawnQueue.length > 0 && time > this.nextSpawnAt) {
      const s = this.spawnQueue.shift()!;
      this.spawnMonster(s.lane, s.tier, s.isBoss);
      this.nextSpawnAt = time + 600;
    }

    if (!this.waveCleared && this.spawnQueue.length === 0 && this.monsters.countActive(true) === 0) {
      this.waveCleared = true;
      this.waveCooldownEnd = time + 2000;
      this.heartHp = Math.min(this.heartMax, this.heartHp + this.heartMax * 0.08);
      this.flashBanner(`第 ${this.wave} 波清场`, '#86efac');
    }
    if (this.waveCleared && time > this.waveCooldownEnd) this.startWave();

    if (this.opts.passiveHealRate > 0) {
      this.healAccum += (delta / 1000) * this.heartMax * this.opts.passiveHealRate;
      if (this.healAccum >= 1) {
        const h = Math.floor(this.healAccum);
        this.healAccum -= h;
        this.heartHp = Math.min(this.heartMax, this.heartHp + h);
      }
    }

    this.monsters.getChildren().forEach((m: any) => {
      const d: MonsterData = m.getData('mdata');
      if (d?.hpBarBg && d?.hpBar) {
        d.hpBarBg.setPosition(m.x, m.y - 22);
        d.hpBar.setPosition(m.x - 14, m.y - 22);
        d.hpBar.width = 28 * Math.max(0, d.hp / d.max);
      }
    });

    this.skillCooldownEnd.forEach((end, i) => {
      const remain = end - time;
      const g = this.skillCdGraphics[i];
      const l = this.skillCdLabels[i];
      g.clear();
      if (remain > 0) {
        const total = (this.opts.skills[i] || { cooldown: 4000 }).cooldown;
        const pct = Phaser.Math.Clamp(remain / total, 0, 1);
        const colorInt = parseInt((this.opts.skills[i]?.color || '#94a3b8').slice(1), 16);
        g.fillStyle(0x000000, 0.55);
        g.fillCircle(0, 0, 28);
        g.lineStyle(3, colorInt, 0.95);
        g.beginPath();
        g.arc(0, 0, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct, false);
        g.strokePath();
        l.setVisible(true);
        l.setText((remain / 1000).toFixed(1));
      } else {
        l.setVisible(false);
      }
    });

    this.waveText.setText(`第 ${this.wave} 波 / ${this.opts.totalWaves}`);
    this.contribText.setText(String(this.contribution));
    this.redrawHeartHpBar();
  }

  private startWave() {
    this.wave += 1;
    this.waveCleared = false;
    if (this.wave > this.opts.totalWaves) {
      this.endStage(true);
      return;
    }
    // 节阶 3 最终波 = BOSS
    const isLastWaveOfBossStage = this.opts.hasBoss && this.wave === this.opts.totalWaves;
    let count = 3 + this.wave + this.opts.monsterCountDelta;
    if (count < 1) count = 1;
    if (isLastWaveOfBossStage) {
      // BOSS 单刷
      this.spawnQueue.push({ lane: 1, tier: this.wave, isBoss: true });
      this.flashBanner(`${this.opts.bossInfo?.name || '魔头'} 降临！`, '#fca5a5');
      return;
    }
    for (let i = 0; i < count; i++) {
      const lane = i % 3;
      const isBoss = !this.opts.hasBoss && i === count - 1 && this.wave === this.opts.totalWaves;
      this.spawnQueue.push({ lane, tier: this.wave - 1, isBoss });
    }
    this.flashBanner(`第 ${this.wave} 波 来袭`, '#fca5a5');
  }

  private spawnMonster(lane: number, tier: number, isBoss: boolean) {
    const y = this.lanes[lane];
    const radius = isBoss ? 24 : 11;
    const m = this.add.container(this.spawnX, y);

    // 触手
    const tentacles: Phaser.GameObjects.Graphics[] = [];
    for (let i = 0; i < 4; i++) {
      const t = this.add.graphics();
      tentacles.push(t);
      m.add(t);
    }
    const bossBody = isBoss && this.opts.bossInfo
      ? { body: this.opts.bossInfo.bodyColor, glow: this.opts.bossInfo.glowColor }
      : { body: this.opts.monsterBodyColor, glow: this.opts.monsterGlowColor };
    const glow = this.add.circle(0, 0, radius + 8, bossBody.glow, 0.25);
    const body = this.add.circle(0, 0, radius, bossBody.body, 0.95)
      .setStrokeStyle(2, bossBody.glow, 0.85);
    const eye = this.add.circle(0, -radius * 0.2, radius * 0.35, 0xfde68a, 0.95);
    const pupil = this.add.circle(0, -radius * 0.2, radius * 0.18, 0x000000, 1);
    m.add([glow, body, eye, pupil]);
    if (isBoss) {
      const crown = this.add.text(0, -radius - 8, '魔', { fontFamily: FONT, fontSize: '14px', color: '#fde68a', fontStyle: 'bold' }).setOrigin(0.5);
      m.add(crown);
    }
    this.tweens.add({ targets: glow, scale: { from: 0.85, to: 1.2 }, duration: 600, yoyo: true, repeat: -1 });

    this.tweens.add({
      targets: tentacles, duration: 600 + Math.random() * 300, yoyo: true, repeat: -1,
      onUpdate: (tween: any) => {
        const phase = tween.totalProgress * Math.PI * 2;
        tentacles.forEach((t, i) => {
          t.clear();
          t.lineStyle(2, bossBody.glow, 0.85);
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 2;
          const baseX = Math.cos(angle) * radius;
          const baseY = Math.sin(angle) * radius;
          const tipX = baseX + Math.cos(angle) * (radius * 0.7) + Math.sin(phase + i) * 4;
          const tipY = baseY + Math.sin(angle) * (radius * 0.7) + Math.cos(phase + i) * 4;
          t.beginPath(); t.moveTo(baseX, baseY); t.lineTo(tipX, tipY); t.strokePath();
        });
      }
    });

    this.physics.add.existing(m);
    const bodyP = m.body as Phaser.Physics.Arcade.Body;
    bodyP.setCircle(radius, -radius, -radius);
    const power = this.opts.baseMonsterPower * this.opts.monsterPowerMul;
    const baseHp = (isBoss ? 110 : 22) * (1 + tier * 0.3) * power * (this.opts.bossInfo && isBoss ? this.opts.bossInfo.hpMul : 1);
    const speed = (isBoss ? 22 : 38) * (1 + tier * 0.04) * this.opts.fortuneSpeedMul;
    bodyP.setVelocity(-speed, 0);

    const hpBg = this.add.rectangle(m.x, m.y - 22, 28, 3, 0x000000, 0.55);
    const hpBar = this.add.rectangle(m.x - 14, m.y - 22, 28, 3, 0xef4444).setOrigin(0, 0.5);

    const dmgBase = (isBoss ? 28 : 10) + tier * 4;
    const data: MonsterData = {
      hp: baseHp, max: baseHp,
      dmg: dmgBase * (this.opts.bossInfo && isBoss ? this.opts.bossInfo.dmgMul : 1),
      isBoss, hpBg, hpBar,
    } as any;
    m.setData('mdata', data);
    this.monsters.add(m as any);
  }

  private shootBasic() {
    const target = this.findFrontMostMonster();
    if (!target) return;
    const b = this.add.container(this.playerX + 24, this.H / 2);
    const sword = this.add.graphics();
    sword.fillStyle(0xfde68a, 1);
    sword.fillTriangle(-8, -2, 10, 0, -8, 2);
    sword.fillStyle(0xfef9c3, 0.5);
    sword.fillTriangle(-12, -1, 8, 0, -12, 1);
    b.add(sword);
    this.physics.add.existing(b);
    this.bullets.add(b as any);
    const body = b.body as Phaser.Physics.Arcade.Body;
    body.setSize(20, 4);
    body.setOffset(-10, -2);

    const dx = (target as any).x - b.x;
    const dy = (target as any).y - b.y;
    const len = Math.hypot(dx, dy) || 1;
    body.setVelocity((dx / len) * 420, (dy / len) * 420);
    b.setRotation(Math.atan2(dy, dx));
    (b as any).damage = Math.floor(this.opts.baseDmg * this.opts.dmgBonus);

    const trailEvent = this.time.addEvent({
      delay: 30, loop: true, callback: () => {
        if (!b.active) return;
        const t = this.add.circle(b.x, b.y, 2, 0xfde68a, 0.7);
        this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
      }
    });
    this.time.delayedCall(2500, () => { trailEvent.remove(); b.destroy(); });
  }

  private onBulletHit(bullet: any, m: any) {
    if (!m.active) return;
    const dmg = bullet.damage || 1;
    bullet.destroy();
    this.damageMonster(m, dmg);
  }

  private damageMonster(m: any, dmg: number) {
    if (!m.active) return;
    const d: MonsterData = m.getData('mdata');
    if (!d) return;
    d.hp -= dmg;
    this.contribution += dmg;
    if (d.hp <= 0) {
      sfx.hit();
      vibrate(d.isBoss ? [20, 40, 20] : 8);
      const ex = this.add.circle(m.x, m.y, d.isBoss ? 32 : 14, 0xfde68a, 0.7);
      this.tweens.add({ targets: ex, alpha: 0, scale: 1.6, duration: 280, onComplete: () => ex.destroy() });
      for (let i = 0; i < (d.isBoss ? 12 : 6); i++) {
        const a = (i / (d.isBoss ? 12 : 6)) * Math.PI * 2;
        const p = this.add.circle(m.x, m.y, 2, this.opts.monsterGlowColor, 1);
        this.tweens.add({
          targets: p, x: m.x + Math.cos(a) * (d.isBoss ? 50 : 26), y: m.y + Math.sin(a) * (d.isBoss ? 50 : 26),
          alpha: 0, duration: 350, onComplete: () => p.destroy(),
        });
      }
      d.hpBar?.destroy(); d.hpBarBg?.destroy();
      m.destroy();
      // 杀 BOSS 触发胜利结算
      if (d.isBoss && this.opts.hasBoss) {
        this.time.delayedCall(800, () => this.endStage(true));
      }
    } else {
      const list = m.list as any[];
      list.forEach((c: any) => {
        if (c.fillColor !== undefined) {
          const old = c.fillColor;
          c.fillColor = 0xffffff;
          this.time.delayedCall(60, () => { if (m.active) c.fillColor = old; });
        }
      });
    }
  }

  private onMonsterHitHeart(m: any) {
    if (!m.active) return;
    const d: MonsterData = m.getData('mdata');
    if (!d) return;
    sfx.hit(); vibrate([30, 50, 30]);
    this.heartHp -= d.dmg;
    this.cameras.main.shake(160, 0.006);
    this.popText(this.playerX, this.H / 2 - 50, `-${d.dmg}`, '#fda4af', true);
    d.hpBar?.destroy(); d.hpBarBg?.destroy();
    m.destroy();
    if (this.heartHp <= 0) this.endStage(false);
  }

  private flashBanner(text: string, color: string) {
    this.banner.setText(text).setColor(color).setAlpha(0).setScale(0.8);
    this.tweens.add({
      targets: this.banner,
      alpha: { from: 0, to: 1 }, scale: { from: 0.8, to: 1 },
      duration: 250, yoyo: true, hold: 700,
    });
  }

  private popText(x: number, y: number, text: string, color: string, big = false) {
    const t = this.add.text(x, y, text, {
      fontFamily: FONT, fontSize: big ? '15px' : '12px', color, fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({
      targets: t, y: y - 24, alpha: 0,
      duration: 700, ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });
  }

  private endStage(won: boolean) {
    if (this.over) return;
    this.over = true;
    stopBgm();
    if (won) sfx.bossDown(); else sfx.death();
    const W = this.W, H = this.H;
    const veil = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(100);
    this.tweens.add({ targets: veil, alpha: 0.7, duration: 400 });
    const t1 = this.add.text(W / 2, H / 2 - 36, won ? '节阶渡过' : '魔气吞噬', {
      fontFamily: FONT, fontSize: '28px', fontStyle: 'bold',
      color: won ? '#34d399' : '#f87171', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    const t2 = this.add.text(W / 2, H / 2 + 8, `魔气 ${this.contribution}`, {
      fontFamily: FONT, fontSize: '13px', color: '#cbd5e1',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 500, delay: 200 });
    this.time.delayedCall(1500, () => {
      this.opts.onStageOver({ won, contribution: this.contribution });
    });
  }
}

export function createDemonAbyssGame(opts: DemonAbyssBattleOptions): Phaser.Game {
  const W = opts.width || 360;
  const H = opts.height || 540;
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: W, height: H,
    parent: opts.parent,
    backgroundColor: '#0d0307',
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scale: { mode: Phaser.Scale.NONE },
  });
  const startScene = () => {
    if (!game.scene.getScene('demon_abyss')) game.scene.add('demon_abyss', DemonAbyssScene, false);
    game.scene.start('demon_abyss', opts);
  };
  if (game.isBooted) startScene();
  else game.events.once('ready', startScene);
  return game;
}
