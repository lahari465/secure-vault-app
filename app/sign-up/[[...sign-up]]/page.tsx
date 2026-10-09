import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex justify-center items-center py-16 px-4'>
      <SignUp path='/sign-up' routing='path' signInUrl='/sign-in' fallbackRedirectUrl='/' />
    </div>
  )
}
