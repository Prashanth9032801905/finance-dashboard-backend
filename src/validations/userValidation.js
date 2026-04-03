const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),
  
  email: Joi.string()
    .email()
    .trim()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    }),
  
  role: Joi.string()
    .valid('admin', 'analyst', 'viewer')
    .default('viewer')
    .messages({
      'any.only': 'Role must be one of: admin, analyst, viewer'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .default('active')
    .messages({
      'any.only': 'Status must be either active or inactive'
    })
});

const updateUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  
  email: Joi.string()
    .email()
    .trim()
    .messages({
      'string.email': 'Please enter a valid email address'
    }),
  
  role: Joi.string()
    .valid('admin', 'analyst', 'viewer')
    .messages({
      'any.only': 'Role must be one of: admin, analyst, viewer'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .messages({
      'any.only': 'Status must be either active or inactive'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getUsersSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  
  role: Joi.string()
    .valid('admin', 'analyst', 'viewer')
    .messages({
      'any.only': 'Role must be one of: admin, analyst, viewer'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive')
    .messages({
      'any.only': 'Status must be either active or inactive'
    }),
  
  search: Joi.string()
    .trim()
    .max(100)
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    })
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  getUsersSchema
};
