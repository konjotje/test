/**
 * User interface for authentication and profile data
 */
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    municipality: string;
    birthDate: string;
    createdAt: any; // FirebaseFirestore.Timestamp
}

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

/**
 * Frequency enum for recurring payments and income/expenses
 */
export enum Frequency {
    MONTHLY = 'maandelijks',
    MANUAL = 'handmatig', // For debt payment plan, treated as 'eenmalig' (one-off)
    EENMALIG = 'eenmalig', // For income/expense
}

/**
 * Payment plan interface for debt management
 */
export interface PaymentPlan {
  /** Amount per payment in euros */
  amount: number;
  /** Payment frequency */
  frequency: Frequency.MONTHLY | Frequency.MANUAL;
  /** Start date in YYYY-MM-DD format */
  startDate: string;
}

/**
 * Debt interface representing a user's debt
 */
export interface Debt {
  /** Unique identifier */
  id: string;
  /** Name of the creditor */
  creditorName: string;
  /** Name of beneficiary for payment (optional) */
  beneficiaryName?: string;
  /** Total amount of debt in euros */
  totalAmount: number;
  /** Description of the debt */
  description: string;
  /** Dossier number (optional) */
  dossierNumber?: string;
  /** Account number for payments (optional) */
  accountNumber?: string;
  /** Payment reference (optional) */
  paymentReference?: string;
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** Whether the debt is fully paid off */
  isPaidOff: boolean;
  /** Payment plan for the debt (optional) */
  paymentPlan?: PaymentPlan | null;
  /** Contact person name (optional) */
  contactPerson?: string;
  /** Contact email (optional) */
  email?: string;
  /** Contact phone number (optional) */
  phone?: string;
  /** Website URL (optional) */
  website?: string;
  /** Array of due dates (YYYY-MM-DD) that have been paid */
  paidOn?: string[];
}

/**
 * Income interface representing user's income sources
 */
export interface Income {
  /** Unique identifier */
  id: string;
  /** Source of income */
  source: string;
  /** Amount in euros */
  amount: number;
  /** Income frequency */
  frequency: Frequency.MONTHLY | Frequency.EENMALIG;
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** Additional notes (optional) */
  notes?: string;
}

/**
 * Expense interface representing user's expenses
 */
export interface Expense {
  /** Unique identifier */
  id: string;
  /** Expense category */
  category: string;
  /** Amount in euros */
  amount: number;
  /** Expense frequency */
  frequency: Frequency.MONTHLY | Frequency.EENMALIG;
  /** Start date in YYYY-MM-DD format */
  startDate: string;
  /** Additional notes (optional) */
  notes?: string;
}

/**
 * Upcoming payment item for dashboard calendar
 */
export interface UpcomingPaymentItem {
  /** Associated debt ID */
  debtId: string;
  /** Creditor name for the debt */
  debtCreditorName: string;
  /** Payment amount in euros */
  paymentAmount: number;
  /** Due date in YYYY-MM-DD format */
  dueDate: string;
  /** Original payment plan (optional) */
  originalPlan?: PaymentPlan;
  /** Whether payment has been made */
  isPaid?: boolean;
  /** Additional notes (optional) */
  notes?: string;
}

/**
 * Projection data for financial charts
 */
export interface ProjectionData {
  /** Month number (1-12) */
  month: string;
  /** Year */
  year: string;
  /** Display label for month */
  monthLabel: string;
  /** Outstanding debt amount */
  openstaandeSchuld: number;
  /** Debt repayment amount */
  aflossing: number;
  /** Available savings space */
  spaarruimte: number;
  /** Total savings amount */
  spaargeld: number;
}

/**
 * Activity types for user action logging
 */
export enum ActivityType {
  DEBT_ADDED = 'debt_added',
  DEBT_UPDATED = 'debt_updated',
  DEBT_DELETED = 'debt_deleted',
  DEBT_PAID_OFF = 'debt_paid_off',
  DEBT_REOPENED = 'debt_reopened',
  PAYMENT_LOGGED = 'payment_logged',
  INCOME_ADDED = 'income_added',
  INCOME_UPDATED = 'income_updated',
  INCOME_DELETED = 'income_deleted',
  EXPENSE_ADDED = 'expense_added',
  EXPENSE_UPDATED = 'expense_updated',
  EXPENSE_DELETED = 'expense_deleted',
  SYSTEM_MESSAGE = 'system_message',
}

/**
 * Activity log item for tracking user actions
 */
export interface ActivityLogItem {
  /** Unique identifier */
  id: string;
  /** Timestamp in ISO string format */
  timestamp: string;
  /** Type of activity */
  type: ActivityType;
  /** Human-readable description of the activity */
  description: string;
  /** Optional ID of related item (debt, income, expense) */
  itemId?: string;
}

/**
 * User interface for authenticated users
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string | null;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** Municipality where the user lives */
  municipality: string;
  /** Birth date in YYYY-MM-DD format */
  birthDate: string;
  /** Timestamp when the user was created */
  createdAt: any;
}

// Utility types for better type safety
export type DebtFormData = Omit<Debt, 'id' | 'isPaidOff'>;
export type IncomeFormData = Omit<Income, 'id'>;
export type ExpenseFormData = Omit<Expense, 'id'>;
export type UserFormData = Omit<User, 'id' | 'email'>;

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Loading state interface for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}