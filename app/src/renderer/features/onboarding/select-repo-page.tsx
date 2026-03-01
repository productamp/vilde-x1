"use client"

import { useState } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { ChevronLeft } from "lucide-react"

import { IconSpinner, GitHubIcon, PlusIcon } from "../../components/ui/icons"
import { Logo } from "../../components/ui/logo"
import { Input } from "../../components/ui/input"
import { trpc } from "../../lib/trpc"
import { selectedProjectAtom, selectedAgentChatIdAtom, lastSelectedWorkModeAtom } from "../agents/atoms"
import { productVibeModeAtom } from "../../lib/product-vibe"

export function SelectRepoPage() {
  const [, setSelectedProject] = useAtom(selectedProjectAtom)
  const [, setSelectedChatId] = useAtom(selectedAgentChatIdAtom)
  const setWorkMode = useSetAtom(lastSelectedWorkModeAtom)
  const productVibeMode = useAtomValue(productVibeModeAtom)
  const [showClonePage, setShowClonePage] = useState(false)
  const [showCreatePage, setShowCreatePage] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [githubUrl, setGithubUrl] = useState("")

  // Get tRPC utils for cache management
  const utils = trpc.useUtils()

  // Open folder mutation
  const openFolder = trpc.projects.openFolder.useMutation({
    onSuccess: (project) => {
      if (project) {
        // Optimistically update the projects list cache
        utils.projects.list.setData(undefined, (oldData) => {
          if (!oldData) return [project]
          const exists = oldData.some((p) => p.id === project.id)
          if (exists) {
            return oldData.map((p) =>
              p.id === project.id ? { ...p, updatedAt: project.updatedAt } : p
            )
          }
          return [project, ...oldData]
        })

        setSelectedProject({
          id: project.id,
          name: project.name,
          path: project.path,
          gitRemoteUrl: project.gitRemoteUrl,
          gitProvider: project.gitProvider as
            | "github"
            | "gitlab"
            | "bitbucket"
            | null,
          gitOwner: project.gitOwner,
          gitRepo: project.gitRepo,
        })
      }
    },
  })

  // Clone from GitHub mutation
  const cloneFromGitHub = trpc.projects.cloneFromGitHub.useMutation({
    onSuccess: (project) => {
      if (project) {
        utils.projects.list.setData(undefined, (oldData) => {
          if (!oldData) return [project]
          const exists = oldData.some((p) => p.id === project.id)
          if (exists) {
            return oldData.map((p) =>
              p.id === project.id ? { ...p, updatedAt: project.updatedAt } : p
            )
          }
          return [project, ...oldData]
        })

        setSelectedProject({
          id: project.id,
          name: project.name,
          path: project.path,
          gitRemoteUrl: project.gitRemoteUrl,
          gitProvider: project.gitProvider as
            | "github"
            | "gitlab"
            | "bitbucket"
            | null,
          gitOwner: project.gitOwner,
          gitRepo: project.gitRepo,
        })
        setShowClonePage(false)
        setGithubUrl("")
      }
    },
  })

  const handleOpenFolder = async () => {
    await openFolder.mutateAsync()
  }

  const handleCloneFromGitHub = async () => {
    if (!githubUrl.trim()) return
    await cloneFromGitHub.mutateAsync({ repoUrl: githubUrl.trim() })
  }

  // Create from template mutation
  const createFromTemplate = trpc.projects.createFromTemplate.useMutation()
  const createForNewProject = trpc.chats.createForNewProject.useMutation()

  const [createError, setCreateError] = useState<string | null>(null)

  const handleCreateProject = async () => {
    if (!projectName.trim()) return
    setCreateError(null)
    try {
      const project = await createFromTemplate.mutateAsync({ name: projectName.trim() })
      if (!project) return

      // Update projects list cache
      utils.projects.list.setData(undefined, (oldData) => {
        if (!oldData) return [project]
        return [project, ...oldData]
      })

      // Create first chat for the project
      const chatResult = await createForNewProject.mutateAsync({ projectId: project.id })

      // Navigate: set work mode to local, select project, select chat
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
    } catch (err: any) {
      setCreateError(err.message || "Failed to create project")
    }
  }

  const isCreating = createFromTemplate.isPending || createForNewProject.isPending

  const handleBack = () => {
    if (cloneFromGitHub.isPending || isCreating) return
    setShowClonePage(false)
    setShowCreatePage(false)
    setGithubUrl("")
    setProjectName("")
    setCreateError(null)
  }

  // Create new project page
  if (showCreatePage) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
        <div
          className="fixed top-0 left-0 right-0 h-10"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        />
        <button
          onClick={handleBack}
          disabled={isCreating}
          className="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="w-full max-w-[440px] space-y-8 px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mx-auto w-max">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <Logo className="w-6 h-6" fill="white" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-semibold tracking-tight">
                Create new project
              </h1>
              <p className="text-sm text-muted-foreground">
                Give your website a name to get started
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value)
                  setCreateError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && projectName.trim()) {
                    handleCreateProject()
                  }
                }}
                placeholder="My Website"
                className="text-center pr-10"
                autoFocus
                disabled={isCreating}
              />
              {isCreating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <IconSpinner className="h-4 w-4" />
                </div>
              )}
            </div>
            {createError && (
              <p className="text-xs text-destructive text-center">{createError}</p>
            )}
            <p className="text-xs text-muted-foreground text-center">
              Example: My Yoga Studio, Coffee Shop, Portfolio
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Clone from GitHub page
  if (showClonePage) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
        {/* Draggable title bar area */}
        <div
          className="fixed top-0 left-0 right-0 h-10"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        />

        {/* Back button */}
        <button
          onClick={handleBack}
          disabled={cloneFromGitHub.isPending}
          className="fixed top-12 left-4 flex items-center justify-center h-8 w-8 rounded-full hover:bg-foreground/5 transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="w-full max-w-[440px] space-y-8 px-4">
          {/* Header with dual icons */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 p-2 mx-auto w-max rounded-full border border-border">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Logo className="w-5 h-5" fill="white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                <GitHubIcon className="w-5 h-5 text-background" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-base font-semibold tracking-tight">
                Clone from GitHub
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter a repository URL or owner/repo
              </p>
            </div>
          </div>

          {/* Input */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && githubUrl.trim()) {
                    handleCloneFromGitHub()
                  }
                }}
                placeholder="owner/repo"
                className="text-center pr-10"
                autoFocus
                disabled={cloneFromGitHub.isPending}
              />
              {cloneFromGitHub.isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <IconSpinner className="h-4 w-4" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Example: facebook/react or https://github.com/facebook/react
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Main select repo page
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background select-none">
      {/* Draggable title bar area */}
      <div
        className="fixed top-0 left-0 right-0 h-10"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      />

      <div className="w-full max-w-[440px] space-y-8 px-4">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mx-auto w-max">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Logo className="w-6 h-6" fill="white" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-base font-semibold tracking-tight">
              {productVibeMode ? "Get started" : "Select a repository"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {productVibeMode
                ? "Create a new website or open an existing project"
                : "Choose a local folder to start working with"}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {productVibeMode && (
            <button
              onClick={() => setShowCreatePage(true)}
              className="w-full h-8 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Create new project
            </button>
          )}
          <button
            onClick={handleOpenFolder}
            disabled={openFolder.isPending}
            className={`w-full h-8 px-4 rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              productVibeMode
                ? "bg-muted text-foreground hover:bg-muted/80 shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.06)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.14)]"
            }`}
          >
            {openFolder.isPending ? (
              <IconSpinner className="h-4 w-4" />
            ) : (
              "Select folder"
            )}
          </button>
          <button
            onClick={() => setShowClonePage(true)}
            disabled={cloneFromGitHub.isPending}
            className="w-full h-8 px-4 bg-muted text-foreground rounded-lg text-sm font-medium transition-[background-color,transform] duration-150 hover:bg-muted/80 active:scale-[0.97] shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.06)] dark:shadow-[0_0_0_0.5px_rgb(23,23,23),inset_0_0_0_1px_rgba(255,255,255,0.06)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {cloneFromGitHub.isPending ? (
              <IconSpinner className="h-4 w-4" />
            ) : (
              "Clone from GitHub"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
