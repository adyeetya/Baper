import React from 'react'
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'
import { buttonVariants } from '../components/ui/button'
import {
  LoginLink,
  RegisterLink,
  getKindeServerSession,
} from '@kinde-oss/kinde-auth-nextjs/server'
import { ArrowRight } from 'lucide-react'
import UserAccountNav from './UserAccountNav'

const Navbar = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  // console.log(user?.email, user?.given_name)

  return (
    //the inset-x-0 class sets both left and right properties to 0, ensuring that the element is horizontally centered within its containing element.
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14  items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-bold">
            {' '}
            <span className="text-xl">
              <span className="text-blue-600">b</span>a
              <span className="text-blue-600">p</span>er.
            </span>
          </Link>

          {/* todo- add mobile navbar */}

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  Pricing
                </Link>

                <LoginLink
                  postLoginRedirectURL="/dashboard"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  Sign In
                </LoginLink>

                <RegisterLink
                  className={buttonVariants({
                    size: 'sm',
                  })}
                >
                  Get Started <ArrowRight className="ml-1.5 h-5 w-5" />
                </RegisterLink>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: 'ghost',
                    size: 'sm',
                  })}
                >
                  Dashboard
                </Link>
                <UserAccountNav
                  name={
                    !user.given_name || !user.family_name
                      ? 'Your Account'
                      : user.given_name
                      ? user.given_name
                      : user.family_name
                  }
                  email={user.email ?? ''}
                  imageUrl={user.picture ?? ''}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar
