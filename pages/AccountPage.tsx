
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { User } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import DatePickerInput from '@/components/ui/DatePickerInput';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { UserIcon as ProfileIcon, EnvelopeIcon, CalendarDaysIcon, SunIcon, MoonIcon, PencilIcon, LogoutIcon } from '@/components/ui/Icons';
import { formatDate } from '@/utils/helpers';

interface AccountPageProps {
  currentUser: User | null;
  updateUserProfile: (updatedData: Partial<Omit<User, 'id' | 'email'>>) => Promise<void>;
}

const AccountPage: React.FC<AccountPageProps> = ({ currentUser, updateUserProfile }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Omit<User, 'id' | 'email'>>>({
    firstName: '',
    lastName: '',
    birthDate: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        birthDate: currentUser.birthDate,
      });
    }
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, birthDate: date }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!formData.firstName || !formData.lastName || !formData.birthDate) {
      setError("Voornaam, achternaam en geboortedatum zijn verplicht.");
      return;
    }
    try {
      await updateUserProfile(formData);
      setSuccessMessage("Profiel succesvol bijgewerkt!");
      setIsEditModalOpen(false);
       setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Kon profiel niet bijwerken.");
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Kon niet uitloggen. Probeer het opnieuw.");
    }
  };

  if (!currentUser) {
    return (
      <GlassCard className="text-center p-8">
        <p className="text-lg font-medium">Laden van gebruikersgegevens...</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 font-light">
      <GlassCard as="section">
        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 mb-6">
          <div className="p-3 bg-light-surface/70 dark:bg-dark-surface/70 rounded-full shadow-lg">
            <ProfileIcon className="text-4xl text-brand-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-light-text-primary dark:text-dark-text-primary text-center sm:text-left">
              Hallo, {currentUser.firstName}!
            </h1>
            <p className="text-md text-light-text-secondary dark:text-dark-text-secondary text-center sm:text-left">
              Jouw instellingen voor een succesvolle financiële reis.
            </p>
          </div>
        </div>

        {successMessage && <p className="mb-4 text-sm text-light-success dark:text-dark-success bg-light-success/10 p-2 rounded-md font-medium">{successMessage}</p>}
        {error && !isEditModalOpen && <p className="mb-4 text-sm text-light-danger dark:text-dark-danger bg-light-danger/10 p-2 rounded-md font-light">{error}</p>}

        <div className="space-y-4">
          <InfoRow icon={<ProfileIcon />} label="Voornaam" value={currentUser.firstName} />
          <InfoRow icon={<ProfileIcon />} label="Achternaam" value={currentUser.lastName} />
          <InfoRow icon={<EnvelopeIcon />} label="E-mailadres" value={currentUser.email || ''} />
          <InfoRow icon={<CalendarDaysIcon />} label="Geboortedatum" value={formatDate(currentUser.birthDate)} />
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button 
                variant="primary" 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto text-sm"
            >
                <PencilIcon className="mr-2" /> Gegevens Wijzigen
            </Button>
             <Button
                onClick={toggleTheme}
                variant="secondary"
                aria-label="Thema wisselen"
                title="Thema wisselen"
                className="w-full sm:w-auto text-sm"
              >
                {theme === 'dark' ? <SunIcon className="text-xl mr-2" /> : <MoonIcon className="text-xl mr-2" />}
                <span className="font-medium">{theme === 'dark' ? 'Licht Thema' : 'Donker Thema'}</span>
              </Button>
               <Button 
                variant="danger" 
                onClick={handleLogout} 
                className="w-full sm:w-auto text-sm"
            >
                <LogoutIcon className="mr-2" /> Log Uit
            </Button>
        </div>
      </GlassCard>
      
      <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setError(null); }} title="Accountgegevens Wijzigen" size="lg">
        <form onSubmit={handleProfileUpdate} className="space-y-4 font-light">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Voornaam</label>
            <GlassCard pressed className="flex items-center px-3 !py-0">
              <ProfileIcon className="text-lg mr-3 shrink-0 text-brand-accent" />
              <Input id="firstName" name="firstName" type="text" value={formData.firstName || ''} onChange={handleInputChange} required label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className="!bg-transparent !border-none focus:!ring-0 !px-0 !py-2.5"/>
            </GlassCard>
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Achternaam</label>
            <GlassCard pressed className="flex items-center px-3 !py-0">
              <ProfileIcon className="text-lg mr-3 shrink-0 text-brand-accent" />
              <Input id="lastName" name="lastName" type="text" value={formData.lastName || ''} onChange={handleInputChange} required label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className="!bg-transparent !border-none focus:!ring-0 !px-0 !py-2.5"/>
            </GlassCard>
          </div>
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">Geboortedatum</label>
            <GlassCard pressed className="flex items-center px-3 !py-0">
              <CalendarDaysIcon className="text-lg mr-3 shrink-0 text-brand-accent" />
              <DatePickerInput id="birthDate" value={formData.birthDate || ''} onChange={handleDateChange} required max={new Date().toISOString().split("T")[0]} label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className="!bg-transparent !border-none focus:!ring-0 !px-0 !py-2.5 cursor-pointer"/>
            </GlassCard>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1.5">E-mailadres (niet wijzigbaar)</label>
            <GlassCard pressed className="flex items-center px-3 !py-0 opacity-60">
              <EnvelopeIcon className="text-lg mr-3 shrink-0 text-brand-accent" />
              <Input id="email" name="email" type="email" value={currentUser.email || ''} disabled readOnly label={undefined} icon={undefined} containerClassName="!mb-0 w-full" className="!bg-transparent !border-none focus:!ring-0 !px-0 !py-2.5 cursor-not-allowed"/>
            </GlassCard>
          </div>

          {error && <p className="text-sm text-light-danger dark:text-dark-danger bg-light-danger/10 p-2 rounded-md font-light">{error}</p>}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-3">
            <Button type="button" variant="secondary" onClick={() => { setIsEditModalOpen(false); setError(null); }} fullWidth className="sm:w-auto">
              Annuleren
            </Button>
            <Button type="submit" variant="primary" fullWidth className="sm:w-auto">
              Opslaan
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <GlassCard pressed className="!p-3 flex items-center">
    <span className="text-brand-accent mr-3 text-lg">{icon}</span>
    <div>
      <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
      <p className="text-sm text-light-text-primary dark:text-dark-text-primary">{value}</p>
    </div>
  </GlassCard>
);

export default AccountPage;