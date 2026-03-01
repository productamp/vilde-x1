import { eq } from "drizzle-orm"
import { z } from "zod"
import { chats, getDatabase } from "../../db"
import { ensurePreviewServer } from "../../preview/preview-server"
import { ensureViteDevServer, hasViteConfig, isViteServerAlive } from "../../preview/vite-dev-server"
import { publicProcedure, router } from "../index"

async function resolvePreview(chatId: string) {
  const db = getDatabase()
  const chat = db
    .select({
      id: chats.id,
      worktreePath: chats.worktreePath,
    })
    .from(chats)
    .where(eq(chats.id, chatId))
    .get()

  if (!chat) {
    throw new Error("Chat not found")
  }

  if (!chat.worktreePath) {
    throw new Error("Chat has no local workspace")
  }

  if (await hasViteConfig(chat.worktreePath)) {
    return await ensureViteDevServer(chat.worktreePath)
  }

  return await ensurePreviewServer(chat.worktreePath)
}

export const previewRouter = router({
  ensureForChat: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ input }) => {
      return await resolvePreview(input.chatId)
    }),

  ensureServerAlive: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDatabase()
      const chat = db
        .select({ worktreePath: chats.worktreePath })
        .from(chats)
        .where(eq(chats.id, input.chatId))
        .get()

      if (!chat?.worktreePath) {
        throw new Error("Chat has no local workspace")
      }

      // If the server is already alive, just return its info
      if (await hasViteConfig(chat.worktreePath) && isViteServerAlive(chat.worktreePath)) {
        return await ensureViteDevServer(chat.worktreePath)
      }

      // Server is dead or not tracked — ensure it starts
      return await resolvePreview(input.chatId)
    }),
})
