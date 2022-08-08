import { IconButton, Paper, useTheme, Box} from "@mui/material"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useContext } from "react";
import { ColorModeContext } from "../pages/_app";
import { trpc } from "../utils/trpc";

export default function Header() {

  const { data } = trpc.useQuery(["settings.get-gmail-email"]);

  // get current page
  const { pathname } = useRouter()
  const { data: session } = useSession()

  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  // check if user email is different from gmail configuration
  const diffMails = data?.email ? (session?.user!.email != data?.email) : false

  return (
    <Paper elevation={2} className="flex justify-between items-center sticky top-0 p-4 z-10">
      {
        session ?
          <div className="flex flex-col">
            <div>Zalogowano jako {session.user!.email}</div>
            {diffMails && <Box sx={{ color: 'text.secondary' }} className="italic text-xs">Wysyłanie maili jako {data?.email}</Box>}
          </div>
          :
          <>
            Nie zalogowano
          </>
      }

      {
        pathname === "/" || 
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href={"/"}>
            <a className="text-3xl leading-normal font-extrabold drop-shadow-xl">
              Mail<span className="text-purple-400">Merge</span>
            </a>
          </Link>
        </div>
      }
      
      <div className="flex items-center gap-8">
        <IconButton onClick={colorMode.toggleColorMode} color="inherit" size="small">
          {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

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
    </Paper>
  )
}
