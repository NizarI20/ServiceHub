// pages/index.js
'use client';
import { useState, useEffect } from 'react';
import "../style.css";

export default function ProfilePage() {
  // Form state management
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({
    profilePhoto: null,
    profilePhotoURL: null,
    name: '',
    title: '',
    about: '',
    experiences: [''],
    skills: [],
    portfolioFiles: []
  });
  
  // UI state
  const [skillInput, setSkillInput] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [hasChanges, setHasChanges] = useState(false);

  // Track form changes
  useEffect(() => {
    setHasChanges(true);
  }, [formData]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Profile photo handling
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
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
      experiences: [...prev.experiences, '']
    }));
  };

  const handleExperienceChange = (idx, value) => {
    const updatedExperiences = [...formData.experiences];
    updatedExperiences[idx] = value;
    handleChange('experiences', updatedExperiences);
  };

  const handleRemoveExperience = (idx) => {
    handleChange('experiences', formData.experiences.filter((_, i) => i !== idx));
  };

  // Skills management
  const handleAddSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      handleChange('skills', [...formData.skills, skill]);
      setSkillInput('');
    }
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleRemoveSkill = (skill) => {
    handleChange('skills', formData.skills.filter(s => s !== skill));
  };

  // Portfolio file handling
  const handlePortfolioChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate each file (max 2MB per file)
    const validFiles = files.filter(file => {
      const isValid = file.size <= 2 * 1024 * 1024;
      if (!isValid) {
        showNotification(`Le fichier ${file.name} dépasse 2 Mo`, "error");
      }
      return isValid;
    });
    
    handleChange('portfolioFiles', [...formData.portfolioFiles, ...validFiles]);
  };

  const removePortfolioFile = (index) => {
    const updatedFiles = [...formData.portfolioFiles];
    updatedFiles.splice(index, 1);
    handleChange('portfolioFiles', updatedFiles);
  };

  // Form submission with API integration
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Create form data for API submission
      const apiData = new FormData();
      
      // Add all form fields to the FormData
      apiData.append('name', formData.name);
      apiData.append('title', formData.title);
      apiData.append('about', formData.about);
      apiData.append('experiences', JSON.stringify(formData.experiences));
      apiData.append('skills', JSON.stringify(formData.skills));
      
      // Add profile photo if exists
      if (formData.profilePhoto) {
        apiData.append('profilePhoto', formData.profilePhoto);
      }
      
      // Add portfolio files
      formData.portfolioFiles.forEach((file, index) => {
        apiData.append(`portfolio${index}`, file);
      });
      
      // Simulated API call
      // In real implementation:
      // const response = await fetch('/api/profile', {
      //   method: 'POST',
      //   body: apiData
      // });
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification("Profil enregistré avec succès!", "success");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      showNotification("Erreur lors de l'enregistrement du profil", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch profile data from API
  const fetchProfileData = async () => {
    setIsLoading(true);
    
    try {
      // In real implementation:
      // const response = await fetch('/api/profile');
      // const data = await response.json();
      // setFormData({
      //   name: data.name,
      //   title: data.title,
      //   ...and so on
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Example mock data
      // setFormData({
      //   profilePhoto: null,
      //   profilePhotoURL: null,
      //   name: 'Jean Dupont',
      //   title: 'Designer Indépendant',
      //   about: 'Designer passionné avec 5 ans d\'expérience...',
      //   experiences: ['Designer UX chez Company X', 'Freelance Designer'],
      //   skills: ['UI/UX', 'Figma', 'Adobe XD'],
      //   portfolioFiles: []
      // });
    } catch (error) {
      console.error("Error fetching profile:", error);
      showNotification("Erreur lors du chargement du profil", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Could be used to load existing profile on component mount
  // useEffect(() => {
  //   fetchProfileData();
  // }, []);

  // Notification system
  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
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

      {!preview ? (
        <section className="max-w-4xl mx-auto p-6">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold">Mon Profil Vendeur</h1>
              <p className="text-gray-600 mt-1">Complétez votre profil pour attirer plus de clients</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setPreview(true)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors flex items-center"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Aperçu
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !hasChanges}
                className={`${
                  hasChanges ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300'
                } text-white px-6 py-2 rounded-md transition-colors flex items-center`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Enregistrer
              </button>
            </div>
          </header>

          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="relative w-32 h-32 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
                  {formData.profilePhotoURL ? (
                    <img
                      src={formData.profilePhotoURL}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <label className="block text-sm font-medium mb-1 text-gray-700">Photo de profil</label>
                <p className="text-xs text-gray-500 mb-2">Format recommandé: JPG, PNG. Taille max: 5MB</p>
                <div className="flex items-center">
                  <label className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md cursor-pointer inline-block transition-colors">
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      Choisir une photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {formData.profilePhotoURL && (
                    <button
                      onClick={() => handleChange('profilePhotoURL', null)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Nom complet *</label>
                  <input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    type="text"
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Titre professionnel *</label>
                  <input
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    type="text"
                    placeholder="Ex: Designer Indépendant"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">À propos</label>
              <textarea
                value={formData.about}
                onChange={(e) => handleChange('about', e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={4}
                placeholder="Décrivez votre parcours professionnel, votre expertise et vos services..."
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Expériences professionnelles</h2>
              {formData.experiences.map((exp, idx) => (
                <div key={idx} className="flex items-start space-x-2 mb-3">
                  <textarea
                    value={exp}
                    onChange={(e) => handleExperienceChange(idx, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={2}
                    placeholder={`Ex: Designer UX chez Company X (2018-2020)`}
                  />
                  <button
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddExperience}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm mt-2"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Ajouter une expérience
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Compétences</h2>
              <div className="flex items-center space-x-2 mb-3">
                <div className="relative flex-1">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    type="text"
                    placeholder="Ex: Photoshop, WordPress, Marketing, etc."
                  />
                  <div className="text-xs text-gray-500 mt-1">Appuyez sur Entrée ou cliquez sur Ajouter</div>
                </div>
                <button
                  onClick={handleAddSkill}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors whitespace-nowrap"
                  type="button"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center space-x-1 group"
                  >
                    <span>{skill}</span>
                    <button 
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-blue-400 group-hover:text-blue-700 ml-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">Portfolio</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Ajoutez des exemples de vos travaux</label>
                <p className="text-xs text-gray-500 mb-2">Formats acceptés: PDF, JPG, PNG. Taille max: 2MB par fichier</p>
                <label className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md cursor-pointer inline-block transition-colors">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                    </svg>
                    Sélectionner des fichiers
                  </span>
                  <input
                    type="file"
                    multiple
                    onChange={handlePortfolioChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
              {formData.portfolioFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {formData.portfolioFiles.map((file, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-md border border-gray-200 group relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="bg-gray-200 p-2 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removePortfolioFile(idx)}
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-4xl mx-auto p-6">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Aperçu du Profil Public</h1>
            <button
              onClick={() => setPreview(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Modifier le profil
            </button>
          </header>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Hero section */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sm:p-10 text-white">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-white/20 border-4 border-white/40 flex-shrink-0">
                  {formData.profilePhotoURL ? (
                    <img
                      src={formData.profilePhotoURL}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/80">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{formData.name || 'Votre nom'}</h2>
                  <p className="text-xl text-blue-100 mt-1">{formData.title || 'Votre titre professionnel'}</p>
                  {formData.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <span key={skill} className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 space-y-8">
              {/* About section */}
              {formData.about && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    À propos
                  </h3>
                  <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 leading-relaxed">
                    {formData.about}
                  </div>
                </div>
              )}

              {/* Experience section */}
              {formData.experiences.filter(exp => exp.trim()).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Expériences
                  </h3>
                  <div className="space-y-4">
                    {formData.experiences.map((exp, idx) => (
                      exp.trim() && (
<div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="flex items-start">
                              <div className="bg-blue-100 rounded-full p-2 mr-3 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-700">{exp}</p>
                              </div>
                            </div>
                          </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio section */}
              {formData.portfolioFiles.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Portfolio
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formData.portfolioFiles.map((file, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mr-3">
                              {file.type?.includes('image') ? (
                                <div className="bg-gray-200 w-12 h-12 rounded-md flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              ) : file.type?.includes('pdf') ? (
                                <div className="bg-red-100 w-12 h-12 rounded-md flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="bg-gray-200 w-12 h-12 rounded-md flex items-center justify-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 truncate">{file.name}</h4>
                              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-100 px-4 py-2 flex justify-end">
                          <button className="text-blue-600 text-sm hover:text-blue-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Aperçu
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact section */}
              <div className="mt-10 border-t border-gray-200 pt-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact
                  </h3>
                  <p className="text-gray-700 mb-4">Vous êtes intéressé par mes services ? N'hésitez pas à me contacter !</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Envoyer un message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Floating save button for mobile when form has changes */}
      {!preview && hasChanges && (
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}