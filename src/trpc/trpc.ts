// this trpc folder essentially is equivalent to the server side of the app
// the index.ts is the main server
// this trpc.ts is the just to create a instance of the initTRPC using create()
// t is the instance of trpc then then we are just exporting t.router as router which is imported in the index

import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { TRPCError, initTRPC } from '@trpc/server'
/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create()
const middleware = t.middleware

const isAuth = middleware(async (opts) => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return opts.next({
    ctx: {
      userId: user.id,
      user,
    },
  })
})
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)
