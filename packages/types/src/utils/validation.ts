// Validation utilities
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Container number validation (ISO 6346)
export const validateContainerNumber = (cntrNo: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!cntrNo) {
    errors.push({
      field: 'cntrNo',
      message: 'Container number is required',
      code: 'REQUIRED'
    });
    return { isValid: false, errors };
  }
  
  // ISO 6346 format: 4 letters + 7 digits
  const iso6346Regex = /^[A-Z]{4}[0-9]{7}$/;
  if (!iso6346Regex.test(cntrNo)) {
    errors.push({
      field: 'cntrNo',
      message: 'Container number must be in ISO 6346 format (4 letters + 7 digits)',
      code: 'INVALID_FORMAT',
      value: cntrNo
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
      code: 'REQUIRED'
    });
    return { isValid: false, errors };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT',
      value: email
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation
export const validatePhone = (phone: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!phone) {
    errors.push({
      field: 'phone',
      message: 'Phone number is required',
      code: 'REQUIRED'
    });
    return { isValid: false, errors };
  }
  
  // Basic phone validation - can be enhanced for specific regions
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    errors.push({
      field: 'phone',
      message: 'Invalid phone number format',
      code: 'INVALID_FORMAT',
      value: phone
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Date validation
export const validateDate = (date: string | Date): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!date) {
    errors.push({
      field: 'date',
      message: 'Date is required',
      code: 'REQUIRED'
    });
    return { isValid: false, errors };
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    errors.push({
      field: 'date',
      message: 'Invalid date format',
      code: 'INVALID_FORMAT',
      value: date
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Required field validation
export const validateRequired = (value: unknown, field: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (value === null || value === undefined || value === '') {
    errors.push({
      field,
      message: `${field} is required`,
      code: 'REQUIRED'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Combine multiple validation results
export const combineValidationResults = (...results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};
