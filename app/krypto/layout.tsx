import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Krypto",
  description:
    "A math puzzle game - use all 5 numbers with operations to reach the target!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Krypto",
  },
  icons: {
    icon: "/icons/icon.png",
    apple: "/icons/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f2937",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function KryptoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered:', registration.scope);
                  })
                  .catch((error) => {
                    console.log('SW registration failed:', error);
                  });
              });
            }
          `,
        }}
      />
      {children}
    </>
  );
}
