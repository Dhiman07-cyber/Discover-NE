import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="icon" href="/assets/placeholder-hero.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      </body>
    </Html>
  );
}