import {
  HUB_DISPLAY_PRESETS,
  HUB_SEO_GLOBAL_PRESETS,
  getHubDisplayPreset,
  getHubSeoGlobalPreset,
  type HubDisplayPreset,
  type HubSeoGlobalPreset,
} from "@workspace/site-config"

/** Chỉ preset stack check-in — không hiện HUB Parent / tối giản. */
export const CHECKIN_PRESET_ID = "hub-checkin" as const

export const CHECKIN_SETTINGS_DISPLAY_PRESETS: HubDisplayPreset[] =
  HUB_DISPLAY_PRESETS.filter((preset) => preset.id === CHECKIN_PRESET_ID)

export const CHECKIN_SETTINGS_SEO_PRESETS: HubSeoGlobalPreset[] =
  HUB_SEO_GLOBAL_PRESETS.filter((preset) => preset.id === CHECKIN_PRESET_ID)

export function getCheckinSettingsDisplayPreset(
  id: string,
): HubDisplayPreset | undefined {
  const preset = getHubDisplayPreset(id)
  return preset?.id === CHECKIN_PRESET_ID ? preset : undefined
}

export function getCheckinSettingsSeoPreset(
  id: string,
): HubSeoGlobalPreset | undefined {
  const preset = getHubSeoGlobalPreset(id)
  return preset?.id === CHECKIN_PRESET_ID ? preset : undefined
}
