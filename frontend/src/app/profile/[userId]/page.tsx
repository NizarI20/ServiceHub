'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import SkillCard from '@/components/profile/SkillCard';
import PortfolioCard from '@/components/profile/PortfolioCard';
import { fetchSellerProfile } from '@/lib/api';
import { ISellerProfile } from '@/types';
import Image from 'next/image';

export default function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<ISellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchSellerProfile(userId as string);
        setProfile(data);
      } catch (err) {
        setError('Impossible de charger le profil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow justify-center items-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Erreur</h2>
          <p>{error}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profil non trouvé</h2>
          <p>Le profil que vous recherchez n'existe pas.</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <ProfileHeader profile={profile} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2">
              {/* À propos */}
              <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4">À propos</h2>
                <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
              </section>

              {/* Expériences */}
              <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4">Expériences</h2>
                {profile.experiences.length > 0 ? (
                  <div className="space-y-6">
                    {profile.experiences.map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="text-lg font-semibold">{exp.title}</h3>
                        <p className="text-gray-600">{exp.company} • {exp.location}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - 
                          {exp.current ? ' Présent' : new Date(exp.endDate!).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </p>
                        <p className="mt-2 text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune expérience ajoutée</p>
                )}
              </section>

              {/* Portfolio */}
              <PortfolioCard items={profile.portfolio} />

              {/* Éducation */}
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Formation</h2>
                {profile.education.length > 0 ? (
                  <div className="space-y-6">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <h3 className="text-lg font-semibold">{edu.degree} en {edu.field}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-gray-500 text-sm">
                          {new Date(edu.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - 
                          {edu.current ? ' Présent' : new Date(edu.endDate!).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune formation ajoutée</p>
                )}
              </section>
            </div>

            {/* Barre latérale */}
            <div>
              {/* Coordonnées */}
              <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">Contact</h2>
                <div className="space-y-3">
                  <p className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <a href={`mailto:${profile.contactEmail}`} className="text-blue-600 hover:underline">{profile.contactEmail}</a>
                  </p>
                  {profile.phone && (
                    <p className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <a href={`tel:${profile.phone}`} className="text-blue-600 hover:underline">{profile.phone}</a>
                    </p>
                  )}
                  {profile.website && (
                    <p className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                      </svg>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.website}</a>
                    </p>
                  )}
                  {profile.location && (
                    <p className="flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{profile.location}</span>
                    </p>
                  )}
                </div>
              </section>

              {/* Compétences */}
              <SkillCard skills={profile.skills} />

              {/* Langues */}
              <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">Langues</h2>
                {profile.languages && profile.languages.length > 0 ? (
                  <div className="space-y-3">
                    {profile.languages.map((lang, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{lang.language}</span>
                        <span className="text-gray-600">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucune langue spécifiée</p>
                )}
              </section>

              {/* Disponibilité */}
              <section className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-bold mb-4">Disponibilité</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Statut</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${profile.availability === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {profile.availability || 'Non spécifié'}
                    </span>
                  </div>
                  {profile.ratePerHour && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Tarif horaire</span>
                      <span className="text-gray-700 font-semibold">{profile.ratePerHour}€/h</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Réseaux sociaux */}
              {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
                <section className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold mb-4">Réseaux sociaux</h2>
                  <div className="flex flex-wrap gap-4">
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-900">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </a>
                    )}
                    {profile.socialLinks.instagram && (
                      <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}