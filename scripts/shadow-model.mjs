import { ANGST_MAX, ANGST_MIN, ANGST_START } from './constants.mjs'

const { fields } = foundry.data

/**
 * System data for the "Schatten" (Shadow) actor type.
 */
export class ShadowData extends foundry.abstract.TypeDataModel {
  static LOCALIZATION_PREFIXES = ['WOTA.Shadow']

  static defineSchema() {
    return {
      // UUID of the vampire whose Shadow this is. Plain string so that a deleted
      // actor never makes the document invalid.
      linkedActor: new fields.StringField({ required: true, blank: true, initial: '' }),
      angst: new fields.NumberField({
        required: true,
        nullable: false,
        integer: true,
        min: ANGST_MIN,
        max: ANGST_MAX,
        initial: ANGST_START
      }),
      notes: new fields.StringField({ required: true, blank: true, initial: '' }),
      // True while the Shadow speaks with its voice (shown in the speaking panel).
      speaking: new fields.BooleanField({ required: true, initial: false })
    }
  }
}
