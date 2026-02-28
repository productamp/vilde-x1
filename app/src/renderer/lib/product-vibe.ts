import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

const productVibeModeStorageAtom = atomWithStorage<boolean>(
  "preferences:product-vibe-mode",
  false,
  undefined,
  { getOnInit: true },
)

export const productVibeModeAtom = atom(
  (get) => get(productVibeModeStorageAtom),
  (_get, set, value: boolean) => {
    set(productVibeModeStorageAtom, value)
  },
)
