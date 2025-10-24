
import React, { useState } from 'react';
// FIX: Changed import to be a relative path.
import { DentalIcon, UserIcon, PasswordIcon } from './icons';
// FIX: Changed import to be a relative path.
import type { AppSettings } from '../types';

interface LoginPageProps {
    onLogin: (success: boolean) => void;
    onNavigateToLanding: () => void;
    settings: AppSettings;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToLanding, settings }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (username === 'admin' && password === 'admin') {
            onLogin(true);
        } else {
            setError('Usuario o contraseña incorrectos.');
            onLogin(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 flex font-sans">
            {/* Left Side - Image */}
            <div className="hidden lg:flex w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url('${settings.loginImageUrl}')` }}>
                <div className="absolute inset-0 bg-blue-900/60"></div>
                <div className="relative z-10 flex flex-col justify-center items-center text-white text-center p-12">
                     <div className="flex items-center space-x-3 mb-6">
                        <div className="w-16 h-16"><DentalIcon /></div>
                        <h1 className="text-6xl font-bold tracking-tight">Kiru</h1>
                     </div>
                    <p className="text-2xl font-light max-w-sm">Gestión Profesional para una Sonrisa Perfecta.</p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    <div className="text-center lg:text-left mb-10">
                         <div className="flex items-center space-x-2 mb-4 justify-center lg:hidden">
                            <div className="w-10 h-10 text-blue-600 dark:text-blue-400"><DentalIcon /></div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Kiru</h1>
                         </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Bienvenido de Vuelta</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Ingresa tus credenciales para acceder al panel.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Usuario</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <UserIcon />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 py-3 pl-11 pr-4 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-colors"
                                    placeholder="admin"
                                />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="password"className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                                    <PasswordIcon />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 py-3 pl-11 pr-4 text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        
                        {error && <p className="text-sm text-red-600 dark:text-red-500 text-center font-medium">{error}</p>}
                        
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                            Iniciar Sesión
                        </button>
                    </form>

                     <div className="text-center mt-8">
                        <button onClick={onNavigateToLanding} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            &larr; Volver a la página principal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};