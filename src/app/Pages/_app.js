// /pages/_app.js
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/globals.css'; // Optional if you have your own CSS

import '../styles/main.css';
import '../styles/index4.css';
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
                                                      