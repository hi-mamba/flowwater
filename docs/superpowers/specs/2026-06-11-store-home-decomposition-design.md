# Store & Home Decomposition Design

## Goal

Split `store.ts` (~3500 lines) into feature slices and `Home.tsx` (~3355 lines) into modular components + hooks. Zero breaking changes to consumers — `useStore` API stays identical.

## Phase 1: Store Slices

### Strategy

Zustand slice pattern: each file exports a `createXxxSlice(set, get)` function returning state + actions. `store/index.ts` merges all slices into one `useStore`.

### File Structure

```
store/
├── index.ts              ← create() merge, export useStore
├── constants.ts          ← CULTIVATION_LEVELS, SECTS, SHOP_ITEMS, DUNGEONS, etc.
├── types.ts              ← All interfaces (Plan, Log, CaveState, etc.)
├── coreSlice.ts          ← plans, logs, settings, bonusPoints, streakDays, checkIn, addLog, addSpiritStones
├── playerSlice.ts        ← playerName, currentRegion, titles, achievements, luck, age, lifespan
├── sectSlice.ts          ← sect, sectStatus, sectContribution, sectWar, sectNpcs, joinSect, donateToSect
├── caveSlice.ts          ← cave, materials, alchemy/crafting levels, herbs, spring, makePill, craftArtifact
├── companionSlice.ts     ← daoCompanion, marriedCompanions, interactWithCompanion
├── adventureSlice.ts     ← adventure state + combat + exploration actions
├── equipmentSlice.ts     ← skills, artifacts, equippedSkills, equippedArtifacts, proficiency
├── dungeonSlice.ts       ← dungeon state + explore/advance/end actions
├── spiritRealmSlice.ts   ← spiritRealm state + unlock/explore/collect actions
└── v6Slice.ts            ← heavenlyBottle, lifeboundArtifact, goldDevouringBeetles, tribulation
```

### Cross-Slice Dependencies

`addLog` is the most entangled action (touches 15+ domains). It lives in `coreSlice.ts` and uses `get()` to read/write cross-domain state. This is the standard Zustand slice pattern for cross-cutting concerns.

Similarly, `attemptBreakthrough` lives in `playerSlice.ts` and reads cave/materials state via `get()`.

### Constants Extraction

All constants currently at top of store.ts move to `constants.ts`:
- CULTIVATION_LEVELS, SPIRITUAL_ROOTS, SECTS, DAO_COMPANIONS
- BOTTLE_LEVELS, LIFEBOUND_ARTIFACTS, BEETLE_STAGES
- TRIBULATION_TYPES, DUNGEONS, SPIRIT_CONTINENTS, HEAVENLY_TREASURES
- SECT_WAR_REWARDS, DIVINE_SENSE_LEVELS, SWORD_FORMATIONS
- SPIRIT_BEASTS, DEMON_INVASION_PHASES, SHOP_ITEMS, GAME_SKILLS
- REGIONS

### Migration Approach

1. Create `store/` directory with `constants.ts` and `types.ts` first
2. Create each slice file, moving state + actions from store.ts
3. Create `store/index.ts` that merges all slices
4. Update `src/store.ts` to re-export from `store/index.ts`
5. Verify build passes after each slice

## Phase 2: Home Decomposition

### Strategy

Extract all 25 modals into `components/home/modals/`, extract logic into hooks, Home.tsx becomes a thin shell.

### Hooks

```
components/home/hooks/
├── useWeather.ts            ← fetchWeatherData + state
├── useStepCounter.ts        ← DeviceMotion listener + todaySteps
├── useMultiplayer.ts        ← WebSocket connect/onlinePlayers
├── usePassiveMultiplier.ts  ← passive bonus calculation
└── useDrinkHandler.ts       ← handleCinematicDrink + energyTrail
```

### Modal Components

25 modals extracted to `components/home/modals/`, each receiving only the props it needs. Home.tsx passes `isOpen` + `onClose` + relevant store data.

### Remaining Home.tsx

After extraction: ~300-400 lines containing:
- Top-level layout (status pills, cultivation circle, drink buttons)
- State orchestration (which modals are open)
- Import + render of extracted components

## Execution Order

1. `store/constants.ts` + `store/types.ts`
2. `store/coreSlice.ts` (most foundational)
3. Remaining slices one by one (each verified with build)
4. `store/index.ts` merge
5. Redirect `src/store.ts` → re-export from `store/index.ts`
6. Home hooks extraction
7. Home modal extraction (batch of 5 at a time)
8. Final verification build
