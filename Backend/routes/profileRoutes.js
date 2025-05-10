//profile routes
import express from 'express';
import {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  getProfileByUserId
} from '../controllers/ProfileController.js';

const router = express.Router();

//get all profiles
router.get('/', getAllProfiles);

//get profile by id
router.get('/:id', getProfileById);

//create profile
router.post('/', createProfile);

//update profile
router.put('/:id', updateProfile);

//delete profile
router.delete('/:id', deleteProfile);

//get profile by user id
router.get('/user/:id', getProfileByUserId);

export default router;







