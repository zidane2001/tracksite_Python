import React, { useState } from 'react';
import { authApi, AuthResponse } from '../../utils/api';

interface UserRegisterProps {
  onRegister: (user: AuthResponse) => void;
  onSwitchToLogin: () => void;
}

export const UserRegister: React.FC<UserRegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const user = await authApi.register(name, email, password);
      onRegister(user);
    } catch (err) {
      setError('Erreur lors de l\'inscription. L\'email existe peut-être déjà.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('https://media.istockphoto.com/id/2174127214/fr/photo/logistics-import-export-of-containers-cargo-freight-ship-truck-transport-container-on-highway.jpg?s=2048x2048&w=is&k=20&c=7JAtxePy3kpA33CGyaaglYtvoClhXroeLlMbOjUH8_E=')`
        }}
      ></div>
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-base-100/50"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <div className="avatar mb-6">
            <div className="w-20 rounded-2xl bg-gradient-to-br from-success to-success-focus">
              <svg className="h-10 w-10 text-success-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-base-content mb-2">
            Créer un compte
          </h2>
          <p className="text-base-content/70">
            Rejoignez notre communauté de livraison
          </p>
        </div>

        {/* Register Form */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="form-control">
                <label htmlFor="name" className="label">
                  <span className="label-text">Nom complet</span>
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="input input-bordered w-full text-lg"
                    placeholder="Votre nom complet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <svg className="absolute right-3 top-3.5 h-5 w-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="email" className="label">
                  <span className="label-text">Adresse email</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input input-bordered w-full text-lg"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <svg className="absolute right-3 top-3.5 h-5 w-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="password" className="label">
                  <span className="label-text">Mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="input input-bordered w-full text-lg"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <svg className="absolute right-3 top-3.5 h-5 w-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <div className="form-control">
                <label htmlFor="confirmPassword" className="label">
                  <span className="label-text">Confirmer le mot de passe</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="input input-bordered w-full text-lg"
                    placeholder="Répétez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <svg className="absolute right-3 top-3.5 h-5 w-5 text-base-content/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="card-actions justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-success w-full ${loading ? 'loading' : ''}`}
                >
                  {loading ? 'Création du compte...' : 'Créer mon compte'}
                </button>
              </div>
            </form>

          <div className="divider"></div>
          <div className="text-center">
            <p className="text-sm text-base-content/70">
              Déjà un compte ?{' '}
              <button
                onClick={onSwitchToLogin}
                className="link link-success"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <div className="avatar mb-3">
                <div className="w-14 rounded-2xl bg-primary/10">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="card-title justify-center text-sm">Suivi personnalisé</h3>
              <p className="text-xs text-base-content/60">Votre historique complet</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <div className="avatar mb-3">
                <div className="w-14 rounded-2xl bg-success/10">
                  <svg className="w-7 h-7 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="card-title justify-center text-sm">Données sécurisées</h3>
              <p className="text-xs text-base-content/60">Confidentialité garantie</p>
            </div>
          </div>
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body text-center">
              <div className="avatar mb-3">
                <div className="w-14 rounded-2xl bg-secondary/10">
                  <svg className="w-7 h-7 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <h3 className="card-title justify-center text-sm">Service rapide</h3>
              <p className="text-xs text-base-content/60">Inscription instantanée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};