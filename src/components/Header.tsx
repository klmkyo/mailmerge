import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function Header() {

  const { data: session } = useSession()
  return (
    <div className="flex justify-between sticky top-0 p-4 bg-stone-200 z-10">
      {
        session ?
          <>
            Zalogowano jako {session.user!.email}
          </>
          :
          <>
            Nie zalogowano
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
            <button onClick={() => signOut()}>Wyloguj się</button>
          </>
          :
          <>
            <button onClick={() => signIn()}>Zaloguj się</button>
          </>
      }
    </div>
  )
}
