'use client'

import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { trpc } from '../app/_trpc/client'
import Link from 'next/link'

const UpgradeButton = () => {
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      console.log('url', url)
      window.location.href = url ?? '/dashboard/billing'
    },
  })

  return (
    <Link
      href="https://buy.stripe.com/test_eVa5lPeK34Fvbpm5kk"
      rel="noopener noreferrer"
      target="_blank"
    >
      <Button onClick={() => createStripeSession()} className="w-full">
        Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
      </Button>
    </Link>
  )
}

export default UpgradeButton
