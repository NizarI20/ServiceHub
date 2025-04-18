// Backend File: models/Profile.js
const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String },
  experiences: [
    {
      company: { type: String, required: true },
      role: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      description: { type: String, required: true },
    },
  ],
  skills: [{ type: String }],
  portfolio: [
    {
      title: { type: String, required: true },
      description: { type: String, required: true },
      link: { type: String, required: true },
      image: { type: String },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);