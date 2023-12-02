// this is the main server
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { privateProcedure, publicProcedure, router } from './trpc'
import { TRPCError } from '@trpc/server'
import { db } from '../db'
import { z } from 'zod'
import { INFINITE_QUERY_LIMIT } from '../config/infinite-query'
// we are importing the router here from the trpc
// then using that router we are making and exporting the appRouter
// a router just like express is a way you can route different actions

// authCallback is an action here its called procedure or here publicProcedure
// there are two typeof action - procedure and publicProcedure public are allowed for every user with auth(i think)
// then there are 2 types in there .query and .mutation
// query is for getting data and mutation is for modifying data
// then the query returns something some data for ex - return { success: true }
// appRouter is imported in [trpc]/route.ts
// AppRouter is imported in _trpc/client.ts
export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id || !user.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    // check if the user is in the db
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    })

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      })
    }

    return { success: true }
  }),

  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx

    return await db.file.findMany({
      where: {
        userId,
      },
    })
  }),

  getFiles: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx
      const file = await db.file.findFirst({
        where: {
          key: input.key,
          userId,
        },
      })
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })
      return file
    }),

  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx

      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      })

      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      await db.file.delete({
        where: {
          id: input.id,
        },
      })

      return file
    }),

  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      })

      if (!file) return { status: 'PENDING' as const }

      return { status: file.uploadStatus }
    }),

  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx
      const { fileId, cursor } = input
      const limit = input.limit ?? INFINITE_QUERY_LIMIT

      const file = await db.message.findMany({
        where: {
          id: fileId,
          userId,
        },
      })
      if (!file) throw new TRPCError({ code: 'NOT_FOUND' })

      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      })
      let nextCursor: typeof cursor | undefined = undefined

      if (messages.length > limit) {
        const nextItem = messages.pop()
        nextCursor = nextItem?.id
      }
      return {
        messages,
        nextCursor,
      }
    }),
})

export type AppRouter = typeof appRouter
// APPRouter is just a type i think which is the type of appRouter which is a very complex type
