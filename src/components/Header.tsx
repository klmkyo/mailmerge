import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function Header() {

  const { data: session } = useSession()
  return (
    <div className="flex justify-between sticky top-0 p-4 bg-stone-200">
      {
        session ?
          <>
            Signed in as {session.user!.email}
          </>
          :
          <>
            Not signed in
          </>
      }

      <div className="absolute left-1/2 -translate-x-1/2">
        <Link href={"/"}>
          Strona Główna
        </Link>
      </div>

      {
        session ?
          <>
            <button onClick={() => signOut()}>Sign out</button>
          </>
          :
          <>
            <button onClick={() => signIn()}>Sign in</button>
          </>
      }
    </div>
  )
}
