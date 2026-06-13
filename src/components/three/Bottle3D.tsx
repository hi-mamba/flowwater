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

// 葫芦剖面：经典"小头-束腰-大肚"宝葫芦造型
function buildProfile(): { points: THREE.Vector2[]; topY: number; bottomY: number; innerOffset: number } {
  const segments = 80;
  const topY = 1.8;
  const bottomY = -1.4;
  const totalH = topY - bottomY;
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = topY - t * totalH;
    let r: number;
    // 比例：颈 6% / 上球 26% / 腰 8% / 下球 56% / 底 4%
    if (t < 0.03) {
      // 瓶口翻边
      r = 0.20 + (0.03 - t) * 1.5;
    } else if (t < 0.09) {
      // 颈（细）
      r = 0.16;
    } else if (t < 0.13) {
      // 颈→上球过渡
      const u = (t - 0.09) / 0.04;
      r = 0.16 + u * 0.18;
    } else if (t < 0.36) {
      // 上球（小肚），半径峰值 0.55
      const u = (t - 0.13) / 0.23;
      r = 0.34 + Math.sin(u * Math.PI) * 0.30;
    } else if (t < 0.46) {
      // 腰（狠收，最细 0.22）
      const u = (t - 0.36) / 0.10;
      r = 0.34 - Math.sin(u * Math.PI) * 0.16;
    } else if (t < 0.94) {
      // 下球（大肚），半径峰值 1.00
      const u = (t - 0.46) / 0.48;
      // 用偏移正弦让球更圆
      r = 0.34 + Math.sin(u * Math.PI) * 0.72;
    } else if (t < 0.98) {
      // 底过渡
      const u = (t - 0.94) / 0.04;
      r = 0.50 - u * 0.15;
    } else {
      // 圈足
      const u = (t - 0.98) / 0.02;
      r = 0.35 * (1 - u * 0.4);
    }
    points.push(new THREE.Vector2(r, y));
  }
  return { points, topY, bottomY, innerOffset: 0.045 };
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

      {/* 瓶塞（木色） */}
      <mesh position={[0, topY + 0.10, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.18, 16]} />
        <meshStandardMaterial color="#854d0e" roughness={0.85} />
      </mesh>
      {/* 塞顶圆球 */}
      <mesh position={[0, topY + 0.24, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.25} emissive="#fbbf24" emissiveIntensity={0.15} />
      </mesh>
      {/* 瓶口金箍（翻边外） */}
      <mesh position={[0, topY + 0.0, 0]}>
        <torusGeometry args={[0.22, 0.022, 8, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.2} emissive="#fbbf24" emissiveIntensity={0.15} />
      </mesh>

      {/* 红绳挂饰：从瓶口绕颈一圈 + 垂下两条 */}
      <mesh position={[0, topY - 0.14, 0]}>
        <torusGeometry args={[0.17, 0.018, 6, 24]} />
        <meshStandardMaterial color="#dc2626" roughness={0.7} />
      </mesh>
      {/* 红绳垂落 */}
      <mesh position={[-0.16, topY - 0.40, 0]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.012, 0.012, 0.50, 5]} />
        <meshStandardMaterial color="#dc2626" roughness={0.7} />
      </mesh>
      <mesh position={[0.16, topY - 0.40, 0]} rotation={[0, 0, -0.05]}>
        <cylinderGeometry args={[0.012, 0.012, 0.50, 5]} />
        <meshStandardMaterial color="#dc2626" roughness={0.7} />
      </mesh>
      {/* 玉佩（吊在红绳末端） */}
      <mesh position={[-0.16, topY - 0.72, 0]}>
        <torusGeometry args={[0.06, 0.015, 6, 16]} />
        <meshStandardMaterial color="#a7f3d0" emissive="#10b981" emissiveIntensity={0.3} metalness={0.4} roughness={0.3} />
      </mesh>
      {/* 红穗 */}
      <mesh position={[0.16, topY - 0.78, 0]}>
        <coneGeometry args={[0.04, 0.14, 6]} />
        <meshStandardMaterial color="#991b1b" emissive="#dc2626" emissiveIntensity={0.2} roughness={0.7} />
      </mesh>

      {/* 束腰处缠绳（金线） */}
      <mesh position={[0, -0.05, 0]}>
        <torusGeometry args={[0.20, 0.020, 8, 32]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.3} emissive="#fbbf24" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, -0.13, 0]}>
        <torusGeometry args={[0.22, 0.018, 8, 32]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.85} />
      </mesh>

      {/* 下球腹部符纹（一圈细线） */}
      <mesh position={[0, -0.55, 0]}>
        <torusGeometry args={[0.85, 0.010, 6, 48]} />
        <meshStandardMaterial color="#fde047" metalness={0.8} roughness={0.4} emissive="#fbbf24" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <torusGeometry args={[0.92, 0.008, 6, 48]} />
        <meshStandardMaterial color="#a7f3d0" emissive="#34d399" emissiveIntensity={0.5} />
      </mesh>

      {/* 底部圈足（坐稳） */}
      <mesh position={[0, -1.42, 0]}>
        <torusGeometry args={[0.36, 0.025, 8, 32]} />
        <meshStandardMaterial color="#065f46" metalness={0.6} roughness={0.5} />
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
      <Canvas camera={{ position: [0, 0.2, 4.5], fov: 38 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={['#022c22']} />
        <fog attach="fog" args={['#022c22', 5, 11]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={1.3} color="#a7f3d0" castShadow />
        <pointLight position={[-3, 2, -2]} intensity={0.7} color="#10b981" />
        <pointLight position={[0, 3, 3]} intensity={0.9} color="#6ee7b7" />
        <Bottle level={level} fillPercent={fillPercent} />
        <QiParticles topY={1.8} />
        {/* 地面 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
          <circleGeometry args={[2.8, 32]} />
          <meshStandardMaterial color="#022c22" roughness={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
          <ringGeometry args={[1.0, 1.8, 64]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      </Canvas>
    </div>
  );
}
