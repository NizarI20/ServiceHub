'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchSellerProfile, updateSellerProfile } from '@/lib/api';
import { ISellerProfile, IExperience, IEducation, IPortfolioItem, ISkill, ILanguage } from '@/types';
import Image from 'next/image';

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ISellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // États pour chaque section à éditer
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    title: '',
    bio: '',
    contactEmail: '',
    phone: '',
    website: '',
    location: '',
    availability: 'Disponible',
    ratePerHour: '',
    avatarUrl: ''
  });

  const [experiences, setExperiences] = useState<IExperience[]>([]);
  const [education, setEducation] = useState<IEducation[]>([]);
  const [portfolio, setPortfolio] = useState<IPortfolioItem[]>([]);
  const [skills, setSkills] = useState<ISkill[]>([]);
  const [languages, setLanguages] = useState<ILanguage[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: '',
    instagram: ''
  });

  // États pour les formulaires d'ajout
  const [newExperience, setNewExperience] = useState<IExperience>({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const [newEducation, setNewEducation] = useState<IEducation>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false
  });

  const [newPortfolioItem, setNewPortfolioItem] = useState<IPortfolioItem>({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    tags: []
  });

  const [newSkill, setNewSkill] = useState<ISkill>({
    name: '',
    level: 'Débutant'
  });

  const [newLanguage, setNewLanguage] = useState<ILanguage>({
    language: '',
    proficiency: 'Débutant'
  });

  // Récupérer les données du profil actuel
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        // Utiliser l'ID de l'utilisateur connecté (à adapter selon votre système d'authentification)
        const currentUserId = localStorage.getItem('userId') || 'current-user';
        const data = await fetchSellerProfile(currentUserId);
        setProfile(data);
        
        // Initialiser tous les états avec les données récupérées
        setPersonalInfo({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          title: data.title || '',
          bio: data.bio || '',
          contactEmail: data.contactEmail || '',
          phone: data.phone || '',
          website: data.website || '',
          location: data.location || '',
          availability: data.availability || 'Disponible',
          ratePerHour: data.ratePerHour?.toString() || '',
          avatarUrl: data.avatarUrl || ''
        });
        
        setExperiences(data.experiences || []);
        setEducation(data.education || []);
        setPortfolio(data.portfolio || []);
        setSkills(data.skills || []);
        setLanguages(data.languages || []);
        setSocialLinks(data.socialLinks || {
          linkedin: '',
          github: '',
          twitter: '',
          instagram: ''
        });

      } catch (err) {
        setError('Impossible de charger le profil');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Fonction pour sauvegarder le profil complet
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const updatedProfile = {
        ...profile,
        ...personalInfo,
        experiences,
        education,
        portfolio,
        skills,
        languages,
        socialLinks,
        ratePerHour: personalInfo.ratePerHour ? parseFloat(personalInfo.ratePerHour) : undefined
      };
      
      // Utiliser l'ID de l'utilisateur connecté
      const currentUserId = localStorage.getItem('userId') || 'current-user';
      await updateSellerProfile(currentUserId, updatedProfile);
      
      setSuccessMessage('Profil mis à jour avec succès');
      
      // Faire disparaître le message de succès après 3 secondes
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Fonctions pour les expériences
  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company && newExperience.startDate) {
      setExperiences([...experiences, newExperience]);
      setNewExperience({
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      });
    }
  };

  const handleRemoveExperience = (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
  };

  // Fonctions pour l'éducation
  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree && newEducation.startDate) {
      setEducation([...education, newEducation]);
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        current: false
      });
    }
  };

  const handleRemoveEducation = (index: number) => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    setEducation(updatedEducation);
  };

  // Fonctions pour le portfolio
  const handleAddPortfolioItem = () => {
    if (newPortfolioItem.title && newPortfolioItem.description) {
      // Convertir les tags d'une chaîne à un tableau
      const tagList = newPortfolioItem.tags instanceof Array 
        ? newPortfolioItem.tags 
        : newPortfolioItem.tags?.split(',').map(tag => tag.trim()) || [];
      
      const itemWithTags = {
        ...newPortfolioItem,
        tags: tagList
      };
      
      setPortfolio([...portfolio, itemWithTags]);
      setNewPortfolioItem({
        title: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        tags: []
      });
    }
  };

  const handleRemovePortfolioItem = (index: number) => {
    const updatedPortfolio = [...portfolio];
    updatedPortfolio.splice(index, 1);
    setPortfolio(updatedPortfolio);
  };

  // Fonctions pour les compétences
  const handleAddSkill = () => {
    if (newSkill.name) {
      setSkills([...skills, newSkill]);
      setNewSkill({
        name: '',
        level: 'Débutant'
      });
    }
  };

  const handleRemoveSkill = (index: number) => {
    const updatedSkills = [...skills];
    updatedSkills.splice(index, 1);
    setSkills(updatedSkills);
  };

  // Fonctions pour les langues
  const handleAddLanguage = () => {
    if (newLanguage.language) {
      setLanguages([...languages, newLanguage]);
      setNewLanguage({
        language: '',
        proficiency: 'Débutant'
      });
    }
  };

  const handleRemoveLanguage = (index: number) => {
    const updatedLanguages = [...languages];
    updatedLanguages.splice(index, 1);
    setLanguages(updatedLanguages);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Éditer votre profil</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{successMessage}</p>
          </div>
        )}

        {/* Informations personnelles */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Informations personnelles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Prénom</label>
              <input
                type="text"
                value={personalInfo.firstName}
                onChange={(e) => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                value={personalInfo.lastName}
                onChange={(e) => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Titre professionnel</label>
              <input
                type="text"
                value={personalInfo.title}
                onChange={(e) => setPersonalInfo({...personalInfo, title: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="ex: Développeur Web Freelance"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">URL de l'avatar</label>
              <input
                type="text"
                value={personalInfo.avatarUrl}
                onChange={(e) => setPersonalInfo({...personalInfo, avatarUrl: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Bio</label>
              <textarea
                value={personalInfo.bio}
                onChange={(e) => setPersonalInfo({...personalInfo, bio: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                placeholder="Parlez de vous, de votre parcours et de vos compétences..."
              ></textarea>
            </div>
          </div>
        </section>

        {/* Coordonnées */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Coordonnées</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={personalInfo.contactEmail}
                onChange={(e) => setPersonalInfo({...personalInfo, contactEmail: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Site web</label>
              <input
                type="url"
                value={personalInfo.website}
                onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://www.monsite.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Localisation</label>
              <input
                type="text"
                value={personalInfo.location}
                onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Paris, France"
              />
            </div>
          </div>
        </section>

        {/* Disponibilité */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Disponibilité</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">Statut</label>
              <select
                value={personalInfo.availability}
                onChange={(e) => setPersonalInfo({...personalInfo, availability: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Disponible">Disponible</option>
                <option value="Indisponible">Indisponible</option>
                <option value="Disponible partiellement">Disponible partiellement</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Tarif horaire (€)</label>
              <input
                type="number"
                value={personalInfo.ratePerHour}
                onChange={(e) => setPersonalInfo({...personalInfo, ratePerHour: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="50"
              />
            </div>
          </div>
        </section>

        {/* Réseaux sociaux */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Réseaux sociaux</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">LinkedIn</label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) => setSocialLinks({...socialLinks, linkedin: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://www.linkedin.com/in/username"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">GitHub</label>
              <input
                type="url"
                value={socialLinks.github}
                onChange={(e) => setSocialLinks({...socialLinks, github: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://github.com/username"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Twitter</label>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://twitter.com/username"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="https://www.instagram.com/username"
              />
            </div>
          </div>
        </section>

        {/* Compétences */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Compétences</h2>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill, index) => (
                <div key={index} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                  <span className="mr-1">{skill.name}</span>
                  <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full">{skill.level}</span>
                  <button 
                    onClick={() => handleRemoveSkill(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Nouvelle compétence"
              />
            </div>
            
            <div>
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({...newSkill, level: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleAddSkill}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ajouter une compétence
          </button>
        </section>

        {/* Langues */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Langues</h2>
          
          <div className="mb-6">
            <div className="space-y-3 mb-4">
              {languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                  <div>
                    <span className="font-medium">{lang.language}</span>
                    <span className="text-gray-600 ml-2">({lang.proficiency})</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveLanguage(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newLanguage.language}
                onChange={(e) => setNewLanguage({...newLanguage, language: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Langue"
              />
            </div>
            
            <div>
              <select
                value={newLanguage.proficiency}
                onChange={(e) => setNewLanguage({...newLanguage, proficiency: e.target.value})}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Bilingue">Bilingue</option>
                <option value="Natif">Natif</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleAddLanguage}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ajouter une langue
          </button>
        </section>

        {/* Expériences */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Expériences professionnelles</h2>
          
          <div className="space-y-6 mb-8">
            {experiences.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{exp.title}</h3>
                    <p className="text-gray-600">{exp.company} • {exp.location}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - 
                      {exp.current ? ' Présent' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
                    </p>
                    <p className="mt-2 text-gray-700">{exp.description}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveExperience(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold mb-4">Ajouter une expérience</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Poste</label>
                <input
                  type="text"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Entreprise</label>
                <input
                  type="text"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Lieu</label>
                <input
                  type="text"
                  value={newExperience.location}
                  onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="currentJobCheckbox"
                  checked={newExperience.current}
                  onChange={(e) => setNewExperience({
                    ...newExperience, 
                    current: e.target.checked,
                    endDate: e.target.checked ? '' : newExperience.endDate
                  })}
                  className="mr-2"
                />
                <label htmlFor="currentJobCheckbox" className="text-gray-700">
                  Poste actuel
                </label>
              </div>
              
              {!newExperience.current && (
                <div>
                  <label className="block text-gray-700 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={newExperience.endDate}
                    onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    disabled={newExperience.current}
                  />
                </div>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                ></textarea>
              </div>
            </div>
            
            <button 
              onClick={handleAddExperience}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ajouter cette expérience
            </button>
          </div>
        </section>

        {/* Formation */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Formation</h2>
          
          <div className="space-y-6 mb-8">
            {education.map((edu, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{edu.degree} en {edu.field}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(edu.startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} - 
                      {edu.current ? ' Présent' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleRemoveEducation(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold mb-4">Ajouter une formation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Institution</label>
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
              <label className="block text-gray-700 mb-2">Diplôme</label>
                <input
                  type="text"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Domaine d'études</label>
                <input
                  type="text"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Date de début</label>
                <input
                  type="date"
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="currentEducationCheckbox"
                  checked={newEducation.current}
                  onChange={(e) => setNewEducation({
                    ...newEducation, 
                    current: e.target.checked,
                    endDate: e.target.checked ? '' : newEducation.endDate
                  })}
                  className="mr-2"
                />
                <label htmlFor="currentEducationCheckbox" className="text-gray-700">
                  Formation en cours
                </label>
              </div>
              
              {!newEducation.current && (
                <div>
                  <label className="block text-gray-700 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={newEducation.endDate}
                    onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    disabled={newEducation.current}
                  />
                </div>
              )}
            </div>
            
            <button 
              onClick={handleAddEducation}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ajouter cette formation
            </button>
          </div>
        </section>

        {/* Portfolio */}
        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {portfolio.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden shadow">
                {item.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.title} 
                      width={400} 
                      height={300} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                  {item.projectUrl && (
                    <a 
                      href={item.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Voir le projet
                    </a>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags?.map((tag, tagIndex) => (
                      <span key={tagIndex} className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button 
                    onClick={() => handleRemovePortfolioItem(index)}
                    className="mt-3 text-red-500 hover:text-red-700 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold mb-4">Ajouter un projet</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Titre du projet</label>
                <input
                  type="text"
                  value={newPortfolioItem.title}
                  onChange={(e) => setNewPortfolioItem({...newPortfolioItem, title: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">URL de l'image</label>
                <input
                  type="url"
                  value={newPortfolioItem.imageUrl}
                  onChange={(e) => setNewPortfolioItem({...newPortfolioItem, imageUrl: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">URL du projet</label>
                <input
                  type="url"
                  value={newPortfolioItem.projectUrl}
                  onChange={(e) => setNewPortfolioItem({...newPortfolioItem, projectUrl: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="https://example.com/project"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={newPortfolioItem.tags instanceof Array ? newPortfolioItem.tags.join(', ') : ''}
                  onChange={(e) => setNewPortfolioItem({
                    ...newPortfolioItem, 
                    tags: e.target.value.split(',').map(tag => tag.trim())
                  })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="React, NextJS, Tailwind"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                  value={newPortfolioItem.description}
                  onChange={(e) => setNewPortfolioItem({...newPortfolioItem, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                ></textarea>
              </div>
            </div>
            
            <button 
              onClick={handleAddPortfolioItem}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ajouter ce projet
            </button>
          </div>
        </section>

        {/* Boutons de sauvegarde */}
        <div className="flex justify-between mt-8">
          <button 
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded hover:bg-gray-400"
          >
            Annuler
          </button>
          
          <button 
            onClick={handleSaveProfile}
            disabled={saving}
            className={`bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer le profil'}
          </button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}