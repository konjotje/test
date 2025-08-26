import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import GlassCard from '@/components/ui/GlassCard';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { EnvelopeIcon } from '@/components/ui/Icons';
import { schuldenmaatjeAvatarPath } from '@/utils/ai/prompts';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email || !password) {
            setError('Vul je e-mailadres en wachtwoord in.');
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/dashboard');
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('Er is geen account gevonden met dit e-mailadres.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Ongeldige inloggegevens. Controleer je e-mail en wachtwoord.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Het e-mailadres is ongeldig. Controleer het e-mailadres.');
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
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                                        Welkom terug!
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Log in om verder te gaan met je financiële reis.
                                    </p>
                                </div>

                                {error && (
                                    <div className="mb-6 text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl font-medium border border-red-100 dark:border-red-800/50">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <Input
                                            id="email"
                                            type="email"
                                            label="E-mailadres"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="jouw.email@adres.nl"
                                            icon={<EnvelopeIcon className="text-gray-400" />}
                                            className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            id="password"
                                            type="password"
                                            label="Wachtwoord"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••"
                                            icon={<span className="material-symbols-rounded text-lg text-gray-400">lock</span>}
                                            className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        fullWidth 
                                        disabled={isLoading}
                                        className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all duration-200"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <Spinner size="sm" className="mr-2" />
                                                Inloggen...
                                            </span>
                                        ) : 'Log In'}
                                    </Button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Nog geen account?{' '}
                                        <Link to="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                                            Registreer hier
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Afbeelding sectie - Rechts */}
                        <div className="hidden lg:block w-1/2 relative bg-gradient-to-br from-blue-500/10 to-purple-500/10">
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

export default LoginPage;