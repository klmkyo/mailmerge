// src/pages/_app.tsx
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { loggerLink } from '@trpc/client/links/loggerLink';
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/dist/shared/lib/utils";
import { SnackbarProvider } from 'notistack';
import { createContext, useEffect, useMemo, useState } from "react";
import superjson from "superjson";
import Header from "../components/Header";
import type { AppRouter } from "../server/router";
import "../styles/globals.css";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = (prevMode === 'light' ? 'dark' : 'light');
          if(window){
            localStorage.setItem('theme-preference', newMode);
          }
          return newMode;
        });
      },
    }),
    [],
  );

  useEffect(() => {
    const localMode = localStorage.getItem('theme-preference');
    if( localMode && (localMode !== mode) ){
      setMode(localMode as 'light' | 'dark');
    }
  }, [mode, setMode])

  const theme = useMemo(
    () =>
      createTheme({
        typography: {
          subtitle1: {
            fontSize: 14,
          },
        },      
        palette: {
          ...(mode === 'light'
          ? {
              // palette values for light mode
            primary: {
              main: '#954be3',
            },
            secondary: {
              main: '#c796fa',
            },
            }
          : {
              // palette values for dark mode
              primary: {
                main: '#954be3',
              },
              secondary: {
                main: '#bb84f5',
              },
            }),
          mode,
        },
      }),
    [mode],
  );

  return (
    <SessionProvider session={session}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <SnackbarProvider>
            <CssBaseline />
            <Header />
            <Component {...pageProps} />
          </SnackbarProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </SessionProvider>
  );
};

export const DEPLOY_URL = "https://mailmerge.vercel.app";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) return `https://mailmerge.vercel.app`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    const links = [
      loggerLink(),
      httpBatchLink({
        maxBatchSize: 10,
        url
      })
    ]

    return {
      url,
      transformer: superjson,
      links
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
