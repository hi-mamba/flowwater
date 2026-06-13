// 坠魔谷探险 - 重制版
// - 紫黑深谷：渐变背景 + 飘落紫色灰烬 + 远处魔气流光
// - 石质拱门：拱顶 + 门柱 + 门后紫雾 + 浮动图标
// - 顶部气血/灵石条带美化
// - 战斗结算文本框增加边框/阴影
// - 撤退按钮放大易点

import * as Phaser from 'phaser';
import { sfx, playBgm, stopBgm } from './audio';

export interface DevilfallOptions {
  parent: HTMLElement;
  baseHealth: number;
  baseDmg: number;
  dmgBonus: number;
  defBonus: number;
  width?: number; height?: number;
  onGameOver: (loot: number) => void;
}

const FONT = '"Noto Serif SC", "Songti SC", "STSong", serif';
function vibrate(p: number | number[]) { try { (navigator as any).vibrate?.(p); } catch { /* ignore */ } }

type RoomKind = 'enemy' | 'chest' | 'trap' | 'merchant';
interface Room { kind: RoomKind; data: any }

class DevilfallScene extends Phaser.Scene {
  private opts!: DevilfallOptions;
  private W = 360; private H = 540;

  private hp = 100; private maxHp = 100;
  private depth = 0; private loot = 0;
  private over = false; private busy = false;

  private hpBarBg!: Phaser.GameObjects.Graphics;
  private hpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private depthText!: Phaser.GameObjects.Text;
  private lootText!: Phaser.GameObjects.Text;
  private logBox!: Phaser.GameObjects.Text;
  private logBg!: Phaser.GameObjects.Graphics;
  private doors: Phaser.GameObjects.Container[] = [];
  private retreatBtn!: Phaser.GameObjects.Container;

  constructor() { super({ key: 'devilfall' }); }

  init(data: DevilfallOptions) {
    this.opts = data;
    this.W = data.width || 360;
    this.H = data.height || 540;
    this.hp = this.maxHp = data.baseHealth;
    this.depth = 0; this.loot = 0;
    this.over = false; this.busy = false;
  }

  create() {
    const W = this.W, H = this.H;
    this.scale.resize(W, H);
    this.cameras.main.setBackgroundColor('#0a0612');
    this.drawBackground();
    playBgm(undefined, 0.05);

    this.drawTopBar();
    this.drawLog();
    this.drawRetreatBtn();
    this.spawnDoors();
  }

  private drawBackground() {
    const W = this.W, H = this.H;
    const g = this.add.graphics();
    // 暗紫深渊渐变
    const cols = [0x0a0612, 0x130a1f, 0x1c0d2c, 0x2a1240];
    cols.forEach((c, i) => {
      g.fillStyle(c, 1);
      g.fillRect(0, i * (H / cols.length), W, H / cols.length + 1);
    });
    // 远处魔光
    g.fillStyle(0xa855f7, 0.08);
    g.fillCircle(W * 0.3, H * 0.55, 120);
    g.fillStyle(0xc026d3, 0.06);
    g.fillCircle(W * 0.75, H * 0.7, 90);
    // 石壁纹理
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      g.fillStyle(0xffffff, 0.04 + Math.random() * 0.06);
      g.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    // 飘落紫灰烬
    this.time.addEvent({
      delay: 220, loop: true, callback: () => {
        if (this.over) return;
        const x = Math.random() * W;
        const ash = this.add.circle(x, -10, Math.random() * 1.5 + 0.5, 0xa855f7, 0.6);
        this.tweens.add({
          targets: ash, y: H + 10, x: x + (Math.random() - 0.5) * 30,
          alpha: 0, duration: 4000 + Math.random() * 2000,
          onComplete: () => ash.destroy(),
        });
      }
    });
  }

  private drawTopBar() {
    const W = this.W;
    this.add.rectangle(W / 2, 18, W, 36, 0x000000, 0.55);
    this.add.text(12, 8, '气血', { fontFamily: FONT, fontSize: '11px', color: '#86efac' });
    this.hpBarBg = this.add.graphics();
    this.hpBar = this.add.graphics();
    this.hpText = this.add.text(48, 22, '', { fontFamily: FONT, fontSize: '10px', color: '#e2e8f0' }).setOrigin(0, 0.5);
    this.depthText = this.add.text(W / 2, 18, '', { fontFamily: FONT, fontSize: '13px', color: '#a78bfa', fontStyle: 'bold' }).setOrigin(0.5);
    this.lootText = this.add.text(W - 12, 18, '', { fontFamily: FONT, fontSize: '13px', color: '#fbbf24', fontStyle: 'bold' }).setOrigin(1, 0.5);
  }

  private redrawHpBar() {
    const pct = Phaser.Math.Clamp(this.hp / this.maxHp, 0, 1);
    this.hpBarBg.clear();
    this.hpBarBg.fillStyle(0x000000, 0.55);
    this.hpBarBg.fillRoundedRect(46, 26, 80, 6, 3);
    this.hpBarBg.lineStyle(1, 0x10b981, 0.35);
    this.hpBarBg.strokeRoundedRect(46, 26, 80, 6, 3);
    this.hpBar.clear();
    const c = pct > 0.5 ? 0x10b981 : pct > 0.25 ? 0xfbbf24 : 0xef4444;
    this.hpBar.fillStyle(c, 1);
    this.hpBar.fillRoundedRect(47, 27, Math.max(0, 78 * pct), 4, 2);
    this.hpBar.fillStyle(0xffffff, 0.25);
    this.hpBar.fillRoundedRect(47, 27, Math.max(0, 78 * pct), 1, 1);
  }

  private drawLog() {
    const W = this.W;
    this.logBg = this.add.graphics();
    this.logBg.fillStyle(0x000000, 0.4);
    this.logBg.fillRoundedRect(20, 60, W - 40, 60, 8);
    this.logBg.lineStyle(1, 0xa855f7, 0.3);
    this.logBg.strokeRoundedRect(20, 60, W - 40, 60, 8);
    this.logBox = this.add.text(W / 2, 90, '深入魔谷...', {
      fontFamily: FONT, fontSize: '12px', color: '#e2e8f0',
      wordWrap: { width: W - 50 }, align: 'center',
    }).setOrigin(0.5);
  }

  private drawRetreatBtn() {
    const W = this.W, H = this.H;
    this.retreatBtn = this.add.container(W / 2, H - 36);
    const bg = this.add.graphics();
    bg.fillStyle(0x064e3b, 0.85);
    bg.fillRoundedRect(-110, -22, 220, 44, 22);
    bg.lineStyle(2, 0x6ee7b7, 0.7);
    bg.strokeRoundedRect(-110, -22, 220, 44, 22);
    const txt = this.add.text(0, 0, '撤退 · 带走已得灵石', {
      fontFamily: FONT, fontSize: '13px', color: '#a7f3d0', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.retreatBtn.add([bg, txt]);
    this.retreatBtn.setSize(220, 44);
    this.retreatBtn.setInteractive(new Phaser.Geom.Rectangle(-110, -22, 220, 44), Phaser.Geom.Rectangle.Contains);
    this.retreatBtn.on('pointerdown', () => {
      if (this.busy || this.over) return;
      this.endGame(this.loot, '你安全撤离了魔谷');
    });
    this.tweens.add({ targets: bg, alpha: { from: 0.85, to: 1 }, duration: 1100, yoyo: true, repeat: -1 });
  }

  private rollRoom(): Room {
    const r = Math.random();
    const danger = Math.min(0.3, this.depth * 0.02);
    if (r < 0.45 + danger) return { kind: 'enemy', data: { tier: Math.min(3, Math.floor(this.depth / 3)) } };
    if (r < 0.7 + danger) return { kind: 'trap', data: { dmg: 8 + this.depth * 3 } };
    if (r < 0.95) return { kind: 'chest', data: { reward: 80 + this.depth * 60 + Math.floor(Math.random() * 100) } };
    return { kind: 'merchant', data: { heal: Math.floor(this.maxHp * 0.4), cost: 200 + this.depth * 40 } };
  }

  private spawnDoors() {
    if (this.over) return;
    this.doors.forEach(d => d.destroy());
    this.doors = [];

    const rooms: Room[] = [this.rollRoom(), this.rollRoom(), this.rollRoom()];
    const W = this.W, H = this.H;
    const yPos = H * 0.46;
    const spacing = (W - 60) / 3;

    rooms.forEach((room, i) => {
      const x = 30 + spacing / 2 + i * spacing;
      const door = this.makeDoor(x, yPos, room);
      this.doors.push(door);
    });

    this.logBox.setText(`第 ${this.depth + 1} 层 · 选择一扇门`);
    this.logBox.setAlpha(0);
    this.tweens.add({ targets: this.logBox, alpha: 1, duration: 350 });
  }

  private makeDoor(x: number, y: number, room: Room) {
    const c = this.add.container(x, y);
    const reveal = this.depth < 3 || Math.random() > 0.4;
    const kind = reveal ? room.kind : ('unknown' as any);

    // 门柱
    const stone = this.add.graphics();
    // 拱形门洞
    stone.fillStyle(0x1f1129, 1);
    stone.fillRoundedRect(-30, -50, 60, 100, { tl: 30, tr: 30, bl: 6, br: 6 });
    stone.lineStyle(2, 0x6b21a8, 0.8);
    stone.strokeRoundedRect(-30, -50, 60, 100, { tl: 30, tr: 30, bl: 6, br: 6 });
    // 门洞内紫雾
    stone.fillStyle(0x4c1d95, 0.5);
    stone.fillRoundedRect(-22, -42, 44, 80, { tl: 22, tr: 22, bl: 2, br: 2 });

    // 门后图标
    let iconColor = '#cbd5e1';
    let iconText = '?';
    let label = '未知';
    if (kind === 'enemy') { iconText = '👹'; label = '敌人'; iconColor = '#fca5a5'; }
    else if (kind === 'chest') { iconText = '💰'; label = '宝箱'; iconColor = '#fcd34d'; }
    else if (kind === 'trap') { iconText = '⚠'; label = '陷阱'; iconColor = '#f87171'; }
    else if (kind === 'merchant') { iconText = '🏮'; label = '商人'; iconColor = '#fde68a'; }

    const icon = this.add.text(0, -8, iconText, { fontSize: '32px' }).setOrigin(0.5);
    // 浮动动画
    this.tweens.add({ targets: icon, y: -12, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // 标签
    const labelText = this.add.text(0, 36, label, {
      fontFamily: FONT, fontSize: '11px', color: iconColor, fontStyle: 'bold',
    }).setOrigin(0.5);

    // 门口光晕
    const halo = this.add.circle(0, 0, 32, 0xa855f7, 0.18);
    this.tweens.add({ targets: halo, scale: { from: 0.85, to: 1.2 }, alpha: { from: 0.18, to: 0.3 }, yoyo: true, repeat: -1, duration: 1000 });

    c.add([halo, stone, icon, labelText]);
    c.setSize(60, 100);
    c.setInteractive(new Phaser.Geom.Rectangle(-30, -50, 60, 100), Phaser.Geom.Rectangle.Contains);
    c.on('pointerover', () => stone.alpha = 1);
    c.on('pointerdown', () => this.enterRoom(c, room));
    c.on('pointerup', () => this.tweens.add({ targets: c, scale: 1, duration: 100 }));
    return c;
  }

  private enterRoom(c: Phaser.GameObjects.Container, room: Room) {
    if (this.busy || this.over) return;
    this.busy = true;
    vibrate(8);
    // 门动画
    this.tweens.add({
      targets: c, scale: 1.08, alpha: 0.4, duration: 250,
      onComplete: () => {
        this.doors.forEach(d => d.destroy());
        this.doors = [];
        if (room.kind === 'enemy') this.resolveEnemy(room.data.tier);
        else if (room.kind === 'chest') this.resolveChest(room.data.reward);
        else if (room.kind === 'trap') this.resolveTrap(room.data.dmg);
        else this.resolveMerchant(room.data.heal, room.data.cost);
      }
    });
  }

  private resolveEnemy(tier: number) {
    const enemyNames = ['潜伏妖兽', '邪修', '上古妖魔', '魔将'];
    const name = enemyNames[Math.min(tier, 3)];
    const enemyDmg = 8 + tier * 6 + this.depth * 1.5;
    const enemyHp = 30 + tier * 30 + this.depth * 8;
    let myHp = this.hp;
    let foeHp = enemyHp;
    const playerAtk = (this.opts.baseDmg + Math.random() * 5) * this.opts.dmgBonus;
    const reps = 4;
    let log = `遭遇 ${name}！`;
    for (let i = 0; i < reps && foeHp > 0 && myHp > 0; i++) {
      foeHp -= playerAtk;
      if (foeHp <= 0) break;
      myHp -= enemyDmg * this.opts.defBonus;
    }
    if (foeHp <= 0 && myHp > 0) {
      const reward = 60 + tier * 50 + this.depth * 30;
      this.loot += reward;
      this.hp = Math.max(0, myHp);
      sfx.bossDown(); vibrate([30, 30, 50]);
      log += ` 击败敌人，+${reward} 灵石`;
    } else if (myHp <= 0) {
      this.hp = 0; sfx.death();
      log += ` 不敌 ${name}，重伤倒地...`;
    } else {
      this.hp = Math.max(0, myHp); sfx.hit();
      log += ` 双方僵持，撤回当前层`;
    }
    this.setLog(log);
    this.afterRoom();
  }

  private resolveChest(reward: number) {
    this.loot += reward;
    sfx.merge(); vibrate(15);
    if (Math.random() < 0.05 && this.depth >= 2) {
      const trapDmg = 15;
      this.hp -= trapDmg; sfx.hit();
      this.setLog(`宝箱有诈！+${reward} 灵石，但触发暗器 -${trapDmg} 气血`);
    } else {
      this.setLog(`开启宝箱，+${reward} 灵石`);
    }
    this.afterRoom();
  }

  private resolveTrap(dmg: number) {
    const realDmg = Math.max(1, Math.floor(dmg * this.opts.defBonus));
    this.hp -= realDmg; sfx.hit(); vibrate([20, 30, 20]);
    let extra = '';
    if (Math.random() < 0.5) {
      const small = 30 + this.depth * 10;
      this.loot += small;
      extra = `；触发后掉落 +${small} 灵石`;
    }
    this.setLog(`触发陷阱！-${realDmg} 气血${extra}`);
    this.afterRoom();
  }

  private resolveMerchant(heal: number, cost: number) {
    if (this.loot >= cost && this.hp < this.maxHp) {
      this.loot -= cost;
      this.hp = Math.min(this.maxHp, this.hp + heal);
      sfx.pillSuccess();
      this.setLog(`商人卖你一颗丹药，-${cost} 灵石，+${heal} 气血`);
    } else if (this.loot < cost) {
      this.setLog(`商人开价 ${cost} 灵石，你掏不出钱，挥手作别`);
    } else {
      this.setLog(`你气血充盈，商人无所交易`);
    }
    this.afterRoom();
  }

  private afterRoom() {
    this.redrawHpBar();
    if (this.hp <= 0) {
      this.endGame(Math.floor(this.loot * 0.5), '气血耗尽，被传送出谷');
      return;
    }
    this.depth += 1;
    this.time.delayedCall(900, () => {
      this.busy = false;
      this.spawnDoors();
    });
  }

  private setLog(text: string) {
    this.logBox.setText(text);
    this.logBox.setAlpha(0);
    this.tweens.add({ targets: this.logBox, alpha: 1, duration: 250 });
  }

  update() {
    if (this.over) return;
    this.hpText.setText(`${Math.max(0, Math.floor(this.hp))} / ${this.maxHp}`);
    this.depthText.setText(`第 ${this.depth} 层`);
    this.lootText.setText(`💎 ${this.loot}`);
    this.redrawHpBar();
  }

  private endGame(loot: number, reason: string) {
    if (this.over) return;
    this.over = true; this.busy = true;
    stopBgm();
    if (this.hp <= 0) sfx.death();
    this.doors.forEach(d => d.destroy());
    this.doors = [];
    this.retreatBtn.removeInteractive();
    this.retreatBtn.setAlpha(0.3);

    const W = this.W, H = this.H;
    const veil = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0).setDepth(100);
    this.tweens.add({ targets: veil, alpha: 0.7, duration: 400 });
    const t1 = this.add.text(W / 2, H / 2 - 40, '探险结束', {
      fontFamily: FONT, fontSize: '26px', color: '#f8fafc', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    const t2 = this.add.text(W / 2, H / 2 - 6, reason, {
      fontFamily: FONT, fontSize: '12px', color: '#cbd5e1',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    const t3 = this.add.text(W / 2, H / 2 + 24, `深入 ${this.depth} 层 · 带回 ${loot} 灵石`, {
      fontFamily: FONT, fontSize: '14px', color: '#fbbf24', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(101).setAlpha(0);
    this.tweens.add({ targets: [t1, t2, t3], alpha: 1, duration: 500, delay: 200 });
    this.time.delayedCall(1500, () => this.opts.onGameOver(loot));
  }
}

export function createDevilfallGame(opts: DevilfallOptions): Phaser.Game {
  const W = opts.width || 360;
  const H = opts.height || 540;
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: W, height: H,
    parent: opts.parent,
    backgroundColor: '#0a0612',
    scale: { mode: Phaser.Scale.NONE },
  });
  const startScene = () => {
    if (!game.scene.getScene('devilfall')) game.scene.add('devilfall', DevilfallScene, false);
    game.scene.start('devilfall', opts);
  };
  if (game.isBooted) startScene();
  else game.events.once('ready', startScene);
  return game;
}
