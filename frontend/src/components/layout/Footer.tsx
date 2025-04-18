import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} SellerProfile. Tous droits réservés.</p>
          <div className="mt-4 md:mt-0">
            <a href="#" className="text-gray-300 hover:text-white mx-2">Mentions légales</a>
            <a href="#" className="text-gray-300 hover:text-white mx-2">Confidentialité</a>
            <a href="#" className="text-gray-300 hover:text-white mx-2">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;