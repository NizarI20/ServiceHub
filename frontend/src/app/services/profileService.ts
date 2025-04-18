// Frontend Service: services/profileService.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ProfileData {
  _id?: string;
  name: string;
  title: string;
  summary: string;
  experiences: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];
  skills: string[];
  portfolio: {
    title: string;
    description: string;
    link: string;
    image?: string;
  }[];
}

export const createProfile = async (data: ProfileData): Promise<ProfileData> => {
  const response = await axios.post<ProfileData>(`${API_URL}/profiles`, data);
  return response.data;
};

export const getProfile = async (id: string): Promise<ProfileData> => {
  const response = await axios.get<ProfileData>(`${API_URL}/profiles/${id}`);
  return response.data;
};

export const updateProfile = async (id: string, data: ProfileData): Promise<ProfileData> => {
  const response = await axios.put<ProfileData>(`${API_URL}/profiles/${id}`, data);
  return response.data;
};


// Frontend Page: pages/profile.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createProfile, getProfile, updateProfile, ProfileData } from '../services/profileService';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Le nom est requis'),
  title: Yup.string().required('Le titre est requis'),
  summary: Yup.string(),
  experiences: Yup.array().of(
    Yup.object().shape({
      company: Yup.string().required('Entreprise requise'),
      role: Yup.string().required('Rôle requis'),
      startDate: Yup.date().required('Date de début requise'),
      endDate: Yup.string(),
      description: Yup.string().required('Description requise'),
    })
  ),
  skills: Yup.array().of(Yup.string().required()),
  portfolio: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Titre requis'),
      description: Yup.string().required('Description requise'),
      link: Yup.string().url('Lien invalide').required('Lien requis'),
      image: Yup.string().url('URL d’image invalide'),
    })
  ),
});

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const initialValues: ProfileData = {
    name: '',
    title: '',
    summary: '',
    experiences: [],
    skills: [],
    portfolio: [],
  };

  useEffect(() => {
    if (id) {
      getProfile(id as string).then(data => {
        formik.setValues(data);
      });
    }
  }, [id]);

  const handleSubmit = async (values: ProfileData) => {
    try {
      let saved: ProfileData;
      if (values._id) {
        saved = await updateProfile(values._id, values);
      } else {
        saved = await createProfile(values);
      }
      router.replace(`/profile?id=${saved._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  let formik: any;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Modifier' : 'Créer'} Mon Profil</h1>
      <Formik
        innerRef={ref => (formik = ref)}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, isSubmitting }) => (
          <Form className="space-y-6">
            {/* Basic Info */}
            <div>
              <Field name="name" placeholder="Nom" className="w-full p-2 border rounded" />
              <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
            </div>
            <div>
              <Field name="title" placeholder="Titre professionnel" className="w-full p-2 border rounded" />
              <ErrorMessage name="title" component="div" className="text-red-500 text-sm" />
            </div>
            <div>
              <Field
                as="textarea"
                name="summary"
                placeholder="Résumé"
                className="w-full p-2 border rounded h-24"
              />
            </div>
            {/* Experiences */}
            <FieldArray name="experiences">
              {({ push, remove }) => (
                <section>
                  <h2 className="text-xl font-semibold mb-2">Expériences</h2>
                  {values.experiences.map((_, idx) => (
                    <div key={idx} className="border p-4 rounded mb-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Expérience {idx + 1}</span>
                        <button type="button" onClick={() => remove(idx)} className="text-red-500">Supprimer</button>
                      </div>
                      <Field name={`experiences[${idx}].company`} placeholder="Entreprise" className="w-full p-2 border rounded" />
                      <ErrorMessage name={`experiences[${idx}].company`} component="div" className="text-red-500 text-sm" />
                      <Field name={`experiences[${idx}].role`} placeholder="Rôle" className="w-full p-2 border rounded" />
                      <ErrorMessage name={`experiences[${idx}].role`} component="div" className="text-red-500 text-sm" />
                      <Field name={`experiences[${idx}].startDate`} type="date" className="w-full p-2 border rounded" />
                      <ErrorMessage name={`experiences[${idx}].startDate`} component="div" className="text-red-500 text-sm" />
                      <Field name={`experiences[${idx}].endDate`} type="date" className="w-full p-2 border rounded" />
                      <Field as="textarea" name={`experiences[${idx}].description`} placeholder="Description" className="w-full p-2 border rounded" />
                      <ErrorMessage name={`experiences[${idx}].description`} component="div" className="text-red-500 text-sm" />
                    </div>
                  ))}
                  <button type="button" onClick={() => push({ company: '', role: '', startDate: '', endDate: '', description: '' })} className="bg-green-500 text-white py-1 px-3 rounded">Ajouter Expérience</button>
                </section>
              )}
            </FieldArray>
            {/* Skills */}
            <FieldArray name="skills">
              {({ push, remove }) => (
                <section>
                  <h2 className="text-xl font-semibold mb-2">Compétences</h2>
                  <div className="flex space-x-2 mb-2">
                    <Field name="newSkill" placeholder="Nouvelle compétence" className="flex-1 p-2 border rounded" />
                    <button
                      type="button"
                      onClick={() => {
                        // @ts-ignore
                        const skill = formik.values.newSkill;
                        if (skill?.trim()) {
                          push(skill.trim());
                          formik.setFieldValue('newSkill', '');
                        }
                      }}
                      className="bg-green-500 text-white py-1 px-3 rounded"
                    >Ajouter</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 px-2 py-1 rounded flex items-center">
                        {skill}
                        <button type="button" onClick={() => remove(idx)} className="ml-1 text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </FieldArray>
            {/* Portfolio */}
            <FieldArray name="portfolio">
              {({ push, remove }) => (
                <section>
                  <h2 className="text-xl font-semibold mb-2">Portfolio</h2>
                  {values.portfolio.map((_, idx) => (
                    <div key={idx} className="border p-4 rounded mb-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Projet {idx + 1}</span>
                        <button type="button```
