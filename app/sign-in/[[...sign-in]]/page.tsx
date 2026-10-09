import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex justify-center items-center py-16 px-4'>
      <SignIn path='/sign-in' routing='path' signUpUrl='/sign-up' fallbackRedirectUrl='/' />
    </div>
  )
}
