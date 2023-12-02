import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest } from 'next/server'

// export async function GET(request: NextRequest, { params }: any) {
//   const endpoint = params.kindeAuth
//   return handleAuth(request, endpoint)
// }

export async function GET(request: NextRequest, { params }: any) {
  try {
    const endpoint = params.kindeAuth
    return await handleAuth(request, endpoint)
  } catch (error) {
    console.error(error)

    return {
      status: 500,
      body: { error: 'Internal Server Error' },
    }
  }
}
