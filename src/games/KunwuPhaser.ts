// 昆吾山斗法 - 重制版
// - 响应式（适配父容器宽高，最大 480×640）
// - 衬线字体 + 玄青/暗金/血红配色
// - 玩家：剑修拖尾粒子 + 自身光晕
// - Boss：魔焰光晕 + 名字标签 + 阶段提示
// - HP 条：渐变 + 边框 + 心跳动画
// - 触屏：摇杆 64px、按钮 56px，半透明不挡视线
// - 命中：屏幕震动 + navigator.vibrate

import * as Phaser from 'phaser';
import { sfx, playBgm, stopBgm } from './audio';

export interface KunwuOptions {
  parent: HTMLElement;
  baseHealth: number;
  baseDmg: number;
  dmgBonus: number;
  defBonus: number;
  width?: number;
  height?: number;
  onGameOver: (rewardStones: number) => void;
}

const FONT = '"Noto Serif SC", "Songti SC", "STSong", serif';

function vibrate(pattern: number | number[]) {
  try { (navigator as any).vibrate?.(pattern); } catch { /* ignore */ }
}

const BOSS_NAMES = ['古魔·噬月', '古魔·焚天', '古魔·裂界', '古魔·吞星', '古魔·灭世'];

class KunwuScene extends Phaser.Scene {
  private opts!: KunwuOptions;
  private W = 360;
  private H = 540;

  private player!: Phaser.GameObjects.Container;
  private playerCore!: Phaser.GameObjects.Arc;
  private playerGlow!: Phaser.GameObjects.Arc;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private trailEmitter?: any;

  private boss!: Phaser.GameObjects.Container;
  private bossCore!: Phaser.GameObjects.Arc;
  private bossGlow!: Phaser.GameObjects.Arc;
  private bossBody!: Phaser.Physics.Arcade.Body;
  private bossNameText!: Phaser.GameObjects.Text;

  private bullets!: Phaser.Physics.Arcade.Group;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;

  private hp = 100; private maxHp = 100;
  private bossHp = 500; private bossMaxHp = 500;
  private stones = 0;
  private invincibleUntil = 0;
  private dodgeCdUntil = 0;
  private attackCdUntil = 0;
  private skillTimer = 0;
  private over = false;

  // UI
  private hpBarBg!: Phaser.GameObjects.Graphics;
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private bossHpBarBg!: Phaser.GameObjects.Graphics;
  private bossHpBar!: Phaser.GameObjects.Graphics;
  private stagePill!: Phaser.GameObjects.Container;
  private stonesIcon!: Phaser.GameObjects.Text;

  private joystick = { up: false, down: false, left: false, right: false };
  private joyStickActive = false;
  private dodgeBtn!: Phaser.GameObjects.Container;
  private attackBtn!: Phaser.GameObjects.Container;
  private dodgeRing!: Phaser.GameObjects.Graphics;
  private attackRing!: Phaser.GameObjects.Graphics;

  constructor() { super({ key: 'kunwu' }); }

  init(data: KunwuOptions) {
    this.opts = data;
    this.W = data.width || 360;
    this.H = data.height || 540;
    this.maxHp = data.baseHealth;
    this.hp = this.maxHp;
    this.bossHp = 500;
    this.bossMaxHp = 500;
    this.stones = 0;
    this.over = false;
  }

  create() {
    const W = this.W, H = this.H;
    this.scale.resize(W, H);

    this.cameras.main.setBackgroundColor('#0a0e1a');
    this.drawBackground();

    playBgm(undefined, 0.05);

    // ----- Boss -----
    this.boss = this.add.container(W / 2, H * 0.22);
    this.bossGlow = this.add.circle(0, 0, 50, 0xa855f7, 0.18);
    const bossOuter = this.add.circle(0, 0, 32, 0x4c1d95, 0.85).setStrokeStyle(2, 0xa78bfa, 0.7);
    this.bossCore = this.add.circle(0, 0, 22, 0xa855f7, 0.95);
    const bossSigil = this.add.text(0, 0, '魔', { fontSize: '20px', color: '#fdf4ff', fontFamily: FONT, fontStyle: 'bold' }).setOrigin(0.5);
    this.boss.add([this.bossGlow, bossOuter, this.bossCore, bossSigil]);
    this.physics.add.existing(this.boss);
    this.bossBody = (this.boss.body as Phaser.Physics.Arcade.Body);
    this.bossBody.setCircle(28, -28, -28);
    this.bossBody.setImmovable(true);
    this.tweens.add({ targets: this.bossGlow, scale: { from: 0.9, to: 1.2 }, alpha: { from: 0.18, to: 0.32 }, duration: 1100, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: this.bossCore, scale: { from: 1, to: 1.05 }, duration: 600, yoyo: true, repeat: -1 });

    this.bossNameText = this.add.text(W / 2, H * 0.22 - 56, BOSS_NAMES[0], {
      fontFamily: FONT, fontSize: '14px', color: '#fda4af', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ----- Player -----
    this.player = this.add.container(W / 2, H - 110);
    this.playerGlow = this.add.circle(0, 0, 22, 0x10b981, 0.22);
    const playerRing = this.add.circle(0, 0, 14, 0x064e3b, 1).setStrokeStyle(1.5, 0x6ee7b7, 0.9);
    this.playerCore = this.add.circle(0, 0, 9, 0x6ee7b7, 1);
    this.player.add([this.playerGlow, playerRing, this.playerCore]);
    this.physics.add.existing(this.player);
    this.playerBody = (this.player.body as Phaser.Physics.Arcade.Body);
    this.playerBody.setCircle(14, -14, -14);
    this.playerBody.setCollideWorldBounds(true);
    this.tweens.add({ targets: this.playerGlow, scale: { from: 0.9, to: 1.15 }, duration: 700, yoyo: true, repeat: -1 });

    // 拖尾：定期生成淡入淡出的小圆点跟随玩家
    this.time.addEvent({
      delay: 70, loop: true, callback: () => {
        if (this.over) return;
        const sx = this.player.x, sy = this.player.y;
        const t = this.add.circle(sx, sy, 4 + Math.random() * 2, 0x34d399, 0.55);
        this.tweens.add({ targets: t, alpha: 0, scale: 0.3, duration: 380, onComplete: () => t.destroy() });
      }
    });

    // ----- 弹幕 -----
    this.bullets = this.physics.add.group();
    this.physics.add.overlap(this.player, this.bullets, (_p, b) => this.onHitByBullet(b as any));

    // ----- 输入 -----
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey('W');
    this.keyA = this.input.keyboard!.addKey('A');
    this.keyS = this.input.keyboard!.addKey('S');
    this.keyD = this.input.keyboard!.addKey('D');
    this.keySpace = this.input.keyboard!.addKey('SPACE');
    this.keyShift = this.input.keyboard!.addKey('SHIFT');

    // ----- UI 顶栏 -----
    this.drawTopBar();
    this.drawMobileControls();

    // 阶段提示药丸
    this.stagePill = this.add.container(W / 2, 80);
    const pillBg = this.add.rectangle(0, 0, 120, 22, 0x000000, 0.55).setStrokeStyle(1, 0xa78bfa, 0.5);
    const pillText = this.add.text(0, 0, '第一阶段', { fontFamily: FONT, fontSize: '12px', color: '#e9d5ff' }).setOrigin(0.5);
    this.stagePill.add([pillBg, pillText]);

    // 玩家提示文本（PC 用键盘，手机隐藏）
    if (!this.sys.game.device.input.touch) {
      this.add.text(W / 2, H - 12, '方向键 / WASD 走位 · 空格普攻 · Shift 闪避', {
        fontFamily: FONT, fontSize: '10px', color: '#475569',
      }).setOrigin(0.5);
    }

    this.skillTimer = this.time.now + 1500;
  }

  // 水墨笔触山峦
  private drawBackground() {
    const W = this.W, H = this.H;
    const g = this.add.graphics();
    // 远山
    g.fillStyle(0x1e293b, 0.55);
    g.fillTriangle(-20, H, W * 0.45, H * 0.45, W * 0.78, H);
    g.fillStyle(0x172033, 0.7);
    g.fillTriangle(W * 0.25, H, W * 0.62, H * 0.55, W * 0.95, H);
    // 近山
    g.fillStyle(0x0c1322, 1);
    g.fillTriangle(-30, H, W * 0.3, H * 0.78, W * 0.55, H);
    g.fillStyle(0x0a101c, 1);
    g.fillTriangle(W * 0.45, H, W * 0.85, H * 0.82, W + 30, H);
    // 月晕
    g.fillStyle(0xfbbf24, 0.04);
    g.fillCircle(W / 2, H * 0.18, 100);
    g.fillStyle(0xfbbf24, 0.07);
    g.fillCircle(W / 2, H * 0.18, 50);
    // 星点
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H * 0.5;
      g.fillStyle(0xffffff, 0.15 + Math.random() * 0.5);
      g.fillCircle(x, y, Math.random() * 1.2 + 0.3);
    }
    // 雾
    g.fillStyle(0xa855f7, 0.04);
    g.fillRect(0, H * 0.4, W, H * 0.2);
  }

  // ----- 顶栏 (HP 条 + 昆吾石计数) -----
  private drawTopBar() {
    const W = this.W;
    // 玩家气血条
    this.hpBarBg = this.add.graphics();
    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(16, 14, '', { fontFamily: FONT, fontSize: '12px', color: '#a7f3d0' });
    // boss 血条
    this.bossHpBarBg = this.add.graphics();
    this.bossHpBar = this.add.graphics();

    // 昆吾石
    this.add.text(W - 14, 16, '🪨', { fontSize: '14px' }).setOrigin(1, 0);
    this.stonesIcon = this.add.text(W - 32, 14, '0', { fontFamily: FONT, fontSize: '14px', color: '#fbbf24', fontStyle: 'bold' }).setOrigin(1, 0);
  }

  private redrawHpBars() {
    const W = this.W;
    // 玩家 hp
    const phpPct = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x000000, 0.55);
    this.hpBarBg.fillRoundedRect(14, 32, 140, 8, 4);
    this.hpBarBg.lineStyle(1, 0x10b981, 0.3);
    this.hpBarBg.strokeRoundedRect(14, 32, 140, 8, 4);
    this.hpBar.clear();
    const hpColor = phpPct > 0.5 ? 0x10b981 : phpPct > 0.25 ? 0xfbbf24 : 0xef4444;
    this.hpBar.fillStyle(hpColor, 1);
    this.hpBar.fillRoundedRect(15, 33, Math.max(0, 138 * phpPct), 6, 3);
    // 内高光
    this.hpBar.fillStyle(0xffffff, 0.2);
    this.hpBar.fillRoundedRect(15, 33, Math.max(0, 138 * phpPct), 2, 2);

    // boss hp
    const bhpPct = Phaser.Math.Clamp(this.bossHp / this.bossMaxHp, 0, 1);
    this.bossHpBarBg.clear();
    this.bossHpBarBg.fillStyle(0x000000, 0.55);
    this.bossHpBarBg.fillRoundedRect(W / 2 - 80, 50, 160, 6, 3);
    this.bossHpBarBg.lineStyle(1, 0xef4444, 0.4);
    this.bossHpBarBg.strokeRoundedRect(W / 2 - 80, 50, 160, 6, 3);
    this.bossHpBar.clear();
    this.bossHpBar.fillStyle(0xef4444, 1);
    this.bossHpBar.fillRoundedRect(W / 2 - 79, 51, Math.max(0, 158 * bhpPct), 4, 2);
    this.bossHpBar.fillStyle(0xfca5a5, 0.4);
    this.bossHpBar.fillRoundedRect(W / 2 - 79, 51, Math.max(0, 158 * bhpPct), 1, 1);
  }

  // ----- 触屏控件 -----
  private drawMobileControls() {
    const W = this.W, H = this.H;
    const padR = 56, padX = 78, padY = H - 90;

    const padOuter = this.add.graphics();
    padOuter.fillStyle(0xffffff, 0.05);
    padOuter.fillCircle(padX, padY, padR);
    padOuter.lineStyle(2, 0x6ee7b7, 0.25);
    padOuter.strokeCircle(padX, padY, padR);

    const knob = this.add.circle(padX, padY, 24, 0xffffff, 0.25).setStrokeStyle(1.5, 0xa7f3d0, 0.6);

    // 整个左下角作为 stick 区域，放宽点击范围
    const stickZone = this.add.zone(0, H - 180, W * 0.5, 180).setOrigin(0).setInteractive();
    stickZone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.joyStickActive = true;
      this.updateJoystick(p.x, p.y, padX, padY, padR, knob);
    });
    stickZone.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.joyStickActive && p.isDown) this.updateJoystick(p.x, p.y, padX, padY, padR, knob);
    });
    stickZone.on('pointerup', () => {
      this.joyStickActive = false;
      knob.setPosition(padX, padY);
      this.joystick = { up: false, down: false, left: false, right: false };
    });

    // 攻击按钮
    this.attackBtn = this.add.container(W - 70, H - 100);
    this.attackRing = this.add.graphics();
    const atkBg = this.add.circle(0, 0, 36, 0x7c2d12, 0.45).setStrokeStyle(2, 0xfbbf24, 0.85);
    const atkText = this.add.text(0, 0, '攻', { fontFamily: FONT, fontSize: '20px', color: '#fde68a', fontStyle: 'bold' }).setOrigin(0.5);
    this.attackBtn.add([this.attackRing, atkBg, atkText]);
    this.attackBtn.setSize(72, 72);
    this.attackBtn.setInteractive(new Phaser.Geom.Circle(0, 0, 40), Phaser.Geom.Circle.Contains);
    this.attackBtn.on('pointerdown', () => {
      this.tryAttack();
      this.tweens.add({ targets: atkBg, scale: { from: 0.85, to: 1 }, duration: 160, ease: 'Back' });
    });

    // 闪避按钮
    this.dodgeBtn = this.add.container(W - 38, H - 165);
    this.dodgeRing = this.add.graphics();
    const dodBg = this.add.circle(0, 0, 26, 0x0c4a6e, 0.45).setStrokeStyle(2, 0x38bdf8, 0.8);
    const dodText = this.add.text(0, 0, '闪', { fontFamily: FONT, fontSize: '14px', color: '#bae6fd', fontStyle: 'bold' }).setOrigin(0.5);
    this.dodgeBtn.add([this.dodgeRing, dodBg, dodText]);
    this.dodgeBtn.setSize(52, 52);
    this.dodgeBtn.setInteractive(new Phaser.Geom.Circle(0, 0, 28), Phaser.Geom.Circle.Contains);
    this.dodgeBtn.on('pointerdown', () => {
      this.tryDodge();
      this.tweens.add({ targets: dodBg, scale: { from: 0.85, to: 1 }, duration: 160, ease: 'Back' });
    });
  }

  private updateJoystick(x: number, y: number, cx: number, cy: number, r: number, knob: Phaser.GameObjects.Arc) {
    const dx = Phaser.Math.Clamp(x - cx, -r, r);
    const dy = Phaser.Math.Clamp(y - cy, -r, r);
    knob.setPosition(cx + dx, cy + dy);
    const t = 0.3 * r;
    this.joystick = {
      left: dx < -t, right: dx > t, up: dy < -t, down: dy > t,
    };
  }

  // ----- 主循环 -----
  update(time: number, _delta: number) {
    if (this.over) return;
    const speed = 165;
    let vx = 0, vy = 0;
    if (this.cursors.left?.isDown || this.keyA.isDown || this.joystick.left) vx -= 1;
    if (this.cursors.right?.isDown || this.keyD.isDown || this.joystick.right) vx += 1;
    if (this.cursors.up?.isDown || this.keyW.isDown || this.joystick.up) vy -= 1;
    if (this.cursors.down?.isDown || this.keyS.isDown || this.joystick.down) vy += 1;
    const isInvincible = time < this.invincibleUntil;
    const mul = isInvincible ? 1.7 : 1;
    const len = Math.hypot(vx, vy) || 1;
    this.playerBody.setVelocity((vx / len) * speed * mul, (vy / len) * speed * mul);
    this.player.setAlpha(isInvincible ? 0.55 : 1);

    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) this.tryAttack();
    if (Phaser.Input.Keyboard.JustDown(this.keyShift)) this.tryDodge();

    // boss 行为
    if (time > this.skillTimer) {
      this.castBossSkill();
      this.skillTimer = time + Phaser.Math.Between(1300, 2200);
    }
    const bossSpeed = 30 + this.stones * 5;
    const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
    this.bossBody.setVelocity(Math.cos(angle) * bossSpeed * 0.3, Math.sin(angle) * bossSpeed * 0.3);
    if (this.boss.y > this.H * 0.4) this.boss.y = this.H * 0.4;
    this.bossNameText.setPosition(this.boss.x, this.boss.y - 56);

    // UI
    this.hpText.setText(`气血 ${Math.max(0, Math.floor(this.hp))} / ${this.maxHp}`);
    this.stonesIcon.setText(String(this.stones));
    this.redrawHpBars();

    // 闪避 CD 圆环
    this.drawCdRing(this.dodgeRing, this.dodgeCdUntil, time, 1500, 28, 0x38bdf8);
    this.drawCdRing(this.attackRing, this.attackCdUntil, time, 320, 38, 0xfbbf24);
  }

  private drawCdRing(g: Phaser.GameObjects.Graphics, end: number, now: number, full: number, radius: number, color: number) {
    g.clear();
    const remain = end - now;
    if (remain <= 0) return;
    const pct = remain / full;
    const start = -Math.PI / 2;
    const angle = start + Math.PI * 2 * pct;
    g.lineStyle(3, color, 0.85);
    g.beginPath();
    g.arc(0, 0, radius, start, angle, false);
    g.strokePath();
  }

  // ----- 攻击 -----
  private tryAttack() {
    if (this.over || this.time.now < this.attackCdUntil) return;
    this.attackCdUntil = this.time.now + 320;
    sfx.attack();
    vibrate(15);

    // 在玩家前方挥剑：从玩家位置朝 boss 方向画一道剑光
    const dx = this.boss.x - this.player.x;
    const dy = this.boss.y - this.player.y;
    const ang = Math.atan2(dy, dx);
    const slash = this.add.graphics();
    slash.fillStyle(0xfde68a, 0.55);
    slash.fillCircle(this.player.x + Math.cos(ang) * 28, this.player.y + Math.sin(ang) * 28, 30);
    slash.lineStyle(3, 0xfef3c7, 0.9);
    slash.beginPath();
    slash.arc(this.player.x, this.player.y, 38, ang - 0.7, ang + 0.7, false);
    slash.strokePath();
    this.tweens.add({
      targets: slash, alpha: { from: 0.9, to: 0 }, duration: 220,
      onComplete: () => slash.destroy(),
    });

    // 命中判定（放宽到 90px）
    if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.boss.x, this.boss.y) < 90) {
      const dmg = Math.floor((10 + Math.random() * 14 + this.opts.baseDmg * 0.3) * this.opts.dmgBonus);
      this.bossHp -= dmg;
      this.flashCircle(this.bossCore, 0xffffff);
      this.popText(this.boss.x, this.boss.y - 36, `-${dmg}`, '#fde68a', true);
      // 命中粒子
      for (let i = 0; i < 4; i++) {
        const p = this.add.circle(this.boss.x, this.boss.y, 3, 0xfde68a, 0.9);
        const a = Math.random() * Math.PI * 2;
        this.tweens.add({
          targets: p, x: p.x + Math.cos(a) * 30, y: p.y + Math.sin(a) * 30,
          alpha: 0, duration: 350, onComplete: () => p.destroy(),
        });
      }
      if (this.bossHp <= 0) this.onBossDown();
    }
  }

  private tryDodge() {
    if (this.over || this.time.now < this.dodgeCdUntil) return;
    this.dodgeCdUntil = this.time.now + 1500;
    this.invincibleUntil = this.time.now + 380;
    sfx.dodge();
    vibrate(8);
    // 残影
    for (let i = 0; i < 3; i++) {
      const ghost = this.add.circle(this.player.x, this.player.y, 12, 0x6ee7b7, 0.35);
      this.tweens.add({
        targets: ghost, alpha: 0, scale: 0.6,
        duration: 300, delay: i * 60, onComplete: () => ghost.destroy(),
      });
    }
    this.popText(this.player.x, this.player.y - 24, '⟶ 闪', '#7dd3fc');
  }

  // ----- Boss 技能 -----
  private castBossSkill() {
    if (this.over) return;
    const phase = this.stones;
    const r = Math.random();
    if (r < 0.45) this.skillFan(phase);
    else if (r < 0.8) this.skillTelegraph(phase);
    else this.skillRing(phase);
  }

  private skillFan(phase: number) {
    const baseAngle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
    const count = 5 + Math.min(phase, 4);
    const spread = Phaser.Math.DegToRad(45);
    for (let i = 0; i < count; i++) {
      const a = baseAngle - spread / 2 + (spread / Math.max(1, count - 1)) * i;
      this.spawnBullet(a, 130 + phase * 12);
    }
  }

  private skillTelegraph(phase: number) {
    const tx = this.player.x, ty = this.player.y;
    const radius = 42 + phase * 4;
    sfx.telegraph();
    const tg = this.add.graphics();
    tg.lineStyle(2, 0xef4444, 0.95);
    tg.fillStyle(0xef4444, 0.18);
    tg.strokeCircle(tx, ty, radius);
    tg.fillCircle(tx, ty, radius);
    // 警告闪烁
    this.tweens.add({
      targets: tg, alpha: { from: 1, to: 0.35 }, duration: 360, yoyo: true, repeat: 1,
      onComplete: () => {
        tg.destroy();
        const ex = this.add.graphics();
        ex.fillStyle(0xef4444, 0.55);
        ex.fillCircle(tx, ty, radius);
        ex.lineStyle(3, 0xfecaca, 1);
        ex.strokeCircle(tx, ty, radius);
        this.tweens.add({ targets: ex, alpha: 0, scale: 1.4, duration: 280, onComplete: () => ex.destroy() });
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, tx, ty) < radius && this.time.now > this.invincibleUntil) {
          this.takeDamage(20 + phase * 4);
        }
      }
    });
  }

  private skillRing(phase: number) {
    const count = 12 + Math.min(phase * 2, 12);
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 / count) * i;
      this.spawnBullet(a, 95 + phase * 8);
    }
  }

  private spawnBullet(angle: number, speed: number) {
    const b = this.add.circle(this.boss.x, this.boss.y, 6, 0xfb7185, 0.95).setStrokeStyle(1, 0xfecdd3, 0.6) as any;
    this.bullets.add(b);
    const body = b.body as Phaser.Physics.Arcade.Body;
    body.setCircle(6);
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    // 弹丸光晕
    const halo = this.add.circle(b.x, b.y, 12, 0xfb7185, 0.25);
    const updateHalo = () => { if (b.active) halo.setPosition(b.x, b.y); };
    const evt = this.time.addEvent({ delay: 16, loop: true, callback: updateHalo });
    this.time.delayedCall(4500, () => { halo.destroy(); evt.remove(); b.destroy(); });
  }

  private onHitByBullet(bullet: any) {
    bullet.destroy();
    if (this.time.now < this.invincibleUntil) return;
    this.takeDamage(8 + this.stones * 2);
  }

  private takeDamage(raw: number) {
    const dmg = Math.max(1, Math.floor(raw * this.opts.defBonus));
    this.hp -= dmg;
    this.invincibleUntil = this.time.now + 400;
    sfx.hit();
    vibrate([20, 40, 20]);
    this.flashCircle(this.playerCore, 0xffffff);
    this.popText(this.player.x, this.player.y - 22, `-${dmg}`, '#fda4af', true);
    this.cameras.main.shake(140, 0.006);
    if (this.hp <= 0) this.endGame();
  }

  private onBossDown() {
    this.stones += 5;
    sfx.bossDown();
    vibrate([30, 30, 60]);
    this.bossMaxHp = 500 + this.stones * 80;
    this.bossHp = this.bossMaxHp;
    this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.2);
    this.popText(this.boss.x, this.boss.y - 8, '+5 昆吾石', '#fbbf24', true);
    this.cameras.main.flash(180, 251, 191, 36);
    // 阶段提示更新
    const phaseIdx = Math.min(this.stones / 5, BOSS_NAMES.length - 1);
    this.bossNameText.setText(BOSS_NAMES[Math.floor(phaseIdx)]);
    const pillText = (this.stagePill.list[1] as Phaser.GameObjects.Text);
    pillText.setText(`第 ${Math.floor(phaseIdx) + 1} 阶段`);
    // boss 变色
    this.bossCore.fillColor = [0xa855f7, 0xc026d3, 0xdb2777, 0xea580c, 0xdc2626][Math.min(Math.floor(phaseIdx), 4)];
  }

  private endGame() {
    if (this.over) return;
    this.over = true;
    sfx.death();
    stopBgm();
    this.playerBody.setVelocity(0, 0);
    const W = this.W, H = this.H;
    const veil = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(100);
    this.tweens.add({ targets: veil, alpha: 0.7, duration: 400 });
    const t1 = this.add.text(W / 2, H / 2 - 26, '斗法结束', {
      fontFamily: FONT, fontSize: '28px', color: '#f8fafc', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    const t2 = this.add.text(W / 2, H / 2 + 12, `共得 ${this.stones} 颗昆吾石`, {
      fontFamily: FONT, fontSize: '14px', color: '#fcd34d',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    this.tweens.add({ targets: [t1, t2], alpha: 1, duration: 500, delay: 200 });
    this.time.delayedCall(1400, () => this.opts.onGameOver(this.stones * 5000));
  }

  private flashCircle(obj: Phaser.GameObjects.Arc, color: number) {
    const old = obj.fillColor;
    obj.fillColor = color;
    this.time.delayedCall(70, () => { if (!this.over) obj.fillColor = old; });
  }

  private popText(x: number, y: number, txt: string, color: string, big = false) {
    const t = this.add.text(x, y, txt, {
      fontFamily: FONT, fontSize: big ? '15px' : '12px', color, fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({
      targets: t, y: y - 28, alpha: 0,
      duration: 700, ease: 'Cubic.easeOut',
      onComplete: () => t.destroy(),
    });
  }
}

export function createKunwuGame(opts: KunwuOptions): Phaser.Game {
  const W = opts.width || 360;
  const H = opts.height || 540;
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: W, height: H,
    parent: opts.parent,
    backgroundColor: '#0a0e1a',
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scale: { mode: Phaser.Scale.NONE },
  });
  const startScene = () => {
    if (!game.scene.getScene('kunwu')) game.scene.add('kunwu', KunwuScene, false);
    game.scene.start('kunwu', opts);
  };
  if (game.isBooted) startScene();
  else game.events.once('ready', startScene);
  return game;
}
