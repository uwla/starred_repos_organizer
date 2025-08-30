import { Settings, SettingsKey, SettingsManager } from "../types"

/******************************************************************************/
// Local helper functions.

function getSettings(): Settings {
    return JSON.parse(localStorage.getItem("settings") || "{}") as Settings
}

function setSettings(settings: Settings): void {
    localStorage.setItem("settings", JSON.stringify(settings))
}

/*
 * Settings Manager uses the local storage driver for storing user setings.
 *
 * This implementation is simple, straighforward.
 *
 * It is not optimized for performance because there are less than 10 settings,
 * and they are all short strings.
 *
 * If there were many complex settings, we would have more sophiscated logic to
 * address performance. But this is not an issue now.
 */
const localStorageSettingsManager: SettingsManager = {
    set(key: SettingsKey, value: string) {
        const settings = getSettings()
        settings[key] = value
        setSettings(settings)
    },
    get(key: SettingsKey): string {
        return getSettings()[key] || ""
    },
}

export default localStorageSettingsManager
