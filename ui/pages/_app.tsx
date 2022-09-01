import '../styles/globals.scss';
import '../styles/tooltip.scss';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps}></Component>;
}

export default MyApp;
