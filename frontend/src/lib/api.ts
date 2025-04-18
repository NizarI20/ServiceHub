import { ISellerProfile } from '@/types';

// Données de test
const sampleProfile: ISellerProfile = {
  userId: 'user-123',
  name: 'Sophie Martin',
  title: 'Développeuse Full Stack JavaScript',
  bio: `Développeuse passionnée avec plus de 6 ans d'expérience dans la création d'applications web et mobiles. Spécialisée dans les technologies JavaScript modernes (React, Node.js, Vue.js).

J'accompagne les entreprises dans la transformation de leurs idées en solutions numériques sur mesure, en privilégiant les interfaces utilisateur intuitives et les architectures robustes.`,
  profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
  contactEmail: 'contact@sophiemartin.dev',
  phone: '+33 6 12 34 56 78',
  location: 'Lyon, France',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/sophie-martin',
    twitter: 'https://twitter.com/sophiemdev',
    github: 'https://github.com/sophiemart',
    website: 'https://sophiemartin.dev'
  },
  experiences: [
    {
      title: 'Développeuse Full Stack Senior',
      company: 'TechSolutions SAS',
      location: 'Lyon, France',
      startDate: '2021-03-01',
      current: true,
      description: 'Conception et développement d\'applications web pour des clients grands comptes. Chef de projets techniques sur des solutions e-commerce et SaaS. Technologies: React, Node.js, GraphQL, MongoDB.'
    },
    {
      title: 'Développeuse Frontend',
      company: 'WebAgency',
      location: 'Paris, France',
      startDate: '2018-06-01',
      endDate: '2021-02-28',
      current: false,
      description: 'Développement d\'interfaces utilisateur modernes et responsives. Refonte complète du site e-commerce principal de l\'entreprise. Technologies: Vue.js, Nuxt.js, SCSS.'
    }
  ],
  skills: [
    { name: 'React', level: 5 },
    { name: 'Node.js', level: 4 },
    { name: 'TypeScript', level: 4 },
    { name: 'MongoDB', level: 3 },
    { name: 'GraphQL', level: 4 },
    { name: 'Docker', level: 3 },
    { name: 'AWS', level: 3 }
  ],
  portfolio: [
    {
      title: 'E-commerce pour artisans locaux',
      description: 'Plateforme permettant aux artisans de vendre leurs créations en ligne, avec gestion des paiements et des livraisons.',
      imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      projectUrl: 'https://artisans-marketplace.example.com'
    },
    {
      title: 'Application de gestion de tâches',
      description: 'Application web et mobile de gestion de projets collaboratifs avec tableaux kanban et gestion du temps.',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
      tags: ['React Native', 'Firebase', 'Redux'],
      projectUrl: 'https://taskflow.example.com'
    },
    {
      title: 'Dashboard analytique',
      description: 'Interface d\'administration pour visualiser les données d\'utilisation d\'une application SaaS avec graphiques interactifs.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      tags: ['Vue.js', 'D3.js', 'Express'],
      projectUrl: 'https://analytics-dashboard.example.com'
    }
  ],
  education: [
    {
      institution: 'Université Claude Bernard Lyon 1',
      degree: 'Master',
      field: 'Informatique - Développement Web',
      startDate: '2016-09-01',
      endDate: '2018-06-30',
      current: false
    },
    {
      institution: 'IUT Lyon 1',
      degree: 'DUT',
      field: 'Informatique',
      startDate: '2014-09-01',
      endDate: '2016-06-30',
      current: false
    }
  ],
  languages: [
    { name: 'Français', level: 'Natif' },
    { name: 'Anglais', level: 'Courant' },
    { name: 'Espagnol', level: 'Intermédiaire' }
  ],
  availability: 'Disponible pour des missions freelance à partir de juin 2025',
  hourlyRate: 75
};

// Simuler un délai réseau
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fonctions API simulées
export const fetchSellerProfile = async (userId: string): Promise<ISellerProfile> => {
  await delay(800); // Simule un délai réseau
  
  if (userId === 'user-123') {
    return sampleProfile;
  }
  
  throw new Error('Profil non trouvé');
};

export const createSellerProfile = async (profileData: Partial<ISellerProfile>): Promise<ISellerProfile> => {
  await delay(1000);
  console.log('Profil créé:', profileData);
  return {
    ...sampleProfile,
    ...profileData,
    _id: 'new-profile-id',
    createdAt: new Date().toISOString()
  };
};

export const updateSellerProfile = async (userId: string, profileData: Partial<ISellerProfile>): Promise<ISellerProfile> => {
  await delay(1000);
  console.log('Profil mis à jour:', profileData);
  return {
    ...sampleProfile,
    ...profileData,
    updatedAt: new Date().toISOString()
  };
};
