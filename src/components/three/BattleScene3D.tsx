import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * 秘境战斗 3D 场景：玩家头像（左）vs 敌人头像（右）
 * 主题由秘境决定：theme = blood / void / demon / kunwu
 * 状态：attacking 触发玩家前冲；hit 触发敌人后仰；defeated 敌人倒地
 */

type Theme = 'blood' | 'void' | 'demon' | 'kunwu';
type EnemyKind = 'humanoid' | 'beast' | 'boss';

const THEME_CONF: Record<Theme, { bg: string; fog: string; key: string; rim: string; ground: string }> = {
  blood:  { bg: '#180409', fog: '#180409', key: '#dc2626', rim: '#7c2d12', ground: '#3b0a0d' },
  void:   { bg: '#0a0820', fog: '#0a0820', key: '#a78bfa', rim: '#4c1d95', ground: '#1e1b4b' },
  demon:  { bg: '#0e0a06', fog: '#0e0a06', key: '#f59e0b', rim: '#7c2d12', ground: '#1c1408' },
  kunwu:  { bg: '#06141a', fog: '#06141a', key: '#22d3ee', rim: '#075985', ground: '#0c2a3a' },
};

// ===== 玩家头像（修士袍 + 飞剑环绕） =====
function PlayerAvatar({ swords, attacking }: { swords: number; attacking: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const swordRefs = useRef<THREE.Mesh[]>([]);
  const visible = Math.min(8, Math.max(2, Math.floor(swords / 9)));

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      // 攻击时前冲 + 回弹
      const targetX = attacking ? -1.0 : -2.0;
      ref.current.position.x += (targetX - ref.current.position.x) * Math.min(1, dt * 8);
      ref.current.position.y = Math.sin(t * 1.5) * 0.05; // 飘浮
    }
    // 飞剑环绕
    swordRefs.current.forEach((s, i) => {
      if (!s) return;
      const a = (i / visible) * Math.PI * 2 + t * 1.2;
      s.position.set(Math.cos(a) * 0.7, Math.sin(t * 2 + i) * 0.15 + 0.3, Math.sin(a) * 0.7);
      s.rotation.y = -a;
    });
  });

  return (
    <group ref={ref} position={[-2.0, 0, 0]}>
      {/* 修士长袍（圆锥体） */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <coneGeometry args={[0.55, 1.4, 16]} />
        <meshStandardMaterial color="#0e7490" emissive="#0c4a6e" emissiveIntensity={0.2} roughness={0.6} />
      </mesh>
      {/* 袍身金边 */}
      <mesh position={[0, -0.85, 0]}>
        <torusGeometry args={[0.50, 0.025, 6, 24]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.3} emissive="#fbbf24" emissiveIntensity={0.2} />
      </mesh>
      {/* 头（玉色） */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} />
      </mesh>
      {/* 发髻 */}
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.13, 0.18, 8]} />
        <meshStandardMaterial color="#1c1917" roughness={0.6} />
      </mesh>
      {/* 头顶玉簪 */}
      <mesh position={[0, 0.96, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.18, 6]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* 双袖 */}
      <mesh position={[-0.42, 0.05, 0]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.14, 0.55, 8]} />
        <meshStandardMaterial color="#0e7490" roughness={0.6} />
      </mesh>
      <mesh position={[0.42, 0.05, 0]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.14, 0.55, 8]} />
        <meshStandardMaterial color="#0e7490" roughness={0.6} />
      </mesh>

      {/* 飞剑环绕（小剑） */}
      {Array.from({ length: visible }).map((_, i) => (
        <mesh key={i} ref={(el) => { if (el) swordRefs.current[i] = el!; }}>
          <cylinderGeometry args={[0.02, 0.04, 0.45, 6]} />
          <meshStandardMaterial color="#a7f3d0" emissive="#22d3ee" emissiveIntensity={0.6} metalness={0.9} roughness={0.2} />
        </mesh>
      ))}

      {/* 攻击光晕 */}
      {attacking && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.0, 16, 12]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ===== 敌人头像 =====
function EnemyAvatar({ theme, kind, hit, defeated }: { theme: Theme; kind: EnemyKind; hit: boolean; defeated: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const conf = THEME_CONF[theme];

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    if (!ref.current) return;
    if (defeated) {
      // 倒地：旋转 + 沉降
      ref.current.rotation.z += (Math.PI / 2 - ref.current.rotation.z) * Math.min(1, dt * 4);
      ref.current.position.y += (-1.2 - ref.current.position.y) * Math.min(1, dt * 3);
      return;
    }
    // 受击后仰
    const targetX = hit ? 2.6 : 2.0;
    ref.current.position.x += (targetX - ref.current.position.x) * Math.min(1, dt * 8);
    ref.current.position.y = Math.sin(t * 1.2) * 0.08;
    ref.current.rotation.y = Math.sin(t * 0.5) * 0.15;
  });

  // 三种敌人形态
  if (kind === 'beast') {
    // 妖兽：四足 + 头颅 + 尖角
    return (
      <group ref={ref} position={[2.0, 0, 0]}>
        {/* 主体 */}
        <mesh castShadow scale={[1.2, 0.7, 1.6]}>
          <sphereGeometry args={[0.55, 16, 12]} />
          <meshStandardMaterial color={conf.key} emissive={conf.rim} emissiveIntensity={0.4} metalness={0.4} roughness={0.5} />
        </mesh>
        {/* 头 */}
        <mesh position={[-0.65, 0.25, 0]} castShadow>
          <sphereGeometry args={[0.32, 14, 10]} />
          <meshStandardMaterial color={conf.rim} emissive={conf.key} emissiveIntensity={0.3} roughness={0.6} />
        </mesh>
        {/* 双角 */}
        <mesh position={[-0.78, 0.55, 0.12]} rotation={[0.3, 0, 0.5]}>
          <coneGeometry args={[0.06, 0.32, 6]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
        <mesh position={[-0.78, 0.55, -0.12]} rotation={[-0.3, 0, 0.5]}>
          <coneGeometry args={[0.06, 0.32, 6]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
        {/* 红眼 */}
        <mesh position={[-0.85, 0.32, 0.13]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#fef2f2" emissive="#dc2626" emissiveIntensity={1.5} />
        </mesh>
        <mesh position={[-0.85, 0.32, -0.13]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#fef2f2" emissive="#dc2626" emissiveIntensity={1.5} />
        </mesh>
        {/* 四足 */}
        {[[-0.35, -0.55, 0.32], [-0.35, -0.55, -0.32], [0.35, -0.55, 0.32], [0.35, -0.55, -0.32]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]}>
            <cylinderGeometry args={[0.08, 0.06, 0.5, 6]} />
            <meshStandardMaterial color={conf.rim} />
          </mesh>
        ))}
        {/* 尾 */}
        <mesh position={[0.7, 0.0, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.06, 0.02, 0.55, 6]} />
          <meshStandardMaterial color={conf.key} emissive={conf.rim} emissiveIntensity={0.4} />
        </mesh>
      </group>
    );
  }

  if (kind === 'boss') {
    // BOSS：高大魔修，黑袍金边 + 头顶光环
    return (
      <group ref={ref} position={[2.0, 0.3, 0]}>
        {/* 黑袍 */}
        <mesh position={[0, -0.2, 0]} castShadow scale={[1.3, 1.5, 1.3]}>
          <coneGeometry args={[0.55, 1.6, 16]} />
          <meshStandardMaterial color="#1c1917" emissive={conf.key} emissiveIntensity={0.4} roughness={0.5} />
        </mesh>
        {/* 黑袍金边/血纹 */}
        <mesh position={[0, -0.95, 0]}>
          <torusGeometry args={[0.65, 0.03, 6, 32]} />
          <meshStandardMaterial color={conf.key} emissive={conf.key} emissiveIntensity={0.8} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* 头（魔修苍白脸） */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <sphereGeometry args={[0.27, 16, 12]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.4} />
        </mesh>
        {/* 黑发 */}
        <mesh position={[0, 1.05, -0.05]}>
          <coneGeometry args={[0.20, 0.30, 8]} />
          <meshStandardMaterial color="#0c0a09" roughness={0.7} />
        </mesh>
        {/* 头顶法环（旋转光环） */}
        <SpinRing color={conf.key} y={1.30} r={0.35} />
        {/* 双眼 */}
        <mesh position={[-0.10, 0.85, 0.22]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={conf.key} emissive={conf.key} emissiveIntensity={2.5} />
        </mesh>
        <mesh position={[0.10, 0.85, 0.22]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color={conf.key} emissive={conf.key} emissiveIntensity={2.5} />
        </mesh>
        {/* 法器（手中悬剑/法宝） */}
        <mesh position={[-0.5, 0.1, 0.3]} rotation={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.04, 0.06, 1.0, 6]} />
          <meshStandardMaterial color={conf.key} emissive={conf.key} emissiveIntensity={0.8} metalness={0.9} roughness={0.2} />
        </mesh>
        {/* BOSS 光柱 */}
        <pointLight position={[0, 0.5, 0]} intensity={1.5} color={conf.key} distance={4} />
      </group>
    );
  }

  // humanoid：普通人修敌人
  return (
    <group ref={ref} position={[2.0, 0, 0]}>
      {/* 长袍 */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <coneGeometry args={[0.50, 1.3, 16]} />
        <meshStandardMaterial color={conf.rim} emissive={conf.key} emissiveIntensity={0.2} roughness={0.6} />
      </mesh>
      {/* 头 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.21, 16, 12]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.5} />
      </mesh>
      {/* 发 */}
      <mesh position={[0, 0.78, 0]}>
        <coneGeometry args={[0.13, 0.18, 8]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      {/* 双袖 */}
      <mesh position={[-0.38, 0.05, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.13, 0.50, 8]} />
        <meshStandardMaterial color={conf.rim} />
      </mesh>
      <mesh position={[0.38, 0.05, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.13, 0.50, 8]} />
        <meshStandardMaterial color={conf.rim} />
      </mesh>
      {/* 持剑 */}
      <mesh position={[-0.55, 0.15, 0.15]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.025, 0.04, 0.7, 6]} />
        <meshStandardMaterial color={conf.key} emissive={conf.key} emissiveIntensity={0.5} metalness={0.85} roughness={0.25} />
      </mesh>
      {/* 双眼 */}
      <mesh position={[-0.08, 0.62, 0.18]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={conf.key} emissive={conf.key} emissiveIntensity={1.8} />
      </mesh>
      <mesh position={[0.08, 0.62, 0.18]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={conf.key} emissive={conf.key} emissiveIntensity={1.8} />
      </mesh>
    </group>
  );
}

function SpinRing({ color, y, r }: { color: string; y: number; r: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.getElapsedTime() * 1.5; });
  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[r, 0.015, 6, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

// ===== 攻击粒子（飞剑掠过/法宝光线） =====
function AttackBeam({ active, theme }: { active: boolean; theme: Theme }) {
  const ref = useRef<THREE.Mesh>(null);
  const conf = THEME_CONF[theme];
  useFrame((state, dt) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    if (active) {
      mat.opacity = Math.min(0.8, mat.opacity + dt * 8);
      ref.current.scale.x = 1 + Math.sin(state.clock.getElapsedTime() * 30) * 0.1;
    } else {
      mat.opacity = Math.max(0, mat.opacity - dt * 4);
    }
  });
  return (
    <mesh ref={ref} position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
      <meshBasicMaterial color={conf.key} transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

// ===== 战斗场景 =====
export default function BattleScene3D({
  theme,
  enemyKind,
  swords,
  attacking,
  enemyHit,
  enemyDefeated,
  height = 220,
}: {
  theme: Theme;
  enemyKind: EnemyKind;
  swords: number;
  attacking: boolean;
  enemyHit: boolean;
  enemyDefeated: boolean;
  height?: number;
}) {
  const conf = THEME_CONF[theme];
  // 主题相关粒子（灰烬/魔气/雪/雷雾）
  const particles = useMemo(() => {
    const arr = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = Math.random() * 3 - 1;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, []);

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas camera={{ position: [0, 1.0, 5.0], fov: 42 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={[conf.bg]} />
        <fog attach="fog" args={[conf.fog, 4, 10]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 4]} intensity={1.0} color={conf.key} castShadow />
        <pointLight position={[-3, 2, 2]} intensity={0.6} color="#67e8f9" />
        <pointLight position={[3, 2, 2]} intensity={0.7} color={conf.rim} />

        <PlayerAvatar swords={swords} attacking={attacking} />
        <EnemyAvatar theme={theme} kind={enemyKind} hit={enemyHit} defeated={enemyDefeated} />
        <AttackBeam active={attacking} theme={theme} />

        {/* 地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
          <circleGeometry args={[5, 48]} />
          <meshStandardMaterial color={conf.ground} roughness={0.95} />
        </mesh>
        {/* 地面阵纹 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.19, 0]}>
          <ringGeometry args={[1.6, 1.7, 64]} />
          <meshBasicMaterial color={conf.key} transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.18, 0]}>
          <ringGeometry args={[2.4, 2.45, 64]} />
          <meshBasicMaterial color={conf.key} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>

        {/* 主题氛围粒子 */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particles, 3]} />
          </bufferGeometry>
          <pointsMaterial size={0.04} color={conf.key} transparent opacity={0.45} sizeAttenuation depthWrite={false} />
        </points>
      </Canvas>
    </div>
  );
}
