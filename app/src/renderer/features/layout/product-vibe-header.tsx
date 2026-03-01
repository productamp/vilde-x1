"use client"

import { useAtomValue } from "jotai"
import { isDesktopAtom, isFullscreenAtom } from "../../lib/atoms"
import { TrafficLights } from "../agents/components/traffic-light-spacer"

export function ProductVibeHeader() {
  const isDesktop = useAtomValue(isDesktopAtom)
  const isFullscreen = useAtomValue(isFullscreenAtom)

  return (
    <div
      className="h-9 flex-shrink-0 flex items-center bg-background relative"
      style={{
        // @ts-expect-error - WebKit-specific property for Electron window dragging
        WebkitAppRegion: "drag",
      }}
    >
      {/* No-drag zone over native traffic lights */}
      <TrafficLights
        isFullscreen={isFullscreen}
        isDesktop={isDesktop}
        className="ml-[15px]"
      />

      {/* Product name */}
      <span className="text-xs font-medium text-muted-foreground ml-4 select-none">
        ProductVibe
      </span>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
    </div>
  )
}
