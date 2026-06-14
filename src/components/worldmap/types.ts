// src/components/worldmap/types.ts
import type { WorldLocation, IconKey } from '../../data/worldMap';
import { Mountain, Castle, Skull, Gem, Star, Cloud, Waves, Sparkles, Zap, type LucideIcon } from 'lucide-react';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export interface RealmMapProps {
  locations: WorldLocation[];
  currentLocationId?: string;
  unlockedLocationIds: Set<string>;
  onLocationClick: (loc: WorldLocation) => void;
  timeOfDay: TimeOfDay;
}

export const ICON_MAP: Record<IconKey, LucideIcon> = {
  mountain: Mountain,
  castle:   Castle,
  skull:    Skull,
  gem:      Gem,
  star:     Star,
  cloud:    Cloud,
  waves:    Waves,
  sparkles: Sparkles,
  zap:      Zap,
};
