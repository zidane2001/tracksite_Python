import React from 'react';
import { useI18n, LANGUAGES } from '../../utils/i18n';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, isRTL } = useI18n();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm px-2 py-1 h-auto min-h-0">
        <div className="flex items-center gap-1">
          <span className="text-base">
            {LANGUAGES.find(lang => lang.code === language)?.flag || '🌐'}
          </span>
          <span className="text-xs hidden sm:inline">
            {LANGUAGES.find(lang => lang.code === language)?.code?.toUpperCase() || 'EN'}
          </span>
        </div>
      </div>
      <ul tabIndex={0} className={`menu menu-sm dropdown-content mt-2 z-[100] p-2 shadow-lg bg-base-100 rounded-lg w-48 border ${isRTL ? 'text-right' : ''}`}>
        {LANGUAGES.map((lang) => (
          <li key={lang.code}>
            <a
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors cursor-pointer ${
                language === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <div>
                <div className="font-medium text-sm">{lang.nativeName}</div>
                <div className="text-xs opacity-70">{lang.name}</div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSelector;