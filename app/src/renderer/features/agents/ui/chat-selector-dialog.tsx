"use client"

import { useCallback, useMemo, useState, memo } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "../../../components/ui/command"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { Plus } from "lucide-react"
import {
  IconSpinner,
  PlanIcon,
  AgentIcon,
  QuestionIcon,
} from "../../../components/ui/icons"
import { cn } from "../../../lib/utils"
import { formatTimeAgo } from "../utils/format-time-ago"
import type { SubChatMeta } from "../stores/sub-chat-store"

interface ChatSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sortedSubChats: SubChatMeta[]
  loadingSubChats: Map<string, string>
  subChatUnseenChanges: Set<string>
  pendingQuestionsMap: Map<string, { subChatId: string }>
  pendingPlanApprovals: Set<string>
  onSelect: (subChat: SubChatMeta) => void
  onCreateNew: () => void
}

export const ChatSelectorDialog = memo(function ChatSelectorDialog({
  open,
  onOpenChange,
  sortedSubChats,
  loadingSubChats,
  subChatUnseenChanges,
  pendingQuestionsMap,
  pendingPlanApprovals,
  onSelect,
  onCreateNew,
}: ChatSelectorDialogProps) {
  const [search, setSearch] = useState("")

  const filteredChats = useMemo(() => {
    if (!search) return sortedSubChats
    const q = search.toLowerCase()
    return sortedSubChats.filter(
      (sc) => (sc.name || "New Chat").toLowerCase().includes(q),
    )
  }, [sortedSubChats, search, open])

  const handleSelect = useCallback(
    (subChat: SubChatMeta) => {
      onSelect(subChat)
      onOpenChange(false)
      setSearch("")
    },
    [onSelect, onOpenChange],
  )

  const handleCreateNew = useCallback(() => {
    onCreateNew()
    onOpenChange(false)
    setSearch("")
  }, [onCreateNew, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setSearch("") }}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 overflow-hidden w-[400px]"
      >
        <VisuallyHidden.Root>
          <DialogTitle>Select chat</DialogTitle>
        </VisuallyHidden.Root>
        <Command>
          <CommandInput
            placeholder="Search chats..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandGroup>
              <CommandItem onSelect={handleCreateNew}>
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">New Chat</span>
                </div>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Recent">
              {filteredChats.length === 0 ? (
                <CommandEmpty>No chats found.</CommandEmpty>
              ) : (
                filteredChats.map((subChat) => {
                  const timeAgo = formatTimeAgo(subChat.updated_at || subChat.created_at)
                  const isLoading = loadingSubChats.has(subChat.id)
                  const hasUnseen = subChatUnseenChanges.has(subChat.id)
                  const mode = subChat.mode || "agent"
                  const hasPendingQuestion = pendingQuestionsMap.has(subChat.id)
                  const hasPendingPlan = pendingPlanApprovals.has(subChat.id)

                  return (
                    <CommandItem
                      key={subChat.id}
                      value={`${subChat.name || "New Chat"} ${subChat.id}`}
                      onSelect={() => handleSelect(subChat)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center relative">
                          {hasPendingQuestion ? (
                            <QuestionIcon className="w-4 h-4 text-blue-500" />
                          ) : isLoading ? (
                            <IconSpinner className="w-4 h-4 text-muted-foreground" />
                          ) : mode === "plan" ? (
                            <PlanIcon className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <AgentIcon className="w-4 h-4 text-muted-foreground" />
                          )}
                          {(hasPendingPlan || hasUnseen) && !isLoading && !hasPendingQuestion && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-popover flex items-center justify-center">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                hasPendingPlan ? "bg-amber-500" : "bg-[#307BD0]"
                              )} />
                            </div>
                          )}
                        </div>
                        <span className="text-sm truncate flex-1">
                          {subChat.name || "New Chat"}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {timeAgo}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
})
