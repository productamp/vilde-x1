import { eq } from "drizzle-orm"
import { z } from "zod"
import { chats, getDatabase } from "../../db"
import { ensurePreviewServer } from "../../preview/preview-server"
import { publicProcedure, router } from "../index"

export const previewRouter = router({
  ensureForChat: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ input }) => {
      const db = getDatabase()
      const chat = db
        .select({
          id: chats.id,
          worktreePath: chats.worktreePath,
        })
        .from(chats)
        .where(eq(chats.id, input.chatId))
        .get()

      if (!chat) {
        throw new Error("Chat not found")
      }

      if (!chat.worktreePath) {
        throw new Error("Chat has no local workspace")
      }

      return await ensurePreviewServer(chat.worktreePath)
    }),
})
