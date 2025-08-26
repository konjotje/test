import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import DatePickerInput from '@/components/ui/DatePickerInput';
import Spinner from '@/components/ui/Spinner';
import { 
    EnvelopeIcon, 
    UserIcon, 
    CalendarDaysIcon, 
    ApartmentIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@/components/ui/Icons';
import { schuldenmaatjeAvatarPath } from '@/utils/ai/prompts';
import { dutchMunicipalities } from '@/utils/dutchMunicipalities';

interface RegistrationData {
    municipality: string | number;
    firstName: string;
    lastName: string;
    birthDate: string;
    email: string;
    password: string;
}

const RegisterPage: React.FC = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [formData, setFormData] = useState<RegistrationData>({
        municipality: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const updateFormData = (field: keyof RegistrationData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep1 = () => {
        if (!formData.municipality || !formData.firstName || !formData.lastName || !formData.birthDate) {
            setError('Alle velden met een * zijn verplicht.');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.email || !formData.password) {
            setError('Alle velden met een * zijn verplicht.');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Wachtwoord moet minimaal 6 tekens lang zijn.');
            return false;
        }
        return true;
    };

    const handleNextStep = () => {
        setError(null);
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handlePrevStep = () => {
        setError(null);
        setStep(1);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!validateStep2()) {
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const displayName = `${formData.firstName} ${formData.lastName}`.trim();
            
            // Update Firebase Auth user profile
            await updateProfile(userCredential.user, {
                displayName: displayName,
            });

            // Create user document in Firestore with proper typing
            const userData: Omit<User, 'id'> = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthDate: formData.birthDate,
                municipality: formData.municipality.toString(), // Ensure municipality is stored as string
                email: userCredential.user.email,
                createdAt: serverTimestamp(),
            };

            await setDoc(doc(db, "users", userCredential.user.uid), userData);
            
            navigate('/dashboard');
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Dit e-mailadres is al in gebruik.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Voer een geldig e-mailadres in.');
            } else {
                setError('Er is een onbekende fout opgetreden. Probeer het opnieuw.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/achtergrondje.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="w-full max-w-6xl">
                <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg">
                    <div className="flex flex-col lg:flex-row items-stretch">
                        {/* Formulier sectie - Links */}
                        <div className="flex-1 p-6 lg:p-12">
                            <div className="max-w-md mx-auto">
                                <Link 
                                    to="/" 
                                    className="inline-flex items-center px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all mb-8"
                                >
                                    <span className="material-symbols-rounded mr-2">arrow_back</span>
                                    Terug naar Home
                                </Link>
                                                                <div className="text-center mb-6">
                                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                                        Maak een Account
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Zet de eerste stap naar een schuldenvrije toekomst.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 text-center text-sm text-light-danger dark:text-dark-danger bg-light-danger/10 p-4 rounded-lg font-medium border border-light-danger/20">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleRegister} className="space-y-4">
                                    {step === 1 ? (
                                        <>
                                            <Select
                                                id="municipality"
                                                label="Gemeente *"
                                                options={dutchMunicipalities}
                                                value={formData.municipality}
                                                onChange={(value) => updateFormData('municipality', value)}
                                                placeholder="Selecteer je gemeente"
                                                isSearchable={true}
                                                required
                                                icon={<ApartmentIcon />}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <Input
                                                    id="firstName"
                                                    type="text"
                                                    label="Voornaam *"
                                                    value={formData.firstName}
                                                    onChange={(e) => updateFormData('firstName', e.target.value)}
                                                    required
                                                    placeholder="Jouw voornaam"
                                                    icon={<UserIcon />}
                                                />
                                                <Input
                                                    id="lastName"
                                                    type="text"
                                                    label="Achternaam *"
                                                    value={formData.lastName}
                                                    onChange={(e) => updateFormData('lastName', e.target.value)}
                                                    required
                                                    placeholder="Jouw achternaam"
                                                    icon={<UserIcon />}
                                                />
                                            </div>
                                            <DatePickerInput
                                                id="birthDate"
                                                label="Geboortedatum *"
                                                value={formData.birthDate}
                                                onChange={(date) => updateFormData('birthDate', date)}
                                                icon={<CalendarDaysIcon />}
                                                max={new Date().toISOString().split("T")[0]}
                                                startView="years"
                                                required
                                            />
                                            <div className="flex items-center justify-between mt-6">
                                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                    Heb je al een account?{' '}
                                                    <Link to="/login" className="font-medium text-brand-accent hover:underline">
                                                        Log hier in
                                                    </Link>
                                                </p>
                                                <Button 
                                                    type="button"
                                                    variant="primary"
                                                    onClick={handleNextStep}
                                                    className="py-3 px-6"
                                                >
                                                    <span className="flex items-center">
                                                        Volgende
                                                        <ChevronRightIcon className="ml-2 h-5 w-5" />
                                                    </span>
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Input
                                                id="email"
                                                type="email"
                                                label="E-mailadres *"
                                                value={formData.email}
                                                onChange={(e) => updateFormData('email', e.target.value)}
                                                required
                                                placeholder="jouw.email@adres.nl"
                                                icon={<EnvelopeIcon />}
                                            />
                                            <Input
                                                id="password"
                                                type="password"
                                                label="Wachtwoord *"
                                                value={formData.password}
                                                onChange={(e) => updateFormData('password', e.target.value)}
                                                required
                                                placeholder="Minimaal 6 tekens"
                                                icon={<span className="material-symbols-rounded text-lg">lock</span>}
                                            />
                                            <div className="flex justify-between">
                                                <Button 
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handlePrevStep}
                                                    className="py-3"
                                                >
                                                    <span className="flex items-center">
                                                        <ChevronLeftIcon className="mr-2 h-5 w-5" />
                                                        Vorige
                                                    </span>
                                                </Button>
                                                <Button 
                                                    type="submit" 
                                                    variant="primary"
                                                    disabled={isLoading}
                                                    className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all duration-200"
                                                >
                                                    {isLoading ? (
                                                        <span className="flex items-center">
                                                            <div className="mr-2">
                                                                <Spinner size="sm" />
                                                            </div>
                                                            Registreren...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center">
                                                            Registreer
                                                            <ChevronRightIcon className="ml-2 h-5 w-5" />
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Afbeelding sectie - Rechts */}
                        <div className="hidden lg:block w-1/2 relative bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 dark:from-brand-accent/20 dark:to-brand-accent/10">
                            <div className="absolute inset-0 flex items-center justify-center p-12">
                                <img 
                                    src="/images/schuldhulpje.nl.webp"
                                    alt="Schuldhulpje.nl Hero"
                                    className="w-full h-full object-contain rounded-2xl drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;