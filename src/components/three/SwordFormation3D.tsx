import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * 青竹蜂云剑阵 3D — 扁平剑身 + 真护手 + 阵法状态机
 * 修复：
 *  - 剑身用 ExtrudeGeometry 做扁平双刃 + 中线血槽
 *  - 剑尖 = 剪影自带尖端（profile 收一点）
 *  - 护手用十字格 + 缠柄 + 剑穗
 */

type FormationId = 'swarm' | 'dragon' | 'net' | 'storm';

// ===== 共享几何（高性能） =====
function makeBladeGeometry(): THREE.ExtrudeGeometry {
  // 剑身轮廓（侧视，从剑柄端 0 到剑尖端 1.4）
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.06, 0.05);
  shape.lineTo(0.06, 1.20);
  shape.lineTo(0.04, 1.32);
  shape.lineTo(0.0, 1.40); // 剑尖
  shape.lineTo(-0.04, 1.32);
  shape.lineTo(-0.06, 1.20);
  shape.lineTo(-0.06, 0.05);
  shape.lineTo(0, 0);

  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,         // 厚度（扁平）
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.006,
    bevelSegments: 2,
    steps: 1,
  });
  geom.translate(0, 0, -0.009);
  return geom;
}

const BLADE_GEOM = makeBladeGeometry();
const GUARD_GEOM = new THREE.BoxGeometry(0.22, 0.04, 0.06);
const GUARD_RIVET = new THREE.SphereGeometry(0.025, 8, 8);
const GRIP_GEOM = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 8);
const POMMEL_GEOM = new THREE.SphereGeometry(0.035, 10, 8);
const TASSEL_GEOM = new THREE.ConeGeometry(0.025, 0.10, 6);

function FlyingSword() {
  const bladeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#a7f3d0', metalness: 0.95, roughness: 0.12,
    emissive: '#22d3ee', emissiveIntensity: 0.4,
  }), []);
  const grooveMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#0e7490', transparent: true, opacity: 0.6,
  }), []);
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#fbbf24', metalness: 0.95, roughness: 0.25, emissive: '#fbbf24', emissiveIntensity: 0.1,
  }), []);
  const gripMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#7c2d12', roughness: 0.85,
  }), []);
  const tasselMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#dc2626', emissive: '#991b1b', emissiveIntensity: 0.3, roughness: 0.7,
  }), []);

  return (
    <group>
      {/* 剑身（扁平双刃，沿 +Y 朝上） */}
      <mesh geometry={BLADE_GEOM} material={bladeMat} castShadow />
      {/* 中线血槽（在剑身上方贴一条暗线） */}
      <mesh position={[0, 0.7, 0.011]} renderOrder={1}>
        <planeGeometry args={[0.018, 1.0]} />
        <primitive object={grooveMat} attach="material" />
      </mesh>
      <mesh position={[0, 0.7, -0.011]} rotation={[0, Math.PI, 0]} renderOrder={1}>
        <planeGeometry args={[0.018, 1.0]} />
        <primitive object={grooveMat} attach="material" />
      </mesh>
      {/* 光晕（半透明大刀身，发光） */}
      <mesh scale={[1.4, 1.0, 0.8]}>
        <primitive object={BLADE_GEOM} attach="geometry" />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      {/* 十字护手 */}
      <mesh geometry={GUARD_GEOM} material={goldMat} position={[0, -0.02, 0]} castShadow />
      {/* 护手两端铆钉 */}
      <mesh geometry={GUARD_RIVET} material={goldMat} position={[0.13, -0.02, 0]} />
      <mesh geometry={GUARD_RIVET} material={goldMat} position={[-0.13, -0.02, 0]} />
      {/* 剑柄（缠绳） */}
      <mesh geometry={GRIP_GEOM} material={gripMat} position={[0, -0.15, 0]} />
      {/* 缠绳纹（5 道金箍） */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, -0.06 - i * 0.045, 0]}>
          <torusGeometry args={[0.027, 0.004, 4, 12]} />
          <primitive object={goldMat} attach="material" />
        </mesh>
      ))}
      {/* 剑首（圆球） */}
      <mesh geometry={POMMEL_GEOM} material={goldMat} position={[0, -0.27, 0]} />
      {/* 剑穗（红色锥） */}
      <mesh geometry={TASSEL_GEOM} material={tasselMat} position={[0, -0.36, 0]} rotation={[Math.PI, 0, 0]} />
    </group>
  );
}

// ===== 阵法目标位置计算 =====
interface SwordTransform { pos: THREE.Vector3; facing: THREE.Vector3; }

function computeTargets(formation: FormationId, count: number, t: number): SwordTransform[] {
  const out: SwordTransform[] = [];
  for (let i = 0; i < count; i++) {
    const u = i / Math.max(1, count - 1);
    const idx = i + 1;
    let pos: THREE.Vector3;
    let facing: THREE.Vector3;

    switch (formation) {
      case 'swarm': {
        const phi = Math.acos(1 - 2 * u);
        const theta = Math.PI * 2 * idx * 0.618;
        const r = 1.9 + Math.sin(t * 1.5 + i) * 0.15;
        pos = new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta + t * 0.3),
          r * Math.cos(phi) * 0.7 + 0.2,
          r * Math.sin(phi) * Math.sin(theta + t * 0.3),
        );
        facing = new THREE.Vector3(0, pos.y * 1.5, 0);
        break;
      }
      case 'dragon': {
        const stream = i % 2;
        const turns = 2.2;
        const angle = u * Math.PI * 2 * turns + t * 1.0 + stream * Math.PI;
        const y = -1.5 + u * 3.2;
        const r = 1.5 - u * 0.4;
        pos = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
        // 朝飞行切线（剑尖向行进方向）
        facing = new THREE.Vector3(
          pos.x + -Math.sin(angle) * r * 2,
          pos.y + 0.5,
          pos.z + Math.cos(angle) * r * 2,
        );
        break;
      }
      case 'net': {
        const layer = Math.floor(i / Math.ceil(count / 2));
        const perLayer = Math.ceil(count / 2);
        const idxInLayer = i % perLayer;
        const angle = (idxInLayer / perLayer) * Math.PI * 2 + t * (layer === 0 ? 0.4 : -0.4);
        const r = layer === 0 ? 1.8 : 2.4;
        const y = layer === 0 ? 0.6 : -0.6;
        pos = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
        // 剑尖朝中轴（封锁姿态）
        facing = new THREE.Vector3(0, y, 0);
        break;
      }
      case 'storm':
      default: {
        const cycle = ((t * 0.55 + u * 1.5) % 1.0);
        const angle = idx * 0.618 * Math.PI * 2;
        const r = 1.4 + (1 - cycle) * 1.0;
        const y = 2.8 - cycle * 5.0;
        pos = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
        // 剑尖向下俯冲
        facing = new THREE.Vector3(pos.x * 0.2, y - 1.5, pos.z * 0.2);
        break;
      }
    }
    out.push({ pos, facing });
  }
  return out;
}

function SwordArray({ swords, formation }: { swords: number; formation: FormationId }) {
  const visible = Math.min(36, swords);
  const refs = useRef<THREE.Object3D[]>([]);
  const states = useMemo<SwordTransform[]>(
    () => Array.from({ length: visible }, () => ({ pos: new THREE.Vector3(), facing: new THREE.Vector3() })),
    [visible],
  );

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const targets = computeTargets(formation, visible, t);
    const k = 1 - Math.exp(-dt * 4);
    const upY = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const quat = new THREE.Quaternion();

    for (let i = 0; i < visible; i++) {
      const obj = refs.current[i]; if (!obj) continue;
      const tgt = targets[i];
      states[i].pos.lerp(tgt.pos, k);
      states[i].facing.lerp(tgt.facing, k);
      obj.position.copy(states[i].pos);
      dir.subVectors(states[i].facing, states[i].pos).normalize();
      if (dir.lengthSq() > 0.001) {
        quat.setFromUnitVectors(upY, dir);
        obj.quaternion.copy(quat);
      }
    }
  });

  return (
    <group>
      {Array.from({ length: visible }).map((_, i) => (
        <group key={i} ref={(el) => { if (el) refs.current[i] = el; }} scale={0.6}>
          <FlyingSword />
        </group>
      ))}
    </group>
  );
}

function FormationCore({ formation }: { formation: FormationId }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.8; });
  const color = formation === 'storm' ? '#fde047' : formation === 'net' ? '#a78bfa' : formation === 'dragon' ? '#34d399' : '#22d3ee';
  return (
    <group ref={ref}>
      {/* 阵眼六芒星 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.42, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
        <ringGeometry args={[0.45, 0.50, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.62, 0.66, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <pointLight intensity={1.8} color={color} distance={5} />
    </group>
  );
}

export default function SwordFormation3D({
  swords, formation, height = 240,
}: { swords: number; formation: FormationId; height?: number }) {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas camera={{ position: [0, 1.2, 6.0], fov: 50 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={['#021823']} />
        <fog attach="fog" args={['#021823', 5, 12]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 3]} intensity={0.9} color="#67e8f9" castShadow />
        <pointLight position={[-3, 2, -3]} intensity={0.5} color="#34d399" />
        <pointLight position={[0, 4, 4]} intensity={0.7} color="#a7f3d0" />
        <SwordArray swords={swords} formation={formation} />
        <FormationCore formation={formation} />
        {/* 地面阵纹 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]}>
          <ringGeometry args={[1.6, 3.2, 64]} />
          <meshBasicMaterial color="#0e7490" transparent opacity={0.25} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.89, 0]}>
          <ringGeometry args={[2.0, 2.05, 64]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </Canvas>
    </div>
  );
}
