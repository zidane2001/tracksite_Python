import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useI18n, LANGUAGES } from '../../utils/i18n';

const LanguageSelector = () => {
  const { language, setLanguage, isRTL } = useI18n();
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Find current language details with fallback
  const currentLang = LANGUAGES.find((lang) => lang.code === language) || {
    code: 'en',
    flag: '🌐',
    name: 'English',
    nativeName: 'English',
  };

  // Handle keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, langCode: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLanguage(langCode);
      buttonRef.current?.focus(); // Return focus to button after selection
    }
  };

  return (
    <div className="dropdown dropdown-start mr-20">
      <button
        ref={buttonRef}
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-sm px-5 py-1 h-auto min-h-0"
        aria-label={`Current language: ${currentLang.name}`}
        aria-haspopup="true"
        aria-expanded="false" // Update dynamically if dropdown state is tracked
      >
        <div className="flex items-center gap-1">
          <span className="text-base">{currentLang.flag}</span>
          <span className="text-xs hidden sm:inline">{currentLang.code.toUpperCase()}</span>
        </div>
      </button>
      <ul
        ref={menuRef}
        tabIndex={0}
        className={`menu menu dropdown-content mt-2 z-[100] p-2 shadow-lg bg-base-100 rounded-lg w-80 max-h-80 overflow-y-auto border ${
          isRTL ? 'text-right' : 'text-left'
        }`}
        role="menu"
        aria-label="Language selection menu"
      >
        {LANGUAGES.map((lang) => (
          <li key={lang.code} role="menuitem">
            <button
              onClick={() => {
                setLanguage(lang.code);
                buttonRef.current?.focus(); // Return focus after selection
              }}
              onKeyDown={(e) => handleKeyDown(e, lang.code)}
              className={`flex w-full p-2 rounded-md transition-colors ${
                language === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-current={language === lang.code ? 'true' : 'false'}
              aria-label={`Select ${lang.name} language`}
            >
              <span className="text-base mr-2">{lang.flag}</span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{lang.nativeName}</div>
                <div className="text-xs opacity-70 truncate">{lang.name}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// PropTypes for type checking
LanguageSelector.propTypes = {
  language: PropTypes.string,
  setLanguage: PropTypes.func,
  isRTL: PropTypes.bool,
};

export default LanguageSelector;