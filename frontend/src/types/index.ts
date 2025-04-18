export interface Experience {
    _id?: string;
    title: string;
    company: string;
    location: string;
    startDate: string | Date;
    endDate?: string | Date;
    current: boolean;
    description: string;
  }
  
  export interface Skill {
    _id?: string;
    name: string;
    level: number; // 1-5
  }
  
  export interface PortfolioItem {
    _id?: string;
    title: string;
    description: string;
    imageUrl: string;
    tags: string[];
    projectUrl?: string;
  }
  
  export interface Education {
    _id?: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string | Date;
    endDate?: string | Date;
    current: boolean;
  }
  
  export interface Language {
    _id?: string;
    name: string;
    level: string;
  }
  
  export interface SocialLinks {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  }
  
  export interface ISellerProfile {
    _id?: string;
    userId: string;
    name: string;
    title: string;
    bio: string;
    profileImage: string;
    contactEmail: string;
    phone?: string;
    location: string;
    socialLinks: SocialLinks;
    experiences: Experience[];
    skills: Skill[];
    portfolio: PortfolioItem[];
    education: Education[];
    languages: Language[];
    availability: string;
    hourlyRate?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }