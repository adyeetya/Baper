import { AppRouter } from '@/src/trpc/index'
// import { AppRouter } from '@/trpc'
//this is what he used in course but here it was throwing error so if something related to this doesnt work try this
import { createTRPCReact } from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>({})
