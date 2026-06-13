import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

/**
 * 灵兽 3D — 三种原创造型，全 primitive 拼合
 * 修复：
 *  - 蜘蛛腿改为三段关节折线，弯折自然
 *  - 蚣身体节用 CapsuleGeometry 平滑连接 + 多对足
 *  - 啼魂兽加飘动魂火粒子 + 鳍状魂尾
 */

// ===== 血玉蜘蛛 =====
function BloodJadeSpider({ stage }: { stage: number }) {
  const ref = useRef<THREE.Group>(null);
  const legGroups = useRef<THREE.Group[]>([]);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = Math.sin(t * 1.5) * 0.06;
    }
    legGroups.current.forEach((leg, i) => {
      if (leg) {
        // 腿部摆动（前后腿反向）
        leg.rotation.y = Math.sin(t * 2.5 + i * 0.7) * 0.12;
      }
    });
  });

  // 8 条腿：4 前 + 4 后，左右各半
  const legSpecs = [
    { yaw: 0.4, lift: 0.0 },   // 右-前1
    { yaw: 1.0, lift: 0.05 },  // 右-前2
    { yaw: 2.1, lift: 0.05 },  // 右-后1
    { yaw: 2.7, lift: 0.0 },   // 右-后2
    { yaw: -0.4, lift: 0.0 },
    { yaw: -1.0, lift: 0.05 },
    { yaw: -2.1, lift: 0.05 },
    { yaw: -2.7, lift: 0.0 },
  ];
  const intensity = 0.25 + stage * 0.12;

  return (
    <group ref={ref}>
      {/* 腹部（后大球，半透红玉） */}
      <mesh castShadow position={[0, 0.05, -0.35]} scale={[1.05, 0.9, 1.15]}>
        <sphereGeometry args={[0.55, 24, 18]} />
        <meshPhysicalMaterial
          color="#dc2626" emissive="#7f1d1d" emissiveIntensity={intensity}
          metalness={0.25} roughness={0.3} transmission={0.35} thickness={0.6}
          ior={1.5} clearcoat={0.6}
        />
      </mesh>
      {/* 腹部花纹（暗纹） */}
      <mesh position={[0, 0.45, -0.35]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.3, 0.025, 6, 16]} />
        <meshStandardMaterial color="#450a0a" roughness={0.8} />
      </mesh>
      {/* 腹部玉色光斑 */}
      <mesh position={[-0.18, 0.25, -0.30]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color="#fca5a5" emissive="#fca5a5" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.20, 0.10, -0.50]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#fee2e2" emissive="#fee2e2" emissiveIntensity={0.6} />
      </mesh>
      {/* 头胸（中等球） */}
      <mesh castShadow position={[0, 0.0, 0.30]} scale={[0.95, 0.7, 1.0]}>
        <sphereGeometry args={[0.38, 18, 14]} />
        <meshStandardMaterial color="#991b1b" emissive="#450a0a" emissiveIntensity={intensity * 0.8} metalness={0.45} roughness={0.4} />
      </mesh>
      {/* 螯肢（前突两根） */}
      <mesh position={[-0.10, -0.05, 0.55]} rotation={[Math.PI / 2.5, 0, 0.2]}>
        <coneGeometry args={[0.04, 0.18, 6]} />
        <meshStandardMaterial color="#7f1d1d" />
      </mesh>
      <mesh position={[0.10, -0.05, 0.55]} rotation={[Math.PI / 2.5, 0, -0.2]}>
        <coneGeometry args={[0.04, 0.18, 6]} />
        <meshStandardMaterial color="#7f1d1d" />
      </mesh>
      {/* 4 对眼（蜘蛛特征） */}
      {[
        { x: -0.18, y: 0.18 }, { x: -0.07, y: 0.20 },
        { x: 0.07, y: 0.20 }, { x: 0.18, y: 0.18 },
      ].map((e, i) => (
        <mesh key={i} position={[e.x, e.y, 0.55]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#fef2f2" emissive="#fef2f2" emissiveIntensity={1.2} />
        </mesh>
      ))}

      {/* 8 条三段折腿 */}
      {legSpecs.map((leg, i) => {
        const sx = Math.sign(Math.sin(leg.yaw)) || 1;
        return (
          <group
            key={i}
            ref={(el) => { if (el) legGroups.current[i] = el; }}
            position={[Math.sin(leg.yaw) * 0.22, leg.lift, Math.cos(leg.yaw) * 0.22]}
            rotation={[0, leg.yaw, 0]}
          >
            {/* 髋（向上斜出） */}
            <mesh position={[0.18 * sx, 0.18, 0]} rotation={[0, 0, sx * -0.8]}>
              <cylinderGeometry args={[0.025, 0.020, 0.42, 6]} />
              <meshStandardMaterial color="#7f1d1d" emissive="#450a0a" emissiveIntensity={0.2} />
            </mesh>
            {/* 关节球 */}
            <mesh position={[0.36 * sx, 0.30, 0]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#450a0a" />
            </mesh>
            {/* 大腿（向下斜外） */}
            <mesh position={[0.50 * sx, 0.10, 0]} rotation={[0, 0, sx * -1.4]}>
              <cylinderGeometry args={[0.020, 0.014, 0.50, 6]} />
              <meshStandardMaterial color="#7f1d1d" />
            </mesh>
            {/* 第二关节球 */}
            <mesh position={[0.62 * sx, -0.15, 0]}>
              <sphereGeometry args={[0.030, 8, 8]} />
              <meshStandardMaterial color="#450a0a" />
            </mesh>
            {/* 跗节（向地面） */}
            <mesh position={[0.66 * sx, -0.45, 0]} rotation={[0, 0, sx * -2.7]}>
              <cylinderGeometry args={[0.014, 0.005, 0.55, 6]} />
              <meshStandardMaterial color="#450a0a" />
            </mesh>
          </group>
        );
      })}
      {/* 高阶光环 */}
      {stage >= 3 && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[1.0, 1.08, 48]} />
          <meshBasicMaterial color="#dc2626" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      {stage >= 4 && (
        <pointLight intensity={1.2} color="#dc2626" distance={4} />
      )}
    </group>
  );
}

// ===== 啼魂兽 =====
function WailingBeast({ stage }: { stage: number }) {
  const ref = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const flameRefs = useRef<THREE.Mesh[]>([]);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = Math.sin(t * 1.2) * 0.18;
      ref.current.rotation.y = Math.sin(t * 0.4) * 0.15;
    }
    if (tailRef.current) {
      tailRef.current.rotation.x = 0.3 + Math.sin(t * 1.5) * 0.15;
    }
    flameRefs.current.forEach((f, i) => {
      if (f) {
        f.position.y = Math.sin(t * 3 + i) * 0.1;
        f.scale.y = 0.8 + Math.sin(t * 4 + i * 0.5) * 0.3;
      }
    });
  });
  const intensity = 0.4 + stage * 0.18;

  return (
    <group ref={ref}>
      {/* 主魂体（半透球） */}
      <mesh castShadow scale={[1.0, 1.05, 0.95]}>
        <sphereGeometry args={[0.7, 28, 22]} />
        <meshPhysicalMaterial
          color="#7e22ce" emissive="#a855f7" emissiveIntensity={intensity}
          metalness={0.1} roughness={0.45} transmission={0.55} thickness={0.9}
          transparent opacity={0.88} clearcoat={0.5}
        />
      </mesh>

      {/* 飘渺魂尾（多片半透鳍） */}
      <group ref={tailRef} position={[0, -0.5, -0.3]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, -i * 0.25, -i * 0.15]} rotation={[0.3 + i * 0.1, 0, 0]} scale={[1 - i * 0.15, 1 - i * 0.15, 1]}>
            <coneGeometry args={[0.55, 0.9, 16, 1, true]} />
            <meshStandardMaterial
              color="#581c87" emissive="#7e22ce" emissiveIntensity={0.6}
              transparent opacity={0.4 - i * 0.08} side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* 双角（向上微外撇） */}
      <mesh position={[-0.32, 0.55, 0.05]} rotation={[0.1, 0, 0.4]}>
        <coneGeometry args={[0.07, 0.5, 8]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.5} roughness={0.6} />
      </mesh>
      <mesh position={[0.32, 0.55, 0.05]} rotation={[0.1, 0, -0.4]}>
        <coneGeometry args={[0.07, 0.5, 8]} />
        <meshStandardMaterial color="#1e1b4b" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* 角尖光点 */}
      <mesh position={[-0.42, 0.78, 0.10]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.42, 0.78, 0.10]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={1.5} />
      </mesh>

      {/* 哀嚎口（凹陷的椭球） */}
      <mesh position={[0, -0.05, 0.65]} scale={[0.9, 1.3, 0.7]}>
        <sphereGeometry args={[0.18, 14, 12]} />
        <meshStandardMaterial color="#1e1b4b" emissive="#581c87" emissiveIntensity={1.0} />
      </mesh>

      {/* 双眼（金色幽光） */}
      <mesh position={[-0.25, 0.22, 0.58]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={2.0} />
      </mesh>
      <mesh position={[0.25, 0.22, 0.58]}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={2.0} />
      </mesh>

      {/* 环绕魂火（4 颗紫色火焰） */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            ref={(el) => { if (el) flameRefs.current[i] = el; }}
            position={[Math.cos(angle) * 1.0, 0.2, Math.sin(angle) * 1.0]}
          >
            <coneGeometry args={[0.10, 0.30, 8]} />
            <meshStandardMaterial
              color="#a855f7" emissive="#d8b4fe" emissiveIntensity={1.2}
              transparent opacity={0.75}
            />
          </mesh>
        );
      })}

      {/* 高阶多层光环 */}
      {stage >= 3 && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.1, 1.16, 48]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2.3, 0.3, 0]}>
            <ringGeometry args={[1.3, 1.34, 48]} />
            <meshBasicMaterial color="#d8b4fe" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
      {stage >= 4 && <pointLight intensity={1.4} color="#a855f7" distance={5} />}
    </group>
  );
}

// ===== 六翼霜蚣 =====
function SixWingCentipede({ stage }: { stage: number }) {
  const ref = useRef<THREE.Group>(null);
  const segRefs = useRef<THREE.Object3D[]>([]);
  const wingRefs = useRef<THREE.Mesh[]>([]);
  const legRefs = useRef<THREE.Mesh[]>([]);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // 蜿蜒：每节按相位偏移做 sin 摆动
    segRefs.current.forEach((seg, i) => {
      if (seg) {
        seg.position.y = Math.sin(t * 2.0 + i * 0.7) * 0.08;
        seg.position.x = Math.sin(t * 1.5 + i * 0.5) * 0.06;
      }
    });
    // 翅振
    wingRefs.current.forEach((w, i) => {
      if (w) w.rotation.x = Math.sin(t * 14 + i) * 0.5;
    });
    // 足摆
    legRefs.current.forEach((l, i) => {
      if (l) l.rotation.x = Math.sin(t * 4 + i * 0.6) * 0.25;
    });
  });
  const intensity = 0.25 + stage * 0.13;

  // 5 体节 + 1 头
  const segments = [-1.2, -0.7, -0.2, 0.3, 0.8];

  // 6 翼位置
  const wingSlots = [
    { x: -0.5, y: 0.18, z: -0.7, rot: -0.6 },
    { x: 0.5, y: 0.18, z: -0.7, rot: 0.6 },
    { x: -0.55, y: 0.18, z: -0.2, rot: -0.7 },
    { x: 0.55, y: 0.18, z: -0.2, rot: 0.7 },
    { x: -0.5, y: 0.18, z: 0.3, rot: -0.6 },
    { x: 0.5, y: 0.18, z: 0.3, rot: 0.6 },
  ];

  // 多对足
  const legSlots = segments.flatMap((z, i) => [
    { x: -0.30, y: -0.20, z, rotZ: 0.5, idx: i * 2 },
    { x: 0.30, y: -0.20, z, rotZ: -0.5, idx: i * 2 + 1 },
  ]);

  return (
    <group ref={ref}>
      {/* 多体节身体（用胶囊几何，圆头连接更自然） */}
      {segments.map((z, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) segRefs.current[i] = el; }}
          castShadow
          position={[0, 0, z]}
        >
          <capsuleGeometry args={[0.32, 0.12, 8, 16]} />
          <meshStandardMaterial
            color="#7dd3fc"
            emissive="#bae6fd"
            emissiveIntensity={intensity}
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
      ))}
      {/* 头部（更大、更深色） */}
      <mesh castShadow position={[0, 0.05, 1.2]} scale={[1.1, 0.95, 1.1]}>
        <sphereGeometry args={[0.36, 18, 14]} />
        <meshStandardMaterial
          color="#0ea5e9" emissive="#7dd3fc" emissiveIntensity={intensity * 0.9}
          metalness={0.75} roughness={0.22}
        />
      </mesh>
      {/* 头部冰晶角 */}
      <mesh position={[0, 0.40, 1.20]} rotation={[-0.3, 0, 0]}>
        <coneGeometry args={[0.06, 0.30, 6]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.8} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* 触须 */}
      <mesh position={[-0.20, 0.30, 1.45]} rotation={[0.5, 0, -0.4]}>
        <cylinderGeometry args={[0.018, 0.008, 0.5, 4]} />
        <meshStandardMaterial color="#0c4a6e" />
      </mesh>
      <mesh position={[0.20, 0.30, 1.45]} rotation={[0.5, 0, 0.4]}>
        <cylinderGeometry args={[0.018, 0.008, 0.5, 4]} />
        <meshStandardMaterial color="#0c4a6e" />
      </mesh>
      {/* 上颚 */}
      <mesh position={[-0.10, -0.05, 1.50]} rotation={[Math.PI / 2.2, 0, 0.3]}>
        <coneGeometry args={[0.03, 0.15, 6]} />
        <meshStandardMaterial color="#0c4a6e" />
      </mesh>
      <mesh position={[0.10, -0.05, 1.50]} rotation={[Math.PI / 2.2, 0, -0.3]}>
        <coneGeometry args={[0.03, 0.15, 6]} />
        <meshStandardMaterial color="#0c4a6e" />
      </mesh>
      {/* 双眼（复眼） */}
      <mesh position={[-0.18, 0.10, 1.48]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial color="#1e1b4b" emissive="#1e1b4b" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.18, 0.10, 1.48]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <meshStandardMaterial color="#1e1b4b" emissive="#1e1b4b" emissiveIntensity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>

      {/* 6 翼（带骨脉的冰晶半透平面） */}
      {wingSlots.map((w, i) => (
        <group key={i} position={[w.x, w.y, w.z]} rotation={[0, 0, w.rot]}>
          <mesh ref={(el) => { if (el) wingRefs.current[i] = el; }}>
            <planeGeometry args={[0.85, 0.48, 4, 4]} />
            <meshPhysicalMaterial
              color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={0.55}
              transparent opacity={0.55} side={THREE.DoubleSide}
              transmission={0.55} thickness={0.1}
              metalness={0.3} roughness={0.15}
            />
          </mesh>
          {/* 翅脉 */}
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[0.82, 0.02]} />
            <meshBasicMaterial color="#0ea5e9" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* 多对足 */}
      {legSlots.map((l, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) legRefs.current[i] = el; }}
          position={[l.x, l.y, l.z]}
          rotation={[0, 0, l.rotZ]}
        >
          <cylinderGeometry args={[0.018, 0.008, 0.30, 4]} />
          <meshStandardMaterial color="#0c4a6e" />
        </mesh>
      ))}

      {/* 高阶冰晶光环 */}
      {stage >= 3 && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
          <ringGeometry args={[1.4, 1.46, 48]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
      {stage >= 4 && <pointLight intensity={1.3} color="#7dd3fc" distance={5} />}
    </group>
  );
}

const RENDER_BY_ID: Record<string, (props: { stage: number }) => React.ReactElement> = {
  blood_jade_spider: BloodJadeSpider,
  wailing_beast: WailingBeast,
  six_wing_centipede: SixWingCentipede,
};

const ENV_BY_ID: Record<string, { bg: string; light: string; key: string }> = {
  blood_jade_spider: { bg: '#1c0606', light: '#dc2626', key: '#fca5a5' },
  wailing_beast: { bg: '#1e0a3a', light: '#a855f7', key: '#d8b4fe' },
  six_wing_centipede: { bg: '#0c1a2a', light: '#7dd3fc', key: '#e0f2fe' },
};

function SpinningGroup({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.3; });
  return <group ref={ref}>{children}</group>;
}

export default function SpiritBeast3D({
  beastId, stage, height = 200, active = false,
}: { beastId: string; stage: number; height?: number; active?: boolean }) {
  const Render = RENDER_BY_ID[beastId];
  const env = ENV_BY_ID[beastId] || ENV_BY_ID.blood_jade_spider;
  if (!Render) return null;

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas camera={{ position: [0, 1.0, 4.0], fov: 42 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={[env.bg]} />
        <fog attach="fog" args={[env.bg, 3, 9]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 3]} intensity={1.0} color={env.key} castShadow />
        <pointLight position={[-2, 2, -2]} intensity={0.6} color={env.light} />
        <pointLight position={[0, 2, 3]} intensity={0.8} color={env.key} />
        {active && <pointLight position={[0, 1, 1.5]} intensity={1.2} color={env.light} distance={5} />}

        <SpinningGroup>
          <Render stage={stage} />
        </SpinningGroup>

        {/* 地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.1, 0]} receiveShadow>
          <circleGeometry args={[2.0, 48]} />
          <meshStandardMaterial color={env.bg} roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.09, 0]}>
          <ringGeometry args={[0.7, 1.4, 48]} />
          <meshBasicMaterial color={env.light} transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      </Canvas>
    </div>
  );
}
