import { useSession, signIn, signOut } from "next-auth/react"

export default function Header() {

  const { data: session } = useSession()
  return (
    <div className="sticky top-0">
      {
        session ?
          <>
            Signed in as {session.user!.email} <br />
            <button onClick={() => signOut()}>Sign out</button>
          </>
          :
          <>Not signed in <br />
            <button onClick={() => signIn()}>Sign in</button>
          </>
      }
    </div>
  )
}
