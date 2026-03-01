"use client"

import { useMemo, useState } from "react"
import { useAtom, useSetAtom } from "jotai"
import { Plus, Search, Settings, Globe } from "lucide-react"

import { Input } from "../../../components/ui/input"
import { IconSpinner } from "../../../components/ui/icons"
import { trpc } from "../../../lib/trpc"
import { formatTimeAgo } from "../../../lib/utils/format-time-ago"
import {
  selectedProjectAtom,
  selectedAgentChatIdAtom,
  lastSelectedWorkModeAtom,
  desktopViewAtom,
} from "../atoms"

export function ProjectsScreen() {
  const [, setSelectedProject] = useAtom(selectedProjectAtom)
  const [, setSelectedChatId] = useAtom(selectedAgentChatIdAtom)
  const setWorkMode = useSetAtom(lastSelectedWorkModeAtom)
  const setDesktopView = useSetAtom(desktopViewAtom)

  const [search, setSearch] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [createError, setCreateError] = useState<string | null>(null)

  const utils = trpc.useUtils()

  // Data
  const { data: allChats } = trpc.chats.list.useQuery({})
  const { data: projects } = trpc.projects.list.useQuery()

  // Mutations
  const createFromTemplate = trpc.projects.createFromTemplate.useMutation()
  const createForNewProject = trpc.chats.createForNewProject.useMutation()
  const isCreating = createFromTemplate.isPending || createForNewProject.isPending

  // Build project list: group chats by project, use most recent chat per project
  const projectItems = useMemo(() => {
    if (!projects || !allChats) return []

    const projectsMap = new Map(projects.map((p) => [p.id, p]))

    // Group chats by projectId, pick most recent chat per project
    const chatsByProject = new Map<string, typeof allChats[0]>()
    for (const chat of allChats) {
      const existing = chatsByProject.get(chat.projectId)
      if (!existing || (chat.updatedAt && existing.updatedAt && chat.updatedAt > existing.updatedAt)) {
        chatsByProject.set(chat.projectId, chat)
      }
    }

    // Build items sorted by most recent activity
    const items: Array<{
      projectId: string
      projectName: string
      chatId: string
      updatedAt: Date | null
    }> = []

    for (const [projectId, chat] of chatsByProject) {
      const project = projectsMap.get(projectId)
      if (!project) continue
      items.push({
        projectId,
        projectName: project.name,
        chatId: chat.id,
        updatedAt: chat.updatedAt,
      })
    }

    // Also include projects with no chats
    for (const project of projects) {
      if (!chatsByProject.has(project.id)) {
        items.push({
          projectId: project.id,
          projectName: project.name,
          chatId: "",
          updatedAt: project.updatedAt,
        })
      }
    }

    items.sort((a, b) => {
      const aTime = a.updatedAt?.getTime() ?? 0
      const bTime = b.updatedAt?.getTime() ?? 0
      return bTime - aTime
    })

    return items
  }, [projects, allChats])

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

  const handleCreateProject = async () => {
    if (!projectName.trim()) return
    setCreateError(null)
    try {
      const project = await createFromTemplate.mutateAsync({ name: projectName.trim() })
      if (!project) return

      utils.projects.list.setData(undefined, (oldData) => {
        if (!oldData) return [project]
        return [project, ...oldData]
      })

      const chatResult = await createForNewProject.mutateAsync({ projectId: project.id })

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
      setSelectedChatId(chatResult.id)
      setDesktopView(null)
    } catch (err: any) {
      setCreateError(err.message || "Failed to create project")
    }
  }

  const handleOpenSettings = () => {
    setDesktopView("settings")
  }

  return (
    <div className="h-full flex flex-col items-center bg-background select-none overflow-y-auto">
      <div className="w-full max-w-[480px] px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-semibold">Projects</h1>
          <button
            onClick={handleOpenSettings}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-foreground/10 transition-colors"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* New Project */}
        {showCreate ? (
          <div className="mb-3 space-y-2">
            <div className="relative">
              <Input
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value)
                  setCreateError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && projectName.trim()) handleCreateProject()
                  if (e.key === "Escape") {
                    setShowCreate(false)
                    setProjectName("")
                    setCreateError(null)
                  }
                }}
                placeholder="Project name"
                className="h-8 text-sm pr-8"
                autoFocus
                disabled={isCreating}
              />
              {isCreating && (
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <IconSpinner className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            {createError && (
              <p className="text-xs text-destructive">{createError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Press Enter to create, Escape to cancel
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full h-8 mb-3 px-3 flex items-center gap-2 rounded-md text-sm text-muted-foreground hover:bg-foreground/5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </button>
        )}

        {/* Divider */}
        <div className="h-px bg-border mb-1" />

        {/* Project list */}
        {filteredItems.length === 0 && !showCreate ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "No projects match your search" : "No projects yet"}
            </p>
            {!search && (
              <button
                onClick={() => setShowCreate(true)}
                className="h-8 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97]"
              >
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredItems.map((item) => (
              <button
                key={item.projectId}
                onClick={() => handleSelectProject(item)}
                className="w-full h-9 px-3 flex items-center gap-2.5 rounded-md hover:bg-foreground/5 transition-colors group"
              >
                <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate flex-1 text-left">
                  {item.projectName}
                </span>
                {item.updatedAt && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTimeAgo(item.updatedAt)}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
