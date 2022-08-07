import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Header() {

  // get current page
  const { pathname } = useRouter()

  const { data: session } = useSession()
  return (
    <div className="flex justify-between items-center sticky top-0 p-4 bg-stone-200 z-10">
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

      {
        pathname === "/" || 
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href={"/"}>
            <a className="text-2xl leading-normal font-extrabold text-gray-700 drop-shadow-xl">
              Mail<span className="text-purple-400">Merge</span>
            </a>
          </Link>
        </div>
      }
      

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
