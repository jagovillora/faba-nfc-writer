import './globals.css';

export const metadata = {
  title: 'FABA NFC Writer',
  description: 'Graba etiquetas NFC para tu FABA',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
