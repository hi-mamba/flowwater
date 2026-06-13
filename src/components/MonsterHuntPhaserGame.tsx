import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { createMonsterHuntGame, getTodayBuff } from '../games/MonsterHuntPhaser';
import { stopBgm } from '../games/audio';
import { useMeasureContainer } from '../games/useMeasureContainer';

interface Props {
  onGameOver: (score: number) => void;
}

export default function MonsterHuntPhaserGame({ onGameOver }: Props) {
  const { ref: wrapRef, size } = useMeasureContainer();
  const gameRef = useRef<any>(null);
  const calledRef = useRef(false);
  const [bootSize, setBootSize] = useState<{ w: number; h: number } | null>(null);

  const { levelIndex, equippedArtifacts, artifactLevels } = useStore();
  const buff = getTodayBuff();

  useEffect(() => {
    if (bootSize) return;
    if (size.w >= 280 && size.h >= 480) setBootSize(size);
  }, [size, bootSize]);

  useEffect(() => {
    if (!wrapRef.current) return;
    if (gameRef.current) return;
    if (!bootSize) return;

    const baseHealth = 100 + levelIndex * 30;
    const hasSword = equippedArtifacts.includes('ancient_sword');
    const swordLevel = hasSword ? (artifactLevels['ancient_sword'] || 1) : 0;
    const dmgBonus = hasSword ? 1 + (0.2 + swordLevel * 0.05) : 1;
    const hasShield = equippedArtifacts.includes('shield_artifact');
    const shieldLevel = hasShield ? (artifactLevels['shield_artifact'] || 1) : 0;
    const defBonus = hasShield ? 1 - (0.1 + shieldLevel * 0.05) : 1;

    gameRef.current = createMonsterHuntGame({
      parent: wrapRef.current,
      width: bootSize.w, height: bootSize.h,
      baseHealth, dmgBonus, defBonus,
      onGameOver: (orbs) => {
        if (calledRef.current) return;
        calledRef.current = true;
        onGameOver(orbs * 100);
      },
    });

    return () => {
      try { gameRef.current?.destroy(true); } catch { /* ignore */ }
      gameRef.current = null;
      stopBgm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootSize]);

  useEffect(() => {
    if (!gameRef.current) return;
    try { gameRef.current.scale.resize(size.w, size.h); } catch { /* ignore */ }
  }, [size.w, size.h]);

  return (
    <div className="w-full flex flex-col items-center" style={{ fontFamily: '"Noto Serif SC", "Songti SC", "STSong", serif' }}>
      <div className="text-center mb-2 text-[11px]" style={{ color: buff.color }}>
        {buff.name} · {buff.desc}
      </div>
      <div
        ref={wrapRef}
        className="rounded-2xl overflow-hidden border border-blue-700/30 shadow-[0_0_60px_rgba(96,165,250,0.12)] bg-slate-950 w-full max-w-[480px]"
        style={{ height: size.h, touchAction: 'none' }}
      />
    </div>
  );
}
