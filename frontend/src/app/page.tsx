import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Créez votre profil vendeur professionnel</h1>
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              Présentez vos compétences, vos expériences et votre portfolio pour attirer les meilleurs clients
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/profile/edit" 
                className="bg-white text-blue-700 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition-all"
              >
                Créer mon profil
              </Link>
              <Link 
                href="/profile/user-123" 
                className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-all"
              >
                Voir un exemple
              </Link>
            </div>
          </div>
        </section>
        
        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Comment ça fonctionne</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Créez votre profil</h3>
              <p className="text-gray-600">Ajoutez vos informations personnelles, compétences, expériences et réalisations.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Personnalisez votre portfolio</h3>
              <p className="text-gray-600">Mettez en avant vos meilleurs projets avec des images et descriptions détaillées.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-100 text-blue-600 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Partagez avec vos clients</h3>
              <p className="text-gray-600">Diffusez votre profil professionnel pour attirer de nouvelles opportunités.</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
