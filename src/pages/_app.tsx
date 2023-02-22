import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import AuthProviderWrapper from "@/components/AuthProviderWrapper";

export default function App({ Component, pageProps }: AppProps) {
  return <AuthProviderWrapper>
    <Component {...pageProps} />
  </AuthProviderWrapper>
}
