//profile controller
import Profile from '../models/Profile.js';

//get all profiles
export const getAllProfiles = async (req, res) => {
  const profiles = await Profile.find();
  res.status(200).json(profiles);
};

//get profile by id
export const getProfileById = async (req, res) => {
  const profile = await Profile.findById(req.params.id);
  res.status(200).json(profile);
};

//create profile
export const createProfile = async (req, res) => {
  const profile = await Profile.create(req.body);
  res.status(201).json(profile);
};

//update profile
export const updateProfile = async (req, res) => {
  const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(profile);
};

//delete profile
export const deleteProfile = async (req, res) => {
  await Profile.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Profile deleted successfully' });
};

//get profile by user id
export const getProfileByUserId = async (req, res) => {
  const profile = await Profile.findOne({ userId: req.params.id });
  res.status(200).json(profile);
};










