import '@testing-library/jest-dom';
import i18n from '../i18n';

// Tests use English to keep label assertions stable.
if (i18n.isInitialized) {
  i18n.changeLanguage('en');
} else {
  i18n.on('initialized', () => i18n.changeLanguage('en'));
}
