// 修仙奇遇录 · Phaser 游戏引擎
// 真正的游戏：物理碰撞、角色控制、实时战斗、粒子特效、摄像机跟随

import * as Phaser from 'phaser';
import { ADVENTURE_REGIONS, ADVENTURE_EVENTS, getAvailableAdventureEvents, pickRandomAdventureEvent, getEnemyForRegion, type AdventureRegion, type AdventureNode, type CombatEnemy } from '../data/adventureData';

// 游戏事件回调
export interface GameCallbacks {
  onSpiritPowerChange: (current: number, max: number) => void;
  onCombatStart: (enemy: CombatEnemy, playerHp: number, enemyHp: number) => void;
  onCombatEnd: (victory: boolean) => void;
  onEncounter: (eventId: string) => void;
  onRegionChange: (regionId: string) => void;
  onNodeVisit: (nodeId: string, regionId: string) => void;
  onPlayerHpChange: (hp: number, maxHp: number) => void;
  onEnemyHpChange: (hp: number, maxHp: number) => void;
  onLog: (msg: string) => void;
  onComboChange: (combo: number) => void;
  onStoryFlag: (flag: string) => void;
}

// ============================================
// 场景1：启动场景
// ============================================
class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'Boot' }); }

  create() {
    // 生成所有纹理（程序化精灵）
    this.createTextures();
    this.scene.start('Explore');
  }

  createTextures() {
    // 修仙者 — 像素风角色
    const playerGfx = this.make.graphics({ x: 0, y: 0 });
    // 身体（道袍）
    playerGfx.fillStyle(0x4ade80, 1);
    playerGfx.fillRect(8, 16, 16, 20);
    // 头
    playerGfx.fillStyle(0xfde68a, 1);
    playerGfx.fillRect(10, 4, 12, 12);
    // 道冠
    playerGfx.fillStyle(0xfbbf24, 1);
    playerGfx.fillRect(12, 0, 8, 5);
    playerGfx.fillRect(13, 0, 6, 3);
    // 眼睛
    playerGfx.fillStyle(0x1e293b, 1);
    playerGfx.fillRect(13, 8, 2, 2);
    playerGfx.fillRect(17, 8, 2, 2);
    // 腰带
    playerGfx.fillStyle(0x92400e, 1);
    playerGfx.fillRect(8, 28, 16, 3);
    // 腿
    playerGfx.fillStyle(0x1e293b, 1);
    playerGfx.fillRect(10, 36, 5, 8);
    playerGfx.fillRect(17, 36, 5, 8);
    // 手
    playerGfx.fillStyle(0x4ade80, 1);
    playerGfx.fillRect(4, 18, 5, 4);
    playerGfx.fillRect(23, 18, 5, 4);
    // 飞剑（背后）
    playerGfx.fillStyle(0x94a3b8, 1);
    playerGfx.fillRect(25, 10, 2, 20);
    playerGfx.fillStyle(0x92400e, 1);
    playerGfx.fillRect(24, 28, 4, 3);
    playerGfx.generateTexture('player', 32, 44);
    playerGfx.destroy();

    // 妖狼
    const wolfGfx = this.make.graphics({ x: 0, y: 0 });
    wolfGfx.fillStyle(0x6b7280, 1);
    wolfGfx.fillRect(4, 12, 28, 14); // 身体
    wolfGfx.fillStyle(0x9ca3af, 1);
    wolfGfx.fillRect(26, 8, 12, 12); // 头
    wolfGfx.fillStyle(0x1f2937, 1);
    wolfGfx.fillRect(34, 11, 4, 4); // 鼻
    wolfGfx.fillStyle(0xef4444, 1);
    wolfGfx.fillRect(30, 10, 2, 2); // 眼
    wolfGfx.fillRect(30, 14, 2, 2); // 眼
    wolfGfx.fillStyle(0x4b5563, 1);
    wolfGfx.fillRect(26, 4, 3, 6); // 耳
    wolfGfx.fillRect(32, 4, 3, 6); // 耳
    wolfGfx.fillStyle(0x6b7280, 1);
    wolfGfx.fillRect(6, 26, 4, 10); // 腿x4
    wolfGfx.fillRect(14, 26, 4, 10);
    wolfGfx.fillRect(22, 26, 4, 10);
    wolfGfx.fillRect(28, 26, 4, 10);
    wolfGfx.fillStyle(0x9ca3af, 1);
    wolfGfx.fillRect(0, 10, 6, 4); // 尾
    wolfGfx.generateTexture('wolf', 40, 36);
    wolfGfx.destroy();

    // 散修
    const rogueGfx = this.make.graphics({ x: 0, y: 0 });
    rogueGfx.fillStyle(0x6b7280, 1);
    rogueGfx.fillRect(8, 16, 16, 22); // 身体
    rogueGfx.fillStyle(0xfde68a, 1);
    rogueGfx.fillRect(10, 4, 12, 12); // 头
    rogueGfx.fillStyle(0x92400e, 1);
    rogueGfx.fillRect(6, 0, 20, 6); // 斗笠
    rogueGfx.fillStyle(0x1e293b, 1);
    rogueGfx.fillRect(13, 8, 2, 2);
    rogueGfx.fillRect(17, 8, 2, 2);
    rogueGfx.fillStyle(0xa78bfa, 1);
    rogueGfx.fillRect(24, 14, 3, 22); // 法杖
    rogueGfx.fillStyle(0x374151, 1);
    rogueGfx.fillRect(10, 38, 5, 6);
    rogueGfx.fillRect(17, 38, 5, 6);
    rogueGfx.generateTexture('rogue', 32, 44);
    rogueGfx.destroy();

    // 蛟蛇
    const serpentGfx = this.make.graphics({ x: 0, y: 0 });
    serpentGfx.fillStyle(0x0e7490, 1);
    serpentGfx.fillRect(6, 10, 24, 18); // 身体
    serpentGfx.fillStyle(0x155e75, 1);
    serpentGfx.fillRect(26, 8, 14, 14); // 头
    serpentGfx.fillStyle(0xfbbf24, 1);
    serpentGfx.fillRect(36, 10, 3, 3); // 眼
    serpentGfx.fillRect(36, 16, 3, 3); // 眼
    serpentGfx.fillStyle(0x22d3ee, 1);
    serpentGfx.fillRect(14, 4, 4, 8); // 鳍
    serpentGfx.fillStyle(0x0e7490, 1);
    serpentGfx.fillRect(0, 14, 8, 6); // 尾
    serpentGfx.generateTexture('serpent', 44, 28);
    serpentGfx.destroy();

    // 鬼将
    const ghostGfx = this.make.graphics({ x: 0, y: 0 });
    ghostGfx.fillStyle(0x581c87, 1);
    ghostGfx.fillRect(8, 16, 16, 22); // 幽甲
    ghostGfx.fillStyle(0xe2e8f0, 1);
    ghostGfx.fillRect(10, 4, 12, 12); // 头骨
    ghostGfx.fillStyle(0xa855f7, 1);
    ghostGfx.fillRect(13, 8, 2, 2);
    ghostGfx.fillRect(17, 8, 2, 2);
    ghostGfx.fillStyle(0x7c3aed, 1);
    ghostGfx.fillRect(8, 0, 16, 5); // 冠
    ghostGfx.fillStyle(0x94a3b8, 1);
    ghostGfx.fillRect(24, 10, 3, 28); // 巨刀
    ghostGfx.fillStyle(0x374151, 1);
    ghostGfx.fillRect(10, 38, 5, 6);
    ghostGfx.fillRect(17, 38, 5, 6);
    ghostGfx.generateTexture('ghost', 32, 44);
    ghostGfx.destroy();

    // 仙将
    const guardianGfx = this.make.graphics({ x: 0, y: 0 });
    guardianGfx.fillStyle(0xb45309, 1);
    guardianGfx.fillRect(6, 16, 20, 24); // 金甲
    guardianGfx.fillStyle(0xfde68a, 1);
    guardianGfx.fillRect(10, 4, 12, 12); // 头
    guardianGfx.fillStyle(0xfbbf24, 1);
    guardianGfx.fillRect(12, 0, 8, 5); // 仙冠
    guardianGfx.fillRect(11, 20, 10, 8); // 胸甲纹
    guardianGfx.fillStyle(0xfbbf24, 1);
    guardianGfx.fillRect(13, 8, 2, 2);
    guardianGfx.fillRect(17, 8, 2, 2);
    guardianGfx.fillStyle(0xfbbf24, 1);
    guardianGfx.fillRect(26, 6, 3, 30); // 仙剑
    guardianGfx.fillStyle(0x78350f, 1);
    guardianGfx.fillRect(10, 40, 5, 6);
    guardianGfx.fillRect(17, 40, 5, 6);
    guardianGfx.generateTexture('guardian', 32, 46);
    guardianGfx.destroy();

    // 灵力光柱
    const pillarGfx = this.make.graphics({ x: 0, y: 0 });
    pillarGfx.fillStyle(0x06b6d4, 0.4);
    pillarGfx.fillRect(12, 0, 6, 60);
    pillarGfx.fillStyle(0x06b6d4, 0.8);
    pillarGfx.fillRect(10, 0, 10, 8);
    pillarGfx.generateTexture('pillar', 24, 60);
    pillarGfx.destroy();

    // 树
    const treeGfx = this.make.graphics({ x: 0, y: 0 });
    treeGfx.fillStyle(0x92400e, 1);
    treeGfx.fillRect(14, 30, 6, 16);
    treeGfx.fillStyle(0x15803d, 1);
    treeGfx.fillRect(4, 10, 26, 22);
    treeGfx.fillStyle(0x22c55e, 1);
    treeGfx.fillRect(8, 0, 18, 16);
    treeGfx.generateTexture('tree', 34, 46);
    treeGfx.destroy();

    // 石头
    const rockGfx = this.make.graphics({ x: 0, y: 0 });
    rockGfx.fillStyle(0x6b7280, 1);
    rockGfx.fillRect(2, 6, 20, 12);
    rockGfx.fillRect(6, 2, 12, 18);
    rockGfx.generateTexture('rock', 24, 20);
    rockGfx.destroy();

    // 伤害粒子
    const dmgGfx = this.make.graphics({ x: 0, y: 0 });
    dmgGfx.fillStyle(0xef4444, 1);
    dmgGfx.fillRect(0, 0, 4, 4);
    dmgGfx.generateTexture('dmgParticle', 4, 4);
    dmgGfx.destroy();

    // 灵力粒子
    const spiritGfx = this.make.graphics({ x: 0, y: 0 });
    spiritGfx.fillStyle(0x06b6d4, 1);
    spiritGfx.fillRect(0, 0, 3, 3);
    spiritGfx.generateTexture('spiritParticle', 3, 3);
    spiritGfx.destroy();

    // 剑气
    const slashGfx = this.make.graphics({ x: 0, y: 0 });
    slashGfx.fillStyle(0xfbbf24, 0.8);
    slashGfx.fillRect(0, 0, 30, 4);
    slashGfx.fillRect(10, 4, 20, 3);
    slashGfx.generateTexture('slash', 30, 7);
    slashGfx.destroy();
  }
}

// ============================================
// 场景2：地图探索场景
// ============================================
class ExploreScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private joystick!: { base: Phaser.GameObjects.Arc; stick: Phaser.GameObjects.Arc; active: boolean; dx: number; dy: number };
  private pointNodes: Phaser.GameObjects.Container[] = [];
  private currentRegion!: AdventureRegion;
  private levelIndex: number = 0;
  private spiritPower: number = 0;
  private maxSpiritPower: number = 50;
  private completedEvents: string[] = [];
  private storyFlags: Record<string, boolean> = {};
  private callbacks!: GameCallbacks;
  private worldBounds = { width: 1200, height: 1200 };
  private decorGroup!: Phaser.Physics.Arcade.StaticGroup;
  private nodeGroup!: Phaser.Physics.Arcade.StaticGroup;
  private spiritParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private isMoving = false;

  constructor() { super({ key: 'Explore' }); }

  init(data: { region?: AdventureRegion; levelIndex?: number; spiritPower?: number; maxSpiritPower?: number; completedEvents?: string[]; storyFlags?: Record<string, boolean>; callbacks?: GameCallbacks }) {
    this.currentRegion = data.region || ADVENTURE_REGIONS[0];
    this.levelIndex = data.levelIndex || 0;
    this.spiritPower = data.spiritPower || 0;
    this.maxSpiritPower = data.maxSpiritPower || 50;
    this.completedEvents = data.completedEvents || [];
    this.storyFlags = data.storyFlags || {};
    this.callbacks = data.callbacks || { onSpiritPowerChange: () => {}, onCombatStart: () => {}, onCombatEnd: () => {}, onEncounter: () => {}, onRegionChange: () => {}, onNodeVisit: () => {}, onPlayerHpChange: () => {}, onEnemyHpChange: () => {}, onLog: () => {}, onComboChange: () => {}, onStoryFlag: () => {} };
  }

  create() {
    const region = this.currentRegion;

    // 世界边界
    this.physics.world.setBounds(0, 0, this.worldBounds.width, this.worldBounds.height);

    // 背景 — 区域颜色
    const bgColors: Record<string, number> = {
      '凡人界': 0x3d2b1f, '天南': 0x1a3a2a, '乱星海': 0x0a2a3a,
      '阴冥之地': 0x1a0a2a, '灵界': 0x3a2a0a,
    };
    this.cameras.main.setBackgroundColor(bgColors[region.id] || 0x1a1a2a);

    // 网格地面（灵脉线）
    const grid = this.add.grid(this.worldBounds.width / 2, this.worldBounds.height / 2,
      this.worldBounds.width, this.worldBounds.height, 60, 60, 0x06b6d4, 0.05, 0x06b6d4, 0.08);

    // 装饰物（树、石头）— 静态碰撞体
    this.decorGroup = this.physics.add.staticGroup();
    this.generateDecor(region);

    // 地点节点 — 可交互
    this.nodeGroup = this.physics.add.staticGroup();
    this.pointNodes = [];
    this.generateNodes(region);

    // 玩家
    this.player = this.physics.add.sprite(this.worldBounds.width / 2, this.worldBounds.height - 100, 'player');
    this.player.setScale(1.5);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.setSize(20, 30);
    this.player.setOffset(6, 14);

    // 碰撞
    this.physics.add.collider(this.player, this.decorGroup);
    this.physics.add.overlap(this.player, this.nodeGroup, this.onReachNode, undefined, this);

    // 相机跟随
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.2);

    // 输入
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // 虚拟摇杆（触屏）
    this.joystick = this.createJoystick();

    // 灵力粒子
    this.spiritParticles = this.add.particles(0, 0, 'spiritParticle', {
      follow: this.player,
      followOffset: { x: 0, y: -10 },
      speed: { min: 10, max: 30 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 600,
      quantity: 1,
      frequency: 200,
      blendMode: 'ADD',
    });
    this.spiritParticles.setDepth(9);

    // 区域标识
    const regionLabel = this.add.text(this.worldBounds.width / 2, 30, `${region.iconEmoji} ${region.name}`, {
      fontSize: '16px', color: '#fbbf24', fontFamily: 'sans-serif', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
  }

  createJoystick() {
    const cx = 80, cy = this.scale.height - 80;
    const base = this.add.circle(cx, cy, 40, 0x1e293b, 0.5).setScrollFactor(0).setDepth(100).setStrokeStyle(2, 0x475569);
    const stick = this.add.circle(cx, cy, 18, 0x64748b, 0.7).setScrollFactor(0).setDepth(101);

    let touchId: number | null = null;

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.x < 160 && p.y > this.scale.height - 160) {
        touchId = p.id;
      }
    });

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (p.id === touchId) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 35;
        const clamp = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);
        stick.x = cx + Math.cos(angle) * clamp;
        stick.y = cy + Math.sin(angle) * clamp;
      }
    });

    const reset = () => {
      touchId = null;
      stick.x = cx;
      stick.y = cy;
    };
    this.input.on('pointerup', reset);
    this.input.on('pointercancel', reset);

    return {
      base, stick, active: false,
      get dx() { return (stick.x - cx) / 35; },
      get dy() { return (stick.y - cy) / 35; },
    };
  }

  generateDecor(region: AdventureRegion) {
    const treeCounts: Record<string, number> = { '凡人界': 12, '天南': 18, '乱星海': 3, '阴冥之地': 8, '灵界': 5 };
    const rockCounts: Record<string, number> = { '凡人界': 6, '天南': 8, '乱星海': 15, '阴冥之地': 10, '灵界': 8 };
    const tc = treeCounts[region.id] || 8;
    const rc = rockCounts[region.id] || 6;

    for (let i = 0; i < tc; i++) {
      const x = 80 + Math.random() * (this.worldBounds.width - 160);
      const y = 80 + Math.random() * (this.worldBounds.height - 160);
      // 避开中心区域（玩家出生点）
      if (Math.abs(x - this.worldBounds.width / 2) < 100 && Math.abs(y - (this.worldBounds.height - 100)) < 100) continue;
      const s = this.decorGroup.create(x, y, 'tree');
      s.setScale(1.2 + Math.random() * 0.8);
      s.setSize(20, 16);
      s.setOffset(7, 30);
      s.setDepth(y > this.worldBounds.height / 2 ? 5 : 3);
    }

    for (let i = 0; i < rc; i++) {
      const x = 80 + Math.random() * (this.worldBounds.width - 160);
      const y = 80 + Math.random() * (this.worldBounds.height - 160);
      if (Math.abs(x - this.worldBounds.width / 2) < 80 && Math.abs(y - (this.worldBounds.height - 100)) < 80) continue;
      const r = this.decorGroup.create(x, y, 'rock');
      r.setScale(1 + Math.random() * 1.5);
      r.setSize(20, 14);
      r.setOffset(2, 6);
      r.setDepth(2);
    }

    this.decorGroup.refresh();
  }

  generateNodes(region: AdventureRegion) {
    region.nodes.forEach((node, i) => {
      const x = 100 + (node.x / 100) * (this.worldBounds.width - 200);
      const y = 100 + (node.y / 100) * (this.worldBounds.height - 200);
      const locked = !!(node.requiredStoryFlag && !this.storyFlags[node.requiredStoryFlag]);

      // 光柱
      const pillar = this.add.sprite(x, y - 20, 'pillar').setAlpha(locked ? 0.2 : 0.6);
      if (!locked) {
        this.tweens.add({ targets: pillar, y: y - 25, yoyo: true, repeat: -1, duration: 1500, ease: 'Sine.easeInOut' });
      }

      // 标签
      const label = this.add.text(x, y + 30, node.name, {
        fontSize: '11px', color: locked ? '#ef4444' : '#06b6d4', fontFamily: 'sans-serif',
        stroke: '#000', strokeThickness: 2, align: 'center',
      }).setOrigin(0.5);

      // 碰撞区（隐形）
      const hitArea = this.add.circle(x, y, 30, 0x06b6d4, 0);
      const body = this.nodeGroup.create(x, y);
      body.setSize(50, 50);
      body.setOffset(-25, -25);
      body.setVisible(false);
      body.setData('nodeId', node.id);
      body.setData('locked', locked);

      // 节点类型标识
      const iconMap: Record<string, string> = {
        village: '🏠', cave: '🕳️', forest: '🌲', mountain: '🏔️',
        river: '💧', ruins: '🏚️', market: '🏪', gate: '⛩️',
      };
      const icon = this.add.text(x, y - 4, iconMap[node.type] || '📍', {
        fontSize: '20px', align: 'center',
      }).setOrigin(0.5);
    });

    this.nodeGroup.refresh();
  }

  onReachNode(_player: any, nodeBody: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.Sprite) {
    const body = nodeBody as Phaser.Physics.Arcade.Sprite;
    const nodeId = body.getData('nodeId');
    const locked = body.getData('locked');
    if (locked || !nodeId) return;

    const region = this.currentRegion;
    const cost = region.spiritPowerCost;

    if (this.spiritPower < cost) {
      this.callbacks.onLog('⚡ 灵力不足！喝水补充灵力');
      return;
    }

    // 消耗灵力
    this.spiritPower -= cost;
    this.callbacks.onSpiritPowerChange(this.spiritPower, this.maxSpiritPower);
    this.callbacks.onNodeVisit(nodeId, region.id);

    // 禁用节点碰撞（防重复触发）
    (nodeBody as Phaser.Physics.Arcade.Sprite).setData('locked', true);

    // 查找事件
    const available = getAvailableAdventureEvents(region.id, this.levelIndex, this.storyFlags, this.completedEvents);
    const node = region.nodes.find(n => n.id === nodeId);
    const nodeEvents = available.filter(e => node?.events.includes(e.id));
    const event = nodeEvents.length > 0 ? pickRandomAdventureEvent(nodeEvents) : pickRandomAdventureEvent(available);

    if (event) {
      this.callbacks.onEncounter(event.id);
      if (event.type === 'combat') {
        const enemy = getEnemyForRegion(region.id);
        if (enemy) {
          // 暂停玩家
          this.player.setVelocity(0, 0);
          this.callbacks.onCombatStart(enemy, 100 + this.levelIndex * 20, enemy.hp);
        }
      }
    }

    // 2秒后重新开放节点
    this.time.delayedCall(2000, () => {
      (nodeBody as Phaser.Physics.Arcade.Sprite).setData('locked', false);
    });
  }

  update() {
    if (!this.player || !this.player.active) return;

    const speed = 200;
    let vx = 0, vy = 0;

    // 键盘
    if (this.cursors?.left.isDown || this.wasd?.A.isDown) vx -= 1;
    if (this.cursors?.right.isDown || this.wasd?.D.isDown) vx += 1;
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) vy -= 1;
    if (this.cursors?.down.isDown || this.wasd?.S.isDown) vy += 1;

    // 虚拟摇杆
    if (Math.abs(this.joystick.dx) > 0.15 || Math.abs(this.joystick.dy) > 0.15) {
      vx = this.joystick.dx;
      vy = this.joystick.dy;
    }

    // 归一化
    const len = Math.sqrt(vx * vx + vy * vy);
    if (len > 0) {
      vx = (vx / len) * speed;
      vy = (vy / len) * speed;
      this.isMoving = true;
      // 翻转朝向
      this.player.setFlipX(vx < 0);
    } else {
      this.isMoving = false;
    }

    this.player.setVelocity(vx, vy);

    // 行走弹跳
    if (this.isMoving) {
      this.player.y += Math.sin(this.time.now * 0.015) * 0.3;
    }
  }

  // 外部调用：更新灵力
  updateSpiritPower(amount: number) {
    this.spiritPower = Math.min(Math.max(0, this.spiritPower + amount), this.maxSpiritPower);
    this.callbacks.onSpiritPowerChange(this.spiritPower, this.maxSpiritPower);
  }

  setSpiritPower(val: number, max: number) {
    this.spiritPower = val;
    this.maxSpiritPower = max;
  }
}

// ============================================
// 场景3：战斗场景
// ============================================
class CombatScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private enemy!: Phaser.Physics.Arcade.Sprite;
  private enemyData!: CombatEnemy;
  private playerHp: number = 100;
  private playerMaxHp: number = 100;
  private enemyHp: number = 100;
  private enemyMaxHp: number = 100;
  private playerAttack: number = 10;
  private playerDefense: number = 5;
  private baseLuck: number = 50;
  private equippedSkills: string[] = [];
  private combo: number = 0;
  private isPlayerTurn: boolean = true;
  private isAnimating: boolean = false;
  private combatOver: boolean = false;
  private callbacks!: GameCallbacks;
  private enemyTextureKey: string = 'wolf';
  private slashFx!: Phaser.GameObjects.Sprite;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private comboText!: Phaser.GameObjects.Text;
  private battleLog!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'Combat' }); }

  init(data: { enemy: CombatEnemy; playerHp: number; playerAttack: number; playerDefense: number; baseLuck: number; equippedSkills: string[]; callbacks: GameCallbacks }) {
    this.enemyData = data.enemy;
    this.playerMaxHp = data.playerHp;
    this.playerHp = data.playerHp;
    this.enemyMaxHp = data.enemy.hp;
    this.enemyHp = data.enemy.hp;
    this.playerAttack = data.playerAttack;
    this.playerDefense = data.playerDefense;
    this.baseLuck = data.baseLuck;
    this.equippedSkills = data.equippedSkills;
    this.callbacks = data.callbacks;
    this.isPlayerTurn = true;
    this.isAnimating = false;
    this.combatOver = false;
    this.combo = 0;

    // 选择敌人贴图
    const texMap: Record<string, string> = {
      'demon_wolf': 'wolf', 'rogue_cultivator': 'rogue',
      'sea_serpent': 'serpent', 'ghost_general': 'ghost',
      'spirit_guardian': 'guardian',
    };
    this.enemyTextureKey = texMap[data.enemy.id] || 'wolf';
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0a0a1a);

    // 战斗台
    const platY = this.scale.height / 2 + 40;
    this.add.rectangle(this.scale.width / 2, platY, this.scale.width - 40, 4, 0x475569);
    this.add.rectangle(this.scale.width / 2, platY + 2, this.scale.width - 40, 8, 0x1e293b);

    // 玩家
    this.player = this.physics.add.sprite(120, platY - 30, 'player').setScale(2).setDepth(10);
    this.player.setCollideWorldBounds(true);

    // 敌人
    this.enemy = this.physics.add.sprite(this.scale.width - 120, platY - 30, this.enemyTextureKey).setScale(2).setDepth(10);
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setFlipX(true);

    // 敌人呼吸动画
    this.tweens.add({
      targets: this.enemy, y: platY - 35, yoyo: true, repeat: -1,
      duration: 1200, ease: 'Sine.easeInOut',
    });

    // 剑气特效（隐藏）
    this.slashFx = this.add.sprite(this.scale.width / 2, platY - 40, 'slash').setAlpha(0).setDepth(15).setScale(2);
    this.slashFx.setAngle(-15);

    // 粒子
    this.particles = this.add.particles(this.scale.width / 2, platY - 40, 'dmgParticle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1.5, end: 0 },
      lifespan: 500,
      quantity: 0,
      blendMode: 'ADD',
    });

    // 连击显示
    this.comboText = this.add.text(this.scale.width / 2, 80, '', {
      fontSize: '28px', color: '#fbbf24', fontFamily: 'sans-serif', stroke: '#000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    // 战斗日志
    this.battleLog = this.add.text(this.scale.width / 2, this.scale.height - 20, '', {
      fontSize: '12px', color: '#94a3b8', fontFamily: 'sans-serif', stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(20);

    // 相机震动效果
    this.cameras.main.shake(200, 0.005);

    // 开场动画：敌人出现
    this.enemy.setAlpha(0).setScale(0);
    this.tweens.add({
      targets: this.enemy, alpha: 1, scaleX: 2, scaleY: 2,
      duration: 500, ease: 'Back.easeOut',
    });

    // 更新HUD
    this.callbacks.onPlayerHpChange(this.playerHp, this.playerMaxHp);
    this.callbacks.onEnemyHpChange(this.enemyHp, this.enemyMaxHp);

    // 显示回合提示
    this.showTurnIndicator();

    // 触屏攻击按钮
    const atkBtn = this.add.circle(this.scale.width / 2, this.scale.height - 80, 35, 0xef4444, 0.3).setStrokeStyle(2, 0xef4444).setDepth(30).setInteractive();
    this.add.text(this.scale.width / 2, this.scale.height - 80, '⚔️', { fontSize: '20px' }).setOrigin(0.5).setDepth(31);
    atkBtn.on('pointerdown', () => this.doAttack());

    // 技能按钮
    const skillBtn = this.add.circle(this.scale.width / 2 - 80, this.scale.height - 80, 28, 0xa855f7, 0.3).setStrokeStyle(2, 0xa855f7).setDepth(30).setInteractive();
    this.add.text(this.scale.width / 2 - 80, this.scale.height - 80, '✨', { fontSize: '16px' }).setOrigin(0.5).setDepth(31);
    skillBtn.on('pointerdown', () => this.doSkill());

    // 防御按钮
    const defBtn = this.add.circle(this.scale.width / 2 + 80, this.scale.height - 80, 28, 0x3b82f6, 0.3).setStrokeStyle(2, 0x3b82f6).setDepth(30).setInteractive();
    this.add.text(this.scale.width / 2 + 80, this.scale.height - 80, '🛡️', { fontSize: '16px' }).setOrigin(0.5).setDepth(31);
    defBtn.on('pointerdown', () => this.doDefend());

    // 逃跑按钮
    const fleeBtn = this.add.text(this.scale.width - 40, 20, '🏃', { fontSize: '20px' }).setDepth(30).setInteractive();
    fleeBtn.on('pointerdown', () => this.doFlee());

    // 键盘快捷键
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-J', () => this.doAttack());
      this.input.keyboard.on('keydown-K', () => this.doSkill());
      this.input.keyboard.on('keydown-L', () => this.doDefend());
    }
  }

  showTurnIndicator() {
    const text = this.add.text(this.scale.width / 2, 60, '⚔️ 你的回合', {
      fontSize: '14px', color: '#4ade80', fontFamily: 'sans-serif', stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({ targets: text, alpha: 1, y: 55, duration: 300, yoyo: true, hold: 500, onComplete: () => text.destroy() });
  }

  doAttack() {
    if (!this.isPlayerTurn || this.isAnimating || this.combatOver) return;
    this.isAnimating = true;
    this.isPlayerTurn = false;

    const crit = Math.random() < 0.15 + this.baseLuck * 0.001;
    let dmg = Math.max(1, this.playerAttack - this.enemyData.defense + Math.floor(Math.random() * 10));
    if (crit) dmg = Math.floor(dmg * 1.8);

    this.combo++;
    this.callbacks.onComboChange(this.combo);

    // 角色冲前动画
    this.tweens.add({
      targets: this.player, x: this.enemy.x - 60, duration: 200, ease: 'Quad.easeIn',
      onComplete: () => {
        // 剑气特效
        this.slashFx.setPosition(this.enemy.x - 20, this.enemy.y - 20).setAlpha(1).setAngle(-15 + Math.random() * 30);
        this.tweens.add({ targets: this.slashFx, alpha: 0, duration: 200 });

        // 粒子
        this.particles.emitParticleAt(this.enemy.x, this.enemy.y - 20, 8);

        // 相机震动
        this.cameras.main.shake(100, crit ? 0.01 : 0.005);

        // 敌人受击闪烁
        this.tweens.add({
          targets: this.enemy, alpha: 0.2, duration: 50, yoyo: true, repeat: 3,
        });

        // 伤害飘字
        this.showDamage(this.enemy.x, this.enemy.y - 50, crit ? `暴击! -${dmg}` : `-${dmg}`, crit ? 0xfbbf24 : 0xef4444);

        // 敌人后退
        this.tweens.add({
          targets: this.enemy, x: this.enemy.x + 15, duration: 100, yoyo: true,
        });

        // 角色回位
        this.tweens.add({
          targets: this.player, x: 120, duration: 200, delay: 100, ease: 'Quad.easeOut',
          onComplete: () => {
            this.enemyHp = Math.max(0, this.enemyHp - dmg);
            this.callbacks.onEnemyHpChange(this.enemyHp, this.enemyMaxHp);
            this.isAnimating = false;

            if (this.enemyHp <= 0) {
              this.onVictory();
            } else {
              this.time.delayedCall(500, () => this.doEnemyTurn());
            }
          },
        });
      },
    });

    this.battleLog.setText(crit ? `💥 暴击！造成 ${dmg} 伤害` : `⚔️ 攻击！造成 ${dmg} 伤害`);
  }

  doSkill() {
    if (!this.isPlayerTurn || this.isAnimating || this.combatOver || this.equippedSkills.length === 0) return;
    this.isAnimating = true;
    this.isPlayerTurn = false;

    let dmg = Math.max(1, Math.floor(this.playerAttack * 1.8) - this.enemyData.defense);

    // 灵力爆发特效
    this.tweens.add({
      targets: this.player, scaleX: 2.5, scaleY: 2.5, duration: 150, yoyo: true,
    });

    this.time.delayedCall(300, () => {
      // 大剑气
      this.slashFx.setPosition(this.scale.width / 2, this.enemy.y - 30).setAlpha(1).setScale(3).setAngle(-30);
      this.tweens.add({ targets: this.slashFx, alpha: 0, scaleX: 0.5, scaleY: 0.5, duration: 300 });

      // 大量粒子
      this.particles.emitParticleAt(this.enemy.x, this.enemy.y - 20, 20);
      this.cameras.main.shake(200, 0.015);

      // 敌人受击
      this.tweens.add({ targets: this.enemy, alpha: 0.1, duration: 50, yoyo: true, repeat: 5 });
      this.tweens.add({ targets: this.enemy, x: this.enemy.x + 25, duration: 100, yoyo: true });

      this.showDamage(this.enemy.x, this.enemy.y - 60, `⚡-${dmg}`, 0xa78bfa);

      this.time.delayedCall(400, () => {
        this.enemyHp = Math.max(0, this.enemyHp - dmg);
        this.callbacks.onEnemyHpChange(this.enemyHp, this.enemyMaxHp);
        this.isAnimating = false;

        if (this.enemyHp <= 0) {
          this.onVictory();
        } else {
          this.time.delayedCall(300, () => this.doEnemyTurn());
        }
      });
    });

    this.battleLog.setText(`✨ 释放技能！造成 ${dmg} 伤害`);
  }

  doDefend() {
    if (!this.isPlayerTurn || this.isAnimating || this.combatOver) return;
    this.isAnimating = true;
    this.isPlayerTurn = false;

    // 防御姿态
    this.tweens.add({
      targets: this.player, scaleX: 1.6, scaleY: 1.8, duration: 150, yoyo: true,
    });
    this.showDamage(this.player.x, this.player.y - 50, '🛡️ 格挡', 0x3b82f6);
    this.battleLog.setText('🛡️ 进入防御姿态！');

    this.time.delayedCall(400, () => {
      this.isAnimating = false;
      this.doEnemyTurn(true);
    });
  }

  doFlee() {
    if (!this.isPlayerTurn || this.isAnimating || this.combatOver) return;
    const chance = 0.4 + this.baseLuck * 0.003;
    if (Math.random() < chance) {
      this.battleLog.setText('🏃 成功逃跑！');
      this.tweens.add({
        targets: this.player, x: -50, alpha: 0, duration: 400,
        onComplete: () => this.endCombat(false),
      });
    } else {
      this.battleLog.setText('🏃 逃跑失败！');
      this.isPlayerTurn = false;
      this.time.delayedCall(300, () => this.doEnemyTurn());
    }
  }

  doEnemyTurn(playerDefending = false) {
    this.isAnimating = true;

    // 选技能
    const roll = Math.random();
    let cum = 0, skill = this.enemyData.skills[0];
    for (const s of this.enemyData.skills) { cum += s.chance; if (roll < cum) { skill = s; break; } }

    // 敌人冲前
    this.tweens.add({
      targets: this.enemy, x: this.player.x + 60, duration: 250, ease: 'Quad.easeIn',
      onComplete: () => {
        let dmg = 0;
        if (skill.damage > 0) {
          dmg = Math.max(1, skill.damage - this.playerDefense + Math.floor(Math.random() * 5));
          if (playerDefending) dmg = Math.max(1, Math.floor(dmg * 0.3));

          // 特效
          this.slashFx.setPosition(this.player.x + 20, this.player.y - 20).setAlpha(1).setAngle(165);
          this.tweens.add({ targets: this.slashFx, alpha: 0, duration: 200 });
          this.particles.emitParticleAt(this.player.x, this.player.y - 20, 6);
          this.cameras.main.shake(100, 0.008);

          // 玩家受击
          this.tweens.add({ targets: this.player, alpha: 0.2, duration: 50, yoyo: true, repeat: 3 });
          this.tweens.add({ targets: this.player, x: this.player.x - 15, duration: 100, yoyo: true });
          this.showDamage(this.player.x, this.player.y - 50, `-${dmg}${playerDefending ? ' 格挡!' : ''}`, 0xef4444);

          this.combo = 0;
          this.callbacks.onComboChange(0);
        }

        this.battleLog.setText(`${skill.emoji} ${skill.message}`);

        // 敌人回位
        this.tweens.add({
          targets: this.enemy, x: this.scale.width - 120, duration: 200, delay: 100,
          onComplete: () => {
            if (dmg > 0) {
              this.playerHp = Math.max(0, this.playerHp - dmg);
              this.callbacks.onPlayerHpChange(this.playerHp, this.playerMaxHp);
            }
            this.isAnimating = false;

            if (this.playerHp <= 0) {
              this.onDefeat();
            } else {
              this.isPlayerTurn = true;
              this.showTurnIndicator();
            }
          },
        });
      },
    });
  }

  showDamage(x: number, y: number, text: string, color: number) {
    const hex = '#' + color.toString(16).padStart(6, '0');
    const t = this.add.text(x, y, text, {
      fontSize: text.includes('暴击') ? '18px' : '14px', color: hex, fontFamily: 'sans-serif',
      stroke: '#000', strokeThickness: 3, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 1000, onComplete: () => t.destroy() });
  }

  onVictory() {
    this.combatOver = true;
    this.battleLog.setText('🏆 胜利！');

    // 敌人倒下动画
    this.tweens.add({
      targets: this.enemy, angle: 90, alpha: 0, y: this.enemy.y + 40, scaleX: 0.3, scaleY: 0.3,
      duration: 600, ease: 'Quad.easeIn',
    });

    // 胜利闪光
    this.cameras.main.flash(500, 251, 191, 36);
    this.particles.emitParticleAt(this.enemy.x, this.enemy.y, 30);

    this.time.delayedCall(1500, () => this.endCombat(true));
  }

  onDefeat() {
    this.combatOver = true;
    this.battleLog.setText('💀 败北...');

    this.tweens.add({
      targets: this.player, angle: -90, alpha: 0, y: this.player.y + 40,
      duration: 600, ease: 'Quad.easeIn',
    });

    this.cameras.main.flash(500, 239, 68, 68);

    this.time.delayedCall(1500, () => this.endCombat(false));
  }

  endCombat(victory: boolean) {
    this.callbacks.onCombatEnd(victory);
    this.scene.stop('Combat');
    this.scene.start('Explore');
  }
}

// ============================================
// 创建 Phaser 游戏实例
// ============================================
export function createAdventureGame(
  parent: string | HTMLElement,
  callbacks: GameCallbacks,
  initialState: {
    levelIndex: number;
    spiritPower: number;
    maxSpiritPower: number;
    completedEvents: string[];
    storyFlags: Record<string, boolean>;
    currentRegion: string;
  }
): Phaser.Game {
  const region = ADVENTURE_REGIONS.find(r => r.id === initialState.currentRegion) || ADVENTURE_REGIONS[0];

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width: '100%',
    height: '100%',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [BootScene, ExploreScene, CombatScene],
    input: {
      activePointers: 3,
      touch: { capture: true },
    },
    render: {
      pixelArt: true,
      antialias: false,
    },
    transparent: true,
    backgroundColor: '#0a0a1a',
  };

  const game = new Phaser.Game(config);

  // 游戏启动后传递初始数据
  game.events.once('ready', () => {
    const explore = game.scene.getScene('Explore') as ExploreScene;
    if (explore) {
      explore.scene.restart({
        region,
        levelIndex: initialState.levelIndex,
        spiritPower: initialState.spiritPower,
        maxSpiritPower: initialState.maxSpiritPower,
        completedEvents: initialState.completedEvents,
        storyFlags: initialState.storyFlags,
        callbacks,
      });
    }
  });

  return game;
}

// ============================================
// 外部接口：控制游戏
// ============================================
export function startCombatInGame(game: Phaser.Game, enemy: CombatEnemy, playerHp: number, playerAttack: number, playerDefense: number, baseLuck: number, equippedSkills: string[], callbacks: GameCallbacks) {
  game.scene.stop('Explore');
  game.scene.start('Combat', {
    enemy, playerHp, playerAttack, playerDefense, baseLuck, equippedSkills, callbacks,
  });
}

export function updateSpiritPowerInGame(game: Phaser.Game, val: number, max: number) {
  const explore = game.scene.getScene('Explore') as ExploreScene;
  if (explore && explore.scene.isActive()) {
    explore.setSpiritPower(val, max);
  }
}

export function switchRegionInGame(game: Phaser.Game, region: AdventureRegion, levelIndex: number, spiritPower: number, maxSpiritPower: number, completedEvents: string[], storyFlags: Record<string, boolean>, callbacks: GameCallbacks) {
  const explore = game.scene.getScene('Explore') as ExploreScene;
  if (explore) {
    explore.scene.restart({
      region, levelIndex, spiritPower, maxSpiritPower, completedEvents, storyFlags, callbacks,
    });
  }
}
