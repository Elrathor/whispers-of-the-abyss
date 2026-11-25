import {
  ANGST_GAINS,
  ANGST_MAX,
  MODULE_ID,
  MOVES,
  SHADOW_TYPE,
  clampAngst
} from './constants.mjs'

const { HandlebarsApplicationMixin } = foundry.applications.api
const { ActorSheetV2 } = foundry.applications.sheets

/**
 * Sheet for the "Schatten" actor type: linked vampire, Angst counter,
 * quick Angst gains, Shadow Moves and free-text notes.
 */
export class ShadowSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: [MODULE_ID, 'shadow-sheet'],
    position: { width: 560, height: 760 },
    window: { resizable: true },
    // Players need at least Observer to look at a Shadow; Limited is not enough.
    viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
    form: { submitOnChange: true },
    actions: {
      angstIncrease: ShadowSheet.#onAngstIncrease,
      angstDecrease: ShadowSheet.#onAngstDecrease,
      angstGain: ShadowSheet.#onAngstGain,
      useMove: ShadowSheet.#onUseMove,
      openLinkedActor: ShadowSheet.#onOpenLinkedActor,
      toggleSpeaking: ShadowSheet.#onToggleSpeaking
    }
  }

  static PARTS = {
    sheet: {
      template: `modules/${MODULE_ID}/templates/shadow-sheet.hbs`,
      scrollable: ['']
    }
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    const system = this.document.system
    const angst = system.angst

    const linked = system.linkedActor ? fromUuidSync(system.linkedActor) : null

    // All actors the user can see, except other Shadows. The currently linked
    // actor is always included so the selection never silently disappears.
    const actorOptions = game.actors
      .filter((a) => a.type !== SHADOW_TYPE && (a.visible || a.uuid === system.linkedActor))
      .sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang))
      .map((a) => ({ value: a.uuid, label: a.name }))

    return Object.assign(context, {
      actor: this.document,
      system,
      editable: this.isEditable,
      locked: !this.isEditable,
      actorOptions,
      linkedActor: linked,
      linkedMissing: Boolean(system.linkedActor) && !linked,
      speaking: system.speaking,
      angst,
      angstMax: ANGST_MAX,
      angstDots: Array.from({ length: ANGST_MAX }, (_, i) => ({ filled: i < angst })),
      decreaseDisabled: !this.isEditable || angst <= 0,
      increaseDisabled: !this.isEditable || angst >= ANGST_MAX,
      gains: ANGST_GAINS.map((g) => ({
        ...g,
        label: `WOTA.Gain.${g.key}`,
        isDisabled: !this.isEditable || angst >= ANGST_MAX
      })),
      moves: MOVES.map((m) => ({
        ...m,
        name: `WOTA.Move.${m.key}.name`,
        prerequisite: `WOTA.Move.${m.key}.prerequisite`,
        effect: `WOTA.Move.${m.key}.effect`,
        isDisabled: !this.isEditable || angst < m.cost
      }))
    })
  }

  /** Set Angst to a new value, clamped to 0–10. */
  async #setAngst(value) {
    const angst = clampAngst(value)
    if (angst === this.document.system.angst) return
    await this.document.update({ 'system.angst': angst })
  }

  static async #onAngstIncrease() {
    await this.#setAngst(this.document.system.angst + 1)
  }

  static async #onAngstDecrease() {
    await this.#setAngst(this.document.system.angst - 1)
  }

  static async #onAngstGain(event, target) {
    const gain = ANGST_GAINS.find((g) => g.key === target.dataset.gain)
    if (!gain) return
    await this.#setAngst(this.document.system.angst + gain.amount)
  }

  static async #onUseMove(event, target) {
    const move = MOVES.find((m) => m.key === target.dataset.move)
    if (!move) return
    const angst = this.document.system.angst
    if (angst < move.cost) {
      ui.notifications.warn(game.i18n.localize('WOTA.Notify.NotEnoughAngst'))
      return
    }
    await this.#setAngst(angst - move.cost)
  }

  static async #onToggleSpeaking() {
    await this.document.update({ 'system.speaking': !this.document.system.speaking })
  }

  static async #onOpenLinkedActor() {
    const uuid = this.document.system.linkedActor
    const linked = uuid ? fromUuidSync(uuid) : null
    if (!linked) return
    if (!linked.testUserPermission(game.user, 'OBSERVER')) {
      ui.notifications.warn(game.i18n.localize('WOTA.Notify.NoPermission'))
      return
    }
    linked.sheet.render(true)
  }
}
