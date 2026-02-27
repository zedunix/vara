import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+971|00971|0)?[0-9]{9}$/)
    .withMessage('Please provide a valid UAE phone number'),
  
  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
  
  body('portfolioLink')
    .notEmpty()
    .withMessage('Portfolio link is required')
    .isURL()
    .withMessage('Please provide a valid portfolio URL'),
  
  body('behanceUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Behance URL'),
  
  body('dribbbleUrl')
    .optional()
    .isURL()
    .withMessage('Please provide a valid Dribbble URL'),
  
  body('instagramHandle')
    .optional()
    .matches(/^@?[a-zA-Z0-9._]{1,30}$/)
    .withMessage('Please provide a valid Instagram handle'),
];

export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];
