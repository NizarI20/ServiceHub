// Validation middleware
import { body, validationResult } from 'express-validator';

// Middleware to check validation results
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User validation rules
export const userValidationRules = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['client', 'provider']).withMessage('Role must be either client or provider')
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]
};

// Service validation rules
export const serviceValidationRules = {
  create: [
    body('titre').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('prix').isNumeric().withMessage('Price must be a number'),
    body('categorie').notEmpty().withMessage('Category is required')
  ],
  update: [
    body('titre').optional().trim().notEmpty().withMessage('Title cannot be empty if provided'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty if provided'),
    body('prix').optional().isNumeric().withMessage('Price must be a number if provided'),
    body('disponibilite').optional().isBoolean().withMessage('Availability must be a boolean if provided')
  ]
};

// Category validation rules
export const categoryValidationRules = {
  create: [
    body('nom').trim().notEmpty().withMessage('Name is required'),
    body('description').trim().notEmpty().withMessage('Description is required')
  ]
};

// Reservation validation rules
export const reservationValidationRules = {
  create: [
    body('serviceId').notEmpty().withMessage('Service ID is required'),
    body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
    body('endDate').isISO8601().toDate().withMessage('Valid end date is required')
      .custom((endDate, { req }) => {
        if (new Date(endDate) <= new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ],
  updateStatus: [
    body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status')
  ]
};
