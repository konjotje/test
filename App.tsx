

import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Debt, Income, Expense, ActivityLogItem, User, UpcomingPaymentItem, UserFormData } from './types';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { firebaseService } from './services/FirebaseService';
import { useSuccessToast, useErrorToast } from './components/ui/Toast';
import { useAsyncOperation } from './hooks/useAsyncOperation';

// Pages
import DashboardPage from '@/pages/DashboardPage';
import DebtsPage from './pages/DebtsPage';
import FinancesPage from './pages/FinancesPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AccountPage from '@/pages/AccountPage';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import OndersteuningPage from './pages/Ondersteuning';
// Components
import { SunIcon, MoonIcon, CreditCardIcon, ChartBarIcon, CurrencyDollarIcon, SmartToyIcon, UserIcon, ReceiptLongIcon } from './components/ui/Icons';
import Button from './components/ui/Button';
import GlassCard from './components/ui/GlassCard';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { PaymentsPage } from './pages/PaymentsPage';
import { HandshakeIcon } from './components/ui/Icons'; // Assuming HandshakeIcon is in your Icons component file

/**
 * Navigation configuration
 */
const SIDEBAR_NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { path: '/schulden', label: 'Schulden', icon: CreditCardIcon },
  { path: '/betalingen', label: 'Betalingen', icon: ReceiptLongIcon },
  { path: '/financien', label: 'Financiën', icon: CurrencyDollarIcon },
  { path: '/ondersteuning', label: 'Ondersteuning', icon: HandshakeIcon },
  { path: '/account', label: 'Account', icon: UserIcon },
] as const;

const MOBILE_NAV_ITEMS = [
  { path: '/schulden', label: 'Schulden', icon: CreditCardIcon },
  { path: '/betalingen', label: 'Betalingen', icon: ReceiptLongIcon },
  { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { path: '/financien', label: 'Financiën', icon: CurrencyDollarIcon },
  { path: '/ai-assistent', label: 'Assistent', icon: SmartToyIcon },
] as const;

/**
 * Main application layout for authenticated users
 */
const MainApp: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { user: firebaseUser } = useAuth();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  
  // State management
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);

  // Async operations
  const { execute: executeAsync, isLoading: isOperationLoading } = useAsyncOperation();

  /**
   * Subscribe to real-time data updates
   */
  useEffect(() => {
    if (!firebaseUser) {
      // Reset state when user logs out
      setCurrentUser(null);
      setDebts([]);
      setIncomes([]);
      setExpenses([]);
      setActivityLog([]);
      return;
    }

    const unsubscribes: (() => void)[] = [];

    // Subscribe to user profile
    unsubscribes.push(
      firebaseService.subscribeToUser(firebaseUser.uid, (user) => {
        setCurrentUser(user);
        if (!user) {
          console.warn("Gebruikersprofiel niet gevonden");
        }
      })
    );

    // Subscribe to collections
    unsubscribes.push(
      firebaseService.subscribeToDebts(firebaseUser.uid, setDebts),
      firebaseService.subscribeToIncomes(firebaseUser.uid, setIncomes),
      firebaseService.subscribeToExpenses(firebaseUser.uid, setExpenses),
      firebaseService.subscribeToActivityLog(firebaseUser.uid, setActivityLog)
    );

    // Cleanup subscriptions
    return () => unsubscribes.forEach(unsub => unsub());
  }, [firebaseUser]);

  /**
   * Data modification functions with error handling
   */
  const dataOperations = useMemo(() => {
    if (!firebaseUser) {
      // Return empty functions that do nothing when no user is logged in
      return {
        addDebt: async () => {},
        updateDebt: async () => {},
        deleteDebt: async () => {},
        addIncome: async () => {},
        updateIncome: async () => {},
        deleteIncome: async () => {},
        addExpense: async () => {},
        updateExpense: async () => {},
        deleteExpense: async () => {},
        logScheduledPayment: async () => {},
        updateUserProfile: async () => {},
      };
    }

    return {
      // Debt operations
      addDebt: async (debtData: Omit<Debt, 'id' | 'isPaidOff'>) => {
        await executeAsync(
          async () => {
            await firebaseService.addDebt(firebaseUser.uid, debtData);
          },
          () => showSuccess('Schuld toegevoegd', 'De nieuwe schuld is succesvol toegevoegd'),
          (error) => showError('Fout bij toevoegen schuld', error)
        );
      },

      updateDebt: async (debt: Debt) => {
        await executeAsync(
          async () => {
            await firebaseService.updateDebt(firebaseUser.uid, debt);
          },
          () => showSuccess('Schuld bijgewerkt', 'De schuld is succesvol bijgewerkt'),
          (error) => showError('Fout bij bijwerken schuld', error)
        );
      },

      deleteDebt: async (id: string) => {
        await executeAsync(
          async () => {
            await firebaseService.deleteDebt(firebaseUser.uid, id);
          },
          () => showSuccess('Schuld verwijderd', 'De schuld is succesvol verwijderd'),
          (error) => showError('Fout bij verwijderen schuld', error)
        );
      },

      // Income operations
      addIncome: async (incomeData: Omit<Income, 'id'>) => {
        await executeAsync(
          async () => {
            await firebaseService.addIncome(firebaseUser.uid, incomeData);
          },
          () => showSuccess('Inkomst toegevoegd', 'De nieuwe inkomst is succesvol toegevoegd'),
          (error) => showError('Fout bij toevoegen inkomst', error)
        );
      },

      updateIncome: async (income: Income) => {
        await executeAsync(
          async () => {
            await firebaseService.updateIncome(firebaseUser.uid, income);
          },
          () => showSuccess('Inkomst bijgewerkt', 'De inkomst is succesvol bijgewerkt'),
          (error) => showError('Fout bij bijwerken inkomst', error)
        );
      },

      deleteIncome: async (id: string) => {
        await executeAsync(
          async () => {
            await firebaseService.deleteIncome(firebaseUser.uid, id);
          },
          () => showSuccess('Inkomst verwijderd', 'De inkomst is succesvol verwijderd'),
          (error) => showError('Fout bij verwijderen inkomst', error)
        );
      },

      // Expense operations
      addExpense: async (expenseData: Omit<Expense, 'id'>) => {
        await executeAsync(
          async () => {
            await firebaseService.addExpense(firebaseUser.uid, expenseData);
          },
          () => showSuccess('Uitgave toegevoegd', 'De nieuwe uitgave is succesvol toegevoegd'),
          (error) => showError('Fout bij toevoegen uitgave', error)
        );
      },

      updateExpense: async (expense: Expense) => {
        await executeAsync(
          async () => {
            await firebaseService.updateExpense(firebaseUser.uid, expense);
          },
          () => showSuccess('Uitgave bijgewerkt', 'De uitgave is succesvol bijgewerkt'),
          (error) => showError('Fout bij bijwerken uitgave', error)
        );
      },

      deleteExpense: async (id: string) => {
        await executeAsync(
          async () => {
            await firebaseService.deleteExpense(firebaseUser.uid, id);
          },
          () => showSuccess('Uitgave verwijderd', 'De uitgave is succesvol verwijderd'),
          (error) => showError('Fout bij verwijderen uitgave', error)
        );
      },

      // Payment operations
      logScheduledPayment: async (paymentItem: UpcomingPaymentItem) => {
        await executeAsync(
          async () => {
            await firebaseService.logScheduledPayment(firebaseUser.uid, paymentItem);
          },
          () => showSuccess('Betaling geregistreerd', 'De betaling is succesvol geregistreerd'),
          (error) => showError('Fout bij registreren betaling', error)
        );
      },

      // User profile operations
      updateUserProfile: async (updatedData: Partial<Omit<User, 'id' | 'email'>>) => {
        await executeAsync(
          async () => {
            await firebaseService.updateUserProfile(firebaseUser.uid, firebaseUser, updatedData as UserFormData);
          },
          () => showSuccess('Profiel bijgewerkt', 'Je profiel is succesvol bijgewerkt'),
          (error) => showError('Fout bij bijwerken profiel', error)
        );
      },
    };
  }, [firebaseUser, executeAsync, showSuccess, showError]);

  // Loading state
  if (!currentUser && firebaseUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-light-bg dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-light-text-primary dark:text-dark-text-primary">
            Gebruikersprofiel laden...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if on root path
  if (location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen text-light-text-primary dark:text-dark-text-primary transition-colors duration-300 font-light">
        {/* Desktop Sidebar */}
        <aside className="hidden xl:flex fixed top-4 bottom-4 left-4 z-40 w-48">
          <GlassCard transparencyLevel="high" className="w-full h-full flex flex-col items-center p-4">
            <nav className="flex-grow space-y-2 w-full">
              {SIDEBAR_NAV_ITEMS.map(item => {
                const isActive = location.pathname === item.path;
                const IconComponent = item.icon;
                
                return (
                  <Button 
                    key={item.path} 
                    as={Link} 
                    to={item.path} 
                    variant={isActive ? 'secondary' : 'ghost'} 
                    fullWidth 
                    className="justify-start !p-3 text-xs" 
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className={`transition-colors duration-200 mr-4 ${isActive ? 'text-brand-accent' : ''}`} role="img" aria-hidden="true">
                      {IconComponent ? <IconComponent className="text-2xl" /> : null}
                    </span>
                    <span className={`font-medium transition-colors duration-200 ${isActive ? 'text-light-text-primary dark:text-dark-text-primary' : ''}`}>
                      {item.label}
                    </span>
                  </Button>
                );
              })}
            </nav>
            
            {/* Theme toggle and footer */}
            <div className="mt-auto p-4 w-full">
              <Button 
                onClick={toggleTheme} 
                className="w-full text-xs flex flex-row items-center justify-start !p-3" 
                variant="secondary" 
                aria-label="Thema wisselen" 
                title="Thema wisselen"
                disabled={isOperationLoading}
              >
                {theme === 'dark' ? (
                  <SunIcon className="text-xl mr-3" />
                ) : (
                  <MoonIcon className="text-xl mr-3" />
                )}
                <span className="font-medium">
                  {theme === 'dark' ? 'Licht' : 'Donker'}
                </span>
              </Button>
              <div className="pt-4 text-center">
                <p className="text-xs font-light text-light-text-secondary dark:text-dark-text-secondary">
                  © {new Date().getFullYear()} Schuldhulpje
                </p>
              </div>
            </div>
          </GlassCard>
        </aside>

        {/* Main Content */}
        <div className="xl:ml-[14rem] xl:mr-[26rem]">
          <main className="w-full min-h-screen p-3 sm:p-4 xl:p-6 pb-20 xl:pb-8">
            <Routes>
              <Route 
                path="/dashboard" 
                element={
                  <DashboardPage 
                    currentUser={currentUser!} 
                    debts={debts} 
                    incomes={incomes} 
                    expenses={expenses} 
                    activityLog={activityLog} 
                  />
                } 
              />
              <Route 
                path="/schulden" 
                element={
                  <DebtsPage 
                    debts={debts} 
                    addDebt={dataOperations.addDebt} 
                    updateDebt={dataOperations.updateDebt} 
                    deleteDebt={dataOperations.deleteDebt} 
                    currentUser={currentUser!} 
                    incomes={incomes} 
                    expenses={expenses} 
                  />
                } 
              />
              <Route 
                path="/betalingen" 
                element={

                  <PaymentsPage 
                    debts={debts} 
                    logScheduledPayment={dataOperations.logScheduledPayment} 
                  />
                } 
              />
              <Route 
                path="/financien" 
                element={
                  <FinancesPage 
                    incomes={incomes} 
                    addIncome={dataOperations.addIncome} 
                    updateIncome={dataOperations.updateIncome} 
                    deleteIncome={dataOperations.deleteIncome} 
                    expenses={expenses} 
                    addExpense={dataOperations.addExpense} 
                    updateExpense={dataOperations.updateExpense} 
                    deleteExpense={dataOperations.deleteExpense} 
                  />
                } 
              />
              <Route 
                path="/ai-assistent" 
                element={
                  <div className="xl:hidden fixed inset-0 bottom-16 p-2 sm:p-4">
                    <AIAssistantPage 
                      currentUser={currentUser!} 
                      debts={debts} 
                      incomes={incomes} 
                      expenses={expenses} 
                      addDebt={dataOperations.addDebt} 
                      addIncome={dataOperations.addIncome} 
                      addExpense={dataOperations.addExpense} 
                    />
                  </div>
                } 
              />
              <Route 
                path="/account" 
                element={
                  <AccountPage 
                    currentUser={currentUser!} 
                    updateUserProfile={dataOperations.updateUserProfile} 
                  />
                } 
              />
 <Route path="/ondersteuning" element={<OndersteuningPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>

        {/* Desktop AI Assistant Sidebar */}
        <aside className="hidden xl:flex fixed top-4 bottom-4 right-4 z-30 w-[24rem] flex-shrink-0">
          <AIAssistantPage 
            currentUser={currentUser!} 
            debts={debts} 
            incomes={incomes} 
            expenses={expenses} 
            addDebt={dataOperations.addDebt} 
            addIncome={dataOperations.addIncome} 
            addExpense={dataOperations.addExpense} 
          />
        </aside>

        {/* Mobile Navigation */}
        <nav className="xl:hidden fixed bottom-0 left-0 right-0 h-16 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-md border-t border-light-shadow-dark/20 dark:border-dark-shadow-light/20 flex items-center justify-around z-50 rounded-t-2xl">
          {MOBILE_NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            const IconComponent = item.icon;
            
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex-1 flex flex-col items-center justify-center h-full p-1 rounded-md transition-colors ${
                  isActive 
                    ? 'text-brand-accent' 
                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-brand-accent/70'
                } ${isOperationLoading ? 'pointer-events-none opacity-50' : ''}`}
                aria-label={item.label}
              >
                {IconComponent ? <IconComponent className="text-2xl" /> : null}
                <span className={`text-[0.6rem] leading-tight mt-0.5 ${isActive ? 'font-medium' : 'font-light'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ErrorBoundary>
  );
};

/**
 * Root App component with authentication routing
 */
const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-light-bg dark:bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent mx-auto mb-4"></div>
          <p className="text-light-text-primary dark:text-dark-text-primary">
            Authenticatie controleren...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {user ? (
        <>
          <Route path="/*" element={<MainApp />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

export default App;