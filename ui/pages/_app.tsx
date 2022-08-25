import '../styles/globals.scss';
import '../styles/tooltip.scss';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps}></Component>;
}

export default MyApp;
