// src/pages/_app.tsx
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { loggerLink } from '@trpc/client/links/loggerLink';
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/dist/shared/lib/utils";
import { SnackbarProvider } from 'notistack';
import superjson from "superjson";
import Header from "../components/Header";
import type { AppRouter } from "../server/router";
import "../styles/globals.css";
import theme from '../styles/theme';
import {createContext, useState, useMemo} from "react";

export const ColorModeContext = createContext({ toggleColorMode: () => {} });

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
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