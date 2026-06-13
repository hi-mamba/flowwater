import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { createKunwuGame } from '../games/KunwuPhaser';
import { stopBgm } from '../games/audio';
import { useMeasureContainer } from '../games/useMeasureContainer';

interface Props {
  onGameOver: (score: number) => void;
}

export default function KunwuPhaserGame({ onGameOver }: Props) {
  const { ref: wrapRef, size } = useMeasureContainer();
  const gameRef = useRef<any>(null);
  const calledRef = useRef(false);
  const [bootSize, setBootSize] = useState<{ w: number; h: number } | null>(null);

  const { levelIndex, equippedArtifacts, artifactLevels } = useStore();

  useEffect(() => {
    if (bootSize) return;
    if (size.w >= 280 && size.h >= 480) setBootSize(size);
  }, [size, bootSize]);

  useEffect(() => {
    if (!wrapRef.current) return;
    if (gameRef.current) return;
    if (!bootSize) return;

    const baseHealth = 100 + levelIndex * 50;
    const baseDmg = 10 + levelIndex * 5;
    const hasSword = equippedArtifacts.includes('ancient_sword');
    const swordLevel = hasSword ? (artifactLevels['ancient_sword'] || 1) : 0;
    const dmgBonus = hasSword ? 1 + (0.2 + swordLevel * 0.05) : 1;
    const hasShield = equippedArtifacts.includes('shield_artifact');
    const shieldLevel = hasShield ? (artifactLevels['shield_artifact'] || 1) : 0;
    const defBonus = hasShield ? 1 - (0.1 + shieldLevel * 0.05) : 1;

    gameRef.current = createKunwuGame({
      parent: wrapRef.current,
      width: bootSize.w, height: bootSize.h,
      baseHealth, baseDmg, dmgBonus, defBonus,
      onGameOver: (reward) => {
        if (calledRef.current) return;
        calledRef.current = true;
        onGameOver(reward);
      },
    });

    return () => {
      try { gameRef.current?.destroy(true); } catch { /* ignore */ }
      gameRef.current = null;
      stopBgm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSize]);

  // resize 时仅通知 phaser 重设 canvas 尺寸，不重建 scene
  useEffect(() => {
    if (!gameRef.current) return;
    try { gameRef.current.scale.resize(size.w, size.h); } catch { /* ignore */ }
  }, [size.w, size.h]);

  return (
    <div className="w-full flex flex-col items-center" style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}>
      <div
        ref={wrapRef}
        className="rounded-2xl overflow-hidden border border-amber-700/30 shadow-[0_0_60px_rgba(251,191,36,0.12)] bg-slate-950 w-full max-w-[480px]"
        style={{ height: size.h, touchAction: 'none' }}
      />
    </div>
  );
}

