import { MODULE_ID, SHADOW_TYPE } from './constants.mjs'
import { ShadowData } from './shadow-model.mjs'
import { ShadowSheet } from './shadow-sheet.mjs'

Hooks.once('init', () => {
  CONFIG.Actor.dataModels[SHADOW_TYPE] = ShadowData

  foundry.applications.apps.DocumentSheetConfig.registerSheet(Actor, MODULE_ID, ShadowSheet, {
    types: [SHADOW_TYPE],
    makeDefault: true,
    label: 'WOTA.SheetLabel'
  })

  shieldShadowFromSystemLogic()
})

/**
 * The wod5e system replaces the Actor document class and, in prepareDerivedData,
 * computes health, willpower, XP etc. for every actor. It also forces
 * player-owned actors to "Limited" default ownership. None of this applies to a
 * Shadow (and would throw on missing fields), so Shadows skip the system's
 * derived-data step and only run Foundry's core logic.
 */
function shieldShadowFromSystemLogic() {
  const DocumentClass = CONFIG.Actor.documentClass
  if (DocumentClass === Actor) return

  const original = DocumentClass.prototype.prepareDerivedData
  DocumentClass.prototype.prepareDerivedData = function (...args) {
    if (this.type === SHADOW_TYPE) {
      return Actor.prototype.prepareDerivedData.apply(this, args)
    }
    return original.apply(this, args)
  }
}
