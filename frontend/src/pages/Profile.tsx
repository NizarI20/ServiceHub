'use client';

import React, { useState, useEffect, ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import axios from 'axios';
//import "../style.css";

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  show: boolean;
  message: string;
  type: NotificationType;
}

interface FormDataState {
  name: string;
  title: string;
  summary: string;
  profilePhotoURL?: string;
  experiences: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: string[];
  portfolio: {
    title: string;
    description: string;
    link: string;
    image: string;
  }[];
}

interface FormErrors {
  name?: string;
  title?: string;
  about?: string;
}

export default function ProfilePage() {
  // Form state management
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    title: '',
    summary: '',
    experiences: [{
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    }],
    skills: [],
    portfolio: [{
      title: '',
      description: '',
      link: '',
      image: ''
    }]
  });
  
  // UI state
  const [skillInput, setSkillInput] = useState<string>('');
  const [notification, setNotification] = useState<Notification>({ show: false, message: '', type: 'info' });
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Track form changes
  useEffect(() => {
    setHasChanges(true);
  }, [formData]);

  // Handle form field changes
  const handleChange = (field: keyof FormDataState, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Profile photo handling
  const handleProfilePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // File size validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showNotification("La photo ne doit pas dépasser 5 Mo", "error");
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profilePhoto: file,
        profilePhotoURL: URL.createObjectURL(file)
      }));
    }
  };

  // Experience management
  const handleAddExperience = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        company: '',
        role: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }));
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updatedExperiences = [...formData.experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      experiences: updatedExperiences
    }));
  };

  const handleRemoveExperience = (index: number) => {
    const updatedExperiences = formData.experiences.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      experiences: updatedExperiences
    }));
  };

  // Skills management
  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
    }
  };

  const handleSkillInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Portfolio file handling
  const handlePortfolioChange = (index: number, field: string, value: string) => {
    const updatedPortfolio = [...formData.portfolio];
    updatedPortfolio[index] = {
      ...updatedPortfolio[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      portfolio: updatedPortfolio
    }));
  };

  const removePortfolioFile = (index: number) => {
    const updatedFiles = [...formData.portfolio];
    updatedFiles.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      portfolio: updatedFiles
    }));
  };

  // Add this function with the other handlers
  const handleAddPortfolio = () => {
    setFormData(prev => ({
      ...prev,
      portfolio: [...prev.portfolio, {
        title: '',
        description: '',
        link: '',
        image: ''
      }]
    }));
  };

  // Form submission with API integration
  const handleSubmit = async () => {
    if (!validateForm()) {
      showNotification("Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:3000/api/profile', formData);
      showNotification("Profil enregistré avec succès!", "success");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification("Erreur lors de l'enregistrement du profil", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Notification system
  const showNotification = (message: string, type: NotificationType = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // Add this validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }

    // Validate experiences
    formData.experiences.forEach((exp, index) => {
      if (!exp.company || !exp.role || !exp.startDate || !exp.description) {
        newErrors[`experience_${index}`] = 'Veuillez remplir tous les champs obligatoires de l\'expérience';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Mon Profil</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {/* Profile Photo */}
          <div className="mb-6 text-center">
            <div className="mb-2">
              {formData.profilePhotoURL ? (
                <img src={formData.profilePhotoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover mx-auto" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto"></div>
              )}
    </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              className="hidden"
              id="profile-photo"
            />
            <label
              htmlFor="profile-photo"
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Changer la photo
            </label>
  </div>

          {/* Name - Required */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                handleChange('name', e.target.value);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Votre nom"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Title - Required */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                handleChange('title', e.target.value);
                if (errors.title) {
                  setErrors(prev => ({ ...prev, title: undefined }));
                }
              }}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Votre titre professionnel"
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* About - Required */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              À propos <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.about ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Parlez-nous de vous"
              required
            />
            {errors.about && (
              <p className="mt-1 text-sm text-red-500">{errors.about}</p>
            )}
          </div>

          {/* Experiences */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Expériences</h2>
            {formData.experiences.map((exp, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entreprise <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de début <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <button
                  onClick={() => handleRemoveExperience(index)}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  Supprimer cette expérience
                </button>
              </div>
            ))}
            <button
              onClick={handleAddExperience}
              className="text-blue-600 hover:text-blue-800"
            >
              + Ajouter une expérience
            </button>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded">
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillInputKeyDown}
                className="flex-1 p-2 border rounded"
                placeholder="Ajouter une compétence"
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 text-blue-600 hover:text-blue-800"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Portfolio */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Portfolio</h2>
            {formData.portfolio.map((item, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handlePortfolioChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lien <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={item.link}
                    onChange={(e) => handlePortfolioChange(index, 'link', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </label>
                  <input
                    type="text"
                    value={item.image}
                    onChange={(e) => handlePortfolioChange(index, 'image', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="URL de l'image"
                  />
                </div>
                <button
                  onClick={() => removePortfolioFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer ce projet
                </button>
              </div>
            ))}
            <button
              onClick={handleAddPortfolio}
              className="text-blue-600 hover:text-blue-800"
            >
              + Ajouter un projet
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded text-white ${
              isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer le profil'}
          </button>
        </div>
      </div>
    </div>
);
}
