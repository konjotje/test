import { DebtFormData, IncomeFormData, ExpenseFormData, UserFormData } from '../types';

/**
 * Validation utilities for form inputs and data integrity
 * Provides comprehensive validation for all user inputs
 */

// Regular expressions for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(\+31|0)[0-9]{9}$/; // Dutch phone number format
const IBAN_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Individual field validation result
 */
export interface FieldValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Sanitize string input by trimming whitespace and removing dangerous characters
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>\"']/g, '');
};

/**
 * Validate email address format
 */
export const validateEmail = (email: string): FieldValidation => {
  const sanitized = sanitizeString(email);
  
  if (!sanitized) {
    return { isValid: false, error: 'E-mailadres is verplicht' };
  }
  
  if (!EMAIL_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Ongeldig e-mailadres formaat' };
  }
  
  return { isValid: true };
};

/**
 * Validate phone number (Dutch format)
 */
export const validatePhone = (phone: string): FieldValidation => {
  if (!phone) return { isValid: true }; // Optional field
  
  const sanitized = sanitizeString(phone).replace(/[\s-]/g, '');
  
  if (!PHONE_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Ongeldig telefoonnummer (gebruik Nederlands formaat)' };
  }
  
  return { isValid: true };
};

/**
 * Validate IBAN account number
 */
export const validateIBAN = (iban: string): FieldValidation => {
  if (!iban) return { isValid: true }; // Optional field
  
  const sanitized = sanitizeString(iban).replace(/\s/g, '').toUpperCase();
  
  if (!IBAN_REGEX.test(sanitized)) {
    return { isValid: false, error: 'Ongeldig IBAN formaat' };
  }
  
  return { isValid: true };
};

/**
 * Validate date string (YYYY-MM-DD format)
 */
export const validateDate = (dateString: string, fieldName: string = 'Datum'): FieldValidation => {
  if (!dateString) {
    return { isValid: false, error: `${fieldName} is verplicht` };
  }
  
  if (!DATE_REGEX.test(dateString)) {
    return { isValid: false, error: `${fieldName} moet in YYYY-MM-DD formaat zijn` };
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { isValid: false, error: `${fieldName} is geen geldige datum` };
  }
  
  return { isValid: true };
};

/**
 * Validate monetary amount
 */
export const validateAmount = (amount: number, fieldName: string = 'Bedrag', min: number = 0.01): FieldValidation => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: `${fieldName} moet een geldig getal zijn` };
  }
  
  if (amount < min) {
    return { isValid: false, error: `${fieldName} moet minimaal €${min.toFixed(2)} zijn` };
  }
  
  if (amount > 1000000) {
    return { isValid: false, error: `${fieldName} mag niet hoger zijn dan €1.000.000` };
  }
  
  return { isValid: true };
};

/**
 * Validate required string field
 */
export const validateRequiredString = (value: string, fieldName: string, minLength: number = 1): FieldValidation => {
  const sanitized = sanitizeString(value);
  
  if (!sanitized || sanitized.length < minLength) {
    return { isValid: false, error: `${fieldName} is verplicht en moet minimaal ${minLength} karakter(s) bevatten` };
  }
  
  if (sanitized.length > 255) {
    return { isValid: false, error: `${fieldName} mag maximaal 255 karakters bevatten` };
  }
  
  return { isValid: true };
};

/**
 * Validate debt form data
 */
export const validateDebtForm = (data: DebtFormData): ValidationResult => {
  const errors: string[] = [];
  
  // Required fields
  const creditorValidation = validateRequiredString(data.creditorName, 'Schuldeiser naam');
  if (!creditorValidation.isValid) errors.push(creditorValidation.error!);
  
  const descriptionValidation = validateRequiredString(data.description, 'Omschrijving');
  if (!descriptionValidation.isValid) errors.push(descriptionValidation.error!);
  
  const amountValidation = validateAmount(data.totalAmount, 'Totaalbedrag');
  if (!amountValidation.isValid) errors.push(amountValidation.error!);
  
  const dateValidation = validateDate(data.startDate, 'Startdatum');
  if (!dateValidation.isValid) errors.push(dateValidation.error!);
  
  // Optional fields
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) errors.push(emailValidation.error!);
  }
  
  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.isValid) errors.push(phoneValidation.error!);
  }
  
  if (data.accountNumber) {
    const ibanValidation = validateIBAN(data.accountNumber);
    if (!ibanValidation.isValid) errors.push(ibanValidation.error!);
  }
  
  // Payment plan validation
  if (data.paymentPlan) {
    const planAmountValidation = validateAmount(data.paymentPlan.amount, 'Aflossing per maand');
    if (!planAmountValidation.isValid) errors.push(planAmountValidation.error!);
    
    const planDateValidation = validateDate(data.paymentPlan.startDate, 'Startdatum regeling');
    if (!planDateValidation.isValid) errors.push(planDateValidation.error!);
    
    // Check if payment plan amount is not higher than total debt
    if (data.paymentPlan.amount > data.totalAmount) {
      errors.push('Aflossing per maand mag niet hoger zijn dan het totaalbedrag');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate income form data
 */
export const validateIncomeForm = (data: IncomeFormData): ValidationResult => {
  const errors: string[] = [];
  
  const sourceValidation = validateRequiredString(data.source, 'Inkomensbron');
  if (!sourceValidation.isValid) errors.push(sourceValidation.error!);
  
  const amountValidation = validateAmount(data.amount, 'Bedrag');
  if (!amountValidation.isValid) errors.push(amountValidation.error!);
  
  const dateValidation = validateDate(data.startDate, 'Startdatum');
  if (!dateValidation.isValid) errors.push(dateValidation.error!);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate expense form data
 */
export const validateExpenseForm = (data: ExpenseFormData): ValidationResult => {
  const errors: string[] = [];
  
  const categoryValidation = validateRequiredString(data.category, 'Categorie');
  if (!categoryValidation.isValid) errors.push(categoryValidation.error!);
  
  const amountValidation = validateAmount(data.amount, 'Bedrag');
  if (!amountValidation.isValid) errors.push(amountValidation.error!);
  
  const dateValidation = validateDate(data.startDate, 'Startdatum');
  if (!dateValidation.isValid) errors.push(dateValidation.error!);
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user profile form data
 */
export const validateUserForm = (data: UserFormData): ValidationResult => {
  const errors: string[] = [];
  
  const firstNameValidation = validateRequiredString(data.firstName, 'Voornaam');
  if (!firstNameValidation.isValid) errors.push(firstNameValidation.error!);
  
  const lastNameValidation = validateRequiredString(data.lastName, 'Achternaam');
  if (!lastNameValidation.isValid) errors.push(lastNameValidation.error!);
  
  const birthDateValidation = validateDate(data.birthDate, 'Geboortedatum');
  if (!birthDateValidation.isValid) errors.push(birthDateValidation.error!);
  
  // Check if birth date is not in the future
  const birthDate = new Date(data.birthDate);
  const today = new Date();
  if (birthDate > today) {
    errors.push('Geboortedatum kan niet in de toekomst liggen');
  }
  
  // Check if user is not too young (minimum 16 years)
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age < 16) {
    errors.push('Je moet minimaal 16 jaar oud zijn om deze app te gebruiken');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if a string contains potentially dangerous content
 */
export const containsDangerousContent = (input: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Rate limiting helper for API calls
 */
export class RateLimiter {
  private calls: number[] = [];
  
  constructor(private maxCalls: number, private windowMs: number) {}
  
  canMakeCall(): boolean {
    const now = Date.now();
    this.calls = this.calls.filter(time => now - time < this.windowMs);
    
    if (this.calls.length >= this.maxCalls) {
      return false;
    }
    
    this.calls.push(now);
    return true;
  }
  
  getRemainingCalls(): number {
    return Math.max(0, this.maxCalls - this.calls.length);
  }
}