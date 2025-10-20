import React, { useState } from 'react';
import { ShieldIcon, LockIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (code: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (code === '22022017') {
      onLogin(code);
    } else {
      setError('Code d\'accès incorrect. Veuillez réessayer.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <ShieldIcon className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Portail Administrateur
          </h1>
          <p className="text-blue-100">
            Accès sécurisé à la gestion COLISSELECT
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-6">
            <LockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">
              Authentification Requise
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Entrez le code d'accès pour continuer
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-2">
                Code d'Accès
              </label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  id="access-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-center text-lg font-mono tracking-wider ${
                    error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                  maxLength={8}
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCode ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 8}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                isLoading || code.length !== 8
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Vérification...
                </div>
              ) : (
                'Accéder au Portail'
              )}
            </button>
          </form>

          {/* Security Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                <ShieldIcon className="h-4 w-4 mr-1" />
                Connexion Sécurisée
              </div>
              <p className="text-xs text-gray-400">
                Cet accès est réservé au personnel autorisé uniquement.
                Toutes les tentatives de connexion sont enregistrées.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            © 2025 COLISSELECT - Système de Gestion Logistique
          </p>
        </div>
      </div>
    </div>
  );
};