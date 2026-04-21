import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport" />
        <meta content="Leet App" name="apple-mobile-web-app-title" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
        <meta content="#F7F8FC" name="theme-color" />
        <meta content="light dark" name="color-scheme" />
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
            background: #F7F8FC;
          }

          @media (prefers-color-scheme: dark) {
            html, body {
              background: #0B1020;
            }
          }

          *,
          *::before,
          *::after {
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
          }

          @media (hover: none) and (pointer: coarse) {
            a:focus,
            button:focus,
            input:focus,
            select:focus,
            textarea:focus,
            [role="button"]:focus {
              outline: none !important;
              box-shadow: none !important;
            }
          }
        `}</style>
      </head>
      <body>
        {children}
        <ScrollViewStyleReset />
      </body>
    </html>
  );
}
