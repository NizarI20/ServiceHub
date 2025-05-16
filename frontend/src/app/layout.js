// src/app/layout.js
export const metadata = {
    title: 'Mon Profil Vendeur',
  };
  
  export default function RootLayout({ children }) {
    return (
      <html lang="fr">
        <body suppressHydrationWarning>{children}</body>
      </html>
    );
  }
  