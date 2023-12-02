// in next js this is how we create a new page cause this is a multi page application
// we create a new folder in app here dashboard in that we make a file page.tsx specifically in here we put the content of the dashboard page
//this is the server side comp for dashboard url /dashboard the client side is in the components folder
import Dashboard from '@/src/components/Dashboard'
import { db } from '@/src/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'

const Page = async () => {
  // console.log('from server')

  // here we are getting the user from the kinde
  const { getUser } =await getKindeServerSession()
  const user = await getUser()
  // console.log(user.email)

  //this is to check if the user is not signed in through kinde  
  //if they are not we redirect them to the auth-callback
  if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

  // now we are cheking if the user is synced in the db or not 
  // we are finding a user whose id is equal to the kinde users id 
  // this is checked after they are signed in so we have their id 

const dbUser = await db.user.findFirst({
  where:{
    id: user.id
  }
})

// if they are not synced we redirect again to the auth-callback
if(!dbUser) redirect('/auth-callback?origin=dashboard')

// if everything is right we show the dashboard component
  return <Dashboard />
}

export default Page