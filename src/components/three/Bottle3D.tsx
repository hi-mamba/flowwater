import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * 掌天瓶 3D — Lathe 葫芦瓶身 + 贴合曲面的液体
 * 修复：
 *  - 液体用同一份 profile 截取生成，完全贴合瓶身内壁
 *  - 葫芦轮廓改为真正的"上小下大"双球，腰部明显收窄
 *  - 增加瓶身花纹环、绳结挂饰
 */

// 宝瓶剖面：玉壶春式 —— 盘口 / 修颈 / 圆肩 / 鼓腹 / 束足
function buildProfile(): { points: THREE.Vector2[]; topY: number; bottomY: number; innerOffset: number } {
  const segments = 80;
  const topY = 1.9;
  const bottomY = -1.5;
  const totalH = topY - bottomY;
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = topY - t * totalH;
    let r: number;
    // 比例：盘口 4% / 颈 22% / 肩 8% / 腹 50% / 胫 12% / 足 4%
    if (t < 0.02) {
      // 盘口外翻沿
      r = 0.32 - t * 4;
    } else if (t < 0.06) {
      // 翻沿收回
      const u = (t - 0.02) / 0.04;
      r = 0.24 - u * 0.05;
    } else if (t < 0.28) {
      // 修长玉颈（直筒微收）
      const u = (t - 0.06) / 0.22;
      r = 0.19 - u * 0.02; // 0.19 → 0.17
    } else if (t < 0.36) {
      // 颈→肩过渡（圆肩展开）
      const u = (t - 0.28) / 0.08;
      // 用 cos 让肩膀圆润
      r = 0.17 + (1 - Math.cos(u * Math.PI / 2)) * 0.55;
    } else if (t < 0.78) {
      // 鼓腹（单球，最大半径 0.95）
      const u = (t - 0.36) / 0.42;
      // 抛物线腹部，u=0.45 处最大
      r = 0.72 + Math.sin(u * Math.PI) * 0.28;
    } else if (t < 0.92) {
      // 胫（向下收束）
      const u = (t - 0.78) / 0.14;
      r = 0.78 - u * 0.42; // 0.78 → 0.36
    } else if (t < 0.97) {
      // 圈足外撇
      const u = (t - 0.92) / 0.05;
      r = 0.36 + u * 0.06;
    } else {
      // 足底
      const u = (t - 0.97) / 0.03;
      r = 0.42 - u * 0.05;
    }
    points.push(new THREE.Vector2(r, y));
  }
  return { points, topY, bottomY, innerOffset: 0.05 };
}

// 从葫芦剖面截取液面之下的部分作为液体几何
function buildLiquidProfile(profile: THREE.Vector2[], liquidY: number, innerOffset: number): THREE.Vector2[] {
  const out: THREE.Vector2[] = [];
  // 顶部封盖（从中心 0 到液面边缘）
  let edgeR = 0;
  // 找到液面位置的内壁半径
  for (let i = 0; i < profile.length - 1; i++) {
    const a = profile[i], b = profile[i + 1];
    if (a.y >= liquidY && b.y <= liquidY) {
      const t = (a.y - liquidY) / (a.y - b.y);
      edgeR = Math.max(0.01, a.x + (b.x - a.x) * t - innerOffset);
      break;
    }
  }
  if (edgeR <= 0) return [];
  // 顶面（液面）：从 0 到 edgeR
  out.push(new THREE.Vector2(0, liquidY));
  out.push(new THREE.Vector2(edgeR, liquidY));
  // 沿瓶身内壁从液面下行到底
  for (const p of profile) {
    if (p.y < liquidY) {
      const innerR = Math.max(0.01, p.x - innerOffset);
      out.push(new THREE.Vector2(innerR, p.y));
    }
  }
  // 收口到底心
  const last = profile[profile.length - 1];
  out.push(new THREE.Vector2(0, last.y + 0.01));
  return out;
}

function Bottle({ level, fillPercent }: { level: number; fillPercent: number }) {
  const { points, topY, bottomY, innerOffset } = useMemo(() => buildProfile(), []);

  // 液面 Y
  const liquidY = useMemo(() => {
    const minY = bottomY + 0.05;
    const maxY = topY - 0.4; // 不溢出颈部
    return minY + (fillPercent / 100) * (maxY - minY);
  }, [fillPercent, topY, bottomY]);

  const liquidPoints = useMemo(() => buildLiquidProfile(points, liquidY, innerOffset), [points, liquidY, innerOffset]);

  const liquidGeom = useMemo(() => {
    if (liquidPoints.length < 3) return null;
    return new THREE.LatheGeometry(liquidPoints, 48);
  }, [liquidPoints]);

  const liquidRef = useRef<THREE.Mesh>(null);
  const runeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (liquidRef.current) {
      // 液体轻微上下波动
      liquidRef.current.position.y = Math.sin(t * 1.8) * 0.015;
      const mat = liquidRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.45 + Math.sin(t * 2.5) * 0.1;
    }
    if (runeRef.current && level >= 3) {
      runeRef.current.rotation.y = t * 0.6;
    }
  });

  return (
    <group>
      {/* 瓶身（半透明青玉） */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 64]} />
        <meshPhysicalMaterial
          color="#10b981"
          metalness={0.15}
          roughness={0.12}
          transmission={0.65}
          thickness={0.4}
          transparent
          opacity={0.88}
          ior={1.45}
          emissive="#064e3b"
          emissiveIntensity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 内部液体（贴合瓶身内壁） */}
      {liquidGeom && (
        <mesh ref={liquidRef} geometry={liquidGeom}>
          <meshStandardMaterial
            color="#34d399"
            emissive="#10b981"
            emissiveIntensity={0.5}
            transparent
            opacity={0.9}
            metalness={0.3}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* 盖钮（蘑菇状玉钮，比之前更扁） */}
      <mesh position={[0, topY + 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.20, 0.10, 16]} />
        <meshStandardMaterial color="#854d0e" roughness={0.85} />
      </mesh>
      {/* 钮顶玉珠 */}
      <mesh position={[0, topY + 0.18, 0]}>
        <sphereGeometry args={[0.08, 14, 12]} />
        <meshPhysicalMaterial color="#a7f3d0" emissive="#10b981" emissiveIntensity={0.4} metalness={0.3} roughness={0.2} clearcoat={0.8} />
      </mesh>
      {/* 盘口金沿（外翻） */}
      <mesh position={[0, topY - 0.04, 0]}>
        <torusGeometry args={[0.30, 0.020, 8, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.2} emissive="#fbbf24" emissiveIntensity={0.2} />
      </mesh>

      {/* === 颈部装饰 === */}
      {/* 颈中两道金弦纹 */}
      <mesh position={[0, 1.55, 0]}>
        <torusGeometry args={[0.185, 0.012, 6, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.30, 0]}>
        <torusGeometry args={[0.185, 0.012, 6, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* === 肩部铺首兽环（左右对称的兽首衔环） === */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.72, 0.78, 0]} rotation={[0, side > 0 ? 0 : Math.PI, 0]}>
          {/* 兽首底盘（圆面朝外） */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.10, 0.10, 0.05, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.35} emissive="#92400e" emissiveIntensity={0.2} />
          </mesh>
          {/* 兽首鼻梁（小凸起） */}
          <mesh position={[0.025, 0, 0]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.35} />
          </mesh>
          {/* 兽眼一对 */}
          <mesh position={[0.045, 0.025, 0.035]}>
            <sphereGeometry args={[0.013, 6, 6]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
          <mesh position={[0.045, 0.025, -0.035]}>
            <sphereGeometry args={[0.013, 6, 6]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
          {/* 衔环（横悬） */}
          <mesh position={[0.06, -0.10, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.013, 6, 20]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* === 腹部云雷纹（上下两道） === */}
      <mesh position={[0, 0.42, 0]}>
        <torusGeometry args={[0.86, 0.014, 6, 64]} />
        <meshStandardMaterial color="#fde047" metalness={0.85} roughness={0.35} emissive="#fbbf24" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <torusGeometry args={[0.92, 0.010, 6, 64]} />
        <meshStandardMaterial color="#a7f3d0" emissive="#34d399" emissiveIntensity={0.5} />
      </mesh>
      {/* 腹部中央"卐"字符（4 个金色小圆点环绕示意法器铭文） */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.96, 0.05, Math.sin(angle) * 0.96]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshStandardMaterial color="#fde047" emissive="#fde047" emissiveIntensity={0.8} metalness={0.8} roughness={0.3} />
          </mesh>
        );
      })}
      {/* 下腹弦纹 */}
      <mesh position={[0, -0.40, 0]}>
        <torusGeometry args={[0.74, 0.010, 6, 64]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.4} />
      </mesh>

      {/* === 圈足装饰 === */}
      <mesh position={[0, -1.08, 0]}>
        <torusGeometry args={[0.40, 0.018, 8, 32]} />
        <meshStandardMaterial color="#065f46" metalness={0.7} roughness={0.4} emissive="#10b981" emissiveIntensity={0.2} />
      </mesh>

      {/* 高阶旋转符文环 */}
      {level >= 3 && (
        <group ref={runeRef} position={[0, -0.5, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.45, 0.022, 4, 6]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
            <torusGeometry args={[1.70, 0.018, 4, 6]} />
            <meshBasicMaterial color="#a7f3d0" transparent opacity={0.5} />
          </mesh>
          {/* 六芒星阵眼 */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.40, 1.47, 6]} />
            <meshBasicMaterial color="#fde047" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {level >= 4 && (
        <pointLight position={[0, 0, 0]} intensity={1.0} color="#6ee7b7" distance={4} />
      )}
    </group>
  );
}

function QiParticles({ topY }: { topY: number }) {
  const ref = useRef<THREE.Points>(null);
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.25;
      arr[i * 3 + 1] = topY + 0.3 + Math.random() * 1.8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
    }
    return arr;
  }, [topY]);
  const speeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 0.18 + Math.random() * 0.4;
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt;
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 2 + i) * dt * 0.04;
      arr[i * 3 + 2] += Math.cos(arr[i * 3 + 1] * 2 + i) * dt * 0.04;
      if (arr[i * 3 + 1] > topY + 2.2) {
        arr[i * 3] = (Math.random() - 0.5) * 0.25;
        arr[i * 3 + 1] = topY + 0.3;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#a7f3d0" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function Bottle3D({ level, fillPercent, height = 220 }: { level: number; fillPercent: number; height?: number }) {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas camera={{ position: [0, 0.1, 4.8], fov: 36 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={['#022c22']} />
        <fog attach="fog" args={['#022c22', 5, 11]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={1.3} color="#a7f3d0" castShadow />
        <pointLight position={[-3, 2, -2]} intensity={0.7} color="#10b981" />
        <pointLight position={[0, 3, 3]} intensity={0.9} color="#6ee7b7" />
        <Bottle level={level} fillPercent={fillPercent} />
        <QiParticles topY={1.9} />
        {/* 地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]} receiveShadow>
          <circleGeometry args={[2.8, 32]} />
          <meshStandardMaterial color="#022c22" roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.54, 0]}>
          <ringGeometry args={[1.0, 1.8, 64]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      </Canvas>
    </div>
  );
}
