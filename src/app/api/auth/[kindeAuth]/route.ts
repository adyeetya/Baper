import { handleAuth } from '@kinde-oss/kinde-auth-nextjs/server'
import { log } from 'console'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: any) {
  log(params)
  const endpoint = params.kindeAuth
  return handleAuth(request, endpoint)
}
