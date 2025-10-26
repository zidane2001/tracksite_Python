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

    try {
      await onLogin(code);
    } catch (error) {
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
            <div className="avatar">
              <div className="w-20 rounded-full bg-base-100">
                <ShieldIcon className="h-10 w-10 text-primary" />
              </div>
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
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <LockIcon className="h-12 w-12 text-base-content/60 mx-auto mb-4" />
              <h2 className="card-title justify-center">
                Authentification Requise
              </h2>
              <p className="text-base-content/70 text-sm mt-1">
                Entrez le code d'accès pour continuer
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-control mb-6">
                <label htmlFor="access-code" className="label">
                  <span className="label-text">Code d'Accès</span>
                </label>
                <div className="relative">
                  <input
                    type={showCode ? 'text' : 'password'}
                    id="access-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`input input-bordered w-full text-center text-lg font-mono tracking-wider ${
                      error ? 'input-error' : ''
                    }`}
                    placeholder="••••••••"
                    maxLength={8}
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="btn btn-ghost btn-sm absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showCode ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
                {error && (
                  <div className="alert alert-error mt-2">
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="card-actions justify-end">
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 8}
                  className={`btn btn-primary w-full ${
                    isLoading || code.length !== 8 ? 'btn-disabled' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Vérification...
                    </>
                  ) : (
                    'Accéder au Portail'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Info */}
          <div className="divider"></div>
          <div className="text-center">
            <div className="flex items-center justify-center text-xs text-base-content/60 mb-2">
              <ShieldIcon className="h-4 w-4 mr-1" />
              Connexion Sécurisée
            </div>
            <p className="text-xs text-base-content/50">
              Cet accès est réservé au personnel autorisé uniquement.
              Toutes les tentatives de connexion sont enregistrées.
            </p>
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