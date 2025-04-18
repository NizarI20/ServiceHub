import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            SellerProfile
          </Link>
          <nav className="space-x-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600">
              Accueil
            </Link>
            <Link href="/profile/user-123" className="text-gray-600 hover:text-blue-600">
              Voir profil
            </Link>
            <Link href="/profile/edit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Éditer profil
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;