export const MODULE_ID = 'whispers-of-the-abyss'

/** Full sub-type name Foundry assigns to module-defined Actor types. */
export const SHADOW_TYPE = `${MODULE_ID}.shadow`

export const ANGST_MIN = 0
export const ANGST_MAX = 10
export const ANGST_START = 1

/** Ways the Shadow gains Angst (appendix, section "Angst"). */
export const ANGST_GAINS = [
  { key: 'bestialFailure', amount: 1 },
  { key: 'bonusDice', amount: 2 },
  { key: 'conviction', amount: 3 }
]

/** Shadow Moves (appendix, section "Schatten Moves"). Texts live in lang files. */
export const MOVES = [
  { key: 'aleaIactaEst', cost: 1 },
  { key: 'cloudTheMind', cost: 1 },
  { key: 'sowDoubt', cost: 2 },
  { key: 'hungerOfTheVoid', cost: 3 },
  { key: 'fataMorgana', cost: 4 },
  { key: 'frenzyOfTheDamned', cost: 5 }
]

export function clampAngst(value) {
  return Math.min(ANGST_MAX, Math.max(ANGST_MIN, Math.trunc(Number(value) || 0)))
}
