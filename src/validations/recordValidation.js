const Joi = require('joi');

const createRecordSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be greater than 0',
      'number.precision': 'Amount can have maximum 2 decimal places',
      'any.required': 'Amount is required'
    }),
  
  type: Joi.string()
    .valid('income', 'expense')
    .required()
    .messages({
      'any.only': 'Type must be either income or expense',
      'any.required': 'Type is required'
    }),
  
  category: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Category is required',
      'string.min': 'Category cannot be empty',
      'string.max': 'Category cannot exceed 50 characters',
      'any.required': 'Category is required'
    }),
  
  date: Joi.date()
    .iso()
    .default(Date.now)
    .messages({
      'date.format': 'Date must be in ISO format (YYYY-MM-DD)'
    }),
  
  note: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Note cannot exceed 200 characters'
    })
});

const updateRecordSchema = Joi.object({
  amount: Joi.number()
    .positive()
    .precision(2)
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be greater than 0',
      'number.precision': 'Amount can have maximum 2 decimal places'
    }),
  
  type: Joi.string()
    .valid('income', 'expense')
    .messages({
      'any.only': 'Type must be either income or expense'
    }),
  
  category: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .messages({
      'string.empty': 'Category cannot be empty',
      'string.max': 'Category cannot exceed 50 characters'
    }),
  
  date: Joi.date()
    .iso()
    .messages({
      'date.format': 'Date must be in ISO format (YYYY-MM-DD)'
    }),
  
  note: Joi.string()
    .trim()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Note cannot exceed 200 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

const getRecordsSchema = Joi.object({
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
  
  type: Joi.string()
    .valid('income', 'expense')
    .messages({
      'any.only': 'Type must be either income or expense'
    }),
  
  category: Joi.string()
    .trim()
    .messages({
      'string.base': 'Category must be a string'
    }),
  
  startDate: Joi.date()
    .iso()
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .messages({
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'End date must be after or equal to start date'
    }),
  
  sortBy: Joi.string()
    .valid('date', 'amount', 'category', 'createdAt')
    .default('date')
    .messages({
      'any.only': 'Sort by must be one of: date, amount, category, createdAt'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  getRecordsSchema
};
