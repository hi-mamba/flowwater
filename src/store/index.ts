import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMinutes, isAfter, isBefore, parse, format, startOfDay, endOfDay } from 'date-fns';
import { createCoreSlice } from './coreSlice';
import { createPlayerSlice } from './playerSlice';
import { createSectSlice } from './sectSlice';
import { createCaveSlice } from './caveSlice';
import { createCompanionSlice } from './companionSlice';
import { createAdventureSlice } from './adventureSlice';
import { createEquipmentSlice } from './equipmentSlice';
import { createDungeonSlice } from './dungeonSlice';
import { createSpiritRealmSlice } from './spiritRealmSlice';
import { createV6Slice } from './v6Slice';
import { createDemonAbyssSlice } from './demonAbyssSlice';

// Re-export types and constants
export * from './constants';
export * from './types';
export { generateDailyQuests } from './coreSlice';

import type { AppState } from './types';

const useStore = create<AppState>()(
  persist(
    (set, get, store) => ({
      ...createCoreSlice(set, get, store),
      ...createPlayerSlice(set, get, store),
      ...createSectSlice(set, get, store),
      ...createCaveSlice(set, get, store),
      ...createCompanionSlice(set, get, store),
      ...createAdventureSlice(set, get, store),
      ...createEquipmentSlice(set, get, store),
      ...createDungeonSlice(set, get, store),
      ...createSpiritRealmSlice(set, get, store),
      ...createV6Slice(set, get, store),
      ...createDemonAbyssSlice(set, get, store),
    }),
    {
      name: 'flowwater-storage',
      version: 1,
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {
            // Storage full or unavailable — silently ignore
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // Silently ignore
          }
        },
      },
    }
  )
);

export default useStore;
export { useStore };
