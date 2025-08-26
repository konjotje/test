import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  query,
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { db, arrayUnion } from '../firebase';
import { 
  Debt, 
  Income, 
  Expense, 
  ActivityLogItem, 
  User, 
  ActivityType, 
  UpcomingPaymentItem,
  DebtFormData,
  IncomeFormData,
  ExpenseFormData,
  UserFormData
} from '../types';
import { generateScheduledPaymentsForDebt } from '../utils/helpers';
import { RateLimiter } from '../utils/validation';

/**
 * Firebase service for handling all database operations
 * Provides a clean interface for data operations with error handling
 */
export class FirebaseService {
  private rateLimiter = new RateLimiter(100, 60000); // 100 calls per minute

  /**
   * Check rate limiting before making API calls
   */
  private checkRateLimit(): void {
    if (!this.rateLimiter.canMakeCall()) {
      throw new Error('Te veel verzoeken. Probeer het later opnieuw.');
    }
  }

  /**
   * Subscribe to user profile changes
   */
  subscribeToUser(userId: string, callback: (user: User | null) => void): Unsubscribe {
    const userDocRef = doc(db, 'users', userId);
    
    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          id: doc.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate,
          municipality: data.municipality,
          createdAt: data.createdAt,
        });
      } else {
        console.warn("Gebruikersdocument niet gevonden");
        callback(null);
      }
    }, (error) => {
      console.error("Error subscribing to user:", error);
      callback(null);
    });
  }

  /**
   * Subscribe to a collection with real-time updates
   */
  private subscribeToCollection<T>(
    userId: string,
    collectionName: string,
    orderField: string,
    callback: (items: T[]) => void
  ): Unsubscribe {
    const collRef = collection(db, 'users', userId, collectionName);
    const q = query(collRef, orderBy(orderField, 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore Timestamps to ISO strings for consistency
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : new Date().toISOString();
        return { 
          id: doc.id, 
          ...data, 
          ...(collectionName === 'activityLog' && { timestamp }) 
        };
      });
      callback(items as T[]);
    }, (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
      callback([]);
    });
  }

  /**
   * Subscribe to debts collection
   */
  subscribeToDebts(userId: string, callback: (debts: Debt[]) => void): Unsubscribe {
    return this.subscribeToCollection<Debt>(userId, 'debts', 'startDate', callback);
  }

  /**
   * Subscribe to incomes collection
   */
  subscribeToIncomes(userId: string, callback: (incomes: Income[]) => void): Unsubscribe {
    return this.subscribeToCollection<Income>(userId, 'incomes', 'startDate', callback);
  }

  /**
   * Subscribe to expenses collection
   */
  subscribeToExpenses(userId: string, callback: (expenses: Expense[]) => void): Unsubscribe {
    return this.subscribeToCollection<Expense>(userId, 'expenses', 'startDate', callback);
  }

  /**
   * Subscribe to activity log
   */
  subscribeToActivityLog(userId: string, callback: (activities: ActivityLogItem[]) => void): Unsubscribe {
    return this.subscribeToCollection<ActivityLogItem>(userId, 'activityLog', 'timestamp', callback);
  }

  /**
   * Log user action to activity log
   */
  async logUserAction(userId: string, type: ActivityType, description: string, itemId?: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      const logRef = collection(db, 'users', userId, 'activityLog');
      await addDoc(logRef, { 
        type, 
        description, 
        itemId: itemId || null, 
        timestamp: serverTimestamp() 
      });
    } catch (error) {
      console.error("Error logging action:", error);
      throw new Error("Kon actie niet loggen");
    }
  }

  /**
   * Add a new debt
   */
  async addDebt(userId: string, debtData: DebtFormData): Promise<string> {
    this.checkRateLimit();
    
    try {
      const ref = await addDoc(collection(db, 'users', userId, 'debts'), { 
        ...debtData, 
        isPaidOff: false 
      });
      
      await this.logUserAction(
        userId, 
        ActivityType.DEBT_ADDED, 
        `Nieuwe schuld '${debtData.creditorName}' toegevoegd.`, 
        ref.id
      );
      
      return ref.id;
    } catch (error) {
      console.error("Error adding debt:", error);
      throw new Error("Kon schuld niet toevoegen");
    }
  }

  /**
   * Update an existing debt
   */
  async updateDebt(userId: string, debt: Debt): Promise<void> {
    this.checkRateLimit();
    
    try {
      const { id, ...debtData } = debt;
      await updateDoc(doc(db, 'users', userId, 'debts', id), debtData);
      
      await this.logUserAction(
        userId, 
        ActivityType.DEBT_UPDATED, 
        `Schuld '${debt.creditorName}' bijgewerkt.`, 
        id
      );
    } catch (error) {
      console.error("Error updating debt:", error);
      throw new Error("Kon schuld niet bijwerken");
    }
  }

  /**
   * Delete a debt
   */
  async deleteDebt(userId: string, debtId: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      await deleteDoc(doc(db, 'users', userId, 'debts', debtId));
      await this.logUserAction(userId, ActivityType.DEBT_DELETED, `Schuld verwijderd.`);
    } catch (error) {
      console.error("Error deleting debt:", error);
      throw new Error("Kon schuld niet verwijderen");
    }
  }

  /**
   * Add a new income
   */
  async addIncome(userId: string, incomeData: IncomeFormData): Promise<string> {
    this.checkRateLimit();
    
    try {
      const ref = await addDoc(collection(db, 'users', userId, 'incomes'), incomeData);
      
      await this.logUserAction(
        userId, 
        ActivityType.INCOME_ADDED, 
        `Inkomst '${incomeData.source}' toegevoegd.`, 
        ref.id
      );
      
      return ref.id;
    } catch (error) {
      console.error("Error adding income:", error);
      throw new Error("Kon inkomst niet toevoegen");
    }
  }

  /**
   * Update an existing income
   */
  async updateIncome(userId: string, income: Income): Promise<void> {
    this.checkRateLimit();
    
    try {
      const { id, ...incomeData } = income;
      await updateDoc(doc(db, 'users', userId, 'incomes', id), incomeData);
      
      await this.logUserAction(
        userId, 
        ActivityType.INCOME_UPDATED, 
        `Inkomst '${income.source}' bijgewerkt.`, 
        id
      );
    } catch (error) {
      console.error("Error updating income:", error);
      throw new Error("Kon inkomst niet bijwerken");
    }
  }

  /**
   * Delete an income
   */
  async deleteIncome(userId: string, incomeId: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      await deleteDoc(doc(db, 'users', userId, 'incomes', incomeId));
      await this.logUserAction(userId, ActivityType.INCOME_DELETED, `Inkomst verwijderd.`);
    } catch (error) {
      console.error("Error deleting income:", error);
      throw new Error("Kon inkomst niet verwijderen");
    }
  }

  /**
   * Add a new expense
   */
  async addExpense(userId: string, expenseData: ExpenseFormData): Promise<string> {
    this.checkRateLimit();
    
    try {
      const ref = await addDoc(collection(db, 'users', userId, 'expenses'), expenseData);
      
      await this.logUserAction(
        userId, 
        ActivityType.EXPENSE_ADDED, 
        `Uitgave '${expenseData.category}' toegevoegd.`, 
        ref.id
      );
      
      return ref.id;
    } catch (error) {
      console.error("Error adding expense:", error);
      throw new Error("Kon uitgave niet toevoegen");
    }
  }

  /**
   * Update an existing expense
   */
  async updateExpense(userId: string, expense: Expense): Promise<void> {
    this.checkRateLimit();
    
    try {
      const { id, ...expenseData } = expense;
      await updateDoc(doc(db, 'users', userId, 'expenses', id), expenseData);
      
      await this.logUserAction(
        userId, 
        ActivityType.EXPENSE_UPDATED, 
        `Uitgave '${expense.category}' bijgewerkt.`, 
        id
      );
    } catch (error) {
      console.error("Error updating expense:", error);
      throw new Error("Kon uitgave niet bijwerken");
    }
  }

  /**
   * Delete an expense
   */
  async deleteExpense(userId: string, expenseId: string): Promise<void> {
    this.checkRateLimit();
    
    try {
      await deleteDoc(doc(db, 'users', userId, 'expenses', expenseId));
      await this.logUserAction(userId, ActivityType.EXPENSE_DELETED, `Uitgave verwijderd.`);
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw new Error("Kon uitgave niet verwijderen");
    }
  }

  /**
   * Log a scheduled payment
   */
  async logScheduledPayment(userId: string, paymentItem: UpcomingPaymentItem): Promise<void> {
    this.checkRateLimit();
    
    try {
      const debtDocRef = doc(db, 'users', userId, 'debts', paymentItem.debtId);
      
      const debtDoc = await getDoc(debtDocRef);
      if (!debtDoc.exists()) {
        throw new Error("Schuld niet gevonden");
      }

      const debtData = debtDoc.data() as Debt;
      const paidOn = debtData.paidOn || [];
      
      if (paidOn.includes(paymentItem.dueDate)) {
        throw new Error("Deze betaling is al geregistreerd");
      }
      
      const newPaidOn = [...paidOn, paymentItem.dueDate];
      const allPayments = generateScheduledPaymentsForDebt({ ...debtData, paidOn: newPaidOn });
      const totalPaid = allPayments.filter(p => p.isPaid).reduce((sum, p) => sum + p.paymentAmount, 0);
      
      const isNowPaidOff = totalPaid >= debtData.totalAmount;

      await updateDoc(debtDocRef, { 
        paidOn: arrayUnion(paymentItem.dueDate), 
        isPaidOff: isNowPaidOff 
      });
      
      await this.logUserAction(
        userId, 
        ActivityType.PAYMENT_LOGGED, 
        `Betaling voor '${paymentItem.debtCreditorName}' gelogd.`, 
        paymentItem.debtId
      );
      
      if (isNowPaidOff) {
        await this.logUserAction(
          userId, 
          ActivityType.DEBT_PAID_OFF, 
          `Schuld '${paymentItem.debtCreditorName}' is volledig afbetaald!`, 
          paymentItem.debtId
        );
      }
    } catch (error) {
      console.error("Error logging payment:", error);
      throw new Error("Kon betaling niet loggen");
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, firebaseUser: FirebaseUser, updatedData: UserFormData): Promise<void> {
    this.checkRateLimit();
    
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, updatedData);
      
      const newDisplayName = `${updatedData.firstName} ${updatedData.lastName}`.trim();
      if (firebaseUser.displayName !== newDisplayName) {
        await updateProfile(firebaseUser, { displayName: newDisplayName });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Kon profiel niet bijwerken");
    }
  }
}

// Export a singleton instance
export const firebaseService = new FirebaseService();