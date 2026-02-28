import { app } from "electron"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

type AppModeSettings = {
  productVibeMode: boolean
}

const DEFAULT_SETTINGS: AppModeSettings = {
  productVibeMode: true,
}

function getSettingsPath(): string {
  return join(app.getPath("userData"), "app-mode.json")
}

function readSettings(): AppModeSettings {
  const settingsPath = getSettingsPath()

  try {
    if (!existsSync(settingsPath)) {
      return DEFAULT_SETTINGS
    }

    const parsed = JSON.parse(readFileSync(settingsPath, "utf-8")) as Partial<AppModeSettings>
    return {
      productVibeMode: parsed.productVibeMode === true,
    }
  } catch (error) {
    console.error("[AppMode] Failed to read settings:", error)
    return DEFAULT_SETTINGS
  }
}

function writeSettings(settings: AppModeSettings): void {
  const settingsPath = getSettingsPath()

  try {
    mkdirSync(app.getPath("userData"), { recursive: true })
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error("[AppMode] Failed to write settings:", error)
    throw error
  }
}

export function getProductVibeMode(): boolean {
  return readSettings().productVibeMode
}

export function setProductVibeMode(enabled: boolean): boolean {
  const nextSettings: AppModeSettings = {
    ...readSettings(),
    productVibeMode: enabled,
  }
  writeSettings(nextSettings)
  return nextSettings.productVibeMode
}
