"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Home, LayoutGrid } from "lucide-react"

import { Logo } from "../../components/ui/logo"
import {
  SettingsIcon,
  QuestionCircleIcon,
  ArchiveIcon,
} from "../../components/ui/icons"
import { Button as ButtonCustom } from "../../components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import { Kbd } from "../../components/ui/kbd"
import { cn } from "../../lib/utils"
import {
  agentsSettingsDialogActiveTabAtom,
  agentsSettingsDialogOpenAtom,
  agentsHelpPopoverOpenAtom,
} from "../../lib/atoms"
import {
  archivePopoverOpenAtom,
  desktopViewAtom,
  selectedAgentChatIdAtom,
  selectedDraftIdAtom,
} from "../agents/atoms"
import { useResolvedHotkeyDisplay } from "../../lib/hotkeys"
import { AgentsHelpPopover } from "../agents/components/agents-help-popover"
import { ArchivePopover } from "../agents/ui/archive-popover"
import { trpc } from "../../lib/trpc"

const FEEDBACK_URL =
  import.meta.env.VITE_FEEDBACK_URL || "https://discord.gg/8ektTZGnj4"

export function MainSidebar() {
  const [desktopView, setDesktopView] = useAtom(desktopViewAtom)
  const setSelectedChatId = useSetAtom(selectedAgentChatIdAtom)
  const setSelectedDraftId = useSetAtom(selectedDraftIdAtom)
  const setSettingsActiveTab = useSetAtom(agentsSettingsDialogActiveTabAtom)
  const setSettingsDialogOpen = useSetAtom(agentsSettingsDialogOpenAtom)
  const settingsHotkey = useResolvedHotkeyDisplay("open-settings")

  // Archived chats count for archive button visibility
  const { data: archivedChats } = trpc.chats.listArchived.useQuery({})
  const archivedChatsCount = archivedChats?.length ?? 0

  const handleOpenSettings = useCallback(() => {
    setSettingsActiveTab("preferences")
    setSettingsDialogOpen(true)
  }, [setSettingsActiveTab, setSettingsDialogOpen])

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex-shrink-0 px-3 pt-3 pb-4">
        <div className="flex items-center gap-2 px-1.5 h-6">
          <Logo className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-semibold text-foreground truncate">
            ProductVibe
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="px-2 space-y-0.5">
        <button
          onClick={() => {
            setSelectedChatId(null)
            setSelectedDraftId(null)
            setDesktopView("new-chat")
          }}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-1.5 text-sm h-8 rounded-md font-medium transition-colors duration-75 cursor-pointer",
            desktopView === "new-chat"
              ? "bg-foreground/5 text-foreground"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
          )}
        >
          <Home className="h-4 w-4 flex-shrink-0" />
          Home
        </button>
        <button
          onClick={() => {
            setSelectedChatId(null)
            setDesktopView("projects")
          }}
          className={cn(
            "flex items-center gap-2 w-full px-3 py-1.5 text-sm h-8 rounded-md font-medium transition-colors duration-75 cursor-pointer",
            desktopView === "projects"
              ? "bg-foreground/5 text-foreground"
              : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
          )}
        >
          <LayoutGrid className="h-4 w-4 flex-shrink-0" />
          Projects
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="flex-shrink-0 p-2 flex flex-col gap-2">
        <div className="flex items-center gap-1">
          {/* Settings */}
          <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleOpenSettings}
                className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              >
                <SettingsIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Settings{settingsHotkey && <> <Kbd>{settingsHotkey}</Kbd></>}</TooltipContent>
          </Tooltip>

          {/* Help */}
          <HelpButton />

          {/* Archive */}
          <ArchiveButton archivedChatsCount={archivedChatsCount} />
        </div>

        {/* Feedback */}
        <ButtonCustom
          onClick={() => window.open(FEEDBACK_URL, "_blank")}
          variant="outline"
          size="sm"
          className="px-2 w-full hover:bg-foreground/10 transition-[background-color,transform] duration-150 ease-out active:scale-[0.97] text-foreground rounded-lg gap-1.5 h-7"
        >
          <span className="text-sm font-medium">Feedback</span>
        </ButtonCustom>
      </div>
    </div>
  )
}

// Isolated help button to prevent sidebar re-renders on popover state changes
const HelpButton = memo(function HelpButton() {
  const [helpPopoverOpen, setHelpPopoverOpen] = useAtom(agentsHelpPopoverOpenAtom)
  const [blockTooltip, setBlockTooltip] = useState(false)
  const prevOpen = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (prevOpen.current && !helpPopoverOpen) {
      buttonRef.current?.blur()
      setBlockTooltip(true)
      const timer = setTimeout(() => setBlockTooltip(false), 300)
      prevOpen.current = helpPopoverOpen
      return () => clearTimeout(timer)
    }
    prevOpen.current = helpPopoverOpen
  }, [helpPopoverOpen])

  return (
    <Tooltip delayDuration={500} open={helpPopoverOpen || blockTooltip ? false : undefined}>
      <TooltipTrigger asChild>
        <div>
          <AgentsHelpPopover
            open={helpPopoverOpen}
            onOpenChange={setHelpPopoverOpen}
          >
            <button
              ref={buttonRef}
              type="button"
              className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
            >
              <QuestionCircleIcon className="h-4 w-4" />
            </button>
          </AgentsHelpPopover>
        </div>
      </TooltipTrigger>
      <TooltipContent>Help</TooltipContent>
    </Tooltip>
  )
})

// Isolated archive button
const ArchiveButton = memo(function ArchiveButton({ archivedChatsCount }: { archivedChatsCount: number }) {
  const archivePopoverOpen = useAtomValue(archivePopoverOpenAtom)
  const [blockTooltip, setBlockTooltip] = useState(false)
  const prevOpen = useRef(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (prevOpen.current && !archivePopoverOpen) {
      buttonRef.current?.blur()
      setBlockTooltip(true)
      const timer = setTimeout(() => setBlockTooltip(false), 300)
      prevOpen.current = archivePopoverOpen
      return () => clearTimeout(timer)
    }
    prevOpen.current = archivePopoverOpen
  }, [archivePopoverOpen])

  if (archivedChatsCount === 0) return null

  return (
    <Tooltip delayDuration={500} open={archivePopoverOpen || blockTooltip ? false : undefined}>
      <TooltipTrigger asChild>
        <div>
          <ArchivePopover
            trigger={
              <button
                ref={buttonRef}
                type="button"
                className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              >
                <ArchiveIcon className="h-4 w-4" />
              </button>
            }
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>Archive</TooltipContent>
    </Tooltip>
  )
})
