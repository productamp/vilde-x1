"use client"

import { useMemo, useState } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Search, Star } from "lucide-react"

import { Input } from "../../../components/ui/input"
import { cn } from "../../../lib/utils"
import { trpc } from "../../../lib/trpc"
import { formatTimeAgo } from "../../../lib/utils/format-time-ago"
import {
  selectedProjectAtom,
  selectedAgentChatIdAtom,
  lastSelectedWorkModeAtom,
  desktopViewAtom,
  projectsFilterAtom,
  type ProjectsFilter,
} from "../atoms"

interface ProjectItem {
  projectId: string
  projectName: string
  chatId: string
  updatedAt: Date | null
  displayUrl: string
  isFavourited: boolean
}

const FILTER_TABS: Array<{ id: ProjectsFilter; label: string }> = [
  { id: "drafts", label: "Drafts" },
  { id: "published", label: "Published" },
  { id: "archived", label: "Archived" },
]

export function ProjectsScreen() {
  const [, setSelectedProject] = useAtom(selectedProjectAtom)
  const [, setSelectedChatId] = useAtom(selectedAgentChatIdAtom)
  const setWorkMode = useSetAtom(lastSelectedWorkModeAtom)
  const setDesktopView = useSetAtom(desktopViewAtom)
  const [activeFilter, setActiveFilter] = useAtom(projectsFilterAtom)

  const [search, setSearch] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  // Data
  const utils = trpc.useUtils()
  const { data: allChats } = trpc.chats.list.useQuery({})
  const { data: archivedChats } = trpc.chats.listArchived.useQuery({})
  const { data: projects } = trpc.projects.list.useQuery()
  const toggleFavourite = trpc.projects.toggleFavourite.useMutation({
    onSuccess: () => utils.projects.list.invalidate(),
  })

  // Build project list based on active filter
  const projectItems = useMemo(() => {
    if (!projects) return []

    if (activeFilter === "archived") {
      if (!archivedChats) return []
      const archivedByProject = new Map<string, typeof archivedChats[0]>()
      for (const chat of archivedChats) {
        const existing = archivedByProject.get(chat.projectId)
        if (!existing || (chat.archivedAt && existing.archivedAt && chat.archivedAt > existing.archivedAt)) {
          archivedByProject.set(chat.projectId, chat)
        }
      }

      const items: ProjectItem[] = []

      for (const [projectId, chat] of archivedByProject) {
        const project = projects.find((p) => p.id === projectId)
        if (!project) continue
        items.push({
          projectId,
          projectName: project.name,
          chatId: chat.id,
          updatedAt: chat.archivedAt,
          displayUrl: project.gitOwner && project.gitRepo ? `${project.gitOwner}/${project.gitRepo}` : project.name,
          isFavourited: !!project.isFavourited,
        })
      }

      items.sort((a, b) => {
        const aTime = a.updatedAt?.getTime() ?? 0
        const bTime = b.updatedAt?.getTime() ?? 0
        return bTime - aTime
      })
      return items
    }

    // "drafts" and "published" — use active (non-archived) chats
    // TODO: distinguish drafts vs published once publish status exists
    // For now, "published" shows empty and "drafts" shows all active projects
    if (activeFilter === "published") return []

    if (!allChats) return []

    const projectsMap = new Map(projects.map((p) => [p.id, p]))

    const chatsByProject = new Map<string, typeof allChats[0]>()
    for (const chat of allChats) {
      const existing = chatsByProject.get(chat.projectId)
      if (!existing || (chat.updatedAt && existing.updatedAt && chat.updatedAt > existing.updatedAt)) {
        chatsByProject.set(chat.projectId, chat)
      }
    }

    const items: ProjectItem[] = []

    for (const [projectId, chat] of chatsByProject) {
      const project = projectsMap.get(projectId)
      if (!project) continue
      items.push({
        projectId,
        projectName: project.name,
        chatId: chat.id,
        updatedAt: chat.updatedAt,
        displayUrl: project.gitOwner && project.gitRepo ? `${project.gitOwner}/${project.gitRepo}` : project.name,
        isFavourited: !!project.isFavourited,
      })
    }

    for (const project of projects) {
      if (!chatsByProject.has(project.id)) {
        items.push({
          projectId: project.id,
          projectName: project.name,
          chatId: "",
          updatedAt: project.updatedAt,
          displayUrl: project.gitOwner && project.gitRepo ? `${project.gitOwner}/${project.gitRepo}` : project.name,
          isFavourited: !!project.isFavourited,
        })
      }
    }

    items.sort((a, b) => {
      const aTime = a.updatedAt?.getTime() ?? 0
      const bTime = b.updatedAt?.getTime() ?? 0
      return bTime - aTime
    })

    return items
  }, [projects, allChats, archivedChats, activeFilter])

  // Filter by search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return projectItems
    const q = search.toLowerCase()
    return projectItems.filter((item) => item.projectName.toLowerCase().includes(q))
  }, [projectItems, search])

  // Handlers
  const handleSelectProject = (item: typeof projectItems[0]) => {
    const project = projects?.find((p) => p.id === item.projectId)
    if (!project) return

    setWorkMode("local")
    setSelectedProject({
      id: project.id,
      name: project.name,
      path: project.path,
      gitRemoteUrl: project.gitRemoteUrl,
      gitProvider: project.gitProvider as "github" | "gitlab" | "bitbucket" | null,
      gitOwner: project.gitOwner,
      gitRepo: project.gitRepo,
    })

    if (item.chatId) {
      setSelectedChatId(item.chatId)
    }
    setDesktopView(null)
  }

  return (
    <div className="h-full flex flex-col bg-white select-none overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-8 pt-8 pb-2">
        <div className="flex items-end justify-between">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>

          <div className="flex items-center gap-2">
            {/* Filter tabs */}
            <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={cn(
                    "px-3 h-6 rounded-md text-xs font-medium transition-all duration-150",
                    activeFilter === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            {searchOpen ? (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearch("")
                      setSearchOpen(false)
                    }
                  }}
                  placeholder="Search..."
                  className="pl-8 h-7 w-44 text-xs"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-sm text-muted-foreground">
              {search
                ? "No projects match your search"
                : activeFilter === "archived"
                  ? "No archived projects"
                  : activeFilter === "published"
                    ? "No published projects"
                    : "No projects yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-10">
            {filteredItems.map((item) => (
              <div
                key={item.projectId}
                onClick={() => handleSelectProject(item)}
                className="flex flex-col gap-2 text-left group cursor-pointer"
              >
                {/* Thumbnail with browser frame */}
                <div className="aspect-[3/2] bg-neutral-300 border border-border rounded-lg pt-5 px-6 overflow-hidden transition-[border-color,box-shadow] duration-150 group-hover:border-border/60 group-hover:shadow-sm">
                  <div className="w-full h-full flex flex-col rounded-t overflow-hidden shadow-sm">
                    {/* Browser chrome */}
                    <div className="flex items-center px-2 h-4 bg-neutral-100 border-b border-neutral-200 flex-shrink-0">
                      <span className="text-[6px] leading-none text-neutral-900 truncate">{item.displayUrl}</span>
                    </div>
                    {/* Page content */}
                    <div className="flex-1 bg-neutral-100 overflow-hidden">
                      <ProjectThumbnail projectId={item.projectId} />
                    </div>
                  </div>
                </div>
                {/* Info */}
                <div className="flex items-start gap-1 px-0.5">
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.projectName}
                    </span>
                    {item.updatedAt && (
                      <span className="text-xs text-muted-foreground">
                        {activeFilter === "archived" ? "Archived" : "Edited"} {formatTimeAgo(item.updatedAt)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavourite.mutate({ id: item.projectId })
                    }}
                    className="flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-amber-500 transition-colors"
                  >
                    <Star className={cn("h-3.5 w-3.5", item.isFavourited && "fill-amber-400 text-amber-400")} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Thumbnail image component — loads PNG via tRPC as base64 data URL
function ProjectThumbnail({ projectId }: { projectId: string }) {
  const { data: src } = trpc.projects.getThumbnail.useQuery({ projectId })
  if (!src) return null
  return <img src={src} alt="" className="w-full h-full object-cover object-top" />
}
