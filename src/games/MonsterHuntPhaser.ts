// 乱星海捕妖 - 重制版
// - 海面渐变 + 月光波纹 + 星辰
// - 飞舟：船身（梯形）+ 帆 + 尾流
// - 妖兽：普通蓝鳞 / 妖王红鳞，加触手摆动 + 头顶 hp 条
// - 飞剑：金色锥形 + 余光
// - 触屏：左侧大区域上下控制 + 右下大射击键
// - 命中震动 + vibrate

import * as Phaser from 'phaser';
import { sfx, playBgm, stopBgm } from './audio';

export type DailyBuff = 'double_orb' | 'fast_monsters' | 'fat_boss';
export interface DailyBuffInfo {
  id: DailyBuff; name: string; desc: string; color: string;
}
const DAILY_BUFFS: DailyBuffInfo[] = [
  { id: 'double_orb', name: '妖丹增产日', desc: '今日所有妖丹掉落 ×2', color: '#fbbf24' },
  { id: 'fast_monsters', name: '妖潮汹涌日', desc: '妖兽速度 +50%，但同等掉落', color: '#f87171' },
  { id: 'fat_boss', name: '妖王坐镇日', desc: '妖王血量 5 击，击杀奖励 ×3', color: '#a855f7' },
];

function dayKey(d: Date) { return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function hashStr(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
export function getTodayBuff(): DailyBuffInfo {
  return DAILY_BUFFS[hashStr(dayKey(new Date())) % DAILY_BUFFS.length];
}
export function getTomorrowBuff(): DailyBuffInfo {
  const t = new Date(); t.setDate(t.getDate() + 1);
  return DAILY_BUFFS[hashStr(dayKey(t)) % DAILY_BUFFS.length];
}

export interface MonsterHuntOptions {
  parent: HTMLElement;
  baseHealth: number;
  dmgBonus: number;
  defBonus: number;
  width?: number; height?: number;
  onGameOver: (orbs: number) => void;
}

const FONT = '"Noto Serif SC", "Songti SC", "STSong", serif';

function vibrate(p: number | number[]) {
  try { (navigator as any).vibrate?.(p); } catch { /* ignore */ }
}

class MonsterHuntScene extends Phaser.Scene {
  private opts!: MonsterHuntOptions;
  private W = 360; private H = 540;

  private boat!: Phaser.GameObjects.Container;
  private boatBody!: Phaser.Physics.Arcade.Body;
  private bullets!: Phaser.Physics.Arcade.Group;
  private monsters!: Phaser.Physics.Arcade.Group;
  private waves!: Phaser.GameObjects.Graphics;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  private hp = 100; private maxHp = 100;
  private orbs = 0; private timeLeft = 30;
  private nextSpawn = 0; private nextShot = 0; private over = false;
  private joystickY = 0;
  private buff: DailyBuffInfo = getTodayBuff();

  private hpBarBg!: Phaser.GameObjects.Graphics;
  private hpBar!: Phaser.GameObjects.Graphics;
  private timeText!: Phaser.GameObjects.Text;
  private orbText!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'monster_hunt' }); }

  init(data: MonsterHuntOptions) {
    this.opts = data;
    this.W = data.width || 360;
    this.H = data.height || 540;
    this.maxHp = data.baseHealth;
    this.hp = this.maxHp;
    this.orbs = 0;
    this.timeLeft = 30;
    this.over = false;
    this.buff = getTodayBuff();
  }

  create() {
    const W = this.W, H = this.H;
    this.scale.resize(W, H);
    this.cameras.main.setBackgroundColor('#06192f');

    this.drawBackground();
    playBgm(undefined, 0.05);

    // 飞舟容器
    this.boat = this.add.container(60, H / 2);
    // 船身（梯形）
    const hull = this.add.graphics();
    hull.fillStyle(0x6b3914, 1);
    hull.fillTriangle(-18, 0, 22, -10, 22, 10);
    hull.lineStyle(1.5, 0xfbbf24, 0.6);
    hull.beginPath(); hull.moveTo(-18, 0); hull.lineTo(22, -10); hull.lineTo(22, 10); hull.closePath(); hull.strokePath();
    // 帆
    const sail = this.add.graphics();
    sail.fillStyle(0xf1f5f9, 0.85);
    sail.fillTriangle(0, -22, 12, -8, -8, -8);
    sail.lineStyle(1, 0x94a3b8, 1);
    sail.strokeTriangle(0, -22, 12, -8, -8, -8);
    // 桅杆
    const mast = this.add.rectangle(0, -10, 1.5, 20, 0xfbbf24, 0.8);
    // 灯笼
    const lantern = this.add.circle(15, -6, 3, 0xfbbf24, 1);
    const lanternGlow = this.add.circle(15, -6, 8, 0xfbbf24, 0.25);
    this.tweens.add({ targets: lanternGlow, scale: { from: 0.8, to: 1.3 }, alpha: { from: 0.25, to: 0.45 }, yoyo: true, repeat: -1, duration: 800 });
    this.boat.add([hull, mast, sail, lantern, lanternGlow]);

    this.physics.add.existing(this.boat);
    this.boatBody = this.boat.body as Phaser.Physics.Arcade.Body;
    this.boatBody.setSize(36, 22);
    this.boatBody.setOffset(-18, -11);
    this.boatBody.setCollideWorldBounds(true);

    // 尾流粒子
    this.time.addEvent({
      delay: 80, loop: true, callback: () => {
        if (this.over) return;
        const t = this.add.circle(this.boat.x - 18, this.boat.y + (Math.random() - 0.5) * 6, 3, 0x60a5fa, 0.6);
        this.tweens.add({ targets: t, x: t.x - 24, alpha: 0, scale: 0.5, duration: 600, onComplete: () => t.destroy() });
      }
    });

    this.bullets = this.physics.add.group();
    this.monsters = this.physics.add.group();
    this.physics.add.overlap(this.bullets, this.monsters, (b, m) => this.onBulletHit(b as any, m as any));
    this.physics.add.overlap(this.boat, this.monsters, (_p, m) => this.onMonsterTouchPlayer(m as any));

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyW = this.input.keyboard!.addKey('W');
    this.keyS = this.input.keyboard!.addKey('S');
    this.keySpace = this.input.keyboard!.addKey('SPACE');

    this.drawTopBar();
    this.drawDailyBanner();
    this.drawMobileControls();

    if (!this.sys.game.device.input.touch) {
      this.add.text(W / 2, H - 12, '↑↓/WS 移动 · 空格发射飞剑', {
        fontFamily: FONT, fontSize: '10px', color: '#475569',
      }).setOrigin(0.5);
    }

    this.time.addEvent({
      delay: 1000, repeat: this.timeLeft - 1, callback: () => {
        if (this.over) return;
        this.timeLeft--;
        if (this.timeLeft <= 0) this.endGame();
      }
    });
  }

  private drawBackground() {
    const W = this.W, H = this.H;
    const g = this.add.graphics();
    // 海面渐变（4 段色块）
    const cols = [0x081a30, 0x0c2440, 0x0f2c4f, 0x123761];
    const seg = H / cols.length;
    cols.forEach((c, i) => {
      g.fillStyle(c, 1);
      g.fillRect(0, i * seg, W, seg + 1);
    });
    // 月晕
    g.fillStyle(0xfde68a, 0.04);
    g.fillCircle(W * 0.7, H * 0.2, 110);
    g.fillStyle(0xfde68a, 0.08);
    g.fillCircle(W * 0.7, H * 0.2, 50);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(W * 0.7, H * 0.2, 14);
    // 星点
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H * 0.45;
      g.fillStyle(0xfde68a, 0.4 + Math.random() * 0.5);
      g.fillCircle(x, y, Math.random() * 1.2 + 0.4);
    }
    // 动态波纹
    this.waves = this.add.graphics();
    this.time.addEvent({
      delay: 90, loop: true, callback: () => {
        if (this.over) return;
        this.waves.clear();
        const t = this.time.now / 200;
        this.waves.lineStyle(1, 0xbae6fd, 0.18);
        for (let y = H * 0.5; y < H; y += 14) {
          this.waves.beginPath();
          for (let x = 0; x <= W; x += 8) {
            const yy = y + Math.sin((x + t * 8) / 25) * 1.6;
            if (x === 0) this.waves.moveTo(x, yy);
            else this.waves.lineTo(x, yy);
          }
          this.waves.strokePath();
        }
      }
    });
  }

  private drawTopBar() {
    const W = this.W;
    this.add.rectangle(W / 2, 18, W, 36, 0x000000, 0.5);
    // 气血
    this.add.text(12, 8, '气血', { fontFamily: FONT, fontSize: '11px', color: '#86efac' });
    this.hpBarBg = this.add.graphics();
    this.hpBar = this.add.graphics();
    // 时间（中）
    this.timeText = this.add.text(W / 2, 18, '', { fontFamily: FONT, fontSize: '15px', color: '#fcd34d', fontStyle: 'bold' }).setOrigin(0.5);
    // 妖丹（右）
    this.add.text(W - 56, 8, '妖丹', { fontFamily: FONT, fontSize: '11px', color: '#c4b5fd' });
    this.orbText = this.add.text(W - 12, 22, '0', { fontFamily: FONT, fontSize: '13px', color: '#a78bfa', fontStyle: 'bold' }).setOrigin(1, 0.5);
  }

  private redrawHpBar() {
    const pct = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x000000, 0.55);
    this.hpBarBg.fillRoundedRect(46, 10, 90, 8, 4);
    this.hpBarBg.lineStyle(1, 0x10b981, 0.35);
    this.hpBarBg.strokeRoundedRect(46, 10, 90, 8, 4);
    this.hpBar.clear();
    const c = pct > 0.5 ? 0x10b981 : pct > 0.25 ? 0xfbbf24 : 0xef4444;
    this.hpBar.fillStyle(c, 1);
    this.hpBar.fillRoundedRect(47, 11, Math.max(0, 88 * pct), 6, 3);
    this.hpBar.fillStyle(0xffffff, 0.25);
    this.hpBar.fillRoundedRect(47, 11, Math.max(0, 88 * pct), 2, 1);
  }

  private drawDailyBanner() {
    const W = this.W;
    const colorInt = parseInt(this.buff.color.slice(1), 16);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.55);
    bg.fillRoundedRect(W / 2 - 130, 42, 260, 22, 11);
    bg.lineStyle(1, colorInt, 0.5);
    bg.strokeRoundedRect(W / 2 - 130, 42, 260, 22, 11);
    this.add.text(W / 2, 53, `今日 · ${this.buff.name} · ${this.buff.desc}`, {
      fontFamily: FONT, fontSize: '10px', color: this.buff.color,
    }).setOrigin(0.5);
  }

  private drawMobileControls() {
    const W = this.W, H = this.H;
    // 左半屏整个作为上下控制区域
    const leftZone = this.add.zone(0, 0, W * 0.55, H).setOrigin(0).setInteractive();
    leftZone.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.joystickY = (p.y - H / 2) / (H / 2);
    });
    leftZone.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.isDown) this.joystickY = (p.y - H / 2) / (H / 2);
    });
    leftZone.on('pointerup', () => { this.joystickY = 0; });
    leftZone.on('pointerout', () => { this.joystickY = 0; });

    // 射击按钮（大）
    const fireBtn = this.add.container(W - 60, H - 80);
    const ring = this.add.circle(0, 0, 38, 0x000000, 0.45).setStrokeStyle(2, 0xfbbf24, 0.85);
    const txt = this.add.text(0, 0, '剑', { fontFamily: FONT, fontSize: '20px', color: '#fde68a', fontStyle: 'bold' }).setOrigin(0.5);
    fireBtn.add([ring, txt]);
    fireBtn.setSize(76, 76);
    fireBtn.setInteractive(new Phaser.Geom.Circle(0, 0, 42), Phaser.Geom.Circle.Contains);
    fireBtn.on('pointerdown', () => {
      this.tryShoot();
      this.tweens.add({ targets: ring, scale: { from: 0.85, to: 1 }, duration: 140, ease: 'Back' });
    });
  }

  update(time: number, _delta: number) {
    if (this.over) return;
    let vy = 0;
    if (this.cursors.up?.isDown || this.keyW.isDown) vy -= 1;
    if (this.cursors.down?.isDown || this.keyS.isDown) vy += 1;
    if (Math.abs(this.joystickY) > 0.15) vy = this.joystickY;
    this.boatBody.setVelocity(0, vy * 240);
    // 帆轻微随上下移动倾斜
    this.boat.setRotation(vy * 0.08);

    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) this.tryShoot();

    if (time > this.nextSpawn) {
      this.spawnMonster();
      const intensity = 1 + (30 - this.timeLeft) / 30;
      this.nextSpawn = time + Phaser.Math.Between(500, 900) / intensity;
    }

    this.monsters.getChildren().forEach((m: any) => {
      if (m.x < -30) {
        m.getData('hpBg')?.destroy();
        m.getData('hpBar')?.destroy();
        m.destroy();
        this.takeDamage(8);
      }
      const hpBg: Phaser.GameObjects.Rectangle = m.getData('hpBg');
      const hpBar: Phaser.GameObjects.Rectangle = m.getData('hpBar');
      if (hpBg && hpBar) {
        hpBg.setPosition(m.x, m.y - 18);
        hpBar.setPosition(m.x - 12, m.y - 18);
        const pct = Math.max(0, m.getData('hp') / m.getData('hpMax'));
        hpBar.width = 24 * pct;
      }
    });

    this.timeText.setText(`${this.timeLeft}s`);
    this.orbText.setText(String(this.orbs));
    this.redrawHpBar();
  }

  private tryShoot() {
    if (this.over || this.time.now < this.nextShot) return;
    this.nextShot = this.time.now + 220;
    sfx.attack();
    vibrate(10);
    // 飞剑：金色锥形
    const sword = this.add.graphics();
    sword.fillStyle(0xfde68a, 1);
    sword.fillTriangle(0, -2, 16, 0, 0, 2);
    sword.fillStyle(0xfef9c3, 0.5);
    sword.fillTriangle(-6, -1, 14, 0, -6, 1);
    sword.x = this.boat.x + 22; sword.y = this.boat.y;
    this.physics.add.existing(sword);
    this.bullets.add(sword);
    const body = sword.body as Phaser.Physics.Arcade.Body;
    body.setSize(18, 4);
    body.setVelocityX(460);
    // 拖尾
    const trailEvent = this.time.addEvent({
      delay: 30, loop: true, callback: () => {
        if (!sword.active) return;
        const t = this.add.circle(sword.x - 4, sword.y, 2, 0xfde68a, 0.7);
        this.tweens.add({ targets: t, alpha: 0, duration: 250, onComplete: () => t.destroy() });
      }
    });
    this.time.delayedCall(2000, () => { trailEvent.remove(); sword.destroy(); });
  }

  private spawnMonster() {
    const isBoss = Math.random() < 0.18;
    const y = Phaser.Math.Between(70, this.H - 90);
    const m = this.add.container(this.W + 30, y);
    const radius = isBoss ? 18 : 11;

    // 触手摆动（4 个）
    const tentacles: Phaser.GameObjects.Graphics[] = [];
    for (let i = 0; i < 4; i++) {
      const t = this.add.graphics();
      tentacles.push(t);
      m.add(t);
    }

    // 主体
    const glow = this.add.circle(0, 0, radius + 8, isBoss ? 0xef4444 : 0x60a5fa, 0.25);
    const body = this.add.circle(0, 0, radius, isBoss ? 0x991b1b : 0x1d4ed8, 0.95)
      .setStrokeStyle(2, isBoss ? 0xfca5a5 : 0xbfdbfe, 0.85);
    const eye1 = this.add.circle(-radius * 0.3, -radius * 0.2, radius * 0.25, 0xffffff, 1);
    const eye2 = this.add.circle(radius * 0.3, -radius * 0.2, radius * 0.25, 0xffffff, 1);
    const pupil1 = this.add.circle(-radius * 0.3, -radius * 0.2, radius * 0.12, 0x000000, 1);
    const pupil2 = this.add.circle(radius * 0.3, -radius * 0.2, radius * 0.12, 0x000000, 1);
    m.add([glow, body, eye1, eye2, pupil1, pupil2]);

    // 触手动画
    this.tweens.add({
      targets: tentacles,
      duration: 600 + Math.random() * 300,
      yoyo: true, repeat: -1,
      onUpdate: (tween: any) => {
        const phase = tween.totalProgress * Math.PI * 2;
        tentacles.forEach((t, i) => {
          t.clear();
          t.lineStyle(2, isBoss ? 0xef4444 : 0x60a5fa, 0.85);
          const angle = (i / 4) * Math.PI * 2 + Math.PI / 2;
          const baseX = Math.cos(angle) * radius;
          const baseY = Math.sin(angle) * radius;
          const tipX = baseX + Math.cos(angle) * (radius * 0.8) + Math.sin(phase + i) * 4;
          const tipY = baseY + Math.sin(angle) * (radius * 0.8) + Math.cos(phase + i) * 4;
          t.beginPath(); t.moveTo(baseX, baseY); t.lineTo(tipX, tipY); t.strokePath();
        });
      }
    });

    this.tweens.add({ targets: glow, scale: { from: 0.85, to: 1.15 }, duration: 700, yoyo: true, repeat: -1 });

    this.physics.add.existing(m);
    const bodyP = m.body as Phaser.Physics.Arcade.Body;
    bodyP.setCircle(radius, -radius, -radius);

    let speedMul = 1;
    if (this.buff.id === 'fast_monsters') speedMul = 1.5;
    const speed = (isBoss ? Phaser.Math.Between(70, 110) : Phaser.Math.Between(110, 170)) * speedMul;
    bodyP.setVelocity(-speed, 0);
    const bossHp = this.buff.id === 'fat_boss' ? 5 : 3;
    const hp = isBoss ? bossHp : 1;
    m.setData('isBoss', isBoss);
    m.setData('hp', hp);
    m.setData('hpMax', hp);
    m.setData('radius', radius);

    // 头顶 hp 条（仅 boss 显示）
    if (isBoss) {
      const hpBg = this.add.rectangle(m.x, m.y - 18, 24, 3, 0x000000, 0.55);
      const hpBar = this.add.rectangle(m.x - 12, m.y - 18, 24, 3, 0xef4444).setOrigin(0, 0.5);
      m.setData('hpBg', hpBg);
      m.setData('hpBar', hpBar);
    }

    this.tweens.add({
      targets: m,
      y: y + (isBoss ? 30 : 50) * (Math.random() > 0.5 ? 1 : -1),
      duration: 1400 + Math.random() * 800,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.monsters.add(m);
  }

  private onBulletHit(b: any, m: any) {
    if (!m.active) return;
    b.destroy();
    const hp = (m.getData('hp') as number) - 1;
    if (hp <= 0) {
      const isBoss = m.getData('isBoss') as boolean;
      let drop = isBoss ? 5 : 1;
      if (isBoss && this.buff.id === 'fat_boss') drop *= 3;
      if (this.buff.id === 'double_orb') drop *= 2;
      this.orbs += drop;
      sfx.bossDown();
      vibrate(isBoss ? [20, 40, 30] : 12);
      this.popText(m.x, m.y, `+${drop}`, isBoss ? '#fda4af' : '#7dd3fc', isBoss);
      // 爆炸
      const r: number = m.getData('radius');
      const ex = this.add.circle(m.x, m.y, r + 4, 0xfde68a, 0.7);
      this.tweens.add({ targets: ex, scale: 2.4, alpha: 0, duration: 280, onComplete: () => ex.destroy() });
      // 碎片
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const p = this.add.circle(m.x, m.y, 2, isBoss ? 0xef4444 : 0x60a5fa, 1);
        this.tweens.add({
          targets: p, x: m.x + Math.cos(a) * 30, y: m.y + Math.sin(a) * 30,
          alpha: 0, duration: 350, onComplete: () => p.destroy(),
        });
      }
      m.getData('hpBg')?.destroy();
      m.getData('hpBar')?.destroy();
      m.destroy();
    } else {
      m.setData('hp', hp);
      // 闪白
      const list = m.list as Phaser.GameObjects.GameObject[];
      list.forEach((c: any) => { if (c.fillColor !== undefined) { const old = c.fillColor; c.fillColor = 0xffffff; this.time.delayedCall(70, () => { if (m.active) c.fillColor = old; }); } });
      vibrate(6);
    }
  }

  private onMonsterTouchPlayer(m: any) {
    const isBoss = m.getData('isBoss') as boolean;
    this.takeDamage(isBoss ? 18 : 6);
    m.getData('hpBg')?.destroy();
    m.getData('hpBar')?.destroy();
    m.destroy();
  }

  private takeDamage(raw: number) {
    if (this.over) return;
    const dmg = Math.max(1, Math.floor(raw * this.opts.defBonus));
    this.hp -= dmg;
    sfx.hit();
    vibrate([20, 40, 20]);
    this.cameras.main.shake(140, 0.005);
    this.popText(this.boat.x, this.boat.y - 24, `-${dmg}`, '#fda4af', true);
    if (this.hp <= 0) this.endGame();
  }

  private endGame() {
    if (this.over) return;
    this.over = true;
    sfx.death();
    stopBgm();
    this.boatBody.setVelocity(0, 0);
    const W = this.W, H = this.H;
    const veil = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(100);
    this.tweens.add({ targets: veil, alpha: 0.7, duration: 400 });
    const t1 = this.add.text(W / 2, H / 2 - 36, '出海归来', {
      fontFamily: FONT, fontSize: '26px', color: '#f8fafc', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    const t2 = this.add.text(W / 2, H / 2, `共得 ${this.orbs} 颗妖丹`, {
      fontFamily: FONT, fontSize: '14px', color: '#a78bfa',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    const tomorrow = getTomorrowBuff();
    const t3 = this.add.text(W / 2, H / 2 + 28, `明日：${tomorrow.name}`, {
      fontFamily: FONT, fontSize: '11px', color: tomorrow.color,
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    this.tweens.add({ targets: [t1, t2, t3], alpha: 1, duration: 500, delay: 200 });
    this.time.delayedCall(1500, () => this.opts.onGameOver(this.orbs));
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

export function createMonsterHuntGame(opts: MonsterHuntOptions): Phaser.Game {
  const W = opts.width || 360;
  const H = opts.height || 540;
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: W, height: H,
    parent: opts.parent,
    backgroundColor: '#06192f',
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scale: { mode: Phaser.Scale.NONE },
  });
  const startScene = () => {
    if (!game.scene.getScene('monster_hunt')) game.scene.add('monster_hunt', MonsterHuntScene, false);
    game.scene.start('monster_hunt', opts);
  };
  if (game.isBooted) startScene();
  else game.events.once('ready', startScene);
  return game;
}
