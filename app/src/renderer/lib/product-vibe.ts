import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const productVibeModeStorageAtom = atomWithStorage<boolean>(
  "preferences:product-vibe-mode",
  true,
  undefined,
  { getOnInit: true },
)

export const productVibeModeAtom = atom(
  (get) => get(productVibeModeStorageAtom),
  (_get, set, value: boolean) => {
    set(productVibeModeStorageAtom, value)
  },
)

// Projects-screen mode: replaces sidebar panel with full-screen projects view.
// Defaults to true when productVibeMode is on, can be overridden independently.
const projectsScreenModeStorageAtom = atomWithStorage<boolean>(
  "preferences:projects-screen-mode",
  false,
  undefined,
  { getOnInit: true },
)

export const projectsScreenModeAtom = atom(
  (get) => get(projectsScreenModeStorageAtom) || get(productVibeModeStorageAtom),
  (_get, set, value: boolean) => {
    set(projectsScreenModeStorageAtom, value)
  },
)
