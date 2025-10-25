import React from 'react';
import { I18nProvider } from './utils/i18n';
import { UserLayout } from './layouts/UserLayout';
import { HomePage } from './pages/HomePage';

export function App() {
  return (
    <I18nProvider>
      <div className="w-full">
        <UserLayout />
      </div>
    </I18nProvider>
  );
}