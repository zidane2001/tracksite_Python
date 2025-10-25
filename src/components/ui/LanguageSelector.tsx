import React from 'react';
import { useI18n, LANGUAGES } from '../../utils/i18n';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, isRTL } = useI18n();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-8 rounded-full">
          <span className="text-lg">
            {LANGUAGES.find(lang => lang.code === language)?.flag || '🌐'}
          </span>
        </div>
      </div>
      <ul tabIndex={0} className={`menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow bg-base-100 rounded-box w-52 ${isRTL ? 'text-right' : ''}`}>
        {LANGUAGES.map((lang) => (
          <li key={lang.code}>
            <a
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                language === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <div>
                <div className="font-medium">{lang.nativeName}</div>
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