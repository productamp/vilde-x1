"use client"

import { cn } from "../../../lib/utils"
import { useState } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../../components/ui/popover"
import { AGENTS_PREVIEW_CONSTANTS } from "../constants"

interface ScaleControlProps {
  value: number
  onChange: (scale: number) => void
  presets?: readonly number[]
  className?: string
}

export function ScaleControl({
  value,
  onChange,
  presets = AGENTS_PREVIEW_CONSTANTS.SCALE_PRESETS,
  className,
}: ScaleControlProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center h-7 px-1.5 ml-1 rounded-md transition-colors text-xs text-muted-foreground tabular-nums",
            "hover:bg-muted",
            isOpen && "bg-muted",
            className,
          )}
        >
          {value}%
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] min-w-[60px] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              onChange(preset)
              setIsOpen(false)
            }}
            className={cn(
              "flex items-center justify-center w-[calc(100%-8px)] mx-1 first:mt-1 last:mb-1 min-h-[32px] text-sm rounded-md transition-colors",
              "dark:hover:bg-neutral-800 hover:bg-accent",
              value === preset && "dark:bg-neutral-800 bg-accent font-medium",
            )}
          >
            {preset}%
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
