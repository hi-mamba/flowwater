import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * 噬金虫 3D — Boid 群体 + 真实甲虫剪影
 * 修复：补齐 6 条腿、双触角、上颚；甲壳改为扁平半球 + 鞘翅分线
 */

interface BeetleData {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  flapPhase: number;
}

// 共享几何，提升性能
const SHARED = {
  shell: new THREE.SphereGeometry(0.22, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
  belly: new THREE.SphereGeometry(0.20, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
  head: new THREE.SphereGeometry(0.11, 10, 8),
  legUpper: new THREE.CylinderGeometry(0.012, 0.010, 0.16, 4),
  legLower: new THREE.CylinderGeometry(0.010, 0.006, 0.18, 4),
  antenna: new THREE.CylinderGeometry(0.006, 0.003, 0.18, 4),
  mandible: new THREE.ConeGeometry(0.018, 0.08, 4),
};

function Beetle({ stage }: { stage: number }) {
  const shellColor = stage >= 4 ? '#fde047' : stage >= 3 ? '#facc15' : stage >= 2 ? '#eab308' : '#ca8a04';
  const darkColor = stage >= 3 ? '#78350f' : '#451a03';

  const shellMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: shellColor, metalness: 0.9, roughness: 0.18,
    emissive: shellColor, emissiveIntensity: 0.15,
  }), [shellColor]);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: darkColor, metalness: 0.5, roughness: 0.6,
  }), [darkColor]);

  // 6 条腿位置：前/中/后，每对左右对称
  const legSpecs = [
    { z: 0.10, side: 1, splay: 0.6 },   // 前-右
    { z: 0.10, side: -1, splay: 0.6 },  // 前-左
    { z: -0.02, side: 1, splay: 0.9 },  // 中-右
    { z: -0.02, side: -1, splay: 0.9 }, // 中-左
    { z: -0.14, side: 1, splay: 0.7 },  // 后-右
    { z: -0.14, side: -1, splay: 0.7 }, // 后-左
  ];

  return (
    <group>
      {/* 上甲壳（鞘翅，扁平半球） */}
      <mesh geometry={SHARED.shell} material={shellMat} scale={[1.0, 0.55, 1.4]} />
      {/* 腹（下半，颜色更暗） */}
      <mesh geometry={SHARED.belly} material={darkMat} scale={[0.95, 0.4, 1.35]} />
      {/* 鞘翅中线（凹槽） */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[0.008, 0.04, 0.42]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      {/* 头部（前突） */}
      <mesh geometry={SHARED.head} material={darkMat} position={[0, 0.02, 0.30]} scale={[1.1, 0.7, 0.8]} />
      {/* 上颚（一对小尖牙） */}
      <mesh geometry={SHARED.mandible} material={darkMat} position={[-0.05, -0.03, 0.40]} rotation={[Math.PI / 2.2, 0, 0.3]} />
      <mesh geometry={SHARED.mandible} material={darkMat} position={[0.05, -0.03, 0.40]} rotation={[Math.PI / 2.2, 0, -0.3]} />
      {/* 双触角（弯折） */}
      <group position={[-0.06, 0.06, 0.36]} rotation={[0, 0, -0.4]}>
        <mesh geometry={SHARED.antenna} material={darkMat} position={[-0.05, 0.05, 0]} rotation={[0, 0, 0.6]} />
        <mesh geometry={SHARED.antenna} material={darkMat} position={[-0.13, 0.14, 0]} rotation={[0, 0, 1.0]} scale={[1, 0.7, 1]} />
      </group>
      <group position={[0.06, 0.06, 0.36]} rotation={[0, 0, 0.4]}>
        <mesh geometry={SHARED.antenna} material={darkMat} position={[0.05, 0.05, 0]} rotation={[0, 0, -0.6]} />
        <mesh geometry={SHARED.antenna} material={darkMat} position={[0.13, 0.14, 0]} rotation={[0, 0, -1.0]} scale={[1, 0.7, 1]} />
      </group>
      {/* 6 条腿（双段关节） */}
      {legSpecs.map((leg, i) => (
        <group key={i} position={[0.16 * leg.side, -0.04, leg.z]} rotation={[0, 0, leg.side > 0 ? -leg.splay : leg.splay]}>
          <mesh geometry={SHARED.legUpper} material={darkMat} position={[leg.side * 0.08, 0, 0]} rotation={[0, 0, leg.side * Math.PI / 2]} />
          <mesh geometry={SHARED.legLower} material={darkMat}
            position={[leg.side * 0.16, -0.07, 0]}
            rotation={[0, 0, leg.side * Math.PI / 3]}
          />
        </group>
      ))}
      {/* 高阶发光晕 */}
      {stage >= 3 && (
        <mesh scale={[1.4, 0.9, 1.7]}>
          <sphereGeometry args={[0.22, 12, 8]} />
          <meshBasicMaterial color={shellColor} transparent opacity={0.12} />
        </mesh>
      )}
    </group>
  );
}

function BeetleSwarm({ count, stage }: { count: number; stage: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const beetles = useMemo<BeetleData[]>(() => Array.from({ length: count }, () => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 4),
    vel: new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5),
    flapPhase: Math.random() * Math.PI * 2,
  })), [count]);

  const sepR = 0.55, aliR = 1.2, cohR = 1.8;
  const maxSpeed = 1.4 + stage * 0.25;

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const tmp = new THREE.Vector3(), sep = new THREE.Vector3(), ali = new THREE.Vector3(), coh = new THREE.Vector3();
    for (let i = 0; i < beetles.length; i++) {
      const b = beetles[i];
      sep.set(0, 0, 0); ali.set(0, 0, 0); coh.set(0, 0, 0);
      let sn = 0, an = 0, cn = 0;
      for (let j = 0; j < beetles.length; j++) {
        if (i === j) continue;
        const o = beetles[j];
        tmp.subVectors(b.pos, o.pos);
        const d = tmp.length();
        if (d < sepR && d > 0) { sep.add(tmp.divideScalar(d * d)); sn++; }
        if (d < aliR) { ali.add(o.vel); an++; }
        if (d < cohR) { coh.add(o.pos); cn++; }
      }
      if (sn) sep.divideScalar(sn).multiplyScalar(2.2);
      if (an) ali.divideScalar(an).sub(b.vel).multiplyScalar(0.6);
      if (cn) coh.divideScalar(cn).sub(b.pos).multiplyScalar(0.5);
      const center = tmp.copy(b.pos).multiplyScalar(-0.5);
      const orbit = new THREE.Vector3(-b.pos.z, 0, b.pos.x).normalize().multiplyScalar(0.3);
      b.vel.add(sep).add(ali).add(coh).add(center).add(orbit);
      if (b.vel.length() > maxSpeed) b.vel.setLength(maxSpeed);
      b.pos.addScaledVector(b.vel, dt);
      b.flapPhase += dt * 22;

      const inst = groupRef.current.children[i] as THREE.Object3D | undefined;
      if (inst) {
        inst.position.copy(b.pos);
        inst.lookAt(b.pos.clone().add(b.vel));
        // 振翅小抖
        inst.position.y += Math.sin(b.flapPhase) * 0.025;
        inst.rotation.z += Math.sin(b.flapPhase) * 0.03;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {beetles.map((_, i) => (
        <group key={i} scale={0.6}>
          <Beetle stage={stage} />
        </group>
      ))}
    </group>
  );
}

export default function Beetles3D({ count, stage, height = 180 }: { count: number; stage: number; height?: number }) {
  const visible = Math.min(28, Math.max(6, Math.floor(count / 10) + 4));

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas camera={{ position: [0, 1.8, 5.5], fov: 50 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#1a0f00']} />
        <fog attach="fog" args={['#1a0f00', 4, 10]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 3]} intensity={1.2} color="#fef3c7" />
        <pointLight position={[0, 2, 4]} intensity={1.5} color="#fbbf24" distance={8} />
        <pointLight position={[-3, -2, -2]} intensity={0.5} color="#7c2d12" />
        <BeetleSwarm count={visible} stage={stage} />
        {/* 地面光晕 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
          <ringGeometry args={[1.2, 2.8, 48]} />
          <meshBasicMaterial color="#92400e" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
          <circleGeometry args={[1.2, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.06} />
        </mesh>
      </Canvas>
    </div>
  );
}
