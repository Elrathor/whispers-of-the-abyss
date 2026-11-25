import { MODULE_ID, SHADOW_TYPE } from './constants.mjs'

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export const SETTING_PANEL_VISIBLE = 'panelVisible'
export const SETTING_PANEL_POSITION = 'panelPosition'

/**
 * Small, draggable panel shown to everyone. It has one lamp per Shadow that has
 * a vampire selected; the lamp lights up while that Shadow is speaking.
 * Players cannot close it – only the GM can hide it (for everyone) via the
 * world setting / scene control.
 */
export class SpeakingPanel extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'wota-speaking-panel',
    classes: [MODULE_ID, 'wota-speaking-panel'],
    tag: 'aside',
    window: {
      title: 'WOTA.Panel.Title',
      icon: 'fa-solid fa-ghost',
      minimizable: true,
      resizable: false,
      controls: []
    },
    position: { width: 240, height: 'auto' },
    actions: {
      toggleSpeaking: SpeakingPanel.#onToggleSpeaking
    }
  }

  static PARTS = {
    lamps: { template: `modules/${MODULE_ID}/templates/speaking-panel.hbs` }
  }

  constructor(options = {}) {
    const saved = game.settings.get(MODULE_ID, SETTING_PANEL_POSITION) ?? {}
    const position = {}
    if (Number.isFinite(saved.left)) position.left = saved.left
    if (Number.isFinite(saved.top)) position.top = saved.top
    super(foundry.utils.mergeObject({ position }, options))
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    const lamps = game.actors
      .filter((a) => a.type === SHADOW_TYPE && a.system.linkedActor)
      .map((shadow) => {
        const vampire = fromUuidSync(shadow.system.linkedActor)
        if (!vampire) return null
        return {
          shadowId: shadow.id,
          name: vampire.name,
          speaking: shadow.system.speaking,
          isDisabled: !shadow.isOwner
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, game.i18n.lang))
    return Object.assign(context, { lamps })
  }

  /** Remember where each user dragged the panel to. */
  _onPosition(position) {
    super._onPosition?.(position)
    this.#savePosition(position)
  }

  #savePosition = foundry.utils.debounce(({ left, top }) => {
    if (!Number.isFinite(left) || !Number.isFinite(top)) return
    game.settings.set(MODULE_ID, SETTING_PANEL_POSITION, { left, top })
  }, 500)

  /**
   * Ignore normal close requests (close button, Escape key). Only the module
   * itself closes the panel, when the GM hides it.
   * @override
   */
  async close(options = {}) {
    if (!options.wotaForce) return this
    return super.close(options)
  }

  static async #onToggleSpeaking(event, target) {
    const shadow = game.actors.get(target.dataset.shadowId)
    if (!shadow?.isOwner) return
    await shadow.update({ 'system.speaking': !shadow.system.speaking })
  }
}

let panel = null

/** Show or hide the panel according to the world setting. */
export function syncPanel() {
  const visible = game.settings.get(MODULE_ID, SETTING_PANEL_VISIBLE)
  if (visible) {
    panel ??= new SpeakingPanel()
    panel.render({ force: true })
  } else if (panel) {
    panel.close({ wotaForce: true })
    panel = null
  }
}

/** Re-render the panel if it is open (e.g. after a Shadow or vampire changed). */
export function refreshPanel() {
  if (panel?.rendered) panel.render()
}

export function registerPanelSettings() {
  game.settings.register(MODULE_ID, SETTING_PANEL_VISIBLE, {
    name: 'WOTA.Settings.PanelVisible.Name',
    hint: 'WOTA.Settings.PanelVisible.Hint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true,
    onChange: () => {
      syncPanel()
      ui.controls?.render()
    }
  })

  game.settings.register(MODULE_ID, SETTING_PANEL_POSITION, {
    scope: 'client',
    config: false,
    type: Object,
    default: {}
  })
}

/**
 * Adds a GM-only toggle to the token controls that shows/hides the panel for
 * everyone.
 */
export function addSceneControl(controls) {
  if (!game.user.isGM) return
  const tokens = Array.isArray(controls)
    ? controls.find((c) => c.name === 'token' || c.name === 'tokens')
    : controls.tokens ?? controls.token
  if (!tokens) return

  const tool = {
    name: 'wotaSpeakingPanel',
    title: 'WOTA.Panel.Toggle',
    icon: 'fa-solid fa-ghost',
    toggle: true,
    active: game.settings.get(MODULE_ID, SETTING_PANEL_VISIBLE),
    order: 100,
    visible: true,
    onChange: (event, active) => game.settings.set(MODULE_ID, SETTING_PANEL_VISIBLE, active)
  }

  if (Array.isArray(tokens.tools)) tokens.tools.push(tool)
  else tokens.tools[tool.name] = tool
}
